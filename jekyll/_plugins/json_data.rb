def data_to_json(site)
  puts 'processing data for: site.data'

  #compile data + content
  output = {}
  output['sidenav'] = site.data['sidenav']

  # get output path
  fullPath = site.source + '/../json/data/site.json'

  # create directories if they don't exist
  FileUtils.mkdir_p(File.dirname(fullPath))

  # write json file
  File.open(fullPath, 'w') do |f|
    f.write(output.to_json)
  end
end

Jekyll::Hooks.register :site, :post_render do |site|
  data_to_json(site)
end
