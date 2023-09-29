import { IntegrationIdentifier } from "@/lib/integrations/active";

const STORAGE_KEYS = {
    SELECTED_INTEGRATION: "selectedIntegration",
};

export function storeSelectedIntegration(integration: IntegrationIdentifier) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_INTEGRATION, integration);
}

export function getStoredSelectedIntegration(): IntegrationIdentifier {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_INTEGRATION) as IntegrationIdentifier;
}
