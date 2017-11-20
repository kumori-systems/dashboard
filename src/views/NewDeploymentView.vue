<template>
 <v-form v-model="valid" ref="form">
    <!-- Card body: Deployment stats -->
    <v-container>

      <!-- Deployment name -->
      <v-layout>
        <v-flex xs4>
          <v-text-field label="Name" v-model="deploymentName" v-bind:rules="[v => !!v && v.length > 0 || 'A name is required']" required></v-text-field>
        </v-flex>
      </v-layout>

      <!-- Deployment service -->
      <v-layout>
        <v-flex xs12 sm6>
          <v-select label="Service" v-model="selectedService" v-bind:items="services"
            item-text="_uri" item-value="_uri" required
            v-bind:rules="[v => !!v || 'A service is required']" autocomplete></v-select>
        </v-flex>
      </v-layout>

      <!-- Deployment roles -->
      <span v-if="selectedService && selectedService.length > 0" class="headline">Roles</span>
      <v-flex xs5 v-for="(role, index) in serviceRoleList" v-bind:key="index">
        <v-flex ma-1 xs4>
          <strong class="title">{{ role }}</strong>
        </v-flex>
        <v-flex ma-1 xs4>
          <v-text-field  label="MEM" v-model="rolMem[index]" mask='####' v-bind:rules="[v => !!v || 'MEM number is required']" required></v-text-field>
        </v-flex>
        <v-flex ma-1 xs4>
          <v-text-field label="CPU" v-model="rolCPU[index]" mask='####' v-bind:rules="[v => !!v || 'CPU number is required']" required></v-text-field>
        </v-flex>
        <v-flex ma-1 xs4>
          <v-text-field label="NET" v-model="rolNet[index]" mask='####' v-bind:rules="[v => !!v || 'NET number is required']" required></v-text-field>
        </v-flex>
        <v-flex ma-1 xs4>
          <v-text-field label="Instances" v-model="rolInstances[index]" mask='####' v-bind:rules="[v => !!v || 'Instance number is required']" required></v-text-field>
        </v-flex>
        <v-flex ma-1 xs4>
          <v-text-field label="Resilence" v-model="rolResilence[index]" mask='####' v-bind:rules="[v => !!v || 'Resilience number is required']" required></v-text-field>
        </v-flex>
      </v-flex>

      <!-- Deployment resources -->
      <span v-if="selectedService && selectedService.length > 0 && serviceResourcesList.length > 0" class="headline">Resources configuration</span>
      <v-flex v-for="(resource, index) in serviceResourcesList" v-bind:key="index">
        <v-text-field v-bind:label="resource" v-model="resourceConfig[index]" placeholder="text/json" multi-line></v-text-field>
      </v-flex>

      <!-- Deployment config -->
      <span v-if="selectedService && selectedService.length > 0 && selectedService.length > 0" class="headline">Service configuration</span>
      <v-text-field v-if="selectedService && selectedService.length > 0 && selectedService.length > 0" v-model="serviceConfig" placeholder="text/json" multi-line></v-text-field>

     <!-- Submit buttons -->
      <v-layout>
        <v-btn v-on:click="submit" v-bind:disabled="!valid">Deploy</v-btn>
      </v-layout>
    </v-container>
  </v-form>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { Deployment, Service } from "../store/stampstate/classes";

@VueClassComponent({
  name: "new-service-view",
  components: {},
  watch: {
    // whenever selectedService changes, this function will run
    selectedService: function(newValue) {
      if (newValue) {
        this.$store.dispatch("getElementInfo", newValue);
      }
    }
  }
})
export default class NewServiceView extends Vue {
  selectedService: string = null;
  deploymentName: string = null;
  rolMem: Array<number> = [];
  rolCPU: Array<number> = [];
  rolNet: Array<number> = [];
  rolInstances: Array<number> = [];
  rolResilence: Array<number> = [];
  resourceConfig: Array<string> = [];
  serviceConfig: string = null;
  selectedRequiredChannel: Array<string> = [];
  selectedProvidedChannel: Array<string> = [];
  selectedResourceConfig: Array<string> = [];
  valid: boolean = false;

  mounted() {
    // Si venimos desde la ventana elements con un servicio preseleccionado, lo
    // ponemos
    this.selectedService = this.$store.getters.getSelectedService || null;
  }

  get deployments(): { [uri: string]: Deployment } {
    return this.$store.getters.deployments;
  }

  get service(): Service {
    let res = this.$store.getters.service(this.selectedService)
    if(!res)
     this.$store.dispatch("getElementInfo",res);
    return res;
  }

  get services(): Service[] {
    // Para poder hacer los cálculos de los channel, y poder recomendar
    // únicamente aquellos que encajan es necesario obtener todos los
    // servicios de aquellos deployment que están desplegados
    // This will provably be changed in a future ticket
    for (let deploymentURI in this.deployments) {
      let service = this.$store.getters.service(
        this.deployments[deploymentURI].service
      );
      if (!service)
        this.$store.dispatch(
          "getElementInfo",
          this.deployments[deploymentURI].service
        );
    }
   
    return this.$store.getters.servicesList;
  }

  get serviceRoleList(): Array<string> {
    if (!this.selectedService || this.selectedService === null) return [];
    let roleList: Array<string> = this.$store.getters.getServiceRoles(
      this.selectedService
    );
    this.rolMem = new Array<number>(roleList.length);
    this.rolCPU = new Array<number>(roleList.length);
    this.rolNet = new Array<number>(roleList.length);
    this.rolInstances = new Array<number>(roleList.length);
    this.rolResilence = new Array<number>(roleList.length);
    for (let i = 0; i < roleList.length; i++) {
      this.rolMem[i] = 1;
      this.rolCPU[i] = 1;
      this.rolNet[i] = 1;
      this.rolInstances[i] = 1;
      this.rolResilence[i] = 1;
    }
    return roleList;
  } 

  get serviceResourcesList(): Array<string> {
    let resourceList = [];
    if (this.selectedService && this.selectedService !== null)
      resourceList = this.$store.getters.getServiceResources(
        this.selectedService
      );
    this.resourceConfig = new Array<string>(resourceList.length);
    return resourceList;
  }

  get totalResourceConfig() {
    return resourceId => {
      return this.$store.getters.getFreeResource(resourceId);
    };
  }

  get allSelected() {
    if (!this.selectedService || this.selectedService === null) return false;
    if (this.deploymentName == null || this.deploymentName.length < 1)
      return false;
    for (let index in this.rolMem) {
      if (this.rolMem[index] === undefined) return false;
    }
    for (let index in this.rolCPU) {
      if (this.rolCPU[index] === undefined) return false;
    }
    for (let index in this.rolNet) {
      if (this.rolNet[index] === undefined) return false;
    }
    for (let index in this.rolInstances) {
      if (this.rolInstances[index] === undefined) return false;
    }
    for (let index in this.rolResilence) {
      if (this.rolResilence[index] === undefined) return false;
    }
    for (let index in this.resourceConfig) {
      if (this.resourceConfig[index] === undefined) return false;
    }
    for (let index in this.selectedRequiredChannel) {
      if (this.selectedRequiredChannel[index] === undefined) return false;
    }
    for (let index in this.selectedProvidedChannel) {
      if (this.selectedProvidedChannel[index] === undefined) return false;
    }
    return true;
  }

  updateInputValue(emitedArguments) {
    let numRol: number, propertyType: string, newValue: number;
    [numRol, propertyType, newValue] = emitedArguments;
    switch (propertyType) {
      case "CPU":
        this.rolCPU[numRol] = newValue;
        break;
      case "MEM":
        this.rolMem[numRol] = newValue;
        break;
      case "NET":
        this.rolNet[numRol] = newValue;
        break;
      case "INS":
        this.rolInstances[numRol] = newValue;
        break;
      case "RES":
        this.rolResilence[numRol] = newValue;
        break;
    }
  }

  submit() {
    console.debug("Creating a new deployment");
    if ((<any>this.$refs.form).validate()) {
      let config = {};
      for (let resourceIndex in this.serviceResourcesList) {
        config[this.serviceResourcesList[resourceIndex]] = this.resourceConfig[
          resourceIndex
        ];
      }

      let roles = {};
      let instances;
      for (let rolIndex in this.serviceRoleList) {
        instances = {};
        for (
          let counter = 0;
          counter < this.rolInstances[rolIndex];
          counter++
        ) {
          instances[counter] = new Deployment.Role.Instance(
            counter.toString(),
            null,
            null,
            null,
            null
          );
        }

        roles[this.serviceRoleList[rolIndex]] = new Deployment.Role(
          rolIndex, // name
          this.$store.getters.services[this.selectedService].roles[
            this.serviceRoleList[rolIndex]
          ].component, //component
          null, // configuration
          this.rolCPU[rolIndex], // cpu
          this.rolMem[rolIndex], // memory
          null, // ioperf
          null, // iopsintensive
          this.rolNet[rolIndex], // bandwidht
          this.rolResilence[rolIndex], //resilience
          instances, // instances
          null, // mininstances
          null // maxInstances
        );
      }

      this.$store.dispatch(
        "addDeployment",
        new Deployment(
          "slap://domain/deployments/date/this_will_be_overrited", //uri
          this.deploymentName, //name
          JSON.parse(this.serviceConfig), //parameters
          this.selectedService, //serviceId
          roles, //roles
          config, //resourcesConfig
          [] //links
        )
      );
      this.$router.push("/");
    }
  }
}
</script>
<style lang="scss" scoped>
table {
  border-collapse: collapse;
  border-bottom-width: 0px;
  tr,
  th {
    border-bottom-width: 0px;
  }
}

.input {
  min-width: 5em;
}
</style>