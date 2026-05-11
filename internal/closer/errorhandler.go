package closer

import (
	"io"
)

func ErrorHandler(c io.Closer, in *error) {
	cerr := c.Close()
	if *in == nil {
		*in = cerr
	}
}
