(self.AMP=self.AMP||[]).push({n:"amp-dailymotion",v:"1910151804560",f:(function(AMP,_){
var h,aa="function"==typeof Object.create?Object.create:function(a){function b(){}b.prototype=a;return new b},m;if("function"==typeof Object.setPrototypeOf)m=Object.setPrototypeOf;else{var p;a:{var ba={a:!0},ca={};try{ca.__proto__=ba;p=ca.a;break a}catch(a){}p=!1}m=p?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var da=m;function ea(){var a,b;this.promise=new Promise(function(c,d){a=c;b=d});this.resolve=a;this.reject=b};function fa(a,b){b=void 0===b?"":b;try{return decodeURIComponent(a)}catch(c){return b}};var ha=/(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;function r(a){var b=Object.create(null);if(!a)return b;for(var c;c=ha.exec(a);){var d=fa(c[1],c[1]),e=c[2]?fa(c[2].replace(/\+/g," "),c[2]):"";b[d]=e}return b};var t="";var ia=Object.prototype.toString;function u(a){return"number"===typeof a&&isFinite(a)};function v(a){var b=!1,c=null,d=a;return function(a){for(var e=[],g=0;g<arguments.length;++g)e[g-0]=arguments[g];b||(c=d.apply(self,e),b=!0,d=null);return c}};self.__AMP_LOG=self.__AMP_LOG||{user:null,dev:null,userForEmbed:null};var w=self.__AMP_LOG;function x(){if(!w.user)throw Error("failed to call initLogConstructor");return w.user}function y(){if(w.dev)return w.dev;throw Error("failed to call initLogConstructor");}function z(a,b,c){return x().assert(a,b,c,void 0,void 0,void 0,void 0,void 0,void 0,void 0,void 0)};function A(a){var b=Object.create(null);a&&Object.assign(b,a);return b}function B(a){return a||{}};function ja(a,b){return b.length>a.length?!1:0==a.lastIndexOf(b,0)};B({c:!0,v:!0,a:!0,ad:!0,action:!0});function ka(a,b,c){if(!b)return a;var d=a.split("#",2),e=d[0].split("?",2),f=e[0]+(e[1]?c?"?"+b+"&"+e[1]:"?"+e[1]+"&"+b:"?"+b);return f+=d[1]?"#"+d[1]:""}function la(a){var b=[],c;for(c in a){var d=a[c];if(null!=d)if(Array.isArray(d))for(var e=0;e<d.length;e++){var f=d[e];b.push(encodeURIComponent(c)+"="+encodeURIComponent(f))}else e=d,b.push(encodeURIComponent(c)+"="+encodeURIComponent(e))}return b.join("&")};function ma(a){var b="";try{"localStorage"in a&&(b=a.localStorage.getItem("amp-experiment-toggles"))}catch(e){y().warn("EXPERIMENTS","Failed to retrieve experiments from localStorage.")}var c=b?b.split(/\s*,\s*/g):[];a=Object.create(null);for(var d=0;d<c.length;d++)0!=c[d].length&&("-"==c[d][0]?a[c[d].substr(1)]=!1:a[c[d]]=!0);return a};function C(a,b){var c=a.ownerDocument.defaultView,d=c.__AMP_TOP||(c.__AMP_TOP=c),e=c!=d;var f=d;if(f.__AMP__EXPERIMENT_TOGGLES)var g=f.__AMP__EXPERIMENT_TOGGLES;else{f.__AMP__EXPERIMENT_TOGGLES=Object.create(null);g=f.__AMP__EXPERIMENT_TOGGLES;if(f.AMP_CONFIG)for(var l in f.AMP_CONFIG){var k=f.AMP_CONFIG[l];"number"===typeof k&&0<=k&&1>=k&&(g[l]=Math.random()<k)}if(f.AMP_CONFIG&&Array.isArray(f.AMP_CONFIG["allow-doc-opt-in"])&&0<f.AMP_CONFIG["allow-doc-opt-in"].length&&(l=f.AMP_CONFIG["allow-doc-opt-in"],
k=f.document.head.querySelector('meta[name="amp-experiments-opt-in"]'))){k=k.getAttribute("content").split(",");for(var n=0;n<k.length;n++)-1!=l.indexOf(k[n])&&(g[k[n]]=!0)}Object.assign(g,ma(f));if(f.AMP_CONFIG&&Array.isArray(f.AMP_CONFIG["allow-url-opt-in"])&&0<f.AMP_CONFIG["allow-url-opt-in"].length)for(l=f.AMP_CONFIG["allow-url-opt-in"],f=r(f.location.originalHash||f.location.hash),k=0;k<l.length;k++)n=f["e-"+l[k]],"1"==n&&(g[l[k]]=!0),"0"==n&&(g[l[k]]=!1)}var q=!!g["ampdoc-fie"];e&&!q?b=D(c,
b)?E(c,b):null:(a=F(a),a=G(a),b=D(a,b)?E(a,b):null);return b}function H(a,b){a=a.__AMP_TOP||(a.__AMP_TOP=a);return E(a,b)}function I(a,b){var c=F(a);c=G(c);return E(c,b)}function F(a){return a.nodeType?H((a.ownerDocument||a).defaultView,"ampdoc").getAmpDoc(a):a}function G(a){a=F(a);return a.isSingleDoc()?a.win:a}function E(a,b){D(a,b);var c=na(a);a=c[b];a.obj||(a.obj=new a.ctor(a.context),a.ctor=null,a.context=null,a.resolve&&a.resolve(a.obj));return a.obj}
function na(a){var b=a.__AMP_SERVICES;b||(b=a.__AMP_SERVICES={});return b}function D(a,b){a=a.__AMP_SERVICES&&a.__AMP_SERVICES[b];return!(!a||!a.ctor&&!a.obj)};/*
 https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
function J(a){a.parentElement&&a.parentElement.removeChild(a)}function oa(a){var b,c,d=b||function(a){return a},e=a.dataset;a={};var f=c?c:/^param(.+)/,g;for(g in e){var l=g.match(f);if(l){var k=l[1][0].toLowerCase()+l[1].substr(1);a[d(k)]=e[g]}}return a};function K(a){return H(a,"platform")};function L(a){a.signals().signal("user-interacted")};var M;function N(a){a=a.ownerDocument||a;M&&M.ownerDocument===a||(M=a.createElement("div"));return pa}function pa(a){var b=M;b.innerHTML=a[0];a=b.firstElementChild;b.removeChild(a);return a};var qa=["<iframe frameborder=0 allowfullscreen></iframe>"];function ra(a,b,c){if(null!=c[b]){var d=c[b];(Array.isArray(d)?d:[d]).forEach(function(b){a.dispatchCustomEvent(b)})}};var O;function sa(a,b,c,d){var e=a,f=c;var g=function(a){try{return f(a)}catch(q){throw self.__AMP_REPORT_ERROR(q),q;}};var l=ta(),k=!1;d&&(k=d.capture);e.addEventListener(b,g,l?d:k);return function(){e&&e.removeEventListener(b,g,l?d:k);g=e=f=null}}function ta(){if(void 0!==O)return O;O=!1;try{var a={get capture(){O=!0}};self.addEventListener("test-options",null,a);self.removeEventListener("test-options",null,a)}catch(b){}return O};function ua(a,b,c){var d={detail:c};Object.assign(d,void 0);if("function"==typeof a.CustomEvent)return new a.CustomEvent(b,d);a=a.document.createEvent("CustomEvent");a.initCustomEvent(b,!!d.bubbles,!!d.cancelable,c);return a}function P(a,b,c){return sa(a,b,c,void 0)}function va(a,b,c,d){var e=c,f=sa(a,b,function(a){try{e(a)}finally{e=null,f()}},d);return f}function wa(a){var b,c,d=new Promise(function(b){c=va(a,"load",b,void 0)});d.then(c,c);b&&b(c);return d};var xa={title:"",artist:"",album:"",artwork:[{src:""}]};function ya(a){var b=a.querySelector('script[type="application/ld+json"]');if(b){try{var c=JSON.parse(b.textContent)}catch(e){c=null}var d=c;if(d&&d.image){if("string"===typeof d.image)return d.image;if(d.image["@list"]&&"string"===typeof d.image["@list"][0])return d.image["@list"][0];if("string"===typeof d.image.url)return d.image.url;if("string"===typeof d.image[0])return d.image[0]}}}
function za(a,b){var c=C(a,"url");if(b&&b.artwork){var d=b.artwork;Array.isArray(d);d.forEach(function(a){a&&(a="[object Object]"===ia.call(a)?a.src:a,z(c.isProtocolValid(a)))})}};function Aa(){this.m=null}h=Aa.prototype;h.add=function(a){var b=this;this.m||(this.m=[]);this.m.push(a);return function(){b.remove(a)}};h.remove=function(a){this.m&&(a=this.m.indexOf(a),-1<a&&this.m.splice(a,1))};h.removeAll=function(){this.m&&(this.m.length=0)};h.fire=function(a){if(this.m)for(var b=this.m,c=0;c<b.length;c++)(0,b[c])(a)};h.getHandlerCount=function(){return this.m?this.m.length:0};function Q(){this.J=!1;this.X=new Aa}Q.prototype.onSessionEnd=function(a){this.X.add(a)};Q.prototype.beginSession=function(){this.J=!0};Q.prototype.endSession=function(){this.J&&this.X.fire();this.J=!1};Q.prototype.isSessionActive=function(){return this.J};var R,Ba="Webkit webkit Moz moz ms O o".split(" ");function Ca(a){var b={position:"fixed",top:"0",width:"0",height:"0",opacity:"0"},c;for(c in b){var d=a,e=b[c];var f=d.style;var g=c;if(ja(g,"--"))f=g;else{R||(R=A());var l=R[g];if(!l){l=g;if(void 0===f[g]){var k=g;k=k.charAt(0).toUpperCase()+k.slice(1);b:{for(var n=0;n<Ba.length;n++){var q=Ba[n]+k;if(void 0!==f[q]){k=q;break b}}k=""}void 0!==f[k]&&(l=k)}R[g]=l}f=l}f&&(d.style[f]=e)}};function Da(a,b){if(b)return Promise.resolve(!1);var c=a.document.createElement("video");c.setAttribute("muted","");c.setAttribute("playsinline","");c.setAttribute("webkit-playsinline","");c.setAttribute("height","0");c.setAttribute("width","0");c.muted=!0;c.playsinline=!0;c.webkitPlaysinline=!0;Ca(c);(new Promise(function(a){return a(c.play())})).catch(function(){});return Promise.resolve(!c.paused)}var S=null;function Ea(a){var b=250,c=4E3;return Math.min(Math.max(a,b),c)};function Fa(a,b,c){return b[c]?b[c]:(a=a.querySelector("style["+c+"]"))?b[c]=a:null};var Ga="i-amphtml-video-mask{display:block;z-index:1}.amp-video-eq{display:none}.i-amphtml-video-component:not(amp-video) .amp-video-eq,amp-story .amp-video-eq,amp-video[controls] .amp-video-eq{display:-ms-flexbox;display:flex}[noaudio] .amp-video-eq{display:none!important}.amp-video-eq{pointer-events:none!important;-ms-flex-align:end;align-items:flex-end;bottom:7px;height:12px;opacity:0.8;overflow:hidden;position:absolute;right:7px;width:20px;z-index:1}.amp-video-eq .amp-video-eq-col{-ms-flex:1;flex:1;height:100%;margin-right:1px;position:relative}.amp-video-eq .amp-video-eq-col div{animation-name:amp-video-eq-animation;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;background-color:#fafafa;height:100%;position:absolute;width:100%;will-change:transform;animation-play-state:paused}.amp-video-eq[unpausable] .amp-video-eq-col div{animation-name:none}.amp-video-eq[unpausable].amp-video-eq-play .amp-video-eq-col div{animation-name:amp-video-eq-animation}.amp-video-eq.amp-video-eq-play .amp-video-eq-col div{animation-play-state:running}.amp-video-eq-1-1{animation-duration:0.3s;transform:translateY(60%)}.amp-video-eq-1-2{animation-duration:0.45s;transform:translateY(60%)}.amp-video-eq-2-1{animation-duration:0.5s;transform:translateY(30%)}.amp-video-eq-2-2{animation-duration:0.4s;transform:translateY(30%)}.amp-video-eq-3-1{animation-duration:0.3s;transform:translateY(70%)}.amp-video-eq-3-2{animation-duration:0.35s;transform:translateY(70%)}.amp-video-eq-4-1{animation-duration:0.4s;transform:translateY(50%)}.amp-video-eq-4-2{animation-duration:0.25s;transform:translateY(50%)}@keyframes amp-video-eq-animation{0%{transform:translateY(100%)}to{transform:translateY(0)}}\n/*# sourceURL=/css/video-autoplay.css*/";var Ha=["<i-amphtml-video-mask class=i-amphtml-fill-content role=button></i-amphtml-video-mask>"],Ia=["<i-amphtml-video-icon class=amp-video-eq><div class=amp-video-eq-col><div class=amp-video-eq-filler></div><div class=amp-video-eq-filler></div></div></i-amphtml-video-icon>"];function Ja(a){var b=N(a);return b(Ha)}
function Ka(a,b){var c=N(b)(Ia),d=c.firstElementChild;for(b=0;4>b;b++){for(var e=d.cloneNode(!0),f=e.children,g=0;g<f.length;g++){var l=f[g];l.classList.add("amp-video-eq-"+(b+1)+"-"+(g+1))}c.appendChild(e)}J(d);K(a).isIos()&&c.setAttribute("unpausable","");return c};function La(a){var b=this;this.ampdoc=a;this.installAutoplayStyles=v(function(){var a=Ga,d=b.ampdoc.getHeadNode();var e=(e=d.__AMP_CSS_TR)?e(a):a;(a=d.__AMP_CSS_SM)||(a=d.__AMP_CSS_SM=A());var f=Fa(d,a,"amp-extension=amp-video-autoplay");f?f.textContent!==e&&(f.textContent=e):(f=(d.ownerDocument||d).createElement("style"),f.textContent=e,f.setAttribute("amp-extension","amp-video-autoplay"),e=Fa(d,a,"amp-runtime"),d.insertBefore(f,e?e.nextSibling:d.firstChild),a["amp-extension=amp-video-autoplay"]=
f)});this.ia=I(this.ampdoc,"viewport");this.h=null;this.ea=!1;this.N=H(a.win,"timer");this.ja=C(a.getHeadNode(),"action");this.W=function(){for(var a=0;a<b.h.length;a++){var d=b.h[a];if("paused"!==d.getPlayingState()){T(d,"video-seconds-played");var e=d.video.getCurrentTime(),f=d.video.getDuration();u(e)&&u(f)&&0<f&&(e=ua(b.ampdoc.win,"video-manager.timeUpdate",B({time:e,percent:e/f})),b.ja.trigger(d.video.element,"timeUpdate",e,1))}}b.N.delay(b.W,1E3)};this.R=v(function(){return new U(b.ampdoc,b)});
this.N.delay(this.W,1E3)}h=La.prototype;h.dispose=function(){this.R().dispose();if(this.h)for(var a=0;a<this.h.length;a++){var b=this.h[a];b.dispose()}};h.register=function(a){Ma(a);if(a.supportsPlatform()){this.h=this.h||[];var b=new Na(this,a);Oa(this,b);this.h.push(b);b=b.video.element;b.dispatchCustomEvent("registered");b.classList.add("i-amphtml-video-component");var c=a.signals();c.signal("registered");b.classList.add("i-amphtml-video-interface")}};
function Ma(a){function b(b,e){a.registerAction(b,function(){L(a);e()},c)}var c=1;b("play",function(){return a.play(!1)});b("pause",function(){return a.pause()});b("mute",function(){return a.mute()});b("unmute",function(){return a.unmute()});b("fullscreen",function(){return a.fullscreenEnter()})}
function Oa(a,b){var c=b.video.element;P(c,"amp:video:visibility",function(a){var c=a.data;c&&1==c.visible?b.updateVisibility(!0):b.updateVisibility()});P(c,"reloaded",function(){b.videoLoaded()});if(!a.ea){var d=function(){for(var b=0;b<a.h.length;b++)a.h[b].updateVisibility()};a.ia.onScroll(d);a.ia.onChanged(d);a.ea=!0}}function Pa(a,b){for(var c=0;c<a.h.length;c++)if(a.h[c].video===b)return a.h[c];y().error("video-manager","video is not registered to this video manager");return null}
h.getAnalyticsDetails=function(a){var b;a:{for(b=0;b<this.h.length;b++){var c=this.h[b];if(c.video.element===a){b=c;break a}}y().error("video-manager","video is not registered to this video manager");b=null}return b?b.getAnalyticsDetails():Promise.resolve()};h.getPlayingState=function(a){return Pa(this,a).getPlayingState()};h.isMuted=function(a){return Pa(this,a).isMuted()};h.userInteracted=function(a){return Pa(this,a).userInteracted()};h.registerForAutoFullscreen=function(a){this.R().register(a)};
h.qa=function(){return this.R()};
function Na(a,b){var c=this;this.K=a;this.j=a.ampdoc;this.video=b;this.V=!0;this.A=this.B=this.ba=!1;this.P=new Q;this.P.onSessionEnd(function(){return T(c,"video-session")});this.F=new Q;this.F.onSessionEnd(function(){return T(c,"video-session-visible")});this.U=function(){var a=c.j.win,b=a||self;if(b.__AMP_MODE)b=b.__AMP_MODE;else{var f=self.AMP_CONFIG||{};var g=!!f.test||!(!b.__AMP_TEST&&!b.__karma__);var l=b.__karma__&&b.__karma__.config.amp.testOnIe,k=!!f.localDev||g,n=r(b.location.originalHash||
b.location.hash);f=f.spt;var q=r(b.location.search);t||(t=k?"1910151804560":b.AMP_CONFIG&&b.AMP_CONFIG.v?b.AMP_CONFIG.v:"011910151804560");g={localDev:k,development:!!(0<=["1","actions","amp","amp4ads","amp4email"].indexOf(n.development)||b.AMP_DEV_MODE),examiner:"2"==n.development,filter:n.filter,geoOverride:n["amp-geo"],userLocationOverride:n["amp-user-location"],minified:!0,lite:void 0!=q.amp_lite,test:g,testIe:l,log:n.log,version:"1910151804560",rtvVersion:t,singlePassType:f};b=b.__AMP_MODE=g}b=
b.lite;S||(S=v(Da));return S(a,b)};this.Z=v(function(){return new V(c.j.win,c)});this.T=this.ca=!1;this.S=null;this.w=!1;(this.hasAutoplay=b.element.hasAttribute("autoplay"))&&this.K.installAutoplayStyles();this.C=xa;this.na=function(){c.video.play(!1)};this.ma=function(){c.video.pause()};wa(b.element).then(function(){return c.videoLoaded()});P(b.element,"pause",function(){T(c,"video-pause");c.B=!1;c.T?c.T=!1:c.P.endSession()});P(b.element,"playing",function(){c.B=!0;"playing_manual"==c.getPlayingState()&&
c.Y();var a=c.video,b=a.element;if(!a.preimplementsMediaSessionAPI()&&!b.classList.contains("i-amphtml-disable-mediasession")){a=c.j.win;var f=c.C,g=c.na,l=c.ma,k=a.navigator;"mediaSession"in k&&a.MediaMetadata&&(k.mediaSession.metadata=new a.MediaMetadata(xa),za(b,f),k.mediaSession.metadata=new a.MediaMetadata(f),k.mediaSession.setActionHandler("play",g),k.mediaSession.setActionHandler("pause",l))}c.P.beginSession();c.A&&c.F.beginSession();T(c,"video-play")});P(b.element,"muted",function(){return c.w=
!0});P(b.element,"unmuted",function(){return c.w=!1});P(b.element,"ended",function(){T(c,"video-ended")});P(b.element,"ad_start",function(){return T(c,"video-ad-start")});P(b.element,"ad_end",function(){return T(c,"video-ad-end")});P(b.element,"amp:video:tick",function(a){a=a.data;var b=a.eventType;b&&Qa(c,b,a.vars)});b.signals().whenSignal("registered").then(function(){var a=c.video.element;(c.video.preimplementsAutoFullscreen()||!a.hasAttribute("rotate-to-fullscreen")?0:z(c.video.isInteractive(),
"Only interactive videos are allowed to enter fullscreen on rotate. Set the `controls` attribute on %s to enable.",a))&&c.K.registerForAutoFullscreen(c);c.updateVisibility();c.hasAutoplay&&Ra(c)});this.Y=v(function(){var a="firstPlay",b=ua(c.j.win,a,B({})),f=c.video.element,g=C(f,"action");g.trigger(f,a,b,1)});Sa(this)}h=Na.prototype;h.dispose=function(){this.Z().stop()};
function Qa(a,b,c){var d={},e=(d["__amp:eventType"]=b,d);Object.keys(c).forEach(function(a){e["custom_"+a]=c[a]});T(a,"video-hosted-custom",e)}function Sa(a){a.video.signals().whenSignal("autoplay-delegated").then(function(){a.V=!1;a.B&&a.video.pause()})}h.isMuted=function(){return this.w};
h.videoLoaded=function(){this.ba=!0;this.S=this.video.element.querySelector("video, iframe");if(!this.video.preimplementsMediaSessionAPI()){this.video.getMetadata()&&(this.C=A(this.video.getMetadata()));var a=this.j.win.document;if(!this.C.artwork||0==this.C.artwork.length){var b;(b=ya(a))||(b=(b=a.querySelector('meta[property="og:image"]'))?b.getAttribute("content"):void 0);b||(b=(b=a.querySelector('link[rel="shortcut icon"]')||a.querySelector('link[rel="icon"]'))?b.getAttribute("href"):void 0);
b&&(this.C.artwork=[{src:b}])}!this.C.title&&(a=this.video.element.getAttribute("title")||this.video.element.getAttribute("aria-label")||this.S.getAttribute("title")||this.S.getAttribute("aria-label")||a.title)&&(this.C.title=a)}this.Z().start();this.updateVisibility();this.A&&Ta(this)};
function Ta(a){a.j.isVisible()&&a.U().then(function(b){var c=a.hasAutoplay&&!a.userInteracted();c&&b?a.V&&(a.A?(a.F.beginSession(),a.video.play(!0),a.ca=!0):(a.B&&a.F.endSession(),a.video.pause(),a.T=!0)):a.A?a.F.beginSession():a.B&&a.F.endSession()})}function Ra(a){a.video.isInteractive()&&a.video.hideControls();a.U().then(function(b){!b&&a.video.isInteractive()?a.video.showControls():(a.video.mute(),Ua(a))})}
function Ua(a){var b=a.video,c=a.video,d=c.element;c=c.win;if(!d.hasAttribute("noaudio")&&!d.signals().get("user-interacted")){var e=Ka(c,d),f=function(a){b.mutateElement(function(){e.classList.toggle("amp-video-eq-play",a)})};b.mutateElement(function(){d.appendChild(e)});var g=[P(d,"pause",function(){return f(!1)}),P(d,"playing",function(){return f(!0)})];b.signals().whenSignal("user-interacted").then(function(){var b=a.video,c=b.element;a.Y();b.isInteractive()&&b.showControls();b.unmute();g.forEach(function(a){a()});
b=c.querySelector(".amp-video-eq");c=c.querySelector("i-amphtml-video-mask");b&&J(b);c&&J(c)});if(b.isInteractive()){var l=Ja(d),k=function(a){b.mutateElement(function(){var b=a;void 0===b&&(b=l.hasAttribute("hidden"));b?l.removeAttribute("hidden"):l.setAttribute("hidden","")})};b.hideControls();b.mutateElement(function(){d.appendChild(l)});[P(l,"click",function(){return L(b)}),P(d,"ad_start",function(){k(!1);b.showControls()}),P(d,"ad_end",function(){k(!0);b.hideControls()}),P(d,"unmuted",function(){return L(b)})].forEach(function(a){return g.push(a)})}}}
h.updateVisibility=function(a){var b=this.A;if(a)this.A=!0;else{var c=this.video.element.getIntersectionChangeEntry().intersectionRatio;this.A=.5<=(u(c)?c:0)}this.A!=b&&this.ba&&Ta(this)};h.getPlayingState=function(){return this.B?this.B&&this.ca&&!this.userInteracted()?"playing_auto":"playing_manual":"paused"};h.userInteracted=function(){return null!=this.video.signals().get("user-interacted")};
h.getAnalyticsDetails=function(){var a=this,b=this.video;return this.U().then(function(c){var d=b.element.getLayoutBox(),e=d.width;d=d.height;var f=a.hasAutoplay&&c,g=b.getPlayedRanges(),l=g.reduce(function(a,b){return a+b[1]-b[0]},0);return{autoplay:f,currentTime:b.getCurrentTime(),duration:b.getDuration(),height:d,id:b.element.id,muted:a.w,playedTotal:l,playedRangesJson:JSON.stringify(g),state:a.getPlayingState(),width:e}})};
function U(a,b){var c=this;this.K=b;this.j=a;this.D=this.G=null;this.h=[];this.l=[];this.H=function(){return Va(c)};this.la=function(a){return"playing_manual"==c.K.getPlayingState(a)};this.ka=function(a,b){a=a.element.getIntersectionChangeEntry();var d=a.intersectionRatio;a=a.boundingClientRect;var e=b.element.getIntersectionChangeEntry();b=e.boundingClientRect;d-=e.intersectionRatio;.1<Math.abs(d)?a=d:(e=I(c.j,"viewport"),d=Wa(e,a),e=Wa(e,b),a=d<e||d>e?d-e:a.top-b.top);return a};Xa(this);Ya(this)}
U.prototype.dispose=function(){this.l.forEach(function(a){return a()});this.l.length=0};U.prototype.register=function(a){a=a.video;var b=a.element;if("video"==b.querySelector("video, iframe").tagName.toLowerCase())var c=!0;else c=K(this.j.win),c=c.isIos()||c.isSafari()?!!{"amp-dailymotion":!0,"amp-ima-video":!0}[b.tagName.toLowerCase()]:!0;c&&(this.h.push(a),P(b,"pause",this.H),P(b,"playing",this.H),P(b,"ended",this.H),a.signals().whenSignal("user-interacted").then(this.H),Va(this))};
function Ya(a){function b(){a.G=null}var c=a.j.getRootNode();a.l.push(P(c,"webkitfullscreenchange",b),P(c,"mozfullscreenchange",b),P(c,"fullscreenchange",b),P(c,"MSFullscreenChange",b))}U.prototype.isInLandscape=function(){var a=this.j.win;return a.screen&&"orientation"in a.screen?ja(a.screen.orientation.type,"landscape"):90==Math.abs(a.orientation)};
function Xa(a){var b=a.j.win,c=b.screen;if(c&&"orientation"in c){var d=c.orientation;a.l.push(P(d,"change",function(){return Za(a)}))}a.l.push(P(b,"orientationchange",function(){return Za(a)}))}function Za(a){a.isInLandscape()?null!=a.D&&$a(a,a.D):a.G&&ab(a,a.G)}function $a(a,b){var c=K(a.j.win);a.G=b;c.isAndroid()&&c.isChrome()?b.fullscreenEnter():bb(a,b).then(function(){return b.fullscreenEnter()})}function ab(a,b){a.G=null;bb(a,b,"center").then(function(){return b.fullscreenExit()})}
function bb(a,b,c){c=void 0===c?null:c;var d=b.element,e=I(a.j,"viewport");return cb(a).then(function(){var a=d.getIntersectionChangeEntry().boundingClientRect,b=a,l=b.top;b=b.bottom;var k=e.getSize().height,n=0<=l&&b<=k;return n?Promise.resolve():e.animateScrollIntoView(d,c?c:b>k?"bottom":"top")})}function cb(a){var b=330;return H(a.j.win,"timer").promise(b)}
function Va(a){if(a.isInLandscape())return a.D;a.D=null;var b=a.h.filter(a.la).sort(a.ka)[0];if(b){var c=b.element.getIntersectionChangeEntry().intersectionRatio;.5<=c&&(a.D=b)}return a.D}function Wa(a,b){var c=b.top+b.height/2,d=a.getSize().height/2;return Math.abs(c-d)}function V(a,b){this.N=H(a,"timer");this.I=b;this.l=null;this.O=this.aa=0}
V.prototype.start=function(){var a=this,b=this.I.video.element;this.stop();this.l=this.l||[];db(this)?eb(this,this.O):this.l.push(va(b,"loadedmetadata",function(){db(a)&&eb(a,a.O)}));this.l.push(P(b,"ended",function(){db(a)&&fb(a,100)}))};V.prototype.stop=function(){if(this.l){for(;0<this.l.length;)this.l.pop().call();this.O++}};
function db(a){var b=a.I.video,c=b.getDuration();if(!c||isNaN(c)||0>=c)return!1;if(250>50*c){var d=5;a.pa("This video is too short for `video-percentage-played`. Reports may be innacurate. For best results, use videos over",d,"seconds long.",b.element)}return!0}V.prototype.pa=function(a){for(var b=[],c=0;c<arguments.length;++c)b[c-0]=arguments[c];x().warn.apply(x(),["video-manager"].concat(b))};
function eb(a,b){if(b==a.O){var c=a.I,d=a.N,e=c.video,f=function(){return eb(a,b)};if("paused"==c.getPlayingState())d.delay(f,500);else{c=e.getDuration();var g=Ea(50*c),l=e.getCurrentTime()/c*100,k=5*Math.floor(l/5);u(k);fb(a,k);d.delay(f,g)}}}function fb(a,b){0>=b||a.aa==b||(a.aa=b,T(a.I,"video-percentage-played",{normalizedPercentage:b.toString()}))}function T(a,b,c){var d=a.video;a.getAnalyticsDetails().then(function(a){c&&Object.assign(a,c);d.element.dispatchCustomEvent(b,a)})};function W(a){a=AMP.BaseElement.call(this,a)||this;a.M="unstarted";a.ha=null;a.o=null;a.w=!1;a.L=null;a.da=null;a.fa=null;a.ga=null;a.$=!1;return a}var X=AMP.BaseElement;W.prototype=aa(X.prototype);W.prototype.constructor=W;if(da)da(W,X);else for(var Y in X)if("prototype"!=Y)if(Object.defineProperties){var gb=Object.getOwnPropertyDescriptor(X,Y);gb&&Object.defineProperty(W,Y,gb)}else W[Y]=X[Y];W.ra=X.prototype;h=W.prototype;
h.preconnectCallback=function(a){this.preconnect.url("https://www.dailymotion.com",a);this.preconnect.url("https://static1.dmcdn.net",a)};h.supportsPlatform=function(){return!0};h.isInteractive=function(){return!0};h.isLayoutSupported=function(a){return"fixed"==a||"fixed-height"==a||"responsive"==a||"fill"==a||"flex-item"==a||"fluid"==a||"intrinsic"==a};h.viewportCallback=function(a){this.element.dispatchCustomEvent("amp:video:visibility",{visible:a})};
h.buildCallback=function(){this.ha=z(this.element.getAttribute("data-videoid"),"The data-videoid attribute is required for <amp-dailymotion> %s",this.element);var a=F(this.element),b=G(a),c=na(b),d=c["video-manager"];d||(d=c["video-manager"]={obj:null,promise:null,resolve:null,reject:null,context:null,ctor:null});d.ctor||d.obj||(d.ctor=La,d.context=a,d.resolve&&E(b,"video-manager"));I(this.element,"video-manager").register(this);var e=new ea;this.L=e.promise;this.da=e.resolve;var f=new ea;this.fa=
f.promise;this.ga=f.resolve};h.layoutCallback=function(){var a=hb(this),b=this.element,c=N(b)(qa);this.propagateAttributes(["referrerpolicy"],c);c.src=C(b,"url").assertHttpsUrl(a,b);this.applyFillContent(c);b.appendChild(c);this.o=c;P(this.win,"message",this.oa.bind(this));return this.loadPromise(this.o)};
h.oa=function(a){var b=this.o;if(b&&a.source==b.contentWindow&&"https://www.dailymotion.com"==a.origin){var c=a.data;if(c&&a.type&&"message"==a.type&&(a=r(c),void 0!==a))switch(b={},ra(this.element,a.event,(b.apiready="load",b.end=["ended","pause"],b.pause="pause",b.play="playing",b)),a.event){case "apiready":this.da(!0);break;case "end":this.M="pause";break;case "pause":case "play":this.M=a.event;break;case "volumechange":a=0==a.volume||"true"==a.muted;if("unstarted"==this.M||this.w!=a)this.w=a,
this.element.dispatchCustomEvent(a?"muted":"unmuted");break;case "progress":this.ga(!0);break;case "fullscreenchange":this.$="true"==a.fullscreen}}};function Z(a,b,c){var d="https://www.dailymotion.com";a.L.then(function(){if(a.o&&a.o.contentWindow){var e=JSON.stringify(B({command:b,parameters:c||[]}));a.o.contentWindow.postMessage(e,d)}})}
function hb(a){var b="https://www.dailymotion.com/embed/video/"+encodeURIComponent(a.ha||"")+"?api=1&html=1&app=amp",c="mute endscreen-enable sharing-enable start ui-highlight ui-logo info".split(" ");c.forEach(function(c){var d=a.element.getAttribute("data-"+c);if(d){var e=b;d=encodeURIComponent(c)+"="+encodeURIComponent(d);b=ka(e,d,void 0)}});var d=oa(a.element);return b=ka(b,la(d))}h.pauseCallback=function(){this.pause()};
h.play=function(a){var b=this;Z(this,"play");a&&"pause"!=this.M&&this.fa.then(function(){Z(b,"play")})};h.pause=function(){Z(this,"pause")};h.mute=function(){var a=this;Z(this,"muted",[!0]);this.L.then(function(){a.element.dispatchCustomEvent("muted");a.w=!0})};h.unmute=function(){var a=this;Z(this,"muted",[!1]);this.L.then(function(){a.element.dispatchCustomEvent("unmuted");a.w=!1})};h.showControls=function(){Z(this,"controls",[!0])};h.hideControls=function(){Z(this,"controls",[!1])};
h.fullscreenEnter=function(){var a=K(this.win);if(a.isSafari()||a.isIos())Z(this,"fullscreen",[!0]);else if(this.o){a=this.o;var b=a.requestFullscreen||a.requestFullScreen||a.webkitRequestFullscreen||a.webkitEnterFullscreen||a.msRequestFullscreen||a.mozRequestFullScreen;b&&b.call(a)}};
h.fullscreenExit=function(){var a=K(this.win);if(a.isSafari()||a.isIos())Z(this,"fullscreen",[!1]);else if(this.o){a=this.o;var b=a.cancelFullScreen||a.exitFullscreen||a.webkitExitFullscreen||a.webkitCancelFullScreen||a.mozCancelFullScreen||a.msExitFullscreen;b?b.call(a):(a=a.ownerDocument)&&(b=a.cancelFullScreen||a.exitFullscreencancelFullScreen||a.webkitExitFullscreencancelFullScreen||a.webkitCancelFullScreencancelFullScreen||a.mozCancelFullScreencancelFullScreen||a.msExitFullscreen)&&b.call(a)}};
h.isFullscreen=function(){var a=K(this.win);if(a.isSafari()||a.isIos())a=this.$;else if(this.o){a=this.o;var b=a.webkitDisplayingFullscreen;a=void 0!==b?b:(b=a.ownerDocument)?(b.fullscreenElement||b.webkitFullscreenElement||b.mozFullScreenElement||b.webkitCurrentFullScreenElement)==a:!1}else a=!1;return a};h.getMetadata=function(){};h.preimplementsMediaSessionAPI=function(){return!1};h.preimplementsAutoFullscreen=function(){return!1};h.getCurrentTime=function(){return 0};h.getDuration=function(){return 1};
h.getPlayedRanges=function(){return[]};h.seekTo=function(){this.user().error("amp-dailymotion","`seekTo` not supported.")};(function(a){a.registerElement("amp-dailymotion",W)})(self.AMP);
})});

//# sourceMappingURL=amp-dailymotion-0.1.js.map