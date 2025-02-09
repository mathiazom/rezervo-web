"use client";

import { useEffect } from "react";

import { storeSelectedChain } from "@/lib/helpers/storage";

export default function StoreSelectedChain({ chainIdentifier }: { chainIdentifier: string }) {
    useEffect(() => {
        storeSelectedChain(chainIdentifier);
    }, [chainIdentifier]);

    return null;
}
