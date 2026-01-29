/* eslint-disable sonarjs/prefer-single-boolean-return */
/* eslint-disable max-statements */
export function validatePassword(firstInput, confirmationInput) {
    if (firstInput !== confirmationInput) {
        return false;
    }
    if (firstInput.length < 8) {
        return false;
    }
    if (/[A-Z]+/.test(firstInput) === false) {
        return false;
    }
    if (/\d+/.test(firstInput) === false) {
        return false;
    }
    if (/[!#$%()*,.:;@^]+/.test(firstInput) === false) {
        return false;
    }
    return true;
}
