#!/usr/bin/env ruby

# This script is intended to be run locally. It iterates over all the images in
# assets/img/docs and then scans all markdown files for links to those images.
# If an image is not being used, it gets moved to the assets/img/docs/_unused/
# folder.
#
# This script assumes you have ripgrep installed, as it can take a bit of time.
# This script makes use of a few system calls, but their output is not
# significant and so their output has been silenced.

require 'fileutils'

def find_unused

  # check if user has ripgrep installed
  if not system("which rg > /dev/null")
    puts "\n NOTE! Ripgrep was not found on your system, 'find_unused_images' unable to run without it.\n\n"
    return
  end

  img_files = Dir["assets/img/docs/**"]
  unused_files = []

  puts "Looking for unused image files..."

  # Expects you
  img_files.each do |file_path|
    x = system("rg #{File.basename(file_path)}  > /dev/null " )
    if !x
      unused_files.push(file_path)
      FileUtils.mv(file_path, "assets/img/docs/_unused/#{File.basename(file_path)}")
    end
  end

  puts "Moved #{unused_files.count()} unused images from /assets/img/docs/ to /assets/img/docs/_unused"
end

# Uncomment when you want to use this script.
# Jekyll::Hooks.register :site, :after_init do |site|
#   find_unused()
# end
