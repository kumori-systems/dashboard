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
                <button class="button is-primary" v-bind:disabled="!someoneSelected" v-on:click="downloadManifest">Download manifest</button>
                <button class="button is-danger" v-bind:disabled="!someoneSelected" v-on:click="deleteSelected">Delete</button>
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
                                    <collapse-item v-bind:title="component" v-if="componentVersionList(owner,component).length>0">
                                        <table>
                                            <tr v-for="version in componentVersionList(owner, component)">
                                                <th>{{version}}</th>
                                                <th>
                                                    <span class="ON_PROGRESS" v-if="getIsComponentInUse(owner, component, version)">in use</span>
                                                </th>
                                                <th>
                                                    <button class="button is-info" v-on:click="showComponentInfo(getComponentId(owner, component, version))">
                                                        <i class="fa fa-info" aria-hidden="true" />
                                                    </button>
                                                    <button class="button is-danger" v-on:click="deleteElement(getComponentId(owner, component, version))">
                                                        <i class="fa fa-trash" aria-hidden="true"></i>
                                                    </button>
                                                    <input type="checkbox" id="selected" v-model="selectedComponents" v-bind:value="getComponentId(owner,component,version)">
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
            <collapse-item title="Services" v-if="serviceOwnerList.length>0">
                <div v-for="owner in serviceOwnerList">
                    <collapse accordion is-fullwidth>
                        <collapse-item v-bind:title="owner" v-if="ownerServiceList(owner).length>0">
                            <div v-for="service in ownerServiceList(owner)">
                                <collapse accordion is-fullwidth>
                                    <collapse-item v-bind:title="service" v-if="serviceVersionList(owner,service).length>0">
                                        <table>
                                            <tr v-for="version in serviceVersionList(owner, service)">
                                                <th>{{version}}</th>
                                                <th>
                                                    <span class="ON_PROGRESS" v-if="getIsServiceInUse(owner, service, version)">in use</span>
                                                </th>
                                                <th>
                                                    <button class="button is-info" v-on:click="showModal(getServiceId(owner, service, version))">
                                                        <i class="fa fa-info" aria-hidden="true" />
                                                    </button>
                                                    <!-- Dependiendo de si el servicio es entrypoint o no, el botón nos redirigirá a un sitio u a otro -->
                                                    <router-link v-if="selectedServiceIsInbound(getServiceId(owner, service, version))" v-bind:to="'newHTTPEntrypoint'">
                                                        <button class="button is-primary" v-on:click="selectedService(getServiceId(owner, service, version))">
                                                            <i class="fa fa-play" aria-hidden="true"></i>
                                                        </button>
                                                    </router-link>
                                                    <router-link v-else v-bind:to="'newWebServiceAdvanced'">
                                                        <button class="button is-primary" v-on:click="selectedService(getServiceId(owner, service, version))">
                                                            <i class="fa fa-play" aria-hidden="true"></i>
                                                        </button>
                                                    </router-link>
                                                    <!-- fin redirección -->
                                                    <button class="button is-danger" v-on:click="deleteElement(getServiceId(owner, service, version))">
                                                        <i class="fa fa-trash" aria-hidden="true"></i>
                                                    </button>
                                                    <input type="checkbox" id="selected" v-model="selectedServices" v-bind:value="getServiceId(owner,service,version)">
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
            <collapse-item title="Runtimes" v-if="runtimeOwnerList.length>0">
                <div v-for="owner in runtimeOwnerList">
                    <collapse accordion is-fullwidth>
                        <collapse-item v-bind:title="owner">
                            <div v-for="runtime in ownerRuntimeList(owner)">
                                <collapse accordion is-fullwidth>
                                    <collapse-item v-bind:title="runtime" v-if="runtimeVersionList(owner, runtime).length>0">
                                        <table>
                                            <tr v-for="version in runtimeVersionList(owner, runtime)">
                                                <th>{{version}}</th>
                                                <th>
                                                    <span class="ON_PROGRESS" v-if="getIsRuntimeInUse(owner, runtime, version)">in use</span>
                                                </th>
                                                <th>
                                                    <button class="button is-info" v-on:click="showModal(getRuntimeId(owner, runtime, version))">
                                                        <i class="fa fa-info" aria-hidden="true" />
                                                    </button>
                                                    <button class="button is-danger" v-on:click="deleteElement(getRuntimeId(owner, runtime, version))">
                                                        <i class="fa fa-trash" aria-hidden="true"></i>
                                                    </button>
                                                    <input type="checkbox" id="selected" v-model="selectedRuntimes" v-bind:value="getRuntimeId(owner,runtime,version)">
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
        </collapse>
        <modal v-bind:visible="modalIsVisible" v-bind:title="modalTitle" v-bind:leftButtonText="modalLeftButtonText" , v-bind:leftButtonCallback="modalLeftButtonCallback" , v-bind:leftButtonClass="modalLeftButtonClass" , v-on:close="closeModal">
            {{modalBody}}
        </modal>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Modal from './innerComponents/modal/Undeploy.vue';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import { FabElement } from '../../store/classes';

@Component({
    name: 'Elements',
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'modal': Modal
    }
})
export default class Elements extends Vue {
    selectedComponents = [];
    selectedServices = [];
    selectedRuntimes = [];
    search: string = null;
    // Modal Arguments
    showPublicElements: boolean = true;
    modalIsVisible: boolean = false;
    modalTitle: string = '';
    modalBody: string = '';
    modalLeftButtonText: string = '';
    modalLeftButtonCallback: Function = function () { };
    modalLeftButtonClass: string = "is-primary";


    mounted() {
        let fabElementsList: Array<FabElement> = [];
        fabElementsList.push(new FabElement('create new element', 'newBundle'));
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }

    get someoneSelected() {
        if (this.selectedComponents.length > 0 || this.selectedServices.length > 0 || this.selectedRuntimes.length > 0)
            return true;
        return false;
    }
    get getComponentId() {
        return (owner, component, version) => {
            return this.$store.getters.getComponentId(owner, component, version);
        }
    }

    get componentOwnerList() {
        return this.$store.getters.getComponentOwnerList(this.showPublicElements);
    }

    get ownerComponentList() {
        return (owner) => {
            return this.$store.getters.getOwnerComponentList(owner);
        }
    }

    get componentVersionList() {
        return (owner, component) => {
            return this.$store.getters.getComponentVersionList(owner, component, this.search);
        }
    }

    get serviceOwnerList() {
        return this.$store.getters.getServiceOwnerList(this.showPublicElements);
    }

    get ownerServiceList() {
        return (owner) => {
            return this.$store.getters.getOwnerServiceList(owner);
        }
    }

    get selectedServiceIsInbound() {
        return (serviceId) => {
            return this.$store.getters.getServiceIsEntryPoint(serviceId);
        }
    }

    get serviceVersionList() {
        return (owner, service) => {
            return this.$store.getters.getServiceVersionList(owner, service, this.search);
        }
    }
    get getIsComponentInUse() {
        return (owner, component, version) => {
            return this.$store.getters.getIsComponentInUse(this.getComponentId(owner, component, version));
        }
    }

    get getComponentOwner() {
        return (componentId) => {
            return this.$store.getters.getComponentOwner(componentId);
        }
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
    get getServiceId() {
        return (owner, service, version) => {
            return this.$store.getters.getServiceId(owner, service, version);
        }
    }
    get getIsServiceInUse() {
        return (owner, service, version) => {
            return this.$store.getters.getIsServiceInUse(this.getServiceId(owner, service, version));
        };
    }
    get getServiceOwner() {
        return (serviceId) => {
            return this.$store.getters.getServiceOwner(serviceId);
        };
    }

    get runtimeOwnerList() {
        return this.$store.getters.getRuntimeOwnerList(this.showPublicElements);
    }

    get ownerRuntimeList() {
        return (owner) => {
            return this.$store.getters.getOwnerRuntimeList(owner);
        }
    }
    get getRuntimeVersion() {
        return (runtimeId) => {
            return this.$store.getters.getRuntimeVersion(runtimeId);
        }
    }

    get getRuntimeId() {
        return (owner, runtime, version) => {
            return this.$store.getters.getRuntimeId(owner, runtime, version);
        }
    }

    get getIsRuntimeInUse() {
        return (owner, runtime, version) => {
            return this.$store.getters.getIsRuntimeInUse(this.getRuntimeId(owner, runtime, version));
        }
    }
    get getRuntimeOwner() {
        return (runtimeId) => {
            return this.$store.getters.getRuntimeOwner(runtimeId);
        };
    }
    get runtimeVersionList() {
        return (owner, runtime) => {
            return this.$store.getters.getRuntimeVersionList(owner, runtime, this.search);
        }
    }

    deleteElement(elementId) {
        this.$store.dispatch('deleteElement', elementId);
    }

    selectedService(serviceId) {
        this.$store.dispatch('selectedService', serviceId);
    }

    showModal(title: string, body: string, leftButtonClass?: string, leftButtonText?: string, leftButtonCallback?: Function) {
        this.modalIsVisible = true;
        this.modalTitle = title;
        this.modalBody = body;
        if (leftButtonClass) this.modalLeftButtonClass = leftButtonClass;
        if (leftButtonText) this.modalLeftButtonText = leftButtonText;
        if (leftButtonCallback) this.modalLeftButtonCallback = leftButtonCallback;
    }
    closeModal() {
        this.modalIsVisible = false;
    }

    showComponentInfo(componentURN: string) {
        this.showModal(componentURN, "Cuerpo del <u>modal</u>");
    }
    downloadManifest() {
        this.$store.dispatch('downloadManifest', this.selectedComponents.concat(this.selectedServices).concat(this.selectedRuntimes));
    }
    deleteSelected() {
        //this.showModal('');
        this.$store.dispatch('deleteElement', this.selectedComponents.concat(this.selectedServices).concat(this.selectedRuntimes));
    }

}
</script>
<style lang="scss" scoped>
/*
input[type=checkbox] {
    -ms-transform: scale(2); // IE
    -moz-transform: scale(2); // Firefox
    -webkit-transform: scale(2); // Safari and Chrome
    -o-transform: scale(2); // Opera
}
*/
</style>