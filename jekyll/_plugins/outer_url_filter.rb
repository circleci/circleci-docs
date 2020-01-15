module OuterUrlFilter
  include Liquid::StandardFilters

  DEFAULT_LANG = 'en'.freeze

  def outer_url(input)
    "#{config['url']}#{language_prefix}#{input}"
  end

  private

  def language_prefix
    return unless page_language
    return if page_language == DEFAULT_LANG

    "/#{page_language}"
  end

  def page_language
    @context.registers[:page]['lang']
  end

  def config
    @context.registers[:site].config
  end
end

Liquid::Template.register_filter(OuterUrlFilter)
