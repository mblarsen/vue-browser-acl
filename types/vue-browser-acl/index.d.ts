// Type definitions for vue-browser-acl 0.13
// Project: https://github.com/mblarsen/vue-browser-acl#readme
// Definitions by: JasonLandbridge <https://github.com/JasonLandbridge>

import Vue from 'vue';

export interface VueBrowserAclOptions {
	assumeGlobal: boolean;
	caseMode: boolean;
	debug: boolean;
	directive: string;
	failRoute: string;
	helper: boolean;
	strict: boolean;
	router: any
}

export function install(Vue: Vue, user: Object | Function, setupCallback: Function, options: VueBrowserAclOptions): void
export function can(role: string | string[], userRoles: string | string[]): boolean;

declare module 'vue/types/vue' {
	interface VueConstructor {
		$acl: any;
	}
}