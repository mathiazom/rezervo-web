import { Avatar } from "@mui/material";

import { ChainProfile } from "@/types/chain";

export default function ChainLogoSpinner({ chainProfile }: { chainProfile: ChainProfile }) {
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
            src={`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/${chainProfile.images.common.smallLogo}`}
        >
            {chainProfile.identifier}
        </Avatar>
    );
}
