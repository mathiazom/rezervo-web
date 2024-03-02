import { Dialog } from "@mui/material";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import * as React from "react";
import { ReactNode } from "react";

export type ConfirmationDialogProps = {
    open: boolean;
    title: string;
    description: ReactNode;
    confirmText: string;
    cancelText?: string;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ConfirmationDialog({
    open,
    title,
    description,
    confirmText,
    cancelText = "Avbryt",
    onCancel,
    onConfirm,
}: ConfirmationDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color={"inherit"}>
                    {cancelText}
                </Button>
                <Button color={"error"} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
