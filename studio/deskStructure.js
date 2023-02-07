import Iframe from 'sanity-plugin-iframe-pane'

// function getPreviewUrl(prev, {document}) {
//   const remoteURL = 'https://badger3000.com'
//   const localURL = 'http://localhost:8000'
//   const previewURL = window.location.hostname === 'localhost' ? localURL : remoteURL

//   if (document._type == 'page') {
//     return `${previewURL}/page-preview/${document._id}`
//   }

//   return prev
// }

// note: context includes `currentUser` and the client
export const deskStructure = (S, context) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Settings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      ...S.documentTypeListItems(),
    ])

export const defaultDocumentNode = (S, {schemaType, document}) => {
  // Conditionally return a different configuration based on the schema type
  if (schemaType === 'page' || schemaType === 'latest') {
    return S.document().views([
      S.view.form(),
      S.view.component(Iframe).options({url: 'http://localhost:8000'}).title('Preview'),
    ])
  }

  return S.document().views([S.view.form()])
}
