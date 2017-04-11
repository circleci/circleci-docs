module Jekyll
  module KramdownIDify
    def kramdown_idify(input)
      basic_generate_id(input)
    end
    # this is stolen directly from Kramdown - which will be terrible when one day kramdown changes, but at the time I had to move on with my life...
    def basic_generate_id(str)
      gen_id = str.gsub(/^[^a-zA-Z]+/, '')
      gen_id.tr!('^a-zA-Z0-9 -', '')
      gen_id.tr!(' ', '-')
      gen_id.downcase!
      gen_id
    end
  end
end

Liquid::Template.register_filter(Jekyll::KramdownIDify)