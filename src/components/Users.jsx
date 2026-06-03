import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/user/bulk?filter=" + filter)
            .then(response => setUsers(response.data.user))
            .catch(() => {});
    }, [filter]);

    return (
        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-6">
            <h2 className="font-semibold text-stone-900 dark:text-slate-100 text-lg mb-4">Send Money To</h2>
            <div className="relative mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    onChange={(e) => setFilter(e.target.value)}
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-200 dark:border-slate-600 rounded-xl bg-stone-50 dark:bg-slate-800 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
            </div>
            <div className="divide-y divide-stone-100 dark:divide-slate-800">
                {users.map(user => <User key={user._id} user={user} />)}
                {users.length === 0 && (
                    <p className="text-center text-stone-400 dark:text-slate-500 text-sm py-6">No users found</p>
                )}
            </div>
        </div>
    );
};

function User({ user }) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between py-3 hover:bg-stone-50 dark:hover:bg-slate-800/50 rounded-xl px-2 transition-colors">
            <div className="flex items-center gap-3">
                <div className="rounded-full h-10 w-10 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm flex-shrink-0">
                    {user.firstName[0].toUpperCase()}
                </div>
                <div>
                    <p className="text-sm font-medium text-stone-900 dark:text-slate-100">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-stone-500 dark:text-slate-400">{user.username}</p>
                </div>
            </div>
            <button
                onClick={() => navigate("/send?id=" + user._id + "&name=" + user.firstName)}
                className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg transition-colors"
            >
                Send →
            </button>
        </div>
    );
}