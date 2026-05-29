Feature: Role-Based Access Control

  Scenario: Manager can see Assign button for available vehicles
    Given I am logged in as "manager"
    When I navigate to the assignments tab
    Then I should see the Assign button

  Scenario: Manager can see Cancel button for pending assignments
    Given I am logged in as "manager"
    When I navigate to the assignments tab
    Then I should see the Cancel button

  Scenario: Manager can open driver selection modal
    Given I am logged in as "manager"
    When I navigate to the assignments tab
    And I click the first Assign button
    Then I should see the driver selection modal

  Scenario: Manager does not see View only text
    Given I am logged in as "manager"
    When I navigate to the assignments tab
    Then I should not see "View only" text

  Scenario: Viewer cannot see Assign button
    Given I am logged in as "viewer"
    When I navigate to the assignments tab
    Then I should not see the Assign button

  Scenario: Viewer cannot see Cancel button
    Given I am logged in as "viewer"
    When I navigate to the assignments tab
    Then I should not see the Cancel button

  Scenario: Viewer sees View only text instead of action buttons
    Given I am logged in as "viewer"
    When I navigate to the assignments tab
    Then I should see "View only" text

  Scenario: Viewer can see all stat cards
    Given I am logged in as "viewer"
    When I navigate to the assignments tab
    Then I should see all four stat cards

  Scenario: Viewer can logout successfully
    Given I am logged in as "viewer"
    When I click the logout button
    Then I should be redirected to the login page

  Scenario: Manager name is displayed in header
    Given I am logged in as "manager"
    When I navigate to the assignments tab
    Then I should see the "manager" name in the header

  Scenario: Viewer sees all vehicles in the assignments table
    Given I am logged in as "viewer"
    When I navigate to the assignments tab
    Then the assignments table should show all vehicles

  Scenario: Viewer can filter vehicles by status on fleet map
    Given I am logged in as "viewer"
    When I navigate to the fleet map tab
    And I click the Available stat card
    Then I should see only available vehicles

  Scenario: Viewer can see driver contact buttons
    Given I am logged in as "viewer"
    When I navigate to the assignments tab
    Then I should see driver contact buttons

  Scenario: Viewer name is displayed in header
    Given I am logged in as "viewer"
    When I navigate to the assignments tab
    Then I should see the "viewer" name in the header
