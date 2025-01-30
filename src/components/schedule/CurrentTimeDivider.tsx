import { alpha, Box, Stack, useTheme } from "@mui/material";

export default function CurrentTimeDivider() {
    const theme = useTheme();
    return (
        <Stack
            direction={"row"}
            sx={{
                alignItems: "center",
                mt: -0.5,
                mb: 0.5,
                marginX: "-0.5rem",
            }}
        >
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
                sx={{
                    flexGrow: 1,
                    borderTopWidth: "0.15rem",
                    borderTopStyle: "solid",
                    borderTopColor: alpha(theme.palette.primary.main, 0.5),

                    "@media (prefers-color-scheme: dark)": {
                        borderTopColor: alpha(theme.palette.primary.main, 0.5),
                    },
                }}
            />
        </Stack>
    );
}
