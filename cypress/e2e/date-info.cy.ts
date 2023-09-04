import { DateTime } from "luxon";

import { TIME_ZONE } from "../../src/config/config";
import { calculateMondayOffset } from "../../src/lib/integration/common";

describe("Date Info", () => {
    const today = DateTime.now().setZone(TIME_ZONE).startOf("day");
    const mondayOffset = calculateMondayOffset();
    const weekdays = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

    function validateDateInfo(weekOffset: number) {
        cy.getByTestId("date-info").should("have.length", 7);
        for (let i = 0; i < 6; i++) {
            const currentDate = today.plus({ days: i - mondayOffset + weekOffset * 7 });
            cy.getByTestId("date-info").eq(i).getByTestId("weekday").should("contain.text", weekdays[i]);
            cy.getByTestId("date-info")
                .eq(i)
                .getByTestId("date")
                .should("contain.text", currentDate.toFormat("yyyy-MM-dd"));
            if (currentDate.equals(today)) {
                cy.getByTestId("date-info").eq(i).getByTestId("today-chip").should("be.visible");
            } else {
                cy.getByTestId("date-info").eq(i).getByTestId("today-chip").should("not.exist");
            }
        }
    }

    beforeEach(() => {
        cy.visit("/");
    });

    it("Displays correct dates for current week", () => {
        cy.getByTestId("today-chip").should("have.length", 1);
        validateDateInfo(0);
    });

    it("Displays correct dates for previous week", () => {
        cy.goToWeek("prev");
        cy.getByTestId("today-chip").should("not.exist");
        validateDateInfo(-1);
    });

    it("Displays correct dates for next week", () => {
        cy.goToWeek("next");
        cy.getByTestId("today-chip").should("not.exist");
        validateDateInfo(1);
    });
});
