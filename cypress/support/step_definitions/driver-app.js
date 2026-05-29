import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on the driver app login page", () => {
  cy.visit("http://localhost:5174");
});

Given("I am logged in to the driver app as {string} with PIN {string}", (email, pin) => {
  cy.visit("http://localhost:5174");
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(pin);
  cy.contains("Sign In").click();
  cy.contains(new RegExp(`hi,`, "i")).should("be.visible");
});

When("I enter driver email {string} and PIN {string}", (email, pin) => {
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(pin);
});

When("I click Sign In", () => {
  cy.contains("Sign In").click();
});

When("I click Log out", () => {
  cy.contains("Log out").click();
});

When("I click Refresh Assignments", () => {
  cy.intercept("GET", "/api/assignments*").as("getAssignments");
  cy.contains("Refresh Assignments").click();
});

Then("the Sign In button should be disabled", () => {
  cy.contains("Sign In").should("be.disabled");
});

Then("the Sign In button should be enabled", () => {
  cy.contains("Sign In").should("not.be.disabled");
});

Then("I should see a driver login error", () => {
  cy.contains(/invalid|incorrect|error|not found/i).should("be.visible");
});

Then("I should see a greeting for {string}", (name) => {
  cy.contains(new RegExp(`hi, ${name}`, "i")).should("be.visible");
});

Then("the driver email input should not exist", () => {
  cy.get('input[type="email"]').should("not.exist");
});

Then("I should see the on trip status", () => {
  cy.contains(/on trip/i).should("be.visible");
});

Then("I should not see the on trip status", () => {
  cy.contains(/on trip/i).should("not.exist");
});

Then("a request should be made to the assignments API", () => {
  cy.wait("@getAssignments");
});

When("I type only the driver email {string}", (email) => {
  cy.get('input[type="email"]').type(email);
});

When("I type only the driver PIN {string}", (pin) => {
  cy.get('input[type="password"]').type(pin);
});

When("I type {string} into the PIN field", (value) => {
  cy.get('input[type="password"]').type(value);
});

When("I click the Refresh Assignments button", () => {
  cy.contains("Refresh Assignments").click();
});

Then("I should see the driver login form fields", () => {
  cy.get('input[type="email"]').should("be.visible");
  cy.get('input[type="password"]').should("be.visible");
  cy.contains("Sign In").should("be.visible");
});

Then("I should see the driver email and PIN labels", () => {
  cy.contains(/email/i).should("be.visible");
  cy.contains(/pin/i).should("be.visible");
});

Then("the driver email input should have placeholder {string}", (placeholder) => {
  cy.get('input[type="email"]').should("have.attr", "placeholder", placeholder);
});

Then("the driver PIN input should have placeholder {string}", (placeholder) => {
  cy.get('input[type="password"]').should("have.attr", "placeholder", placeholder);
});

Then("I should see the demo credentials hint", () => {
  cy.contains(/demo credentials/i).should("be.visible");
});

Then("the PIN field should have at most 6 characters", () => {
  cy.get('input[type="password"]').invoke("val").then((val) => {
    expect(val.length).to.be.at.most(6);
  });
});

Then("I should see the current day of the week", () => {
  cy.contains(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/i).should("be.visible");
});

Then("I should see a driver status banner", () => {
  cy.contains(/on trip|available|off duty/i).should("be.visible");
});

Then("I should see the available status", () => {
  cy.contains(/available/i).should("be.visible");
});

Then("I should see an assigned vehicle ID", () => {
  cy.contains(/EV-\d+/).should("be.visible");
});

Then("I should see an assignment status badge", () => {
  cy.contains(/active|pending|available/i).should("be.visible");
});

Then("I should see the View assignment button", () => {
  cy.contains(/view/i).should("be.visible");
});

Then("I should not see a driver greeting", () => {
  cy.contains(/hi,/i).should("not.exist");
});

Then("I should not see a greeting for {string}", (name) => {
  cy.contains(new RegExp(`hi, ${name}`, "i")).should("not.exist");
});
