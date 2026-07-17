Feature: User Login

  Scenario: Successful login with manager credentials
    Given I am on the login page
    When I enter email "manager@fleetpulse.com" and password "manager123"
    Then I should be redirected to the dashboard

  Scenario: Successful login with viewer credentials
    Given I am on the login page
    When I enter email "viewer@fleetpulse.com" and password "viewer123"
    Then I should be redirected to the dashboard

  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter email "invalid@test.com" and password "wrongpass"
    Then I should see an error message
