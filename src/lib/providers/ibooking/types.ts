export type IBookingWeekSchedule = {
    days: IBookingDaySchedule[];
};

export type IBookingDaySchedule = {
    date: string;
    dayName: string;
    classes: IBookingClass[];
};

export type IBookingClass = {
    id: number;
    activityId: number;
    available: number;
    bookable: boolean;
    capacity: number;
    studio: IBookingStudio;
    room: string;
    from: string;
    to: string;
    name: string;
    description: string;
    category: IBookingCategory;
    image: string | null;
    color: string;
    instructors: IBookingInstructor[];
    waitlist: {
        active: boolean;
        count: number;
    };
};

export type IBookingStudio = {
    id: number;
    name: string;
};

export type IBookingInstructor = {
    id: number;
    name: string;
};

export type IBookingCategory = {
    id: string;
    name: string;
};

export enum IBookingDomain {
    sit = "sit",
}
