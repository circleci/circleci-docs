def data_to_json(site)
  output = []

  # add sidenav
  output = output.push({
    name: 'sidenav',
    content: site.data['sidenav']
  });

  # add sitemap
  output = output.push({
    name: 'sitemap',
    content: site.pages
  });

  # process data and write to json files
  output.each do |item|
    puts 'processing data for: ' + item[:name]

    # get output path
    fullPath = site.source + '/../json/data/' + item[:name] + '.json'

    # create directories if they don't exist
    FileUtils.mkdir_p(File.dirname(fullPath))

    # write json file
    File.open(fullPath, 'w') do |f|
      f.write(item[:content].to_json)
    end
  end

end

Jekyll::Hooks.register :site, :post_render do |site|
  data_to_json(site)
end
