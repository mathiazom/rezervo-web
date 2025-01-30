import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

function ClassInfoEntry({ icon, label, cancelled }: { icon: ReactNode; label: string; cancelled: boolean }) {
    return (
        <Box
            sx={[
                {
                    display: "flex",
                    paddingTop: 1,
                    gap: 1,
                    alignItems: "center",
                },
                cancelled
                    ? {
                          opacity: 0.5,
                      }
                    : {
                          opacity: 1,
                      },
            ]}
        >
            {icon}
            <Typography
                variant="body2"
                sx={{
                    color: "text.secondary",
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}
export default ClassInfoEntry;
