module LanguageUrlPrefix
  DEFAULT_LANG = 'en'.freeze

  # `context` is a Jekyll rendering context
  def language_url_prefix(context)
    language = page_language(context)
    return if language.nil?
    return if language == DEFAULT_LANG

    "/#{language}"
  end

  private

  def page_language(context)
    context.registers[:page]['lang']
  end
end
