// Type definitions for vue-browser-acl 0.13
// Project: https://github.com/mblarsen/vue-browser-acl#readme
// Definitions by: JasonLandbridge <https://github.com/JasonLandbridge>

import Vue, { VueConstructor } from 'vue';

export interface VueBrowserAclOptions {
	assumeGlobal?: boolean;
	caseMode?: boolean;
	debug?: boolean;
	directive?: string;
	failRoute?: string;
	helper?: boolean;
	strict?: boolean;
	router?: any
}

export declare class Acl {

	install(Vue: VueConstructor<Vue>, user: Object | Function, setupCallback: Function, options: VueBrowserAclOptions): void
	can(role: string | string[], userRoles: string | string[]): boolean;
}

declare module 'vue/types/vue' {
	interface VueConstructor {
		$acl: Acl;
	}
}

declare module '@nuxt/types' {
	interface NuxtAppOptions {
		$acl: Acl;
	}
	interface Context {
		$acl: Acl;
	}
}
declare const vueBrowserAclGlobalInstance: Acl;

export default vueBrowserAclGlobalInstance