import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Default loading component
const DefaultLoading = () => (
  <div className="flex h-full w-full items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
)

export function lazyLoad(importFunc, options = {}) {
  const {
    LoadingComponent = DefaultLoading,
    minDelay = 100, // Minimum delay to prevent flash
    timeout = 10000  // Maximum time to wait before showing error
  } = options

  const LazyComponent = lazy(() => {
    return Promise.race([
      Promise.all([
        importFunc(),
        new Promise(resolve => setTimeout(resolve, minDelay))
      ]).then(([moduleExports]) => moduleExports),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Loading timeout')), timeout)
      )
    ])
  })
  
  return function LazyLoadWrapper(props) {
    return (
      <Suspense fallback={<LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Named export for better tree-shaking
export default lazyLoad 