import { LocalizedDateTime } from "@/lib/helpers/date";

export function checkSantaTime() {
    return LocalizedDateTime.now().month === 12;
}
