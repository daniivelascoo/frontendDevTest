import { Link, useLocation, useParams } from "react-router";
import { useMemo } from "react";
import { useProducts } from "../../../context/use-products";
import { ShoppingCart } from "lucide-react";

const ProductsHeader = () => {
  const { products = [], cartCount } = useProducts();
  const location = useLocation();
  const { productId } = useParams();

  const breadcrumb = useMemo(() => {
    if (location.pathname === "/") return null;
    if (!productId || !products.length) return null;

    const product = products.find((p) => String(p.id) === String(productId));

    if (!product) return null;

    return `${product.brand} - ${product.model}`;
  }, [location.pathname, products, productId]);

  return (
    <header className="sticky top-0 z-10 border-b border-black-200 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-4 text-white">

        <div className="space-y-1">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Tienda de Móviles
          </Link>

          <nav className="text-sm text-slate-900/80 text-white">
            <Link to="/" className="hover:text-slate-900">
              Inicio
            </Link>

            {breadcrumb && (
              <>
                <span className="mx-2">/</span>
                <span>{breadcrumb}</span>
              </>
            )}
          </nav>
        </div>

        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-slate-500 backdrop-blur transition hover:bg-white/20">
            <ShoppingCart className="h-5 w-5" />
          </div>

          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow">
              {cartCount}
            </span>
          )}
        </div>

      </div>
    </header>
  );
};

export default ProductsHeader;