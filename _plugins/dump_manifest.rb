require 'jekyll'

require_relative '../_plugins/strip_liquid'

module DumpManifestFilter
  class Filterer
    extend StripLiquidFilter
    extend Jekyll::Filters
  end
  def dump_manifest(input)
    page_hash = input[0].to_liquid
    page_hash.delete('content')
    puts page_hash
  end
end

Liquid::Template.register_filter(DumpManifestFilter)
