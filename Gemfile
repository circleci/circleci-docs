source 'https://rubygems.org'

ruby '2.5.1'

gem 'jekyll', "3.8.4"
gem 'html-proofer', "3.9.1"
gem 'jekyll-sitemap'

gem 'jekyll-assets'
# jekyll-assets depends on sprockets, which depends on rack, which has two
# security vulnerabilities prior to 2.0.6.
# https://nvd.nist.gov/vuln/detail/CVE-2018-16471
# https://nvd.nist.gov/vuln/detail/CVE-2018-16470
gem "rack", ">= 2.0.6"

# https://nvd.nist.gov/vuln/detail/CVE-2018-14404
gem "nokogiri", ">= 1.8.5"

group :jekyll_plugins do
  gem 'jekyll-algolia', '~> 1.0'
end
