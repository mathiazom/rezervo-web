import { Box, Typography, useTheme } from "@mui/material";
import React, { ReactNode } from "react";

export default function ModalWrapper({
    children,
    title,
    icon,
    titleAlignment = "center",
    description,
}: {
    children: ReactNode;
    title: string;
    icon: ReactNode;
    titleAlignment?: "left" | "center";
    description?: string;
}) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "90%",
                maxHeight: "80%",
                overflowY: "auto",
                maxWidth: 550,
                minHeight: 300,
                transform: "translate(-50%, -50%)",
                borderRadius: "0.25em",
                boxShadow: 24,
                p: 4,
                backgroundColor: "white",
                '[data-mui-color-scheme="dark"] &': {
                    backgroundColor: "#111",
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: titleAlignment,
                    gap: 1,
                    paddingBottom: 1,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}
                >
                    {icon}
                    <Typography variant="h6" component="h2">
                        {title}
                    </Typography>
                </Box>
                {description && (
                    <Typography
                        variant="body2"
                        style={{
                            color: theme.palette.grey[600],
                            fontSize: 15,
                        }}
                        sx={{
                            textAlign: "center",
                            mb: 2.5,
                        }}
                    >
                        {description}
                    </Typography>
                )}
            </Box>
            {children}
        </Box>
    );
}
