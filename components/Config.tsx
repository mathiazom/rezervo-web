import {Alert, Box, createTheme, ThemeProvider} from "@mui/material";
import {CopyBlock, obsidian} from "react-code-blocks";
import React, {useMemo} from "react";
import {SitClass} from "../types/sit_types";


const codeTheme = createTheme({
    typography: {
        fontFamily: "monospace"
    }
});

const Config = ({classes, selectClassIds}: { classes: SitClass[], selectClassIds: string[] }) => {

    // Pre-generate all class config strings
    const allClassesConfigs = useMemo(() => {
        function timeForClass(_class: SitClass) {
            const date = new Date(_class.from)
            return {
                hour: date.getHours(),
                minute: date.getMinutes()
            }
        }

        function configForClass(_class: SitClass) {
            const time = timeForClass(_class)
            return `- activity: ${_class.activityId}
    display_name: "${_class.name}"
    weekday: ${_class.weekday}
    studio: ${_class.studio.id}
    time:
      hour: ${time.hour}
      minute: ${time.minute}`
        }

        return classes.map((c) => [c.id.toString(), configForClass(c)])
    }, [classes])

    const selectedClassesConfig = selectClassIds.length > 0 ?
        `classes:\n  ${allClassesConfigs.filter(([classId]) => selectClassIds.includes(classId)).map(([, config]) => config).join("\n  ")}` : '';

    return (
        selectClassIds.length > 0 ?
            <ThemeProvider theme={codeTheme}>
                <CopyBlock
                    text={selectedClassesConfig}
                    language={"yaml"}
                    wrapLines
                    theme={obsidian}
                    copied={false}
                />
            </ThemeProvider>
            :
            <Box>
                <Alert severity="info">Select classes to the left to generate your <code>config.yaml</code></Alert>
            </Box>
    )
}

export default Config