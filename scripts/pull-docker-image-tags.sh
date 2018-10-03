#!/usr/bin/env bash

declare -A bundles
bundles[android]="Android"
bundles[buildpack-deps]="buildpack-deps"
bundles[clojure]="Clojure"
bundles[dynamodb]="DynamoDB"
bundles[elixir]="Elixir"
bundles[golang]="Go (Golang)"
bundles[jruby]="JRuby"
bundles[mariadb]="MariaDB"
bundles[mongo]="MongoDB"
bundles[mysql]="MySQL"
bundles[node]="Node.js"
bundles[openjdk]="OpenJDK"
bundles[php]="PHP"
bundles[postgres]="PostgreSQL"
bundles[python]="Python"
bundles[redis]="Redis"
bundles[ruby]="Ruby"
bundles[rust]="Rust"

echo "{" > jekyll/_data/docker-image-tags.json

i=1

for image in "${!bundles[@]}"; do
	tags=$(curl -X GET "https://hub.docker.com/v2/repositories/circleci/$image/tags/?page_size=50" | jq "[.results[].name]")

	echo "\"$image\": {" >> jekyll/_data/docker-image-tags.json
	echo "\"name\": \"${bundles[$image]}\"," >> jekyll/_data/docker-image-tags.json
	echo "\"tags\": ${tags}" >> jekyll/_data/docker-image-tags.json

	if (( $i < ${#bundles[@]} ));then
		echo "}," >> jekyll/_data/docker-image-tags.json
	else
		echo "}" >> jekyll/_data/docker-image-tags.json
	fi

	((i+=1))
done

echo "}" >> jekyll/_data/docker-image-tags.json
