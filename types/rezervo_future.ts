import { DateTime } from "luxon";

export enum IntegrationIdentifier {
    sit = "sit",
    fsc = "fsc",
}

export type RezervoIntegration = {
    name: string; // Sit Trening, Family Sports Club, ...
    acronym: IntegrationIdentifier;
    logo: string;
    businessUnits: RezervoBusinessUnit[];
};

export type RezervoBusinessUnit = {
    name: string; // [Sit] Trondheim, [Sit] Gjøvik, [Family Sports Club] Ski, [Family Sports Club] Vestby
    weekScheduleFetcher: (weekNumber: number) => Promise<RezervoWeekSchedule>;
};

export type RezervoSchedule = { [weekOffset: number]: RezervoWeekSchedule };

export type RezervoWeekSchedule = { [dayNumber: number]: RezervoDaySchedule };

export type RezervoDaySchedule = RezervoClass[];

export type RezervoClass = {
    id: string; // unique
    recurrentId: string; // startTime & location & product is equal => same recurrentId, maybe not have this, since it is easy to compute?
    startTime: DateTime;
    endTime: DateTime;
    location: {
        studio: string; // Solsiden, Gløshaugen, ...
        room: string; // Sal 1, Sykkelsal, ...
    };
    bookable: boolean;
    product: {
        id: string;
        name: string; // Eg. Grit Cardio, Yoga1, Spin45, ...
        category: string; // Eg. Cardio, Dance, Spinning, Strength
        description: string;
        color: string; // HEX
        image: string; // uri
    };
    slots: {
        total: number;
        available: number;
        waitingList: number;
    };
    instructors: string[];
};

export async function fetchSchedule(
    weekOffsets: number[],
    weekScheduleFetcher: (weekNumber: number) => Promise<RezervoWeekSchedule>
): Promise<RezervoSchedule> {
    const weekOffsetToSchedule = (o: number) => weekScheduleFetcher(o).then((s) => ({ [o]: s }));
    return (await Promise.all(weekOffsets.map(weekOffsetToSchedule))).reduce((acc, o) => ({ ...acc, ...o }), {});
}
