import React from 'react'
import PropTypes from 'prop-types'
import GalleryItem from './GalleryItem'

import { DEFAULT_IMAGES } from '../constants/defaultImages'

const Gallery = ({ images = DEFAULT_IMAGES }) => {
  return (
    <>
      {images && (
        <div className="row">
          {images.map((image, index) => {
            return (
              <GalleryItem
                key={index}
                id={image.id}
                link={image.link}
                thumbnail={image.thumbnail}
                caption={image.caption}
                description={image.description}
              />
            )
          })}
        </div>
      )}
    </>
  )
}

Gallery.displayName = 'Gallery'
Gallery.propTypes = {
  images: PropTypes.array,
}

export default Gallery
