<template>
  <v-container id="elements-view">
    <v-layout row wrap>
      <v-flex xs12 sm3 md3 xl4>
        <v-text-field label="Search" v-model="search" prepend-icon="search">
        </v-text-field>
      </v-flex>
      <v-flex xs12 offset-sm1 sm3 offset-md4 md3 offset-xl4 xl2>
        <v-btn class="blue" v-bind:disabled="!someoneSelected"
          v-on:click="downloadSelected">Download manifest</v-btn>
      </v-flex>
        <v-flex xs12 offset-sm2 sm2 offset-md0 md2 offset-xl0 xl2>
          <v-btn class="red" v-bind:disabled="!someoneSelected"
            v-on:click="ShowDeleteGroupDialog">Delete</v-btn>
        </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12>
        <v-expansion-panel expand>
          <v-expansion-panel-content>
            <div slot="header">Runtimes</div>
            <v-expansion-panel popout expand>
              <v-expansion-panel-content v-for="(runtimesByName,owner) in runtimesByOwner" v-bind:key="owner">
                <div slot="header">{{ owner }}</div>
                <v-expansion-panel inset expand>
                  <v-expansion-panel-content v-for="(runtimesByVersion, name) in runtimesByName" v-bind:key="name">
                    <div slot="header">{{ name }}</div>
                      <v-container fluid>
                        <v-layout row wrap v-for="(runtime, version) in runtimesByVersion" v-bind:key="version" justify-space-between>
                          <v-flex xs4>
                            <v-checkbox v-bind:label="version" v-model="selectedRuntimes" v-bind:value="runtime"></v-checkbox>
                          </v-flex>
                          <v-flex xs6>
                            <div v-if="runtimeUsedBy(runtime).length>0">
                              <div>
                                <span class="yellow">in use by component/s:</span>
                              </div>
                              <div v-for="(usedBy, index) in runtimeUsedBy(runtime)" v-bind:key="index">
                                <router-link  v-bind:to="deploymentInfo(usedBy)._path">
                                    {{deploymentInfo(usedBy).name}}
                                  </router-link>
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
              <div slot="header">Components</div>
              <v-expansion-panel popout expand>
                <v-expansion-panel-content v-for="(componentsByName, owner) in componentsByOwner" v-bind:key="owner">
                  <div slot="header">{{ owner }}</div>
                    <v-expansion-panel inset expand>
                      <v-expansion-panel-content v-for="(componentsByVersion, name) in componentsByName" v-bind:key="name">
                        <div slot="header">{{ name }}</div>
                        <v-container fluid>
                          <v-layout row wrap v-for="(component, version) in componentsByVersion" v-bind:key="version" justify-space-between>
                            <v-flex xs4>
                              <v-checkbox v-bind:label="version" v-model="selectedComponents" v-bind:value="component"></v-checkbox>
                            </v-flex>
                            <v-flex xs6>
                              <div v-if="componentUsedBy(component).length>0">
                                <div>
                                  <span class="yellow">in use by service/s:</span>
                                </div>
                                <div v-for="(usedBy, index) in componentUsedBy(component)" v-bind:key="index">
                                  <router-link  v-bind:to="deploymentInfo(usedBy)._path">
                                    {{deploymentInfo(usedBy).name}}
                                  </router-link>
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
              <div slot="header">Services</div>
              <v-expansion-panel popout expand>
                <v-expansion-panel-content v-for="(servicesByName, owner) in servicesByOwner" v-bind:key="owner">
                  <div slot="header">{{ owner }}</div>
                  <v-expansion-panel inset expand>
                    <v-expansion-panel-content v-for="(servicesByVersion, name) in servicesByName" v-bind:key="name">
                      <div slot="header">{{ name }}</div>
                        <v-container fluid>
                          <v-layout row wrap v-for="(service, version) in servicesByVersion" v-bind:key="version" justify-space-between>
                            <v-flex xs4>
                              <v-checkbox v-bind:label="version" v-model="selectedServices" v-bind:value="service"></v-checkbox>
                            </v-flex>
                            <v-flex xs6>
                              <div v-if="serviceUsedBy(service).length>0">
                                <div>
                                  <span class="yellow">in use by deployment/s:</span>
                                </div>
                                <div v-for="(usedBy, index) in serviceUsedBy(service)" v-bind:key="index">
                                  <router-link  v-bind:to="deploymentInfo(usedBy)._path">
                                    {{deploymentInfo(usedBy).name}}
                                  </router-link>
                                </div>
                              </div>
                              <div v-else>not in use</div>
                            </v-flex>
                            <v-flex xs2>
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
            </v-expansion-panel>
          </v-flex>
      </v-layout>

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
            <v-btn flat="flat" @click.native="deleteElementDialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- Single info -->
      <v-dialog v-model="infoElementDialog" max-width="800px">
        <v-card>
          <v-card-title class="headline">{{ selectedElement }} info:</v-card-title>
          <v-card-text>              
            <div v-for="(value, index) in selectedElementInfo" v-bind:key="index">
              {{index}}: {{value}}
            </div>
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
            <div v-for="(comp, index) in selectedComponents" v-bind:key="index">{{comp}}</div>
            <div v-for="(serv, index) in selectedServices" v-bind:key="index">{{serv}}</div>
            <div v-for="(runt, index) in selectedRuntimes" v-bind:key="index">{{runt}}</div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" flat="flat" @click.native="deleteGroup">Delete elements</v-btn>
            <v-btn flat="flat" @click.native="deleteGroupDialog = false">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import VueClassComponent from "vue-class-component";

import SSGetters from "../store/stampstate/getters";
import {
  Component,
  Service,
  Runtime,
  Deployment
} from "../store/stampstate/classes";

@VueClassComponent({
  name: "ElementsView"
})
export default class ElementsView extends Vue {
  selectedComponents: string[] = [];
  selectedServices: string[] = [];
  selectedRuntimes: string[] = [];
  search: string = null;
  // Modal Arguments
  deleteElementDialog: boolean = false;
  deleteGroupDialog: boolean = false;
  infoElementDialog: boolean = false;
  selectedElement: string = null;

  get someoneSelected() {
    if (
      this.selectedComponents.length > 0 ||
      this.selectedServices.length > 0 ||
      this.selectedRuntimes.length > 0
    )
      return true;
    return false;
  }

  get deploymentInfo() {
    return (uri: string) => {
      return this.$store.getters.deployment(uri);
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
    return (uri): string[] => {
      return (((<SSGetters>this.$store.getters).componentUsedBy as Function)(
        uri
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
    return (uri): string[] => {
      // Retrieve required info
      for (let dep in this.$store.getters.deployments) {
        let ser: Service = this.$store.getters.service(
          this.$store.getters.deployments[dep].service
        );
        if (!ser) {
          this.$store.dispatch(
            "getElementInfo",
            this.$store.getters.deployments[dep].service
          );
        }
        /*
        else {
          console.debug("Defined service %s", ser._uri);
          for (let role in ser.roles) {
            let comp: string = ser.roles[role].component;
            if (!this.$store.getters.components[comp]) {
              this.$store.dispatch("getElementInfo", comp);
            } else {
              let runt: string = this.$store.getters.components[comp].runtime;
              if (!this.$store.getters.runtimes[runt]) {
                this.$store.dispatch("getElementInfo", runt);
              }
            }
          }
        }
        */
      }

      return (((<SSGetters>this.$store.getters).serviceUsedBy as Function)(
        uri
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
    return (uri): string[] => {
      return (((<SSGetters>this.$store.getters).runtimeUsedBy as Function)(
        uri
      ) as any) as string[];
    };
  }

  /**
   * This returns all stored info about the element. The dialog must publish
   * all related info.
   */
  get selectedElementInfo(): any {
    let res = {};
    if (this.selectedElement) {
      res = this.$store.getters.elementInfo(this.selectedElement);
      if (!res) {
        this.$store.dispatch("getElementInfo", this.selectedElement);
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
      this.$store.dispatch("downloadManifest", this.selectedServices[comp]);
    }
    for (let runt in this.selectedRuntimes) {
      this.$store.dispatch("downloadManifest", this.selectedServices[runt]);
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

    this.deleteGroupDialog = false;
  }
}
</script>