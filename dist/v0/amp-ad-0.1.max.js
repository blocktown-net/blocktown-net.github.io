(self.AMP=self.AMP||[]).push({n:"amp-ad",v:"1910151804560",f:(function(AMP,_){
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getA4ARegistry = getA4ARegistry;
exports.signingServerURLs = void 0;

var _cloudflareA4aConfig = require("../extensions/amp-ad-network-cloudflare-impl/0.1/cloudflare-a4a-config");

var _gmosspA4aConfig = require("../extensions/amp-ad-network-gmossp-impl/0.1/gmossp-a4a-config");

var _object = require("../src/utils/object");

var _tripleliftA4aConfig = require("../extensions/amp-ad-network-triplelift-impl/0.1/triplelift-a4a-config");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Registry for A4A (AMP Ads for AMPHTML pages) "is supported" predicates.
 * If an ad network, {@code ${NETWORK}}, is registered in this object, then the
 * {@code <amp-ad type="${NETWORK}">} implementation will look up its predicate
 * here. If there is a predicate and it and returns {@code true}, then
 * {@code amp-ad} will attempt to render the ad via the A4A pathway (fetch
 * ad creative via early XHR CORS request; verify that it is validated AMP;
 * and then render directly in the host page by splicing into the host DOM).
 * Otherwise, it will attempt to render the ad via the existing "3p iframe"
 * pathway (delay load into a cross-domain iframe).
 *
 * @type {!Object<string, function(!Window, !Element): boolean>}
 */
var a4aRegistry;
/**
 * Returns the a4a registry map
 * @return {Object}
 */

function getA4ARegistry() {
  if (!a4aRegistry) {
    a4aRegistry = (0, _object.map)({
      'adsense': function adsense() {
        return true;
      },
      'adzerk': function adzerk() {
        return true;
      },
      'doubleclick': function doubleclick() {
        return true;
      },
      'triplelift': _tripleliftA4aConfig.tripleliftIsA4AEnabled,
      'cloudflare': _cloudflareA4aConfig.cloudflareIsA4AEnabled,
      'gmossp': _gmosspA4aConfig.gmosspIsA4AEnabled,
      'fake': function fake() {
        return true;
      } // TODO: Add new ad network implementation "is enabled" functions here.
      // Note: if you add a function here that requires a new "import", above,
      // you'll probably also need to add a whitelist exception to
      // build-system/test-configs/dep-check-config.js in the
      // "filesMatching: 'ads/**/*.js'" rule.

    });
  }

  return a4aRegistry;
}
/**
 * An object mapping signing server names to their corresponding URLs.
 * @type {!Object<string, string>}
 */


var signingServerURLs = {
  'google': 'https://cdn.ampproject.org/amp-ad-verifying-keyset.json',
  'google-dev': 'https://cdn.ampproject.org/amp-ad-verifying-keyset-dev.json',
  'cloudflare': 'https://amp.cloudflare.com/amp-ad-verifying-keyset.json',
  'cloudflare-dev': 'https://amp.cloudflare.com/amp-ad-verifying-keyset-dev.json'
};
exports.signingServerURLs = signingServerURLs;

},{"../extensions/amp-ad-network-cloudflare-impl/0.1/cloudflare-a4a-config":8,"../extensions/amp-ad-network-gmossp-impl/0.1/gmossp-a4a-config":9,"../extensions/amp-ad-network-triplelift-impl/0.1/triplelift-a4a-config":10,"../src/utils/object":67}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.adConfig = void 0;

var _json = require("../src/json");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @typedef {{
 *   prefetch: (string|undefined),
 *   preconnect: (string|undefined),
 *   renderStartImplemented: (boolean|undefined),
 *   clientIdScope: (string|undefined),
 *   clientIdCookieName: (string|undefined),
 *   consentHandlingOverride: (boolean|undefined),
 *   remoteHTMLDisabled: (boolean|undefined),
 *   fullWidthHeightRatio: (number|undefined),
 * }}
 */
var AdNetworkConfigDef;
/**
 * The config of each ad network.
 * Please keep the list alphabetic order.
 *
 * yourNetworkName: {  // This is the "type" attribute of <amp-ad>
 *
 *   // List of URLs for prefetch
 *   prefetch: string|array
 *
 *   // List of hosts for preconnect
 *   preconnect: string|array
 *
 *   // The scope used to provide CIDs to ads
 *   clientIdScope: string
 *
 *   // The cookie name to store the CID. In absence, `clientIdScope` is used.
 *   clientIdCookieName: string
 *
 *   // If the ad network is willing to override the consent handling, which
 *   // by default is blocking ad load until the consent is accepted.
 *   consentHandlingOverride: boolean
 *
 *   // Whether render-start API has been implemented
 *   // We highly recommend all networks to implement the API,
 *   // see details in the README.md
 *   renderStartImplemented: boolean
 *
 *   // The width / height ratio for full width ad units.
 *   // If absent, it means the network does not support full width ad units.
 *   // Example value: 1.2
 *   fullWidthHeightRatio: number
 * }
 *
 * @const {!Object<string, !JsonObject>}
 */

var adConfig = JSON.parse("{\"_ping_\":{\"renderStartImplemented\":true,\"clientIdScope\":\"_PING_\",\"consentHandlingOverride\":true},\"1wo\":{},\"24smi\":{\"prefetch\":\"https://jsn.24smi.net/smi.js\",\"preconnect\":\"https://data.24smi.net\"},\"a8\":{\"prefetch\":\"https://statics.a8.net/amp/ad.js\",\"renderStartImplemented\":true},\"a9\":{\"prefetch\":\"https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US\"},\"accesstrade\":{\"prefetch\":\"https://h.accesstrade.net/js/amp/amp.js\"},\"adagio\":{\"prefetch\":\"https://js-ssl.neodatagroup.com/adagio_amp.js\",\"preconnect\":[\"https://ad-aws-it.neodatagroup.com\",\"https://tracker.neodatagroup.com\"],\"renderStartImplemented\":true},\"adblade\":{\"prefetch\":\"https://web.adblade.com/js/ads/async/show.js\",\"preconnect\":[\"https://staticd.cdn.adblade.com\",\"https://static.adblade.com\"],\"renderStartImplemented\":true},\"adbutler\":{\"prefetch\":\"https://servedbyadbutler.com/app.js\"},\"adform\":{},\"adfox\":{\"prefetch\":\"https://yastatic.net/pcode/adfox/loader.js\",\"renderStartImplemented\":true},\"adgeneration\":{\"prefetch\":\"https://i.socdm.com/sdk/js/adg-script-loader.js\"},\"adglare\":{\"renderStartImplemented\":true},\"adhese\":{\"renderStartImplemented\":true},\"adincube\":{\"renderStartImplemented\":true},\"adition\":{},\"adman\":{},\"admanmedia\":{\"renderStartImplemented\":true},\"admixer\":{\"renderStartImplemented\":true,\"preconnect\":[\"https://inv-nets.admixer.net\",\"https://cdn.admixer.net\"]},\"adocean\":{\"consentHandlingOverride\":true},\"adop\":{},\"adpicker\":{\"renderStartImplemented\":true},\"adplugg\":{\"prefetch\":\"https://www.adplugg.com/serve/js/ad.js\",\"renderStartImplemented\":true},\"adpon\":{\"prefetch\":\"https://ad.adpon.jp/amp.js\",\"clientIdScope\":\"AMP_ECID_ADPON\"},\"adreactor\":{},\"adsensor\":{\"prefetch\":\"https://wfpscripts.webspectator.com/amp/adsensor-amp.js\",\"clientIdScope\":\"amp_ecid_adensor\",\"renderStartImplemented\":true},\"adsloom\":{\"clientIdScope\":\"AMP_ECID_ADSLOOM\"},\"adsnative\":{\"prefetch\":\"https://static.adsnative.com/static/js/render.v1.js\",\"preconnect\":\"https://api.adsnative.com\"},\"adspeed\":{\"preconnect\":\"https://g.adspeed.net\",\"renderStartImplemented\":true},\"adspirit\":{},\"adstir\":{\"prefetch\":\"https://js.ad-stir.com/js/adstir_async.js\",\"preconnect\":\"https://ad.ad-stir.com\"},\"adstyle\":{\"prefetch\":\"https://widgets.ad.style/amp.js\",\"preconnect\":[\"https://w.ad.style\"]},\"adtech\":{\"prefetch\":\"https://s.aolcdn.com/os/ads/adsWrapper3.js\",\"preconnect\":[\"https://mads.at.atwola.com\",\"https://aka-cdn.adtechus.com\"]},\"adthrive\":{\"prefetch\":[\"https://www.googletagservices.com/tag/js/gpt.js\"],\"preconnect\":[\"https://partner.googleadservices.com\",\"https://securepubads.g.doubleclick.net\",\"https://tpc.googlesyndication.com\"],\"renderStartImplemented\":true},\"adunity\":{\"preconnect\":[\"https://content.adunity.com\"],\"renderStartImplemented\":true},\"aduptech\":{\"prefetch\":\"https://s.d.adup-tech.com/jsapi\",\"preconnect\":[\"https://d.adup-tech.com\",\"https://m.adup-tech.com\"],\"renderStartImplemented\":true},\"adventive\":{\"preconnect\":[\"https://ads.adventive.com\",\"https://amp.adventivedev.com\"],\"renderStartImplemented\":true},\"adverline\":{\"prefetch\":\"https://ads.adverline.com/richmedias/amp.js\",\"preconnect\":[\"https://adnext.fr\"],\"renderStartImplemented\":true},\"adverticum\":{},\"advertserve\":{\"renderStartImplemented\":true},\"adyoulike\":{\"consentHandlingOverride\":true,\"prefetch\":\"https://fo-static.omnitagjs.com/amp.js\",\"renderStartImplemented\":true},\"adzerk\":{},\"affiliateb\":{\"prefetch\":\"https://track.affiliate-b.com/amp/a.js\",\"renderStartImplemented\":true},\"aja\":{\"prefetch\":[\"https://cdn.as.amanad.adtdp.com/sdk/asot-amp.js\",\"https://cdn.as.amanad.adtdp.com/sdk/asot-v2.js\"],\"preconnect\":[\"https://ad.as.amanad.adtdp.com\"]},\"appvador\":{\"prefetch\":[\"https://cdn.apvdr.com/js/VastAdUnit.min.js\",\"https://cdn.apvdr.com/js/VideoAd.min.js\",\"https://cdn.apvdr.com/js/VideoAd3PAS.min.js\",\"https://cdn.apvdr.com/js/VideoAdAutoPlay.min.js\",\"https://cdn.apvdr.com/js/VideoAdNative.min.js\"],\"renderStartImplemented\":true},\"amoad\":{\"prefetch\":[\"https://j.amoad.com/js/a.js\",\"https://j.amoad.com/js/n.js\"],\"preconnect\":[\"https://d.amoad.com\",\"https://i.amoad.com\",\"https://m.amoad.com\",\"https://v.amoad.com\"]},\"aniview\":{\"renderStartImplemented\":true},\"appnexus\":{\"prefetch\":\"https://acdn.adnxs.com/ast/ast.js\",\"preconnect\":\"https://ib.adnxs.com\",\"renderStartImplemented\":true},\"atomx\":{\"prefetch\":\"https://s.ato.mx/p.js\"},\"beaverads\":{\"renderStartImplemented\":true},\"beopinion\":{\"prefetch\":\"https://widget.beopinion.com/sdk.js\",\"preconnect\":[\"https://t.beopinion.com\",\"https://s.beopinion.com\",\"https://data.beopinion.com\"],\"renderStartImplemented\":true},\"bidtellect\":{},\"blade\":{\"prefetch\":\"https://sdk.streamrail.com/blade/sr.blade.js\",\"renderStartImplemented\":true},\"brainy\":{},\"bringhub\":{\"renderStartImplemented\":true,\"preconnect\":[\"https://static.bh-cdn.com\",\"https://core-api.bringhub.io\"]},\"broadstreetads\":{\"prefetch\":\"https://cdn.broadstreetads.com/init-2.min.js\"},\"caajainfeed\":{\"prefetch\":[\"https://cdn.amanad.adtdp.com/sdk/ajaamp.js\"],\"preconnect\":[\"https://ad.amanad.adtdp.com\"]},\"capirs\":{\"renderStartImplemented\":true},\"caprofitx\":{\"prefetch\":[\"https://cdn.caprofitx.com/pfx.min.js\",\"https://cdn.caprofitx.com/tags/amp/profitx_amp.js\"],\"preconnect\":\"https://ad.caprofitx.adtdp.com\"},\"cedato\":{\"renderStartImplemented\":true},\"chargeads\":{},\"colombia\":{\"prefetch\":\"https://static.clmbtech.com/ad/commons/js/colombia-amp.js\"},\"connatix\":{\"renderStartImplemented\":true},\"contentad\":{},\"criteo\":{\"prefetch\":\"https://static.criteo.net/js/ld/publishertag.js\",\"preconnect\":\"https://cas.criteo.com\"},\"csa\":{\"prefetch\":\"https://www.google.com/adsense/search/ads.js\"},\"dable\":{\"preconnect\":[\"https://static.dable.io\",\"https://api.dable.io\",\"https://images.dable.io\"],\"renderStartImplemented\":true},\"directadvert\":{\"renderStartImplemented\":true},\"distroscale\":{\"preconnect\":[\"https://c.jsrdn.com\",\"https://s.jsrdn.com\",\"https://i.jsrdn.com\"],\"renderStartImplemented\":true},\"dotandads\":{\"prefetch\":\"https://amp.ad.dotandad.com/dotandadsAmp.js\",\"preconnect\":\"https://bal.ad.dotandad.com\"},\"dynad\":{\"preconnect\":[\"https://t.dynad.net\",\"https://tm.jsuol.com.br\"]},\"eadv\":{\"renderStartImplemented\":true,\"clientIdScope\":\"AMP_ECID_EADV\",\"prefetch\":[\"https://www.eadv.it/track/esr.min.js\",\"https://www.eadv.it/track/ead.min.js\"]},\"eas\":{\"prefetch\":\"https://amp.emediate.eu/amp.v0.js\",\"renderStartImplemented\":true},\"engageya\":{},\"epeex\":{},\"eplanning\":{\"prefetch\":\"https://us.img.e-planning.net/layers/epl-amp.js\"},\"ezoic\":{\"prefetch\":[\"https://www.googletagservices.com/tag/js/gpt.js\",\"https://g.ezoic.net/ezoic/ampad.js\"],\"clientIdScope\":\"AMP_ECID_EZOIC\",\"consentHandlingOverride\":true},\"f1e\":{\"prefetch\":\"https://img.ak.impact-ad.jp/util/f1e_amp.min.js\"},\"f1h\":{\"preconnect\":\"https://img.ak.impact-ad.jp\",\"renderStartImplemented\":true},\"fake\":{},\"felmat\":{\"prefetch\":\"https://t.felmat.net/js/fmamp.js\",\"renderStartImplemented\":true},\"flite\":{},\"fluct\":{\"preconnect\":[\"https://cdn-fluct.sh.adingo.jp\",\"https://s.sh.adingo.jp\",\"https://i.adingo.jp\"]},\"forkmedia\":{\"prefetch\":\"https://delivery.forkcdn.com/rappio/inread/v1.1/amp/inread.js\",\"renderStartImplemented\":true},\"freewheel\":{\"prefetch\":\"https://cdn.stickyadstv.com/prime-time/fw-amp.min.js\",\"renderStartImplemented\":true},\"fusion\":{\"prefetch\":\"https://assets.adtomafusion.net/fusion/latest/fusion-amp.min.js\"},\"genieessp\":{\"prefetch\":\"https://js.gsspcln.jp/l/amp.js\"},\"giraff\":{\"renderStartImplemented\":true},\"gmossp\":{\"prefetch\":\"https://cdn.gmossp-sp.jp/ads/amp.js\"},\"gumgum\":{\"prefetch\":\"https://js.gumgum.com/slot.js\",\"renderStartImplemented\":true},\"holder\":{\"prefetch\":\"https://i.holder.com.ua/js2/holder/ajax/ampv1.js\",\"preconnect\":\"https://h.holder.com.ua\",\"renderStartImplemented\":true},\"ibillboard\":{},\"idealmedia\":{\"renderStartImplemented\":true,\"preconnect\":[\"https://jsc.idealmedia.io\",\"https://servicer.idealmedia.io\",\"https://s-img.idealmedia.io/\"]},\"imedia\":{\"prefetch\":\"https://i.imedia.cz/js/im3.js\",\"renderStartImplemented\":true},\"imobile\":{\"prefetch\":\"https://spamp.i-mobile.co.jp/script/amp.js\",\"preconnect\":\"https://spad.i-mobile.co.jp\"},\"imonomy\":{\"renderStartImplemented\":true},\"improvedigital\":{},\"industrybrains\":{\"prefetch\":\"https://web.industrybrains.com/js/ads/async/show.js\",\"preconnect\":[\"https://staticd.cdn.industrybrains.com\",\"https://static.industrybrains.com\"],\"renderStartImplemented\":true},\"inmobi\":{\"prefetch\":\"https://cf.cdn.inmobi.com/ad/inmobi.secure.js\",\"renderStartImplemented\":true},\"innity\":{\"prefetch\":\"https://cdn.innity.net/admanager.js\",\"preconnect\":\"https://as.innity.com\",\"renderStartImplemented\":true},\"insticator\":{\"preconnect\":\"https://d3lcz8vpax4lo2.cloudfront.net\",\"renderStartImplemented\":true},\"invibes\":{\"prefetch\":\"https://k.r66net.com/GetAmpLink\",\"renderStartImplemented\":true,\"consentHandlingOverride\":true},\"ix\":{\"prefetch\":[\"https://js-sec.indexww.com/apl/amp.js\"],\"preconnect\":\"https://as-sec.casalemedia.com\",\"renderStartImplemented\":true},\"jubna\":{},\"kargo\":{},\"kiosked\":{\"renderStartImplemented\":true},\"kixer\":{\"prefetch\":\"https://cdn.kixer.com/ad/load.js\",\"renderStartImplemented\":true},\"kuadio\":{},\"lentainform\":{\"renderStartImplemented\":true,\"preconnect\":[\"https://jsc.lentainform.com\",\"https://servicer.lentainform.com\",\"https://s-img.lentainform.com\"]},\"ligatus\":{\"prefetch\":\"https://ssl.ligatus.com/render/ligrend.js\",\"renderStartImplemented\":true},\"lockerdome\":{\"prefetch\":\"https://cdn2.lockerdomecdn.com/_js/amp.js\",\"renderStartImplemented\":true},\"logly\":{\"preconnect\":[\"https://l.logly.co.jp\",\"https://cdn.logly.co.jp\"],\"renderStartImplemented\":true},\"loka\":{\"prefetch\":\"https://loka-cdn.akamaized.net/scene/amp.js\",\"preconnect\":[\"https://scene-front.lokaplatform.com\",\"https://loka-materials.akamaized.net\"],\"renderStartImplemented\":true},\"mads\":{\"prefetch\":\"https://eu2.madsone.com/js/tags.js\"},\"mantis-display\":{\"prefetch\":\"https://assets.mantisadnetwork.com/mantodea.min.js\",\"preconnect\":[\"https://mantodea.mantisadnetwork.com\",\"https://res.cloudinary.com\",\"https://resize.mantisadnetwork.com\"]},\"mantis-recommend\":{\"prefetch\":\"https://assets.mantisadnetwork.com/recommend.min.js\",\"preconnect\":[\"https://mantodea.mantisadnetwork.com\",\"https://resize.mantisadnetwork.com\"]},\"mediaimpact\":{\"prefetch\":\"https://ec-ns.sascdn.com/diff/251/pages/amp_default.js\",\"preconnect\":[\"https://ww251.smartadserver.com\",\"https://static.sascdn.com/\"],\"renderStartImplemented\":true},\"medianet\":{\"preconnect\":\"https://contextual.media.net\",\"renderStartImplemented\":true},\"mediavine\":{\"prefetch\":\"https://amp.mediavine.com/wrapper.min.js\",\"preconnect\":[\"https://partner.googleadservices.com\",\"https://securepubads.g.doubleclick.net\",\"https://tpc.googlesyndication.com\"],\"renderStartImplemented\":true,\"consentHandlingOverride\":true},\"medyanet\":{\"renderStartImplemented\":true},\"meg\":{\"renderStartImplemented\":true},\"mgid\":{\"renderStartImplemented\":true,\"preconnect\":[\"https://jsc.mgid.com\",\"https://servicer.mgid.com\",\"https://s-img.mgid.com\"]},\"microad\":{\"prefetch\":\"https://j.microad.net/js/camp.js\",\"preconnect\":[\"https://s-rtb.send.microad.jp\",\"https://s-rtb.send.microadinc.com\",\"https://cache.send.microad.jp\",\"https://cache.send.microadinc.com\",\"https://deb.send.microad.jp\"]},\"miximedia\":{\"renderStartImplemented\":true},\"mixpo\":{\"prefetch\":\"https://cdn.mixpo.com/js/loader.js\",\"preconnect\":[\"https://player1.mixpo.com\",\"https://player2.mixpo.com\"]},\"monetizer101\":{\"renderStartImplemented\":true},\"mox\":{\"prefetch\":[\"https://ad.mox.tv/js/amp.min.js\",\"https://ad.mox.tv/mox/mwayss_invocation.min.js\"],\"renderStartImplemented\":true},\"mytarget\":{\"prefetch\":\"https://ad.mail.ru/static/ads-async.js\",\"renderStartImplemented\":true},\"mywidget\":{\"preconnect\":\"https://likemore-fe.go.mail.ru\",\"prefetch\":\"https://likemore-go.imgsmail.ru/widget_amp.js\",\"renderStartImplemented\":true},\"nativeroll\":{\"prefetch\":\"https://cdn01.nativeroll.tv/js/seedr-player.min.js\"},\"nativo\":{\"prefetch\":\"https://s.ntv.io/serve/load.js\"},\"navegg\":{\"renderStartImplemented\":true},\"nend\":{\"prefetch\":\"https://js1.nend.net/js/amp.js\",\"preconnect\":[\"https://output.nend.net\",\"https://img1.nend.net\"]},\"netletix\":{\"preconnect\":[\"https://call.netzathleten-media.de\"],\"renderStartImplemented\":true},\"noddus\":{\"prefetch\":\"https://noddus.com/amp_loader.js\",\"renderStartImplemented\":true},\"nokta\":{\"prefetch\":\"https://static.virgul.com/theme/mockups/noktaamp/ampjs.js\",\"renderStartImplemented\":true},\"nws\":{},\"onead\":{\"prefetch\":\"https://ad-specs.guoshipartners.com/static/js/onead-amp.min.js\",\"renderStartImplemented\":true},\"onnetwork\":{\"renderStartImplemented\":true},\"openadstream\":{},\"openx\":{\"prefetch\":\"https://www.googletagservices.com/tag/js/gpt.js\",\"preconnect\":[\"https://partner.googleadservices.com\",\"https://securepubads.g.doubleclick.net\",\"https://tpc.googlesyndication.com\"],\"renderStartImplemented\":true},\"opinary\":{},\"outbrain\":{\"renderStartImplemented\":true,\"prefetch\":\"https://widgets.outbrain.com/widgetAMP/outbrainAMP.min.js\",\"preconnect\":[\"https://odb.outbrain.com\"],\"consentHandlingOverride\":true},\"pixels\":{\"prefetch\":\"https://cdn.adsfactor.net/amp/pixels-amp.min.js\",\"clientIdCookieName\":\"__AF\",\"renderStartImplemented\":true},\"plista\":{},\"polymorphicads\":{\"prefetch\":\"https://www.polymorphicads.jp/js/amp.js\",\"preconnect\":[\"https://img.polymorphicads.jp\",\"https://ad.polymorphicads.jp\"],\"renderStartImplemented\":true},\"popin\":{\"renderStartImplemented\":true},\"postquare\":{},\"pressboard\":{\"renderStartImplemented\":true},\"promoteiq\":{},\"pubexchange\":{},\"pubguru\":{\"renderStartImplemented\":true},\"pubmatic\":{\"prefetch\":\"https://ads.pubmatic.com/AdServer/js/amp.js\"},\"pubmine\":{\"prefetch\":[\"https://s.pubmine.com/head.js\"],\"preconnect\":\"https://delivery.g.switchadhub.com\",\"renderStartImplemented\":true},\"puffnetwork\":{\"prefetch\":\"https://static.puffnetwork.com/amp_ad.js\",\"renderStartImplemented\":true},\"pulsepoint\":{\"prefetch\":\"https://ads.contextweb.com/TagPublish/getjs.static.js\",\"preconnect\":\"https://tag.contextweb.com\"},\"purch\":{\"prefetch\":\"https://ramp.purch.com/serve/creative_amp.js\",\"renderStartImplemented\":true},\"quoraad\":{\"prefetch\":\"https://a.quora.com/amp_ad.js\",\"preconnect\":\"https://ampad.quora.com\",\"renderStartImplemented\":true},\"rbinfox\":{\"renderStartImplemented\":true},\"readmo\":{\"renderStartImplemented\":true},\"realclick\":{\"renderStartImplemented\":true},\"recomad\":{\"renderStartImplemented\":true},\"relap\":{\"renderStartImplemented\":true},\"revcontent\":{\"prefetch\":\"https://labs-cdn.revcontent.com/build/amphtml/revcontent.amp.min.js\",\"preconnect\":[\"https://trends.revcontent.com\",\"https://cdn.revcontent.com\",\"https://img.revcontent.com\"],\"renderStartImplemented\":true},\"revjet\":{\"prefetch\":\"https://cdn.revjet.com/~cdn/JS/03/amp.js\",\"renderStartImplemented\":true},\"rfp\":{\"prefetch\":\"https://js.rfp.fout.jp/rfp-amp.js\",\"preconnect\":\"https://ad.rfp.fout.jp\",\"renderStartImplemented\":true},\"rnetplus\":{},\"rubicon\":{},\"runative\":{\"prefetch\":\"https://cdn.run-syndicate.com/sdk/v1/n.js\",\"renderStartImplemented\":true},\"sas\":{\"renderStartImplemented\":true},\"seedingalliance\":{},\"sekindo\":{\"renderStartImplemented\":true},\"sharethrough\":{\"renderStartImplemented\":true},\"shemedia\":{\"prefetch\":[\"https://securepubads.g.doubleclick.net/tag/js/gpt.js\",\"https://ads.shemedia.com/static/amp.js\"],\"preconnect\":[\"https://partner.googleadservices.com\",\"https://tpc.googlesyndication.com\",\"https://ads.blogherads.com\"],\"renderStartImplemented\":true},\"sklik\":{\"prefetch\":\"https://c.imedia.cz/js/amp.js\"},\"slimcutmedia\":{\"preconnect\":[\"https://sb.freeskreen.com\",\"https://static.freeskreen.com\",\"https://video.freeskreen.com\"],\"renderStartImplemented\":true},\"smartadserver\":{\"prefetch\":\"https://ec-ns.sascdn.com/diff/js/amp.v0.js\",\"preconnect\":\"https://static.sascdn.com\",\"renderStartImplemented\":true},\"smartclip\":{\"prefetch\":\"https://cdn.smartclip.net/amp/amp.v0.js\",\"preconnect\":\"https://des.smartclip.net\",\"renderStartImplemented\":true},\"smi2\":{\"renderStartImplemented\":true},\"smilewanted\":{\"prefetch\":\"https://prebid.smilewanted.com/amp/amp.js\",\"preconnect\":\"https://static.smilewanted.com\",\"renderStartImplemented\":true},\"sogouad\":{\"prefetch\":\"https://theta.sogoucdn.com/wap/js/aw.js\",\"renderStartImplemented\":true},\"sortable\":{\"prefetch\":\"https://www.googletagservices.com/tag/js/gpt.js\",\"preconnect\":[\"https://tags-cdn.deployads.com\",\"https://partner.googleadservices.com\",\"https://securepubads.g.doubleclick.net\",\"https://tpc.googlesyndication.com\"],\"renderStartImplemented\":true},\"sovrn\":{\"prefetch\":\"https://ap.lijit.com/www/sovrn_amp/sovrn_ads.js\"},\"speakol\":{\"renderStartImplemented\":true},\"spotx\":{\"preconnect\":\"https://js.spotx.tv\",\"renderStartImplemented\":true},\"strossle\":{\"preconnect\":[\"https://amp.spklw.com\",\"https://widgets.sprinklecontent.com\",\"https://images.sprinklecontent.com\"]},\"sunmedia\":{\"prefetch\":\"https://vod.addevweb.com/sunmedia/amp/ads/sunmedia.js\",\"preconnect\":\"https://static.addevweb.com\",\"renderStartImplemented\":true},\"svknative\":{\"renderStartImplemented\":true,\"prefetch\":\"https://widget.svk-native.ru/js/embed.js\"},\"swoop\":{\"prefetch\":\"https://www.swoop-amp.com/amp.js\",\"preconnect\":[\"https://www.swpsvc.com\",\"https://client.swpcld.com\"],\"renderStartImplemented\":true},\"taboola\":{},\"tcsemotion\":{\"prefetch\":\"https://ads.tcsemotion.com/www/delivery/amphb.js\",\"renderStartImplemented\":true},\"teads\":{\"prefetch\":\"https://a.teads.tv/media/format/v3/teads-format.min.js\",\"preconnect\":[\"https://cdn2.teads.tv\",\"https://t.teads.tv\",\"https://r.teads.tv\"],\"consentHandlingOverride\":true},\"torimochi\":{\"renderStartImplemented\":true},\"tracdelight\":{\"prefetch\":\"https://scripts.tracdelight.io/amp.js\",\"renderStartImplemented\":true},\"triplelift\":{},\"trugaze\":{\"clientIdScope\":\"__tg_amp\",\"renderStartImplemented\":true},\"uas\":{\"prefetch\":\"https://ads.pubmatic.com/AdServer/js/phoenix.js\"},\"ucfunnel\":{\"renderStartImplemented\":true},\"uzou\":{\"preconnect\":[\"https://speee-ad.akamaized.net\"],\"renderStartImplemented\":true},\"unruly\":{\"prefetch\":\"https://video.unrulymedia.com/native/native-loader.js\",\"renderStartImplemented\":true},\"valuecommerce\":{\"prefetch\":\"https://amp.valuecommerce.com/amp_bridge.js\",\"preconnect\":[\"https://ad.jp.ap.valuecommerce.com\"],\"renderStartImplemented\":true},\"videointelligence\":{\"preconnect\":\"https://s.vi-serve.com\",\"renderStartImplemented\":true},\"videonow\":{\"renderStartImplemented\":true},\"viralize\":{\"renderStartImplemented\":true},\"vmfive\":{\"prefetch\":\"https://man.vm5apis.com/dist/adn-web-sdk.js\",\"preconnect\":[\"https://vawpro.vm5apis.com\",\"https://vahfront.vm5apis.com\"],\"renderStartImplemented\":true},\"webediads\":{\"prefetch\":\"https://eu1.wbdds.com/amp.min.js\",\"preconnect\":[\"https://goutee.top\",\"https://mediaathay.org.uk\"],\"renderStartImplemented\":true},\"weborama-display\":{\"prefetch\":[\"https://cstatic.weborama.fr/js/advertiserv2/adperf_launch_1.0.0_scrambled.js\",\"https://cstatic.weborama.fr/js/advertiserv2/adperf_core_1.0.0_scrambled.js\"]},\"widespace\":{},\"wisteria\":{\"renderStartImplemented\":true},\"wpmedia\":{\"prefetch\":\"https://std.wpcdn.pl/wpjslib/wpjslib-amp.js\",\"preconnect\":[\"https://www.wp.pl\",\"https://v.wpimg.pl\"],\"renderStartImplemented\":true},\"xlift\":{\"prefetch\":\"https://cdn.x-lift.jp/resources/common/xlift_amp.js\",\"renderStartImplemented\":true},\"yahoo\":{\"prefetch\":\"https://s.yimg.com/os/ampad/display.js\",\"preconnect\":\"https://us.adserver.yahoo.com\"},\"yahoojp\":{\"prefetch\":[\"https://s.yimg.jp/images/listing/tool/yads/ydn/amp/amp.js\",\"https://yads.c.yimg.jp/js/yads.js\"],\"preconnect\":\"https://yads.yahoo.co.jp\"},\"yahoonativeads\":{\"renderStartImplemented\":true},\"yandex\":{\"prefetch\":\"https://yastatic.net/partner-code/loaders/context_amp.js\",\"renderStartImplemented\":true},\"yengo\":{\"renderStartImplemented\":true},\"yieldbot\":{\"prefetch\":[\"https://cdn.yldbt.com/js/yieldbot.intent.amp.js\",\"https://msg.yldbt.com/js/ybmsg.html\"],\"preconnect\":\"https://i.yldbt.com\"},\"yieldmo\":{\"prefetch\":\"https://static.yieldmo.com/ym.1.js\",\"preconnect\":[\"https://s.yieldmo.com\",\"https://ads.yieldmo.com\"],\"renderStartImplemented\":true},\"yieldone\":{\"prefetch\":\"https://img.ak.impact-ad.jp/ic/pone/commonjs/yone-amp.js\"},\"yieldpro\":{\"preconnect\":\"https://creatives.yieldpro.eu\",\"renderStartImplemented\":true},\"zedo\":{\"prefetch\":\"https://ss3.zedo.com/gecko/tag/Gecko.amp.min.js\",\"renderStartImplemented\":true},\"zen\":{\"prefetch\":\"https://zen.yandex.ru/widget-loader\",\"preconnect\":[\"https://yastatic.net/\"],\"renderStartImplemented\":true},\"zergnet\":{},\"zucks\":{\"preconnect\":[\"https://j.zucks.net.zimg.jp\",\"https://sh.zucks.net\",\"https://k.zucks.net\",\"https://static.zucks.net.zimg.jp\"]},\"baidu\":{\"prefetch\":\"https://dup.baidustatic.com/js/dm.js\",\"renderStartImplemented\":true}}");
exports.adConfig = adConfig;

},{"../src/json":42}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getAutoConfig = getAutoConfig;
exports.getPubControlConfig = getPubControlConfig;
exports.RawPublisherControlParams = exports.CoReConfig = exports.MIN_PUB_CONTROL_WIDTH_OF_DESKTOP = exports.ExternalCorePubVars = exports.LayoutType = void 0;

var _LAYOUT_ASPECT_RATIO_, _LAYOUT_TEXT_HEIGHT_M, _LAYOUT_AD_WIDTH_MAP;

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview CoRe responsive functions that are shared with Google tag code.
 * This file must not depend on any AMP-specific libraries, e.g. log. If
 * there is a need to pass any things for logging/reporting - the values
 * must be returned from exported functions.
 */

/**
 * Layout types for Content Recommendation responsive.
 * @enum {string}
 */
var LayoutType = {
  IMAGE_STACKED: 'image_stacked',
  IMAGE_SIDEBYSIDE: 'image_sidebyside',
  MOBILE_BANNER_IMAGE_SIDEBYSIDE: 'mobile_banner_image_sidebyside',
  PUB_CONTROL_IMAGE_STACKED: 'pub_control_image_stacked',
  PUB_CONTROL_IMAGE_SIDEBYSIDE: 'pub_control_image_sidebyside',
  PUB_CONTROL_IMAGE_CARD_STACKED: 'pub_control_image_card_stacked',
  PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE: 'pub_control_image_card_sidebyside',
  PUB_CONTROL_TEXT: 'pub_control_text',
  PUB_CONTROL_TEXT_CARD: 'pub_control_text_card',
  PEDESTAL: 'pedestal'
};
/**
 * The external name of Core Pub Control UI pub vars, which are used by
 * publishers directly.
 * @enum {string}
 */

exports.LayoutType = LayoutType;
var ExternalCorePubVars = {
  UI_TYPE: 'data-matched-content-ui-type',
  COLUMNS_NUM: 'data-matched-content-columns-num',
  ROWS_NUM: 'data-matched-content-rows-num'
};
/**
 * Minimum width of desktop responsive slot in CoRe responsive. We have
 * different logic for desktop and mobile slots. Any slot width equal or larger
 * than this will be adapted to the desktop logic while any slot width smaller
 * than this will be adapted to the mobile logic.
 * @const {number}
 */

exports.ExternalCorePubVars = ExternalCorePubVars;
var MIN_PUB_CONTROL_WIDTH_OF_DESKTOP = 468;
/**
 * The px padding.
 * @const {number}
 */

exports.MIN_PUB_CONTROL_WIDTH_OF_DESKTOP = MIN_PUB_CONTROL_WIDTH_OF_DESKTOP;
var PADDING = 8;
/**
 * The maximum dimension for CoRe Pub Control UI layout.
 * @const {number}
 */

var MAX_PUB_CONTROL_DIMENSION = 1500;
/**
 * The layout - aspect ratio map to calculate the size of each content
 * recommendation.
 * image_stacked: https://screenshot.googleplex.com/74S09gFO82b
 * image_sidebyside: https://screenshot.googleplex.com/FUgDSDvwcVo
 * image_card_stacked: https://screenshot.googleplex.com/vedjTonVaDT
 * image_card_sidebyside: https://screenshot.googleplex.com/v3qOZY61tFm
 * text: https://screenshot.googleplex.com/taeRQn7DUhq
 * text_card: https://screenshot.googleplex.com/ur45m96Tv0D
 * @const {!Object<!LayoutType, number>}
 */

var LAYOUT_ASPECT_RATIO_MAP = (_LAYOUT_ASPECT_RATIO_ = {}, _LAYOUT_ASPECT_RATIO_[LayoutType.IMAGE_STACKED] = 1 / 1.91, _LAYOUT_ASPECT_RATIO_[LayoutType.IMAGE_SIDEBYSIDE] = 1 / 3.82, _LAYOUT_ASPECT_RATIO_[LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE] = 1 / 3.82, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_IMAGE_STACKED] = 1 / 1.91, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE] = 1 / 3.82, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED] = 1 / 1.91, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE] = 1 / 3.74, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_TEXT] = 0, _LAYOUT_ASPECT_RATIO_[LayoutType.PUB_CONTROL_TEXT_CARD] = 0, _LAYOUT_ASPECT_RATIO_);
/**
 * The layout - height map to evaluate the height of title + url. Notice, this
 * mainly works only for stacked mode. In sidebyside mode, this height is
 * decided by the height of image. It equals to:
 * FontSize * LineHeight * NumTitle + Padding * 2 + UrlBoxHeight.
 * image_stacked: https://screenshot.googleplex.com/74S09gFO82b
 * image_card_stacked: https://screenshot.googleplex.com/vedjTonVaDT
 * @const {!Object<!LayoutType, number>}
 */

var LAYOUT_TEXT_HEIGHT_MAP = (_LAYOUT_TEXT_HEIGHT_M = {}, _LAYOUT_TEXT_HEIGHT_M[LayoutType.IMAGE_STACKED] = 80, _LAYOUT_TEXT_HEIGHT_M[LayoutType.IMAGE_SIDEBYSIDE] = 0, _LAYOUT_TEXT_HEIGHT_M[LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE] = 0, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_IMAGE_STACKED] = 80, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE] = 0, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED] = 85, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE] = 0, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_TEXT] = 80, _LAYOUT_TEXT_HEIGHT_M[LayoutType.PUB_CONTROL_TEXT_CARD] = 80, _LAYOUT_TEXT_HEIGHT_M);
/**
 * The layout - minimal width map for pub control UIs. We will adjust column
 * numbers according to minimal width.
 * @const {!Object<!LayoutType, number>}
 */

var LAYOUT_AD_WIDTH_MAP = (_LAYOUT_AD_WIDTH_MAP = {}, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_IMAGE_STACKED] = 100, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE] = 200, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_IMAGE_CARD_STACKED] = 150, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_IMAGE_CARD_SIDEBYSIDE] = 250, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_TEXT] = 100, _LAYOUT_AD_WIDTH_MAP[LayoutType.PUB_CONTROL_TEXT_CARD] = 150, _LAYOUT_AD_WIDTH_MAP);
var PUB_CONTROL_LAYOUT_PREFIX = 'pub_control_';
var PUB_CONTROL_EXAMPLE = '\n ' + 'data-matched-content-rows-num="4,2"\n' + 'data-matched-content-columns-num="1,6"\n' + 'data-matched-content-ui-type="image_stacked,image_card_sidebyside"';
/**
 * Configuration of content recommendation unit for current slot. This is the
 * result of running CoRe responsive logic and values from this config
 * will be used in ad request.
 * @record
 */

var CoReConfig = // eslint-disable-line no-unused-vars

/** see comment on class */
function CoReConfig() {
  /** @const {number} */
  this.slotWidth;
  /** @const {number} */

  this.slotHeight;
  /**
   * Number of rows to return in matched content unit. Corresponds to
   * "cr_col" url param.
   * @const {number}
   */

  this.numberOfRows;
  /**
   * Number of columns to return in matched content unit. Corresponds to
   * "cr_row" url param.
   * @const {number}
   */

  this.numberOfColumns;
  /**
   * Layout type to use for currect matched content slot. Corresponds to
   * "crui" url param.
   * @const {!LayoutType}
   */

  this.layoutType;
  /**
   * If not null then it contains an error that some of the provided
   * parameters are incorrect. The error is intended to be displayed to
   * developers who setup ad tag. For example it can displayed in console
   * or thrown as js error. If validation is set other params should be
   * ignored.
   * @const {string|undefined}
   */

  this.validationError;
};
/**
 * @param {number} availableWidth
 * @param {boolean} isMobile
 * @return {!CoReConfig}
 */


exports.CoReConfig = CoReConfig;

function getAutoConfig(availableWidth, isMobile) {
  if (availableWidth < MIN_PUB_CONTROL_WIDTH_OF_DESKTOP) {
    if (isMobile) {
      var layoutType = LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE;
      var numColumns = 1;
      var numRows = 12;
      var slotSize = getLargerAdOneColumnSidebysideSize(availableWidth, layoutType, numColumns, numRows);
      return {
        slotWidth: slotSize.width,
        slotHeight: slotSize.height,
        numberOfColumns: numColumns,
        numberOfRows: numRows,
        layoutType: layoutType
      };
    } else {
      var _slotSize = getAutoSlotSize(availableWidth);

      return {
        slotWidth: _slotSize.width,
        slotHeight: _slotSize.height,
        numberOfColumns: 1,
        numberOfRows: 13,
        layoutType: LayoutType.IMAGE_SIDEBYSIDE
      };
    }
  } else {
    var _slotSize2 = getAutoSlotSize(availableWidth);

    return {
      slotWidth: _slotSize2.width,
      slotHeight: _slotSize2.height,
      numberOfColumns: 4,
      numberOfRows: 2,
      layoutType: LayoutType.IMAGE_STACKED
    };
  }
}
/**
 * Parameters for matched content unit provided pub publisher. These
 * parameters are read from ad tag. These are unparsed parameters so they
 * might be invalid.
 *
 * @typedef {{
 *   numberOfRows: (string|undefined),
 *   numberOfColumns: (string|undefined),
 *   layoutType: (string|undefined),
 * }}
 */


var RawPublisherControlParams; // eslint-disable-line no-unused-vars

/**
 * Get CoRe Pub Control UI Sizes.
 * @param {number} availableWidth
 * @param {!RawPublisherControlParams} rawPubControlParams
 * @return {!CoReConfig}
 */

exports.RawPublisherControlParams = RawPublisherControlParams;

function getPubControlConfig(availableWidth, rawPubControlParams) {
  var pubParams = validateAndParsePubControlParams(rawPubControlParams);

  if (pubParams.validationError) {
    return {
      slotWidth: 0,
      slotHeight: 0,
      numberOfColumns: 0,
      numberOfRows: 0,
      // set any layout, doesn't matter because it's error and it won't be used
      // anyway
      layoutType: LayoutType.IMAGE_STACKED,
      validationError: pubParams.validationError
    };
  }

  var index;

  if (pubParams.layoutTypes.length === 2 && availableWidth >= MIN_PUB_CONTROL_WIDTH_OF_DESKTOP) {
    // Publisher provided settings for both mobile and desktop and screen is
    // wide - use desktop.
    index = 1;
  } else {
    // Either publisher provided only one setting or screen is small so use
    // first setting.
    index = 0;
  }

  var layout = convertToPubControlLayoutType(pubParams.layoutTypes[index]);
  var numColumns = getOptimizedNumColumns(availableWidth, pubParams.numberOfColumns[index], layout);
  var numRows = pubParams.numberOfRows[index];
  var slotSize = getPubControlSlotSize(availableWidth, numColumns, numRows, layout);

  if (slotSize.sizeError) {
    return {
      slotWidth: 0,
      slotHeight: 0,
      numberOfColumns: 0,
      numberOfRows: 0,
      layoutType: layout,
      validationError: slotSize.sizeError
    };
  }

  return {
    slotWidth: slotSize.width,
    slotHeight: slotSize.height,
    numberOfColumns: numColumns,
    numberOfRows: numRows,
    layoutType: layout
  };
}
/**
 * Validates and parses parameters that publisher specified on the ad tag via
 * data-matched-content-foo attributes.
 * @param {!RawPublisherControlParams} params
 * @return {{
 *   numberOfRows: (!Array<number>|undefined),
 *   numberOfColumns: (!Array<number>|undefined),
 *   layoutTypes: (!Array<!LayoutType>|undefined),
 *   validationError: (string|undefined),
 * }} parsed params or null if they were invalid.
 */


function validateAndParsePubControlParams(params) {
  // Verify that either all three parameters passed or none.
  var numberOfPubControlParams = 0;

  if (params.layoutType) {
    numberOfPubControlParams++;
  }

  if (params.numberOfColumns) {
    numberOfPubControlParams++;
  }

  if (params.numberOfRows) {
    numberOfPubControlParams++;
  }

  if (numberOfPubControlParams < 3) {
    return {
      validationError: "Tags " + ExternalCorePubVars.UI_TYPE + ", " + ExternalCorePubVars.COLUMNS_NUM + " and " + ExternalCorePubVars.ROWS_NUM + " should be set together."
    };
  }

  var
  /** !Array<!LayoutType> */
  layoutTypes = params.layoutType.split(',');
  var
  /** !Array<string> */
  numberOfRows = params.numberOfRows.split(',');
  var
  /** !Array<string> */
  numberOfColumns = params.numberOfColumns.split(','); // Check all params have same length.

  if (layoutTypes.length !== numberOfRows.length || layoutTypes.length !== numberOfColumns.length) {
    return {
      validationError: "Lengths of parameters " + ExternalCorePubVars.UI_TYPE + ", " + ExternalCorePubVars.COLUMNS_NUM + " and " + ExternalCorePubVars.ROWS_NUM + " must match. Example: " + PUB_CONTROL_EXAMPLE
    };
  }

  if (layoutTypes.length > 2) {
    return {
      validationError: "The parameter length of attribute " + ExternalCorePubVars.UI_TYPE + ", " + ExternalCorePubVars.COLUMNS_NUM + " and " + ExternalCorePubVars.ROWS_NUM + " is too long. At most 2 parameters for each " + 'attribute are needed: one for mobile and one for desktop, while ' + ("you are providing " + layoutTypes.length + " parameters. Example: " + PUB_CONTROL_EXAMPLE + ".")
    };
  }

  var
  /** !Array<number> */
  numberOfRowsAsNumbers = [];
  var
  /** !Array<number> */
  numberOfColumnsAsNumbers = [];

  for (var i = 0; i < layoutTypes.length; i++) {
    var row = Number(numberOfRows[i]);

    if (isNaN(row) || row === 0) {
      return {
        validationError: "Wrong value '" + numberOfRows[i] + "' for " + ExternalCorePubVars.ROWS_NUM + "."
      };
    }

    numberOfRowsAsNumbers.push(row);
    var col = Number(numberOfColumns[i]);

    if (isNaN(col) || col === 0) {
      return {
        validationError: "Wrong value '" + numberOfColumns[i] + "' for " + ExternalCorePubVars.COLUMNS_NUM + "."
      };
    }

    numberOfColumnsAsNumbers.push(col);
  }

  return {
    numberOfRows: numberOfRowsAsNumbers,
    numberOfColumns: numberOfColumnsAsNumbers,
    layoutTypes: layoutTypes
  };
}
/**
 * @param {number} availableWidth
 * @return {{width: number, height: number}}
 */


function getAutoSlotSize(availableWidth) {
  if (availableWidth >= 1200) {
    return {
      width: 1200,
      height: 600
    };
  } else if (availableWidth >= 850) {
    return {
      width: availableWidth,
      height: Math.floor(availableWidth * 0.5)
    };
  } else if (availableWidth >= 550) {
    return {
      width: availableWidth,
      height: Math.floor(availableWidth * 0.6)
    };
  } else if (availableWidth >= 468) {
    return {
      width: availableWidth,
      height: Math.floor(availableWidth * 0.7)
    };
  } else {
    return {
      width: availableWidth,
      height: Math.floor(availableWidth * 3.44)
    };
  }
}
/**
 * Calculate the ad height according to the layout and ad width.
 * @param {number} adWidth
 * @param {!LayoutType} layout
 * @return {number}
 */


function getAdHeight(adWidth, layout) {
  return adWidth * LAYOUT_ASPECT_RATIO_MAP[layout] + LAYOUT_TEXT_HEIGHT_MAP[layout];
}
/**
 * Calculate the core width according to the slot width and number
 * of columns.
 * @param {number} slotWidth
 * @param {number} numColumns
 * @return {number}
 */


function getAdWidth(slotWidth, numColumns) {
  return (slotWidth - PADDING * numColumns - PADDING) / numColumns;
}
/**
 * Calculate the core slot height according to the core height and
 * number of rows.
 * @param {number} adHeight
 * @param {number} numRows
 * @return {number}
 */


function getSlotHeight(adHeight, numRows) {
  return Math.floor(adHeight * numRows + PADDING * numRows + PADDING);
}
/**
 * Calculate the slot size for Pub Control UI.
 * @param {number} slotWidth
 * @param {number} numColumns
 * @param {number} numRows
 * @param {!LayoutType} layout
 * @return {{
 *   width: number,
 *   height: number,
 *   sizeError: (string|undefined),
 * }}
 */


function getPubControlSlotSize(slotWidth, numColumns, numRows, layout) {
  var adWidth = getAdWidth(slotWidth, numColumns);
  var adHeight = getAdHeight(adWidth, layout);
  var slotHeight = getSlotHeight(adHeight, numRows);

  if (slotWidth > MAX_PUB_CONTROL_DIMENSION) {
    return {
      width: 0,
      height: 0,
      sizeError: 'Calculated slot width is too large: ' + slotWidth
    };
  }

  if (slotHeight > MAX_PUB_CONTROL_DIMENSION) {
    return {
      width: 0,
      height: 0,
      sizeError: 'Calculated slot height is too large: ' + slotHeight
    };
  }

  return {
    width: slotWidth,
    height: slotHeight
  };
}
/**
 * @param {number} availableWidth
 * @param {!LayoutType} layoutType
 * @param {number} numColumns
 * @param {number} numRows
 * @return {{width: number, height: number}}
 */


function getLargerAdOneColumnSidebysideSize(availableWidth, layoutType, numColumns, numRows) {
  var adWidth = getAdWidth(availableWidth, numColumns); // The title height of first ad slot 70px, should be consistent with what we
  // define in rendering js.

  var firstAdHeight = Math.floor(adWidth / 1.91 + 70);
  var restAdHeight = getAdHeight(adWidth, layoutType);
  var slotHeight = firstAdHeight + getSlotHeight(restAdHeight, numRows - 1);
  return {
    width: availableWidth,
    height: slotHeight
  };
}
/**
 * Adds 'pub_control_' prefix to Pub Control UI layout name if the layout name
 * does not have 'pub_control_' prefix. This is to differentiate Pub Control UI
 * from responsive auto UI.
 * @param {!LayoutType} layout
 * @return {!LayoutType} the new layout name with 'pub_control_' prefix.
 */


function convertToPubControlLayoutType(layout) {
  return layout.indexOf(PUB_CONTROL_LAYOUT_PREFIX) === 0 ? layout :
  /** @type {!LayoutType} */
  PUB_CONTROL_LAYOUT_PREFIX + layout;
}
/**
 * Gets optimized number of columns. If the publisher specified value of
 * 'data-matched-content-columns-num' is too large, it may result in a very
 * small ad width and broken layout. We will adjust the column number to ensure
 * that ad width is larger than certain threshold and print out some warning
 * message to the console.
 * @param {number} availableWidth
 * @param {number} numColumns
 * @param {!LayoutType} layout
 * @return {number} optimized number of columns
 */


function getOptimizedNumColumns(availableWidth, numColumns, layout) {
  var minWidth = LAYOUT_AD_WIDTH_MAP[layout];
  var optimizedNumColumns = numColumns;

  while (availableWidth / optimizedNumColumns < minWidth && optimizedNumColumns > 1) {
    optimizedNumColumns--;
  }

  return optimizedNumColumns;
}

},{}],4:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.buildUrl = buildUrl;
exports.QueryParameterDef = void 0;

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @typedef {{name: string, value: (string|number|null)}} */
var QueryParameterDef;
/**
 * Builds a URL from query parameters, truncating to a maximum length if
 * necessary.
 * @param {string} baseUrl scheme, domain, and path for the URL.
 * @param {!Object<string,string|number|null>} queryParams query parameters for
 *     the URL.
 * @param {number} maxLength length to truncate the URL to if necessary.
 * @param {?QueryParameterDef=} opt_truncationQueryParam query parameter to
 *     append to the URL iff any query parameters were truncated.
 * @return {string} the fully constructed URL.
 */

exports.QueryParameterDef = QueryParameterDef;

function buildUrl(baseUrl, queryParams, maxLength, opt_truncationQueryParam) {
  var encodedParams = [];
  var encodedTruncationParam = opt_truncationQueryParam && !(opt_truncationQueryParam.value == null || opt_truncationQueryParam.value === '') ? encodeURIComponent(opt_truncationQueryParam.name) + '=' + encodeURIComponent(String(opt_truncationQueryParam.value)) : null;
  var capacity = maxLength - baseUrl.length;

  if (encodedTruncationParam) {
    capacity -= encodedTruncationParam.length + 1;
  }

  var keys = Object.keys(queryParams);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = queryParams[key];

    if (value == null || value === '') {
      continue;
    }

    var encodedNameAndSep = encodeURIComponent(key) + '=';
    var encodedValue = encodeURIComponent(String(value));
    var fullLength = encodedNameAndSep.length + encodedValue.length + 1;

    if (fullLength > capacity) {
      var truncatedValue = encodedValue.substr(0, capacity - encodedNameAndSep.length - 1) // Don't end with a partially truncated escape sequence
      .replace(/%\w?$/, '');

      if (truncatedValue) {
        encodedParams.push(encodedNameAndSep + truncatedValue);
      }

      if (encodedTruncationParam) {
        encodedParams.push(encodedTruncationParam);
      }

      break;
    }

    encodedParams.push(encodedNameAndSep + encodedValue);
    capacity -= fullLength;
  }

  if (!encodedParams.length) {
    return baseUrl;
  }

  return baseUrl + '?' + encodedParams.join('&');
}

},{}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isGoogleAdsA4AValidEnvironment = isGoogleAdsA4AValidEnvironment;
exports.supportsNativeCrypto = supportsNativeCrypto;
exports.isReportingEnabled = isReportingEnabled;
exports.googleBlockParameters = googleBlockParameters;
exports.groupAmpAdsByType = groupAmpAdsByType;
exports.googlePageParameters = googlePageParameters;
exports.googleAdUrl = googleAdUrl;
exports.truncAndTimeUrl = truncAndTimeUrl;
exports.extractHost = extractHost;
exports.getCorrelator = getCorrelator;
exports.additionalDimensions = additionalDimensions;
exports.getCsiAmpAnalyticsConfig = getCsiAmpAnalyticsConfig;
exports.getCsiAmpAnalyticsVariables = getCsiAmpAnalyticsVariables;
exports.extractAmpAnalyticsConfig = extractAmpAnalyticsConfig;
exports.mergeExperimentIds = mergeExperimentIds;
exports.addCsiSignalsToAmpAnalyticsConfig = addCsiSignalsToAmpAnalyticsConfig;
exports.getEnclosingContainerTypes = getEnclosingContainerTypes;
exports.maybeAppendErrorParameter = maybeAppendErrorParameter;
exports.getBinaryTypeNumericalCode = getBinaryTypeNumericalCode;
exports.getIdentityToken = getIdentityToken;
exports.getIdentityTokenRequestUrl = getIdentityTokenRequestUrl;
exports.isCdnProxy = isCdnProxy;
exports.setNameframeExperimentConfigs = setNameframeExperimentConfigs;
exports.getAmpRuntimeTypeParameter = getAmpRuntimeTypeParameter;
exports.IdentityToken = exports.TRUNCATION_PARAM = exports.NameframeExperimentConfig = exports.AmpAnalyticsConfigDef = exports.EXPERIMENT_ATTRIBUTE = exports.SANDBOX_HEADER = exports.QQID_HEADER = exports.ValidAdContainerTypes = void 0;

var _consentState = require("../../../src/consent-state");

var _domFingerprint = require("../../../src/utils/dom-fingerprint");

var _services = require("../../../src/services");

var _urlBuilder = require("./shared/url-builder");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _experiments = require("../../../src/experiments");

var _consent = require("../../../src/consent");

var _iniLoad = require("../../../src/ini-load");

var _mode = require("../../../src/mode");

var _adCid = require("../../../src/ad-cid");

var _variableSource = require("../../../src/service/variable-source");

var _internalVersion = require("../../../src/internal-version");

var _json = require("../../../src/json");

var _dom = require("../../../src/dom");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @type {string}  */
var AMP_ANALYTICS_HEADER = 'X-AmpAnalytics';
/** @const {number} */

var MAX_URL_LENGTH = 15360;
/** @enum {string} */

var AmpAdImplementation = {
  AMP_AD_XHR_TO_IFRAME: '2',
  AMP_AD_XHR_TO_IFRAME_OR_AMP: '3',
  AMP_AD_IFRAME_GET: '5'
};
/** @const {!Object} */

var ValidAdContainerTypes = {
  'AMP-CAROUSEL': 'ac',
  'AMP-FX-FLYING-CARPET': 'fc',
  'AMP-LIGHTBOX': 'lb',
  'AMP-STICKY-AD': 'sa'
};
/**
 * See `VisibilityState` enum.
 * @const {!Object<string, string>}
 */

exports.ValidAdContainerTypes = ValidAdContainerTypes;
var visibilityStateCodes = {
  'visible': '1',
  'hidden': '2',
  'prerender': '3',
  'unloaded': '5'
};
/** @const {string} */

var QQID_HEADER = 'X-QQID';
/** @type {string} */

exports.QQID_HEADER = QQID_HEADER;
var SANDBOX_HEADER = 'amp-ff-sandbox';
/**
 * Element attribute that stores experiment IDs.
 *
 * Note: This attribute should be used only for tracking experimental
 * implementations of AMP tags, e.g., by AMPHTML implementors.  It should not be
 * added by a publisher page.
 *
 * @const {string}
 * @visibleForTesting
 */

exports.SANDBOX_HEADER = SANDBOX_HEADER;
var EXPERIMENT_ATTRIBUTE = 'data-experiment-id';
/** @typedef {{urls: !Array<string>}}
 */

exports.EXPERIMENT_ATTRIBUTE = EXPERIMENT_ATTRIBUTE;
var AmpAnalyticsConfigDef;
/**
 * @typedef {{instantLoad: boolean, writeInBody: boolean}}
 */

exports.AmpAnalyticsConfigDef = AmpAnalyticsConfigDef;
var NameframeExperimentConfig;
/**
 * @const {!./shared/url-builder.QueryParameterDef}
 * @visibleForTesting
 */

exports.NameframeExperimentConfig = NameframeExperimentConfig;
var TRUNCATION_PARAM = {
  name: 'trunc',
  value: '1'
};
/** @const {Object} */

exports.TRUNCATION_PARAM = TRUNCATION_PARAM;
var CDN_PROXY_REGEXP = /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org((\/.*)|($))+/;
/**
 * Returns the value of some navigation timing parameter.
 * Feature detection is used for safety on browsers that do not support the
 * performance API.
 * @param {!Window} win
 * @param {string} timingEvent The name of the timing event, e.g.
 *     'navigationStart' or 'domContentLoadEventStart'.
 * @return {number}
 */

function getNavigationTiming(win, timingEvent) {
  return win['performance'] && win['performance']['timing'] && win['performance']['timing'][timingEvent] || 0;
}
/**
 * Check whether Google Ads supports the A4A rendering pathway is valid for the
 * environment by ensuring native crypto support and page originated in the
 * {@code cdn.ampproject.org} CDN <em>or</em> we must be running in local
 * dev mode.
 *
 * @param {!Window} win  Host window for the ad.
 * @return {boolean}  Whether Google Ads should attempt to render via the A4A
 *   pathway.
 */


function isGoogleAdsA4AValidEnvironment(win) {
  return supportsNativeCrypto(win) && (!!isCdnProxy(win) || (0, _mode.getMode)(win).localDev || (0, _mode.getMode)(win).test);
}
/**
 * Checks whether native crypto is supported for win.
 * @param {!Window} win  Host window for the ad.
 * @return {boolean} Whether native crypto is supported.
 */


function supportsNativeCrypto(win) {
  return win.crypto && (win.crypto.subtle || win.crypto.webkitSubtle);
}
/**
 * @param {!AMP.BaseElement} ampElement The element on whose lifecycle this
 *    reporter will be reporting.
 * @return {boolean} whether reporting is enabled for this element
 */


function isReportingEnabled(ampElement) {
  // Carve-outs: We only want to enable profiling pingbacks when:
  //   - The ad is from one of the Google networks (AdSense or Doubleclick).
  //   - The ad slot is in the A4A-vs-3p amp-ad control branch (either via
  //     internal, client-side selection or via external, Google Search
  //     selection).
  //   - We haven't turned off profiling via the rate controls in
  //     build-system/global-config/{canary,prod}-config.json
  // If any of those fail, we use the `BaseLifecycleReporter`, which is a
  // a no-op (sends no pings).
  var type = ampElement.element.getAttribute('type');
  var win = ampElement.win; // In local dev mode, neither the canary nor prod config files is available,
  // so manually set the profiling rate, for testing/dev.

  if ((0, _mode.getMode)(ampElement.win).localDev && !(0, _mode.getMode)(ampElement.win).test) {
    (0, _experiments.toggleExperiment)(win, 'a4aProfilingRate', true, true);
  }

  return (type == 'doubleclick' || type == 'adsense') && (0, _experiments.isExperimentOn)(win, 'a4aProfilingRate');
}
/**
 * Has side-effect of incrementing ifi counter on window.
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {!Array<string>=} opt_experimentIds Any experiments IDs (in addition
 *     to those specified on the ad element) that should be included in the
 *     request.
 * @return {!Object<string,null|number|string>} block level parameters
 */


function googleBlockParameters(a4a, opt_experimentIds) {
  var adElement = a4a.element,
      win = a4a.win;
  var slotRect = a4a.getPageLayoutBox();
  var iframeDepth = iframeNestingDepth(win);
  var enclosingContainers = getEnclosingContainerTypes(adElement);
  var eids = adElement.getAttribute('data-experiment-id');

  if (opt_experimentIds) {
    eids = mergeExperimentIds(opt_experimentIds, eids);
  }

  return {
    'adf': _domFingerprint.DomFingerprint.generate(adElement),
    'nhd': iframeDepth,
    'eid': eids,
    'adx': slotRect.left,
    'ady': slotRect.top,
    'oid': '2',
    'act': enclosingContainers.length ? enclosingContainers.join() : null
  };
}
/**
 * @param {!Window} win
 * @param {string} type matching typing attribute.
 * @param {function(!Element):string} groupFn
 * @return {!Promise<!Object<string,!Array<!Promise<!../../../src/base-element.BaseElement>>>>}
 */


function groupAmpAdsByType(win, type, groupFn) {
  // Look for amp-ad elements of correct type or those contained within
  // standard container type.  Note that display none containers will not be
  // included as they will never be measured.
  // TODO(keithwrightbos): what about slots that become measured due to removal
  // of display none (e.g. user resizes viewport and media selector makes
  // visible).
  var ampAdSelector = function ampAdSelector(r) {
    return r.element.
    /*OK*/
    querySelector("amp-ad[type=" + type + "]");
  };

  var documentElement = win.document.documentElement;

  var ampdoc = _services.Services.ampdoc(documentElement);

  return (0, _iniLoad.getMeasuredResources)(ampdoc, win, function (r) {
    var isAmpAdType = r.element.tagName == 'AMP-AD' && r.element.getAttribute('type') == type;

    if (isAmpAdType) {
      return true;
    }

    var isAmpAdContainerElement = Object.keys(ValidAdContainerTypes).includes(r.element.tagName) && !!ampAdSelector(r);
    return isAmpAdContainerElement;
  }) // Need to wait on any contained element resolution followed by build
  // of child ad.
  .then(function (resources) {
    return Promise.all(resources.map(function (resource) {
      if (resource.element.tagName == 'AMP-AD') {
        return resource.element;
      } // Must be container element so need to wait for child amp-ad to
      // be upgraded.


      return (0, _dom.whenUpgradedToCustomElement)((0, _log.dev)().assertElement(ampAdSelector(resource)));
    }));
  }) // Group by networkId.
  .then(function (elements) {
    return elements.reduce(function (result, element) {
      var groupId = groupFn(element);
      (result[groupId] || (result[groupId] = [])).push(element.getImpl());
      return result;
    }, {});
  });
}
/**
 * @param {! ../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {number} startTime
 * @return {!Promise<!Object<string,null|number|string>>}
 */


function googlePageParameters(a4a, startTime) {
  var win = a4a.win;
  var ampDoc = a4a.getAmpDoc(); // Do not wait longer than 1 second to retrieve referrer to ensure
  // viewer integration issues do not cause ad requests to hang indefinitely.

  var referrerPromise = _services.Services.timerFor(win).timeoutPromise(1000, _services.Services.viewerForDoc(ampDoc).getReferrerUrl()).catch(function () {
    (0, _log.dev)().expectedError('AMP-A4A', 'Referrer timeout!');
    return '';
  });

  var domLoading = getNavigationTiming(win, 'domLoading');
  return Promise.all([(0, _adCid.getOrCreateAdCid)(ampDoc, 'AMP_ECID_GOOGLE', '_ga'), referrerPromise]).then(function (promiseResults) {
    var clientId = promiseResults[0];
    var referrer = promiseResults[1];

    var _Services$documentInf = _services.Services.documentInfoForDoc(ampDoc),
        pageViewId = _Services$documentInf.pageViewId,
        canonicalUrl = _Services$documentInf.canonicalUrl; // Read by GPT for GA/GPT integration.


    win.gaGlobal = win.gaGlobal || {
      cid: clientId,
      hid: pageViewId
    };
    var screen = win.screen;

    var viewport = _services.Services.viewportForDoc(ampDoc);

    var viewportRect = viewport.getRect();
    var viewportSize = viewport.getSize();
    var visibilityState = ampDoc.getVisibilityState();
    return {
      'is_amp': a4a.isXhrAllowed() ? AmpAdImplementation.AMP_AD_XHR_TO_IFRAME_OR_AMP : AmpAdImplementation.AMP_AD_IFRAME_GET,
      'amp_v': (0, _internalVersion.internalRuntimeVersion)(),
      'd_imp': '1',
      'c': getCorrelator(win, ampDoc, clientId),
      'ga_cid': win.gaGlobal.cid || null,
      'ga_hid': win.gaGlobal.hid || null,
      'dt': startTime,
      'biw': viewportRect.width,
      'bih': viewportRect.height,
      'u_aw': screen ? screen.availWidth : null,
      'u_ah': screen ? screen.availHeight : null,
      'u_cd': screen ? screen.colorDepth : null,
      'u_w': screen ? screen.width : null,
      'u_h': screen ? screen.height : null,
      'u_tz': -new Date().getTimezoneOffset(),
      'u_his': getHistoryLength(win),
      'isw': win != win.top ? viewportSize.width : null,
      'ish': win != win.top ? viewportSize.height : null,
      'art': getAmpRuntimeTypeParameter(win),
      'vis': visibilityStateCodes[visibilityState] || '0',
      'scr_x': viewport.getScrollLeft(),
      'scr_y': viewport.getScrollTop(),
      'bc': getBrowserCapabilitiesBitmap(win) || null,
      'debug_experiment_id': (/(?:#|,)deid=([\d,]+)/i.exec(win.location.hash) || [])[1] || null,
      'url': canonicalUrl || null,
      'top': win != win.top ? topWindowUrlOrDomain(win) : null,
      'loc': win.location.href == canonicalUrl ? null : win.location.href,
      'ref': referrer || null,
      'bdt': domLoading ? startTime - domLoading : null
    };
  });
}
/**
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {string} baseUrl
 * @param {number} startTime
 * @param {!Object<string,null|number|string>} parameters
 * @param {!Array<string>=} opt_experimentIds Any experiments IDs (in addition
 *     to those specified on the ad element) that should be included in the
 *     request.
 * @return {!Promise<string>}
 */


function googleAdUrl(a4a, baseUrl, startTime, parameters, opt_experimentIds) {
  // TODO: Maybe add checks in case these promises fail.
  var blockLevelParameters = googleBlockParameters(a4a, opt_experimentIds);
  return googlePageParameters(a4a, startTime).then(function (pageLevelParameters) {
    Object.assign(parameters, blockLevelParameters, pageLevelParameters);
    return truncAndTimeUrl(baseUrl, parameters, startTime);
  });
}
/**
 * @param {string} baseUrl
 * @param {!Object<string,null|number|string>} parameters
 * @param {number} startTime
 * @return {string}
 */


function truncAndTimeUrl(baseUrl, parameters, startTime) {
  return (0, _urlBuilder.buildUrl)(baseUrl, parameters, MAX_URL_LENGTH - 10, TRUNCATION_PARAM) + '&dtd=' + elapsedTimeWithCeiling(Date.now(), startTime);
}
/**
 * @param {!Window} win
 * @return {number}
 */


function iframeNestingDepth(win) {
  var w = win;
  var depth = 0;

  while (w != w.parent && depth < 100) {
    w = w.parent;
    depth++;
  }

  (0, _log.devAssert)(w == win.top);
  return depth;
}
/**
 * @param {!Window} win
 * @return {number}
 */


function getHistoryLength(win) {
  // We have seen cases where accessing history length causes errors.
  try {
    return win.history.length;
  } catch (e) {
    return 0;
  }
}
/**
 * @param {string} url
 * @return {string} hostname portion of url
 * @visibleForTesting
 */


function extractHost(url) {
  return (/^(?:https?:\/\/)?([^\/\?:]+)/i.exec(url) || [])[1] || url;
}
/**
 * @param {!Window} win
 * @return {?string}
 */


function topWindowUrlOrDomain(win) {
  var ancestorOrigins = win.location.ancestorOrigins;

  if (ancestorOrigins) {
    var origin = win.location.origin;
    var topOrigin = ancestorOrigins[ancestorOrigins.length - 1];

    if (origin == topOrigin) {
      return win.top.location.hostname;
    }

    var secondFromTop = secondWindowFromTop(win);

    if (secondFromTop == win || origin == ancestorOrigins[ancestorOrigins.length - 2]) {
      return extractHost(secondFromTop.
      /*OK*/
      document.referrer);
    }

    return extractHost(topOrigin);
  } else {
    try {
      return win.top.location.hostname;
    } catch (e) {}

    var _secondFromTop = secondWindowFromTop(win);

    try {
      return extractHost(_secondFromTop.
      /*OK*/
      document.referrer);
    } catch (e) {}

    return null;
  }
}
/**
 * @param {!Window} win
 * @return {!Window}
 */


function secondWindowFromTop(win) {
  var secondFromTop = win;
  var depth = 0;

  while (secondFromTop.parent != secondFromTop.parent.parent && depth < 100) {
    secondFromTop = secondFromTop.parent;
    depth++;
  }

  (0, _log.devAssert)(secondFromTop.parent == win.top);
  return secondFromTop;
}
/**
 * @param {number} time
 * @param {number} start
 * @return {(number|string)}
 */


function elapsedTimeWithCeiling(time, start) {
  var duration = time - start;

  if (duration >= 1e6) {
    return 'M';
  } else if (duration >= 0) {
    return duration;
  }

  return '-M';
}
/**
 * `nodeOrDoc` must be passed for correct behavior in shadow AMP (PWA) case.
 * @param {!Window} win
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string=} opt_cid
 * @return {number} The correlator.
 */


function getCorrelator(win, elementOrAmpDoc, opt_cid) {
  if (!win.ampAdPageCorrelator) {
    win.ampAdPageCorrelator = (0, _experiments.isExperimentOn)(win, 'exp-new-correlator') ? Math.floor(4503599627370496 * Math.random()) : makeCorrelator(_services.Services.documentInfoForDoc(elementOrAmpDoc).pageViewId, opt_cid);
  }

  return win.ampAdPageCorrelator;
}
/**
 * @param {string} pageViewId
 * @param {string=} opt_clientId
 * @return {number}
 */


function makeCorrelator(pageViewId, opt_clientId) {
  var pageViewIdNumeric = Number(pageViewId || 0);

  if (opt_clientId) {
    return pageViewIdNumeric + opt_clientId.replace(/\D/g, '') % 1e6 * 1e6;
  } else {
    // In this case, pageViewIdNumeric is only 4 digits => too low entropy
    // to be useful as a page correlator.  So synthesize one from scratch.
    // 4503599627370496 == 2^52.  The guaranteed range of JS Number is at least
    // 2^53 - 1.
    return Math.floor(4503599627370496 * Math.random());
  }
}
/**
 * Collect additional dimensions for the brdim parameter.
 * @param {!Window} win The window for which we read the browser dimensions.
 * @param {{width: number, height: number}|null} viewportSize
 * @return {string}
 * @visibleForTesting
 */


function additionalDimensions(win, viewportSize) {
  // Some browsers throw errors on some of these.
  var screenX, screenY, outerWidth, outerHeight, innerWidth, innerHeight;

  try {
    screenX = win.screenX;
    screenY = win.screenY;
  } catch (e) {}

  try {
    outerWidth = win.outerWidth;
    outerHeight = win.outerHeight;
  } catch (e) {}

  try {
    innerWidth = viewportSize.width;
    innerHeight = viewportSize.height;
  } catch (e) {}

  return [win.screenLeft, win.screenTop, screenX, screenY, win.screen ? win.screen.availWidth : undefined, win.screen ? win.screen.availTop : undefined, outerWidth, outerHeight, innerWidth, innerHeight].join();
}
/**
 * Returns amp-analytics config for a new CSI trigger.
 * @param {string} on The name of the analytics trigger.
 * @param {!Object<string, string>} params Params to be included on the ping.
 * @return {!JsonObject}
 */


function csiTrigger(on, params) {
  return (0, _object.dict)({
    'on': on,
    'request': 'csi',
    'sampleSpec': {
      // Pings are sampled on a per-pageview basis. A prefix is included in the
      // sampleOn spec so that the hash is orthogonal to any other sampling in
      // amp.
      'sampleOn': 'a4a-csi-${pageViewId}',
      'threshold': 1 // 1% sample

    },
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'extraUrlParams': params
  });
}
/**
 * Returns amp-analytics config for Google ads network impls.
 * @return {!JsonObject}
 */


function getCsiAmpAnalyticsConfig() {
  return (0, _object.dict)({
    'requests': {
      'csi': 'https://csi.gstatic.com/csi?'
    },
    'transport': {
      'xhrpost': false
    },
    'triggers': {
      'adRequestStart': csiTrigger('ad-request-start', {
        // afs => ad fetch start
        'met.a4a': 'afs_lvt.${viewerLastVisibleTime}~afs.${time}'
      }),
      'adResponseEnd': csiTrigger('ad-response-end', {
        // afe => ad fetch end
        'met.a4a': 'afe.${time}'
      }),
      'adRenderStart': csiTrigger('ad-render-start', {
        // ast => ad schedule time
        // ars => ad render start
        'met.a4a': 'ast.${scheduleTime}~ars_lvt.${viewerLastVisibleTime}~ars.${time}',
        'qqid': '${qqid}'
      }),
      'adIframeLoaded': csiTrigger('ad-iframe-loaded', {
        // ail => ad iframe loaded
        'met.a4a': 'ail.${time}'
      })
    },
    'extraUrlParams': {
      's': 'ampad',
      'ctx': '2',
      'c': '${correlator}',
      'slotId': '${slotId}',
      // Time that the beacon was actually sent. Note that there can be delays
      // between the time at which the event is fired and when ${nowMs} is
      // evaluated when the URL is built by amp-analytics.
      'puid': '${requestCount}~${timestamp}'
    }
  });
}
/**
 * Returns variables to be included in the amp-analytics event for A4A.
 * @param {string} analyticsTrigger The name of the analytics trigger.
 * @param {!AMP.BaseElement} a4a The A4A element.
 * @param {?string} qqid The query ID or null if the query ID has not been set
 *     yet.
 * @return {!JsonObject}
 */


function getCsiAmpAnalyticsVariables(analyticsTrigger, a4a, qqid) {
  var win = a4a.win;
  var ampdoc = a4a.getAmpDoc();
  var navStart = getNavigationTiming(win, 'navigationStart');
  var vars =
  /** @type {!JsonObject} */
  {
    'correlator': getCorrelator(win, ampdoc),
    'slotId': a4a.element.getAttribute('data-amp-slot-index'),
    'viewerLastVisibleTime': ampdoc.getLastVisibleTime() - navStart
  };

  if (qqid) {
    vars['qqid'] = qqid;
  }

  if (analyticsTrigger == 'ad-render-start') {
    vars['scheduleTime'] = a4a.element.layoutScheduleTime - navStart;
  }

  return vars;
}
/**
 * Extracts configuration used to build amp-analytics element for active view.
 *
 * @param {!../../../extensions/amp-a4a/0.1/amp-a4a.AmpA4A} a4a
 * @param {!Headers} responseHeaders
 *   XHR service FetchResponseHeaders object containing the response
 *   headers.
 * @return {?JsonObject} config or null if invalid/missing.
 */


function extractAmpAnalyticsConfig(a4a, responseHeaders) {
  if (!responseHeaders.has(AMP_ANALYTICS_HEADER)) {
    return null;
  }

  try {
    var analyticsConfig = (0, _json.parseJson)(responseHeaders.get(AMP_ANALYTICS_HEADER));
    (0, _log.devAssert)(Array.isArray(analyticsConfig['url']));
    var urls = analyticsConfig['url'];

    if (!urls.length) {
      return null;
    }

    var config =
    /** @type {JsonObject}*/
    {
      'transport': {
        'beacon': false,
        'xhrpost': false
      },
      'triggers': {
        'continuousVisible': {
          'on': 'visible',
          'visibilitySpec': {
            'selector': 'amp-ad',
            'selectionMethod': 'closest',
            'visiblePercentageMin': 50,
            'continuousTimeMin': 1000
          }
        }
      }
    }; // Discover and build visibility endpoints.

    var requests = (0, _object.dict)();

    for (var idx = 1; idx <= urls.length; idx++) {
      // TODO: Ensure url is valid and not freeform JS?
      requests["visibility" + idx] = "" + urls[idx - 1];
    } // Security review needed here.


    config['requests'] = requests;
    config['triggers']['continuousVisible']['request'] = Object.keys(requests);
    return config;
  } catch (err) {
    (0, _log.dev)().error('AMP-A4A', 'Invalid analytics', err, responseHeaders.get(AMP_ANALYTICS_HEADER));
  }

  return null;
}
/**
 * Add new experiment IDs to a (possibly empty) existing set of experiment IDs.
 * The {@code currentIdString} may be {@code null} or {@code ''}, but if it is
 * populated, it must contain a comma-separated list of integer experiment IDs
 * (per {@code parseExperimentIds()}).  Returns the new set of IDs, encoded
 * as a comma-separated list.  Does not de-duplicate ID entries.
 *
 * @param {!Array<string>} newIds IDs to merge in. Should contain stringified
 *     integer (base 10) experiment IDs.
 * @param {?string} currentIdString  If present, a string containing a
 *   comma-separated list of integer experiment IDs.
 * @return {string}  New experiment list string, including newId iff it is
 *   a valid (integer) experiment ID.
 * @see parseExperimentIds, validateExperimentIds
 */


function mergeExperimentIds(newIds, currentIdString) {
  var newIdString = newIds.filter(function (newId) {
    return Number(newId);
  }).join(',');
  currentIdString = currentIdString || '';
  return currentIdString + (currentIdString && newIdString ? ',' : '') + newIdString;
}
/**
 * Adds two CSI signals to the given amp-analytics configuration object, one
 * for render-start, and one for ini-load.
 *
 * @param {!Window} win
 * @param {!Element} element The ad slot.
 * @param {!JsonObject} config The original config object.
 * @param {?string} qqid
 * @param {boolean} isVerifiedAmpCreative
 * @return {?JsonObject} config or null if invalid/missing.
 */


function addCsiSignalsToAmpAnalyticsConfig(win, element, config, qqid, isVerifiedAmpCreative) {
  // Add CSI pingbacks.
  var correlator = getCorrelator(win, element);
  var slotId = Number(element.getAttribute('data-amp-slot-index'));
  var eids = encodeURIComponent(element.getAttribute(EXPERIMENT_ATTRIBUTE));
  var adType = element.getAttribute('type');
  var initTime = Number((0, _variableSource.getTimingDataSync)(win, 'navigationStart') || Date.now());
  var deltaTime = Math.round(win.performance && win.performance.now ? win.performance.now() : Date.now() - initTime);
  var baseCsiUrl = 'https://csi.gstatic.com/csi?s=a4a' + ("&c=" + correlator + "&slotId=" + slotId + "&qqid." + slotId + "=" + qqid) + ("&dt=" + initTime) + (eids != 'null' ? "&e." + slotId + "=" + eids : '') + ("&rls=" + (0, _internalVersion.internalRuntimeVersion)() + "&adt." + slotId + "=" + adType);
  var isAmpSuffix = isVerifiedAmpCreative ? 'Friendly' : 'CrossDomain';
  config['triggers']['continuousVisibleIniLoad'] = {
    'on': 'ini-load',
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'request': 'iniLoadCsi'
  };
  config['triggers']['continuousVisibleRenderStart'] = {
    'on': 'render-start',
    'selector': 'amp-ad',
    'selectionMethod': 'closest',
    'request': 'renderStartCsi'
  };
  config['requests']['iniLoadCsi'] = baseCsiUrl + ("&met.a4a." + slotId + "=iniLoadCsi" + isAmpSuffix + "." + deltaTime);
  config['requests']['renderStartCsi'] = baseCsiUrl + ("&met.a4a." + slotId + "=renderStartCsi" + isAmpSuffix + "." + deltaTime); // Add CSI ping for visibility.

  config['requests']['visibilityCsi'] = baseCsiUrl + ("&met.a4a." + slotId + "=visibilityCsi." + deltaTime);
  config['triggers']['continuousVisible']['request'].push('visibilityCsi');
  return config;
}
/**
 * Returns an array of two-letter codes representing the amp-ad containers
 * enclosing the given ad element.
 *
 * @param {!Element} adElement
 * @return {!Array<string>}
 */


function getEnclosingContainerTypes(adElement) {
  var containerTypeSet = {};

  for (var el = adElement.parentElement, counter = 0; el && counter < 20; el = el.parentElement, counter++) {
    var tagName = el.tagName.toUpperCase();

    if (ValidAdContainerTypes[tagName]) {
      containerTypeSet[ValidAdContainerTypes[tagName]] = true;
    }
  }

  return Object.keys(containerTypeSet);
}
/**
 * Appends parameter to ad request indicating error state so long as error
 * parameter is not already present or url has been truncated.
 * @param {string} adUrl used for network request
 * @param {string} parameterValue to be appended
 * @return {string|undefined} potentially modified url, undefined
 */


function maybeAppendErrorParameter(adUrl, parameterValue) {
  (0, _log.devAssert)(!!adUrl && !!parameterValue); // Add parameter indicating error so long as the url has not already been
  // truncated and error parameter is not already present.  Note that we assume
  // that added, error parameter length will be less than truncation parameter
  // so adding will not cause length to exceed maximum.

  if (new RegExp("[?|&](" + encodeURIComponent(TRUNCATION_PARAM.name) + "=" + (encodeURIComponent(String(TRUNCATION_PARAM.value)) + "|aet=[^&]*)$")).test(adUrl)) {
    return;
  }

  var modifiedAdUrl = adUrl + ("&aet=" + parameterValue);
  (0, _log.devAssert)(modifiedAdUrl.length <= MAX_URL_LENGTH);
  return modifiedAdUrl;
}
/**
 * Returns a numerical code representing the binary type.
 * @param {string} type
 * @return {?string}
 */


function getBinaryTypeNumericalCode(type) {
  return {
    'production': '0',
    'control': '1',
    'canary': '2',
    'rc': '3',
    'experimentA': '10',
    'experimentB': '11',
    'experimentC': '12',
    'nomod': '42',
    'mod': '43'
  }[type] || null;
}
/** @const {!RegExp} */


var IDENTITY_DOMAIN_REGEXP_ = /\.google\.(?:com?\.)?[a-z]{2,3}$/;
/** @typedef {{
      token: (string|undefined),
      jar: (string|undefined),
      pucrd: (string|undefined),
      freshLifetimeSecs: (number|undefined),
      validLifetimeSecs: (number|undefined),
      fetchTimeMs: (number|undefined)
   }} */

var IdentityToken;
/**
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {?string} consentPolicyId
 * @return {!Promise<!IdentityToken>}
 */

exports.IdentityToken = IdentityToken;

function getIdentityToken(win, ampDoc, consentPolicyId) {
  // If configured to use amp-consent, delay request until consent state is
  // resolved.
  win['goog_identity_prom'] = win['goog_identity_prom'] || (consentPolicyId ? (0, _consent.getConsentPolicyState)(ampDoc.getHeadNode(), consentPolicyId) : Promise.resolve(_consentState.CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED)).then(function (consentState) {
    return consentState == _consentState.CONSENT_POLICY_STATE.INSUFFICIENT || consentState == _consentState.CONSENT_POLICY_STATE.UNKNOWN ?
    /** @type {!IdentityToken} */
    {} : executeIdentityTokenFetch(win, ampDoc);
  });
  return (
    /** @type {!Promise<!IdentityToken>} */
    win['goog_identity_prom']
  );
}
/**
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {number=} redirectsRemaining (default 1)
 * @param {string=} domain
 * @param {number=} startTime
 * @return {!Promise<!IdentityToken>}
 */


function executeIdentityTokenFetch(win, ampDoc, redirectsRemaining, domain, startTime) {
  if (redirectsRemaining === void 0) {
    redirectsRemaining = 1;
  }

  if (domain === void 0) {
    domain = undefined;
  }

  if (startTime === void 0) {
    startTime = Date.now();
  }

  var url = getIdentityTokenRequestUrl(win, ampDoc, domain);
  return _services.Services.xhrFor(win).fetchJson(url, {
    mode: 'cors',
    method: 'GET',
    ampCors: false,
    credentials: 'include'
  }).then(function (res) {
    return res.json();
  }).then(function (obj) {
    var token = obj['newToken'];
    var jar = obj['1p_jar'] || '';
    var pucrd = obj['pucrd'] || '';
    var freshLifetimeSecs = parseInt(obj['freshLifetimeSecs'] || '', 10);
    var validLifetimeSecs = parseInt(obj['validLifetimeSecs'] || '', 10);
    var altDomain = obj['altDomain'];
    var fetchTimeMs = Date.now() - startTime;

    if (IDENTITY_DOMAIN_REGEXP_.test(altDomain)) {
      if (!redirectsRemaining--) {
        // Max redirects, log?
        return {
          fetchTimeMs: fetchTimeMs
        };
      }

      return executeIdentityTokenFetch(win, ampDoc, redirectsRemaining, altDomain, startTime);
    } else if (freshLifetimeSecs > 0 && validLifetimeSecs > 0 && typeof token == 'string') {
      return {
        token: token,
        jar: jar,
        pucrd: pucrd,
        freshLifetimeSecs: freshLifetimeSecs,
        validLifetimeSecs: validLifetimeSecs,
        fetchTimeMs: fetchTimeMs
      };
    } // returning empty


    return {
      fetchTimeMs: fetchTimeMs
    };
  }).catch(function (unusedErr) {
    // TODO log?
    return {};
  });
}
/**
 * @param {!Window} win
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 * @param {string=} domain
 * @return {string} url
 * @visibleForTesting
 */


function getIdentityTokenRequestUrl(win, ampDoc, domain) {
  if (domain === void 0) {
    domain = undefined;
  }

  if (!domain && win != win.top && win.location.ancestorOrigins) {
    var matches = IDENTITY_DOMAIN_REGEXP_.exec(win.location.ancestorOrigins[win.location.ancestorOrigins.length - 1]);
    domain = matches && matches[0] || undefined;
  }

  domain = domain || '.google.com';
  var canonical = extractHost(_services.Services.documentInfoForDoc(ampDoc).canonicalUrl);
  return "https://adservice" + domain + "/adsid/integrator.json?domain=" + canonical;
}
/**
 * Returns whether we are running on the AMP CDN.
 * @param {!Window} win
 * @return {boolean}
 */


function isCdnProxy(win) {
  return CDN_PROXY_REGEXP.test(win.location.origin);
}
/**
 * Populates the fields of the given Nameframe experiment config object.
 * @param {!Headers} headers
 * @param {!NameframeExperimentConfig} nameframeConfig
 */


function setNameframeExperimentConfigs(headers, nameframeConfig) {
  var nameframeExperimentHeader = headers.get('amp-nameframe-exp');

  if (nameframeExperimentHeader) {
    nameframeExperimentHeader.split(';').forEach(function (config) {
      if (config == 'instantLoad' || config == 'writeInBody') {
        nameframeConfig[config] = true;
      }
    });
  }
}
/**
 * Enum for browser capabilities. NOTE: Since JS is 32-bit, do not add anymore
 * than 32 capabilities to this enum.
 * @enum {number}
 */


var Capability = {
  SVG_SUPPORTED: 1 << 0,
  SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED: 1 << 1,
  SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED: 1 << 2
};
/**
 * Returns a bitmap representing what features are supported by this browser.
 * @param {!Window} win
 * @return {number}
 */

function getBrowserCapabilitiesBitmap(win) {
  var browserCapabilities = 0;
  var doc = win.document;

  if (win.SVGElement && doc.createElementNS) {
    browserCapabilities |= Capability.SVG_SUPPORTED;
  }

  var iframeEl = doc.createElement('iframe');

  if (iframeEl.sandbox && iframeEl.sandbox.supports) {
    if (iframeEl.sandbox.supports('allow-top-navigation-by-user-activation')) {
      browserCapabilities |= Capability.SANDBOXING_ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION_SUPPORTED;
    }

    if (iframeEl.sandbox.supports('allow-popups-to-escape-sandbox')) {
      browserCapabilities |= Capability.SANDBOXING_ALLOW_POPUPS_TO_ESCAPE_SANDBOX_SUPPORTED;
    }
  }

  return browserCapabilities;
}
/**
 * Returns an enum value representing the AMP binary type, or null if this is a
 * canonical page.
 * @param {!Window} win
 * @return {?string} The binary type enum.
 * @visibleForTesting
 */


function getAmpRuntimeTypeParameter(win) {
  var art = getBinaryTypeNumericalCode((0, _experiments.getBinaryType)(win));
  return isCdnProxy(win) && art != '0' ? art : null;
}

},{"../../../src/ad-cid":19,"../../../src/consent":26,"../../../src/consent-state":25,"../../../src/dom":29,"../../../src/experiments":34,"../../../src/ini-load":39,"../../../src/internal-version":40,"../../../src/json":42,"../../../src/log":45,"../../../src/mode":47,"../../../src/service/variable-source":52,"../../../src/services":53,"../../../src/utils/dom-fingerprint":63,"../../../src/utils/object":67,"./shared/url-builder":4}],6:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getMultiSizeDimensions = getMultiSizeDimensions;
exports.getMatchedContentResponsiveHeightAndUpdatePubParams = getMatchedContentResponsiveHeightAndUpdatePubParams;
exports.ADSENSE_MCRSPV_TAG = exports.ADSENSE_RSPV_TAG = exports.ADSENSE_RSPV_WHITELISTED_HEIGHT = void 0;

var _contentRecommendation = require("./a4a/shared/content-recommendation.js");

var _log = require("../../src/log");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Approved height for AdSense full-width responsive ads.
 * @const {number}
 */
var ADSENSE_RSPV_WHITELISTED_HEIGHT = 320;
/**
 * The attribute value for AdSense data-auto-format tag.
 * For full-width responsive ad: data-auto-format='rspv'.
 * For full-width matched content responsive ad: data-auto-format='mcrspv'
 * @const {string}
 */

exports.ADSENSE_RSPV_WHITELISTED_HEIGHT = ADSENSE_RSPV_WHITELISTED_HEIGHT;
var ADSENSE_RSPV_TAG = 'rspv';
exports.ADSENSE_RSPV_TAG = ADSENSE_RSPV_TAG;
var ADSENSE_MCRSPV_TAG = 'mcrspv';
/**
 * Given the amp-ad data attribute containing the multi-size dimensions, and a
 * set of primary dimensions, this function will return all valid multi-size
 * [width, height] pairs in an array.
 *
 * @param {string} multiSizeDataStr The amp-ad data attribute containing the
 *   multi-size dimensions.
 * @param {number} primaryWidth The primary width of the ad slot.
 * @param {number} primaryHeight The primary height of the ad slot.
 * @param {boolean} multiSizeValidation A flag that if set to true will enforce
 *   the rule that ensures multi-size dimensions are no less than 2/3rds of
 *   their primary dimension's counterpart.
 * @param {boolean=} isFluidPrimary Indicates whether the ad slot's primary
 *   size is fluid.
 * @return {?Array<!Array<number>>} An array of dimensions.
 */

exports.ADSENSE_MCRSPV_TAG = ADSENSE_MCRSPV_TAG;

function getMultiSizeDimensions(multiSizeDataStr, primaryWidth, primaryHeight, multiSizeValidation, isFluidPrimary) {
  if (isFluidPrimary === void 0) {
    isFluidPrimary = false;
  }

  var dimensions = [];
  var arrayOfSizeStrs = multiSizeDataStr.split(',');

  for (var i = 0; i < arrayOfSizeStrs.length; i++) {
    var sizeStr = arrayOfSizeStrs[i];

    if (sizeStr.toLowerCase() == 'fluid') {
      // Fluid dummy sizes should be appended to the front of the request
      // parameter, so they must be handled elsewhere.
      continue;
    }

    var size = sizeStr.split('x'); // Make sure that each size is specified in the form WxH.

    if (size.length != 2) {
      (0, _log.user)().error('AMP-AD', "Invalid multi-size data format '" + sizeStr + "'.");
      continue;
    }

    var width = Number(size[0]);
    var height = Number(size[1]); // Make sure that both dimensions given are positive numbers.

    if (!validateDimensions(width, height, function (w) {
      return isNaN(w) || w <= 0;
    }, function (h) {
      return isNaN(h) || h <= 0;
    }, function (badParams) {
      return badParams.map(function (badParam) {
        return "Invalid " + badParam.dim + " of " + badParam.val + " " + 'given for secondary size.';
      }).join(' ');
    })) {
      continue;
    } // Check that secondary size is not larger than primary size.


    if (!isFluidPrimary && !validateDimensions(width, height, function (w) {
      return w > primaryWidth;
    }, function (h) {
      return h > primaryHeight;
    }, function (badParams) {
      return badParams.map(function (badParam) {
        return "Secondary " + badParam.dim + " " + badParam.val + " " + ("can't be larger than the primary " + badParam.dim + ".");
      }).join(' ');
    })) {
      continue;
    } // Check that if multi-size-validation is on, that the secondary sizes
    // are at least minRatio of the primary size.


    if (multiSizeValidation) {
      var _ret = function () {
        // The minimum ratio of each secondary dimension to its corresponding
        // primary dimension.
        var minRatio = 2 / 3;
        var minWidth = minRatio * primaryWidth;
        var minHeight = minRatio * primaryHeight;

        if (!validateDimensions(width, height, function (w) {
          return w < minWidth;
        }, function (h) {
          return h < minHeight;
        }, function (badParams) {
          return badParams.map(function (badParam) {
            return "Secondary " + badParam.dim + " " + badParam.val + " is " + ("smaller than 2/3rds of the primary " + badParam.dim + ".");
          }).join(' ');
        })) {
          return "continue";
        }
      }();

      if (_ret === "continue") continue;
    } // Passed all checks! Push additional size to dimensions.


    dimensions.push([width, height]);
  }

  return dimensions;
}
/**
 * A helper function for determining whether a given width or height violates
 * some condition.
 *
 * Checks the width and height against their corresponding conditions. If
 * either of the conditions fail, the errorBuilder function will be called with
 * the appropriate arguments, its result will be logged to user().error, and
 * validateDimensions will return false. Otherwise, validateDimensions will
 * only return true.
 *
 * @param {(number|string)} width
 * @param {(number|string)} height
 * @param {function((number|string)): boolean} widthCond
 * @param {function((number|string)): boolean} heightCond
 * @param {function(!Array<{dim: string, val: (number|string)}>): string=} errorBuilder
 * A function that will produce an informative error message.
 * @return {boolean}
 */


function validateDimensions(width, height, widthCond, heightCond, errorBuilder) {
  var badParams = [];

  if (widthCond(width)) {
    badParams.push({
      dim: 'width',
      val: width
    });
  }

  if (heightCond(height)) {
    badParams.push({
      dim: 'height',
      val: height
    });
  }

  if (badParams.length) {
    (0, _log.user)().warn('AMP-AD', errorBuilder(badParams));
  }

  return !badParams.length;
}
/**
 * Calculates height of responsive matched content slot based on its width.
 * This logic should be kept as close to possible to the logic inside
 * adsbygoogle.js.
 *
 * @param {number} availableWidth
 * @param {!Element} element <amp-ad> tag which contains publisher settings
 *     if any.
 * @return {number} height to use for the matched content slot.
 */


function getMatchedContentResponsiveHeightAndUpdatePubParams(availableWidth, element) {
  var pubControlParams = {
    numberOfRows: element.getAttribute(_contentRecommendation.ExternalCorePubVars.ROWS_NUM),
    numberOfColumns: element.getAttribute(_contentRecommendation.ExternalCorePubVars.COLUMNS_NUM),
    layoutType: element.getAttribute(_contentRecommendation.ExternalCorePubVars.UI_TYPE)
  };
  var config;

  if (pubControlParams.numberOfRows || pubControlParams.numberOfColumns || pubControlParams.layoutType) {
    // Publisher provided at least 1 param  which means we are in
    // "pub controlled matched content" mode.
    config = (0, _contentRecommendation.getPubControlConfig)(availableWidth, pubControlParams);
  } else {
    // Publisher didn't provide any matched content params so use auto mode.
    config = (0, _contentRecommendation.getAutoConfig)(availableWidth, availableWidth <= _contentRecommendation.MIN_PUB_CONTROL_WIDTH_OF_DESKTOP);
  }

  if (config.validationError) {
    (0, _log.user)().error('AMP-AD', config.validationError); // There was an error in pub params and we logged it in console.
    // Return 0 as height to hide slot.

    return 0;
  }

  element.setAttribute(_contentRecommendation.ExternalCorePubVars.ROWS_NUM, config.numberOfRows);
  element.setAttribute(_contentRecommendation.ExternalCorePubVars.COLUMNS_NUM, config.numberOfColumns);
  element.setAttribute(_contentRecommendation.ExternalCorePubVars.UI_TYPE, config.layoutType);
  return config.slotHeight;
}

},{"../../src/log":45,"./a4a/shared/content-recommendation.js":3}],7:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CSS = void 0;
var CSS = "amp-ad iframe,amp-embed iframe{border:0!important;margin:0!important;padding:0!important}.i-amphtml-ad-default-holder{position:absolute;left:0;right:0;top:0;bottom:0;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;background-color:hsla(0,0%,78.4%,0.05)}.i-amphtml-ad-default-holder:after{content:\"Ad\";content:attr(data-ad-holder-text);background-color:transparent;border-radius:2px;color:#696969;font-size:10px;line-height:1;font-family:Arial,sans-serif;padding:3px 4px 1px;border:1px solid #696969}amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl]>iframe,amp-ad[type=adsense]>iframe{top:50%!important;left:50%!important;transform:translate(-50%,-50%)}amp-ad[type=adsense],amp-ad[type=doubleclick]{direction:ltr}amp-ad[data-a4a-upgrade-type=amp-ad-network-adsense-impl]>iframe,amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl]>iframe{min-height:0;min-width:0}amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl][height=fluid]>iframe{height:100%!important;width:100%!important;position:relative}amp-ad[data-a4a-upgrade-type=amp-ad-network-doubleclick-impl][height=fluid]{width:100%!important}\n/*# sourceURL=/extensions/amp-ad/0.1/amp-ad.css*/";
exports.CSS = CSS;

},{}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.cloudflareIsA4AEnabled = cloudflareIsA4AEnabled;

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Determines which tags desire A4A handling
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
 */
function cloudflareIsA4AEnabled(win, element, useRemoteHtml) {
  // We assume fast fetch for all content, but this will gracefully degrade,
  // when non-a4a content is delivered
  return !useRemoteHtml;
}

},{}],9:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.gmosspIsA4AEnabled = gmosspIsA4AEnabled;

var _string = require("../../../src/string");

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const @private {string} */
var GMOSSP_SRC_PREFIX_ = 'https://sp.gmossp-sp.jp/';
/** @const @private {string} */

var GMOSSP_SRC_A4A_PREFIX_ = 'https://amp.sp.gmossp-sp.jp/_a4a/';
/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
 */

function gmosspIsA4AEnabled(win, element, useRemoteHtml) {
  var src;
  return !useRemoteHtml && !!(src = element.getAttribute('src')) && !!element.getAttribute('data-use-a4a') && ((0, _string.startsWith)(src, GMOSSP_SRC_PREFIX_) || (0, _string.startsWith)(src, GMOSSP_SRC_A4A_PREFIX_));
}

},{"../../../src/string":55}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.tripleliftIsA4AEnabled = tripleliftIsA4AEnabled;

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const @private {string} */
var SRC_PREFIX_ = 'https://ib.3lift.com/';
/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
 */

function tripleliftIsA4AEnabled(win, element, useRemoteHtml) {
  var src;
  return !useRemoteHtml && !!element.getAttribute('data-use-a4a') && !!(src = element.getAttribute('src')) && src.indexOf(SRC_PREFIX_) == 0;
}

},{}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpAd3PImpl = exports.TAG_3P_IMPL = void 0;

var _utils = require("../../../ads/google/utils");

var _ampAdUi = require("./amp-ad-ui");

var _ampAdXoriginIframeHandler = require("./amp-ad-xorigin-iframe-handler");

var _consentState = require("../../../src/consent-state");

var _layout = require("../../../src/layout");

var _config = require("../../../ads/_config");

var _math = require("../../../src/utils/math");

var _style = require("../../../src/style");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _adCid = require("../../../src/ad-cid");

var _adHelper = require("../../../src/ad-helper");

var _concurrentLoad = require("./concurrent-load");

var _consent = require("../../../src/consent");

var _pFrame = require("../../../src/3p-frame");

var _experiments = require("../../../src/experiments");

var _layoutRect = require("../../../src/layout-rect");

var _types = require("../../../src/types");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/** @const {string} Tag name for 3P AD implementation. */
var TAG_3P_IMPL = 'amp-ad-3p-impl';
/** @const {number} */

exports.TAG_3P_IMPL = TAG_3P_IMPL;
var MIN_FULL_WIDTH_HEIGHT = 100;
/** @const {number} */

var MAX_FULL_WIDTH_HEIGHT = 500;

var AmpAd3PImpl =
/*#__PURE__*/
function (_AMP$BaseElement) {
  _inheritsLoose(AmpAd3PImpl, _AMP$BaseElement);

  /**
   * @param {!AmpElement} element
   */
  function AmpAd3PImpl(element) {
    var _this;

    _this = _AMP$BaseElement.call(this, element) || this;
    /**
     * @private {?Element}
     * @visibleForTesting
     */

    _this.iframe_ = null;
    /** @type {?Object} */

    _this.config = null;
    /** @type {?AmpAdUIHandler} */

    _this.uiHandler = null;
    /** @private {?AmpAdXOriginIframeHandler} */

    _this.xOriginIframeHandler_ = null;
    /**
     * @private {?Element}
     * @visibleForTesting
     */

    _this.placeholder_ = null;
    /**
     * @private {?Element}
     * @visibleForTesting
     */

    _this.fallback_ = null;
    /** @private {boolean} */

    _this.isInFixedContainer_ = false;
    /**
     * The (relative) layout box of the ad iframe to the amp-ad tag.
     * @private {?../../../src/layout-rect.LayoutRectDef}
     */

    _this.iframeLayoutBox_ = null;
    /**
     * Call to stop listening to viewport changes.
     * @private {?function()}
     * @visibleForTesting
     */

    _this.unlistenViewportChanges_ = null;
    /**
     * @private {IntersectionObserver}
     * @visibleForTesting
     */

    _this.intersectionObserver_ = null;
    /** @private {?string|undefined} */

    _this.container_ = undefined;
    /** @private {?Promise} */

    _this.layoutPromise_ = null;
    /** @private {string|undefined} */

    _this.type_ = undefined;
    /**
     * For full-width responsive ads: whether the element has already been
     * aligned to the edges of the viewport.
     * @private {boolean}
     */

    _this.isFullWidthAligned_ = false;
    /**
     * Whether full-width responsive was requested for this ad.
     * @private {boolean}
     */

    _this.isFullWidthRequested_ = false;
    return _this;
  }
  /** @override */


  var _proto = AmpAd3PImpl.prototype;

  _proto.getLayoutPriority = function getLayoutPriority() {
    // Loads ads after other content,
    var isPWA = !this.element.getAmpDoc().isSingleDoc(); // give the ad higher priority if it is inside a PWA

    return isPWA ? _layout.LayoutPriority.METADATA : _layout.LayoutPriority.ADS;
  }
  /** @override */
  ;

  _proto.renderOutsideViewport = function renderOutsideViewport() {
    if ((0, _concurrentLoad.is3pThrottled)(this.win)) {
      return false;
    } // Otherwise the ad is good to go.


    var elementCheck = (0, _concurrentLoad.getAmpAdRenderOutsideViewport)(this.element);
    return elementCheck !== null ? elementCheck : _AMP$BaseElement.prototype.renderOutsideViewport.call(this);
  }
  /**
   * @param {!Layout} layout
   * @override
   */
  ;

  _proto.isLayoutSupported = function isLayoutSupported(layout) {
    return (0, _layout.isLayoutSizeDefined)(layout);
  }
  /**
   * @return {!../../../src/service/resource.Resource}
   * @visibleForTesting
   */
  ;

  _proto.getResource = function getResource() {
    return this.element.getResources().getResourceForElement(this.element);
  }
  /** @override */
  ;

  _proto.getConsentPolicy = function getConsentPolicy() {
    var type = this.element.getAttribute('type');
    var config = _config.adConfig[type];

    if (config && config['consentHandlingOverride']) {
      return null;
    }

    return _AMP$BaseElement.prototype.getConsentPolicy.call(this);
  }
  /** @override */
  ;

  _proto.buildCallback = function buildCallback() {
    this.type_ = this.element.getAttribute('type');
    var upgradeDelayMs = Math.round(this.getResource().getUpgradeDelayMs());
    (0, _log.dev)().info(TAG_3P_IMPL, "upgradeDelay " + this.type_ + ": " + upgradeDelayMs);
    this.placeholder_ = this.getPlaceholder();
    this.fallback_ = this.getFallback();
    this.config = _config.adConfig[this.type_];
    (0, _log.userAssert)(this.config, "Type \"" + this.type_ + "\" is not supported in amp-ad");
    this.uiHandler = new _ampAdUi.AmpAdUIHandler(this);
    this.isFullWidthRequested_ = this.shouldRequestFullWidth_();

    if (this.isFullWidthRequested_) {
      return this.attemptFullWidthSizeChange_();
    }
  }
  /**
   * @return {boolean}
   * @private
   */
  ;

  _proto.shouldRequestFullWidth_ = function shouldRequestFullWidth_() {
    var hasFullWidth = this.element.hasAttribute('data-full-width');

    if (!hasFullWidth) {
      return false;
    }

    (0, _log.userAssert)(this.element.getAttribute('width') == '100vw', 'Ad units with data-full-width must have width="100vw".');
    (0, _log.userAssert)(!!this.config.fullWidthHeightRatio, 'Ad network does not support full width ads.');
    (0, _log.dev)().info(TAG_3P_IMPL, '#${this.getResource().getId()} Full width requested');
    return true;
  }
  /**
   * Prefetches and preconnects URLs related to the ad.
   * @param {boolean=} opt_onLayout
   * @override
   */
  ;

  _proto.preconnectCallback = function preconnectCallback(opt_onLayout) {
    var _this2 = this;

    // We always need the bootstrap.
    (0, _pFrame.preloadBootstrap)(this.win, this.preconnect, this.config.remoteHTMLDisabled);

    if (typeof this.config.prefetch == 'string') {
      this.preconnect.preload(this.config.prefetch, 'script');
    } else if (this.config.prefetch) {
      this.config.prefetch.forEach(function (p) {
        _this2.preconnect.preload(p, 'script');
      });
    }

    if (typeof this.config.preconnect == 'string') {
      this.preconnect.url(this.config.preconnect, opt_onLayout);
    } else if (this.config.preconnect) {
      this.config.preconnect.forEach(function (p) {
        _this2.preconnect.url(p, opt_onLayout);
      });
    } // If fully qualified src for ad script is specified we preconnect to it.


    var src = this.element.getAttribute('src');

    if (src) {
      // We only preconnect to the src because we cannot know whether the URL
      // will have caching headers set.
      this.preconnect.url(src);
    }
  }
  /**
   * @override
   */
  ;

  _proto.onLayoutMeasure = function onLayoutMeasure() {
    var _this3 = this;

    this.isInFixedContainer_ = !(0, _adHelper.isAdPositionAllowed)(this.element, this.win);
    /** detect ad containers, add the list to element as a new attribute */

    if (this.container_ === undefined) {
      this.container_ = (0, _adHelper.getAdContainer)(this.element);
    } // We remeasured this tag, let's also remeasure the iframe. Should be
    // free now and it might have changed.


    this.measureIframeLayoutBox_();

    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.onLayoutMeasure();
    }

    if (this.isFullWidthRequested_ && !this.isFullWidthAligned_) {
      this.isFullWidthAligned_ = true;
      var layoutBox = this.getLayoutBox(); // Nudge into the correct horizontal position by changing side margin.

      this.getVsync().run({
        measure: function measure(state) {
          state.direction = (0, _style.computedStyle)(_this3.win, _this3.element)['direction'];
        },
        mutate: function mutate(state) {
          if (state.direction == 'rtl') {
            (0, _style.setStyle)(_this3.element, 'marginRight', layoutBox.left, 'px');
          } else {
            (0, _style.setStyle)(_this3.element, 'marginLeft', -layoutBox.left, 'px');
          }
        }
      }, {
        direction: ''
      });
    }
  }
  /**
   * Measure the layout box of the iframe if we rendered it already.
   * @private
   */
  ;

  _proto.measureIframeLayoutBox_ = function measureIframeLayoutBox_() {
    if (this.xOriginIframeHandler_ && this.xOriginIframeHandler_.iframe) {
      var iframeBox = this.getViewport().getLayoutRect(this.xOriginIframeHandler_.iframe);
      var box = this.getLayoutBox(); // Cache the iframe's relative position to the amp-ad. This is
      // necessary for fixed-position containers which "move" with the
      // viewport.

      this.iframeLayoutBox_ = (0, _layoutRect.moveLayoutRect)(iframeBox, -box.left, -box.top);
    }
  }
  /**
   * @override
   */
  ;

  _proto.getIntersectionElementLayoutBox = function getIntersectionElementLayoutBox() {
    if (!this.xOriginIframeHandler_ || !this.xOriginIframeHandler_.iframe) {
      return _AMP$BaseElement.prototype.getIntersectionElementLayoutBox.call(this);
    }

    var box = this.getLayoutBox();

    if (!this.iframeLayoutBox_) {
      this.measureIframeLayoutBox_();
    }

    var iframe =
    /** @type {!../../../src/layout-rect.LayoutRectDef} */
    (0, _log.devAssert)(this.iframeLayoutBox_);
    return (0, _layoutRect.moveLayoutRect)(iframe, box.left, box.top);
  }
  /** @override */
  ;

  _proto.layoutCallback = function layoutCallback() {
    var _this4 = this;

    if (this.layoutPromise_) {
      return this.layoutPromise_;
    }

    (0, _log.userAssert)(!this.isInFixedContainer_, '<amp-ad> is not allowed to be placed in elements with ' + 'position:fixed: %s', this.element);
    var consentPromise = this.getConsentState();

    var consentPolicyId = _AMP$BaseElement.prototype.getConsentPolicy.call(this);

    var isConsentV2Experiment = (0, _experiments.isExperimentOn)(this.win, 'amp-consent-v2');
    var consentStringPromise = consentPolicyId && isConsentV2Experiment ? (0, _consent.getConsentPolicyInfo)(this.element, consentPolicyId) : Promise.resolve(null);
    var sharedDataPromise = consentPolicyId ? (0, _consent.getConsentPolicySharedData)(this.element, consentPolicyId) : Promise.resolve(null);
    this.layoutPromise_ = Promise.all([(0, _adCid.getAdCid)(this), consentPromise, sharedDataPromise, consentStringPromise]).then(function (consents) {
      // Use JsonObject to preserve field names so that ampContext can access
      // values with name
      // ampcontext.js and this file are compiled in different compilation unit
      // Note: Field names can by perserved by using JsonObject, or by adding
      // perserved name to extern. We are doing both right now.
      // Please also add new introduced variable
      // name to the extern list.
      var opt_context = (0, _object.dict)({
        'clientId': consents[0] || null,
        'container': _this4.container_,
        'initialConsentState': consents[1],
        'consentSharedData': consents[2]
      });

      if (isConsentV2Experiment) {
        opt_context['initialConsentValue'] = consents[3];
      } // In this path, the request and render start events are entangled,
      // because both happen inside a cross-domain iframe.  Separating them
      // here, though, allows us to measure the impact of ad throttling via
      // incrementLoadingAds().


      var iframe = (0, _pFrame.getIframe)((0, _types.toWin)(_this4.element.ownerDocument.defaultView), _this4.element, _this4.type_, opt_context, {
        disallowCustom: _this4.config.remoteHTMLDisabled
      });
      _this4.xOriginIframeHandler_ = new _ampAdXoriginIframeHandler.AmpAdXOriginIframeHandler(_this4);
      return _this4.xOriginIframeHandler_.init(iframe);
    });
    (0, _concurrentLoad.incrementLoadingAds)(this.win, this.layoutPromise_);
    return this.layoutPromise_;
  }
  /**
   * @param {boolean} inViewport
   * @override
   */
  ;

  _proto.viewportCallback = function viewportCallback(inViewport) {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.viewportCallback(inViewport);
    }
  }
  /** @override */
  ;

  _proto.unlayoutOnPause = function unlayoutOnPause() {
    return !this.xOriginIframeHandler_ || !this.xOriginIframeHandler_.isPausable();
  }
  /** @override  */
  ;

  _proto.pauseCallback = function pauseCallback() {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.setPaused(true);
    }
  }
  /** @override  */
  ;

  _proto.resumeCallback = function resumeCallback() {
    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.setPaused(false);
    }
  }
  /** @override  */
  ;

  _proto.unlayoutCallback = function unlayoutCallback() {
    this.layoutPromise_ = null;
    this.uiHandler.applyUnlayoutUI();

    if (this.xOriginIframeHandler_) {
      this.xOriginIframeHandler_.freeXOriginIframe();
      this.xOriginIframeHandler_ = null;
    }

    return true;
  }
  /**
   * @return {!Promise<?CONSENT_POLICY_STATE>}
   */
  ;

  _proto.getConsentState = function getConsentState() {
    var consentPolicyId = _AMP$BaseElement.prototype.getConsentPolicy.call(this);

    return consentPolicyId ? (0, _consent.getConsentPolicyState)(this.element, consentPolicyId) : Promise.resolve(null);
  }
  /**
   * Calculates and attempts to set the appropriate height & width for a
   * responsive full width ad unit.
   * @return {!Promise}
   * @private
   */
  ;

  _proto.attemptFullWidthSizeChange_ = function attemptFullWidthSizeChange_() {
    var viewportSize = this.getViewport().getSize();
    var maxHeight = Math.min(MAX_FULL_WIDTH_HEIGHT, viewportSize.height);
    var width = viewportSize.width;
    var height = this.getFullWidthHeight_(width, maxHeight); // Attempt to resize to the correct height. The width should already be
    // 100vw, but is fixed here so that future resizes of the viewport don't
    // affect it.

    return this.attemptChangeSize(height, width).then(function () {
      (0, _log.dev)().info(TAG_3P_IMPL, "Size change accepted: " + width + "x" + height);
    }, function () {
      (0, _log.dev)().info(TAG_3P_IMPL, "Size change rejected: " + width + "x" + height);
    });
  }
  /**
   * Calculates the appropriate width for a responsive full width ad unit.
   * @param {number} width
   * @param {number} maxHeight
   * @return {number}
   * @private
   */
  ;

  _proto.getFullWidthHeight_ = function getFullWidthHeight_(width, maxHeight) {
    // TODO(google a4a eng): remove this once adsense switches fully to
    // fast fetch.
    if (this.element.getAttribute('data-auto-format') === _utils.ADSENSE_MCRSPV_TAG) {
      return (0, _utils.getMatchedContentResponsiveHeightAndUpdatePubParams)(width, this.element);
    }

    return (0, _math.clamp)(Math.round(width / this.config.fullWidthHeightRatio), MIN_FULL_WIDTH_HEIGHT, maxHeight);
  };

  return AmpAd3PImpl;
}(AMP.BaseElement);

exports.AmpAd3PImpl = AmpAd3PImpl;

},{"../../../ads/_config":2,"../../../ads/google/utils":6,"../../../src/3p-frame":18,"../../../src/ad-cid":19,"../../../src/ad-helper":20,"../../../src/consent":26,"../../../src/consent-state":25,"../../../src/experiments":34,"../../../src/layout":44,"../../../src/layout-rect":43,"../../../src/log":45,"../../../src/style":57,"../../../src/types":58,"../../../src/utils/math":66,"../../../src/utils/object":67,"./amp-ad-ui":13,"./amp-ad-xorigin-iframe-handler":14,"./concurrent-load":16}],12:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpAdCustom = exports.TAG_AD_CUSTOM = void 0;

var _ampAdUi = require("./amp-ad-ui");

var _commonSignals = require("../../../src/common-signals");

var _layout = require("../../../src/layout");

var _services = require("../../../src/services");

var _url = require("../../../src/url");

var _dom = require("../../../src/dom");

var _object = require("../../../src/utils/object");

var _log = require("../../../src/log");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/** @const {string} Tag name for custom ad implementation. */
var TAG_AD_CUSTOM = 'amp-ad-custom';
/** @type {Object} A map of promises for each value of data-url. The promise
 *  will fetch data for the URL for the ad server, and return it as a map of
 *  objects, keyed by slot; each object contains the variables to be
 *   substituted into the mustache template. */

exports.TAG_AD_CUSTOM = TAG_AD_CUSTOM;
var ampCustomadXhrPromises = {};
/** @type {Object} a map of full urls (i.e. including the ampslots parameter)
 * for each value of data-url */

var ampCustomadFullUrls = null;

var AmpAdCustom =
/*#__PURE__*/
function (_AMP$BaseElement) {
  _inheritsLoose(AmpAdCustom, _AMP$BaseElement);

  /** @param {!AmpElement} element */
  function AmpAdCustom(element) {
    var _this;

    _this = _AMP$BaseElement.call(this, element) || this;
    /** @private {?string} The base URL of the ad server for this ad */

    _this.url_ = null;
    /** @private {?string} A string identifying this ad slot: the server's
     *  responses will be keyed by slot */

    _this.slot_ = null;
    /** @type {?AmpAdUIHandler} */

    _this.uiHandler = null;
    return _this;
  }
  /** @override */


  var _proto = AmpAdCustom.prototype;

  _proto.getLayoutPriority = function getLayoutPriority() {
    // Since this is AMPHTML we are trusting that it will load responsibly
    return _layout.LayoutPriority.CONTENT;
  }
  /** @override */
  ;

  _proto.isLayoutSupported = function isLayoutSupported(layout) {
    // TODO: Add proper support for more layouts, and figure out which ones
    // we're permitting
    return (0, _layout.isLayoutSizeDefined)(layout);
  }
  /**
   * Builds AmpAdUIHandler callback
   */
  ;

  _proto.buildCallback = function buildCallback() {
    this.url_ = this.element.getAttribute('data-url');
    this.slot_ = this.element.getAttribute('data-slot'); // Ensure that the slot value is legal

    (0, _log.userAssert)(this.slot_ === null || this.slot_.match(/^[0-9a-z]+$/), 'custom ad slot should be alphanumeric: ' + this.slot_);

    var urlService = _services.Services.urlForDoc(this.element);

    (0, _log.userAssert)(this.url_ && urlService.isSecure(this.url_), 'custom ad url must be an HTTPS URL');
    this.uiHandler = new _ampAdUi.AmpAdUIHandler(this);
  }
  /** @override */
  ;

  _proto.layoutCallback = function layoutCallback() {
    var _this2 = this;

    /** @const {string} fullUrl */
    var fullUrl = this.getFullUrl_(); // if we have cached the response, find it, otherwise fetch

    var responsePromise = ampCustomadXhrPromises[fullUrl] || _services.Services.xhrFor(this.win).fetchJson(fullUrl).then(function (res) {
      return res.json();
    });

    if (this.slot_ !== null) {
      // Cache this response if using `data-slot` feature so only one request
      // is made per url
      ampCustomadXhrPromises[fullUrl] = responsePromise;
    }

    return responsePromise.then(function (data) {
      // We will get here when the data has been fetched from the server
      var templateData = data;

      if (_this2.slot_ !== null) {
        templateData = (0, _object.hasOwn)(data, _this2.slot_) ? data[_this2.slot_] : null;
      }

      if (!templateData || typeof templateData != 'object') {
        _this2.uiHandler.applyNoContentUI();

        return;
      }

      templateData = _this2.handleTemplateData_(templateData);

      _this2.renderStarted();

      try {
        _services.Services.templatesFor(_this2.win).findAndRenderTemplate(_this2.element, templateData).then(function (renderedElement) {
          // Get here when the template has been rendered Clear out the
          // child template and replace it by the rendered version Note that
          // we can't clear templates that's not ad's child because they
          // maybe used by other ad component.
          (0, _dom.removeChildren)(_this2.element);

          _this2.element.appendChild(renderedElement);

          _this2.signals().signal(_commonSignals.CommonSignals.INI_LOAD);
        });
      } catch (e) {
        _this2.uiHandler.applyNoContentUI();
      }
    });
  }
  /**
   * Handles the template data response.
   * There are two types of templateData format
   * Format option 1
   * {
   *   'templateId': {},
   *   'vars': {},
   *   'data': {
   *     'a': '1',
   *     'b': '2'
   *   }
   * }
   * or format option 2
   * {
   *  'a': '1',
   *  'b': '2'
   * }
   * if `templateId` or `vars` are not specified.
   *
   * @param {!JsonObject} templateData
   * @return {!JsonObject}
   */
  ;

  _proto.handleTemplateData_ = function handleTemplateData_(templateData) {
    if ((0, _dom.childElementByTag)(this.element, 'template')) {
      // Need to check for template attribute if it's allowed in amp-ad tag
      return templateData;
    } // If use remote template specified by response


    (0, _log.userAssert)(templateData['templateId'], 'TemplateId not specified');
    (0, _log.userAssert)(templateData['data'] && typeof templateData['data'] == 'object', 'Template data not specified');
    this.element.setAttribute('template', templateData['templateId']);

    if (templateData['vars'] && typeof templateData['vars'] == 'object') {
      // Support for vars
      var vars = templateData['vars'];
      var keys = Object.keys(vars);

      for (var i = 0; i < keys.length; i++) {
        var attrName = 'data-vars-' + keys[i];

        try {
          this.element.setAttribute(attrName, vars[keys[i]]);
        } catch (e) {
          this.user().error(TAG_AD_CUSTOM, 'Fail to set attribute: ', e);
        }
      }
    }

    return templateData['data'];
  }
  /** @override  */
  ;

  _proto.unlayoutCallback = function unlayoutCallback() {
    this.uiHandler.applyUnlayoutUI();
    return true;
  }
  /**
   * @private getFullUrl_ Get a URL which includes a parameter indicating
   * all slots to be fetched from this web server URL
   * @return {string} The URL with the "ampslots" parameter appended
   */
  ;

  _proto.getFullUrl_ = function getFullUrl_() {
    // If this ad doesn't have a slot defined, just return the base URL
    if (this.slot_ === null) {
      return (0, _log.userAssert)(this.url_);
    }

    if (ampCustomadFullUrls === null) {
      // The array of ad urls has not yet been built, do so now.
      ampCustomadFullUrls = {};
      var slots = {}; // Get the parent body of this amp-ad element. It could be the body of
      // the main document, or it could be an enclosing iframe.

      var body = (0, _dom.closestAncestorElementBySelector)(this.element, 'BODY');
      var elements = body.querySelectorAll('amp-ad[type=custom]');

      for (var index = 0; index < elements.length; index++) {
        var elem = elements[index];
        var url = elem.getAttribute('data-url');
        var slotId = elem.getAttribute('data-slot');

        if (slotId !== null) {
          if (!(url in slots)) {
            slots[url] = [];
          }

          slots[url].push(encodeURIComponent(slotId));
        }
      }

      for (var baseUrl in slots) {
        ampCustomadFullUrls[baseUrl] = (0, _url.addParamToUrl)(baseUrl, 'ampslots', slots[baseUrl].join(','));
      }
    }

    return ampCustomadFullUrls[this.url_];
  };

  return AmpAdCustom;
}(AMP.BaseElement);

exports.AmpAdCustom = AmpAdCustom;

},{"../../../src/common-signals":23,"../../../src/dom":29,"../../../src/layout":44,"../../../src/log":45,"../../../src/services":53,"../../../src/url":61,"../../../src/utils/object":67,"./amp-ad-ui":13}],13:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpAdUIHandler = void 0;

var _dom = require("../../../src/dom");

var _adHelper = require("../../../src/ad-helper");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var AmpAdUIHandler =
/*#__PURE__*/
function () {
  /**
   * @param {!AMP.BaseElement} baseInstance
   */
  function AmpAdUIHandler(baseInstance) {
    /** @private {!AMP.BaseElement} */
    this.baseInstance_ = baseInstance;
    /** @private {!Element} */

    this.element_ = baseInstance.element;
    /** @private @const {!Document} */

    this.doc_ = baseInstance.win.document;
    this.containerElement_ = null;

    if (this.element_.hasAttribute('data-ad-container-id')) {
      var id = this.element_.getAttribute('data-ad-container-id');
      var container = this.doc_.getElementById(id);

      if (container && container.tagName == 'AMP-LAYOUT' && container.contains(this.element_)) {
        // Parent <amp-layout> component with reference id can serve as the
        // ad container
        this.containerElement_ = container;
      }
    }

    if (!baseInstance.getFallback()) {
      var fallback = this.addDefaultUiComponent_('fallback');

      if (fallback) {
        this.baseInstance_.element.appendChild(fallback);
      }
    }
  }
  /**
   * Apply UI for laid out ad with no-content
   * Order: try collapse -> apply provided fallback -> apply default fallback
   */


  var _proto = AmpAdUIHandler.prototype;

  _proto.applyNoContentUI = function applyNoContentUI() {
    var _this = this;

    if ((0, _adHelper.getAdContainer)(this.element_) === 'AMP-STICKY-AD') {
      // Special case: force collapse sticky-ad if no content.
      this.baseInstance_.
      /*OK*/
      collapse();
      return;
    }

    if ((0, _adHelper.getAdContainer)(this.element_) === 'AMP-FX-FLYING-CARPET') {
      /**
       * Special case: Force collapse the ad if it is the,
       * only and direct child of a flying carpet.
       * Also, this will not handle
       * the amp-layout case for now, as it could be
       * inefficient. And we have not seen an amp-layout
       * used with flying carpet and ads yet.
       */
      var flyingCarpetElements = (0, _dom.ancestorElementsByTag)(this.element_, 'amp-fx-flying-carpet');
      var flyingCarpetElement = flyingCarpetElements[0];
      flyingCarpetElement.getImpl().then(function (implementation) {
        var children = implementation.getChildren();

        if (children.length === 1 && children[0] === _this.element_) {
          _this.baseInstance_.
          /*OK*/
          collapse();
        }
      });
      return;
    }

    var attemptCollapsePromise;

    if (this.containerElement_) {
      // Collapse the container element if there's one
      attemptCollapsePromise = this.element_.getResources().attemptCollapse(this.containerElement_);
      attemptCollapsePromise.then(function () {});
    } else {
      attemptCollapsePromise = this.baseInstance_.attemptCollapse();
    } // The order here is collapse > user provided fallback > default fallback


    attemptCollapsePromise.catch(function () {
      _this.baseInstance_.mutateElement(function () {
        _this.baseInstance_.togglePlaceholder(false);

        _this.baseInstance_.toggleFallback(true);
      });
    });
  }
  /**
   * Apply UI for unlaid out ad: Hide fallback.
   * Note: No need to togglePlaceholder here, unlayout show it by default.
   */
  ;

  _proto.applyUnlayoutUI = function applyUnlayoutUI() {
    var _this2 = this;

    this.baseInstance_.mutateElement(function () {
      _this2.baseInstance_.toggleFallback(false);
    });
  }
  /**
   * @param {string} name
   * @return {?Element}
   * @private
   */
  ;

  _proto.addDefaultUiComponent_ = function addDefaultUiComponent_(name) {
    if (this.element_.tagName == 'AMP-EMBED') {
      // Do nothing for amp-embed element;
      return null;
    }

    var uiComponent = this.doc_.createElement('div');
    uiComponent.setAttribute(name, '');
    var content = this.doc_.createElement('div');
    content.classList.add('i-amphtml-ad-default-holder'); // TODO(aghassemi, #4146) i18n

    content.setAttribute('data-ad-holder-text', 'Ad');
    uiComponent.appendChild(content);
    return uiComponent;
  }
  /**
   * @param {number|string|undefined} height
   * @param {number|string|undefined} width
   * @param {number} iframeHeight
   * @param {number} iframeWidth
   * @param {!MessageEvent} event
   * @return {!Promise<!Object>}
   */
  ;

  _proto.updateSize = function updateSize(height, width, iframeHeight, iframeWidth, event) {
    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    var newHeight, newWidth;
    height = parseInt(height, 10);

    if (!isNaN(height)) {
      newHeight = Math.max(this.element_.
      /*OK*/
      offsetHeight + height - iframeHeight, height);
    }

    width = parseInt(width, 10);

    if (!isNaN(width)) {
      newWidth = Math.max(this.element_.
      /*OK*/
      offsetWidth + width - iframeWidth, width);
    }
    /** @type {!Object<boolean, number|undefined, number|undefined>} */


    var resizeInfo = {
      success: true,
      newWidth: newWidth,
      newHeight: newHeight
    };

    if (!newHeight && !newWidth) {
      return Promise.reject(new Error('undefined width and height'));
    }

    if ((0, _adHelper.getAdContainer)(this.element_) == 'AMP-STICKY-AD') {
      // Special case: force collapse sticky-ad if no content.
      resizeInfo.success = false;
      return Promise.resolve(resizeInfo);
    }

    return this.baseInstance_.attemptChangeSize(newHeight, newWidth, event).then(function () {
      return resizeInfo;
    }, function () {
      resizeInfo.success = false;
      return resizeInfo;
    });
  };

  return AmpAdUIHandler;
}(); // Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.


exports.AmpAdUIHandler = AmpAdUIHandler;
AMP.AmpAdUIHandler = AmpAdUIHandler;

},{"../../../src/ad-helper":20,"../../../src/dom":29}],14:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpAdXOriginIframeHandler = void 0;

var _pFrameMessaging = require("../../../src/3p-frame-messaging");

var _commonSignals = require("../../../src/common-signals");

var _promise = require("../../../src/utils/promise");

var _intersectionObserver = require("../../../src/intersection-observer");

var _services = require("../../../src/services");

var _iframeHelper = require("../../../src/iframe-helper");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _eventHelper = require("../../../src/event-helper");

var _getHtml = require("../../../src/get-html");

var _experiments = require("../../../src/experiments");

var _utils = require("../../../ads/google/a4a/utils");

var _dom = require("../../../src/dom");

var _error = require("../../../src/error");

var _style = require("../../../src/style");

var _rateLimit = require("../../../src/utils/rate-limit");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var VISIBILITY_TIMEOUT = 10000;
var MIN_INABOX_POSITION_EVENT_INTERVAL = 100;

var AmpAdXOriginIframeHandler =
/*#__PURE__*/
function () {
  /**
   * @param {!./amp-ad-3p-impl.AmpAd3PImpl|!../../amp-a4a/0.1/amp-a4a.AmpA4A} baseInstance
   */
  function AmpAdXOriginIframeHandler(baseInstance) {
    /** @private {!Window} */
    this.win_ = baseInstance.win;
    /** @private */

    this.baseInstance_ = baseInstance;
    /** @private {!Element} */

    this.element_ = baseInstance.element;
    /** @private {?./amp-ad-ui.AmpAdUIHandler} */

    this.uiHandler_ = baseInstance.uiHandler;
    /** @type {?HTMLIFrameElement} iframe instance */

    this.iframe = null;
    /** @private {?IntersectionObserver} */

    this.intersectionObserver_ = null;
    /** @private {SubscriptionApi} */

    this.embedStateApi_ = null;
    /** @private {?SubscriptionApi} */

    this.inaboxPositionApi_ = null;
    /** @private {boolean} */

    this.isInaboxPositionApiInit_ = false;
    /** @private {!Array<!Function>} functions to unregister listeners */

    this.unlisteners_ = [];
    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */

    this.viewport_ = _services.Services.viewportForDoc(this.baseInstance_.getAmpDoc());
    /** @private {boolean} */

    this.sendPositionPending_ = false;
  }
  /**
   * Sets up listeners and iframe state for iframe containing ad creative.
   * @param {!HTMLIFrameElement} iframe
   * @param {boolean=} opt_isA4A when true do not listen to ad response
   * @param {boolean=} opt_letCreativeTriggerRenderStart Whether to wait for
   *    render start from the creative, or simply trigger it in here.
   * @return {!Promise} awaiting render complete promise
   */


  var _proto = AmpAdXOriginIframeHandler.prototype;

  _proto.init = function init(iframe, opt_isA4A, opt_letCreativeTriggerRenderStart) {
    var _this = this;

    (0, _log.devAssert)(!this.iframe, 'multiple invocations of init without destroy!');
    this.iframe = iframe;
    this.iframe.setAttribute('scrolling', 'no');
    this.baseInstance_.applyFillContent(this.iframe);

    var timer = _services.Services.timerFor(this.baseInstance_.win); // Init IntersectionObserver service.


    this.intersectionObserver_ = new _intersectionObserver.IntersectionObserver(this.baseInstance_, this.iframe, true);
    this.embedStateApi_ = new _iframeHelper.SubscriptionApi(this.iframe, 'send-embed-state', true, function () {
      return _this.sendEmbedInfo_(_this.baseInstance_.isInViewport());
    }); // Enable creative position observer if inabox experiment enabled OR
    // adsense running on non-CDN cache where AMP creatives are xdomained and
    // may require this information.

    if ((0, _experiments.isExperimentOn)(this.win_, 'inabox-position-api') || /^adsense$/i.test(this.element_.getAttribute('type')) && !(0, _utils.isGoogleAdsA4AValidEnvironment)(this.win_)) {
      // To provide position to inabox.
      this.inaboxPositionApi_ = new _iframeHelper.SubscriptionApi(this.iframe, _pFrameMessaging.MessageType.SEND_POSITIONS, true, function () {
        // TODO(@zhouyx): Make sendPosition_ only send to
        // message origin iframe
        _this.sendPosition_();

        _this.registerPosition_();
      });
    } // Triggered by context.reportRenderedEntityIdentifier(…) inside the ad
    // iframe.


    (0, _iframeHelper.listenForOncePromise)(this.iframe, 'entity-id', true).then(function (info) {
      _this.element_.creativeId = info.data['id'];
    });
    this.handleOneTimeRequest_(_pFrameMessaging.MessageType.GET_HTML, function (payload) {
      var selector = payload['selector'];
      var attributes = payload['attributes'];
      var content = '';

      if (_this.element_.hasAttribute('data-html-access-allowed')) {
        content = (0, _getHtml.getHtml)(_this.baseInstance_.win, selector, attributes);
      }

      return Promise.resolve(content);
    });
    this.handleOneTimeRequest_(_pFrameMessaging.MessageType.GET_CONSENT_STATE, function () {
      return _this.baseInstance_.getConsentState().then(function (consentState) {
        return {
          consentState: consentState
        };
      });
    }); // Install iframe resize API.

    this.unlisteners_.push((0, _iframeHelper.listenFor)(this.iframe, 'embed-size', function (data, source, origin, event) {
      if (!!data['hasOverflow']) {
        _this.element_.warnOnMissingOverflow = false;
      }

      _this.handleResize_(data['height'], data['width'], source, origin, event);
    }, true, true));
    this.unlisteners_.push(this.baseInstance_.getAmpDoc().onVisibilityChanged(function () {
      _this.sendEmbedInfo_(_this.baseInstance_.isInViewport());
    }));
    this.unlisteners_.push((0, _iframeHelper.listenFor)(this.iframe, _pFrameMessaging.MessageType.USER_ERROR_IN_IFRAME, function (data) {
      _this.userErrorForAnalytics_(data['message']);
    }, true, true
    /* opt_includingNestedWindows */
    )); // Iframe.onload normally called by the Ad after full load.

    var iframeLoadPromise = this.baseInstance_.loadPromise(this.iframe).then(function () {
      // Wait just a little to allow `no-content` message to arrive.
      if (_this.iframe) {
        // Chrome does not reflect the iframe readystate.
        _this.iframe.readyState = 'complete';
      }

      return timer.promise(10);
    }); // Calculate render-start and no-content signals.

    var _ref = new _promise.Deferred(),
        renderStartPromise = _ref.promise,
        renderStartResolve = _ref.resolve;

    var _ref2 = new _promise.Deferred(),
        noContentPromise = _ref2.promise,
        noContentResolve = _ref2.resolve;

    if (this.baseInstance_.config && this.baseInstance_.config.renderStartImplemented) {
      // When `render-start` is supported, these signals are mutually
      // exclusive. Whichever arrives first wins.
      (0, _iframeHelper.listenForOncePromise)(this.iframe, ['render-start', 'no-content'], true).then(function (info) {
        var data = info.data;

        if (data['type'] == 'render-start') {
          _this.renderStartMsgHandler_(info);

          renderStartResolve();
        } else {
          _this.noContent_();

          noContentResolve();
        }
      });
    } else {
      // If `render-start` is not supported, listen to `bootstrap-loaded`.
      // This will avoid keeping the Ad empty until it's fully loaded, which
      // could be a long time.
      (0, _iframeHelper.listenForOncePromise)(this.iframe, 'bootstrap-loaded', true).then(function () {
        renderStartResolve();
      }); // Likewise, no-content is observed here. However, it's impossible to
      // assure exclusivity between `no-content` and `bootstrap-loaded` b/c
      // `bootstrap-loaded` always arrives first.

      (0, _iframeHelper.listenForOncePromise)(this.iframe, 'no-content', true).then(function () {
        _this.noContent_();

        noContentResolve();
      });
    } // Wait for initial load signal. Notice that this signal is not
    // used to resolve the final layout promise because iframe may still be
    // consuming significant network and CPU resources.


    (0, _iframeHelper.listenForOncePromise)(this.iframe, _commonSignals.CommonSignals.INI_LOAD, true).then(function () {
      // TODO(dvoytenko, #7788): ensure that in-a-box "ini-load" message is
      // received here as well.
      _this.baseInstance_.signals().signal(_commonSignals.CommonSignals.INI_LOAD);
    }); // If "pausable-iframe" enabled, try to make the iframe pausable. It doesn't
    // matter here whether this will succeed or not.

    if ((0, _experiments.isExperimentOn)(this.win_, 'pausable-iframe')) {
      (0, _iframeHelper.makePausable)(this.iframe);
    }

    this.element_.appendChild(this.iframe);

    if (opt_isA4A && !opt_letCreativeTriggerRenderStart) {
      // A4A writes creative frame directly to page once creative is received
      // and therefore does not require render start message so attach and
      // impose no loader delay.  Network is using renderStart or
      // bootstrap-loaded to indicate ad request was sent, either way we know
      // that occurred for Fast Fetch.
      this.baseInstance_.renderStarted();
      renderStartResolve();
    } else {
      // Set iframe initially hidden which will be removed on render-start or
      // load, whichever is earlier.
      (0, _style.setStyle)(this.iframe, 'visibility', 'hidden');
    }

    Promise.race([renderStartPromise, iframeLoadPromise, timer.promise(VISIBILITY_TIMEOUT)]).then(function () {
      // Common signal RENDER_START invoked at toggle visibility time
      // Note: 'render-start' msg and common signal RENDER_START are different
      // 'render-start' msg is a way for implemented Ad to display ad earlier
      // RENDER_START signal is a signal to inform AMP runtime and other AMP
      // elements that the component visibility has been toggled on.
      _this.baseInstance_.renderStarted();

      if (_this.iframe) {
        (0, _style.setStyle)(_this.iframe, 'visibility', '');
      }
    }); // The actual ad load is eariliest of iframe.onload event and no-content.

    return Promise.race([iframeLoadPromise, noContentPromise]);
  }
  /**
   * @param {string} requestType
   * @param {function(*)} getter
   * @private
   */
  ;

  _proto.handleOneTimeRequest_ = function handleOneTimeRequest_(requestType, getter) {
    var _this2 = this;

    this.unlisteners_.push((0, _iframeHelper.listenFor)(this.iframe, requestType, function (info, source, origin) {
      if (!_this2.iframe) {
        return;
      }

      var messageId = info[_pFrameMessaging.CONSTANTS.messageIdFieldName];
      var payload = info[_pFrameMessaging.CONSTANTS.payloadFieldName];
      getter(payload).then(function (content) {
        var result = (0, _object.dict)();
        result[_pFrameMessaging.CONSTANTS.messageIdFieldName] = messageId;
        result[_pFrameMessaging.CONSTANTS.contentFieldName] = content;
        (0, _iframeHelper.postMessageToWindows)((0, _log.dev)().assertElement(_this2.iframe), [{
          win: source,
          origin: origin
        }], requestType + _pFrameMessaging.CONSTANTS.responseTypeSuffix, result, true);
      });
    }, true
    /* opt_is3P */
    , false
    /* opt_includingNestedWindows */
    ));
  }
  /**
   * callback functon on receiving render-start
   * @param {{data: !JsonObject}} info
   * @private
   */
  ;

  _proto.renderStartMsgHandler_ = function renderStartMsgHandler_(info) {
    var data = (0, _eventHelper.getData)(info);
    this.handleResize_(data['height'], data['width'], info['source'], info['origin'], info['event']);
  }
  /**
   * Cleans up the listeners on the cross domain ad iframe and frees the
   * iframe resource.
   * @param {boolean=} opt_keep
   */
  ;

  _proto.freeXOriginIframe = function freeXOriginIframe(opt_keep) {
    this.cleanup_(); // If ask to keep the iframe.
    // Use in the case of no-content and iframe is a master iframe.

    if (opt_keep) {
      return;
    }

    if (this.iframe) {
      (0, _dom.removeElement)(this.iframe);
      this.iframe = null;
    }
  }
  /**
   * Cleans up listeners on the ad, and apply the default UI for ad.
   * @private
   */
  ;

  _proto.noContent_ = function noContent_() {
    if (!this.iframe) {
      // unlayout already called
      return;
    }

    this.freeXOriginIframe(this.iframe.name.indexOf('_master') >= 0);
    this.uiHandler_.applyNoContentUI();
  }
  /**
   * Cleans up listeners on the ad iframe.
   * @private
   */
  ;

  _proto.cleanup_ = function cleanup_() {
    this.unlisteners_.forEach(function (unlistener) {
      return unlistener();
    });
    this.unlisteners_.length = 0;

    if (this.embedStateApi_) {
      this.embedStateApi_.destroy();
      this.embedStateApi_ = null;
    }

    if (this.inaboxPositionApi_) {
      this.inaboxPositionApi_.destroy();
      this.inaboxPositionApi_ = null;
    }

    if (this.intersectionObserver_) {
      this.intersectionObserver_.destroy();
      this.intersectionObserver_ = null;
    }
  }
  /**
   * Updates the element's dimensions to accommodate the iframe's
   * requested dimensions. Notifies the window that request the resize
   * of success or failure.
   * @param {number|string|undefined} height
   * @param {number|string|undefined} width
   * @param {!Window} source
   * @param {string} origin
   * @param {!MessageEvent} event
   * @private
   */
  ;

  _proto.handleResize_ = function handleResize_(height, width, source, origin, event) {
    var _this3 = this;

    this.baseInstance_.getVsync().mutate(function () {
      if (!_this3.iframe) {
        // iframe can be cleanup before vsync.
        return;
      }

      var iframeHeight = _this3.iframe.
      /*OK*/
      offsetHeight;
      var iframeWidth = _this3.iframe.
      /*OK*/
      offsetWidth;

      _this3.uiHandler_.updateSize(height, width, iframeHeight, iframeWidth, event).then(function (info) {
        _this3.sendEmbedSizeResponse_(info.success, info.newWidth, info.newHeight, source, origin);
      }, function () {});
    });
  }
  /**
   * Sends a response to the window which requested a resize.
   * @param {boolean} success
   * @param {number} requestedWidth
   * @param {number} requestedHeight
   * @param {!Window} source
   * @param {string} origin
   * @private
   */
  ;

  _proto.sendEmbedSizeResponse_ = function sendEmbedSizeResponse_(success, requestedWidth, requestedHeight, source, origin) {
    // The iframe may have been removed by the time we resize.
    if (!this.iframe) {
      return;
    }

    (0, _iframeHelper.postMessageToWindows)(this.iframe, [{
      win: source,
      origin: origin
    }], success ? 'embed-size-changed' : 'embed-size-denied', (0, _object.dict)({
      'requestedWidth': requestedWidth,
      'requestedHeight': requestedHeight
    }), true);
  }
  /**
   * @param {boolean} inViewport
   * @private
   */
  ;

  _proto.sendEmbedInfo_ = function sendEmbedInfo_(inViewport) {
    if (!this.embedStateApi_) {
      return;
    }

    this.embedStateApi_.send('embed-state', (0, _object.dict)({
      'inViewport': inViewport,
      'pageHidden': !this.baseInstance_.getAmpDoc().isVisible()
    }));
  }
  /**
   * Retrieve iframe position entry in next animation frame.
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  ;

  _proto.getIframePositionPromise_ = function getIframePositionPromise_() {
    var _this4 = this;

    return this.viewport_.getClientRectAsync((0, _log.dev)().assertElement(this.iframe)).then(function (position) {
      (0, _log.devAssert)(position, 'element clientRect should intersects with root clientRect');

      var viewport = _this4.viewport_.getRect();

      return (0, _object.dict)({
        'targetRect': position,
        'viewportRect': viewport
      });
    });
  }
  /** @private */
  ;

  _proto.sendPosition_ = function sendPosition_() {
    var _this5 = this;

    if (this.sendPositionPending_) {
      // Only send once in single animation frame.
      return;
    }

    this.sendPositionPending_ = true;
    this.getIframePositionPromise_().then(function (position) {
      _this5.sendPositionPending_ = false;

      _this5.inaboxPositionApi_.send(_pFrameMessaging.MessageType.POSITION, position);
    });
  }
  /** @private */
  ;

  _proto.registerPosition_ = function registerPosition_() {
    var _this6 = this;

    if (this.isInaboxPositionApiInit_) {
      // only register to viewport scroll/resize once
      return;
    }

    this.isInaboxPositionApiInit_ = true; // Send window scroll/resize event to viewport.

    this.unlisteners_.push(this.viewport_.onScroll((0, _rateLimit.throttle)(this.win_, function () {
      _this6.getIframePositionPromise_().then(function (position) {
        _this6.inaboxPositionApi_.send(_pFrameMessaging.MessageType.POSITION, position);
      });
    }, MIN_INABOX_POSITION_EVENT_INTERVAL)));
    this.unlisteners_.push(this.viewport_.onResize(function () {
      _this6.getIframePositionPromise_().then(function (position) {
        _this6.inaboxPositionApi_.send(_pFrameMessaging.MessageType.POSITION, position);
      });
    }));
  }
  /**
   * See BaseElement method.
   * @param {boolean} inViewport
   */
  ;

  _proto.viewportCallback = function viewportCallback(inViewport) {
    if (this.intersectionObserver_) {
      this.intersectionObserver_.onViewportCallback(inViewport);
    }

    this.sendEmbedInfo_(inViewport);
  }
  /**
   * See BaseElement method.
   */
  ;

  _proto.onLayoutMeasure = function onLayoutMeasure() {
    // When the framework has the need to remeasure us, our position might
    // have changed. Send an intersection record if needed.
    if (this.intersectionObserver_) {
      this.intersectionObserver_.fire();
    }
  }
  /**
   * @param {string} message
   * @private
   */
  ;

  _proto.userErrorForAnalytics_ = function userErrorForAnalytics_(message) {
    if (typeof message == 'string') {
      var e = new Error(message);
      e.name = '3pError';
      (0, _error.reportErrorToAnalytics)(e, this.baseInstance_.win);
    }
  }
  /**
   * @return {boolean}
   */
  ;

  _proto.isPausable = function isPausable() {
    return (0, _experiments.isExperimentOn)(this.win_, 'pausable-iframe') && !!this.iframe && (0, _iframeHelper.isPausable)(this.iframe);
  }
  /**
   * See `BaseElement.pauseCallback()` and `BaseElement.resumeCallback()`.
   * @param {boolean} paused
   */
  ;

  _proto.setPaused = function setPaused(paused) {
    if ((0, _experiments.isExperimentOn)(this.win_, 'pausable-iframe') && this.iframe) {
      (0, _iframeHelper.setPaused)(this.iframe, paused);
    }
  };

  return AmpAdXOriginIframeHandler;
}(); // Make the class available to other late loaded amp-ad implementations
// without them having to depend on it directly.


exports.AmpAdXOriginIframeHandler = AmpAdXOriginIframeHandler;
AMP.AmpAdXOriginIframeHandler = AmpAdXOriginIframeHandler;

},{"../../../ads/google/a4a/utils":5,"../../../src/3p-frame-messaging":17,"../../../src/common-signals":23,"../../../src/dom":29,"../../../src/error":31,"../../../src/event-helper":33,"../../../src/experiments":34,"../../../src/get-html":36,"../../../src/iframe-helper":38,"../../../src/intersection-observer":41,"../../../src/log":45,"../../../src/services":53,"../../../src/style":57,"../../../src/utils/object":67,"../../../src/utils/promise":68,"../../../src/utils/rate-limit":69}],15:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpAd = void 0;

var _ampAd3pImpl = require("./amp-ad-3p-impl");

var _ampAdCustom = require("./amp-ad-custom");

var _ampAd = require("../../../build/amp-ad-0.1.css");

var _services = require("../../../src/services");

var _config = require("../../../ads/_config");

var _a4aConfig = require("../../../ads/_a4a-config");

var _object = require("../../../src/utils/object");

var _log = require("../../../src/log");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * Construct ad network type-specific tag and script name.  Note that this
 * omits the version number and '.js' suffix for the extension script, which
 * will be handled by the extension loader.
 *
 * @param {string} type
 * @return {string}
 * @private
 */
function networkImplementationTag(type) {
  return "amp-ad-network-" + type + "-impl";
}

var AmpAd =
/*#__PURE__*/
function (_AMP$BaseElement) {
  _inheritsLoose(AmpAd, _AMP$BaseElement);

  function AmpAd() {
    return _AMP$BaseElement.apply(this, arguments) || this;
  }

  var _proto = AmpAd.prototype;

  /** @override */
  _proto.isLayoutSupported = function isLayoutSupported(unusedLayout) {
    // TODO(jridgewell, #5980, #8218): ensure that unupgraded calls are not
    // done for `isLayoutSupported`.
    return true;
  }
  /** @override */
  ;

  _proto.upgradeCallback = function upgradeCallback() {
    var _this = this;

    var a4aRegistry = (0, _a4aConfig.getA4ARegistry)(); // Block whole ad load if a consent is needed.

    /** @const {string} */

    var consentId = this.element.getAttribute('data-consent-notification-id');
    var consent = consentId ? _services.Services.userNotificationManagerForDoc(this.element).then(function (service) {
      return service.get(consentId);
    }) : Promise.resolve();
    var type = this.element.getAttribute('type');
    return consent.then(function () {
      var isCustom = type === 'custom';
      (0, _log.userAssert)(isCustom || (0, _object.hasOwn)(_config.adConfig, type) || (0, _object.hasOwn)(a4aRegistry, type), "Unknown ad type \"" + type + "\""); // Check for the custom ad type (no ad network, self-service)

      if (isCustom) {
        return new _ampAdCustom.AmpAdCustom(_this.element);
      }

      _this.win.ampAdSlotIdCounter = _this.win.ampAdSlotIdCounter || 0;
      var slotId = _this.win.ampAdSlotIdCounter++;
      return new Promise(function (resolve) {
        _this.getVsync().mutate(function () {
          _this.element.setAttribute('data-amp-slot-index', slotId);

          var useRemoteHtml = !(_config.adConfig[type] || {})['remoteHTMLDisabled'] && _this.win.document.querySelector('meta[name=amp-3p-iframe-src]'); // TODO(tdrl): Check amp-ad registry to see if they have this already.
          // TODO(a4a-cam): Shorten this predicate.


          if (!a4aRegistry[type] || // Note that predicate execution may have side effects.
          !a4aRegistry[type](_this.win, _this.element, useRemoteHtml)) {
            // Either this ad network doesn't support Fast Fetch, its Fast
            // Fetch implementation has explicitly opted not to handle this
            // tag, or this page uses remote.html which is inherently
            // incompatible with Fast Fetch. Fall back to Delayed Fetch.
            return resolve(new _ampAd3pImpl.AmpAd3PImpl(_this.element));
          }

          var extensionTagName = networkImplementationTag(type);

          _this.element.setAttribute('data-a4a-upgrade-type', extensionTagName);

          resolve(_services.Services.extensionsFor(_this.win).loadElementClass(extensionTagName).then(function (ctor) {
            return new ctor(_this.element);
          }).catch(function (error) {
            // Work around presubmit restrictions.
            var TAG = _this.element.tagName; // Report error and fallback to 3p

            _this.user().error(TAG, 'Unable to load ad implementation for type ', type, ', falling back to 3p, error: ', error);

            return new _ampAd3pImpl.AmpAd3PImpl(_this.element);
          }));
        });
      });
    });
  };

  return AmpAd;
}(AMP.BaseElement);

exports.AmpAd = AmpAd;
AMP.extension('amp-ad', '0.1', function (AMP) {
  AMP.registerElement('amp-ad', AmpAd, _ampAd.CSS);
  AMP.registerElement('amp-embed', AmpAd);
});

},{"../../../ads/_a4a-config":1,"../../../ads/_config":2,"../../../build/amp-ad-0.1.css":7,"../../../src/log":45,"../../../src/services":53,"../../../src/utils/object":67,"./amp-ad-3p-impl":11,"./amp-ad-custom":12}],16:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.is3pThrottled = is3pThrottled;
exports.waitFor3pThrottle = waitFor3pThrottle;
exports.getAmpAdRenderOutsideViewport = getAmpAdRenderOutsideViewport;
exports.incrementLoadingAds = incrementLoadingAds;

var _promise = require("../../../src/utils/promise");

var _services = require("../../../src/services");

var _log = require("../../../src/log");

/* Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Store loading ads info within window to ensure it can be properly stored
 * across separately compiled binaries that share load throttling.
 * @const ID of window variable used to track 3p ads waiting to load.
 */
var LOADING_ADS_WIN_ID_ = '3pla';
/** @private {?Promise} resolves when no 3p throttle */

var throttlePromise_ = null;
/** @private {?Function} resolver for throttle promise */

var throttlePromiseResolver_ = null;
/**
 * @param {!Window} win
 * @return {boolean} Whether 3p is currently throttled.
 */

function is3pThrottled(win) {
  return !!win[LOADING_ADS_WIN_ID_];
}
/** @return {!Promise} resolves when no 3p throttle */


function waitFor3pThrottle() {
  return throttlePromise_ || Promise.resolve();
}
/**
 * @param {!Element} element
 * @return {?number} number if explicit value should be used otherwise super
 *    default should be used.
 */


function getAmpAdRenderOutsideViewport(element) {
  var rawValue = element.getAttribute('data-loading-strategy');

  if (rawValue == null) {
    return null;
  } // Ad opts into lazier loading strategy where we only load ads that are
  // at closer given number of viewports away.


  if (rawValue == 'prefer-viewability-over-views' || rawValue == '') {
    return 1.25;
  }

  var errorMessage = 'Value of data-loading-strategy should be a float number in range ' + 'of [0, 3], but got ' + rawValue;
  var viewportNumber = (0, _log.user)().assertNumber(parseFloat(rawValue), errorMessage);
  (0, _log.userAssert)(viewportNumber >= 0 && viewportNumber <= 3, errorMessage);
  return viewportNumber;
}
/**
 * Increments loading ads count for throttling.
 * @param {!Window} win
 * @param {!Promise=} opt_loadingPromise
 */


function incrementLoadingAds(win, opt_loadingPromise) {
  if (win[LOADING_ADS_WIN_ID_] === undefined) {
    win[LOADING_ADS_WIN_ID_] = 0;
  }

  win[LOADING_ADS_WIN_ID_]++;

  if (!throttlePromise_) {
    var deferred = new _promise.Deferred();
    throttlePromise_ = deferred.promise;
    throttlePromiseResolver_ = deferred.resolve;
  }

  _services.Services.timerFor(win).timeoutPromise(1000, opt_loadingPromise).catch(function () {}).then(function () {
    if (! --win[LOADING_ADS_WIN_ID_]) {
      throttlePromiseResolver_();
      throttlePromise_ = null;
      throttlePromiseResolver_ = null;
    }
  });
}

},{"../../../src/log":45,"../../../src/services":53,"../../../src/utils/promise":68}],17:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.listen = listen;
exports.serializeMessage = serializeMessage;
exports.deserializeMessage = deserializeMessage;
exports.isAmpMessage = isAmpMessage;
exports.IframeTransportEvent = exports.MessageType = exports.CONSTANTS = void 0;

var _log = require("./log");

var _object = require("./utils/object");

var _eventHelperListen = require("./event-helper-listen");

var _json = require("./json");

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const */
var AMP_MESSAGE_PREFIX = 'amp-';
var CONSTANTS = {
  responseTypeSuffix: '-result',
  messageIdFieldName: 'messageId',
  payloadFieldName: 'payload',
  contentFieldName: 'content'
};
/** @enum {string} */

exports.CONSTANTS = CONSTANTS;
var MessageType = {
  // For amp-ad
  SEND_EMBED_STATE: 'send-embed-state',
  EMBED_STATE: 'embed-state',
  SEND_EMBED_CONTEXT: 'send-embed-context',
  EMBED_CONTEXT: 'embed-context',
  SEND_INTERSECTIONS: 'send-intersections',
  INTERSECTION: 'intersection',
  EMBED_SIZE: 'embed-size',
  EMBED_SIZE_CHANGED: 'embed-size-changed',
  EMBED_SIZE_DENIED: 'embed-size-denied',
  NO_CONTENT: 'no-content',
  GET_HTML: 'get-html',
  GET_CONSENT_STATE: 'get-consent-state',
  // For the frame to be placed in full overlay mode for lightboxes
  FULL_OVERLAY_FRAME: 'full-overlay-frame',
  FULL_OVERLAY_FRAME_RESPONSE: 'full-overlay-frame-response',
  CANCEL_FULL_OVERLAY_FRAME: 'cancel-full-overlay-frame',
  CANCEL_FULL_OVERLAY_FRAME_RESPONSE: 'cancel-full-overlay-frame-response',
  // For amp-inabox
  SEND_POSITIONS: 'send-positions',
  POSITION: 'position',
  // For amp-analytics' iframe-transport
  SEND_IFRAME_TRANSPORT_EVENTS: 'send-iframe-transport-events',
  IFRAME_TRANSPORT_EVENTS: 'iframe-transport-events',
  IFRAME_TRANSPORT_RESPONSE: 'iframe-transport-response',
  // For user-error-in-iframe
  USER_ERROR_IN_IFRAME: 'user-error-in-iframe'
};
/**
 * Listens for the specified event on the element.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {Object=} opt_evtListenerOpts
 * @return {!UnlistenDef}
 */

exports.MessageType = MessageType;

function listen(element, eventType, listener, opt_evtListenerOpts) {
  return (0, _eventHelperListen.internalListenImplementation)(element, eventType, listener, opt_evtListenerOpts);
}
/**
 * Serialize an AMP post message. Output looks like:
 * 'amp-011481323099490{"type":"position","sentinel":"12345","foo":"bar"}'
 * @param {string} type
 * @param {string} sentinel
 * @param {JsonObject=} data
 * @param {?string=} rtvVersion
 * @return {string}
 */


function serializeMessage(type, sentinel, data, rtvVersion) {
  if (data === void 0) {
    data = (0, _object.dict)();
  }

  if (rtvVersion === void 0) {
    rtvVersion = null;
  }

  // TODO: consider wrap the data in a "data" field. { type, sentinal, data }
  var message = data;
  message['type'] = type;
  message['sentinel'] = sentinel;
  return AMP_MESSAGE_PREFIX + (rtvVersion || '') + JSON.stringify(message);
}
/**
 * Deserialize an AMP post message.
 * Returns null if it's not valid AMP message format.
 *
 * @param {*} message
 * @return {?JsonObject|undefined}
 */


function deserializeMessage(message) {
  if (!isAmpMessage(message)) {
    return null;
  }

  var startPos = message.indexOf('{');
  (0, _log.devAssert)(startPos != -1, 'JSON missing in %s', message);

  try {
    return (0, _json.parseJson)(message.substr(startPos));
  } catch (e) {
    (0, _log.dev)().error('MESSAGING', 'Failed to parse message: ' + message, e);
    return null;
  }
}
/**
 *  Returns true if message looks like it is an AMP postMessage
 *  @param {*} message
 *  @return {boolean}
 */


function isAmpMessage(message) {
  return typeof message == 'string' && message.indexOf(AMP_MESSAGE_PREFIX) == 0 && message.indexOf('{') != -1;
}
/** @typedef {{creativeId: string, message: string}} */


var IframeTransportEvent; // An event, and the transport ID of the amp-analytics tags that
// generated it. For instance if the creative with transport
// ID 2 sends "hi", then an IframeTransportEvent would look like:
// { creativeId: "2", message: "hi" }
// If the creative with transport ID 2 sent that, and also sent "hello",
// and the creative with transport ID 3 sends "goodbye" then an *array* of 3
// AmpAnalyticsIframeTransportEvent would be sent to the 3p frame like so:
// [
//   { creativeId: "2", message: "hi" }, // An AmpAnalyticsIframeTransportEvent
//   { creativeId: "2", message: "hello" }, // Another
//   { creativeId: "3", message: "goodbye" } // And another
// ]

exports.IframeTransportEvent = IframeTransportEvent;

},{"./event-helper-listen":32,"./json":42,"./log":45,"./utils/object":67}],18:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getIframe = getIframe;
exports.addDataAndJsonAttributes_ = addDataAndJsonAttributes_;
exports.preloadBootstrap = preloadBootstrap;
exports.getBootstrapBaseUrl = getBootstrapBaseUrl;
exports.setDefaultBootstrapBaseUrlForTesting = setDefaultBootstrapBaseUrlForTesting;
exports.resetBootstrapBaseUrlForTesting = resetBootstrapBaseUrlForTesting;
exports.getDefaultBootstrapBaseUrl = getDefaultBootstrapBaseUrl;
exports.getDevelopmentBootstrapBaseUrl = getDevelopmentBootstrapBaseUrl;
exports.getSubDomain = getSubDomain;
exports.getRandom = getRandom;
exports.applySandbox = applySandbox;
exports.generateSentinel = generateSentinel;
exports.resetCountForTesting = resetCountForTesting;

var _url = require("./url");

var _log = require("./log");

var _object = require("./utils/object");

var _iframeAttributes = require("../src/iframe-attributes");

var _mode = require("./mode");

var _internalVersion = require("./internal-version");

var _style = require("./style");

var _string = require("./string");

var _json = require("./json");

var _config = require("./config");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @type {!Object<string,number>} Number of 3p frames on the for that type. */
var count = {};
/** @type {string} */

var overrideBootstrapBaseUrl;
/** @const {string} */

var TAG = '3p-frame';
/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
 * @param {string=} opt_type
 * @param {Object=} opt_context
 * @return {!JsonObject} Contains
 *     - type, width, height, src attributes of <amp-ad> tag. These have
 *       precedence over the data- attributes.
 *     - data-* attributes of the <amp-ad> tag with the "data-" removed.
 *     - A _context object for internal use.
 */

function getFrameAttributes(parentWindow, element, opt_type, opt_context) {
  var type = opt_type || element.getAttribute('type');
  (0, _log.userAssert)(type, 'Attribute type required for <amp-ad>: %s', element);
  var sentinel = generateSentinel(parentWindow);
  var attributes = (0, _object.dict)(); // Do these first, as the other attributes have precedence.

  addDataAndJsonAttributes_(element, attributes);
  attributes = (0, _iframeAttributes.getContextMetadata)(parentWindow, element, sentinel, attributes);
  attributes['type'] = type;
  Object.assign(attributes['_context'], opt_context);
  return attributes;
}
/**
 * Creates the iframe for the embed. Applies correct size and passes the embed
 * attributes to the frame via JSON inside the fragment.
 * @param {!Window} parentWindow
 * @param {!AmpElement} parentElement
 * @param {string=} opt_type
 * @param {Object=} opt_context
 * @param {!{
 *   disallowCustom,
 *   allowFullscreen,
 * }=} opt_options Options for the created iframe.
 * @return {!HTMLIFrameElement} The iframe.
 */


function getIframe(parentWindow, parentElement, opt_type, opt_context, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      disallowCustom = _ref.disallowCustom,
      allowFullscreen = _ref.allowFullscreen;

  // Check that the parentElement is already in DOM. This code uses a new and
  // fast `isConnected` API and thus only used when it's available.
  (0, _log.devAssert)(parentElement['isConnected'] === undefined || parentElement['isConnected'] === true, 'Parent element must be in DOM');
  var attributes = getFrameAttributes(parentWindow, parentElement, opt_type, opt_context);
  var iframe =
  /** @type {!HTMLIFrameElement} */
  parentWindow.document.createElement('iframe');

  if (!count[attributes['type']]) {
    count[attributes['type']] = 0;
  }

  count[attributes['type']] += 1;
  var baseUrl = getBootstrapBaseUrl(parentWindow, undefined, disallowCustom);
  var host = (0, _url.parseUrlDeprecated)(baseUrl).hostname; // This name attribute may be overwritten if this frame is chosen to
  // be the master frame. That is ok, as we will read the name off
  // for our uses before that would occur.
  // @see https://github.com/ampproject/amphtml/blob/master/3p/integration.js

  var name = JSON.stringify((0, _object.dict)({
    'host': host,
    'type': attributes['type'],
    // https://github.com/ampproject/amphtml/pull/2955
    'count': count[attributes['type']],
    'attributes': attributes
  }));
  iframe.src = baseUrl;
  iframe.ampLocation = (0, _url.parseUrlDeprecated)(baseUrl);
  iframe.name = name; // Add the check before assigning to prevent IE throw Invalid argument error

  if (attributes['width']) {
    iframe.width = attributes['width'];
  }

  if (attributes['height']) {
    iframe.height = attributes['height'];
  }

  if (attributes['title']) {
    iframe.title = attributes['title'];
  }

  if (allowFullscreen) {
    iframe.setAttribute('allowfullscreen', 'true');
  }

  iframe.setAttribute('scrolling', 'no');
  (0, _style.setStyle)(iframe, 'border', 'none');
  /** @this {!Element} */

  iframe.onload = function () {
    // Chrome does not reflect the iframe readystate.
    this.readyState = 'complete';
  }; // Block synchronous XHR in ad. These are very rare, but super bad for UX
  // as they block the UI thread for the arbitrary amount of time until the
  // request completes.


  iframe.setAttribute('allow', "sync-xhr 'none';");
  var excludeFromSandbox = ['facebook'];

  if (!excludeFromSandbox.includes(opt_type)) {
    applySandbox(iframe);
  }

  iframe.setAttribute('data-amp-3p-sentinel', attributes['_context']['sentinel']);
  return iframe;
}
/**
 * Copies data- attributes from the element into the attributes object.
 * Removes the data- from the name and capitalizes after -. If there
 * is an attribute called json, parses the JSON and adds it to the
 * attributes.
 * @param {!Element} element
 * @param {!JsonObject} attributes The destination.
 * visibleForTesting
 */


function addDataAndJsonAttributes_(element, attributes) {
  var dataset = element.dataset;

  for (var name in dataset) {
    // data-vars- is reserved for amp-analytics
    // see https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/analytics-vars.md#variables-as-data-attribute
    if (!(0, _string.startsWith)(name, 'vars')) {
      attributes[name] = dataset[name];
    }
  }

  var json = element.getAttribute('json');

  if (json) {
    var obj = (0, _json.tryParseJson)(json);

    if (obj === undefined) {
      throw (0, _log.user)().createError('Error parsing JSON in json attribute in element %s', element);
    }

    for (var key in obj) {
      attributes[key] = obj[key];
    }
  }
}
/**
 * Preloads URLs related to the bootstrap iframe.
 * @param {!Window} win
 * @param {!./preconnect.Preconnect} preconnect
 * @param {boolean=} opt_disallowCustom whether 3p url should not use meta tag.
 */


function preloadBootstrap(win, preconnect, opt_disallowCustom) {
  var url = getBootstrapBaseUrl(win, undefined, opt_disallowCustom);
  preconnect.preload(url, 'document'); // While the URL may point to a custom domain, this URL will always be
  // fetched by it.

  var scriptUrl = (0, _mode.getMode)().localDev ? getAdsLocalhost(win) + '/dist.3p/current/integration.js' : _config.urls.thirdParty + "/" + (0, _internalVersion.internalRuntimeVersion)() + "/f.js";
  preconnect.preload(scriptUrl, 'script');
}
/**
 * Returns the base URL for 3p bootstrap iframes.
 * @param {!Window} parentWindow
 * @param {boolean=} opt_strictForUnitTest
 * @param {boolean=} opt_disallowCustom whether 3p url should not use meta tag.
 * @return {string}
 * @visibleForTesting
 */


function getBootstrapBaseUrl(parentWindow, opt_strictForUnitTest, opt_disallowCustom) {
  var customBootstrapBaseUrl = opt_disallowCustom ? null : getCustomBootstrapBaseUrl(parentWindow, opt_strictForUnitTest);
  return customBootstrapBaseUrl || getDefaultBootstrapBaseUrl(parentWindow);
}
/**
 * @param {string} url
 */


function setDefaultBootstrapBaseUrlForTesting(url) {
  overrideBootstrapBaseUrl = url;
}
/**
 * @param {*} win
 */


function resetBootstrapBaseUrlForTesting(win) {
  win.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN = undefined;
}
/**
 * Returns the default base URL for 3p bootstrap iframes.
 * @param {!Window} parentWindow
 * @param {string=} opt_srcFileBasename
 * @return {string}
 */


function getDefaultBootstrapBaseUrl(parentWindow, opt_srcFileBasename) {
  var srcFileBasename = opt_srcFileBasename || 'frame';

  if ((0, _mode.getMode)().localDev || (0, _mode.getMode)().test) {
    return getDevelopmentBootstrapBaseUrl(parentWindow, srcFileBasename);
  } // Ensure same sub-domain is used despite potentially different file.


  parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN = parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN || getSubDomain(parentWindow);
  return 'https://' + parentWindow.__AMP_DEFAULT_BOOTSTRAP_SUBDOMAIN + ("." + _config.urls.thirdPartyFrameHost + "/" + (0, _internalVersion.internalRuntimeVersion)() + "/") + (srcFileBasename + ".html");
}
/**
 * Function to return the development boostrap base URL
 * @param {!Window} parentWindow
 * @param {string} srcFileBasename
 * @return {string}
 */


function getDevelopmentBootstrapBaseUrl(parentWindow, srcFileBasename) {
  return overrideBootstrapBaseUrl || getAdsLocalhost(parentWindow) + '/dist.3p/' + ((0, _mode.getMode)().minified ? (0, _internalVersion.internalRuntimeVersion)() + "/" + srcFileBasename : "current/" + srcFileBasename + ".max") + '.html';
}
/**
 * @param {!Window} win
 * @return {string}
 */


function getAdsLocalhost(win) {
  var adsUrl = _config.urls.thirdParty; // local dev with a non-localhost server

  if (adsUrl == 'https://3p.ampproject.net') {
    adsUrl = 'http://ads.localhost'; // local dev with a localhost server
  }

  return adsUrl + ':' + (win.location.port || win.parent.location.port);
}
/**
 * Sub domain on which the 3p iframe will be hosted.
 * Because we only calculate the URL once per page, this function is only
 * called once and hence all frames on a page use the same URL.
 * @param {!Window} win
 * @return {string}
 * @visibleForTesting
 */


function getSubDomain(win) {
  return 'd-' + getRandom(win);
}
/**
 * Generates a random non-negative integer.
 * @param {!Window} win
 * @return {string}
 */


function getRandom(win) {
  var rand;

  if (win.crypto && win.crypto.getRandomValues) {
    // By default use 2 32 bit integers.
    var uint32array = new Uint32Array(2);
    win.crypto.getRandomValues(uint32array);
    rand = String(uint32array[0]) + uint32array[1];
  } else {
    // Fall back to Math.random.
    rand = String(win.Math.random()).substr(2) + '0';
  }

  return rand;
}
/**
 * Returns the custom base URL for 3p bootstrap iframes if it exists.
 * Otherwise null.
 * @param {!Window} parentWindow
 * @param {boolean=} opt_strictForUnitTest
 * @return {?string}
 */


function getCustomBootstrapBaseUrl(parentWindow, opt_strictForUnitTest) {
  var meta = parentWindow.document.querySelector('meta[name="amp-3p-iframe-src"]');

  if (!meta) {
    return null;
  }

  var url = (0, _url.assertHttpsUrl)(meta.getAttribute('content'), meta);
  (0, _log.userAssert)(url.indexOf('?') == -1, '3p iframe url must not include query string %s in element %s.', url, meta); // This is not a security primitive, we just don't want this to happen in
  // practice. People could still redirect to the same origin, but they cannot
  // redirect to the proxy origin which is the important one.

  var parsed = (0, _url.parseUrlDeprecated)(url);
  (0, _log.userAssert)(parsed.hostname == 'localhost' && !opt_strictForUnitTest || parsed.origin != (0, _url.parseUrlDeprecated)(parentWindow.location.href).origin, '3p iframe url must not be on the same origin as the current document ' + '%s (%s) in element %s. See https://github.com/ampproject/amphtml' + '/blob/master/spec/amp-iframe-origin-policy.md for details.', url, parsed.origin, meta);
  return url + "?" + (0, _internalVersion.internalRuntimeVersion)();
}
/**
 * Applies a sandbox to the iframe, if the required flags can be allowed.
 * @param {!Element} iframe
 * @visibleForTesting
 */


function applySandbox(iframe) {
  if (!iframe.sandbox || !iframe.sandbox.supports) {
    return; // Can't feature detect support
  } // If these flags are not supported by the UA we don't apply any
  // sandbox.


  var requiredFlags = [// This only allows navigation when user interacts and thus prevents
  // ads from auto navigating the user.
  'allow-top-navigation-by-user-activation', // Crucial because otherwise even target=_blank opened links are
  // still sandboxed which they may not expect.
  'allow-popups-to-escape-sandbox']; // These flags are not feature detected. Put stuff here where either
  // they have always been supported or support is not crucial.

  var otherFlags = ['allow-forms', // We should consider turning this off! But since the top navigation
  // issue is the big one, we'll leave this allowed for now.
  'allow-modals', // Give access to raw mouse movements.
  'allow-pointer-lock', // This remains subject to popup blocking, it just makes it supported
  // at all.
  'allow-popups', // This applies inside the iframe and is crucial to not break the web.
  'allow-same-origin', 'allow-scripts']; // Not allowed
  // - allow-top-navigation
  // - allow-orientation-lock
  // - allow-pointer-lock
  // - allow-presentation

  for (var i = 0; i < requiredFlags.length; i++) {
    var flag = requiredFlags[i];

    if (!iframe.sandbox.supports(flag)) {
      (0, _log.dev)().info(TAG, "Iframe doesn't support %s", flag);
      return;
    }
  }

  iframe.sandbox = requiredFlags.join(' ') + ' ' + otherFlags.join(' ');
}
/**
 * Returns a randomized sentinel value for 3p iframes.
 * The format is "%d-%d" with the first value being the depth of current
 * window in the window hierarchy and the second a random integer.
 * @param {!Window} parentWindow
 * @return {string}
 * @visibleForTesting
 */


function generateSentinel(parentWindow) {
  var windowDepth = 0;

  for (var win = parentWindow; win && win != win.parent; win = win.parent) {
    windowDepth++;
  }

  return String(windowDepth) + '-' + getRandom(parentWindow);
}
/**
 * Resets the count of each 3p frame type
 * @visibleForTesting
 */


function resetCountForTesting() {
  count = {};
}

},{"../src/iframe-attributes":37,"./config":24,"./internal-version":40,"./json":42,"./log":45,"./mode":47,"./string":55,"./style":57,"./url":61,"./utils/object":67}],19:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getAdCid = getAdCid;
exports.getOrCreateAdCid = getOrCreateAdCid;

var _services = require("./services");

var _config = require("../ads/_config");

var _log = require("../src/log");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param {AMP.BaseElement} adElement
 * @return {!Promise<string|undefined>} A promise for a CID or undefined if
 *     - the ad network does not request one or
 *     - `amp-analytics` which provides the CID service was not installed.
 */
function getAdCid(adElement) {
  var config = _config.adConfig[adElement.element.getAttribute('type')];

  if (!config || !config['clientIdScope']) {
    return Promise.resolve();
  }

  return getOrCreateAdCid(adElement.getAmpDoc(), config['clientIdScope'], config['clientIdCookieName']);
}
/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
 * @param {string} clientIdScope
 * @param {string=} opt_clientIdCookieName
 * @param {number=} opt_timeout
 * @return {!Promise<string|undefined>} A promise for a CID or undefined.
 */


function getOrCreateAdCid(ampDoc, clientIdScope, opt_clientIdCookieName, opt_timeout) {
  var timeout = isNaN(opt_timeout) || opt_timeout == null ? 1000 : opt_timeout;

  var cidPromise = _services.Services.cidForDoc(ampDoc).then(function (cidService) {
    if (!cidService) {
      return;
    }

    return cidService.get({
      scope: (0, _log.dev)().assertString(clientIdScope),
      createCookieIfNotPresent: true,
      cookieName: opt_clientIdCookieName
    }, Promise.resolve(undefined)).catch(function (error) {
      // Not getting a CID is not fatal.
      (0, _log.dev)().error('AD-CID', error);
      return undefined;
    });
  }); // The CID should never be crucial for an ad. If it does not come within
  // 1 second, assume it will never arrive.


  return _services.Services.timerFor(ampDoc.win).timeoutPromise(timeout, cidPromise, 'cid timeout').catch(function (error) {
    // Timeout is not fatal.
    (0, _log.dev)().warn('AD-CID', error);
    return undefined;
  });
}

},{"../ads/_config":2,"../src/log":45,"./services":53}],20:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isAdPositionAllowed = isAdPositionAllowed;
exports.getAdContainer = getAdContainer;
exports.getAmpAdResourceId = getAmpAdResourceId;

var _style = require("./style");

var _log = require("./log");

var _service = require("./service");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var AD_CONTAINER_PROP = '__AMP__AD_CONTAINER';
/**
 * Tags that are allowed to have fixed positioning
 * @const {!Object<string, boolean>}
 */

var CONTAINERS = {
  'AMP-FX-FLYING-CARPET': true,
  'AMP-LIGHTBOX': true,
  'AMP-STICKY-AD': true,
  'AMP-LIGHTBOX-GALLERY': true
};
/**
 * Determines if an element is fixed-positioned.
 * OK to use, because it's only called from onLayoutMeasure
 * @param {!Element} el
 * @param {!Window} win
 * @return {boolean}
 */

function isPositionFixed(el, win) {
  var _computedStyle = (0, _style.computedStyle)(win, el),
      position = _computedStyle.position; // We consider sticky positions as fixed, since they can be fixed.


  return position == 'fixed' || position == 'sticky';
}
/**
 * @param {!Element} element
 * @param {!Window} win
 * @return {boolean} whether the element position is allowed. If the element
 * belongs to CONTAINERS, it is allowed to be position fixed.
 * If the element has a position fixed ancestor, it is not allowed.
 * This should only be called when a layout on the page was just forced
 * anyway.
 */


function isAdPositionAllowed(element, win) {
  var hasFixedAncestor = false;
  var containers = 0;
  var el = element;

  do {
    if (CONTAINERS[el.tagName]) {
      // The containers must not themselves be contained in a fixed-position
      // element. Continue the search.
      containers++;
      hasFixedAncestor = false;
    } else if (isPositionFixed((0, _log.dev)().assertElement(el), win)) {
      // Because certain blessed elements may contain a position fixed
      // container (which contain an ad), we continue to search the
      // ancestry tree.
      hasFixedAncestor = true;
    }

    el = el.parentElement;
  } while (el && el.tagName != 'BODY');

  return !hasFixedAncestor && containers <= 1;
}
/**
 * Returns the blessed container element tagName if the ad is contained by one.
 * This is called during layout measure.
 * @param {!Element} element
 * @return {?string}
 */


function getAdContainer(element) {
  if (element[AD_CONTAINER_PROP] === undefined) {
    var el = element.parentElement;

    while (el && el.tagName != 'BODY') {
      if (CONTAINERS[el.tagName]) {
        return element[AD_CONTAINER_PROP] = el.tagName;
      }

      el = el.parentElement;
    }

    element[AD_CONTAINER_PROP] = null;
  }

  return element[AD_CONTAINER_PROP];
}
/**
 * Gets the resource ID of the amp-ad element containing the passed node.
 * If there is no containing amp-ad tag, then null will be returned.
 * TODO(jonkeller): Investigate whether non-A4A use case is needed. Issue 11436
 * @param {!Element} node
 * @param {!Window} topWin
 * @return {?string}
 */


function getAmpAdResourceId(node, topWin) {
  try {
    var frameParent = (0, _service.getParentWindowFrameElement)(node, topWin).parentElement;

    if (frameParent.nodeName == 'AMP-AD') {
      return String(frameParent.getResourceId());
    }
  } catch (e) {} // Whether we entered the catch above (e.g. due to attempt to access
  // across xdomain boundary), or failed to enter the if further above, the
  // node is not within a friendly amp-ad tag. So, there is no amp-ad
  // resource ID. How to handle that is up to the caller, but see TODO above.


  return null;
}

},{"./log":45,"./service":49,"./style":57}],21:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpEvents = void 0;

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Common AMP events.
 * @enum {string}
 */
var AmpEvents = {
  DOM_UPDATE: 'amp:dom-update',
  FORM_DIRTINESS_CHANGE: 'amp:form-dirtiness-change',
  FORM_VALUE_CHANGE: 'amp:form-value-change',
  VISIBILITY_CHANGE: 'amp:visibilitychange',
  // https://github.com/ampproject/amphtml/blob/master/ads/README.md#page-visibility
  // The following codes are only used for testing.
  // TODO(choumx): Move these to a separate enum so they can be DCE'd.
  ATTACHED: 'amp:attached',
  STUBBED: 'amp:stubbed',
  LOAD_START: 'amp:load:start',
  LOAD_END: 'amp:load:end',
  ERROR: 'amp:error',
  SIZE_CHANGED: 'amp:size-changed'
};
exports.AmpEvents = AmpEvents;

},{}],22:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.triggerAnalyticsEvent = triggerAnalyticsEvent;

var _services = require("./services");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Helper method to trigger analytics event if amp-analytics is available.
 * TODO: Do not expose this function
 * @param {!Element} target
 * @param {string} eventType
 * @param {!JsonObject=} opt_vars A map of vars and their values.
 */
function triggerAnalyticsEvent(target, eventType, opt_vars) {
  _services.Services.analyticsForDocOrNull(target).then(function (analytics) {
    if (!analytics) {
      return;
    }

    analytics.triggerEventForTarget(target, eventType, opt_vars);
  });
}

},{"./services":53}],23:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CommonSignals = void 0;

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Commonly used signals across different elements and documents.
 * @enum {string}
 */
var CommonSignals = {
  /**
   * The element has been upgraded from ElementStub to its real implementation.
   */
  UPGRADED: 'upgraded',

  /**
   * The element has been built.
   */
  BUILT: 'built',

  /**
   * The element has started loading.
   * LOAD_START triggers at the start of the layoutCallback.
   */
  LOAD_START: 'load-start',

  /**
   * Rendering has been confirmed to have been started.
   * It is a signal to indicate meaningful display (e.g. text could be displayed
   * CSS is correctly installed/applied).
   *
   * Elements can optionally implement RENDER_START signal. (e.g. ad, shadowdoc)
   * if it want to define its own meaningful display time and toggle visibility.
   *
   * Simpler elements's RENDER_START can be equal to the start of the
   * buildCallback
   */
  RENDER_START: 'render-start',

  /**
   * The element has been loaded.
   * LOAD_END triggers at the end of the layoutCallback.
   *
   */
  LOAD_END: 'load-end',

  /**
   * The initial contents of an element/document/embed have been loaded.
   * INI_LOAD is an optional signal, implemented by ads, story, and elements
   * that consist of other resources.
   * It instructs that all critical resources has been loaded, and can be used
   * for more accurate visibility measurement.
   * When an element doesn't consist multiple child resources, LOAD_END signal
   * can be used to indicate resource load completion.
   * Note: Based on the implementation, INI_LOAD can trigger before or after
   * LOAD_END.
   */
  INI_LOAD: 'ini-load',

  /**
   * The element has been unlaid out.
   */
  UNLOAD: 'unload'
};
exports.CommonSignals = CommonSignals;

},{}],24:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.config = exports.urls = void 0;

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Allows for runtime configuration. Internally, the runtime should
 * use the src/config.js module for various constants. We can use the
 * AMP_CONFIG global to translate user-defined configurations to this
 * module.
 * @type {!Object<string, string>}
 */
var env = self.AMP_CONFIG || {};
var thirdPartyFrameRegex = typeof env['thirdPartyFrameRegex'] == 'string' ? new RegExp(env['thirdPartyFrameRegex']) : env['thirdPartyFrameRegex'];
var cdnProxyRegex = typeof env['cdnProxyRegex'] == 'string' ? new RegExp(env['cdnProxyRegex']) : env['cdnProxyRegex'];
/** @type {!Object<string, string|boolean|RegExp|Array<RegExp>>} */

var urls = {
  thirdParty: env['thirdPartyUrl'] || 'https://3p.ampproject.net',
  thirdPartyFrameHost: env['thirdPartyFrameHost'] || 'ampproject.net',
  thirdPartyFrameRegex: thirdPartyFrameRegex || /^d-\d+\.ampproject\.net$/,
  cdn: env['cdnUrl'] || 'https://cdn.ampproject.org',

  /* Note that cdnProxyRegex is only ever checked against origins
   * (proto://host[:port]) so does not need to consider path
   */
  cdnProxyRegex: cdnProxyRegex || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/,
  localhostRegex: /^https?:\/\/localhost(:\d+)?$/,
  errorReporting: env['errorReportingUrl'] || 'https://amp-error-reporting.appspot.com/r',
  localDev: env['localDev'] || false,

  /**
   * These domains are trusted with more sensitive viewer operations such as
   * propagating the referrer. If you believe your domain should be here,
   * file the issue on GitHub to discuss. The process will be similar
   * (but somewhat more stringent) to the one described in the [3p/README.md](
   * https://github.com/ampproject/amphtml/blob/master/3p/README.md)
   *
   * {!Array<!RegExp>}
   */
  trustedViewerHosts: [/(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/, /(^|\.)gmail\.dev$/]
};
exports.urls = urls;
var config = {
  urls: urls
};
exports.config = config;

},{}],25:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CONSENT_POLICY_STATE = void 0;

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// This file will be imported by 3P scripts.

/**
 * Possible consent policy state to proceed with.
 * @enum {number}
 */
var CONSENT_POLICY_STATE = {
  // Enum value has external dependency. Please do not change existing value.
  // If new values are added, please notify the AMP for Ads team to assure
  // correct Real Time Config behavior is maintained for Fast Fetch.
  SUFFICIENT: 1,
  INSUFFICIENT: 2,
  UNKNOWN_NOT_REQUIRED: 3,
  UNKNOWN: 4
};
exports.CONSENT_POLICY_STATE = CONSENT_POLICY_STATE;

},{}],26:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getConsentPolicyState = getConsentPolicyState;
exports.getConsentPolicySharedData = getConsentPolicySharedData;
exports.getConsentPolicyInfo = getConsentPolicyInfo;
exports.shouldBlockOnConsentByMeta = shouldBlockOnConsentByMeta;

var _consentState = require("./consent-state");

var _services = require("./services");

var _log = require("./log");

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns a promise that resolve when all consent state the policy wait
 * for resolve. Or if consent service is not available.
 * @param {!Element|!ShadowRoot} element
 * @param {string=} policyId
 * @return {!Promise<?CONSENT_POLICY_STATE>}
 */
function getConsentPolicyState(element, policyId) {
  if (policyId === void 0) {
    policyId = 'default';
  }

  return _services.Services.consentPolicyServiceForDocOrNull(element).then(function (consentPolicy) {
    if (!consentPolicy) {
      return null;
    }

    return consentPolicy.whenPolicyResolved(
    /** @type {string} */
    policyId);
  });
}
/**
 * Returns a promise that resolves to a sharedData retrieved from consent
 * remote endpoint.
 * @param {!Element|!ShadowRoot} element
 * @param {string} policyId
 * @return {!Promise<?Object>}
 */


function getConsentPolicySharedData(element, policyId) {
  return _services.Services.consentPolicyServiceForDocOrNull(element).then(function (consentPolicy) {
    if (!consentPolicy) {
      return null;
    }

    return consentPolicy.getMergedSharedData(
    /** @type {string} */
    policyId);
  });
}
/**
 * TODO(zhouyx): Combine with getConsentPolicyState and return a consentInfo
 * object.
 * @param {!Element|!ShadowRoot} element
 * @param {string} policyId
 * @return {!Promise<string>}
 */


function getConsentPolicyInfo(element, policyId) {
  // Return the stored consent string.
  return _services.Services.consentPolicyServiceForDocOrNull(element).then(function (consentPolicy) {
    if (!consentPolicy) {
      return null;
    }

    return consentPolicy.getConsentStringInfo(
    /** @type {string} */
    policyId);
  });
}
/**
 * Determine if an element needs to be blocked by consent based on metaTags.
 * @param {*} element
 * @return {boolean}
 */


function shouldBlockOnConsentByMeta(element) {
  var ampdoc = element.getAmpDoc();

  var content = _services.Services.documentInfoForDoc(ampdoc).metaTags['amp-consent-blocking'];

  if (!content) {
    return false;
  } // validator enforce uniqueness of <meta name='amp-consent-blocking'>
  // content will not be an array.


  if (typeof content !== 'string') {
    (0, _log.user)().error('CONSENT', 'Invalid amp-consent-blocking value, ignore meta tag');
    return false;
  } // Handles whitespace


  content = content.toUpperCase().replace(/\s/g, '').split(',');

  if (content.includes(element.tagName)) {
    return true;
  }

  return false;
}

},{"./consent-state":25,"./log":45,"./services":53}],27:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.assertIsName = assertIsName;
exports.setScopeSelectorSupportedForTesting = setScopeSelectorSupportedForTesting;
exports.isScopeSelectorSupported = isScopeSelectorSupported;
exports.prependSelectorsWith = prependSelectorsWith;
exports.escapeCssSelectorIdent = escapeCssSelectorIdent;
exports.escapeCssSelectorNth = escapeCssSelectorNth;

var _cssEscape = require("../third_party/css-escape/css-escape");

var _log = require("./log");

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Asserts that name is just an alphanumeric word, and does not contain
 * advanced CSS selector features like attributes, psuedo-classes, class names,
 * nor ids.
 * @param {string} name
 */
function assertIsName(name) {
  (0, _log.devAssert)(/^[\w-]+$/.test(name));
}
/**
 * @type {boolean|undefined}
 */


var scopeSelectorSupported;
/**
 * @param {boolean|undefined} val
 * @visibleForTesting
 */

function setScopeSelectorSupportedForTesting(val) {
  scopeSelectorSupported = val;
}
/**
 * Test that the :scope selector is supported and behaves correctly.
 * @param {!Element} el
 * @return {boolean}
 */


function isScopeSelectorSupported(el) {
  if (scopeSelectorSupported !== undefined) {
    return scopeSelectorSupported;
  }

  return scopeSelectorSupported = testScopeSelector(el);
}
/**
 * Test that the :scope selector is supported and behaves correctly.
 * @param {!Element} el
 * @return {boolean}
 */


function testScopeSelector(el) {
  try {
    var doc = el.ownerDocument;
    var testElement = doc.createElement('div');
    var testChild = doc.createElement('div');
    testElement.appendChild(testChild); // NOTE(cvializ, #12383): Firefox's implementation is incomplete,
    // therefore we test actual functionality of`:scope` as well.

    return testElement.
    /*OK*/
    querySelector(':scope div') === testChild;
  } catch (e) {
    return false;
  }
}
/**
 * Prefixes a selector for ancestor selection. Splits in subselectors and
 * applies prefix to each.
 *
 * e.g.
 * ```
 *   prependSelectorsWith('div', '.i-amphtml-scoped');
 *   // => '.i-amphtml-scoped div'
 *   prependSelectorsWith('div, ul', ':scope');
 *   // => ':scope div, :scope ul'
 *   prependSelectorsWith('div, ul', 'article >');
 *   // => 'article > div, article > ul'
 * ```
 *
 * @param {string} selector
 * @param {string} distribute
 * @return {string}
 */


function prependSelectorsWith(selector, distribute) {
  return selector.replace(/^|,/g, "$&" + distribute + " ");
}
/**
 * Escapes an ident (ID or a class name) to be used as a CSS selector.
 *
 * See https://drafts.csswg.org/cssom/#serialize-an-identifier.
 *
 * @param {string} ident
 * @return {string}
 */


function escapeCssSelectorIdent(ident) {
  return (0, _cssEscape.cssEscape)(ident);
}
/**
 * Escapes an ident in a way that can be used by :nth-child() psuedo-class.
 *
 * See https://github.com/w3c/csswg-drafts/issues/2306.
 *
 * @param {string|number} ident
 * @return {string}
 */


function escapeCssSelectorNth(ident) {
  var escaped = String(ident); // Ensure it doesn't close the nth-child psuedo class.

  (0, _log.devAssert)(escaped.indexOf(')') === -1);
  return escaped;
}

},{"../third_party/css-escape/css-escape":70,"./log":45}],28:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isDocumentReady = isDocumentReady;
exports.onDocumentReady = onDocumentReady;
exports.whenDocumentReady = whenDocumentReady;
exports.whenDocumentComplete = whenDocumentComplete;

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Whether the document is ready.
 * @param {!Document} doc
 * @return {boolean}
 */
function isDocumentReady(doc) {
  return doc.readyState != 'loading' && doc.readyState != 'uninitialized';
}
/**
 * Whether the document has loaded all the css and sub-resources.
 * @param {!Document} doc
 * @return {boolean}
 */


function isDocumentComplete(doc) {
  return doc.readyState == 'complete';
}
/**
 * Calls the callback when document is ready.
 * @param {!Document} doc
 * @param {function(!Document)} callback
 */


function onDocumentReady(doc, callback) {
  onDocumentState(doc, isDocumentReady, callback);
}
/**
 * Calls the callback when document's state satisfies the stateFn.
 * @param {!Document} doc
 * @param {function(!Document):boolean} stateFn
 * @param {function(!Document)} callback
 */


function onDocumentState(doc, stateFn, callback) {
  var ready = stateFn(doc);

  if (ready) {
    callback(doc);
  } else {
    var readyListener = function readyListener() {
      if (stateFn(doc)) {
        if (!ready) {
          ready = true;
          callback(doc);
        }

        doc.removeEventListener('readystatechange', readyListener);
      }
    };

    doc.addEventListener('readystatechange', readyListener);
  }
}
/**
 * Returns a promise that is resolved when document is ready.
 * @param {!Document} doc
 * @return {!Promise<!Document>}
 */


function whenDocumentReady(doc) {
  return new Promise(function (resolve) {
    onDocumentReady(doc, resolve);
  });
}
/**
 * Returns a promise that is resolved when document is complete.
 * @param {!Document} doc
 * @return {!Promise<!Document>}
 */


function whenDocumentComplete(doc) {
  return new Promise(function (resolve) {
    onDocumentState(doc, isDocumentComplete, resolve);
  });
}

},{}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.waitForChild = waitForChild;
exports.waitForChildPromise = waitForChildPromise;
exports.waitForBodyOpen = waitForBodyOpen;
exports.waitForBodyOpenPromise = waitForBodyOpenPromise;
exports.removeElement = removeElement;
exports.removeChildren = removeChildren;
exports.copyChildren = copyChildren;
exports.insertAfterOrAtStart = insertAfterOrAtStart;
exports.addAttributesToElement = addAttributesToElement;
exports.createElementWithAttributes = createElementWithAttributes;
exports.isConnectedNode = isConnectedNode;
exports.rootNodeFor = rootNodeFor;
exports.isShadowRoot = isShadowRoot;
exports.closest = closest;
exports.closestNode = closestNode;
exports.closestAncestorElementBySelector = closestAncestorElementBySelector;
exports.ancestorElements = ancestorElements;
exports.ancestorElementsByTag = ancestorElementsByTag;
exports.childElement = childElement;
exports.childElements = childElements;
exports.lastChildElement = lastChildElement;
exports.childNodes = childNodes;
exports.childElementByAttr = childElementByAttr;
exports.lastChildElementByAttr = lastChildElementByAttr;
exports.childElementsByAttr = childElementsByAttr;
exports.childElementByTag = childElementByTag;
exports.childElementsByTag = childElementsByTag;
exports.matches = matches;
exports.elementByTag = elementByTag;
exports.scopedQuerySelector = scopedQuerySelector;
exports.scopedQuerySelectorAll = scopedQuerySelectorAll;
exports.getDataParamsFromAttributes = getDataParamsFromAttributes;
exports.hasNextNodeInDocumentOrder = hasNextNodeInDocumentOrder;
exports.templateContentClone = templateContentClone;
exports.iterateCursor = iterateCursor;
exports.openWindowDialog = openWindowDialog;
exports.isJsonScriptTag = isJsonScriptTag;
exports.isJsonLdScriptTag = isJsonLdScriptTag;
exports.isRTL = isRTL;
exports.escapeHtml = escapeHtml;
exports.tryFocus = tryFocus;
exports.isIframed = isIframed;
exports.isAmpElement = isAmpElement;
exports.whenUpgradedToCustomElement = whenUpgradedToCustomElement;
exports.fullscreenEnter = fullscreenEnter;
exports.fullscreenExit = fullscreenExit;
exports.isFullscreenElement = isFullscreenElement;
exports.isEnabled = isEnabled;
exports.domOrderComparator = domOrderComparator;
exports.toggleAttribute = toggleAttribute;
exports.getVerticalScrollbarWidth = getVerticalScrollbarWidth;
exports.UPGRADE_TO_CUSTOMELEMENT_RESOLVER = exports.UPGRADE_TO_CUSTOMELEMENT_PROMISE = void 0;

var _promise = require("./utils/promise");

var _css = require("./css");

var _log = require("./log");

var _object = require("./utils/object");

var _string = require("./string");

var _types = require("./types");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var HTML_ESCAPE_CHARS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};
var HTML_ESCAPE_REGEX = /(&|<|>|"|'|`)/g;
/** @const {string} */

var UPGRADE_TO_CUSTOMELEMENT_PROMISE = '__AMP_UPG_PRM';
/** @const {string} */

exports.UPGRADE_TO_CUSTOMELEMENT_PROMISE = UPGRADE_TO_CUSTOMELEMENT_PROMISE;
var UPGRADE_TO_CUSTOMELEMENT_RESOLVER = '__AMP_UPG_RES';
/**
 * Waits until the child element is constructed. Once the child is found, the
 * callback is executed.
 * @param {!Element} parent
 * @param {function(!Element):boolean} checkFunc
 * @param {function()} callback
 */

exports.UPGRADE_TO_CUSTOMELEMENT_RESOLVER = UPGRADE_TO_CUSTOMELEMENT_RESOLVER;

function waitForChild(parent, checkFunc, callback) {
  if (checkFunc(parent)) {
    callback();
    return;
  }
  /** @const {!Window} */


  var win = (0, _types.toWin)(parent.ownerDocument.defaultView);

  if (win.MutationObserver) {
    /** @const {MutationObserver} */
    var observer = new win.MutationObserver(function () {
      if (checkFunc(parent)) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(parent, {
      childList: true
    });
  } else {
    /** @const {number} */
    var interval = win.setInterval(function () {
      if (checkFunc(parent)) {
        win.clearInterval(interval);
        callback();
      }
    },
    /* milliseconds */
    5);
  }
}
/**
 * Waits until the child element is constructed. Once the child is found, the
 * promise is resolved.
 * @param {!Element} parent
 * @param {function(!Element):boolean} checkFunc
 * @return {!Promise}
 */


function waitForChildPromise(parent, checkFunc) {
  return new Promise(function (resolve) {
    waitForChild(parent, checkFunc, resolve);
  });
}
/**
 * Waits for document's body to be available and ready.
 * @param {!Document} doc
 * @param {function()} callback
 */


function waitForBodyOpen(doc, callback) {
  waitForChild(doc.documentElement, function () {
    return !!doc.body;
  }, callback);
}
/**
 * Waits for document's body to be available.
 * @param {!Document} doc
 * @return {!Promise}
 */


function waitForBodyOpenPromise(doc) {
  return new Promise(function (resolve) {
    return waitForBodyOpen(doc, resolve);
  });
}
/**
 * Removes the element.
 * @param {!Element} element
 */


function removeElement(element) {
  if (element.parentElement) {
    element.parentElement.removeChild(element);
  }
}
/**
 * Removes all child nodes of the specified element.
 * @param {!Element} parent
 */


function removeChildren(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}
/**
 * Copies all children nodes of element "from" to element "to". Child nodes
 * are deeply cloned. Notice, that this method should be used with care and
 * preferably on smaller subtrees.
 * @param {!Element} from
 * @param {!Element|!DocumentFragment} to
 */


function copyChildren(from, to) {
  var frag = to.ownerDocument.createDocumentFragment();

  for (var n = from.firstChild; n; n = n.nextSibling) {
    frag.appendChild(n.cloneNode(true));
  }

  to.appendChild(frag);
}
/**
 * Insert the element in the root after the element named after or
 * if that is null at the beginning.
 * @param {!Element|!ShadowRoot} root
 * @param {!Element} element
 * @param {?Node} after
 */


function insertAfterOrAtStart(root, element, after) {
  var before = after ? after.nextSibling : root.firstChild;
  root.insertBefore(element, before);
}
/**
 * Add attributes to an element.
 * @param {!Element} element
 * @param {!JsonObject<string, string>} attributes
 * @return {!Element} created element
 */


function addAttributesToElement(element, attributes) {
  for (var attr in attributes) {
    element.setAttribute(attr, attributes[attr]);
  }

  return element;
}
/**
 * Create a new element on document with specified tagName and attributes.
 * @param {!Document} doc
 * @param {string} tagName
 * @param {!JsonObject<string, string>} attributes
 * @return {!Element} created element
 */


function createElementWithAttributes(doc, tagName, attributes) {
  var element = doc.createElement(tagName);
  return addAttributesToElement(element, attributes);
}
/**
 * Returns true if node is connected (attached).
 * @param {!Node} node
 * @return {boolean}
 * @see https://dom.spec.whatwg.org/#connected
 */


function isConnectedNode(node) {
  var connected = node.isConnected;

  if (connected !== undefined) {
    return connected;
  } // "An element is connected if its shadow-including root is a document."


  var n = node;

  do {
    n = rootNodeFor(n);

    if (n.host) {
      n = n.host;
    } else {
      break;
    }
  } while (true);

  return n.nodeType === Node.DOCUMENT_NODE;
}
/**
 * Returns the root for a given node. Does not cross shadow DOM boundary.
 * @param {!Node} node
 * @return {!Node}
 */


function rootNodeFor(node) {
  if (Node.prototype.getRootNode) {
    // Type checker says `getRootNode` may return null.
    return node.getRootNode() || node;
  }

  var n; // Check isShadowRoot() is only needed for the polyfill case.

  for (n = node; !!n.parentNode && !isShadowRoot(n); n = n.parentNode) {}

  return n;
}
/**
 * Determines if value is actually a `ShadowRoot` node.
 * @param {*} value
 * @return {boolean}
 */


function isShadowRoot(value) {
  // TODO(#22733): remove in preference to dom's `rootNodeFor`.
  if (!value) {
    return false;
  } // Node.nodeType == DOCUMENT_FRAGMENT to speed up the tests. Unfortunately,
  // nodeType of DOCUMENT_FRAGMENT is used currently for ShadowRoot nodes.


  if (value.tagName == 'I-AMPHTML-SHADOW-ROOT') {
    return true;
  }

  return value.nodeType ==
  /* DOCUMENT_FRAGMENT */
  11 && Object.prototype.toString.call(value) === '[object ShadowRoot]';
}
/**
 * Finds the closest element that satisfies the callback from this element
 * up the DOM subtree.
 * @param {!Element} element
 * @param {function(!Element):boolean} callback
 * @param {Element=} opt_stopAt optional elemnt to stop the search at.
 * @return {?Element}
 */


function closest(element, callback, opt_stopAt) {
  for (var el = element; el && el !== opt_stopAt; el = el.parentElement) {
    if (callback(el)) {
      return el;
    }
  }

  return null;
}
/**
 * Finds the closest node that satisfies the callback from this node
 * up the DOM subtree.
 * @param {!Node} node
 * @param {function(!Node):boolean} callback
 * @return {?Node}
 */


function closestNode(node, callback) {
  for (var n = node; n; n = n.parentNode) {
    if (callback(n)) {
      return n;
    }
  }

  return null;
}
/**
 * Finds the closest ancestor element with the specified selector from this
 * element.
 * @param {!Element} element
 * @param {string} selector
 * @return {?Element} closest ancestor if found.
 */


function closestAncestorElementBySelector(element, selector) {
  if (element.closest) {
    return element.closest(selector);
  }

  return closest(element, function (el) {
    return matches(el, selector);
  });
}
/**
 * Finds all ancestor elements that satisfy predicate.
 * @param {!Element} child
 * @param {function(!Element):boolean} predicate
 * @return {!Array<!Element>}
 */


function ancestorElements(child, predicate) {
  var ancestors = [];

  for (var ancestor = child.parentElement; ancestor; ancestor = ancestor.parentElement) {
    if (predicate(ancestor)) {
      ancestors.push(ancestor);
    }
  }

  return ancestors;
}
/**
 * Finds all ancestor elements that has the specified tag name.
 * @param {!Element} child
 * @param {string} tagName
 * @return {!Array<!Element>}
 */


function ancestorElementsByTag(child, tagName) {
  (0, _css.assertIsName)(tagName);
  tagName = tagName.toUpperCase();
  return ancestorElements(child, function (el) {
    return el.tagName == tagName;
  });
}
/**
 * Finds the first child element that satisfies the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */


function childElement(parent, callback) {
  for (var child = parent.firstElementChild; child; child = child.nextElementSibling) {
    if (callback(child)) {
      return child;
    }
  }

  return null;
}
/**
 * Finds all child elements that satisfy the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {!Array<!Element>}
 */


function childElements(parent, callback) {
  var children = [];

  for (var child = parent.firstElementChild; child; child = child.nextElementSibling) {
    if (callback(child)) {
      children.push(child);
    }
  }

  return children;
}
/**
 * Finds the last child element that satisfies the callback.
 * @param {!Element} parent
 * @param {function(!Element):boolean} callback
 * @return {?Element}
 */


function lastChildElement(parent, callback) {
  for (var child = parent.lastElementChild; child; child = child.previousElementSibling) {
    if (callback(child)) {
      return child;
    }
  }

  return null;
}
/**
 * Finds all child nodes that satisfy the callback.
 * These nodes can include Text, Comment and other child nodes.
 * @param {!Node} parent
 * @param {function(!Node):boolean} callback
 * @return {!Array<!Node>}
 */


function childNodes(parent, callback) {
  var nodes = [];

  for (var child = parent.firstChild; child; child = child.nextSibling) {
    if (callback(child)) {
      nodes.push(child);
    }
  }

  return nodes;
}
/**
 * Finds the first child element that has the specified attribute.
 * @param {!Element} parent
 * @param {string} attr
 * @return {?Element}
 */


function childElementByAttr(parent, attr) {
  (0, _css.assertIsName)(attr);
  return (
    /*OK*/
    scopedQuerySelector(parent, "> [" + attr + "]")
  );
}
/**
 * Finds the last child element that has the specified attribute.
 * @param {!Element} parent
 * @param {string} attr
 * @return {?Element}
 */


function lastChildElementByAttr(parent, attr) {
  (0, _css.assertIsName)(attr);
  return lastChildElement(parent, function (el) {
    return el.hasAttribute(attr);
  });
}
/**
 * Finds all child elements that has the specified attribute.
 * @param {!Element} parent
 * @param {string} attr
 * @return {!NodeList<!Element>}
 */


function childElementsByAttr(parent, attr) {
  (0, _css.assertIsName)(attr);
  return (
    /*OK*/
    scopedQuerySelectorAll(parent, "> [" + attr + "]")
  );
}
/**
 * Finds the first child element that has the specified tag name.
 * @param {!Element} parent
 * @param {string} tagName
 * @return {?Element}
 */


function childElementByTag(parent, tagName) {
  (0, _css.assertIsName)(tagName);
  return (
    /*OK*/
    scopedQuerySelector(parent, "> " + tagName)
  );
}
/**
 * Finds all child elements with the specified tag name.
 * @param {!Element} parent
 * @param {string} tagName
 * @return {!NodeList<!Element>}
 */


function childElementsByTag(parent, tagName) {
  (0, _css.assertIsName)(tagName);
  return (
    /*OK*/
    scopedQuerySelectorAll(parent, "> " + tagName)
  );
}
/**
 * Checks if the given element matches the selector
 * @param  {!Element} el The element to verify
 * @param  {string} selector The selector to check against
 * @return {boolean} True if the element matched the selector. False otherwise.
 */


function matches(el, selector) {
  var matcher = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector;

  if (matcher) {
    return matcher.call(el, selector);
  }

  return false; // IE8 always returns false.
}
/**
 * Finds the first descendant element with the specified name.
 * @param {!Element|!Document|!ShadowRoot} element
 * @param {string} tagName
 * @return {?Element}
 */


function elementByTag(element, tagName) {
  (0, _css.assertIsName)(tagName);
  return element.
  /*OK*/
  querySelector(tagName);
}
/**
 * Finds all elements that matche `selector`, scoped inside `root`
 * for user-agents that do not support native scoping.
 *
 * This method isn't required for modern builds, can be removed.
 *
 * @param {!Element} root
 * @param {string} selector
 * @return {!NodeList<!Element>}
 */


function scopedQuerySelectionFallback(root, selector) {
  var unique = 'i-amphtml-scoped';
  root.classList.add(unique);
  var scopedSelector = (0, _css.prependSelectorsWith)(selector, "." + unique);
  var elements = root.
  /*OK*/
  querySelectorAll(scopedSelector);
  root.classList.remove(unique);
  return elements;
}
/**
 * Finds the first element that matches `selector`, scoped inside `root`.
 * Note: in IE, this causes a quick mutation of the element's class list.
 * @param {!Element} root
 * @param {string} selector
 * @return {?Element}
 */


function scopedQuerySelector(root, selector) {
  if ((0, _css.isScopeSelectorSupported)(root)) {
    return root.
    /*OK*/
    querySelector((0, _css.prependSelectorsWith)(selector, ':scope'));
  } // Only IE.


  var fallbackResult = scopedQuerySelectionFallback(root, selector);
  return fallbackResult[0] === undefined ? null : fallbackResult[0];
}
/**
 * Finds every element that matches `selector`, scoped inside `root`.
 * Note: in IE, this causes a quick mutation of the element's class list.
 * @param {!Element} root
 * @param {string} selector
 * @return {!NodeList<!Element>}
 */


function scopedQuerySelectorAll(root, selector) {
  if ((0, _css.isScopeSelectorSupported)(root)) {
    return root.
    /*OK*/
    querySelectorAll((0, _css.prependSelectorsWith)(selector, ':scope'));
  } // Only IE.


  return scopedQuerySelectionFallback(root, selector);
}
/**
 * Returns element data-param- attributes as url parameters key-value pairs.
 * e.g. data-param-some-attr=value -> {someAttr: value}.
 * @param {!Element} element
 * @param {function(string):string=} opt_computeParamNameFunc to compute the
 *    parameter name, get passed the camel-case parameter name.
 * @param {!RegExp=} opt_paramPattern Regex pattern to match data attributes.
 * @return {!JsonObject}
 */


function getDataParamsFromAttributes(element, opt_computeParamNameFunc, opt_paramPattern) {
  var computeParamNameFunc = opt_computeParamNameFunc || function (key) {
    return key;
  };

  var dataset = element.dataset;
  var params = (0, _object.dict)();
  var paramPattern = opt_paramPattern ? opt_paramPattern : /^param(.+)/;

  for (var key in dataset) {
    var _matches = key.match(paramPattern);

    if (_matches) {
      var param = _matches[1][0].toLowerCase() + _matches[1].substr(1);

      params[computeParamNameFunc(param)] = dataset[key];
    }
  }

  return params;
}
/**
 * Whether the element have a next node in the document order.
 * This means either:
 *  a. The element itself has a nextSibling.
 *  b. Any of the element ancestors has a nextSibling.
 * @param {!Element} element
 * @param {?Node} opt_stopNode
 * @return {boolean}
 */


function hasNextNodeInDocumentOrder(element, opt_stopNode) {
  var currentElement = element;

  do {
    if (currentElement.nextSibling) {
      return true;
    }
  } while ((currentElement = currentElement.parentNode) && currentElement != opt_stopNode);

  return false;
}
/**
 * Returns a clone of the content of a template element.
 *
 * Polyfill to replace .content access for browsers that do not support
 * HTMLTemplateElements natively.
 *
 * @param {!HTMLTemplateElement|!Element} template
 * @return {!DocumentFragment}
 */


function templateContentClone(template) {
  if ('content' in template) {
    return template.content.cloneNode(true);
  } else {
    var content = template.ownerDocument.createDocumentFragment();
    copyChildren(template, content);
    return content;
  }
}
/**
 * Iterate over an array-like.
 * Test cases: https://jsbench.github.io/#f638cacc866a1b2d6e517e6cfa900d6b
 * @param {!IArrayLike<T>} iterable
 * @param {function(T, number)} cb
 * @template T
 */


function iterateCursor(iterable, cb) {
  var length = iterable.length;

  for (var i = 0; i < length; i++) {
    cb(iterable[i], i);
  }
}
/**
 * This method wraps around window's open method. It first tries to execute
 * `open` call with the provided target and if it fails, it retries the call
 * with the `_top` target. This is necessary given that in some embedding
 * scenarios, such as iOS' WKWebView, navigation to `_blank` and other targets
 * is blocked by default.
 *
 * @param {!Window} win
 * @param {string} url
 * @param {string} target
 * @param {string=} opt_features
 * @return {?Window}
 */


function openWindowDialog(win, url, target, opt_features) {
  // Try first with the specified target. If we're inside the WKWebView or
  // a similar environments, this method is expected to fail by default for
  // all targets except `_top`.
  var res;

  try {
    res = win.open(url, target, opt_features);
  } catch (e) {
    (0, _log.dev)().error('DOM', 'Failed to open url on target: ', target, e);
  } // Then try with `_top` target.


  if (!res && target != '_top' && !(0, _string.includes)(opt_features || '', 'noopener')) {
    res = win.open(url, '_top');
  }

  return res;
}
/**
 * Whether the element is a script tag with application/json type.
 * @param {!Element} element
 * @return {boolean}
 */


function isJsonScriptTag(element) {
  return element.tagName == 'SCRIPT' && element.hasAttribute('type') && element.getAttribute('type').toUpperCase() == 'APPLICATION/JSON';
}
/**
 * Whether the element is a script tag with application/json type.
 * @param {!Element} element
 * @return {boolean}
 */


function isJsonLdScriptTag(element) {
  return element.tagName == 'SCRIPT' && element.getAttribute('type').toUpperCase() == 'APPLICATION/LD+JSON';
}
/**
 * Whether the page's direction is right to left or not.
 * @param {!Document} doc
 * @return {boolean}
 */


function isRTL(doc) {
  var dir = doc.body.getAttribute('dir') || doc.documentElement.getAttribute('dir') || 'ltr';
  return dir == 'rtl';
}
/**
 * Escapes `<`, `>` and other HTML charcaters with their escaped forms.
 * @param {string} text
 * @return {string}
 */


function escapeHtml(text) {
  if (!text) {
    return text;
  }

  return text.replace(HTML_ESCAPE_REGEX, escapeHtmlChar);
}
/**
 * @param {string} c
 * @return {string}
 */


function escapeHtmlChar(c) {
  return HTML_ESCAPE_CHARS[c];
}
/**
 * Tries to focus on the given element; fails silently if browser throws an
 * exception.
 * @param {!Element} element
 */


function tryFocus(element) {
  try {
    element.
    /*OK*/
    focus();
  } catch (e) {// IE <= 7 may throw exceptions when focusing on hidden items.
  }
}
/**
 * Whether the given window is in an iframe or not.
 * @param {!Window} win
 * @return {boolean}
 */


function isIframed(win) {
  return win.parent && win.parent != win;
}
/**
 * Determines if this element is an AMP element
 * @param {!Element} element
 * @return {boolean}
 */


function isAmpElement(element) {
  var tag = element.tagName; // Use prefix to recognize AMP element. This is necessary because stub
  // may not be attached yet.

  return (0, _string.startsWith)(tag, 'AMP-') && // Some "amp-*" elements are not really AMP elements. :smh:
  !(tag == 'AMP-STICKY-AD-TOP-PADDING' || tag == 'AMP-BODY');
}
/**
 * Return a promise that resolve when an AMP element upgrade from HTMLElement
 * to CustomElement
 * @param {!Element} element
 * @return {!Promise<!Element>}
 */


function whenUpgradedToCustomElement(element) {
  (0, _log.devAssert)(isAmpElement(element), 'element is not AmpElement');

  if (element.createdCallback) {
    // Element already is CustomElement;
    return Promise.resolve(element);
  } // If Element is still HTMLElement, wait for it to upgrade to customElement
  // Note: use pure string to avoid obfuscation between versions.


  if (!element[UPGRADE_TO_CUSTOMELEMENT_PROMISE]) {
    var deferred = new _promise.Deferred();
    element[UPGRADE_TO_CUSTOMELEMENT_PROMISE] = deferred.promise;
    element[UPGRADE_TO_CUSTOMELEMENT_RESOLVER] = deferred.resolve;
  }

  return element[UPGRADE_TO_CUSTOMELEMENT_PROMISE];
}
/**
 * Replacement for `Element.requestFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
 * @param {!Element} element
 */


function fullscreenEnter(element) {
  var requestFs = element.requestFullscreen || element.requestFullScreen || element.webkitRequestFullscreen || element.webkitEnterFullscreen || element.msRequestFullscreen || element.mozRequestFullScreen;

  if (requestFs) {
    requestFs.call(element);
  }
}
/**
 * Replacement for `Document.exitFullscreen()` method.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen
 * @param {!Element} element
 */


function fullscreenExit(element) {
  var elementBoundExit = element.cancelFullScreen || element.exitFullscreen || element.webkitExitFullscreen || element.webkitCancelFullScreen || element.mozCancelFullScreen || element.msExitFullscreen;

  if (elementBoundExit) {
    elementBoundExit.call(element);
    return;
  }

  var ownerDocument = element.ownerDocument;

  if (!ownerDocument) {
    return;
  }

  var docBoundExit = ownerDocument.cancelFullScreen || ownerDocument.exitFullscreencancelFullScreen || ownerDocument.webkitExitFullscreencancelFullScreen || ownerDocument.webkitCancelFullScreencancelFullScreen || ownerDocument.mozCancelFullScreencancelFullScreen || ownerDocument.msExitFullscreen;

  if (docBoundExit) {
    docBoundExit.call(ownerDocument);
  }
}
/**
 * Replacement for `Document.fullscreenElement`.
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenElement
 * @param {!Element} element
 * @return {boolean}
 */


function isFullscreenElement(element) {
  var webkitDisplayingFullscreen = element.webkitDisplayingFullscreen;

  if (webkitDisplayingFullscreen !== undefined) {
    return webkitDisplayingFullscreen;
  }

  var ownerDocument = element.ownerDocument;

  if (!ownerDocument) {
    return false;
  }

  var fullscreenElement = ownerDocument.fullscreenElement || ownerDocument.webkitFullscreenElement || ownerDocument.mozFullScreenElement || ownerDocument.webkitCurrentFullScreenElement;
  return fullscreenElement == element;
}
/**
 * Returns true if node is not disabled.
 *
 * IE8 can return false positives, see {@link matches}.
 * @param {!Element} element
 * @return {boolean}
 * @see https://www.w3.org/TR/html5/forms.html#concept-fe-disabled
 */


function isEnabled(element) {
  return !(element.disabled || matches(element, ':disabled'));
}
/**
 * A sorting comparator that sorts elements in DOM tree order.
 * A first sibling is sorted to be before its nextSibling.
 * A parent node is sorted to be before a child.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
 *
 * @param {!Element} element1
 * @param {!Element} element2
 * @return {number}
 */


function domOrderComparator(element1, element2) {
  if (element1 === element2) {
    return 0;
  }

  var pos = element1.compareDocumentPosition(element2);
  var precedingOrContains = Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINS; // if fe2 is preceding or contains fe1 then, fe1 is after fe2

  if (pos & precedingOrContains) {
    return 1;
  } // if fe2 is following or contained by fe1, then fe1 is before fe2


  return -1;
}
/**
 * Like `Element.prototype.toggleAttribute`. This either toggles an attribute
 * on by adding an attribute with an empty value, or toggles it off by removing
 * the attribute. This does not mutate the element if the new state matches
 * the existing state.
 * @param {!Element} element An element to toggle the attribute for.
 * @param {string} name The name of the attribute.
 * @param {boolean=} forced Whether the attribute should be forced on/off. If
 *    not specified, it will be toggled from the current state.
 * @return {boolean} Whether or not the element now has the attribute.
 */


function toggleAttribute(element, name, forced) {
  var hasAttribute = element.hasAttribute(name);
  var enabled = forced !== undefined ? forced : !hasAttribute;

  if (enabled !== hasAttribute) {
    if (enabled) {
      element.setAttribute(name, '');
    } else {
      element.removeAttribute(name);
    }
  }

  return enabled;
}
/**
 * @param {!Window} win
 * @return {number} The width of the vertical scrollbar, in pixels.
 */


function getVerticalScrollbarWidth(win) {
  var documentElement = win.document.documentElement;
  var windowWidth = win.
  /*OK*/
  innerWidth;
  var documentWidth = documentElement.
  /*OK*/
  clientWidth;
  return windowWidth - documentWidth;
}

},{"./css":27,"./log":45,"./string":55,"./types":58,"./utils/object":67,"./utils/promise":68}],30:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getElementService = getElementService;
exports.getElementServiceIfAvailable = getElementServiceIfAvailable;
exports.getElementServiceForDoc = getElementServiceForDoc;
exports.getElementServiceIfAvailableForDoc = getElementServiceIfAvailableForDoc;
exports.getElementServiceIfAvailableForDocInEmbedScope = getElementServiceIfAvailableForDocInEmbedScope;
exports.extensionScriptsInNode = extensionScriptsInNode;
exports.isExtensionScriptInNode = isExtensionScriptInNode;

var dom = _interopRequireWildcard(require("./dom"));

var _service = require("./service");

var _types = require("./types");

var _log = require("./log");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns a promise for a service for the given id and window. Also expects an
 * element that has the actual implementation. The promise resolves when the
 * implementation loaded. Users should typically wrap this as a special purpose
 * function (e.g. Services.viewportForDoc(...)) for type safety and because the
 * factory should not be passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an element,
 *     not the extension.
 * @return {!Promise<*>}
 */
function getElementService(win, id, extension, opt_element) {
  return getElementServiceIfAvailable(win, id, extension, opt_element).then(function (service) {
    return assertService(service, id, extension);
  });
}
/**
 * Same as getElementService but produces null if the given element is not
 * actually available on the current page.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an
 *     element, not the extension.
 * @return {!Promise<?Object>}
 */


function getElementServiceIfAvailable(win, id, extension, opt_element) {
  var s = (0, _service.getServicePromiseOrNull)(win, id);

  if (s) {
    return (
      /** @type {!Promise<?Object>} */
      s
    );
  }

  return getElementServicePromiseOrNull(win, id, extension, opt_element);
}
/**
 * @param {!Window} win
 * @param {string} elementName Name of an extended custom element.
 * @return {boolean} Whether this element is scheduled to be loaded.
 */


function isElementScheduled(win, elementName) {
  // Set in custom-element.js
  if (!win.__AMP_EXTENDED_ELEMENTS) {
    return false;
  }

  return !!win.__AMP_EXTENDED_ELEMENTS[elementName];
}
/**
 * Returns a promise for a service for the given id and window. Also expects an
 * element that has the actual implementation. The promise resolves when the
 * implementation loaded. Users should typically wrap this as a special purpose
 * function (e.g. Services.viewportForDoc(...)) for type safety and because the
 * factory should not be passed around.
 * @param {!Element|!ShadowRoot} element
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an element,
 *     not the extension.
 * @return {!Promise<*>}
 */


function getElementServiceForDoc(element, id, extension, opt_element) {
  return getElementServiceIfAvailableForDoc(element, id, extension, opt_element).then(function (service) {
    return assertService(service, id, extension);
  });
}
/**
 * Same as getElementService but produces null if the given element is not
 * actually available on the current page.
 * @param {!Element|!ShadowRoot} element
 * @param {string} id of the service.
 * @param {string} extension Name of the custom extension that provides the
 *     implementation of this service.
 * @param {boolean=} opt_element Whether this service is provided by an
 *     element, not the extension.
 * @return {!Promise<?Object>}
 */


function getElementServiceIfAvailableForDoc(element, id, extension, opt_element) {
  var s = (0, _service.getServicePromiseOrNullForDoc)(element, id);

  if (s) {
    return (
      /** @type {!Promise<?Object>} */
      s
    );
  }

  var ampdoc = (0, _service.getAmpdoc)(element);
  return ampdoc.waitForBodyOpen().then(function () {
    return waitForExtensionIfPresent(ampdoc.win, extension, ampdoc.win.document.head);
  }).then(function () {
    // If this service is provided by an element, then we can't depend on
    // the service (they may not use the element).
    if (opt_element) {
      return (0, _service.getServicePromiseOrNullForDoc)(element, id);
    } else if (isElementScheduled(ampdoc.win, extension)) {
      return (0, _service.getServicePromiseForDoc)(element, id);
    }

    return null;
  });
}
/**
 * Returns a promise for service for the given id in the embed scope of
 * a given element, if it exists. Falls back to ampdoc scope if the element
 * is not embedded.
 *
 * @param {!Element|!ShadowRoot} element
 * @param {string} id of the service.
 * @param {string} extension Name of the custom element that provides
 *     the implementation of this service.
 * @return {!Promise<?Object>}
 */


function getElementServiceIfAvailableForDocInEmbedScope(element, id, extension) {
  var s = (0, _service.getExistingServiceForDocInEmbedScope)(element, id);

  if (s) {
    return (
      /** @type {!Promise<?Object>} */
      Promise.resolve(s)
    );
  }

  var win = (0, _types.toWin)(element.ownerDocument.defaultView);
  var topWin = (0, _service.getTopWindow)(win); // In embeds, doc services are stored on the embed window.

  if (win !== topWin) {
    return getElementServicePromiseOrNull(win, id, extension);
  } else {
    // Only fallback to element's ampdoc (top-level) if not embedded.
    return getElementServiceIfAvailableForDoc(element, id, extension);
  }
}
/**
 * Throws user error if `service` is null.
 * @param {Object} service
 * @param {string} id
 * @param {string} extension
 * @return {!Object}
 * @private
 * @closurePrimitive {asserts.matchesReturn}
 */


function assertService(service, id, extension) {
  return (
    /** @type {!Object} */
    (0, _log.userAssert)(service, 'Service %s was requested to be provided through %s, ' + 'but %s is not loaded in the current page. To fix this ' + 'problem load the JavaScript file for %s in this page.', id, extension, extension, extension)
  );
}
/**
 * Get list of all the extension JS files.
 * @param {HTMLHeadElement|Element|ShadowRoot} head
 * @return {!Array<string>}
 */


function extensionScriptsInNode(head) {
  // ampdoc.getHeadNode() can return null.
  if (!head) {
    return [];
  }

  var scripts = {}; // Note: Some extensions don't have [custom-element] or [custom-template]
  // e.g. amp-viewer-integration.

  var list = head.querySelectorAll('script[custom-element],script[custom-template]');

  for (var i = 0; i < list.length; i++) {
    var script = list[i];
    var name = script.getAttribute('custom-element') || script.getAttribute('custom-template');
    scripts[name] = true;
  }

  return Object.keys(scripts);
}
/**
 * Waits for body to be present then verifies that an extension script is
 * present in head for installation.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} extensionId
 * @return {!Promise<boolean>}
 */


function isExtensionScriptInNode(ampdoc, extensionId) {
  return ampdoc.waitForBodyOpen().then(function () {
    return extensionScriptInNode(ampdoc.getHeadNode(), extensionId);
  });
}
/**
 * Verifies that an extension script is present in head for
 * installation.
 * @param {HTMLHeadElement|Element|ShadowRoot} head
 * @param {string} extensionId
 * @return {boolean}
 * @private
 */


function extensionScriptInNode(head, extensionId) {
  return extensionScriptsInNode(head).includes(extensionId);
}
/**
 * Waits for an extension if its script is present
 * @param {!Window} win
 * @param {string} extension
 * @param {HTMLHeadElement|Element|ShadowRoot} head
 * @return {!Promise}
 * @private
 */


function waitForExtensionIfPresent(win, extension, head) {
  /**
   * If there is an extension script wait for it to load before trying
   * to get the service. Prevents a race condition when everything but
   * the extensions is in cache. If there is no script then it's either
   * not present, or the service was defined by a test. In those cases
   * we don't wait around for an extension that does not exist.
   */
  // TODO(jpettitt) investigate registerExtension to short circuit
  // the dom call in extensionScriptsInNode()
  if (!extensionScriptInNode(head, extension)) {
    return Promise.resolve();
  }

  var extensions = (0, _service.getService)(win, 'extensions');
  return (
    /** @type {!Promise<?Object>} */
    extensions.waitForExtension(win, extension)
  );
}
/**
 * Returns the promise for service with `id` on the given window if available.
 * Otherwise, resolves with null (service was not registered).
 * @param {!Window} win
 * @param {string} id
 * @param {string} extension
 * @param {boolean=} opt_element
 * @return {!Promise<Object>}
 * @private
 */


function getElementServicePromiseOrNull(win, id, extension, opt_element) {
  return dom.waitForBodyOpenPromise(win.document).then(function () {
    return waitForExtensionIfPresent(win, extension, win.document.head);
  }).then(function () {
    // If this service is provided by an element, then we can't depend on
    // the service (they may not use the element).
    if (opt_element) {
      return (0, _service.getServicePromiseOrNull)(win, id);
    } else if (isElementScheduled(win, extension)) {
      return (0, _service.getServicePromise)(win, id);
    }

    return null;
  });
}

},{"./dom":29,"./log":45,"./service":49,"./types":58}],31:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.reportErrorForWin = reportErrorForWin;
exports.reportError = reportError;
exports.cancellation = cancellation;
exports.isCancellation = isCancellation;
exports.blockedByConsentError = blockedByConsentError;
exports.isBlockedByConsent = isBlockedByConsent;
exports.installErrorReporting = installErrorReporting;
exports.reportErrorToServerOrViewer = reportErrorToServerOrViewer;
exports.maybeReportErrorToViewer = maybeReportErrorToViewer;
exports.errorReportingDataForViewer = errorReportingDataForViewer;
exports.getErrorReportData = getErrorReportData;
exports.detectNonAmpJs = detectNonAmpJs;
exports.resetAccumulatedErrorMessagesForTesting = resetAccumulatedErrorMessagesForTesting;
exports.detectJsEngineFromStack = detectJsEngineFromStack;
exports.reportErrorToAnalytics = reportErrorToAnalytics;

var _ampEvents = require("./amp-events");

var _services = require("./services");

var _log = require("./log");

var _object = require("./utils/object");

var _experiments = require("./experiments");

var _exponentialBackoff = require("./exponential-backoff");

var _mode = require("./mode");

var _eventHelper = require("./event-helper");

var _url = require("./url");

var _styleInstaller = require("./style-installer");

var _string = require("./string");

var _analytics = require("./analytics");

var _config = require("./config");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @const {string}
 */
var CANCELLED = 'CANCELLED';
/**
 * @const {string}
 */

var BLOCK_BY_CONSENT = 'BLOCK_BY_CONSENT';
/**
 * @const {string}
 */

var ABORTED = 'AbortError';
/**
 * The threshold for errors throttled because nothing can be done about
 * them, but we'd still like to report the rough number.
 * @const {number}
 */

var NON_ACTIONABLE_ERROR_THROTTLE_THRESHOLD = 0.001;
/**
 * The threshold for errors throttled because nothing can be done about
 * them, but we'd still like to report the rough number.
 * @const {number}
 */

var USER_ERROR_THROTTLE_THRESHOLD = 0.1;
/**
 * Collects error messages, so they can be included in subsequent reports.
 * That allows identifying errors that might be caused by previous errors.
 */

var accumulatedErrorMessages = self.__AMP_ERRORS || []; // Use a true global, to avoid multi-module inclusion issues.

self.__AMP_ERRORS = accumulatedErrorMessages;
/**
 * Pushes element into array, keeping at most the most recent limit elements
 *
 * @param {!Array<T>} array
 * @param {T} element
 * @param {number} limit
 * @template T
 */

function pushLimit(array, element, limit) {
  if (array.length >= limit) {
    array.splice(0, array.length - limit + 1);
  }

  array.push(element);
}
/**
 * A wrapper around our exponentialBackoff, to lazy initialize it to avoid an
 * un-DCE'able side-effect.
 * @param {function()} work the function to execute after backoff
 * @return {number} the setTimeout id
 */


var _reportingBackoff = function reportingBackoff(work) {
  // Set reportingBackoff as the lazy-created function. JS Vooodoooo.
  _reportingBackoff = (0, _exponentialBackoff.exponentialBackoff)(1.5);
  return _reportingBackoff(work);
};
/**
 * Attempts to stringify a value, falling back to String.
 * @param {*} value
 * @return {string}
 */


function tryJsonStringify(value) {
  try {
    // Cast is fine, because we really don't care here. Just trying.
    return JSON.stringify(
    /** @type {!JsonObject} */
    value);
  } catch (e) {
    return String(value);
  }
}
/**
 * The true JS engine, as detected by inspecting an Error stack. This should be
 * used with the userAgent to tell definitely. I.e., Chrome on iOS is really a
 * Safari JS engine.
 */


var detectedJsEngine;
/**
 * @param {!Window} win
 * @param {*} error
 * @param {!Element=} opt_associatedElement
 */

function reportErrorForWin(win, error, opt_associatedElement) {
  reportError(error, opt_associatedElement);

  if (error && !!win && (0, _log.isUserErrorMessage)(error.message) && !(0, _log.isUserErrorEmbed)(error.message)) {
    reportErrorToAnalytics(
    /** @type {!Error} */
    error, win);
  }
}
/**
 * Reports an error. If the error has an "associatedElement" property
 * the element is marked with the `i-amphtml-element-error` and displays
 * the message itself. The message is always send to the console.
 * If the error has a "messageArray" property, that array is logged.
 * This way one gets the native fidelity of the console for things like
 * elements instead of stringification.
 * @param {*} error
 * @param {!Element=} opt_associatedElement
 * @return {!Error}
 */


function reportError(error, opt_associatedElement) {
  try {
    // Convert error to the expected type.
    var isValidError;

    if (error) {
      if (error.message !== undefined) {
        error = (0, _log.duplicateErrorIfNecessary)(
        /** @type {!Error} */
        error);
        isValidError = true;
      } else {
        var origError = error;
        error = new Error(tryJsonStringify(origError));
        error.origError = origError;
      }
    } else {
      error = new Error('Unknown error');
    } // Report if error is not an expected type.


    if (!isValidError && (0, _mode.getMode)().localDev && !(0, _mode.getMode)().test) {
      setTimeout(function () {
        var rethrow = new Error('_reported_ Error reported incorrectly: ' + error);
        throw rethrow;
      });
    }

    if (error.reported) {
      return (
        /** @type {!Error} */
        error
      );
    }

    error.reported = true; // Update element.

    var element = opt_associatedElement || error.associatedElement;

    if (element && element.classList) {
      element.classList.add('i-amphtml-error');

      if ((0, _mode.getMode)().development) {
        element.classList.add('i-amphtml-element-error');
        element.setAttribute('error-message', error.message);
      }
    } // Report to console.


    if (self.console) {
      var output = console.error || console.log;

      if (error.messageArray) {
        output.apply(console, error.messageArray);
      } else {
        if (element) {
          output.call(console, error.message, element);
        } else if (!(0, _mode.getMode)().minified) {
          output.call(console, error.stack);
        } else {
          output.call(console, error.message);
        }
      }
    }

    if (element && element.dispatchCustomEventForTesting) {
      element.dispatchCustomEventForTesting(_ampEvents.AmpEvents.ERROR, error.message);
    } // 'call' to make linter happy. And .call to make compiler happy
    // that expects some @this.


    onError['call'](undefined, undefined, undefined, undefined, undefined, error);
  } catch (errorReportingError) {
    setTimeout(function () {
      throw errorReportingError;
    });
  }

  return (
    /** @type {!Error} */
    error
  );
}
/**
 * Returns an error for a cancellation of a promise.
 * @return {!Error}
 */


function cancellation() {
  return new Error(CANCELLED);
}
/**
 * @param {*} errorOrMessage
 * @return {boolean}
 */


function isCancellation(errorOrMessage) {
  if (!errorOrMessage) {
    return false;
  }

  if (typeof errorOrMessage == 'string') {
    return (0, _string.startsWith)(errorOrMessage, CANCELLED);
  }

  if (typeof errorOrMessage.message == 'string') {
    return (0, _string.startsWith)(errorOrMessage.message, CANCELLED);
  }

  return false;
}
/**
 * Returns an error for component blocked by consent
 * @return {!Error}
 */


function blockedByConsentError() {
  return new Error(BLOCK_BY_CONSENT);
}
/**
 * @param {*} errorOrMessage
 * @return {boolean}
 */


function isBlockedByConsent(errorOrMessage) {
  if (!errorOrMessage) {
    return false;
  }

  if (typeof errorOrMessage == 'string') {
    return (0, _string.startsWith)(errorOrMessage, BLOCK_BY_CONSENT);
  }

  if (typeof errorOrMessage.message == 'string') {
    return (0, _string.startsWith)(errorOrMessage.message, BLOCK_BY_CONSENT);
  }

  return false;
}
/**
 * Install handling of global unhandled exceptions.
 * @param {!Window} win
 */


function installErrorReporting(win) {
  win.onerror =
  /** @type {!Function} */
  onError;
  win.addEventListener('unhandledrejection', function (event) {
    if (event.reason && (event.reason.message === CANCELLED || event.reason.message === BLOCK_BY_CONSENT || event.reason.message === ABORTED)) {
      event.preventDefault();
      return;
    }

    reportError(event.reason || new Error('rejected promise ' + event));
  });
}
/**
 * Signature designed, so it can work with window.onerror
 * @param {string|undefined} message
 * @param {string|undefined} filename
 * @param {string|undefined} line
 * @param {string|undefined} col
 * @param {*|undefined} error
 * @this {!Window|undefined}
 */


function onError(message, filename, line, col, error) {
  var _this = this;

  // Make an attempt to unhide the body.
  if (this && this.document) {
    (0, _styleInstaller.makeBodyVisibleRecovery)(this.document);
  }

  if ((0, _mode.getMode)().localDev || (0, _mode.getMode)().development || (0, _mode.getMode)().test) {
    return;
  }

  var hasNonAmpJs = false;

  try {
    hasNonAmpJs = detectNonAmpJs(self);
  } catch (ignore) {// Ignore errors during error report generation.
  }

  if (hasNonAmpJs && Math.random() > 0.01) {
    // Only report 1% of errors on pages with non-AMP JS.
    // These errors can almost never be acted upon, but spikes such as
    // due to buggy browser extensions may be helpful to notify authors.
    return;
  }

  var data = getErrorReportData(message, filename, line, col, error, hasNonAmpJs);

  if (data) {
    _reportingBackoff(function () {
      try {
        return reportErrorToServerOrViewer(_this,
        /** @type {!JsonObject} */
        data).catch(function () {// catch async errors to avoid recursive errors.
        });
      } catch (e) {// catch async errors to avoid recursive errors.
      }
    });
  }
}
/**
 * Passes the given error data to either server or viewer.
 * @param {!Window} win
 * @param {!JsonObject} data Data from `getErrorReportData`.
 * @return {Promise<undefined>}
 */


function reportErrorToServerOrViewer(win, data) {
  // Report the error to viewer if it has the capability. The data passed
  // to the viewer is exactly the same as the data passed to the server
  // below.
  return maybeReportErrorToViewer(win, data).then(function (reportedErrorToViewer) {
    if (!reportedErrorToViewer) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', _config.urls.errorReporting, true);
      xhr.send(JSON.stringify(data));
    }
  });
}
/**
 * Passes the given error data to the viewer if the following criteria is met:
 * - The viewer is a trusted viewer
 * - The viewer has the `errorReporter` capability
 * - The AMP doc is in single doc mode
 * - The AMP doc is opted-in for error interception (`<html>` tag has the
 *   `report-errors-to-viewer` attribute)
 *
 * @param {!Window} win
 * @param {!JsonObject} data Data from `getErrorReportData`.
 * @return {!Promise<boolean>} `Promise<True>` if the error was sent to the
 *     viewer, `Promise<False>` otherwise.
 * @visibleForTesting
 */


function maybeReportErrorToViewer(win, data) {
  var ampdocService = _services.Services.ampdocServiceFor(win);

  if (!ampdocService.isSingleDoc()) {
    return Promise.resolve(false);
  }

  var ampdocSingle = ampdocService.getSingleDoc();
  var htmlElement = ampdocSingle.getRootNode().documentElement;
  var docOptedIn = htmlElement.hasAttribute('report-errors-to-viewer');

  if (!docOptedIn) {
    return Promise.resolve(false);
  }

  var viewer = _services.Services.viewerForDoc(ampdocSingle);

  if (!viewer.hasCapability('errorReporter')) {
    return Promise.resolve(false);
  }

  return viewer.isTrustedViewer().then(function (viewerTrusted) {
    if (!viewerTrusted) {
      return false;
    }

    viewer.sendMessage('error', errorReportingDataForViewer(data));
    return true;
  });
}
/**
 * Strips down the error reporting data to a minimal set
 * to be sent to the viewer.
 * @param {!JsonObject} errorReportData
 * @return {!JsonObject}
 * @visibleForTesting
 */


function errorReportingDataForViewer(errorReportData) {
  return (0, _object.dict)({
    'm': errorReportData['m'],
    // message
    'a': errorReportData['a'],
    // isUserError
    's': errorReportData['s'],
    // error stack
    'el': errorReportData['el'],
    // tagName
    'ex': errorReportData['ex'],
    // expected error?
    'v': errorReportData['v'],
    // runtime
    'jse': errorReportData['jse'] // detectedJsEngine

  });
}
/**
 * @param {string|undefined}  message
 * @param {*|undefined} error
 * @return {string}
 */


function buildErrorMessage_(message, error) {
  if (error) {
    if (error.message) {
      message = error.message;
    } else {
      // This should never be a string, but sometimes it is.
      message = String(error);
    }
  }

  if (!message) {
    message = 'Unknown error';
  }

  return message;
}
/**
 * Signature designed, so it can work with window.onerror
 * @param {string|undefined} message
 * @param {string|undefined} filename
 * @param {string|undefined} line
 * @param {string|undefined} col
 * @param {*|undefined} error
 * @param {boolean} hasNonAmpJs
 * @return {!JsonObject|undefined} The data to post
 * visibleForTesting
 */


function getErrorReportData(message, filename, line, col, error, hasNonAmpJs) {
  message = buildErrorMessage_(message, error); // An "expected" error is still an error, i.e. some features are disabled
  // or not functioning fully because of it. However, it's an expected
  // error. E.g. as is the case with some browser API missing (storage).
  // Thus, the error can be classified differently by log aggregators.
  // The main goal is to monitor that an "expected" error doesn't deteriorate
  // over time. It's impossible to completely eliminate it.

  var expected = !!(error && error.expected);

  if (/_reported_/.test(message)) {
    return;
  }

  if (message == CANCELLED) {
    return;
  }

  var detachedWindow = !(self && self.window);
  var throttleBase = Math.random(); // We throttle load errors and generic "Script error." errors
  // that have no information and thus cannot be acted upon.

  if ((0, _eventHelper.isLoadErrorMessage)(message) || // See https://github.com/ampproject/amphtml/issues/7353
  // for context.
  message == 'Script error.' || // Window has become detached, really anything can happen
  // at this point.
  detachedWindow) {
    expected = true;

    if (throttleBase > NON_ACTIONABLE_ERROR_THROTTLE_THRESHOLD) {
      return;
    }
  }

  var isUserError = (0, _log.isUserErrorMessage)(message); // Only report a subset of user errors.

  if (isUserError && throttleBase > USER_ERROR_THROTTLE_THRESHOLD) {
    return;
  } // This is the App Engine app in
  // https://github.com/ampproject/error-tracker
  // It stores error reports via https://cloud.google.com/error-reporting/
  // for analyzing production issues.


  var data =
  /** @type {!JsonObject} */
  Object.create(null);
  data['v'] = (0, _mode.getMode)().rtvVersion;
  data['noAmp'] = hasNonAmpJs ? '1' : '0';
  data['m'] = message.replace(_log.USER_ERROR_SENTINEL, '');
  data['a'] = isUserError ? '1' : '0'; // Errors are tagged with "ex" ("expected") label to allow loggers to
  // classify these errors as benchmarks and not exceptions.

  data['ex'] = expected ? '1' : '0';
  data['dw'] = detachedWindow ? '1' : '0';
  var runtime = '1p';

  if (self.context && self.context.location) {
    data['3p'] = '1';
    runtime = '3p';
  } else if ((0, _mode.getMode)().runtime) {
    runtime = (0, _mode.getMode)().runtime;
  }

  if ((0, _mode.getMode)().singlePassType) {
    data['spt'] = (0, _mode.getMode)().singlePassType;
  }

  data['rt'] = runtime; // Add our a4a id if we are inabox

  if (runtime === 'inabox') {
    data['adid'] = (0, _mode.getMode)().a4aId;
  } // TODO(erwinm): Remove ca when all systems read `bt` instead of `ca` to
  // identify js binary type.


  data['ca'] = (0, _experiments.isCanary)(self) ? '1' : '0'; // Pass binary type.

  data['bt'] = (0, _experiments.getBinaryType)(self);

  if (self.location.ancestorOrigins && self.location.ancestorOrigins[0]) {
    data['or'] = self.location.ancestorOrigins[0];
  }

  if (self.viewerState) {
    data['vs'] = self.viewerState;
  } // Is embedded?


  if (self.parent && self.parent != self) {
    data['iem'] = '1';
  }

  if (self.AMP && self.AMP.viewer) {
    var resolvedViewerUrl = self.AMP.viewer.getResolvedViewerUrl();
    var messagingOrigin = self.AMP.viewer.maybeGetMessagingOrigin();

    if (resolvedViewerUrl) {
      data['rvu'] = resolvedViewerUrl;
    }

    if (messagingOrigin) {
      data['mso'] = messagingOrigin;
    }
  }

  if (!detectedJsEngine) {
    detectedJsEngine = detectJsEngineFromStack();
  }

  data['jse'] = detectedJsEngine;
  var exps = [];
  var experiments = (0, _experiments.experimentTogglesOrNull)(self);

  for (var exp in experiments) {
    var on = experiments[exp];
    exps.push(exp + "=" + (on ? '1' : '0'));
  }

  data['exps'] = exps.join(',');

  if (error) {
    var tagName = error.associatedElement ? error.associatedElement.tagName : 'u'; // Unknown

    data['el'] = tagName;

    if (error.args) {
      data['args'] = JSON.stringify(error.args);
    }

    if (!isUserError && !error.ignoreStack && error.stack) {
      data['s'] = error.stack;
    } // TODO(jridgewell, #18574); Make sure error is always an object.


    if (error.message) {
      error.message += ' _reported_';
    }
  } else {
    data['f'] = filename || '';
    data['l'] = line || '';
    data['c'] = col || '';
  }

  data['r'] = self.document ? self.document.referrer : '';
  data['ae'] = accumulatedErrorMessages.join(',');
  data['fr'] = self.location.originalHash || self.location.hash;
  pushLimit(accumulatedErrorMessages, message, 25);
  return data;
}
/**
 * Returns true if it appears like there is non-AMP JS on the
 * current page.
 * @param {!Window} win
 * @return {boolean}
 * @visibleForTesting
 */


function detectNonAmpJs(win) {
  if (!win.document) {
    return false;
  }

  var scripts = win.document.querySelectorAll('script[src]');

  for (var i = 0; i < scripts.length; i++) {
    if (!(0, _url.isProxyOrigin)(scripts[i].src.toLowerCase())) {
      return true;
    }
  }

  return false;
}
/**
 * Resets accumulated error messages for testing
 */


function resetAccumulatedErrorMessagesForTesting() {
  accumulatedErrorMessages = [];
}
/**
 * Does a series of checks on the stack of an thrown error to determine the
 * JS engine that is currently running. This gives a bit more information than
 * just the UserAgent, since browsers often allow overriding it to "emulate"
 * mobile.
 * @return {string}
 * @visibleForTesting
 */


function detectJsEngineFromStack() {
  /** @constructor */
  function Fn() {}

  Fn.prototype.t = function () {
    throw new Error('message');
  };

  var object = new Fn();

  try {
    object.t();
  } catch (e) {
    var stack = e.stack; // Safari only mentions the method name.

    if ((0, _string.startsWith)(stack, 't@')) {
      return 'Safari';
    } // Firefox mentions "prototype".


    if (stack.indexOf('.prototype.t@') > -1) {
      return 'Firefox';
    } // IE looks like Chrome, but includes a context for the base stack line.
    // Explicitly, we're looking for something like:
    // "    at Global code (https://example.com/app.js:1:200)" or
    // "    at Anonymous function (https://example.com/app.js:1:200)"
    // vs Chrome which has:
    // "    at https://example.com/app.js:1:200"


    var last = stack.split('\n').pop();

    if (/\bat .* \(/i.test(last)) {
      return 'IE';
    } // Finally, chrome includes the error message in the stack.


    if ((0, _string.startsWith)(stack, 'Error: message')) {
      return 'Chrome';
    }
  }

  return 'unknown';
}
/**
 * @param {!Error} error
 * @param {!Window} win
 */


function reportErrorToAnalytics(error, win) {
  // Currently this can only be executed in a single-doc mode. Otherwise,
  // it's not clear which ampdoc the event would belong too.
  if (_services.Services.ampdocServiceFor(win).isSingleDoc()) {
    var vars = (0, _object.dict)({
      'errorName': error.name,
      'errorMessage': error.message
    });
    (0, _analytics.triggerAnalyticsEvent)(getRootElement_(win), 'user-error', vars);
  }
}
/**
 * @param {!Window} win
 * @return {!Element}
 * @private
 */


function getRootElement_(win) {
  var root = _services.Services.ampdocServiceFor(win).getSingleDoc().getRootNode();

  return (0, _log.dev)().assertElement(root.documentElement || root.body || root);
}

},{"./amp-events":21,"./analytics":22,"./config":24,"./event-helper":33,"./experiments":34,"./exponential-backoff":35,"./log":45,"./mode":47,"./services":53,"./string":55,"./style-installer":56,"./url":61,"./utils/object":67}],32:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.internalListenImplementation = internalListenImplementation;
exports.detectEvtListenerOptsSupport = detectEvtListenerOptsSupport;
exports.resetEvtListenerOptsSupportForTesting = resetEvtListenerOptsSupportForTesting;

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Whether addEventListener supports options or only takes capture as a boolean
 * @type {boolean|undefined}
 * @visibleForTesting
 */
var optsSupported;
/**
 * Listens for the specified event on the element.
 *
 * Do not use this directly. This method is implemented as a shared
 * dependency. Use `listen()` in either `event-helper` or `3p-frame-messaging`,
 * depending on your use case.
 *
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {Object=} opt_evtListenerOpts
 * @return {!UnlistenDef}
 */

function internalListenImplementation(element, eventType, listener, opt_evtListenerOpts) {
  var localElement = element;
  var localListener = listener;
  /**
   * @type {?Function}
   */

  var wrapped;

  wrapped = function wrapped(event) {
    try {
      return localListener(event);
    } catch (e) {
      // __AMP_REPORT_ERROR is installed globally per window in the entry point.
      self.__AMP_REPORT_ERROR(e);

      throw e;
    }
  };

  var optsSupported = detectEvtListenerOptsSupport();
  var capture = false;

  if (opt_evtListenerOpts) {
    capture = opt_evtListenerOpts.capture;
  }

  localElement.addEventListener(eventType, wrapped, optsSupported ? opt_evtListenerOpts : capture);
  return function () {
    if (localElement) {
      localElement.removeEventListener(eventType, wrapped, optsSupported ? opt_evtListenerOpts : capture);
    } // Ensure these are GC'd


    localListener = null;
    localElement = null;
    wrapped = null;
  };
}
/**
 * Tests whether the browser supports options as an argument of addEventListener
 * or not.
 *
 * @return {boolean}
 */


function detectEvtListenerOptsSupport() {
  // Only run the test once
  if (optsSupported !== undefined) {
    return optsSupported;
  }

  optsSupported = false;

  try {
    // Test whether browser supports EventListenerOptions or not
    var options = {
      get capture() {
        optsSupported = true;
      }

    };
    self.addEventListener('test-options', null, options);
    self.removeEventListener('test-options', null, options);
  } catch (err) {// EventListenerOptions are not supported
  }

  return optsSupported;
}
/**
 * Resets the test for whether addEventListener supports options or not.
 */


function resetEvtListenerOptsSupportForTesting() {
  optsSupported = undefined;
}

},{}],33:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.createCustomEvent = createCustomEvent;
exports.listen = listen;
exports.getData = getData;
exports.getDetail = getDetail;
exports.listenOnce = listenOnce;
exports.listenOncePromise = listenOncePromise;
exports.isLoaded = isLoaded;
exports.loadPromise = loadPromise;
exports.isLoadErrorMessage = isLoadErrorMessage;
exports.MEDIA_LOAD_FAILURE_SRC_PROPERTY = void 0;

var _eventHelperListen = require("./event-helper-listen");

var _dom = require("./dom");

var _log = require("./log");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const {string}  */
var LOAD_FAILURE_PREFIX = 'Failed to load:';
/** @const {string} */

var MEDIA_LOAD_FAILURE_SRC_PROPERTY = '__AMP_MEDIA_LOAD_FAILURE_SRC';
/**
 * Returns a CustomEvent with a given type and detail; supports fallback for IE.
 * @param {!Window} win
 * @param {string} type
 * @param {!JsonObject|string|undefined|null} detail
 * @param {EventInit=} opt_eventInit
 * @return {!Event}
 */

exports.MEDIA_LOAD_FAILURE_SRC_PROPERTY = MEDIA_LOAD_FAILURE_SRC_PROPERTY;

function createCustomEvent(win, type, detail, opt_eventInit) {
  var eventInit =
  /** @type {!CustomEventInit} */
  {
    detail: detail
  };
  Object.assign(eventInit, opt_eventInit); // win.CustomEvent is a function on Edge, Chrome, FF, Safari but
  // is an object on IE 11.

  if (typeof win.CustomEvent == 'function') {
    return new win.CustomEvent(type, eventInit);
  } else {
    // Deprecated fallback for IE.
    var e = win.document.createEvent('CustomEvent');
    e.initCustomEvent(type, !!eventInit.bubbles, !!eventInit.cancelable, detail);
    return e;
  }
}
/**
 * Listens for the specified event on the element.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {Object=} opt_evtListenerOpts
 * @return {!UnlistenDef}
 */


function listen(element, eventType, listener, opt_evtListenerOpts) {
  return (0, _eventHelperListen.internalListenImplementation)(element, eventType, listener, opt_evtListenerOpts);
}
/**
 * Returns the data property of an event with the correct type.
 * @param {!Event|{data: !JsonObject}} event
 * @return {?JsonObject|string|undefined}
 */


function getData(event) {
  return (
    /** @type {?JsonObject|string|undefined} */
    event.data
  );
}
/**
 * Returns the detail property of an event with the correct type.
 * @param {!Event|{detail: !JsonObject}} event
 * @return {?JsonObject|string|undefined}
 */


function getDetail(event) {
  return (
    /** @type {?JsonObject|string|undefined} */
    event.detail
  );
}
/**
 * Listens for the specified event on the element and removes the listener
 * as soon as event has been received.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {function(!Event)} listener
 * @param {Object=} opt_evtListenerOpts
 * @return {!UnlistenDef}
 */


function listenOnce(element, eventType, listener, opt_evtListenerOpts) {
  var localListener = listener;
  var unlisten = (0, _eventHelperListen.internalListenImplementation)(element, eventType, function (event) {
    try {
      localListener(event);
    } finally {
      // Ensure listener is GC'd
      localListener = null;
      unlisten();
    }
  }, opt_evtListenerOpts);
  return unlisten;
}
/**
 * Returns  a promise that will resolve as soon as the specified event has
 * fired on the element.
 * @param {!EventTarget} element
 * @param {string} eventType
 * @param {Object=} opt_evtListenerOpts
 * @param {function(!UnlistenDef)=} opt_cancel An optional function that, when
 *     provided, will be called with the unlistener. This gives the caller
 *     access to the unlistener, so it may be called manually when necessary.
 * @return {!Promise<!Event>}
 */


function listenOncePromise(element, eventType, opt_evtListenerOpts, opt_cancel) {
  var unlisten;
  var eventPromise = new Promise(function (resolve) {
    unlisten = listenOnce(element, eventType, resolve, opt_evtListenerOpts);
  });
  eventPromise.then(unlisten, unlisten);

  if (opt_cancel) {
    opt_cancel(unlisten);
  }

  return eventPromise;
}
/**
 * Whether the specified element/window has been loaded already.
 * @param {!Element|!Window} eleOrWindow
 * @return {boolean}
 */


function isLoaded(eleOrWindow) {
  return !!(eleOrWindow.complete || eleOrWindow.readyState == 'complete' || isHTMLMediaElement(eleOrWindow) && eleOrWindow.readyState > 0 || // If the passed in thing is a Window, infer loaded state from
  //
  eleOrWindow.document && eleOrWindow.document.readyState == 'complete');
}
/**
 * Returns a promise that will resolve or fail based on the eleOrWindow's 'load'
 * and 'error' events. Optionally this method takes a timeout, which will reject
 * the promise if the resource has not loaded by then.
 * @param {T} eleOrWindow Supports both Elements and as a special case Windows.
 * @return {!Promise<T>}
 * @template T
 */


function loadPromise(eleOrWindow) {
  var unlistenLoad;
  var unlistenError;

  if (isLoaded(eleOrWindow)) {
    return Promise.resolve(eleOrWindow);
  }

  var isMediaElement = isHTMLMediaElement(eleOrWindow);

  if (isMediaElement && eleOrWindow[MEDIA_LOAD_FAILURE_SRC_PROPERTY] === eleOrWindow.currentSrc) {
    return Promise.reject(eleOrWindow);
  }

  var loadingPromise = new Promise(function (resolve, reject) {
    // Listen once since IE 5/6/7 fire the onload event continuously for
    // animated GIFs.
    if (isMediaElement) {
      // The following event can be triggered by the media or one of its
      // sources. Using capture is required as the media events do not bubble.
      unlistenLoad = listenOnce(eleOrWindow, 'loadedmetadata', resolve, {
        capture: true
      });
    } else {
      unlistenLoad = listenOnce(eleOrWindow, 'load', resolve);
    } // Don't unlisten on error for Windows.


    if (!eleOrWindow.tagName) {
      return;
    }

    var errorTarget = eleOrWindow; // If the media element has no `src`, it will try to load the sources in
    // document order. If the last source errors, then the media element
    // loading errored.

    if (isMediaElement && !eleOrWindow.hasAttribute('src')) {
      errorTarget = (0, _dom.lastChildElement)(eleOrWindow, function (child) {
        return child.tagName === 'SOURCE';
      });

      if (!errorTarget) {
        return reject(new Error('Media has no source.'));
      }
    }

    unlistenError = listenOnce(errorTarget, 'error', reject);
  });
  return loadingPromise.then(function () {
    if (unlistenError) {
      unlistenError();
    }

    return eleOrWindow;
  }, function () {
    if (unlistenLoad) {
      unlistenLoad();
    }

    failedToLoad(eleOrWindow);
  });
}
/**
 * Emit error on load failure.
 * @param {!Element|!Window} eleOrWindow Supports both Elements and as a special
 *     case Windows.
 */


function failedToLoad(eleOrWindow) {
  // Mark the element as errored since some elements - like HTMLMediaElement
  // using HTMLSourceElement - do not provide any synchronous way to verify if
  // they already errored, even though the error event was already dispatched.
  if (isHTMLMediaElement(eleOrWindow)) {
    eleOrWindow[MEDIA_LOAD_FAILURE_SRC_PROPERTY] = eleOrWindow.currentSrc || true;
  } // Report failed loads as user errors so that they automatically go
  // into the "document error" bucket.


  var target = eleOrWindow;

  if (target && target.src) {
    target = target.src;
  }

  throw (0, _log.user)().createError(LOAD_FAILURE_PREFIX, target);
}
/**
 * Returns true if the parameter is a HTMLMediaElement.
 * @param {!Element|!Window} eleOrWindow
 * @return {boolean}
 */


function isHTMLMediaElement(eleOrWindow) {
  return eleOrWindow.tagName === 'AUDIO' || eleOrWindow.tagName === 'VIDEO';
}
/**
 * Returns true if this error message is was created for a load error.
 * @param {string} message An error message
 * @return {boolean}
 */


function isLoadErrorMessage(message) {
  return message.indexOf(LOAD_FAILURE_PREFIX) != -1;
}

},{"./dom":29,"./event-helper-listen":32,"./log":45}],34:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isCanary = isCanary;
exports.getBinaryType = getBinaryType;
exports.isExperimentOn = isExperimentOn;
exports.toggleExperiment = toggleExperiment;
exports.experimentToggles = experimentToggles;
exports.experimentTogglesOrNull = experimentTogglesOrNull;
exports.getExperimentTogglesForTesting = getExperimentTogglesForTesting;
exports.resetExperimentTogglesForTesting = resetExperimentTogglesForTesting;
exports.randomlySelectUnsetExperiments = randomlySelectUnsetExperiments;
exports.getExperimentBranch = getExperimentBranch;
exports.forceExperimentBranch = forceExperimentBranch;
exports.RANDOM_NUMBER_GENERATORS = exports.ExperimentInfo = void 0;

var _log = require("./log");

var _mode = require("./mode");

var _object = require("./utils/object");

var _url = require("./url");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Experiments system allows a developer to opt-in to test
 * features that are not yet fully tested.
 *
 * Experiments page: https://cdn.ampproject.org/experiments.html *
 */

/** @const {string} */
var TAG = 'EXPERIMENTS';
/** @const {string} */

var LOCAL_STORAGE_KEY = 'amp-experiment-toggles';
/** @const {string} */

var TOGGLES_WINDOW_PROPERTY = '__AMP__EXPERIMENT_TOGGLES';
/**
 * @typedef {{
 *   isTrafficEligible: function(!Window):boolean,
 *   branches: !Array<string>
 * }}
 */

var ExperimentInfo;
/**
 * Whether we are in canary.
 * @param {!Window} win
 * @return {boolean}
 */

exports.ExperimentInfo = ExperimentInfo;

function isCanary(win) {
  return !!(win.AMP_CONFIG && win.AMP_CONFIG.canary);
}
/**
 * Returns binary type, e.g., canary, production, control, or rc.
 * @param {!Window} win
 * @return {string}
 */


function getBinaryType(win) {
  return win.AMP_CONFIG && win.AMP_CONFIG.type ? win.AMP_CONFIG.type : 'unknown';
}
/**
 * Whether the specified experiment is on or off.
 * @param {!Window} win
 * @param {string} experimentId
 * @return {boolean}
 */


function isExperimentOn(win, experimentId) {
  var toggles = experimentToggles(win);
  return !!toggles[experimentId];
}
/**
 * Toggles the experiment on or off. Returns the actual value of the experiment
 * after toggling is done.
 * @param {!Window} win
 * @param {string} experimentId
 * @param {boolean=} opt_on
 * @param {boolean=} opt_transientExperiment  Whether to toggle the
 *     experiment state "transiently" (i.e., for this page load only) or
 *     durably (by saving the experiment IDs after toggling).
 *     Default: false (save durably).
 * @return {boolean} New state for experimentId.
 */


function toggleExperiment(win, experimentId, opt_on, opt_transientExperiment) {
  var currentlyOn = isExperimentOn(win,
  /*OK*/
  experimentId);
  var on = !!(opt_on !== undefined ? opt_on : !currentlyOn);

  if (on != currentlyOn) {
    var toggles = experimentToggles(win);
    toggles[experimentId] = on;

    if (!opt_transientExperiment) {
      var storedToggles = getExperimentToggles(win);
      storedToggles[experimentId] = on;
      saveExperimentToggles(win, storedToggles); // Avoid affecting tests that spy/stub warn().

      if (!(0, _mode.getMode)().test) {
        (0, _log.user)().warn(TAG, '"%s" experiment %s for the domain "%s". See: https://amp.dev/documentation/guides-and-tutorials/learn/experimental', experimentId, on ? 'enabled' : 'disabled', win.location.hostname);
      }
    }
  }

  return on;
}
/**
 * Calculate whether the experiment is on or off based off of its default value,
 * stored overriden value, or the global config frequency given.
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 */


function experimentToggles(win) {
  if (win[TOGGLES_WINDOW_PROPERTY]) {
    return win[TOGGLES_WINDOW_PROPERTY];
  }

  win[TOGGLES_WINDOW_PROPERTY] = Object.create(null);
  var toggles = win[TOGGLES_WINDOW_PROPERTY]; // Read the default config of this build.

  if (win.AMP_CONFIG) {
    for (var experimentId in win.AMP_CONFIG) {
      var frequency = win.AMP_CONFIG[experimentId];

      if (typeof frequency === 'number' && frequency >= 0 && frequency <= 1) {
        toggles[experimentId] = Math.random() < frequency;
      }
    }
  } // Read document level override from meta tag.


  if (win.AMP_CONFIG && Array.isArray(win.AMP_CONFIG['allow-doc-opt-in']) && win.AMP_CONFIG['allow-doc-opt-in'].length > 0) {
    var allowed = win.AMP_CONFIG['allow-doc-opt-in'];
    var meta = win.document.head.querySelector('meta[name="amp-experiments-opt-in"]');

    if (meta) {
      var optedInExperiments = meta.getAttribute('content').split(',');

      for (var i = 0; i < optedInExperiments.length; i++) {
        if (allowed.indexOf(optedInExperiments[i]) != -1) {
          toggles[optedInExperiments[i]] = true;
        }
      }
    }
  }

  Object.assign(toggles, getExperimentToggles(win));

  if (win.AMP_CONFIG && Array.isArray(win.AMP_CONFIG['allow-url-opt-in']) && win.AMP_CONFIG['allow-url-opt-in'].length > 0) {
    var _allowed = win.AMP_CONFIG['allow-url-opt-in'];
    var hash = win.location.originalHash || win.location.hash;
    var params = (0, _url.parseQueryString)(hash);

    for (var _i = 0; _i < _allowed.length; _i++) {
      var param = params["e-" + _allowed[_i]];

      if (param == '1') {
        toggles[_allowed[_i]] = true;
      }

      if (param == '0') {
        toggles[_allowed[_i]] = false;
      }
    }
  }

  return toggles;
}
/**
 * Returns the cached experiments toggles, or null if they have not been
 * computed yet.
 * @param {!Window} win
 * @return {Object<string, boolean>}
 */


function experimentTogglesOrNull(win) {
  return win[TOGGLES_WINDOW_PROPERTY] || null;
}
/**
 * Returns a set of experiment IDs currently on.
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 */


function getExperimentToggles(win) {
  var experimentsString = '';

  try {
    if ('localStorage' in win) {
      experimentsString = win.localStorage.getItem(LOCAL_STORAGE_KEY);
    }
  } catch (e) {
    (0, _log.dev)().warn(TAG, 'Failed to retrieve experiments from localStorage.');
  }

  var tokens = experimentsString ? experimentsString.split(/\s*,\s*/g) : [];
  var toggles = Object.create(null);

  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].length == 0) {
      continue;
    }

    if (tokens[i][0] == '-') {
      toggles[tokens[i].substr(1)] = false;
    } else {
      toggles[tokens[i]] = true;
    }
  }

  return toggles;
}
/**
 * Saves a set of experiment IDs currently on.
 * @param {!Window} win
 * @param {!Object<string, boolean>} toggles
 */


function saveExperimentToggles(win, toggles) {
  var experimentIds = [];

  for (var experiment in toggles) {
    experimentIds.push((toggles[experiment] === false ? '-' : '') + experiment);
  }

  try {
    if ('localStorage' in win) {
      win.localStorage.setItem(LOCAL_STORAGE_KEY, experimentIds.join(','));
    }
  } catch (e) {
    (0, _log.user)().error(TAG, 'Failed to save experiments to localStorage.');
  }
}
/**
 * See getExperimentToggles().
 * @param {!Window} win
 * @return {!Object<string, boolean>}
 * @visibleForTesting
 */


function getExperimentTogglesForTesting(win) {
  return getExperimentToggles(win);
}
/**
 * Resets the experimentsToggle cache for testing purposes.
 * @param {!Window} win
 * @visibleForTesting
 */


function resetExperimentTogglesForTesting(win) {
  saveExperimentToggles(win, {});
  win[TOGGLES_WINDOW_PROPERTY] = null;
}
/**
 * In some browser implementations of Math.random(), sequential calls of
 * Math.random() are correlated and can cause a bias.  In particular,
 * if the previous random() call was < 0.001 (as it will be if we select
 * into an experiment), the next value could be less than 0.5 more than
 * 50.7% of the time.  This provides an implementation that roots down into
 * the crypto API, when available, to produce less biased samples.
 *
 * @return {number} Pseudo-random floating-point value on the range [0, 1).
 */


function slowButAccuratePrng() {
  // TODO(tdrl): Implement.
  return Math.random();
}
/**
 * Container for alternate random number generator implementations.  This
 * allows us to set an "accurate" PRNG for branch selection, but to mock it
 * out easily in tests.
 *
 * @visibleForTesting
 * @const {!{accuratePrng: function():number}}
 */


var RANDOM_NUMBER_GENERATORS = {
  accuratePrng: slowButAccuratePrng
};
/**
 * Selects, uniformly at random, a single item from the array.
 * @param {!Array<string>} arr Object to select from.
 * @return {?string} Single item from arr or null if arr was empty.
 */

exports.RANDOM_NUMBER_GENERATORS = RANDOM_NUMBER_GENERATORS;

function selectRandomItem(arr) {
  var rn = RANDOM_NUMBER_GENERATORS.accuratePrng();
  return arr[Math.floor(rn * arr.length)] || null;
}
/**
 * Selects which page-level experiment branches are enabled. If a given
 * experiment name is already set (including to the null / no branches selected
 * state), this won't alter its state.
 *
 * Check whether a given experiment is set using isExperimentOn(win,
 * experimentName) and, if it is on, look for which branch is selected in
 * win.__AMP_EXPERIMENT_BRANCHES[experimentName].
 *
 * @param {!Window} win Window context on which to save experiment
 *     selection state.
 * @param {!Object<string, !ExperimentInfo>} experiments  Set of experiments to
 *     configure for this page load.
 * @return {!Object<string, string>} Map of experiment names to selected
 *     branches.
 */


function randomlySelectUnsetExperiments(win, experiments) {
  win.__AMP_EXPERIMENT_BRANCHES = win.__AMP_EXPERIMENT_BRANCHES || {};
  var selectedExperiments = {};

  for (var experimentName in experiments) {
    // Skip experimentName if it is not a key of experiments object or if it
    // has already been populated by some other property.
    if (!(0, _object.hasOwn)(experiments, experimentName)) {
      continue;
    }

    if ((0, _object.hasOwn)(win.__AMP_EXPERIMENT_BRANCHES, experimentName)) {
      selectedExperiments[experimentName] = win.__AMP_EXPERIMENT_BRANCHES[experimentName];
      continue;
    }

    if (!experiments[experimentName].isTrafficEligible || !experiments[experimentName].isTrafficEligible(win)) {
      win.__AMP_EXPERIMENT_BRANCHES[experimentName] = null;
      continue;
    } // If we're in the experiment, but we haven't already forced a specific
    // experiment branch (e.g., via a test setup), then randomize the branch
    // choice.


    if (!win.__AMP_EXPERIMENT_BRANCHES[experimentName] && isExperimentOn(win,
    /*OK*/
    experimentName)) {
      var branches = experiments[experimentName].branches;
      win.__AMP_EXPERIMENT_BRANCHES[experimentName] = selectRandomItem(branches);
      selectedExperiments[experimentName] = win.__AMP_EXPERIMENT_BRANCHES[experimentName];
    }
  }

  return selectedExperiments;
}
/**
 * Returns the experiment branch enabled for the given experiment ID.
 * For example, 'control' or 'experiment'.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @param {string} experimentName Name of the experiment to check.
 * @return {?string} Active experiment branch ID for experimentName (possibly
 *     null if experimentName has been tested but no branch was enabled).
 */


function getExperimentBranch(win, experimentName) {
  return win.__AMP_EXPERIMENT_BRANCHES ? win.__AMP_EXPERIMENT_BRANCHES[experimentName] : null;
}
/**
 * Force enable (or disable) a specific branch of a given experiment name.
 * Disables the experiment name altogether if branchId is falseish.
 *
 * @param {!Window} win Window context to check for experiment state.
 * @param {string} experimentName Name of the experiment to check.
 * @param {?string} branchId ID of branch to force or null to disable
 *     altogether.
 * @visibleForTesting
 */


function forceExperimentBranch(win, experimentName, branchId) {
  win.__AMP_EXPERIMENT_BRANCHES = win.__AMP_EXPERIMENT_BRANCHES || {};
  toggleExperiment(win, experimentName, !!branchId, true);
  win.__AMP_EXPERIMENT_BRANCHES[experimentName] = branchId;
}

},{"./log":45,"./mode":47,"./url":61,"./utils/object":67}],35:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.exponentialBackoff = exponentialBackoff;
exports.exponentialBackoffClock = exponentialBackoffClock;
exports.getJitter = getJitter;

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param {number=} opt_base Exponential base. Defaults to 2.
 * @return {function(function()): number} Function that when invoked will
 *     call the passed in function. On every invocation the next
 *     invocation of the passed in function will be exponentially
 *     later. Returned function returns timeout id.
 */
function exponentialBackoff(opt_base) {
  var getTimeout = exponentialBackoffClock(opt_base);
  return function (work) {
    return setTimeout(work, getTimeout());
  };
}
/**
 * @param {number=} opt_base Exponential base. Defaults to 2.
 * @return {function(): number} Function that when invoked will return
 *    a number that exponentially grows per invocation.
 */


function exponentialBackoffClock(opt_base) {
  var base = opt_base || 2;
  var count = 0;
  return function () {
    var wait = Math.pow(base, count++);
    wait += getJitter(wait);
    return wait * 1000;
  };
}
/**
 * Add jitter to avoid the thundering herd. This can e.g. happen when
 * we poll a backend and it fails for everyone at the same time.
 * We add up to 30% (default) longer or shorter than the given time.
 *
 * @param {number} wait the amount if base milliseconds
 * @param {number=} opt_perc the min/max percentage to add or sutract
 * @return {number}
 */


function getJitter(wait, opt_perc) {
  opt_perc = opt_perc || 0.3;
  var jitter = wait * opt_perc * Math.random();

  if (Math.random() > 0.5) {
    jitter *= -1;
  }

  return jitter;
}

},{}],36:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getHtml = getHtml;

var _string = require("./string");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @type {!Array<string>} */
var excludedTags = ['script', 'style'];
/** @type {!Array<string>} */

var allowedAmpTags = ['amp-accordion', 'amp-app-banner', 'amp-carousel', 'amp-fit-text', 'amp-form', 'amp-selector', 'amp-sidebar'];
/** @type {!Array<string>} */

var allowedAttributes = ['action', 'alt', 'class', 'disabled', 'height', 'href', 'id', 'name', 'placeholder', 'readonly', 'src', 'tabindex', 'title', 'type', 'value', 'width'];
/**
 * Returns content of HTML node
 * @param {!Window} win
 * @param {string} selector - CSS selector of the node to take content from
 * @param {!Array<string>} attrs - tag attributes to be left in the stringified
 * HTML
 * @return {string}
 */

function getHtml(win, selector, attrs) {
  var root = win.document.querySelector(selector);
  var result = [];

  if (root) {
    appendToResult(root, attrs, result);
  }

  return result.join('').replace(/\s{2,}/g, ' ');
}
/**
 * @param {!Element} node - node to take content from
 * @param {!Array<string>} attrs - tag attributes to be left in the stringified HTML
 * @param {!Array<string>} result
 */


function appendToResult(node, attrs, result) {
  var stack = [node];
  var allowedAttrs = attrs.filter(function (attr) {
    return allowedAttributes.includes(attr);
  });

  while (stack.length > 0) {
    node = stack.pop();

    if (typeof node === 'string') {
      result.push(node);
    } else if (node.nodeType === Node.TEXT_NODE) {
      result.push(node.textContent);
    } else if (node.nodeType === Node.ELEMENT_NODE && isApplicableNode(node)) {
      appendOpenTag(node, allowedAttrs, result);
      stack.push("</" + node.tagName.toLowerCase() + ">");

      for (var child = node.lastChild; child; child = child.previousSibling) {
        stack.push(child);
      }
    }
  }
}
/**
 *
 * @param {!Element} node
 * @return {boolean}
 */


function isApplicableNode(node) {
  var tagName = node.tagName.toLowerCase();

  if ((0, _string.startsWith)(tagName, 'amp-')) {
    return !!(allowedAmpTags.includes(tagName) && node.textContent);
  } else {
    return !!(!excludedTags.includes(tagName) && node.textContent);
  }
}
/**
 *
 * @param {!Element} node
 * @param {!Array<string>} attrs
 * @param {Array<string>} result
 */


function appendOpenTag(node, attrs, result) {
  result.push("<" + node.tagName.toLowerCase());
  attrs.forEach(function (attr) {
    if (node.hasAttribute(attr)) {
      result.push(" " + attr + "=\"" + node.getAttribute(attr) + "\"");
    }
  });
  result.push('>');
}

},{"./string":55}],37:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getContextMetadata = getContextMetadata;

var _domFingerprint = require("./utils/dom-fingerprint");

var _services = require("./services");

var _object = require("./utils/object.js");

var _experiments = require("./experiments");

var _layout = require("./layout");

var _modeObject = require("./mode-object");

var _internalVersion = require("./internal-version");

var _config = require("./config");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Produces the attributes for the ad template.
 * @param {!Window} parentWindow
 * @param {!AmpElement} element
 * @param {string} sentinel
 * @param {!JsonObject=} attributes
 * @return {!JsonObject}
 */
function getContextMetadata(parentWindow, element, sentinel, attributes) {
  var startTime = Date.now();
  var width = element.getAttribute('width');
  var height = element.getAttribute('height');
  attributes = attributes ? attributes : (0, _object.dict)();
  attributes['width'] = (0, _layout.getLengthNumeral)(width);
  attributes['height'] = (0, _layout.getLengthNumeral)(height);

  if (element.getAttribute('title')) {
    attributes['title'] = element.getAttribute('title');
  }

  var locationHref = parentWindow.location.href; // This is really only needed for tests, but whatever. Children
  // see us as the logical origin, so telling them we are about:srcdoc
  // will fail ancestor checks.

  if (locationHref == 'about:srcdoc') {
    locationHref = parentWindow.parent.location.href;
  }

  var ampdoc = _services.Services.ampdoc(element);

  var docInfo = _services.Services.documentInfoForDoc(element);

  var viewer = _services.Services.viewerForDoc(element);

  var referrer = viewer.getUnconfirmedReferrerUrl(); // TODO(alanorozco): Redesign data structure so that fields not exposed by
  // AmpContext are not part of this object.

  var layoutRect = element.getPageLayoutBox(); // Use JsonObject to preserve field names so that ampContext can access
  // values with name
  // ampcontext.js and this file are compiled in different compilation unit
  // Note: Field names can by perserved by using JsonObject, or by adding
  // perserved name to extern. We are doing both right now.
  // Please also add new introduced variable
  // name to the extern list.

  attributes['_context'] = (0, _object.dict)({
    'ampcontextVersion': (0, _internalVersion.internalRuntimeVersion)(),
    'ampcontextFilepath': _config.urls.thirdParty + "/" + (0, _internalVersion.internalRuntimeVersion)() + "/ampcontext-v0.js",
    'sourceUrl': docInfo.sourceUrl,
    'referrer': referrer,
    'canonicalUrl': docInfo.canonicalUrl,
    'pageViewId': docInfo.pageViewId,
    'location': {
      'href': locationHref
    },
    'startTime': startTime,
    'tagName': element.tagName,
    'mode': (0, _modeObject.getModeObject)(),
    'canary': (0, _experiments.isCanary)(parentWindow),
    'hidden': !ampdoc.isVisible(),
    'initialLayoutRect': layoutRect ? {
      'left': layoutRect.left,
      'top': layoutRect.top,
      'width': layoutRect.width,
      'height': layoutRect.height
    } : null,
    'initialIntersection': element.getIntersectionChangeEntry(),
    'domFingerprint': _domFingerprint.DomFingerprint.generate(element),
    'experimentToggles': (0, _experiments.experimentToggles)(parentWindow),
    'sentinel': sentinel
  });
  var adSrc = element.getAttribute('src');

  if (adSrc) {
    attributes['src'] = adSrc;
  }

  return attributes;
}

},{"./config":24,"./experiments":34,"./internal-version":40,"./layout":44,"./mode-object":46,"./services":53,"./utils/dom-fingerprint":63,"./utils/object.js":67}],38:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.listenFor = listenFor;
exports.listenForOncePromise = listenForOncePromise;
exports.postMessage = postMessage;
exports.postMessageToWindows = postMessageToWindows;
exports.parseIfNeeded = parseIfNeeded;
exports.looksLikeTrackingIframe = looksLikeTrackingIframe;
exports.isAdLike = isAdLike;
exports.disableScrollingOnIframe = disableScrollingOnIframe;
exports.canInspectWindow = canInspectWindow;
exports.getFriendlyIframeEmbedOptional = getFriendlyIframeEmbedOptional;
exports.isInFie = isInFie;
exports.makePausable = makePausable;
exports.isPausable = isPausable;
exports.setPaused = setPaused;
exports.FIE_EMBED_PROP = exports.SubscriptionApi = void 0;

var _dom = require("./dom");

var _pFrameMessaging = require("./3p-frame-messaging");

var _log = require("./log");

var _object = require("./utils/object");

var _eventHelper = require("./event-helper");

var _url = require("./url");

var _array = require("./utils/array");

var _style = require("./style");

var _json = require("./json");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Sentinel used to force unlistening after a iframe is detached.
 * @type {string}
 */
var UNLISTEN_SENTINEL = 'unlisten';
/**
 * The iframe feature policy that forces the iframe to pause when it's not
 * display.
 * See https://github.com/dtapuska/iframe-freeze.
 */

var EXECUTION_WHILE_NOT_RENDERED = 'execution-while-not-rendered';
/**
 * @typedef {{
 *   frame: !Element,
 *   events: !Object<string, !Array<function(!JsonObject)>>
 * }}
 */

var WindowEventsDef;
/**
 * Returns a mapping from a URL's origin to an array of windows and their
 * listenFor listeners.
 * @param {?Window} parentWin the window that created the iframe
 * @param {boolean=} opt_create create the mapping if it does not exist
 * @return {?Object<string, !Array<!WindowEventsDef>>}
 */

function getListenFors(parentWin, opt_create) {
  var listeningFors = parentWin.listeningFors;

  if (!listeningFors && opt_create) {
    listeningFors = parentWin.listeningFors = Object.create(null);
  }

  return listeningFors || null;
}
/**
 * Returns an array of WindowEventsDef that have had any listenFor listeners
 * registered for this sentinel.
 * @param {?Window} parentWin the window that created the iframe
 * @param {string} sentinel the sentinel of the message
 * @param {boolean=} opt_create create the array if it does not exist
 * @return {?Array<!WindowEventsDef>}
 */


function getListenForSentinel(parentWin, sentinel, opt_create) {
  var listeningFors = getListenFors(parentWin, opt_create);

  if (!listeningFors) {
    return listeningFors;
  }

  var listenSentinel = listeningFors[sentinel];

  if (!listenSentinel && opt_create) {
    listenSentinel = listeningFors[sentinel] = [];
  }

  return listenSentinel || null;
}
/**
 * Returns an mapping of event names to listenFor listeners.
 * @param {?Window} parentWin the window that created the iframe
 * @param {!Element} iframe the iframe element who's context will trigger the
 *     event
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {?Object<string, !Array<function(!JsonObject, !Window, string, !MessageEvent)>>}
 */


function getOrCreateListenForEvents(parentWin, iframe, opt_is3P) {
  var sentinel = getSentinel_(iframe, opt_is3P);
  var listenSentinel = getListenForSentinel(parentWin, sentinel, true);
  var windowEvents;

  for (var i = 0; i < listenSentinel.length; i++) {
    var we = listenSentinel[i];

    if (we.frame === iframe) {
      windowEvents = we;
      break;
    }
  }

  if (!windowEvents) {
    windowEvents = {
      frame: iframe,
      events: Object.create(null)
    };
    listenSentinel.push(windowEvents);
  }

  return windowEvents.events;
}
/**
 * Returns an mapping of event names to listenFor listeners.
 * @param {?Window} parentWin the window that created the iframe
 * @param {string} sentinel the sentinel of the message
 * @param {string} origin the source window's origin
 * @param {?Window} triggerWin the window that triggered the event
 * @return {?Object<string, !Array<function(!JsonObject, !Window, string, !MessageEvent)>>}
 */


function getListenForEvents(parentWin, sentinel, origin, triggerWin) {
  var listenSentinel = getListenForSentinel(parentWin, sentinel);

  if (!listenSentinel) {
    return listenSentinel;
  } // Find the entry for the frame.
  // TODO(@nekodo): Add a WeakMap<Window, WindowEventsDef> cache to
  //     speed up this process.


  var windowEvents;

  for (var i = 0; i < listenSentinel.length; i++) {
    var we = listenSentinel[i];
    var contentWindow = we.frame.contentWindow;

    if (!contentWindow) {
      setTimeout(dropListenSentinel, 0, listenSentinel);
    } else if (triggerWin == contentWindow || isDescendantWindow(contentWindow, triggerWin)) {
      // 3p code path, we may accept messages from nested frames.
      windowEvents = we;
      break;
    }
  }

  return windowEvents ? windowEvents.events : null;
}
/**
 * Checks whether one window is a descendant of another by climbing
 * the parent chain.
 * @param {?Window} ancestor potential ancestor window
 * @param {?Window} descendant potential descendant window
 * @return {boolean}
 */


function isDescendantWindow(ancestor, descendant) {
  for (var win = descendant; win && win != win.parent; win = win.parent) {
    if (win == ancestor) {
      return true;
    }
  }

  return false;
}
/**
 * Removes any listenFors registed on listenSentinel that do not have
 * a contentWindow (the frame was removed from the DOM tree).
 * @param {!Array<!WindowEventsDef>} listenSentinel
 */


function dropListenSentinel(listenSentinel) {
  var noopData = (0, _object.dict)({
    'sentinel': UNLISTEN_SENTINEL
  });

  for (var i = listenSentinel.length - 1; i >= 0; i--) {
    var windowEvents = listenSentinel[i];

    if (!windowEvents.frame.contentWindow) {
      listenSentinel.splice(i, 1);
      var events = windowEvents.events;

      for (var name in events) {
        // Splice here, so that each unlisten does not shift the array
        events[name].splice(0, Infinity).forEach(function (event) {
          event(noopData);
        });
      }
    }
  }
}
/**
 * Registers the global listenFor event listener if it has yet to be.
 * @param {?Window} parentWin
 */


function registerGlobalListenerIfNeeded(parentWin) {
  if (parentWin.listeningFors) {
    return;
  }

  var listenForListener = function listenForListener(event) {
    if (!(0, _eventHelper.getData)(event)) {
      return;
    }

    var data = parseIfNeeded((0, _eventHelper.getData)(event));

    if (!data || !data['sentinel']) {
      return;
    }

    var listenForEvents = getListenForEvents(parentWin, data['sentinel'], event.origin, event.source);

    if (!listenForEvents) {
      return;
    }

    var listeners = listenForEvents[data['type']];

    if (!listeners) {
      return;
    } // We slice to avoid issues with adding another listener or unlistening
    // during iteration. We could move to a Doubly Linked List with
    // backtracking, but that's overly complicated.


    listeners = listeners.slice();

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener(data, event.source, event.origin, event);
    }
  };

  parentWin.addEventListener('message', listenForListener);
}
/**
 * Allows listening for message from the iframe. Returns an unlisten
 * function to remove the listener.
 *
 * @param {?Element} iframe
 * @param {string} typeOfMessage
 * @param {?function(!JsonObject, !Window, string, !MessageEvent)} callback Called when a
 *     message of this type arrives for this iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @param {boolean=} opt_includingNestedWindows set to true if messages from
 *     nested frames should also be accepted.
 * @param {boolean=} opt_allowOpaqueOrigin set to true if messages from
       opaque origins (origin == null) are allowed.
 * @return {!UnlistenDef}
 */


function listenFor(iframe, typeOfMessage, callback, opt_is3P, opt_includingNestedWindows, opt_allowOpaqueOrigin) {
  (0, _log.devAssert)(iframe.src, 'only iframes with src supported');
  (0, _log.devAssert)(!iframe.parentNode, 'cannot register events on an attached ' + 'iframe. It will cause hair-pulling bugs like #2942');
  (0, _log.devAssert)(callback);
  var parentWin = iframe.ownerDocument.defaultView;
  registerGlobalListenerIfNeeded(parentWin);
  var listenForEvents = getOrCreateListenForEvents(parentWin, iframe, opt_is3P);
  var iframeOrigin = (0, _url.parseUrlDeprecated)(iframe.src).origin;
  var events = listenForEvents[typeOfMessage] || (listenForEvents[typeOfMessage] = []);
  var unlisten;

  var listener = function listener(data, source, origin, event) {
    var sentinel = data['sentinel']; // Exclude messages that don't satisfy amp sentinel rules.

    if (sentinel == 'amp') {
      // For `amp` sentinel, nested windows are not allowed
      if (source != iframe.contentWindow) {
        return;
      } // For `amp` sentinel origin must match unless opaque origin is allowed


      var isOpaqueAndAllowed = origin == 'null' && opt_allowOpaqueOrigin;

      if (iframeOrigin != origin && !isOpaqueAndAllowed) {
        return;
      }
    } // Exclude nested frames if necessary.
    // Note that the source was already verified to be either the contentWindow
    // of the iframe itself or a descendant window within it.


    if (!opt_includingNestedWindows && source != iframe.contentWindow) {
      return;
    }

    if (data.sentinel == UNLISTEN_SENTINEL) {
      unlisten();
      return;
    }

    callback(data, source, origin, event);
  };

  events.push(listener);
  return unlisten = function unlisten() {
    if (listener) {
      var index = events.indexOf(listener);

      if (index > -1) {
        events.splice(index, 1);
      } // Make sure references to the unlisten function do not keep
      // alive too much.


      listener = null;
      events = null;
      callback = null;
    }
  };
}
/**
 * Returns a promise that resolves when one of given messages has been observed
 * for the first time. And remove listener for all other messages.
 * @param {!Element} iframe
 * @param {string|!Array<string>} typeOfMessages
 * @param {boolean=} opt_is3P
 * @return {!Promise<!{data: !JsonObject, source: !Window, origin: string, event: !MessageEvent}>}
 */


function listenForOncePromise(iframe, typeOfMessages, opt_is3P) {
  var unlistenList = [];

  if (typeof typeOfMessages == 'string') {
    typeOfMessages = [typeOfMessages];
  }

  return new Promise(function (resolve) {
    for (var i = 0; i < typeOfMessages.length; i++) {
      var message = typeOfMessages[i];
      var unlisten = listenFor(iframe, message, function (data, source, origin, event) {
        for (var _i = 0; _i < unlistenList.length; _i++) {
          unlistenList[_i]();
        }

        resolve({
          data: data,
          source: source,
          origin: origin,
          event: event
        });
      }, opt_is3P);
      unlistenList.push(unlisten);
    }
  });
}
/**
 * Posts a message to the iframe.
 * @param {!Element} iframe The iframe.
 * @param {string} type Type of the message.
 * @param {!JsonObject} object Message payload.
 * @param {string} targetOrigin origin of the target.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 */


function postMessage(iframe, type, object, targetOrigin, opt_is3P) {
  postMessageToWindows(iframe, [{
    win: iframe.contentWindow,
    origin: targetOrigin
  }], type, object, opt_is3P);
}
/**
 * Posts an identical message to multiple target windows with the same
 * sentinel.
 * The message is serialized only once.
 * @param {!Element} iframe The iframe.
 * @param {!Array<{win: !Window, origin: string}>} targets to send the message
 *     to, pairs of window and its origin.
 * @param {string} type Type of the message.
 * @param {!JsonObject} object Message payload.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 */


function postMessageToWindows(iframe, targets, type, object, opt_is3P) {
  if (!iframe.contentWindow) {
    return;
  }

  object['type'] = type;
  object['sentinel'] = getSentinel_(iframe, opt_is3P);
  var payload = object;

  if (opt_is3P) {
    // Serialize ourselves because that is much faster in Chrome.
    payload = 'amp-' + JSON.stringify(object);
  }

  for (var i = 0; i < targets.length; i++) {
    var target = targets[i];
    target.win.
    /*OK*/
    postMessage(payload, target.origin);
  }
}
/**
 * Gets the sentinel string.
 * @param {!Element} iframe The iframe.
 * @param {boolean=} opt_is3P set to true if the iframe is 3p.
 * @return {string} Sentinel string.
 * @private
 */


function getSentinel_(iframe, opt_is3P) {
  return opt_is3P ? iframe.getAttribute('data-amp-3p-sentinel') : 'amp';
}
/**
 * JSON parses event.data if it needs to be
 * @param {*} data
 * @return {?JsonObject} object message
 * @private
 * @visibleForTesting
 */


function parseIfNeeded(data) {
  if (typeof data == 'string') {
    if (data.charAt(0) == '{') {
      data = (0, _json.tryParseJson)(data, function (e) {
        (0, _log.dev)().warn('IFRAME-HELPER', 'Postmessage could not be parsed. ' + 'Is it in a valid JSON format?', e);
      }) || null;
    } else if ((0, _pFrameMessaging.isAmpMessage)(data)) {
      data = (0, _pFrameMessaging.deserializeMessage)(data);
    } else {
      data = null;
    }
  }

  return (
    /** @type {?JsonObject} */
    data
  );
}
/**
 * Manages a postMessage API for an iframe with a subscription message and
 * a way to broadcast messages to all subscribed windows, which
 * in turn must all be descendants of the contentWindow of the iframe.
 */


var SubscriptionApi =
/*#__PURE__*/
function () {
  /**
   * @param {!Element} iframe The iframe.
   * @param {string} type Type of the subscription message.
   * @param {boolean} is3p set to true if the iframe is 3p.
   * @param {function(!JsonObject, !Window, string)} requestCallback Callback
   *     invoked whenever a new window subscribes.
   */
  function SubscriptionApi(iframe, type, is3p, requestCallback) {
    var _this = this;

    /** @private @const {!Element} */
    this.iframe_ = iframe;
    /** @private @const {boolean} */

    this.is3p_ = is3p;
    /** @private @const {!Array<{win: !Window, origin: string}>} */

    this.clientWindows_ = [];
    /** @private @const {!UnlistenDef} */

    this.unlisten_ = listenFor(this.iframe_, type, function (data, source, origin) {
      // This message might be from any window within the iframe, we need
      // to keep track of which windows want to be sent updates.
      if (!_this.clientWindows_.some(function (entry) {
        return entry.win == source;
      })) {
        _this.clientWindows_.push({
          win: source,
          origin: origin
        });
      }

      requestCallback(data, source, origin);
    }, this.is3p_, // For 3P frames we also allow nested frames within them to subscribe..
    this.is3p_
    /* opt_includingNestedWindows */
    );
  }
  /**
   * Sends a message to all subscribed windows.
   * @param {string} type Type of the message.
   * @param {!JsonObject} data Message payload.
   */


  var _proto = SubscriptionApi.prototype;

  _proto.send = function send(type, data) {
    // Remove clients that have been removed from the DOM.
    (0, _array.remove)(this.clientWindows_, function (client) {
      return !client.win.parent;
    });
    postMessageToWindows(this.iframe_, this.clientWindows_, type, data, this.is3p_);
  }
  /**
   * Destroys iframe.
   */
  ;

  _proto.destroy = function destroy() {
    this.unlisten_();
    this.clientWindows_.length = 0;
  };

  return SubscriptionApi;
}();
/**
 * @param {!Element} element
 * @return {boolean}
 */


exports.SubscriptionApi = SubscriptionApi;

function looksLikeTrackingIframe(element) {
  var box = element.getLayoutBox(); // This heuristic is subject to change.

  if (box.width > 10 || box.height > 10) {
    return false;
  } // Iframe is not tracking iframe if open with user interaction


  return !(0, _dom.closestAncestorElementBySelector)(element, '.i-amphtml-overlay');
} // Most common ad sizes
// Array of [width, height] pairs.


var adSizes = [[300, 250], [320, 50], [300, 50], [320, 100]];
/**
 * Guess whether this element might be an ad.
 * @param {!Element} element An amp-iframe element.
 * @return {boolean}
 * @visibleForTesting
 */

function isAdLike(element) {
  var box = element.getLayoutBox();
  var height = box.height,
      width = box.width;

  for (var i = 0; i < adSizes.length; i++) {
    var refWidth = adSizes[i][0];
    var refHeight = adSizes[i][1];

    if (refHeight > height) {
      continue;
    }

    if (refWidth > width) {
      continue;
    } // Fuzzy matching to account for padding.


    if (height - refHeight <= 20 && width - refWidth <= 20) {
      return true;
    }
  }

  return false;
}
/**
 * @param {!Element} iframe
 * @return {!Element}
 * @private
 */


function disableScrollingOnIframe(iframe) {
  (0, _dom.addAttributesToElement)(iframe, (0, _object.dict)({
    'scrolling': 'no'
  })); // This shouldn't work, but it does on Firefox.
  // https://stackoverflow.com/a/15494969

  (0, _style.setStyle)(iframe, 'overflow', 'hidden');
  return iframe;
}
/**
 * Returns true if win's properties can be accessed and win is defined.
 * This functioned is used to determine if a window is cross-domained
 * from the perspective of the current window.
 * @param {!Window} win
 * @return {boolean}
 * @private
 */


function canInspectWindow(win) {
  // TODO: this is not reliable.  The compiler assumes that property reads are
  // side-effect free.  The recommended fix is to use goog.reflect.sinkValue
  // but since we're not using the closure library I'm not sure how to do this.
  // See https://github.com/google/closure-compiler/issues/3156
  try {
    // win['test'] could be truthy but not true the compiler shouldn't be able
    // to optimize this check away.
    return !!win.location.href && (win['test'] || true);
  } catch (unusedErr) {
    // eslint-disable-line no-unused-vars
    return false;
  }
}
/** @const {string} */


var FIE_EMBED_PROP = '__AMP_EMBED__';
/**
 * Returns the embed created using `installFriendlyIframeEmbed` or `null`.
 * Caution: This will only return the FIE after the iframe has 'loaded'. If you
 * are checking before this signal you may be in a race condition that returns
 * null.
 * @param {!HTMLIFrameElement} iframe
 * @return {?./friendly-iframe-embed.FriendlyIframeEmbed}
 */

exports.FIE_EMBED_PROP = FIE_EMBED_PROP;

function getFriendlyIframeEmbedOptional(iframe) {
  return (
    /** @type {?./friendly-iframe-embed.FriendlyIframeEmbed} */
    iframe[FIE_EMBED_PROP]
  );
}
/**
 * @param {!Element} element
 * @return {boolean}
 */


function isInFie(element) {
  return element.classList.contains('i-amphtml-fie') || !!(0, _dom.closestAncestorElementBySelector)(element, '.i-amphtml-fie');
}
/**
 * @param {!HTMLIFrameElement} iframe
 */


function makePausable(iframe) {
  var oldAllow = (iframe.getAttribute('allow') || '').trim();
  iframe.setAttribute('allow', EXECUTION_WHILE_NOT_RENDERED + " 'none';" + oldAllow);
}
/**
 * @param {!HTMLIFrameElement} iframe
 * @return {boolean}
 */


function isPausable(iframe) {
  return !!iframe.featurePolicy && iframe.featurePolicy.features().indexOf(EXECUTION_WHILE_NOT_RENDERED) != -1 && !iframe.featurePolicy.allowsFeature(EXECUTION_WHILE_NOT_RENDERED);
}
/**
 * @param {!HTMLIFrameElement} iframe
 * @param {boolean} paused
 */


function setPaused(iframe, paused) {
  (0, _style.toggle)(iframe, !paused);
}

},{"./3p-frame-messaging":17,"./dom":29,"./event-helper":33,"./json":42,"./log":45,"./style":57,"./url":61,"./utils/array":62,"./utils/object":67}],39:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.whenContentIniLoad = whenContentIniLoad;
exports.getMeasuredResources = getMeasuredResources;

var _resourcesInterface = require("./service/resources-interface");

var _services = require("./services");

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const {!Array<string>} */
var EXCLUDE_INI_LOAD = ['AMP-AD', 'AMP-ANALYTICS', 'AMP-PIXEL', 'AMP-AD-EXIT'];
/**
 * Returns the promise that will be resolved when all content elements
 * have been loaded in the initially visible set.
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {!Window} hostWin
 * @param {!./layout-rect.LayoutRectDef} rect
 * @param {boolean=} opt_isInPrerender signifies if we are in prerender mode.
 * @return {!Promise}
 */

function whenContentIniLoad(elementOrAmpDoc, hostWin, rect, opt_isInPrerender) {
  var ampdoc = _services.Services.ampdoc(elementOrAmpDoc);

  return getMeasuredResources(ampdoc, hostWin, function (r) {
    // TODO(jridgewell): Remove isFixed check here once the position
    // is calculted correctly in a separate layer for embeds.
    if (!r.isDisplayed() || !r.overlaps(rect) && !r.isFixed() || opt_isInPrerender && !r.prerenderAllowed()) {
      return false;
    }

    return true;
  }).then(function (resources) {
    var promises = [];
    resources.forEach(function (r) {
      if (!EXCLUDE_INI_LOAD.includes(r.element.tagName)) {
        promises.push(r.loadedOnce());
      }
    });
    return Promise.all(promises);
  });
}
/**
 * Returns a subset of resources which are (1) belong to the specified host
 * window, and (2) meet the filterFn given.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Window} hostWin
 * @param {function(!./service/resource.Resource):boolean} filterFn
 * @return {!Promise<!Array<!./service/resource.Resource>>}
 */


function getMeasuredResources(ampdoc, hostWin, filterFn) {
  // First, wait for the `ready-scan` signal. Waiting for each element
  // individually is too expensive and `ready-scan` will cover most of
  // the initially parsed elements.
  // TODO(jridgewell): this path should be switched to use a future
  // "layer has been measured" signal.
  return ampdoc.signals().whenSignal(_resourcesInterface.READY_SCAN_SIGNAL).then(function () {
    // Second, wait for any left-over elements to complete measuring.
    var measurePromiseArray = [];

    var resources = _services.Services.resourcesForDoc(ampdoc);

    resources.get().forEach(function (r) {
      if (!r.hasBeenMeasured() && r.hostWin == hostWin && !r.hasOwner()) {
        measurePromiseArray.push(r.getPageLayoutBoxAsync());
      }
    });
    return Promise.all(measurePromiseArray);
  }).then(function () {
    var resources = _services.Services.resourcesForDoc(ampdoc);

    return resources.get().filter(function (r) {
      return r.hostWin == hostWin && !r.hasOwner() && r.hasBeenMeasured() && filterFn(r);
    });
  });
}

},{"./service/resources-interface":51,"./services":53}],40:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.internalRuntimeVersion = internalRuntimeVersion;

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns the internal AMP runtime version. Note that this is not the RTV,
 * which is a prefix and the runtime version.
 *
 * The call sites for this function are replaced with a compile time constant
 * string.
 *
 * @return {string}
 */
function internalRuntimeVersion() {
  return '1910151804560';
}

},{}],41:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getIntersectionChangeEntry = getIntersectionChangeEntry;
exports.IntersectionObserver = exports.DOMRect = void 0;

var _services = require("./services");

var _iframeHelper = require("./iframe-helper");

var _log = require("./log");

var _object = require("./utils/object");

var _layoutRect = require("./layout-rect");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The structure that defines the rectangle used in intersection observers.
 *
 * @typedef {{
 *   top: number,
 *   bottom: number,
 *   left: number,
 *   right: number,
 *   width: number,
 *   height: number,
 *   x: number,
 *   y: number,
 * }}
 */
var DOMRect;
/**
 * Returns the ratio of the smaller box's area to the larger box's area.
 * @param {!./layout-rect.LayoutRectDef} smaller
 * @param {!./layout-rect.LayoutRectDef} larger
 * @return {number}
 */

exports.DOMRect = DOMRect;

function intersectionRatio(smaller, larger) {
  return smaller.width * smaller.height / (larger.width * larger.height);
}
/**
 * Produces a change entry for that should be compatible with
 * IntersectionObserverEntry.
 *
 * Mutates passed in rootBounds to have x and y according to spec.
 *
 * @param {!./layout-rect.LayoutRectDef} element The element's layout rectangle
 * @param {?./layout-rect.LayoutRectDef} owner The owner's layout rect, if
 *     there is an owner.
 * @param {!./layout-rect.LayoutRectDef} viewport The viewport's layout rect.
 * @return {!IntersectionObserverEntry} A change entry.
 * @private
 */


function getIntersectionChangeEntry(element, owner, viewport) {
  (0, _log.devAssert)(element.width >= 0 && element.height >= 0, 'Negative dimensions in element.'); // Building an IntersectionObserverEntry.

  var intersectionRect = element;

  if (owner) {
    intersectionRect = (0, _layoutRect.rectIntersection)(owner, element) || // No intersection.
    (0, _layoutRect.layoutRectLtwh)(0, 0, 0, 0);
  }

  intersectionRect = (0, _layoutRect.rectIntersection)(viewport, intersectionRect) || // No intersection.
  (0, _layoutRect.layoutRectLtwh)(0, 0, 0, 0); // The element is relative to (0, 0), while the viewport moves. So, we must
  // adjust.

  var boundingClientRect = (0, _layoutRect.moveLayoutRect)(element, -viewport.left, -viewport.top);
  intersectionRect = (0, _layoutRect.moveLayoutRect)(intersectionRect, -viewport.left, -viewport.top); // Now, move the viewport to (0, 0)

  var rootBounds = (0, _layoutRect.moveLayoutRect)(viewport, -viewport.left, -viewport.top);
  return (
    /** @type {!IntersectionObserverEntry} */
    {
      time: Date.now(),
      rootBounds: rootBounds,
      boundingClientRect: boundingClientRect,
      intersectionRect: intersectionRect,
      intersectionRatio: intersectionRatio(intersectionRect, element)
    }
  );
}
/**
 * The IntersectionObserver class lets any element share its viewport
 * intersection data with an iframe of its choice (most likely contained within
 * the element itself.). When instantiated the class will start listening for a
 * 'send-intersections' postMessage from the iframe, and only then  would start
 * sending intersection data to the iframe. The intersection data would be sent
 * when the element is moved inside or outside the viewport as well as on scroll
 * and resize. The element should create an IntersectionObserver instance once
 * the Iframe element is created. The IntersectionObserver class exposes a
 * `fire` method that would send the intersection data to the iframe. The
 * IntersectionObserver class exposes a `onViewportCallback` method that should
 * be called inside if the viewportCallback of the element. This would let the
 * element sent intersection data automatically when there element comes inside
 * or goes outside the viewport and also manage sending intersection data
 * onscroll and resize. Note: The IntersectionObserver would not send any data
 * over to the iframe if it had not requested the intersection data already via
 * a postMessage.
 */


var IntersectionObserver =
/*#__PURE__*/
function () {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} iframe Iframe element which requested the
   *     intersection data.
   * @param {?boolean} opt_is3p Set to `true` when the iframe is 3'rd party.
   */
  function IntersectionObserver(baseElement, iframe, opt_is3p) {
    var _this = this;

    /** @private @const {!AMP.BaseElement} */
    this.baseElement_ = baseElement;
    /** @private @const {!./service/timer-impl.Timer} */

    this.timer_ = _services.Services.timerFor(baseElement.win);
    /** @private {boolean} */

    this.shouldSendIntersectionChanges_ = false;
    /** @private {boolean} */

    this.inViewport_ = false;
    /** @private {!Array<!IntersectionObserverEntry>} */

    this.pendingChanges_ = [];
    /** @private {number|string} */

    this.flushTimeout_ = 0;
    /** @private @const {function()} */

    this.boundFlush_ = this.flush_.bind(this);
    /**
     * An object which handles tracking subscribers to the
     * intersection updates for this element.
     * Triggered by context.observeIntersection(…) inside the ad/iframe
     * or by directly posting a send-intersections message.
     * @private {!SubscriptionApi}
     */

    this.postMessageApi_ = new _iframeHelper.SubscriptionApi(iframe, 'send-intersections', opt_is3p || false, // Each time someone subscribes we make sure that they
    // get an update.
    function () {
      return _this.startSendingIntersectionChanges_();
    });
    /** @private {?Function} */

    this.unlistenViewportChanges_ = null;
  }
  /**
   * Fires element intersection
   */


  var _proto = IntersectionObserver.prototype;

  _proto.fire = function fire() {
    this.sendElementIntersection_();
  }
  /**
   * Check if we need to unlisten when moving out of viewport,
   * unlisten and reset unlistenViewportChanges_.
   * @private
   */
  ;

  _proto.unlistenOnOutViewport_ = function unlistenOnOutViewport_() {
    if (this.unlistenViewportChanges_) {
      this.unlistenViewportChanges_();
      this.unlistenViewportChanges_ = null;
    }
  }
  /**
   * Called via postMessage from the child iframe when the ad/iframe starts
   * observing its position in the viewport.
   * Sets a flag, measures the iframe position if necessary and sends
   * one change record to the iframe.
   * Note that this method may be called more than once if a single ad
   * has multiple parties interested in viewability data.
   * @private
   */
  ;

  _proto.startSendingIntersectionChanges_ = function startSendingIntersectionChanges_() {
    var _this2 = this;

    this.shouldSendIntersectionChanges_ = true;
    this.baseElement_.getVsync().measure(function () {
      if (_this2.baseElement_.isInViewport()) {
        _this2.onViewportCallback(true);
      }

      _this2.fire();
    });
  }
  /**
   * Triggered by the AmpElement to when it either enters or exits the visible
   * viewport.
   * @param {boolean} inViewport true if the element is in viewport.
   */
  ;

  _proto.onViewportCallback = function onViewportCallback(inViewport) {
    if (this.inViewport_ == inViewport) {
      return;
    }

    this.inViewport_ = inViewport; // Lets the ad know that it became visible or no longer is.

    this.fire(); // And update the ad about its position in the viewport while
    // it is visible.

    if (inViewport) {
      var send = this.fire.bind(this); // Scroll events.

      var unlistenScroll = this.baseElement_.getViewport().onScroll(send); // Throttled scroll events. Also fires for resize events.

      var unlistenChanged = this.baseElement_.getViewport().onChanged(send);

      this.unlistenViewportChanges_ = function () {
        unlistenScroll();
        unlistenChanged();
      };
    } else {
      this.unlistenOnOutViewport_();
    }
  }
  /**
   * Sends 'intersection' message to ad/iframe with intersection change records
   * if this has been activated and we measured the layout box of the iframe
   * at least once.
   * @private
   */
  ;

  _proto.sendElementIntersection_ = function sendElementIntersection_() {
    if (!this.shouldSendIntersectionChanges_) {
      return;
    }

    var change = this.baseElement_.element.getIntersectionChangeEntry();

    if (this.pendingChanges_.length > 0 && this.pendingChanges_[this.pendingChanges_.length - 1].time == change.time) {
      return;
    }

    this.pendingChanges_.push(change);

    if (!this.flushTimeout_) {
      // Send one immediately, …
      this.flush_(); // but only send a maximum of 10 postMessages per second.

      this.flushTimeout_ = this.timer_.delay(this.boundFlush_, 100);
    }
  }
  /**
   * @private
   */
  ;

  _proto.flush_ = function flush_() {
    // TODO(zhouyx): One potential place to check if element is still in doc.
    this.flushTimeout_ = 0;

    if (!this.pendingChanges_.length) {
      return;
    } // Note that SubscribeApi multicasts the update to all interested windows.


    this.postMessageApi_.send('intersection', (0, _object.dict)({
      'changes': this.pendingChanges_
    }));
    this.pendingChanges_.length = 0;
  }
  /**
   * Provide a function to clear timeout before set this intersection to null.
   */
  ;

  _proto.destroy = function destroy() {
    this.timer_.cancel(this.flushTimeout_);
    this.unlistenOnOutViewport_();
    this.postMessageApi_.destroy();
  };

  return IntersectionObserver;
}();

exports.IntersectionObserver = IntersectionObserver;

},{"./iframe-helper":38,"./layout-rect":43,"./log":45,"./services":53,"./utils/object":67}],42:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.recreateNonProtoObject = recreateNonProtoObject;
exports.getValueForExpr = getValueForExpr;
exports.parseJson = parseJson;
exports.tryParseJson = tryParseJson;
exports.getChildJsonConfig = getChildJsonConfig;
exports.deepEquals = deepEquals;
exports.jsonConfiguration = jsonConfiguration;
exports.jsonLiteral = jsonLiteral;
exports.includeJsonLiteral = includeJsonLiteral;

var _dom = require("./dom");

var _types = require("./types");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview This module declares JSON types as defined in the
 * {@link http://json.org/}.
 */
// NOTE Type are changed to {*} because of
// https://github.com/google/closure-compiler/issues/1999

/**
 * JSON scalar. It's either string, number or boolean.
 * @typedef {*} should be string|number|boolean|null
 */
var JSONScalarDef;
/**
 * JSON object. It's a map with string keys and JSON values.
 * @typedef {*} should be !Object<string, ?JSONValueDef>
 */

var JSONObjectDef;
/**
 * JSON array. It's an array with JSON values.
 * @typedef {*} should be !Array<?JSONValueDef>
 */

var JSONArrayDef;
/**
 * JSON value. It's either a scalar, an object or an array.
 * @typedef {*} should be !JSONScalarDef|!JSONObjectDef|!JSONArrayDef
 */

var JSONValueDef;
/**
 * Recreates objects with prototype-less copies.
 * @param {!JsonObject} obj
 * @return {!JsonObject}
 */

function recreateNonProtoObject(obj) {
  var copy = Object.create(null);

  for (var k in obj) {
    if (!hasOwnProperty(obj, k)) {
      continue;
    }

    var v = obj[k];
    copy[k] = (0, _types.isObject)(v) ? recreateNonProtoObject(v) : v;
  }

  return (
    /** @type {!JsonObject} */
    copy
  );
}
/**
 * Returns a value from an object for a field-based expression. The expression
 * is a simple nested dot-notation of fields, such as `field1.field2`. If any
 * field in a chain does not exist or is not an object or array, the returned
 * value will be `undefined`.
 *
 * @param {!JsonObject} obj
 * @param {string} expr
 * @return {*}
 */


function getValueForExpr(obj, expr) {
  // The `.` indicates "the object itself".
  if (expr == '.') {
    return obj;
  } // Otherwise, navigate via properties.


  var parts = expr.split('.');
  var value = obj;

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];

    if (part && value && value[part] !== undefined && hasOwnProperty(value, part)) {
      value = value[part];
      continue;
    }

    value = undefined;
    break;
  }

  return value;
}
/**
 * Simple wrapper around JSON.parse that casts the return value
 * to JsonObject.
 * Create a new wrapper if an array return value is desired.
 * @param {*} json JSON string to parse
 * @return {?JsonObject} May be extend to parse arrays.
 */


function parseJson(json) {
  return (
    /** @type {?JsonObject} */
    JSON.parse(
    /** @type {string} */
    json)
  );
}
/**
 * Parses the given `json` string without throwing an exception if not valid.
 * Returns `undefined` if parsing fails.
 * Returns the `Object` corresponding to the JSON string when parsing succeeds.
 * @param {*} json JSON string to parse
 * @param {function(!Error)=} opt_onFailed Optional function that will be called
 *     with the error if parsing fails.
 * @return {?JsonObject} May be extend to parse arrays.
 */


function tryParseJson(json, opt_onFailed) {
  try {
    return parseJson(json);
  } catch (e) {
    if (opt_onFailed) {
      opt_onFailed(e);
    }

    return null;
  }
}
/**
 * Helper method to get the json config from an element <script> tag
 * @param {!Element} element
 * @return {?JsonObject}
 * @throws {!Error} If element does not have exactly one <script> child
 * with type="application/json", or if the <script> contents are not valid JSON.
 */


function getChildJsonConfig(element) {
  var scripts = (0, _dom.childElementsByTag)(element, 'script');
  var n = scripts.length;

  if (n !== 1) {
    throw new Error("Found " + scripts.length + " <script> children. Expected 1.");
  }

  var script = scripts[0];

  if (!(0, _dom.isJsonScriptTag)(script)) {
    throw new Error('<script> child must have type="application/json"');
  }

  try {
    return parseJson(script.textContent);
  } catch (unusedError) {
    throw new Error('Failed to parse <script> contents. Is it valid JSON?');
  }
}
/**
 * Deeply checks strict equality of items in nested arrays and objects.
 *
 * @param {JSONValueDef} a
 * @param {JSONValueDef} b
 * @param {number} depth The maximum depth. Must be finite.
 * @return {boolean}
 * @throws {Error} If depth argument is not finite.
 */


function deepEquals(a, b, depth) {
  if (depth === void 0) {
    depth = 5;
  }

  if (!isFinite(depth) || depth < 0) {
    throw new Error('Invalid depth: ' + depth);
  }

  if (a === b) {
    return true;
  }
  /** @type {!Array<{a: JSONValueDef, b: JSONValueDef, depth: number}>} */


  var queue = [{
    a: a,
    b: b,
    depth: depth
  }];

  while (queue.length > 0) {
    var _queue$shift = queue.shift(),
        _a = _queue$shift.a,
        _b = _queue$shift.b,
        _depth = _queue$shift.depth; // Only check deep equality if depth > 0.


    if (_depth > 0) {
      if (typeof _a !== typeof _b) {
        return false;
      } else if (Array.isArray(_a) && Array.isArray(_b)) {
        if (_a.length !== _b.length) {
          return false;
        }

        for (var i = 0; i < _a.length; i++) {
          queue.push({
            a: _a[i],
            b: _b[i],
            depth: _depth - 1
          });
        }

        continue;
      } else if (_a && _b && typeof _a === 'object' && typeof _b === 'object') {
        var keysA = Object.keys(
        /** @type {!Object} */
        _a);
        var keysB = Object.keys(
        /** @type {!Object} */
        _b);

        if (keysA.length !== keysB.length) {
          return false;
        }

        for (var _i = 0; _i < keysA.length; _i++) {
          var k = keysA[_i];
          queue.push({
            a: _a[k],
            b: _b[k],
            depth: _depth - 1
          });
        }

        continue;
      }
    } // If we get here, then depth == 0 or (a, b) are primitives.


    if (_a !== _b) {
      return false;
    }
  }

  return true;
}
/**
 * @param {*} obj
 * @param {string} key
 * @return {boolean}
 */


function hasOwnProperty(obj, key) {
  if (obj == null || typeof obj != 'object') {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(
  /** @type {!Object} */
  obj, key);
}
/**
 * This helper function handles configurations specified in a JSON format.
 *
 * It allows the configuration is to be written in plain JS (which has better
 * dev ergonomics like comments and trailing commas), and allows the
 * configuration to be transformed into an efficient JSON-parsed representation
 * in the dist build. See https://v8.dev/blog/cost-of-javascript-2019#json
 *
 * @param {!Object} obj
 * @return {!JsonObject}
 */


function jsonConfiguration(obj) {
  return (
    /** @type {!JsonObject} */
    obj
  );
}
/**
 * This converts an Object into a suitable type to be used in `includeJsonLiteral`.
 * This doesn't actually do any conversion, it only changes the closure type.
 *
 * @param {!Object|!Array|string|number|boolean|null} value
 * @return {!InternalJsonLiteralTypeDef}
 */


function jsonLiteral(value) {
  return (
    /** @type {!InternalJsonLiteralTypeDef} */
    value
  );
}
/**
 * Allows inclusion of a variable (that's wrapped in a jsonLiteral
 * call) to be included inside a jsonConfiguration.
 *
 * @param {!InternalJsonLiteralTypeDef} value
 * @return {*}
 */


function includeJsonLiteral(value) {
  return value;
}

},{"./dom":29,"./types":58}],43:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.layoutRectLtwh = layoutRectLtwh;
exports.layoutRectFromDomRect = layoutRectFromDomRect;
exports.layoutRectsOverlap = layoutRectsOverlap;
exports.rectIntersection = rectIntersection;
exports.layoutRectsRelativePos = layoutRectsRelativePos;
exports.layoutPositionRelativeToScrolledViewport = layoutPositionRelativeToScrolledViewport;
exports.expandLayoutRect = expandLayoutRect;
exports.moveLayoutRect = moveLayoutRect;
exports.areMarginsChanged = areMarginsChanged;
exports.layoutRectSizeEquals = layoutRectSizeEquals;
exports.layoutRectEquals = layoutRectEquals;
exports.cloneLayoutMarginsChangeDef = cloneLayoutMarginsChangeDef;
exports.RelativePositions = exports.LayoutMarginsChangeDef = exports.LayoutMarginsDef = exports.LayoutRectDef = void 0;

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The structure that combines position and size for an element. The exact
 * interpretation of position and size depends on the use case.
 *
 * @typedef {{
 *   top: number,
 *   bottom: number,
 *   left: number,
 *   right: number,
 *   width: number,
 *   height: number,
 *   x: number,
 *   y: number
 * }}
 */
var LayoutRectDef;
/**
 * The structure that represents the margins of an Element.
 *
 * @typedef {{
 *   top: number,
 *   right: number,
 *   bottom: number,
 *   left: number
 * }}
 */

exports.LayoutRectDef = LayoutRectDef;
var LayoutMarginsDef;
/**
 * The structure that represents a requested change to the margins of an
 * Element. Any new values specified will replace existing ones (rather than
 * being additive).
 *
 * @typedef {{
 *   top: (number|undefined),
 *   right: (number|undefined),
 *   bottom: (number|undefined),
 *   left: (number|undefined)
 * }}
 */

exports.LayoutMarginsDef = LayoutMarginsDef;
var LayoutMarginsChangeDef;
/**
 * RelativePositions
 *
 * Describes the relative position of an element to another (whether the
 * first is inside the second, on top of the second or on the bottom
 * @enum {string}
 */

exports.LayoutMarginsChangeDef = LayoutMarginsChangeDef;
var RelativePositions = {
  INSIDE: 'inside',
  TOP: 'top',
  BOTTOM: 'bottom'
};
/**
 * Creates a layout rect based on the left, top, width and height parameters
 * in that order.
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 * @return {!LayoutRectDef}
 */

exports.RelativePositions = RelativePositions;

function layoutRectLtwh(left, top, width, height) {
  return {
    left: left,
    top: top,
    width: width,
    height: height,
    bottom: top + height,
    right: left + width,
    x: left,
    y: top
  };
}
/**
 * Creates a layout rect based on the DOMRect, e.g. obtained from calling
 * getBoundingClientRect.
 * @param {!ClientRect} rect
 * @return {!LayoutRectDef}
 */


function layoutRectFromDomRect(rect) {
  return layoutRectLtwh(Number(rect.left), Number(rect.top), Number(rect.width), Number(rect.height));
}
/**
 * Returns true if the specified two rects overlap by a single pixel.
 * @param {!LayoutRectDef} r1
 * @param {!LayoutRectDef} r2
 * @return {boolean}
 */


function layoutRectsOverlap(r1, r2) {
  return r1.top <= r2.bottom && r2.top <= r1.bottom && r1.left <= r2.right && r2.left <= r1.right;
}
/**
 * Returns the intersection between a, b or null if there is none.
 * @param {...?LayoutRectDef|undefined} var_args
 * @return {?LayoutRectDef}
 */


function rectIntersection(var_args) {
  var x0 = -Infinity;
  var x1 = Infinity;
  var y0 = -Infinity;
  var y1 = Infinity;

  for (var i = 0; i < arguments.length; i++) {
    var current = arguments[i];

    if (!current) {
      continue;
    }

    x0 = Math.max(x0, current.left);
    x1 = Math.min(x1, current.left + current.width);
    y0 = Math.max(y0, current.top);
    y1 = Math.min(y1, current.top + current.height);

    if (x1 < x0 || y1 < y0) {
      return null;
    }
  }

  if (x1 == Infinity) {
    return null;
  }

  return layoutRectLtwh(x0, y0, x1 - x0, y1 - y0);
}
/**
 * Returns the position of r2 relative to r1
 * @param {!LayoutRectDef} r1
 * @param {!LayoutRectDef} r2
 * @return {RelativePositions}
 */


function layoutRectsRelativePos(r1, r2) {
  if (r1.top < r2.top) {
    return RelativePositions.TOP;
  } else if (r1.bottom > r2.bottom) {
    return RelativePositions.BOTTOM;
  } else {
    return RelativePositions.INSIDE;
  }
}
/**
 * Determines if any portion of a layoutBox would be onscreen in the given
 * viewport, when scrolled to the specified position.
 * @param {!LayoutRectDef} layoutBox
 * @param {!./service/viewport/viewport-interface.ViewportInterface} viewport
 * @param {number} scrollPos
 * @return {RelativePositions}
 */


function layoutPositionRelativeToScrolledViewport(layoutBox, viewport, scrollPos) {
  var scrollLayoutBox = layoutRectFromDomRect(
  /** @type {!ClientRect} */
  {
    top: scrollPos,
    bottom: scrollPos + viewport.getHeight(),
    left: 0,
    right: viewport.getWidth()
  });

  if (layoutRectsOverlap(layoutBox, scrollLayoutBox)) {
    return RelativePositions.INSIDE;
  } else {
    return layoutRectsRelativePos(layoutBox, scrollLayoutBox);
  }
}
/**
 * Expand the layout rect using multiples of width and height.
 * @param {!LayoutRectDef} rect Original rect.
 * @param {number} dw Expansion in width, specified as a multiple of width.
 * @param {number} dh Expansion in height, specified as a multiple of height.
 * @return {!LayoutRectDef}
 */


function expandLayoutRect(rect, dw, dh) {
  return layoutRectLtwh(rect.left - rect.width * dw, rect.top - rect.height * dh, rect.width * (1 + dw * 2), rect.height * (1 + dh * 2));
}
/**
 * Moves the layout rect using dx and dy.
 * @param {!LayoutRectDef} rect Original rect.
 * @param {number} dx Move horizontally with this value.
 * @param {number} dy Move vertically with this value.
 * @return {!LayoutRectDef}
 */


function moveLayoutRect(rect, dx, dy) {
  if (dx == 0 && dy == 0 || rect.width == 0 && rect.height == 0) {
    return rect;
  }

  return layoutRectLtwh(rect.left + dx, rect.top + dy, rect.width, rect.height);
}
/**
 * @param {!LayoutMarginsDef} margins
 * @param {!LayoutMarginsChangeDef} change
 * @return {boolean}
 */


function areMarginsChanged(margins, change) {
  return change.top !== undefined && change.top != margins.top || change.right !== undefined && change.right != margins.right || change.bottom !== undefined && change.bottom != margins.bottom || change.left !== undefined && change.left != margins.left;
}
/**
 * @param {!LayoutRectDef} from
 * @param {!LayoutRectDef} to
 * @return {boolean}
 */


function layoutRectSizeEquals(from, to) {
  return from.width == to.width && from.height === to.height;
}
/**
 * @param {?LayoutRectDef} r1
 * @param {?LayoutRectDef} r2
 * @return {boolean}
 */


function layoutRectEquals(r1, r2) {
  if (!r1 || !r2) {
    return false;
  }

  return r1.left == r2.left && r1.top == r2.top && r1.width == r2.width && r1.height == r2.height;
}
/**
 * @param {LayoutMarginsChangeDef|undefined} marginsChange
 * @return {LayoutMarginsChangeDef|undefined}
 */


function cloneLayoutMarginsChangeDef(marginsChange) {
  if (!marginsChange) {
    return marginsChange;
  }

  return {
    top: marginsChange.top,
    bottom: marginsChange.bottom,
    left: marginsChange.left,
    right: marginsChange.right
  };
}

},{}],44:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.parseLayout = parseLayout;
exports.getLayoutClass = getLayoutClass;
exports.isLayoutSizeDefined = isLayoutSizeDefined;
exports.isLayoutSizeFixed = isLayoutSizeFixed;
exports.isInternalElement = isInternalElement;
exports.parseLength = parseLength;
exports.assertLength = assertLength;
exports.assertLengthOrPercent = assertLengthOrPercent;
exports.getLengthUnits = getLengthUnits;
exports.getLengthNumeral = getLengthNumeral;
exports.hasNaturalDimensions = hasNaturalDimensions;
exports.getNaturalDimensions = getNaturalDimensions;
exports.isLoadingAllowed = isLoadingAllowed;
exports.isIframeVideoPlayerComponent = isIframeVideoPlayerComponent;
exports.applyStaticLayout = applyStaticLayout;
exports.LOADING_ELEMENTS_ = exports.naturalDimensions_ = exports.LengthDef = exports.LayoutPriority = exports.Layout = void 0;

var _log = require("./log");

var _staticTemplate = require("./static-template");

var _types = require("./types");

var _style = require("./style");

var _string = require("./string");

function _templateObject() {
  var data = _taggedTemplateLiteralLoose(["\n      <i-amphtml-sizer class=\"i-amphtml-sizer\">\n        <img alt=\"\" role=\"presentation\" aria-hidden=\"true\"\n             class=\"i-amphtml-intrinsic-sizer\" />\n      </i-amphtml-sizer>"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/**
 * @enum {string}
 */
var Layout = {
  NODISPLAY: 'nodisplay',
  FIXED: 'fixed',
  FIXED_HEIGHT: 'fixed-height',
  RESPONSIVE: 'responsive',
  CONTAINER: 'container',
  FILL: 'fill',
  FLEX_ITEM: 'flex-item',
  FLUID: 'fluid',
  INTRINSIC: 'intrinsic'
};
/**
 * Layout priorities to use with BaseElement#getLayoutPriority() and
 * BaseElement#updateLayoutPriority().
 * @enum {number}
 */

exports.Layout = Layout;
var LayoutPriority = {
  CONTENT: 0,
  METADATA: 1,
  ADS: 2,
  BACKGROUND: 3
};
/**
 * CSS Length type. E.g. "1px" or "20vh".
 * @typedef {string}
 */

exports.LayoutPriority = LayoutPriority;
var LengthDef;
/**
 * @typedef {{
 *   width: string,
 *   height: string
 * }}
 */

exports.LengthDef = LengthDef;
var DimensionsDef;
/**
 * The set of elements with natural dimensions, that is, elements
 * which have a known dimension either based on their value specified here,
 * or, if the value is null, a dimension specific to the browser.
 * `hasNaturalDimensions` checks for membership in this set.
 * `getNaturalDimensions` determines the dimensions for an element in the
 *    set and caches it.
 * @type {!Object<string, ?DimensionsDef>}
 * @private  Visible for testing only!
 */

var naturalDimensions_ = {
  'AMP-PIXEL': {
    width: '0px',
    height: '0px'
  },
  'AMP-ANALYTICS': {
    width: '1px',
    height: '1px'
  },
  // TODO(dvoytenko): audio should have width:auto.
  'AMP-AUDIO': null,
  'AMP-SOCIAL-SHARE': {
    width: '60px',
    height: '44px'
  }
};
/**
 * Elements that the progress can be shown for. This set has to be externalized
 * since the element's implementation may not be downloaded yet.
 * This list does not include video players which are found via regex later.
 * @enum {boolean}
 * @private  Visible for testing only!
 */

exports.naturalDimensions_ = naturalDimensions_;
var LOADING_ELEMENTS_ = {
  'AMP-AD': true,
  'AMP-ANIM': true,
  'AMP-EMBED': true,
  'AMP-FACEBOOK': true,
  'AMP-FACEBOOK-COMMENTS': true,
  'AMP-FACEBOOK-PAGE': true,
  'AMP-GOOGLE-DOCUMENT-EMBED': true,
  'AMP-IFRAME': true,
  'AMP-IMG': true,
  'AMP-INSTAGRAM': true,
  'AMP-LIST': true,
  'AMP-PINTEREST': true,
  'AMP-PLAYBUZZ': true,
  'AMP-TWITTER': true
};
/**
 * All video player components must either have a) "video" or b) "player" in
 * their name. A few components don't follow this convention for historical
 * reasons, so they are listed individually.
 * @private @const {!RegExp}
 */

exports.LOADING_ELEMENTS_ = LOADING_ELEMENTS_;
var videoPlayerTagNameRe = /^amp\-(video|.+player)|AMP-BRIGHTCOVE|AMP-DAILYMOTION|AMP-YOUTUBE|AMP-VIMEO|AMP-IMA-VIDEO/i;
/**
 * @param {string} s
 * @return {Layout|undefined} Returns undefined in case of failure to parse
 *   the layout string.
 */

function parseLayout(s) {
  for (var k in Layout) {
    if (Layout[k] == s) {
      return Layout[k];
    }
  }

  return undefined;
}
/**
 * @param {!Layout} layout
 * @return {string}
 */


function getLayoutClass(layout) {
  return 'i-amphtml-layout-' + layout;
}
/**
 * Whether an element with this layout inherently defines the size.
 * @param {!Layout} layout
 * @return {boolean}
 */


function isLayoutSizeDefined(layout) {
  return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT || layout == Layout.RESPONSIVE || layout == Layout.FILL || layout == Layout.FLEX_ITEM || layout == Layout.FLUID || layout == Layout.INTRINSIC;
}
/**
 * Whether an element with this layout has a fixed dimension.
 * @param {!Layout} layout
 * @return {boolean}
 */


function isLayoutSizeFixed(layout) {
  return layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT;
}
/**
 * Whether the tag is an internal (service) AMP tag.
 * @param {!Node|string} tag
 * @return {boolean}
 */


function isInternalElement(tag) {
  var tagName = typeof tag == 'string' ? tag : tag.tagName;
  return tagName && (0, _string.startsWith)(tagName.toLowerCase(), 'i-');
}
/**
 * Parses the CSS length value. If no units specified, the assumed value is
 * "px". Returns undefined in case of parsing error.
 * @param {string|undefined|null} s
 * @return {!LengthDef|undefined}
 */


function parseLength(s) {
  if (typeof s == 'number') {
    return s + 'px';
  }

  if (!s) {
    return undefined;
  }

  if (!/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)?$/.test(s)) {
    return undefined;
  }

  if (/^\d+(\.\d+)?$/.test(s)) {
    return s + 'px';
  }

  return s;
}
/**
 * Asserts that the supplied value is a non-percent CSS Length value.
 * @param {!LengthDef|string|null|undefined} length
 * @return {!LengthDef}
 * @closurePrimitive {asserts.matchesReturn}
 */


function assertLength(length) {
  (0, _log.userAssert)(/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|cm|mm|q|in|pc|pt)$/.test(length), 'Invalid length value: %s', length);
  return (
    /** @type {!LengthDef} */
    length
  );
}
/**
 * Asserts that the supplied value is a CSS Length value
 * (including percent unit).
 * @param {!LengthDef|string} length
 * @return {!LengthDef}
 * @closurePrimitive {asserts.matchesReturn}
 */


function assertLengthOrPercent(length) {
  (0, _log.userAssert)(/^\d+(\.\d+)?(px|em|rem|vh|vw|vmin|vmax|%)$/.test(length), 'Invalid length or percent value: %s', length);
  return length;
}
/**
 * Returns units from the CSS length value.
 * @param {!LengthDef|string|null|undefined} length
 * @return {string}
 */


function getLengthUnits(length) {
  assertLength(length);
  (0, _log.dev)().assertString(length);
  var m = (0, _log.userAssert)(length.match(/[a-z]+/i), 'Failed to read units from %s', length);
  return m[0];
}
/**
 * Returns the numeric value of a CSS length value.
 * @param {!LengthDef|string|null|undefined} length
 * @return {number|undefined}
 */


function getLengthNumeral(length) {
  var res = parseFloat(length);
  return (0, _types.isFiniteNumber)(res) ? res : undefined;
}
/**
 * Determines whether the tagName is a known element that has natural dimensions
 * in our runtime or the browser.
 * @param {string} tagName The element tag name.
 * @return {boolean}
 */


function hasNaturalDimensions(tagName) {
  tagName = tagName.toUpperCase();
  return naturalDimensions_[tagName] !== undefined;
}
/**
 * Determines the default dimensions for an element which could vary across
 * different browser implementations, like <audio> for instance.
 * This operation can only be completed for an element whitelisted by
 * `hasNaturalDimensions`.
 * @param {!Element} element
 * @return {DimensionsDef}
 */


function getNaturalDimensions(element) {
  var tagName = element.tagName.toUpperCase();
  (0, _log.devAssert)(naturalDimensions_[tagName] !== undefined);

  if (!naturalDimensions_[tagName]) {
    var doc = element.ownerDocument;
    var naturalTagName = tagName.replace(/^AMP\-/, '');
    var temp = doc.createElement(naturalTagName); // For audio, should no-op elsewhere.

    temp.controls = true;
    (0, _style.setStyles)(temp, {
      position: 'absolute',
      visibility: 'hidden'
    });
    doc.body.appendChild(temp);
    naturalDimensions_[tagName] = {
      width: (temp.
      /*OK*/
      offsetWidth || 1) + 'px',
      height: (temp.
      /*OK*/
      offsetHeight || 1) + 'px'
    };
    doc.body.removeChild(temp);
  }

  return (
    /** @type {DimensionsDef} */
    naturalDimensions_[tagName]
  );
}
/**
 * Whether the loading can be shown for the specified elemeent. This set has
 * to be externalized since the element's implementation may not be
 * downloaded yet.
 * @param {!Element} element
 * @return {boolean}
 */


function isLoadingAllowed(element) {
  var tagName = element.tagName.toUpperCase();
  return LOADING_ELEMENTS_[tagName] || isIframeVideoPlayerComponent(tagName);
}
/**
 * All video player components must either have a) "video" or b) "player" in
 * their name. A few components don't follow this convention for historical
 * reasons, so they're present in the LOADING_ELEMENTS_ whitelist.
 * @param {string} tagName
 * @return {boolean}
 */


function isIframeVideoPlayerComponent(tagName) {
  if (tagName == 'AMP-VIDEO') {
    return false;
  }

  return videoPlayerTagNameRe.test(tagName);
}
/**
 * Applies layout to the element. Visible for testing only.
 *
 * \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  / _____|
 *  \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
 *   \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
 *    \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
 *     \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|
 *
 * The equivalent of this method is used for server-side rendering (SSR) and
 * any changes made to it must be made in coordination with caches that
 * implement SSR. For more information on SSR see bit.ly/amp-ssr.
 *
 * @param {!Element} element
 * @return {!Layout}
 */


function applyStaticLayout(element) {
  // Check if the layout has already been done by server-side rendering or
  // client-side rendering and the element was cloned. The document may be
  // visible to the user if the boilerplate was removed so please take care in
  // making changes here.
  var completedLayoutAttr = element.getAttribute('i-amphtml-layout');

  if (completedLayoutAttr) {
    var _layout =
    /** @type {!Layout} */
    (0, _log.devAssert)(parseLayout(completedLayoutAttr));

    if ((_layout == Layout.RESPONSIVE || _layout == Layout.INTRINSIC) && element.firstElementChild) {
      // Find sizer, but assume that it might not have been parsed yet.
      element.sizerElement = element.querySelector('i-amphtml-sizer') || undefined;
    } else if (_layout == Layout.NODISPLAY) {
      (0, _style.toggle)(element, false); // TODO(jridgewell): Temporary hack while SSR still adds an inline
      // `display: none`

      element['style']['display'] = '';
    }

    return _layout;
  } // If the layout was already done by server-side rendering (SSR), then the
  // code below will not run. Any changes below will necessitate a change to SSR
  // and must be coordinated with caches that implement SSR. See bit.ly/amp-ssr.
  // Parse layout from the element.


  var layoutAttr = element.getAttribute('layout');
  var widthAttr = element.getAttribute('width');
  var heightAttr = element.getAttribute('height');
  var sizesAttr = element.getAttribute('sizes');
  var heightsAttr = element.getAttribute('heights'); // Input layout attributes.

  var inputLayout = layoutAttr ? parseLayout(layoutAttr) : null;
  (0, _log.userAssert)(inputLayout !== undefined, 'Unknown layout: %s', layoutAttr);
  /** @const {string|null|undefined} */

  var inputWidth = widthAttr && widthAttr != 'auto' ? parseLength(widthAttr) : widthAttr;
  (0, _log.userAssert)(inputWidth !== undefined, 'Invalid width value: %s', widthAttr);
  /** @const {string|null|undefined} */

  var inputHeight = heightAttr && heightAttr != 'fluid' ? parseLength(heightAttr) : heightAttr;
  (0, _log.userAssert)(inputHeight !== undefined, 'Invalid height value: %s', heightAttr); // Effective layout attributes. These are effectively constants.

  var width;
  var height;
  var layout; // Calculate effective width and height.

  if ((!inputLayout || inputLayout == Layout.FIXED || inputLayout == Layout.FIXED_HEIGHT) && (!inputWidth || !inputHeight) && hasNaturalDimensions(element.tagName)) {
    // Default width and height: handle elements that do not specify a
    // width/height and are defined to have natural browser dimensions.
    var dimensions = getNaturalDimensions(element);
    width = inputWidth || inputLayout == Layout.FIXED_HEIGHT ? inputWidth : dimensions.width;
    height = inputHeight || dimensions.height;
  } else {
    width = inputWidth;
    height = inputHeight;
  } // Calculate effective layout.


  if (inputLayout) {
    layout = inputLayout;
  } else if (!width && !height) {
    layout = Layout.CONTAINER;
  } else if (height == 'fluid') {
    layout = Layout.FLUID;
  } else if (height && (!width || width == 'auto')) {
    layout = Layout.FIXED_HEIGHT;
  } else if (height && width && (sizesAttr || heightsAttr)) {
    layout = Layout.RESPONSIVE;
  } else {
    layout = Layout.FIXED;
  } // Verify layout attributes.


  if (layout == Layout.FIXED || layout == Layout.FIXED_HEIGHT || layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    (0, _log.userAssert)(height, 'Expected height to be available: %s', heightAttr);
  }

  if (layout == Layout.FIXED_HEIGHT) {
    (0, _log.userAssert)(!width || width == 'auto', 'Expected width to be either absent or equal "auto" ' + 'for fixed-height layout: %s', widthAttr);
  }

  if (layout == Layout.FIXED || layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    (0, _log.userAssert)(width && width != 'auto', 'Expected width to be available and not equal to "auto": %s', widthAttr);
  }

  if (layout == Layout.RESPONSIVE || layout == Layout.INTRINSIC) {
    (0, _log.userAssert)(getLengthUnits(width) == getLengthUnits(height), 'Length units should be the same for width and height: %s, %s', widthAttr, heightAttr);
  } else {
    (0, _log.userAssert)(heightsAttr === null, 'Unexpected "heights" attribute for none-responsive layout');
  } // Apply UI.


  element.classList.add(getLayoutClass(layout));

  if (isLayoutSizeDefined(layout)) {
    element.classList.add('i-amphtml-layout-size-defined');
  }

  if (layout == Layout.NODISPLAY) {
    // CSS defines layout=nodisplay automatically with `display:none`. Thus
    // no additional styling is needed.
    (0, _style.toggle)(element, false); // TODO(jridgewell): Temporary hack while SSR still adds an inline
    // `display: none`

    element['style']['display'] = '';
  } else if (layout == Layout.FIXED) {
    (0, _style.setStyles)(element, {
      width: (0, _log.dev)().assertString(width),
      height: (0, _log.dev)().assertString(height)
    });
  } else if (layout == Layout.FIXED_HEIGHT) {
    (0, _style.setStyle)(element, 'height', (0, _log.dev)().assertString(height));
  } else if (layout == Layout.RESPONSIVE) {
    var sizer = element.ownerDocument.createElement('i-amphtml-sizer');
    (0, _style.setStyles)(sizer, {
      paddingTop: getLengthNumeral(height) / getLengthNumeral(width) * 100 + '%'
    });
    element.insertBefore(sizer, element.firstChild);
    element.sizerElement = sizer;
  } else if (layout == Layout.INTRINSIC) {
    // Intrinsic uses an svg inside the sizer element rather than the padding
    // trick Note a naked svg won't work becasue other thing expect the
    // i-amphtml-sizer element
    var _sizer = (0, _staticTemplate.htmlFor)(element)(_templateObject());

    var intrinsicSizer = _sizer.firstElementChild;
    intrinsicSizer.setAttribute('src', "data:image/svg+xml;charset=utf-8,<svg height=\"" + height + "\" width=\"" + width + "\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\"/>");
    element.insertBefore(_sizer, element.firstChild);
    element.sizerElement = _sizer;
  } else if (layout == Layout.FILL) {// Do nothing.
  } else if (layout == Layout.CONTAINER) {// Do nothing. Elements themselves will check whether the supplied
    // layout value is acceptable. In particular container is only OK
    // sometimes.
  } else if (layout == Layout.FLEX_ITEM) {
    // Set height and width to a flex item if they exist.
    // The size set to a flex item could be overridden by `display: flex` later.
    if (width) {
      (0, _style.setStyle)(element, 'width', width);
    }

    if (height) {
      (0, _style.setStyle)(element, 'height', height);
    }
  } else if (layout == Layout.FLUID) {
    element.classList.add('i-amphtml-layout-awaiting-size');

    if (width) {
      (0, _style.setStyle)(element, 'width', width);
    }

    (0, _style.setStyle)(element, 'height', 0);
  } // Mark the element as having completed static layout, in case it is cloned
  // in the future.


  element.setAttribute('i-amphtml-layout', layout);
  return layout;
}

},{"./log":45,"./static-template":54,"./string":55,"./style":57,"./types":58}],45:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isUserErrorMessage = isUserErrorMessage;
exports.isUserErrorEmbed = isUserErrorEmbed;
exports.setReportError = setReportError;
exports.overrideLogLevel = overrideLogLevel;
exports.duplicateErrorIfNecessary = duplicateErrorIfNecessary;
exports.createErrorVargs = createErrorVargs;
exports.rethrowAsync = rethrowAsync;
exports.initLogConstructor = initLogConstructor;
exports.resetLogConstructorForTesting = resetLogConstructorForTesting;
exports.user = user;
exports.dev = dev;
exports.isFromEmbed = isFromEmbed;
exports.devAssert = devAssert;
exports.userAssert = userAssert;
exports.Log = exports.LogLevel = exports.USER_ERROR_EMBED_SENTINEL = exports.USER_ERROR_SENTINEL = void 0;

var _mode = require("./mode");

var _modeObject = require("./mode-object");

var _internalVersion = require("./internal-version");

var _types = require("./types");

var _function = require("./utils/function");

var _config = require("./config");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var noop = function noop() {};
/**
 * Triple zero width space.
 *
 * This is added to user error messages, so that we can later identify
 * them, when the only thing that we have is the message. This is the
 * case in many browsers when the global exception handler is invoked.
 *
 * @const {string}
 */


var USER_ERROR_SENTINEL = "\u200B\u200B\u200B";
/**
 * Four zero width space.
 *
 * @const {string}
 */

exports.USER_ERROR_SENTINEL = USER_ERROR_SENTINEL;
var USER_ERROR_EMBED_SENTINEL = "\u200B\u200B\u200B\u200B";
/**
 * @param {string} message
 * @return {boolean} Whether this message was a user error.
 */

exports.USER_ERROR_EMBED_SENTINEL = USER_ERROR_EMBED_SENTINEL;

function isUserErrorMessage(message) {
  return message.indexOf(USER_ERROR_SENTINEL) >= 0;
}
/**
 * @param {string} message
 * @return {boolean} Whether this message was a a user error from an iframe embed.
 */


function isUserErrorEmbed(message) {
  return message.indexOf(USER_ERROR_EMBED_SENTINEL) >= 0;
}
/**
 * @enum {number}
 * @private Visible for testing only.
 */


var LogLevel = {
  OFF: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  FINE: 4
};
/**
 * Sets reportError function. Called from error.js to break cyclic
 * dependency.
 * @param {function(*, !Element=)|undefined} fn
 */

exports.LogLevel = LogLevel;

function setReportError(fn) {
  self.__AMP_REPORT_ERROR = fn;
}
/**
 * @type {!LogLevel|undefined}
 * @private
 */


var levelOverride_ = undefined;
/**
 * @param {!LogLevel} level
 */

function overrideLogLevel(level) {
  levelOverride_ = level;
}
/**
 * Prefixes `internalRuntimeVersion` with the `01` channel signifier (for prod.) for
 * extracted message URLs.
 * (Specific channel is irrelevant: message tables are invariant on internal version.)
 * @return {string}
 */


var messageUrlRtv = function messageUrlRtv() {
  return "01" + (0, _internalVersion.internalRuntimeVersion)();
};
/**
 * Gets a URL to display a message on amp.dev.
 * @param {string} id
 * @param {!Array} interpolatedParts
 * @return {string}
 */


var externalMessageUrl = function externalMessageUrl(id, interpolatedParts) {
  return interpolatedParts.reduce(function (prefix, arg) {
    return prefix + "&s[]=" + messageArgToEncodedComponent(arg);
  }, "https://log.amp.dev/?v=" + messageUrlRtv() + "&id=" + encodeURIComponent(id));
};
/**
 * URL to simple log messages table JSON file, which contains an Object<string, string>
 * which maps message id to full message template.
 * @return {string}
 */


var externalMessagesSimpleTableUrl = function externalMessagesSimpleTableUrl() {
  return _config.urls.cdn + "/rtv/" + messageUrlRtv() + "/log-messages.simple.json";
};
/**
 * @param {*} arg
 * @return {string}
 */


var messageArgToEncodedComponent = function messageArgToEncodedComponent(arg) {
  return encodeURIComponent(String(elementStringOrPassthru(arg)));
};
/**
 * Logging class. Use of sentinel string instead of a boolean to check user/dev
 * errors because errors could be rethrown by some native code as a new error,
 * and only a message would survive. Also, some browser don’t support a 5th
 * error object argument in window.onerror. List of supporting browser can be
 * found here:
 * https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror.html
 * @final
 * @private Visible for testing only.
 */


var Log =
/*#__PURE__*/
function () {
  /**
   * opt_suffix will be appended to error message to identify the type of the
   * error message. We can't rely on the error object to pass along the type
   * because some browsers do not have this param in its window.onerror API.
   * See:
   * https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror.html
   *
   * @param {!Window} win
   * @param {function(!./mode.ModeDef):!LogLevel} levelFunc
   * @param {string=} opt_suffix
   */
  function Log(win, levelFunc, opt_suffix) {
    var _this = this;

    if (opt_suffix === void 0) {
      opt_suffix = '';
    }

    /**
     * In tests we use the main test window instead of the iframe where
     * the tests runs because only the former is relayed to the console.
     * @const {!Window}
     */
    this.win = (0, _mode.getMode)().test && win.__AMP_TEST_IFRAME ? win.parent : win;
    /** @private @const {function(!./mode.ModeDef):!LogLevel} */

    this.levelFunc_ = levelFunc;
    /** @private @const {!LogLevel} */

    this.level_ = this.defaultLevel_();
    /** @private @const {string} */

    this.suffix_ = opt_suffix;
    /** @private {?JsonObject} */

    this.messages_ = null;
    this.fetchExternalMessagesOnce_ = (0, _function.once)(function () {
      win.fetch(externalMessagesSimpleTableUrl()).then(function (response) {
        return response.json();
      }, noop).then(function (opt_messages) {
        if (opt_messages) {
          _this.messages_ =
          /** @type {!JsonObject} */
          opt_messages;
        }
      });
    });
  }
  /**
   * @return {!LogLevel}
   * @private
   */


  var _proto = Log.prototype;

  _proto.getLevel_ = function getLevel_() {
    return levelOverride_ !== undefined ? levelOverride_ : this.level_;
  }
  /**
   * @return {!LogLevel}
   * @private
   */
  ;

  _proto.defaultLevel_ = function defaultLevel_() {
    // No console - can't enable logging.
    if (!this.win.console || !this.win.console.log) {
      return LogLevel.OFF;
    } // Logging has been explicitly disabled.


    if ((0, _mode.getMode)().log == '0') {
      return LogLevel.OFF;
    } // Logging is enabled for tests directly.


    if ((0, _mode.getMode)().test && this.win.ENABLE_LOG) {
      return LogLevel.FINE;
    } // LocalDev by default allows INFO level, unless overriden by `#log`.


    if ((0, _mode.getMode)().localDev && !(0, _mode.getMode)().log) {
      return LogLevel.INFO;
    } // Delegate to the specific resolver.


    return this.levelFunc_((0, _modeObject.getModeObject)());
  }
  /**
   * @param {string} tag
   * @param {string} level
   * @param {!Array} messages
   */
  ;

  _proto.msg_ = function msg_(tag, level, messages) {
    if (this.getLevel_() != LogLevel.OFF) {
      var fn = this.win.console.log;

      if (level == 'ERROR') {
        fn = this.win.console.error || fn;
      } else if (level == 'INFO') {
        fn = this.win.console.info || fn;
      } else if (level == 'WARN') {
        fn = this.win.console.warn || fn;
      }

      var args = this.maybeExpandMessageArgs_(messages); // Prefix console message with "[tag]".

      var prefix = "[" + tag + "]";

      if (typeof args[0] === 'string') {
        // Prepend string to avoid breaking string substitutions e.g. %s.
        args[0] = prefix + ' ' + args[0];
      } else {
        args.unshift(prefix);
      }

      fn.apply(this.win.console, args);
    }
  }
  /**
   * Whether the logging is enabled.
   * @return {boolean}
   */
  ;

  _proto.isEnabled = function isEnabled() {
    return this.getLevel_() != LogLevel.OFF;
  }
  /**
   * Reports a fine-grained message.
   * @param {string} tag
   * @param {...*} var_args
   */
  ;

  _proto.fine = function fine(tag, var_args) {
    if (this.getLevel_() >= LogLevel.FINE) {
      this.msg_(tag, 'FINE', Array.prototype.slice.call(arguments, 1));
    }
  }
  /**
   * Reports a informational message.
   * @param {string} tag
   * @param {...*} var_args
   */
  ;

  _proto.info = function info(tag, var_args) {
    if (this.getLevel_() >= LogLevel.INFO) {
      this.msg_(tag, 'INFO', Array.prototype.slice.call(arguments, 1));
    }
  }
  /**
   * Reports a warning message.
   * @param {string} tag
   * @param {...*} var_args
   */
  ;

  _proto.warn = function warn(tag, var_args) {
    if (this.getLevel_() >= LogLevel.WARN) {
      this.msg_(tag, 'WARN', Array.prototype.slice.call(arguments, 1));
    }
  }
  /**
   * Reports an error message. If the logging is disabled, the error is rethrown
   * asynchronously.
   * @param {string} tag
   * @param {...*} var_args
   * @return {!Error|undefined}
   * @private
   */
  ;

  _proto.error_ = function error_(tag, var_args) {
    if (this.getLevel_() >= LogLevel.ERROR) {
      this.msg_(tag, 'ERROR', Array.prototype.slice.call(arguments, 1));
    } else {
      var error = createErrorVargs.apply(null, Array.prototype.slice.call(arguments, 1));
      this.prepareError_(error);
      return error;
    }
  }
  /**
   * Reports an error message.
   * @param {string} tag
   * @param {...*} var_args
   */
  ;

  _proto.error = function error(tag, var_args) {
    var error = this.error_.apply(this, arguments);

    if (error) {
      error.name = tag || error.name; // __AMP_REPORT_ERROR is installed globally per window in the entry point.

      self.__AMP_REPORT_ERROR(error);
    }
  }
  /**
   * Reports an error message and marks with an expected property. If the
   * logging is disabled, the error is rethrown asynchronously.
   * @param {string} unusedTag
   * @param {...*} var_args
   */
  ;

  _proto.expectedError = function expectedError(unusedTag, var_args) {
    var error = this.error_.apply(this, arguments);

    if (error) {
      error.expected = true; // __AMP_REPORT_ERROR is installed globally per window in the entry point.

      self.__AMP_REPORT_ERROR(error);
    }
  }
  /**
   * Creates an error object.
   * @param {...*} var_args
   * @return {!Error}
   */
  ;

  _proto.createError = function createError(var_args) {
    var error = createErrorVargs.apply(null, arguments);
    this.prepareError_(error);
    return error;
  }
  /**
   * Creates an error object with its expected property set to true.
   * @param {...*} var_args
   * @return {!Error}
   */
  ;

  _proto.createExpectedError = function createExpectedError(var_args) {
    var error = createErrorVargs.apply(null, arguments);
    this.prepareError_(error);
    error.expected = true;
    return error;
  }
  /**
   * Throws an error if the first argument isn't trueish.
   *
   * Supports argument substitution into the message via %s placeholders.
   *
   * Throws an error object that has two extra properties:
   * - associatedElement: This is the first element provided in the var args.
   *   It can be used for improved display of error messages.
   * - messageArray: The elements of the substituted message as non-stringified
   *   elements in an array. When e.g. passed to console.error this yields
   *   native displays of things like HTML elements.
   *
   * NOTE: for an explanation of the tempate R implementation see
   * https://github.com/google/closure-library/blob/08858804/closure/goog/asserts/asserts.js#L192-L213
   *
   * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
   *     not evaluate to true.
   * @param {!Array|string=} opt_message The assertion message
   * @param {...*} var_args Arguments substituted into %s in the message.
   * @return {R} The value of shouldBeTrueish.
   * @throws {!Error} When `value` is `null` or `undefined`.
   * @template T
   * @template R :=
   *     mapunion(T, (V) =>
   *         cond(eq(V, 'null'),
   *             none(),
   *             cond(eq(V, 'undefined'),
   *                 none(),
   *                 V)))
   *  =:
   * @closurePrimitive {asserts.matchesReturn}
   */
  ;

  _proto.assert = function assert(shouldBeTrueish, opt_message, var_args) {
    var firstElement;

    if ((0, _types.isArray)(opt_message)) {
      return this.assert.apply(this, [shouldBeTrueish].concat(this.expandMessageArgs_(
      /** @type {!Array} */
      opt_message)));
    }

    if (!shouldBeTrueish) {
      var message = opt_message || 'Assertion failed';
      var splitMessage = message.split('%s');
      var first = splitMessage.shift();
      var formatted = first;
      var messageArray = [];
      var i = 2;
      pushIfNonEmpty(messageArray, first);

      while (splitMessage.length > 0) {
        var nextConstant = splitMessage.shift();
        var val = arguments[i++];

        if (val && val.tagName) {
          firstElement = val;
        }

        messageArray.push(val);
        pushIfNonEmpty(messageArray, nextConstant.trim());
        formatted += stringOrElementString(val) + nextConstant;
      }

      var e = new Error(formatted);
      e.fromAssert = true;
      e.associatedElement = firstElement;
      e.messageArray = messageArray;
      this.prepareError_(e); // __AMP_REPORT_ERROR is installed globally per window in the entry point.

      self.__AMP_REPORT_ERROR(e);

      throw e;
    }

    return shouldBeTrueish;
  }
  /**
   * Throws an error if the first argument isn't an Element
   *
   * Otherwise see `assert` for usage
   *
   * @param {*} shouldBeElement
   * @param {!Array|string=} opt_message The assertion message
   * @return {!Element} The value of shouldBeTrueish.
   * @template T
   * @closurePrimitive {asserts.matchesReturn}
   */
  ;

  _proto.assertElement = function assertElement(shouldBeElement, opt_message) {
    var shouldBeTrueish = shouldBeElement && shouldBeElement.nodeType == 1;
    this.assertType_(shouldBeElement, shouldBeTrueish, 'Element expected', opt_message);
    return (
      /** @type {!Element} */
      shouldBeElement
    );
  }
  /**
   * Throws an error if the first argument isn't a string. The string can
   * be empty.
   *
   * For more details see `assert`.
   *
   * @param {*} shouldBeString
   * @param {!Array|string=} opt_message The assertion message
   * @return {string} The string value. Can be an empty string.
   * @closurePrimitive {asserts.matchesReturn}
   */
  ;

  _proto.assertString = function assertString(shouldBeString, opt_message) {
    this.assertType_(shouldBeString, typeof shouldBeString == 'string', 'String expected', opt_message);
    return (
      /** @type {string} */
      shouldBeString
    );
  }
  /**
   * Throws an error if the first argument isn't a number. The allowed values
   * include `0` and `NaN`.
   *
   * For more details see `assert`.
   *
   * @param {*} shouldBeNumber
   * @param {!Array|string=} opt_message The assertion message
   * @return {number} The number value. The allowed values include `0`
   *   and `NaN`.
   * @closurePrimitive {asserts.matchesReturn}
   */
  ;

  _proto.assertNumber = function assertNumber(shouldBeNumber, opt_message) {
    this.assertType_(shouldBeNumber, typeof shouldBeNumber == 'number', 'Number expected', opt_message);
    return (
      /** @type {number} */
      shouldBeNumber
    );
  }
  /**
   * Throws an error if the first argument is not an array.
   * The array can be empty.
   *
   * @param {*} shouldBeArray
   * @param {!Array|string=} opt_message The assertion message
   * @return {!Array} The array value
   * @closurePrimitive {asserts.matchesReturn}
   */
  ;

  _proto.assertArray = function assertArray(shouldBeArray, opt_message) {
    this.assertType_(shouldBeArray, (0, _types.isArray)(shouldBeArray), 'Array expected', opt_message);
    return (
      /** @type {!Array} */
      shouldBeArray
    );
  }
  /**
   * Throws an error if the first argument isn't a boolean.
   *
   * For more details see `assert`.
   *
   * @param {*} shouldBeBoolean
   * @param {!Array|string=} opt_message The assertion message
   * @return {boolean} The boolean value.
   * @closurePrimitive {asserts.matchesReturn}
   */
  ;

  _proto.assertBoolean = function assertBoolean(shouldBeBoolean, opt_message) {
    this.assertType_(shouldBeBoolean, !!shouldBeBoolean === shouldBeBoolean, 'Boolean expected', opt_message);
    return (
      /** @type {boolean} */
      shouldBeBoolean
    );
  }
  /**
   * Asserts and returns the enum value. If the enum doesn't contain such a
   * value, the error is thrown.
   *
   * @param {!Object<T>} enumObj
   * @param {string} s
   * @param {string=} opt_enumName
   * @return {T}
   * @template T
   * @closurePrimitive {asserts.matchesReturn}
   */
  ;

  _proto.assertEnumValue = function assertEnumValue(enumObj, s, opt_enumName) {
    if ((0, _types.isEnumValue)(enumObj, s)) {
      return s;
    }

    this.assert(false, 'Unknown %s value: "%s"', opt_enumName || 'enum', s);
  }
  /**
   * @param {!Error} error
   * @private
   */
  ;

  _proto.prepareError_ = function prepareError_(error) {
    error = duplicateErrorIfNecessary(error);

    if (this.suffix_) {
      if (!error.message) {
        error.message = this.suffix_;
      } else if (error.message.indexOf(this.suffix_) == -1) {
        error.message += this.suffix_;
      }
    } else if (isUserErrorMessage(error.message)) {
      error.message = error.message.replace(USER_ERROR_SENTINEL, '');
    }
  }
  /**
   * @param {!Array} args
   * @return {!Array}
   * @private
   */
  ;

  _proto.maybeExpandMessageArgs_ = function maybeExpandMessageArgs_(args) {
    if ((0, _types.isArray)(args[0])) {
      return this.expandMessageArgs_(
      /** @type {!Array} */
      args[0]);
    }

    return args;
  }
  /**
   * Either redirects a pair of (errorId, ...args) to a URL where the full
   * message is displayed, or displays it from a fetched table.
   *
   * This method is used by the output of the `transform-log-methods` babel
   * plugin. It should not be used directly. Use the (*error|assert*|info|warn)
   * methods instead.
   *
   * @param {!Array} parts
   * @return {!Array}
   * @private
   */
  ;

  _proto.expandMessageArgs_ = function expandMessageArgs_(parts) {
    // First value should exist.
    var id = parts.shift(); // Best effort fetch of message template table.
    // Since this is async, the first few logs might be indirected to a URL even
    // if in development mode. Message table is ~small so this should be a short
    // gap.

    if ((0, _mode.getMode)(this.win).development) {
      this.fetchExternalMessagesOnce_();
    }

    if (this.messages_ && id in this.messages_) {
      return [this.messages_[id]].concat(parts);
    }

    return ["More info at " + externalMessageUrl(id, parts)];
  }
  /**
   * Asserts types, backbone of `assertNumber`, `assertString`, etc.
   *
   * It understands array-based "id"-contracted messages.
   *
   * Otherwise creates a sprintf syntax string containing the optional message or the
   * default. An interpolation token is added at the end to include the `subject`.
   * @param {*} subject
   * @param {*} assertion
   * @param {string} defaultMessage
   * @param {!Array|string=} opt_message
   * @private
   */
  ;

  _proto.assertType_ = function assertType_(subject, assertion, defaultMessage, opt_message) {
    if ((0, _types.isArray)(opt_message)) {
      this.assert(assertion, opt_message.concat(subject));
    } else {
      this.assert(assertion, (opt_message || defaultMessage) + ": %s", subject);
    }
  };

  return Log;
}();
/**
 * @param {string|!Element} val
 * @return {string}
 */


exports.Log = Log;

var stringOrElementString = function stringOrElementString(val) {
  return (
    /** @type {string} */
    elementStringOrPassthru(val)
  );
};
/**
 * @param {*} val
 * @return {*}
 */


function elementStringOrPassthru(val) {
  // Do check equivalent to `val instanceof Element` without cross-window bug
  if (val && val.nodeType == 1) {
    return val.tagName.toLowerCase() + (val.id ? '#' + val.id : '');
  }

  return val;
}
/**
 * @param {!Array} array
 * @param {*} val
 */


function pushIfNonEmpty(array, val) {
  if (val != '') {
    array.push(val);
  }
}
/**
 * Some exceptions (DOMException, namely) have read-only message.
 * @param {!Error} error
 * @return {!Error};
 */


function duplicateErrorIfNecessary(error) {
  var messageProperty = Object.getOwnPropertyDescriptor(error, 'message');

  if (messageProperty && messageProperty.writable) {
    return error;
  }

  var message = error.message,
      stack = error.stack;
  var e = new Error(message); // Copy all the extraneous things we attach.

  for (var prop in error) {
    e[prop] = error[prop];
  } // Ensure these are copied.


  e.stack = stack;
  return e;
}
/**
 * @param {...*} var_args
 * @return {!Error}
 * @visibleForTesting
 */


function createErrorVargs(var_args) {
  var error = null;
  var message = '';

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];

    if (arg instanceof Error && !error) {
      error = duplicateErrorIfNecessary(arg);
    } else {
      if (message) {
        message += ' ';
      }

      message += arg;
    }
  }

  if (!error) {
    error = new Error(message);
  } else if (message) {
    error.message = message + ': ' + error.message;
  }

  return error;
}
/**
 * Rethrows the error without terminating the current context. This preserves
 * whether the original error designation is a user error or a dev error.
 * @param {...*} var_args
 */


function rethrowAsync(var_args) {
  var error = createErrorVargs.apply(null, arguments);
  setTimeout(function () {
    // reportError is installed globally per window in the entry point.
    self.__AMP_REPORT_ERROR(error);

    throw error;
  });
}
/**
 * Cache for logs. We do not use a Service since the service module depends
 * on Log and closure literally can't even.
 * @type {{user: ?Log, dev: ?Log, userForEmbed: ?Log}}
 */


self.__AMP_LOG = self.__AMP_LOG || {
  user: null,
  dev: null,
  userForEmbed: null
};
var logs = self.__AMP_LOG;
/**
 * Eventually holds a constructor for Log objects. Lazily initialized, so we
 * can avoid ever referencing the real constructor except in JS binaries
 * that actually want to include the implementation.
 * @type {?Function}
 */

var logConstructor = null;
/**
 * Initializes log contructor.
 */

function initLogConstructor() {
  logConstructor = Log; // Initialize instances for use. If a binary (an extension for example) that
  // does not call `initLogConstructor` invokes `dev()` or `user()` earlier than
  // the binary that does call `initLogConstructor` (amp.js), the extension will
  // throw an error as that extension will never be able to initialize the log
  // instances and we also don't want it to call `initLogConstructor` either
  // (since that will cause the Log implementation to be bundled into that
  // binary). So we must initialize the instances eagerly so that they are ready
  // for use (stored globally) after the main binary calls `initLogConstructor`.

  dev();
  user();
}
/**
 * Resets log contructor for testing.
 */


function resetLogConstructorForTesting() {
  logConstructor = null;
}
/**
 * Publisher level log.
 *
 * Enabled in the following conditions:
 *  1. Not disabled using `#log=0`.
 *  2. Development mode is enabled via `#development=1` or logging is explicitly
 *     enabled via `#log=D` where D >= 1.
 *  3. AMP.setLogLevel(D) is called, where D >= 1.
 *
 * @param {!Element=} opt_element
 * @return {!Log}
 */


function user(opt_element) {
  if (!logs.user) {
    logs.user = getUserLogger(USER_ERROR_SENTINEL);
  }

  if (!isFromEmbed(logs.user.win, opt_element)) {
    return logs.user;
  } else {
    if (logs.userForEmbed) {
      return logs.userForEmbed;
    }

    return logs.userForEmbed = getUserLogger(USER_ERROR_EMBED_SENTINEL);
  }
}
/**
 * Getter for user logger
 * @param {string=} suffix
 * @return {!Log}
 */


function getUserLogger(suffix) {
  if (!logConstructor) {
    throw new Error('failed to call initLogConstructor');
  }

  return new logConstructor(self, function (mode) {
    var logNum = parseInt(mode.log, 10);

    if (mode.development || logNum >= 1) {
      return LogLevel.FINE;
    }

    return LogLevel.WARN;
  }, suffix);
}
/**
 * AMP development log. Calls to `devLog().assert` and `dev.fine` are stripped
 * in the PROD binary. However, `devLog().assert` result is preserved in either
 * case.
 *
 * Enabled in the following conditions:
 *  1. Not disabled using `#log=0`.
 *  2. Logging is explicitly enabled via `#log=D`, where D >= 2.
 *  3. AMP.setLogLevel(D) is called, where D >= 2.
 *
 * @return {!Log}
 */


function dev() {
  if (logs.dev) {
    return logs.dev;
  }

  if (!logConstructor) {
    throw new Error('failed to call initLogConstructor');
  }

  return logs.dev = new logConstructor(self, function (mode) {
    var logNum = parseInt(mode.log, 10);

    if (logNum >= 3) {
      return LogLevel.FINE;
    }

    if (logNum >= 2) {
      return LogLevel.INFO;
    }

    return LogLevel.OFF;
  });
}
/**
 * @param {!Window} win
 * @param {!Element=} opt_element
 * @return {boolean} isEmbed
 */


function isFromEmbed(win, opt_element) {
  if (!opt_element) {
    return false;
  }

  return opt_element.ownerDocument.defaultView != win;
}
/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * NOTE: for an explanation of the tempate R implementation see
 * https://github.com/google/closure-library/blob/08858804/closure/goog/asserts/asserts.js#L192-L213
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {!Array|string=} opt_message The assertion message
 * @param {*=} opt_1 Optional argument (Var arg as individual params for better
 * @param {*=} opt_2 Optional argument inlining)
 * @param {*=} opt_3 Optional argument
 * @param {*=} opt_4 Optional argument
 * @param {*=} opt_5 Optional argument
 * @param {*=} opt_6 Optional argument
 * @param {*=} opt_7 Optional argument
 * @param {*=} opt_8 Optional argument
 * @param {*=} opt_9 Optional argument
 * @return {R} The value of shouldBeTrueish.
 * @template T
 * @template R :=
 *     mapunion(T, (V) =>
 *         cond(eq(V, 'null'),
 *             none(),
 *             cond(eq(V, 'undefined'),
 *                 none(),
 *                 V)))
 *  =:
 * @throws {!Error} When `value` is `null` or `undefined`.
 * @closurePrimitive {asserts.matchesReturn}
 */


function devAssert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9) {
  if ((0, _mode.getMode)().minified) {
    return shouldBeTrueish;
  }

  return dev().
  /*Orig call*/
  assert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9);
}
/**
 * Throws an error if the first argument isn't trueish.
 *
 * Supports argument substitution into the message via %s placeholders.
 *
 * Throws an error object that has two extra properties:
 * - associatedElement: This is the first element provided in the var args.
 *   It can be used for improved display of error messages.
 * - messageArray: The elements of the substituted message as non-stringified
 *   elements in an array. When e.g. passed to console.error this yields
 *   native displays of things like HTML elements.
 *
 * NOTE: for an explanation of the tempate R implementation see
 * https://github.com/google/closure-library/blob/08858804/closure/goog/asserts/asserts.js#L192-L213
 *
 * @param {T} shouldBeTrueish The value to assert. The assert fails if it does
 *     not evaluate to true.
 * @param {!Array|string=} opt_message The assertion message
 * @param {*=} opt_1 Optional argument (Var arg as individual params for better
 * @param {*=} opt_2 Optional argument inlining)
 * @param {*=} opt_3 Optional argument
 * @param {*=} opt_4 Optional argument
 * @param {*=} opt_5 Optional argument
 * @param {*=} opt_6 Optional argument
 * @param {*=} opt_7 Optional argument
 * @param {*=} opt_8 Optional argument
 * @param {*=} opt_9 Optional argument
 * @return {R} The value of shouldBeTrueish.
 * @template T
 * @template R :=
 *     mapunion(T, (V) =>
 *         cond(eq(V, 'null'),
 *             none(),
 *             cond(eq(V, 'undefined'),
 *                 none(),
 *                 V)))
 *  =:
 * @throws {!Error} When `value` is `null` or `undefined`.
 * @closurePrimitive {asserts.matchesReturn}
 */


function userAssert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9) {
  return user().
  /*Orig call*/
  assert(shouldBeTrueish, opt_message, opt_1, opt_2, opt_3, opt_4, opt_5, opt_6, opt_7, opt_8, opt_9);
}

},{"./config":24,"./internal-version":40,"./mode":47,"./mode-object":46,"./types":58,"./utils/function":64}],46:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getModeObject = getModeObject;

var _mode = require("./mode");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Provides info about the current app. This return value may be cached and
 * passed around as it will always be DCE'd.
 * @param {?Window=} opt_win
 * @return {!./mode.ModeDef}
 */
function getModeObject(opt_win) {
  return {
    localDev: (0, _mode.getMode)(opt_win).localDev,
    development: (0, _mode.getMode)(opt_win).development,
    filter: (0, _mode.getMode)(opt_win).filter,
    minified: (0, _mode.getMode)(opt_win).minified,
    lite: (0, _mode.getMode)(opt_win).lite,
    test: (0, _mode.getMode)(opt_win).test,
    log: (0, _mode.getMode)(opt_win).log,
    version: (0, _mode.getMode)(opt_win).version,
    rtvVersion: (0, _mode.getMode)(opt_win).rtvVersion,
    singlePassType: (0, _mode.getMode)(opt_win).singlePassType
  };
}

},{"./mode":47}],47:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getMode = getMode;
exports.getRtvVersionForTesting = getRtvVersionForTesting;
exports.resetRtvVersionForTesting = resetRtvVersionForTesting;
exports.ModeDef = void 0;

var _internalVersion = require("./internal-version");

var _urlParseQueryString = require("./url-parse-query-string");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @typedef {{
 *   localDev: boolean,
 *   development: boolean,
 *   filter: (string|undefined),
 *   minified: boolean,
 *   lite: boolean,
 *   test: boolean,
 *   log: (string|undefined),
 *   version: string,
 *   rtvVersion: string,
 *   runtime: (null|string|undefined),
 *   a4aId: (null|string|undefined),
 *   singlePassType: (string|undefined)
 * }}
 */
var ModeDef;
/**
 * `rtvVersion` is the prefixed version we serve off of the cdn.
 * The prefix denotes canary(00) or prod(01) or an experiment version ( > 01).
 * @type {string}
 */

exports.ModeDef = ModeDef;
var rtvVersion = '';
/**
 * Provides info about the current app.
 * @param {?Window=} opt_win
 * @return {!ModeDef}
 */

function getMode(opt_win) {
  var win = opt_win || self;

  if (win.__AMP_MODE) {
    return win.__AMP_MODE;
  }

  return win.__AMP_MODE = getMode_(win);
}
/**
 * Provides info about the current app.
 * @param {!Window} win
 * @return {!ModeDef}
 */


function getMode_(win) {
  // TODO(erwinmombay): simplify the logic here
  var AMP_CONFIG = self.AMP_CONFIG || {}; // Magic constants that are replaced by closure compiler.
  // IS_MINIFIED is always replaced with true when closure compiler is used
  // while IS_DEV is only replaced when `gulp dist` is called without the
  // --fortesting flag.

  var IS_DEV = true;
  var IS_MINIFIED = false;
  var localDevEnabled = !!AMP_CONFIG.localDev;
  var runningTests = !!AMP_CONFIG.test || IS_DEV && !!(win.__AMP_TEST || win.__karma__);
  var runningTestsOnIe = win.__karma__ && win.__karma__.config.amp.testOnIe;
  var isLocalDev = IS_DEV && (localDevEnabled || runningTests);
  var hashQuery = (0, _urlParseQueryString.parseQueryString_)( // location.originalHash is set by the viewer when it removes the fragment
  // from the URL.
  win.location.originalHash || win.location.hash);
  var singlePassType = AMP_CONFIG.spt;
  var searchQuery = (0, _urlParseQueryString.parseQueryString_)(win.location.search);

  if (!rtvVersion) {
    rtvVersion = getRtvVersion(win, isLocalDev);
  } // The `minified`, `test` and `localDev` properties are replaced
  // as boolean literals when we run `gulp dist` without the `--fortesting`
  // flags. This improved DCE on the production file we deploy as the code
  // paths for localhost/testing/development are eliminated.


  return {
    localDev: isLocalDev,
    // Triggers validation or enable pub level logging. Validation can be
    // bypassed via #validate=0.
    // Note that AMP_DEV_MODE flag is used for testing purposes.
    // Use Array.indexOf instead of Array.includes because of #24219
    development: !!(['1', 'actions', 'amp', 'amp4ads', 'amp4email'].indexOf(hashQuery['development']) >= 0 || win.AMP_DEV_MODE),
    examiner: hashQuery['development'] == '2',
    // Allows filtering validation errors by error category. For the
    // available categories, see ErrorCategory in validator/validator.proto.
    filter: hashQuery['filter'],
    // amp-geo override
    geoOverride: hashQuery['amp-geo'],
    // amp-user-location override
    userLocationOverride: hashQuery['amp-user-location'],
    minified: IS_MINIFIED,
    // Whether document is in an amp-lite viewer. It signal that the user
    // would prefer to use less bandwidth.
    lite: searchQuery['amp_lite'] != undefined,
    test: runningTests,
    testIe: runningTestsOnIe,
    log: hashQuery['log'],
    version: (0, _internalVersion.internalRuntimeVersion)(),
    rtvVersion: rtvVersion,
    singlePassType: singlePassType
  };
}
/**
 * Retrieve the `rtvVersion` which will have a numeric prefix
 * denoting canary/prod/experiment (unless `isLocalDev` is true).
 *
 * @param {!Window} win
 * @param {boolean} isLocalDev
 * @return {string}
 */


function getRtvVersion(win, isLocalDev) {
  // If it's local dev then we won't actually have a full version so
  // just use the version.
  if (isLocalDev) {
    return (0, _internalVersion.internalRuntimeVersion)();
  }

  if (win.AMP_CONFIG && win.AMP_CONFIG.v) {
    return win.AMP_CONFIG.v;
  } // Currently `internalRuntimeVersion` and thus `mode.version` contain only
  // major version. The full version however must also carry the minor version.
  // We will default to production default `01` minor version for now.
  // TODO(erwinmombay): decide whether internalRuntimeVersion should contain
  // minor version.


  return "01" + (0, _internalVersion.internalRuntimeVersion)();
}
/**
 * @param {!Window} win
 * @param {boolean} isLocalDev
 * @return {string}
 * @visibleForTesting
 */


function getRtvVersionForTesting(win, isLocalDev) {
  return getRtvVersion(win, isLocalDev);
}
/** @visibleForTesting */


function resetRtvVersionForTesting() {
  rtvVersion = '';
}

},{"./internal-version":40,"./url-parse-query-string":59}],48:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.waitForServices = waitForServices;
exports.hasRenderDelayingServices = hasRenderDelayingServices;
exports.isRenderDelayingService = isRenderDelayingService;
exports.includedServices = includedServices;
exports.RenderDelayingService = void 0;

var _services = require("./services");

var _log = require("./log");

var _service = require("./service");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A map of services that delay rendering. The key is the name of the service
 * and the value is a DOM query which is used to check if the service is needed
 * in the current document.
 * Do not add a service unless absolutely necessary.
 *
 * \   \  /  \  /   / /   \     |   _  \     |  \ |  | |  | |  \ |  |  / _____|
 *  \   \/    \/   / /  ^  \    |  |_)  |    |   \|  | |  | |   \|  | |  |  __
 *   \            / /  /_\  \   |      /     |  . `  | |  | |  . `  | |  | |_ |
 *    \    /\    / /  _____  \  |  |\  \----.|  |\   | |  | |  |\   | |  |__| |
 *     \__/  \__/ /__/     \__\ | _| `._____||__| \__| |__| |__| \__|  \______|
 *
 * The equivalent of this list is used for server-side rendering (SSR) and any
 * changes made to it must be made in coordination with caches that implement
 * SSR. For more information on SSR see bit.ly/amp-ssr.
 *
 * @const {!Object<string, string>}
 */
var SERVICES = {
  'amp-dynamic-css-classes': '[custom-element=amp-dynamic-css-classes]',
  'variant': 'amp-experiment',
  'amp-story-render': 'amp-story[standalone]'
};
/**
 * Base class for render delaying services.
 * This should be extended to ensure the service
 * is properly handled
 *
 * @interface
 */

var RenderDelayingService =
/*#__PURE__*/
function () {
  function RenderDelayingService() {}

  var _proto = RenderDelayingService.prototype;

  /**
   * Function to return a promise for when
   * it is finished delaying render, and is ready.
   * NOTE: This should simply return Promise.resolve,
   * if your service does not need to perform any logic
   * after being registered.
   * @return {!Promise}
   */
  _proto.whenReady = function whenReady() {};

  return RenderDelayingService;
}();
/**
 * Maximum milliseconds to wait for all extensions to load before erroring.
 * @const
 */


exports.RenderDelayingService = RenderDelayingService;
var LOAD_TIMEOUT = 3000;
/**
 * Detects any render delaying services that are required on the page, and
 * returns a promise with a timeout.
 * @param {!Window} win
 * @return {!Promise<!Array<*>>} resolves to an Array that has the same length
 *     as the detected render delaying services
 */

function waitForServices(win) {
  var promises = includedServices(win).map(function (serviceId) {
    var serviceReadyPromise = (0, _service.getServicePromise)(win, serviceId).then(function (service) {
      if (service && isRenderDelayingService(service)) {
        return service.whenReady().then(function () {
          return service;
        });
      }

      return service;
    });
    return _services.Services.timerFor(win).timeoutPromise(LOAD_TIMEOUT, serviceReadyPromise, "Render timeout waiting for service " + serviceId + " to be ready.");
  });
  return Promise.all(promises);
}
/**
 * Returns true if the page has a render delaying service.
 * @param {!Window} win
 * @return {boolean}
 */


function hasRenderDelayingServices(win) {
  return includedServices(win).length > 0;
}
/**
 * Function to determine if the passed
 * Object is a Render Delaying Service
 * @param {!Object} service
 * @return {boolean}
 */


function isRenderDelayingService(service) {
  var maybeRenderDelayingService =
  /** @type {!RenderDelayingService}*/
  service;
  return typeof maybeRenderDelayingService.whenReady == 'function';
}
/**
 * Detects which, if any, render-delaying extensions are included on the page.
 * @param {!Window} win
 * @return {!Array<string>}
 */


function includedServices(win) {
  /** @const {!Document} */
  var doc = win.document;
  (0, _log.devAssert)(doc.body);
  return Object.keys(SERVICES).filter(function (service) {
    return doc.querySelector(SERVICES[service]);
  });
}

},{"./log":45,"./service":49,"./services":53}],49:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getExistingServiceForDocInEmbedScope = getExistingServiceForDocInEmbedScope;
exports.installServiceInEmbedScope = installServiceInEmbedScope;
exports.registerServiceBuilder = registerServiceBuilder;
exports.registerServiceBuilderForDoc = registerServiceBuilderForDoc;
exports.rejectServicePromiseForDoc = rejectServicePromiseForDoc;
exports.getService = getService;
exports.getServicePromise = getServicePromise;
exports.getExistingServiceOrNull = getExistingServiceOrNull;
exports.getServicePromiseOrNull = getServicePromiseOrNull;
exports.getServiceForDoc = getServiceForDoc;
exports.getServicePromiseForDoc = getServicePromiseForDoc;
exports.getServicePromiseOrNullForDoc = getServicePromiseOrNullForDoc;
exports.setParentWindow = setParentWindow;
exports.getParentWindow = getParentWindow;
exports.getTopWindow = getTopWindow;
exports.getParentWindowFrameElement = getParentWindowFrameElement;
exports.getAmpdoc = getAmpdoc;
exports.isDisposable = isDisposable;
exports.assertDisposable = assertDisposable;
exports.disposeServicesForDoc = disposeServicesForDoc;
exports.disposeServicesForEmbed = disposeServicesForEmbed;
exports.installServiceInEmbedIfEmbeddable = installServiceInEmbedIfEmbeddable;
exports.adoptServiceForEmbedDoc = adoptServiceForEmbedDoc;
exports.resetServiceForTesting = resetServiceForTesting;
exports.EmbeddableService = exports.Disposable = void 0;

var _promise = require("./utils/promise");

var _log = require("./log");

var _experiments = require("./experiments");

var _types = require("./types");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Registration and getter functions for AMP services.
 *
 * Invariant: Service getters never return null for registered services.
 */

/**
 * Holds info about a service.
 * - obj: Actual service implementation when available.
 * - promise: Promise for the obj.
 * - resolve: Function to resolve the promise with the object.
 * - context: Argument for ctor, either a window or an ampdoc.
 * - ctor: Function that constructs and returns the service.
 * @typedef {{
 *   obj: (?Object),
 *   promise: (?Promise),
 *   resolve: (?function(!Object)),
 *   reject: (?function((*))),
 *   context: (?Window|?./service/ampdoc-impl.AmpDoc),
 *   ctor: (?function(new:Object, !Window)|
 *          ?function(new:Object, !./service/ampdoc-impl.AmpDoc)),
 * }}
 */
var ServiceHolderDef;
/**
 * This interface provides a `dispose` method that will be called by
 * runtime when a service needs to be disposed of.
 * @interface
 */

var Disposable =
/*#__PURE__*/
function () {
  function Disposable() {}

  var _proto = Disposable.prototype;

  /**
   * Instructs the service to release any resources it might be holding. Can
   * be called only once in the lifecycle of a service.
   */
  _proto.dispose = function dispose() {};

  return Disposable;
}();
/**
 * Services must implement this interface to be embeddable in FIEs.
 * @interface
 */


exports.Disposable = Disposable;

var EmbeddableService =
/*#__PURE__*/
function () {
  function EmbeddableService() {}

  /**
   * Installs a new instance of the service in the given FIE window.
   * @param {!Window} unusedEmbedWin
   * @param {!./service/ampdoc-impl.AmpDoc} unusedAmpDoc
   */
  EmbeddableService.installInEmbedWindow = function installInEmbedWindow(unusedEmbedWin, unusedAmpDoc) {};

  return EmbeddableService;
}();
/**
 * Returns a service with the given id. Assumes that it has been constructed
 * already.
 *
 * @param {!Element|!ShadowRoot} element
 * @param {string} id
 * @return {?Object}
 */


exports.EmbeddableService = EmbeddableService;

function getExistingServiceForDocInEmbedScope(element, id) {
  // TODO(#22733): completely remove this method once ampdoc-fie launches.
  var document = element.ownerDocument;
  var win = (0, _types.toWin)(document.defaultView);
  var topWin = getTopWindow(win); // First, try to resolve via local embed window (if applicable).

  var isEmbed = win != topWin;
  var ampdocFieExperimentOn = (0, _experiments.isExperimentOn)(topWin, 'ampdoc-fie');

  if (isEmbed && !ampdocFieExperimentOn) {
    if (isServiceRegistered(win, id)) {
      return getServiceInternal(win, id);
    } // Fallback from FIE to parent is intentionally unsupported for safety.


    return null;
  } else {
    // Resolve via the element's ampdoc.
    return getServiceForDocOrNullInternal(element, id);
  }
}
/**
 * Installs a service override on amp-doc level.
 * @param {!Window} embedWin
 * @param {string} id
 * @param {!Object} service The service.
 */


function installServiceInEmbedScope(embedWin, id, service) {
  var topWin = getTopWindow(embedWin);
  (0, _log.devAssert)(embedWin != topWin, 'Service override can only be installed in embed window: %s', id);
  (0, _log.devAssert)(!isServiceRegistered(embedWin, id), 'Service override has already been installed: %s', id);
  var ampdocFieExperimentOn = (0, _experiments.isExperimentOn)(topWin, 'ampdoc-fie');

  if (ampdocFieExperimentOn) {
    var ampdoc = getAmpdoc(embedWin.document);
    registerServiceInternal(getAmpdocServiceHolder(ampdoc), ampdoc, id, function () {
      return service;
    },
    /* override */
    true);
  } else {
    registerServiceInternal(embedWin, embedWin, id, function () {
      return service;
    });
    getServiceInternal(embedWin, id); // Force service to build.
  }
}
/**
 * Registers a service given a class to be used as implementation.
 * @param {!Window} win
 * @param {string} id of the service.
 * @param {function(new:Object, !Window)} constructor
 * @param {boolean=} opt_instantiate Whether to immediately create the service
 */


function registerServiceBuilder(win, id, constructor, opt_instantiate) {
  win = getTopWindow(win);
  registerServiceInternal(win, win, id, constructor);

  if (opt_instantiate) {
    getServiceInternal(win, id);
  }
}
/**
 * Returns a service and registers it given a class to be used as
 * implementation.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id of the service.
 * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)} constructor
 * @param {boolean=} opt_instantiate Whether to immediately create the service
 */


function registerServiceBuilderForDoc(nodeOrDoc, id, constructor, opt_instantiate) {
  var ampdoc = getAmpdoc(nodeOrDoc);
  var holder = getAmpdocServiceHolder(ampdoc);
  registerServiceInternal(holder, ampdoc, id, constructor);

  if (opt_instantiate) {
    getServiceInternal(holder, id);
  }
}
/**
 * Reject a service promise.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} id
 * @param {*} error
 */


function rejectServicePromiseForDoc(nodeOrDoc, id, error) {
  var ampdoc = getAmpdoc(nodeOrDoc);
  var holder = getAmpdocServiceHolder(ampdoc);
  rejectServicePromiseInternal(holder, id, error);
}
/**
 * Returns a service for the given id and window (a per-window singleton). Users
 * should typically wrap this as a special purpose function (e.g.
 * `Services.vsyncFor(win)`) for type safety and because the factory should not
 * be passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @template T
 * @return {T}
 */


function getService(win, id) {
  win = getTopWindow(win);
  return getServiceInternal(win, id);
}
/**
 * Returns a promise for a service for the given id and window. Also expects an
 * element that has the actual implementation. The promise resolves when the
 * implementation loaded. Users should typically wrap this as a special purpose
 * function (e.g. `Services.vsyncFor(win)`) for type safety and because the
 * factory should not be passed around.
 * @param {!Window} win
 * @param {string} id of the service.
 * @return {!Promise<!Object>}
 */


function getServicePromise(win, id) {
  return getServicePromiseInternal(win, id);
}
/**
 * Returns a service or null with the given id.
 * @param {!Window} win
 * @param {string} id
 * @return {?Object} The service.
 */


function getExistingServiceOrNull(win, id) {
  win = getTopWindow(win);

  if (isServiceRegistered(win, id)) {
    return getServiceInternal(win, id);
  } else {
    return null;
  }
}
/**
 * Like getServicePromise but returns null if the service was never registered.
 * @param {!Window} win
 * @param {string} id
 * @return {?Promise<!Object>}
 */


function getServicePromiseOrNull(win, id) {
  return getServicePromiseOrNullInternal(win, id);
}
/**
 * Returns a service for the given id and ampdoc (a per-ampdoc singleton).
 * Expects service `id` to be registered.
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string} id
 * @return {T}
 * @template T
 */


function getServiceForDoc(elementOrAmpDoc, id) {
  var ampdoc = getAmpdoc(elementOrAmpDoc);
  var holder = getAmpdocServiceHolder(ampdoc);
  return getServiceInternal(holder, id);
}
/**
 * Returns a service for the given id and ampdoc (a per-ampdoc singleton).
 * If service `id` is not registered, returns null.
 * @param {!Element|!ShadowRoot} element
 * @param {string} id
 * @return {?Object}
 */


function getServiceForDocOrNullInternal(element, id) {
  var ampdoc = getAmpdoc(element);
  var holder = getAmpdocServiceHolder(ampdoc);

  if (isServiceRegistered(holder, id)) {
    return getServiceInternal(holder, id);
  } else {
    return null;
  }
}
/**
 * Returns a promise for a service for the given id and ampdoc. Also expects
 * a service that has the actual implementation. The promise resolves when
 * the implementation loaded.
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string} id
 * @return {!Promise<!Object>}
 */


function getServicePromiseForDoc(elementOrAmpDoc, id) {
  return getServicePromiseInternal(getAmpdocServiceHolder(elementOrAmpDoc), id);
}
/**
 * Like getServicePromiseForDoc but returns null if the service was never
 * registered for this ampdoc.
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {string} id
 * @return {?Promise<!Object>}
 */


function getServicePromiseOrNullForDoc(elementOrAmpDoc, id) {
  return getServicePromiseOrNullInternal(getAmpdocServiceHolder(elementOrAmpDoc), id);
}
/**
 * Set the parent and top windows on a child window (friendly iframe).
 * @param {!Window} win
 * @param {!Window} parentWin
 */


function setParentWindow(win, parentWin) {
  win.__AMP_PARENT = parentWin;
  win.__AMP_TOP = getTopWindow(parentWin);
}
/**
 * Returns the parent window for a child window (friendly iframe).
 * @param {!Window} win
 * @return {!Window}
 */


function getParentWindow(win) {
  return win.__AMP_PARENT || win;
}
/**
 * Returns the top window where AMP Runtime is installed for a child window
 * (friendly iframe).
 * @param {!Window} win
 * @return {!Window}
 */


function getTopWindow(win) {
  return win.__AMP_TOP || (win.__AMP_TOP = win);
}
/**
 * Returns the parent "friendly" iframe if the node belongs to a child window.
 * @param {!Node} node
 * @param {!Window=} opt_topWin
 * @return {?HTMLIFrameElement}
 */


function getParentWindowFrameElement(node, opt_topWin) {
  var childWin = (node.ownerDocument || node).defaultView;
  var topWin = opt_topWin || getTopWindow(childWin);

  if (childWin && childWin != topWin && getTopWindow(childWin) == topWin) {
    try {
      return (
        /** @type {?HTMLIFrameElement} */
        childWin.frameElement
      );
    } catch (e) {// Ignore the error.
    }
  }

  return null;
}
/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/ampdoc-impl.AmpDoc}
 */


function getAmpdoc(nodeOrDoc) {
  if (nodeOrDoc.nodeType) {
    var win = (0, _types.toWin)(
    /** @type {!Document} */
    (nodeOrDoc.ownerDocument || nodeOrDoc).defaultView);
    return getAmpdocService(win).getAmpDoc(
    /** @type {!Node} */
    nodeOrDoc);
  }

  return (
    /** @type {!./service/ampdoc-impl.AmpDoc} */
    nodeOrDoc
  );
}
/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!./service/ampdoc-impl.AmpDoc|!Window}
 */


function getAmpdocServiceHolder(nodeOrDoc) {
  var ampdoc = getAmpdoc(nodeOrDoc);
  return ampdoc.isSingleDoc() ? ampdoc.win : ampdoc;
}
/**
 * This is essentially a duplicate of `ampdoc.js`, but necessary to avoid
 * circular dependencies.
 * @param {!Window} win
 * @return {!./service/ampdoc-impl.AmpDocService}
 */


function getAmpdocService(win) {
  return (
    /** @type {!./service/ampdoc-impl.AmpDocService} */
    getService(win, 'ampdoc')
  );
}
/**
 * Get service `id` from `holder`. Assumes the service
 * has already been registered.
 * @param {!Object} holder Object holding the service instance.
 * @param {string} id of the service.
 * @return {Object}
 * @template T
 */


function getServiceInternal(holder, id) {
  (0, _log.devAssert)(isServiceRegistered(holder, id), "Expected service " + id + " to be registered");
  var services = getServices(holder);
  var s = services[id];

  if (!s.obj) {
    (0, _log.devAssert)(s.ctor, "Service " + id + " registered without ctor nor impl.");
    (0, _log.devAssert)(s.context, "Service " + id + " registered without context.");
    s.obj = new s.ctor(s.context);
    (0, _log.devAssert)(s.obj, "Service " + id + " constructed to null.");
    s.ctor = null;
    s.context = null; // The service may have been requested already, in which case we have a
    // pending promise we need to fulfill.

    if (s.resolve) {
      s.resolve(s.obj);
    }
  }

  return s.obj;
}
/**
 * @param {!Object} holder Object holding the service instance.
 * @param {!Window|!./service/ampdoc-impl.AmpDoc} context Win or AmpDoc.
 * @param {string} id of the service.
 * @param {?function(new:Object, !Window)|?function(new:Object, !./service/ampdoc-impl.AmpDoc)} ctor Constructor function to new the service. Called with context.
 * @param {boolean=} opt_override
 */


function registerServiceInternal(holder, context, id, ctor, opt_override) {
  var services = getServices(holder);
  var s = services[id];

  if (!s) {
    s = services[id] = {
      obj: null,
      promise: null,
      resolve: null,
      reject: null,
      context: null,
      ctor: null
    };
  }

  if (!opt_override && (s.ctor || s.obj)) {
    // Service already registered.
    return;
  }

  s.ctor = ctor;
  s.context = context; // The service may have been requested already, in which case there is a
  // pending promise that needs to fulfilled.

  if (s.resolve) {
    // getServiceInternal will resolve the promise.
    getServiceInternal(holder, id);
  }
}
/**
 * @param {!Object} holder
 * @param {string} id of the service.
 * @return {!Promise<!Object>}
 */


function getServicePromiseInternal(holder, id) {
  var cached = getServicePromiseOrNullInternal(holder, id);

  if (cached) {
    return cached;
  } // Service is not registered.
  // TODO(@cramforce): Add a check that if the element is eventually registered
  // that the service is actually provided and this promise resolves.


  var services = getServices(holder);
  services[id] = emptyServiceHolderWithPromise();
  return (
    /** @type {!Promise<!Object>} */
    services[id].promise
  );
}
/**
 * @param {!Object} holder
 * @param {string} id of the service.
 * @param {*} error
 */


function rejectServicePromiseInternal(holder, id, error) {
  var services = getServices(holder);
  var s = services[id];

  if (s) {
    if (s.reject) {
      s.reject(error);
    }

    return;
  }

  services[id] = emptyServiceHolderWithPromise();
  services[id].reject(error);
}
/**
 * Returns a promise for service `id` if the service has been registered
 * on `holder`.
 * @param {!Object} holder
 * @param {string} id of the service.
 * @return {?Promise<!Object>}
 */


function getServicePromiseOrNullInternal(holder, id) {
  var services = getServices(holder);
  var s = services[id];

  if (s) {
    if (s.promise) {
      return s.promise;
    } else {
      // Instantiate service if not already instantiated.
      getServiceInternal(holder, id);
      return s.promise = Promise.resolve(
      /** @type {!Object} */
      s.obj);
    }
  }

  return null;
}
/**
 * Returns the object that holds the services registered in a holder.
 * @param {!Object} holder
 * @return {!Object<string,!ServiceHolderDef>}
 */


function getServices(holder) {
  var services = holder.__AMP_SERVICES;

  if (!services) {
    services = holder.__AMP_SERVICES = {};
  }

  return services;
}
/**
 * Whether the specified service implements `Disposable` interface.
 * @param {!Object} service
 * @return {boolean}
 */


function isDisposable(service) {
  return typeof service.dispose == 'function';
}
/**
 * Asserts that the specified service implements `Disposable` interface and
 * typecasts the instance to `Disposable`.
 * @param {!Object} service
 * @return {!Disposable}
 */


function assertDisposable(service) {
  (0, _log.devAssert)(isDisposable(service), 'required to implement Disposable');
  return (
    /** @type {!Disposable} */
    service
  );
}
/**
 * Disposes all disposable (implements `Disposable` interface) services in
 * ampdoc scope.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 */


function disposeServicesForDoc(ampdoc) {
  disposeServicesInternal(ampdoc);
}
/**
 * Disposes all disposable (implements `Disposable` interface) services in
 * embed scope.
 * @param {!Window} embedWin
 */


function disposeServicesForEmbed(embedWin) {
  disposeServicesInternal(embedWin);
}
/**
 * @param {!Object} holder Object holding the service instances.
 */


function disposeServicesInternal(holder) {
  // TODO(dvoytenko): Consider marking holder as destroyed for later-arriving
  // service to be canceled automatically.
  var services = getServices(holder);

  var _loop = function _loop(id) {
    if (!Object.prototype.hasOwnProperty.call(services, id)) {
      return "continue";
    }

    var serviceHolder = services[id];

    if (serviceHolder.obj) {
      disposeServiceInternal(id, serviceHolder.obj);
    } else if (serviceHolder.promise) {
      serviceHolder.promise.then(function (instance) {
        return disposeServiceInternal(id, instance);
      });
    }
  };

  for (var id in services) {
    var _ret = _loop(id);

    if (_ret === "continue") continue;
  }
}
/**
 * @param {string} id
 * @param {!Object} service
 */


function disposeServiceInternal(id, service) {
  if (!isDisposable(service)) {
    return;
  }

  try {
    assertDisposable(service).dispose();
  } catch (e) {
    // Ensure that a failure to dispose a service does not disrupt other
    // services.
    (0, _log.dev)().error('SERVICE', 'failed to dispose service', id, e);
  }
}
/**
 * Adopts an embeddable (implements `EmbeddableService` interface) service
 * in embed scope.
 * @param {!Window} embedWin
 * @param {function(new:Object, !./service/ampdoc-impl.AmpDoc)} serviceClass
 * @suppress {missingProperties}
 * @return {boolean}
 */


function installServiceInEmbedIfEmbeddable(embedWin, serviceClass) {
  var isEmbeddableService = typeof serviceClass.installInEmbedWindow === 'function';

  if (!isEmbeddableService) {
    return false;
  }

  var frameElement = (0, _log.dev)().assertElement(embedWin.frameElement, 'frameElement not found for embed');
  var ampdoc = getAmpdoc(frameElement);
  serviceClass.installInEmbedWindow(embedWin, ampdoc);
  return true;
}
/**
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} id
 */


function adoptServiceForEmbedDoc(ampdoc, id) {
  var service = getServiceInternal(getAmpdocServiceHolder((0, _log.devAssert)(ampdoc.getParent())), id);
  registerServiceInternal(getAmpdocServiceHolder(ampdoc), ampdoc, id, function () {
    return service;
  });
}
/**
 * Resets a single service, so it gets recreated on next getService invocation.
 * @param {!Object} holder
 * @param {string} id of the service.
 */


function resetServiceForTesting(holder, id) {
  if (holder.__AMP_SERVICES) {
    holder.__AMP_SERVICES[id] = null;
  }
}
/**
 * @param {!Object} holder Object holding the service instance.
 * @param {string} id of the service.
 * @return {boolean}
 */


function isServiceRegistered(holder, id) {
  var service = holder.__AMP_SERVICES && holder.__AMP_SERVICES[id]; // All registered services must have an implementation or a constructor.

  return !!(service && (service.ctor || service.obj));
}
/** @return {!ServiceHolderDef} */


function emptyServiceHolderWithPromise() {
  var deferred = new _promise.Deferred();
  var promise = deferred.promise,
      resolve = deferred.resolve,
      reject = deferred.reject;
  promise.catch(function () {}); // avoid uncaught exception when service gets rejected

  return {
    obj: null,
    promise: promise,
    resolve: resolve,
    reject: reject,
    context: null,
    ctor: null
  };
}

},{"./experiments":34,"./log":45,"./types":58,"./utils/promise":68}],50:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MutatorInterface = void 0;

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-unused-vars */

/**
 * @interface
 */
var MutatorInterface =
/*#__PURE__*/
function () {
  function MutatorInterface() {}

  var _proto = MutatorInterface.prototype;

  /**
   * Requests the runtime to change the element's size. When the size is
   * successfully updated then the opt_callback is called.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {function()=} opt_callback A callback function.
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   */
  _proto.changeSize = function changeSize(element, newHeight, newWidth, opt_callback, opt_newMargins) {}
  /**
   * Return a promise that requests the runtime to update the size of
   * this element to the specified value.
   * The runtime will schedule this request and attempt to process it
   * as soon as possible. However, unlike in {@link changeSize}, the runtime
   * may refuse to make a change in which case it will reject promise, call the
   * `overflowCallback` method on the target resource with the height value.
   * Overflow callback is expected to provide the reader with the user action
   * to update the height manually.
   * Note that the runtime does not call the `overflowCallback` method if the
   * requested height is 0 or negative.
   * If the height is successfully updated then the promise is resolved.
   * @param {!Element} element
   * @param {number|undefined} newHeight
   * @param {number|undefined} newWidth
   * @param {!../layout-rect.LayoutMarginsChangeDef=} opt_newMargins
   * @return {!Promise}
   * @param {?Event=} opt_event
   */
  ;

  _proto.attemptChangeSize = function attemptChangeSize(element, newHeight, newWidth, opt_newMargins, opt_event) {}
  /**
   * Expands the element.
   * @param {!Element} element
   */
  ;

  _proto.expandElement = function expandElement(element) {}
  /**
   * Return a promise that requests runtime to collapse this element.
   * The runtime will schedule this request and first attempt to resize
   * the element to height and width 0. If success runtime will set element
   * display to none, and notify element owner of this collapse.
   * @param {!Element} element
   * @return {!Promise}
   */
  ;

  _proto.attemptCollapse = function attemptCollapse(element) {}
  /**
   * Collapses the element: ensures that it's `display:none`, notifies its
   * owner and updates the layout box.
   * @param {!Element} element
   */
  ;

  _proto.collapseElement = function collapseElement(element) {}
  /**
   * Runs the specified measure, which is called in the "measure" vsync phase.
   * This is simply a proxy to the privileged vsync service.
   *
   * @param {function()} measurer
   * @return {!Promise}
   */
  ;

  _proto.measureElement = function measureElement(measurer) {}
  /**
   * Runs the specified mutation on the element and ensures that remeasures and
   * layouts performed for the affected elements.
   *
   * This method should be called whenever a significant mutations are done
   * on the DOM that could affect layout of elements inside this subtree or
   * its siblings. The top-most affected element should be specified as the
   * first argument to this method and all the mutation work should be done
   * in the mutator callback which is called in the "mutation" vsync phase.
   *
   * @param {!Element} element
   * @param {function()} mutator
   * @return {!Promise}
   */
  ;

  _proto.mutateElement = function mutateElement(element, mutator) {}
  /**
   * Runs the specified mutation on the element and ensures that remeasures and
   * layouts performed for the affected elements.
   *
   * This method should be called whenever a significant mutations are done
   * on the DOM that could affect layout of elements inside this subtree or
   * its siblings. The top-most affected element should be specified as the
   * first argument to this method and all the mutation work should be done
   * in the mutator callback which is called in the "mutation" vsync phase.
   *
   * @param {!Element} element
   * @param {?function()} measurer
   * @param {function()} mutator
   * @return {!Promise}
   */
  ;

  _proto.measureMutateElement = function measureMutateElement(element, measurer, mutator) {};

  return MutatorInterface;
}();
/* eslint-enable no-unused-vars */


exports.MutatorInterface = MutatorInterface;

},{}],51:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ResourcesInterface = exports.READY_SCAN_SIGNAL = void 0;

var _mutatorInterface = require("./mutator-interface");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/** @const {string} */
var READY_SCAN_SIGNAL = 'ready-scan';
/* eslint-disable no-unused-vars */

/**
 * @interface
 */

exports.READY_SCAN_SIGNAL = READY_SCAN_SIGNAL;

var ResourcesInterface =
/*#__PURE__*/
function (_MutatorInterface) {
  _inheritsLoose(ResourcesInterface, _MutatorInterface);

  function ResourcesInterface() {
    return _MutatorInterface.apply(this, arguments) || this;
  }

  var _proto = ResourcesInterface.prototype;

  /**
   * Returns a list of resources.
   * @return {!Array<!./resource.Resource>}
   * @export
   */
  _proto.get = function get() {}
  /**
   * @return {!./ampdoc-impl.AmpDoc}
   */
  ;

  _proto.getAmpdoc = function getAmpdoc() {}
  /**
   * Returns the {@link Resource} instance corresponding to the specified AMP
   * Element. If no Resource is found, the exception is thrown.
   * @param {!AmpElement} element
   * @return {!./resource.Resource}
   */
  ;

  _proto.getResourceForElement = function getResourceForElement(element) {}
  /**
   * Returns the {@link Resource} instance corresponding to the specified AMP
   * Element. Returns null if no resource is found.
   * @param {!AmpElement} element
   * @return {?./resource.Resource}
   */
  ;

  _proto.getResourceForElementOptional = function getResourceForElementOptional(element) {}
  /**
   * Returns the direction the user last scrolled.
   *  - -1 for scrolling up
   *  - 1 for scrolling down
   *  - Defaults to 1
   * TODO(lannka): this method should not belong to resources.
   * @return {number}
   */
  ;

  _proto.getScrollDirection = function getScrollDirection() {}
  /**
   * Signals that an element has been added to the DOM. Resources manager
   * will start tracking it from this point on.
   * @param {!AmpElement} element
   */
  ;

  _proto.add = function add(element) {}
  /**
   * Signals that an element has been upgraded to the DOM. Resources manager
   * will perform build and enable layout/viewport signals for this element.
   * @param {!AmpElement} element
   */
  ;

  _proto.upgraded = function upgraded(element) {}
  /**
   * Signals that an element has been removed to the DOM. Resources manager
   * will stop tracking it from this point on.
   * @param {!AmpElement} element
   */
  ;

  _proto.remove = function remove(element) {}
  /**
   * Schedules layout or preload for the specified resource.
   * @param {!./resource.Resource} resource
   * @param {boolean} layout
   * @param {number=} opt_parentPriority
   * @param {boolean=} opt_forceOutsideViewport
   * @package
   */
  ;

  _proto.scheduleLayoutOrPreload = function scheduleLayoutOrPreload(resource, layout, opt_parentPriority, opt_forceOutsideViewport) {}
  /**
   * Schedules the work pass at the latest with the specified delay.
   * @param {number=} opt_delay
   * @param {boolean=} opt_relayoutAll
   * @return {boolean}
   */
  ;

  _proto.schedulePass = function schedulePass(opt_delay, opt_relayoutAll) {}
  /**
   * Registers a callback to be called when the next pass happens.
   * @param {function()} callback
   */
  ;

  _proto.onNextPass = function onNextPass(callback) {}
  /**
   * @return {!Promise} when first pass executed.
   */
  ;

  _proto.whenFirstPass = function whenFirstPass() {}
  /**
   * Called when main AMP binary is fully initialized.
   * May never be called in Shadow Mode.
   */
  ;

  _proto.ampInitComplete = function ampInitComplete() {}
  /**
   * Updates the priority of the resource. If there are tasks currently
   * scheduled, their priority is updated as well.
   * @param {!Element} element
   * @param {number} newLayoutPriority
   */
  ;

  _proto.updateLayoutPriority = function updateLayoutPriority(element, newLayoutPriority) {};

  return ResourcesInterface;
}(_mutatorInterface.MutatorInterface);
/* eslint-enable no-unused-vars */


exports.ResourcesInterface = ResourcesInterface;

},{"./mutator-interface":50}],52:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getTimingDataAsync = getTimingDataAsync;
exports.getTimingDataSync = getTimingDataSync;
exports.getNavigationData = getNavigationData;
exports.VariableSource = exports.AsyncResolverDef = exports.SyncResolverDef = exports.ResolverReturnDef = void 0;

var _services = require("../services");

var _log = require("../log");

var _types = require("../types");

var _eventHelper = require("../event-helper");

var _documentReady = require("../document-ready");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @typedef {string|number|boolean|undefined|null} */
var ResolverReturnDef;
/** @typedef {function(...string):ResolverReturnDef} */

exports.ResolverReturnDef = ResolverReturnDef;
var SyncResolverDef;
/** @typedef {function(...string):!Promise<ResolverReturnDef>} */

exports.SyncResolverDef = SyncResolverDef;
var AsyncResolverDef;
/** @typedef {{sync: SyncResolverDef, async: AsyncResolverDef}} */

exports.AsyncResolverDef = AsyncResolverDef;
var ReplacementDef;
/**
 * A list of events that the navTiming needs to wait for.
 * Sort event in order
 * @enum {number}
 */

var WAITFOR_EVENTS = {
  VIEWER_FIRST_VISIBLE: 1,
  DOCUMENT_COMPLETE: 2,
  LOAD: 3,
  LOAD_END: 4
};
/**
 * A list of events on which event they should wait
 * @const {!Object<string, WAITFOR_EVENTS>}
 */

var NAV_TIMING_WAITFOR_EVENTS = {
  // ready on viewer first visible
  'navigationStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'redirectStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'redirectEnd': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'fetchStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'domainLookupStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'domainLookupEnd': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'connectStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'secureConnectionStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'connectEnd': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'requestStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'responseStart': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  'responseEnd': WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE,
  // ready on document complte
  'domLoading': WAITFOR_EVENTS.DOCUMENT_COMPLETE,
  'domInteractive': WAITFOR_EVENTS.DOCUMENT_COMPLETE,
  'domContentLoaded': WAITFOR_EVENTS.DOCUMENT_COMPLETE,
  'domComplete': WAITFOR_EVENTS.DOCUMENT_COMPLETE,
  // ready on load
  'loadEventStart': WAITFOR_EVENTS.LOAD,
  // ready on load complete
  'loadEventEnd': WAITFOR_EVENTS.LOAD_END
};
/**
 * Returns navigation timing information based on the start and end events.
 * The data for the timing events is retrieved from performance.timing API.
 * If start and end events are both given, the result is the difference between
 * the two. If only start event is given, the result is the timing value at
 * start event.
 * @param {!Window} win
 * @param {string} startEvent
 * @param {string=} endEvent
 * @return {!Promise<ResolverReturnDef>}
 */

function getTimingDataAsync(win, startEvent, endEvent) {
  // Fallback to load event if we don't know what to wait for
  var startWaitForEvent = NAV_TIMING_WAITFOR_EVENTS[startEvent] || WAITFOR_EVENTS.LOAD;
  var endWaitForEvent = endEvent ? NAV_TIMING_WAITFOR_EVENTS[endEvent] || WAITFOR_EVENTS.LOAD : startWaitForEvent;
  var waitForEvent = Math.max(startWaitForEvent, endWaitForEvent); // set wait for onload to be default

  var readyPromise;

  if (waitForEvent === WAITFOR_EVENTS.VIEWER_FIRST_VISIBLE) {
    readyPromise = Promise.resolve();
  } else if (waitForEvent === WAITFOR_EVENTS.DOCUMENT_COMPLETE) {
    readyPromise = (0, _documentReady.whenDocumentComplete)(win.document);
  } else if (waitForEvent === WAITFOR_EVENTS.LOAD) {
    readyPromise = (0, _eventHelper.loadPromise)(win);
  } else if (waitForEvent === WAITFOR_EVENTS.LOAD_END) {
    // performance.timing.loadEventEnd returns 0 before the load event handler
    // has terminated, that's when the load event is completed.
    // To wait for the event handler to terminate, wait 1ms and defer to the
    // event loop.
    var timer = _services.Services.timerFor(win);

    readyPromise = (0, _eventHelper.loadPromise)(win).then(function () {
      return timer.promise(1);
    });
  }

  (0, _log.devAssert)(readyPromise, 'waitForEvent not supported ' + waitForEvent);
  return readyPromise.then(function () {
    return getTimingDataSync(win, startEvent, endEvent);
  });
}
/**
 * Returns navigation timing information based on the start and end events.
 * The data for the timing events is retrieved from performance.timing API.
 * If start and end events are both given, the result is the difference between
 * the two. If only start event is given, the result is the timing value at
 * start event. Enforces synchronous evaluation.
 * @param {!Window} win
 * @param {string} startEvent
 * @param {string=} endEvent
 * @return {ResolverReturnDef} undefined if API is not available, empty string
 *    if it is not yet available, or value as string
 */


function getTimingDataSync(win, startEvent, endEvent) {
  var timingInfo = win['performance'] && win['performance']['timing'];

  if (!timingInfo || timingInfo['navigationStart'] == 0) {
    // Navigation timing API is not supported.
    return;
  }

  var metric = endEvent === undefined ? timingInfo[startEvent] : timingInfo[endEvent] - timingInfo[startEvent];

  if (!(0, _types.isFiniteNumber)(metric) || metric < 0) {
    // The metric is not supported.
    return;
  } else {
    return metric;
  }
}
/**
 * Returns navigation information from the current browsing context.
 * @param {!Window} win
 * @param {string} attribute
 * @return {ResolverReturnDef}
 * @private
 */


function getNavigationData(win, attribute) {
  var navigationInfo = win['performance'] && win['performance']['navigation'];

  if (!navigationInfo || navigationInfo[attribute] === undefined) {
    // PerformanceNavigation interface is not supported or attribute is not
    // implemented.
    return;
  }

  return navigationInfo[attribute];
}
/**
 * A class to provide variable substitution related features. Extend this class
 * and override initialize() to add more supported variables.
 */


var VariableSource =
/*#__PURE__*/
function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function VariableSource(ampdoc) {
    /** @protected @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;
    /** @private @const {!Object<string, !ReplacementDef>} */

    this.replacements_ = Object.create(null);
    /** @private {boolean} */

    this.initialized_ = false;
    this.getUrlMacroWhitelist_();
  }
  /**
   * Lazily initialize the default replacements.
   * @private
   */


  var _proto = VariableSource.prototype;

  _proto.initialize_ = function initialize_() {
    this.initialize();
    this.initialized_ = true;
  }
  /**
   * Override this method to set all the variables supported by derived class.
   */
  ;

  _proto.initialize = function initialize() {} // Needs to be implemented by derived classes.

  /**
   * Method exists to assist stubbing in tests.
   * @param {string} name
   * @return {!ReplacementDef}
   */
  ;

  _proto.get = function get(name) {
    if (!this.initialized_) {
      this.initialize_();
    }

    return this.replacements_[name];
  }
  /**
   * Sets a synchronous value resolver for the variable with the specified name.
   * The value resolver may optionally take an extra parameter.
   * Can be called in conjunction with setAsync to allow for additional
   * asynchronous resolver where expand will use async and expandSync the sync
   * version.
   * @param {string} varName
   * @param {!SyncResolverDef} syncResolver
   * @return {!VariableSource}
   */
  ;

  _proto.set = function set(varName, syncResolver) {
    (0, _log.devAssert)(varName.indexOf('RETURN') == -1);
    this.replacements_[varName] = this.replacements_[varName] || {
      sync: undefined,
      async: undefined
    };
    this.replacements_[varName].sync = syncResolver;
    return this;
  }
  /**
   * Sets an async value resolver for the variable with the specified name.
   * The value resolver may optionally take an extra parameter.
   * Can be called in conjuction with setAsync to allow for additional
   * asynchronous resolver where expand will use async and expandSync the sync
   * version.
   * @param {string} varName
   * @param {!AsyncResolverDef} asyncResolver
   * @return {!VariableSource}
   */
  ;

  _proto.setAsync = function setAsync(varName, asyncResolver) {
    (0, _log.devAssert)(varName.indexOf('RETURN') == -1);
    this.replacements_[varName] = this.replacements_[varName] || {
      sync: undefined,
      async: undefined
    };
    this.replacements_[varName].async = asyncResolver;
    return this;
  }
  /**
   * Helper method to set both sync and async resolvers.
   * @param {string} varName
   * @param {!SyncResolverDef} syncResolver
   * @param {!AsyncResolverDef} asyncResolver
   * @return {!VariableSource}
   */
  ;

  _proto.setBoth = function setBoth(varName, syncResolver, asyncResolver) {
    return this.set(varName, syncResolver).setAsync(varName, asyncResolver);
  }
  /**
   * Returns a Regular expression that can be used to detect all the variables
   * in a template.
   * @param {!Object<string, *>=} opt_bindings
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *   that can be substituted.
   * @return {!RegExp}
   */
  ;

  _proto.getExpr = function getExpr(opt_bindings, opt_whiteList) {
    if (!this.initialized_) {
      this.initialize_();
    }

    var all = Object.assign({}, this.replacements_, opt_bindings);
    return this.buildExpr_(Object.keys(all), opt_whiteList);
  }
  /**
   * @param {!Array<string>} keys
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *   that can be substituted.
   * @return {!RegExp}
   * @private
   */
  ;

  _proto.buildExpr_ = function buildExpr_(keys, opt_whiteList) {
    var _this = this;

    // If a whitelist is present, the keys must belong to the whitelist.
    // We filter the keys one last time to ensure no unwhitelisted key is
    // allowed.
    if (this.getUrlMacroWhitelist_()) {
      keys = keys.filter(function (key) {
        return _this.getUrlMacroWhitelist_().includes(key);
      });
    } // If a whitelist is passed into the call to GlobalVariableSource.expand_
    // then we only resolve values contained in the whitelist.


    if (opt_whiteList) {
      keys = keys.filter(function (key) {
        return opt_whiteList[key];
      });
    }

    if (keys.length === 0) {
      var regexThatMatchesNothing = /_^/g; // lgtm [js/regex/unmatchable-caret]

      return regexThatMatchesNothing;
    } // The keys must be sorted to ensure that the longest keys are considered
    // first. This avoids a problem where a RANDOM conflicts with RANDOM_ONE.


    keys.sort(function (s1, s2) {
      return s2.length - s1.length;
    }); // Keys that start with a `$` need to be escaped so that they do not
    // interfere with the regex that is constructed.

    var escaped = keys.map(function (key) {
      if (key[0] === '$') {
        return '\\' + key;
      }

      return key;
    });
    var all = escaped.join('|'); // Match the given replacement patterns, as well as optionally
    // arguments to the replacement behind it in parentheses.
    // Example string that match
    // FOO_BAR
    // FOO_BAR(arg1)
    // FOO_BAR(arg1,arg2)
    // FOO_BAR(arg1, arg2)

    var regexStr = '\\$?(' + all + ')';
    return new RegExp(regexStr, 'g');
  }
  /**
   * @return {?Array<string>} The whitelist of allowed AMP variables. (if provided in
   *     a meta tag).
   * @private
   */
  ;

  _proto.getUrlMacroWhitelist_ = function getUrlMacroWhitelist_() {
    if (this.variableWhitelist_) {
      return this.variableWhitelist_;
    }

    var _this$ampdoc$getRootN = this.ampdoc.getRootNode(),
        head = _this$ampdoc$getRootN.head;

    if (!head) {
      return null;
    } // A meta[name="amp-allowed-url-macros"] tag, if present,
    // contains, in its content attribute, a whitelist of variable substitution.


    var meta = head.querySelector('meta[name="amp-allowed-url-macros"]');

    if (!meta) {
      return null;
    }
    /**
     * The whitelist of variables allowed for variable substitution.
     * @private {?Array<string>}
     */


    this.variableWhitelist_ = meta.getAttribute('content').split(',').map(function (variable) {
      return variable.trim();
    });
    return this.variableWhitelist_;
  };

  return VariableSource;
}();

exports.VariableSource = VariableSource;

},{"../document-ready":28,"../event-helper":33,"../log":45,"../services":53,"../types":58}],53:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.Services = exports.SubscriptionService = void 0;

var _service = require("./service");

var _elementService = require("./element-service");

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @typedef {!../extensions/amp-subscriptions/0.1/amp-subscriptions.SubscriptionService} */
var SubscriptionService;
exports.SubscriptionService = SubscriptionService;

var Services =
/*#__PURE__*/
function () {
  function Services() {}

  /**
   * Hint: Add extensions folder path to compile.js with
   * warnings cannot find modules.
   */

  /**
   * Returns a promise for the Access service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  Services.accessServiceForDoc = function accessServiceForDoc(element) {
    return (
      /** @type {!Promise<!../extensions/amp-access/0.1/amp-access.AccessService>} */
      (0, _elementService.getElementServiceForDoc)(element, 'access', 'amp-access')
    );
  }
  /**
   * Returns a promise for the Access service or a promise for null if the
   * service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>}
   */
  ;

  Services.accessServiceForDocOrNull = function accessServiceForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-access/0.1/amp-access.AccessService>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'access', 'amp-access')
    );
  }
  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!SubscriptionService>}
   */
  ;

  Services.subscriptionsServiceForDoc = function subscriptionsServiceForDoc(element) {
    return (
      /** @type {!Promise<!SubscriptionService>} */
      (0, _elementService.getElementServiceForDoc)(element, 'subscriptions', 'amp-subscriptions')
    );
  }
  /**
   * Returns a promise for the Subscriptions service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?SubscriptionService>}
   */
  ;

  Services.subscriptionsServiceForDocOrNull = function subscriptionsServiceForDocOrNull(element) {
    return (
      /** @type {!Promise<?SubscriptionService>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'subscriptions', 'amp-subscriptions')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/action-impl.ActionService}
   */
  ;

  Services.actionServiceForDoc = function actionServiceForDoc(element) {
    return (
      /** @type {!./service/action-impl.ActionService} */
      (0, _service.getExistingServiceForDocInEmbedScope)(element, 'action')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/standard-actions-impl.StandardActions}
   */
  ;

  Services.standardActionsForDoc = function standardActionsForDoc(element) {
    return (
      /** @type {!./service/standard-actions-impl.StandardActions} */
      (0, _service.getExistingServiceForDocInEmbedScope)(element, 'standard-actions')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>}
   */
  ;

  Services.activityForDoc = function activityForDoc(element) {
    return (
      /** @type {!Promise<!../extensions/amp-analytics/0.1/activity-impl.Activity>} */
      (0, _elementService.getElementServiceForDoc)(element, 'activity', 'amp-analytics')
    );
  }
  /**
   * Returns the global instance of the `AmpDocService` service that can be
   * used to resolve an ampdoc for any node: either in the single-doc or
   * shadow-doc environment.
   * @param {!Window} window
   * @return {!./service/ampdoc-impl.AmpDocService}
   */
  ;

  Services.ampdocServiceFor = function ampdocServiceFor(window) {
    return (
      /** @type {!./service/ampdoc-impl.AmpDocService} */
      (0, _service.getService)(window, 'ampdoc')
    );
  }
  /**
   * Returns the AmpDoc for the specified context node.
   * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrAmpDoc
   * @return {!./service/ampdoc-impl.AmpDoc}
   */
  ;

  Services.ampdoc = function ampdoc(nodeOrAmpDoc) {
    return (0, _service.getAmpdoc)(nodeOrAmpDoc);
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @param {boolean=} loadAnalytics
   * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  ;

  Services.analyticsForDoc = function analyticsForDoc(element, loadAnalytics) {
    if (loadAnalytics === void 0) {
      loadAnalytics = false;
    }

    if (loadAnalytics) {
      // Get Extensions service and force load analytics extension.
      var ampdoc = (0, _service.getAmpdoc)(element);
      Services.extensionsFor(ampdoc.win).
      /*OK*/
      installExtensionForDoc(ampdoc, 'amp-analytics');
    }

    return (
      /** @type {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */
      (0, _elementService.getElementServiceForDoc)(element, 'amp-analytics-instrumentation', 'amp-analytics')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
   */
  ;

  Services.analyticsForDocOrNull = function analyticsForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'amp-analytics-instrumentation', 'amp-analytics')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/batched-xhr-impl.BatchedXhr}
   */
  ;

  Services.batchedXhrFor = function batchedXhrFor(window) {
    return (
      /** @type {!./service/batched-xhr-impl.BatchedXhr} */
      (0, _service.getService)(window, 'batched-xhr')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>}
   */
  ;

  Services.bindForDocOrNull = function bindForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-bind/0.1/bind-impl.Bind>} */
      (0, _elementService.getElementServiceIfAvailableForDocInEmbedScope)(element, 'bind', 'amp-bind')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/cid-impl.CidDef>}
   */
  ;

  Services.cidForDoc = function cidForDoc(elementOrAmpDoc) {
    return (
      /** @type {!Promise<!./service/cid-impl.CidDef>} */
      (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, 'cid')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/navigation.Navigation}
   */
  ;

  Services.navigationForDoc = function navigationForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/navigation.Navigation} */
      (0, _service.getServiceForDoc)(elementOrAmpDoc, 'navigation')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>}
   */
  ;

  Services.loaderServiceForDoc = function loaderServiceForDoc(element) {
    return (
      /** @type {!Promise<!../extensions/amp-loader/0.1/amp-loader.LoaderService>} */
      (0, _elementService.getElementServiceForDoc)(element, 'loader', 'amp-loader')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>}
   */
  ;

  Services.standaloneServiceForDoc = function standaloneServiceForDoc(element) {
    return (
      /** @type {!Promise<!../extensions/amp-standalone/0.1/amp-standalone.StandaloneService>} */
      (0, _elementService.getElementServiceForDoc)(element, 'standalone', 'amp-standalone')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/crypto-impl.Crypto}
   */
  ;

  Services.cryptoFor = function cryptoFor(window) {
    return (
      /** @type {!./service/crypto-impl.Crypto} */
      (0, _service.getService)(window, 'crypto')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/document-info-impl.DocumentInfoDef} Info about the doc
   */
  ;

  Services.documentInfoForDoc = function documentInfoForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/document-info-impl.DocInfo} */
      (0, _service.getServiceForDoc)(elementOrAmpDoc, 'documentInfo').get()
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/extensions-impl.Extensions}
   */
  ;

  Services.extensionsFor = function extensionsFor(window) {
    return (
      /** @type {!./service/extensions-impl.Extensions} */
      (0, _service.getService)(window, 'extensions')
    );
  }
  /**
   * Returns a service to register callbacks we wish to execute when an
   * amp-form is submitted.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>}
   */
  ;

  Services.formSubmitForDoc = function formSubmitForDoc(elementOrAmpDoc) {
    return (
      /** @type {!Promise<../extensions/amp-form/0.1/form-submit-service.FormSubmitService>} */
      (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, 'form-submit-service')
    );
  }
  /**
   * Returns service to listen for `hidden` attribute mutations.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/hidden-observer-impl.HiddenObserver}
   */
  ;

  Services.hiddenObserverForDoc = function hiddenObserverForDoc(element) {
    return (
      /** @type {!./service/hidden-observer-impl.HiddenObserver} */
      (0, _service.getExistingServiceForDocInEmbedScope)(element, 'hidden-observer')
    );
  }
  /**
   * Returns service implemented in service/history-impl.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/history-impl.History}
   */
  ;

  Services.historyForDoc = function historyForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/history-impl.History} */
      (0, _service.getServiceForDoc)(elementOrAmpDoc, 'history')
    );
  }
  /**
   * @param {!Window} win
   * @return {!./input.Input}
   */
  ;

  Services.inputFor = function inputFor(win) {
    return (0, _service.getService)(win, 'input');
  }
  /**s
   * Returns a promise for the Inputmask service.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>}
   */
  ;

  Services.inputmaskServiceForDocOrNull = function inputmaskServiceForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-inputmask/0.1/amp-inputmask.AmpInputmaskService>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'inputmask', 'amp-inputmask')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/owners-interface.OwnersInterface}
   */
  ;

  Services.ownersForDoc = function ownersForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/owners-interface.OwnersInterface} */
      (0, _service.getServiceForDoc)(elementOrAmpDoc, 'owners')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/performance-impl.Performance}
   */
  ;

  Services.performanceFor = function performanceFor(window) {
    return (
      /** @type {!./service/performance-impl.Performance}*/
      (0, _service.getService)(window, 'performance')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/performance-impl.Performance}
   */
  ;

  Services.performanceForOrNull = function performanceForOrNull(window) {
    return (
      /** @type {!./service/performance-impl.Performance}*/
      (0, _service.getExistingServiceOrNull)(window, 'performance')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/platform-impl.Platform}
   */
  ;

  Services.platformFor = function platformFor(window) {
    return (
      /** @type {!./service/platform-impl.Platform} */
      (0, _service.getService)(window, 'platform')
    );
  }
  /**
   * Not installed by default; must be installed in extension code before use.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/position-observer/position-observer-impl.PositionObserver}
   * @throws If the service is not installed.
   */
  ;

  Services.positionObserverForDoc = function positionObserverForDoc(element) {
    return (
      /** @type {!./service/position-observer/position-observer-impl.PositionObserver} */
      (0, _service.getServiceForDoc)(element, 'position-observer')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/resources-interface.ResourcesInterface}
   */
  ;

  Services.resourcesForDoc = function resourcesForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/resources-interface.ResourcesInterface} */
      (0, _service.getServiceForDoc)(elementOrAmpDoc, 'resources')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/resources-interface.ResourcesInterface>}
   */
  ;

  Services.resourcesPromiseForDoc = function resourcesPromiseForDoc(elementOrAmpDoc) {
    return (
      /** @type {!Promise<!./service/resources-interface.ResourcesInterface>} */
      (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, 'resources')
    );
  }
  /**
   * @param {!Window} win
   * @return {?Promise<?{incomingFragment: string, outgoingFragment: string}>}
   */
  ;

  Services.shareTrackingForOrNull = function shareTrackingForOrNull(win) {
    return (
      /** @type {!Promise<?{incomingFragment: string, outgoingFragment: string}>} */
      (0, _elementService.getElementServiceIfAvailable)(win, 'share-tracking', 'amp-share-tracking', true)
    );
  }
  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/variable-service.StoryVariableDef>}
   */
  ;

  Services.storyVariableServiceForOrNull = function storyVariableServiceForOrNull(win) {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/variable-service.StoryVariableDef>} */
      (0, _elementService.getElementServiceIfAvailable)(win, 'story-variable', 'amp-story', true)
    );
  }
  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService}
   */
  ;

  Services.storyVariableService = function storyVariableService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/variable-service.AmpStoryVariableService} */
      (0, _service.getExistingServiceOrNull)(win, 'story-variable')
    );
  }
  /**
   * Version of the story store service depends on which version of amp-story
   * the publisher is loading. They all have the same implementation.
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService|?../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService>}
   */
  ;

  Services.storyStoreServiceForOrNull = function storyStoreServiceForOrNull(win) {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService|?../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService>} */
      (0, _elementService.getElementServiceIfAvailable)(win, 'story-store', 'amp-story')
    );
  }
  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService}
   */
  ;

  Services.storyStoreService = function storyStoreService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
      (0, _service.getExistingServiceOrNull)(win, 'story-store')
    );
  }
  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-media-query-service.AmpStoryMediaQueryService}
   */
  ;

  Services.storyMediaQueryService = function storyMediaQueryService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/amp-story-media-query-service.AmpStoryMediaQueryService} */
      (0, _service.getExistingServiceOrNull)(win, 'story-media-query')
    );
  }
  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService}
   */
  ;

  Services.storyRequestService = function storyRequestService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/amp-story-request-service.AmpStoryRequestService} */
      (0, _service.getExistingServiceOrNull)(win, 'story-request')
    );
  }
  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService}
   */
  ;

  Services.mediaPerformanceMetricsService = function mediaPerformanceMetricsService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/media-performance-metrics-service.MediaPerformanceMetricsService} */
      (0, _service.getExistingServiceOrNull)(win, 'media-performance-metrics')
    );
  }
  /**
   * @param {!Window} win
   * @return {!Promise<?./service/localization.LocalizationService>}
   */
  ;

  Services.localizationServiceForOrNull = function localizationServiceForOrNull(win) {
    return (
      /** @type {!Promise<?./service/localization.LocalizationService>} */
      (0, _elementService.getElementServiceIfAvailable)(win, 'localization', 'amp-story', true)
    );
  }
  /**
   * @param {!Window} win
   * @return {!./service/localization.LocalizationService}
   */
  ;

  Services.localizationService = function localizationService(win) {
    return (0, _service.getService)(win, 'localization');
  }
  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>}
   */
  ;

  Services.storyAnalyticsServiceForOrNull = function storyAnalyticsServiceForOrNull(win) {
    return (
      /** @type {!Promise<?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService>} */
      (0, _elementService.getElementServiceIfAvailable)(win, 'story-analytics', 'amp-story', true)
    );
  }
  /**
   * @param {!Window} win
   * @return {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService}
   */
  ;

  Services.storyAnalyticsService = function storyAnalyticsService(win) {
    return (
      /** @type {?../extensions/amp-story/1.0/story-analytics.StoryAnalyticsService} */
      (0, _service.getExistingServiceOrNull)(win, 'story-analytics')
    );
  }
  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!../extensions/amp-story/0.1/amp-story-store-service.AmpStoryStoreService}
   */
  ;

  Services.storyStoreServiceV01 = function storyStoreServiceV01(win) {
    return (0, _service.getService)(win, 'story-store');
  }
  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!../extensions/amp-story/0.1/amp-story-request-service.AmpStoryRequestService}
   */
  ;

  Services.storyRequestServiceV01 = function storyRequestServiceV01(win) {
    return (0, _service.getService)(win, 'story-request-v01');
  }
  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!Promise<?./service/localization.LocalizationService>}
   */
  ;

  Services.localizationServiceForOrNullV01 = function localizationServiceForOrNullV01(win) {
    return (
      /** @type {!Promise<?./service/localization.LocalizationService>} */
      (0, _elementService.getElementServiceIfAvailable)(win, 'localization-v01', 'amp-story', true)
    );
  }
  /**
   * TODO(#14357): Remove this when amp-story:0.1 is deprecated.
   * @param {!Window} win
   * @return {!./service/localization.LocalizationService}
   */
  ;

  Services.localizationServiceV01 = function localizationServiceV01(win) {
    return (0, _service.getService)(win, 'localization-v01');
  }
  /**
   * @param {!Window} win
   * @return {?Promise<?../extensions/amp-viewer-integration/0.1/variable-service.ViewerIntegrationVariableDef>}
   */
  ;

  Services.viewerIntegrationVariableServiceForOrNull = function viewerIntegrationVariableServiceForOrNull(win) {
    return (
      /** @type {!Promise<?../extensions/amp-viewer-integration/0.1/variable-service.ViewerIntegrationVariableDef>} */
      (0, _elementService.getElementServiceIfAvailable)(win, 'viewer-integration-variable', 'amp-viewer-integration', true)
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>}
   */
  ;

  Services.webAnimationServiceFor = function webAnimationServiceFor(element) {
    return (
      /** @type {!Promise<!../extensions/amp-animation/0.1/web-animation-service.WebAnimationService>} */
      (0, _elementService.getElementServiceForDoc)(element, 'web-animation', 'amp-animation')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/storage-impl.Storage>}
   */
  ;

  Services.storageForDoc = function storageForDoc(elementOrAmpDoc) {
    return (
      /** @type {!Promise<!./service/storage-impl.Storage>} */
      (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, 'storage')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/template-impl.Templates}
   */
  ;

  Services.templatesFor = function templatesFor(window) {
    return (
      /** @type {!./service/template-impl.Templates} */
      (0, _service.getService)(window, 'templates')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/timer-impl.Timer}
   */
  ;

  Services.timerFor = function timerFor(window) {
    // TODO(alabiaga): This will always return the top window's Timer service.
    return (
      /** @type {!./service/timer-impl.Timer} */
      (0, _service.getService)(window, 'timer')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/url-replacements-impl.UrlReplacements}
   */
  ;

  Services.urlReplacementsForDoc = function urlReplacementsForDoc(element) {
    return (
      /** @type {!./service/url-replacements-impl.UrlReplacements} */
      (0, _service.getExistingServiceForDocInEmbedScope)(element, 'url-replace')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>}
   */
  ;

  Services.userNotificationManagerForDoc = function userNotificationManagerForDoc(element) {
    return (
      /** @type {!Promise<!../extensions/amp-user-notification/0.1/amp-user-notification.UserNotificationManager>} */
      (0, _elementService.getElementServiceForDoc)(element, 'userNotificationManager', 'amp-user-notification')
    );
  }
  /**
   * Returns a promise for the consentPolicy Service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>}
   */
  ;

  Services.consentPolicyServiceForDocOrNull = function consentPolicyServiceForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-consent/0.1/consent-policy-manager.ConsentPolicyManager>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'consentPolicyManager', 'amp-consent')
    );
  }
  /**
   * Returns a promise for the geo service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>}
   */
  ;

  Services.geoForDocOrNull = function geoForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-geo/0.1/amp-geo.GeoDef>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'geo', 'amp-geo', true)
    );
  }
  /**
   * Returns a promise for the geo service or a promise for null if
   * the service is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-user-location/0.1/user-location-service.UserLocationService>}
   */
  ;

  Services.userLocationForDocOrNull = function userLocationForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-user-location/0.1/user-location-service.UserLocationService>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'user-location', 'amp-user-location', true)
    );
  }
  /**
   * Unlike most service getters, passing `Node` is necessary for some FIE-scope
   * services since sometimes we only have the FIE Document for context.
   * @param {!Element|!ShadowRoot} element
   * @return {!./service/url-impl.Url}
   */
  ;

  Services.urlForDoc = function urlForDoc(element) {
    return (
      /** @type {!./service/url-impl.Url} */
      (0, _service.getExistingServiceForDocInEmbedScope)(element, 'url')
    );
  }
  /**
   * Returns a promise for the experiment variants or a promise for null if it
   * is not available on the current page.
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>}
   */
  ;

  Services.variantsForDocOrNull = function variantsForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-experiment/0.1/variant.Variants>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'variant', 'amp-experiment', true)
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/video-manager-impl.VideoManager}
   */
  ;

  Services.videoManagerForDoc = function videoManagerForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/video-manager-impl.VideoManager} */
      (0, _service.getServiceForDoc)(elementOrAmpDoc, 'video-manager')
    );
  }
  /**
   * @param {!Element|!ShadowRoot} element
   * @return {!Promise<?../extensions/amp-viewer-assistance/0.1/amp-viewer-assistance.AmpViewerAssistance>}
   */
  ;

  Services.viewerAssistanceForDocOrNull = function viewerAssistanceForDocOrNull(element) {
    return (
      /** @type {!Promise<?../extensions/amp-viewer-assistance/0.1/amp-viewer-assistance.AmpViewerAssistance>} */
      (0, _elementService.getElementServiceIfAvailableForDoc)(element, 'amp-viewer-assistance', 'amp-viewer-assistance')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/viewer-interface.ViewerInterface}
   */
  ;

  Services.viewerForDoc = function viewerForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/viewer-interface.ViewerInterface} */
      (0, _service.getServiceForDoc)(elementOrAmpDoc, 'viewer')
    );
  }
  /**
   * Returns promise for the viewer. This is an unusual case and necessary only
   * for services that need reference to the viewer before it has been
   * initialized. Most of the code, however, just should use `viewerForDoc`.
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!./service/viewer-interface.ViewerInterface>}
   */
  ;

  Services.viewerPromiseForDoc = function viewerPromiseForDoc(elementOrAmpDoc) {
    return (
      /** @type {!Promise<!./service/viewer-interface.ViewerInterface>} */
      (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, 'viewer')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/vsync-impl.Vsync}
   */
  ;

  Services.vsyncFor = function vsyncFor(window) {
    return (
      /** @type {!./service/vsync-impl.Vsync} */
      (0, _service.getService)(window, 'vsync')
    );
  }
  /**
   * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!./service/viewport/viewport-interface.ViewportInterface}
   */
  ;

  Services.viewportForDoc = function viewportForDoc(elementOrAmpDoc) {
    return (
      /** @type {!./service/viewport/viewport-interface.ViewportInterface} */
      (0, _service.getServiceForDoc)(elementOrAmpDoc, 'viewport')
    );
  }
  /**
   * @param {!Window} window
   * @return {!./service/xhr-impl.Xhr}
   */
  ;

  Services.xhrFor = function xhrFor(window) {
    return (
      /** @type {!./service/xhr-impl.Xhr} */
      (0, _service.getService)(window, 'xhr')
    );
  };

  return Services;
}();

exports.Services = Services;

},{"./element-service":30,"./service":49}],54:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.htmlFor = htmlFor;
exports.svgFor = svgFor;
exports.htmlRefs = htmlRefs;

var _log = require("./log");

var _object = require("./utils/object.js");

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var htmlContainer;
var svgContainer;
/**
 * Creates the html helper for the doc.
 *
 * @param {!Element|!Document} nodeOrDoc
 * @return {function(!Array<string>):!Element}
 */

function htmlFor(nodeOrDoc) {
  var doc = nodeOrDoc.ownerDocument || nodeOrDoc;

  if (!htmlContainer || htmlContainer.ownerDocument !== doc) {
    htmlContainer = doc.createElement('div');
  }

  return html;
}
/**
 * Creates the svg helper for the doc.
 *
 * @param {!Element|!Document} nodeOrDoc
 * @return {function(!Array<string>):!Element}
 */


function svgFor(nodeOrDoc) {
  var doc = nodeOrDoc.ownerDocument || nodeOrDoc;

  if (!svgContainer || svgContainer.ownerDocument !== svgContainer) {
    svgContainer = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  }

  return svg;
}
/**
 * A tagged template literal helper to generate static SVG trees.
 * This must be used as a tagged template, ie
 *
 * ```
 * const circle = svg`<circle cx="60" cy="60" r="22"></circle>`;
 * ```
 *
 * Only the root element and its subtree will be returned. DO NOT use this to
 * render subtree's with dynamic content, it WILL result in an error!
 *
 * @param {!Array<string>} strings
 * @return {!Element}
 */


function svg(strings) {
  return createNode(svgContainer, strings);
}
/**
 * A tagged template literal helper to generate static DOM trees.
 * This must be used as a tagged template, ie
 *
 * ```
 * const div = html`<div><span></span></div>`;
 * ```
 *
 * Only the root element and its subtree will be returned. DO NOT use this to
 * render subtree's with dynamic content, it WILL result in an error!
 *
 * @param {!Array<string>} strings
 * @return {!Element}
 */


function html(strings) {
  return createNode(htmlContainer, strings);
}
/**
 * Helper used by html and svg string literal functions.
 * @param {!Element} container
 * @param {!Array<string>} strings
 * @return {!Element}
 */


function createNode(container, strings) {
  (0, _log.devAssert)(strings.length === 1, 'Improper html template tag usage.');
  container.
  /*OK*/
  innerHTML = strings[0];
  var el = container.firstElementChild;
  (0, _log.devAssert)(el, 'No elements in template');
  (0, _log.devAssert)(!el.nextElementSibling, 'Too many root elements in template'); // Clear to free memory.

  container.removeChild(el);
  return el;
}
/**
 * Queries an element for all elements with a "ref" attribute, removing
 * the attribute afterwards.
 * Returns a named map of all ref elements.
 *
 * @param {!Element} root
 * @return {!Object<string, !Element>}
 */


function htmlRefs(root) {
  var elements = root.querySelectorAll('[ref]');
  var refs = (0, _object.map)();

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var ref = (0, _log.devAssert)(element.getAttribute('ref'), 'Empty ref attr');
    element.removeAttribute('ref');
    (0, _log.devAssert)(refs[ref] === undefined, 'Duplicate ref');
    refs[ref] = element;
  }

  return refs;
}

},{"./log":45,"./utils/object.js":67}],55:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.dashToCamelCase = dashToCamelCase;
exports.camelCaseToDash = camelCaseToDash;
exports.dashToUnderline = dashToUnderline;
exports.endsWith = endsWith;
exports.startsWith = startsWith;
exports.includes = includes;
exports.expandTemplate = expandTemplate;
exports.stringHash32 = stringHash32;
exports.trimEnd = trimEnd;
exports.trimStart = trimStart;
exports.padStart = padStart;

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param {string} _match
 * @param {string} character
 * @return {string}
 */
function toUpperCase(_match, character) {
  return character.toUpperCase();
}
/**
 * @param {string} match
 * @return {string}
 */


function prependDashAndToLowerCase(match) {
  return '-' + match.toLowerCase();
}
/**
 * @param {string} name Attribute name containing dashes.
 * @return {string} Dashes removed and successive character sent to upper case.
 * visibleForTesting
 */


function dashToCamelCase(name) {
  return name.replace(/-([a-z])/g, toUpperCase);
}
/**
 * Converts a string that is in camelCase to one that is in dash-case.
 *
 * @param {string} string The string to convert.
 * @return {string} The string in dash-case.
 */


function camelCaseToDash(string) {
  return string.replace(/(?!^)[A-Z]/g, prependDashAndToLowerCase);
}
/**
 * @param {string} name Attribute name with dashes
 * @return {string} Dashes replaced by underlines.
 */


function dashToUnderline(name) {
  return name.replace('-', '_');
}
/**
 * Polyfill for String.prototype.endsWith.
 * @param {string} string
 * @param {string} suffix
 * @return {boolean}
 */


function endsWith(string, suffix) {
  var index = string.length - suffix.length;
  return index >= 0 && string.indexOf(suffix, index) == index;
}
/**
 * Polyfill for String.prototype.startsWith.
 * @param {string} string
 * @param {string} prefix
 * @return {boolean}
 */


function startsWith(string, prefix) {
  if (prefix.length > string.length) {
    return false;
  }

  return string.lastIndexOf(prefix, 0) == 0;
}
/**
 * Polyfill for String.prototype.includes.
 * @param {string} string
 * @param {string} substring
 * @param {number=} start
 * @return {boolean}
 */


function includes(string, substring, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + substring.length > string.length) {
    return false;
  }

  return string.indexOf(substring, start) !== -1;
}
/**
 * Expands placeholders in a given template string with values.
 *
 * Placeholders use ${key-name} syntax and are replaced with the value
 * returned from the given getter function.
 *
 * @param {string} template The template string to expand.
 * @param {function(string):*} getter Function used to retrieve a value for a
 *   placeholder. Returns values will be coerced into strings.
 * @param {number=} opt_maxIterations Number of times to expand the template.
 *   Defaults to 1, but should be set to a larger value your placeholder tokens
 *   can be expanded to other placeholder tokens. Take caution with large values
 *   as recursively expanding a string can be exponentially expensive.
 * @return {string}
 */


function expandTemplate(template, getter, opt_maxIterations) {
  var maxIterations = opt_maxIterations || 1;

  var _loop = function _loop(i) {
    var matches = 0;
    template = template.replace(/\${([^}]*)}/g, function (_a, b) {
      matches++;
      return getter(b);
    });

    if (!matches) {
      return "break";
    }
  };

  for (var i = 0; i < maxIterations; i++) {
    var _ret = _loop(i);

    if (_ret === "break") break;
  }

  return template;
}
/**
 * Hash function djb2a
 * This is intended to be a simple, fast hashing function using minimal code.
 * It does *not* have good cryptographic properties.
 * @param {string} str
 * @return {string} 32-bit unsigned hash of the string
 */


function stringHash32(str) {
  var length = str.length;
  var hash = 5381;

  for (var i = 0; i < length; i++) {
    hash = hash * 33 ^ str.charCodeAt(i);
  } // Convert from 32-bit signed to unsigned.


  return String(hash >>> 0);
}
/**
 * Trims a string on the end, removing whitespace characters.
 * @param {string} str  A string to trim.
 * @return {string} The string, with trailing whitespace removed.
 */


function trimEnd(str) {
  // TODO(sparhami) Does this get inlined for an ES2019 build?
  if (str.trimEnd) {
    return str.trimEnd();
  }

  return ('_' + str).trim().slice(1);
}
/**
 * Trims any leading whitespace from a string.
 * @param {string} str  A string to trim.
 * @return {string} The string, with leading whitespace removed.
 */


function trimStart(str) {
  if (str.trimStart) {
    return str.trimStart();
  }

  return (str + '_').trim().slice(0, -1);
}
/**
 * Pads the beginning of a string with a substring to a target length.
 * @param {string} s
 * @param {number} targetLength
 * @param {string} padString
 * @return {*} TODO(#23582): Specify return type
 */


function padStart(s, targetLength, padString) {
  if (s.length >= targetLength) {
    return s;
  }

  targetLength = targetLength - s.length;
  var padding = padString;

  while (targetLength > padding.length) {
    padding += padString;
  }

  return padding.slice(0, targetLength) + s;
}

},{}],56:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.installStylesForDoc = installStylesForDoc;
exports.installStylesLegacy = installStylesLegacy;
exports.installCssTransformer = installCssTransformer;
exports.setBodyMadeVisibleForTesting = setBodyMadeVisibleForTesting;
exports.makeBodyVisible = makeBodyVisible;
exports.makeBodyVisibleRecovery = makeBodyVisibleRecovery;
exports.bodyAlwaysVisible = bodyAlwaysVisible;

var _commonSignals = require("./common-signals");

var _services = require("./services");

var _log = require("./log");

var _service = require("./service");

var _dom = require("./dom");

var _object = require("./utils/object");

var _style = require("./style");

var _renderDelayingServices = require("./render-delaying-services");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var TRANSFORMER_PROP = '__AMP_CSS_TR';
var STYLE_MAP_PROP = '__AMP_CSS_SM';
/**
 * Adds the given css text to the given ampdoc.
 *
 * The style tags will be at the beginning of the head before all author
 * styles. One element can be the main runtime CSS. This is guaranteed
 * to always be the first stylesheet in the doc.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc The ampdoc that should get the new styles.
 * @param {string} cssText
 * @param {?function(!Element)|undefined} cb Called when the new styles are available.
 *     Not using a promise, because this is synchronous when possible.
 *     for better performance.
 * @param {boolean=} opt_isRuntimeCss If true, this style tag will be inserted
 *     as the first element in head and all style elements will be positioned
 *     after.
 * @param {string=} opt_ext
 * @return {!Element}
 */

function installStylesForDoc(ampdoc, cssText, cb, opt_isRuntimeCss, opt_ext) {
  var cssRoot = ampdoc.getHeadNode();
  var style = insertStyleElement(cssRoot, maybeTransform(cssRoot, cssText), opt_isRuntimeCss || false, opt_ext || null);

  if (cb) {
    var rootNode = ampdoc.getRootNode(); // Styles aren't always available synchronously. E.g. if there is a
    // pending style download, it will have to finish before the new
    // style is visible.
    // For this reason we poll until the style becomes available.
    // Sync case.

    if (styleLoaded(rootNode, style)) {
      cb(style);
      return style;
    } // Poll until styles are available.


    var interval = setInterval(function () {
      if (styleLoaded(rootNode, style)) {
        clearInterval(interval);
        cb(style);
      }
    }, 4);
  }

  return style;
}
/**
 * Adds the given css text to the given document.
 * TODO(dvoytenko, #22733): Remove this method once FIE/ampdoc migration is
 * done.
 *
 * @param {!Document} doc The document that should get the new styles.
 * @param {string} cssText
 * @param {?function(!Element)|undefined} cb Called when the new styles are
 *     available. Not using a promise, because this is synchronous when
 *     possible. for better performance.
 * @param {boolean=} opt_isRuntimeCss If true, this style tag will be inserted
 *     as the first element in head and all style elements will be positioned
 *     after.
 * @param {string=} opt_ext
 * @return {!Element}
 */


function installStylesLegacy(doc, cssText, cb, opt_isRuntimeCss, opt_ext) {
  var style = insertStyleElement((0, _log.dev)().assertElement(doc.head), cssText, opt_isRuntimeCss || false, opt_ext || null);

  if (cb) {
    // Styles aren't always available synchronously. E.g. if there is a
    // pending style download, it will have to finish before the new
    // style is visible.
    // For this reason we poll until the style becomes available.
    // Sync case.
    if (styleLoaded(doc, style)) {
      cb(style);
      return style;
    } // Poll until styles are available.


    var interval = setInterval(function () {
      if (styleLoaded(doc, style)) {
        clearInterval(interval);
        cb(style);
      }
    }, 4);
  }

  return style;
}
/**
 * Creates the properly configured style element.
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {string} cssText
 * @param {boolean} isRuntimeCss
 * @param {?string} ext
 * @return {!Element}
 */


function insertStyleElement(cssRoot, cssText, isRuntimeCss, ext) {
  var styleMap = cssRoot[STYLE_MAP_PROP];

  if (!styleMap) {
    styleMap = cssRoot[STYLE_MAP_PROP] = (0, _object.map)();
  }

  var isExtCss = !isRuntimeCss && ext && ext != 'amp-custom' && ext != 'amp-keyframes';
  var key = isRuntimeCss ? 'amp-runtime' : isExtCss ? "amp-extension=" + ext : null; // Check if it has already been created or discovered.

  if (key) {
    var existing = getExistingStyleElement(cssRoot, styleMap, key);

    if (existing) {
      if (existing.textContent !== cssText) {
        existing.textContent = cssText;
      }

      return existing;
    }
  } // Create the new style element and append to cssRoot.


  var doc = cssRoot.ownerDocument || cssRoot;
  var style = doc.createElement('style');
  style.
  /*OK*/
  textContent = cssText;
  var afterElement = null; // Make sure that we place style tags after the main runtime CSS. Otherwise
  // the order is random.

  if (isRuntimeCss) {
    style.setAttribute('amp-runtime', '');
  } else if (isExtCss) {
    style.setAttribute('amp-extension', ext || '');
    afterElement = (0, _log.dev)().assertElement(getExistingStyleElement(cssRoot, styleMap, 'amp-runtime'));
  } else {
    if (ext) {
      style.setAttribute(ext, '');
    }

    afterElement = cssRoot.lastChild;
  }

  (0, _dom.insertAfterOrAtStart)(cssRoot, style, afterElement);

  if (key) {
    styleMap[key] = style;
  }

  return style;
}
/**
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {!Object<string, !Element>} styleMap
 * @param {string} key
 * @return {?Element}
 */


function getExistingStyleElement(cssRoot, styleMap, key) {
  // Already cached.
  if (styleMap[key]) {
    return styleMap[key];
  } // Check if the style has already been added by the server layout.


  var existing = cssRoot.
  /*OK*/
  querySelector("style[" + key + "]");

  if (existing) {
    styleMap[key] = existing;
    return existing;
  } // Nothing found.


  return null;
}
/**
 * Applies a transformer to the CSS text if it has been registered.
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {function(string):string} transformer
 */


function installCssTransformer(cssRoot, transformer) {
  cssRoot[TRANSFORMER_PROP] = transformer;
}
/**
 * Applies a transformer to the CSS text if it has been registered.
 * @param {!Element|!ShadowRoot} cssRoot
 * @param {string} cssText
 * @return {string}
 */


function maybeTransform(cssRoot, cssText) {
  var transformer = cssRoot[TRANSFORMER_PROP];
  return transformer ? transformer(cssText) : cssText;
}
/** @private {boolean} */


var bodyMadeVisible = false;
/**
 * @param {boolean} value
 * @visibleForTesting
 */

function setBodyMadeVisibleForTesting(value) {
  bodyMadeVisible = value;
}
/**
 * Sets the document's body opacity to 1.
 * If the body is not yet available (because our script was loaded
 * synchronously), polls until it is.
 * @param {!Document} doc The document who's body we should make visible.
 */


function makeBodyVisible(doc) {
  (0, _log.devAssert)(doc.defaultView, 'Passed in document must have a defaultView');
  var win =
  /** @type {!Window} */
  doc.defaultView;
  (0, _dom.waitForBodyOpenPromise)(doc).then(function () {
    return (0, _renderDelayingServices.waitForServices)(win);
  }).catch(function (reason) {
    (0, _log.rethrowAsync)(reason);
    return [];
  }).then(function (services) {
    bodyMadeVisible = true;
    setBodyVisibleStyles(doc);
    var ampdoc = (0, _service.getAmpdoc)(doc);
    ampdoc.signals().signal(_commonSignals.CommonSignals.RENDER_START);

    if (services.length > 0) {
      var resources = _services.Services.resourcesForDoc(doc.documentElement);

      resources.
      /*OK*/
      schedulePass(1,
      /* relayoutAll */
      true);
    }

    try {
      var perf = _services.Services.performanceFor(win);

      perf.tick('mbv');
      perf.flush();
    } catch (e) {}
  });
}
/**
 * Set the document's body opacity to 1. Called in error cases.
 * @param {!Document} doc The document who's body we should make visible.
 */


function makeBodyVisibleRecovery(doc) {
  (0, _log.devAssert)(doc.defaultView, 'Passed in document must have a defaultView');

  if (bodyMadeVisible) {
    return;
  }

  bodyMadeVisible = true;
  setBodyVisibleStyles(doc);
}
/**
 * Make sure that body exists, and make it visible.
 * @param {!Document} doc
 */


function setBodyVisibleStyles(doc) {
  (0, _style.setStyles)((0, _log.dev)().assertElement(doc.body), {
    opacity: 1,
    visibility: 'visible',
    'animation': 'none'
  });
}
/**
 * Indicates that the body is always visible. For instance, in case of PWA.
 * This check is on a module level variable, and could be problematic if you are
 * relying on this function across different binaries.
 * @param {!Window} unusedWin
 */


function bodyAlwaysVisible(unusedWin) {
  bodyMadeVisible = true;
}
/**
 * Checks whether a style element was registered in the DOM.
 * @param {!Document|!ShadowRoot} doc
 * @param {!Element} style
 * @return {boolean}
 */


function styleLoaded(doc, style) {
  var sheets = doc.styleSheets;

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];

    if (sheet.ownerNode == style) {
      return true;
    }
  }

  return false;
}

},{"./common-signals":23,"./dom":29,"./log":45,"./render-delaying-services":48,"./service":49,"./services":53,"./style":57,"./utils/object":67}],57:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.camelCaseToTitleCase = camelCaseToTitleCase;
exports.getVendorJsPropertyName = getVendorJsPropertyName;
exports.setImportantStyles = setImportantStyles;
exports.setStyle = setStyle;
exports.getStyle = getStyle;
exports.setStyles = setStyles;
exports.assertNotDisplay = assertNotDisplay;
exports.assertDoesNotContainDisplay = assertDoesNotContainDisplay;
exports.setInitialDisplay = setInitialDisplay;
exports.toggle = toggle;
exports.px = px;
exports.deg = deg;
exports.translateX = translateX;
exports.translate = translate;
exports.scale = scale;
exports.rotate = rotate;
exports.removeAlphaFromColor = removeAlphaFromColor;
exports.computedStyle = computedStyle;
exports.resetStyles = resetStyles;
exports.propagateObjectFitStyles = propagateObjectFitStyles;

var _log = require("./log");

var _object = require("./utils/object.js");

var _string = require("./string");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Note: loaded by 3p system. Cannot rely on babel polyfills.

/** @type {Object<string, string>} */
var propertyNameCache;
/** @const {!Array<string>} */

var vendorPrefixes = ['Webkit', 'webkit', 'Moz', 'moz', 'ms', 'O', 'o'];
/**
 * @export
 * @param {string} camelCase camel cased string
 * @return {string} title cased string
 */

function camelCaseToTitleCase(camelCase) {
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}
/**
  Checks the style if a prefixed version of a property exists and returns
 * it or returns an empty string.
 * @private
 * @param {!Object} style
 * @param {string} titleCase the title case version of a css property name
 * @return {string} the prefixed property name or null.
 */


function getVendorJsPropertyName_(style, titleCase) {
  for (var i = 0; i < vendorPrefixes.length; i++) {
    var propertyName = vendorPrefixes[i] + titleCase;

    if (style[propertyName] !== undefined) {
      return propertyName;
    }
  }

  return '';
}
/**
 * Returns the possibly prefixed JavaScript property name of a style property
 * (ex. WebkitTransitionDuration) given a camelCase'd version of the property
 * (ex. transitionDuration).
 * @export
 * @param {!Object} style
 * @param {string} camelCase the camel cased version of a css property name
 * @param {boolean=} opt_bypassCache bypass the memoized cache of property
 *   mapping
 * @return {string}
 */


function getVendorJsPropertyName(style, camelCase, opt_bypassCache) {
  if ((0, _string.startsWith)(camelCase, '--')) {
    // CSS vars are returned as is.
    return camelCase;
  }

  if (!propertyNameCache) {
    propertyNameCache = (0, _object.map)();
  }

  var propertyName = propertyNameCache[camelCase];

  if (!propertyName || opt_bypassCache) {
    propertyName = camelCase;

    if (style[camelCase] === undefined) {
      var titleCase = camelCaseToTitleCase(camelCase);
      var prefixedPropertyName = getVendorJsPropertyName_(style, titleCase);

      if (style[prefixedPropertyName] !== undefined) {
        propertyName = prefixedPropertyName;
      }
    }

    if (!opt_bypassCache) {
      propertyNameCache[camelCase] = propertyName;
    }
  }

  return propertyName;
}
/**
 * Sets the CSS styles of the specified element with !important. The styles
 * are specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, *>} styles
 */


function setImportantStyles(element, styles) {
  var style = element.style;

  for (var k in styles) {
    style.setProperty(getVendorJsPropertyName(style, k), styles[k].toString(), 'important');
  }
}
/**
 * Sets the CSS style of the specified element with optional units, e.g. "px".
 * @param {?Element} element
 * @param {string} property
 * @param {*} value
 * @param {string=} opt_units
 * @param {boolean=} opt_bypassCache
 */


function setStyle(element, property, value, opt_units, opt_bypassCache) {
  var propertyName = getVendorJsPropertyName(element.style, property, opt_bypassCache);

  if (propertyName) {
    element.style[propertyName] =
    /** @type {string} */
    opt_units ? value + opt_units : value;
  }
}
/**
 * Returns the value of the CSS style of the specified element.
 * @param {!Element} element
 * @param {string} property
 * @param {boolean=} opt_bypassCache
 * @return {*}
 */


function getStyle(element, property, opt_bypassCache) {
  var propertyName = getVendorJsPropertyName(element.style, property, opt_bypassCache);

  if (!propertyName) {
    return undefined;
  }

  return element.style[propertyName];
}
/**
 * Sets the CSS styles of the specified element. The styles
 * a specified as a map from CSS property names to their values.
 * @param {!Element} element
 * @param {!Object<string, *>} styles
 */


function setStyles(element, styles) {
  for (var k in styles) {
    setStyle(element, k, styles[k]);
  }
}
/**
 * Asserts that the style is not the `display` style.
 * This is the only possible way to pass a dynamic style to setStyle.
 *
 * If you wish to set `display`, use the `toggle` helper instead. This is so
 * changes to display can trigger necessary updates. See #17475.
 *
 * @param {string} style
 * @return {string}
 */


function assertNotDisplay(style) {
  if (style === 'display') {
    (0, _log.dev)().error('STYLE', '`display` style detected. You must use toggle instead.');
  }

  return style;
}
/**
 * Asserts that the styles does not contain the `display` style.
 * This is the only possible way to pass a dynamic styles object to setStyles
 * and setImportantStyles.
 *
 * If you wish to set `display`, use the `toggle` helper instead. This is so
 * changes to display can trigger necessary updates. See #17475.
 *
 * @param {!Object<string, *>} styles
 * @return {!Object<string, *>}
 */


function assertDoesNotContainDisplay(styles) {
  if ('display' in styles) {
    (0, _log.dev)().error('STYLE', '`display` style detected in styles. You must use toggle instead.');
  }

  return styles;
}
/**
 * Sets the initial display style of an element. This is a last resort. If you
 * can set the initial display using CSS, YOU MUST.
 * DO NOT USE THIS TO ARBITRARILY SET THE DISPLAY STYLE AFTER INITIAL SETUP.
 *
 * @param {!Element} el
 * @param {string} value
 */


function setInitialDisplay(el, value) {
  var style = el.style;
  (0, _log.devAssert)(value !== '' && value !== 'none', 'Initial display value must not be "none". Use toggle instead.');
  (0, _log.devAssert)(!style['display'], 'setInitialDisplay MUST NOT be used for ' + 'resetting the display style. If you are looking for display:none ' + 'toggling, use toggle instead.');
  style['display'] = value;
}
/**
 * Shows or hides the specified element.
 * @param {!Element} element
 * @param {boolean=} opt_display
 */


function toggle(element, opt_display) {
  if (opt_display === undefined) {
    opt_display = element.hasAttribute('hidden');
  }

  if (opt_display) {
    element.removeAttribute('hidden');
  } else {
    element.setAttribute('hidden', '');
  }
}
/**
 * Returns a pixel value.
 * @param {number} value
 * @return {string}
 */


function px(value) {
  return value + "px";
}
/**
 * Returns a degree value.
 * @param {number} value
 * @return {string}
 */


function deg(value) {
  return value + "deg";
}
/**
 * Returns a "translateX" for CSS "transform" property.
 * @param {number|string} value
 * @return {string}
 */


function translateX(value) {
  if (typeof value == 'string') {
    return "translateX(" + value + ")";
  }

  return "translateX(" + px(value) + ")";
}
/**
 * Returns a "translateX" for CSS "transform" property.
 * @param {number|string} x
 * @param {(number|string)=} opt_y
 * @return {string}
 */


function translate(x, opt_y) {
  if (typeof x == 'number') {
    x = px(x);
  }

  if (opt_y === undefined) {
    return "translate(" + x + ")";
  }

  if (typeof opt_y == 'number') {
    opt_y = px(opt_y);
  }

  return "translate(" + x + ", " + opt_y + ")";
}
/**
 * Returns a "scale" for CSS "transform" property.
 * @param {number|string} value
 * @return {string}
 */


function scale(value) {
  return "scale(" + value + ")";
}
/**
 * Returns a "rotate" for CSS "transform" property.
 * @param {number|string} value
 * @return {string}
 */


function rotate(value) {
  if (typeof value == 'number') {
    value = deg(value);
  }

  return "rotate(" + value + ")";
}
/**
 * Remove alpha value from a rgba color value.
 * Return the new color property with alpha equals if has the alpha value.
 * Caller needs to make sure the input color value is a valid rgba/rgb value
 * @param {string} rgbaColor
 * @return {string}
 */


function removeAlphaFromColor(rgbaColor) {
  return rgbaColor.replace(/\(([^,]+),([^,]+),([^,)]+),[^)]+\)/g, '($1,$2,$3, 1)');
}
/**
 * Gets the computed style of the element. The helper is necessary to enforce
 * the possible `null` value returned by a buggy Firefox.
 *
 * @param {!Window} win
 * @param {!Element} el
 * @return {!Object<string, string>}
 */


function computedStyle(win, el) {
  var style =
  /** @type {?CSSStyleDeclaration} */
  win.getComputedStyle(el);
  return (
    /** @type {!Object<string, string>} */
    style || (0, _object.map)()
  );
}
/**
 * Resets styles that were set dynamically (i.e. inline)
 * @param {!Element} element
 * @param {!Array<string>} properties
 */


function resetStyles(element, properties) {
  for (var i = 0; i < properties.length; i++) {
    setStyle(element, properties[i], null);
  }
}
/**
 * Propagates the object-fit/position element attributes as styles.
 * @param {!Element} fromEl ie: amp-img
 * @param {!Element} toEl ie: the img within amp-img
 */


function propagateObjectFitStyles(fromEl, toEl) {
  if (fromEl.hasAttribute('object-fit')) {
    setStyle(toEl, 'object-fit', fromEl.getAttribute('object-fit'));
  }

  if (fromEl.hasAttribute('object-position')) {
    setStyle(toEl, 'object-position', fromEl.getAttribute('object-position'));
  }
}

},{"./log":45,"./string":55,"./utils/object.js":67}],58:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isArray = isArray;
exports.toArray = toArray;
exports.isObject = isObject;
exports.isFiniteNumber = isFiniteNumber;
exports.isEnumValue = isEnumValue;
exports.toWin = toWin;

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* @const */
var toString_ = Object.prototype.toString;
/**
 * Returns the ECMA [[Class]] of a value
 * @param {*} value
 * @return {string}
 */

function toString(value) {
  return toString_.call(value);
}
/**
 * Determines if value is actually an Array.
 * @param {*} value
 * @return {boolean}
 */


function isArray(value) {
  return Array.isArray(value);
}
/**
 * Converts an array-like object to an array.
 * @param {?IArrayLike<T>|string} arrayLike
 * @return {!Array<T>}
 * @template T
 */


function toArray(arrayLike) {
  return arrayLike ? Array.prototype.slice.call(arrayLike) : [];
}
/**
 * Determines if value is actually an Object.
 * @param {*} value
 * @return {boolean}
 */


function isObject(value) {
  return toString(value) === '[object Object]';
}
/**
 * Determines if value is of number type and finite.
 * NaN and Infinity are not considered a finite number.
 * String numbers are not considered numbers.
 * @param {*} value
 * @return {boolean}
 */


function isFiniteNumber(value) {
  return typeof value === 'number' && isFinite(value);
}
/**
 * Checks whether `s` is a valid value of `enumObj`.
 *
 * @param {!Object<T>} enumObj
 * @param {T} s
 * @return {boolean}
 * @template T
 */


function isEnumValue(enumObj, s) {
  for (var k in enumObj) {
    if (enumObj[k] === s) {
      return true;
    }
  }

  return false;
}
/**
 * Externs declare that access `defaultView` from `document` or
 * `ownerDocument` is of type `(Window|null)` but most of our parameter types
 * assume that it is never null. This is OK in practice as we ever only get
 * null on disconnected documents or old IE.
 * This helper function casts it into just a simple Window return type.
 *
 * @param {!Window|null} winOrNull
 * @return {!Window}
 */


function toWin(winOrNull) {
  return (
    /** @type {!Window} */
    winOrNull
  );
}

},{}],59:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.parseQueryString_ = parseQueryString_;

var _urlTryDecodeUriComponent = require("./url-try-decode-uri-component");

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var regex = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 *
 * DO NOT import the function from this file. Instead, import parseQueryString
 * from `src/url.js`.
 *
 * @param {string} queryString
 * @return {!JsonObject}
 */

function parseQueryString_(queryString) {
  var params =
  /** @type {!JsonObject} */
  Object.create(null);

  if (!queryString) {
    return params;
  }

  var match;

  while (match = regex.exec(queryString)) {
    var name = (0, _urlTryDecodeUriComponent.tryDecodeUriComponent_)(match[1], match[1]);
    var value = match[2] ? (0, _urlTryDecodeUriComponent.tryDecodeUriComponent_)(match[2].replace(/\+/g, ' '), match[2]) : '';
    params[name] = value;
  }

  return params;
}

},{"./url-try-decode-uri-component":60}],60:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.tryDecodeUriComponent_ = tryDecodeUriComponent_;

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Tries to decode a URI component, falling back to opt_fallback (or an empty
 * string)
 *
 * DO NOT import the function from this file. Instead, import
 * tryDecodeUriComponent from `src/url.js`.
 *
 * @param {string} component
 * @param {string=} fallback
 * @return {string}
 */
function tryDecodeUriComponent_(component, fallback) {
  if (fallback === void 0) {
    fallback = '';
  }

  try {
    return decodeURIComponent(component);
  } catch (e) {
    return fallback;
  }
}

},{}],61:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getWinOrigin = getWinOrigin;
exports.parseUrlDeprecated = parseUrlDeprecated;
exports.parseUrlWithA = parseUrlWithA;
exports.appendEncodedParamStringToUrl = appendEncodedParamStringToUrl;
exports.addParamToUrl = addParamToUrl;
exports.addParamsToUrl = addParamsToUrl;
exports.addMissingParamsToUrl = addMissingParamsToUrl;
exports.serializeQueryString = serializeQueryString;
exports.isSecureUrlDeprecated = isSecureUrlDeprecated;
exports.assertHttpsUrl = assertHttpsUrl;
exports.assertAbsoluteHttpOrHttpsUrl = assertAbsoluteHttpOrHttpsUrl;
exports.parseQueryString = parseQueryString;
exports.removeFragment = removeFragment;
exports.getFragment = getFragment;
exports.isProxyOrigin = isProxyOrigin;
exports.getProxyServingType = getProxyServingType;
exports.isLocalhostOrigin = isLocalhostOrigin;
exports.isProtocolValid = isProtocolValid;
exports.removeAmpJsParamsFromUrl = removeAmpJsParamsFromUrl;
exports.removeSearch = removeSearch;
exports.removeParamsFromSearch = removeParamsFromSearch;
exports.getSourceUrl = getSourceUrl;
exports.getSourceOrigin = getSourceOrigin;
exports.resolveRelativeUrl = resolveRelativeUrl;
exports.resolveRelativeUrlFallback_ = resolveRelativeUrlFallback_;
exports.getCorsUrl = getCorsUrl;
exports.checkCorsUrl = checkCorsUrl;
exports.tryDecodeUriComponent = tryDecodeUriComponent;
exports.SOURCE_ORIGIN_PARAM = void 0;

var _lruCache = require("./utils/lru-cache");

var _object = require("./utils/object");

var _string = require("./string");

var _mode = require("./mode");

var _types = require("./types");

var _urlParseQueryString = require("./url-parse-query-string");

var _urlTryDecodeUriComponent = require("./url-try-decode-uri-component");

var _config = require("./config");

var _log = require("./log");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @type {!JsonObject}
 */
var SERVING_TYPE_PREFIX = (0, _object.dict)({
  // No viewer
  'c': true,
  // In viewer
  'v': true,
  // Ad landing page
  'a': true,
  // Ad
  'ad': true,
  // Actions viewer
  'action': true
});
/**
 * Cached a-tag to avoid memory allocation during URL parsing.
 * @type {HTMLAnchorElement}
 */

var a;
/**
 * We cached all parsed URLs. As of now there are no use cases
 * of AMP docs that would ever parse an actual large number of URLs,
 * but we often parse the same one over and over again.
 * @type {LruCache}
 */

var cache;
/** @private @const Matches amp_js_* parameters in query string. */

var AMP_JS_PARAMS_REGEX = /[?&]amp_js[^&]*/;
/** @private @const Matches amp_gsa parameters in query string. */

var AMP_GSA_PARAMS_REGEX = /[?&]amp_gsa[^&]*/;
/** @private @const Matches amp_r parameters in query string. */

var AMP_R_PARAMS_REGEX = /[?&]amp_r[^&]*/;
/** @private @const Matches amp_kit parameters in query string. */

var AMP_KIT_PARAMS_REGEX = /[?&]amp_kit[^&]*/;
/** @private @const Matches usqp parameters from goog experiment in query string. */

var GOOGLE_EXPERIMENT_PARAMS_REGEX = /[?&]usqp[^&]*/;
var INVALID_PROTOCOLS = [
/*eslint no-script-url: 0*/
'javascript:',
/*eslint no-script-url: 0*/
'data:',
/*eslint no-script-url: 0*/
'vbscript:'];
/** @const {string} */

var SOURCE_ORIGIN_PARAM = '__amp_source_origin';
/**
 * Returns the correct origin for a given window.
 * @param {!Window} win
 * @return {string} origin
 */

exports.SOURCE_ORIGIN_PARAM = SOURCE_ORIGIN_PARAM;

function getWinOrigin(win) {
  return win.origin || parseUrlDeprecated(win.location.href).origin;
}
/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {string} url
 * @param {boolean=} opt_nocache
 * @return {!Location}
 */


function parseUrlDeprecated(url, opt_nocache) {
  if (!a) {
    a =
    /** @type {!HTMLAnchorElement} */
    self.document.createElement('a');
    cache = self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new _lruCache.LruCache(100));
  }

  return parseUrlWithA(a, url, opt_nocache ? null : cache);
}
/**
 * Returns a Location-like object for the given URL. If it is relative,
 * the URL gets resolved.
 * Consider the returned object immutable. This is enforced during
 * testing by freezing the object.
 * @param {!HTMLAnchorElement} a
 * @param {string} url
 * @param {LruCache=} opt_cache
 * @return {!Location}
 * @restricted
 */


function parseUrlWithA(a, url, opt_cache) {
  if (opt_cache && opt_cache.has(url)) {
    return opt_cache.get(url);
  }

  a.href = url; // IE11 doesn't provide full URL components when parsing relative URLs.
  // Assigning to itself again does the trick #3449.

  if (!a.protocol) {
    a.href = a.href;
  }

  var info =
  /** @type {!Location} */
  {
    href: a.href,
    protocol: a.protocol,
    host: a.host,
    hostname: a.hostname,
    port: a.port == '0' ? '' : a.port,
    pathname: a.pathname,
    search: a.search,
    hash: a.hash,
    origin: null // Set below.

  }; // Some IE11 specific polyfills.
  // 1) IE11 strips out the leading '/' in the pathname.

  if (info.pathname[0] !== '/') {
    info.pathname = '/' + info.pathname;
  } // 2) For URLs with implicit ports, IE11 parses to default ports while
  // other browsers leave the port field empty.


  if (info.protocol == 'http:' && info.port == 80 || info.protocol == 'https:' && info.port == 443) {
    info.port = '';
    info.host = info.hostname;
  } // For data URI a.origin is equal to the string 'null' which is not useful.
  // We instead return the actual origin which is the full URL.


  var origin;

  if (a.origin && a.origin != 'null') {
    origin = a.origin;
  } else if (info.protocol == 'data:' || !info.host) {
    origin = info.href;
  } else {
    origin = info.protocol + '//' + info.host;
  }

  info.origin = origin; // Freeze during testing to avoid accidental mutation.

  var frozen = (0, _mode.getMode)().test && Object.freeze ? Object.freeze(info) : info;

  if (opt_cache) {
    opt_cache.put(url, frozen);
  }

  return frozen;
}
/**
 * Appends the string just before the fragment part (or optionally
 * to the front of the query string) of the URL.
 * @param {string} url
 * @param {string} paramString
 * @param {boolean=} opt_addToFront
 * @return {string}
 */


function appendEncodedParamStringToUrl(url, paramString, opt_addToFront) {
  if (!paramString) {
    return url;
  }

  var mainAndFragment = url.split('#', 2);
  var mainAndQuery = mainAndFragment[0].split('?', 2);
  var newUrl = mainAndQuery[0] + (mainAndQuery[1] ? opt_addToFront ? "?" + paramString + "&" + mainAndQuery[1] : "?" + mainAndQuery[1] + "&" + paramString : "?" + paramString);
  newUrl += mainAndFragment[1] ? "#" + mainAndFragment[1] : '';
  return newUrl;
}
/**
 * Appends a query string field and value to a url. `key` and `value`
 * will be ran through `encodeURIComponent` before appending.
 * @param {string} url
 * @param {string} key
 * @param {string} value
 * @param {boolean=} opt_addToFront
 * @return {string}
 */


function addParamToUrl(url, key, value, opt_addToFront) {
  var field = encodeURIComponent(key) + "=" + encodeURIComponent(value);
  return appendEncodedParamStringToUrl(url, field, opt_addToFront);
}
/**
 * Appends query string fields and values to a url. The `params` objects'
 * `key`s and `value`s will be transformed into query string keys/values.
 * @param {string} url
 * @param {!JsonObject<string, string|!Array<string>>} params
 * @return {string}
 */


function addParamsToUrl(url, params) {
  return appendEncodedParamStringToUrl(url, serializeQueryString(params));
}
/**
 * Append query string fields and values to a url, only if the key does not
 * exist in current query string.
 * @param {string} url
 * @param {!JsonObject<string, string|!Array<string>>} params
 * @return {string}
 */


function addMissingParamsToUrl(url, params) {
  var location = parseUrlDeprecated(url);
  var existingParams = parseQueryString(location.search);
  var paramsToAdd = (0, _object.dict)({});
  var keys = Object.keys(params);

  for (var i = 0; i < keys.length; i++) {
    if (!(0, _object.hasOwn)(existingParams, keys[i])) {
      paramsToAdd[keys[i]] = params[keys[i]];
    }
  }

  return addParamsToUrl(url, paramsToAdd);
}
/**
 * Serializes the passed parameter map into a query string with both keys
 * and values encoded.
 * @param {!JsonObject<string, string|!Array<string>>} params
 * @return {string}
 */


function serializeQueryString(params) {
  var s = [];

  for (var k in params) {
    var v = params[k];

    if (v == null) {
      continue;
    } else if ((0, _types.isArray)(v)) {
      for (var i = 0; i < v.length; i++) {
        var sv =
        /** @type {string} */
        v[i];
        s.push(encodeURIComponent(k) + "=" + encodeURIComponent(sv));
      }
    } else {
      var _sv =
      /** @type {string} */
      v;
      s.push(encodeURIComponent(k) + "=" + encodeURIComponent(_sv));
    }
  }

  return s.join('&');
}
/**
 * Returns `true` if the URL is secure: either HTTPS or localhost (for testing).
 * @param {string|!Location} url
 * @return {boolean}
 */


function isSecureUrlDeprecated(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }

  return url.protocol == 'https:' || url.hostname == 'localhost' || url.hostname == '127.0.0.1' || (0, _string.endsWith)(url.hostname, '.localhost');
}
/**
 * Asserts that a given url is HTTPS or protocol relative. It's a user-level
 * assert.
 *
 * Provides an exception for localhost.
 *
 * @param {?string|undefined} urlString
 * @param {!Element|string} elementContext Element where the url was found.
 * @param {string=} sourceName Used for error messages.
 * @return {string}
 */


function assertHttpsUrl(urlString, elementContext, sourceName) {
  if (sourceName === void 0) {
    sourceName = 'source';
  }

  (0, _log.userAssert)(urlString != null, '%s %s must be available', elementContext, sourceName); // (erwinm, #4560): type cast necessary until #4560 is fixed.

  var theUrlString =
  /** @type {string} */
  urlString;
  (0, _log.userAssert)(isSecureUrlDeprecated(theUrlString) || /^(\/\/)/.test(theUrlString), '%s %s must start with ' + '"https://" or "//" or be relative and served from ' + 'either https or from localhost. Invalid value: %s', elementContext, sourceName, theUrlString);
  return theUrlString;
}
/**
 * Asserts that a given url is an absolute HTTP or HTTPS URL.
 * @param {string} urlString
 * @return {string}
 */


function assertAbsoluteHttpOrHttpsUrl(urlString) {
  (0, _log.userAssert)(/^https?\:/i.test(urlString), 'URL must start with "http://" or "https://". Invalid value: %s', urlString);
  return parseUrlDeprecated(urlString).href;
}
/**
 * Parses the query string of an URL. This method returns a simple key/value
 * map. If there are duplicate keys the latest value is returned.
 *
 * This function is implemented in a separate file to avoid a circular
 * dependency.
 *
 * @param {string} queryString
 * @return {!JsonObject}
 */


function parseQueryString(queryString) {
  return (0, _urlParseQueryString.parseQueryString_)(queryString);
}
/**
 * Returns the URL without fragment. If URL doesn't contain fragment, the same
 * string is returned.
 * @param {string} url
 * @return {string}
 */


function removeFragment(url) {
  var index = url.indexOf('#');

  if (index == -1) {
    return url;
  }

  return url.substring(0, index);
}
/**
 * Returns the fragment from the URL. If the URL doesn't contain fragment,
 * the empty string is returned.
 * @param {string} url
 * @return {string}
 */


function getFragment(url) {
  var index = url.indexOf('#');

  if (index == -1) {
    return '';
  }

  return url.substring(index);
}
/**
 * Returns whether the URL has the origin of a proxy.
 * @param {string|!Location} url URL of an AMP document.
 * @return {boolean}
 */


function isProxyOrigin(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }

  return _config.urls.cdnProxyRegex.test(url.origin);
}
/**
 * For proxy-origin URLs, returns the serving type. Otherwise, returns null.
 * E.g., 'https://amp-com.cdn.ampproject.org/a/s/amp.com/amp_document.html'
 * returns 'a'.
 * @param {string|!Location} url URL of an AMP document.
 * @return {?string}
 */


function getProxyServingType(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }

  if (!isProxyOrigin(url)) {
    return null;
  }

  var path = url.pathname.split('/', 2);
  return path[1];
}
/**
 * Returns whether the URL origin is localhost.
 * @param {string|!Location} url URL of an AMP document.
 * @return {boolean}
 */


function isLocalhostOrigin(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }

  return _config.urls.localhostRegex.test(url.origin);
}
/**
 * Returns whether the URL has valid protocol.
 * Deep link protocol is valid, but not javascript etc.
 * @param {string|!Location} url
 * @return {boolean}
 */


function isProtocolValid(url) {
  if (!url) {
    return true;
  }

  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  }

  return !INVALID_PROTOCOLS.includes(url.protocol);
}
/**
 * Returns a URL without AMP JS parameters.
 * @param {string} url
 * @return {string}
 */


function removeAmpJsParamsFromUrl(url) {
  var parsed = parseUrlDeprecated(url);
  var search = removeAmpJsParamsFromSearch(parsed.search);
  return parsed.origin + parsed.pathname + search + parsed.hash;
}
/**
 * Returns a URL without a query string.
 * @param {string} url
 * @return {string}
 */


function removeSearch(url) {
  var index = url.indexOf('?');

  if (index == -1) {
    return url;
  }

  var fragment = getFragment(url);
  return url.substring(0, index) + fragment;
}
/**
 * Removes parameters that start with amp js parameter pattern and returns the
 * new search string.
 * @param {string} urlSearch
 * @return {string}
 */


function removeAmpJsParamsFromSearch(urlSearch) {
  if (!urlSearch || urlSearch == '?') {
    return '';
  }

  var search = urlSearch.replace(AMP_JS_PARAMS_REGEX, '').replace(AMP_GSA_PARAMS_REGEX, '').replace(AMP_R_PARAMS_REGEX, '').replace(AMP_KIT_PARAMS_REGEX, '').replace(GOOGLE_EXPERIMENT_PARAMS_REGEX, '').replace(/^[?&]/, ''); // Removes first ? or &.

  return search ? '?' + search : '';
}
/**
 * Removes parameters with param name and returns the new search string.
 * @param {string} urlSearch
 * @param {string} paramName
 * @return {string}
 */


function removeParamsFromSearch(urlSearch, paramName) {
  // TODO: reuse the function in removeAmpJsParamsFromSearch. Accept paramNames
  // as an array.
  if (!urlSearch || urlSearch == '?') {
    return '';
  }

  var paramRegex = new RegExp("[?&]" + paramName + "=[^&]*", 'g');
  var search = urlSearch.replace(paramRegex, '').replace(/^[?&]/, '');
  return search ? '?' + search : '';
}
/**
 * Returns the source URL of an AMP document for documents served
 * on a proxy origin or directly.
 * @param {string|!Location} url URL of an AMP document.
 * @return {string}
 */


function getSourceUrl(url) {
  if (typeof url == 'string') {
    url = parseUrlDeprecated(url);
  } // Not a proxy URL - return the URL itself.


  if (!isProxyOrigin(url)) {
    return url.href;
  } // A proxy URL.
  // Example path that is being matched here.
  // https://cdn.ampproject.org/c/s/www.origin.com/foo/
  // The /s/ is optional and signals a secure origin.


  var path = url.pathname.split('/');
  var prefix = path[1];
  (0, _log.userAssert)(SERVING_TYPE_PREFIX[prefix], 'Unknown path prefix in url %s', url.href);
  var domainOrHttpsSignal = path[2];
  var origin = domainOrHttpsSignal == 's' ? 'https://' + decodeURIComponent(path[3]) : 'http://' + decodeURIComponent(domainOrHttpsSignal); // Sanity test that what we found looks like a domain.

  (0, _log.userAssert)(origin.indexOf('.') > 0, 'Expected a . in origin %s', origin);
  path.splice(1, domainOrHttpsSignal == 's' ? 3 : 2);
  return origin + path.join('/') + removeAmpJsParamsFromSearch(url.search) + (url.hash || '');
}
/**
 * Returns the source origin of an AMP document for documents served
 * on a proxy origin or directly.
 * @param {string|!Location} url URL of an AMP document.
 * @return {string} The source origin of the URL.
 */


function getSourceOrigin(url) {
  return parseUrlDeprecated(getSourceUrl(url)).origin;
}
/**
 * Returns absolute URL resolved based on the relative URL and the base.
 * @param {string} relativeUrlString
 * @param {string|!Location} baseUrl
 * @return {string}
 */


function resolveRelativeUrl(relativeUrlString, baseUrl) {
  if (typeof baseUrl == 'string') {
    baseUrl = parseUrlDeprecated(baseUrl);
  }

  if (typeof URL == 'function') {
    return new URL(relativeUrlString, baseUrl.href).toString();
  }

  return resolveRelativeUrlFallback_(relativeUrlString, baseUrl);
}
/**
 * Fallback for URL resolver when URL class is not available.
 * @param {string} relativeUrlString
 * @param {string|!Location} baseUrl
 * @return {string}
 * @private Visible for testing.
 */


function resolveRelativeUrlFallback_(relativeUrlString, baseUrl) {
  if (typeof baseUrl == 'string') {
    baseUrl = parseUrlDeprecated(baseUrl);
  }

  relativeUrlString = relativeUrlString.replace(/\\/g, '/');
  var relativeUrl = parseUrlDeprecated(relativeUrlString); // Absolute URL.

  if ((0, _string.startsWith)(relativeUrlString.toLowerCase(), relativeUrl.protocol)) {
    return relativeUrl.href;
  } // Protocol-relative URL.


  if ((0, _string.startsWith)(relativeUrlString, '//')) {
    return baseUrl.protocol + relativeUrlString;
  } // Absolute path.


  if ((0, _string.startsWith)(relativeUrlString, '/')) {
    return baseUrl.origin + relativeUrlString;
  } // Relative path.


  return baseUrl.origin + baseUrl.pathname.replace(/\/[^/]*$/, '/') + relativeUrlString;
}
/**
 * Add "__amp_source_origin" query parameter to the URL.
 * @param {!Window} win
 * @param {string} url
 * @return {string}
 */


function getCorsUrl(win, url) {
  checkCorsUrl(url);
  var sourceOrigin = getSourceOrigin(win.location.href);
  return addParamToUrl(url, SOURCE_ORIGIN_PARAM, sourceOrigin);
}
/**
 * Checks if the url has __amp_source_origin and throws if it does.
 * @param {string} url
 */


function checkCorsUrl(url) {
  var parsedUrl = parseUrlDeprecated(url);
  var query = parseQueryString(parsedUrl.search);
  (0, _log.userAssert)(!(SOURCE_ORIGIN_PARAM in query), 'Source origin is not allowed in %s', url);
}
/**
 * Tries to decode a URI component, falling back to opt_fallback (or an empty
 * string)
 *
 * @param {string} component
 * @param {string=} opt_fallback
 * @return {string}
 */


function tryDecodeUriComponent(component, opt_fallback) {
  return (0, _urlTryDecodeUriComponent.tryDecodeUriComponent_)(component, opt_fallback);
}

},{"./config":24,"./log":45,"./mode":47,"./string":55,"./types":58,"./url-parse-query-string":59,"./url-try-decode-uri-component":60,"./utils/lru-cache":65,"./utils/object":67}],62:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.areEqualOrdered = areEqualOrdered;
exports.remove = remove;
exports.findIndex = findIndex;
exports.fromIterator = fromIterator;
exports.pushIfNotExist = pushIfNotExist;
exports.lastItem = lastItem;

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Compares if two arrays contains exactly same elements of same number
 * of same order. Note that it does NOT handle NaN case as expected.
 *
 * @param {!Array<T>} arr1
 * @param {!Array<T>} arr2
 * @return {boolean}
 * @template T
 */
function areEqualOrdered(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}
/**
 * Removes elements that shouldRemove returns true for from the array.
 *
 * @param {!Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} shouldRemove
 * @return {!Array<T>}
 * @template T
 */


function remove(array, shouldRemove) {
  var removed = [];
  var index = 0;

  for (var i = 0; i < array.length; i++) {
    var item = array[i];

    if (shouldRemove(item, i, array)) {
      removed.push(item);
    } else {
      if (index < i) {
        array[index] = item;
      }

      index++;
    }
  }

  if (index < array.length) {
    array.length = index;
  }

  return removed;
}
/**
 * Returns the index of the first element matching the predicate.
 * Like Array#findIndex.
 *
 * @param {!Array<T>} array
 * @param {function(T, number, !Array<T>):boolean} predicate
 * @return {number}
 * @template T
 */


function findIndex(array, predicate) {
  for (var i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      return i;
    }
  }

  return -1;
}
/**
 * Converts the given iterator to an array.
 *
 * @param {!Iterator<T>} iterator
 * @return {Array<T>}
 * @template T
 */


function fromIterator(iterator) {
  var array = [];

  for (var e = iterator.next(); !e.done; e = iterator.next()) {
    array.push(e.value);
  }

  return array;
}
/**
 * Adds item to array if it is not already present.
 *
 * @param {Array<T>} array
 * @param {T} item
 * @template T
 */


function pushIfNotExist(array, item) {
  if (array.indexOf(item) < 0) {
    array.push(item);
  }
}
/**
 * Returns the last item in an array.
 *
 * @param {Array<T>} array
 * @template T
 * @return {?T}
 */


function lastItem(array) {
  return array[array.length - 1];
}

},{}],63:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.domFingerprintPlain = domFingerprintPlain;
exports.DomFingerprint = void 0;

var _string = require("../string");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Gets a string of concatenated element names and relative positions
 * of the DOM element and its parentElement's (up to 25).  Relative position
 * is the index of nodes with this tag within the parent's children.
 * The order is from the inner to outer nodes in DOM hierarchy.
 *
 * If a DOM hierarchy is the following:
 *
 * <div id='id1' ...>
 *   <div id='id2' ...>
 *     <table ...>       // table:0
 *       <tr>            // tr:0
 *         <td>...</td>  // td:0
 *         <td>          // td:1
 *           <amp-ad ...></amp-ad>
 *         </td>
 *       </tr>
 *       <tr>...</tr>    // tr:1
 *     </table>
 *   </div>
 * </div>
 *
 * With the amp-ad element passed in:
 * 'amp-ad.0,td.1,tr.0,table.0,div/id2.0,div/id1.0'
 *
 * Note: 25 is chosen arbitrarily.
 *
 * @param {?Element} element DOM node from which to get fingerprint.
 * @return {string} Concatenated element ids.
 */
function domFingerprintPlain(element) {
  var ids = [];
  var level = 0;

  while (element && element.nodeType ==
  /* element */
  1 && level < 25) {
    var id = '';

    if (element.id) {
      id = "/" + element.id;
    }

    var nodeName = element.nodeName.toLowerCase();
    ids.push("" + nodeName + id + indexWithinParent(element));
    level++;
    element = element.parentElement;
  }

  return ids.join();
}

var DomFingerprint =
/*#__PURE__*/
function () {
  function DomFingerprint() {}

  /**
   * Calculates ad slot DOM fingerprint.  This key is intended to
   * identify "same" ad unit across many page views. This is
   * based on where the ad appears within the page's DOM structure.
   *
   * @param {?Element} element The DOM element from which to collect
   *     the DOM chain element IDs.  If null, DOM chain element IDs are not
   *     included in the hash.
   * @return {string} The ad unit hash key string.
   */
  DomFingerprint.generate = function generate(element) {
    return (0, _string.stringHash32)(domFingerprintPlain(element));
  };

  return DomFingerprint;
}();
/**
 * Gets a string showing the index of an element within
 * the children of its parent, counting only nodes with the same tag.
 * Stop at 25, just to have a limit.
 * @param {!Element} element DOM node to get index of.
 * @return {string} '.<index>' or ''.
 */


exports.DomFingerprint = DomFingerprint;

function indexWithinParent(element) {
  var nodeName = element.nodeName; // Find my index within my parent's children

  var i = 0;
  var count = 0;
  var sibling = element.previousElementSibling; // Different browsers have different children.
  // So count only nodes with the same tag.
  // Use a limit for the tags, so that different browsers get the same
  // count. So 25 and higher all return no index.

  while (sibling && count < 25 && i < 100) {
    if (sibling.nodeName == nodeName) {
      count++;
    }

    i++;
    sibling = sibling.previousElementSibling;
  } // If we got to the end, then the count is accurate; otherwise skip count.


  return count < 25 && i < 100 ? "." + count : '';
}

},{"../string":55}],64:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.once = once;

/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// TODO(rsimha, #15334): Enable this rule.

/* eslint jsdoc/check-types: 0 */

/**
 * Creates a function that is evaluated only once and returns the cached result
 * subsequently.
 *
 * Please note that `once` only takes the function definition into account,
 * so it will return the same cached value even when the arguments are
 * different.
 *
 * @param {function(...):T} fn
 * @return {function(...):T}
 * @template T
 */
function once(fn) {
  var evaluated = false;
  var retValue = null;
  var callback = fn;
  return function () {
    if (!evaluated) {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      retValue = callback.apply(self, args);
      evaluated = true;
      callback = null; // GC
    }

    return retValue;
  };
}

},{}],65:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.LruCache = void 0;

var _log = require("../log");

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const {string} */
var TAG = 'lru-cache';
/**
 * @template T
 */

var LruCache =
/*#__PURE__*/
function () {
  /**
   * @param {number} capacity
   */
  function LruCache(capacity) {
    /** @private @const {number} */
    this.capacity_ = capacity;
    /** @private {number} */

    this.size_ = 0;
    /**
     * An incrementing counter to define the last access.
     * @private {number}
     */

    this.access_ = 0;
    /** @private {!Object<(number|string), {payload: T, access: number}>} */

    this.cache_ = Object.create(null);
  }
  /**
   * Returns whether key is cached.
   *
   * @param {number|string} key
   * @return {boolean}
   */


  var _proto = LruCache.prototype;

  _proto.has = function has(key) {
    return !!this.cache_[key];
  }
  /**
   * @param {number|string} key
   * @return {T} The cached payload.
   */
  ;

  _proto.get = function get(key) {
    var cacheable = this.cache_[key];

    if (cacheable) {
      cacheable.access = ++this.access_;
      return cacheable.payload;
    }

    return undefined;
  }
  /**
   * @param {number|string} key
   * @param {T} payload The payload to cache.
   */
  ;

  _proto.put = function put(key, payload) {
    if (!this.has(key)) {
      this.size_++;
    }

    this.cache_[key] = {
      payload: payload,
      access: this.access_
    };
    this.evict_();
  }
  /**
   * Evicts the oldest cache entry, if we've exceeded capacity.
   */
  ;

  _proto.evict_ = function evict_() {
    if (this.size_ <= this.capacity_) {
      return;
    }

    (0, _log.dev)().warn(TAG, 'Trimming LRU cache');
    var cache = this.cache_;
    var oldest = this.access_ + 1;
    var oldestKey;

    for (var key in cache) {
      var access = cache[key].access;

      if (access < oldest) {
        oldest = access;
        oldestKey = key;
      }
    }

    if (oldestKey !== undefined) {
      delete cache[oldestKey];
      this.size_--;
    }
  };

  return LruCache;
}();

exports.LruCache = LruCache;

},{"../log":45}],66:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.mapRange = mapRange;
exports.mod = mod;
exports.clamp = clamp;
exports.boundValue = boundValue;
exports.magnitude = magnitude;
exports.distance = distance;
exports.polarToCartesian = polarToCartesian;
exports.sum = sum;

var _log = require("../log");

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Maps a value in a first range to its equivalent in a second range
 * Ex.: 5 in the range [0,10] gives 60 in the range[40,80]
 *
 * NOTE: lower/upper bounds on the source range are detected automatically,
 * however the bounds on the target range are not altered (thus the target
 * range could be decreasing).
 * Ex1: 8 in the range [0, 10] gives 2 in the range [10, 0]
 * Ex2: also, 8 in the range [10, 0] gives 2 in the range [10, 0]
 *
 * NOTE: Input value is enforced to be bounded inside the source range
 * Ex1: -2 in the range [0, 10] is interpreted as 0 and thus gives 40 in [40,80]
 * Ex2: 19 in the range [0, 5] is interpreted as 5 and thus gives 80 in [40,80]
 *
 * @param {number} val the value in the source range
 * @param {number} min1 the lower bound of the source range
 * @param {number} max1 the upper bound of the source range
 * @param {number} min2 the lower bound of the target range
 * @param {number} max2 the upper bound of the target range
 * @return {number} the equivalent value in the target range
 */
function mapRange(val, min1, max1, min2, max2) {
  var max1Bound = max1;
  var min1Bound = min1;

  if (min1 > max1) {
    max1Bound = min1;
    min1Bound = max1;
  }

  if (val < min1Bound) {
    val = min1Bound;
  } else if (val > max1Bound) {
    val = max1Bound;
  }

  return (val - min1) * (max2 - min2) / (max1 - min1) + min2;
}
/**
 * Computes the modulus of values `a` and `b`.
 *
 * This is needed because the % operator in JavaScript doesn't implement
 * modulus behavior as can be seen by the spec here:
 * http://www.ecma-international.org/ecma-262/5.1/#sec-11.5.3.
 * It instead is used to obtain the remainder of a division.
 * This function uses the remainder (%) operator to determine the modulus.
 * Derived from here:
 * https://stackoverflow.com/questions/25726760/javascript-modular-arithmetic/47354356#47354356
 *
 * @param {number} a
 * @param {number} b
 * @return {number} returns the modulus of the two numbers.
 * @example
 *
 * _.min(10, 5);
 * // => 0
 *
 * _.mod(-1, 5);
 * // => 4
 */


function mod(a, b) {
  return a > 0 && b > 0 ? a % b : (a % b + b) % b;
}
/**
 * Restricts a number to be in the given min/max range. The minimum value must
 * be less than or equal to the maximum value.
 *
 * Examples:
 * clamp(0.5, 0, 1) -> 0.5
 * clamp(1.5, 0, 1) -> 1
 * clamp(-0.5, 0, 1) -> 0
 *
 * @param {number} val the value to clamp.
 * @param {number} min the lower bound.
 * @param {number} max the upper bound.
 * @return {number} the clamped value.
 */


function clamp(val, min, max) {
  (0, _log.devAssert)(min <= max, 'Minimum value is greater than the maximum.');
  return Math.min(Math.max(val, min), max);
}
/**
 * Returns value bound to min and max values +/- extent. The lower bound must
 * be less than or equal to the upper bound.
 * @param {number} val the value to bound.
 * @param {number} min the lower bound.
 * @param {number} max the upper bound
 * @param {number} extent the allowed extent beyond the bounds.
 * @return {number} the bounded value.
 */


function boundValue(val, min, max, extent) {
  (0, _log.devAssert)(min <= max, 'Lower bound is greater than the upper bound.');
  return clamp(val, min - extent, max + extent);
}
/**
 * Returns the length of a vector given in X- and Y-coordinates.
 * @param {number} deltaX distance in the X direction.
 * @param {number} deltaY distance in the Y direction.
 * @return {number} the magnitude of the vector.
 */


function magnitude(deltaX, deltaY) {
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
/**
 * Returns the distance between two points.
 * @param {number} x1 X-coordinate of the first point.
 * @param {number} y1 Y-coordinate of the first point.
 * @param {number} x2 X-coordinate of the second point.
 * @param {number} y2 Y-coordinate of the second point.
 * @return {number} the distance between the two points.
 */


function distance(x1, y1, x2, y2) {
  return magnitude(x2 - x1, y2 - y1);
}
/**
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} radius
 * @param {number} angleInDegrees
 * @return {{
 *  x: number,
 *  y: number,
 * }}
 */


function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}
/**
 * Sums up the values of the given array and returns the result
 * @param {Array<number>} values
 * @return {number}
 */


function sum(values) {
  return values.reduce(function (a, b) {
    return a + b;
  });
}

},{"../log":45}],67:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.map = map;
exports.dict = dict;
exports.hasOwn = hasOwn;
exports.ownProperty = ownProperty;
exports.deepMerge = deepMerge;
exports.omit = omit;

var _types = require("../types");

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* @const */
var hasOwn_ = Object.prototype.hasOwnProperty;
/**
 * Returns a map-like object.
 * If opt_initial is provided, copies its own properties into the
 * newly created object.
 * @param {T=} opt_initial This should typically be an object literal.
 * @return {T}
 * @template T
 */

function map(opt_initial) {
  var obj = Object.create(null);

  if (opt_initial) {
    Object.assign(obj, opt_initial);
  }

  return obj;
}
/**
 * Return an empty JsonObject or makes the passed in object literal
 * an JsonObject.
 * The JsonObject type is just a simple object that is at-dict.
 * See
 * https://github.com/google/closure-compiler/wiki/@struct-and-@dict-Annotations
 * for what a dict is type-wise.
 * The linter enforces that the argument is, in fact, at-dict like.
 * @param {!Object=} opt_initial
 * @return {!JsonObject}
 */


function dict(opt_initial) {
  // We do not copy. The linter enforces that the passed in object is a literal
  // and thus the caller cannot have a reference to it.
  return (
    /** @type {!JsonObject} */
    opt_initial || {}
  );
}
/**
 * Checks if the given key is a property in the map.
 *
 * @param {T}  obj a map like property.
 * @param {string}  key
 * @return {boolean}
 * @template T
 */


function hasOwn(obj, key) {
  return hasOwn_.call(obj, key);
}
/**
 * Returns obj[key] iff key is obj's own property (is not inherited).
 * Otherwise, returns undefined.
 *
 * @param {Object} obj
 * @param {string} key
 * @return {*}
 */


function ownProperty(obj, key) {
  if (hasOwn(obj, key)) {
    return obj[key];
  } else {
    return undefined;
  }
}
/**
 * Deep merges source into target.
 *
 * @param {!Object} target
 * @param {!Object} source
 * @param {number} depth The maximum merge depth. If exceeded, Object.assign
 *                       will be used instead.
 * @return {!Object}
 * @throws {Error} If source contains a circular reference.
 * Note: Only nested objects are deep-merged, primitives and arrays are not.
 */


function deepMerge(target, source, depth) {
  if (depth === void 0) {
    depth = 10;
  }

  // Keep track of seen objects to detect recursive references.
  var seen = [];
  /** @type {!Array<{t: !Object, s: !Object, d: number}>} */

  var queue = [];
  queue.push({
    t: target,
    s: source,
    d: 0
  }); // BFS to ensure objects don't have recursive references at shallower depths.

  var _loop = function _loop() {
    var _queue$shift = queue.shift(),
        t = _queue$shift.t,
        s = _queue$shift.s,
        d = _queue$shift.d;

    if (seen.includes(s)) {
      throw new Error('Source object has a circular reference.');
    }

    seen.push(s);

    if (t === s) {
      return "continue";
    }

    if (d > depth) {
      Object.assign(t, s);
      return "continue";
    }

    Object.keys(s).forEach(function (key) {
      var newValue = s[key]; // Perform a deep merge IFF both target and source have the same key
      // whose corresponding values are objects.

      if (hasOwn(t, key)) {
        var oldValue = t[key];

        if ((0, _types.isObject)(newValue) && (0, _types.isObject)(oldValue)) {
          queue.push({
            t: oldValue,
            s: newValue,
            d: d + 1
          });
          return;
        }
      }

      t[key] = newValue;
    });
  };

  while (queue.length > 0) {
    var _ret = _loop();

    if (_ret === "continue") continue;
  }

  return target;
}
/**
 * @param {!Object} o An object to remove properties from
 * @param {!Array<string>} props A list of properties to remove from the Object
 * @return {!Object} An object with the given properties removed
 */


function omit(o, props) {
  return Object.keys(o).reduce(function (acc, key) {
    if (!props.includes(key)) {
      acc[key] = o[key];
    }

    return acc;
  }, {});
}

},{"../types":58}],68:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.tryResolve = tryResolve;
exports.some = some;
exports.LastAddedResolver = exports.Deferred = void 0;

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns a Deferred struct, which holds a pending promise and its associated
 * resolve and reject functions.
 *
 * This is preferred instead of creating a Promise instance to extract the
 * resolve/reject functions yourself:
 *
 * ```
 * // Avoid doing
 * let resolve;
 * const promise = new Promise(res => {
 *   resolve = res;
 * });
 *
 * // Good
 * const deferred = new Deferred();
 * const { promise, resolve } = deferred;
 * ```
 *
 * @template T
 */
var Deferred =
/**
 * Creates an instance of Deferred.
 */
function Deferred() {
  var resolve, reject;
  /**
   * @const {!Promise<T>}
   */

  this.promise = new
  /*OK*/
  Promise(function (res, rej) {
    resolve = res;
    reject = rej;
  });
  /**
   * @const {function(T=)}
   */

  this.resolve = resolve;
  /**
   * @const {function(*=)}
   */

  this.reject = reject;
};
/**
 * Creates a promise resolved to the return value of fn.
 * If fn sync throws, it will cause the promise to reject.
 *
 * @param {function():T} fn
 * @return {!Promise<T>}
 * @template T
 */


exports.Deferred = Deferred;

function tryResolve(fn) {
  return new Promise(function (resolve) {
    resolve(fn());
  });
}
/**
 * Returns a promise which resolves if a threshold amount of the given promises
 * resolve, and rejects otherwise.
 * @param {!Array<!Promise>} promises The array of promises to test.
 * @param {number} count The number of promises that must resolve for the
 *     returned promise to resolve.
 * @return {!Promise} A promise that resolves if any of the given promises
 *     resolve, and which rejects otherwise.
 */


function some(promises, count) {
  if (count === void 0) {
    count = 1;
  }

  return new Promise(function (resolve, reject) {
    count = Math.max(count, 0);
    var extra = promises.length - count;

    if (extra < 0) {
      reject(new Error('not enough promises to resolve'));
    }

    if (promises.length == 0) {
      resolve([]);
    }

    var values = [];
    var reasons = [];

    var onFulfilled = function onFulfilled(value) {
      if (values.length < count) {
        values.push(value);
      }

      if (values.length == count) {
        resolve(values);
      }
    };

    var onRejected = function onRejected(reason) {
      if (reasons.length <= extra) {
        reasons.push(reason);
      }

      if (reasons.length > extra) {
        reject(reasons);
      }
    };

    for (var i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then(onFulfilled, onRejected);
    }
  });
}
/**
 * Resolves with the result of the last promise added.
 * @implements {IThenable}
 */


var LastAddedResolver =
/*#__PURE__*/
function () {
  /**
   * @param {!Array<!Promise>=} opt_promises
   */
  function LastAddedResolver(opt_promises) {
    var resolve_, reject_;
    /** @private @const {!Promise} */

    this.promise_ = new Promise(function (resolve, reject) {
      resolve_ = resolve;
      reject_ = reject;
    });
    /** @private */

    this.resolve_ = resolve_;
    /** @private */

    this.reject_ = reject_;
    /** @private */

    this.count_ = 0;

    if (opt_promises) {
      for (var i = 0; i < opt_promises.length; i++) {
        this.add(opt_promises[i]);
      }
    }
  }
  /**
   * Add a promise to possibly be resolved.
   * @param {!Promise} promise
   * @return {!Promise}
   */


  var _proto = LastAddedResolver.prototype;

  _proto.add = function add(promise) {
    var _this = this;

    var countAtAdd = ++this.count_;
    Promise.resolve(promise).then(function (result) {
      if (_this.count_ === countAtAdd) {
        _this.resolve_(result);
      }
    }, function (error) {
      // Don't follow behavior of Promise.all and Promise.race error so that
      // this will only reject when most recently added promise fails.
      if (_this.count_ === countAtAdd) {
        _this.reject_(error);
      }
    });
    return this.promise_;
  }
  /** @override */
  ;

  _proto.then = function then(opt_resolve, opt_reject) {
    return this.promise_.then(opt_resolve, opt_reject);
  };

  return LastAddedResolver;
}();

exports.LastAddedResolver = LastAddedResolver;

},{}],69:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.throttle = throttle;
exports.debounce = debounce;

/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Wraps a given callback and applies a rate limit.
 * It throttles the calls so that no consequent calls have time interval
 * smaller than the given minimal interval.
 *
 * @param {!Window} win
 * @param {function(...*)} callback
 * @param {number} minInterval the minimum time interval in millisecond
 * @return {function(...*)}
 */
function throttle(win, callback, minInterval) {
  var locker = 0;
  var nextCallArgs = null;
  /**
   * @param {!Object} args
   */

  function fire(args) {
    nextCallArgs = null; // Lock the fire for minInterval milliseconds

    locker = win.setTimeout(waiter, minInterval);
    callback.apply(null, args);
  }
  /**
   * Waiter function
   */


  function waiter() {
    locker = 0; // If during the period there're invocations queued up, fire once.

    if (nextCallArgs) {
      fire(nextCallArgs);
    }
  }

  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (locker) {
      nextCallArgs = args;
    } else {
      fire(args);
    }
  };
}
/**
 * Wraps a given callback and applies a wait timer, so that minInterval
 * milliseconds must pass since the last call before the callback is actually
 * invoked.
 *
 * @param {!Window} win
 * @param {function(...*)} callback
 * @param {number} minInterval the minimum time interval in millisecond
 * @return {function(...*)}
 */


function debounce(win, callback, minInterval) {
  var locker = 0;
  var timestamp = 0;
  var nextCallArgs = null;
  /**
   * @param {?Array} args
   */

  function fire(args) {
    nextCallArgs = null;
    callback.apply(null, args);
  }
  /**
   * Wait function for debounce
   */


  function waiter() {
    locker = 0;
    var remaining = minInterval - (win.Date.now() - timestamp);

    if (remaining > 0) {
      locker = win.setTimeout(waiter, remaining);
    } else {
      fire(nextCallArgs);
    }
  }

  return function () {
    timestamp = win.Date.now();

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    nextCallArgs = args;

    if (!locker) {
      locker = win.setTimeout(waiter, minInterval);
    }
  };
}

},{}],70:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.cssEscape = cssEscape;

/*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */

/**
 * This regex consists of 4 matching capture groups and one (non-matching) fallback:
 *
 * - (\0), catch the null terminator character so it may be replaced by UTF
 *   Replacement Char
 * - ^(-)$, catch a solitary dash char, so that it may be backslash escaped.
 *   This is a separate capture group so that the legal-chars (group 4) doesn't
 *   capture it first, since that group doesn't need to escape its dash.
 * - ([\x01-\x1f\x7f]|^-?[0-9]), catch a UTF control char, or any leading
 *   number (with an optional leading dash). The control or the number (but not
 *   the leading dash) must be hex-escaped,.
 * - ([\x80-\uffff0-9a-zA-Z_-]+), catch legal-chars, with the exception of a
 *   solitary dash, which will already have matched in group 1.
 * - [^], finally, a catch-all that allows us to backslash escape the char.
 *
 * Together, this matches everything necessary for CSS.escape.
 */
var regex = /(\0)|^(-)$|([\x01-\x1f\x7f]|^-?[0-9])|([\x80-\uffff0-9a-zA-Z_-]+)|[^]/g;

function escaper(match, nil, dash, hexEscape, chars) {
  // Chars is the legal-chars (group 4) capture
  if (chars) {
    return chars;
  } // Nil is the null terminator (group 1) capture


  if (nil) {
    return "\uFFFD";
  } // Both UTF control chars, and leading numbers (with optional leading dash)
  // (group 3) must be backslash escaped with a trailing space.  Funnily, the
  // leading dash must not be escaped, but the number. :shrug:


  if (hexEscape) {
    return match.slice(0, -1) + '\\' + match.slice(-1).charCodeAt(0).toString(16) + ' ';
  } // Finally, the solitary dash and the catch-all chars require backslash
  // escaping.


  return '\\' + match;
}
/**
 * https://drafts.csswg.org/cssom/#serialize-an-identifier
 * @param {string} value
 * @return {string}
 */


function cssEscape(value) {
  return String(value).replace(regex, escaper);
}

},{}]},{},[15])


})});
//# sourceMappingURL=amp-ad-0.1.max.js.map
