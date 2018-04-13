<template>
  <!-- <div> -->
    <v-expansion-panel>
      <v-expansion-panel-content v-for="(option, index) in menuOptions" v-bind:key="index"
        @click="updateActive(option.name, $event)">

        <div slot="header"
          v-on:click="option.clear? cleanCurrent(option.target): null"
          v-bind:data-toggle="option.target ? 'modal':''"
          v-bind:data-target="option.target ? option.target : ''"
        >{{ $t(option.name) }}</div>

        <v-container fluid>
          <ul v-if="option.secondLevel || option.id === 'service' "
            v-bind:id="option.name" aria-expanded="false">
            <li v-if="option.id === 'service'">
              <label>{{ $t('menu.service.form.domain') }}</label>
              <div>
                  <input :disabled="blockEditName" class="form-control"
                    @input="updateName('domain')" ref="domain"
                    v-bind:value="servName.domain">
                  <span v-if="validation.domain.err"></span>
                  <span v-if="validation.domain.err">
                    {{ $t('validation.'+validation.domain.msg) }}
                  </span>
              </div>
              <label>{{ $t('menu.service.form.name') }}</label>
              <div v-bind:class="{'form-group':true,
                'has-error':validation.name.err,
                'has-feedback':validation.name.err}">
                <input :disabled="blockEditName" class="form-control"
                  @input="updateName('name')" ref="name" :value="servName.name">
                <span class="glyphicon glyphicon-remove form-control-feedback"
                  v-if="validation.name.err"></span>
                <span v-if="validation.name.err" class="help-block">
                  {{ $t('validation.'+validation.name.msg) }}
                </span>
              </div>
              <label>{{$t('menu.service.form.version')}}</label>
              <div v-bind:class="{'form-group':true,
              'has-error':validation.version.err,
              'has-feedback':validation.version.err}">
                <input v-bind:disabled="blockEditName"
                  @input="updateName('version')"
                  v-bind:value="servName.version">
                <span v-if="validation.version.err"></span>
                <span v-if="validation.version.err">
                  {{ $t('validation.'+validation.version.msg) }}
                </span>
              </div>
            </li>
            <li v-if="option.id === 'roles'">
              <!--
              <rowlist v-bind:list="getManifest.roles"
                v-bind:type="getSettings.listTypes.role">
              </rowlist>
              -->
            </li>
            <li v-if="option.id === 'channels'">
              <!--
              <rowlist v-bind:list="getChannels.provides"
                v-bind:type="getSettings.listTypes.channel.provides">
              </rowlist>
              <rowlist v-bind:list="getChannels.requires"
                v-bind:type="getSettings.listTypes.channel.requires">
              </rowlist>
              -->
            </li>
            <li v-for="(secondOpt, index) in option.enum" v-bind:key="index">
              <template v-if="secondOpt.type === 'link'">
                <a id="show-channels" href="#"
                  @click="optLink(secondOpt.action)">
                  {{ $t(secondOpt.id) }}
                </a>
              </template>
              <template v-if="secondOpt.type === 'other'">
                <a id="show-channels" href="#" title="show channels"
                  alt="show channels">
                  {{ $t('menu.uielements.form.show_hide')}}
                </a>
              </template>
            </li>
          </ul>
        </v-container>
      </v-expansion-panel-content>
    </v-expansion-panel>

<!--
  <a>
  <v-icon>{{ option.icon }}</v-icon>
  {{ $t(option.name) }}
  <span v-if="option.secondLevel || option.id === 'service'"></span>
  <i v-bind:id="option.add.id" v-if="option.add && active === option.name"
    class="activator" @click="openAdd(option.add.target, $event)"></i>
  </a>
  <span v-if="option.add" :ref="'simulate-' + option.add.target"
    data-toggle="modal" v-bind:data-target="option.add.target"></span>
-->
<!--
        <ul v-if="option.secondLevel || option.id === 'service' "
          v-bind:id="option.name" class="nav nav-second-level collapse"
          aria-expanded="false" style="height: 0px;"
        >

          <li v-if="option.id === 'service'">
            <label>{{ $t('menu.service.form.domain') }}</label>
            <div v-bind:class="{'form-group':true,
              'has-error':validation.domain.err,
              'has-feedback':validation.domain.err}"
            >
              <input :disabled="blockEditName" class="form-control"
                @input="updateName('domain')" ref="domain"
                v-bind:value="servName.domain"
              >
              <span v-if="validation.domain.err"
                class="glyphicon glyphicon-remove form-control-feedback"
              ></span>
              <span v-if="validation.domain.err" class="help-block">
                {{ $t('validation.'+validation.domain.msg) }}
              </span>
            </div>
            <label class="control-label">
              {{ $t('menu.service.form.name') }}
            </label>
            <div v-bind:class="{'form-group':true,
              'has-error':validation.name.err,
              'has-feedback':validation.name.err}">
              <input :disabled="blockEditName" class="form-control"
                @input="updateName('name')" ref="name" :value="servName.name">
              <span v-if="validation.name.err"
                class="glyphicon glyphicon-remove form-control-feedback"></span>
              <span v-if="validation.name.err" class="help-block">
                {{ $t('validation.'+validation.name.msg) }}
              </span>
            </div>
            <label class="control-label">
              {{$t('menu.service.form.version')}}
            </label>
            <div v-bind:class="{'form-group':true,
              'has-error':validation.version.err,
              'has-feedback':validation.version.err}"
            >
              <input v-bind:disabled="blockEditName"
                @input="updateName('version')"
                v-bind:value="servName.version">
              <span v-if="validation.version.err"></span>
              <span v-if="validation.version.err">
                {{ $t('validation.'+validation.version.msg) }}
              </span>
            </div>
          </li>

          <li v-if="option.id === 'roles'">
            <rowlist v-bind:list="getManifest.roles"
              v-bind:type="getSettings.listTypes.role"
            ></rowlist>
          </li>

          <li v-if="option.id === 'channels'">
            <rowlist v-bind:list="getChannels.provides"
              v-bind:type="getSettings.listTypes.channel.provides"
            ></rowlist>
            <rowlist v-bind:list="getChannels.requires"
              v-bind:type="getSettings.listTypes.channel.requires"
            ></rowlist>
          </li>

          <li  v-for="(secondOpt, index) in option.enum" v-bind:key="index">
            <template v-if="secondOpt.type === 'link'">
              <a id="show-channels" href="#" @click="optLink(secondOpt.action)">
                {{ $t(secondOpt.id) }}
              </a>
            </template>
            <template v-if="secondOpt.type === 'other'">
              <a id="show-channels" href="#" title="show channels"
                alt="show channels">
                {{ $t('menu.uielements.form.show_hide')}}
              </a>
            </template>
          </li>
          
        </ul>

      </li>
      
    </ul>

    -->

    <!--
    <modal :modalProp="getSettings.modalProps.roles" modalSize="xs">
      <modalRoles slot="body"></modalRoles>
    </modal>

    <modal :modalProp="getSettings.modalProps.channels" modalSize="xs">
      <modalChannels slot="body"></modalChannels>
    </modal>

    <modal :modalProp="getSettings.modalProps.connectors" modalSize="xl">
      <modalConnectors slot="body"></modalConnectors>
    </modal>  
  </div>
  -->
</template>
<script>
import ModalRoles from "./_modal_roles.vue";
import ModalChannels from "./_modal_channels.vue";
import ModalConnectors from "./_modal_connectors.vue";

export default {
  components: {
    modalRoles: ModalRoles,
    modalChannels: ModalChannels,
    modalConnectors: ModalConnectors
  },
  data() {
    return {
      active: "",
      delay: 300,
      clicks: 0,
      timer: null
    };
  },
  computed: {
    getManifest() {
      return this.$store.getters.getManifest;
    },
    getChannels() {
      return this.$store.getters.getChannels;
    },
    getSettings() {
      return this.$store.getters.getSettings;
    },
    menuOptions() {
      return this.$store.getters.menuOptions;
    },
    getCurrentRoleIndex() {
      return this.$store.getters.getCurrentRoleIndex;
    },
    blockEditName() {
      return this.$store.getters.blockEditName;
    },
    validation() {
      return this.$store.getters.validation;
    },
    servName() {
      return this.$store.getters.servName;
    },
    updater() {
      return this.$store.getters.updater;
    }
  },
  methods: {
    cleanCurrent(payload) {
      this.$store.dispatch("cleanCurrent", payload);
    },

    updateServiceName(payload) {
      this.$store.dispatch("updateServiceName", payload);
    },

    updateServState(payload) {
      this.$store.dispatch("updateServState", payload);
    },

    resetService(payload) {
      this.$store.dispatch("resetService", payload);
    },

    optLink(action) {
      this[action]();
    },

    updateName(prop) {
      this.$refs.version[0].value.replace("/", "");
      this.$refs.domain[0].value.replace("/", "");
      this.$refs.name[0].value = this.$refs.name[0].value.replace("/", "");

      this.updateServState({ key: prop, value: this.$refs[prop][0].value });
      let fullName = {
        domain: this.$refs.domain[0].value,
        name: this.$refs.name[0].value,
        version: this.$refs.version[0].value
      };
      this.updateServiceName(fullName);
    },

    openAdd(target, event) {
      if (event.stopPropagation) {
        event.stopPropagation();
      }
      event.cancelBubble = true;
      this.cleanCurrent(target);
      this.$refs["simulate-" + target][0].click();
    },

    updateActive(name, event) {
      this.clicks++;
      if (this.clicks == 1) {
        this.activeList(name, event);
        setTimeout(() => {
          this.clicks = 0;
        }, 400);
      }
    },

    activeList(name, event) {
      let nameFilter = name.replace(/(:|\.|\[|\])/g, "\\$1");
      let activeFilter = this.active.replace(/(:|\.|\[|\])/g, "\\$1");
      if (event.target.classList.contains("activator") && this.active == name) {
        $("#" + nameFilter).collapse("hide");
        this.active = "";
      } else if (this.active != name) {
        if (this.active.length > 0) $("#" + activeFilter).collapse("hide");
        this.active = name;
        $("#" + nameFilter).collapse("show");
      }
    }
  }
};
</script>