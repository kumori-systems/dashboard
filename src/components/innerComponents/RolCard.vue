<template>
    <div class="card">
        <div class="card-header title normal" v-bind:class="state">
            <span class="card-header-left">{{rolId}}</span>
            <span class="card-header-right">{{rolNumInstances}}</span>
    
            <!-- Botones para añadir y quitar instancias -->
            <div class="tile">
                <button class="fa fa-angle-up fa-lg" v-on:click="addInstance" />
                <button class="fa fa-angle-down fa-lg" v-on:click="removeInstance" />
            </div>
        </div>
        <div class="card-body">
            <p>Component: {{componentURN}}</p>
            <p>Runtime: {{rolRuntime}}</p>
            <div>
                <button>CPU</button>
                <button>MEM</button>
                <button>RED</button>
            </div>
            <p>Connected to: jalsdkfjsdalfsdj</p>
            <div class="tile is-parent is-4">
                <chart v-bind:type="'line'" v-bind:data="rolChartData" v-bind:options="rolChartOptions"></chart>
            </div>
            <collapse>
                <collapse-item title="View instances">
                    <instance-card name="myInstanceName" state="normal" />
                </collapse-item>
            </collapse>
        </div>
        <div class="card-footer" v-if="false"></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Collapse, Item as CollapseItem } from 'vue-bulma-collapse';
import InstanceCard from './InstanceCard.vue';
import Chart from 'vue-bulma-chartjs/src/Chartjs.vue';

@Component({
    name: 'rol-card',
    props: {
        deploymentId: { required: true, type: String },
        rolId: { required: true, type: String }
    },
    components: {
        'collapse': Collapse,
        'collapse-item': CollapseItem,
        'instance-card': InstanceCard,
        'chart': Chart
    }
})
export default class Card extends Vue {
    deploymentId: string = this.deploymentId;
    rolId: string = this.rolId;

    rolChartOptions: any = {
        tooltips: { mode: 'label' },
        title: {
            text: "Hola mundo"
        },
        showLines: true,
        spanGaps: false,
    };

    // Methods
    addInstance = function () {
        console.log('Entramos en addInstance');
        this.$store.dispatch('addInstance', { rol: this.nombre });
        console.log('Después de llamar a la store');
    };
    removeInstance = function () {
        console.log('Entramos en removeInstance');
        this.$store.dispatch('removeInstance', { rol: this.nombre });
    };

    get state() {
        return this.$store.getters.getDeploymentRolState(this.deploymentId, this.rolId);
    }
    get rolNumInstances(): string {
        let numInstances: number = this.$store.getters.getDeploymentRolNumInstances(this.deploymentId, this.rolId);
        let text: string = 'Instances';
        if (numInstances === 1) text = 'Instance';
        return numInstances + ' ' + text;
    }
    get componentURN() {
        return this.$store.getters.getDeploymentRolComponentURN(this.deploymentId, this.rolId);
    }
    get rolRuntime() {
        return this.$store.getters.getDeploymentRolRuntime(this.deploymentId, this.rolId);
    }

    get rolChartData() {
        return this.$store.getters.getDeploymentRolChartData(this.deploymentId, this.rolId);
    }
}
</script>

<style lang="scss">
$padding: 10px;

.card {
    padding: $padding;
    margin: $padding;
}

.title {
    padding: $padding;
}

.card-header-right {
    color: grey;
    padding-left: 10px;
}

.normal {
    background: green;
}

.warning {
    background: yellow;
}

.error {
    background: red;
}
</style>