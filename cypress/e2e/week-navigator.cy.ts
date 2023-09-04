import { DateTime } from "luxon";

describe("Week Navigator", () => {
    const today = DateTime.now();

    function assertWeekNumber(weekNumber: number) {
        cy.getByTestId("week-number").should("contain.text", `UKE ${weekNumber}`);
    }

    beforeEach(() => {
        cy.visit("/");
    });

    it("Displays correct current week number", () => {
        cy.getByTestId("week-number").should("be.visible");
        cy.getByTestId("today-week-btn").should("be.disabled");
        assertWeekNumber(today.weekNumber);
    });

    it("Can navigate between weeks", () => {
        for (let i = 1; i < 5; i++) {
            cy.goToWeek("next");
            assertWeekNumber(today.weekNumber + i);
        }

        cy.goToWeek("today");
        assertWeekNumber(today.weekNumber);

        for (let i = 1; i < 5; i++) {
            cy.goToWeek("prev");
            assertWeekNumber(today.weekNumber - i);
        }
    });
});
