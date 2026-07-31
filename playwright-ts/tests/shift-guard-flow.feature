Feature: Shift Guard Flow — Two-step End Shift confirmation protects accidental endings

  When a driver is on an active shift, clicking "End Shift" shows a confirmation
  step before completing. The driver can cancel the confirmation to resume the shift,
  or confirm to end it. The guard must behave correctly in both branches.

  Background:
    Given the dashboard is running at "http://localhost:5173"
    And the driver app is running at "http://localhost:5174"
    And the manager has assigned a vehicle to the first available driver
    And the driver is logged into the driver app

  Scenario: End Shift button is not visible before shift starts
    When the driver opens the pending assignment detail
    Then the Start Shift button should be visible
    And the End Shift button should not be visible
    And the confirm End Shift button should not be visible
    And the cancel End Shift button should not be visible

  Scenario: Starting the shift shows End Shift and hides Start Shift
    When the driver opens the assignment and clicks Start Shift
    Then the trip timer should be visible
    And the End Shift button should be visible
    And the Start Shift button should not be visible

  Scenario: Clicking End Shift shows the two-step confirmation
    When the driver opens the assignment and clicks Start Shift
    And the driver clicks End Shift
    Then the "Yes, End Shift" confirm button should appear
    And the Cancel button should appear
    And the End Shift button itself should be replaced by the confirm pair

  Scenario: Cancelling the confirmation keeps the shift active
    When the driver opens the assignment and clicks Start Shift
    And the driver clicks End Shift
    And the driver clicks Cancel on the confirmation
    Then the trip timer should still be visible
    And the End Shift button should be visible again
    And the confirm End Shift button should not be visible
    And the cancel End Shift button should not be visible

  Scenario: Confirming End Shift completes the shift
    When the driver opens the assignment and clicks Start Shift
    And the driver clicks End Shift and confirms
    Then the shift complete card should be visible
    And the Back to Home button should be visible
    And the trip timer should not be visible
    And the End Shift button should not be visible

  Scenario: Driver returns home after completing shift
    When the driver completes the shift and clicks Back to Home
    Then the driver home screen should be visible
    And no active assignments should be shown
    And the driver status should show "Available"
