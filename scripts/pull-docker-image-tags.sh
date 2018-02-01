#!/usr/bin/env bash

declare -A bundles
bundles[android]="Android"
bundles[node]="Node.js"
bundles[python]="Python"
bundles[ruby]="Ruby"
bundles[golang]="Go (Golang)"
bundles[php]="PHP"
bundles[postgres]="PostgreSQL"
bundles[mariadb]="MariaDB"
bundles[mysql]="MySQL"
bundles[mongo]="MongoDB"
bundles[elixir]="Elixir"
bundles[jruby]="JRuby"
bundles[clojure]="Clojure"
bundles[openjdk]="OpenJDK"
bundles[buildpack-deps]="buildpack-deps"

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
