import { Box, useMediaQuery } from "@mui/material";

import { ChainProfile } from "@/types/openapi";

function ChainLogo({ chainProfile }: { chainProfile: ChainProfile }) {
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

    return (
        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
            <img
                src={`${import.meta.env.VITE_CONFIG_HOST}/${prefersDark ? chainProfile.images.dark.largeLogo : chainProfile.images.light.largeLogo}`}
                alt={`${chainProfile.identifier}-rezervo`}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                }}
            />
        </Box>
    );
}

export default ChainLogo;
