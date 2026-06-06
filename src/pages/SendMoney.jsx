import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import BASE_URL from '../api';

const API = `${BASE_URL}/api/v1`;

function TagPicker({ selectedTag, onSelect }) {
    const [query, setQuery] = useState(selectedTag?.name || "");
    const [tags, setTags] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const authHeader = { Authorization: "Bearer " + localStorage.getItem("token") };

    useEffect(() => {
        axios.get(`${API}/tags`, { headers: authHeader })
            .then(res => setTags(res.data.tags))
            .catch(() => {});
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = tags.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
    const showCreate = query.trim() && !tags.some(t => t.name.toLowerCase() === query.trim().toLowerCase());

    const handleSelect = (tag) => {
        setQuery(tag.name);
        onSelect(tag);
        setOpen(false);
    };

    const handleCreate = async () => {
        try {
            const res = await axios.post(`${API}/tags`, { name: query.trim() }, { headers: authHeader });
            const newTag = res.data.tag;
            setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
            handleSelect(newTag);
        } catch {
            // tag creation failed
        }
    };

    return (
        <div ref={ref} className="relative">
            <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-2">
                Tag <span className="text-rose-500">*</span>
            </label>
            <input
                type="text"
                placeholder="Search or create a tag…"
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true); onSelect(null); }}
                onFocus={() => setOpen(true)}
                className="w-full px-3 py-2.5 border border-stone-200 dark:border-slate-600 rounded-xl bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            {selectedTag && (
                <span className="absolute right-3 top-[42px] text-xs text-emerald-600 dark:text-emerald-400 font-medium">✓</span>
            )}

            {open && (filtered.length > 0 || showCreate) && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                    {filtered.map(tag => (
                        <button
                            key={tag._id}
                            type="button"
                            onClick={() => handleSelect(tag)}
                            className="w-full text-left px-3 py-2.5 text-sm text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            {tag.name}
                        </button>
                    ))}
                    {showCreate && (
                        <button
                            type="button"
                            onClick={handleCreate}
                            className="w-full text-left px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border-t border-stone-100 dark:border-slate-800 font-medium"
                        >
                            + Create "{query.trim()}"
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export const SendMoney = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const [amount, setAmount] = useState("");
    const [selectedTag, setSelectedTag] = useState(null);
    const [status, setStatus] = useState(null);

    const handleTransfer = async () => {
        if (!selectedTag) {
            setStatus("no-tag");
            return;
        }
        if (!amount || Number(amount) <= 0) {
            setStatus("no-amount");
            return;
        }
        try {
            await axios.post(`${API}/account/transfer`, {
                to: id,
                amount: Number(amount),
                tagId: selectedTag._id,
                name: `Payment to ${name}`,
            }, {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            setStatus("success");
            setTimeout(() => navigate("/transactions"), 1000);
        } catch (e) {
            setStatus(e.response?.data?.message === "Insufficient balance" ? "insufficient" : "error");
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

                    <div className="px-8 py-6 space-y-5">
                        {/* Recipient */}
                        <div className="flex items-center gap-4">
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

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 dark:text-slate-300 mb-2">
                                Amount (in Rs)
                            </label>
                            <input
                                type="number"
                                placeholder="Enter amount"
                                value={amount}
                                onChange={e => { setAmount(e.target.value); setStatus(null); }}
                                className="w-full px-3 py-2.5 border border-stone-200 dark:border-slate-600 rounded-xl bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Tag picker */}
                        <TagPicker selectedTag={selectedTag} onSelect={tag => { setSelectedTag(tag); setStatus(null); }} />

                        {/* Status messages */}
                        {status === "success" && (
                            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm text-center font-medium">
                                Transfer successful!
                            </div>
                        )}
                        {status === "insufficient" && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm text-center font-medium">
                                Insufficient balance.
                            </div>
                        )}
                        {status === "no-tag" && (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm text-center font-medium">
                                Please select or create a tag first.
                            </div>
                        )}
                        {status === "no-amount" && (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm text-center font-medium">
                                Please enter a valid amount.
                            </div>
                        )}
                        {status === "error" && (
                            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm text-center font-medium">
                                Transfer failed. Please try again.
                            </div>
                        )}

                        <button
                            onClick={handleTransfer}
                            disabled={status === "success"}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors shadow-sm"
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
