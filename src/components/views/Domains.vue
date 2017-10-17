<template>
    <div>
        <table class="table">

            <tr v-for="(domain, domainId) in domainList" v-bind:key="domainId">
                <th>
                    <a v-if="domain" v-bind:href="'http://'+domain.domain">
                        {{ domain.domain }}
                    </a>
                </th>
                <th>
                    <i v-if="domain" v-bind:class="domain.state" aria-hidden="true"></i>
                </th>
                <th>
                    <span v-if="domain && domain.inUse > 0 ">
                        <span class="WARNING">in use</span> by {{ domain.inUseBy }}
                    </span>
                    <span v-else>
                        not in use
                    </span>
                </th>
                <th>
                    <button class="button is-danger" v-on:click="deleteDomain(domainId)">
                        <i v-if="domain" class="fa fa-trash" aria-hidden="true"></i>
                    </button>
                </th>
            </tr>
        </table>
        <delete-modal v-bind:visible="deleteModalIsVisible" v-bind:elementType="'domain'" v-bind:elementId="modalElementId" v-bind:elementName="modalElementName" v-bind:elementVersion="''" v-on:close="deleteModalIsVisible=false">
        </delete-modal>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { FabElement, Domain } from '../../store/classes';
import DeleteModal from './innerComponents/modal/DeleteModal.vue';
import { getElementName, getElementOwner, getElementType, getElementVersion } from '../../store/proxy/utils';
@Component({
    name: 'Domains',
    components: {
        'delete-modal': DeleteModal,
    }
})
export default class Domains extends Vue {
    // Modal Arguments
    deleteModalIsVisible: boolean = false;
    modalElementId: string = '';
    modalElementName: string = '';

    mounted() {
        let fabElementsList: Array<FabElement> = [];
        fabElementsList.push(new FabElement('Add new domain', '/newDomain'));
        this.$store.dispatch('setFabElements', { fabElementsList: fabElementsList });

    }

    get domainList(): { [resourceId: string]: Domain } {
        let domainList = this.$store.getters.domainList;
        for (let domainId in domainList) {
            this.$store.dispatch('getElementInfo', { 'uri': domainId });
        }
        return domainList;
    }

    deleteDomain(domainURI) {
        console.log('Llamamos a deleteDomain');
        this.modalElementId = domainURI;
        this.modalElementName = domainURI;
        this.deleteModalIsVisible = true;
    }

}
</script>
<style lang="scss" scoped>
$color_green:#93c47d;
$color_yellow:#f5d164;
$color_red:#ff6666;
$icon_size: 20px;

.fa-check-circle {
    color: $color_green;
    font-size: $icon_size;
}

.fa-exclamation-triangle {
    color: $color_yellow;
    font-size: $icon_size;
}

.fa-exclamation-circle {
    color: $color_red;
    font-size: $icon_size;
}
</style>