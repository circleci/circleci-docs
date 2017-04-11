require 'json'
require 'open-uri'
module LoadExternalJSON
  class Generator < Jekyll::Generator
    safe true
    priority :highest
    def generate(site)
      if config = site.config['external_json_to_data']
        config.each do |source|
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
