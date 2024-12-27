import { Add } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import React, { useState } from "react";

import AddMembershipDialog from "@/components/modals/Settings/Memberships/AddMembershipDialog";
import ChainMembership from "@/components/modals/Settings/Memberships/ChainMembership";
import MembershipLoginModal from "@/components/modals/Settings/Memberships/MembershipLoginModal";
import SubHeader from "@/components/modals/SubHeader";
import { ChainIdentifier, ChainProfile } from "@/types/chain";
import { ChainConfig } from "@/types/config";

type MemberShipLoginState = {
    open: boolean;
    chainProfile: ChainProfile;
};

function Memberships({
    chainProfiles,
    chainConfigs,
}: {
    chainProfiles: ChainProfile[];
    chainConfigs: Record<ChainIdentifier, ChainConfig>;
}) {
    const [showAddMembershipDialog, setShowAddMembershipDialog] = useState(false);
    const [membershipLoginState, setMembershipLoginState] = useState<MemberShipLoginState>({
        open: false,
        chainProfile: chainProfiles[0]!,
    });
    const hasAllMemberships = Object.keys(chainConfigs).length === chainProfiles.length;
    return (
        <>
            <SubHeader title={"Mine medlemskap"} sx={{}} />
            {Object.keys(chainConfigs).length === 0 && (
                <Alert severity={"info"}>
                    <AlertTitle>
                        Koble medlemskap til <b>rezervo</b>
                    </AlertTitle>
                    Du har ikke lagt til noen medlemskap enda. Trykk på {'"'}Legg til medlemskap{'"'} for å koble{" "}
                    <b>rezervo</b> til ditt treningssenter
                </Alert>
            )}
            {Object.keys(chainConfigs)
                .sort((a, b) => a.localeCompare(b))
                .map((chain) => {
                    const chainProfile = chainProfiles.find((chainProfile) => chainProfile.identifier === chain)!;
                    return (
                        <ChainMembership
                            key={chain}
                            chainProfile={chainProfile}
                            openMembershipLoginModal={() => setMembershipLoginState({ open: true, chainProfile })}
                        />
                    );
                })}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                    startIcon={<Add />}
                    variant={"outlined"}
                    disabled={hasAllMemberships}
                    onClick={() => setShowAddMembershipDialog(true)}
                >
                    Legg til medlemskap
                </Button>
                {hasAllMemberships && (
                    <Typography variant={"body2"} sx={{ opacity: 0.6, fontStyle: "italic", textAlign: "center" }}>
                        Du har allerede lagt til alle treningssenterne rezervo støtter 🎉
                    </Typography>
                )}
            </Box>
            <AddMembershipDialog
                availableChainProfiles={chainProfiles.filter(
                    (cp) => !Object.keys(chainConfigs).includes(cp.identifier),
                )}
                open={showAddMembershipDialog}
                onClose={() => setShowAddMembershipDialog(false)}
                onAdd={(chainProfile) => {
                    setShowAddMembershipDialog(false);
                    setMembershipLoginState({ open: true, chainProfile });
                }}
            />
            <MembershipLoginModal
                open={membershipLoginState.open}
                close={() => setMembershipLoginState((prev) => ({ ...prev, open: false }))}
                chainProfile={membershipLoginState.chainProfile}
            />
        </>
    );
}

export default Memberships;
