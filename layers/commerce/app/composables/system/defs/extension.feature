Feature: Unified Extension

  Scenario: Overriding normalizer
    Given one of the normalizers is overridden
    When extension is created
    And the normalizer is called
    Then the overridden normalizer should be called
    And remaining normalizers should be unchanged

  Scenario: Add custom fields array with a single element
    Given a custom field is added to one of the normalizers
    When extension is created
    And the normalizer is called
    Then the custom field should be present in the $custom object
    And remaining normalizers should be unchanged

  Scenario: Add custom fields array with multiple elements
    Given multiple elements of the addCustomFields array override the same normalizer
    When extension is created
    And the normalizer is called
    Then all custom fields should be present in the $custom object

  Scenario: Nested custom fields
    Given multiple elements of the addCustomFields array override the same normalizer
    And custom fields are objects
    When extension is created
    And the normalizer is called
    Then objects should be merged into the $custom object

  Scenario: Adding the same custom fields more than once
    Given multiple elements of the addCustomFields array add the same custom field
    When extension is created
    And the normalizer is called
    Then the custom field should have value based on the last element of the addCustomFields array

  Scenario: Overriding api method
    Given one of the api methods is overridden
    When extension is created
    And the api method is called
    Then the overridden api method should be called