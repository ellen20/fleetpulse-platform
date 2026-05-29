import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I navigate to the fleet map tab", () => {
  cy.get('[data-testid="tab-map"]').click();
});

When("I click the Available stat card", () => {
  cy.get('[data-testid="status-card-available"]').click();
});

When("I click the Charging stat card", () => {
  cy.get('[data-testid="status-card-charging"]').click();
});

When("I click the Maintenance stat card", () => {
  cy.get('[data-testid="status-card-maintenance"]').click();
});

Then("I should see 10 vehicles in the list", () => {
  cy.get('[data-testid^="vehicle-list-item-"]').should("have.length", 10);
});

Then("I should see only available vehicles", () => {
  cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
    cy.wrap($el).contains(/available/i).should("be.visible");
  });
});

Then("I should see only charging vehicles", () => {
  cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
    cy.wrap($el).contains(/charging/i).should("be.visible");
  });
});

Then("I should see only maintenance vehicles", () => {
  cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
    cy.wrap($el).contains(/maintenance/i).should("be.visible");
  });
});

When("I click the Total Fleet stat card", () => {
  cy.get('[data-testid="status-card-all"]').click();
});

When("I navigate to page 2", () => {
  cy.get("button").contains("2").click();
});

Then("I should see vehicle and driver counts in the header", () => {
  cy.get('[data-testid="status-count-all"]').invoke("text").then((vehicleCount) => {
    cy.contains(`${vehicleCount.trim()} Vehicles`).should("be.visible");
  });
  cy.contains(/\d+ Drivers/).should("be.visible");
});

Then("I should see the {string} name in the header", (role) => {
  cy.fixture("users").then((users) => {
    cy.contains(users[role].name).should("be.visible");
  });
});

Then("the total fleet count should equal the sum of all status counts", () => {
  cy.get('[data-testid="status-count-all"]').invoke("text").then((total) => {
    cy.get('[data-testid="status-count-available"]').invoke("text").then((avail) => {
      cy.get('[data-testid="status-count-charging"]').invoke("text").then((charging) => {
        cy.get('[data-testid="status-count-maintenance"]').invoke("text").then((maintenance) => {
          expect(parseInt(total)).to.equal(
            parseInt(avail) + parseInt(charging) + parseInt(maintenance)
          );
        });
      });
    });
  });
});

Then("I should see the full vehicle list", () => {
  cy.get('[data-testid="status-count-all"]').invoke("text").then((total) => {
    const totalCount = parseInt(total);
    cy.get('[data-testid^="vehicle-list-item-"]').should(
      "have.length",
      totalCount > 10 ? 10 : totalCount
    );
  });
});

Then("I should see the second page of vehicles", () => {
  cy.get('[data-testid="status-count-all"]').invoke("text").then((total) => {
    const totalCount = parseInt(total);
    const remaining = totalCount - 10;
    cy.get('[data-testid^="vehicle-list-item-"]').should("have.length", remaining);
    cy.contains(`11-${totalCount} of ${totalCount}`).should("be.visible");
  });
});
