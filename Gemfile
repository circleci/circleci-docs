source 'https://rubygems.org'

ruby '2.7.4'

gem "jekyll", '~> 4.2.0', github: "jekyll/jekyll"
gem 'html-proofer'
gem 'asciidoctor'
gem 'pygments.rb', '~> 1.1.2'
gem 'rake'
gem 'dotenv'
gem "kramdown-parser-gfm"
gem "liquid-c"
gem 'nokogiri', '~> 1.13'
gem 'htmlcompressor'
gem 'htmlentities', '~> 4.3', '>= 4.3.4'

group :jekyll_plugins do
  gem 'jekyll-algolia', '~> 1.0' # TODO(romain): remove
  gem 'jekyll-sitemap'
  gem 'jekyll-include-cache' # TODO(romain): remove
  gem 'jekyll-target-blank'
  gem 'jekyll-toc'  # TODO(romain): remove
  gem 'jekyll-asciidoc', github: "asciidoctor/jekyll-asciidoc"
  gem 'jekyll-last-modified-at'  # TODO(romain): remove
  gem 'jekyll-timeago'  # TODO(romain): remove
  gem 'jekyll-redirect-from'  # TODO(romain): remove maybe?
end

group :test, :development do
  gem 'pronto'
  gem 'pronto-markdownlint'
end
