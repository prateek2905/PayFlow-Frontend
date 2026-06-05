import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const Appbar = ({ userName = "U", userInitial = "U" }) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const navLinks = [
        { label: "Home", path: "/dashboard" },
        { label: "Transactions", path: "/transactions" },
    ];

    return (
        <div className="h-14 flex justify-between items-center px-6 border-b border-stone-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-6">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/dashboard")}
                >
                    <span className="text-xl">💸</span>
                    <span className="font-bold text-base text-stone-900 dark:text-slate-100 tracking-tight">PayFlow</span>
                </div>
                <nav className="flex items-center gap-1">
                    {navLinks.map(link => (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                pathname === link.path
                                    ? "bg-stone-100 dark:bg-slate-800 text-stone-900 dark:text-slate-100 font-medium"
                                    : "text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-slate-100 hover:bg-stone-50 dark:hover:bg-slate-800/50"
                            }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500 dark:text-slate-400 hidden sm:block">
                    Hello, {userName}
                </span>
                <ThemeToggle />
                <button
                    onClick={() => navigate("/profile")}
                    title="Edit profile"
                    className="rounded-full h-8 w-8 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                >
                    {userInitial}
                </button>
                <button
                    onClick={() => { localStorage.removeItem("token"); navigate("/signin"); }}
                    className="text-sm text-stone-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};
