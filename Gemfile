source 'https://rubygems.org'

ruby '2.7.2'

gem "jekyll", '~> 4.2.0', github: "jekyll/jekyll"
gem 'html-proofer'
gem 'asciidoctor'
gem 'pygments.rb', '~> 1.1.2'
gem 'rake'
gem 'dotenv'
gem "kramdown-parser-gfm"
gem "liquid-c"

group :jekyll_plugins do
  gem 'jekyll-algolia', '~> 1.0'
  gem 'jekyll-sitemap'
  gem 'jekyll-include-cache'
  gem 'jekyll-target-blank'
  gem 'jekyll-toc'
  gem 'jekyll-asciidoc'
  gem 'jekyll-minibundle'
end

group :test, :development do
  gem 'pronto'
  gem 'pronto-markdownlint'
end
