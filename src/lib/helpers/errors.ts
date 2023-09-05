import { RezervoError } from "@/types/errors";
import { IntegrationProfile } from "@/types/integration";

export function getErrorMessage(error: RezervoError, integrationProfile: IntegrationProfile) {
    switch (error) {
        case RezervoError.INTEGRATION_SCHEDULE_UNAVAILABLE:
            return `Klarte ikke hente timeplan for ${integrationProfile.name}. Prøv igjen senere, eller ta kontakt dersom problemet vedvarer.`;
        default:
            return "En ukjent feil har oppstått! Vennligst ta kontakt med systemadministrator.";
    }
}
