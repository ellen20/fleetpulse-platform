Feature: Shift guard flow — two-step end-shift confirmation
  As a driver
  I want a confirmation step before my shift actually ends
  So that I don't accidentally end an active shift with a single misplaced tap

  Background:
    Given the assignments are reset to a clean state
    And the manager has assigned a vehicle to the test driver
    And the driver is logged into the driver app

  Scenario: Cancelling the end-shift guard keeps the shift active; confirming ends it cleanly
    # Driver opens the assignment and starts the shift
    When the driver opens the assignment detail
    Then the assignment detail shows the correct vehicle
    And the start shift button is visible
    And the end shift button is not visible
    When the driver starts the shift
    Then the trip timer is running
    And the end shift button is visible
    And the start shift button is not visible
    And the dashboard shows the assignment as "Active"

    # Driver clicks End Shift — the confirm guard appears
    When the driver clicks the end shift button
    Then a confirm and cancel option are both shown
    And the end shift button itself is no longer visible
    And the trip timer is still running

    # Driver cancels the guard — shift stays active, no side effects
    When the driver cancels the end-shift guard
    Then the end shift button is visible again
    And the confirm and cancel options are gone
    And the trip timer is still running
    And the dashboard still shows the assignment as "Active"

    # Driver clicks End Shift again and confirms this time
    When the driver clicks the end shift button again
    And the driver confirms ending the shift
    Then the shift is marked complete
    And the trip timer is no longer visible
    And the end shift button is no longer visible

    # Driver returns home to a clean state
    When the driver returns to the home screen
    Then the driver has no active assignments
    And the driver status is "Available"
    And the dashboard shows the vehicle as freed and reassignable