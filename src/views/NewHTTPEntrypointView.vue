<template>
  <v-form v-model="valid" ref="form">
    <v-card id="add-htt-entrypoint-view">

      <!-- Card tittle -->
      <v-card-title>
        <h3 class="headline mb-0">Add a new entrypoint</h3>


        <!-- Applies a space between elements -->
        <v-spacer></v-spacer>

         <!-- View actions -->
        <v-card-actions>

          <!-- Submit button -->
          <v-btn class="elevation-0" color="primary"  v-on:click="submit" v-bind:disabled="!valid">Deploy</v-btn>
          
          <!-- Cancel button -->
          <v-btn outline to="-1">Cancel</v-btn>

        </v-card-actions>


      </v-card-title>

      <!-- Divides the sections of the card -->
      <v-divider></v-divider>

      <!-- Main content of the view -->
      <v-container>

          <!-- Domain list-->
          <v-select label="Domain" v-model="selectedDomain" v-bind:items="domains" item-text="url"
            v-bind:rules="[v => !!v || 'A domain is required']" required autocomplete></v-select>

          <!-- Certificate -->
          <v-flex xs4 md6>
            <v-select
              label="TLS/SSL Certificate"
              placeholder="No SSL"
              clearable
              v-model="selectedCertificate"
              v-bind:items="certificates"
              item-text="_version"
              item-value="_uri"
              autocomplete
            ></v-select>
          </v-flex>

          <!-- Client certificate -->
          <v-checkbox label="Require client certificates" v-model="requireClientCertificates"></v-checkbox>

          <!-- Number of instances -->
          <v-flex xs4>
            <v-text-field type="number" ref="minInstancesField" label="MinInstances" v-model="minInstances" mask='####'
              v-bind:rules="[(v) => !!v || 'A minimum number of Instances is required',
                (v) => parseInt(v) > 0 || 'Must be higher than 0',
                (v) => parseInt(v) <= parseInt(instances) || 'Can\'t be higher than initial instances'
              ]" required v-on:change="validateFields"
            ></v-text-field>
          </v-flex>

          <!-- Number of instances -->
          <v-flex xs4>
            <v-text-field type="number" ref="instancesField" label="Initial instances" v-model="instances" mask='####'
              v-bind:rules="[
                (v) => parseInt(v) > 0 || 'Must be higher than 0',
                (v) => parseInt(v) >= parseInt(minInstances) || 'Can\'t be less than MinInstances',
                (v) => parseInt(v) <= parseInt(maxInstances) || 'Can\'t be more than MaxInstances'
              ]" required v-on:change="validateFields"
              ></v-text-field>
          </v-flex>

          <!-- Number of instances -->
          <v-flex xs4>
            <v-text-field type="number" ref="maxInstancesField" label="MaxInstances" v-model="maxInstances" mask='####'
              v-bind:rules="[
                (v) => parseInt(v) > 0 || 'Must be higher than 0',
                (v) => parseInt(v) >= parseInt(instances) || 'Can\'t be less than initial instances'
              ]" required v-on:change="validateFields"
          ></v-text-field>
          </v-flex>

          <!-- Resilience level-->
          <v-flex xs4>
            <v-text-field label="Resilience" type="number" v-model="resilience" mask='####' v-bind:rules="[v => !!v || 'Resilience number is required']" required></v-text-field>
          </v-flex>   

      </v-container>
    </v-card>
  </v-form>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import {
  Certificate,
  EntryPoint,
  Deployment,
  Domain
} from "../store/stampstate/classes";

import SSGetters from "../store/stampstate/getters";
import { HTTPEntryPoint } from "../store/stampstate/classes/entrypoint";

@VueClassComponent({
  name: "new-http-entrypoint-view",
  components: {}
})
export default class NewHTTPEntrypointView extends Vue {
  valid: boolean = false;
  selectedDomain: Domain = null;
  selectedCertificate: string = null;
  requireClientCertificates: boolean = false;
  minInstances: number = 1;
  instances: number = 1;
  maxInstances: number = 1;
  resilience: number = 1;

  mounted() {
    this.$store.dispatch("getElementInfo", EntryPoint.TYPE.HTTP_INBOUND);
  }

  /** Gets all domains. A filter is applicated to show only free domains. */
  get domains() {
    let domains = ((<SSGetters>this.$store.getters).domains as any) as {
      [uri: string]: Domain;
    };
    let domainList: Domain[] = [];
    for (let domainUri in domains) {
      if (domains[domainUri]) {
        if (domains[domainUri].usedBy.length === 0) {
          domainList.push(domains[domainUri]);
        }
      } else {
        this.$store.dispatch("getElementInfo", domainUri);
      }
    }
    return domainList;
  }

  /** Gets all domains. A filter is applicated to show only free domains. */
  get certificates(): Certificate[] {
    let certificates = ((<SSGetters>this.$store.getters)
      .certificates as any) as {
      [uri: string]: Certificate;
    };
    let certificatesList: Certificate[] = [];
    for (let certificateUri in certificates) {
      if (certificates[certificateUri]) {
        if (certificates[certificateUri].usedBy.length === 0) {
          certificatesList.push(certificates[certificateUri]);
        }
      } else {
        this.$store.dispatch("getElementInfo", certificateUri);
      }
    }
    return certificatesList;
  }

  /** Validates the instances fields when another instance field is changed */
  validateFields(): void {
    (<any>this.$refs.minInstancesField).validate();
    (<any>this.$refs.instancesField).validate();
    (<any>this.$refs.maxInstancesField).validate();
  }

  submit(): void {
    if ((<any>this.$refs.form).validate()) {
      let resourcesConfig = {
        vhost: this.selectedDomain._uri
      };
      if (this.selectedCertificate) {
        resourcesConfig["server_cert"] = this.selectedCertificate;
      } else {
        resourcesConfig["server_cert"] = null;
      }

      let config = {
        TLS: this.selectedCertificate !== null,
        clientcert: this.requireClientCertificates
      };

      let instanceList = {};

      for (let counter = 0; counter < this.instances; counter++) {
        instanceList[counter] = new Deployment.Role.Instance(
          counter.toString(),
          null,
          null,
          null,
          null
        );
      }

      let roles = {};

      roles["sep"] = new Deployment.Role(
        "sep", // id
        "slap://slapdomain/components/httpsep/0_0_1", // component - overrided by service configuration
        { domain: this.selectedDomain._uri }, // configuration
        1, //cpu
        1, //memory
        0, //ioperf
        false, //iopsensitive
        1, //bandwidth
        this.resilience, //resilience
        instanceList, // Instances
        this.minInstances, // minInstances
        this.maxInstances // maxInstances
      );

      this.$store.dispatch(
        "addDeployment",
        new HTTPEntryPoint(
          "slap://domain/deployments/date/this_will_be_overrited", // uri
          config,
          roles,
          resourcesConfig,
          {}
        )
      );

      this.$router.push("/");
    }
  }
}
</script>
<style lang="scss" scoped>
.input {
  min-width: 5em;
}

#usePlatformGeneratedDomain {
  margin-top: 0.5em;
}

#acceptTLSSSL {
  margin-top: 0.5em;
}

table {
  border-collapse: collapse;
  border-bottom-width: 0px;
  tr,
  th {
    border-bottom-width: 0px;
  }
}
</style>