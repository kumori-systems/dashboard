<template>
  <div>
    <div v-for="(alert, index) in getAlerts" v-bind:key="index"
     v-bind:class="'alert '+ alert.type +' alert-dismissable'">
      <button :id="index" type="button" class="close" @click="deleteAlert(index)" aria-hidden="true">×</button>
      {{ $t('notify.' + alert.text) + " " + alert.extra }}
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  computed: {
    getAlerts() {
      return this.$store.getters.getAlerts;
    }
  },
  methods: {
    deleteAlert(alert) {
      this.$store.dispatch("deleteAlert", alert);
    }
  }
}
</script>







