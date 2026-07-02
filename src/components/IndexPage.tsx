import { Box, Divider, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import ChainLogo from "@/components/utils/ChainLogo";
import ChainLogoSpinner from "@/components/utils/ChainLogoSpinner";
import { ButtonLink } from "@/components/utils/links";
import PWAInstallPrompt from "@/components/utils/PWAInstallPrompt";
import RezervoLogo from "@/components/utils/RezervoLogo";
import { getStoredSelectedChain } from "@/lib/helpers/storage";
import { ChainProfile } from "@/types/openapi";

const IndexPage = ({ chainProfiles }: { chainProfiles: ChainProfile[] }) => {
    const navigate = useNavigate();
    const [checkedLocalStorage, setCheckedLocalStorage] = useState(false);
    const [chainLoading, setChainLoading] = useState<string | null>(null);

    useEffect(() => {
        const storedChain = getStoredSelectedChain();
        if (storedChain !== null) {
            void navigate({ to: "/$chain", params: { chain: storedChain } });
        } else {
            setCheckedLocalStorage(true);
        }
    }, [navigate]);

    if (!checkedLocalStorage) {
        return;
    }

    return (
        <>
            <PWAInstallPrompt />
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <RezervoLogo sx={{ mt: "1rem", marginBottom: "1rem" }} />
                <Typography variant={"h6"} sx={{ padding: "0.5rem", textAlign: "center" }}>
                    Velg treningssenter
                </Typography>
                <Divider />
                <Box
                    sx={{
                        justifyContent: "center",
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                    }}
                >
                    {chainProfiles.map((chainProfile) => {
                        return (
                            <ButtonLink
                                key={chainProfile.identifier}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    padding: "1.75rem",
                                    height: "6rem",
                                    width: "18rem",
                                }}
                                disableTouchRipple
                                to="/$chain"
                                params={{ chain: chainProfile.identifier }}
                                onClick={() => setChainLoading(chainProfile.identifier)}
                            >
                                {chainLoading !== chainProfile.identifier ? (
                                    <ChainLogo chainProfile={chainProfile} />
                                ) : (
                                    <ChainLogoSpinner chainProfile={chainProfile} />
                                )}
                            </ButtonLink>
                        );
                    })}
                </Box>
            </Box>
        </>
    );
};

export default IndexPage;
