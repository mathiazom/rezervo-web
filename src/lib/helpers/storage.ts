import Cookies from "js-cookie";

import { ChainIdentifier } from "@/lib/activeChains";

const STORAGE_KEYS = {
    SELECTED_CHAIN: "rezervo.selectedChain",
};

export function storeSelectedChain(chain: ChainIdentifier) {
    storeSelectedChainInLocalStorage(chain);
    storeSelectedChainAsCookie(chain);
}

function storeSelectedChainAsCookie(chain: ChainIdentifier) {
    // using a common Max-Age upper limit of 400 days (https://www.cookiestatus.com/)
    Cookies.set(STORAGE_KEYS.SELECTED_CHAIN, chain, { expires: 400 });
}

function storeSelectedChainInLocalStorage(chain: ChainIdentifier) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_CHAIN, chain);
}

export function getStoredSelectedChain(): ChainIdentifier | null {
    const chainFromCookie = getSelectedChainFromCookie();
    if (chainFromCookie) {
        return chainFromCookie;
    }
    const chainFromLocalStorage = getSelectedChainFromLocalStorage();
    if (chainFromLocalStorage) {
        // sync cookie with localStorage for faster redirect next time
        storeSelectedChainAsCookie(chainFromLocalStorage);
    }
    return chainFromLocalStorage;
}

function getSelectedChainFromCookie(): ChainIdentifier | undefined {
    return Cookies.get(STORAGE_KEYS.SELECTED_CHAIN) as ChainIdentifier | undefined;
}

function getSelectedChainFromLocalStorage(): ChainIdentifier | null {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_CHAIN) as ChainIdentifier | null;
}
