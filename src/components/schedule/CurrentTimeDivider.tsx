import { alpha, Box, Stack, useTheme } from "@mui/material";
import React from "react";

export default function CurrentTimeDivider() {
    const theme = useTheme();
    return (
        <Stack direction={"row"} alignItems={"center"} mt={-0.5} mb={0.5} marginX={"-0.5rem"}>
            <Box
                sx={{
                    borderRadius: "50%",
                    width: "0.8rem",
                    height: "0.8rem",
                    marginLeft: "-0.4rem",
                    background: theme.palette.primary.main,
                }}
            />
            <Box
                flexGrow={1}
                sx={{
                    borderTopWidth: "0.15rem",
                    borderTopStyle: "solid",
                    borderTopColor: alpha(theme.palette.primary.main, 0.5),
                    '[data-mui-color-scheme="dark"] &': {
                        borderTopColor: alpha(theme.palette.primary.main, 0.5),
                    },
                }}
            />
        </Stack>
    );
}
