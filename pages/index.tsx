import type {NextPage} from 'next'
import React, {memo, useCallback, useMemo, useState} from "react";
import {Box, Container, Divider, Stack, Typography, useTheme} from "@mui/material";
import Head from "next/head";
import Schedule from "../components/Schedule";
import Config from "../components/Config";
import {SitSchedule} from "../types/sitTypes";
import {fetchSchedule} from "../lib/iBooking";

// Memoize to avoid redundant schedule re-render on class selection change
const ScheduleMemo = memo(Schedule);

export async function getStaticProps() {
    const schedule = await fetchSchedule();
    const invalidationTimeInSeconds = 60*60;

    return {
        props: {
            schedule,
        },
        revalidate: invalidationTimeInSeconds
    }
}

const Index: NextPage<{schedule: SitSchedule}> = ({schedule}) => {
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
        <div>
            <Head>
                <title>sit-rezervo/config.yaml</title>
                <link rel="icon" href="/favicon.svg" />
            </Head>
            <div>
                <Box height={"8vh"} display="flex" alignItems={"center"}>
                    <Typography variant="h5" component="div" py={2} pl={3}>
                        <strong
                            style={{color: theme.palette.primary.main}}>sit-rezervo</strong> / <code>config.yaml</code>
                    </Typography>
                </Box>
                <Divider/>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    divider={<Divider orientation="vertical" flexItem/>}
                >
                    <Container maxWidth={false} sx={{height: { xs: '70vh', md: '91vh' }, overflow: 'auto'}}>
                        <ScheduleMemo schedule={schedule} onSelectedChanged={onSelectedChanged}/>
                    </Container>
                    <Container sx={{paddingY: 2, height: { xs: 'auto', md: '91vh' }, overflow: 'auto', maxWidth: {xs: "100%", md: 444}}}>
                        <Config classes={classes} selectClassIds={selectedClassIds}/>
                    </Container>
                </Stack>
            </div>
        </div>
    )
}

export default Index
