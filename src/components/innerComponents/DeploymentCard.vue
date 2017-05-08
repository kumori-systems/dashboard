<template>
    <div class="card">
        <div class="card-header title" v-bind:class="state">
            <span class="card-header-left">{{shortTitle}}</span>
            <span class="card-header-right">{{longTitle}}</span>
        </div>
        <div class="card-body">
            <p><u>Service:</u> {{service}}</p>
            <div class="roles" v-if="roles">
                <p><u>Roles:</u></p>
                <div v-for="rol, key in roles" class="rol">
                    <span>
                        <strong>{{rol}}</strong><span class="right">{{rolNumInstances(key)}}</span>
                    </span>
                    <p>{{rol.entrypoint.domain}}</p>
                </div>
            </div>
            <p><u>Website:</u> {{website}}</p>
            <p>
                <span>
                <u>Links:</u> {{links}}
                <p>
                    <u>Volumes:</u> {{volumes}}
                    <i class="fa fa-caret-square-o-down" aria-hidden="true"></i>
                </p>
                </span>
                <i class="fa fa-check-circle" aria-hidden="true"></i>
            </p>
        </div>
        <div class="card-footer" v-if="false" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Rol, state as StateType, Deployment } from './../../store/classes';

@Component({
    name: 'deployment-card',
    props: {
        deploymentId: { required: true, type: Deployment }
    }
})
export default class Card extends Vue {
    deploymentId: Deployment = this.deploymentId;
    // Computed
    get state(): string {
        return StateType[this.$store.getters.getDeploymentState(this.deploymentId)];
    };

    get shortTitle(): string {
        return this.$store.getters.getDeploymentShortTitle(this.deploymentId);
    }

    get longTitle(): string {
        return this.$store.getters.getDeploymentLongTitle(this.deploymentId);
    }

    get service(): string {
        return this.$store.getters.getDeploymentService(this.deploymentId);
    }
    get roles() {
        return this.$store.getters.getDeploymentRoles(this.deploymentId);
    }
    get rolNumInstances(): Function {
        return function (rol): number {
            return this.$store.getters.getDeploymentRolNumInstances(this.deploymentId, rol);
        }
    }
    get website(): string {
        return this.$store.getters.getDeploymentWebsite(this.deploymentId);
    }
    get links(): Array<string> {
        return this.$store.getters.getDeploymentLinks(this.deploymentId);
    }

    get volumes(): Array<number> {
        return this.$store.getters.getDeploymentVolumes(this.deploymentId);
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

.rol {
    padding-left: $padding;
}

.card-header-right {
    color: grey;
    padding-left: padding;
}

.fa-check-circle {
    color: #93c47d;
    font-size: 12em;
}

.NORMAL {
    background: #93c47d;
}

.WARNING {
    background: #f5d164;
}

.ERROR {
    background: red;
}
</style>