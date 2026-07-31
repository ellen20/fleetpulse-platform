Feature: Cancel Flow — Manager cancels a pending assignment before driver starts

  A manager assigns a vehicle to a driver.
  Before the driver starts the shift, the manager changes their mind and cancels.
  Both the dashboard and the driver app must reflect the cancellation immediately.

  Background:
    Given the dashboard is running at "http://localhost:5173"
    And the driver app is running at "http://localhost:5174"
    And I am logged in as "manager" on the dashboard
    And I navigate to the assignments tab

  Scenario: Cancelled assignment clears from the dashboard
    When I assign the first available vehicle to the first available driver
    Then the assignment status should show "Pending"
    And the cancel button should be visible for that vehicle

    When I cancel the pending assignment and confirm the dialog
    Then the driver cell for that vehicle should show no assignment
    And the assignment status badge should not be visible
    And the Assign button should reappear for that vehicle
    And the cancel button should no longer be visible

  Scenario: Driver sees no assignments after manager cancels
    When I assign the first available vehicle to the first available driver
    And the driver logs into the driver app
    Then the driver should see a pending assignment card for that vehicle

    When I cancel the pending assignment and confirm the dialog
    And the driver clicks Refresh Assignments
    Then no active assignments should be shown on the driver home screen

  Scenario: Cancel dialog requires confirmation before removing assignment
    When I assign the first available vehicle to the first available driver
    Then the assignment status should show "Pending"

    When I click the cancel button and dismiss the confirmation dialog
    Then the assignment status should still show "Pending"
    And the driver cell should still show the assigned driver name

  Scenario: Vehicle physical status remains unchanged after cancellation
    When I assign the first available vehicle to the first available driver
    Then the vehicle physical status should show "available"

    When I cancel the pending assignment and confirm the dialog
    Then the vehicle physical status should still show "available"
