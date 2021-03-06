<!--
  View of a new http entrypoint.
-->
<template>
  <v-form v-model="valid" ref="form">
    <v-card id="add-htt-entrypoint-view" style="max-width:1300px">

      <!-- Card tittle -->
      <v-card-title>
        <h3 class="headline mb-0">Add a new entrypoint</h3>

        <!-- Applies a space between elements -->
        <v-spacer></v-spacer>

         <!-- View actions -->
        <v-card-actions>

          <!-- Submit button -->
          <v-btn class="elevation-0" outline v-on:click="submit" v-bind:disabled="!valid">Deploy</v-btn>
          
          <!-- Cancel button -->
          <v-btn flat v-on:click="cancel">Cancel</v-btn>

        </v-card-actions>

      </v-card-title>

      <!-- Divides the sections of the card -->
      <v-divider></v-divider>

      <!-- Main content of the view -->
      <v-container>

          <!-- Domain list-->
          <v-select label="Domain" v-model="selectedDomain" v-bind:items="domains" item-text="url"
            autocomplete></v-select>

          <!-- Certificate -->
          <v-flex xs4 md6>
            <v-select
              label="TLS/SSL Certificate"
              placeholder="No SSL"
              clearable
              v-model="selectedCertificate"
              v-bind:disabled="!selectedDomain"
              v-bind:items="certificates"
              item-text="_urn"
              item-value="_urn"
              autocomplete
            ></v-select>
          </v-flex>

          <!-- Client certificate -->
          <v-checkbox label="Require client certificates" v-model="requireClientCertificates"
            v-bind:disabled="!selectedDomain"></v-checkbox>

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

/*
  This is a decorator and it's used because typescript doesn't implement all
  required properties of a vue component.

  All properties of the typescript class will be compiled as vue data.
  All methods inside the class will be compiled as computed properties (get, set
  methods)
  or common methods (non-get, non-set).
  There are special methods like mounted, created or destroy which are part of
  the vue lifecycle and will be rendered as special lifecycle methods.
*/
@VueClassComponent({
  name: "new-http-entrypoint-view",
  components: {}
})
export default class NewHTTPEntrypointView extends Vue {
  /** Marks if the data in the form is valid. */
  valid: boolean = false;

  /** Stores the selected domain. */
  selectedDomain: Domain = null;

  /** Stores the selected cert. */
  selectedCertificate: string = null;

  /** Stores if the client requires certificates. */
  requireClientCertificates: boolean = false;

  /** Stores the minimum number of instances. */
  minInstances: number = 1;

  /** Stores the actual instances. */
  instances: number = 1;

  /** Stores the max number of instances. */
  maxInstances: number = 1;

  /** Stores the entrypoint resilience. */
  resilience: number = 1;

  /**
   * Vue lifecycle. Obtains infor in there is not information of the http
   * inbound service.
   */
  mounted() {
    this.$store.dispatch(
      "getElementInfo",
      EntryPoint.ENTRYPOINT_TYPE.HTTP_INBOUND
    );
  }

  /** Gets all domains. A filter is applicated to show only free domains. */
  get domains() {
    let domains = ((<SSGetters>this.$store.getters).domains as any) as {
      [urn: string]: Domain;
    };
    let domainList: Domain[] = [];
    for (let domainURN in domains) {
      if (domains[domainURN]) {
        if (domains[domainURN].usedBy.length === 0) {
          domainList.push(domains[domainURN]);
        }
      } else {
        this.$store.dispatch("getElementInfo", domainURN);
      }
    }
    return domainList;
  }

  /** Gets all domains. A filter is applicated to show only free domains. */
  get certificates(): Certificate[] {
    let certificates = ((<SSGetters>this.$store.getters)
      .certificates as any) as {
      [urn: string]: Certificate;
    };
    let certificatesList: Certificate[] = [];
    for (let certificateURN in certificates) {
      if (certificates[certificateURN]) {
        if (certificates[certificateURN].usedBy.length === 0) {
          certificatesList.push(certificates[certificateURN]);
        }
      } else {
        this.$store.dispatch("getElementInfo", certificateURN);
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

  /** Submits the creation of a new entrypoint. */
  submit(): void {
    if ((<any>this.$refs.form).validate()) {
      let resourcesConfig = {
        server_cert: null,
        vhost: null
      };
      if (this.selectedDomain) {
        resourcesConfig.vhost = this.selectedDomain._urn;
      }

      if (this.selectedCertificate) {
        resourcesConfig.server_cert = this.selectedCertificate;
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
        this.selectedDomain ? { domain: this.selectedDomain._urn } : null, // configuration
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
        "deploy",
        new HTTPEntryPoint(
          "slap://domain/deployments/date/this_will_be_overrited", // urn
          config, // parameters
          roles, // roles
          resourcesConfig, // resourcesConfig
          {} // channels
        )
      );

      this.$router.push("/");
    }
  }

  /** Cancels the creation of a new entrypoint. */
  cancel() {
    this.$router.go(-1);
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