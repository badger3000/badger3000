# Scripts Directory

This directory contains various utility scripts for working with the project:

## Blog Post Workflow Scripts

- `update-readme.js` - The primary script used by the GitHub workflow to fetch blog posts from your Sanity API and update the README
- `test-feed.cjs` - Tests your RSS feed endpoint and validates it's returning proper XML
- `test-workflow.cjs` - Simulates the full blog-post-workflow locally for testing
- `manual-update-readme.cjs` - A utility for manual testing of the README update process

## Temporary Files

When running these scripts locally, temporary files may be created:

- `local-feed.xml` - Created by test-workflow.cjs to save a local copy of the feed for testing
- `test-README.md` - Created by test-workflow.cjs as a test file for README updates

## How to Use

1. **Testing the Feed**:

   ```
   node scripts/test-feed.cjs
   ```

2. **Testing the README update**:

   ```
   node scripts/manual-update-readme.cjs
   ```

3. **Simulating the full workflow**:
   ```
   node scripts/test-workflow.cjs
   ```

These scripts help ensure the GitHub workflow is functioning properly without having to commit and push changes.
