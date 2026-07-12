import { getSerwist } from "virtual:serwist";
import { useEffect } from "react";

export default function SerwistRegister() {
    useEffect(() => {
        const loadSerwist = async () => {
            if ("serviceWorker" in navigator) {
                const serwist = await getSerwist();
                void serwist?.register();
            }
        };
        void loadSerwist();
    }, []);
    return null;
}
