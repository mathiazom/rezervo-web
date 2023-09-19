import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UndoIcon from "@mui/icons-material/Undo";
import { Box, CircularProgress, Fab, Typography } from "@mui/material";
import React from "react";

export default function MobileConfigUpdateBar({
    visible,
    isLoadingConfig,
    onUpdateConfig,
    onUndoSelectionChanges,
}: {
    visible: boolean;
    isLoadingConfig: boolean;
    onUpdateConfig: () => void;
    onUndoSelectionChanges: () => void;
}) {
    if (!visible) {
        return <></>;
    }

    return (
        <Box
            sx={{
                zIndex: 2,
                position: "fixed",
                padding: "1.5rem",
                bottom: 0,
                right: 0,
            }}
        >
            <Box
                sx={{
                    gap: 1,
                    display: { xs: "flex", sm: "none" },
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {isLoadingConfig ? (
                    <Fab color={"primary"} size="small">
                        <CircularProgress sx={{ color: "white" }} size={26} thickness={6} />
                    </Fab>
                ) : (
                    <>
                        <Fab size="small" onClick={() => onUndoSelectionChanges()}>
                            <UndoIcon
                                sx={{
                                    fontSize: 18,
                                    '[data-mui-color-scheme="dark"] &': {
                                        color: "#111",
                                    },
                                }}
                            />
                        </Fab>
                        <Fab color={"primary"} variant="extended" onClick={() => onUpdateConfig()}>
                            <CloudUploadIcon sx={{ mr: 1, color: "#fff" }} />
                            <Typography color={"#fff"}>Oppdater</Typography>
                        </Fab>
                    </>
                )}
            </Box>
        </Box>
    );
}
