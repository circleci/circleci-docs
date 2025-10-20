package main

import (
    "fmt"
    "net/http"
    "io"
)

func main() {

    url := "https://circleci.com/api/v2/pipeline?org-slug=gh%2Frosieyohannan&mine=true"

    req, _ := http.NewRequest("GET", url, nil)

    req.Header.Add("Circle-Token", "$CIRCLE_TOKEN")

    res, _ := http.DefaultClient.Do(req)

    defer res.Body.Close()
    body, _ := io.ReadAll(res.Body)

    fmt.Println(res)
    fmt.Println(string(body))

}
