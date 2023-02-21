import type {NextPage} from 'next'
import React, {memo, useCallback, useMemo, useState} from "react";
import {Box, Container, Divider, Stack, Typography, useTheme} from "@mui/material";
import Head from "next/head";
import Schedule from "../components/Schedule";
import Config from "../components/Config";
import {SitSchedule} from "../types/sitTypes";
import {fetchActivityDemands, fetchSchedule} from "../lib/iBooking";
import {ActivityDemand} from "../types/derivedTypes";

// Memoize to avoid redundant schedule re-render on class selection change
const ScheduleMemo = memo(Schedule);

export async function getStaticProps() {
    const schedule = await fetchSchedule();
    const activityDemands = await fetchActivityDemands();
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            schedule,
            activityDemands
        },
        revalidate: invalidationTimeInSeconds
    }
}

const Index: NextPage<{ schedule: SitSchedule, activityDemands: ActivityDemand[] }> = ({schedule, activityDemands}) => {
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

    const classes = useMemo(() => {
        return schedule?.days.flatMap((d) => d.classes) ?? []
    }, [schedule?.days])

    const onSelectedChanged = useCallback((classId: string, selected: boolean) => {
        if (selected) {
            setSelectedClassIds((s) => s.includes(classId) ? s : [...s, classId])
        } else {
            setSelectedClassIds((s) => s.filter((c) => c != classId))
        }
    }, [])

    const theme = useTheme()

    return (
        <>
            <Head>
                <title>sit-rezervo/config.yaml</title>
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
                <link rel="manifest" href="/site.webmanifest"/>
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
                <meta name="msapplication-TileColor" content="#da532c"/>
                <meta name="theme-color" content="#ffffff"/>
            </Head>
            <Stack divider={<Divider orientation="horizontal" flexItem/>}>
                <Box height={"8vh"} display="flex" alignItems={"center"}>
                    <Typography variant="h5" component="div" py={2} pl={3}>
                        <strong
                            style={{color: theme.palette.primary.main}}>sit-rezervo</strong> / <code>config.yaml</code>
                    </Typography>
                </Box>
                <Stack
                    direction={{xs: 'column', md: 'row'}}
                    divider={<Divider orientation="vertical" flexItem/>}
                >
                    <Container maxWidth={false} sx={{height: {xs: '70vh', md: '92vh'}, overflow: 'auto'}}>
                        <ScheduleMemo schedule={schedule} activityDemands={activityDemands} onSelectedChanged={onSelectedChanged}/>
                    </Container>
                    <Container sx={{
                        paddingY: 2,
                        height: {xs: 'auto', md: '92vh'},
                        overflow: 'auto',
                        maxWidth: {xs: "100%", md: 444}
                    }}>
                        <Config classes={classes} selectClassIds={selectedClassIds}/>
                    </Container>
                </Stack>
            </Stack>
        </>
    )
}

export default Index
