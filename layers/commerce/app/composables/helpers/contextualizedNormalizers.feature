Feature: Contextualized normalizers

  Scenario: Context is passed to normalizers
    Given a normalizer that requires a context as a second argument
    When toContextualizedNormalizers function is called
    And the normalizer is called with just an input
    Then the normalizer should also receive the context

  Scenario: Context changes
    Given a normalizer that requires a context as a second argument
    When toContextualizedNormalizers function is called
    And the context changes
    And the normalizer is called with just an input
    Then the normalizer should use the recent version of the context