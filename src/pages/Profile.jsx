import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { ThemeToggle } from "../components/ThemeToggle";

export const Profile = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const authHeader = { Authorization: "Bearer " + localStorage.getItem("token") };

    useEffect(() => {
        axios.get("http://localhost:3000/api/v1/user/me", { headers: authHeader })
            .then(res => {
                setFirstName(res.data.firstName);
                setLastName(res.data.lastName);
            })
            .catch(() => navigate("/signin"));
    }, []);

    const handleUpdate = async () => {
        setStatus(null);
        setError("");
        const payload = {};
        if (firstName) payload.firstName = firstName;
        if (lastName) payload.lastName = lastName;
        if (password) payload.password = password;

        if (Object.keys(payload).length === 0) {
            setError("No changes to save.");
            return;
        }

        try {
            await axios.put("http://localhost:3000/api/v1/user/update", payload, { headers: authHeader });
            setStatus("success");
            setPassword("");
        } catch (e) {
            setError(e.response?.data?.message || "Update failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen dot-grid bg-stone-50 dark:bg-slate-950 flex flex-col">
            <div className="flex items-center justify-between p-4 px-6">
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

            <div className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
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
            </div>
        </div>
    );
};
