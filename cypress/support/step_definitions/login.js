import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on the login page", () => {
  cy.visit("/login");
});

When("I enter email {string} and password {string}", (email, password) => {
  cy.get('[data-testid="email-input"]').clear().type(email);
  cy.get('[data-testid="password-input"]').clear().type(password);
  cy.get('[data-testid="login-submit"]').click();
});

Then("I should be redirected to the dashboard", () => {
  cy.url().should("include", "/dashboard");
});

Then("I should see an error message", () => {
  cy.get('[data-testid="login-error"]').should("be.visible");
});
