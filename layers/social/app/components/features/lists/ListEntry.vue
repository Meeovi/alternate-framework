<script setup lang="ts">
import type { mastodon } from 'masto'
import { computed, ref, nextTick, onDeactivated } from 'vue';
import { useI18n } from 'vue-i18n'
import { useMastoClient } from '../../composables/masto'
import { openConfirmDialog } from '../../composables/dialog'

// Alias the mastodon List type to avoid naming conflicts
type MastodonList = mastodon.v1.List

const emit = defineEmits<{
  (e: 'listUpdated', list: MastodonList): void
  (e: 'listRemoved', id: string): void
}>()
const listModel = defineModel<MastodonList>({ required: true })

const { t } = useI18n()
const client = useMastoClient()
const editTitle = ref('')
const submitting = ref(false)
const isDirty = computed(() => editTitle.value.trim() !== (listModel.value.title ?? '').trim())

const isEditing = ref<boolean>(false)
const deleting = ref<boolean>(false)
const actionError = ref<string | undefined>(undefined)

const input = ref<HTMLInputElement>()
const editBtn = ref<HTMLButtonElement>()
const deleteBtn = ref<HTMLButtonElement>()

async function prepareEdit() {
  isEditing.value = true
  actionError.value = undefined
  editTitle.value = listModel.value.title
  await nextTick()
  input.value?.focus()
}
async function cancelEdit() {
  isEditing.value = false
  actionError.value = undefined
  editTitle.value = listModel.value.title

  await nextTick()
  editBtn.value?.focus()
}

async function submit() {
  if (submitting.value)
    return
  try {
    submitting.value = true
    listModel.value = await client.v1.lists.$select(listModel.value.id).update({
      title: editTitle.value,
    })
    await cancelEdit()
  }
  catch (err) {
    console.error(err)
    actionError.value = (err as Error).message
    await nextTick()
    input.value?.focus()
  }
  finally {
    submitting.value = false
  }
}

async function removeList() {
  if (deleting.value)
    return

  const confirmDelete = await openConfirmDialog({
    title: t('confirm.delete_list.title'),
    description: t('confirm.delete_list.description', [listModel.value.title]),
    confirm: t('confirm.delete_list.confirm'),
    cancel: t('confirm.delete_list.cancel'),
  })

  deleting.value = true
  actionError.value = undefined
  await nextTick()

  if (confirmDelete.choice === 'confirm') {
    await nextTick()
    try {
      await client.v1.lists.$select(listModel.value.id).remove()
      emit('listRemoved', listModel.value.id)
    }
    catch (err) {
      console.error(err)
      actionError.value = (err as Error).message
      await nextTick()
      deleteBtn.value?.focus()
    }
    finally {
      deleting.value = false
    }
  }
  else {
    deleting.value = false
  }
}

async function clearError() {
  actionError.value = undefined
  await nextTick()
  if (isEditing.value)
    input.value?.focus()
  else
    deleteBtn.value?.focus()
}

onDeactivated(cancelEdit)
</script>

<template>
  <v-form
    hover:bg-active flex justify-between items-center gap-x-2
    :aria-describedby="actionError ? `action-list-error-${listModel.id}` : undefined"
    :class="actionError ? 'border border-base border-rounded rounded-be-is-0 rounded-be-ie-0 border-b-unset border-$c-danger-active' : null"
    @submit.prevent="submit"
  >
    <div
      v-if="isEditing"
      bg-base border="~ base" h10 m2 ps-1 pe-4 rounded-3 w-full flex="~ row"
      items-center relative focus-within:box-shadow-outline gap-3
    >
      <CommonTooltip v-if="isEditing" :content="t('list.cancel_edit')">
        <v-btn
          type="v-btn"
          rounded-full text-sm p2 transition-colors
          hover:text-primary
          @click="cancelEdit()"
        >
          <span block text-current i-ri:close-fill />
        </v-btn>
      </CommonTooltip>
      <v-text-field
        ref="input"
        v-model="editTitle"
        rounded-3 w-full bg-transparent
        outline="focus:none" pe-4 pb="1px"
        flex-1 placeholder-text-secondary
        @keydown.esc="cancelEdit()"
      ></v-text-field>
    </div>
    <NuxtLink v-else :to="`list/${listModel.id}`" block grow p4>
      {{ listModel.title }}
    </NuxtLink>
    <div mr4 flex gap2>
      <CommonTooltip v-if="isEditing" :content="t('list.save')">
        <v-btn
          type="submit"
          text-sm p2 border-1 transition-colors
          border-dark hover:text-primary
          btn-action-icon
          :disabled="deleting || !isDirty || submitting"
        >
          <template v-if="isEditing">
            <span v-if="submitting" aria-hidden="true" block animate animate-spin preserve-3d class="rtl-flip">
              <span block i-ri:loader-2-fill aria-hidden="true" />
            </span>
            <span v-else block text-current i-ri:save-2-fill class="rtl-flip" />
          </template>
        </v-btn>
      </CommonTooltip>
      <CommonTooltip v-else :content="t('list.edit')">
        <v-btn
          ref="editBtn"
          type="v-btn"
          text-sm p2 border-1 transition-colors
          border-dark hover:text-primary
          btn-action-icon
          @click.prevent="prepareEdit"
        >
          <span block text-current i-ri:edit-2-line class="rtl-flip" />
        </v-btn>
      </CommonTooltip>
      <CommonTooltip :content="t('list.delete')">
        <v-btn
          type="v-btn"
          text-sm p2 border-1 transition-colors
          border-dark hover:text-primary
          btn-action-icon
          :disabled="isEditing"
          @click.prevent="removeList"
        >
          <span v-if="deleting" aria-hidden="true" block animate animate-spin preserve-3d class="rtl-flip">
            <span block i-ri:loader-2-fill aria-hidden="true" />
          </span>
          <span v-else block text-current i-ri:delete-bin-2-line class="rtl-flip" />
        </v-btn>
      </CommonTooltip>
    </div>
  </v-form>
  <CommonErrorMessage
    v-if="actionError"
    :id="`action-list-error-${listModel.id}`"
    :described-by="`action-list-failed-${listModel.id}`"
    class="rounded-bs-is-0 rounded-bs-ie-0 border-t-dashed m-b-2"
  >
    <header :id="`action-list-failed-${listModel.id}`" flex justify-between>
      <div flex items-center gap-x-2 font-bold>
        <div aria-hidden="true" i-ri:error-warning-fill />
        <p>{{ t(`list.${isEditing ? 'edit_error' : 'delete_error'}`) }}</p>
      </div>
      <CommonTooltip placement="bottom" :content="t('list.clear_error')">
        <v-btn
          flex rounded-4 p1 hover:bg-active cursor-pointer transition-100 :aria-label="t('list.clear_error')"
          @click="clearError"
        >
          <span aria-hidden="true" w="1.75em" h="1.75em" i-ri:close-line />
        </v-btn>
      </CommonTooltip>
    </header>
    <ol ps-2 sm:ps-1>
      <li flex="~ col sm:row" gap-y-1 sm:gap-x-2>
        <strong sr-only>{{ t('list.error_prefix') }}</strong>
        <span>{{ actionError }}</span>
      </li>
    </ol>
  </CommonErrorMessage>
</template>
