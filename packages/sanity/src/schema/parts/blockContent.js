export default {
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    {
      title: "Block",
      type: "block",
      // Styles let you set what your user can mark up blocks with
      styles: [
        {title: "Normal", value: "normal"},
        {title: "H1", value: "h1"},
        {title: "H2", value: "h2"},
        {title: "H3", value: "h3"},
        {title: "H4", value: "h4"},
        {title: "Quote", value: "blockquote"},
      ],
      lists: [
        {title: "Bullet", value: "bullet"},
        {title: "Number", value: "number"},
      ],
      // Marks let you mark up inline text
      marks: {
        // Decorators usually describe a single property
        decorators: [
          {title: "Strong", value: "strong"},
          {title: "Emphasis", value: "em"},
          {title: "Code", value: "code"},
          {title: "Underline", value: "underline"},
          {title: "Highlight", value: "highlight"},
        ],
        // Annotations can be any object structure
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
                validation: (Rule) =>
                  Rule.uri({
                    scheme: ["http", "https", "mailto", "tel"],
                  }),
              },
            ],
          },
        ],
      },
    },
    // Image type for rich content
    {
      type: "image",
      options: {
        hotspot: true, // Enables the hotspot feature for images
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Important for SEO and accessibility",
        },
        {
          name: "caption",
          type: "string",
          title: "Caption",
          description: "Image caption that appears below the image",
        },
      ],
    },
    // Code block for syntax-highlighted code
    {
      name: "code",
      title: "Code Block",
      type: "object",
      fields: [
        {
          name: "language",
          title: "Language",
          type: "string",
          options: {
            list: [
              {title: "JavaScript", value: "javascript"},
              {title: "TypeScript", value: "typescript"},
              {title: "HTML", value: "html"},
              {title: "CSS", value: "css"},
              {title: "Python", value: "python"},
              {title: "PHP", value: "php"},
              {title: "Ruby", value: "ruby"},
              {title: "Shell", value: "bash"},
              {title: "JSON", value: "json"},
              {title: "Markdown", value: "markdown"},
              {title: "Plain text", value: "text"},
            ],
          },
        },
        {
          name: "code",
          title: "Code",
          type: "text",
        },
        {
          name: "filename",
          title: "Filename (optional)",
          type: "string",
        },
      ],
    },
    // Video embed
    {
      name: "video",
      title: "Video Embed",
      type: "object",
      fields: [
        {
          name: "url",
          title: "Video URL",
          type: "url",
          description: "YouTube or Vimeo URL",
        },
        {
          name: "title",
          title: "Video Title",
          type: "string",
        },
        {
          name: "provider",
          title: "Provider",
          type: "string",
          options: {
            list: [
              {title: "YouTube", value: "youtube"},
              {title: "Vimeo", value: "vimeo"},
            ],
          },
        },
      ],
    },
    {
      name: "selfHostedVideo",
      title: "Self-Hosted Video",
      type: "object",
      fields: [
        {
          name: "videoFile",
          title: "Video File",
          type: "file",
          options: {
            accept: "video/*", // Accepts all video formats including WebM
          },
          validation: (Rule) => Rule.required(),
        },
        {
          name: "poster",
          title: "Video Poster (Thumbnail)",
          type: "image",
          description: "Image shown before the video plays",
        },
        {
          name: "title",
          title: "Video Title",
          type: "string",
        },
        {
          name: "autoPlay",
          title: "Auto Play",
          type: "boolean",
          description:
            "Start playing automatically (may be blocked by browsers)",
          initialValue: false,
        },
        {
          name: "loop",
          title: "Loop Video",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "muted",
          title: "Muted",
          type: "boolean",
          description: "Start with sound muted",
          initialValue: false,
        },
        {
          name: "controls",
          title: "Show Controls",
          type: "boolean",
          description: "Display video player controls",
          initialValue: true,
        },
      ],
    },
  ],
};
