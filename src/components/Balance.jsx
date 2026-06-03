export const Balance = ({ value }) => {
    return (
        <div className="dot-grid rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 p-6 mb-6">
            <p className="text-sm font-medium text-stone-500 dark:text-slate-400 mb-1">Your Balance</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-stone-900 dark:text-slate-100">Rs {value}</span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Available</span>
            </div>
        </div>
    );
}