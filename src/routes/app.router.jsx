import { createBrowserRouter, Navigate } from "react-router";

import ProductsLayout from "../components/layout/products-layout";
import SearchProductsPage from "../pages/search/search-products-page";
import ProductPage from "../pages/product/product-page";

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <ProductsLayout/>,
        children: [
            {
                index: true,
                element: <SearchProductsPage/>,
            },
            {
                path: 'product/:productId',
                element: <ProductPage/>,
            },
            {
                path: '*',
                element: <Navigate to={'/'} />
            }
        ]
    }
])

