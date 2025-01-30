import { BrokenImageRounded, ErrorRounded, ScaleRounded } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Collapse, Typography } from "@mui/material";

import { AvatarMutateError } from "@/components/modals/Profile/Profile";

function AvatarMutateAlert({
    visible,
    error,
    onClosed,
}: {
    visible: boolean;
    error: AvatarMutateError | null;
    onClosed: () => void;
}) {
    return (
        <Collapse in={visible && error != null} sx={{ marginTop: "0.5rem" }} onExited={() => onClosed()}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
                {error === AvatarMutateError.INVALID_IMAGE ? (
                    <Alert severity={"error"} icon={<BrokenImageRounded />}>
                        <AlertTitle>Ugyldig bilde</AlertTitle>
                        <Typography variant={"body2"} sx={{ paddingRight: "1rem" }}>
                            Filen du lastet opp er ikke et gyldig bilde
                        </Typography>
                    </Alert>
                ) : error === AvatarMutateError.TOO_LARGE ? (
                    <Alert severity={"error"} icon={<ScaleRounded />}>
                        <AlertTitle>Bildet er for stort</AlertTitle>
                        <Typography variant={"body2"} sx={{ paddingRight: "1rem" }}>
                            Bildet du lastet opp er for stort. Maks størrelse er <strong>20&nbsp;MB</strong>.
                        </Typography>
                    </Alert>
                ) : error === AvatarMutateError.UNKNOWN ? (
                    <Alert severity={"error"} icon={<ErrorRounded />}>
                        <AlertTitle>Ukjent feil</AlertTitle>
                        <Typography variant={"body2"} sx={{ paddingRight: "1rem" }}>
                            En ukjent feil oppstod. Prøv igjen senere.
                        </Typography>
                    </Alert>
                ) : null}
            </Box>
        </Collapse>
    );
}

export default AvatarMutateAlert;
