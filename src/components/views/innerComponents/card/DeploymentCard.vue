<template>
    <div class="card tile is-vertical is-5" id="deployment-card">
        <div class="card-header title" v-bind:class="state">
            <router-link v-bind:to="deployment.path" class="tile title">
                {{ deployment.name || 'unavailable' | truncateLeft(20) }}
                <span class="subtitle">{{ deployment.uri || 'unavailable' | truncateLeft(7) }}</span>
            </router-link>
        </div>
        <div class="card-body">
            <i class="state" v-bind:class="stateIcon" aria-hidden="true"></i>
            <div>
                <u>Service:</u>
                {{ deployment.serviceId || 'unavailable' | truncateLeft(50) }}
            </div>
            <div class="roles">
                <u>Roles:</u>
                <div v-for="(rolContent, rolId) in deployment.roles" v-bind:key="rolId" class="tile">
                    <i id="rol-circle" class="fa-circle fa"></i>
                    <div>
                        <strong>{{ rolId | truncateLeft(30) }}</strong>
                        <div class="rol-component">{{ 'unavailable' | truncateLeft(50) }}</div>
                    </div>
                    <div class="box is-unselectable">
                        {{ rolContent.instanceNumber }}
                    </div>
                </div>
            </div>
            <div class="tile is-horizontal" v-if="deployment.website.length > 0">
                <u>Websites:</u>
                <div v-for="(web, index) in website" v-bind:key="index">
                  <a v-bind:href="'http://' + web">
                    {{ web | truncateLeft(50) }}
                  </a>
                </div>
            </div>
            <div v-if="deployment.links.length > 0">
                <u>Links:</u>
                  <div v-for="(link, index) in deployment.links" v-bind:key="index" class="tile">
                    <i class="fa fa-circle"></i>
                    <div v-if="link.deploymentOne === deployment.uri">
                      {{ deploymentName(link.deploymentTwo) }}
                    </div>
                    <div v-else>
                      {{ deploymentName(link.deploymentOne) }}
                    </div>

                  </div>
            </div>
            <div v-if="false">
              <!--
                <u>Volumes:</u>                
                <div v-for="(volume, index) in volumes" v-bind:key="index" class="tile">
                    <i class="fa fa-circle"></i>
                    <div>{{ volume }}</div>
                </div>
                -->
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Deployment } from "./../../../../store/classes";

@Component({
  name: "deployment-card",
  props: {
    deployment: { required: true }
  },
  filters: {
    truncateRight: function(string, value) {
      return string.substring(0, value) + "...";
    },
    truncateLeft: function(string, value) {
      if (string) {
        if (string.length < value) return string;
        return "..." + string.substring(string.length - value, string.length);
      }
    }
  }
})
export default class DeploymentCard extends Vue {
  deployment: Deployment = this.deployment;
  get state(): string {
    let res: string = "UNKOWN"; // Deployment.Statet.UNKOWN
    if (this.deployment) {
      switch (this.deployment.state) {
        case Deployment.State.OK:
          res = "OK";
          break;
        case Deployment.State.WARNING:
          res = "WARNING";
          break;
        case Deployment.State.DANGER:
          res = "DANGER";
      }
    }

    return res;
  }
  get stateIcon(): string {
    let res: string = "fa ";
    switch (this.deployment.state) {
      case Deployment.State.OK:
        res += "fa-check-circle";
      case Deployment.State.WARNING:
        res += "fa-exclamation-triangle";
      case Deployment.State.DANGER:
        res += "fa-exclamation-circle";
      default:
        // Deployment.Statet.UNKOWN
        res += "fa-question-circle";
    }
    return res;
  }
  get deploymentName() {
    return deploymentId => {
      return this.$store.getters.deployments[deploymentId].name;
    };
  }
}
</script>
<style lang="scss" scoped>
$color_green: #93c47d;
$color_yellow: #f5d164;
$color_red: #ff6666;
$color_grey: lightgrey;

$icon_size: 50px;
$radius: 5px;

.card {
  min-width: 30em;
  margin: 20px;
  padding: 2px;
  border-radius: $radius;
}

.card-header {
  padding: 10px;
  border-radius: $radius;
}

.title {
  color: black;
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
  z-index: 0;
}

.card-body {
  padding: 10px;
}

a {
  padding-left: 10px;
}

#deployment-card {
  min-width: 35em;
}

.OK {
  background-color: $color_green;
}

.WARNING {
  background-color: $color_yellow;
}

.DANGER {
  background-color: $color_red;
}

.UNKOWN {
  background-color: $color_grey;
}

.state {
  position: absolute;
  right: 10px;
  top: 62px;
  font-size: $icon_size;
}

.fa-check-circle {
  color: $color_green;
}

.fa-exclamation-triangle {
  color: $color_yellow;
}

.fa-exclamation-circle {
  color: $color_red;
}

.fa-question-circle {
  color: $color_grey;
}

.fa-hdd-o {
  font-size: 10px;
}

.fa-circle {
  padding: 5px;
}

.rol-component {
  min-width: 25em;
  max-width: 25em;
}
#rol-circle {
  padding: 10px;
}
</style>