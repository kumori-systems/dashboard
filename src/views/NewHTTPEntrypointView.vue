<template>
  <v-form v-model="valid" ref="form" lazy-validation>
    <!-- Card body: Deployment stats -->
    <v-container>
      <v-layout row wrap>
      <!-- Flexible content allows good resize -->
      <v-flex>
        <!-- Domain list-->
        <v-select label="Domain" v-model="selectedDomain" v-bind:items="domains" item-text="url"
          item-value="_uri"v-bind:rules="[v => !!v || 'A domain is required']" required autocomplete></v-select>

        <!-- Checkbuttons -->
        <v-layout>
          <v-checkbox label="Accept TLS/SSL" v-model="acceptTLSSSL" disabled></v-checkbox>
          <v-select label="Certificate" v-model="selectedCertificate" v-bind:items="certificates" v-bind:rules="[v => !!v || 'A domain is required']" disabled autocomplete></v-select>
        </v-layout>
        <v-checkbox label="Require client certificates" v-model="requireClientCertificates" disabled></v-checkbox>

        <!-- Number inputs -->
        <v-flex xs4>
          <v-text-field label="Instances" v-model="instances" mask='####' v-bind:rules="[v => !!v || 'Instance number is required']" required></v-text-field>
        </v-flex>
        <v-flex xs4>
          <v-text-field label="Resilience" v-model="resilience" mask='####' v-bind:rules="[v => !!v || 'Resilience number is required']" required></v-text-field>
        </v-flex>
        
        <!-- Submit buttons -->
        <v-btn @click="submit" v-bind:disabled="!valid">Deploy</v-btn>
      </v-flex>
      </v-layout>
    </v-container>
  </v-form>
</template>
<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { EntryPoint, Deployment, Domain } from "../store/stampstate/classes";

import SSGetters from "../store/stampstate/getters";

@VueClassComponent({
  name: "new-http-entrypoint-view",
  components: {}
})
export default class NewHTTPEntrypointView extends Vue {
  valid: boolean = false;
  selectedDomain: string = "";
  selectedCertificate: string = "";
  acceptTLSSSL: boolean = false;
  requireClientCertificates: boolean = false;
  instances: number = 1;
  resilience: number = 1;

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

  get certificates() {
    // return this.$store.getters.certificates;
    return [];
  }

  submit(): void {
    let resourcesConfig = {
      server_cert: this.certificates.length > 0 ? this.certificates : null,
      vhost: this.selectedDomain
    };
    let config = {
      TLS: this.acceptTLSSSL,
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
      { domain: this.selectedDomain }, // configuration
      1, //cpu
      1, //memory
      0, //ioperf
      false, //iopsensitive
      1, //bandwidth
      1, //resilience
      instanceList, // Instances
      this.instances, // minInstances
      this.instances // maxInstances
    );

    this.$store.dispatch(
      "addDeployment",
      new Deployment(
        "slap://domain/deployments/date/this_will_be_overrited", // uri
        name, // name
        config, // parameters
        EntryPoint.TYPE.HTTP_INBOUND, //service
        roles, // roles
        resourcesConfig, // resourcesConfig
        [] // links
      )
    );

    this.$router.push("/");
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