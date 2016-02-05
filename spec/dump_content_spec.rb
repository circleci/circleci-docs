require 'json'
require 'liquid'
require_relative '../_plugins/dump_content'

class Dumper
  extend DumpContentFilter
end

RSpec.describe 'dump_content' do
  before(:each) do
    @data = {"draft"=>false,
            "categories"=>[],
            "layout"=>"doc",
            "title"=>"Test Android applications",
            "short_title"=>"Android",
            "popularity"=>2,
            "tags"=>["mobile"],
            "slug"=>"android",
            "ext"=>".md"}
    @output = '<html><body><div>Foo bar</div><div id="content">The <b>content</b></div></body></html>'
    @doc = instance_double('Jekyll::Document', :data => @data, :output => @output)
  end
  it 'should extract text content' do
    expect(DumpContentFilter.extract_content(@output)).to eq('The content')
  end
  it 'should select keys from data and combine with output' do
    expect(DumpContentFilter.doc_to_content_entry(@doc).keys).to contain_exactly('title', 'slug', 'tags', 'popularity', 'output')
  end
  it 'should jsonify' do
    expected = [{"title"=>"Test Android applications",
                 "popularity"=>2,
                 "tags"=>["mobile"],
                 "slug"=>"android",
                 "output"=>"The content"}]
    result = Dumper.dump_content([@doc])
    expect(JSON.parse(result)).to eq(expected)
  end
end
