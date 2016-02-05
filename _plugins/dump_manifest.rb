require 'jekyll'
require 'json'
require 'nokogiri'

module DumpManifestFilter
  def data_to_manifest_entry(d)
    d = d.select{ |k,v| ['title', 'slug', 'tags', 'excerpt', 'popularity'].include? k }
    d['excerpt'] = Nokogiri::HTML(d['excerpt'].to_s).text
    d
  end
  module_function :data_to_manifest_entry
  def dump_manifest(docs)
    filtered = docs.map{ |d| data_to_manifest_entry d.data }
    JSON.generate(filtered)
  end
end

Liquid::Template.register_filter(DumpManifestFilter)
