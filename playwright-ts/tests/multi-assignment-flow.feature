Feature: Multi-Assignment Flow — Two vehicles assigned simultaneously

  A manager assigns two different vehicles to two different available drivers.
  Both assignments are pending at the same time.
  Cancelling one assignment must not affect the other.

  Background:
    Given the dashboard is running at "http://localhost:5173"
    And I am logged in as "manager" on the dashboard
    And I navigate to the assignments tab

  Scenario: Manager can assign two vehicles in succession
    When I assign the first available vehicle to the first available driver
    Then the first vehicle should show "Pending" status
    And the first vehicle should display the first driver's name

    When I assign the next available vehicle to the next available driver
    Then the second vehicle should show "Pending" status
    And the second vehicle should display a different driver's name
    And the two assigned drivers should be different people

  Scenario: Both pending assignments are visible simultaneously
    When I assign two available vehicles to two different drivers
    Then both vehicles should show "Pending" in the assignment status column
    And both vehicles should show a driver name in the driver cell
    And both vehicles should have a Cancel button visible
    And neither vehicle should have an Assign button visible

  Scenario: Cancelling one assignment leaves the other unaffected
    When I assign two available vehicles to two different drivers
    And I cancel the first vehicle's assignment

    Then the first vehicle's driver cell should show no assignment
    And the first vehicle's Assign button should reappear
    And the first vehicle's Cancel button should be gone

    And the second vehicle should still show "Pending" status
    And the second vehicle should still display its driver name
    And the second vehicle's Cancel button should still be visible

  Scenario: Driver selection modal excludes already-assigned drivers
    When I assign the first available vehicle to the first available driver
    And I open the driver selection modal for the next available vehicle
    Then the first assigned driver should not appear in the driver list
    And at least one other available driver should be listed
