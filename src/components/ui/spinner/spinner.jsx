const Spinner = ({
    size = 16,
    color = "border-slate-700",
    className = "",
}) => {
    return (
        <span
            className={`border-2 ${color} border-t-transparent rounded-full animate-spin ${className}`}
            style={{ width: size, height: size }}
        />
    );
};

export default Spinner;