"use client";
import { Box, Typography, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import Link from "next/link";

const NotFoundPage = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    color: theme.palette.primary.main,
                }}
            >
                rezervo
            </Typography>
            <Typography
                variant="h6"
                sx={{
                    fontWeight: "bold",
                    marginBottom: "1rem",
                }}
            >
                404 - Siden ble ikke funnet
            </Typography>
            <Typography variant="body1">Oops! Siden du leter etter eksisterer ikke.</Typography>
            <Link href={"/"} passHref>
                <Button variant="outlined" sx={{ marginTop: "1rem" }}>
                    Ta meg hjem
                </Button>
            </Link>
        </Box>
    );
};

export default NotFoundPage;
