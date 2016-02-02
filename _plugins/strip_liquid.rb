module Jekyll
  module StripLiquidFilter
    def strip_liquid(input)
      input.to_s.gsub(/\{%.*?%\}/, '')
    end
  end
end

Liquid::Template.register_filter(Jekyll::StripLiquidFilter)
