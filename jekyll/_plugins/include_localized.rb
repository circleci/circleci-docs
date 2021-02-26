require_relative 'language_url_prefix.rb'

class IncludeLocalized < Jekyll::Tags::IncludeTag
  include LanguageUrlPrefix

  def locate_include_file(context, file, safe)
    lang_prefix = language_url_prefix(context)
    file_with_prefix = "#{lang_prefix}/#{file}"
    super(context, file_with_prefix, safe)
  end
end

Liquid::Template.register_tag('include_localized', IncludeLocalized)
