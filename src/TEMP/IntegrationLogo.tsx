import { Box } from "@mui/material";
import Image from "next/image";
import React from "react";

function IntegrationLogo({ integrationAcronym }: { integrationAcronym: string }) {
    return (
        <Box
            sx={{
                position: "relative",
                height: 30,
                width: 75,
            }}
        >
            <Image
                src={`/${integrationAcronym}.svg`}
                alt={`${integrationAcronym}-rezervo`}
                layout={"fill"}
                objectFit={"contain"}
                objectPosition={"center"}
            />
        </Box>
    );
}

export default IntegrationLogo;
