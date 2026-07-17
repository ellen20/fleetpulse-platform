Feature: Dashboard UI

  Scenario: Dashboard displays FleetPulse branding
    Given I am logged in as "manager"
    Then I should see "FleetPulse" text
    And I should see "Fleet Management Dashboard" text

  Scenario: Dashboard displays navigation buttons
    Given I am logged in as "manager"
    Then I should see "Fleet Map" text
    And I should see "Assignments" text

  Scenario: Dashboard displays all four stat cards
    Given I am logged in as "manager"
    Then I should see all four stat cards

  Scenario: Stat cards are visible on Assignments view
    Given I am logged in as "manager"
    When I navigate to the assignments tab
    Then I should see all four stat cards

  Scenario: Fleet map shows all vehicles with pagination
    Given I am logged in as "manager"
    When I navigate to the fleet map tab
    Then I should see 10 vehicles in the list

  Scenario: Clicking Available filters to available vehicles
    Given I am logged in as "manager"
    When I navigate to the fleet map tab
    And I click the Available stat card
    Then I should see only available vehicles

  Scenario: Clicking Charging filters to charging vehicles
    Given I am logged in as "manager"
    When I navigate to the fleet map tab
    And I click the Charging stat card
    Then I should see only charging vehicles

  Scenario: Clicking Maintenance filters to maintenance vehicles
    Given I am logged in as "manager"
    When I navigate to the fleet map tab
    And I click the Maintenance stat card
    Then I should see only maintenance vehicles

  Scenario: Dashboard displays vehicle and driver counts
    Given I am logged in as "manager"
    Then I should see vehicle and driver counts in the header

  Scenario: Dashboard displays logged in user name
    Given I am logged in as "manager"
    Then I should see the "manager" name in the header

  Scenario: Total fleet count equals sum of all status counts
    Given I am logged in as "manager"
    Then the total fleet count should equal the sum of all status counts

  Scenario: Clicking Total Fleet stat card restores full vehicle list
    Given I am logged in as "manager"
    When I navigate to the fleet map tab
    And I click the Charging stat card
    And I click the Total Fleet stat card
    Then I should see the full vehicle list

  Scenario: Page 2 loads remaining vehicles
    Given I am logged in as "manager"
    When I navigate to the fleet map tab
    And I navigate to page 2
    Then I should see the second page of vehicles
