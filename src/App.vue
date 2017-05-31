<template>
	<div id="app">
		<nprogress-container></nprogress-container>
		<nav-bar v-bind:show="true"></nav-bar>
		<fab></fab>
		<side-bar></side-bar>
		<app-main></app-main>
		<footer-bar></footer-bar>
	</div>
</template>
<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';

import NprogressContainer from 'vue-nprogress/src/NprogressContainer.vue'
import { NavBar, AppMain, SideBar, FAB, FooterBar } from './components'

@Component({
	name: 'App',
	components: {
		'nprogress-container': NprogressContainer,
		'nav-bar': NavBar,
		'side-bar': SideBar,
		'app-main': AppMain,
		'fab': FAB,
		'footer-bar': FooterBar
	}
})
export default class App extends Vue {
	name: string = 'App';

	beforeMount(): void {
		const { body } = document
		const WIDTH: number = 768;
		const RATIO: number = 3;
		const handler = () => {
			if (!document.hidden) {
				let rect = body.getBoundingClientRect();
				let isMobile = rect.width - RATIO < WIDTH;
				// this.toggleDevice(isMobile ? 'mobile' : 'other')
				// this.toggleSidebar(!isMobile)
			}
		}
		document.addEventListener('visibilitychange', handler);
		window.addEventListener('DOMContentLoaded', handler);
		window.addEventListener('resize', handler);

		// Enviamos una petición para obtener los deployments
		this.$store.dispatch('getStampState', { vueInstanceReference: this });
	}
}
</script>
<style lang="scss">
@import '~animate.css';
.animated {
	animation-duration: .4s;
}

@import '~bulma';
@import '~wysiwyg.css/wysiwyg.sass';
$fa-font-path: '~font-awesome/fonts/';
@import '~font-awesome/scss/font-awesome';
html {
	background-color: whitesmoke;
}

$color_green:#93c47d;
$color_yellow:#f5d164;
$color_red:#ff6666;
$padding: 10px;
$icon_size: 100px;
$state_icon_size: 50px;
.nprogress-container {
	position: fixed !important;
	width: 100%;
	height: 50px;
	z-index: 2048;
	pointer-events: none;
	#nprogress {
		$color: #48e79a;
		.bar {
			background: $color;
		}
		.peg {
			box-shadow: 0 0 10px $color, 0 0 5px $color;
		}
		.spinner-icon {
			border-top-color: $color;
			border-left-color: $color;
		}
	}
}


.CONNECTED {
	background: $color_green;
}

.CONNECTED_COLOR {
	color: $color_green;
	font-size: $state_icon_size;
}

.DISCONNECTED {
	background: $color_red;
}

.DISCONNECTED_COLOR {
	color: $color_red;
	font-size: $state_icon_size;
}

.ON_PROGRESS {
	background: $color_yellow;
}

.ON_PROGRESS_COLOR {
	color: $color_yellow;
	font-size: $state_icon_size;
}

.fa-caret-square-o-down {
	font-size: $icon_size;
}

.fa-check-circle {
	color: $color_green;
	font-size: $icon_size;
}

.fa-hdd-o {
	font-size: 30px;
}

.fa-exclamation-triangle {
	color: $color_yellow;
	font-size: $icon_size;
}

.fa-exclamation-circle {
	color: $color_red;
	font-size: $icon_size;
}

.inner-content {
	padding: $padding;
}
</style>