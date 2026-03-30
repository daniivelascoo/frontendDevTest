import { Check } from "lucide-react";
import ProductDetailSectionCard from "./product-detail-section-card";
import Spinner from "../../ui/spinner/spinner";

const ProductPurchasePanel = ({
    storageOptions,
    colorOptions,
    selectedStorage,
    selectedColor,
    selectedStorageName,
    selectedColorName,
    onStorageChange,
    onColorChange,
    onAddToCart,
    addingProduct
}) => {
    return (
        <ProductDetailSectionCard title="Configuración y compra">
            <div className="space-y-6">
                <div>
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                        Almacenamiento
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {storageOptions.map((storage) => {
                            const isSelected =
                                String(storage.code) === selectedStorage;

                            return (
                                <button
                                    key={storage.code}
                                    type="button"
                                    onClick={() => onStorageChange(String(storage.code))}
                                    className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${isSelected
                                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                                        }`}
                                >
                                    {storage.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                        Color
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {colorOptions.map((color) => {
                            const isSelected =
                                String(color.code) === selectedColor;

                            return (
                                <button
                                    key={color.code}
                                    type="button"
                                    onClick={() => onColorChange(String(color.code))}
                                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition ${isSelected
                                            ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                            : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
                                        }`}
                                >
                                    {isSelected && <Check className="h-4 w-4" />}
                                    {color.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p>
                        <span className="font-semibold text-slate-900">
                            Selección actual:
                        </span>{" "}
                        {selectedStorageName} · {selectedColorName}
                    </p>
                </div>

                <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 flex items-center justify-center gap-2"
                    onClick={onAddToCart}
                    disabled={addingProduct}
                >
                    {addingProduct ? (
                        <Spinner color="border-white" />
                    ) : (
                        "Añadir al carrito"
                    )}
                </button>
            </div>
        </ProductDetailSectionCard>
    );
};

export default ProductPurchasePanel;