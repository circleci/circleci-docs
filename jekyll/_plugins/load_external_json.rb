require 'json'
require 'open-uri'

module LoadExternalJSON
  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      if config = site.config['external_json']
        config.each do |source|
          ## COMMENTING OUT THE BEHAVIOR OF MERGING EXISTING WITH FRESH - JUST GET IT EVERY TIME
          # target = site.data[source['name']]
          # source = JSON.load(open(source['url']))
          # if target
          #   HashJoiner.deep_merge target, source
          # else
          #   site.data[source['name']] = source
          # end
          # THIS NEXT LINE REPLACES THE ABOVE
          site.data[source['name']] = JSON.load(open(source['url']))
          if source['cache']
            data_source = (site.config['data_source'] || '_data')
            path = "#{data_source}/#{source['name']}.json"
            open(path, 'wb') do |file|
              file << JSON.generate(site.data[source['name']])
            end
          end
        end
      end
    end
  end
end
