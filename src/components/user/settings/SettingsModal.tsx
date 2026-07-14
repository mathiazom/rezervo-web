import { GetApp, SettingsRounded } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, Divider, Modal } from "@mui/material";

import CalendarFeed from "@/components/user/settings/CalendarFeed";
import Memberships from "@/components/user/settings/memberships/Memberships";
import NotificationSettings from "@/components/user/settings/NotificationSettings";
import ModalWrapper from "@/components/utils/ModalWrapper";
import { INSTALL_PROMPT_DESCRIPTION } from "@/components/utils/PWAInstallPrompt";
import { useChainProfiles } from "@/lib/hooks/useChainProfiles";
import { usePWAInstall } from "@/lib/pwaInstallProvider";
import { isNonEmptyArray } from "@/lib/utils/arrayUtils";

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const chainProfiles = useChainProfiles();
    const { isPWAInstalled, showPWAInstall } = usePWAInstall();

    return (
        <Modal open={open} onClose={onClose}>
            <ModalWrapper title={"Innstillinger"} icon={<SettingsRounded />}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {!isPWAInstalled && (
                        <>
                            <Alert severity="info" icon={<GetApp />}>
                                <AlertTitle>
                                    Installer <b>rezervo</b> som app
                                </AlertTitle>
                                {INSTALL_PROMPT_DESCRIPTION}
                            </Alert>
                            <Button color={"info"} variant={"outlined"} startIcon={<GetApp />} onClick={showPWAInstall}>
                                Installer
                            </Button>
                        </>
                    )}
                    {isNonEmptyArray(chainProfiles) && <Memberships chainProfiles={chainProfiles} />}
                    <Divider sx={{ my: 1 }} />
                    <NotificationSettings />
                    <Divider sx={{ my: 1 }} />
                    <CalendarFeed />
                </Box>
            </ModalWrapper>
        </Modal>
    );
}
