import { Box } from "@mui/material";
import React, { ReactNode } from "react";

export default function AppBar({
    leftComponent,
    rightComponent,
}: {
    leftComponent: ReactNode;
    rightComponent: ReactNode;
}) {
    return (
        <Box display={"flex"} justifyContent={"center"}>
            <Box width={1388}>
                <Box display="flex" py={2} alignItems={"center"}>
                    {leftComponent}
                    <Box sx={{ marginLeft: "auto", marginRight: { xs: 1, md: 2 } }}>{rightComponent}</Box>
                </Box>
            </Box>
        </Box>
    );
}
