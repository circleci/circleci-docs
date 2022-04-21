require "middleman-core"

# original code: https://github.com/miloshadzic/middleman-inline/blob/master/lib/middleman-inline/extension.rb
class MiddlemanInline < ::Middleman::Extension
  helpers do
    def inline_css(*args)
      args.map do |arg|
        "<style type='text/css'>#{render_resource(fname(arg, '.css'))}</style>"
      end.join("\n")
    end

    # Don't use this for now
    def inline_js(*args)
      args.map do |arg|
        "<script type='text/javascript'>#{render_resource(fname(arg, '.js'))}</script>"
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


# module Middleman
#   module Sprockets
#     class Resource
#       def render *_args
#         ::Middleman::Util.instrument 'sprockets.render', asset: self do
#           sprockets_asset.source
#         end
#       end


#       def sprockets_asset
#         ::Middleman::Util.instrument 'sprockets.asset_lookup', asset: self do
#           @environment[@sprockets_path] || raise(::Sprockets::FileNotFound, @sprockets_path)
#         end
#       rescue StandardError => e
#         raise e if @app.build?

#         @errored = true
#         Error.new(e, ext)
#       end

#       class Error

#         def source
#           case @ext
#           when '.css' then css_response
#           when '.js' then "foobarbaz"
#           else
#             default_response
#           end
#         end
#       end

#     end
#   end
# end
