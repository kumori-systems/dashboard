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
                <p v-for="component in componentList" v-bind:key="component">{{component}}
                    <button class="button">
                        <i class="fa fa-info" aria-hidden="true" />
                    </button>
                    <button class="button"><i class="fa fa-trash" aria-hidden="true"></i></button>
                    <input type="checkbox" id="selected">
                </p>
            </collapse-item>
            <collapse-item title="Services">
                <p v-for="serviceId in serviceList" v-bind:key="serviceId">
                    <span>{{getServiceName(serviceId)}}</span>
                    <span>{{getServiceVersion(serviceId)}}</span>
                    <span v-if="getIsServiceInUse(serviceId)"> in use </span>
                    <span>{{getServiceOwner(serviceId)}}</span>
                    <button class="button">
                        <i class="fa fa-info" aria-hidden="true" />
                    </button>
                    <button class="button"><i class="fa fa-trash" aria-hidden="true"></i></button>
                    <button class="button"><i class="fa fa-play" aria-hidden="true"></i></button>
                    <input type="checkbox" id="selected">
                </p>
            </collapse-item>
            <collapse-item title="Runtimes">
                <p v-for="runtime in runtimeList" v-bind:key="runtime">{{runtime}}
                    <button class="button">
                        <i class="fa fa-info" aria-hidden="true" />
                    </button>
                    <button class="button"><i class="fa fa-trash" aria-hidden="true"></i></button>
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
}
</script>
<style lang="scss">

</style>