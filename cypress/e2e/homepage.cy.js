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
    const expectedCalls = 3;
    let analyticsEvents = [];
    cy.get("@amplitude.all")
      .should("have.length", expectedCalls)
      .then((amplitudeRequests) => {
        analyticsEvents = utils.parseAmplitudeRequests(amplitudeRequests);
        expect(analyticsEvents[1].event_type).to.equal("view : page");
        expect(analyticsEvents[1].event_properties.path).to.equal("/");
        expect(analyticsEvents[1].event_properties.url).to.equal(
          Cypress.config("baseUrl") + "/"
        );
      });
  });
  it("should fire 'view' and 'close' popup events on homepage", () => {
    cy.wait("@amplitude").then(({ response }) => {
      expect(response.statusCode).to.eq(200);
    });

    let modalCloseButton = cy
      .get("iframe#attentive_creative", { timeout: 6000 })
      .should("be.visible")
      .then(($iframe) => {
        const $body = $iframe.contents().find("body");
        cy.wrap($body).find("#closeIconContainer").should("be.visible");
      });

    let expectedCalls = 3;
    let analyticsEvents = [];
    cy.get("@amplitude.all", { timeout: 7000 })
      .should("have.length", expectedCalls)
      .then((amplitudeRequests) => {
        analyticsEvents = utils.parseAmplitudeRequests(amplitudeRequests);
        expect(analyticsEvents[3].event_type).to.equal("view : popup");
        expect(analyticsEvents[3].event_properties["event label"]).to.equal(
          "Attentive"
        );
        expect(analyticsEvents[3].event_properties.variant).not.to.be.null;
      });

    modalCloseButton.click();

    expectedCalls = 4;
    analyticsEvents = [];
    cy.get("@amplitude.all", { timeout: 7000 })
      .should("have.length", expectedCalls)
      .then((amplitudeRequests) => {
        analyticsEvents = utils.parseAmplitudeRequests(amplitudeRequests);
        expect(analyticsEvents[4].event_type).to.equal("close : popup");
        expect(analyticsEvents[4].event_properties["event label"]).to.equal(
          "Attentive"
        );
        expect(analyticsEvents[4].event_properties.variant).not.to.be.null;
      });
  });
});
