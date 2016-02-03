require 'json'
require 'liquid'
require_relative '../_plugins/dump_manifest'

class Dumper
  extend DumpManifestFilter
end

class TestExcerpt
  def to_s
    "Foo bar"
  end
end

class TestDoc
  def data
    {"draft"=>false,
     "categories"=>[],
     "layout"=>"doc",
     "title"=>"Test Android applications",
     "short_title"=>"Android",
     "popularity"=>2,
     "tags"=>["mobile"],
     "slug"=>"android",
     "ext"=>".md",
     "excerpt"=>TestExcerpt.new}
  end
end

RSpec.describe DumpManifestFilter do
  it "should select keys from data and jsonify" do
    expected = [{"title"=>"Test Android applications",
                 "popularity"=>2,
                 "tags"=>["mobile"],
                 "slug"=>"android",
                 "excerpt"=>"Foo bar"}]
    result = Dumper.dump_manifest([TestDoc.new])
    expect(JSON.parse(result)).to eq(expected)
  end
end
