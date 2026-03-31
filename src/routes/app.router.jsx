import { createBrowserRouter, Navigate } from "react-router";

import ProductsLayout from "../components/layout/products-layout";
import ProductListPage from "../pages/search/product-list-page";
import ProductPage from "../pages/product/product-page";

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <ProductsLayout/>,
        children: [
            {
                index: true,
                element: <ProductListPage/>,
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

