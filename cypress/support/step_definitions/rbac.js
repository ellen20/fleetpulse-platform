import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as {string}", (role) => {
  cy.loginAs(role);
});

When("I navigate to the assignments tab", () => {
  cy.get('[data-testid="tab-assignments"]').click();
});

When("I click the first Assign button", () => {
  cy.get('[data-testid^="assign-btn-"]').first().click();
});

When("I click the logout button", () => {
  cy.get('[data-testid="logout-btn"]').click();
});

Then("I should see the Assign button", () => {
  cy.get('[data-testid^="assign-btn-"]').should("exist");
});

Then("I should see the Cancel button", () => {
  cy.get('[data-testid^="cancel-btn-"]').should("exist");
});

Then("I should see the driver selection modal", () => {
  cy.get('[data-testid="driver-selection-modal"]').should("be.visible");
});

Then("I should not see the Assign button", () => {
  cy.get('[data-testid^="assign-btn-"]').should("not.exist");
});

Then("I should not see the Cancel button", () => {
  cy.get('[data-testid^="cancel-btn-"]').should("not.exist");
});

Then("I should see {string} text", (text) => {
  cy.contains(text).should("be.visible");
});

Then("I should not see {string} text", (text) => {
  cy.contains(text).should("not.exist");
});

Then("I should see all four stat cards", () => {
  cy.get('[data-testid="status-card-all"]').should("be.visible");
  cy.get('[data-testid="status-card-available"]').should("be.visible");
  cy.get('[data-testid="status-card-charging"]').should("be.visible");
  cy.get('[data-testid="status-card-maintenance"]').should("be.visible");
});

Then("I should be redirected to the login page", () => {
  cy.url().should("include", "/login");
});
