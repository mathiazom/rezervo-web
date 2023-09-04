Cypress.Commands.add("getByTestId", { prevSubject: "optional" }, (subject, id) => {
    if (subject) {
        return cy.wrap(subject).find(`[data-testid="${id}"]`);
    }
    return cy.get(`[data-testid="${id}"]`);
});

Cypress.Commands.add("waitIfNecessary", (url, func) => {
    const alias = "interception#" + Math.random().toString(36).substring(2, 8);
    cy.intercept(url, { times: 1 }, () => {}).as(alias);

    func();

    cy.get("@" + alias).then((interception) => {
        if (!interception) {
            fetch(url);
        }
    });

    cy.wait("@" + alias);
});

Cypress.Commands.add("goToWeek", (action) => {
    cy.waitIfNecessary("/api/schedule", () => {
        cy.getByTestId(`${action}-week-btn`).click();
    });
});

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to select DOM element by data-testid attribute.
             * @example cy.getTestId('greeting')
             */
            getByTestId(value: string): Chainable<JQuery<HTMLElement>>;

            /**
             * Custom command to enable waiting for potential api requests caused by some function.
             * If the api request occurs, it is awaited.
             * Otherwise, the request called manually, to clear the interception.
             * @param url the url pattern for the application api request
             * @param func the function to be called, which might trigger an api request
             * @example
             * cy.waitIfNecessary("/api/schedule", () => {
             *   cy.getByTestId(`${action}-week-btn`).click();
             * })
             */
            waitIfNecessary(url: string, func: () => void): void;

            /**
             * Shorthand to enable interaction with the week navigation buttons.
             * @param action the button to be clicked
             */
            goToWeek(action: "next" | "prev" | "today"): void;
        }
    }
}

export {};
