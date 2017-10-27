<template>
    <div>
        <table>
            <tr class="tile">
                <th>
                    <span>NAME</span>
                </th>
                <th>
                    <input class="input" v-model="deploymentName" placeholder="Deployment name">
                </th>
                <th>
                    <button class="button is-primary" v-on:click="createNewDeployment" v-bind:disabled="!allSelected">Deploy</button>
                </th>
            </tr>
            <tr class="tile">
                <th>SERVICE</th>
                <th>
                    <div class="select">
                        <select v-model="selectedService">
                            <option disabled value="">Please select one</option>
                            <option v-for="(service, index) in serviceList" v-bind:key="index" v-bind:value="service">{{ service }}</option>
                        </select>

                    </div>
                </th>
            </tr>
            <table v-if="selectedService!=null">
                <tr v-if="serviceRolList.length > 0">
                    <th>ROLES</th>
                </tr>
                <tr v-for="(rol, index) in serviceRolList" v-bind:key="index">
                    <th>
                        <table>
                            <tr class="tile is-3">
                                <th class="tile is-6">{{rol}}</th>
                                <th class="is-3">
                                    <tr>
                                        <th>MEM</th>
                                        <th>
                                            <number-input v-bind:value="rolMem[index]" v-bind:numElement="index" v-bind:property="'MEM'" v-on:input="updateInputValue"></number-input>
                                        </th>
                                        <th>CPU</th>
                                        <th>
                                            <number-input v-bind:value="rolCPU[index]" v-bind:numElement="index" v-bind:property="'CPU'" v-on:input="updateInputValue"></number-input>
                                        </th>
                                        <th>NET</th>
                                        <th>
                                            <number-input v-bind:value="rolNet[index]" v-bind:numElement="index" v-bind:property="'NET'" v-on:input="updateInputValue"></number-input>
                                        </th>
                                    </tr>

                                    <tr>
                                        <th>Instances</th>
                                        <th>
                                            <number-input v-bind:value="rolInstances[index]" v-bind:numElement="index" v-bind:property="'INS'" v-on:input="updateInputValue"></number-input>
                                        </th>
                                        <th>
                                            <span>Resilence</span>
                                        </th>
                                        <th>
                                            <number-input v-bind:value="rolResilence[index]" v-bind:numElement="index" v-bind:property="'RES'" v-on:input="updateInputValue"></number-input>
                                        </th>
                                    </tr>
                                </th>
                            </tr>
                        </table>
                    </th>
                </tr>

                <tr v-if="serviceProChannelList.length > 0 || serviceReqChannelList.length > 0">
                    <th> CHANNELS</th>
                </tr>
                <tr v-for="(channel, index) in serviceProChannelList" v-bind:key="index">
                    <th>
                        <table class="tile is-6">
                            <tr class="tile is-12">
                                <th class="tile is-2"> {{ channel }}</th>
                                <th>-&gt;</th>
                                <th>
                                    <div class="select">
                                        <select v-model="selectedRequiredChannel[index]">
                                            <option disabled value="">Please select one</option>
                                            <option v-for="(requiredChannel, index) in totalRequiredDeploymentChannels(channel)" v-bind:key="index">{{requiredChannel}}</option>
                                        </select>
                                    </div>
                                </th>
                            </tr>
                        </table>
                    </th>
                </tr>
                <tr v-for="(channel, index) in serviceReqChannelList" v-bind:key="index">
                    <th>
                        <table class="tile is-6">
                            <tr class="tile is-12">
                                <th class="tile is-2"> {{ channel }} </th>
                                <th>&lt;-</th>
                                <th>
                                    <div class="select">
                                        <select v-model="selectedProvidedChannel[index]">
                                            <option disabled value="">Please select one</option>
                                            <option v-for="(providedChannel, index) in totalProvidedDeploymentChannels(channel)" v-bind:key="index">{{providedChannel}}</option>
                                        </select>
                                    </div>
                                </th>
                            </tr>
                        </table>
                    </th>
                </tr>

                <table v-if="serviceResourcesList.length > 0">
                    <tr>
                        <th>RESOURCES CONFIGURATION</th>
                    </tr>
                    <tr v-for="(resource, index) in serviceResourcesList" v-bind:key="index">
                        <th>
                            <table>
                                <tr>
                                    <th>{{resource}} </th>
                                </tr>
                                <tr>
                                    <th>
                                        <div class="select">
                                            <select v-model="selectedResourceConfig[index]" v-bind:disabled="resourceConfig[index]!==undefined && resourceConfig[index].length >0">
                                                <option disabled value="">Please select one</option>
                                                <option v-for="(resourceConfig, index) in totalResourceConfig(resource)" v-bind:key="index">{{ resourceConfig }}</option>
                                            </select>
                                        </div>
                                    </th>
                                </tr>
                                <tr>
                                    <th class="tile is-6">
                                        <textarea class="textarea" v-model="resourceConfig[index]" placeholder="text/json"></textarea>
                                    </th>
                                </tr>
                            </table>
                        </th>
                    </tr>
                </table>
                <tr>
                    <th>SERVICE CONFIGURATION</th>
                </tr>
                <tr>
                    <th class="tile is-6">
                        <textarea class="textarea" v-model="serviceConfig" placeholder="text/json"></textarea>
                    </th>
                </tr>
            </table>
        </table>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Deployment } from "../../../../store/classes";
import NumberInput from "../input/NumberInput.vue";

@Component({
  name: "new-service",
  components: {
    "number-input": NumberInput
  },
  watch: {
    // whenever selectedService changes, this function will run
    selectedService: function(newValue) {
      if (newValue) {
        this.$store.dispatch("getElementInfo", { uri: newValue });
      }
    }
  }
})
export default class NewService extends Vue {
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

  mounted() {
    // Si venimos desde la ventana elements con un servicio preseleccionado, lo ponemos
    this.selectedService = this.$store.getters.getSelectedService;
  }

  get deploymentList(): Array<string> {
    return this.$store.getters.getDeploymentList;
  }

  get deployedServicesInfo(): boolean {
    // Para poder hacer los cálculos de los channel, y poder recomendar únicamente aquellos que encajan
    // es necesario obtener todos los servicios de aquellos deployment que están desplegados
    for (let i in this.deploymentList) {
      let serviceURI = this.$store.getters.getDeploymentService(
        this.deploymentList[i]
      );
      this.$store.dispatch("getElementInfo", { uri: serviceURI });
    }
    return true;
  }

  get serviceList() {
    this.deployedServicesInfo;
    return this.$store.getters.getServiceList;
  }

  get serviceRolList(): Array<string> {
    if (!this.selectedService || this.selectedService === null) return [];
    let rolList: Array<string> = this.$store.getters.getServiceRoles(
      this.selectedService
    );
    this.rolMem = new Array<number>(rolList.length);
    this.rolCPU = new Array<number>(rolList.length);
    this.rolNet = new Array<number>(rolList.length);
    this.rolInstances = new Array<number>(rolList.length);
    this.rolResilence = new Array<number>(rolList.length);
    for (let i = 0; i < rolList.length; i++) {
      this.rolMem[i] = 1;
      this.rolCPU[i] = 1;
      this.rolNet[i] = 1;
      this.rolInstances[i] = 1;
      this.rolResilence[i] = 1;
    }
    return rolList;
  }

  get serviceProChannelList(): Array<string> {
    if (!this.selectedService || this.selectedService === null) return [];
    let res = this.$store.getters.getServiceProChannels(this.selectedService);
    this.selectedRequiredChannel = new Array<string>(res.length);
    return res;
  }
  get serviceReqChannelList(): Array<string> {
    if (!this.selectedService || this.selectedService === null) return [];
    let res = this.$store.getters.getServiceReqChannels(this.selectedService);
    this.selectedProvidedChannel = new Array<string>(res.length);
    return res;
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

  get totalProvidedDeploymentChannels() {
    return channel => {
      return this.$store.getters.getTotalProvidedDeploymentChannels(
        this.selectedService,
        channel
      );
    };
  }

  get totalRequiredDeploymentChannels() {
    return channel => {
      return this.$store.getters.getTotalRequiredDeploymentChannels(
        this.selectedService,
        channel
      );
    };
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

  createNewDeployment() {
    let config = {};
    for (let resourceIndex in this.serviceResourcesList) {
      config[this.serviceResourcesList[resourceIndex]] = this.resourceConfig[
        resourceIndex
      ];
    }

    let roles = {};
    let instances;
    for (let rolIndex in this.serviceRolList) {
      instances = {};
      for (let counter = 0; counter < this.rolInstances[rolIndex]; counter++) {
        instances[counter] = new Deployment.Rol.Instance(
          null,
          null,
          null,
          null,
          null
        );
      }

      roles[this.serviceRolList[rolIndex]] = new Deployment.Rol(
        null,
        null,
        this.rolCPU[rolIndex],
        this.rolMem[rolIndex],
        0, //ioperf
        false, //iopsensitive
        this.rolNet[rolIndex],
        this.rolResilence[rolIndex],
        instances
      );
    }

    this.$store.dispatch(
      "createNewDeployment",
      new Deployment(
        null, //uri
        this.deploymentName, //name
        this.selectedService, //serviceId
        config, //resourcesConfig
        JSON.parse(this.serviceConfig), //parameters
        roles, //roles
        [], //links
        [] //website
      )
    );
    this.$router.push("/");
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