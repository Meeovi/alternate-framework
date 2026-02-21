<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" :scrim="false" transition="dialog-bottom-transition">
            <template v-slot:activator="{ props }">
                <UButton v-bind="props" class="rightAddBtn">
                    <UIcon start icon="fas:fa fa-plus"></UIcon>Create Address
                </UButton>
            </template>
            <UCard>
                <UForm @submit.prevent="createAddress">
                    <v-toolbar dark color="primary">
                        <UButton icon dark @click="dialog = false">
                            <UIcon icon="fas:fa fa-circle-xmark"></UIcon>
                        </UButton>
                        <template #header>
                            <span class="text-h6">Create new Address</span>
                        </template>
                    </v-toolbar>
                    <template #header>
                        <v-container>
                            <v-row>
                                <v-col cols="6">
                                    <UCheckbox v-model="default_shipping" label="Default Shipping?"></UCheckbox>
                                </v-col>
                                <v-col cols="6">
                                    <UCheckbox v-model="default_billing" label="Default Billing?"></UCheckbox>
                                </v-col>
                                <v-col cols="4">
                                    <UInput v-model="firstname" id="firstName" label="First Name*" required>
                                    </UInput>
                                </v-col>
                                <v-col cols="4">
                                    <UInput v-model="middlename" id="middleName" label="Middle Name*" required>
                                    </UInput>
                                </v-col>
                                <v-col cols="4">
                                    <UInput v-model="lastname" id="lastName" label="Last Name*" required>
                                    </UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="prefix" label="Address Prefix" id="addressName">
                                    </UInput>
                                </v-col>
                                <v-col cols="12">
                                    <UTextarea v-model="street" label="Street" id="addressStreet">
                                    </UTextarea>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="suffix" label="Address Suffix"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="city" label="City"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="postcode" label="Postcode"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="company" label="Company"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="telephone" label="Phone Number"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="fax" label="Fax"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="country_code" label="Country Code"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="vat_id" label="Vat ID"></UInput>
                                </v-col>
                                <v-col cols="6">
                                    <UInput v-model="region" label="Region"></UInput>
                                </v-col>
                            </v-row>
                        </v-container>
                        <small>*indicates required field</small>
                    </template>
                    <template>
                        <v-spacer></v-spacer>
                        <UButton color="blue-darken-1" variant="text" @click="dialog = false">
                            Close
                        </UButton>
                        <UButton color="blue-darken-1" variant="text" @click="createAddressAndRefresh">
                            Create Address
                        </UButton>
                    </template>
                </UForm>
            </UCard>
        </v-dialog>
    </v-row>
</template>

<script setup>
    import {
        ref
    } from 'vue';
    import {
        useApolloClient
    } from '@vue/apollo-composable';
    import {
        useRoute,
        useRouter
    } from 'vue-router';
    import {
        createCustomerAddress
    } from '#commerce/app/composables/commerce/customers/useAddresses'; // Add this import

    const route = useRoute();
    const router = useRouter();
    const dialog = ref(false);

    const city = ref('');
    const company = ref('');
    const country_code = ref('');
    const default_billing = ref('');
    const default_shipping = ref('');
    const fax = ref('');
    const firstname = ref('');
    const lastname = ref('');
    const middlename = ref('');
    const postcode = ref('');
    const prefix = ref('');
    const street = ref('');
    const suffix = ref('');
    const telephone = ref('');
    const vat_id = ref('');
    const region = ref('');

    const {
        client: apolloClient
    } = useApolloClient();

    const createAddress = async () => {
        try {
            // Get customerId from wherever you store it (localStorage, Pinia store, etc)
            const customerId = localStorage.getItem('customerId'); // Adjust this based on your auth setup

            const addressData = {
                firstname: firstname.value,
                lastname: lastname.value,
                middlename: middlename.value,
                prefix: prefix.value,
                suffix: suffix.value,
                street: [street.value], // Magento expects street as an array
                city: city.value,
                country_id: country_code.value, // Note: country_code should be in ISO format (US, GB, etc)
                region: {
                    region: region.value
                },
                postcode: postcode.value,
                telephone: telephone.value,
                company: company.value,
                fax: fax.value,
                vat_id: vat_id.value,
                default_billing: default_billing.value,
                default_shipping: default_shipping.value
            };

            // Determine address type based on checkboxes
            let addressType = 'both';
            if (default_billing.value && !default_shipping.value) {
                addressType = 'billing';
            } else if (!default_billing.value && default_shipping.value) {
                addressType = 'shipping';
            }

            const result = await createCustomerAddress(customerId, addressData, addressType);

            console.log('Address created successfully:', result);
            dialog.value = false; // Close the dialog

            // Show success message (you can use your preferred notification system)
            // For example, if using Vuetify snackbar:
            // snackbar.value = true;
            // message.value = 'Address created successfully';

        } catch (error) {
            console.error('Error creating address:', error);
            // Handle error (show error message to user)
            // For example:
            errorMessage.value = error.message;
        }
    };

    // Modified createAddressAndRefresh function
    const createAddressAndRefresh = async () => {
        await createAddress();
        router.go(0); // Refresh the current route
    };
</script>