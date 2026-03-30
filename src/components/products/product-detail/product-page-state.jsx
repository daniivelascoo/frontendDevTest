import BackToLink from "../../ui/back-to-link/back-to-link";
import Spinner from "../../ui/spinner/spinner";

const ProductPageState = ({ title, description, showSpinner = false }) => {
    return (
        <section className="py-8">
            <BackToLink path={"/"} text={"Volver a productos"} />

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
                {!showSpinner && (
                    <>
                        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
                        <p className="mt-2 text-slate-500">{description}</p>
                    </>
                )}

                {showSpinner && (
                    <div className="mt-6 flex justify-center">
                        <Spinner size={28} />
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductPageState;