<template>
    <div>
        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn color="primary" v-bind="props">
                    <v-icon left>mdi-language</v-icon>
                    {{ locale.iso }}
                </v-btn>
            </template>
            <v-list>
                <v-list-item v-for="(item, index) in availableLocales" :key="index" :value="index"
                    :to="switchLocalePath(item.code)">
                    <v-list-item-icon>
                        <v-icon>mdi-{{ item.code }}</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>{{ item.iso }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script setup>
    const {
        locale,
        locales
    } = useI18n()
    const switchLocalePath = useSwitchLocalePath()

    const items = computed(() => {
        return locales.value.map(l => ({
            code: l.code,
            title: l.iso
        }))
    })
    const availableLocales = computed(() => {
        return locales.value.filter(i => i.code !== locale.value)
    })
</script>