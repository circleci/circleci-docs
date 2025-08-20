package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"sync"

	"github.com/hashicorp/go-cleanhttp"
	"github.com/hashicorp/go-retryablehttp"
	"github.com/lmittmann/tint"
	"golang.org/x/sync/errgroup"
	"golang.org/x/sync/semaphore"

	"github.com/circleci/circleci-docs/internal/closer"
	"github.com/circleci/circleci-docs/internal/redirects"
)

const (
	concurrency = 20
	docsPath    = "docs"
)

type options struct {
	Start int
	End   int

	BaseURL string
}

var errFailures = errors.New("failed validation")

func main() {
	ctx := context.Background()

	slog.SetDefault(slog.New(
		tint.NewHandler(os.Stderr, &tint.Options{
			Level: slog.LevelDebug,
		}),
	))

	opts := options{}
	flag.IntVar(&opts.Start, "start", 0, "Start index (inclusive)")
	flag.IntVar(&opts.End, "end", -1, "Start index (inclusive)")
	flag.Parse()

	opts.BaseURL = flag.Arg(0)
	if opts.BaseURL == "" {
		slog.Error("BaseURL is required")
		os.Exit(1)
	}

	err := run(ctx, opts)
	switch {
	case errors.Is(err, errFailures):
		os.Exit(1)
	case err != nil:
		slog.Error("Unexpected error", "error", err)
		os.Exit(1)
	default:
	}
}

func run(ctx context.Context, opts options) error {
	redirs, err := redirects.Load(redirects.DefaultFile)
	if err != nil {
		return err
	}

	if opts.End < 0 {
		opts.End = len(redirs)
	}

	sliceRedirects := redirs[opts.Start:opts.End]
	slog.Info("Redirects",
		"start", opts.Start,
		"end", opts.End,
		"total", len(sliceRedirects),
	)

	v := newValidator(opts.BaseURL, concurrency)

	g, ctx := errgroup.WithContext(ctx)
	for _, r := range sliceRedirects {
		g.Go(func() (err error) {
			return v.Validate(ctx, r)
		})
	}
	err = g.Wait()
	if err != nil {
		return err
	}

	failures := v.Failures()
	if len(failures) > 0 {
		slog.Warn("Failures detected",
			"count", len(failures),
		)
		for _, fail := range failures {
			slog.Warn("  " + fail)
		}
		return errFailures
	}

	slog.Info("Success")
	return nil
}

type validator struct {
	client  *retryablehttp.Client
	baseURL string
	sem     *semaphore.Weighted

	mu       sync.Mutex
	failures []string
}

func newValidator(baseURL string, max int64) *validator {
	client := retryablehttp.NewClient()
	client.Logger = slog.Default()
	client.RetryMax = 10
	client.HTTPClient = &http.Client{
		Transport: cleanhttp.DefaultPooledTransport(),
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	return &validator{
		client:  client,
		baseURL: baseURL,
		sem:     semaphore.NewWeighted(max),
	}
}

func (v *validator) addFailure(s string) {
	v.mu.Lock()
	defer v.mu.Unlock()
	v.failures = append(v.failures, s)
}

func (v *validator) Validate(ctx context.Context, r redirects.Redirect) (err error) {
	err = v.sem.Acquire(ctx, 1)
	if err != nil {
		return err
	}

	defer v.sem.Release(1)

	loc := ""
	statusCode := 0

	defer func() {
		slog.Info("Validated redirect",
			"old", r.Old,
			"new", r.New,
			"location", loc,
			"statusCode", statusCode,
		)
	}()

	u, err := url.JoinPath(v.baseURL, docsPath, r.Old)
	if err != nil {
		return err
	}

	statusCode, loc, err = v.followRedirect(u)
	if err != nil {
		return err
	}

	if statusCode < 300 || statusCode >= 400 {
		v.addFailure(fmt.Sprintf("%q: expected 3xx, got %d", r.Old, statusCode))
		return nil
	}

	expectURL, err := url.JoinPath("/", docsPath, r.New)
	if err != nil {
		return err
	}

	if loc != expectURL {
		v.addFailure(fmt.Sprintf("%q: expected %q, got %q", r.Old, expectURL, loc))
		return nil
	}

	u, err = url.JoinPath(v.baseURL, loc)
	if err != nil {
		return err
	}

	res, err := v.get(u)
	if err != nil {
		v.addFailure(fmt.Sprintf("%q: expected to load redirect at %q, got %v", r.Old, u, err))
		return nil
	}

	if res.StatusCode >= 300 {
		v.addFailure(fmt.Sprintf("%q: expected to load redirect at %q, got status %d", r.Old, u, res.StatusCode))
	}

	return nil
}

func (v *validator) followRedirect(rawurl string) (statusCode int, loc string, err error) {
	res, err := v.get(rawurl)
	if err != nil {
		return 0, "", err
	}

	return res.StatusCode, res.Header.Get("Location"), nil
}

func (v *validator) get(rawurl string) (res *http.Response, err error) {
	req, err := retryablehttp.NewRequest(http.MethodGet, rawurl, nil)
	if err != nil {
		return nil, err
	}

	res, err = v.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer closer.ErrorHandler(res.Body, &err)
	defer func() {
		_, _ = io.Copy(io.Discard, res.Body)
	}()

	return res, nil
}

func (v *validator) Failures() []string {
	v.mu.Lock()
	defer v.mu.Unlock()

	failures := make([]string, 0, len(v.failures))
	failures = append(failures, v.failures...)
	return failures
}
