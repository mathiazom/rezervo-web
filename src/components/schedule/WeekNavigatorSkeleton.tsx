import { Box, Skeleton } from "@mui/material";

export default function WeekNavigatorSkeleton() {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Skeleton variant="rounded" width={280} height={32} />
        </Box>
    );
}
