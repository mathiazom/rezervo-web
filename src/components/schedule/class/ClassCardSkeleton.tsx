import { Box, Card, CardContent, Skeleton } from "@mui/material";

export default function ClassCardSkeleton() {
    return (
        <Card
            sx={{
                background: "#ffffff",
                "@media (prefers-color-scheme: dark)": {
                    background: "#191919",
                },
            }}
        >
            <Box
                sx={{
                    borderLeft: "0.4rem solid",
                    borderLeftColor: "action.hover",
                }}
            >
                <CardContent
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        "&:last-child": {
                            paddingBottom: 2,
                        },
                    }}
                >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Skeleton variant="text" sx={{ fontSize: "1.05rem", width: "80%" }} />
                        <Skeleton variant="text" sx={{ fontSize: "0.85rem", width: "50%" }} />
                        <Skeleton variant="text" sx={{ fontSize: "0.85rem", width: "60%" }} />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "flex-start", ml: 0.5 }}>
                        <Skeleton variant="circular" width={24} height={24} />
                    </Box>
                </CardContent>
            </Box>
        </Card>
    );
}
