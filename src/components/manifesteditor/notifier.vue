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
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/dist/css/sb-admin-2.css"></style>
<style scoped src="/home/osmuogar/workspace/dashboard/static/css/graph-creator.css"></style>