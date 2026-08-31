Feature: RBAC live view
  As a read-only viewer
  I want to see assignment changes made by a manager reflected on my dashboard
  So that I stay informed in near real-time without ever being able to take action myself

  Background:
    Given the assignments are reset to a clean state
    And the manager and the viewer are both logged into the dashboard
    And both users have opened the assignments tab

  Scenario: Viewer sees a manager's assignment update live but has no action controls
    # Viewer starts with no action buttons anywhere
    Then the viewer sees a "View only" label
    And the viewer has no assign buttons on any vehicle
    And the viewer has no cancel buttons on any vehicle

    # Manager assigns a vehicle
    When the manager selects an available vehicle
    And the manager assigns the vehicle to a driver
    Then the confirmation names the correct vehicle
    And the success message names the correct vehicle
    And the manager immediately sees the vehicle as "Pending"

    # Viewer's dashboard polls and reflects the change
    Then the viewer eventually sees the same vehicle as "Pending"
    And the viewer sees the assigned driver's name

    # Viewer still has zero action controls after the update
    Then the viewer still has no assign button for that vehicle
    And the viewer still has no cancel button for that vehicle
    And the viewer still sees the "View only" label
    And the viewer sees the vehicle's physical status as "available"