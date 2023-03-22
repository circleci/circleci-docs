---
layout: classic-docs
title: "Quickstart guide"
description: "A quickstart guide for adding a project to CircleCI and exploring some features"
contentTags:
  platform:
  - Cloud
---

This quickstart guides you through sign up, connecting an existing project to CircleCI, and various features, including the in-app config editor. You will finish by inviting team members to collaborate on your new project.

If you would rather jump to a full list of CircleCI `config.yml` options, see the [Configuration reference](/docs/configuration-reference).

<!-- set up prerequisites -->

{% capture content1 %} Sign up for a free CircleCI {% endcapture %}

{% capture content2 %} Sign in and connect to GitLab 👋 {% endcapture %}

{% include getting-started-links.html title="Prerequisites" id="prerequisites" href1="https://circleci.com/signup" href2="https://circleci.com/docs/first-steps" content1=content1 content2=content2 %}

<!-- set up section one heading banner stc. -->

{%- capture header-banner-1 -%}
{{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/quick-start--first-step.svg
{%- endcapture -%}

{% capture content %} Connect your new code repository, commit a CircleCI configuration file to a new branch, and view the pipeiline and see it pass. {% endcapture %}

{% include getting-started-section-header.html title="1. Connect your code" content=content imagePath=header-banner-1 %}

<!-- Set up banner for VCS prereq -->

{%- capture gitlab-icon -%}
  {{ site.baseurl }}/assets/img/icons/companies/gitlab-color.svg
{%- endcapture -%}

{% include gitlab-banner.html gitlabPath=gitlab-icon %}

<!-- Step 1 (two versions for different VCS) -->

{% capture content %}
In the left-hand menu, select <a  href="https://app.circleci.com/projects">Projects</a>. Find the repository, and click <strong>Set Up Project</strong>.
Don’t see your repository? Use the org selector in the top left corner to find the correct organization.
{% endcapture %}

{%- capture select-project -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/select-project.png
{%- endcapture -%}

{% include two-up.html title="1a. Select a project (GitHub/Bitbucket)" content=content imageURL=select-project imageAlt="Select Projects" %}



{% capture content %}
In the left-hand menu, select <a  href="https://app.circleci.com/projects">Projects</a>.
Click <strong>Create Project</strong>, then select the repository you would like to connect. Choose "Fast: Take me to a config.yml template that I can edit" and Click <strong>Create Project</strong> to save. A configuration file has been added on a new branch called <code>update-circleci-config</code>.
Don’t see your repository? Use the org selector in the top left corner to find the correct organization.
{% endcapture %}

{%- capture select-project -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/select-project.png
{%- endcapture -%}

{% include two-up.html title="1b. Select a project (GitLab)" content=content imageURL=select-project imageAlt="Select Projects" %}

<!-- Step 2 -->

{% capture content %}
In the “Select your <a class="no-external-icon" href="https://circleci.com/docs/config-start/">config.yml</a> file” modal, select <b>Fast</b>, then click <b>Set Up Project</b>. Choose the Hello World sample configuration file.
{% endcapture %}

{%- capture select-config -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/select-config.png
{%- endcapture -%}

{% include two-up.html title="2. Select a config.yml" content=content imageURL=select-config imageAlt="Choose Config" %}


{% capture content %}
You’re now in the <a class="no-external-icon" href="https://circleci.com/docs/config-editor/#getting-started-with-the-circleci-config-editor">CircleCI config editor</a>, pre-populated with a sample config.yml file. <b>Click Commit and Run.</b>
<br>
<br>
This will create a .circleci/config.yml file at the root of your repository on a new branch called “circle-ci-setup”.
{% endcapture %}

{%- capture CCI-config-editor -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/CCI-config-editor.png
{%- endcapture -%}

{% include two-up.html title="3. CircleCI config editor" content=content imageURL=CCI-config-editor imageAlt="Config Editor" %}

{% capture content %}
You should soon have your first green pipeline. If you are happy with this configuration, merge it into your main branch or continue to make changes.{% endcapture %}

{%- capture congrats-first-green-pipeline -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/congrats-first-green-pipeline.png
{%- endcapture -%}

{% include two-up.html title="4. Congratulations 🎉" content=content imageURL=congrats-first-green-pipeline imageAlt="Green Pipeline Build" %}

{% capture content %} You should see your pipeline start to run automatically—and pass! {% endcapture %}

{%- capture header-banner-2 -%}
{{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/quick-start--second-step.svg
{%- endcapture -%}

{% include getting-started-section-header.html title="02 Dig into your first pipeline" id="first-pipeline" content=content imagePath=header-banner-2 %}

{% capture content %}
Click on the green Success button to see details about the workflow. The hello-world <a class="no-external-icon" href="https://circleci.com/docs/concepts/#pipelines">pipeline</a> ran one job called <b>say-hello</b> within the <a class="no-external-icon" href="https://circleci.com/docs/concepts/#workflows">workflow</a>. Click into the job to see the steps that ran.
{% endcapture %}

{%- capture what-just-happened -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/what-just-happened.png
{%- endcapture -%}

{% include two-up.html title="1. So, what just happened?" content=content imageURL=what-just-happened imageAlt="Green Success Button" %}


{% capture content %}
Click the <b>say-hello</b> <a class="no-external-icon" href="https://circleci.com/docs/concepts/#jobs">job</a> to see the <a class="no-external-icon" href="https://circleci.com/docs/concepts/#steps">steps</a> in this job:
<ul>
<li>Spin up environment</li>
<li>Preparing environment variables</li>
<li>Checkout code</li>
<li>Say hello</li>
</ul>
{% endcapture %}

{%- capture view-results -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/view-results.png
{%- endcapture -%}

{% include two-up.html title="2. View your results" content=content imageURL=view-results imageAlt="Steps in Pipeline Job" %}

{% capture content %}
It is easy for teammates and collaborators to view and follow your projects. Teammates can make a free CircleCI account at any time to view your pipelines, even if they are not committing any code.
{% endcapture %}

{%- capture collab-with-team -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/collab-with-team.png
{%- endcapture -%}

{% include two-up.html title="3. Collaborate with teammates" content=content imageURL=collab-with-team imageAlt="Add Team Members" %}


{% capture content %} We recommend inviting your teammates to join you, for free. By collaborating, you can troubleshoot, get pull requests approved, and build and test faster. You can also: {% endcapture %}

{%- capture header-banner-3 -%}
{{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/quick-start--third-step.svg
{%- endcapture -%}

{% include getting-started-section-header.html title="03 What's next" id="next" content=content imagePath=header-banner-3 %}

{% capture content %}
Try editing your config.yml file. On CircleCI, you can edit files directly and then commit them to your VCS.
<br>
<br>
On the <a  href="https://app.circleci.com/projects/">Projects</a> page, click the ••• buttons to view your configuration file. Make any change and save it. You should see a new pipeline run and likely fail. This is a primary benefit of CircleCI: identifying failures early.
{% endcapture %}

{%- capture break-your-build -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/break-your-build.png
{%- endcapture -%}

{% include two-up.html title="1. Break your build" content=content imageURL=break-your-build imageAlt="Failed Job in Pipeline" %}

{% capture content %}
In your Dashboard, click into the <b>say-hello-world</b> workflow. Can you find the four steps that ran? Hint: step 1 is <b>Spin up environment</b>.
<br>
<br>
A <a class="no-external-icon" href="https://circleci.com/docs/workflows/">workflow</a> is a set of rules that defines a collection of jobs and their run order. Workflows support complex job orchestration using a simple set of configuration keys to help you quickly resolve failures.
{% endcapture %}

{%- capture explore-workflows -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/explore-workflows.png
{%- endcapture -%}

{% include two-up.html title="2. Explore the workflows function" content=content imageURL=explore-workflows imageAlt="Explore Your Workflow" %}

{% capture content %}
On a failed pipeline, you can <a class="no-external-icon" href="https://circleci.com/docs/ssh-access-jobs/">SSH directly into your CircleCI jobs</a> and automatically troubleshoot issues. This feature reruns your pipeline and often finds and fixes errors.
{% endcapture %}

{%- capture SSH-into-build -%}
  {{ site.baseurl }}/assets/img/docs/getting-started-guide-exp/SSH-into-build.png
{%- endcapture -%}

{% include two-up.html title="3. SSH into your build" content=content imageURL=SSH-into-build imageAlt="Rerun Job with SSH" %}


That’s a wrap! We hope you’re up and running and more confident using CircleCI. To continue your progress, check out the resources below or [ask for help](https://support.circleci.com/hc/en-us/).

## Next steps
{: #next-steps }

* [On-demand free developer training](https://circleci.com/training/)
* [CircleCI foundation videos](https://www.youtube.com/playlist?list=PL9GgS3TcDh8wqLRk-0mDz7purXh-sNu7r)
* [Introduction to configuration](/docs/config-intro/)
* [CircleCI concepts](https://circleci.com/docs/concepts/)
* [Benefits of CircleCI free plan](https://circleci.com/docs/plan-free/)
