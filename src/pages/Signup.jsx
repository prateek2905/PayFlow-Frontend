import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import { ThemeToggle } from "../components/ThemeToggle";

export const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex bg-stone-50 dark:bg-slate-950">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 dot-grid bg-stone-100 dark:bg-slate-900 flex-col justify-between p-12">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">💸</span>
                    <span className="font-bold text-xl text-stone-900 dark:text-slate-100 tracking-tight">PayFlow</span>
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-stone-900 dark:text-slate-100 leading-tight mb-4">
                        Join thousands<br />sending smarter.
                    </h1>
                    <p className="text-stone-500 dark:text-slate-400 text-lg">
                        Create your free account and start sending money in seconds.
                    </p>
                    <div className="flex gap-6 mt-8">
                        {["Free", "Secure", "Instant"].map(tag => (
                            <div key={tag} className="flex items-center gap-2 text-sm text-stone-600 dark:text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-stone-400 dark:text-slate-600">© 2024 PayFlow. All rights reserved.</p>
            </div>

            {/* Right form panel */}
            <div className="w-full lg:w-1/2 flex flex-col">
                <div className="flex justify-end p-4">
                    <ThemeToggle />
                </div>
                <div className="flex-1 flex items-center justify-center px-6">
                    <div className="w-full max-w-sm">
                        <div className="bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
                            <Heading label="Sign up" />
                            <SubHeading label="Enter your information to create an account" />
                            <div className="mt-2 space-y-1">
                                <div className="flex gap-3">
                                    <InputBox
                                        onChange={e => setFirstName(e.target.value)}
                                        placeholder="First name"
                                        label="First Name"
                                    />
                                    <InputBox
                                        onChange={e => setLastName(e.target.value)}
                                        placeholder="Last name"
                                        label="Last Name"
                                    />
                                </div>
                                <InputBox
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="Enter your email"
                                    label="Email"
                                />
                                <InputBox
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    label="Password"
                                    type="password"
                                />
                            </div>
                            {error && (
                                <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm text-center font-medium">
                                    {error}
                                </div>
                            )}
                            <div className="pt-2">
                                <Button onClick={async () => {
                                    setError("");
                                    try {
                                        const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
                                            username,
                                            firstName,
                                            lastName,
                                            password
                                        });
                                        localStorage.setItem("token", response.data.token);
                                        navigate("/dashboard");
                                    } catch (e) {
                                        setError(e.response?.data?.message || "Signup failed. Please try again.");
                                    }
                                }} label="Sign up" />
                            </div>
                            <BottomWarning label="Already have an account?" buttonText="Sign in" to="/signin" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
