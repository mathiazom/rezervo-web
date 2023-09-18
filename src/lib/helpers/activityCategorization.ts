type RezervoCategory = {
    name: string;
    color: string;
    keywords: string[];
};

const activityCategorization: RezervoCategory[] = [
    {
        name: "Annet",
        color: "#FFFF66",
        keywords: ["happening", "event"],
    },
    {
        name: "Mosjon",
        color: "#00B050",
        keywords: ["godt voksen", "sprek mamma", "mor og barn"],
    },
    {
        name: "Dans",
        color: "#E96179",
        keywords: ["dans", "dance", "sh'bam"],
    },
    {
        name: "Body & Mind",
        color: "#8BD4F0",
        keywords: ["yoga", "pilates", "smidig", "stretch", "mobilitet", "meditate"],
    },
    {
        name: "Kondisjon",
        color: "#6AD3B4",
        keywords: ["step", "løp", "puls", "bodyattack", "cardio"],
    },
    {
        name: "Spinning",
        color: "#4C2C7E",
        keywords: ["spin", "sykkel"],
    },
    {
        name: "Styrke & Utholdenhet",
        color: "#F8A800",
        keywords: [
            "pump",
            "styrke",
            "core",
            "sterk",
            "tabata",
            "stærk",
            "strength",
            "hardhausen",
            "slynge",
            "crosstraining",
        ],
    },
];

export default function determineActivityCategory(activityName: string): RezervoCategory {
    return (
        activityCategorization.find((category) =>
            category.keywords.some((keyword) => activityName.toLowerCase().includes(keyword)),
        ) ?? activityCategorization[0]!
    );
}
