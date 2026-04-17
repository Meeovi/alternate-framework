<script setup lang="ts">
import type { mastodon } from 'masto'
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { cacheAccount } from '../../../../composables/lists/accounts'
import { currentUser, refreshAccountInfo } from '../../../../composables/contacts/users'
import { onHydrated, onReactivated, useHydratedHead } from '../../../../composables/core/vue'
import { convertMetadata, maxAccountFieldCount } from '../../../../composables/settings/metadata'
import { useFederation as useMasto } from '../../../../composables/useFederation'

const { t } = useLocate()

useHydratedHead({
  title: () => `${t('settings.profile.appearance.title')} | ${t('nav.settings')}`,
})

const { client } = useMasto()

const avatarInput = ref<any>()
const headerInput = ref<any>()

const account = computed(() => currentUser.value?.account)

const onlineSrc = computed(() => ({
  avatar: account.value?.avatar || '',
  header: account.value?.header || '',
}))

type ProfileFieldAttribute = {
  name: string
  value: string
}

type AppearanceForm = {
  displayName: string
  note: string
  avatar: File | null
  header: File | null
  fieldsAttributes: ProfileFieldAttribute[]
  bot: boolean
  locked: boolean
}

type MutableUpdateCredentialsParams = {
  -readonly [K in keyof mastodon.rest.v1.UpdateCredentialsParams]?: mastodon.rest.v1.UpdateCredentialsParams[K]
}

function buildFormState(): AppearanceForm {
  const fieldsAttributes = Array.from({ length: maxAccountFieldCount.value }, (_, index) => {
    const field = { ...account.value?.fields?.[index] || { name: '', value: '' } }

    field.value = convertMetadata(field.value)

    return field
  })

  return {
    displayName: account.value?.displayName ?? '',
    note: account.value?.source.note?.replaceAll('\r', '') ?? '',
    avatar: null,
    header: null,
    fieldsAttributes,
    bot: account.value?.bot ?? false,
    locked: account.value?.locked ?? false,
  }
}

function cloneFormState(source: AppearanceForm): AppearanceForm {
  return {
    displayName: source.displayName,
    note: source.note,
    avatar: source.avatar,
    header: source.header,
    fieldsAttributes: source.fieldsAttributes.map(field => ({ ...field })),
    bot: source.bot,
    locked: source.locked,
  }
}

function assignFormState(source: AppearanceForm) {
  form.displayName = source.displayName
  form.note = source.note
  form.avatar = source.avatar
  form.header = source.header
  form.bot = source.bot
  form.locked = source.locked
  form.fieldsAttributes.splice(0, form.fieldsAttributes.length, ...source.fieldsAttributes.map(field => ({ ...field })))
}

const form = reactive<AppearanceForm>(buildFormState())
const initialForm = ref<AppearanceForm>(cloneFormState(form))
const submitting = ref(false)

const isDirty = computed(() => {
  return form.displayName !== initialForm.value.displayName
    || form.note !== initialForm.value.note
    || form.avatar !== initialForm.value.avatar
    || form.header !== initialForm.value.header
    || form.bot !== initialForm.value.bot
    || form.locked !== initialForm.value.locked
    || JSON.stringify(form.fieldsAttributes) !== JSON.stringify(initialForm.value.fieldsAttributes)
})

const isCanSubmit = computed(() => isDirty.value)
const failedMessages = ref<string[]>([])

function reset() {
  assignFormState(cloneFormState(initialForm.value))
}

function getDirtyFields(): MutableUpdateCredentialsParams {
  const dirtyFields: MutableUpdateCredentialsParams = {}

  if (form.displayName !== initialForm.value.displayName)
    dirtyFields.displayName = form.displayName

  if (form.note !== initialForm.value.note)
    dirtyFields.note = form.note

  if (form.avatar !== initialForm.value.avatar && form.avatar)
    dirtyFields.avatar = form.avatar

  if (form.header !== initialForm.value.header && form.header)
    dirtyFields.header = form.header

  if (JSON.stringify(form.fieldsAttributes) !== JSON.stringify(initialForm.value.fieldsAttributes))
    dirtyFields.fieldsAttributes = form.fieldsAttributes

  if (form.bot !== initialForm.value.bot)
    dirtyFields.bot = form.bot

  if (form.locked !== initialForm.value.locked)
    dirtyFields.locked = form.locked

  return dirtyFields
}

async function submit() {
  if (!isCanSubmit.value)
    return

  submitting.value = true

  const dirtyFields = getDirtyFields()

  const res = await client.value.v1.accounts.updateCredentials(dirtyFields as mastodon.rest.v1.UpdateCredentialsParams)
    .then(account => ({ account }))
    .catch((error: Error) => ({ error }))

  if ('error' in res) {
    console.error(res.error)
    failedMessages.value.push(res.error.message)
    submitting.value = false
    return
  }

  const server = currentUser.value!.server

  if (!res.account.acct.includes('@'))
    res.account.acct = `${res.account.acct}@${server}`

  cacheAccount(res.account, server, true)
  currentUser.value!.account = res.account
  const nextFormState = buildFormState()
  initialForm.value = cloneFormState(nextFormState)
  assignFormState(nextFormState)
  submitting.value = false
}

async function refreshInfo() {
  if (!currentUser.value)
    return
  // Keep the information to be edited up to date
  await refreshAccountInfo()
  if (!isDirty.value) {
    const nextFormState = buildFormState()
    initialForm.value = cloneFormState(nextFormState)
    assignFormState(nextFormState)
  }
}

useDropZone(avatarInput, (files) => {
  if (files?.[0])
    form.avatar = files[0]
})
useDropZone(headerInput, (files) => {
  if (files?.[0])
    form.header = files[0]
})

onHydrated(refreshInfo)
onReactivated(refreshInfo)
</script>

<template>
  <MainContent back>
    <template #title>
      <MainTitle as="h1" secondary>
        {{ $t('settings.profile.appearance.title') }}
      </MainTitle>
    </template>

    <v-form space-y-5 @submit.prevent="submit">
      <div v-if="account">
        <!-- banner -->
        <div of-hidden bg="gray-500/20" aspect="3">
          <CommonInputImage
            ref="headerInput"
            v-model="form.header"
            :original="onlineSrc.header"
            w-full h-full
          />
        </div>
        <CommonCropImage v-model="form.header" :stencil-aspect-ratio="3 / 1" />

        <!-- avatar -->
        <div px-4 flex="~ gap4">
          <CommonInputImage
            ref="avatarInput"
            v-model="form.avatar"
            :original="onlineSrc.avatar"
            mt--10
            rounded-full border="bg-base 4"
            w="sm:30 24" min-w="sm:30 24" h="sm:30 24"
          />
        </div>
        <CommonCropImage v-model="form.avatar" />

        <div px4>
          <div flex justify-between>
            <AccountDisplayName
              :account="{ ...account, displayName: form.displayName }"
              font-bold sm:text-2xl text-xl
            />
            <div flex="~ row" items-center gap2>
              <label>
                <AccountLockIndicator show-label px2 py1>
                  <template #prepend>
                    <input v-model="form.locked" type="checkbox" cursor-pointer>
                  </template>
                </AccountLockIndicator>
              </label>
              <label>
                <AccountBotIndicator show-label px2 py1>
                  <template #prepend>
                    <input v-model="form.bot" type="checkbox" cursor-pointer>
                  </template>
                </AccountBotIndicator>
              </label>
            </div>
          </div>
          <AccountHandle :account="account" />
        </div>
      </div>

      <div px4 py3 space-y-5>
        <!-- display name -->
        <label space-y-2 block>
          <p font-medium>
            {{ $t('settings.profile.appearance.display_name') }}
          </p>
          <input v-model="form.displayName" type="text" input-base>
        </label>

        <!-- note -->
        <label space-y-2 block>
          <p font-medium>
            {{ $t('settings.profile.appearance.bio') }}
          </p>
          <textarea v-model="form.note" maxlength="500" min-h-10ex input-base />
        </label>

        <!-- metadata -->

        <SettingsProfileMetadata v-model="form" />

        <!-- actions -->
        <div flex="~ gap2" justify-end>
          <v-btn
            type="button"
            btn-text text-sm
            flex gap-x-2 items-center
            text-red
            @click="reset()"
          >
            <div aria-hidden="true" i-ri:eraser-line />
            {{ $t('action.reset') }}
          </v-btn>

          <v-btn
            v-if="failedMessages.length === 0"
            type="submit"
            btn-solid rounded-full text-sm
            flex gap-x-2 items-center
            :disabled="submitting || !isCanSubmit"
          >
            <span v-if="submitting" aria-hidden="true" block animate-spin preserve-3d>
              <span block i-ri:loader-2-fill aria-hidden="true" />
            </span>
            <span v-else aria-hidden="true" block i-ri:save-line />
            {{ $t('action.save') }}
          </v-btn>

          <v-btn
            v-else
            type="submit"
            btn-danger rounded-full text-sm
            flex gap-x-2 items-center
          >
            <span
              aria-hidden="true" block i-carbon:face-dizzy-filled
            />
            <span>{{ $t('state.save_failed') }}</span>
          </v-btn>
        </div>

        <CommonErrorMessage v-if="failedMessages.length > 0" described-by="save-failed">
          <header id="save-failed" flex justify-between>
            <div flex items-center gap-x-2 font-bold>
              <div aria-hidden="true" i-ri:error-warning-fill />
              <p>{{ $t('state.save_failed') }}</p>
            </div>
            <CommonTooltip placement="bottom" :content="$t('action.clear_save_failed')">
              <v-btn
                flex rounded-4 p1 hover:bg-active cursor-pointer transition-100 :aria-label="$t('action.clear_save_failed')"
                @click="failedMessages = []"
              >
                <span aria-hidden="true" w="1.75em" h="1.75em" i-ri:close-line />
              </v-btn>
            </CommonTooltip>
          </header>
          <ol ps-2 sm:ps-1>
            <li v-for="(error, i) in failedMessages" :key="i" flex="~ col sm:row" gap-y-1 sm:gap-x-2>
              <strong>{{ i + 1 }}.</strong>
              <span>{{ error }}</span>
            </li>
          </ol>
        </CommonErrorMessage>
      </div>
    </v-form>
  </MainContent>
</template>
