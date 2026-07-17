Feature: Authentication

  Scenario: Login page loads correctly
    Given I am on the login page
    Then the login page should be visible

  Scenario: Demo credentials fill the manager form
    Given I am on the login page
    When I click the demo manager button
    Then the email input should contain "manager@fleetpulse.com"

  Scenario: Password visibility can be toggled
    Given I am on the login page
    When I type "testpassword" in the password field
    Then the password field type should be "password"
    When I click the password toggle
    Then the password field type should be "text"

  Scenario: Invalid credentials show an error
    Given I am on the login page
    When I enter email "wrong@email.com" and password "wrongpassword"
    Then I should see an error message

  Scenario: Empty form submission shows an error
    Given I am on the login page
    When I submit the login form
    Then I should see an error message

  Scenario Outline: User can log in and reach the dashboard
    Given I am logged in as "<role>"
    Then I should be redirected to the dashboard

    Examples:
      | role    |
      | manager |
      | viewer  |

  Scenario: Logout redirects to the login page
    Given I am logged in as "manager"
    When I click the logout button
    Then I should be redirected to the login page

  Scenario: Authenticated user is redirected away from login
    Given I am logged in as "manager"
    When I visit the login page
    Then I should be redirected to the dashboard
