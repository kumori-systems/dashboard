<template>
    <div>
        <div class="tile">
            <span class="control has-icon">
                <input class="input" placeholder="Search" v-model="search">
                <span class="icon is-small">
                    <i class="fa fa-search"></i>
                </span>
            </span>
            <span>
                <button class="button" v-bind:disabled="!someoneSelected" v-on:click="downloadManifest">Download manifest</button>
                <button class="button" v-bind:disabled="!someoneSelected" v-on:click="deleteSelected">Delete</button>
            </span>
        </div>
        <p>
            <input type="checkbox" id="showpublic3rdpartyelements" v-model="showPublicElements">
            <label for="showpublic3rdpartyelements">Show public 3rd party elements</label>
        </p>
        <collapse accordion is-fullwidth>
            <collapse-item title="Components" v-if="componentOwnerList.length>0">
                <div v-for="owner in componentOwnerList">
                    <collapse accordion is-fullwidth>
                        <collapse-item v-bind:title="owner">
                            <div v-for="component in ownerComponentList(owner)">
                                <collapse accordion is-fullwidth>
                                    <collapse-item v-bind:title="component">
                                        <table>
                                            <tr v-for="version in componentVersionList(owner, component)">
                                                <th>{{version}}</th>
                                                <th>
                                                    <span class="ON_PROGRESS" v-if="getIsComponentInUse(owner, component, version)">in use</span>
                                                </th>
                                                <th>
                                                    <button class="button" v-on:click="openModal('componentId')">
                                                        <i class="fa fa-info" aria-hidden="true" />
                                                    </button>
                                                    <button class="button" v-on:click="deleteElement('componentId')">
                                                        <i class="fa fa-trash" aria-hidden="true"></i>
                                                    </button>
                                                </th>
                                            </tr>
                                        </table>
                                    </collapse-item>
                                </collapse>
                            </div>
                        </collapse-item>
                    </collapse>
                </div>
            </collapse-item>
            <collapse-item title="Services" v-if="serviceList.length>0">
                <table class="table">
                    <tr v-for="serviceId, index in serviceList" v-bind:key="serviceId">
                        <th>{{getServiceOwner(serviceId)}}</th>
                        <th>{{getServiceName(serviceId)}}</th>
                        <th>{{getServiceVersion(serviceId)}}</th>
                        <th>
                            <span class="ON_PROGRESS" v-if="getIsServiceInUse(serviceId)">in use</span>
                        </th>
                        <th>
                            <button class="button" v-on:click="openModal(serviceId)">
                                <i class="fa fa-info" aria-hidden="true" />
                            </button>
                            <button class="button" v-on:click="deleteElement(serviceId)">
                                <i class="fa fa-trash" aria-hidden="true"></i>
                            </button>
                            <router-link v-if="selectedServiceIsInbound(serviceId)" v-bind:to="'newHTTPEntrypoint'">
                                <button class="button" v-on:click="selectedService(serviceId)">
                                    <i class="fa fa-play" aria-hidden="true"></i>
                                </button>
                            </router-link>
                            <router-link v-else v-bind:to="'newWebServiceAdvanced'">
                                <button class="button" v-on:click="selectedService(serviceId)">
                                    <i class="fa fa-play" aria-hidden="true"></i>
                                </button>
                            </router-link>
                            <input type="checkbox" id="selected" v-model="selectedServices[index]">
                        </th>
                    </tr>
                </table>
            </collapse-item>
            <collapse-item title="Runtimes" v-if="runtimeList.length>0">
                <table class="table">
                    <tr v-for="runtimeId, index in runtimeList" v-bind:key="runtimeId">
                        <th>{{getRuntimeOwner(runtimeId)}}</th>
                        <th>{{runtimeId.split('/')[4]}}</th>
                        <th> {{getRuntimeVersion(runtimeId)}}</th>
                        <th>
                            <span class="ON_PROGRESS" v-if="getIsRuntimeInUse(runtimeId)">in use</span>
                        </th>
                        <th>
                            <button class="button" v-on:click="openModal(runtimeId)">
                                <i class="fa fa-info" aria-hidden="true" />
                            </button>
                            <button class="button" v-on:click="deleteElement(runtimeId)">
                                <i class="fa fa-trash" aria-hidden="true"></i>
                            </button>
                            <input type="checkbox" id="selected" v-model="selectedRuntimes[index]">
                        </th>
                    </tr>
                </table>
            </collapse-item>
        </collapse>
        <modal v-bind:visible="showModal" v-bind:title="elementURN" v-on:close="closeModal"></modal>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import { FabElement } from '../../store/classes';
import Modal from '../innerComponents/Modal.vue';

@Component({
    name: 'Elements',
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'modal': Modal
    }
})
export default class Elements extends Vue {
    showModal: boolean = false;
    elementURN: string = '';
    selectedComponents: Array<boolean> = [];
    selectedServices: Array<boolean> = [];
    selectedRuntimes: Array<boolean> = [];
    search: string = null;
    showPublicElements: boolean = true;

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        fabElementsList.push(new FabElement('create new element', 'newBundle'));
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }

    get someoneSelected() {
        for (let index in this.selectedComponents) {
            if (this.selectedComponents[index] === true)
                return true;
        }
        for (let index in this.selectedServices) {
            if (this.selectedServices[index] === true)
                return true;
        }
        for (let index in this.selectedRuntimes) {
            if (this.selectedRuntimes[index] === true)
                return true;
        }
        return false;
    }

    get componentOwnerList() {
        return this.$store.getters.getComponentOwnerList;
    }

    get ownerComponentList() {
        return (owner) => {
            return this.$store.getters.getOwnerComponentList(owner);
        }
    }

    get componentVersionList() {
        return (owner, component) => {
            return this.$store.getters.getComponentVersionList(owner, component);
        }
    }

    get getComponentVersion() {
        return (componentId) => {
            return this.$store.getters.getComponentVersion(componentId);
        }
    }

    get selectedServiceIsInbound() {
        return (serviceId) => {
            return this.$store.getters.getServiceIsEntryPoint(serviceId);
        }
    }

    get getIsComponentInUse() {
        return (owner, component, version) => {
            return this.$store.getters.getIsComponentInUse(owner, component, version);
        }
    }

    get getComponentOwner() {
        return (componentId) => {
            return this.$store.getters.getComponentOwner(componentId);
        }
    }

    get serviceList() {
        let services = this.$store.getters.getWebServiceList(this.search, this.showPublicElements);
        this.selectedServices = new Array<boolean>(services.length);
        return services
    }
    get getServiceName() {
        return (serviceId) => {
            return this.$store.getters.getServiceName(serviceId);
        };
    }
    get getServiceVersion() {
        return (serviceId) => {
            return this.$store.getters.getServiceVersion(serviceId);
        };
    }
    get getIsServiceInUse() {
        return (serviceId) => {
            return this.$store.getters.getIsServiceInUse(serviceId);
        };
    }
    get getServiceOwner() {
        return (serviceId) => {
            return this.$store.getters.getServiceOwner(serviceId);
        };
    }

    get runtimeList() {
        let runtimes = this.$store.getters.getRuntimeList(this.search, this.showPublicElements);
        this.selectedRuntimes = new Array<boolean>(runtimes.length);
        return runtimes;
    }
    get getRuntimeVersion() {
        return (runtimeId) => {
            return this.$store.getters.getRuntimeVersion(runtimeId);
        }
    }
    get getIsRuntimeInUse() {
        return (runtimeId) => {
            return this.$store.getters.getIsRuntimeInUse(runtimeId);
        }
    }
    get getRuntimeOwner() {
        return (runtimeId) => {
            return this.$store.getters.getRuntimeOwner(runtimeId);
        };
    }

    deleteElement(elementId) {
        this.$store.dispatch('deleteElement', elementId);
    }

    selectedService(serviceId) {
        this.$store.dispatch('selectedService', serviceId);
    }

    openModal(elementId: string) {
        this.elementURN = elementId;
        this.showModal = true;
    }
    closeModal() {
        this.showModal = false;
    }

    downloadManifest() {
        let res = [];
        // Descargamos el manifest de todos los elementos seleccionados
        // Recorremos la lsita de componentes seleccionados
        for (let index in this.selectedComponents) {
            if (this.selectedComponents[index] === true) {
                //res.push(this.componentList[index]);
            }
        }

        for (let index in this.selectedServices) {
            if (this.selectedServices[index] === true) {
                res.push(this.serviceList[index]);
            }
        }

        for (let index in this.selectedRuntimes) {
            if (this.selectedRuntimes[index] === true) {
                res.push(this.runtimeList[index]);
            }
        }

        this.$store.dispatch('downloadManifest', res);
    }
    deleteSelected() {
        // Eliminamos todos los elementos seleccionados
        let res = [];
        for (let index in this.selectedComponents) {
            if (this.selectedComponents[index] === true) {
                // res.push(this.componentList[index]);
            }
        }

        for (let index in this.selectedServices) {
            if (this.selectedServices[index] === true) {
                res.push(this.serviceList[index]);
            }
        }

        for (let index in this.selectedRuntimes) {
            if (this.selectedRuntimes[index] === true) {
                res.push(this.runtimeList[index]);
            }
        }

        this.$store.dispatch('deleteElement', res);

    }

}
</script>
<style lang="scss">
.card {
    margin: 0px;
    padding: 0px;
    border: 0px;
}

.collapse-item {
    margin: 0px;
    padding: 0px;
    border: 0px;
}

.card-content {
    margin: 0px;
    padding: 0px;
    border: 0px;
}

.card-header-title {
    margin: 0px;
    padding: 0px;
    border: 0px;
}
.card-content-box{
    margin: 0px;
    padding: 0px;
    border: 0px;
}
</style>