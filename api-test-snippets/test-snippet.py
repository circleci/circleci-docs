import http.client

conn = http.client.HTTPSConnection("circleci.com")

headers = { 'Circle-Token': "xxxxxxxxx" }

conn.request("GET", "/api/v2/pipeline?org-slug=gh%2Frosieyohannan&mine=true", headers=headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))
