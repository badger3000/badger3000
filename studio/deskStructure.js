import Iframe from 'sanity-plugin-iframe-pane'
import {EarthGlobeIcon, EditIcon} from '@sanity/icons'

function getPreviewUrl(document) {
  const remoteURL = 'https://badger3000.com'
  const localURL = 'http://localhost:8000'
  const previewURL = window.location.hostname === 'localhost' ? localURL : remoteURL

  if (document._type == 'page') {
    return `${previewURL}/${document.slug.current}`
  }

  return prev
}

// note: context includes `currentUser` and the client
export const deskStructure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      ...S.documentTypeListItems(),
    ])

export const defaultDocumentNode = (S, {schemaType}) => {
  // Conditionally return a different configuration based on the schema type
  if (schemaType === 'page') {
    return S.document().views([
      S.view.form().icon(EditIcon),
      S.view
        .component(Iframe)
        .options({url: (doc) => getPreviewUrl(doc)})
        .icon(EarthGlobeIcon)
        .title('Preview'),
    ])
  }

  return S.document().views([S.view.form()])
}
