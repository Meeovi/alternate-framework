<script setup lang="ts">
import type { Picker } from 'emoji-mart'
// Fallback for build-time when the virtual emoji-mart lang importer is unavailable
const importEmojiLang = async (_lang: string) => ({})

const emit = defineEmits<{
  (e: 'select', code: string): void
  (e: 'selectCustom', image: any): void
}>()

const { locale } = useI18n()

const el = ref<HTMLElement>()
const picker = ref<Picker>()
const colorMode = useColorMode()
const emojiMenuOpen = ref(false)

function onEmojiMenuToggle(value: boolean) {
  emojiMenuOpen.value = value
  if (value)
    openEmojiPicker()
  else
    hideEmojiPicker()
}

async function openEmojiPicker() {
  await updateCustomEmojis()

  if (picker.value) {
    picker.value.update({
      theme: colorMode,
      custom: customEmojisData.value,
    })
  }
  else {
    const [Picker, dataPromise, i18n] = await Promise.all([
      import('emoji-mart').then(({ Picker }) => Picker),
      import('@emoji-mart/data/sets/14/twitter.json').then((r: any) => r.default).catch(() => {}),
      importEmojiLang(locale.value.split('-')[0]),
    ])

    picker.value = new Picker({
      data: () => dataPromise,
      onEmojiSelect({ native, src, alt, name }: any) {
        if (native)
          emit('select', native)
        else
          emit('selectCustom', { src, alt, 'data-emoji-id': name })
      },
      set: 'twitter',
      theme: colorMode,
      custom: customEmojisData.value,
      i18n,
    })
  }
  await nextTick()
  // TODO: custom picker
  el.value?.appendChild(picker.value as any as HTMLElement)
}

function hideEmojiPicker() {
  if (picker.value)
    el.value?.removeChild(picker.value as any as HTMLElement)
}
</script>

<template>
  <CommonTooltip :content="$t('tooltip.add_emojis')">
    <v-menu
      v-model="emojiMenuOpen"
      location="bottom"
      :close-on-content-click="false"
      @update:model-value="onEmojiMenuToggle"
    >
      <template #activator="{ props }">
        <div v-bind="props">
          <NuxtPage />
        </div>
      </template>

      <template #default>
        <div ref="el" min-w-10 min-h-10 />
      </template>
    </v-menu>
  </CommonTooltip>
</template>
