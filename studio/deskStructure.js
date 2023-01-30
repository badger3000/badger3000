//import {WebPreview, JsonView} from './previews'

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

// export const defaultDocumentNode = (S, {schemaType}) => {
//   // Conditionally return a different configuration based on the schema type
//   if (schemaType === 'post') {
//     return S.document().views([S.view.form(), S.view.component(WebPreview).title('Web')])
//   }

//   return S.document().views([S.view.form(), S.view.component(JsonView).title('JSON')])
// }
