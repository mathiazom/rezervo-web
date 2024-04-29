import { FusionAuthProvider, FusionAuthProviderConfig } from "@fusionauth/react-sdk";
import { PropsWithChildren, useEffect, useState } from "react";

export function FusionAuthClientProvider({ children, ...config }: PropsWithChildren<FusionAuthProviderConfig>) {
    // force client rendering (https://reactjs.org/link/uselayouteffect-ssr)
    const [clientReady, setClientReady] = useState(false);
    useEffect(() => {
        if (typeof window !== "undefined") {
            setClientReady(true);
        }
    }, []);
    if (!clientReady) {
        return <>{children}</>;
    }
    return <FusionAuthProvider {...config}>{children}</FusionAuthProvider>;
}
