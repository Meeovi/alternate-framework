<script setup lang="ts">
import type { Editor } from '@tiptap/core'

defineProps<{
  editor: Editor
}>()
</script>

<template>
  <CommonTooltip placement="top" :content="$t('tooltip.open_editor_tools')">
    <VDropdown v-if="editor" placement="bottom">
      <v-btn
        btn-action-icon
        :aria-label="$t('tooltip.open_editor_tools')"
      >
        <div i-ri:font-size-2 />
      </v-btn>
      <template #popper>
        <div flex gap-1>
          <CommonTooltip placement="top" :content="$t('tooltip.toggle_code_block')">
            <v-btn
              btn-action-icon
              :aria-label="$t('tooltip.toggle_code_block')"
              :class="editor.isActive('codeBlock') ? 'text-primary' : ''"
              @click="editor?.chain().focus().toggleCodeBlock().run()"
            >
              <div i-ri:code-s-slash-line />
            </v-btn>
          </CommonTooltip>
          <CommonTooltip placement="top" :content="$t('tooltip.toggle_bold')">
            <v-btn
              btn-action-icon
              :aria-label="$t('tooltip.toggle_bold')"
              :class="editor.isActive('bold') ? 'text-primary' : ''"
              @click="editor?.chain().focus().toggleBold().run()"
            >
              <div i-ri:bold />
            </v-btn>
          </CommonTooltip>
          <CommonTooltip placement="top" :content="$t('tooltip.toggle_italic')">
            <v-btn
              btn-action-icon
              :aria-label="$t('tooltip.toggle_italic')"
              :class="editor.isActive('italic') ? 'text-primary' : ''"
              @click="editor?.chain().focus().toggleItalic().run()"
            >
              <div i-ri:italic />
            </v-btn>
          </CommonTooltip>
        </div>
      </template>
    </VDropdown>
  </CommonTooltip>
</template>
