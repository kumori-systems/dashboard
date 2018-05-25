<template>
  <div
    style="position:relative"
    :class="{'open':openSuggestion, 'disabled':disabled}">
    
    <input
      type="text"
      v-model="selection"
      :disabled="disabled? '' : null"
      :value="defaultVal"
      class="form-control black--text"
      @keydown.enter='enter'
      @keydown.down='down'
      @keydown.up='up'
      @focusout='close($event)'
      @focus='setFocus'/>

      <ul
        class="dropdown-menu"
        style="width:100%; margin-top:25px;">

        <li disabled class="disabled">
          <a>select with enter key</a>
        </li>

        <li
          v-for="(suggestion, index) in matches"
          :key="index"
          :class="{'active': isActive(index)}"
          v-on:click='suggestionClick(index)'>
          
          <a v-on:click='suggestionClick(index)'>{{ suggestion.label }}</a>

        </li>

      </ul>
  </div>
</template>
<script>
export default {
  props: ["disabled", "suggestions", "reset", "defaultVal"],

  data() {
    return {
      open: false,
      current: 0,
      selection: "",
      value: "",
      focus: false
    };
  },

  mounted: function() {
    console.debug("Search helper has been mounted");
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

    //When enter pressed on the input
    enter() {
      this.$emit("update", this.matches[this.current]);
      this.selection = this.matches[this.current].fullName;
      this.open = false;
    },

    //When up pressed while suggestions are open
    up() {
      console.log("upp");
      if (this.current > 0) this.current--;
    },

    //When up pressed while suggestions are open
    down() {
      console.log("down");
      if (this.current < this.matches.length - 1) this.current++;
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
      console.debug("In suggestionClick the index is " + index);

      this.$emit("update", this.matches[index]);
      this.selection = this.matches[index].fullName;
      this.open = false;
    }
  }
};
</script>
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="__static__/css/metisMenu/metisMenu.min.css"></style>
<style scoped src="__static__/css/sb-admin-2/sb-admin-2.css"></style>
<style scoped src="__static__/css/graph-creator.css"></style>