import { Appbar } from "../components/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

export const Dashboard = () => {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950">
            <Appbar />
            <div className="max-w-2xl mx-auto px-6 py-8">
                <Balance value="10,000" />
                <Users />
            </div>
        </div>
    );
};
