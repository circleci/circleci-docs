import http.client

conn = http.client.HTTPSConnection("circleci.com")

payload = "{\n  \"definition_id\": \"e50fa3c8-8121-5c8d-b7f1-f435bba4d92e\",\n  \"config\": {\n    \"branch\": \"circleci-project-setup\"\n  },\n  \"checkout\": {\n    \"branch\": \"circleci-project-setup\"\n  }\n}"

headers = {
    'Circle-Token': "CIRCLE_TOKEN",
    'Content-Type': "application/json"
}

conn.request("POST", "/api/v2/project/github/rosieyohannan/rosie-yohannan-profile/pipeline/run", payload, headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))