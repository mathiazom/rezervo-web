import { Box, Dialog, List, ListItem, ListItemButton } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

import ChainLogo from "@/components/utils/ChainLogo";
import { ChainProfile } from "@/types/chain";

function AddMembershipDialog({
    availableChainProfiles,
    open,
    onClose,
    onAdd,
}: {
    availableChainProfiles: ChainProfile[];
    open: boolean;
    onClose: () => void;
    onAdd: (chainProfile: ChainProfile) => void;
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={"xs"}
            fullWidth={true}
            PaperProps={{
                sx: {
                    backgroundColor: "white",
                    '[data-mui-color-scheme="dark"] &': {
                        backgroundColor: "black",
                    },
                },
            }}
        >
            <DialogTitle>Velg treningssenter</DialogTitle>
            <List sx={{ marginBottom: "1rem", padding: 0 }}>
                {availableChainProfiles.map((cp) => (
                    <ListItem key={cp.identifier} sx={{ padding: 0 }}>
                        <ListItemButton sx={{ height: "6rem", width: "100%" }} onClick={() => onAdd(cp)}>
                            <Box sx={{ height: "3rem", width: "100%" }}>
                                <ChainLogo chainProfile={cp} />
                            </Box>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
}

export default AddMembershipDialog;
