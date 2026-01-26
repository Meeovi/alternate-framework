import { ref, computed, watch } from "vue"
import Input from "~/components/ui/forms/TextInput.vue"
import TextArea from "~/components/ui/forms/TextArea.vue"
import Select from "~/components/ui/forms/SelectInput.vue"
import DateTime from "~/components/ui/forms/DateTime.vue"
import FileInput from "~/components/ui/forms/FileInput.vue"
import BooleanInput from "~/components/ui/forms/BooleanInput.vue"
import RelationSelect from "~/components/ui/forms/RelationSelect.vue"
import RepeaterInput from "~/components/ui/forms/RepeaterInput.vue"
import TiptapEditor from "~/components/ui/forms/TiptapEditor.vue"

export function useDirectusField(field: any, modelValue: any, emit: any, formContext?: any) {
  const internalValue = computed({
    get: () => modelValue,
    set: (v) => emit("update:modelValue", v),
  })

  const previousAuto = ref<string | null>(null)
  const internalAuto = computed(() => {
    return previousAuto.value != null && internalValue.value === previousAuto.value
  })

  const slugify = (val: string) =>
    String(val || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

  const isAliasField = computed(() => {
    const meta = field?.meta ?? {}
    return (
      meta.interface === "alias" ||
      (meta.options && (meta.options.source || meta.options.from))
    )
  })

  if (isAliasField.value && formContext && formContext.form) {
    const meta = field?.meta ?? {}
    let sourceField: string | null = meta?.options?.source ?? meta?.options?.from ?? null

    if (!sourceField && formContext.fields) {
      const candidates = ["name", "title"]
      sourceField =
        candidates.find((c: string) =>
          formContext.fields.value.some((f: any) => f.field === c)
        ) ?? null
    }

    if (sourceField) {
      watch(
        () => formContext.form.value?.[sourceField as string],
        (newVal) => {
          const target = field.field
          const current = formContext.form.value?.[target] ?? ""
          const generated = slugify(String(newVal ?? ""))

          if (!generated) return

          // Case 1: Empty or previously auto‑generated → regenerate
          if (!current || current === previousAuto.value) {
            formContext.form.value[target] = generated
            internalValue.value = generated
            previousAuto.value = generated
          }
        },
        { immediate: true }
      )

      // Watch the target itself: if cleared, regenerate
      watch(
        () => formContext.form.value?.[field.field],
        (newVal) => {
          if (!newVal) {
            const sourceVal = formContext.form.value?.[sourceField as string] ?? ""
            const regenerated = slugify(String(sourceVal))
            if (regenerated) {
              formContext.form.value[field.field] = regenerated
              internalValue.value = regenerated
              previousAuto.value = regenerated
            }
          }
        }
      )
    }
  }

  // --- Label prettifier ---
  const prettify = (s: string) =>
    s.replace(/_/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")

  const label = computed(() => {
    const raw = field?.meta?.field ?? field?.field ?? ""
    return prettify(raw)
  })

  // --- Field lookup ---
  const fieldLookup = computed(() => {
    const iface = field?.meta?.interface
    const name = String(iface ?? "").toLowerCase()

    if (["input", "string"].includes(name)) return Input
    if (
      ["textarea", "wysiwyg", "rich-text", "input-multiline", "input-rich-text", "input-rich-text-md"].includes(name)
    )
      return TiptapEditor
    if (["select", "select-dropdown", "select-multiple"].includes(name)) return Select
    if (name === "datetime") return DateTime
    if (["file", "files", "file-image"].includes(name)) return FileInput
    if (name === "boolean") return BooleanInput
    if (name.includes("many") || name.includes("one") || name.includes("to")) return RelationSelect
    return Input
  })

  const required = computed(() => {
    const meta = field?.meta ?? {}
    return Boolean(meta?.validation?.required ?? meta?.required ?? false)
  })

  const safeOptions = computed(() => field?.meta?.options ?? null)
  const defaultValue = computed(() => field?.schema?.default_value ?? null)
  const isMultiple = computed(() => {
    const name = String(field?.meta?.interface ?? "").toLowerCase()
    if (name === "select-multiple") return true
    if (name.includes("many")) return true
    return Boolean(field?.meta?.options?.multiple || false)
  })

  return {
    internalValue,
    internalAuto,
    label,
    fieldLookup,
    required,
    safeOptions,
    defaultValue,
    isMultiple,
  }
}