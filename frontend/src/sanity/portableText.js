import { PortableText } from 'astro-portabletext'
import { urlForImage } from './urlForImages'

// Custom components for PortableText
const customComponents = {
  types: {
    image: ({ value }) => {
      return `
        <picture>
          <source
            srcset="${urlForImage(value.asset).format('webp').url()}"
            type="image/webp"
          />
          <img
            class="responsive__img"
            src="${urlForImage(value.asset).url()}"
            alt="${value.alt}"
          />
        </picture>
      `
    },
  },
}

// Export PortableText component with custom components
export const SanityPortableText = (props) => (
  <PortableText value={props.value} components={customComponents} />
)