export type SitSchedule = {
    days: SitScheduleDay[]
}

export type SitScheduleDay = {
    date: string,
    dayName: string,
    classes: SitClass[]
}

export type SitClass = {
    id: string,
    activityId: string,
    studio: SitStudio,
    from: string,
    to: string,
    name: string,
    description: string,
    image: string,
    color: string,
    weekday?: number,
}

export type SitStudio = {
    id: string,
    name: string
}