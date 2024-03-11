import { Chip, ChipProps } from "@mui/material";
import React from "react";

function ClassInfoChip(props: ChipProps) {
    return (
        <Chip
            color={"primary"}
            sx={{
                color: "#fff",
                height: "auto",
                py: 0.3,
                "& .MuiChip-label": {
                    whiteSpace: "normal",
                },
            }}
            {...props}
        />
    );
}
export default ClassInfoChip;
