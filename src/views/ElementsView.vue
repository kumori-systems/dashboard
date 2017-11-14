<template>
  <v-container id="elements-view">
        <v-layout row wrap>
            <v-flex xs12 sm5 md6 xl4>
                <v-text-field label="Search" v-model="search"
                prepend-icon="search"></v-text-field>
            </v-flex>
            <v-flex xs12 sm4 offset-sm1 md3 offset-md1 xl2 offset-xl4>
                <v-btn class="blue" v-bind:disabled="!someoneSelected"
                v-on:click="downloadSelected">Download manifest</v-btn>
            </v-flex>
            <v-flex xs12 sm2 md2 xl2>
                <v-btn class="red" v-bind:disabled="!someoneSelected"
                v-on:click="deleteSelected">Delete</v-btn>
            </v-flex>
        </v-layout>
        <v-layout row wrap>
            <v-flex xs12>
                <v-expansion-panel expand>
                    <v-expansion-panel-content>
                        <div slot="header">Runtimes</div>
                        <v-expansion-panel popout expand>
                            <v-expansion-panel-content
                            v-for="(runtimesByName,owner) in runtimesByOwner"
                            v-bind:key="owner">
                                <div slot="header">{{ owner }}</div>
                                <v-expansion-panel inset expand>
                                    <v-expansion-panel-content
                                    v-for="(runtimesByVersion, name) in
                                    runtimesByName" v-bind:key="name">
                                        <div slot="header">{{ name }}</div>
                                        <v-container fluid>
                                            <v-layout row wrap
                                            v-for="(runtime, version) in
                                            runtimesByVersion" v-bind:key="version" justify-space-between>
                                                <v-flex xs4>
                                                    <v-checkbox v-bind:label="version" v-model="selectedRuntimes" v-bind:value="runtime"></v-checkbox>
                                                </v-flex>
                                                <v-flex xs6>
                                                    <div v-if="runtimeUsedBy(runtime).length>0">
                                                        <div>
                                                            <span class="yellow">in use by component/s:</span>
                                                        </div>
                                                        <div v-for="(usedBy, index) in runtimeUsedBy(runtime)" v-bind:key="index">{{usedBy._name}}/{{usedBy._version}}</div>
                                                    </div>
                                                    <div v-else>not in use</div>
                                                </v-flex>
                                                <v-flex xs2>
                                                    <v-btn color="info" icon v-on:click="showElementInfo(runtime)">
                                                        <v-icon class="white--text">info_outline</v-icon>
                                                    </v-btn>
                                                    <v-btn color="error" icon v-on:click="deleteElement(runtime)">
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
                                                        <div v-for="(usedBy, index) in componentUsedBy(component)" v-bind:key="index">{{usedBy._name}}/{{usedBy._version}}</div>
                                                    </div>
                                                    <div v-else>not in use</div>
                                                </v-flex>
                                                <v-flex xs2>
                                                    <v-btn color="info" icon v-on:click="showElementInfo(component)">
                                                        <v-icon class="white--text">info_outline</v-icon>
                                                    </v-btn>
                                                    <v-btn color="error" icon v-on:click="deleteElement(owner, component, version)">
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
                                                        <div v-for="(usedBy, index) in serviceUsedBy(service)" v-bind:key="index">{{usedBy.name}}</div>
                                                    </div>
                                                    <div v-else>not in use</div>
                                                </v-flex>
                                                <v-flex xs2>
                                                    <v-btn color="info" icon v-on:click="showElementInfo(service)">
                                                        <v-icon class="white--text">info_outline</v-icon>
                                                    </v-btn>
                                                    <v-btn color="error" icon v-on:click="deleteElement(service)">
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
  deleteIsVisible: boolean = false;
  deleteGroupIsVisible: boolean = false;
  elementInfoIsVisible: boolean = false;
  modalElement: any = null;
  // id, tipo, elemento, version
  modalElementList: Array<[string, string, string, string]> = [];

  get someoneSelected() {
    if (
      this.selectedComponents.length > 0 ||
      this.selectedServices.length > 0 ||
      this.selectedRuntimes.length > 0
    )
      return true;
    return false;
  }

  get componentsByOwner(): {
    [owner: string]: { [name: string]: { [version: string]: Component } };
  } {
    return ((<SSGetters>this.$store.getters).componentsByOwner as any) as {
      [owner: string]: { [name: string]: { [version: string]: Component } };
    };
  }

  get componentUsedBy(): Function {
    return (uri): Service[] => {
      /*
      return (((<SSGetters>this.$store.getters).componentUsedBy as Function)(
        uri
      ) as any) as Service[];
      */
      return [];
    };
  }

  get servicesByOwner(): {
    [owner: string]: { [name: string]: { [version: string]: Service } };
  } {
    return ((<SSGetters>this.$store.getters).servicesByOwner as any) as {
      [owner: string]: { [name: string]: { [version: string]: Service } };
    };
  }

  get serviceUsedBy(): Function {
    return (uri): Deployment[] => {
      /*
      return (((<SSGetters>this.$store.getters).serviceUsedBy as Function)(
        uri
      ) as any) as Deployment[];
      */
      return [];
    };
  }

  get runtimesByOwner(): {
    [owner: string]: { [name: string]: { [version: string]: Runtime } };
  } {
    return ((<SSGetters>this.$store.getters).runtimesByOwner as any) as {
      [owner: string]: { [name: string]: { [version: string]: Runtime } };
    };
  }

  get runtimeUsedBy(): Function {
    return (uri): Component[] => {
      /*
      return (((<SSGetters>this.$store.getters).runtimeUsedBy as Function)(
        uri
      ) as any) as Component[];
      */
      return [];
    };
  }

  deleteElement(element) {
    this.modalElement = element;
    this.deleteIsVisible = true;
  }

  showElementInfo(element) {
    this.modalElement = element;
    this.elementInfoIsVisible = true;
  }

  downloadSelected() {
    this.$store.dispatch(
      "downloadManifest",
      this.selectedComponents
        .concat(this.selectedServices)
        .concat(this.selectedRuntimes)
    );
  }

  deleteSelected() {
    this.modalElementList = [];

    // id, tipo, elemento, version
    for (let index in this.selectedComponents) {
      this.modalElementList.push([
        this.selectedComponents[index],
        "component",
        // this.$store.getters.getComponentName(this.selectedComponents[index]),
        "",
        // this.$store.getters.getComponentVersion(
        // this.selectedComponents[index])
        ""
      ]);
    }

    for (let index in this.selectedServices) {
      this.modalElementList.push([
        this.selectedServices[index],
        "service",
        this.$store.getters.getServiceName(this.selectedServices[index]),
        this.$store.getters.getServiceVersion(this.selectedServices[index])
      ]);
    }

    for (let index in this.selectedRuntimes) {
      this.modalElementList.push([
        this.selectedRuntimes[index],
        "runtime",
        this.$store.getters.getRuntimeName(this.selectedRuntimes[index]),
        this.$store.getters.getRuntimeVersion(this.selectedRuntimes[index])
      ]);
    }

    this.deleteGroupIsVisible = true;
  }
}
</script>