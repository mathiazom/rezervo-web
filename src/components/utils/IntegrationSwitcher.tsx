import { Button, Divider, Drawer, List, ListItem, ListItemButton, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

import IntegrationLogo from "@/components/utils/IntegrationLogo";
import activeIntegrations from "@/lib/integrations/active";
import { IntegrationProfile } from "@/types/integration";

function SelectIntegration({ currentIntegrationProfile }: { currentIntegrationProfile: IntegrationProfile }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <IntegrationLogo integrationProfile={currentIntegrationProfile} />
            </Button>
            <Drawer anchor={"left"} open={open} onClose={() => setOpen(false)}>
                <List>
                    <ListItem>
                        <Typography variant={"h6"}>Velg ditt treningssenter</Typography>
                    </ListItem>
                    <Divider />
                    {Object.values(activeIntegrations).map((integration) => (
                        <ListItem
                            value={integration.profile.acronym}
                            key={integration.profile.acronym}
                            onClick={async () => {
                                setOpen(false);
                                if (router.asPath.includes(integration.profile.acronym)) {
                                    return;
                                }
                                await router.push(`/${integration.profile.acronym}`);
                            }}
                        >
                            <ListItemButton sx={{ display: "flex", justifyContent: "center" }}>
                                <IntegrationLogo integrationProfile={integration.profile} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
}

export default SelectIntegration;
