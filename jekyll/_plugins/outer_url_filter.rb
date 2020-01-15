require_relative 'language_url_prefix.rb'

module OuterUrlFilter
  include Liquid::StandardFilters
  include LanguageUrlPrefix

  def outer_url(input)
    "#{config['url']}#{language_url_prefix(@context)}#{input}"
  end

  private

  def config
    @context.registers[:site].config
  end
end

Liquid::Template.register_filter(OuterUrlFilter)
