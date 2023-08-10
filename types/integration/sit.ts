export type SitWeekSchedule = {
    days: SitDaySchedule[];
};

export type SitDaySchedule = {
    date: string;
    dayName: string;
    classes: SitClass[];
};

export type SitClass = {
    id: number;
    activityId: number;
    available: number;
    bookable: boolean;
    capacity: number;
    studio: SitStudio;
    room: string;
    from: string;
    to: string;
    name: string;
    description: string;
    category: SitCategory;
    image: string;
    color: string;
    instructors: SitInstructor[];
    waitlist: {
        active: boolean;
        count: number;
        userPosition: number | null;
    };
    weekday?: number;
};

export type SitStudio = {
    id: number;
    name: string;
};

export type SitInstructor = {
    id: number;
    name: string;
};

export type SitCategory = {
    id: string;
    name: string;
    excelineId: number;
};