import React from 'react'

export default ({images}) =>
  <main className="image-grid">
    {images.map(img =>
      <div key={img} className="image-grid--container">
        <img src={img}/>
      </div>
    )}
  </main>;
