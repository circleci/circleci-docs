#!/usr/bin/env ruby

# This script scans our the documentation for any blocked words that should be avoided.
## It does this by constructing a regex from a `block_list`, and giving it to ripgrep.
## ripgrep searches all md and adoc files, and returns it's output as json.
## the program parses the json and prints stats to stdout as well as creating a file report as yaml.

# Ripgrep has been vendored into scripts/bin/

require 'json'
require 'pp'
require 'yaml'

class BlockList
  attr_accessor :rg_bin, :rg_pattern, :results, :stats

  def initialize()
    puts "🔍 Running scan for blocked words..."

    @results = {}
    @stats = {}
    @rg_bin = nil
    @rg_flags = "-tmd -tasciidoc --json"
    @rg_pattern = nil
    @files = Dir.glob("**/*.{md,adoc}")
    @block_list = ["blacklist", "whitelist", "master"]

    set_rg_bin()
    set_regex()
    find_blocked_words()
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

  # run the RG regex and parse the json results.
  # Example json output
  # 
  # {"type":"begin","data":{"path":{"text":"_cci2/configuration-reference.md"}}}
  # {"type":"match","data":{"path":{"text":"_cci2/configuration-reference.md"},"lines":{"text":"      - /foo\n"},"line_number":1068,"absolute_offset":49624,"submatches":[{"match":{"text":"foo"},"start":9,"end":12}]}}
  # {"type":"match","data":{"path":{"text":"_cci2/configuration-reference.md"},"lines":{"text":"      - foo/bar\n"},"line_number":1185,"absolute_offset":54653,"submatches":[{"match":{"text":"foo"},"start":8,"end":11}]}}
  # {"type":"match","data":{"path":{"text":"_cci2/configuration-reference.md"},"lines":{"text":"/tmp/dir/foo/bar\n"},"line_number":1192,"absolute_offset":54772,"submatches":[{"match":{"text":"foo"},"start":9,"end":12}]}}
  # {"type":"end","data":{"path":{"text":"_cci2/configuration-reference.md"},"binary_offset":null,"stats":{"elapsed":{"secs":0,"nanos":77256,"human":"0.000077s"},"searches":1,"searches_with_match":1,"bytes_searched":83172,"bytes_printed":723,"matched_lines":3,"matches":3}}}

  def update_stats(word)
    if !@stats.key?(word)
      @stats[word] = 0
    end
    @stats[word] =  @stats[word] + 1
  end
  
  def find_blocked_words
    x = `#{@rg_bin} \"#{@rg_pattern}\" #{@rg_flags}`
    lines = x.split("\n")
    lines.each do |json_line|
      parsed = JSON.parse(json_line)
      if parsed["type"] == "match"

        # pull data out of parsed json from ripgrep.
        present_words = []
        filename = parsed.dig("data", "path", "text")
        context  = parsed.dig("data", "lines", "text") 
        linum = parsed.dig("data", "line_number")  
        submatches = parsed.dig("data", "submatches")
        submatches.each do |sm|
          present_words.push(sm.dig("match", "text"))
        end

        present_words.each do |w|
          update_stats(w)
        end

        if !@results.key?(filename)
          @results[filename] = []
        end
        
        @results[filename].push(
          {context: context.strip,
           line_number: linum,
           present_words: present_words}
        )
      end
    end
  end
end


Jekyll::Hooks.register :site, :after_init do |site|
  bl = BlockList.new()

  if bl.results.length > 0
    puts "The following 'words to avoid' (and their number of occurrences) were found."
    pp bl.stats
    yaml_results = bl.results.to_yaml
    File.open("blocked_words.yaml", "w") { |f|
      f.write yaml_results
      puts "Wrote list of blocked words and their originating file and line number \n  to 'blocked_words.yaml'"
    }
    # NOTE: if desired result is to break CI on results being found; add `exit` command.
    # exit
  end
end
