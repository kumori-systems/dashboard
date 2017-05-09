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
                <div v-for="rol in roles" class="rol">
                    <span><strong>{{rol}}</strong></span>
                    <p>{{rolComponentURN(rol)}} {{rolNumInstances(rol)}}</p>
                </div>
            </div>
            <p><u>Website:</u> {{website}}</p>
            <u>Links:</u>
            <div v-for="link in links">{{link}}</div>
            <u>Volumes:</u>
            <div v-for="volume in volumes" class="volume">
                <p>{{volume}}</p>
            </div>
            <i class="fa fa-check-circle" aria-hidden="true"></i>
    
            <router-link :to="'deployments/'+shortTitle + '/deployments/'+longTitle">
                <i class="fa fa-caret-square-o-down" aria-hidden="true"></i>
            </router-link>
    
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
        deploymentId: { required: true, type: String }
    }
})
export default class Card extends Vue {
    deploymentId: String = this.deploymentId;
    // Computed
    get state(): string {
        return StateType[this.$store.getters.getDeploymentState(this.deploymentId)];
    }

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

    get rolComponentURN(): Function {
        return function (rolId): string {
            return this.$store.getters.getDeploymentRolComponentURN(this.deploymentId, rolId);
        }
    }

    get rolNumInstances(): Function {
        return function (rolId): number {
            return this.$store.getters.getDeploymentRolNumInstances(this.deploymentId, rolId);
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

.fa-caret-square-o-down {
    font-size: 8em;
}

.fa-check-circle {
    color: #93c47d;
    font-size: 8em;
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