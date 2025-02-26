import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Default loading component
const DefaultLoading = () => (
  <div className="flex h-full w-full items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
)

export function lazyLoad(importFunc, LoadingComponent = DefaultLoading) {
  const LazyComponent = lazy(() => {
    return Promise.all([
      importFunc(),
      // Add a small delay to prevent flash of loading state
      new Promise(resolve => setTimeout(resolve, 100))
    ])
    .then(([moduleExports]) => moduleExports)
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