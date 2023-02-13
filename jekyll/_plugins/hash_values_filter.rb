module ArrayifyHashFilter
  include Liquid::StandardFilters

  def arrayify_hash(input)
    raise ArgumentError.new("Input is not a hash: #{input.inspect}") unless input.is_a?(Hash)
    input.values
  end

  def arrayify(input)
    Array(input)
  end
end

Liquid::Template.register_filter(ArrayifyHashFilter)
