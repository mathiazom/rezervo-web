export enum ClassDemandLevel {
    Unknown = "Denne timen gikk ikke forrige uke, og har derfor ukjent popularitet.",
    Low = "Denne timen har vanligvis mange ledige plasser.",
    Medium = "Denne timen har vanligvis noen ledige plasser.",
    High = "Denne timen har vanligvis venteliste."
}

export type ActivityDemand = {
    activityId: string,
    demandLevel: ClassDemandLevel
}
