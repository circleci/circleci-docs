# Goal of testing plan
Manual testing is expensive and we want to create a testing plan to focus on critical parts of the software while automated tests are being developed. 

Some manual tests may be expensive to automate but we should aim to limit this list as much as possible and create as much test coverage to be confident in our deploys.

When testing manual testing we need to keep in mind still both unit tests and integration tests.

Unit tests: individual units or components of a software are tested. 
Example: A button. Does it look like the mock up? Does it click event work as expected? 

Integrated tests: is the phase in software testing in which individual software modules are combined and tested as a group.How the user can interact with the application throughout an entire workflow.
Example: A user navigates to a website. The user logs in. The user changes account name. The user logs out.

# 1.0 INTRODUCTION
Our application is a website that provides documentation on our main continuous integration and delivery application two main target personas: Danny Developer and Technical Writers.

# 2.0 OBJECTIVES AND TASKS

## 2.1 Objectives
- Analyze the product
- Design test strategy
- Define test objectives
- Define test criteria
- Resource planning
- Plan test enviroment
- Schedule + Estimation
- Determine test Deliverables

## 2.2 Tasks
- testing 
- problem reporting
- re-testing

# 3.0 Tactics
## Testing
We need to test the existing interfaces. Follow the how to test instructions in the github pull request. If test instructions are not present check the README file in the main application folder on instructions how to run the application locally. 

Testing should include going over design reviews. Ensuring the pull request is in line with the mock-ups provided. 

## Problem reporting
If an issue is found well testing the pull request there are three ways to leave messages in github.
1. Comment: Comment is used if you want to start a conversation about concerns in the PR
2. Request changes: This will allow you to write a comment about what concerns was found but also prevent the pull request from being merged until changes are made and verified by you later

If there is no problems to report then a third option is available `Approval` where you can signify to the pull request owner that you found no issues and are fine with merging the pull request.

## Re-testing
If a problem is reported then after a fix is made re-testing of the application needs to be done. Not only for just the initial problem but all tests to make sure new problems did not result due to the change.

If new problems are found see `problem reporting` above else mark the pull request as `Approved` to indicate no new problems were found and the initial problem was solved.

# 4.0 Testing Strategy
There are many different types of testing stragies including but not limited to:
- Unit Testing 
We currently use jest

- System and Integration Testing 
We are exploring the use of cypress

- Performance and Stress Testing

- User Acceptance Testing
Our users are often the Docs team or ourselves for user acceptance testing.

- Batch Testing

- Automated Regression Testing

- Beta Testing
This should take place when we are reviewing the PRs and spin up the application locally.

# 5.0 Hardware Requirements
Currently we only support spinning up development enviroments on Mac books.

# 6.0 Features to Be Tested
Note as this application is constnatly being iterated on this features to be tested list should always be reviewed and edited based on features added / removed or updated.

These descriptions are at a high level and the best indicator when testing development is to view what the application looks like in productions.

Remember to test all features in both English and Japanese version of the Docs site.

## Accessibility testing
- Can you search in algolia?
- Are the tabs in search toggleable?
- Can you tab to `Skip to Content`?

## Header
- CircleCi logo that when clicked takes you to docs homepage
- Search bar (See search bar below more details)
- Globe icon that opens to langauge selector (See language selector below for more details)
- Link to circleci.com
- Button to `Go to application` or `Sign up`

## Search bar
- When typing inside of search bar then results a results page should appear. The url should now contain a query string of the word used. 3 tabs should appear
1. Documention - results found in /docs
2. Orbs - Results found in the developer/orb site
3. Convenience Images - Results found in developer/orb
- Pressing cancel should close search bar results 
- Pressing `X` should clear search results and query string from url

## Side nav
- Contains a list to all different resource available on the Docs site
- There should be top level sections that toggle between open and closed when clicked on revealing child lists 
- The side nav should ensure the parent category is opened and the child side page header is highlighted in the list for the associated page that the user is currently viewing
- When an item is clicked on the side nav it should navigate the user to the associated page, and highlight the item should be highlighted

## TOC
- TOC may not appear on all pages
- TOC contains a list of headers that are on the page and helpful resources
- When a user clicks on a helpful resource the user should be navigated to that resource
- Wehn a user clicked on an item in `On this page` then the user should be scrolled to that item on the page and the item should now be highlighted

## Language selector
- Language selector allows a user to switch between English and Japanese

## Screen size
- The header will change depending on screen size. For example the circle ci home page may no longer be visible. 
- The side nav moves from the left hand side to be used inside of a hamburger icon
-  TOC moves from right side of the screen to being embeded at the top of the document

# 7.0 Features Not to Be Tested
- circleci.com
- sign up / signin
- API v1 and API v2 can be skipped unless feature relates to them specifically

# 8.0 Resources/Roles & Responsibilities
Docs team: For content verification
Japanese translation team: To ensure Japanese translation is accurate
Docs disco team: For development
