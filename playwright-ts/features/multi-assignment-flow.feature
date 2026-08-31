Feature: Multi-assignment independence
  As a fleet manager
  I want to assign multiple vehicles to different drivers one after another
  So that each assignment is tracked independently and cancelling one never affects another

  Background:
    Given the assignments are reset to a clean state
    And the manager is logged into the dashboard

  Scenario: Two sequential assignments coexist and cancelling one leaves the other untouched
    # Manager assigns the first vehicle
    When the manager opens the assignments tab
    When the manager assigns the first available vehicle to a driver
    Then that vehicle shows a "Pending" assignment with the assigned driver's name
    And the assign button is replaced by a cancel button

    # Manager assigns a second, different vehicle to a different driver
    When the manager assigns the next available vehicle to a different driver
    Then the second vehicle is not the same as the first vehicle
    And the second assigned driver is not the same as the first assigned driver
    And that vehicle shows a "Pending" assignment with the second driver's name
    And the assign button is replaced by a cancel button

    # Both assignments coexist independently
    Then both vehicles show a "Pending" status at the same time
    And both vehicles show a cancel button and no assign button
    And both vehicles' physical status remains "available"

    # Cancelling the first assignment has no effect on the second
    When the manager cancels the first vehicle's assignment
    Then the cancel confirmation warns that the driver has not accepted yet
    And the success message confirms the assignment was cancelled
    And the first vehicle shows no assigned driver
    And the first vehicle's assignment status is no longer shown
    And the first vehicle's cancel button is gone

    # Second assignment remains fully intact
    Then the second vehicle still shows a "Pending" assignment
    And the second vehicle still shows the second driver's name
    And the second vehicle still shows a cancel button
    And the second vehicle still shows no assign button