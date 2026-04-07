<script setup lang="ts">
import { rankByQuery } from '~/utils/alternateSearch'
import { useLocate } from 'alternate-locate/adapters/vue/composable'

const modelValue = defineModel<string>({ required: true })

const { t } = useLocate()
const userSettings = useUserSettings()

const languageKeyword = ref('')

const languages = computed(() =>
  languageKeyword.value.trim()
    ? rankByQuery(
        languagesNameList,
        languageKeyword.value,
        item => [item.code, item.nativeName, item.name],
      )
    : [...languagesNameList].filter(entry => !userSettings.value.disabledTranslationLanguages.includes(entry.code)).sort(({ code: a }, { code: b }) => {
        // Put English on the top
        if (a === 'en')
          return -1

        return a === modelValue.value ? -1 : b === modelValue.value ? 1 : a.localeCompare(b)
      }),
)

const preferredLanguages = computed(() => {
  const result = []
  for (const langCode of userSettings.value.disabledTranslationLanguages) {
    const completeLang = languagesNameList.find(listEntry => listEntry.code === langCode)
    if (completeLang)
      result.push(completeLang)
  }
  return result
},

)

function chooseLanguage(language: string) {
  modelValue.value = language
}
</script>

<template>
  <div relative of-x-hidden>
    <div p2>
      <input
        v-model="languageKeyword"
        :placeholder="t('language.search')"
        p2 border-rounded w-full bg-transparent
        outline-none border="~ base"
      >
    </div>
    <div max-h-40vh overflow-auto>
      <template v-if="!languageKeyword.trim()">
        <CommonDropdownItem
          v-for="{ code, nativeName, name } in preferredLanguages"
          :key="code"
          :text="nativeName"
          :description="name"
          :checked="code === modelValue"
          @click="chooseLanguage(code)"
        />
        <hr class="border-base ">
      </template>

      <CommonDropdownItem
        v-for="{ code, nativeName, name } in languages"
        :key="code"
        :text="nativeName"
        :description="name"
        :checked="code === modelValue"
        @click="chooseLanguage(code)"
      />
    </div>
  </div>
</template>
