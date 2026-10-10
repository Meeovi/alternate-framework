<script setup lang="ts">
const { customizerDrawer, fontTheme, inputBg } = useWorkspaceCustomizer()

const fontFamily = ['Roboto', 'Poppins', 'Inter']

function clearoptions() {
  inputBg.value = false
  fontTheme.value = 'Roboto'
}
</script>

<template>
  <v-navigation-drawer v-model="customizerDrawer" app temporary elevation="10" location="right" width="350">
    <div class="ws-scroll" style="height: 100%">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <div class="pa-5 d-flex justify-space-between align-center">
            <div class="text-subtitle-1 font-weight-medium">Theme customizer</div>
            <div>
              <v-btn color="error" variant="outlined" size="small" class="mr-2" @click="clearoptions">Reset</v-btn>
              <v-btn variant="text" icon="fas fa-xmark" density="compact" @click.stop="customizerDrawer = false" />
            </div>
          </div>
          <v-divider />
        </v-col>
        <v-col cols="12" class="pa-0">
          <v-card-item class="py-5">
            <v-card-title class="text-subtitle-1 font-weight-medium mb-4">Font Style</v-card-title>
            <v-card-text class="pa-0">
              <v-radio-group v-model="fontTheme" hide-details class="custom-font">
                <v-radio v-for="font in fontFamily" :key="font" :label="font" :value="font" color="primary" class="mb-5" />
              </v-radio-group>
            </v-card-text>
          </v-card-item>
          <v-divider />
          <div class="d-flex justify-space-between align-center pa-5">
            <div class="text-subtitle-1 font-weight-medium">Input Background</div>
            <div>
              <v-radio-group v-model="inputBg" class="custom-radio input-radio ma-n2" hide-details>
                <v-radio :value="true" color="primary" class="ma-2 input-bg" />
                <v-radio :value="false" color="primary" class="ma-2" />
              </v-radio-group>
            </div>
          </div>
          <v-divider />
        </v-col>
      </v-row>
    </div>
  </v-navigation-drawer>
</template>
