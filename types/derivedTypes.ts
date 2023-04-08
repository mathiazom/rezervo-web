export enum ClassPopularity {
    Unknown = "Denne timen gikk ikke forrige uke, og har derfor ukjent popularitet.",
    Low = "Denne timen har vanligvis mange ledige plasser.",
    Medium = "Denne timen har vanligvis noen ledige plasser.",
    High = "Denne timen har vanligvis venteliste."
}

export type ActivityPopularity = {
    activityId: string,
    popularity: ClassPopularity
}
