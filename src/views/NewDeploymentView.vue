<!--
  This component represents the new deployment view. This view is intended for
  common deployments (that means no http entrypoints).
-->
<template>
  <v-form v-model="valid" ref="form">
    <v-card id="add-deployment-view" style="max-width:1300px">

      <!-- Card tittle -->
      <v-card-title>
        <h3 class="headline mb-0">Add a new common deployment</h3>

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

      <!-- Card body: Deployment stats -->
      <v-container>

        <!-- Deployment name -->
        <v-layout>
          <v-flex xs4>
            <v-text-field label="Name" v-model="deploymentName" v-bind:rules="[(v) => !!v || 'A name is required']" required></v-text-field>
          </v-flex>
        </v-layout>

        <!-- Deployment service -->
        <v-layout>
          <v-flex xs12 sm6>
            <v-select label="Service" v-model="selectedService" v-bind:items="services"
              item-text="_urn" item-value="_urn" required
              v-bind:rules="[(v) => !!v || 'A service is required']" autocomplete
            ></v-select>
          </v-flex>
        </v-layout>

        <!-- Page form -->
        <div v-if="service">

          <!-- Deployment roles -->
          <span class="headline">Roles</span>
          
          <v-flex xs5 v-for="(roleName, index) in serviceRolesList" v-bind:key="roleName">
            <v-flex ma-1 xs4>
              <strong class="title">{{ roleName }}</strong>
            </v-flex>
            
            <v-flex ma-1 xs4>
              <v-text-field  label="MEM"  v-model="roleMem[index]"
                mask='####' v-bind:rules="[v => parseInt(v)>0 || 'Must be higher than 0']"
                required
              ></v-text-field>
            </v-flex>

            <v-flex ma-1 xs4>
              <v-text-field label="CPU" v-model="roleCPU[index]"
                mask='####' v-bind:rules="[v => parseInt(v)>0 || 'Must be higher than 0']"
                required
              ></v-text-field>
            </v-flex>

            <v-flex ma-1 xs4>
              <v-text-field label="NET" v-model="roleNet[index]"
                mask='####' v-bind:rules="[v => parseInt(v)>0 || 'Must be higher than 0']"
                required
              ></v-text-field>
            </v-flex>

            <!-- Number of Instance fields -->
            <v-flex ma-1 xs4>
              <v-text-field
                label="Minimum Instances" 
                mask='####' required v-on:change="validateFields" v-model="roleMinInstances[index]"
                v-bind:rules="[
                  (v) => parseInt(v) > 0 || 'Must be higher than 0',
                  (v) => parseInt(v) <= parseInt(roleInstances[index]) || 'Can\'t be higher than initial instances'
                ]"
              ></v-text-field>
            </v-flex>

            <v-flex ma-1 xs4>
              <v-text-field
                label="Initial Instances"
                mask='####' required v-on:change="validateFields" v-model="roleInstances[index]"
                v-bind:rules="[
                  (v) => parseInt(v) > 0 || 'Must be higher than 0',
                  (v) => parseInt(v) >= parseInt(roleMinInstances[index]) || 'Can\'t be less than MinInstances',
                  (v) => parseInt(v) <= parseInt(roleMaxInstances[index]) || 'Can\'t be more than MaxInstances'
                ]"
              ></v-text-field>
            </v-flex>

            <v-flex ma-1 xs4>
              <v-text-field
              label="Maximum Instances" mask='####' required v-on:change="validateFields" v-model="roleMaxInstances[index]" 
                v-bind:rules="[
                  (v) => parseInt(v) > 0 || 'Must be higher than 0',
                  (v) => parseInt(v) >= parseInt(roleInstances[index]) || 'Can\'t be less than initial instances'
                ]"
              ></v-text-field>
            </v-flex>

            <v-flex ma-1 xs4>
              <v-text-field label="Resilence" v-model="roleResilence[index]" mask='####' v-bind:rules="[v => !!v || 'Resilience number is required']" required></v-text-field>
            </v-flex>
              
          </v-flex>
        
        
          <!-- Deployment resources -->      
          <span class="headline" v-if="serviceResourcesList.length > 0">Resources configuration</span>
          <v-flex v-for="(resource, index) in serviceResourcesList" v-bind:key="resource[0]">

            <!-- Volatile volumes -->
            <v-text-field type="integer"
              v-if="resource[1] === 'eslap://eslap.cloud/resource/volume/volatile/1_0_0'"
              v-bind:label="resource[0] + ' Size'"
              v-model="resourceConfig[index]"
              mask='#####'
              v-bind:rules="[
                (v) => parseInt(v) > 0 || 'Size must have a non cero value'
              ]"
              suffix="GB"
            ></v-text-field>

            <!-- Persistent volumes -->
            <v-select
              v-if="resource[1] === 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'"
              v-model="resourceConfig[index]"
              v-bind:label="resource[0]"
              v-bind:items="freePersistentVolumes"
              item-text="_urn"
              item-value="_urn"
              v-bind:rules="[(v) => !!v  || 'A volume is required']"
              autocomplete
            ></v-select>

          </v-flex>
        

          <!-- Deployment config -->
          <span class="headline">Service configuration</span>
          <v-text-field
            v-model="serviceConfig" placeholder="text/json" multi-line
            type="text/json"
            v-bind:rules="[(v) => parseable(v)]"
          ></v-text-field>

        </div> <!-- Page form end -->

      </v-container>
      
    </v-card>
  </v-form>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";
import { Notification } from "../store/pagestate/classes";
import {
  Certificate,
  Deployment,
  Domain,
  Parameter,
  Service,
  Volume
} from "../store/stampstate/classes";

import SSGetters from "../store/stampstate/getters";


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
export default class NewDeploymentView extends Vue {

  /** This is for when a user selects a service in the elements view. */
  selectedService: string = null;

  /** Stores the actual deployment name. Passed to the stamp as nickname. */
  deploymentName: string = null;

  /** List of role memories. Care when edditin this. */
  roleMem: string[] = [];

  /** List of role cpu. Care when edditin this. */
  roleCPU: string[] = [];

  /** List of role net. Care when edditin this. */
  roleNet: string[] = [];

  /** List of role min instances. Care when edditin this. */
  roleMinInstances: string[] = [];

  /** List of role actual instances. Care when edditin this. */
  roleInstances: string[] = [];

  /** List of role max instances. Care when edditin this. */
  roleMaxInstances: string[] = [];

  /** List of role resilience. Care when edditin this. */
  roleResilence: string[] = [];

  /** List of role resilience. Care when edditin this. */
  resourceConfig: string[] = [];

  /** Service configuration params. */
  serviceConfig: string = null;

  /** Marks if the form has valid data. */
  valid: boolean = false;

  /**
   * Vue lifecycle. Used to load a selected service from elements view. This
   * should be changed in the future to fit whith good habits. It's the only one
   * not following good habits.
   */
  mounted() {
    // If there is a preselected service, load it
    this.selectedService = this.$store.getters.selectedService || null;
    if (this.selectedService) this.$store.dispatch("selectedService", null);
  }

  /** Obtains deployments stored in the state. */
  get deployments(): { [urn: string]: Deployment } {
    return ((<SSGetters>this.$store.getters).deployments as any) as {
      [urn: string]: Deployment;
    };
  }

  /** Obtains the service relative to the actual deployment. */
  get service(): Service {
    let ser: Service = (<SSGetters>this.$store.getters).services[
      this.selectedService
    ];
    if (!ser) {
      if (this.selectedService)
        this.$store.dispatch("getElementInfo", this.selectedService);
    } else {
      let count: number = 0;
      let skeleton: string = "{\n";
      for (let par in ser.parameters) {
        if (count > 0) skeleton += ",\n";

        switch (ser.parameters[par]._parameter_type) {
          case Parameter.PARAMETER_TYPE.BOOLEAN:
            skeleton += '  "' + par + '": <boolean>';
            break;
          case Parameter.PARAMETER_TYPE.INTEGER:
            skeleton += '  "' + par + '": <integer>';
            break;
          case Parameter.PARAMETER_TYPE.JSON:
            skeleton += '  "' + par + '": { }';
            break;
          case Parameter.PARAMETER_TYPE.LIST:
            skeleton += '  "' + par + '": [ ]';
            break;
          case Parameter.PARAMETER_TYPE.NUMBER:
            skeleton += '  "' + par + '": <number>';
            break;
          case Parameter.PARAMETER_TYPE.STRING:
            skeleton += '  "' + par + '": ""';
            break;
          default:
            this.$store.dispatch(
              "addNotification",
              new Notification(
                Notification.LEVEL.ERROR,
                "Unknown parameter type",
                "Unknown parameter type " + ser.parameters[par]._parameter_type,
                "Unknown parameter type " + ser.parameters[par]._parameter_type
              )
            );
        }

        count++;
      }
      skeleton += "\n}";
      this.serviceConfig = skeleton;

      // Done this way to avoid ui input problems
      let defaultList = [];
      for (let numRol in ser.roles) {
        defaultList.push("1");
      }

      // Initialitze arrangement
      this.roleMem = defaultList.concat([]);
      this.roleCPU = defaultList.concat([]);
      this.roleNet = defaultList.concat([]);
      this.roleMinInstances = defaultList.concat([]);
      this.roleInstances = defaultList.concat([]);
      this.roleMaxInstances = defaultList.concat([]);
      this.roleResilence = defaultList.concat([]);

      // Initialitze resources config
      this.resourceConfig = [];
    }

    return ser;
  }

  /** Obtains the services stored in the state. */
  get services(): string[] {
    // All deployed services must be loaded to show available channels
    for (let deploymentURN in this.deployments) {
      let service: Service = (<SSGetters>this.$store.getters).services[
        this.deployments[deploymentURN].service
      ];
      if (!service)
        this.$store.dispatch(
          "getElementInfo",
          this.deployments[deploymentURN].service
        );
    }

    let servicesList: string[] = [];
    for (let service in (<SSGetters>this.$store.getters).services) {
      // Return all services but http inboud
      if (service !== "eslap://eslap.cloud/services/http/inbound/1_0_0") {
        servicesList.push(service);
      }
    }
    return servicesList;
  }

  /** Obtains resources required from the selected service. */
  get serviceResourcesList(): [string, string][] {
    let resourcesList: [string, string][] = [];
    if (this.selectedService) {
      let service: Service = (<SSGetters>this.$store.getters).services[
        this.selectedService
      ];
      if (service) {
        for (let res in service.resources) {
          resourcesList.push([res, service.resources[res]]);
        }
      }
    }
    return resourcesList;
  }

  /** Obtains the role list from the selected service. */
  get serviceRolesList(): string[] {
    let roleList: string[] = [];
    if (this.selectedService) {
      let service: Service = (<SSGetters>this.$store.getters).services[
        this.selectedService
      ];
      if (service) {
        for (let role in service.roles) {
          roleList.push(role);
        }
      }
    }
    return roleList;
  }

  /** Obtains the total resource configuration. */
  get totalResourceConfig() {
    return resourceId => {
      return ((<SSGetters>this.$store.getters).getFreeResource as any)(
        resourceId
      );
    };
  }

  /** Gets all free persistent volumes. */
  get freePersistentVolumes(): Volume[] {
    let volumes = ((<SSGetters>this.$store.getters).volumes as any) as {
      [urn: string]: Volume;
    };
    let volumeList: Volume[] = [];
    for (let volumeURN in volumes) {
      if (volumes[volumeURN]) {
        if (volumes[volumeURN].usedBy.length === 0) {
          volumeList.push(volumes[volumeURN]);
        }
      } else {
        this.$store.dispatch("getElementInfo", volumeURN);
      }
    }
    return volumeList;
  }

  /** Checks if all required properties have been fullfiled. */
  get allSelected() {
    if (!this.selectedService) return false;
    if (!this.deploymentName) return false;
    for (let index in this.roleMem) {
      if (this.roleMem[index].length <= 0) return false;
    }
    for (let index in this.roleCPU) {
      if (this.roleCPU[index].length <= 0) return false;
    }
    for (let index in this.roleNet) {
      if (this.roleNet[index].length <= 0) return false;
    }
    for (let index in this.roleInstances) {
      if (this.roleMinInstances[index].length <= 0) return false;
    }
    for (let index in this.roleInstances) {
      if (this.roleInstances[index].length <= 0) return false;
    }
    for (let index in this.roleInstances) {
      if (this.roleMaxInstances[index].length <= 0) return false;
    }
    for (let index in this.roleResilence) {
      if (this.roleResilence[index].length <= 0) return false;
    }
    for (let index in this.resourceConfig) {
      if (this.resourceConfig[index].length <= 0) return false;
    }
    return true;
  }

  /** Validates the instances fields when another instance field is changed */
  validateFields(): void {
    (<any>this.$refs.form).validate();
  }

  /** This method checks the json configurations. */
  parseable(v: string): boolean {
    try {
      JSON.parse(v);
      return true;
    } catch (err) {
      return err.toString();
    }
  }

  /** Submits the creation of a new deployment. */
  submit() {
    if ((<any>this.$refs.form).validate()) {
      let roles = {};
      let instances;
      for (let roleIndex in this.serviceRolesList) {
        instances = {};
        for (
          let counter = 0;
          counter < parseInt(this.roleInstances[roleIndex]);
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

        roles[this.serviceRolesList[roleIndex]] = new Deployment.Role(
          this.serviceRolesList[roleIndex], // name
          this.$store.getters.services[this.selectedService].roles[
            this.serviceRolesList[roleIndex]
          ].component, //component
          null, // configuration
          parseInt(this.roleCPU[roleIndex]), // cpu
          parseInt(this.roleMem[roleIndex]), // memory
          null, // ioperf
          null, // iopsintensive
          parseInt(this.roleNet[roleIndex]), // bandwidht
          parseInt(this.roleResilence[roleIndex]), //resilience
          instances, // instances
          parseInt(this.roleMinInstances[roleIndex]), // mininstances
          parseInt(this.roleMaxInstances[roleIndex]) // maxInstances
        );
      }

      let resources: { [resourceName: string]: any } = {};
      for (let resIndex in this.serviceResourcesList) {
        if (
          this.serviceResourcesList[resIndex][1] ===
          "eslap://eslap.cloud/resource/volume/volatile/1_0_0"
        ) {
          resources[this.serviceResourcesList[resIndex][0]] = {
            size: +this.resourceConfig[resIndex]
          };
        } else {
          resources[
            this.serviceResourcesList[resIndex][0]
          ] = this.resourceConfig[resIndex];
        }
      }

      this.$store.dispatch(
        "deploy",
        new Deployment(
          "slap://domain/deployments/date/this_will_be_overrited", //urn
          this.deploymentName, //name
          JSON.parse(this.serviceConfig), //parameters
          this.selectedService, //serviceId
          roles, //roles
          resources, //resourcesConfig
          {} //channels
        )
      );
      this.$router.push("/");
    }
  }

  /** Cancels the creation of a new deployment. */
  cancel() {
    this.$router.go(-1);
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