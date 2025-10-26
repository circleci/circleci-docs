require 'uri'
require 'net/http'

url = URI("https://circleci.com/api/v2/project/github/rosieyohannan/rosie-yohannan-profile/pipeline/run")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["Circle-Token"] = 'YOUR_CIRCLE_TOKEN'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"definition_id\": \"e50fa3c8-8121-5c8d-b7f1-f435bba4d92e\",\n  \"config\": {\n    \"branch\": \"circleci-project-setup\"\n  },\n  \"checkout\": {\n    \"branch\": \"circleci-project-setup\"\n  }\n}"

response = http.request(request)
puts response.read_body