#!/usr/bin/env ruby
require 'html-proofer'
require 'jekyll'
require 'dotenv/load'

JEKYLL_BASENAME = ENV['JEKYLL_BASENAME'] || 'docs'

task :set_untranslated do
  puts 'Shim untranslated Japanese pages'
  sh './scripts/shim-translation.sh jekyll/_cci2 jekyll/_cci2_ja'
end

task :build do
  puts 'build Jekyll'
  # Create jekyll config file to override things
  sh "echo 'baseurl: \"\/#{JEKYLL_BASENAME}\"' > jekyll/_config_override.yml"
  # Build the Jekyll site
  config = Jekyll.configuration({ 
    'source' => './jekyll', 
    'destination' => "./jekyll/_site/#{JEKYLL_BASENAME}",
    'config' => ['./jekyll/_config.yml','./jekyll/_config_production.yml','./jekyll/_config_override.yml']
  })
  site = Jekyll::Site.new(config)
  Jekyll::Commands::Build.build site, config
end

task :make_mock_api do
  puts 'Make mock API docs'
  sh "echo \"<html lang=''><head><link href='/docs/assets/img/icons/favicon.png' rel='icon' type='image/png' /></head></html>\" > ./jekyll/_site/index.html"
  sh "mkdir -p ./jekyll/_site/docs/api/2.0/"
  sh "mkdir -p ./jekyll/_site/docs/api/v2/"
  sh "cp ./jekyll/_site/index.html ./jekyll/_site/docs/api/2.0/index.html"
  sh "cp ./jekyll/_site/index.html ./jekyll/_site/docs/api/v2/index.html"
  sh "cp ./jekyll/_site/index.html ./jekyll/_site/docs/api/index.html"
  sh "rm ./jekyll/_site/index.html"
end

task :test do
  puts 'Test with HTMLproofer'
  ignore_files = ["./jekyll/_site/#{JEKYLL_BASENAME}/api/v2/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/runner-installation/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/security-server/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/v.2.19-overview/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/customizations/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/aws-prereq/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/ops/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/about-circleci/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/demo-apps/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/google-auth/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/orb-concepts/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/ja/2.0/tutorials/index.html","./jekyll/_site/#{JEKYLL_BASENAME}/reference-2-1/index.html"]

  options = { :allow_hash_href => true,  :check_favicon => true, :check_html => true, :disable_external => true, :empty_alt_ignore => true, :parallel => { :in_processes => 4}, :file_ignore => ignore_files}

  HTMLProofer.check_directory("./jekyll/_site", options).run
end
