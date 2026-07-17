import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("the vehicles API fails with a network error", () => {
  cy.intercept("GET", "/api/vehicles", { forceNetworkError: true }).as("vehiclesFail");
});

When("the vehicles API returns status {int}", (statusCode) => {
  cy.intercept("GET", "/api/vehicles", { statusCode, body: { error: "Error" } }).as("vehiclesError");
});

When("the drivers API fails with a network error", () => {
  cy.intercept("GET", "/api/drivers", { forceNetworkError: true }).as("driversFail");
  cy.intercept("GET", "/api/vehicles").as("getVehicles");
});

When("the assignments API fails with a network error", () => {
  cy.intercept("GET", "/api/assignments", { forceNetworkError: true }).as("assignmentsFail");
  cy.intercept("GET", "/api/vehicles").as("getVehicles");
});

When("I reload the page", () => {
  cy.reload();
});

Then("all vehicle status counts should show {string}", (value) => {
  cy.get('[data-testid="status-count-all"]').should("contain", value);
  cy.get('[data-testid="status-count-available"]').should("contain", value);
  cy.get('[data-testid="status-count-charging"]').should("contain", value);
  cy.get('[data-testid="status-count-maintenance"]').should("contain", value);
});

Then("the total vehicle count should show {string}", (value) => {
  cy.get('[data-testid="status-count-all"]').should("contain", value);
});

When("the driver login API fails with a network error", () => {
  cy.intercept("POST", "/api/drivers/login", { forceNetworkError: true }).as("loginFail");
});

When("the driver assignments API fails with a network error", () => {
  cy.intercept("GET", "/api/assignments*", { forceNetworkError: true }).as("assignmentsFail");
});

Then("the vehicle list should show zero vehicles", () => {
  cy.contains(/0 vehicles?/i).should("be.visible");
});

When("both the vehicles and drivers APIs fail with a network error", () => {
  cy.intercept("GET", "/api/vehicles", { forceNetworkError: true }).as("vehiclesFail");
  cy.intercept("GET", "/api/drivers", { forceNetworkError: true }).as("driversFail");
});

Then("the header should show zero vehicles and zero drivers", () => {
  cy.contains("0 Vehicles").should("be.visible");
  cy.contains("0 Drivers").should("be.visible");
});

When("the vehicles API responds slowly", () => {
  cy.intercept("GET", "/api/vehicles", (req) => {
    req.on("response", (res) => {
      res.setDelay(3000);
    });
  }).as("slowVehicles");
});

Then("the vehicle count should be greater than zero", () => {
  cy.get('[data-testid="status-count-all"]').invoke("text").then((text) => {
    expect(parseInt(text)).to.be.greaterThan(0);
  });
});
