require 'uri'
require 'net/http'

url = URI("https://circleci.com/api/v2/pipeline?org-slug=gh%2Frosieyohannan&mine=true")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Circle-Token"] = 'xxxxxx'

response = http.request(request)
puts response.read_body
