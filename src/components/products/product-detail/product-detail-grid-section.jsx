import ProductDetailCard from "./product-detail-card";
import ProductDetailSectionCard from "./product-detail-section-card";

const ProductDetailGridSection = ({ title, items }) => {
    return (
        <ProductDetailSectionCard title={title}>
            <dl className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                    <ProductDetailCard
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                    />
                ))}
            </dl>
        </ProductDetailSectionCard>
    );
};

export default ProductDetailGridSection;