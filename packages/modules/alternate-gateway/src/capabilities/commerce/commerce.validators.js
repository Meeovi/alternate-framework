"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseListProductsInput = parseListProductsInput;
exports.parseListProductsOutput = parseListProductsOutput;
exports.parseGetProductInput = parseGetProductInput;
exports.parseGetProductOutput = parseGetProductOutput;
exports.parseGetCartInput = parseGetCartInput;
exports.parseGetCartOutput = parseGetCartOutput;
exports.parseAddToCartInput = parseAddToCartInput;
exports.parseAddToCartOutput = parseAddToCartOutput;
exports.parseRemoveFromCartInput = parseRemoveFromCartInput;
exports.parseRemoveFromCartOutput = parseRemoveFromCartOutput;
exports.parseCheckoutInput = parseCheckoutInput;
exports.parseCheckoutOutput = parseCheckoutOutput;
var commerce_schemas_1 = require("../../contracts/commerce/commerce.schemas");
function parseListProductsInput(input) {
    return commerce_schemas_1.ListProductsInputSchema.parse(input);
}
function parseListProductsOutput(output) {
    return commerce_schemas_1.ListProductsOutputSchema.parse(output);
}
function parseGetProductInput(input) {
    return commerce_schemas_1.GetProductInputSchema.parse(input);
}
function parseGetProductOutput(output) {
    return commerce_schemas_1.GetProductOutputSchema.parse(output);
}
function parseGetCartInput(input) {
    return commerce_schemas_1.GetCartInputSchema.parse(input);
}
function parseGetCartOutput(output) {
    return commerce_schemas_1.GetCartOutputSchema.parse(output);
}
function parseAddToCartInput(input) {
    return commerce_schemas_1.AddToCartInputSchema.parse(input);
}
function parseAddToCartOutput(output) {
    return commerce_schemas_1.AddToCartOutputSchema.parse(output);
}
function parseRemoveFromCartInput(input) {
    return commerce_schemas_1.RemoveFromCartInputSchema.parse(input);
}
function parseRemoveFromCartOutput(output) {
    return commerce_schemas_1.RemoveFromCartOutputSchema.parse(output);
}
function parseCheckoutInput(input) {
    return commerce_schemas_1.CheckoutInputSchema.parse(input);
}
function parseCheckoutOutput(output) {
    return commerce_schemas_1.CheckoutOutputSchema.parse(output);
}
