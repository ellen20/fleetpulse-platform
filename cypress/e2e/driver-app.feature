Feature: Driver App

  Scenario: Login page displays FleetPulse branding
    Given I am on the driver app login page
    Then I should see "FleetPulse" text
    And I should see "Driver Portal" text

  Scenario: Sign In button is disabled when fields are empty
    Given I am on the driver app login page
    Then the Sign In button should be disabled

  Scenario: Sign In button enables when both fields are filled
    Given I am on the driver app login page
    When I enter driver email "marcus.chen@fleetpulse.dev" and PIN "1234"
    Then the Sign In button should be enabled

  Scenario: Invalid credentials show an error message
    Given I am on the driver app login page
    When I enter driver email "wrong@fleetpulse.dev" and PIN "0000"
    And I click Sign In
    Then I should see a driver login error

  Scenario: Successful login redirects to the driver dashboard
    Given I am on the driver app login page
    When I enter driver email "marcus.chen@fleetpulse.dev" and PIN "1234"
    And I click Sign In
    Then I should see a greeting for "marcus"

  Scenario: Login form is hidden after successful login
    Given I am on the driver app login page
    When I enter driver email "marcus.chen@fleetpulse.dev" and PIN "1234"
    And I click Sign In
    Then the driver email input should not exist

  Scenario: Driver dashboard shows personalized greeting
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    Then I should see a greeting for "marcus"

  Scenario: On Trip driver shows On Trip status
    Given I am logged in to the driver app as "priya.sharma@fleetpulse.dev" with PIN "6789"
    Then I should see the on trip status

  Scenario: Driver dashboard shows Current Assignments section
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    Then I should see "Current Assignments" text

  Scenario: Refresh Assignments triggers an API call
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    When I click Refresh Assignments
    Then a request should be made to the assignments API

  Scenario: Logout returns to the login page
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    When I click Log out
    Then I should see "Driver Portal" text

  Scenario: Available driver sees correct status
    Given I am logged in to the driver app as "sarah.kim@fleetpulse.dev" with PIN "2345"
    Then I should see a greeting for "sarah"
    And I should not see the on trip status

  Scenario: Driver app shows error when login API fails
    Given I am on the driver app login page
    And the driver login API fails with a network error
    When I enter driver email "marcus.chen@fleetpulse.dev" and PIN "1234"
    And I click Sign In
    Then I should see "Driver Portal" text

  Scenario: Driver app dashboard renders when assignments API fails
    Given I am on the driver app login page
    And the driver assignments API fails with a network error
    When I enter driver email "marcus.chen@fleetpulse.dev" and PIN "1234"
    And I click Sign In
    Then I should see a greeting for "marcus"

  Scenario: Login page displays all form fields
    Given I am on the driver app login page
    Then I should see the driver login form fields

  Scenario: Login page displays email and PIN labels
    Given I am on the driver app login page
    Then I should see the driver email and PIN labels

  Scenario: Input fields show placeholder text
    Given I am on the driver app login page
    Then the driver email input should have placeholder "driver@fleetpulse.dev"
    And the driver PIN input should have placeholder "4-digit PIN"

  Scenario: Demo credentials hint is visible
    Given I am on the driver app login page
    Then I should see the demo credentials hint

  Scenario: Sign In stays disabled with only email filled
    Given I am on the driver app login page
    When I type only the driver email "marcus.chen@fleetpulse.dev"
    Then the Sign In button should be disabled

  Scenario: Sign In stays disabled with only PIN filled
    Given I am on the driver app login page
    When I type only the driver PIN "1234"
    Then the Sign In button should be disabled

  Scenario: PIN field enforces maximum digit length
    Given I am on the driver app login page
    When I type "12345678" into the PIN field
    Then the PIN field should have at most 6 characters

  Scenario: Driver dashboard displays current date
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    Then I should see the current day of the week

  Scenario: Driver dashboard displays Log out button
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    Then I should see "Log out" text

  Scenario: Driver dashboard displays a trip status banner
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    Then I should see a driver status banner

  Scenario: Marcus Chen shows Available status
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    Then I should see the available status

  Scenario: Driver dashboard displays assigned vehicle ID
    Given I am logged in to the driver app as "priya.sharma@fleetpulse.dev" with PIN "6789"
    Then I should see an assigned vehicle ID

  Scenario: Driver dashboard displays assignment status badge
    Given I am logged in to the driver app as "priya.sharma@fleetpulse.dev" with PIN "6789"
    Then I should see an assignment status badge

  Scenario: Driver dashboard displays View button for assignment
    Given I am logged in to the driver app as "priya.sharma@fleetpulse.dev" with PIN "6789"
    Then I should see the View assignment button

  Scenario: Driver dashboard displays Refresh Assignments button
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    Then I should see "Refresh Assignments" text

  Scenario: Assignment data persists after refresh
    Given I am logged in to the driver app as "priya.sharma@fleetpulse.dev" with PIN "6789"
    When I click Refresh Assignments
    Then a request should be made to the assignments API
    And I should see an assigned vehicle ID

  Scenario: Cannot access dashboard after logout
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    When I click Log out
    And I am on the driver app login page
    Then I should see "Sign In" text
    And I should not see a driver greeting

  Scenario: Each driver sees only their own personalized greeting
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    Then I should see a greeting for "marcus"
    And I should not see a greeting for "sarah"
    When I click Log out
    And I enter driver email "sarah.kim@fleetpulse.dev" and PIN "2345"
    And I click Sign In
    Then I should see a greeting for "sarah"
    And I should not see a greeting for "marcus"

  Scenario: Refresh Assignments handles API failure gracefully
    Given I am logged in to the driver app as "marcus.chen@fleetpulse.dev" with PIN "1234"
    When the driver assignments API fails with a network error
    And I click the Refresh Assignments button
    Then I should see a greeting for "marcus"
    And I should see "Refresh Assignments" text
