<style scoped lang="scss"></style>

<template>
  <v-container fluid>
    <v-card class="mx-auto my-2 lighten-4" max-width="800" tile>
      <v-container>
        <CustomHtmlComponent :html="htmlContent" />
      </v-container>

      <v-divider class="mx-4"></v-divider>

      <v-container fluid>
        <v-row class="mx-4">
          <p>To proceed, please authenticate by clicking the button below.</p>
        </v-row>
        <v-row class="mx-4" justify="center">
          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              :to="{ path: 'a2a' }"
              >Access Site</v-btn
            >
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import CustomHtmlComponent from "@/components/CustomHtmlComponent.vue";
import Axios from "axios";

@Component({ components: { CustomHtmlComponent } })
export default class Home extends Vue {
  private confirmed = false;
  private htmlContent = "";

  beforeCreate() {
    Axios.get("/terms-and-conditions.html").then(htmlContent => {
      this.htmlContent = htmlContent.data;
    });
  }
}
</script>
