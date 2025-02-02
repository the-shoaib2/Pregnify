import React from 'react'

export const ImageUploadProgress = ({ progress }) => (
  <div className="absolute bottom-0 left-0 right-0 p-1">
    <div className="w-full bg-muted/30 rounded-full h-1 overflow-hidden">
      <div 
        className="bg-primary h-full rounded-full transition-all duration-500 ease-in-out transform" 
        style={{ 
          width: `${progress}%`,
          transformOrigin: 'left',
          scale: progress > 0 ? '1' : '0'
        }}
      />
    </div>
  </div>
)

export default ImageUploadProgress
