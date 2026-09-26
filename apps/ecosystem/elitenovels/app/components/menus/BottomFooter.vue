<template>
    <div>
        <v-row>
            <v-col cols="12">
                <relatedstories />
            </v-col>

            <v-col cols="12">
                <relatedproducts />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import relatedstories from '~/components/related/relatedstories.vue'
    import relatedproducts from '~/components/related/relatedproducts.vue'
    
</script>