import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import Image from '../../Image'

const GalleryItem = ({
  id,
  source,
  thumbnail,
  caption,
  description,
  toggleLightbox,
}) => {
  const onClick = useCallback(
    (e) => {
      e.preventDefault()
      toggleLightbox()
    },
    [toggleLightbox]
  )

  return (
    <article id={id} className="6u 12u$(xsmall) work-item">
      <a className="image fit thumb" href={source} onClick={onClick}>
        <Image filename={thumbnail} alt={caption} />
      </a>
      <h3>{caption}</h3>
      <p>{description}</p>
    </article>
  )
}

GalleryItem.displayName = 'GalleryItem'
GalleryItem.propTypes = {
  id: PropTypes.string.isRequired,
  source: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  caption: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  toggleLightbox: PropTypes.func.isRequired,
}

export default GalleryItem
