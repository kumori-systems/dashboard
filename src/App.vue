<template>
	<div id="app">
		<div v-if="user !== null">
			<nprogress-container></nprogress-container>
			<nav-bar v-bind:show="true"></nav-bar>
			<fab></fab>
			<side-bar></side-bar>
			<app-main></app-main>
			<footer-bar></footer-bar>
		</div>
		<div v-else>
			<div class="tile is-4 login">
				<div class="box">
					The access to this preview requires authentication
					<div>
						<div class="box tile is-vertical is-parent">
							<input class="input is-small is-child" type="email" v-model="email" placeholder="Email">
							<input class="input is-small is-child" type="password" v-model="password" placeholder="Password">
							<button class="button" v-on:click="onSubmit">Login</button>
							<span v-if="authError" class="invalid">Invalid username or password</span>
						</div>
					</div>
				</div>
			</div>
		</div>
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
	email: string = null;
	password: string = null;

	onSubmit() {
		this.$store.dispatch('login', { 'email': this.email, 'password': this.password });
	}

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

	}

	get user() {
		let res = this.$store.getters.getUser;
		if (res !== null) this.$store.dispatch('getStampState', { vueInstanceReference: this });
		return res;
	}
	get authError() {
		return this.$store.getters.authError;
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
	pointer-events: none;
}

.CONNECTED_FONT_COLOR {
	color: $color_green;
}

.CONNECTED {
	background: $color_green;
}

.CONNECTED_COLOR {
	color: $color_green;
	font-size: $state_icon_size;
}

.DISCONNECTED_FONT_COLOR {
	color: $color_red;
}

.invalid {
	color: $color_red;
}

.DISCONNECTED {
	background: $color_red;
}

.DISCONNECTED_COLOR {
	color: $color_red;
	font-size: $state_icon_size;
}

.ON_PROGRESS_FONT_COLOR {
	color: $color_yellow;
}

.ON_PROGRESS {
	background: $color_yellow;
}

.ON_PROGRESS_COLOR {
	color: $color_yellow;
	font-size: $state_icon_size;
}

.fa-hdd-o {
	font-size: 30px;
}

.login {
	position: absolute;
	top: 40%;
	left: 40%;
}
</style>