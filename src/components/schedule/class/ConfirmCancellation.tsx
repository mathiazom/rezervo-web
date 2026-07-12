import { Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import { $api } from "@/lib/api/client";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { RezervoSessionClass } from "@/types/openapi";
import { useChain } from "@/lib/hooks/useChain";

function ConfirmCancellation({
    open,
    setOpen,
    setLoading,
    _class,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    _class: RezervoSessionClass;
}) {
    const chain = useChain();
    const { mutateSessionsIndex } = useUserSessionsIndex();
    const { mutateUserSessions } = useUserSessions();
    const cancelBookingMutation = $api.useMutation("post", "/{chain_identifier}/cancel-booking", {
        onSuccess: async () => {
            await mutateSessionsIndex();
            await mutateUserSessions();
        },
        onSettled: () => setLoading(false),
    });
    function cancelBooking() {
        setOpen(false);
        setLoading(true);
        cancelBookingMutation.mutate({
            params: { path: { chain_identifier: chain.profile.identifier } },
            body: { classId: _class.id },
        });
    }

    const classDescription = _class
        ? `${_class.activity.name} (${_class.startTime.weekdayLong}, ${_class.startTime.toFormat("HH:mm")})`
        : "";
    return (
        <ConfirmationDialog
            open={open}
            title={`Avbestille time?`}
            description={
                <>
                    <Typography>
                        Du er i ferd med å avbestille <b>{classDescription}</b>.
                    </Typography>
                    <br />
                    <Typography>Dette kan ikke angres!</Typography>
                </>
            }
            confirmText={"Avbestill"}
            onCancel={() => setOpen(false)}
            onConfirm={cancelBooking}
        />
    );
}

export default ConfirmCancellation;
