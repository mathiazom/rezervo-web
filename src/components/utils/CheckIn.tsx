import { WhereToVote } from "@mui/icons-material";
import {
    Alert,
    AlertTitle,
    Collapse,
    Fab,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    MenuItem,
    Modal,
    Select,
    Stack,
    Switch,
    Tooltip,
} from "@mui/material";
import Button from "@mui/material/Button";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ModalWrapper from "@/components/modals/ModalWrapper";
import { post } from "@/lib/helpers/requests";
import { getStoredCheckInConfiguration, storeCheckInConfiguration } from "@/lib/helpers/storage";
import { useChainUser } from "@/lib/hooks/useChainUser";
import { useUser } from "@/lib/hooks/useUser";
import { CheckInTerminal, RezervoChain } from "@/types/chain";

export interface CheckInLocation {
    id: string;
    name: string;
    terminals: CheckInTerminal[];
}

enum ValidationError {
    LOCATION_MISSING = "LOCATION_MISSING",
    TERMINAL_MISSING = "TERMINAL_MISSING",
}
enum CheckInResult {
    SUCCESS = "SUCCESS",
    FAILURE = "FAILURE",
}

const checkInMessages = [
    "Vi håper du får en god økt! 🤸‍♀️",
    "Gi alt på trening i dag! 💪",
    "Ha det gøy på trening! 💃",
    "Kos deg med dagens trening! 🤗",
];

function getRandomCheckInMessage() {
    const randomIndex = Math.floor(Math.random() * checkInMessages.length);
    return checkInMessages[randomIndex] ?? "";
}

function filterAvailableCheckInLocations(chain: RezervoChain, selectedLocationIds: string[]) {
    return chain.branches.flatMap((branch) =>
        branch.locations
            .filter(
                (location) => selectedLocationIds.includes(location.identifier) && location.checkInTerminals.length > 0,
            )
            .map(
                (location): CheckInLocation => ({
                    id: location.identifier,
                    name: `${chain.profile.name} ${location.name}`,
                    terminals: location.checkInTerminals,
                }),
            ),
    );
}

// TODO after merged: Check whether you can actually check in to a class *without* printing a ticket, aka. that you are registered as attending even without printing a ticket
export default function CheckIn({
    chain,
    selectedLocationIds,
}: {
    chain: RezervoChain;
    selectedLocationIds: string[];
}) {
    const [open, setOpen] = useState(false);
    const [location, setLocation] = useState<CheckInLocation | undefined>();
    const [terminal, setTerminal] = useState<CheckInTerminal | undefined>();
    const [printTicket, setPrintTicket] = useState<boolean>(true);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkInResult, setCheckInResult] = useState<CheckInResult | undefined>();
    const [successMessage, setSuccessMessage] = useState("");
    const timerRef = useRef<number | null>(null);

    const { token } = useUser();
    const { chainUser } = useChainUser(chain.profile.identifier);

    // Prevent infinite re-rendering
    const availableCheckInLocations = useMemo(
        () => filterAvailableCheckInLocations(chain, selectedLocationIds),
        [chain, selectedLocationIds],
    );

    function clearCheckInResult() {
        setCheckInResult(undefined);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }

    function handleClose() {
        setOpen(false);
        setLoading(false);
        setPrintTicket(true);
        clearCheckInResult();
        setValidationErrors([]);
        applyStoredCheckInConfiguration();
    }

    function setTerminalIfOnlyOneAvailable(location?: CheckInLocation) {
        if (location?.terminals.length === 1) {
            setTerminal(location.terminals[0]);
            setValidationErrors((prev) => prev.filter((error) => error !== ValidationError.TERMINAL_MISSING));
        } else {
            setTerminal(undefined);
        }
    }

    function validateForm() {
        const validationErrors: ValidationError[] = [];
        if (location === undefined) {
            validationErrors.push(ValidationError.LOCATION_MISSING);
        }
        if (terminal === undefined) {
            validationErrors.push(ValidationError.TERMINAL_MISSING);
        }
        return validationErrors;
    }

    function handleSuccess() {
        setSuccessMessage(getRandomCheckInMessage());
        setCheckInResult(CheckInResult.SUCCESS);
        timerRef.current = window.setTimeout(() => {
            setCheckInResult(undefined);
        }, 3000);
    }

    async function handleSubmit() {
        if (checkInResult === CheckInResult.SUCCESS) return;
        clearCheckInResult();

        const validationErrors = validateForm();
        setValidationErrors(validationErrors);
        if (validationErrors.length > 0) return;

        setLoading(true);

        storeCheckInConfiguration({
            previousLocation: location,
            previousTerminal: terminal,
        });

        try {
            const response = await post(`${chain.profile.identifier}/check-in`, {
                body: JSON.stringify({ location: location?.id, terminalId: terminal?.id, printTicket }, null, 2),
                mode: "client",
                accessToken: token!,
            });

            if (response.ok && response.status === 200) {
                handleSuccess();
            } else {
                setCheckInResult(CheckInResult.FAILURE);
            }
        } catch (error) {
            console.error(error);
            setCheckInResult(CheckInResult.FAILURE);
        }
        setLoading(false);
    }

    const applyStoredCheckInConfiguration = useCallback(() => {
        const storedCheckInConfiguration = getStoredCheckInConfiguration();
        if (
            availableCheckInLocations.some(
                (location) => location.id === storedCheckInConfiguration?.previousLocation?.id,
            )
        ) {
            setLocation(storedCheckInConfiguration?.previousLocation);
            setTerminal(storedCheckInConfiguration?.previousTerminal);
        }
    }, [availableCheckInLocations]);

    useEffect(() => {
        if (availableCheckInLocations.length === 1) {
            const location = availableCheckInLocations[0]!;
            setLocation(location);
            setTerminalIfOnlyOneAvailable(location);
        }
        applyStoredCheckInConfiguration();
    }, [availableCheckInLocations, applyStoredCheckInConfiguration]);

    if (!chainUser || availableCheckInLocations.length === 0) {
        return <></>;
    }

    return (
        <>
            <Tooltip title={"Sjekk inn"}>
                <Fab
                    color={"primary"}
                    sx={{
                        position: "absolute",
                        right: 30,
                        bottom: 30,
                    }}
                    onClick={() => setOpen(!open)}
                >
                    <WhereToVote sx={{ color: "white" }} />
                </Fab>
            </Tooltip>
            <Modal open={open} onClose={handleClose}>
                <ModalWrapper
                    title={"Sjekk inn"}
                    description={
                        "Sjekk inn for å låse opp en dør, eller for å skrive ut en billett til en booket time."
                    }
                >
                    <Stack sx={{ justifyContent: "center", gap: 2, alignItems: "center" }}>
                        <FormControl sx={{ width: 300 }}>
                            <InputLabel id="select-check-in-location">Senter</InputLabel>
                            <Select
                                disabled={loading}
                                error={validationErrors.includes(ValidationError.LOCATION_MISSING)}
                                fullWidth
                                sx={{ width: "100%" }}
                                onChange={(event) => {
                                    const selectedLocation = availableCheckInLocations.find(
                                        (location) => location.id === event.target.value,
                                    );
                                    setLocation(selectedLocation);
                                    setTerminalIfOnlyOneAvailable(selectedLocation);
                                    setValidationErrors((prev) =>
                                        prev.filter((error) => error !== ValidationError.LOCATION_MISSING),
                                    );
                                    setCheckInResult(undefined);
                                }}
                                value={location?.id}
                                label={"Senter"}
                                labelId="select-check-in-location"
                            >
                                {availableCheckInLocations.map((location) => (
                                    <MenuItem value={location.id} key={location.id}>
                                        {location.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ width: 300 }}>
                            <InputLabel id="select-check-in-terminal">Terminal</InputLabel>
                            <Select
                                disabled={loading}
                                error={validationErrors.includes(ValidationError.TERMINAL_MISSING)}
                                fullWidth
                                onChange={(event) => {
                                    const selectedTerminal = location?.terminals.find(
                                        (terminal) => terminal.id === event.target.value,
                                    );
                                    setTerminal(selectedTerminal);
                                    setValidationErrors([]);
                                    setCheckInResult(undefined);
                                }}
                                value={terminal?.id}
                                label={"Terminal"}
                                labelId="select-check-in-terminal"
                            >
                                {location === undefined && terminal === undefined && (
                                    <MenuItem disabled>Du må velge senter først</MenuItem>
                                )}
                                {location?.terminals.map((terminal) => (
                                    <MenuItem value={terminal.id} key={terminal.id}>
                                        {terminal.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Stack alignItems={"center"}>
                            <FormControl sx={{ alignItems: "center" }}>
                                <FormControlLabel
                                    disabled={loading || terminal?.hasPrinter === false}
                                    control={
                                        <Switch
                                            color="primary"
                                            checked={printTicket && (terminal === undefined || terminal.hasPrinter)}
                                            onChange={(_, value) => setPrintTicket(value)}
                                        />
                                    }
                                    label="Skriv ut billett"
                                />
                                {terminal?.hasPrinter === false ? (
                                    <FormHelperText sx={{ fontStyle: "italic" }}>
                                        Denne terminalen har ingen printer
                                    </FormHelperText>
                                ) : (
                                    <FormHelperText>Billett skrives kun ut hvis du har booket en time</FormHelperText>
                                )}
                            </FormControl>
                            <FormControl sx={{ width: 300, mt: 3 }}>
                                <Collapse in={checkInResult === CheckInResult.SUCCESS}>
                                    <Alert>
                                        <AlertTitle>Innsjekk vellykket</AlertTitle>
                                        {successMessage}
                                    </Alert>
                                </Collapse>
                                <Collapse in={checkInResult === CheckInResult.FAILURE}>
                                    <Alert severity={"error"}>
                                        <AlertTitle>Innsjekk feilet</AlertTitle>
                                        Du kan prøve igjen, eller velge en annen terminal.
                                    </Alert>
                                </Collapse>
                                <Button
                                    loading={loading}
                                    onClick={handleSubmit}
                                    startIcon={<WhereToVote />}
                                    variant={"contained"}
                                    sx={{ color: "white", mt: 2 }}
                                >
                                    Sjekk inn
                                </Button>
                                {validationErrors.length > 0 && (
                                    <FormHelperText sx={{ textAlign: "center", color: "red" }}>
                                        Du må velge senter og terminal for å sjekke inn
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Stack>
                    </Stack>
                </ModalWrapper>
            </Modal>
        </>
    );
}
