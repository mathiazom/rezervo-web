import { Typography, type TypographyProps } from "@mui/material";

export default function RezervoLogo({ variant = "h4", sx, ...props }: TypographyProps) {
    return (
        <Typography
            variant={variant}
            sx={[
                { fontWeight: "bold", color: (theme) => (theme.vars ?? theme).palette.primary.main },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
            {...props}
        >
            rezervo
        </Typography>
    );
}
