<template>
    <div>
        <v-toolbar>
            <v-toolbar-title>
                <v-list lines="one">
                    <v-list-item :title="'Item ' + n"
                        subtitle="Lorem ipsum dolor sit amet consectetur adipisicing elit"
                        prepend-avatar="https://randomuser.me/api/portraits/women/8.jpg"></v-list-item>
                </v-list>
            </v-toolbar-title>

            <v-toolbar-items></v-toolbar-items>
        </v-toolbar>
        <Comments :ondata="v => url.get(v)" :onchange="({ action, comment, id, originalValue: v }) =>
      url.path(v).save(action, comment, id)" />
    </div>
</template>

<script setup>
    import {
        RestURL
    } from "@svar-ui/lib-data-provider";
    import {
        Comments
    } from '@svar-ui/vue-comments';

    const url = new RestURL("https://some.com/api/comments");
</script>