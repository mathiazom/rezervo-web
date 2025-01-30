import { Box } from "@mui/material";
import { ReactNode } from "react";

export default function AppBar({
    leftComponent,
    rightComponent,
}: {
    leftComponent: ReactNode;
    rightComponent: ReactNode;
}) {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    width: 1400,
                    height: 60,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        p: 1,
                        alignItems: "center",
                    }}
                >
                    {leftComponent}
                    <Box sx={{ marginLeft: "auto" }}>{rightComponent}</Box>
                </Box>
            </Box>
        </Box>
    );
}
