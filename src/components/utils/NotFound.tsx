import { Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { Link } from "@tanstack/react-router";

import RezervoLogo from "@/components/utils/RezervoLogo";

const NotFound = () => {
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
            <RezervoLogo sx={{ marginBottom: "1rem" }} />
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
            <Link to="/">
                <Button variant="outlined" sx={{ marginTop: "1rem" }}>
                    Ta meg hjem
                </Button>
            </Link>
        </Box>
    );
};

export default NotFound;
