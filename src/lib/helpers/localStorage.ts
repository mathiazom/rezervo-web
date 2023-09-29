import Cookies from "js-cookie";

import { IntegrationIdentifier } from "@/lib/integrations/active";

const STORAGE_KEYS = {
    SELECTED_INTEGRATION: "rezervo.selectedIntegration",
};

export function storeSelectedIntegration(integration: IntegrationIdentifier) {
    storeSelectedIntegrationInLocalStorage(integration);
    storeSelectedIntegrationAsCookie(integration);
}

function storeSelectedIntegrationAsCookie(integration: IntegrationIdentifier) {
    // using a common Max-Age upper limit of 400 days (https://www.cookiestatus.com/)
    Cookies.set(STORAGE_KEYS.SELECTED_INTEGRATION, integration, { expires: 400 });
}

function storeSelectedIntegrationInLocalStorage(integration: IntegrationIdentifier) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_INTEGRATION, integration);
}

export function getStoredSelectedIntegration(): IntegrationIdentifier | null {
    const integrationFromCookie = getSelectedIntegrationFromCookie();
    if (integrationFromCookie) {
        return integrationFromCookie;
    }
    const integrationFromLocalStorage = getSelectedIntegrationFromLocalStorage();
    if (integrationFromLocalStorage) {
        // sync cookie with localStorage for faster redirect next time
        storeSelectedIntegrationAsCookie(integrationFromLocalStorage);
    }
    return integrationFromLocalStorage;
}

function getSelectedIntegrationFromCookie(): IntegrationIdentifier | undefined {
    return Cookies.get(STORAGE_KEYS.SELECTED_INTEGRATION) as IntegrationIdentifier | undefined;
}

function getSelectedIntegrationFromLocalStorage(): IntegrationIdentifier | null {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_INTEGRATION) as IntegrationIdentifier | null;
}
