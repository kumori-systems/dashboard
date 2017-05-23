<template>
    <div class="card">
        <div class="card-header title" v-bind:class="state">
            <span class="card-header-left">{{name}}</span>
            <span class="card-header-right">{{shotDeploymentId}}</span>
        </div>
        <div class="card-body">
            <div class="tile">
                <div>
                    <p>
                        <u>Service:</u> {{service}}
                    </p>
                    <p class="roles" v-if="roles">
                        <div><u>Roles:</u>
                            <div v-for="rol in roles" class="inner-content">
                                <strong>{{rol}}</strong> {{rolNumInstances(rol)}}
                                <div>{{rolComponentURN(rol)}}</div>
                            </div>
                        </div>
                    </p>
                    <p>
                        <u>Website:</u> {{website}}
                    </p>
                    <p>
                        <u>Links:</u>
                        <div v-for="link in links" class="inner-content">{{link.connectedTo}}</div>
                    </p>
                    <p>
                        <u>Volumes:</u>
                        <div v-for="volume in volumes" class="inner-content">
                            <div>{{volume}}</div>
                        </div>
                    </p>
                    <router-link :to="deploymentPath">
                        <i class="fa fa-caret-square-o-down" aria-hidden="true"></i>
                    </router-link>
                </div>
                <i v-bind:class="stateIcon" aria-hidden="true"></i>
            </div>
        </div>
        <div class="card-footer" v-if="false" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { DeploymentRol, State, Deployment } from './../../store/classes';

@Component({
    name: 'deployment-card',
    props: {
        deploymentId: { required: true, type: String }
    }
})
export default class Card extends Vue {
    deploymentId: String = this.deploymentId;
    // Computed
    get deploymentPath() {
        return this.$store.getters.getDeploymentPath(this.deploymentId);
    }
    get shotDeploymentId() {
        return this.deploymentId.substring(this.deploymentId.indexOf('/deployments/') + 13, this.deploymentId.length);
    }
    get state(): string {
        return State[this.$store.getters.getDeploymentState(this.deploymentId)];
    }
    get stateIcon(): string {
        console.log('EL ESTADO QUE DEVUELVE ES: ' + this.state);
        switch (this.state) {
            case 'ACTIVE':
                return 'fa fa-check-circle';
            case 'NO_ACTIVE':
                return 'fa fa-exclamation-triangle';
            case 'ON_PROGRESS':
                return 'fa fa-exclamation-circle';
            default:
                return '';
        }
    }

    get name(): string {
        return this.$store.getters.getDeploymentName(this.deploymentId);
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
$padding:10px;
$icon_size:8em;


.card {
    padding: $padding;
    margin: $padding;
}

.title {
    padding: $padding;
}

.card-header-right {
    color: grey;
    padding-left: padding;
}
</style>