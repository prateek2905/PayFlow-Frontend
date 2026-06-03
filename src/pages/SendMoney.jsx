import { useSearchParams } from 'react-router-dom';
import axios from "axios";
import { useState } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';

export const SendMoney = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const [amount, setAmount] = useState(0);
    const [status, setStatus] = useState(null);

    const handleTransfer = async () => {
        try {
            await axios.post("http://localhost:3000/api/v1/account/transfer", {
                to: id,
                amount
            }, {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            setStatus("success");
        } catch {
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen dot-grid bg-stone-50 dark:bg-slate-950 grid grid-cols-[1fr_min(28rem,100%)_1fr] grid-rows-[auto_1fr]">
            <div className="col-span-3 flex justify-end p-4">
                <ThemeToggle />
            </div>
            <div className="border-r border-stone-200 dark:border-slate-800" />
            <div className="flex items-center justify-center py-8 px-4">
                <div className="w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-8 pt-8 pb-6 border-b border-stone-100 dark:border-slate-800">
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-slate-100 text-center">Send Money</h2>
                    </div>

                    <div className="px-8 py-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-semibold text-emerald-700 dark:text-emerald-300">
                                    {name?.[0]?.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-semibold text-stone-900 dark:text-slate-100 text-lg">{name}</p>
                                <p className="text-sm text-stone-500 dark:text-slate-400">Recipient</p>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-2">
                                Amount (in Rs)
                            </label>
                            <input
                                onChange={e => setAmount(e.target.value)}
                                type="number"
                                placeholder="Enter amount"
                                className="w-full px-3 py-2.5 border border-stone-200 dark:border-slate-600 rounded-xl bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            />
                        </div>

                        {status === "success" && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm text-center font-medium">
                                Transfer successful!
                            </div>
                        )}
                        {status === "error" && (
                            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm text-center font-medium">
                                Transfer failed. Please try again.
                            </div>
                        )}

                        <button
                            onClick={handleTransfer}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors shadow-sm"
                        >
                            Initiate Transfer
                        </button>
                    </div>
                </div>
            </div>
            <div className="border-l border-stone-200 dark:border-slate-800" />
        </div>
    );
};
