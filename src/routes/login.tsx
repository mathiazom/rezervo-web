import { createFileRoute } from "@tanstack/react-router";

import AutoLogin from "@/components/AutoLogin";

export const Route = createFileRoute("/login")({
    component: AutoLogin,
});
