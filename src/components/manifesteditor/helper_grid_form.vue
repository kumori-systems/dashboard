<template>
  <div>
    {{ init() }}
    <div class="row" :updater="updater">
      <div v-for="(hr, index) in  form.headers" :key="index" :class="'col-sm-'+12/form.headers.length" >
        <p><label>{{hr}}</label></p>
      </div>
    </div>
    <div v-for="(row, index) in  form.rows" class="row"  :key="index">
      <div :class="{'form-group':true, 'has-error':validation[row[0].value].err, 'has-feedback':validation[row[0].value].err}">  
        <div v-for="(col, index) in  row" :class="'col-sm-'+12/form.headers.length" :key="index">
          <template v-if="col.type == Settings.inlineForms.valueTypes.text"><p class="rowText">{{col.value}}</p></template>
          <input v-if="col.type ==  Settings.inlineForms.valueTypes.input" class="form-control"  :value="getValue(row, col.value)" :ref="col.ref" @input="fieldChanged(row,col,type)">
        </div>
        <span v-if="validation[row[0].value].err" class="help-block">{{$t('validation.'+validation[row[0].value].msg)}}</span> 
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["data", "type", "validation"],
  data() {
    return {
      elems: {},
      updater: true
    };
  },
  computed: {
    getCurrentRoleResource() {
      return this.$store.getters.getCurrentRoleResource;
    }
  },
  methods: {

    setResource(payload){
      this.$store.dispatch('setResource', payload);
    },

    init() {
      this.Settings = this.$store.state.Settings;
      this.form = this.getCurrentRoleResource;
    },

    fieldChanged(row, col, type) {
      switch (type) {
        case this.Settings.inlineForms.types.resource:
          this.setResource({
            name: row[0].value,
            tag: this.$refs[col.ref][0].value,
            oldTag: col.value,
            type: row[1].fullType
          });
          this.elems[row[0].value] = this.$refs[col.ref][0].value;
          this.updater = !this.updater;
          break;
        default:
          break;
      }
    },

    getValue(row, value) {
      let val = this.elems[row[0].value];

      if (val == undefined) {
        this.elems[row[0].value] = value;
        val = value;
      }

      return val;
    }
    
  }
};
</script>