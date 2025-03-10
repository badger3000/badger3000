# CHANGELOG.md

## [1.3.2] - 2025-03-09

### Added
- Added styled-components support
  - Installed styled-components and its Babel plugin
  - Configured Next.js for proper SSR handling
  - Added necessary compiler options

### Changed
- Improved articles functionality
  - Renamed blog section to Articles for better clarity
  - Made Articles component reusable between homepage and articles page
  - Added configurable options for heading, view all link, and limit
  - Enhanced image handling with proper optimization and responsive sizes
  - Added dynamic article pages with full content display
  - Updated Sanity queries to include necessary fields and proper image URLs
  - Added rich text rendering for article content
    - Support for inline images with proper optimization
    - Smart link handling with external link protection
    - Proper dark mode support for content
  - Enhanced SEO and social sharing
    - Added dynamic metadata generation for articles
    - Implemented OpenGraph and Twitter card support
    - Added proper image dimensions and alt text handling
    - Improved article metadata with publish dates and author info
  - Updated RSS feed
    - Renamed feed to match Articles branding
    - Updated feed URLs to use /articles path
    - Improved Sanity query for better content filtering

### Fixed
- Fixed TypeScript errors in blog components
- Resolved image URL construction in blog pages
- Added proper image optimization attributes
- Fixed dynamic route params handling in blog post pages for Next.js 13+ compatibility
- Fixed duplicate posts issue in blog listing
  - Improved Sanity queries to only show published articles
  - Added proper slug validation to prevent 404s
  - Updated post ordering to use publish dates consistently

## [1.3.1] - 2025-03-09

### Added
- Created dedicated blog page with article listing
  - Added responsive grid layout for blog posts
  - Implemented article previews with images
  - Added proper date formatting

### Fixed
- Moved theme color configuration to viewport export for Next.js 13+ compatibility
- Added unoptimized prop to animated GIF for proper image handling
- Fixed 404 error on /blog route

## [1.3.0] - 2025-03-09

### Added
- Integrated Sanity CMS for dynamic blog posts
  - Added Articles component for displaying blog posts
  - Implemented post fetching with proper error handling
  - Added "View all articles" link
- Added Progressive Web App (PWA) functionality
  - Created manifest.json with PWA configuration
  - Added meta tags for iOS and Android web app support
  - Added support for adding to home screen
  - Included required icons (192x192, 512x512 for Android/PWA, 180x180 for iOS)
  - Configured theme colors for light/dark modes

### Changed
- Optimized Sanity client configuration for better performance
  - Improved CDN usage in production
  - Enhanced CORS handling
- Improved homepage layout
  - Moved Articles component for better visibility
  - Enhanced responsive design and hover effects

### Fixed
- Resolved CORS issues with Sanity API requests
- Fixed handling of null values for article slugs and publication dates

## [1.2.0] - 2024-12-08

- Update dependencies + Upgrade to Next.js 15

## [1.1.0] - 2024-07-05

- Update dependencies

## [1.0.0] - 2024-04-05

First release
