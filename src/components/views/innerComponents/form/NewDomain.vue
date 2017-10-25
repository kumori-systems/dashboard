<template>
    <div class="tile is-4">
        <input class="input" v-model="newDomain" placeholder="New domain">
        <button class="button is-primary" v-on:click="addDomain">add</button>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    name: 'AddDomain'
})
export default class AddDomain extends Vue {
    newDomain = null;

    addDomain() {
        if (this.newDomain != null && this.newDomain.length > 0) {
            this.$store.dispatch('addNewDomain', this.newDomain);
            this.$router.push('/domains');
        }
    }
}
</script>