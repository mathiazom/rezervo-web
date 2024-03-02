import { Box, useTheme } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

import { ChainProfile } from "@/types/chain";

function ChainLogo({ chainProfile }: { chainProfile: ChainProfile }) {
    const [themeMode, setThemeMode] = useState<"dark" | "light" | null>(null);
    const theme = useTheme();

    useEffect(() => {
        setThemeMode(theme.palette.mode);
    }, [theme.palette.mode]);

    return (
        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
            {themeMode && (
                <Image
                    src={`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/${themeMode === "dark" ? chainProfile.images.dark.largeLogo : chainProfile.images.light.largeLogo}`}
                    alt={`${chainProfile.identifier}-rezervo`}
                    fill={true}
                    style={{
                        objectFit: "contain",
                        objectPosition: "center",
                    }}
                    unoptimized
                />
            )}
        </Box>
    );
}

export default ChainLogo;
