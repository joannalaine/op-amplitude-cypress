/// <reference types="cypress" />
import * as utils from "../support/index";

describe("Analytics events", () => {
  beforeEach(() => {
    cy.intercept("POST", "https://api.amplitude.com/").as("amplitude");
    cy.visit("/");
  });
  it("should fire 'view : page' event on homepage", () => {
    cy.wait("@amplitude").then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });
    const expectedEvents = 3;
    let analyticsEvents = [];
    cy.get("@amplitude.all")
      .should("have.length", expectedEvents)
      .then((amplitudeRequests) => {
        analyticsEvents = utils.parseAmplitudeRequests(amplitudeRequests);
        expect(analyticsEvents[1].event_type).to.equal("view : page");
        expect(analyticsEvents[1].event_properties.path).to.equal("/");
        expect(analyticsEvents[1].event_properties.url).to.equal(
          Cypress.config("baseUrl") + "/"
        );
      });
  });
});
