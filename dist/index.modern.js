import e from"browser-acl";const t={install(t,s,c,u={}){const m="function"==typeof s?s:()=>s,d=Boolean(u.strict),f=Object.assign({acl:{strict:d},aliases:["role"],assumeGlobal:!d,caseMode:!0,debug:!1,directive:"can",failRoute:"/",helper:!0,strict:!1},u),p=n(f);let b=new e(f.acl);"function"==typeof c?c(b):c instanceof e&&(b=c),b.router=function(t){f.router=t;const o=(e,t,...o)=>t&&b.can(m(),e,t,...o)||!t&&!f.strict;t.beforeEach((t,r,n)=>{const a=((t,r,n)=>{let a=null;const i=t.reduce((t,i)=>t.then(t=>{if(!0!==t)return t;"string"==typeof i.fail&&(a=i.fail);const l=p(i),s="function"==typeof l?l(r,n,o):Promise.resolve(o(...(t=>{const[o,r=(f.assumeGlobal?e.GlobalRule:null)]=t.split(" ");return[o,r]})(l)));if(f.strict&&!(s instanceof Promise))throw new Error("$route.meta.can must return a promise in strict mode");return s}).catch(e=>(f.debug&&console.error(e),!1)),Promise.resolve(!0));return i.getFail=()=>a,i})(t.matched.filter(e=>e.meta&&p(e.meta)).map(e=>e.meta),t,r);a.then(e=>{if(!0===e)return n();let o=a.getFail()||f.failRoute;"$from"===o&&(o=r.path),n("function"==typeof o?o(t,r):o)})})},f.router&&b.router(f.router);const v=function(t,n,s){const c=void 0!==(u=n.modifiers).disable?"disable":void 0!==u.readonly?"readonly":"hide";var u;let d,p,v,y;if(p=n.arg,Array.isArray(n.value)&&n.expression.startsWith("[")?[d,v,y]=n.modifiers.global?i(n):a(n):"string"==typeof n.value?[d,v,y]=l(n,s,f):p&&"object"==typeof n.value?(d=p,v=n.value,y=[]):void 0===n.value&&!n.modifiers.global&&f.assumeGlobal&&(d=p,v=e.GlobalRule,y=[]),f.assumeGlobal&&!v&&(v=e.GlobalRule,y=y||[],d=d||p),!d||!v)throw new Error("Missing verb or subject");const h=b[(n.modifiers.some?"some":n.modifiers.every&&"every")||"can"](m(),d,v,...y),g=n.modifiers.not,E=function(e){return!!o.some(t=>e instanceof t)&&e}(t),M=function(e){return!!r.some(t=>e instanceof t)&&e}(t);E&&(E.disabled=!1),M&&(M.readOnly=!1),(h&&g||!h&&!g)&&("hide"===c?function(e,t){const o=document.createComment(" ");Object.defineProperty(o,"setAttribute",{value:()=>{}}),t.text=" ",t.elm=o,t.isComment=!0,t.tag=void 0,t.data=t.data||{},t.data.directives=void 0,t.componentInstance&&(t.componentInstance.$el=o),e.parentNode&&e.parentNode.replaceChild(o,e)}(t,s):"disable"===c&&E?E.disabled=!0:"readonly"===c&&M&&(M.readOnly=!0))};if([f.directive,...f.aliases].forEach(e=>t.directive(e,v)),f.helper){const e="$"+f.directive;t.prototype[e]=function(e,t,...o){return b.can(m(),e,t,...o)},t.prototype[e].not=function(e,t,...o){return!b.can(m(),e,t,...o)},t.prototype[e].every=function(e,t,...o){return b.every(m(),e,t,...o)},t.prototype[e].some=function(e,t,...o){return b.some(m(),e,t,...o)}}}},o=[HTMLButtonElement,HTMLFieldSetElement,HTMLInputElement,HTMLOptGroupElement,HTMLOptionElement,HTMLSelectElement,HTMLTextAreaElement],r=[HTMLInputElement,HTMLTextAreaElement],n=e=>t=>[e.directive,...e.aliases||[]].map(e=>t[e]).filter(Boolean).shift(),a=({arg:e,value:t})=>[e||t[0],e?t[0]:t[1],t.slice(e?1:2)],i=({arg:t,value:o})=>[t||o[0],e.GlobalRule,t?o:o.slice(1)],l=({arg:e,value:t,modifiers:o},r,n)=>{let[a,i]=e?[e,t]:t.split(" ");if(i&&o.global)throw new Error("You cannot provide subject and use global modifier at the same time");return"string"==typeof i&&n.caseMode&&i[0].match(/[a-z]/)&&"object"==typeof r.context&&(i=r.context.$data[i]),[a,i,[]]};export default t;
//# sourceMappingURL=index.modern.js.map
