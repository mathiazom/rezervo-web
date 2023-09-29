import { Box, Button, Divider, Typography, useTheme } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import IntegrationLogo from "@/components/utils/IntegrationLogo";
import { getStoredSelectedIntegration } from "@/lib/helpers/localStorage";
import activeIntegrations from "@/lib/integrations/active";

function IndexPage() {
    const theme = useTheme();
    const router = useRouter();
    const [checkedLocalStorage, setCheckedLocalStorage] = useState(false);

    useEffect(() => {
        const storedIntegration = getStoredSelectedIntegration();
        if (storedIntegration !== null) {
            router.push(`/${storedIntegration}`);
        } else {
            setCheckedLocalStorage(true);
        }
    }, [router]);

    if (!checkedLocalStorage) {
        return;
    }

    return (
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
                {Object.values(activeIntegrations).map((integration) => {
                    return (
                        <Link
                            key={integration.profile.acronym}
                            href={`/${integration.profile.acronym}`}
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
                            >
                                <IntegrationLogo integrationProfile={integration.profile} />
                            </Button>
                        </Link>
                    );
                })}
            </Box>
        </Box>
    );
}

export default IndexPage;
