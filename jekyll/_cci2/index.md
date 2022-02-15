---
layout: classic-docs
title: "Welcome to CircleCI Documentation"
description: "Welcome to CircleCI Documentation"
permalink: /2.0/
toc: false
page-type: index
---

Use the tutorials, samples, how-to, and reference documentation to learn CircleCI. here

<hr class="hidden-xs" />

<div class="row loading-deferred">
  <div class="treatment col-xs-12">
    <span id="homepage-guide-links"><h2>Examples and Guides</h2><img src="{{ site.baseurl }}/assets/img/compass/new.svg" alt="New"></span>
    <p>Get started quickly: follow step-by-step <a href="{{site.baseurl}}/2.0/tutorials/">guides</a> or explore a sample app.</p>
  </div>
  <div class="treatment col-xs-12 col-sm-6">
    <a class="no-external-icon col-sm-12" href="{{site.baseurl}}/2.0/language-javascript/">
      <div class="card col-sm-12">
        {% capture node-js-card %}
          {% include snippets/language-card.md lang="Node.JS" anchor="true" %}
        {% endcapture %}
        {{ node-js-card | markdownify }}
      </div>
    </a>
  </div>
  <div class="treatment col-xs-12 col-sm-6">
    <a class="no-external-icon col-sm-12" href="{{site.baseurl}}/2.0/language-python/">
      <div class="card col-sm-12">
        {% capture python-card %}
          {% include snippets/language-card.md lang="Python" anchor="true" %}
        {% endcapture %}
        {{ python-card | markdownify }}
      </div>
    </a>
  </div>
  <div class="treatment col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>Get Started</h2>
    <p>Get started with CircleCI automated builds.</p>
    <ul>
      <li><a href="{{ site.baseurl }}/2.0/first-steps/">Sign Up & Try</a></li>
      <li><a href="{{ site.baseurl }}/2.0/getting-started/">Your First Green Build</a></li>
      <li><a href="{{ site.baseurl }}/2.0/hello-world/">Hello World</a></li>
      <li><a href="{{ site.baseurl }}/2.0/faq/">FAQ</a></li>
      <li><a href="{{ site.baseurl }}/2.0/orb-intro/">Orbs</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>Examples</h2>
    <p>Check out some of our popular examples.</p>
    <ul>
        <li><a href="{{ site.baseurl }}/2.0/example-configs/">Open Source Projects that use CircleCI</a></li>
        <li><a href="{{ site.baseurl }}/2.0/postgres-config/">Database Config Examples</a></li>
        <li><a href="{{ site.baseurl }}/2.0/sample-config/">Sample config.yml Files</a></li>
        <li><a href="{{ site.baseurl }}/2.0/tutorials/">Tutorials and Sample Apps</a></li>
        <li><a href="{{ site.baseurl }}/2.0/orb-concepts/">Using Orbs</a></li>
      </ul>
  </div>
  <div class="col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>Config</h2>
    <p>Set up and debug your build configuration.</p>
    <ul>
      <li><a href="{{ site.baseurl }}/2.0/configuration-reference/">Configuration Reference</a></li>
      <li><a href="{{ site.baseurl }}/2.0/writing-yaml/">Writing YAML</a></li>
      <li><a href="{{ site.baseurl }}/2.0/env-vars/">Using Environment Variables</a></li>
      <li><a href="{{ site.baseurl }}/2.0/ssh-access-jobs/">Debugging with SSH</a></li>
      <li id="full-config-example"><a href="{{ site.baseurl }}/2.0/configuration-reference/#example-full-configuration">Full Config Example</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>Workflows</h2>
    <p>Use workflows to schedule and sequence jobs.</p>
    <ul>
      <li><a href="{{ site.baseurl }}/2.0/workflows/">Using Workflows to Schedule Jobs</a></li>
      <li><a href="{{ site.baseurl }}/2.0/workflows/#workflows-configuration-examples">Example Configs</a></li>
      <li><a href="{{ site.baseurl }}/2.0/workflows/#scheduling-a-workflow">Scheduling a Workflow</a></li>
      <li><a href="{{ site.baseurl }}/2.0/workflows/#using-contexts-and-filtering-in-your-
      workflows">Using Contexts and Filtering in Your Workflows</a></li>
      <li><a href="{{ site.baseurl }}/2.0/creating-orbs/">Creating Orbs</a></li>
    </ul>
  </div>
   <div class="col-xs-12">
    <hr />
  </div>
   <div class="col-xs-12 col-sm-6">
    <h2>Cookbooks</h2>
    <p>Recipes to assist and inspire your pipeline config.</p>
    <ul>
      <li><a href="{{ site.baseurl }}/2.0/optimization-cookbook/">Discover ways to optimize your pipelines</a></li>
      <li><a href="{{ site.baseurl }}/2.0/configuration-cookbook">Explore best practices for a range of use cases</a></li>
    </ul>
  </div>
</div>
