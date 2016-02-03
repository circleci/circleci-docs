require 'jekyll'
require 'json'

module DumpManifestFilter
  def data_to_manifest_entry(d)
    d.select{ |k,v| ['title', 'slug', 'tags', 'excerpt', 'popularity'].include? k }
  end
  def dump_manifest(docs)
    filtered = docs.map{ |d| data_to_manifest_entry d.data }
    JSON.generate(filtered)
  end
end

Liquid::Template.register_filter(DumpManifestFilter)
