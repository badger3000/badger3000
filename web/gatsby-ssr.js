import React from 'react'
/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// You can delete this file if you're not using it
export const onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: 'en-GB' }),
    setHeadComponents([
      <link
        key="sansPro"
        rel="preload"
        href="fonts/SourceSansPro-Regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />,
      <link
        key="sansPro"
        rel="preload"
        href="fonts/SourceSansPro-Italic.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />,
    ])
}
