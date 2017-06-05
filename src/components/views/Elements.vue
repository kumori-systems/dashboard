<template>
    <div>
        <div class="tile">
            <span class="control has-icon">
                <input class="input" placeholder="Search">
                <span class="icon is-small">
                    <i class="fa fa-search"></i>
                </span>
            </span>
            <button class="button">Download manifest</button>
            <button class="button">Delete</button>
        </div>
        <p>
            <input type="checkbox" id="showpublic3rdpartyelements">
            <label for="showpublic3rdpartyelements">Show public 3rd party elements</label>
        </p>
        <collapse>
            <collapse-item title="Components">
                <p v-for="componentId in componentList" v-bind:key="componentId">
                    {{componentId}} {{getComponentVersion(componentId)}} {{getComponentOwner(componentId)}}
                    <span class="ON_PROGRESS" v-if="getIsComponentInUse(componentId)"> in use </span>
                    <button class="button">
                        <i class="fa fa-info" aria-hidden="true" />
                    </button>
                    <button class="button" v-on:click="deleteElement(componentId)">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                    </button>
                    <input type="checkbox" id="selected">
                </p>
            </collapse-item>
            <collapse-item title="Services">
                <p v-for="serviceId in serviceList" v-bind:key="serviceId">
                    <span>{{getServiceName(serviceId)}}</span>
                    <span>{{getServiceVersion(serviceId)}}</span>
                    <span class="ON_PROGRESS" v-if="getIsServiceInUse(serviceId)"> in use </span>
                    <span>{{getServiceOwner(serviceId)}}</span>
                    <button class="button">
                        <i class="fa fa-info" aria-hidden="true" />
                    </button>
                    <button class="button" v-on:click="deleteElement(serviceId)">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                    </button>
    
                    <router-link v-if="selectedServiceIsInbound(serviceId)" v-bind:to="'newHTTPEntrypoint'">
                        <button class="button" v-on:click="selectedService(serviceId)">
                            <i class="fa fa-play" aria-hidden="true"></i>
                        </button>
                    </router-link><router-link v-else v-bind:to="'newWebServiceAdvanced'">
                        <button class="button" v-on:click="selectedService(serviceId)">
                            <i class="fa fa-play" aria-hidden="true"></i>
                        </button>
                    </router-link>
    
                    <input type="checkbox" id="selected">
                </p>
            </collapse-item>
            <collapse-item title="Runtimes">
                <p v-for="runtimeId in runtimeList" v-bind:key="runtimeId">
                    {{runtimeId}} {{getRuntimeVersion(runtimeId)}}
                    <span class="ON_PROGRESS" v-if="getIsRuntimeInUse(runtimeId)"> in use </span>
                    {{getRuntimeOwner(runtimeId)}}
                    <button class="button">
                        <i class="fa fa-info" aria-hidden="true" />
                    </button>
                    <button class="button" v-on:click="deleteElement(runtimeId)">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                    </button>
                    <input type="checkbox" id="selected">
                </p>
            </collapse-item>
        </collapse>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import { FabElement } from '../../store/classes';

@Component({
    name: 'Elements',
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem
    }
})
export default class Elements extends Vue {
    mounted() {
        let fabElementsList: Array<FabElement> = [];
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });
    }
    get componentList() {
        return this.$store.getters.getComponentList;
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
        return (componentId) => {
            return this.$store.getters.getIsComponentInUse(componentId);
        }
    }
    get getComponentOwner() {
        return (componentId) => {
            return this.$store.getters.getComponentOwner(componentId);
        }
    }

    get serviceList() {
        return this.$store.getters.getWebServiceList;
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
        return this.$store.getters.getRuntimeList;
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
        console.log('El servicio que seleccionamos es: ' + serviceId);
        this.$store.dispatch('selectedService', serviceId);
    }

}
</script>