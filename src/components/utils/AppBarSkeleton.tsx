import { Box, Skeleton } from "@mui/material";

export default function AppBarSkeleton() {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Box
                sx={{
                    width: 1400,
                    height: 60,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        p: 1,
                        alignItems: "center",
                    }}
                >
                    <Skeleton variant="rounded" width={90} height={32} />
                    <Box sx={{ marginLeft: "auto" }}>
                        <Skeleton variant="circular" width={36} height={36} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
