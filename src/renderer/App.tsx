import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router-dom'
import { FallbackComponent } from './components/Fallback'
import { router } from './routers'

function App() {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}

export default App
