(self.AMP=self.AMP||[]).push({n:"amp-action-macro",v:"1910151804560",f:(function(AMP,_){
var f="function"==typeof Object.create?Object.create:function(a){function b(){}b.prototype=a;return new b},k;if("function"==typeof Object.setPrototypeOf)k=Object.setPrototypeOf;else{var l;a:{var m={a:!0},n={};try{n.__proto__=m;l=n.a;break a}catch(a){}l=!1}k=l?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var p=k;function q(a,b){b=void 0===b?"":b;try{return decodeURIComponent(a)}catch(d){return b}};var r=/(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;self.__AMP_LOG=self.__AMP_LOG||{user:null,dev:null,userForEmbed:null};var t=self.__AMP_LOG;function u(a,b,d,c){if(!t.user)throw Error("failed to call initLogConstructor");t.user.assert(a,b,d,c,void 0,void 0,void 0,void 0,void 0,void 0,void 0)};(function(a){return a||{}})({c:!0,v:!0,a:!0,ad:!0,action:!0});function v(a,b){if(a.__AMP__EXPERIMENT_TOGGLES)var d=a.__AMP__EXPERIMENT_TOGGLES;else{a.__AMP__EXPERIMENT_TOGGLES=Object.create(null);d=a.__AMP__EXPERIMENT_TOGGLES;if(a.AMP_CONFIG)for(var c in a.AMP_CONFIG){var e=a.AMP_CONFIG[c];"number"===typeof e&&0<=e&&1>=e&&(d[c]=Math.random()<e)}if(a.AMP_CONFIG&&Array.isArray(a.AMP_CONFIG["allow-doc-opt-in"])&&0<a.AMP_CONFIG["allow-doc-opt-in"].length&&(c=a.AMP_CONFIG["allow-doc-opt-in"],e=a.document.head.querySelector('meta[name="amp-experiments-opt-in"]'))){e=
e.getAttribute("content").split(",");for(var g=0;g<e.length;g++)-1!=c.indexOf(e[g])&&(d[e[g]]=!0)}Object.assign(d,w(a));if(a.AMP_CONFIG&&Array.isArray(a.AMP_CONFIG["allow-url-opt-in"])&&0<a.AMP_CONFIG["allow-url-opt-in"].length){c=a.AMP_CONFIG["allow-url-opt-in"];e=a.location.originalHash||a.location.hash;a=Object.create(null);if(e)for(var h;h=r.exec(e);)g=q(h[1],h[1]),h=h[2]?q(h[2].replace(/\+/g," "),h[2]):"",a[g]=h;for(e=0;e<c.length;e++)g=a["e-"+c[e]],"1"==g&&(d[c[e]]=!0),"0"==g&&(d[c[e]]=!1)}}var E=
d;return!!E[b]}function w(a){var b="";try{"localStorage"in a&&(b=a.localStorage.getItem("amp-experiment-toggles"))}catch(e){if(t.dev)a=t.dev;else throw Error("failed to call initLogConstructor");a.warn("EXPERIMENTS","Failed to retrieve experiments from localStorage.")}var d=b?b.split(/\s*,\s*/g):[];a=Object.create(null);for(var c=0;c<d.length;c++)0!=d[c].length&&("-"==d[c][0]?a[d[c].substr(1)]=!1:a[d[c]]=!0);return a};function x(a){var b=a.ownerDocument.defaultView,d=b.__AMP_TOP||(b.__AMP_TOP=b),c=b!=d,e=v(d,"ampdoc-fie");c&&!e?a=y(b,"action")?z(b,"action"):null:(a=A(a),a=A(a),a=a.isSingleDoc()?a.win:a,a=y(a,"action")?z(a,"action"):null);return a}function A(a){if(a.nodeType){var b=(a.ownerDocument||a).defaultView;b=b.__AMP_TOP||(b.__AMP_TOP=b);a=z(b,"ampdoc").getAmpDoc(a)}return a}
function z(a,b){y(a,b);var d=a.__AMP_SERVICES;d||(d=a.__AMP_SERVICES={});var c=d;a=c[b];a.obj||(a.obj=new a.ctor(a.context),a.ctor=null,a.context=null,a.resolve&&a.resolve(a.obj));return a.obj}function y(a,b){a=a.__AMP_SERVICES&&a.__AMP_SERVICES[b];return!(!a||!a.ctor&&!a.obj)};/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function B(a){a=AMP.BaseElement.call(this,a)||this;a.j=null;a.h=[];return a}var C=AMP.BaseElement;B.prototype=f(C.prototype);B.prototype.constructor=B;if(p)p(B,C);else for(var D in C)if("prototype"!=D)if(Object.defineProperties){var F=Object.getOwnPropertyDescriptor(C,D);F&&Object.defineProperty(B,D,F)}else B[D]=C[D];B.m=C.prototype;
B.prototype.buildCallback=function(){u(v(this.win,"amp-action-macro"),"Experiment is off");var a=this.element;this.j=x(a);var b=a.getAttribute("arguments");b&&(this.h=b.split(",").map(function(a){return a.trim()}));this.registerAction("execute",this.l.bind(this))};B.prototype.getLayoutPriority=function(){return 1};
B.prototype.l=function(a){var b=a,d=b.actionEventType,c=b.args,e=b.event,g=b.trust;if(c&&0<this.h.length)for(var h in c)u(this.h.includes(h),'Variable argument name "%s" is not defined in %s',h,this.element);"amp-action-macro"===a.caller.tagName.toLowerCase()&&u(!!(this.element.compareDocumentPosition(a.caller)&Node.DOCUMENT_POSITION_FOLLOWING),'Action macro with ID "%s" cannot reference itself or macros defined after it',this.element.getAttribute("id"));this.j.trigger(this.element,""+d,e,g,c)};
B.prototype.renderOutsideViewport=function(){return!0};(function(a){a.registerElement("amp-action-macro",B)})(self.AMP);
})});

//# sourceMappingURL=amp-action-macro-0.1.js.map