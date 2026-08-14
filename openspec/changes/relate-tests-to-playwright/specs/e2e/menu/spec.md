## Purpose

Provides traceable end-to-end coverage for the authenticated SauceDemo burger menu and its state-changing and navigation actions.

## ADDED Requirements

### Requirement: Authenticated burger menu actions

An authenticated user SHALL be able to use the burger menu to reset application state, return to all products, open the Sauce Labs About destination, and log out. Each action SHALL produce the corresponding visible navigation or state outcome.

#### Scenario: Reset app state clears the cart

- **WHEN** an authenticated user adds products, opens the burger menu, and selects Reset App State
- **THEN** the cart contains no products and the cart badge is absent after the inventory page settles

#### Scenario: All Items returns to inventory

- **WHEN** an authenticated user opens the burger menu from a non-inventory route and selects All Items
- **THEN** the user is returned to the inventory page

#### Scenario: About opens the Sauce Labs destination

- **WHEN** an authenticated user opens the burger menu and selects About
- **THEN** the browser navigates to the Sauce Labs destination in the behavior defined by the application

#### Scenario: Logout ends the authenticated session

- **WHEN** an authenticated user opens the burger menu and selects Logout
- **THEN** the user returns to the login page and cannot use the previous authenticated session to access inventory
