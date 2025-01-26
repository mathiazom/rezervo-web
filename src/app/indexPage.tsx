"use client";

import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import ChainLogo from "@/components/utils/ChainLogo";
import ChainLogoSpinner from "@/components/utils/ChainLogoSpinner";
import PWAInstallPrompt from "@/components/utils/PWAInstallPrompt";
import { getStoredSelectedChain } from "@/lib/helpers/storage";
import { ChainIdentifier } from "@/types/chain";
import { IndexPageProps } from "@/types/serialization";

const IndexPage = ({ chainProfiles }: IndexPageProps) => {
    const theme = useTheme();
    const router = useRouter();
    const [checkedLocalStorage, setCheckedLocalStorage] = useState(false);
    const [chainLoading, setChainLoading] = useState<ChainIdentifier | null>(null);

    useEffect(() => {
        const storedChain = getStoredSelectedChain();
        if (storedChain !== null) {
            router.push(`/${storedChain}`);
        } else {
            setCheckedLocalStorage(true);
        }
    }, [router]);

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
                <Typography
                    variant="h4"
                    sx={{
                        mt: "1rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                        color: theme.palette.primary.main,
                    }}
                >
                    rezervo
                </Typography>
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
                            <Link
                                key={chainProfile.identifier}
                                href={`/${chainProfile.identifier}`}
                                style={{ width: "100%" }}
                                passHref
                                legacyBehavior
                            >
                                <Button
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        padding: "1.75rem",
                                        height: "6rem",
                                        width: "18rem",
                                    }}
                                    disableTouchRipple
                                    component={"a"}
                                    onClick={() => setChainLoading(chainProfile.identifier)}
                                >
                                    {chainLoading !== chainProfile.identifier ? (
                                        <ChainLogo chainProfile={chainProfile} />
                                    ) : (
                                        <ChainLogoSpinner chainProfile={chainProfile} />
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </Box>
            </Box>
        </>
    );
};

export default IndexPage;
