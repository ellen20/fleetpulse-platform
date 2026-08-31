Feature: Cancel flow — manager cancels before driver starts
  As a fleet manager
  I want to cancel a pending assignment before the driver has accepted it
  So that the vehicle becomes reassignable and the driver is no longer notified of a stale assignment

  Background:
    Given the assignments are reset to a clean state
    And the manager is logged into the dashboard

  Scenario: Manager cancels a pending assignment and both apps revert cleanly
    # Manager assigns a vehicle
    When the manager opens the assignments tab
    Then the assignment count is greater than zero
    When the manager selects an available vehicle
    Then the vehicle status is "available"
    And the vehicle has no assigned driver
    And the vehicle has no cancel button
    When the manager assigns the vehicle to the test driver
    Then the confirmation names the correct vehicle and driver
    And the success message names the correct vehicle and driver
    And the vehicle row shows a "Pending" assignment with the driver's name
    And the assign button is replaced by a cancel button
    And the vehicle status is "available"

    # Driver sees the pending assignment
    When the driver logs into the driver app
    Then the driver sees a "Pending" assignment for the correct vehicle

    # Manager cancels the assignment
    When the manager cancels the pending assignment
    Then the cancel confirmation warns that the driver has not accepted yet
    And the success message confirms the assignment was cancelled
    And the vehicle row shows no assigned driver
    And the assign button is restored
    And the vehicle has no cancel button
    And the vehicle has no assignment status shown

    # Driver's view reflects the cancellation
    When the driver refreshes their assignment list
    Then the driver has no active assignments
    And the driver status is "Available"