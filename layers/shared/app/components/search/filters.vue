<template>
  <FilterBuilder :fields="fields" :options="options" />
</template>

<script setup>
  import { FilterBuilder } from "@svar-ui/vue-filter";

  const fields = [
    { id: "first_name", label: "First Name", type: "text" },
    { id: "age", label: "Age", type: "number" },
    { id: "start", label: "Start Date", type: "date", format: "%y-%m-%d" }
  ];

  const options = {
    first_name: [ "Alex", "Adam", "John", "Jane"],
    age: [ 17, 21, 35, 42]
    start: [ new Date(2025, 4, 7), new Date(2025, 4, 10)]
  };
</script>