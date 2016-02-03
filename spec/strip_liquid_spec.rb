require_relative '../_plugins/strip_liquid'

class Stripper
  extend StripLiquidFilter
end

RSpec.describe StripLiquidFilter do
  it 'should strip liquid markup' do
    test_input = 'Foo {{ bar }} {% baz %} qux'
    expected = 'Foo   qux'
    expect(Stripper.strip_liquid(test_input)).to eq(expected)
  end
end
