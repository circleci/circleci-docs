require_relative 'language_url_prefix.rb'

module DevHubUrlFilter
  include Liquid::StandardFilters
  include LanguageUrlPrefix

  def devhub_url(input)
    "#{config['devhub_base_url']}#{language_url_prefix(@context)}#{input}"
  end

  private

  def config
    @context.registers[:site].config
  end
end

Liquid::Template.register_filter(DevHubUrlFilter)
