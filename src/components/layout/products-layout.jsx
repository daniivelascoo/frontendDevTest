import { Outlet } from "react-router";
import ProductsHeader from "../products/products-header/products-header";

const ProductsLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <div className="mx-auto max-w-[1600px] px-6">
                <ProductsHeader />
                <Outlet />
            </div>
        </div>
    );
};

export default ProductsLayout;