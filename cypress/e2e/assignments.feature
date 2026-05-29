Feature: Assignment Management

  Background:
    Given I am logged in as "manager"
    And I navigate to the assignments tab

  Scenario: Assignment Management header is visible
    Then I should see "Assignment Management" text

  Scenario: Table displays all required columns
    Then the assignments table should show all columns

  Scenario: Clicking Assign opens the driver selection modal
    When I click the first Assign button
    Then I should see the driver selection modal

  Scenario: Driver selection modal shows available drivers
    When I click the first Assign button
    Then the driver modal should show available drivers

  Scenario: Driver selection modal shows driver details
    When I click the first Assign button
    Then the driver modal should show driver details

  Scenario: Closing driver modal with X dismisses it
    When I click the first Assign button
    And I close the driver selection modal
    Then the driver selection modal should not exist

  Scenario: Assigning a driver closes the modal
    When I click the first Assign button
    And I select the first available driver
    Then the driver selection modal should not exist

  Scenario: Clicking Cancel shows a confirmation dialog
    When I dismiss the cancel assignment dialog
    Then the assignment row should remain unchanged

  Scenario: Opening the driver contact modal
    When I click the first driver contact button
    Then the contact modal should be visible

  Scenario: Contact modal shows driver details
    When I click the first driver contact button
    Then the contact modal should show driver details

  Scenario: Contact modal shows active assignment warning
    When I click the first driver contact button
    Then the contact modal should show active assignment warning

  Scenario: Closing contact modal with X dismisses it
    When I click the first driver contact button
    And I close the contact modal
    Then the contact modal should not exist

  Scenario: Assignments table shows all vehicles
    Then the assignments table should show all vehicles

  Scenario: At least one action button exists in the table
    Then I should see at least one action button in the table

  Scenario: Fleet map elements are not visible on assignments tab
    Then fleet map elements should not be visible

  Scenario: Confirming cancel removes the assignment
    When I confirm the cancel assignment dialog
    Then the assignment should be removed

  Scenario: Both assign and contact buttons exist in the table
    Then I should see both assign and contact buttons in the table
