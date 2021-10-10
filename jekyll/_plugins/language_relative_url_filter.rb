require_relative 'language_url_prefix.rb'

module LanguageRelativeUrlFilter
  include Liquid::StandardFilters
  include LanguageUrlPrefix

  def language_relative_url(input)
    "#{config['baseurl']}#{language_url_prefix(@context)}#{input}"
  end

  private

  def config
    @context.registers[:site].config
  end
end

Liquid::Template.register_filter(LanguageRelativeUrlFilter)
