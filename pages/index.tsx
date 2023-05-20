import type { NextPage } from "next";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Container, Divider, Modal, Stack } from "@mui/material";
import Head from "next/head";
import Schedule from "../components/Schedule";
import { classConfigRecurrentId, fetchActivityPopularity, fetchSchedule, sitClassRecurrentId } from "../lib/iBooking";
import { ActivityPopularity, ClassPopularity } from "../types/derivedTypes";
import { SitClass, SitSchedule } from "../types/sitTypes";
import { useUser } from "@auth0/nextjs-auth0/client";
import { ClassConfig, ConfigPayload, UserConfig } from "../types/rezervoTypes";
import { arraysAreEqual } from "../utils/arrayUtils";
import Settings from "../components/Settings";
import { useRouter } from "next/router";
import AppBar from "../components/AppBar";
import MobileConfigUpdateBar from "../components/MobileConfigUpdateBar";
import ClassInfo from "../components/ClassInfo";
import Agenda from "../components/Agenda";

// Memoize to avoid redundant schedule re-render on class selection change
const ScheduleMemo = memo(Schedule);

export async function getStaticProps() {
    const schedule = await fetchSchedule();
    const activitiesPopularity = await fetchActivityPopularity();
    const invalidationTimeInSeconds = 60 * 60;

    return {
        props: {
            schedule,
            activitiesPopularity,
        },
        revalidate: invalidationTimeInSeconds,
    };
}

const Index: NextPage<{
    schedule: SitSchedule;
    activitiesPopularity: ActivityPopularity[];
}> = ({ schedule, activitiesPopularity }) => {
    const router = useRouter();

    const { user } = useUser();

    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [originalSelectedClassIds, setOriginalSelectedClassIds] = useState<string[]>([]);

    const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
    const [userConfigActive, setUserConfigActive] = useState(true);
    const [userConfigActiveLoading, setUserConfigActiveLoading] = useState(false);

    const [isLoadingConfig, setIsLoadingConfig] = useState(false);

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [agendaOpen, setAgendaOpen] = useState(false);

    const [modalClass, setModalClass] = useState<SitClass | null>(null);

    const selectionChanged = useMemo(
        () => !arraysAreEqual(selectedClassIds.sort(), originalSelectedClassIds.sort()),
        [originalSelectedClassIds, selectedClassIds]
    );

    const classes = useMemo(() => {
        return schedule?.days.flatMap((d) => d.classes) ?? [];
    }, [schedule?.days]);

    const onSelectedChanged = useCallback((classId: string, selected: boolean) => {
        if (selected) {
            setSelectedClassIds((s) => (s.includes(classId) ? s : [...s, classId]));
        } else {
            setSelectedClassIds((s) => s.filter((c) => c != classId));
        }
    }, []);

    useEffect(() => {
        if (user == null) {
            return;
        }
        setIsLoadingConfig(true);
        getConfig().then((c) => {
            setUserConfig(c);
        });
    }, [user]);

    useEffect(() => {
        setUserConfigActive(userConfig?.active ?? false);
    }, [userConfig]);

    useEffect(() => {
        const { classId } = router.query;
        if (classId === undefined) {
            return;
        }
        const linkedClass = schedule.days.flatMap((day) => day.classes).find((_class) => _class.id === Number(classId));
        if (linkedClass) {
            setModalClass(linkedClass);
        }
    }, [router.query, schedule.days]);

    useEffect(() => {
        setOriginalSelectedClassIds(userConfig?.classes?.map(classConfigRecurrentId) ?? []);
        setSelectedClassIds(userConfig?.classes?.map(classConfigRecurrentId) ?? []);
        setIsLoadingConfig(false);
    }, [userConfig]);

    async function getConfig() {
        return fetch("/api/config", {
            method: "GET",
        }).then((r) => r.json());
    }

    // Pre-generate all class config strings
    const allClassesConfigMap = useMemo(() => {
        function timeForClass(_class: SitClass) {
            const date = new Date(_class.from);
            return {
                hour: date.getHours(),
                minute: date.getMinutes(),
            };
        }
        const classesConfigMap = classes.reduce<{ [id: string]: ClassConfig }>(
            (o, c) => ({
                ...o,
                [sitClassRecurrentId(c)]: {
                    activity: c.activityId,
                    display_name: c.name,
                    weekday: c.weekday ?? -1,
                    studio: c.studio.id,
                    time: timeForClass(c),
                },
            }),
            {}
        );
        // Locate any class configs from the user config that do not exist in the current schedule
        const ghostClassesConfigs =
            userConfig?.classes
                ?.filter((c) => !(classConfigRecurrentId(c) in classesConfigMap))
                .reduce<{ [id: string]: ClassConfig }>(
                    (o, c) => ({
                        ...o,
                        [classConfigRecurrentId(c)]: c,
                    }),
                    {}
                ) ?? {};
        return { ...classesConfigMap, ...ghostClassesConfigs };
    }, [classes, userConfig?.classes]);

    async function putConfig(config: ConfigPayload) {
        return await fetch("/api/config", {
            method: "PUT",
            body: JSON.stringify(config, null, 2),
        });
    }

    async function putConfigActive(active: boolean) {
        setUserConfigActive(active);
        setUserConfigActiveLoading(true);
        return await fetch("/api/config", {
            method: "PUT",
            body: JSON.stringify(
                {
                    classes: originalSelectedClassIds.flatMap((id) => allClassesConfigMap[id] ?? []),
                    active,
                } as ConfigPayload,
                null,
                2
            ),
        })
            .then((r) => r.json())
            .then((c: UserConfig) => {
                setUserConfigActive(c.active);
                setUserConfigActiveLoading(false);
            });
    }

    async function updateConfigFromSelection() {
        setIsLoadingConfig(true);
        putConfig({
            classes: selectedClassIds.flatMap((id) => allClassesConfigMap[id] ?? []),
        }).then(() => {
            getConfig().then((c) => {
                setUserConfig(c);
            });
        });
    }

    return (
        <>
            <Head>
                <title>sit-rezervo</title>
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="msapplication-TileColor" content="#da532c" />
                <meta name="theme-color" content="#ffffff" />
            </Head>
            <Stack divider={<Divider orientation="horizontal" flexItem />}>
                <AppBar
                    changed={selectionChanged}
                    agendaEnabled={userConfig?.classes != undefined && userConfig.classes.length > 0}
                    isLoadingConfig={isLoadingConfig}
                    onUpdateConfig={() => updateConfigFromSelection()}
                    onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                    onSettingsOpen={() => setSettingsOpen(true)}
                    onAgendaOpen={() => setAgendaOpen(true)}
                />
                <Stack direction={{ xs: "column", md: "row" }} divider={<Divider orientation="vertical" flexItem />}>
                    <Container maxWidth={false} sx={{ height: "92vh", overflow: "auto" }}>
                        <ScheduleMemo
                            schedule={schedule}
                            activitiesPopularity={activitiesPopularity}
                            selectable={user != null && !isLoadingConfig}
                            selectedClassIds={selectedClassIds}
                            onSelectedChanged={onSelectedChanged}
                            onInfo={setModalClass}
                        />
                    </Container>
                </Stack>
                {selectionChanged && (
                    <MobileConfigUpdateBar
                        isLoadingConfig={isLoadingConfig}
                        onUpdateConfig={() => updateConfigFromSelection()}
                        onUndoSelectionChanges={() => setSelectedClassIds(originalSelectedClassIds)}
                    />
                )}
            </Stack>
            <Modal open={modalClass != null} onClose={() => setModalClass(null)}>
                <>
                    {modalClass && (
                        <ClassInfo
                            _class={modalClass}
                            popularity={
                                activitiesPopularity.find(
                                    (activityPopularity) => activityPopularity.activityId === modalClass.activityId
                                )?.popularity ?? ClassPopularity.Unknown
                            }
                        />
                    )}
                </>
            </Modal>
            <Modal open={agendaOpen} onClose={() => setAgendaOpen(false)}>
                <>
                    {userConfig?.classes && (
                        <Agenda
                            agendaClasses={userConfig.classes.map((c) => ({
                                config: c,
                                sitClass: classes.find((sc) => sitClassRecurrentId(sc) === classConfigRecurrentId(c)),
                                markedForDeletion: !selectedClassIds.includes(classConfigRecurrentId(c)),
                            }))}
                            onInfo={setModalClass}
                            onSetToDelete={(c, toDelete) => onSelectedChanged(classConfigRecurrentId(c), !toDelete)}
                        />
                    )}
                </>
            </Modal>
            <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
                <Settings
                    userConfigActive={userConfigActive}
                    userConfigActiveLoading={userConfigActiveLoading}
                    onUserConfigActive={putConfigActive}
                />
            </Modal>
        </>
    );
};

export default Index;
