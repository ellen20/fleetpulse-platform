import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

Then("the assignments table should show all columns", () => {
  cy.get('[data-testid="assignments-table"]').within(() => {
    cy.contains("Vehicle").should("be.visible");
    cy.contains("Make/Model").should("be.visible");
    cy.contains("Battery").should("be.visible");
    cy.contains("Status").should("be.visible");
    cy.contains("Assigned Driver").should("be.visible");
    cy.contains("Actions").should("be.visible");
  });
});

Then("the driver modal should show available drivers", () => {
  cy.get('[data-testid="driver-selection-modal"]').within(() => {
    cy.contains(/available/i).should("be.visible");
  });
});

Then("the driver modal should show driver details", () => {
  cy.get('[data-testid^="driver-card-"]').first().within(() => {
    cy.contains(/@fleetpulse\.dev/).should("be.visible");
    cy.contains(/713-/).should("be.visible");
    cy.contains(/TX-DL-/).should("be.visible");
  });
});

When("I close the driver selection modal", () => {
  cy.get('[data-testid="close-driver-modal"]').click();
});

Then("the driver selection modal should not exist", () => {
  cy.get('[data-testid="driver-selection-modal"]').should("not.exist");
});

When("I select the first available driver", () => {
  cy.get('[data-testid="driver-selection-modal"]').within(() => {
    cy.get('[data-testid^="driver-card-"]').first().find("button").click();
  });
});

When("I dismiss the cancel assignment dialog", () => {
  cy.on("window:confirm", () => false);
  cy.get('[data-testid="assignments-table-body"]').contains("Cancel").first().click();
});

Then("the assignment row should remain unchanged", () => {
  cy.get('[data-testid="assignments-table-body"]').contains("Cancel").should("be.visible");
});

When("I click the first driver contact button", () => {
  cy.get('[data-testid^="driver-contact-btn-"]').first().click();
});

Then("the contact modal should be visible", () => {
  cy.get('[data-testid="contact-modal"]').should("be.visible");
});

Then("the contact modal should show driver details", () => {
  cy.get('[data-testid="contact-modal"]').within(() => {
    cy.contains(/@fleetpulse\.dev/).should("be.visible");
    cy.contains(/713-/).should("be.visible");
    cy.contains(/TX-DL-/).should("be.visible");
  });
});

Then("the contact modal should show active assignment warning", () => {
  cy.get('[data-testid="contact-modal"]').within(() => {
    cy.contains("Active Assignment").should("be.visible");
    cy.contains(/Driver must complete or cancel/).should("be.visible");
  });
});

When("I close the contact modal", () => {
  cy.get('[data-testid="close-contact-modal"]').click();
});

Then("the contact modal should not exist", () => {
  cy.get('[data-testid="contact-modal"]').should("not.exist");
});

Then("the assignments table should show all vehicles", () => {
  cy.get('[data-testid="status-count-all"]').invoke("text").then((total) => {
    cy.get('[data-testid="assignments-table-body"]')
      .find("tr")
      .should("have.length", parseInt(total));
  });
});

Then("I should see at least one action button in the table", () => {
  cy.get('[data-testid="assignments-table-body"]').then(($body) => {
    const hasAssign = $body.find('[data-testid^="assign-btn-"]').length > 0;
    const hasCancel = $body.find('button:contains("Cancel")').length > 0;
    const hasContact = $body.find('[data-testid^="driver-contact-btn-"]').length > 0;
    expect(hasAssign || hasCancel || hasContact).to.be.true;
  });
});

Then("fleet map elements should not be visible", () => {
  cy.contains("Energy Corridor").should("not.exist");
  cy.contains("FLEET VEHICLES").should("not.exist");
});

When("I confirm the cancel assignment dialog", () => {
  cy.intercept("PATCH", "/api/assignments/*/cancel").as("cancelAssignment");
  cy.on("window:confirm", () => true);
  cy.get('[data-testid="assignments-table-body"]').contains("Cancel").first().click();
});

Then("the assignment should be removed", () => {
  cy.wait("@cancelAssignment");
});

Then("I should see both assign and contact buttons in the table", () => {
  cy.get('[data-testid^="driver-contact-btn-"]').should("have.length.greaterThan", 0);
  cy.get('[data-testid^="assign-btn-"]').should("have.length.greaterThan", 0);
});

Then("I should see driver contact buttons", () => {
  cy.get('[data-testid^="driver-contact-btn-"]').should("have.length.greaterThan", 0);
});
