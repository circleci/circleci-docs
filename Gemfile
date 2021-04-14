source 'https://rubygems.org'

ruby '2.7.2'

gem "jekyll", '~> 4.2.0', github: "jekyll/jekyll"
gem 'html-proofer'
gem "rack", ">= 2.0.6"
gem 'asciidoctor'
gem 'pygments.rb', '~> 1.1.2'
gem 'rake'
gem 'dotenv'
gem "sprockets"
gem "kramdown-parser-gfm"
gem "liquid-c"

group :jekyll_plugins do
  gem 'jekyll-algolia', '~> 1.0'
  gem 'jekyll-sitemap'
  gem 'jekyll-include-cache'
  gem 'jekyll-assets', git: "https://github.com/envygeeks/jekyll-assets"
  gem 'jekyll-target-blank'
  # jekyll-assets depends on sprockets, which depends on rack, which has two
  # security vulnerabilities prior to 2.0.6.
  # https://nvd.nist.gov/vuln/detail/CVE-2018-16471
  # https://nvd.nist.gov/vuln/detail/CVE-2018-16470
  gem 'jekyll-asciidoc'
end

group :test, :development do
  gem 'pronto'
  gem 'pronto-markdownlint'
end
