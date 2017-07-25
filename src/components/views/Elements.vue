<template>
    <div>
        <div class="tile">
            <span class="control has-icon tile is-4">
                <input class="input" placeholder="Search" v-model="search">
                <span class="icon is-small">
                    <i class="fa fa-search"></i>
                </span>
                <span>&#160;</span>
                <button class="button is-primary" v-bind:disabled="!someoneSelected" v-on:click="downloadManifest">Download manifest</button>
                <button class="button is-danger" v-bind:disabled="!someoneSelected" v-on:click="deleteSelected">Delete</button>
            </span>
        </div>
        <p>
            <checkbox-input v-model="showPublicElements"> Show public 3rd party elements</checkbox-input>
        </p>
    
        <collapse accordion is-fullwidth v-if="componentOwnerList.length>0 || serviceOwnerList.length>0 || runtimeOwnerList.length>0">
            <collapse-item title="Components" v-if="componentOwnerList.length>0">
                <div v-for="(owner, index) in componentOwnerList" v-bind:key="index" v-if="ownerComponentList(owner).length>0 && (showPublicElements || owner === user)">
                    <collapse accordion is-fullwidth>
                        <collapse-item v-bind:title="owner">
                            <div v-for="(component, index) in ownerComponentList(owner)" v-bind:key="index" v-if="componentVersionList(owner,component).length>0">
                                <collapse accordion is-fullwidth>
                                    <collapse-item v-bind:title="component">
                                        <table>
                                            <tr v-for="(version, index) in componentVersionList(owner, component)" v-bind:key="index">
                                                <th>
                                                    <checkbox-input class="fa-2x" v-model="selectedComponents" v-bind:value="getComponentId(owner,component,version)"></checkbox-input>
                                                </th>
                                                <th>
                                                    {{version}}
                                                </th>
                                                <th v-if="getIsComponentInUse(owner, component, version)">
                                                    <div>
                                                        <span class="ON_PROGRESS">in use by service/s:</span>
                                                    </div>
                                                    <div v-for="(usedBy, index) in getComponentUsedBy(owner, component, version)" v-bind:key="index">{{usedBy}} </div>
                                                </th>
                                                <th v-else>
                                                    not in use
                                                </th>
                                                <th>
                                                    <button class="button is-info" v-on:click="showComponentInfo(owner, component, version)">
                                                        <i class="fa fa-info" aria-hidden="true" />
                                                    </button>
                                                    <button class="button is-danger" v-if="owner===user" v-on:click="deleteComponent(owner, component, version)">
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
            <collapse-item title="Services" v-if="serviceOwnerList.length>0">
                <div v-for="(owner, index) in serviceOwnerList" v-bind:key="index">
                    <collapse accordion is-fullwidth>
                        <collapse-item v-bind:title="owner" v-if="ownerServiceList(owner).length>0">
                            <div v-for="(service, index) in ownerServiceList(owner)" v-bind:key="index">
                                <collapse accordion is-fullwidth>
                                    <collapse-item v-bind:title="service" v-if="serviceVersionList(owner,service).length>0">
                                        <table>
                                            <tr v-for="(version, index) in serviceVersionList(owner, service)" v-bind:key="index">
                                                <th>
                                                    <checkbox-input class="fa-2x" v-model="selectedServices" v-bind:value="getServiceId(owner,service,version)"></checkbox-input>
                                                </th>
                                                <th>
                                                    {{version}}
                                                </th>
                                                <th v-if="getIsServiceInUse(owner, service, version)">
                                                    <div>
                                                        <span class="ON_PROGRESS">in use by deployment/s:</span>
                                                    </div>
                                                    <div v-for="(usedBy, index) in getServiceUsedBy(owner, service, version)" v-bind:key="index">{{usedBy}}</div>
                                                </th>
                                                <th v-else>
                                                    not in use
                                                </th>
                                                <th>
                                                    <button class="button is-info" v-on:click="showServiceInfo(owner, service, version)">
                                                        <i class="fa fa-info" aria-hidden="true" />
                                                    </button>
    
                                                    <router-link v-if="selectedServiceIsInbound(getServiceId(owner, service, version))" v-bind:to="'newHTTPEntrypoint'">
                                                        <button class="button is-primary" v-on:click="selectedService(getServiceId(owner, service, version))">
                                                            <i class="fa fa-play" aria-hidden="true"></i>
                                                        </button>
                                                    </router-link>
                                                    <router-link v-else v-bind:to="'newService'">
                                                        <button class="button is-primary" v-on:click="selectedService(getServiceId(owner, service, version))">
                                                            <i class="fa fa-play" aria-hidden="true"></i>
                                                        </button>
                                                    </router-link>
    
                                                    <button class="button is-danger" v-if="owner===user" v-on:click="deleteService(owner, service, version)">
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
            <collapse-item title="Runtimes" v-if="runtimeOwnerList.length>0">
                <div v-for="(owner, index) in runtimeOwnerList" v-bind:key="index">
                    <collapse accordion is-fullwidth>
                        <collapse-item v-bind:title="owner">
                            <collapse accordion is-fullwidth v-for="(runtime, index) in ownerRuntimeList(owner)" v-bind:key="index">
                                <collapse-item v-bind:title="runtime" v-if="runtimeVersionList(owner, runtime).length>0">
                                    <table>
                                        <tr v-for="(version, index) in runtimeVersionList(owner, runtime)" v-bind:key="index">
                                            <th>
                                                <checkbox-input class="fa-2x" v-model="selectedRuntimes" v-bind:value="getRuntimeId(owner,runtime,version)"></checkbox-input>
                                            </th>
                                            <th>
                                                {{version}}
                                            </th>
                                            <th v-if="getIsRuntimeInUse(owner, runtime, version)">
                                                <div>
                                                    <span class="ON_PROGRESS">in use by component/s:</span>
                                                </div>
                                                <div v-for="(usedBy, index) in getRuntimeUsedBy(owner, runtime, version)" v-bind:key="index">{{usedBy}} </div>
                                            </th>
                                            <th v-else>
                                                not in use
                                            </th>
                                            <th>
                                                <button class="button is-info" v-on:click="showRuntimeInfo(owner, runtime, version)">
                                                    <i class="fa fa-info" aria-hidden="true" />
                                                </button>
                                                <button class="button is-danger" v-if="owner===user" v-on:click="deleteRuntime(owner, runtime, version)">
                                                    <i class="fa fa-trash" aria-hidden="true"></i>
                                                </button>
                                            </th>
                                        </tr>
                                    </table>
                                </collapse-item>
                            </collapse>
                        </collapse-item>
                    </collapse>
                </div>
            </collapse-item>
        </collapse>
        <div v-else>
            no elements found
        </div>
        <delete v-bind:visible="deleteIsVisible" v-bind:elementType="modalElementType" v-bind:elementId="modalElementId" v-bind:elementName="modalElementName" v-bind:elementVersion="modalElementVersion" v-on:close="deleteIsVisible=false"></delete>
        <info v-bind:visible="infoIsVisible" v-bind:elementId="modalElementId" v-bind:elementName="modalElementName" v-bind:elementVersion="modalElementVersion" v-on:close="infoIsVisible=false"></info>
        <delete-group v-bind:visible="deleteGroupIsVisible" v-bind:elementList="modalElementList" v-on:close="deleteGroupIsVisible=false"></delete-group>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Delete from './innerComponents/modal/Delete.vue';
import DeleteGroup from './innerComponents/modal/DeleteGroup.vue';
import Info from './innerComponents/modal/Info.vue';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import { FabElement } from '../../store/classes';
import CheckboxInput from './innerComponents/input/CheckboxInput.vue';

@Component({
    name: 'Elements',
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'delete': Delete,
        'delete-group': DeleteGroup,
        'info': Info,
        'checkbox-input': CheckboxInput
    }
})
export default class Elements extends Vue {
    showPublicElements: boolean = true;
    selectedComponents = [];
    selectedServices = [];
    selectedRuntimes = [];
    search: string = null;

    // Modal Arguments
    deleteIsVisible: boolean = false;
    deleteGroupIsVisible: boolean = false;
    infoIsVisible: boolean = false;
    modalElementType: string = '';
    modalElementId: string = '';
    modalElementName: string = '';
    modalElementVersion: string = '';
    // id, tipo, elemento, version
    modalElementList: Array<[string, string, string, string]> = [];

    created() {
        this.$store.dispatch('getDeploymentList');
    }
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        fabElementsList.push(new FabElement('Upload bundle', 'newBundle'));
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    get user() {
        return this.$store.getters.getUser;
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
        return this.$store.getters.getComponentOwnerList(this.showPublicElements, this.search);
    }
    get ownerComponentList() {
        return (owner) => {
            return this.$store.getters.getOwnerComponentList(owner, this.search);
        }
    }
    get componentVersionList() {
        return (owner, component) => {
            return this.$store.getters.getComponentVersionList(owner, component, this.search);
        }
    }
    get serviceOwnerList() {
        return this.$store.getters.getServiceOwnerList(this.showPublicElements, this.search);
    }
    get ownerServiceList() {
        return (owner) => {
            return this.$store.getters.getOwnerServiceList(owner, this.search);
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
    get getComponentUsedBy() {
        return (owner, component, version) => {
            return this.$store.getters.getComponentUsedBy(this.getComponentId(owner, component, version));
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
    get getServiceUsedBy() {
        return (owner, service, version) => {
            return this.$store.getters.getServiceUsedBy(this.getServiceId(owner, service, version));
        };
    }
    get getServiceOwner() {
        return (serviceId) => {
            return this.$store.getters.getServiceOwner(serviceId);
        };
    }
    get runtimeOwnerList() {
        return this.$store.getters.getRuntimeOwnerList(this.showPublicElements, this.search);
    }
    get ownerRuntimeList() {
        return (owner) => {
            return this.$store.getters.getOwnerRuntimeList(owner, this.search);
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
    get getRuntimeUsedBy() {
        return (owner, runtime, version) => {
            return this.$store.getters.getRuntimeUsedBy(this.getRuntimeId(owner, runtime, version));
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
    deleteElement(elementType, elementId, elementName, elementVersion) {
        this.deleteIsVisible = true;
        this.modalElementType = elementType;
        this.modalElementId = elementId;
        this.modalElementName = elementName;
        this.modalElementVersion = elementVersion;
    }
    deleteRuntime(owner, runtime, version) {
        this.deleteElement('runtime', this.getRuntimeId(owner, runtime, version), runtime, version);
    }
    deleteService(owner, service, version) {
        this.deleteElement('service', this.getServiceId(owner, service, version), service, version);
    }
    deleteComponent(owner, component, version) {
        this.deleteElement('component', this.getComponentId(owner, component, version), component, version);
    }
    showElementInfo(elementId, elementName, version) {
        this.infoIsVisible = true;
        this.modalElementId = elementId;
        this.modalElementName = elementName;
        this.modalElementVersion = version;
    }
    showRuntimeInfo(owner, runtime, version) {
        this.showElementInfo(this.getRuntimeId(owner, runtime, version), runtime, version);
    }
    showServiceInfo(owner, service, version) {
        this.showElementInfo(this.getServiceId(owner, service, version), service, version);
    }
    showComponentInfo(owner, component, version) {
        this.showElementInfo(this.getComponentId(owner, component, version), component, version);
    }
    selectedService(serviceId) {
        this.$store.dispatch('selectedService', serviceId);
    }
    downloadManifest() {
        this.$store.dispatch('downloadManifest', this.selectedComponents.concat(this.selectedServices).concat(this.selectedRuntimes));
    }
    deleteSelected() {
        this.modalElementList = [];
        // id, tipo, elemento, version
        for (let index in this.selectedComponents) {
            this.modalElementList.push([
                this.selectedComponents[index],
                'component',
                this.$store.getters.getComponentName(this.selectedComponents[index]),
                this.$store.getters.getComponentVersion(this.selectedComponents[index])
            ]);
        }
        for (let index in this.selectedServices) {
            this.modalElementList.push([
                this.selectedServices[index],
                'service',
                this.$store.getters.getServiceName(this.selectedServices[index]),
                this.$store.getters.getServiceVersion(this.selectedServices[index])
            ]);
        }

        for (let index in this.selectedRuntimes) {
            this.modalElementList.push([
                this.selectedRuntimes[index],
                'runtime',
                this.$store.getters.getRuntimeName(this.selectedRuntimes[index]),
                this.$store.getters.getRuntimeVersion(this.selectedRuntimes[index])
            ]);
        }

        this.deleteGroupIsVisible = true;
    }
}
</script>