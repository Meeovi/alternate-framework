<template>
  <div>
    <v-card elevation="0">
      <v-tabs v-model="tab" align-tabs="center">
        <v-tab value="account">Account Information</v-tab>
        <v-tab value="security">Security</v-tab>
        <v-tab value="preferences">Preferences</v-tab>
      </v-tabs>

      <v-card-text>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="account">
            <v-form ref="accountForm" v-model="accountValid">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="customerInfo.firstname"
                    label="First Name"
                    required
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="customerInfo.lastname"
                    label="Last Name"
                    required
                  />
                </v-col>
              </v-row>
              <v-text-field
                v-model="customerInfo.email"
                label="Email"
                type="email"
                required
                disabled
              />
              <v-text-field
                v-model="customerInfo.taxvat"
                label="Tax/VAT Number"
              />
              <v-btn
                color="primary"
                @click="updateCustomerInfo"
                :loading="updating"
                :disabled="!accountValid"
              >
                Save Changes
              </v-btn>
            </v-form>
          </v-tabs-window-item>

          <v-tabs-window-item value="security">
            <v-form ref="passwordForm" v-model="passwordValid">
              <v-text-field
                v-model="passwordData.current_password"
                label="Current Password"
                type="password"
                required
              />
              <v-text-field
                v-model="passwordData.new_password"
                label="New Password"
                type="password"
                required
              />
              <v-text-field
                v-model="passwordData.confirm_password"
                label="Confirm New Password"
                type="password"
                required
              />
              <v-btn
                color="primary"
                @click="changePassword"
                :loading="changingPassword"
                :disabled="!passwordValid"
              >
                Change Password
              </v-btn>
            </v-form>
          </v-tabs-window-item>

          <v-tabs-window-item value="preferences">
            <v-form ref="preferencesForm" v-model="preferencesValid">
              <v-select
                v-model="preferences.language"
                :items="languages"
                label="Language"
              />
              <v-select
                v-model="preferences.currency"
                :items="currencies"
                label="Currency"
              />
              <v-checkbox
                v-model="preferences.newsletter"
                label="Subscribe to Newsletter"
              />
              <v-btn
                color="primary"
                @click="updatePreferences"
                :loading="updatingPreferences"
                :disabled="!preferencesValid"
              >
                Save Preferences
              </v-btn>
            </v-form>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMagentoApi } from '#commerce/app/composables/useMagentoApi'

const tab = ref('account')
const accountValid = ref(false)
const passwordValid = ref(false)
const preferencesValid = ref(false)
const updating = ref(false)
const changingPassword = ref(false)
const updatingPreferences = ref(false)

const customerInfo = ref({
  firstname: '',
  lastname: '',
  email: '',
  taxvat: ''
})

const passwordData = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const preferences = ref({
  language: 'en',
  currency: 'USD',
  newsletter: false
})

const languages = [
  { title: 'English', value: 'en' },
  { title: 'Spanish', value: 'es' },
  { title: 'French', value: 'fr' }
]

const currencies = [
  { title: 'US Dollar', value: 'USD' },
  { title: 'Euro', value: 'EUR' },
  { title: 'British Pound', value: 'GBP' }
]

const { getCustomerInfo, fetchMagento } = useMagentoApi()

const loadCustomerInfo = async () => {
  try {
    const info = await getCustomerInfo()
    customerInfo.value = {
      firstname: info.firstname,
      lastname: info.lastname,
      email: info.email,
      taxvat: info.taxvat || ''
    }
  } catch (error) {
    console.error('Failed to load customer info:', error)
  }
}

const updateCustomerInfo = async () => {
  try {
    updating.value = true
    await fetchMagento('customer/me', {
      method: 'PUT',
      body: {
        customer: {
          firstname: customerInfo.value.firstname,
          lastname: customerInfo.value.lastname,
          taxvat: customerInfo.value.taxvat
        }
      }
    })
  } catch (error) {
    console.error('Failed to update customer info:', error)
  } finally {
    updating.value = false
  }
}

const changePassword = async () => {
  if (passwordData.value.new_password !== passwordData.value.confirm_password) {
    alert('New passwords do not match')
    return
  }

  try {
    changingPassword.value = true
    await fetchMagento('customer/me/password', {
      method: 'PUT',
      body: {
        currentPassword: passwordData.value.current_password,
        newPassword: passwordData.value.new_password
      }
    })
    passwordData.value = {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  } catch (error) {
    console.error('Failed to change password:', error)
  } finally {
    changingPassword.value = false
  }
}

const updatePreferences = async () => {
  try {
    updatingPreferences.value = true
    await fetchMagento('customer/me', {
      method: 'PUT',
      body: {
        customer: {
          custom_attributes: {
            language: preferences.value.language,
            currency: preferences.value.currency,
            newsletter: preferences.value.newsletter
          }
        }
      }
    })
  } catch (error) {
    console.error('Failed to update preferences:', error)
  } finally {
    updatingPreferences.value = false
  }
}

onMounted(() => {
  loadCustomerInfo()
})

definePageMeta({
  layout: 'nolive',
  middleware: ['authenticated']
})

useHead({
  title: 'Account Settings'
})
</script>