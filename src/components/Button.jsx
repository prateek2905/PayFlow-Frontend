

export function Button({ label, onClick }) {
    return (
        <button
            onClick={onClick}
            type="button"
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors shadow-sm"
        >
            {label}
        </button>
    );
}
  