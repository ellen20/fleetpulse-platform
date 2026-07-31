Feature: Cross-App Assignment Flow

  A manager assigns an available vehicle to an available driver from the dashboard.
  The driver accepts the assignment in the driver app.
  Both apps reflect the correct status at every stage of the lifecycle.

  Background:
    Given the dashboard is running at "http://localhost:5173"
    And the driver app is running at "http://localhost:5174"

  # ── Full lifecycle (single connected flow) ───────────────────────────────

  Scenario: Manager assigns vehicle and driver completes the shift
    Given I am logged in as "manager" on the dashboard
    And I navigate to the assignments tab
    When I click the Assign button for the first available vehicle
    And I accept the assignment confirmation dialog
    And I select the first available driver
    Then the driver selection modal should close
    And the assignment status for that vehicle should show "Pending"
    And the assigned driver name should appear in the driver cell
    And the vehicle physical status should still show "available"
    And the cancel button should be visible for that vehicle

    When the assigned driver logs into the driver app
    Then the driver home screen should be visible
    And the driver status should show "Available"
    And a pending assignment card should be visible for that vehicle

    When the driver opens the assignment detail
    Then the assignment screen should display the correct vehicle code
    And the battery percentage should be visible
    And the Start Shift button should be visible
    And the End Shift button should not be visible

    When the driver clicks Start Shift
    Then the trip timer should appear
    And the End Shift button should be visible
    And the Start Shift button should disappear

    When the dashboard refreshes after the driver starts the shift
    Then the assignment status for that vehicle should show "Active"
    And the driver name should still appear in the driver cell
    And the vehicle physical status should still show "available"

    When the driver clicks End Shift and confirms
    Then the shift complete card should appear
    And the Back to Home button should be visible

    When the driver returns to the home screen
    Then no active assignments should be shown
    And the driver status should show "Available"

    When the dashboard refreshes after the driver ends the shift
    Then the driver cell for that vehicle should show no assignment
    And the Assign button should reappear for that vehicle
    And the vehicle physical status should still show "available"

  # ── Status verification at each lifecycle stage ──────────────────────────

  Scenario: Vehicle physical status never changes during assignment lifecycle
    Given I am logged in as "manager" on the dashboard
    And I navigate to the assignments tab
    Then the vehicle status badge should show "available" before any assignment
    When I assign the first available vehicle to the first available driver
    Then the vehicle status badge should still show "available"
    When the driver starts the shift
    Then the vehicle status badge should still show "available"
    When the driver completes the shift
    Then the vehicle status badge should still show "available"

  Scenario: Assignment status transitions correctly through the lifecycle
    Given I am logged in as "manager" on the dashboard
    And I navigate to the assignments tab
    When I assign the first available vehicle to the first available driver
    Then the assignment status badge should show "Pending"
    When the driver starts the shift
    Then the assignment status badge should show "Active"
    When the driver completes the shift
    Then the assignment status cell should be empty

  Scenario: Driver home screen reflects each assignment state
    Given the manager has assigned a vehicle to the driver
    When the driver logs into the driver app
    Then the driver home screen should show a pending assignment card
    And the card should display the assigned vehicle code
    And the card should show "Pending" status

    When the driver opens the assignment and starts the shift
    Then the assignment screen should show the trip timer
    And the assignment screen should show "Active" status pill

    When the driver completes the shift and returns home
    Then no active assignment cards should be visible

  Scenario: Manager can cancel a pending assignment before driver starts
    Given I am logged in as "manager" on the dashboard
    And I navigate to the assignments tab
    When I assign the first available vehicle to the first available driver
    Then the assignment status for that vehicle should show "Pending"
    And the cancel button should be visible for that vehicle
    When I click the cancel button for that vehicle
    Then the driver cell for that vehicle should show no assignment
    And the Assign button should reappear for that vehicle

  Scenario: End Shift button triggers a two-step confirmation
    Given the manager has assigned a vehicle to the driver
    And the driver has logged in and started the shift
    When the driver clicks End Shift
    Then the "Yes, End Shift" confirm button should appear
    And the Cancel button should appear
    When the driver clicks Cancel
    Then the trip timer should still be visible
    And the End Shift button should be visible again
