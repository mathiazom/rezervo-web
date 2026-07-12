import { Alert, AlertTitle, Box, Typography } from "@mui/material";

import { RezervoError } from "@/types/ui";
import { useChain } from "@/lib/hooks/useChain";

function ErrorMessage({ error }: { error: RezervoError }) {
    const chain = useChain();
    return (
        <Box sx={{ display: "flex", justifyContent: "center", bgcolor: "error.main" }}>
            <Alert
                severity={"error"}
                variant={"filled"}
                sx={{ width: 1388, padding: "1rem 1.75rem 1rem 1.5rem", borderRadius: 0 }}
            >
                <AlertTitle>Noe gikk galt</AlertTitle>
                <Typography>
                    {error === RezervoError.CHAIN_SCHEDULE_UNAVAILABLE ? (
                        <>
                            Klarte ikke hente timeplan for <strong>{chain.profile.name}</strong>
                        </>
                    ) : (
                        <>En ukjent feil har oppstått️</>
                    )}
                </Typography>
            </Alert>
        </Box>
    );
}

export default ErrorMessage;
