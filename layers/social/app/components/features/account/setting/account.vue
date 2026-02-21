<template>
  <UForm class="form-widget" @submit.prevent="updateProfile">
    <avatar v-model:path="avatar_path" @upload="updateProfile" />
    <div>
      <UInput label="Email" id="email" type="email" :value="user.email" disabled />
    </div>
    <div>
      <UInput label="Username" id="username" v-model="username" />
    </div>

    <div>
      <UInput label="Date of Birth" id="date_of_birth" v-model="date_of_birth" />
    </div>

    <div>
      <UInput label="Default Billing Address" id="default_billing" v-model="default_billing" />
    </div>

    <div>
      <UInput label="Default Shipping Address" id="default_shipping" v-model="default_shipping" />
    </div>

    <div>
      <UInput label="Prefix" id="prefix" v-model="prefix" />
    </div>

    <div>
      <UInput label="First Name" id="firstname" v-model="firstname" />
    </div>

    <div>
      <UInput label="Middle Name" id="middlename" v-model="middlename" />
    </div>

    <div>
      <UInput label="Last Name" id="lastname" v-model="lastname" />
    </div>

    <div>
      <UInput label="Suffix" id="suffix" v-model="suffix" />
    </div>

    <div>
      <UInput label="Job Title" id="job_title" v-model="job_title" />
    </div>

    <div>
      <UInput label="Gender" id="gender" v-model="gender" />
    </div>

    <div>
      <UInput label="Company" id="companies" v-model="companies" />
    </div>

    <div>
      <UInput label="Role" id="role" v-model="role" />
    </div>

    <div>
      <UInput label="Tax VAT" id="taxvat" v-model="taxvat" />
    </div>

    <div>
      <UInput label="Team" id="team" v-model="team" />
    </div>

    <div>
      <UInput label="Phone Number" id="telephone" v-model="telephone" />
    </div>

    <div>
      <UInput label="Website" id="website" v-model="website" />
    </div>

    <div>
      <UButton class="btn btn-info display-7" type="submit" :value="loading ? 'Loading ...' : 'Update'"
        :disabled="loading" />
    </div>
  </UForm>
</template>

<script setup>
import { ref } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_CUSTOMER } from '#graphql/commerce/mutations/updateCustomer.gql?raw';

const firstname = ref('');
const middlename = ref('');
const lastname = ref('');
const prefix = ref('');
const suffix = ref('');
const dob = ref('');
const default_billing = ref('');
const default_shipping = ref('');
const job_title = ref('');
const gender = ref('');
const company = ref('');
const role = ref('');
const taxvat = ref('');
const team = ref('');
const telephone = ref('');
const website = ref('');
const avatar_path = ref('');

const { mutate: updateCustomer, loading, error } = useMutation(UPDATE_CUSTOMER);

const updateProfile = async () => {
  try {
    await updateCustomer({
      firstname: firstname.value,
      middlename: middlename.value,
      lastname: lastname.value,
      prefix: prefix.value,
      suffix: suffix.value,
      dob: dob.value,
      default_billing: default_billing.value,
      default_shipping: default_shipping.value,
      job_title: job_title.value,
      gender: Number.parseInt(gender.value), // Convert to integer if required
      company: company.value,
      role: role.value,
      taxvat: taxvat.value,
      team: team.value,
      telephone: telephone.value,
      website: website.value,
      avatar_path: avatar_path.value,
    });
    console.log('Profile updated successfully');
  } catch (err) {
    console.error('Error updating profile', err);
  }
};
</script>