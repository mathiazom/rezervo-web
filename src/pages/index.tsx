import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import ChainLogo from "@/components/utils/ChainLogo";
import ChainLogoSpinner from "@/components/utils/ChainLogoSpinner";
import PageHead from "@/components/utils/PageHead";
import activeChains, { ChainIdentifier } from "@/lib/activeChains";
import { getStoredSelectedChain } from "@/lib/helpers/storage";

function IndexPage() {
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
            <PageHead title={"rezervo"} />
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
                    {Object.values(activeChains).map((chain) => {
                        return (
                            <Link
                                key={chain.profile.identifier}
                                href={`/${chain.profile.identifier}`}
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
                                    onClick={() => setChainLoading(chain.profile.identifier)}
                                >
                                    {chainLoading !== chain.profile.identifier ? (
                                        <ChainLogo chainProfile={chain.profile} />
                                    ) : (
                                        <ChainLogoSpinner chainProfile={chain.profile} />
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </Box>
            </Box>
        </>
    );
}

export default IndexPage;
