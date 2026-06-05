import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Appbar } from "../components/Appbar";
import { Users } from "../components/Users";
import { useTheme } from "../context/ThemeContext";
import { mockTransactions, BUDGETS, BAR_DATA, TAG_STYLES, mapApiTransaction } from "../data/mockTransactions";

// ── Donut chart (SVG, r=35, C≈219.91) ──────────────────────────────────────
// Segments: Rent 42%, Food 23%, Transport 17%, Health 11%, Others 7%
// dashoffset formula: -(sum_of_prev_arcs - C/4) where C/4 = 54.98
const DONUT_SEGMENTS = [
    { color: "#292524", dashArray: "92.36 127.55", dashOffset:  54.98 },
    { color: "#059669", dashArray: "50.58 169.33", dashOffset: -37.38 },
    { color: "#d97706", dashArray: "37.39 182.52", dashOffset: -87.96 },
    { color: "#e11d48", dashArray: "24.19 195.72", dashOffset: -125.35 },
    { color: "#d6d3d1", dashArray: "15.39 204.52", dashOffset: -149.54 },
];
const DONUT_LEGEND = [
    { label: "Rent",      pct: "42%", color: "#292524" },
    { label: "Food",      pct: "23%", color: "#059669" },
    { label: "Transport", pct: "17%", color: "#d97706" },
    { label: "Health",    pct: "11%", color: "#e11d48" },
    { label: "Others",    pct:  "7%", color: "#d6d3d1" },
];

function DonutChart() {
    const { theme } = useTheme();
    const bgStroke = theme === "dark" ? "#1e293b" : "#e7e5e4";
    const textFill = theme === "dark" ? "#f1f5f9" : "#1c1917";
    return (
        <div>
            <p className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-4">By category</p>
            <div className="flex items-center gap-6">
                <svg width="96" height="96" viewBox="0 0 96 96" className="flex-shrink-0">
                    <circle cx="48" cy="48" r="35" fill="none" stroke={bgStroke} strokeWidth="12" />
                    {DONUT_SEGMENTS.map((s, i) => (
                        <circle
                            key={i}
                            cx="48" cy="48" r="35"
                            fill="none"
                            stroke={s.color}
                            strokeWidth="12"
                            strokeDasharray={s.dashArray}
                            strokeDashoffset={s.dashOffset}
                        />
                    ))}
                    <text x="48" y="52" textAnchor="middle" fontSize="10" fontWeight="600" fill={textFill}>
                        ₹28k
                    </text>
                </svg>
                <div className="flex flex-col gap-2 flex-1">
                    {DONUT_LEGEND.map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                            <span className="flex-1 text-stone-600 dark:text-slate-400">{item.label}</span>
                            <span className="font-mono text-stone-400 dark:text-slate-500">{item.pct}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BarChart() {
    const max = Math.max(...BAR_DATA);
    const days = Array.from({ length: 14 }, (_, i) => i + 18);
    return (
        <div>
            <p className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-4">Daily spending</p>
            <div className="flex items-end gap-1 h-24">
                {BAR_DATA.map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div
                            className="w-full rounded-t bg-stone-200 dark:bg-slate-700 hover:bg-stone-800 dark:hover:bg-emerald-500 transition-colors cursor-default"
                            style={{ height: `${Math.round((val / max) * 80)}px` }}
                            title={`₹${val * 100}`}
                        />
                        <span className="font-mono text-[9px] text-stone-400 dark:text-slate-600">{days[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatCard({ label, value, delta, deltaClass }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-medium text-stone-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-slate-100 tracking-tight">{value}</p>
            {delta && <p className={`text-xs mt-1 ${deltaClass || "text-stone-400 dark:text-slate-500"}`}>{delta}</p>}
        </div>
    );
}

function BudgetCard({ tag, spent, total, pct, bar, text, dot }) {
    const isOver = pct >= 100;
    const isWarn = pct >= 90 && !isOver;
    const remaining = total - spent;
    return (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className={`text-sm font-medium ${text}`}>{tag}</span>
                </div>
                <span className="font-mono text-xs text-stone-500 dark:text-slate-400">
                    ₹{spent.toLocaleString("en-IN")}
                </span>
            </div>
            <div className="h-1 bg-stone-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                <div
                    className={`h-full rounded-full transition-all ${isOver ? "bg-rose-500" : bar}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                />
            </div>
            <div className="flex justify-between text-[11px] text-stone-400 dark:text-slate-500">
                <span>Budget: ₹{total.toLocaleString("en-IN")}</span>
                <span className={isOver ? "text-rose-500" : isWarn ? "text-amber-500" : ""}>
                    {isOver ? "Over budget" : isWarn ? "⚠ Low" : `${pct}% used`}
                </span>
            </div>
            {!isOver && (
                <p className="text-[11px] text-stone-400 dark:text-slate-500 mt-0.5">
                    ₹{remaining.toLocaleString("en-IN")} remaining
                </p>
            )}
        </div>
    );
}

function TxRow({ tx }) {
    const style = TAG_STYLES[tx.tag] || TAG_STYLES.other;
    const isCredit = tx.amount > 0;
    return (
        <div className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${style.bg}`}>
                {tx.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 dark:text-slate-200 truncate">{tx.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                        {tx.tag}
                    </span>
                    <span className="text-[11px] text-stone-400 dark:text-slate-500">{tx.dateLabel}</span>
                </div>
            </div>
            <span className={`font-mono text-sm font-semibold flex-shrink-0 ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {isCredit ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
            </span>
        </div>
    );
}

export const Dashboard = () => {
    const [balance, setBalance] = useState(null);
    const [user, setUser] = useState({ firstName: "", lastName: "" });
    const [recentTx, setRecentTx] = useState([]);
    const navigate = useNavigate();
    const authHeader = { Authorization: "Bearer " + localStorage.getItem("token") };

    const spent = mockTransactions
        .filter(t => t.tag !== "income" && t.dateLabel.startsWith("May"))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/account/balance", { headers: authHeader })
            .then(res => setBalance(res.data.balance)).catch(() => {});
        axios.get("http://localhost:3000/api/v1/user/me", { headers: authHeader })
            .then(res => setUser(res.data)).catch(() => navigate("/signin"));
        axios.get("http://localhost:3000/api/v1/account/transactions", { headers: authHeader })
            .then(res => setRecentTx(res.data.transactions.slice(0, 5).map(mapApiTransaction)))
            .catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950">
            <Appbar
                userName={user.firstName || "..."}
                userInitial={(user.firstName?.[0] || "U").toUpperCase()}
            />

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Greeting */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-slate-100">
                        Good morning, {user.firstName || "..."}
                    </h1>
                    <p className="text-sm text-stone-400 dark:text-slate-500 mt-0.5">
                        May 2025 · {mockTransactions.length} transactions
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <StatCard
                        label="Balance"
                        value={balance !== null ? `₹${balance.toLocaleString("en-IN")}` : "..."}
                        delta="Available"
                        deltaClass="text-emerald-600 dark:text-emerald-400 font-medium"
                    />
                    <StatCard
                        label="Spent this month"
                        value={`₹${spent.toLocaleString("en-IN")}`}
                        delta="↑ 12% from last month"
                        deltaClass="text-rose-500"
                    />
                    <StatCard
                        label="Income"
                        value="₹85,000"
                        delta="↑ stable"
                        deltaClass="text-emerald-600 dark:text-emerald-400"
                    />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-5">
                        <BarChart />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-5">
                        <DonutChart />
                    </div>
                </div>

                {/* Send money */}
                <div className="mb-6">
                    <Users />
                </div>

                {/* Budget cards */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Tag budgets</h2>
                        <button
                            onClick={() => navigate("/transactions")}
                            className="text-xs text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors"
                        >
                            All transactions →
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {BUDGETS.map(b => <BudgetCard key={b.tag} {...b} />)}
                    </div>
                </div>

                {/* Recent transactions */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider">Recent</h2>
                        <button
                            onClick={() => navigate("/transactions")}
                            className="text-xs text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors"
                        >
                            See all →
                        </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-stone-100 dark:divide-slate-800">
                        {recentTx.length > 0
                            ? recentTx.map(tx => <TxRow key={tx.id} tx={tx} />)
                            : <p className="text-center text-stone-400 dark:text-slate-500 text-sm py-8">No transactions yet. Send money to get started.</p>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};
