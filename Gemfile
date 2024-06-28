source 'https://rubygems.org'

ruby '3.1.3'

gem "jekyll", '~> 4.2.0', github: "jekyll/jekyll"
gem 'html-proofer'
gem 'asciidoctor'
gem 'pygments.rb', '~> 1.1.2'
gem 'rake'
gem 'dotenv'
gem "kramdown-parser-gfm"
gem 'liquid-c', '~> 4.0.1'
gem 'htmlcompressor'
gem 'htmlentities', '~> 4.3', '>= 4.3.4'
gem 'rack', '~> 2.2.8.1'
gem 'nokogiri', '~> 1.16.5'

group :jekyll_plugins do
  gem 'jekyll-sitemap'
  gem 'jekyll-asciidoc', github: "asciidoctor/jekyll-asciidoc"
  gem 'jekyll-algolia', '~> 1.6', '>= 1.6.0' # Used by `Update Algolia Index` CI step
  gem 'jekyll-last-modified-at' # Used for page metadata
end

group :test, :development do
  gem 'pronto'
  gem 'pronto-markdownlint'
end
