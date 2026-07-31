Feature: RBAC Live View — Viewer watches manager assign a vehicle in real time

  A viewer and a manager are both on the assignments tab simultaneously.
  When the manager creates an assignment, the viewer's dashboard auto-polls and
  reflects the new status — but the viewer has no action buttons at any point.

  Background:
    Given the dashboard is running at "http://localhost:5173"
    And the manager is logged into the dashboard
    And the viewer is logged into the dashboard in a separate browser context
    And both users have navigated to the assignments tab

  Scenario: Viewer sees "View only" label and no action buttons before any assignment
    Then the viewer should see "View only" text
    And the viewer should not see any Assign buttons
    And the viewer should not see any Cancel buttons

  Scenario: Viewer sees Pending badge after manager assigns a vehicle
    When the manager assigns the first available vehicle to the first available driver
    Then the manager dashboard should show "Pending" for that vehicle

    When the viewer's dashboard auto-polls
    Then the viewer dashboard should show "Pending" for the same vehicle
    And the viewer should see the assigned driver name
    And the vehicle physical status should show "available" for the viewer

  Scenario: Viewer cannot interact with an assigned vehicle
    When the manager assigns the first available vehicle to the first available driver
    And the viewer's dashboard auto-polls

    Then the viewer should not see an Assign button for that vehicle
    And the viewer should not see a Cancel button for that vehicle
    And the viewer should still see "View only" text

  Scenario: Viewer status cards show correct vehicle counts
    Then the viewer should see the total fleet count on the "All" status card
    And the viewer should see the available vehicle count
    And the viewer should see the charging vehicle count
    And the viewer should see the maintenance vehicle count
