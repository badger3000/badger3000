# Scripts Directory

This directory contains various utility scripts for working with the project:

## Blog Post Workflow Scripts

- `update-readme.js` - The primary script used by the GitHub workflow to fetch blog posts from your Sanity API and update the README
- `test-feed.js` - Tests your RSS feed endpoint and validates it's returning proper XML
- `test-workflow.js` - Simulates the full blog-post-workflow locally for testing
- `manual-update-readme.js` - A utility for manual testing of the README update process

## Sanity CMS Scripts

- `check-content.js` - Validates Sanity content structure and reports any issues
- `list-content.js` - Lists all content items from Sanity by type
- `test-articles.js` - Tests fetching and processing of article content from Sanity
- `test-sanity.js` - Basic Sanity connectivity and query testing
- `test-sanity-auth.js` - Tests Sanity authentication and token validation
- `test-sanity-final.js` - End-to-end tests for Sanity integration
- `test-final.js` - Final integration tests for the entire application
- `verify-sanity.js` - Verifies Sanity schema, content, and API endpoints

## Temporary Files

When running these scripts locally, temporary files may be created:

- `local-feed.xml` - Created by test-workflow.js to save a local copy of the feed for testing
- `test-README.md` - Created by test-workflow.js as a test file for README updates

## How to Use

1. **Testing the Feed**:

   ```
   node scripts/test-feed.js
   ```

2. **Testing the README update**:

   ```
   node scripts/manual-update-readme.js
   ```

3. **Simulating the full workflow**:
   ```
   node scripts/test-workflow.js
   ```

These scripts help ensure the GitHub workflow is functioning properly without having to commit and push changes.
