import { Box, useTheme } from "@mui/material";
import Image from "next/image";
import { useEffect, useState } from "react";

import { IntegrationProfile } from "@/types/integration";

function IntegrationLogo({ integrationProfile }: { integrationProfile: IntegrationProfile }) {
    const [themeMode, setThemeMode] = useState<"dark" | "light" | null>(null);
    const theme = useTheme();

    useEffect(() => {
        setThemeMode(theme.palette.mode);
    }, [theme.palette.mode]);

    return (
        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
            {themeMode && (
                <Image
                    src={
                        themeMode === "dark"
                            ? integrationProfile.images.dark.largeLogo
                            : integrationProfile.images.light.largeLogo
                    }
                    alt={`${integrationProfile.identifier}-rezervo`}
                    layout={"fill"}
                    objectFit={"contain"}
                    objectPosition={"center"}
                />
            )}
        </Box>
    );
}

export default IntegrationLogo;
