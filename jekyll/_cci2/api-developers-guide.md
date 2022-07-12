---
layout: classic-docs
title: "CircleCI API Developer's Guide"
short-title: "Developer's Guide"
description: "API cookbook for internal and external CircleCI developers"
categories: [getting-started]
order: 1
version:
- Cloud
---

This *API Developer's Guide* was written to assist developers in quickly and easily making API calls to CircleCI services to return detailed information about users, pipelines, projects and workflows. The API v2 Specification itself may be viewed [here]({{site.baseurl}}/api/v2).

* TOC
{:toc}

## API categories
{: #api-categories }

The current categories of API v2 endpoints are:

* Authentication
* Pipeline
* Workflows
* User (Preview)
* Project (Preview)
* Job (Preview)

**Note:** Portions of the CircleCI API v2 remain under “Preview”. Preview endpoints are not yet fully supported or considered generally available. Breaking changes to API v2 Preview endpoints are planned in advance and are announced in the API v2 breaking changes log.

Currently, [Personal API tokens]({{site.baseurl}}/managing-api-tokens/#creating-a-personal-api-token) are the only supported tokens on API v2. [Project tokens]({{site.baseurl}}/managing-api-tokens/#creating-a-project-api-token) are not currently supported on API v2.
{: class="alert alert-info"}

## Authentication and authorization
{: #authentication-and-authorization }

The CircleCI API utilizes token-based authentication to manage access to the API server and validate that a user has permission to make API requests. Before you can make an API request, you must first add an API token and then verify that you are authenticated by the API server to make requests. The process to add an API token and have the API server authenticate you is described in the sections below.

**Note** You may use the API token as the username for HTTP Basic Authentication, by passing the `-u` flag to the `curl` command.

### Add an API token
{: #add-an-api-token }
{:.no_toc}

To add an API token, perform the steps listed below.

1. Log in to the CircleCI web application.
2. [Create a personal API token]({{site.baseurl}}/managing-api-tokens/#creating-a-personal-api-token) by visiting the [Personal API Tokens](https://app.circleci.com/settings/user/tokens) page, and follow the steps to add an API token.
3.  To test your token call the API using the command below. You will need to set your API token as an environment variable before making a cURL call.

    ```shell
    export CIRCLE_TOKEN={your_api_token}
    curl https://circleci.com/api/v2/me --header "Circle-Token: $CIRCLE_TOKEN"
    ```

4.  You should see a JSON response similar to the example shown below.

    ```json
    {
      "id": "string",
      "login": "string",
      "name": "string"
    }
    ```


**Note:** All API calls are made in the same way, by making standard HTTP calls, using JSON, a content-type, and your API token. Please note that the JSON examples shown in this document are not comprehensive and may contain additional JSON response fields not shown in the example, based on user input and fields.

### Accept Header
{: #accept-header }

It is recommended that you specify an accept header in your API requests. The majority
of API endpoints will return JSON by default, but some endpoints (primarily API
v1) return EDN if no accept header is specified.

To return formatted JSON, include a `text/plain` header like the example shown below:

```shell
curl --header "Circle-Token: $CIRCLECI_TOKEN" \
  --header 'Accept: text/plain'    \
  https://circleci.com/api/v2/project/{project-slug}/pipeline
```

To return compressed JSON:

```shell
curl --header "Circle-Token: $CIRCLECI_TOKEN" \
  --header 'Accept: application/json'    \
  https://circleci.com/api/v2/project/{project-slug}/pipeline
```

## Getting started with the API
{: #getting-started-with-the-api }

The CircleCI API shares similarities with previous API versions in that it identifies your projects using repository name. For instance, if you want to pull information from CircleCI about the GitHub repository https://github.com/CircleCI-Public/circleci-cli you can refer to that in the CircleCI API as `gh/CircleCI-Public/circleci-cli`, which is a "triplet" of the project type (VCS provider), the name of your "organization" (or your username), and the name of the repository.

For the project type you can use `github` or `bitbucket` as well as the shorter forms `gh` or `bb`. For any other vcs type you can use `circleci`. The `organization` is your username or organization name in your version control system.

With this API, CircleCI is introducing a string representation of the triplet called the `project_slug`, which takes the following form:

```
{project_type}/{org_name}/{repo_name}
```

The `project_slug` is included in the payload when pulling information about a project as well as when looking up a pipeline or workflow by ID. The `project_slug` can then be used to get information about the project. It is possible in the future the shape of a `project_slug` may change, but in all cases it would be usable as a human-readable identifier for a given project.

![API structure]({{ site.baseurl }}/assets/img/docs/api-structure.png)

## Rate limits
{: #rate-limits }

The CircleCI API is protected by rate limiting measures to ensure the stability of the system. We reserve the right to throttle the requests made by an individual user, or the requests made to individual resources in order to ensure a fair level of service to all of our users.

As the author of an API integration with CircleCI, your integration should expect to be throttled, and should be able to gracefully handle failure.
There are different protections and limits in place for different parts of the API. In particular, we protect our API against **sudden large bursts of traffic**, and we protect against **sustained high volumes** of requests, for example, frequent polling.

For HTTP APIs, when a request is throttled, you will receive [HTTP status code 429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429). If your integration requires that a throttled request is completed, then you should retry these requests after a delay, using an exponential backoff.
In most cases, the HTTP 429 response code will be accompanied by the [Retry-After HTTP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After). When this header is present, your integration should wait for the period of time specified by the header value before retrying a request.

## Example end-to-end API request
{: #example-end-to-end-api-request }

The following section details the steps you would need, from start to finish, to make an API call. This section includes creating a "demo repository" called "hello-world", however, you can use a pre-existing repository to follow along if you choose.

**NOTE:** Many of the API calls make use of the `{project-slug}` triplet, described [above](#getting-started-with-the-api).

### Prerequisites
{: #prerequisites }

{:.no_toc}

* A GitHub or BitBucket account with a repository to setup with CircleCI.
* Completion of the CircleCI onboarding.

### Steps
{: #steps }
{:.no_toc}

1. On your VCS provider, create a repository. The repo for this example will be called `hello-world`.

2. Onboard your new Project on the [CircleCI web app](https://app.circleci.com/) by navigating to **Projects > your project > Set Up Project**.
 After completing the steps for setting up your project, you should have a valid `config.yml` file in a `.circleci` folder at the root of your repository. In this example, the `.circleci/config.yml` contains the following:

    ```yaml
    # Use the latest 2.1 version of CircleCI pipeline process engine. See: https://circleci.com/docs/configuration-reference
    version: 2.1
    # Use a package of configuration called an orb.
    orbs:
      # Declare a dependency on the node orb
      node: circleci/node@4.7.0
      # Orchestrate or schedule a set of jobs
      workflows:
      # Name the workflow "test_my_app"
        test_my_app:
      # Run the node/test job in its own container
          jobs:
          - node/test
    ```

3. Add an API token from the [Personal API Tokens page](https://circleci.com/account/api). Be sure to write down and store your API token in a secure place once you generate it.

4. It's time to test out your API token using `curl` to make sure everything works. The following code snippets demonstrate querying all pipelines on a project. Please note that in the example below, the values within curly braces (`{}`) need to be replaced with values specific to your username/orgname.

    ```shell
    # First: set your CircleCI token as an environment variable
    export CIRCLECI_TOKEN={your_api_token}

    curl --header "Circle-Token: $CIRCLECI_TOKEN" \
      --header 'Accept: application/json'    \
      --header 'Content-Type: application/json' \
      https://circleci.com/api/v2/project/{project-slug}/pipeline
    ```

    You will likely receive a long string of unformatted JSON. After formatting, it should look like so:

    ```json
    {
      "next_page_token": null,
      "items": [
      {
        "id": "03fcbba0-d847-4c8b-a553-6fdd7854b893",
        "errors": [],
        "project_slug": "gh/{YOUR_USER_NAME}/hello-world",
        "updated_at": "2020-01-10T19:45:58.517Z",
        "number": 1,
        "state": "created",
        "created_at": "2020-01-10T19:45:58.517Z",
        "trigger": {
        "received_at": "2020-01-10T19:45:58.489Z",
          "type": "api",
                "actor": {
                  "login": "teesloane",
                  "avatar_url": "https://avatars0.githubusercontent.com/u/12987958?v=4"
                }
              },
              "vcs": {
                "origin_repository_url": "https://github.com/{YOUR_USER_NAME}/hello-world",
                "target_repository_url": "https://github.com/{YOUR_USER_NAME}/hello-world",
                "revision": "ca67134f650e362133e51a9ffdb8e5ddc7fa53a5",
                "provider_name": "GitHub",
                "branch": "master"
          }
        }
        ]
      }
    ```

    That's great! Hopefully everything is working for you up to this point. Let's move on to performing something that might be a bit more useful.

5. One of the benefits of the CircleCI API v2 is the ability to remotely trigger pipelines with parameters. The following code snippet simply triggers a pipeline via `curl` without any body parameters:

    ```shell
    curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLECI_TOKEN" \

    # Which returns:
    {
      "number": 2,
      "state": "pending",
      "id": "e411ea74-c64a-4d60-9292-115e782802ed",
      "created_at": "2020-01-15T15:32:36.605Z"
    }
    ```

    While this alone can be useful, we want to be able to customize parameters of the pipeline when we send this POST request. By including a body parameter in the `curl` request (via the `-d` flag), we can customize specific attributes of the pipeline when it runs: pipeline parameters, the branch, or the git tag. Below, we are telling the pipelines to trigger for "my-branch"

    ```shell
    curl -X POST https://circleci.com/api/v2/project/{project-slug}/pipeline \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLE_TOKEN" \
    -d '{ "branch": "bar" }'
    ```

6. Let's move on to a more complex example: triggering a pipeline and passing a parameter that can be dynamically substituted into your configuration. In this example, we will pass a docker image tag to our docker-executor key. First, we will need to modify the `.circleci/config.yml` to be a little more complex than the standard "Hello World" sample provided by the onboarding.

    ```yaml
    version: 2.1
    jobs:
      build:
        docker:
          - image: "circleci/node:<< pipeline.parameters.image-tag >>"
            auth:
              username: mydockerhub-user
              password: $DOCKERHUB_PASSWORD  # context / project UI env-var reference
        environment:
          IMAGETAG: "<< pipeline.parameters.image-tag >>"
        steps:
          - run: echo "Image tag used was ${IMAGETAG}"
    parameters:
      image-tag:
        default: latest
        type: string
    ```

    You will need to declare the parameters you expect to receive from the API. In this case, under the `parameters` key, we definte an "image-tag" to be expected in the JSON payload of a POST request to the _Trigger New Pipeline_ endpoint.

7. Now we can run a `curl` request that passes variables in a POST request, similar to the following:

    ```shell
    curl -u ${CIRCLECI_TOKEN}: -X POST --header "Content-Type: application/json" -d '{
      "parameters": {
        "image-tag": "4.8.2"
      }
    }' https://circleci.com/api/v2/project/{project-slug}/pipeline
    ```

This concludes the end-to-end example of using the v2 API. For more detailed
information about other endpoints you may wish to call, please refer to the
[CircleCI API v2 Documentation]({{site.baseurl}}/api/v2) for an overview of all
endpoints currently available.

## Additional API use cases
{: #additional-api-use-cases }

Now that you have a general understanding of how the CircleCI API v2 service works through an end-to-end API example request and walkthrough, let's look at a few common tasks and operations you may perform on a regular basis when using the API. Whether you wish to return information about a job or project, or retrieve more detailed information about a project by reviewing its artifacts, the examples shown below should assist you in gaining a better understanding of how to make some API requests to the server so you can perform a deep dive into the specifics of your work.

### Prerequisites
{: #prerequisites }
{:.no_toc}


Before trying any of the API calls in this section, make sure you have met the following prerequisites:

* You have set up a GitHub or BitBucket account with a repository to use with CircleCI.
* You have completed CircleCI onboarding and you have a project setup.
* You have a personal API token and have been authenticated to make calls to the server.

This section provides detailed information on how you can perform the following tasks and operations:

* [Get project details](#get-project-details)
* [Get job details](#get-job-details)
* [Download artifacts](#download-artifacts)
* [Gather Insights](#gather-insights)

### Get project details
{: #get-project-details }
{:.no_toc}

You may often find that it would be helpful to retrieve information about a specific project, including the name of the organization the project belongs to, the version control system (vcs) that hosts the project, and other details. The CircleCI API enables you to return this and other information by making a single GET request to the `project/{project-slug}` endpoint by passing the `project-slug` parameter.

You may notice a new concept called a `project-slug` when making this API call. A `project-slug` is a "triplet" that takes the following form:

```
{project_type}/{org_name}/{repo_name}
```

The `project_slug` is included in the payload when you pull information about a project, which enables you to retrieve detailed information about a specific project.

**Note** If you would like more detailed information about a project, or simply need a refresher on the specifics of a project, please refer to the CircleCI [Projects]({{site.baseurl}}/projects/) page.

#### Steps
{: #steps }
{:.no_toc}

Of the several project-related API endpoints available with CircleCI API v2, making a GET request to the `/project/{project-slug}` endpoint enables you to return detailed information about a specific project by passing the `project_slug` parameter with your request.

**Note:** whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.

To return project details, perform the following steps:

1. For this GET API call, under the `parameters` key, define the `project_slug` (<project_type>/<org_name>/<repo_name>) parameter you want returned in the JSON payload in your `curl` request as follows:

    ```shell
      curl -X GET https://circleci.com/api/v2/project/{project_slug} \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json' \
        --header "Circle-Token: $CIRCLE_TOKEN" \
    ```

2. After passing the `project-slug` parameter and making the API request, you will receive unformatted JSON text similar to the example shown below.

    ```json
    {
      "slug": "gh/CircleCI-Public/api-preview-docs",
      "name": "api-preview-docs",
      "organization_name": "CircleCI-Public",
      "vcs_info": {
        "vcs_url": "https://github.com/CircleCI-Public/api-preview-docs",
        "provider": "Bitbucket",
        "default_branch": "master"
      }
    }
    ```

Notice in the example above that you will receive very specific information about your project, including the name of the project, the name of the organization that the project belongs to, and information about the VCS that hosts the project. For a more detailed breakdown of each value returned in this request, please refer to the [Get Project Details](https://circleci.com/docs/api/v2/#get-a-project) section of the *CircleCI API v2 Reference Guide*.

### Get job details
{: #get-job-details }

Much like the Get Project Details API request described in the previous example, the Get Job Details API request enables you to return specific job information from the CircleCI API by making a single API request. Retrieving job information can be very useful when you want information about how your job performed, what resources were used (e.g. pipeline, executor type, etc.), and the time it took for the job to finish.

Please remember, jobs are collections of steps. Each job must declare an executor that is either `docker`, `machine`, `windows` or `macos`. `machine` includes a default image if not specified, for `docker` you must specify an image to use for the primary container, for `macos` you must specify an Xcode version, and for `windows` you must use the Windows orb.

#### Steps
{: #steps }
{:.no_toc}

Of the several Jobs-related API endpoints available with CircleCI API v2, there is a specific endpoint you may wish to call to receive detailed information about your job. This API call to the `GET /project/{project_slug}/job/{job-number}`endpoint enables you to return detailed information about a specific job by passing the `project-slug` and `job-number` parameters with your request.

**Note** In this example, please note that whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.

To return job details, perform the following steps:

1. For this GET API call, under the `parameters` key, define the `project_slug` and `job_number` parameters you want returned in the JSON payload in your `curl` request as follows:

    ```shell
      curl -X GET https://circleci.com/api/v2/project/{project_slug}/job/{job_number} \
        --header 'Content-Type: application/json' \
        --header 'Accept: application/json' \
        --header "Circle-Token: $CIRCLE_TOKEN" \
    ```

2. After passing the parameters and making the API request, you will receive unformatted JSON text similar to the example shown below.

    ```json
      {
      "web_url": "string",
      "project": {
        "slug": "gh/CircleCI-Public/api-preview-docs",
        "name": "api-preview-docs",
        "external_url": "https://github.com/CircleCI-Public/api-preview-docs"
      },
      "parallel_runs": [{
        "index": 0,
        "status": "string"
      }],
      "started_at": "2020-01-24T11:33:40Z",
      "latest_workflow": {
        "id": "string",
        "name": "build-and-test"
      },
      "name": "string",
      "executor": {
        "type": "string",
        "resource_class": "string"
      },
      "parallelism": 0,
      "status": null,
      "number": 0,
      "pipeline": {
        "id": "string"
      },
      "duration": 0,
      "created_at": "2020-01-13T18:51:40Z",
      "messages": [{
        "type": "string",
        "message": "string",
        "reason": "string"
      }],
      "contexts": [{
        "name": "string"
      }],
      "organization": {
        "name": "string"
      },
      "queued_at": "2020-01-13T18:51:40Z",
      "stopped_at": "2020-01-13T18:51:40Z"
    }
    ```

Notice in the example above that you will receive very specific information about your job, including specific project and workflow details for the job, the date and time the job started and then finished, and job-specific information such as the executor type used, current status of the job, and the duration of the job.

For a more detailed breakdown of each value returned in this request, please refer to the [Get Job Details](https://circleci.com/docs/api/v2/#get-job-details) section of the *CircleCI API v2 Reference Guide*.

### Download artifacts
{: #download-artifacts }

The following section details the steps you need to follow to download artifacts that are generated when a job is run, first, returning a list of artifacts for a job, and then downloading the full set of artifacts. If you are looking for instructions for downloading the _latest_ artifacts for a pipeline, without needing to specify a job number, see our [API v1.1 guide]({{site.baseurl}}/artifacts/#downloading-all-artifacts-for-a-build-on-circleci) – keep checking back here as this functionality will be added to API v2 in the future.

#### Steps
{: #steps }
{:.no_toc}



1. First, we will ensure your API token is set as an environment variable. You maybe have already done this during authentication, but if not, run the following command in your terminal, substituting your personal API token:

    ```shell
    export CIRCLECI_TOKEN={your_api_token}
    ```

2.  Next, retrieve the job number for the job you want to get artifacts for. You can find job numbers in the UI - either in the breadcrumbs on the Job Details page, or in the URL.

    ![Job Number]({{ site.baseurl }}/assets/img/docs/job-number.png)

3.  Next, use the `curl` command to return a list of artifacts for a specific job.

    ```shell
    curl -X GET https://circleci.com/api/v2/project/{project-slug}/{job_number}/artifacts \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLECI_TOKEN"
    ```

    You should get a list of artifacts back - if the job you selected has artifacts associated with it. Here's an extract from the output when requesting artifacts for a job that builds these docs:

    ```json
    {
      "path": "circleci-docs/assets/img/docs/walkthrough6.png",
      "node_index": 0,
      "url": "https://53936-48750547-gh.circle-artifacts.com/0/circleci-docs/assets/img/docs/walkthrough6.png"
    },
    {
      "path": "circleci-docs/assets/img/docs/walkthrough7.png",
      "node_index": 0,
      "url": "https://53936-48750547-gh.circle-artifacts.com/0/circleci-docs/assets/img/docs/walkthrough7.png"
    },
    {
      "path": "circleci-docs/assets/img/docs/walkthrough8.png",
      "node_index": 0,
      "url": "https://53936-48750547-gh.circle-artifacts.com/0/circleci-docs/assets/img/docs/walkthrough8.png"
    },
    ```

4. Next, you may extend this API call to download the artifacts. Navigate to the location you would like to download the artifacts to, and run the following command, remembering to substitute your own values in the request:

     ```shell
    curl -X GET https://circleci.com/api/v2/project/{project-slug}/{job_number}/artifacts \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Circle-Token: $CIRCLECI_TOKEN" \
    | grep -o 'https://[^"]*' \
    | wget --header="Circle-Token: $CIRCLECI_TOKEN" -v -i -
    ```

    **Note:** `grep` is used to locate all the URLs for downloading the job artifacts, while `wget` is used to perform the download.

### Gather insights
{: #gather-insights }

The CircleCI API v2 also includes several endpoints that enable you to retrieve detailed insights into your workflows and individual jobs. By making API calls to these endpoints, you can better understand how to optimize your workflows and jobs so you can increase workflow performance while minimizing credit usage and consumption. The example below describes how you can return information about a single workflow containing information about metrics and credit usage.

#### Returning workflow metrics
{: #returning-workflow-metrics }
{:.no_toc}

To return aggregated data for an individual workflow, perform the steps listed below.

**Note:** whenever you see curly brackets `{}`, this represents a variable that you must manually enter in the request.

1. For this GET API call, under the `parameters` key, define the `project_slug` in your `curl` request as follows:

    ```shell
    curl -X GET https://circleci.com/api/v2/insights/{project-slug}/workflows
    --header 'Content-Type: application/json'
    --header 'Accept: application/json'
    --header "Circle-Token: $CIRCLECI_TOKEN"
    ```
2. After you have defined the `project-slug` and made the API request, you will receive unformatted JSON text similar to the example shown below.

```json
{
	"next_page_token": null,
	"items": [{
		"name": "build",
		"metrics": {
			"success_rate": 0.5975609756097561,
			"total_runs": 82,
			"failed_runs": 33,
			"successful_runs": 49,
			"throughput": 11.714285714285714,
			"mttr": 46466,
			"duration_metrics": {
				"min": 8796,
				"max": 20707,
				"median": 11656,
				"mean": 12847,
				"p95": 18856,
				"standard_deviation": 3489.0
			},
			"total_credits_used": 16216608
		},
		"window_start": "2020-01-15T03:20:24.927Z",
		"window_end": "2020-01-21T23:23:04.390Z"
	}, {
		"name": "docker_build",
		"metrics": {
			"success_rate": 1.0,
			"total_runs": 1,
			"failed_runs": 0,
			"successful_runs": 1,
			"throughput": 1.0,
			"mttr": 0,
			"duration_metrics": {
				"min": 1570,
				"max": 1570,
				"median": 1570,
				"mean": 1570,
				"p95": 1570,
				"standard_deviation": 0.0
			},
			"total_credits_used": 5154
		},
		"window_start": "2020-01-19T15:00:16.032Z",
		"window_end": "2020-01-19T15:26:26.648Z"
	}, {
		"name": "ecr_gc",
		"metrics": {
			"success_rate": 1.0,
			"total_runs": 167,
			"failed_runs": 0,
			"successful_runs": 167,
			"throughput": 23.857142857142858,
			"mttr": 0,
			"duration_metrics": {
				"min": 31,
				"max": 96,
				"median": 46,
				"mean": 49,
				"p95": 72,
				"standard_deviation": 11.0
			},
			"total_credits_used": 3482
		},
		"window_start": "2020-01-15T01:45:03.613Z",
		"window_end": "2020-01-21T23:46:25.970Z"
	}]
}
```

Notice that in this JSON response, you will receive detailed metrics for the set of workflows that were run, including:

- `success_rate` - The ratio of successful runs (only those with a "success" status) over the total number of runs (any status) in the aggregation window.
- `total_runs` - The total number of runs that were performed.
- `failed_runs` - The number of runs that failed.
- `successful_runs` - The number of runs that were successful.
- `throughput` - The average number of builds per day.
- `mttr` - The Mean Time to Recovery (MTTR). This is the average time it takes, when a CI build fails, to get it back to a "success" status.
- `duration_metrics` - A collection of specific metrics and measurements that provide the duration of the workflow, which includes `min`, `max`, `median`, `mean`, `p95`, and `standard_deviation`.
- `total credits used` - The total number of credits that were used during the build.
- `windows_start & windows_end` - The time the build was initiated, and then completed.

**Note** The above example only shows just a few builds. When you run this command, you may receive up to 250 individual builds that you can review in much more detail.

#### Reviewing individual job metrics
{: #reviewing-individual-job-metrics }
{:.no_toc}

Now that you have retrieved aggregated data for up to 250 different jobs, you will most likely want to review specific information about a single job, or smaller number of jobs, to ensure that your jobs are running efficiently. To review an individual job, follow the steps below.

1. Using your `project-slug` from the previous API call you made to return workflow data, make a GET API call to the following insights endpoint:

    ```shell
    curl -X GET https://circleci.com/api/v2/insights/{project-slug}/workflows/builds
    --header 'Content-Type: application/json'
    --header 'Accept: application/json'
    --header "Circle-Token: $CIRCLECI_TOKEN"
    ```
4. Once you call this insights endpoint, you will receive a JSON output similar to the example shown below.

```json
{
  "items" : [ {
    "id" : "08863cb6-3185-4c2f-a44e-b517b7f695a6",
    "status" : "failed",
    "duration" : 9263,
    "created_at" : "2020-01-21T20:34:50.223Z",
    "stopped_at" : "2020-01-21T23:09:13.953Z",
    "credits_used" : 198981
  }, {
    "id" : "2705482b-40ae-47fd-9032-4113e976510f",
    "status" : "failed",
    "duration" : 9075,
    "created_at" : "2020-01-21T20:14:00.247Z",
    "stopped_at" : "2020-01-21T22:45:15.614Z",
    "credits_used" : 148394
  }, {
    "id" : "65e049ee-5949-4c30-a5c6-9433ed83f96f",
    "status" : "failed",
    "duration" : 11697,
    "created_at" : "2020-01-21T20:08:06.950Z",
    "stopped_at" : "2020-01-21T23:23:04.390Z",
    "credits_used" : 122255
  }, {
    "id" : "b7354945-32ee-4cb5-b8bf-a2f8c115b955",
    "status" : "success",
    "duration" : 9230,
    "created_at" : "2020-01-21T19:31:11.081Z",
    "stopped_at" : "2020-01-21T22:05:02.072Z",
    "credits_used" : 195050
  }, {
    "id" : "7e843b39-d979-4152-9868-ba5dacebafc9",
    "status" : "failed",
    "duration" : 9441,
    "created_at" : "2020-01-21T18:39:42.662Z",
    "stopped_at" : "2020-01-21T21:17:04.417Z",
    "credits_used" : 192854
  }, {
    "id" : "8d3ce265-e91e-48d5-bb3d-681cb0e748d7",
    "status" : "failed",
    "duration" : 9362,
    "created_at" : "2020-01-21T18:38:28.225Z",
    "stopped_at" : "2020-01-21T21:14:30.330Z",
    "credits_used" : 194079
  }, {
    "id" : "188fcf84-4879-4dd3-8bf2-4f6ea724c692",
    "status" : "failed",
    "duration" : 8910,
    "created_at" : "2020-01-20T03:09:50.448Z",
    "stopped_at" : "2020-01-20T05:38:21.392Z",
    "credits_used" : 193056
  },
```

When reviewing each individual review job, please note that the following information returned for each job:

- `id` - The ID associated with the individual job.
- `status` - The status of the job.
- `duration` - The total time of the job, in seconds.
- `created_at` - The time the job started.
- `stopped_at` - The time the job ended.
- `credits_used` - The number of credits used during the job.

## Reference
{: #reference }

- Refer to [API V2 Introduction]({{site.baseurl}}/api-intro/) for high-level information about the CircleCI V2 API.
- Refer to [API V2 Reference Guide]({{site.baseurl}}/api/v2/) for a detailed list of all endpoints that make up the CircleCI V2 API.
