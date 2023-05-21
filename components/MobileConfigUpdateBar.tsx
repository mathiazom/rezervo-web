import { Box, CircularProgress, Fab } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import React from "react";

export default function MobileConfigUpdateBar({
    isLoadingConfig,
    onUpdateConfig,
    onUndoSelectionChanges,
}: {
    isLoadingConfig: boolean;
    onUpdateConfig: () => void;
    onUndoSelectionChanges: () => void;
}) {
    return (
        <Box
            sx={{
                position: "fixed",
                padding: "1.5rem",
                bottom: 0,
                right: 0,
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
                        <CloudUploadIcon sx={{ mr: 1 }} />
                        Oppdater
                    </Fab>
                </>
            )}
        </Box>
    );
}
