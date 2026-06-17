<script setup>
defineOptions({ name: "GridGrid" });

import { ref, computed, inject, provide, watchEffect } from "vue";

// core widgets lib
import { Locale } from "@svar-ui/vue-core";
import { en } from "@svar-ui/grid-locales";

// stores
import { EventBusRouter } from "@svar-ui/lib-state";
import { DataStore } from "@svar-ui/grid-store";

// writable factory for Vue
import { writable } from "@svar-ui/lib-vue";

// ui
import Layout from "./Layout.vue";

const props = defineProps({
	data: { default: () => [] },
	columns: { default: () => [] },
	rowStyle: { default: null },
	columnStyle: { default: null },
	cellStyle: { default: null },
	selectedRows: { default: () => [] },
	select: { type: Boolean, default: true },
	multiselect: { type: Boolean, default: false },
	header: { type: Boolean, default: true },
	footer: { type: Boolean, default: false },
	tree: { type: Boolean, default: false },
	dynamic: { default: null },
	overlay: { default: null },
	reorder: { type: Boolean, default: false },
	onreorder: { type: Function, default: null },
	autoRowHeight: { type: Boolean, default: false },
	sizes: { default: () => ({}) },
	split: { default: () => ({ left: 0 }) },
	autoConfig: { type: [Boolean, Object], default: false },
	init: { type: Function, default: null },
	responsive: { default: null },
	sortMarks: { default: () => ({}) },
	undo: { type: Boolean, default: false },
	hotkeys: { default: null },
	filterValues: { default: () => ({}) },
});

// eslint-disable-next-line vue/valid-define-emits
const emit = defineEmits();

const clientWidth = ref(0);
const clientHeight = ref(0);
const responsiveLevel = ref(null);
const responsiveConfig = ref(null);

// init stores
const dataStore = new DataStore(writable);

// define event route
let firstInRoute = dataStore.in;

let lastInRoute = new EventBusRouter((a, b) => {
	emit(a, b);
});
firstInRoute.setNext(lastInRoute);

// public API
const getState = dataStore.getState.bind(dataStore);
const getReactiveState = dataStore.getReactive.bind(dataStore);
const getStores = () => ({ data: dataStore });
const exec = firstInRoute.exec.bind(firstInRoute);
const setNext = (ev) => (lastInRoute = lastInRoute.setNext(ev));
const intercept = firstInRoute.intercept.bind(firstInRoute);
const on = firstInRoute.on.bind(firstInRoute);
const detach = firstInRoute.detach.bind(firstInRoute);
const getRow = (id) => dataStore.getRow(id);
const getColumn = (id) => dataStore.getColumn(id);

const api = {
	exec,
	setNext,
	intercept,
	on,
	detach,
	getRow,
	getColumn,
	getState,
	getReactiveState,
	getStores,
};

// common API available in components
provide("grid-store", {
	getState: dataStore.getState.bind(dataStore),
	getReactiveState: dataStore.getReactive.bind(dataStore),
	exec: firstInRoute.exec.bind(firstInRoute),
	getRow: dataStore.getRow.bind(dataStore),
});

// auto config columns
const finalColumns = computed(() => {
  const cols =
    responsiveConfig.value?.columns ??
    props.columns;

  if (Array.isArray(cols)) return cols;

  if (props.autoConfig && !cols?.length) {
    const data = Array.isArray(props.data) ? props.data : [props.data];
    if (data.length) {
      const test = data[0];
      const autoCols = [];

      for (let key in test) {
        if (key !== "id" && key[0] !== "$") {
          let col = {
            id: key,
            header: key[0].toUpperCase() + key.slice(1),
          };

          if (typeof props.autoConfig === "object") {
            col = { ...col, ...props.autoConfig };
          }
          autoCols.push(col);
        }
      }

      return autoCols;
    }
  }

  return [];
});

const finalSizes = computed(() => {
  const s = responsiveConfig.value?.sizes ?? props.sizes ?? {};
  return {
    ...s,
    columns: Array.isArray(s.columns) ? s.columns : []
  };
});

function resize(rect) {
	clientWidth.value = rect.width;
	clientHeight.value = rect.height;

	if (props.responsive) {
		const levels = Object.keys(props.responsive)
			.map(Number)
			.sort((a, b) => a - b);

		const newLevel =
			levels.find((level) => clientWidth.value <= level) ?? null;

		if (newLevel !== responsiveLevel.value) {
			responsiveConfig.value = props.responsive[newLevel];
			responsiveLevel.value = newLevel;
		}
	}
}

const finalSplit = computed(() => ({
  left: Number(props.split?.left ?? 0)
}));

const _skin = inject("wx-theme", undefined);

let init_once = true;

const reinitStore = () => {
	dataStore.init({
	data: Array.isArray(props.data) ? props.data : props.data != null ? [props.data] : [],
	columns: finalColumns.value,
	split: finalSplit.value,
	sizes: finalSizes.value,
	selectedRows: props.selectedRows ?? [],
	sortMarks: props.sortMarks ?? {},
	filterValues: props.filterValues ?? {},
	select: props.select,
	undo: props.undo,
	reorder: props.reorder,
	tree: props.tree,
	dynamic: props.dynamic,
	_skin,
	});

	if (init_once && props.init) {
		props.init(api);
		init_once = false;
	}
};

reinitStore();
watchEffect(reinitStore);

defineExpose({
	exec,
	setNext,
	intercept,
	on,
	detach,
	getRow,
	getColumn,
	getState,
	getReactiveState,
	getStores,
});
</script>

<template>
	<Locale :words="en" :optional="true">
		<Layout
			:header="header"
			:footer="footer"
			:overlay="overlay"
			:row-style="rowStyle"
			:column-style="columnStyle"
			:cell-style="cellStyle"
			:onreorder="onreorder"
			:multiselect="multiselect"
			:auto-row-height="autoRowHeight"
			:client-width="clientWidth"
			:client-height="clientHeight"
			:responsive-level="responsiveLevel"
			:resize="resize"
			:hotkeys="hotkeys"
		/>
	</Locale>
</template>
