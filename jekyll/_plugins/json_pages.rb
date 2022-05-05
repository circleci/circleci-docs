def doc_to_json(document, site)
  puts 'processing json for: ' + document.relative_path

  # compile data + content
  output = document.data
  output['content'] = document.content
  output['file_name'] = document.relative_path

  # get output path
  jsonPath = site.source + '/../json/pages/'
  docExt = document.output_ext
  jsonFile = document.relative_path.gsub(document.extname, '.json')
  fullPath = jsonPath + jsonFile

  # create directories if they don't exist
  FileUtils.mkdir_p(File.dirname(fullPath))

  # write json file
  File.open(fullPath, 'w') do |f|
    json = output.to_json;
    f.write(json.gsub('\n', '')) # strip all \n characters since they are not needed
  end
end

Jekyll::Hooks.register :documents, :post_render do |doc|
  doc_to_json(doc, doc.site)
end
