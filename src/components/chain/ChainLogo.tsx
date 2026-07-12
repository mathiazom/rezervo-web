import { useMediaQuery } from "@mui/material";

import ImageWithSkeleton from "@/components/utils/ImageWithSkeleton";
import { ChainProfile } from "@/types/openapi";

function ChainLogo({ chainProfile }: { chainProfile: ChainProfile }) {
    const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");

    return (
        <ImageWithSkeleton
            src={`${import.meta.env.VITE_CONFIG_HOST}/${prefersDark ? chainProfile.images.dark.largeLogo : chainProfile.images.light.largeLogo}`}
            alt={`${chainProfile.identifier}-rezervo`}
            style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
            }}
        />
    );
}

export default ChainLogo;
