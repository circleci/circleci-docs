require 'json'
#require 'hash-joiner'
require 'open-uri'

module LoadExternalJSON
  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      config = site.config['external_json']
      if !config
        return
      end
      if !config.kind_of?(Array)
        config = [config]
      end
      config.each do |d|
        begin
          ## COMMENTING OUT THE BEHAVIOR OF MERGING EXISTING WITH FRESH - JUST GET IT EVERY TIME
          # target = site.data[d['data']]
          # source = JSON.load(open(d['json']))
          # if target
          #   HashJoiner.deep_merge target, source
          # else
          #   site.data[d['data']] = source
          # end
          # THIS NEXT LINE REPLACES THE ABOVE
          site.data[d['data']] = JSON.load(open(d['json']))
          if d['cache']
            data_source = (site.config['data_source'] || '_data')
            path = "#{data_source}/#{d['data']}.json"
            open(path, 'wb') do |file|
              file << JSON.generate(site.data[d['data']])
            end
          end
        rescue
          next
        end
      end
    end
  end
end
