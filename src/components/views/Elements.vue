<template>
    <div>
        <div class="tile">
            <span class="control has-icon tile is-4">
                <input class="input" placeholder="Search" v-model="search">
                <span class="icon is-small">
                    <i class="fa fa-search"></i>
                </span>
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
                <div v-for="owner in componentOwnerList" v-if="ownerComponentList(owner).length>0 && (showPublicElements || owner === user)">
                    <collapse accordion is-fullwidth>
                        <collapse-item v-bind:title="owner">
                            <div v-for="component in ownerComponentList(owner)" v-if="componentVersionList(owner,component).length>0">
                                <collapse accordion is-fullwidth>
                                    <collapse-item v-bind:title="component" v-on:open="loadInfo('component', owner, component)">
                                        <table>
                                            <tr v-for="version in componentVersionList(owner, component)">
                                                <th>{{version}}</th>
                                                <th>
                                                    <div v-if="getIsComponentInUse(owner, component, version)">
                                                        <div>
                                                            <span class="ON_PROGRESS">in use by service/s:</span>
                                                        </div>
                                                        <div v-for="usedBy in getComponentUsedBy(owner, component, version)">{{usedBy}} </div>
                                                    </div>
                                                </th>
                                                <th>
                                                    <button class="button is-info" v-on:click="showComponentInfo(owner, component, version)">
                                                        <i class="fa fa-info" aria-hidden="true" />
                                                    </button>
                                                    <button class="button is-danger" v-if="owner===user" v-on:click="deleteComponent(owner, component, version)">
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
                                    <collapse-item v-bind:title="service" v-if="serviceVersionList(owner,service).length>0" v-on:open="loadInfo('service', owner, service)">
                                        <table>
                                            <tr v-for="version in serviceVersionList(owner, service)">
                                                <th>{{version}}</th>
                                                <th v-if="getIsServiceInUse(owner, service, version)">
                                                    <div>
                                                        <span class="ON_PROGRESS">in use by deployment/s:</span>
                                                    </div>
                                                    <div v-for="usedBy in getServiceUsedBy(owner, service, version)">{{usedBy}}</div>
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
                                                    <router-link v-else v-bind:to="'newWebServiceAdvanced'">
                                                        <button class="button is-primary" v-on:click="selectedService(getServiceId(owner, service, version))">
                                                            <i class="fa fa-play" aria-hidden="true"></i>
                                                        </button>
                                                    </router-link>
                                                    
                                                    <button class="button is-danger" v-if="owner===user" v-on:click="deleteService(owner, service, version)">
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
                                    <collapse-item v-bind:title="runtime" v-if="runtimeVersionList(owner, runtime).length>0" v-on:open="loadInfo('runtime', owner, runtime)">
                                        <table>
                                            <tr v-for="version in runtimeVersionList(owner, runtime)">
                                                <th>{{version}}</th>
                                                <th v-if="getIsRuntimeInUse(owner, runtime, version)">
                                                    <div>
                                                        <span class="ON_PROGRESS">in use by component/s:</span>
                                                    </div>
                                                    <div v-for="usedBy in getRuntimeUsedBy(owner, runtime, version)">{{usedBy}} </div>
                                                </th>
                                                <th>
                                                    <button class="button is-info" v-on:click="showRuntimeInfo(owner, runtime, version)">
                                                        <i class="fa fa-info" aria-hidden="true" />
                                                    </button>
                                                    <button class="button is-danger" v-if="owner===user" v-on:click="deleteRuntime(owner, runtime, version)">
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

@Component({
    name: 'Elements',
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'delete': Delete,
        'delete-group': DeleteGroup,
        'info': Info
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

    created(){
        this.$store.dispatch('getElementList');
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
            let res = this.$store.getters.getComponentId(owner, component, version);
            console.log('La id del componente es: ',res);
            return res;
        }
    }

    get componentOwnerList() {
        let res = this.$store.getters.getComponentOwnerList(this.showPublicElements, this.search);
        console.log('componentOwnerList: ', res);
        return res;
    }

    get ownerComponentList() {
        return (owner) => {
            let res = this.$store.getters.getOwnerComponentList(owner, this.search);
            console.log('ownerComponentList', res);
            return res;
        }
    }

    get componentVersionList() {
        return (owner, component) => {
            let res = this.$store.getters.getComponentVersionList(owner, component, this.search);
            console.log('componentVersionList', res);
            return res;
        }
    }

    get serviceOwnerList() {
        let res = this.$store.getters.getServiceOwnerList(this.showPublicElements, this.search);
        console.log('serviceOwnerList', res);
        return res;
    }

    get ownerServiceList() {
        return (owner) => {
            let res = this.$store.getters.getOwnerServiceList(owner, this.search);
            console.log('ownerServiceList', res);
            return res;
        }
    }

    get selectedServiceIsInbound() {
        return (serviceId) => {
            let res = this.$store.getters.getServiceIsEntryPoint(serviceId);
            console.log('serlectedServiceIsInbound', res);
            return res;
        }
    }

    get serviceVersionList() {
        return (owner, service) => {
            let res = this.$store.getters.getServiceVersionList(owner, service, this.search);
            console.log('serviceVersionList',res);
            return res;
        }
    }
    get getIsComponentInUse() {
        return (owner, component, version) => {
            let res = this.$store.getters.getIsComponentInUse(this.getComponentId(owner, component, version));
            console.log('getIsComponentInUse', res);
            return res;
        }
    }

    get getComponentUsedBy() {
        return (owner, component, version) => {
            let res =this.$store.getters.getComponentUsedBy(this.getComponentId(owner, component, version));
            console.log('getComponentUsedBy', res);
            return res;
        }
    }

    get getComponentOwner() {
        return (componentId) => {
            let res = this.$store.getters.getComponentOwner(componentId);
            console.log('getComponentOwner', res);
            return res;
        }
    }

    get getServiceName() {
        return (serviceId) => {
            let res = this.$store.getters.getServiceName(serviceId);
            console.log('getServiceName', res);
            return res;
        };
    }

    get getServiceVersion() {
        return (serviceId) => {
            let res = this.$store.getters.getServiceVersion(serviceId);
            console.log('getServiceVersion', res);
            return res;
        };
    }
    get getServiceId() {
        return (owner, service, version) => {
            let res = this.$store.getters.getServiceId(owner, service, version);
            console.log('getServiceId', res);
            return res;
        }
    }
    get getIsServiceInUse() {
        return (owner, service, version) => {
            let res = this.$store.getters.getIsServiceInUse(this.getServiceId(owner, service, version));
            console.log('getIsServiceInUse', res);
            return res;
        };
    }
    get getServiceUsedBy() {
        return (owner, service, version) => {
            let res = this.$store.getters.getServiceUsedBy(this.getServiceId(owner, service, version));
            console.log('getServiceUsedBy', res);
            return res;
        };
    }
    get getServiceOwner() {
        return (serviceId) => {
            let res = this.$store.getters.getServiceOwner(serviceId);
            console.log('getServiceOwner', res);
            return res;
        };
    }

    get runtimeOwnerList() {
        let res = this.$store.getters.getRuntimeOwnerList(this.showPublicElements, this.search);
        console.log('runimeOwnerList', res);
        return res;
    }

    get ownerRuntimeList() {
        return (owner) => {
            let res = this.$store.getters.getOwnerRuntimeList(owner, this.search);
            console.log('ownerRuntimeList', res);
            return res;
        }
    }
    get getRuntimeVersion() {
        return (runtimeId) => {
            let res = this.$store.getters.getRuntimeVersion(runtimeId);
            console.log('getRuntimeVersion', res);
            return res;
        }
    }

    get getRuntimeId() {
        return (owner, runtime, version) => {
            let res = this.$store.getters.getRuntimeId(owner, runtime, version);
            console.log('getRuntimeId', res);
            return res;
        }
    }

    get getIsRuntimeInUse() {
        return (owner, runtime, version) => {
            let res = this.$store.getters.getIsRuntimeInUse(this.getRuntimeId(owner, runtime, version));
            console.log('getIsRuntimeInUse', res);
            return res;
        }
    }
    get getRuntimeUsedBy() {
        return (owner, runtime, version) => {
            let res = this.$store.getters.getRuntimeUsedBy(this.getRuntimeId(owner, runtime, version));
            console.log('getRuntimeUsedBy', res);
            return res;
        }
    }
    get getRuntimeOwner() {
        return (runtimeId) => {
            let res = this.$store.getters.getRuntimeOwner(runtimeId);
            console.log('getRuntimeOwner', res);
            return res;
        };
    }
    get runtimeVersionList() {
        return (owner, runtime) => {
            let res = this.$store.getters.getRuntimeVersionList(owner, runtime, this.search);
            console.log('runtimeVersionList', res);
            return res;
        }
    }

    loadInfo(type, owner, element){
        if(this.$store.getters.getNeedElementInfo(type, owner, element)){
            console.log('Se necesita información del componente: ', type, owner, element);
            this.$store.dispatch('loadElementInfo', {type, owner, element});
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