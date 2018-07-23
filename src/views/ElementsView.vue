<!--
  This component represents the elements view.
-->
<template>
  <v-card id="elements-view" style="max-width:1300px">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Elements</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Upload bundle button -->
        <v-btn outline class="elevation-0" to="/uploadbundle">
          <span>Upload bundle</span>
          <v-icon right>file_upload</v-icon>
        </v-btn>
        
      </v-card-actions>
    </v-card-title>

    <!-- Divides different sections of the view -->
    <v-divider></v-divider>

    <v-container>
      
      <!-- Actions on elements -->
      <v-layout>
      
        <!-- Search -->
        <v-text-field label="Search" v-model="search" prepend-icon="search">
        </v-text-field>

        <!-- Applies spaces between elements -->
        <v-spacer></v-spacer>
        
        <!-- Groupal delete button -->
        <v-btn color="error" class="elevation-0" v-bind:disabled="!someoneSelected"
          v-on:click="ShowDeleteGroupDialog">Delete</v-btn>
          
        <!-- Groupal download button -->
        <v-btn color="primary" class="elevation-0" v-bind:disabled="!someoneSelected"
          v-on:click="downloadSelected">Download manifest</v-btn>
      
      </v-layout>

      <!-- Stamp elements -->
      <v-expansion-panel expand>
        <v-expansion-panel-content>

          <!-- Runtimes -->
          <div slot="header">Runtimes</div>
          <v-expansion-panel popout expand>
            <v-expansion-panel-content v-for="(runtimesByName,owner) in runtimesByOwner" v-bind:key="owner">

              <!-- Runtime owners -->
              <div slot="header">{{ owner }}</div>
              <v-expansion-panel inset expand>
                <v-expansion-panel-content v-for="(runtimesByVersion, name) in runtimesByName" v-bind:key="name">
                  
                  <!-- Runtime -->
                  <div slot="header">{{ name }}</div>
                  <v-container fluid>
                    <v-layout wrap v-for="(runtime, version) in runtimesByVersion" v-bind:key="version" justify-space-between>
                      <v-flex xs4>
                        <v-checkbox v-bind:label="version" v-model="selectedRuntimes" v-bind:value="runtime"></v-checkbox>
                      </v-flex>
                      <v-flex xs6>
                        <div v-if="runtimeUsedBy(runtime).length>0">
                          <div>in use by:</div>
                          <div v-for="(usedBy, index) in runtimeUsedBy(runtime)" v-bind:key="index" v-if="deploymentInfo(usedBy)">
                            <router-link v-bind:to="deploymentInfo(usedBy)._path">{{ deploymentInfo(usedBy).name }}</router-link>
                          </div>
                        </div>
                        <div v-else>not in use</div>
                      </v-flex>
                      <v-flex xs2>
                        <v-btn color="info" icon v-on:click="showInfoElementDialog(runtime)">
                          <v-icon class="white--text">info_outline</v-icon>
                        </v-btn>
                        <v-btn color="error" v-bind:disabled="runtimeUsedBy(runtime).length > 0" icon v-on:click="showDeleteElementDialog(runtime)">
                          <v-icon class="white--text">delete_forever</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </v-container>

                </v-expansion-panel-content>
              </v-expansion-panel>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panel-content>
        <v-expansion-panel-content>

          <!-- Components -->
          <div slot="header">Components</div>
          <v-expansion-panel popout expand>
            <v-expansion-panel-content v-for="(componentsByName, owner) in componentsByOwner" v-bind:key="owner">

              <!-- Component owners -->
              <div slot="header">{{ owner }}</div>
              <v-expansion-panel inset expand>
                <v-expansion-panel-content v-for="(componentsByVersion, name) in componentsByName" v-bind:key="name">

                  <!-- Component -->
                  <div slot="header">{{ name }}</div>
                  <v-container fluid>
                    <v-layout wrap v-for="(component, version) in componentsByVersion" v-bind:key="version" justify-space-between>
                      <v-flex xs4>
                        <v-checkbox v-bind:label="version" v-model="selectedComponents" v-bind:value="component"></v-checkbox>
                      </v-flex>
                      <v-flex xs6>
                        <div v-if="componentUsedBy(component).length>0">
                          <div>
                            <span>in use by:</span>
                          </div>
                          <div v-for="(usedBy, index) in componentUsedBy(component)" v-bind:key="index" v-if="deploymentInfo(usedBy)">
                            <router-link  v-bind:to="deploymentInfo(usedBy)._path">{{ deploymentInfo(usedBy).name }}</router-link>
                          </div>
                        </div>
                        <div v-else>not in use</div>
                      </v-flex>
                      <v-flex xs2>
                        <v-btn color="info" icon v-on:click="showInfoElementDialog(component)">
                          <v-icon class="white--text">info_outline</v-icon>
                        </v-btn>
                        <v-btn color="error" v-bind:disabled="componentUsedBy(component).length > 0" icon v-on:click="showDeleteElementDialog(component)">
                          <v-icon class="white--text">delete_forever</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </v-container>

                </v-expansion-panel-content>
              </v-expansion-panel>

            </v-expansion-panel-content>
          </v-expansion-panel>

        </v-expansion-panel-content>
        <v-expansion-panel-content>
          
          <!-- Services -->
          <div slot="header">Services</div>
          <v-expansion-panel popout expand>
            <v-expansion-panel-content v-for="(servicesByName, owner) in servicesByOwner" v-bind:key="owner">
              
              <!-- Service owners -->
              <div slot="header">{{ owner }}</div>
              <v-expansion-panel inset expand>
                <v-expansion-panel-content v-for="(servicesByVersion, name) in servicesByName" v-bind:key="name">
                  
                  <!-- Service -->
                  <div slot="header">{{ name }}</div>
                  <v-container fluid>
                    <v-layout wrap v-for="(service, version) in servicesByVersion" v-bind:key="version" justify-space-between>
                      <v-flex xs4>
                        <v-checkbox v-bind:label="version" v-model="selectedServices" v-bind:value="service"></v-checkbox>
                      </v-flex>
                      <v-flex xs6>
                        <div v-if="serviceUsedBy(service).length>0">
                          <div><span>in use by:</span></div>
                          <div v-for="(usedBy, index) in serviceUsedBy(service)" v-bind:key="index" v-if="deploymentInfo(usedBy)">
                            <router-link v-bind:to="deploymentInfo(usedBy)._path">{{ deploymentInfo(usedBy).name }}</router-link>
                          </div>
                        </div>
                        <div v-else>not in use</div>
                      </v-flex>
                      <v-flex xs2>
                        <v-btn color="green" icon v-on:click="deployService(service)">
                          <v-icon class="white--text">play_arrow</v-icon>
                        </v-btn>
                        <v-btn color="info" icon v-on:click="showInfoElementDialog(service)">
                          <v-icon class="white--text">info_outline</v-icon>
                        </v-btn>
                        <v-btn color="error" v-bind:disabled="serviceUsedBy(service).length > 0" icon v-on:click="showDeleteElementDialog(service)">
                          <v-icon class="white--text">delete_forever</v-icon>
                        </v-btn>
                      </v-flex>
                    </v-layout>
                  </v-container>

                </v-expansion-panel-content>
              </v-expansion-panel>

            </v-expansion-panel-content>
          </v-expansion-panel>

        </v-expansion-panel-content>
         <v-expansion-panel-content>
          
          <!-- Certificates -->
          <div slot="header">Certificates</div>
          <v-expansion-panel popout expand>
            <v-expansion-panel-content v-for="(certificatesByName, owner) in certificatesByOwner" v-bind:key="owner">
              
              <!-- Certificate owners -->
              <div slot="header">{{ owner }}</div>
              <v-expansion-panel inset expand>
                <v-expansion-panel-content v-for="(certificatesByVersion, name) in certificatesByName" v-bind:key="name">
                  
                  <!-- Certificate -->
                  <div slot="header">{{ name }}</div>
                  <v-container fluid>
                    <v-layout wrap v-for="(certificate, version) in certificatesByVersion" v-bind:key="version" justify-space-between>
                      <v-flex xs4>

                        <v-checkbox v-bind:label="version" v-model="selectedCertificates" v-bind:value="certificate"></v-checkbox>
                        
                      </v-flex>
                      <v-flex xs6>

                        <div v-if="certificateUsedBy(certificate).length>0">
                          <div><span>in use by:</span></div>
                          <div v-for="(usedBy, index) in certificateUsedBy(certificate)" v-bind:key="index" v-if="deploymentInfo(usedBy)">
                            <router-link v-bind:to="deploymentInfo(usedBy)._path">{{ deploymentInfo(usedBy).name }}</router-link>
                          </div>
                        </div>
                        <div v-else>not in use</div>

                      </v-flex>
                      <v-flex xs2>

                        <v-btn color="info" icon v-on:click="showInfoElementDialog(certificate)">
                          <v-icon class="white--text">info_outline</v-icon>
                        </v-btn>

                        <v-btn color="error" v-bind:disabled="certificateUsedBy(certificate).length > 0" icon v-on:click="showDeleteElementDialog(certificate)">
                          <v-icon class="white--text">delete_forever</v-icon>
                        </v-btn>

                      </v-flex>
                    </v-layout>
                  </v-container>

                </v-expansion-panel-content>
              </v-expansion-panel>

            </v-expansion-panel-content>
          </v-expansion-panel>

        </v-expansion-panel-content>
      </v-expansion-panel>

      <!-- Single delete -->
      <v-dialog v-model="deleteElementDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline">Delete element?</v-card-title>
          <v-card-text>
            This action <strong>CAN'T BE UNDONE</strong> and will
            delete the {{selectedElement}} element.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat="flat" @click.native="deleteElement">Delete element</v-btn>
            <v-btn flat="flat" @click.native="deleteElementDialog=false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Single info -->
      <v-dialog v-model="infoElementDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline">{{ selectedElement }} info:</v-card-title>
          <v-card-text>              
            <pre>{{ selectedElementInfo }}</pre>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat="flat" @click.native="showElementInfo">Download Manifest</v-btn>
            <v-btn flat="flat" @click.native="infoElementDialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Groupal delete -->
      <v-dialog v-model="deleteGroupDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline">Delete element?</v-card-title>
          <v-card-text>
            This action <strong>CAN'T BE UNDONE</strong> and will delete:
            <div v-for="(comp, index) in selectedComponents" v-bind:key="index">{{ comp }}</div>
            <div v-for="(serv, index) in selectedServices" v-bind:key="index">{{ serv }}</div>
            <div v-for="(runt, index) in selectedRuntimes" v-bind:key="index">{{ runt }}</div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat="flat" @click.native="deleteGroup">Delete elements</v-btn>
            <v-btn flat="flat" @click.native="deleteGroupDialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import { utils } from "./../api";

import SSGetters from "../store/stampstate/getters";
import {
  Certificate,
  Component,
  Deployment,
  ECloudElement,
  EntryPoint,
  Resource,
  Runtime,
  Service
} from "../store/stampstate/classes";

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
  name: "ElementsView"
})
export default class ElementsView extends Vue {
  /** Selected components to make groupal actions. */
  selectedComponents: string[] = [];

  /** Selected services to make groupal actions. */
  selectedServices: string[] = [];

  /** Selected runtimes to make groupal actions. */
  selectedRuntimes: string[] = [];

  selectedCertificates: string[] = [];

  /** Search filter. */
  search: string = null;

  /** Show/Hide delete element dialog. */
  deleteElementDialog: boolean = false;

  /** Show/Hide delete group dialog. */
  deleteGroupDialog: boolean = false;

  /** Show/Hide info element dialog. */
  infoElementDialog: boolean = false;

  /** Selected element for dialogs. */
  selectedElement: string = null;

  /** Vue lifecycle. Preppears all required data. */
  mounted() {
    // Retrieve all actually deployed services
    for (let dep in this.$store.getters.deployments) {
      if (
        !this.$store.getters.services[
          this.$store.getters.deployments[dep].service
        ]
      ) {
        this.$store.dispatch(
          "getElementInfo",
          this.$store.getters.deployments[dep].service
        );
      }
    }
  }

  /** Done to show the apply changes as enabled or disabled. */
  get someoneSelected() {
    if (
      this.selectedComponents.length > 0 ||
      this.selectedServices.length > 0 ||
      this.selectedRuntimes.length > 0 ||
      this.selectedCertificates.length > 0
    )
      return true;
    return false;
  }

  /** Obtains deployment info. */
  get deploymentInfo() {
    return (urn: string) => {
      return this.$store.getters.deployments[urn];
    };
  }

  /** Orders components by owner. */
  get componentsByOwner() {
    let res: {
      [owner: string]: { [name: string]: { [version: string]: string } };
    } = {};
    let comps: { [key: string]: Component } = this.$store.getters.components;
    for (let urn in comps) {
      if (this.search === null || urn.indexOf(this.search) !== -1) {
        let componentDomain = utils.getElementDomain(urn);
        let componentName = utils.getElementName(urn);
        let componentVersion = utils.getElementVersion(urn);

        if (!res[componentDomain]) {
          res[componentDomain] = {};
        }
        if (!res[componentDomain][componentName]) {
          res[componentDomain][componentName] = {};
        }

        res[componentDomain][componentName][componentVersion] = urn;
      }
    }
    return res;
  }

  /** Obtains components used by property. */
  get componentUsedBy(): Function {
    return (componentURN: string) => {
      let res: string[] = [];
      let comp = this.$store.getters.components[componentURN];
      if (comp) {
        res = comp.usedBy;
      }
      return res;
    };
  }

  /** Orders certificates by owner. */
  get certificatesByOwner() {
    let res: {
      [owner: string]: {
        [name: string]: {
          [version: string]: string;
        };
      };
    } = {};
    let certs = this.$store.getters.certificates;
    for (let urn in certs) {
      if (this.search === null || urn.indexOf(this.search) !== -1) {
        let certificateDomain = utils.getElementDomain(urn);
        let certificateName = utils.getElementName(urn);
        let certificateVersion = utils.getElementVersion(urn);

        if (!res[certificateDomain]) res[certificateDomain] = {};
        if (!res[certificateDomain][certificateName])
          res[certificateDomain][certificateName] = {};

        res[certificateDomain][certificateName][certificateVersion] = urn;
      }
    }
    return res;
  }

  /** Obtains certificates used by property. */
  get certificateUsedBy(): Function {
    return (certificateURN: string) => {
      let res: string[] = [];
      let cert = this.$store.getters.certificates[certificateURN];
      if (cert) {
        res = cert.usedBy;
      }
      return res;
    };
  }

  /** Orders services by owner. */
  get servicesByOwner() {
    let res: {
      [owner: string]: {
        [name: string]: {
          [version: string]: string;
        };
      };
    } = {};
    let sers = this.$store.getters.services;
    for (let urn in sers) {
      if (this.search === null || urn.indexOf(this.search) !== -1) {
        let serviceDomain = utils.getElementDomain(urn);
        let serviceName = utils.getElementName(urn);
        let serviceVersion = utils.getElementVersion(urn);

        if (!res[serviceDomain]) res[serviceDomain] = {};
        if (!res[serviceDomain][serviceName])
          res[serviceDomain][serviceName] = {};

        res[serviceDomain][serviceName][serviceVersion] = urn;
      }
    }
    return res;
  }

  /** Returns service property used by. */
  get serviceUsedBy(): Function {
    return (serviceURN): string[] => {
      let res: string[] = [];
      let ser = this.$store.getters.services[serviceURN];
      if (ser) {
        res = ser.usedBy;
      }
      return res;
    };
  }

  /** Returns the runtimes ordered by owner. */
  get runtimesByOwner() {
    let res: {
      [owner: string]: {
        [name: string]: {
          [version: string]: string;
        };
      };
    } = {};
    let runs = this.$store.getters.runtimes;
    for (let urn in runs) {
      if (this.search === null || urn.indexOf(this.search) !== -1) {
        let runtimeDomain = utils.getElementDomain(urn);
        let runtimeName = utils.getElementName(urn);
        let runtimeVersion = utils.getElementVersion(urn);

        if (!res[runtimeDomain]) res[runtimeDomain] = {};
        if (!res[runtimeDomain][runtimeName])
          res[runtimeDomain][runtimeName] = {};

        res[runtimeDomain][runtimeName][runtimeVersion] = urn;
      }
    }
    return res;
  }

  /** Returns the runtime properties used by. */
  get runtimeUsedBy(): Function {
    return (runtimeURN: string) => {
      let res: string[] = [];
      let run = this.$store.getters.runtimes[runtimeURN];
      if (run) {
        res = run.usedBy;
      }
      return res;
    };
  }

  /** Shows all stored info related to the selected element. */
  get selectedElementInfo(): string {
    let res: string = "";
    let getter: string = null;
    if (this.selectedElement) {
      switch (utils.getElementType(this.selectedElement)) {
        case ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT:
          getter = "components";
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME:
          getter = "runtimes";
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.SERVICE:
          getter = "services";
          break;
        case ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE:
          getter = "resources";
          switch (utils.getResourceType(this.selectedElement)) {
            case Resource.RESOURCE_TYPE.CERTIFICATE:
              getter = "certificates";
              break;
          }
      }

      let item = this.$store.getters[getter][this.selectedElement];
      if (!item) {
        this.$store.dispatch("getElementInfo", this.selectedElement);
      } else {
        res = JSON.stringify(item, null, 2);
      }
    }
    return res;
  }

  /** Show delete element dialog. */
  showDeleteElementDialog(element: string) {
    this.selectedElement = element;
    this.deleteElementDialog = true;
  }

  /** Confirms to delete an element. */
  deleteElement() {
    this.$store.dispatch("deleteElement", this.selectedElement);
    this.deleteElementDialog = false;
    this.selectedElement = null;
  }
  /** Show info element dialog. */
  showInfoElementDialog(element: string) {
    this.selectedElement = element;
    this.infoElementDialog = true;
  }

  /** Downloads the manifest of an element. */
  showElementInfo() {
    this.$store.dispatch("downloadManifest", this.selectedElement);
    this.infoElementDialog = false;
    this.selectedElement = null;
  }

  /** Downloads multiple manifests from selected elements. */
  downloadSelected() {
    for (let serv in this.selectedServices) {
      this.$store.dispatch("downloadManifest", this.selectedServices[serv]);
    }
    for (let comp in this.selectedComponents) {
      this.$store.dispatch("downloadManifest", this.selectedComponents[comp]);
    }
    for (let runt in this.selectedRuntimes) {
      this.$store.dispatch("downloadManifest", this.selectedRuntimes[runt]);
    }
    for (let cert in this.selectedCertificates) {
      this.$store.dispatch("downloadManifest", this.selectedCertificates[cert]);
    }
  }

  /** Shows the delete group dialog. */
  ShowDeleteGroupDialog() {
    this.deleteGroupDialog = true;
  }

  /** Confirms the deletion of more than one element. */
  deleteGroup() {
    let deleteList: string[] = [];
    for (let index in this.selectedComponents) {
      this.$store.dispatch("deleteElement", this.selectedComponents[index]);
    }
    this.selectedComponents = [];

    for (let index in this.selectedServices) {
      this.$store.dispatch("deleteElement", this.selectedServices[index]);
    }
    this.selectedServices = [];

    for (let index in this.selectedRuntimes) {
      this.$store.dispatch("deleteElement", this.selectedRuntimes[index]);
    }
    this.selectedRuntimes = [];

    for (let index in this.selectedCertificates) {
      this.$store.dispatch("deleteElement", this.selectedCertificates[index]);
    }
    this.selectedCertificates = [];

    this.deleteGroupDialog = false;
  }

  /**
   * This is triggered when the user clicks on the play icon at a service. This
   * will redirect the user to 'add service view' with the service as the
   * selected service.
   */
  deployService(service) {
    // Keep the service in the state
    this.$store.dispatch("selectedService", service);

    // Depending on the type of service, a view must be loaded
    let route;
    switch (service) {
      case EntryPoint.ENTRYPOINT_TYPE.HTTP_INBOUND:
        route = "addHTTPEntrypoint";
        break;

      default:
        // Not entrypoint
        route = "addDeployment";
    }

    this.$router.push(route);
  }
}
</script>