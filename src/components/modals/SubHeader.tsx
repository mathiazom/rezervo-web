import { Box, SxProps, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";

export default function SubHeader({
    title,
    startIcon,
    endIcon,
    description,
    placeholder,
    showPlaceholder,
    sx = { mb: 1 },
}: {
    title: string;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    description?: string;
    placeholder?: string;
    showPlaceholder?: boolean;
    sx?: SxProps;
}) {
    const theme = useTheme();
    return (
        <Box sx={sx}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {startIcon}
                <Typography variant="h6" sx={{ fontSize: 18 }}>
                    {title}
                </Typography>
                {endIcon}
            </Box>
            {description && (
                <Typography
                    variant="body2"
                    sx={{
                        color: theme.palette.grey[600],
                        fontSize: 14,
                        mt: 0.5,
                    }}
                >
                    {description}
                </Typography>
            )}
            {showPlaceholder && (
                <Typography variant={"body2"} sx={{ opacity: 0.6, fontStyle: "italic", mt: 0.5 }}>
                    {placeholder}
                </Typography>
            )}
        </Box>
    );
}
