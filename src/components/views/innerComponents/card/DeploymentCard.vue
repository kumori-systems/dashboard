<template>
    <div class="card">
        <div class="card-header title" v-bind:class="state">
            {{name}}
            <span class="subtitle">{{shotDeploymentId}}</span>
        </div>
        <div class="card-body">
            <i class="state" v-bind:class="stateIcon" aria-hidden="true" />
    
            <p>
                <u>Service:</u> {{service}}
            </p>
            <div class="roles" v-if="roles">
                <u>Roles:</u>
                <div>
                    <div v-for="rol in roles" class="tile">
                        <i class="fa-circle fa"></i>
                        <div>
                            <strong>{{rol}}</strong>
                            <div>{{rolComponentURN(rol)}}</div>
                        </div>
                        <div class="box">
                            {{rolNumInstances(rol)}}
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="website!=null" class="tile is-horizontal">
                <div>
                    <u>Websites:</u>
                </div>
                <div>
                    <div v-for="web in website">
                        <a v-bind:href="'http://'+web">
                            {{web}}
                        </a>
                    </div>
                </div>
            </div>
            <p v-if="links.length > 0">
                <u>Links:</u>
                <div v-for="link in links" class="tile">
                    <i class="fa fa-circle"></i>
                    <div>
                        <strong>{{link.myChannel}}</strong>
                        <div>
                            Connnected to -> {{link.toDeployment}}
                        </div>
                    </div>
                </div>
            </p>
            <p v-if="volumes.length>0">
                <u>Volumes:</u>
                <div v-for="volume in volumes" class="tile">
                    <i class="fa fa-circle"></i>
                    <div>{{volume}}</div>
                </div>
            </p>
            <router-link v-bind:to="deploymentPath">
                <i class="fa fa-caret-square-o-down" aria-hidden="true" />
            </router-link>
    
        </div>
        <div class="card-footer" v-if="false" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { DeploymentRol, State, Deployment } from './../../../../store/classes';

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
        switch (this.$store.getters.getDeploymentState(this.deploymentId)) {
            case State.CONNECTED:
                return 'CONNECTED';
            case State.DISCONNECTED:
                return 'DISCONNECTED';
            case State.ON_PROGRESS:
                return 'ON_PROGRESS';
            default:
                return '';
        }
    }
    get stateIcon(): string {
        switch (this.state) {
            case 'CONNECTED':
                return 'fa fa-check-circle';
            case 'ON_PROGRESS':
                return 'fa fa-exclamation-triangle';
            case 'DISCONNECTED':
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
<style lang="scss" scoped>
$color_green:#93c47d;
$color_yellow:#f5d164;
$color_red:#ff6666;
$icon_size: 90px;
$radius: 5px;
.state {
    position: absolute;
    right: 10px;
    bottom: 80px;
}

.fa-check-circle {
    color: $color_green;
    font-size: $icon_size;
}

.fa-circle {
    padding: 10px;
}

.fa-exclamation-triangle {
    color: $color_yellow;
    font-size: $icon_size;
}

.fa-exclamation-circle {
    color: $color_red;
    font-size: $icon_size;
}

.fa-caret-square-o-down {
    position: absolute;
    right: 10px;
    bottom: 10px;
    font-size: 60px;
}

.card {
    margin: 10px;
    padding: 2px;
    border-radius: $radius;
}

.card-header {
    padding: 10px;
    border-radius: $radius;
}

.card-header span {
    color: grey;
    position: absolute;
    right: 10px;
    top: 1em;
}

.box {
    margin: 10px;
    background: whitesmoke;
}

.card-body {
    padding: 10px;
}

a {
    padding-left: 10px;
}
</style>
