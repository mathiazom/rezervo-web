import { Typography } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import { useUserSessions } from "@/lib/hooks/useUserSessions";
import { useUserSessionsIndex } from "@/lib/hooks/useUserSessionsIndex";
import { ChainIdentifier, RezervoClass } from "@/types/chain";

function ConfirmCancellation({
    open,
    setOpen,
    setLoading,
    chain,
    _class,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    chain: ChainIdentifier;
    _class: RezervoClass;
}) {
    const { mutateSessionsIndex } = useUserSessionsIndex(chain);
    const { mutateUserSessions } = useUserSessions();
    async function cancelBooking() {
        setOpen(false);
        setLoading(true);
        await fetch(`/api/${chain}/cancel-booking`, {
            method: "POST",
            body: JSON.stringify({ class_id: _class.id.toString() }, null, 2),
        });
        await mutateSessionsIndex();
        await mutateUserSessions();
        setLoading(false);
        setOpen(false);
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
