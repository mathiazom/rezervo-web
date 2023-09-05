import { Alert, AlertTitle } from "@mui/material";

import { getErrorMessage } from "@/lib/helpers/errors";
import { RezervoError } from "@/types/errors";
import { IntegrationProfile } from "@/types/integration";

function ErrorMessage({ error, integrationProfile }: { error: RezervoError; integrationProfile: IntegrationProfile }) {
    return (
        <Alert severity={"error"}>
            <AlertTitle>Noe gikk galt!</AlertTitle>
            {getErrorMessage(error, integrationProfile)}
        </Alert>
    );
}

export default ErrorMessage;
