<template>
    <v-data-table
      v-bind:headers="headers"
      v-bind:items="domains"
      hide-actions>
    <template slot="items" scope="props">
      <td class="text-xs-left">{{ props.item.url }}</td>
      <td class="text-xs-left">{{ props.item.state }}</td>
      <td class="text-xs-left">unavailable</td>
      <td class="text-xs-left">
        <v-btn color="error" icon v-on:click="deleteDomain(props.item._uri)">
          <v-icon class="white--text">delete_forever</v-icon>
        </v-btn>
      </td>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { Domain } from "../store/stampstate/classes";

@VueClassComponent({
  name: "domains-view",
  components: {}
})
export default class DomainsView extends Vue {
  headers: any[] = [
    {
      text: "Domain",
      align: "left",
      sortable: false,
      value: "domain"
    },
    {
      text: "State",
      align: "left",
      sortable: false,
      value: "state"
    },
    {
      text: "Used by",
      align: "left",
      sortable: false,
      value: "usedBy"
    }
  ];

  // Modal Arguments
  deleteModalIsVisible: boolean = false;
  modalElementId: string = "";
  modalElementName: string = "";

  get domains(): Domain[] {
    let domains: Domain[] = [];
    for (let domainId in this.$store.getters.domains) {
      if (this.$store.getters.domains[domainId]) {
        domains.push(this.$store.getters.domains[domainId]);
      } else {
        this.$store.dispatch("getElementInfo", domainId);
      }
    }
    return domains;
  }

  deleteDomain(domainURI) {
    console.debug("The domain we are trying to erase is %s ", domainURI);
    // console.debug("Llamamos a deleteDomain");
    // this.modalElementId = domainURI;
    // this.modalElementName = domainURI;
    // this.deleteModalIsVisible = true;
  }
}
</script>
<style lang="scss" scoped>
$color_green: #93c47d;
$color_yellow: #f5d164;
$color_red: #ff6666;
$icon_size: 20px;

.fa-check-circle {
  color: $color_green;
  font-size: $icon_size;
}

.fa-exclamation-triangle {
  color: $color_yellow;
  font-size: $icon_size;
}

.fa-exclamation-circle {
  color: $color_red;
  font-size: $icon_size;
}
</style>