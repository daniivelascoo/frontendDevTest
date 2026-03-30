import { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "../../components/products/product-card/product-card";
import CustomPagination from "../../components/pagination/custom-pagination";
import { useProductsPerPage } from "../../hooks/product/use-products-per-page";
import SearchBar from "../../components/search/search-bar";
import { useProducts } from "../../context/use-products";
import Spinner from "../../components/ui/spinner/spinner";

const SearchProductsPage = () => {
    const [search, setSearch] = useState("");
    const { products = [], isLoading, fetchProducts, currentPage, setCurrentPage } = useProducts();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const productsPerPage = useProductsPerPage({
        cardEstimatedHeight: 380,
        gridGap: 16,
        reservedHeight: 320,
    });

    const filteredProducts = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) return products;

        return products.filter((product) => {
            const brand = product.brand?.toLowerCase() || "";
            const model = product.model?.toLowerCase() || "";

            return brand.includes(searchValue) || model.includes(searchValue);
        });
    }, [products, search]);

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const safeCurrentPage =
        totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

    const paginatedProducts = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;

        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, safeCurrentPage, productsPerPage]);

    const handleSearch = useCallback((query) => {
        setSearch((prevSearch) => {
            if (prevSearch === query) return prevSearch;

            setCurrentPage(1);
            return query;
        });
    }, [setCurrentPage]);

    return (
        <section className="flex flex-col gap-8 bg-gradient-to-b from-slate-50 to-white px-4 py-6 md:px-6">
            <SearchBar
                placeholder="Buscar producto..."
                onSearch={handleSearch}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 md:max-w-md"
            />

            {isLoading ? (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <Spinner size={32} />
                    <p className="mt-4 text-sm font-medium text-slate-700">
                        Cargando productos...
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Estamos preparando el catálogo para ti
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Resultados</p>
                            <p className="text-base font-semibold text-slate-900">
                                Mostrando <span className="text-slate-700">{paginatedProducts.length}</span> de{" "}
                                <span className="text-slate-700">{filteredProducts.length}</span> productos
                            </p>
                        </div>

                        {search.trim() && (
                            <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                Búsqueda: {search}
                            </span>
                        )}
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white text-center shadow-sm">
                            <p className="text-lg font-semibold text-slate-900">
                                No hemos encontrado productos
                            </p>
                            <p className="mt-2 max-w-md text-sm text-slate-500">
                                Prueba con otra marca o modelo para ver más resultados.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                                {paginatedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center pt-2">
                                    <CustomPagination
                                        currentPage={safeCurrentPage}
                                        onPageChange={setCurrentPage}
                                        totalPages={totalPages}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </section>
    );
};

export default SearchProductsPage;