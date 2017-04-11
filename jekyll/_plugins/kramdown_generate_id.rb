module Jekyll
  module KramdownGenerateId
    def kramdown_generate_id(str)
      Kramdown::Converter::Base.send(:new, "/", {}).basic_generate_id(str)
    end
  end
end

Liquid::Template.register_filter(Jekyll::KramdownGenerateId)
