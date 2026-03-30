const ProductDetailCard = ({ label, value, icon: Icon }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-start gap-3">
            {Icon && (
                <div className="rounded-xl bg-white p-2 shadow-sm">
                    <Icon className="h-4 w-4 text-slate-600" />
                </div>
            )}

            <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {label}
                </dt>
                <dd className="mt-1 break-words text-sm font-medium text-slate-900">
                    {value || "No disponible"}
                </dd>
            </div>
        </div>
    </div>
);

export default ProductDetailCard;