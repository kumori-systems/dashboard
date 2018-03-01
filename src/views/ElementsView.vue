<template>
  <v-card id="elements-view">
    <v-card-title>

      <!-- View title -->
      <h3 class="headline mb-0">Elements</h3>

      <!-- Applies spaces between elements -->
      <v-spacer></v-spacer>

      <!-- View actions -->
      <v-card-actions>

        <!-- Upload bundle button -->
        <v-btn outline color="primary" class="elevation-0" to="/uploadbundle">
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
                          <div>
                            <span class="yellow">in use by:</span>
                          </div>
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
                        <v-btn color="error" icon v-on:click="showDeleteElementDialog(runtime)">
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
                            <span class="yellow">in use by:</span>
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
                        <v-btn color="error" icon v-on:click="showDeleteElementDialog(component)">
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
                          <div><span class="yellow">in use by:</span></div>
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
                        <v-btn color="error" icon v-on:click="showDeleteElementDialog(service)">
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
                          <div><span class="yellow">in use by:</span></div>
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

                        <v-btn color="error" icon v-on:click="showDeleteElementDialog(certificate)">
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

import SSGetters from "../store/stampstate/getters";
import {
  Certificate,
  Component,
  Service,
  Runtime,
  Deployment,
  EntryPoint
} from "../store/stampstate/classes";

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

  mounted() {
    // Retrieve all actually deployed services
    for (let dep in this.$store.getters.deployments) {
      if (
        !this.$store.getters.service(
          this.$store.getters.deployments[dep].service
        )
      ) {
        this.$store.dispatch(
          "getElementInfo",
          this.$store.getters.deployments[dep].service
        );
      }
    }
  }

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

  get deploymentInfo() {
    return (urn: string) => {
      return this.$store.getters.deployment(urn);
    };
  }

  get componentsByOwner(): {
    [owner: string]: { [name: string]: { [version: string]: Component } };
  } {
    return ((<SSGetters>this.$store.getters).componentsByOwner as any)(
      this.search
    ) as {
      [owner: string]: { [name: string]: { [version: string]: Component } };
    };
  }

  get componentUsedBy(): Function {
    return (urn): string[] => {
      return (((<SSGetters>this.$store.getters).componentUsedBy as Function)(
        urn
      ) as any) as string[];
    };
  }

  get certificatesByOwner():{
    [owner: string]: { [name: string]: { [version: string]: Certificate } };
  } {
    return ((<SSGetters>this.$store.getters).certificatesByOwner as any)(
      this.search
    ) as {
      [owner: string]: { [name: string]: { [version: string]: Certificate } };
    };
  }

  get certificateUsedBy(): Function {
    return (urn): string[] => {
      return (((<SSGetters>this.$store.getters).certificateUsedBy as Function)(
        urn
      ) as any) as string[];
    };
  }

  get servicesByOwner(): {
    [owner: string]: { [name: string]: { [version: string]: Service } };
  } {
    return ((<SSGetters>this.$store.getters).servicesByOwner as any)(
      this.search
    ) as {
      [owner: string]: { [name: string]: { [version: string]: Service } };
    };
  }

  get serviceUsedBy(): Function {
    return (urn): string[] => {
      return (((<SSGetters>this.$store.getters).serviceUsedBy as Function)(
        urn
      ) as any) as string[];
    };
  }

  get runtimesByOwner(): {
    [owner: string]: { [name: string]: { [version: string]: Runtime } };
  } {
    return ((<SSGetters>this.$store.getters).runtimesByOwner as any)(
      this.search
    ) as {
      [owner: string]: { [name: string]: { [version: string]: Runtime } };
    };
  }

  get runtimeUsedBy(): Function {
    return (urn): string[] => {
      return (((<SSGetters>this.$store.getters).runtimeUsedBy as Function)(
        urn
      ) as any) as string[];
    };
  }

  /**
   * Shows all stored info related to the selected element.
   */
  get selectedElementInfo(): string {
    let res: string = "";
    if (this.selectedElement) {
      let item = this.$store.getters.elementInfo(this.selectedElement);
      if (!item) {
        this.$store.dispatch("getElementInfo", this.selectedElement);
      } else {
        res = JSON.stringify(item, null, 2);
      }
    }
    return res;
  }

  showDeleteElementDialog(element: string) {
    this.selectedElement = element;
    this.deleteElementDialog = true;
  }

  deleteElement() {
    this.$store.dispatch("deleteElement", this.selectedElement);
    this.deleteElementDialog = false;
    this.selectedElement = null;
  }

  showInfoElementDialog(element: string) {
    this.selectedElement = element;
    this.infoElementDialog = true;
  }

  showElementInfo() {
    this.$store.dispatch("downloadManifest", this.selectedElement);
    this.infoElementDialog = false;
    this.selectedElement = null;
  }

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

  ShowDeleteGroupDialog() {
    this.deleteGroupDialog = true;
  }

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