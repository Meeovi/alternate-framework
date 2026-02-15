<template>
  <div v-if="state" class="ais-ClearRefinements">
    <v-btn
      type="reset"
      class="ais-ClearRefinements-v-btn"
      @click.prevent="refine"
    >
      Reset filters
    </v-btn>
  </div>
</template>

<script>
import { connectClearRefinements } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from 'vue-instantsearch';

export default {
  name: 'AppClearRefinements',
  mixins: [createWidgetMixin({ connector: connectClearRefinements })],
  methods: {
    refine() {
      this.state.refine();
      this.$emit('click');
    },
  },
};
</script>
