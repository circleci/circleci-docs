---
layout: classic-docs
title: "Welcome to CircleCI Documentation"
description: "Welcome to CircleCI Documentation"
permalink: /
redirect_from: /
toc: false
page-type: index
---

Use the tutorials, samples, how-to, and reference documentation to learn CircleCI.


<!--Do not translate: Experiment Code for https://circleci.atlassian.net/browse/DD-455 -->
<!-- we need to use "capture" because we can't use `{{site.baseurl}}` in includes. -->
{% capture nodeLink %}{{site.baseurl}}/language-javascript{% endcapture %}
{% capture nodeLogo %}{{site.baseurl}}/assets/img/compass/nodejs.svg{% endcapture %}
{% capture cciLink %}{{site.baseurl}}/getting-started{% endcapture %}
{% capture cciLogo %}{{site.baseurl}}/assets/img/compass/circle-logo.svg{% endcapture %}
{% capture pyLink %}{{site.baseurl}}/language-python{% endcapture %}
{% capture pyLogo %}{{site.baseurl}}/assets/img/compass/python.svg{% endcapture %}
{% capture dotLink %}{{site.baseurl}}/examples-and-guides-overview{% endcapture %}
{% capture dotLogo %}{{site.baseurl}}/assets/img/compass/more.svg{% endcapture %}

<div class="getting-started-experiment-badges">
  <h2> Example and Guides</h2>
    <p>Get started quickly: follow step-by-step <a href="{{site.baseurl}}/examples-and-guides-overview/">guides</a> or explore a sample app.</p>
    <div class="flex mb-2">
      {% include badge.html name="Quickstart Guide" icon=cciLogo new=true  link=cciLink%}
      {% include badge.html name="Node" icon=nodeLogo  link=nodeLink%}
  </div>
  <div class="flex">
      {% include badge.html name="Python" icon=pyLogo link=pyLink %}
      {% include badge.html name="All guides" icon=dotLogo link=dotLink %}
  </div>
</div>
<!-- End: Experiment code. -->

<div class="row loading-deferred">
  <div class="treatment col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>Get Started</h2>
    <p>Get started with CircleCI automated builds.</p>
    <ul>
      <li><a href="{{ site.baseurl }}/first-steps/">Sign Up & Try</a></li>
      <li><a href="{{ site.baseurl }}/getting-started/">Your First Green Build</a></li>
      <li><a href="{{ site.baseurl }}/hello-world/">Hello World</a></li>
      <li><a href="{{ site.baseurl }}/faq/">FAQ</a></li>
      <li><a href="{{ site.baseurl }}/orb-intro/">Orbs</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>Examples</h2>
    <p>Check out some of our popular examples.</p>
    <ul>
        <li><a href="{{ site.baseurl }}/example-configs/">Open Source Projects that use CircleCI</a></li>
        <li><a href="{{ site.baseurl }}/postgres-config/">Database Config Examples</a></li>
        <li><a href="{{ site.baseurl }}/sample-config/">Sample config.yml Files</a></li>
        <li><a href="{{ site.baseurl }}/examples-and-guides-overview/">Language Guides and Sample Apps</a></li>
        <li><a href="{{ site.baseurl }}/orb-concepts/">Using Orbs</a></li>
      </ul>
  </div>
  <div class="col-xs-12">
    <hr />
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>Config</h2>
    <p>Set up and debug your build configuration.</p>
    <ul>
      <li><a href="{{ site.baseurl }}/configuration-reference/">Configuration Reference</a></li>
      <li><a href="{{ site.baseurl }}/writing-yaml/">Writing YAML</a></li>
      <li><a href="{{ site.baseurl }}/env-vars/">Environment Variables</a></li>
      <li><a href="{{ site.baseurl }}/ssh-access-jobs/">Debugging with SSH</a></li>
      <li id="full-config-example"><a href="{{ site.baseurl }}/configuration-reference/#example-full-configuration">Full Config Example</a></li>
    </ul>
  </div>
  <div class="col-xs-12 col-sm-6">
    <h2>Workflows</h2>
    <p>Use workflows to schedule and sequence jobs.</p>
    <ul>
      <li><a href="{{ site.baseurl }}/workflows/">Using Workflows to Schedule Jobs</a></li>
      <li><a href="{{ site.baseurl }}/workflows/#workflows-configuration-examples">Example Configs</a></li>
      <li><a href="{{ site.baseurl }}/workflows/#scheduling-a-workflow">Scheduling a Workflow</a></li>
      <li><a href="{{ site.baseurl }}/workflows/#using-contexts-and-filtering-in-your-
      workflows">Using Contexts and Filtering in Your Workflows</a></li>
      <li><a href="{{ site.baseurl }}/creating-orbs/">Creating Orbs</a></li>
    </ul>
  </div>
   <div class="col-xs-12">
    <hr />
  </div>
</div>
