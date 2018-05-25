<template>
  <div class="panel-group" :id="lvl"  :updater="updater">
    <div class="panel panel-default" v-for="(param, index) in listP" v-bind:key="index">
      <div class="panel-heading">
        <h4 class="panel-title">
          <a data-toggle="collapse" :data-parent="'#'+lvl" :href="'#'+lvl+param.name" aria-expanded="false" class="collapsed accordion-toggle "><label>{{param.name}}</label> </a>
        </h4>
      </div>
      <div :id="lvl+param.name" class="panel-collapse collapse" aria-expanded="false" style="height: 0px;">
        <div class="panel-body">
          <collapsegrp  @updated="notifyUpdate" v-if="param.type=='role'" :listP="param.data" :lvl="lvl+param.name"></collapsegrp>
          <div v-if="param.type!='role'"  class="row">
            <div class="col-sm-12">
              <div :class="{'form-group':true, 'has-error':validation[param.role+param.name].err, 'has-feedback':validation[param.role+param.name].err}">
                <div v-if="['list','json', 'vhost'].indexOf(param.type) > -1" class="form-group input-group">
                  <textarea v-model="depParams[param.role+param.name]" class="form-control" rows="3" :ref="param.role+param.name" style=" min-height: 35px; height: 300px; resize: vertical;" @input="emitUpdate({name: param.name, role: param.role, type: param.type})">
                    </textarea>
                  <span class="input-group-addon">{{$t('modals.deployParams.labels.'+param.type)}}</span>
                  <span v-if="param.default" class="input-group-btn">
                    <button class="btn btn-default" type="button" @click="notifyUpdate({name: param.name, role: param.role, type: param.type, value: param.default})" ><i class="fa fa-reply"></i></button>
                  </span>
                </div>
                <div v-if="['number', 'integer', 'string'].indexOf(param.type) > -1" class="form-group input-group">
                  <input class="form-control" type="integer" :ref="param.role+param.name" :value="depParams[param.role+param.name]" @input="emitUpdate({name: param.name, role: param.role, type: param.type})">
                  <span class="input-group-addon">{{$t('modals.deployParams.labels.'+param.type)}}</span>
                  <span v-if="param.default" class="input-group-btn">
                    <button class="btn btn-default" type="button"  @click="notifyUpdate({name: param.name, role: param.role, type: param.type, value: param.default})" title="Set default value" > <i class="fa fa-reply"></i></button>
                  </span>
                </div>
                <div v-if="['boolean'].indexOf(param.type) > -1" >
                  <select  class="form-control" :value="depParams[param.role+param.name]" :ref="param.role+param.name" @change="emitUpdate({name:param.name, role: param.role, type: param.type})">
                    <option>true</option>
                    <option>false</option>
                  </select>
                  <span v-if="param.default" class="input-group-btn">
                    <button class="btn btn-default" type="button"  @click="notifyUpdate({name:param.name, role: param.role, type: param.type, value: param.default})" ><i class="fa fa-reply"></i></button>
                  </span>
                </div>
                <span v-if="validation[param.role+param.name].err" class="help-block">{{$t('validation.'+validation[param.role+param.name].msg)}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["listP", "lvl"],
  data() {
    return {
      timer: null,
      delay: 1500 //milis
    };
  },
  computed: {
    depParams() {
      return this.$store.state.manifesteditor.deploymentState.parameters;
    },
    validation() {
      return this.$store.state.manifesteditor.deploymentState.paramValidation;
    },
    updater() {
      return this.$store.state.manifesteditor.deploymentState.updater;
    }
  },
  methods: {
    emitUpdate(data) {
      var emit = () => {
        let field = this.$refs[data.role + data.name][0];
        data["value"] = field.value;
        this.$emit("updated", data);
      };

      if (["list", "json", "vhost"].indexOf(data.type) > -1) {
        clearTimeout(this.timer);
        this.timer = setTimeout(emit, this.delay);
      } else emit();
    },
    notifyUpdate(data) {
      this.$emit("updated", data);
    }
  }
};
</script>
<!--
  There is a bug in which relative css paths are not correctly solved
  https://github.com/vuejs-templates/webpack/issues/932
-->
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>