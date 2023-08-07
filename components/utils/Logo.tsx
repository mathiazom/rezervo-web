import { Typography, useTheme } from "@mui/material";
import React from "react";

function Logo({ integrationAcronym }: { integrationAcronym: string }) {
    const theme = useTheme();

    return (
        <Typography
            component="div"
            pl={2}
            sx={{
                fontSize: { xs: "1.2rem", sm: "1.8rem" },
                display: { xs: "none", md: "block" },
            }}
        >
            <strong style={{ color: theme.palette.primary.main }}>{integrationAcronym}-rezervo</strong>
        </Typography>
    );
}

export default Logo;
