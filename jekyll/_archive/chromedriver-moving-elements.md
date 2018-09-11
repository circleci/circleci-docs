---
layout: classic-docs
title: "ChromeDriver raises an 'Element is not clickable' exception"
description: "'Element is not clickable' issue with ChromeDriver"
last_updated: Aug 7, 2013
sitemap: false
---

This can be caused by the small delay between ChromeDriver determining the
location of an element to click and actually clicking on the element. If the
element is moving (for instance because another element has loaded and caused
the page to reflow) it is no longer at the coordinates that ChromeDriver
captured and it tries to click in the wrong place, causing this error.

This behaviour is due to the ChromeDriver implementation (there is an
[issue](https://code.google.com/p/chromedriver/issues/detail?id=22)
tracking a fix in ChromeDriver itself).

You can use
[explicit waits](http://docs.seleniumhq.org/docs/04_webdriver_advanced.jsp#explicit-and-implicit-waits-reference)
along with a custom expected condition to wait until an element has stopped moving before clicking.
