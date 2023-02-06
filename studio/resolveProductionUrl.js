const remoteURL = 'https://cms.badger3000.com'
const localURL = 'http://localhost:8000'
const previewURL = window.location.hostname === 'localhost' ? localURL : remoteURL

export default function resolveProductionUrl(document) {
  return `${previewURL}/${document.slug.current}`
}
