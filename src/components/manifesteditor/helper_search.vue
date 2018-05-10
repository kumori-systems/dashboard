<template>
  <div
    style="position:relative"
    :class="{'open':openSuggestion, 'disabled':disabled}">
    
    <input
      type="text"
      v-model="selection"
      :disabled="disabled"
      :value="defaultVal"
      class="form-control black--text"
      @focusout='close($event)'
      @focus='setFocus'/>

      <ul
        class="dropdown-menu"
        style="width:100%; margin-top:33px;">

        <li
          v-for="(suggestion, index) in matches"
          :key="index"
          :class="{ 'active': isActive(index) }"
          v-on:mousedown="suggestionClick(index)"
          v-on:mouseover="current=index">
          
          <a>{{ suggestion.label }}</a>

        </li>

      </ul>
  </div>
</template>
<script>
export default {
  props: ["suggestions", "reset", "defaultVal"],

  data() {
    return {
      disabled: false,
      open: false,
      current: 0,
      selection: "",
      value: "",
      focus: false
    };
  },

  mounted: function() {
    this.init();
  },

  computed: {
    //Filtering the suggestion based on the input
    matches() {
      if (this.focus && this.selection == "") return this.suggestions;

      return this.suggestions.filter(elem => {
        return elem.fullName.indexOf(this.selection) >= 0;
      });
    },

    //The flag
    openSuggestion() {
      return this.matches.length != 0 && this.open === true;
    }
  },

  methods: {
    liClick() {
      this.selection = this.matches[this.current];
    },
    setFocus() {
      this.focus = true;
      if (this.open == false) {
        this.open = true;
        this.current = 0;
      }
    },

    init() {
      if (this.reset) {
        this.selection = "";
        this.$emit("reset", false);
      }
    },

    //For highlighting element
    isActive(index) {
      return index === this.current;
    },

    //When the user changes input
    change() {
      if (this.open == false) {
        this.open = true;
        this.current = 0;
      }
    },

    //Close suggestion list
    close(event) {
      if (event.relatedTarget == null || event.relatedTarget.tagName != "A") {
        this.open = false;
        this.focus = false;
      }
    },

    //When one of the suggestion is clicked
    suggestionClick(index) {
      this.$emit("update", this.matches[index]);
      this.selection = this.matches[index].fullName;
      this.open = false;
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