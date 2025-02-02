import { FiLink, FiX, FiPlus } from 'react-icons/fi'
import { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'

export const ImageUrlInputs = ({ urls = [], onChange, maxUrls = 5 }) => {
  const [localUrls, setLocalUrls] = useState(urls)

  // Sync local state with props
  useEffect(() => {
    setLocalUrls(urls)
  }, [urls])

  // Handle URL change
  const handleUrlChange = useCallback((index, value) => {
    const newUrls = [...localUrls]
    newUrls[index] = value

    // If this is the last input and it's not empty, add a new empty input
    if (index === newUrls.length - 1 && value && newUrls.length < maxUrls) {
      newUrls.push('')
    }

    setLocalUrls(newUrls)
    // Make sure onChange is a function before calling it
    if (typeof onChange === 'function') {
      onChange(newUrls.filter(url => url))
    }
  }, [localUrls, maxUrls, onChange])

  // Handle URL removal
  const removeUrl = useCallback((index) => {
    const newUrls = localUrls.filter((_, i) => i !== index)
    setLocalUrls(newUrls)
    onChange(newUrls.filter(url => url))
  }, [localUrls, onChange])

  // Ensure we always have at least one input field
  const displayUrls = localUrls.length === 0 ? [''] : 
    localUrls.length < maxUrls && localUrls[localUrls.length - 1] ? [...localUrls, ''] : localUrls

  return (
    <div className="space-y-2">
      {displayUrls.map((url, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="relative flex-1">
            <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(index, e.target.value)}
              placeholder={`Image URL ${index + 1}`}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm 
                focus:ring-2 focus:ring-primary/20 focus:border-primary 
                transition-all"
            />
          </div>

          <div className="flex items-center gap-1">
            {/* Remove button - show if URL exists or not the last empty input */}
            {(url || index !== displayUrls.length - 1) && (
              <button
                type="button"
                onClick={() => removeUrl(index)}
                className="p-2 text-gray-400 hover:text-gray-600 
                  rounded-md hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}

            {/* Add button - show only on the last input if not at max */}
            {index === displayUrls.length - 1 && displayUrls.length < maxUrls && url && (
              <button
                type="button"
                onClick={() => handleUrlChange(displayUrls.length, '')}
                className="p-2 text-primary hover:text-primary/80 
                  rounded-md hover:bg-primary/10 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* URL counter */}
      <div className="text-xs text-gray-500">
        {localUrls.filter(Boolean).length} of {maxUrls} URLs added
      </div>
    </div>
  )
}

// Add prop types validation
ImageUrlInputs.propTypes = {
  urls: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  maxUrls: PropTypes.number
} 