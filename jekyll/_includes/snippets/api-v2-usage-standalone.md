For GitHub App and GitLab projects, organization as well as project names do not serve as identifiers, and are not part of project slugs. These projects currently use a new slug format:

`circleci/:slug-remainder`

The project slug for can be found by navigating to your project in the CircleCI web app and taking the "triplet" string from the browser address bar.

![GitLab project slug available in address in the web app]({{ site.baseurl }}/assets/img/docs/standalone-project-slug.png)

In API requests, the project slug must be passed as a whole. For example:

```shell
curl --header "Circle-Token: $CIRCLE_TOKEN" \
  --header "Accept: application/json"    \
  --header "Content-Type: application/json" \
  https://circleci.com/api/v2/project/circleci/:slug-remainder
```

The project slugs must be treated as opaque strings. The slug should not be parsed to retrieve the project or organization IDs. To retrieve project and organization IDs or names, use the entire slug to fetch [project details](#get-project-details) or organization details. The IDs and names are included in the payload.