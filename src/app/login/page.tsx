import Login from "@/app/login/login";
import AuthProvider from "@/lib/authProvider";

export default function Page() {
    return (
        <AuthProvider>
            <Login />
        </AuthProvider>
    );
}
