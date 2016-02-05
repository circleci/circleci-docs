require 'jekyll'
require 'json'
require 'nokogiri'

module DumpContentFilter
  def extract_content(d)
    Nokogiri::HTML(d).at_css('#content').text
  end
  def doc_to_content_entry(doc)
    content = doc.data.select{ |k,v| ['title', 'slug', 'tags', 'popularity'].include? k }
    content['output'] = extract_content doc.output
    content
  end
  module_function(:extract_content, :doc_to_content_entry)
  def dump_content(docs)
    filtered = docs.map{ |d| doc_to_content_entry d }
    JSON.generate(filtered)
  end
end

Liquid::Template.register_filter(DumpContentFilter)
