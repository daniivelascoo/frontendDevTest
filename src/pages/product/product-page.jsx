import { useParams } from "react-router";
import ProductDetailHero from "../../components/products/product-detail/product-detail-hero";
import ProductDetailGridSection from "../../components/products/product-detail/product-detail-grid-section";
import ProductPurchasePanel from "../../components/products/product-detail/product-purchase-panel";
import ProductPageState from "../../components/products/product-detail/product-page-state";
import { useProductDetail } from "../../hooks/product/use-product-detail";
import { useProductOptions } from "../../hooks/product/use-product-options";
import { useMemo } from "react";
import { getProductDetailSections, getProductHeroDetails } from "../../utils/mapper/product/product-detail.mapper";
import { useApi } from "../../hooks/api/use-api";
import { addProductCart } from "../../services/actions/add-product-cart";
import { useProducts } from "../../context/use-products";
import BackToLink from "../../components/ui/back-to-link/back-to-link";

const ProductPage = () => {
    const { productId } = useParams();
    const { isLoading: isAddingProduct,  query} = useApi({ fetchFunction: addProductCart });
    const { product, isLoading } = useProductDetail(productId);
    const { setCartCount } = useProducts();

    const {
        colorOptions,
        storageOptions,
        selectedColor,
        selectedStorage,
        selectedColorName,
        selectedStorageName,
        setSelectedColor,
        setSelectedStorage,
    } = useProductOptions(product);

    const heroDetails = useMemo(() => getProductHeroDetails(product), [product]);
    const sections = useMemo(() => getProductDetailSections(product), [product]);

    const handleAddProductToBasket = () => {
        const addProduct = async () => {

            const response = await query({
                id: product.id,
                colorCode: Number(selectedColor),
                storageCode: Number(selectedStorage)
            });

            // OJO: el API siempre devuelve 1 como count del carrito
            setCartCount(response.count);
        }

        addProduct();
    };

    if (!product) {
        return (
            <ProductPageState
                title="Producto no encontrado"
                description="No hemos podido localizar este producto."
                showSpinner={isLoading}
            />
        );
    }

    return (
        <section className="py-8">
            <BackToLink path={"/"} text={"Volver a productos"} />

            <div className="grid gap-8 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
                <div className="space-y-6">
                    <ProductDetailHero
                        product={product}
                        heroDetails={heroDetails}
                    />
                </div>

                <div className="space-y-6">
                    <ProductPurchasePanel
                        storageOptions={storageOptions}
                        colorOptions={colorOptions}
                        selectedStorage={selectedStorage}
                        selectedColor={selectedColor}
                        selectedStorageName={selectedStorageName}
                        selectedColorName={selectedColorName}
                        onStorageChange={setSelectedStorage}
                        onColorChange={setSelectedColor}
                        onAddToCart={handleAddProductToBasket}
                        addingProduct={isAddingProduct}
                    />

                    {sections.map((section) => (
                        <ProductDetailGridSection
                            key={section.title}
                            title={section.title}
                            items={section.items}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductPage;