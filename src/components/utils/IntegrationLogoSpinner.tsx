import { Avatar } from "@mui/material";
import React from "react";

import { IntegrationProfile } from "@/types/integration";

export default function IntegrationLogoSpinner({ integrationProfile }: { integrationProfile: IntegrationProfile }) {
    return (
        <Avatar
            sx={{
                width: "3rem",
                height: "3rem",
                animation: "spin 0.8s linear infinite",
                "@keyframes spin": {
                    "0%": {
                        transform: "rotate(0deg)",
                    },
                    "100%": {
                        transform: "rotate(360deg)",
                    },
                },
            }}
            src={integrationProfile.images.common.smallLogo}
        >
            {integrationProfile.acronym}
        </Avatar>
    );
}
