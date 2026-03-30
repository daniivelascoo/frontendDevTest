import { RouterProvider } from 'react-router'

import { Toaster } from 'sonner'

import { appRouter } from './routes/app.router'
import ProductsContextProvider from './context/products-context-provider'

function App() {
  return (
    <ProductsContextProvider>
      <Toaster position='bottom-right' richColors />
      <RouterProvider router={appRouter}/>
    </ProductsContextProvider>
  )
}

export default App;
