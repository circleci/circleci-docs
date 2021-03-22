#!/usr/bin/env ruby
require 'html-proofer'
require 'jekyll'
require 'dotenv/load'

JEKYLL_BASENAME = ENV['JEKYLL_BASENAME'] || 'docs'
HTML_PROOFER_PARALLEL = ENV['HTML_PROOFER_PARALLEL'] || 4

desc 'Shim untranslated Japanese pages'
task :shim_untranslated do
  sh './scripts/shim-translation.sh jekyll/_cci2 jekyll/_cci2_ja'
end

desc 'Build Jekyll site'
task :build do
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

desc 'Make mock API docs'
task :make_mock_api do
  sh "echo \"<html lang=''><head><link href='/docs/assets/img/icons/favicon.png' rel='icon' type='image/png' /></head></html>\" > ./jekyll/_site/index.html"
  sh "mkdir -p ./jekyll/_site/docs/api/2.0/"
  sh "mkdir -p ./jekyll/_site/docs/api/v2/"
  sh "cp ./jekyll/_site/index.html ./jekyll/_site/docs/api/2.0/index.html"
  sh "cp ./jekyll/_site/index.html ./jekyll/_site/docs/api/v2/index.html"
  sh "cp ./jekyll/_site/index.html ./jekyll/_site/docs/api/index.html"
  sh "rm ./jekyll/_site/index.html"
end

desc 'Build your jekyll site in local env'
task :build_local => [:shim_untranslated, :build, :make_mock_api] do
  puts 'Finish building your jekyll site, and now you can run `bundle exec rake test` to run `HTMLproofer` test'
end

desc 'Test with HTMLproofer'
task :test do
  def makeFilePath(target_dir)
    return "./jekyll/_site/#{JEKYLL_BASENAME}/#{target_dir}/index.html"
  end

  ignore_dirs = [
    "api/v2",
    "ja/2.0/runner-installation",
    "ja/2.0/security-server",
    "ja/2.0/v.2.19-overview",
    "ja/2.0/customizations",
    "ja/2.0/aws-prereq",
    "ja/2.0/ops",
    "ja/2.0/about-circleci",
    "ja/2.0/demo-apps",
    "ja/2.0/google-auth",
    "ja/2.0/orb-concepts",
    "ja/2.0/tutorials",
    "reference-2-1",
    "ja/2.0/server-3-global-variables",
    "2.0/server-3-global-variables"
  ]

  ignore_files = ignore_dirs.map {|d| makeFilePath(d)}
  options = { :allow_hash_href => true,  :check_favicon => true, :check_html => true, :disable_external => true, :empty_alt_ignore => true, :parallel => { :in_processes => HTML_PROOFER_PARALLEL}, :file_ignore => ignore_files}

  HTMLProofer.check_directory("./jekyll/_site", options).run
end
