const ProductDetailHero = ({ product, heroDetails }) => {
    return (
        <article className="sticky top-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <img
                    src={product.imgUrl}
                    alt={`${product.brand} ${product.model}`}
                    className="mx-auto max-h-[420px] w-full object-contain"
                />
            </div>

            <div className="mt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">
                            {product.brand}
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                            {product.model}
                        </h1>
                    </div>

                    <div className="rounded-2xl bg-slate-900 px-4 py-2 text-right text-white shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-300">
                            Precio
                        </p>
                        <p className="text-2xl font-bold">{product.price} €</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    {heroDetails.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {item.label}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
};

export default ProductDetailHero;