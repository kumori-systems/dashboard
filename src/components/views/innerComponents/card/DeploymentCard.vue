<template>
    <div class="card" id="deployment-card">
        <div class="card-header title" v-bind:class="state">
            <router-link v-bind:to="deploymentPath" class="tile">
                {{name | truncateLeft(7)}}
                <span class="subtitle">{{shotDeploymentId | truncateLeft(7)}}</span>
            </router-link>

            
        </div>
        <div class="card-body">
            <i class="state" v-bind:class="stateIcon" aria-hidden="true" />
            <div>
                <u>Service:</u>
                {{service| truncateLeft(50)}}
            </div>
            <div class="roles">
                <u>Roles:</u>
                <div v-if="roles.length > 0">
                    <div v-for="(rol, index) in roles" v-bind:key="index" class="tile">
                        <i class="fa-circle fa"></i>
                        <div>
                            <strong>{{rol| truncateLeft(30)}}</strong>
                            <div class="rol-component">{{rolComponentURN(rol) | truncateLeft(50)}}</div>
                        </div>
                        <div class="box">
                            {{rolNumInstances(rol)}}
                        </div>
                    </div>
                </div>
                <div v-else>
                    <span>No roles found</span>
                </div>
            </div>
            <div class="tile is-horizontal">
                <u>Websites:</u>
                <div v-if="website !== null && website.length>0">
                    <div v-for="(web, index) in website" v-bind:key="index">
                        <a v-bind:href="'http://'+web">
                            {{web | truncateLeft(50)}}
                        </a>
                    </div>
                </div>
                <span v-else>
                    none
                </span>
    
            </div>
            <div>
                <u>Links:</u>
                <div v-if="links !== null && links.length > 0">
                    <div v-for="(link, index) in links" v-bind:key="index" class="tile">
                        <i class="fa fa-circle"></i>
                        <div>
                            <strong>{{link.myChannel}}</strong>
                            <div>
                                Connnected to -> {{link.toDeployment}}
                            </div>
                        </div>
                    </div>
                </div>
                <span v-else>
                    none
                </span>
            </div>
            <div>
                <u>Volumes:</u>
                <div v-if="volumes !== null && volumes.length>0">
                    <div v-for="(volume, index) in volumes" v-bind:key="index" class="tile">
                        <i class="fa fa-circle"></i>
                        <div>{{volume}}</div>
                    </div>
                </div>
                <span v-else>
                    none
                </span>
            </div>
        </div>
        <div class="card-footer" v-if="false" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Deployment } from './../../../../store/classes';

@Component({
    name: 'deployment-card',
    props: {
        deploymentId: { required: true, type: String }
    },
    filters: {
        truncateRight: function (string, value) {
            return string.substring(0, value) + '...';
        },
        truncateLeft: function (string, value) {
            if (string) {
                if (string.length < value) return string;
                return '...' + string.substring(string.length - value, string.length)
            }

        }
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
            case Deployment.Rol.Instance.State.CONNECTED:
                return 'CONNECTED';
            case Deployment.Rol.Instance.State.DISCONNECTED:
                return 'DISCONNECTED';
            case Deployment.Rol.Instance.State.ON_PROGRESS:
                return 'ON_PROGRESS';
            default:
                console.error('DeploymentCard received a non-covered instance state');
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
                console.error('DeploymentCard received a non-covered instance state');
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
#deployment-card {
    min-width: 35em;
}

.rol-component {
    min-width: 25em;
    max-width: 25em;
}

.state {
    position: absolute;
    right: 10px;
    top: 62px;
}

.fa-check-circle {
    color: $color_green;
    font-size: $icon_size;
    z-index: 0;
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
    min-width: 30em;
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
    z-index: 1;
}

.card-body {
    padding: 10px;
}

a {
    padding-left: 10px;
}
</style>