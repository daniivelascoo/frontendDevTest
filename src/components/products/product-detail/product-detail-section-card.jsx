const ProductDetailSectionCard = ({ title, children }) => (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <div className="mt-5">{children}</div>
    </article>
);

export default ProductDetailSectionCard;