import { Box, CircularProgress, Typography } from "@mui/material";
import { ReactNode } from "react";

export default function SwitchWrapper({
    children,
    label,
    loading,
}: {
    children: ReactNode;
    label: string;
    loading?: boolean;
}) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
            <Typography
                sx={{
                    userSelect: "none",
                }}
            >
                {label}
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "right",
                    flexGrow: 1,
                }}
            >
                {loading ? <CircularProgress size={22} thickness={4} sx={{ margin: "1rem" }} /> : children}
            </Box>
        </Box>
    );
}
