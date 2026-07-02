import { Modal } from "@mui/material";

import Settings from "@/components/modals/Settings/Settings";
import { useFeatures } from "@/lib/hooks/useFeatures";
import { ChainConfig, ChainProfile } from "@/types/openapi";

const SettingsModal = ({
    open,
    onClose,
    chainProfiles,
    chainConfigs,
    isPWAInstalled,
    showPWAInstall,
}: {
    open: boolean;
    onClose: () => void;
    chainProfiles: ChainProfile[];
    chainConfigs: Record<string, ChainConfig>;
    isPWAInstalled: boolean;
    showPWAInstall: () => void;
}) => {
    const { features } = useFeatures();

    return (
        <Modal open={open} onClose={onClose}>
            <Settings
                chainProfiles={chainProfiles}
                chainConfigs={chainConfigs}
                features={features}
                isPWAInstalled={isPWAInstalled}
                showPWAInstall={showPWAInstall}
            />
        </Modal>
    );
};

export default SettingsModal;
