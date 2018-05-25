<template>
  <div>
    <div
      v-for="(alert, index) in getAlerts"
      :key="index"
      :class="alert.type"
      class="alert alert-dismissable black--text">
      <button
        :id="index"
        type="button"
        aria-hidden="true"
        class="close"
        @click="deleteAlert(index)">
        ×
      </button>
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
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="__static__/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="__static__/css/graph-creator.css"></style>