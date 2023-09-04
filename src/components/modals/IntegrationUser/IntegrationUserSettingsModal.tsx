import { Dialog } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import IntegrationUserSettings from "@/components/modals/IntegrationUser/IntegrationUserSettings";
import { useIntegrationUser } from "@/lib/hooks/useIntegrationUser";
import { IntegrationIdentifier, IntegrationUserPayload } from "@/types/rezervo";

const IntegrationUserSettingsModal = ({
    open,
    setOpen,
    integration,
    onSubmit,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    integration: IntegrationIdentifier;
    onSubmit: () => void;
}) => {
    const { putIntegrationUser, putIntegrationUserIsMutating } = useIntegrationUser(integration);

    function submit(payload: IntegrationUserPayload) {
        putIntegrationUser(payload).then(() => {
            onSubmit();
        });
    }

    return (
        <Dialog
            open={open}
            onClose={() => {
                if (!putIntegrationUserIsMutating) {
                    setOpen(false);
                }
            }}
            maxWidth={"xs"}
            fullWidth={true}
        >
            <IntegrationUserSettings
                integration={integration}
                submit={submit}
                isSubmitting={putIntegrationUserIsMutating}
                onClose={() => setOpen(false)}
            />
        </Dialog>
    );
};

export default IntegrationUserSettingsModal;
