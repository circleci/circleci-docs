package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://circleci.com/api/v2/project/github/rosieyohannan/rosie-yohannan-profile/pipeline/run"

	payload := strings.NewReader("{\n  \"definition_id\": \"e50fa3c8-8121-5c8d-b7f1-f435bba4d92e\",\n  \"config\": {\n    \"branch\": \"circleci-project-setup\"\n  },\n  \"checkout\": {\n    \"branch\": \"circleci-project-setup\"\n  }\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("Circle-Token", "YOUR_CIRCLE_TOKEN")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}