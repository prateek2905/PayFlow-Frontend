import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Appbar } from "../components/Appbar";
import { Users } from "../components/Users";
import { useTheme } from "../context/ThemeContext";
import { TAG_STYLES, mapApiTransaction } from "../data/mockTransactions";

const SVG_R = 35;
const SVG_C = 2 * Math.PI * SVG_R; // ≈ 219.91

// Colors for known tags + overflow palette for custom tags
const KNOWN_COLORS = {
  food: "#059669", rent: "#292524", transport: "#d97706", health: "#e11d48",
};
const PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16"];
function tagColor(name, idx) {
  return KNOWN_COLORS[name?.toLowerCase()] || PALETTE[idx % PALETTE.length];
}

// Build SVG donut segments from [{name, value}] sorted by value desc
function buildSegments(categories) {
  const total = categories.reduce((s, c) => s + c.value, 0);
  if (total === 0) return [];
  let accumulated = 0;
  return categories.map((cat, i) => {
    const arc = (cat.value / total) * SVG_C;
    const dashOffset = -(accumulated - SVG_C / 4);
    accumulated += arc;
    return {
      name: cat.name,
      color: tagColor(cat.name, i),
      pct: Math.round((cat.value / total) * 100),
      dashArray: `${arc.toFixed(2)} ${(SVG_C - arc).toFixed(2)}`,
      dashOffset: dashOffset.toFixed(2),
    };
  });
}

// Build last-14-days daily spending array from transactions
function buildLast14(transactions) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return { date: d, label: String(d.getDate()), value: 0 };
  });
  transactions.forEach(tx => {
    if (tx.amount >= 0) return;
    const txDate = new Date(tx.isoDate);
    txDate.setHours(0, 0, 0, 0);
    const slot = days.find(d => d.date.getTime() === txDate.getTime());
    if (slot) slot.value += Math.abs(tx.amount);
  });
  return days;
}

// ── Presentational components ─────────────────────────────────────────────

function BarChart({ dailyData }) {
  const max = Math.max(...dailyData.map(d => d.value), 1);
  return (
    <div>
      <p className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-4">Daily spending</p>
      <div className="flex items-end gap-1 h-24">
        {dailyData.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-t transition-colors cursor-default ${
                day.value > 0
                  ? "bg-stone-300 dark:bg-slate-600 hover:bg-stone-800 dark:hover:bg-emerald-500"
                  : "bg-stone-100 dark:bg-slate-800"
              }`}
              style={{ height: `${Math.max(Math.round((day.value / max) * 80), day.value > 0 ? 3 : 2)}px` }}
              title={day.value > 0 ? `₹${day.value.toLocaleString("en-IN")}` : "No spending"}
            />
            <span className="font-mono text-[9px] text-stone-400 dark:text-slate-600">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ segments, totalSpent }) {
  const { theme } = useTheme();
  const bgStroke = theme === "dark" ? "#1e293b" : "#e7e5e4";
  const textFill = theme === "dark" ? "#f1f5f9" : "#1c1917";
  const centerLabel = totalSpent >= 1000
    ? `₹${Math.round(totalSpent / 1000)}k`
    : `₹${totalSpent}`;

  return (
    <div>
      <p className="text-xs font-medium text-stone-500 dark:text-slate-400 uppercase tracking-wider mb-4">By category</p>
      <div className="flex items-center gap-6">
        <svg width="96" height="96" viewBox="0 0 96 96" className="flex-shrink-0">
          <circle cx="48" cy="48" r={SVG_R} fill="none" stroke={bgStroke} strokeWidth="12" />
          {segments.map((s, i) => (
            <circle
              key={i} cx="48" cy="48" r={SVG_R}
              fill="none" stroke={s.color} strokeWidth="12"
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
            />
          ))}
          <text x="48" y="52" textAnchor="middle" fontSize="10" fontWeight="600" fill={textFill}>
            {segments.length > 0 ? centerLabel : "₹0"}
          </text>
        </svg>
        <div className="flex flex-col gap-2 flex-1 overflow-hidden">
          {segments.length > 0 ? segments.map(s => (
            <div key={s.name} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="flex-1 text-stone-600 dark:text-slate-400 truncate capitalize">{s.name}</span>
              <span className="font-mono text-stone-400 dark:text-slate-500">{s.pct}%</span>
            </div>
          )) : (
            <p className="text-xs text-stone-400 dark:text-slate-500">No spending data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, deltaClass, onDeltaClick }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-5">
      <p className="text-xs font-medium text-stone-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-2xl font-bold text-stone-900 dark:text-slate-100 tracking-tight">{value}</p>
      {delta && (
        <p
          className={`text-xs mt-1 ${deltaClass || "text-stone-400 dark:text-slate-500"} ${onDeltaClick ? "cursor-pointer hover:underline" : ""}`}
          onClick={onDeltaClick}
        >
          {delta}
        </p>
      )}
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
  const tagKey = tx.tag?.toLowerCase();
  const style = TAG_STYLES[tagKey] || { text: "text-stone-500 dark:text-slate-400", bg: "bg-stone-100 dark:bg-slate-700/50" };
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

// ── Main component ────────────────────────────────────────────────────────

export const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [user, setUser] = useState({ firstName: "", lastName: "", monthlyIncome: 0 });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const navigate = useNavigate();
  const authHeader = { Authorization: "Bearer " + localStorage.getItem("token") };

  useEffect(() => {
    axios.get("http://localhost:3000/api/v1/account/balance", { headers: authHeader })
      .then(res => setBalance(res.data.balance)).catch(() => {});
    axios.get("http://localhost:3000/api/v1/user/me", { headers: authHeader })
      .then(res => setUser(res.data)).catch(() => navigate("/signin"));
    axios.get("http://localhost:3000/api/v1/account/transactions", { headers: authHeader })
      .then(res => setTransactions(res.data.transactions.map(mapApiTransaction)))
      .catch(() => {});
    axios.get("http://localhost:3000/api/v1/budgets", { headers: authHeader })
      .then(res => setBudgets(res.data.budgets)).catch(() => {});
  }, []);

  // ── Derived stats ───────────────────────────────────────────────────────
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const monthName = now.toLocaleString("en-IN", { month: "long" });

  const spentThisMonth = transactions
    .filter(tx => {
      if (tx.amount >= 0) return false;
      const d = new Date(tx.isoDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const income = user.monthlyIncome || 0;
  const savings = income - spentThisMonth;

  const dailyData = buildLast14(transactions);

  const catMap = {};
  transactions.forEach(tx => {
    if (tx.amount < 0) {
      const d = new Date(tx.isoDate);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        const key = tx.tag || "other";
        catMap[key] = (catMap[key] || 0) + Math.abs(tx.amount);
      }
    }
  });
  const segments = buildSegments(
    Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950">
      <Appbar
        userName={user.firstName || "..."}
        userInitial={(user.firstName?.[0] || "U").toUpperCase()}
      />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-slate-100">
            Good morning, {user.firstName || "..."}
          </h1>
          <p className="text-sm text-stone-400 dark:text-slate-500 mt-0.5">
            {monthName} {thisYear} · {transactions.length} transactions
          </p>
        </div>

        {/* 4-card stat row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Balance"
            value={balance !== null ? `₹${balance.toLocaleString("en-IN")}` : "..."}
            delta="Available"
            deltaClass="text-emerald-600 dark:text-emerald-400 font-medium"
          />
          <StatCard
            label="Spent this month"
            value={`₹${spentThisMonth.toLocaleString("en-IN")}`}
            delta={spentThisMonth > 0 ? "Debited" : "No spending yet"}
            deltaClass="text-rose-500"
          />
          <StatCard
            label="Monthly income"
            value={income > 0 ? `₹${income.toLocaleString("en-IN")}` : "Not set"}
            delta={income > 0 ? "Set in profile" : "Add in profile →"}
            deltaClass={income > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}
            onDeltaClick={income === 0 ? () => navigate("/profile") : undefined}
          />
          <StatCard
            label="Savings"
            value={income > 0 ? `₹${Math.abs(savings).toLocaleString("en-IN")}` : "—"}
            delta={income > 0 ? (savings >= 0 ? "Saved this month" : "Over budget") : "Set income first"}
            deltaClass={savings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-5">
            <BarChart dailyData={dailyData} />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-5">
            <DonutChart segments={segments} totalSpent={spentThisMonth} />
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
              onClick={() => navigate("/profile")}
              className="text-xs text-stone-400 dark:text-slate-500 hover:text-stone-700 dark:hover:text-slate-300 transition-colors"
            >
              Edit budgets →
            </button>
          </div>
          {budgets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-6 text-center">
              <p className="text-sm text-stone-400 dark:text-slate-500">No budgets set yet.</p>
              <button
                onClick={() => navigate("/profile")}
                className="mt-2 text-xs text-amber-500 hover:underline"
              >
                Set tag budgets in Profile →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {budgets.map(b => {
                const tagName = b.tag?.name || "other";
                const tagKey = tagName.toLowerCase();
                const style = TAG_STYLES[tagKey] || TAG_STYLES.other;
                const spent = catMap[tagKey] || 0;
                const pct = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
                return (
                  <BudgetCard
                    key={b._id}
                    tag={tagName}
                    spent={spent}
                    total={b.amount}
                    pct={pct}
                    bar={style.bar}
                    text={style.text}
                    dot={style.bar}
                  />
                );
              })}
            </div>
          )}
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
            {transactions.length > 0
              ? transactions.slice(0, 5).map(tx => <TxRow key={tx.id} tx={tx} />)
              : <p className="text-center text-stone-400 dark:text-slate-500 text-sm py-8">No transactions yet. Send money to get started.</p>
            }
          </div>
        </div>
      </div>
    </div>
  );
};
