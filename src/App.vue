<template>
	<div id="app">
		<div v-if="user">
			<nprogress-container></nprogress-container>
			<nav-bar v-bind:show="true"></nav-bar>
			<fab></fab>
			<side-bar></side-bar>
			<app-main></app-main>
			<footer-bar></footer-bar>
		</div>
		<div v-else>
			<div class="tile is-vertical is-3 login">
				<div class="box">
					The access to this preview requires authentication
					<div>
						<div class="box tile is-vertical is-parent">
							<input v-bind:disabled="userState==='authenticated'" class="input loginstate" type="text" v-model="username" placeholder="Username">
							<input v-bind:disabled="userState==='authenticated'" class="input loginstate" type="password" v-model="password" placeholder="Password">
							<div class="tile loginactionbar">
								<i class="button fa fa-sign-in" v-bind:class="userState==='authenticated'?'is-loading':''" v-on:click="onSubmit"> Sign in</i>
								<div v-if="userState==='authenticated'" class="loginstate">Loading..</div>
								<div v-if="userState==='error'" class="loginstate invalid">Invalid username or password</div>
							</div>
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

import NprogressContainer from 'vue-nprogress/src/NprogressContainer.vue';
import { NavBar, AppMain, SideBar, FAB, FooterBar } from './components';

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
	username: string = null;
	password: string = null;

	onSubmit() {
		this.$store.dispatch('login', { 'username': this.username, 'password': this.password });
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
		return this.$store.getters.getUser;
	}
	get userState() {
		return this.$store.getters.userState;
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
$color_grey:#e6f2ff;

$padding: 10px;
$icon_size: 100px;
$state_icon_size: 50px;
.nprogress-container {
	position: fixed !important;
	width: 100%;
	height: 50px;
	pointer-events: none;
}

.loginactionbar {
	margin: 10px;
}

.loginstate {
	margin: 5px;
}

.invalid {
	color: $color_red;
}

.login {
	  padding: 70px 0;
  
	 
   margin:auto;
   width:50%;
   
}
</style>