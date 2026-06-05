import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Appbar } from "../components/Appbar";
import { TAG_STYLES, mapApiTransaction } from "../data/mockTransactions";

const FILTERS = [
    { id: "all",    label: "All" },
    { id: "debit",  label: "Debits" },
    { id: "credit", label: "Credits" },
];

function TxRow({ tx }) {
    const tagKey = tx.tag?.toLowerCase();
    const style = TAG_STYLES[tagKey] || { text: 'text-stone-500 dark:text-slate-400', bg: 'bg-stone-100 dark:bg-slate-700/50' };
    const isCredit = tx.amount > 0;
    return (
        <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${style.bg}`}>
                {tx.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 dark:text-slate-200 truncate">{tx.name}</p>
                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 ${style.bg} ${style.text}`}>
                    {tx.tag}
                </span>
            </div>
            <span className={`font-mono text-sm font-semibold flex-shrink-0 ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {isCredit ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
            </span>
        </div>
    );
}

export const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/account/transactions", {
            headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        })
            .then(res => setTransactions(res.data.transactions.map(mapApiTransaction)))
            .catch(err => { if (err.response?.status === 401) navigate("/signin"); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        return transactions.filter(tx => {
            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "debit"  && tx.amount < 0) ||
                (activeFilter === "credit" && tx.amount > 0);
            const matchesSearch =
                !search ||
                tx.name.toLowerCase().includes(search.toLowerCase()) ||
                tx.tag.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [transactions, search, activeFilter]);

    const grouped = useMemo(() => {
        const map = {};
        filtered.forEach(tx => {
            if (!map[tx.dateLabel]) map[tx.dateLabel] = [];
            map[tx.dateLabel].push(tx);
        });
        return Object.entries(map);
    }, [filtered]);

    const totalExpenses = filtered.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalIncome = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950">
            <Appbar />

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-slate-100">Transactions</h1>
                    <p className="text-sm text-stone-400 dark:text-slate-500 mt-0.5">Your payment history</p>
                </div>

                {/* Summary strip */}
                <div className="flex gap-3 mb-5 flex-wrap">
                    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-2">
                        <span className="text-xs text-stone-400 dark:text-slate-500 uppercase tracking-wider font-medium">Showing</span>
                        <span className="font-mono text-sm font-semibold text-stone-800 dark:text-slate-200">{filtered.length}</span>
                    </div>
                    {totalExpenses > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-2">
                            <span className="text-xs text-stone-400 dark:text-slate-500 uppercase tracking-wider font-medium">Debited</span>
                            <span className="font-mono text-sm font-semibold text-rose-600 dark:text-rose-400">₹{totalExpenses.toLocaleString("en-IN")}</span>
                        </div>
                    )}
                    {totalIncome > 0 && (
                        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl px-4 py-3 flex items-center gap-2">
                            <span className="text-xs text-stone-400 dark:text-slate-500 uppercase tracking-wider font-medium">Credited</span>
                            <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{totalIncome.toLocaleString("en-IN")}</span>
                        </div>
                    )}
                </div>

                {/* Search + filter */}
                <div className="flex gap-2 mb-5 flex-wrap items-center">
                    <div className="relative flex-1 min-w-48">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name or tag…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-stone-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                    </div>
                    {FILTERS.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                activeFilter === f.id
                                    ? "bg-stone-900 dark:bg-slate-100 text-white dark:text-slate-900 border-stone-900 dark:border-slate-100"
                                    : "bg-white dark:bg-slate-900 text-stone-500 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:border-stone-400"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                        <p className="text-stone-400 dark:text-slate-500 text-sm">Loading…</p>
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                        <p className="text-stone-400 dark:text-slate-500 text-sm">
                            {transactions.length === 0 ? "No transactions yet. Send money to get started." : "No transactions match your filter."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {grouped.map(([dateLabel, txs]) => (
                            <div key={dateLabel}>
                                <p className="text-[11px] font-semibold text-stone-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
                                    {dateLabel}
                                </p>
                                <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-stone-100 dark:divide-slate-800">
                                    {txs.map(tx => <TxRow key={tx.id} tx={tx} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
