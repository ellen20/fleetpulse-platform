Feature: Cross-app assignment lifecycle
  As a fleet manager
  I want to assign a vehicle to a driver in the dashboard
  So that the driver receives it in the driver app and the full shift lifecycle stays in sync across both apps

  Background:
    Given the assignments are reset to a clean state
    And the manager is logged into the dashboard

  Scenario: Manager assigns a vehicle and the driver completes the full shift lifecycle
    # Dashboard fleet data loads correctly
    When the manager views the fleet overview
    Then the total fleet count is greater than zero
    And the available, charging, and maintenance counts sum to the total fleet

    # Assignments tab loads correctly
    When the manager opens the assignments tab
    Then the assignment count is greater than zero
    And the active, pending, and unassigned counts sum to the assignment total
    And the assignments table shows at least one vehicle

    # Manager assigns an available vehicle to a driver
    When the manager selects an available vehicle
    Then the vehicle status is "available"
    And the vehicle has no assigned driver
    When the manager opens the driver selection modal for that vehicle
    Then the modal names the correct vehicle
    And all available drivers are shown
    When the manager assigns the vehicle to the test driver
    Then the confirmation names the correct vehicle and driver
    And the success message names the correct vehicle and driver
    And the vehicle row shows a "Pending" assignment with the driver's name
    And the assign button is replaced by a cancel button

    # Driver receives the assignment in the driver app
    When the driver logs into the driver app
    Then the driver app greets the correct driver by name
    And the driver status is "Available"
    And the driver sees a "Pending" assignment for the correct vehicle

    # Driver starts the shift
    When the driver opens the assignment detail
    Then the assignment detail shows the correct vehicle
    When the driver starts the shift
    Then the trip timer is running
    And the dashboard updates the assignment to "Active"

    # Driver ends the shift
    When the driver ends the shift and confirms
    Then the shift is marked complete
    When the driver returns to the home screen
    Then the driver has no active assignments
    And the dashboard shows the vehicle freed and available to reassign