#!/usr/bin/env ruby

## this patches the jekyll-target-blank gem: https://github.com/keithmifsud/jekyll-target-blank/
## see here: https://github.com/keithmifsud/jekyll-target-blank/pull/46 for more details.
## to allow uri escaping, enabling non-asci urls.
require 'jekyll-target-blank'

module Jekyll
  class TargetBlank
    class << self
      def external?(link)
        if link&.match?(URI.regexp(%w(http https)))
          URI.parse(URI.escape(link)).host != URI.parse(URI.escape(@site_url)).host
        end
      end
    end
  end
end
