import { Box, Button, Stack, Typography } from "@mui/material";
import { type ErrorComponentProps, Link } from "@tanstack/react-router";

import RezervoLogo from "@/components/utils/RezervoLogo";

export default function DefaultCatchBoundary({ error }: ErrorComponentProps) {
    const message = error instanceof Error ? error.message : String(error);

    return (
        <Box
            role={"alert"}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: "100dvh",
                gap: 2,
                px: 3,
            }}
        >
            <RezervoLogo />
            <Typography variant={"h6"} sx={{ fontWeight: "bold" }}>
                Noe gikk veldig galt
            </Typography>
            {message !== "" && (
                <Typography
                    sx={(theme) => ({
                        p: 2,
                        bgcolor: "rgb(var(--mui-palette-text-primaryChannel) / 0.06)",
                        color: (theme.vars ?? theme).palette.text.secondary,
                        fontFamily: "monospace",
                        fontSize: "0.85rem",
                    })}
                >
                    {message}
                </Typography>
            )}
            <Stack direction={"row"} spacing={1.5} sx={{ mt: 1 }}>
                <Button component={Link} to={"/"} variant={"outlined"}>
                    Til forsiden
                </Button>
            </Stack>
        </Box>
    );
}
