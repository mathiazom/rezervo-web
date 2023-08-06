import { Box } from "@mui/material";
import React from "react";
import Logo from "./utils/Logo";
import ConfigBar from "./configuration/ConfigBar";

export default function AppBar({
    isLoadingConfig,
    isConfigError,
    changed,
    agendaEnabled,
    onUpdateConfig,
    onUndoSelectionChanges,
    onSettingsOpen,
    onAgendaOpen,
}: {
    isLoadingConfig: boolean;
    isConfigError: boolean;
    changed: boolean;
    agendaEnabled: boolean;
    onUpdateConfig: () => void;
    onUndoSelectionChanges: () => void;
    onSettingsOpen: () => void;
    onAgendaOpen: () => void;
}) {
    return (
        <Box display={"flex"} justifyContent={"center"}>
            <Box width={1388}>
                <Box display="flex" py={2} alignItems={"center"}>
                    <Logo integrationAcronym={"fsc"} />
                    <Box sx={{ marginLeft: "auto", marginRight: { xs: 1, md: 2 } }}>
                        <ConfigBar
                            isLoadingConfig={isLoadingConfig}
                            isConfigError={isConfigError}
                            changed={changed}
                            agendaEnabled={agendaEnabled}
                            onUpdateConfig={onUpdateConfig}
                            onUndoSelectionChanges={onUndoSelectionChanges}
                            onSettingsOpen={onSettingsOpen}
                            onAgendaOpen={onAgendaOpen}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
