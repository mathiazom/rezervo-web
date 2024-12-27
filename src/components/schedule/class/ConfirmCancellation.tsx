import { Typography } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import { post } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
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
    const { token } = useUser();
    const { mutateSessionsIndex } = useUserSessionsIndex(chain);
    const { mutateUserSessions } = useUserSessions();
    async function cancelBooking() {
        if (token == null) return; // TODO: error handling
        setOpen(false);
        setLoading(true);
        await post(`${chain}/cancel-booking`, {
            body: JSON.stringify({ classId: _class.id.toString() }, null, 2),
            mode: "client",
            accessToken: token,
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
