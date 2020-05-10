import Vue from 'vue';
import Acl from "../types/vue-browser-acl";

Acl.can('edit', ['edit', 'delete'])
Acl.install(Vue, {}, () => {}, { debug: false })