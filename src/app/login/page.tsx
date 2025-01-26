import Login from "@/app/login/login";
import AuthProvider from "@/lib/authProvider";
import { requireServerAuthConfig } from "@/lib/helpers/env";

export default function Page() {
    const authConfig = requireServerAuthConfig();

    return (
        <AuthProvider config={authConfig}>
            <Login />
        </AuthProvider>
    );
}
