#!/usr/bin/env ruby

# This script scans our the documentation for any blocked words that should not be published.
# This script makes use of ripgrep, which is avaiable in scripts/bin/*

require 'json'

class BlockList
  attr_accessor :rg_bin, :rg_pattern

  def initialize()
    puts "Running word block list ----"

    @results = []
    @rg_bin = nil
    @rg_flags = "-tmd -tasciidoc --json"
    @rg_pattern = nil
    @files = Dir.glob("**/*.{md,adoc}")
    @block_list = ["foo"]

    set_rg_bin()
    set_regex()
    grepit()
    # iterate_files
  end

  def set_rg_bin
    if RUBY_PLATFORM.include?("darwin")
      @rg_bin = "../scripts/bin/rg-mac"
    else
      @rg_bin = "../scripts/bin/rg-linux"
    end
  end

  # this function iterates over a list of blocked words and compiles the final regex.
  def set_regex
    word_batch = ""
    @block_list.each do |word|
      word_batch += "#{word}|"
    end
    @rg_pattern = "#{word_batch.delete_suffix("|")}"
  end

  ## For each file, search every word in block_list
  # def iterate_files
  #   @files.each do |f|
  #     @block_list.each do |word|
  #       search_file(f, word)
  #     end
  #   end
  # end

  # # searches a single file for a specific word
  # def search_file(file, word)
  #   puts "Searching #{file} for uses of #{word}"
  #   system("#{@rg_bin} #{word} --files #{file}")
  # end

  # run the regex and parse the json
  #
  # Example json output
  # {"type":"begin","data":{"path":{"text":"_cci2/configuration-reference.md"}}}
  # {"type":"match","data":{"path":{"text":"_cci2/configuration-reference.md"},"lines":{"text":"      - /foo\n"},"line_number":1068,"absolute_offset":49624,"submatches":[{"match":{"text":"foo"},"start":9,"end":12}]}}
  # {"type":"match","data":{"path":{"text":"_cci2/configuration-reference.md"},"lines":{"text":"      - foo/bar\n"},"line_number":1185,"absolute_offset":54653,"submatches":[{"match":{"text":"foo"},"start":8,"end":11}]}}
  # {"type":"match","data":{"path":{"text":"_cci2/configuration-reference.md"},"lines":{"text":"/tmp/dir/foo/bar\n"},"line_number":1192,"absolute_offset":54772,"submatches":[{"match":{"text":"foo"},"start":9,"end":12}]}}
  # {"type":"end","data":{"path":{"text":"_cci2/configuration-reference.md"},"binary_offset":null,"stats":{"elapsed":{"secs":0,"nanos":77256,"human":"0.000077s"},"searches":1,"searches_with_match":1,"bytes_searched":83172,"bytes_printed":723,"matched_lines":3,"matches":3}}}
  #
  def grepit
    x = `#{@rg_bin} \"#{@rg_pattern}\" #{@rg_flags}`
    lines = x.split("\n")
    lines.each do |json_line|
      parsed = JSON.parse(json_line)
      if parsed["type"] == "match"
        puts parsed
      end
    end




  end


end

BlockList.new()


# Jekyll::Hooks.register :site, :after_init do |site|
#   BlockList.new()
# end
