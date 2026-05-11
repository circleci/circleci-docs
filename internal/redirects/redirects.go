package redirects

import (
	"os"

	"github.com/goccy/go-yaml"

	"github.com/circleci/circleci-docs/internal/closer"
)

const DefaultFile = "scripts/redirects_v2.yml"

type Redirect struct {
	Old string `yaml:"old"`
	New string `yaml:"new"`
}

func Load(path string) (redirects []Redirect, err error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}

	defer closer.ErrorHandler(file, &err)

	err = yaml.NewDecoder(file).Decode(&redirects)
	if err != nil {
		return nil, err
	}

	return redirects, nil
}
