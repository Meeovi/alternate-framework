import { expect } from "vitest";
import { defineFeature, loadFeature } from "jest-cucumber";
import { validatePassword } from "./password";
const feature = loadFeature("./password.feature", { loadRelativePath: true });
defineFeature(feature, (test) => {
    let password;
    let confirmation;
    let output;
    function whenTheMethodIsCalled(when) {
        when("the method is called", () => {
            output = validatePassword(password, confirmation);
        });
    }
    test("New password can't be too easy (<newPassword>)", ({ given, when, then }) => {
        given(/^the (.*) as password$/, (givenPassword) => {
            password = givenPassword;
            confirmation = givenPassword;
        });
        whenTheMethodIsCalled(when);
        then("a false should be returned", () => {
            expect(output).toBe(false);
        });
    });
    test("New password must be complex enough (<newPassword>)", ({ given, when, then }) => {
        given(/^the (.*) as password$/, (givenPassword) => {
            password = givenPassword;
            confirmation = givenPassword;
        });
        whenTheMethodIsCalled(when);
        then("a true should be returned", () => {
            expect(output).toBe(true);
        });
    });
    test("New password can't have some special signs (<newPassword>)", ({ given, when, then }) => {
        given(/^the (.*) as password$/, (givenPassword) => {
            password = givenPassword;
            confirmation = givenPassword;
        });
        whenTheMethodIsCalled(when);
        then("a false should be returned", () => {
            expect(output).toBe(false);
        });
    });
    test("New password match with confirmation", ({ given, and, when, then }) => {
        given(/^the password is (.*)$/, (givenPassword) => {
            password = givenPassword;
        });
        and(/^the confirmation is (.*)$/, (givenConfirmation) => {
            confirmation = givenConfirmation;
        });
        whenTheMethodIsCalled(when);
        then("a true should be returned", () => {
            expect(output).toBe(true);
        });
    });
    test("New password mismatch with confirmation", ({ given, and, when, then }) => {
        given(/^the password is (.*)$/, (givenPassword) => {
            password = givenPassword;
        });
        and(/^the confirmation is (.*)$/, (givenConfirmation) => {
            confirmation = givenConfirmation;
        });
        whenTheMethodIsCalled(when);
        then("a false should be returned", () => {
            expect(output).toBe(false);
        });
    });
});
