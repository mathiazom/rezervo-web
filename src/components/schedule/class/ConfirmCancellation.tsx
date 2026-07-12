import { Typography } from "@mui/material";
import { Dispatch, SetStateAction } from "react";

import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import { $api } from "@/lib/api/client";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { RezervoSessionClass } from "@/types/openapi";

function ConfirmCancellation({
    open,
    setOpen,
    setLoading,
    chainIdentifier,
    _class,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    chainIdentifier: string;
    _class: RezervoSessionClass;
}) {
    const { mutateSessionsIndex } = useUserSessionsIndex(chainIdentifier);
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
            params: { path: { chain_identifier: chainIdentifier } },
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
