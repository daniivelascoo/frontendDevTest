import { Link } from "react-router";

const ProductCard = ({ product }) => {
    return (
        <Link
            to={`/product/${product.id}`}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
            <div className="aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                <img
                    src={product.imgUrl}
                    alt={`${product.brand} ${product.model}`}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
            </div>

            <div className="space-y-3 p-5 bg-slate-50/80">
                <p className="text-sm font-medium text-slate-500">
                    {product.brand}
                </p>

                <h2 className="min-h-[56px] line-clamp-2 text-lg font-semibold leading-tight text-slate-900">
                    {product.model}
                </h2>

                <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold tracking-tight text-slate-900">
                        {product.price} €
                    </p>

                    <span className="text-sm font-medium text-slate-400 transition group-hover:text-slate-700">
                        Ver detalle →
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;