require 'liquid'

require_relative '../_plugins/dump_manifest'

class Dumper
  extend DumpManifestFilter
end

class TestPage
  def to_liquid
    {"layout"=>"page",
     "title"=>"About",
     "permalink"=>"/about/",
     "dir"=>"/about/",
     "name"=>"about.md",
     "path"=>"about.md",
     "url"=>"/about/",
     "content"=>"This is some really long content.\n## With markdown\nOMG. This is so long. Also it has {{ liquid }} in it. And it just keeps going and going."}

RSpec.describe DumpManifestFilter do
  it "dump abridged page manifest" do
#{"layout"=>"page", "title"=>"About", "permalink"=>"/about/", "dir"=>"/about/", "name"=>"about.md", "path"=>"about.md", "url"=>"/about/"}
    test_page = Jekyll::Page.new
    test_page['layout'] = 'page'
    expect(Dumper.dump_manifest([test_page])).to eq('foo')
  end
end
