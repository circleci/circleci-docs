require 'json'
require 'liquid'
require_relative '../_plugins/dump_manifest'

class Dumper
  extend DumpManifestFilter
end

RSpec.describe 'dump_manifest_spec' do
  before(:each) do
    @data = {"draft"=>false,
            "categories"=>[],
            "layout"=>"doc",
            "title"=>"Test Android applications",
            "short_title"=>"Android",
            "popularity"=>2,
            "tags"=>["mobile"],
            "slug"=>"android",
            "ext"=>".md",
            "excerpt"=> instance_double('Jekyll::Excerpt', :to_s => 'Foo <span>bar</span> baz')}
    @doc = instance_double('Jekyll::Document', :data => @data)
  end
  it 'should select keys from data' do
    expect(DumpManifestFilter.data_to_manifest_entry(@data).keys).to contain_exactly('title', 'slug', 'tags', 'excerpt', 'popularity')
  end
  it 'should strip html' do
    expect(DumpManifestFilter.data_to_manifest_entry(@data)['excerpt']).to eq('Foo bar baz')
  end
  it 'should jsonify' do
    expected = [{"title"=>"Test Android applications",
                 "popularity"=>2,
                 "tags"=>["mobile"],
                 "slug"=>"android",
                 "excerpt"=>"Foo bar baz"}]
    result = Dumper.dump_manifest([@doc])
    expect(JSON.parse(result)).to eq(expected)
  end
end
