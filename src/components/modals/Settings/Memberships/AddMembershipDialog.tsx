import { Dialog, List, ListItem, ListItemButton } from "@mui/material";
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
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Velg treningssenter</DialogTitle>
            <List>
                {availableChainProfiles.map((cp) => (
                    <ListItem key={cp.identifier}>
                        <ListItemButton sx={{ height: "6rem", width: "100%" }} onClick={() => onAdd(cp)}>
                            <ChainLogo chainProfile={cp} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Dialog>
    );
}

export default AddMembershipDialog;
