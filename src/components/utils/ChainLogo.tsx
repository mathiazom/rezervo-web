import { Box, useMediaQuery } from "@mui/material";
import Image from "next/image";

import { ChainProfile } from "@/types/chain";

function ChainLogo({ chainProfile }: { chainProfile: ChainProfile }) {
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

    return (
        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
            <Image
                src={`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/${prefersDark ? chainProfile.images.dark.largeLogo : chainProfile.images.light.largeLogo}`}
                alt={`${chainProfile.identifier}-rezervo`}
                fill={true}
                style={{
                    objectFit: "contain",
                    objectPosition: "center",
                }}
                priority={true}
                unoptimized // png image optimization fails for production builds
            />
        </Box>
    );
}

export default ChainLogo;
