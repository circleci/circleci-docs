require "middleman-core"

# original code: https://github.com/miloshadzic/middleman-inline/blob/master/lib/middleman-inline/extension.rb
# I'm vendoring this because I couldn't get the gem working.
class MiddlemanInline < ::Middleman::Extension
  helpers do
    def inline_css(*args)
      args.map do |arg|
        "<style type='text/css'>#{render_resource(fname(arg, '.css'))}</style>"
      end.join("\n")
    end

    private

    def fname(str, ext)
      str.concat(ext) unless str.match(ext)
      str
    end

    def render_resource(fname)
      x = sitemap.resources.find { |res| res.source_file.match(fname) }
      x.render()
    end
  end
end

Middleman::Extensions.register :inline do
  MiddlemanInline
end


