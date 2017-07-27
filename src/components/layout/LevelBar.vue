<template>
    <nav class="level app-levelbar">
        <h3 class="title is-5">
            <strong>
                <breadcrumb v-bind:list="list"></breadcrumb>
            </strong>
        </h3>
    </nav>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Breadcrumb from 'vue-bulma-breadcrumb/src/Breadcrumb.vue'

@Component({
    name: 'navbar',
    components: {
        'breadcrumb': Breadcrumb
    }
})
export default class NavBar extends Vue {
    get deploymentId(): string {
        return this.$store.getters.getDeploymentIdFromDeploymentRoute(this.$route.path);
    }
    get deploymentName(): string {
        return this.$store.getters.getDeploymentName(this.deploymentId);
    }
    get list(): Array<{ name: string, path: string }> {
        let res: Array<{ name: string, path: string }> = [];
        if (this.$route.path.startsWith('/deployment/')) {
            res.push(this.$store.getters.menuElement('/'));
            res.push({ name: this.deploymentName, path: this.$route.path });
        } else if (this.$route.path.startsWith('/newHTTPEntrypoint')) {
            res.push({ name: 'Add Entrypoint', path: this.$route.path });
        } else if (this.$route.path.startsWith('/newService')) {
            res.push({ name: 'Add Service', path: this.$route.path });
        } else if (this.$route.path.startsWith('/newBundle')) {
            res.push({ name: 'Add Bundle', path: this.$route.path });
        } else if (this.$route.path.startsWith('/newVolume')) {
            res.push({ name: 'Add Volume', path: this.$route.path });
        } else if (this.$route.path.startsWith('/newDomain')) {
            res.push({ name: 'Add Domain', path: this.$route.path });
        } else {
            res.push(this.$store.getters.menuElement(this.$route.path));
        }
        return res;
    }
}
</script>