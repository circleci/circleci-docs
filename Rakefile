#!/usr/bin/env ruby
require 'html-proofer'
require 'jekyll'
require 'dotenv/load'

JEKYLL_BASENAME = ENV['JEKYLL_BASENAME'] || 'docs'
HTML_PROOFER_PARALLEL = ENV['HTML_PROOFER_PARALLEL'] || 4

desc 'Build Jekyll site'
task :build do
  # Build the Jekyll site
  config = Jekyll.configuration({
    'source' => './jekyll',
    'destination' => "./jekyll/_site/#{JEKYLL_BASENAME}",
    'config' => ['./jekyll/_config.yml']
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
task :build_local => [:build, :make_mock_api] do
  puts 'Finish building your jekyll site, and now you can run `bundle exec rake test` to run `HTMLproofer` test'
end

desc 'Test with HTMLproofer'
task :test do

  def makeFilePath(target_dir)
    return "./jekyll/_site/#{JEKYLL_BASENAME}/#{target_dir}/index.html"
  end

  ignore_dirs = [
    "api",
    "api/v1",
    "api/v2",
    "reference-2-1"
  ]

  ignore_files = ignore_dirs.map {|d| makeFilePath(d)}
  ignore_ja_files = Dir.glob("./jekyll/_site/#{JEKYLL_BASENAME}/ja/**/*").select { |e| File.file? e };

  options = {
    :allow_hash_href => true,
    :check_favicon => false,
    :check_html => true,
    :disable_external => true,
    :empty_alt_ignore => true,
    :parallel => { :in_processes => HTML_PROOFER_PARALLEL},
    :file_ignore => ignore_files.concat(ignore_ja_files),
  }

  HTMLProofer.check_directory("./jekyll/_site", options).run
end
