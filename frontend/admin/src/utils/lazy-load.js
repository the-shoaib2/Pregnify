import { lazy, Suspense } from 'react'

export function lazyLoad(importFunc, fallback = null) {
  const LazyComponent = lazy(importFunc)
  
  return function LazyLoadWrapper(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
} 