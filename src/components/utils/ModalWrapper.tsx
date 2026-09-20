import { Box, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";

export default function ModalWrapper({
    children,
    title,
    icon,
    titleAlignment = "center",
    description,
    footer,
}: {
    children: ReactNode;
    title: string;
    icon?: ReactNode;
    titleAlignment?: "left" | "center";
    description?: string;
    footer?: ReactNode;
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
                maxWidth: 550,
                minHeight: 300,
                transform: "translate(-50%, -50%)",
                borderRadius: "0.25em",
                boxShadow: 24,
                backgroundColor: "white",
                display: "flex",
                flexDirection: "column",
                "@media (prefers-color-scheme: dark)": {
                    backgroundColor: "#111",
                },
            }}
        >
            <Box
                sx={{
                    overflowY: "auto",
                    minHeight: 0,
                    flex: "1 1 auto",
                    p: 4,
                    pb: footer ? 2 : 4,
                    ...(footer && {
                        // Bottom-edge scroll shadow that hides itself once scrolled to the end: a
                        // shadow pinned to the visible bottom edge (background-attachment: scroll),
                        // masked by a solid-color layer anchored to the content's true end
                        // (background-attachment: local) — the mask only lines up over the shadow
                        // once there's no more content below. See "CSS scroll shadows" technique.
                        backgroundColor: "white",
                        backgroundImage:
                            "linear-gradient(rgba(255, 255, 255, 0), white 30px), " +
                            "radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0))",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "bottom, bottom",
                        backgroundSize: "100% 40px, 100% 14px",
                        backgroundAttachment: "local, scroll",
                        "@media (prefers-color-scheme: dark)": {
                            backgroundColor: "#111",
                            backgroundImage:
                                "linear-gradient(rgba(17, 17, 17, 0), #111 30px), " +
                                "radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0))",
                        },
                    }),
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
            {footer && (
                <Box
                    sx={{
                        flex: "0 0 auto",
                        px: 4,
                        py: 2,
                        borderTop: "1px solid rgba(0, 0, 0, 0.12)",
                        "@media (prefers-color-scheme: dark)": {
                            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                        },
                    }}
                >
                    {footer}
                </Box>
            )}
        </Box>
    );
}
