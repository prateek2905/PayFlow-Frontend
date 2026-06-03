import { useEffect, useState } from "react";
import axios from "axios";
import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

export const Dashboard = () => {
    const [balance, setBalance] = useState(null);
    const [user, setUser] = useState({ firstName: "", lastName: "" });
    const authHeader = { Authorization: "Bearer " + localStorage.getItem("token") };

    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/account/balance", { headers: authHeader })
            .then(res => setBalance(res.data.balance)).catch(() => {});
        axios.get("http://localhost:3000/api/v1/user/me", { headers: authHeader })
            .then(res => setUser(res.data)).catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex flex-col">
            <Appbar userName={user.firstName || "..."} userInitial={(user.firstName?.[0] || "U").toUpperCase()} />
            <div className="flex-1 grid grid-cols-[1fr_min(42rem,100%)_1fr]">
                <div className="border-r border-stone-200 dark:border-slate-800" />
                <div className="px-6 py-8">
                    <Balance value={balance !== null ? balance.toLocaleString() : "..."} />
                    <Users />
                </div>
                <div className="border-l border-stone-200 dark:border-slate-800" />
            </div>
        </div>
    );
};
