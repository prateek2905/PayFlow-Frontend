import { Link } from "react-router-dom";

export function BottomWarning({ label, buttonText, to }) {
    return (
        <div className="py-3 text-sm flex justify-center gap-1 text-stone-500 dark:text-slate-400">
            <span>{label}</span>
            <Link className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline" to={to}>
                {buttonText}
            </Link>
        </div>
    );
}
  