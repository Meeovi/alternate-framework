<template>
    <div>
        <v-toolbar color="transparent" density="compact" title="My Addresses">
            <UButton color="primary" @click="showAddAddress = true">
                Add New Address
            </UButton>
        </v-toolbar>

        <UCard>
            <v-tabs v-model="tab" bg-color="transparent">
                <v-tab value="billing">Billing Addresses</v-tab>
                <v-tab value="shipping">Shipping Addresses</v-tab>
            </v-tabs>

            <template #header>
                <v-tabs-window v-model="tab">
                    <v-tabs-window-item value="billing">
                        <v-table fixed-header>
                            <thead>
                                <tr>
                                    <th class="text-left">Type</th>
                                    <th class="text-left">Name</th>
                                    <th class="text-left">Company</th>
                                    <th class="text-left">Street</th>
                                    <th class="text-left">City</th>
                                    <th class="text-left">Region</th>
                                    <th class="text-left">Postcode</th>
                                    <th class="text-left">Country</th>
                                    <th class="text-left">Phone</th>
                                    <th class="text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="address in addresses" :key="address.id">
                                    <td>{{ address.default_billing ? 'Default Billing' : 'Billing' }}</td>
                                    <td>{{ address.firstname }} {{ address.lastname }}</td>
                                    <td>{{ address.company }}</td>
                                    <td>{{ address.street.join(', ') }}</td>
                                    <td>{{ address.city }}</td>
                                    <td>{{ address.region?.region }}</td>
                                    <td>{{ address.postcode }}</td>
                                    <td>{{ address.country_id }}</td>
                                    <td>{{ address.telephone }}</td>
                                    <td>
                                        <UButton icon="fas:fa fa-edit" color="primary" size="small" @click="editAddress(address)" />
                                        <UButton icon="fas:fa fa-trash" color="error" size="small" @click="deleteAddress(address.id)" />
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-tabs-window-item>

                    <v-tabs-window-item value="shipping">
                        <v-table fixed-header>
                            <thead>
                                <tr>
                                    <th class="text-left">Type</th>
                                    <th class="text-left">Name</th>
                                    <th class="text-left">Company</th>
                                    <th class="text-left">Street</th>
                                    <th class="text-left">City</th>
                                    <th class="text-left">Region</th>
                                    <th class="text-left">Postcode</th>
                                    <th class="text-left">Country</th>
                                    <th class="text-left">Phone</th>
                                    <th class="text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="address in addresses" :key="address.id">
                                    <td>{{ address.default_shipping ? 'Default Shipping' : 'Shipping' }}</td>
                                    <td>{{ address.firstname }} {{ address.lastname }}</td>
                                    <td>{{ address.company }}</td>
                                    <td>{{ address.street.join(', ') }}</td>
                                    <td>{{ address.city }}</td>
                                    <td>{{ address.region?.region }}</td>
                                    <td>{{ address.postcode }}</td>
                                    <td>{{ address.country_id }}</td>
                                    <td>{{ address.telephone }}</td>
                                    <td>
                                        <UButton icon="fas:fa fa-edit" color="primary" size="small" @click="editAddress(address)" />
                                        <UButton icon="fas:fa fa-trash" color="error" size="small" @click="deleteAddress(address.id)" />
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-tabs-window-item>
                </v-tabs-window>
            </template>
        </UCard>

        <!-- Add/Edit Address Dialog -->
        <v-dialog v-model="showAddAddress" max-width="600px">
            <UCard>
                <template #header>
                    {{ editingAddress ? 'Edit Address' : 'Add New Address' }}
                </template>
                <template #header>
                    <v-form ref="form" v-model="valid">
                        <v-row>
                            <v-col cols="6">
                                <UInput
                                    v-model="addressForm.firstname"
                                    label="First Name"
                                    required
                                />
                            </v-col>
                            <v-col cols="6">
                                <UInput
                                    v-model="addressForm.lastname"
                                    label="Last Name"
                                    required
                                />
                            </v-col>
                        </v-row>
                        <UInput
                            v-model="addressForm.company"
                            label="Company"
                        />
                        <UInput
                            v-model="addressForm.street[0]"
                            label="Street Address"
                            required
                        />
                        <UInput
                            v-model="addressForm.street[1]"
                            label="Street Address Line 2"
                        />
                        <v-row>
                            <v-col cols="6">
                                <UInput
                                    v-model="addressForm.city"
                                    label="City"
                                    required
                                />
                            </v-col>
                            <v-col cols="6">
                                <UInput
                                    v-model="addressForm.postcode"
                                    label="Postal Code"
                                    required
                                />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="6">
                                <USelect
                                    v-model="addressForm.country_id"
                                    :items="countries"
                                    label="Country"
                                    required
                                />
                            </v-col>
                            <v-col cols="6">
                                <UInput
                                    v-model="addressForm.telephone"
                                    label="Phone Number"
                                    required
                                />
                            </v-col>
                        </v-row>
                        <UCheckbox
                            v-model="addressForm.default_billing"
                            label="Set as default billing address"
                        />
                        <UCheckbox
                            v-model="addressForm.default_shipping"
                            label="Set as default shipping address"
                        />
                    </v-form>
                </template>
                <template>
                    <v-spacer />
                    <UButton color="error" @click="showAddAddress = false">Cancel</UButton>
                    <UButton color="primary" @click="saveAddress" :disabled="!valid">Save</UButton>
                </template>
            </UCard>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMagentoApi } from '#commerce/app/composables/useMagentoApi'

const tab = ref('billing')
const addresses = ref([])
const showAddAddress = ref(false)
const editingAddress = ref(null)
const valid = ref(false)
const form = ref(null)

const addressForm = ref({
    firstname: '',
    lastname: '',
    company: '',
    street: ['', ''],
    city: '',
    postcode: '',
    country_id: '',
    telephone: '',
    default_billing: false,
    default_shipping: false
})

const countries = ref([
    { title: 'United States', value: 'US' },
    { title: 'Canada', value: 'CA' },
    // Add more countries as needed
])

const { getCustomerAddresses, fetchMagento } = useMagentoApi()

const loadAddresses = async () => {
    try {
        addresses.value = await getCustomerAddresses()
    } catch (error) {
        console.error('Failed to load addresses:', error)
    }
}

const editAddress = (address) => {
    editingAddress.value = address
    addressForm.value = { ...address }
    showAddAddress.value = true
}

const deleteAddress = async (addressId) => {
    try {
        await fetchMagento(`customer/addresses/${addressId}`, {
            method: 'DELETE'
        })
        await loadAddresses()
    } catch (error) {
        console.error('Failed to delete address:', error)
    }
}

const saveAddress = async () => {
    try {
        if (editingAddress.value) {
            await fetchMagento(`customer/addresses/${editingAddress.value.id}`, {
                method: 'PUT',
                body: addressForm.value
            })
        } else {
            await fetchMagento('customer/addresses', {
                method: 'POST',
                body: addressForm.value
            })
        }
        showAddAddress.value = false
        editingAddress.value = null
        addressForm.value = {
            firstname: '',
            lastname: '',
            company: '',
            street: ['', ''],
            city: '',
            postcode: '',
            country_id: '',
            telephone: '',
            default_billing: false,
            default_shipping: false
        }
        await loadAddresses()
    } catch (error) {
        console.error('Failed to save address:', error)
    }
}

onMounted(() => {
    loadAddresses()
})

useHead({
    title: 'My Addresses'
})
</script>