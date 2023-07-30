import { fetchWeekSchedule } from "../lib/integration/fsc";

function FamilySportsClubPage() {
    const demo = async () => {
        console.log(await fetchWeekSchedule(0));
    };
    demo();
    return <p>Coming Soon 🚀</p>;
}

export default FamilySportsClubPage;
