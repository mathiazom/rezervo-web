import { Box, CircularProgress, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";
import React from "react";

export default function Settings({
    userConfigActive,
    userConfigActiveLoading,
    onUserConfigActive,
}: {
    userConfigActive: boolean;
    userConfigActiveLoading: boolean;
    // eslint-disable-next-line no-unused-vars
    onUserConfigActive: (active: boolean) => void;
}) {
    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "90%",
                maxHeight: "80%",
                overflowY: "scroll",
                maxWidth: 520,
                transform: "translate(-50%, -50%)",
                borderRadius: "0.25em",
                boxShadow: 24,
                p: 4,
                backgroundColor: "white",
                '[data-mui-color-scheme="dark"] &': {
                    backgroundColor: "#111",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    paddingBottom: 1,
                }}
            >
                <Typography variant="h6" component="h2">
                    Innstillinger
                </Typography>
            </Box>
            <Box pt={2} pb={2}>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={userConfigActive}
                                onChange={(_, checked) => onUserConfigActive(checked)}
                                inputProps={{
                                    "aria-label": "controlled",
                                }}
                            />
                        }
                        label={
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                <span>Aktiv</span>
                                {userConfigActiveLoading && <CircularProgress size="1.5rem" />}
                            </Box>
                        }
                    />
                </FormGroup>
            </Box>
        </Box>
    );
}
