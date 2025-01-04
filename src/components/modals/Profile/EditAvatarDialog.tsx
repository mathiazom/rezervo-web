import { DeleteRounded, ImageRounded } from "@mui/icons-material";
import { Box, Dialog, ListItemButton, Typography } from "@mui/material";
import { red } from "@mui/material/colors";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

import { VisuallyHiddenInput } from "@/components/utils/VisuallyHiddenInput";
import { ALLOWED_AVATAR_FILE_TYPES } from "@/lib/consts";

function EditAvatarDialog({
    open,
    onAvatarUploadFromInput,
    onDeleteAvatar,
    onClose,
}: {
    open: boolean;
    onAvatarUploadFromInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDeleteAvatar: () => void;
    onClose: () => void;
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    minWidth: 300,
                    backgroundColor: "white",
                    "@media (prefers-color-scheme: dark)": {
                        backgroundColor: "black",
                    },
                },
            }}
        >
            <DialogTitle>Endre profilbilde</DialogTitle>
            <Box sx={{ display: "flex", flexDirection: "column", paddingBottom: "1rem", gap: "0.5rem" }}>
                <ListItemButton
                    component={"label"}
                    tabIndex={-1} // prevents duplicate tab targets
                >
                    <Box
                        sx={{
                            display: "flex",
                            gap: "1rem",
                            cursor: "pointer",
                            paddingX: "1.5rem",
                            paddingY: "0.75rem",
                        }}
                    >
                        <ImageRounded />
                        <Typography
                            variant={"body1"}
                            sx={{
                                color: "text.secondary",
                            }}
                        >
                            Velg nytt bilde
                        </Typography>
                        <VisuallyHiddenInput
                            type={"file"}
                            accept={ALLOWED_AVATAR_FILE_TYPES}
                            onChange={onAvatarUploadFromInput}
                        />
                    </Box>
                </ListItemButton>
                <ListItemButton onClick={() => onDeleteAvatar()}>
                    <Box
                        sx={{
                            display: "flex",
                            color: red[500],
                            gap: "1rem",
                            paddingX: "1.5rem",
                            paddingY: "0.75rem",
                        }}
                    >
                        <DeleteRounded />
                        <Typography variant={"body1"}>Slett bilde</Typography>
                    </Box>
                </ListItemButton>
            </Box>
        </Dialog>
    );
}

export default EditAvatarDialog;
