module Jekyll
  module ApiEndpointFilter
    def api_endpoint(endpoint)
      if endpoint
      """<div>
  <p>#{endpoint['description']}</p>
  <h4>Method</h4>
  <p>#{endpoint['method']}</p>
  #{params(endpoint['params'])}
  <h4>Example call</h4>
  <pre><code>#{api_curl(endpoint)}</code></pre>
  <h4>Example response</h4>
  #{response_output(endpoint['response'])}
  #{try_it(endpoint)}
</div>
"""
      end
    end

    private

    def response_output(resp)
      if resp.to_s.strip.empty?
        '[no response expected]'
      else
        "<pre><code>#{resp}</code></pre>"
      end
    end

    def curl_args_padded(endpoint)
      args = []
      args << "-X #{endpoint['method']}" if not endpoint['method'] == 'GET'
      args << '--header "Content-Type: application/json"' if endpoint['body']
      if endpoint['body']
        subbed_body = endpoint['body'].gsub("'", "\\'")
        args << "-d '#{subbed_body}'"
      end
      if args.empty?
        ''
      else
        args.join(' ') + ' '
      end
    end

    def curl_params(endpoint)
      params = endpoint['params']
      if params and (endpoint['method'] == 'GET')
        '&' + params.map {|param| "#{param['name']}=#{param['example']}"}.join('&')
      end
    end

    def api_curl(endpoint)
      "curl #{curl_args_padded(endpoint)}https://circleci.com#{endpoint['url']}?circle-token=:token#{curl_params(endpoint)}"
    end

    def params(params)
      if params
        """<div>
  <table class='table'>
    <thead><tr><th>Parameter</th><th>Description</th></tr></thead>
    <tbody>
    #{param_rows(params)}
    </tbody>
  </table>
</div>
"""
      end
    end

    def param_rows(params)
      if params
        params.map {|param| "<tr><td>#{param['name']}</td><td>#{param['description']}</td></tr>"}.join
      end
    end

    def try_it(endpoint)
      if endpoint['try_it']
        "<p><a href=\"https://circleci.com#{endpoint['url']}\" target=\"blank\">Try it in your browser</a></p>"
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::ApiEndpointFilter)
