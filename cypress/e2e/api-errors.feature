Feature: API Error Handling

  Background:
    Given I am logged in as "manager"

  Scenario: Shows zero counts when vehicles API fails
    When the vehicles API fails with a network error
    And I reload the page
    Then all vehicle status counts should show "0"

  Scenario: Dashboard layout remains intact when vehicles API fails
    When the vehicles API fails with a network error
    And I reload the page
    Then I should see "FleetPulse" text
    And I should see "Fleet Map" text
    And I should see "Assignments" text

  Scenario: Handles 500 server error on vehicles API gracefully
    When the vehicles API returns status 500
    And I reload the page
    Then I should see "FleetPulse" text
    And the total vehicle count should show "0"

  Scenario: Handles 404 not found on vehicles API gracefully
    When the vehicles API returns status 404
    And I reload the page
    Then I should see "FleetPulse" text
    And the total vehicle count should show "0"

  Scenario: App remains stable when only drivers API fails
    When the drivers API fails with a network error
    And I reload the page
    Then I should see "FleetPulse" text

  Scenario: App remains stable when only assignments API fails
    When the assignments API fails with a network error
    And I reload the page
    Then I should see "FleetPulse" text

  Scenario: Vehicle list shows zero vehicles when API fails
    When the vehicles API fails with a network error
    And I reload the page
    Then the vehicle list should show zero vehicles

  Scenario: Header shows zero vehicles and drivers when both APIs fail
    When both the vehicles and drivers APIs fail with a network error
    And I reload the page
    Then the header should show zero vehicles and zero drivers

  Scenario: App remains stable during slow API response
    When the vehicles API responds slowly
    And I reload the page
    Then I should see "FleetPulse" text

  Scenario: Data reloads correctly after API recovery
    When I reload the page
    And I reload the page
    Then the vehicle count should be greater than zero

