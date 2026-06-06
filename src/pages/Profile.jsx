import BASE_URL from '../api';
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { ThemeToggle } from "../components/ThemeToggle";

export const Profile = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [monthlyIncome, setMonthlyIncome] = useState("");
    const [status, setStatus] = useState(null);
    const [error, setError] = useState("");

    // Budget state
    const [tags, setTags] = useState([]);
    const [budgets, setBudgets] = useState({}); // tagId -> amount string
    const [savedBudgets, setSavedBudgets] = useState({}); // tagId -> amount (number, from API)
    const [budgetStatus, setBudgetStatus] = useState({}); // tagId -> "saving"|"saved"|"removing"

    const navigate = useNavigate();
    const authHeader = { Authorization: "Bearer " + localStorage.getItem("token") };

    const loadBudgets = useCallback(() => {
        axios.get(`${BASE_URL}/api/v1/budgets`, { headers: authHeader })
            .then(res => {
                const map = {};
                const inputMap = {};
                res.data.budgets.forEach(b => {
                    map[b.tag._id] = b.amount;
                    inputMap[b.tag._id] = String(b.amount);
                });
                setSavedBudgets(map);
                setBudgets(inputMap);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        axios.get(`${BASE_URL}/api/v1/user/me`, { headers: authHeader })
            .then(res => {
                setFirstName(res.data.firstName);
                setLastName(res.data.lastName);
                setMonthlyIncome(res.data.monthlyIncome > 0 ? String(res.data.monthlyIncome) : "");
            })
            .catch(() => navigate("/signin"));
        axios.get(`${BASE_URL}/api/v1/tags`, { headers: authHeader })
            .then(res => setTags(res.data.tags || [])).catch(() => {});
        loadBudgets();
    }, []);

    const handleUpdate = async () => {
        setStatus(null);
        setError("");
        const payload = {};
        if (firstName) payload.firstName = firstName;
        if (lastName) payload.lastName = lastName;
        if (password) payload.password = password;
        if (monthlyIncome !== "") payload.monthlyIncome = Number(monthlyIncome);

        if (Object.keys(payload).length === 0) {
            setError("No changes to save.");
            return;
        }

        try {
            await axios.put(`${BASE_URL}/api/v1/user/update`, payload, { headers: authHeader });
            setStatus("success");
            setPassword("");
        } catch (e) {
            setError(e.response?.data?.message || "Update failed. Please try again.");
        }
    };

    const handleSaveBudget = async (tag) => {
        const amount = Number(budgets[tag._id]);
        if (isNaN(amount) || amount < 0) return;
        setBudgetStatus(s => ({ ...s, [tag._id]: "saving" }));
        try {
            await axios.put(`${BASE_URL}/api/v1/budgets/${tag._id}`, { amount }, { headers: authHeader });
            setSavedBudgets(s => ({ ...s, [tag._id]: amount }));
            setBudgetStatus(s => ({ ...s, [tag._id]: "saved" }));
            setTimeout(() => setBudgetStatus(s => ({ ...s, [tag._id]: undefined })), 1500);
        } catch (e) {
            setBudgetStatus(s => ({ ...s, [tag._id]: "error" }));
            setTimeout(() => setBudgetStatus(s => ({ ...s, [tag._id]: undefined })), 2000);
            console.error("Budget save failed:", e.response?.data || e.message);
        }
    };

    const handleRemoveBudget = async (tagId) => {
        setBudgetStatus(s => ({ ...s, [tagId]: "removing" }));
        try {
            await axios.delete(`${BASE_URL}/api/v1/budgets/${tagId}`, { headers: authHeader });
            setSavedBudgets(s => { const n = { ...s }; delete n[tagId]; return n; });
            setBudgets(s => { const n = { ...s }; delete n[tagId]; return n; });
            setBudgetStatus(s => { const n = { ...s }; delete n[tagId]; return n; });
        } catch {
            setBudgetStatus(s => ({ ...s, [tagId]: undefined }));
        }
    };

    return (
        <div className="min-h-screen dot-grid bg-stone-50 dark:bg-slate-950 grid grid-cols-[1fr_min(28rem,100%)_1fr] grid-rows-[auto_1fr]">
            <div className="col-span-3 flex items-center justify-between p-4 px-6">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-200 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Dashboard
                </button>
                <ThemeToggle />
            </div>
            <div className="border-r border-stone-200 dark:border-slate-800" />
            <div className="py-8 px-4 space-y-6">
                <div className="w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-8 pt-8 pb-6 border-b border-stone-100 dark:border-slate-800">
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-slate-100 text-center">Edit Profile</h2>
                        <p className="text-sm text-stone-500 dark:text-slate-400 text-center mt-1">Update your account information</p>
                    </div>

                    <div className="px-8 py-6 space-y-1">
                        <div className="flex gap-3">
                            <InputBox
                                label="First Name"
                                placeholder="First name"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                            />
                            <InputBox
                                label="Last Name"
                                placeholder="Last name"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                            />
                        </div>
                        <InputBox
                            label="New Password"
                            placeholder="Leave blank to keep current"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <InputBox
                            label="Monthly Income (₹)"
                            placeholder="e.g. 85000"
                            type="number"
                            value={monthlyIncome}
                            onChange={e => setMonthlyIncome(e.target.value)}
                        />

                        {status === "success" && (
                            <div className="pt-1 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm text-center font-medium">
                                Profile updated successfully!
                            </div>
                        )}
                        {error && (
                            <div className="pt-1 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button onClick={handleUpdate} label="Save Changes" />
                        </div>
                    </div>
                </div>

                {/* Tag Budgets */}
                <div className="w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-8 pt-8 pb-6 border-b border-stone-100 dark:border-slate-800">
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-slate-100 text-center">Tag Budgets</h2>
                        <p className="text-sm text-stone-500 dark:text-slate-400 text-center mt-1">Set monthly spending limits per tag</p>
                    </div>
                    <div className="px-8 py-6">
                        {tags.length === 0 ? (
                            <p className="text-sm text-stone-400 dark:text-slate-500 text-center py-4">
                                No tags yet. Tags are created when you send money.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {tags.map(tag => {
                                    const st = budgetStatus[tag._id];
                                    const hasSaved = savedBudgets[tag._id] !== undefined;
                                    return (
                                        <div key={tag._id} className="flex items-center gap-3">
                                            <span className="w-28 text-sm font-medium text-stone-700 dark:text-slate-300 capitalize truncate">{tag.name}</span>
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="e.g. 10000"
                                                    value={budgets[tag._id] || ""}
                                                    onChange={e => setBudgets(s => ({ ...s, [tag._id]: e.target.value }))}
                                                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-slate-500"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleSaveBudget(tag)}
                                                disabled={st === "saving"}
                                                className={`px-3 py-2 text-xs font-medium rounded-lg text-white disabled:opacity-50 transition-colors ${
                                                    st === "error"
                                                        ? "bg-rose-600"
                                                        : "bg-stone-800 dark:bg-slate-700 hover:bg-stone-700 dark:hover:bg-slate-600"
                                                }`}
                                            >
                                                {st === "saving" ? "…" : st === "saved" ? "✓" : st === "error" ? "✗ Failed" : "Save"}
                                            </button>
                                            {hasSaved && (
                                                <button
                                                    onClick={() => handleRemoveBudget(tag._id)}
                                                    disabled={st === "removing"}
                                                    className="px-3 py-2 text-xs font-medium rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-50 transition-colors"
                                                >
                                                    {st === "removing" ? "…" : "Remove"}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="border-l border-stone-200 dark:border-slate-800" />
        </div>
    );
};
