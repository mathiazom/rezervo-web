import {Alert, Box, useTheme} from "@mui/material";
import React, {useMemo} from "react";
import {SitClass} from "../types/sitTypes";
import IconButton from '@mui/material/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircle from '@mui/icons-material/CheckCircle';
import {PrismLight as SyntaxHighlighter} from 'react-syntax-highlighter';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml';
import coldarkDark from 'react-syntax-highlighter/dist/cjs/styles/prism/coldark-dark';
import coldarkCold from 'react-syntax-highlighter/dist/cjs/styles/prism/coldark-cold';
import {useCopyToClipboard} from "../hooks/useCopyToClipboard";


SyntaxHighlighter.registerLanguage('yaml', yaml);


const Config = ({classes, selectClassIds}: { classes: SitClass[], selectClassIds: string[] }) => {

    const theme = useTheme()

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
        `classes:\n  ${allClassesConfigs.filter(([classId]) => selectClassIds.includes(String(classId))).map(([, config]) => config).join("\n  ")}` : '';

    const [isCopiedToClipboard, copyToClipboard] = useCopyToClipboard(selectedClassesConfig, {successDuration: 2000});

    return (
        selectClassIds.length > 0 ?
            <Box sx={{
                position: "relative",
                ":hover .config-copy-icon": {
                    opacity: 1
                }
            }}>
                <IconButton
                    onClick={() => copyToClipboard(selectedClassesConfig)}
                    aria-label={"Copy config"}
                    className={"config-copy-icon"}
                    sx={{
                        aspectRatio: "1 / 1",
                        position: "absolute",
                        top: 8,
                        right: 8,
                        opacity: {xs: 1, md: 0},
                        transition: "opacity 200ms ease"
                    }}>
                    {isCopiedToClipboard ? <CheckCircle/> : <ContentCopyIcon/>}
                </IconButton>
                <SyntaxHighlighter
                    language={"yaml"}
                    style={theme.palette.mode === "dark" ? coldarkDark : coldarkCold}
                    customStyle={{borderRadius: 8}}
                >
                    {selectedClassesConfig}
                </SyntaxHighlighter>
            </Box>
            :
            <Box>
                <Alert severity="info">Select classes to the left to generate your <code>config.yaml</code></Alert>
            </Box>
    )
}

export default Config
