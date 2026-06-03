import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const Appbar = ({ userName = "U", userInitial = "U" }) => {
    const navigate = useNavigate();
    return (
        <div className="h-16 flex justify-between items-center px-6 border-b border-stone-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <span className="text-2xl">💸</span>
                <span className="font-bold text-lg text-stone-900 dark:text-slate-100 tracking-tight">PayFlow</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500 dark:text-slate-400">Hello, {userName}</span>
                <ThemeToggle />
                <button
                    onClick={() => navigate("/profile")}
                    title="Edit profile"
                    className="rounded-full h-9 w-9 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                >
                    {userInitial}
                </button>
            </div>
        </div>
    );
}