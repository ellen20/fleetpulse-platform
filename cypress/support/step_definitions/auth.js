import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Steps not already covered by login.js or rbac.js

Then("the login page should be visible", () => {
  cy.get('[data-testid="login-page"]').should("be.visible");
});

When("I click the demo manager button", () => {
  cy.get('[data-testid="demo-manager"]').click();
});

Then("the email input should contain {string}", (value) => {
  cy.get('[data-testid="email-input"]').should("have.value", value);
});

When("I type {string} in the password field", (text) => {
  cy.get('[data-testid="password-input"]').type(text);
});

Then("the password field type should be {string}", (type) => {
  cy.get('[data-testid="password-input"]').should("have.attr", "type", type);
});

When("I click the password toggle", () => {
  cy.get('[data-testid="toggle-password"]').click();
});

When("I submit the login form", () => {
  cy.get('[data-testid="login-submit"]').click();
});

When("I visit the login page", () => {
  cy.visit("http://localhost:5173/login");
});
