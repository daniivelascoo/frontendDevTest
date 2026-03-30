import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const BackToLink = ({ path, text }) => {
    return (
        <Link
            to={path}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
            <ArrowLeft className="h-4 w-4" />
            {text}
        </Link>
    );
};

export default BackToLink;