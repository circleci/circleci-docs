package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/lmittmann/tint"
	"golang.org/x/sync/errgroup"
	"golang.org/x/sync/semaphore"

	"github.com/circleci/circleci-docs/internal/redirects"
)

type options struct {
	Bucket string
	Start  int
	End    int
}

const (
	concurrency = 20
	docsPath    = "docs"
)

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
	opts.Bucket = flag.Arg(0)

	if opts.Bucket == "" {
		slog.Error("Bucket is required")
		os.Exit(1)
	}

	err := run(ctx, opts)
	if err != nil {
		slog.Error("Unexpected error", "error", err)
		os.Exit(1)
	}
}

func run(ctx context.Context, opts options) error {
	awsConfig, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return err
	}

	s3Client := s3.NewFromConfig(awsConfig)

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

	u := newUploader(opts.Bucket, s3Client, concurrency)
	g, ctx := errgroup.WithContext(ctx)
	for _, r := range sliceRedirects {
		g.Go(func() (err error) {
			return u.Upload(ctx, r)
		})
	}
	err = g.Wait()
	if err != nil {
		return err
	}

	slog.Info("Successfully processed redirects")
	return nil
}

type uploader struct {
	bucket string
	client *s3.Client
	sem    *semaphore.Weighted
}

func newUploader(bucket string, client *s3.Client, max int64) *uploader {
	return &uploader{
		bucket: bucket,
		client: client,
		sem:    semaphore.NewWeighted(max),
	}
}

func (u *uploader) Upload(ctx context.Context, r redirects.Redirect) error {
	err := u.sem.Acquire(ctx, 1)
	if err != nil {
		return err
	}

	defer u.sem.Release(1)

	key := fmt.Sprintf("%s%sindex.html", docsPath, r.Old)
	redir := fmt.Sprintf("/%s%s", docsPath, r.New)
	slog.Info("Creating redirect",
		"old", r.Old,
		"new", r.New,
		"key", key,
		"redirect", redir,
	)
	_, err = u.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:                  aws.String(u.bucket),
		Key:                     aws.String(key),
		WebsiteRedirectLocation: aws.String(redir),
		ContentType:             aws.String("text/html"),
		ContentLength:           aws.Int64(0),
	})
	return err
}
