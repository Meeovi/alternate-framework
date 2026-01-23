Feature: Password validation rule

  Scenario Outline: New password can't be too easy (<newPassword>)
    Given the <newPassword> as password
    When the method is called
    Then a false should be returned

    Examples:

      | newPassword         |
      | 12345               |
      | password            |
      | password1           |
      | Password1           |
      | Password@           |
      | Password123567890   |

  Scenario Outline: New password must be complex enough (<newPassword>)
    Given the <newPassword> as password
    When the method is called
    Then a true should be returned

    Examples:

      | newPassword         |
      | Password1!3         |
      | L0ngEnough$         |
      | L0ngEnough@         |
      | L0ngEnough#         |
      | L0ngEnough%         |
      | L0ngEnough^         |
      | L0ngEnough*         |
      | L0ngEnough(         |
      | L0ngEnough)         |
      | L0ngEnough:         |
      | L0ngEnough;         |
      | L0ngEnough,         |
      | L0ngEnough.         |

  Scenario Outline: New password can't have some special signs (<newPassword>)
    Given the <newPassword> as password
    When the method is called
    Then a false should be returned

    Examples:

      | newPassword         |
      | L0ngEnough&         |
      | L0ngEnough[         |
      | L0ngEnough]         |
      | L0ngEnough"         |
      | L0ngEnough'         |
      | L0ngEnough/         |
      | L0ngEnough>         |
      | L0ngEnough<         |

  Scenario: New password match with confirmation
    Given the password is "Password1!"
    And the confirmation is "Password1!"
    When the method is called
    Then a true should be returned

  Scenario: New password mismatch with confirmation
    Given the password is "Password1!"
    And the confirmation is "Password1"
    When the method is called
    Then a false should be returned
