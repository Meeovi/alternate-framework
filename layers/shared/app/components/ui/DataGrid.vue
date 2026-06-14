<template>
    <ClientOnly>
        <Willow>
            <Grid :data="data" :columns="columns" :select="true" />
        </Willow>
    </ClientOnly>
</template>

<script setup lang="ts">
    import type {
        IColumnConfig,
        IApi,
        IRow
    } from "@svar-ui/vue-grid";
    import {
        Grid,
        getEditorConfig,
        Willow
    } from "@svar-ui/vue-grid";
    import {
        DatePicker,
        Button
    } from "@svar-ui/vue-core";
    import {
        Editor,
        registerEditorItem
    } from "@svar-ui/vue-editor";
    import {
        RestDataProvider
    } from "@svar-ui/grid-data-provider";
    import "@svar-ui/vue-grid/all.css";
    import "@svar-ui/vue-editor/style.css";

    registerEditorItem("datepicker", DatePicker);

    const props = defineProps<{
    data?: any[];
    columns?: IColumnConfig[];
    }>();

    const autoColumns = computed<IColumnConfig[]>(() => {
    if (!props.data || props.data.length === 0) return [];

    const row = props.data[0];

    function flatten(obj: any, prefix = '') {
        return Object.entries(obj).flatMap(([key, value]) => {
        const full = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return flatten(value, full);
        }
        return [{ id: full, header: full.replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }];
        });
    }

    return flatten(row);
    });

    const columns = computed(() => props.columns ?? autoColumns.value);
    const rows = computed(() => props.data ?? []);

    const api = ref < IApi | null > (null);
    const dataToEdit = ref < IRow | undefined > (undefined);
    const items = computed(() => getEditorConfig(columns.value));

    function normalize(record: Record < string, unknown > ) {
        if (record.birthday) {
            record.birthday = new Date(record.birthday as string);
        }
    }

    const server = new RestDataProvider(apiUrl, normalize);
    const defaultRows = ref<IRow[]>([])

    onMounted(() => {
        if (!props.data || props.data.length === 0) {
            server.getData().then((records) => {
                defaultRows.value = records as IRow[];
            });
        }
    });

    function handleSelectRow(ev: {
        id: number
    }) {
        dataToEdit.value = api.value!.getRow(ev.id);
    }

    function handleChange({
        key,
        value
    }: {
        key: string;value: any
    }) {
        api.value!.exec("update-cell", {
            id: dataToEdit.value!.id,
            column: key,
            value,
        });
    }

    function handleAction() {
        dataToEdit.value = undefined;
    }

    function addRow() {
        api.value!.exec("add-row", {
            row: {}
        });
    }

    function deleteRow() {
        api.value!.exec("delete-row", {
            id: dataToEdit.value!.id
        });
    }
</script>