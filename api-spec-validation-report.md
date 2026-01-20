# API Specification Validation Report

**Generated:** 2026-01-20T12:34:19.976Z
**Spec:** CircleCI API v1.1 reference documentation (The CircleCI API provides endpoints for managing and retrieving information about your CircleCI proj...)

## Summary

- **Total Endpoints Attempted:** 12
- **Successfully Tested:** 12
- **Passed Validation:** 11 ✅
- **Schema Issues Found:** 0 ⚠️
- **Failed/Errors:** 1 ❌

## ❌ Failed Tests

These endpoints could not be tested successfully:

### GET /project/{vcs-type}/{organization}/{project}/checkout-key/{fingerprint}
**Summary:** Get a checkout key
**Status:** 404

**Errors:**
- Unexpected status code: 404
- API Error: checkout key not found

## ✅ Validated Endpoints

These endpoints passed all validation checks:

- GET /me - Get current user information
- GET /projects - Get all followed projects
- GET /recent-builds - Get recent jobs across all projects
- GET /project/{vcs-type}/{organization}/{project}/{build_num} - Get a single job
- GET /project/{vcs-type}/{organization}/{project} - Get recent jobs for a single project
- GET /project/{vcs-type}/{organization}/{project}/{build_num}/tests - Get test metadata
- GET /project/{vcs-type}/{organization}/{project}/envvar - List environment variables
- GET /project/{vcs-type}/{organization}/{project}/envvar/{name} - Get an environment variable
- GET /project/{vcs-type}/{organization}/{project}/checkout-key - List checkout keys
- GET /project/{vcs-type}/{organization}/{project}/{build_num}/artifacts - Get artifacts of a specific job
- GET /project/{vcs-type}/{organization}/{project}/latest/artifacts - Get artifacts of the latest job

## Recommendations

### Failed Tests

Some endpoints could not be tested. Common reasons:
- Missing test data (provide real VCS type, org, project, build numbers)
- Authentication issues (check your API token)
- Non-existent resources (ensure test data refers to real CircleCI resources)
