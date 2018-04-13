<template>
  <div :class="'modal-content content'+'xl'" heith="100">
    <div class="modal-header">
      <button type="button" class="close" data-dismiss="modal">&times;</button>
      <h4 class="modal-title"> <i :class="modalProp.icon"></i> {{ modalProp.title }} </h4>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-sm-3">
          <div class="panel panel-default">
            <div class="panel-heading text-center"> {{ $t('modals.connectors.labels.cons')}} </div>
              <div class="row addNewOnTop">
                <div class="col-sm-12">
                  <div class="form-group input-group">
                    <select id="componentsList" class="form-control" value="" ref ="connector">
                      <optgroup :label="$t('modals.connectors.labels.chconn')">
                        <option v-for="(connector, i) in getSettings.manifestStructure.elementtype.connector.enum"  v-bind:key="i" :value="connector.eslap">{{connector.name}}</option>
                      </optgroup>
                    </select>
                    <span class="input-group-btn">
                      <button class="btn btn-default" type="button" @click="addNewConnector()"><i class="blue fa fa-plus"></i></button>
                    </span>
                  </div>
                </div>
              </div>
              <div class="panel-body hlimited" >
                  <rowlist v-bind:list="getConnectors"  v-bind:type="getSettings.listTypes.connector"> </rowlist>
              </div>
            </div>   
          </div>
          <div class="col-sm-9">
            <div class="col-sm-6">
              <div class="panel panel-default">
                <div class="panel-heading text-center">  {{ $t('modals.connectors.labels.prov')}}  </div>
                <div class="row addNewOnTop">
                  <div class="col-sm-12">
                    <div class="form-group input-group">
                      <search @reset="(data)=>{manageReset('provided',data)}" @update="(data)=>{setCurrent('provided',data)}" :reset="reset.provided" :disabled="getCurrentConnector==-1" :suggestions="getAllConnProvided"></search>
                      <span class="input-group-btn">
                        <button class="btn btn-default" @click="makeConnection('provided')" type="button"><i class="blue fa fa-plus"></i></button>
                      </span>
                    </div>
                  </div>
              </div>
              <div class="panel-body hlimited" >
                <rowlist v-bind:list="getCurrConnProvided"  v-bind:type="getSettings.listTypes.connectorList.provided"> </rowlist>
              </div>
            </div>   
          </div>
          <div class="col-sm-6">
            <div class="panel panel-default">
              <div class="panel-heading text-center">  {{ $t('modals.connectors.labels.dep')}}  </div>
              <div class="row addNewOnTop">
                <div class="col-sm-12">
                  <div class="form-group input-group">
                    <search @reset="(data)=>{manageReset('depended',data)}" @update="(data)=>{setCurrent('depended',data)}" :reset="reset.depended" :disabled="getCurrentConnector==-1" :suggestions="getAllConnDepended"></search>
                    <span class="input-group-btn">
                      <button class="btn btn-default" @click="makeConnection('depended')" type="button"><i class=" blue fa fa-plus"></i></button>
                    </span>
                  </div>
                </div>
              </div>
              <div class="panel-body hlimited" >
                <rowlist v-bind:list="getCurrConnDepended"  v-bind:type="getSettings.listTypes.connectorList.depended"> </rowlist>
              </div>
            </div>   
          </div>
        </div>
      </div> 
      <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">  <i class="fa fa-times"></i> {{$t('panel.buttons.close')}}</button>
      </div>
    </div>
  </div>
</template>
<script>
import search from "./helper_search.vue";
import RowList from "./helper_list.vue";
import Modal from "./helper_modal.vue";
export default {
  components: {
    search: search,
    modal: Modal,
    rowlist: RowList
  },
  props: ["roles"],
  data() {
    return {
      current: {
        provided: "",
        depended: ""
      },
      reset: {
        provided: false,
        depended: false
      }
    };
  },

  computed: {
    getConnectors() {
      return this.$store.getters.getConnectors;
    },

    getSettings() {
      return this.$store.getters.getSettings;
    },

    getCurrentConnector() {
      return this.$store.getters.getCurrentConnector;
    },

    getCurrConnDepended() {
      return this.$store.getters.getCurrConnDepended;
    },

    getCurrConnProvided() {
      return this.$store.getters.getCurrConnProvided;
    },

    getAllConnProvided() {
      return this.$store.getters.getAllConnProvided;
    },

    getAllConnDepended() {
      return this.$store.getters.getAllConnDepended;
    },

    modalProp() {
      return this.getSettings.modalProps.connectors;
    }
  },
  methods: {
    addConnector() {
      this.$store.dispatch("addConnector", payload);
    },

    addConnection() {
      this.$store.dispatch("addConnection", payload);
    },

    setCurrent(direction, data) {
      this.current[direction] = data;
    },

    makeConnection(direction) {
      if (this.current[direction] != "") {
        let element = {};
        if (this.current[direction].role)
          element["role"] = this.current[direction].role;
        element["endpoint"] = this.current[direction].endpoint;
        this.addConnection({ element: element, direction: direction });
        this.current[direction] = "";
        this.reset[direction] = true;
      }
    },

    manageReset(direction, value) {
      this.reset[direction] = value;
    },

    addNewConnector() {
      if (this.$refs.connector.value.length > 0)
        this.addConnector({
          type: this.$refs.connector.value,
          depended: [],
          provided: []
        });
    }
  }
};
</script>