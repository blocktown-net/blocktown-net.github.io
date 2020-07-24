(self.AMP=self.AMP||[]).push({n:"amp-brid-player",v:"1910072132470",f:(function(AMP,_){
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.cssText = void 0;

/** @noinline */
var cssText = "i-amphtml-video-mask{display:block;z-index:1}.amp-video-eq{display:none}.i-amphtml-video-component:not(amp-video) .amp-video-eq,amp-story .amp-video-eq,amp-video[controls] .amp-video-eq{display:-ms-flexbox;display:flex}[noaudio] .amp-video-eq{display:none!important}.amp-video-eq{pointer-events:none!important;-ms-flex-align:end;align-items:flex-end;bottom:7px;height:12px;opacity:0.8;overflow:hidden;position:absolute;right:7px;width:20px;z-index:1}.amp-video-eq .amp-video-eq-col{-ms-flex:1;flex:1;height:100%;margin-right:1px;position:relative}.amp-video-eq .amp-video-eq-col div{animation-name:amp-video-eq-animation;animation-timing-function:linear;animation-iteration-count:infinite;animation-direction:alternate;background-color:#fafafa;height:100%;position:absolute;width:100%;will-change:transform;animation-play-state:paused}.amp-video-eq[unpausable] .amp-video-eq-col div{animation-name:none}.amp-video-eq[unpausable].amp-video-eq-play .amp-video-eq-col div{animation-name:amp-video-eq-animation}.amp-video-eq.amp-video-eq-play .amp-video-eq-col div{animation-play-state:running}.amp-video-eq-1-1{animation-duration:0.3s;transform:translateY(60%)}.amp-video-eq-1-2{animation-duration:0.45s;transform:translateY(60%)}.amp-video-eq-2-1{animation-duration:0.5s;transform:translateY(30%)}.amp-video-eq-2-2{animation-duration:0.4s;transform:translateY(30%)}.amp-video-eq-3-1{animation-duration:0.3s;transform:translateY(70%)}.amp-video-eq-3-2{animation-duration:0.35s;transform:translateY(70%)}.amp-video-eq-4-1{animation-duration:0.4s;transform:translateY(50%)}.amp-video-eq-4-2{animation-duration:0.25s;transform:translateY(50%)}@keyframes amp-video-eq-animation{0%{transform:translateY(100%)}to{transform:translateY(0)}}\n/*# sourceURL=/css/video-autoplay.css*/";
exports.cssText = cssText;

},{}],2:[function(require,module,exports){
"use strict";

var _promise = require("../../../src/utils/promise");

var _services = require("../../../src/services");

var _videoInterface = require("../../../src/video-interface");

var _url = require("../../../src/url");

var _iframeVideo = require("../../../src/iframe-video");

var _log = require("../../../src/log");

var _dom = require("../../../src/dom");

var _eventHelper = require("../../../src/event-helper");

var _staticTemplate = require("../../../src/static-template");

var _videoManagerImpl = require("../../../src/service/video-manager-impl");

var _layout = require("../../../src/layout");

function _templateObject() {
  var data = _taggedTemplateLiteralLoose(["\n      <amp-img referrerpolicy=origin layout=fill placeholder>\n        <amp-img referrerpolicy=origin layout=fill fallback\n            src=\"https://cdn.brid.tv/live/default/defaultSnapshot.png\">\n        </amp-img>\n      </amp-img>"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var TAG = 'amp-brid-player';
/**
 * @implements {../../../src/video-interface.VideoInterface}
 */

var AmpBridPlayer =
/*#__PURE__*/
function (_AMP$BaseElement) {
  _inheritsLoose(AmpBridPlayer, _AMP$BaseElement);

  /** @param {!AmpElement} element */
  function AmpBridPlayer(element) {
    var _this;

    _this = _AMP$BaseElement.call(this, element) || this;
    /** @private {string} */

    _this.partnerID_ = '';
    /** @private {string} */

    _this.feedID_ = '';
    /** @private {string} */

    _this.playerID_ = '';
    /** @private {?HTMLIFrameElement} */

    _this.iframe_ = null;
    /** @private {?Promise} */

    _this.playerReadyPromise_ = null;
    /** @private {?Function} */

    _this.playerReadyResolver_ = null;
    /** @private {?string} */

    _this.videoIframeSrc_ = null;
    /** @private {?number} */

    _this.volume_ = null;
    /** @private {?Function} */

    _this.unlistenMessage_ = null;
    return _this;
  }
  /**
   * @param {boolean=} opt_onLayout
   * @override
   */


  var _proto = AmpBridPlayer.prototype;

  _proto.preconnectCallback = function preconnectCallback(opt_onLayout) {
    this.preconnect.url('https://services.brid.tv', opt_onLayout);
    this.preconnect.url('https://cdn.brid.tv', opt_onLayout);
  }
  /** @override */
  ;

  _proto.isLayoutSupported = function isLayoutSupported(layout) {
    return (0, _layout.isLayoutSizeDefined)(layout);
  }
  /**
   * Gets the source of video
   *
   * @return {string}
   */
  ;

  _proto.getVideoIframeSrc_ = function getVideoIframeSrc_() {
    if (this.videoIframeSrc_) {
      return this.videoIframeSrc_;
    }

    var feedType = '';
    var itemsNum = this.element.hasAttribute('data-dynamic') ? '10' : '1';

    if (this.element.hasAttribute('data-video')) {
      feedType = 'video';
    } else if (this.element.hasAttribute('data-dynamic')) {
      feedType = this.element.getAttribute('data-dynamic');
    } else if (this.element.hasAttribute('data-playlist')) {
      feedType = 'playlist';
    } else if (this.element.hasAttribute('data-outstream')) {
      feedType = 'outstream';
    } //Create iframe


    var src = 'https://services.brid.tv/services/iframe/' + encodeURIComponent(feedType) + '/' + encodeURIComponent(this.feedID_) + '/' + encodeURIComponent(this.partnerID_) + '/' + encodeURIComponent(this.playerID_) + '/0/' + itemsNum + '/?amp=1';
    this.videoIframeSrc_ = (0, _url.assertAbsoluteHttpOrHttpsUrl)(src);
    return this.videoIframeSrc_;
  }
  /** @override */
  ;

  _proto.buildCallback = function buildCallback() {
    var element = this.element;
    this.partnerID_ = (0, _log.userAssert)(element.getAttribute('data-partner'), 'The data-partner attribute is required for <amp-brid-player> %s', element);
    this.playerID_ = (0, _log.userAssert)(element.getAttribute('data-player'), 'The data-player attribute is required for <amp-brid-player> %s', element);
    this.feedID_ = (0, _log.userAssert)(element.getAttribute('data-video') || element.getAttribute('data-playlist') || element.getAttribute('data-outstream'), 'Either the data-video or the data-playlist or the data-outstream ' + 'attributes must be specified for <amp-brid-player> %s', element);
    var deferred = new _promise.Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    (0, _videoManagerImpl.installVideoManagerForDoc)(element);

    _services.Services.videoManagerForDoc(element).register(this);
  }
  /** @override */
  ;

  _proto.layoutCallback = function layoutCallback() {
    var _this2 = this;

    var iframe = (0, _iframeVideo.createFrameFor)(this, this.getVideoIframeSrc_());
    this.iframe_ =
    /** @type {HTMLIFrameElement} */
    iframe;
    this.unlistenMessage_ = (0, _eventHelper.listen)(this.win, 'message', this.handleBridMessage_.bind(this));
    return this.loadPromise(iframe).then(function () {
      return _this2.playerReadyPromise_;
    });
  }
  /** @override */
  ;

  _proto.unlayoutCallback = function unlayoutCallback() {
    if (this.iframe_) {
      (0, _dom.removeElement)(this.iframe_);
      this.iframe_ = null;
    }

    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }

    var deferred = new _promise.Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    return true; // Call layoutCallback again.
  }
  /** @override */
  ;

  _proto.pauseCallback = function pauseCallback() {
    this.pause();
  }
  /** @override */
  ;

  _proto.createPlaceholderCallback = function createPlaceholderCallback() {
    var element = this.element;

    if (!element.hasAttribute('data-video') && !element.hasAttribute('data-playlist')) {
      return;
    }

    var partnerID = this.partnerID_,
        feedID = this.feedID_;
    var placeholder = (0, _staticTemplate.htmlFor)(element)(_templateObject());
    this.propagateAttributes(['aria-label'], placeholder);
    this.applyFillContent(placeholder);
    placeholder.setAttribute('src', "https://cdn.brid.tv/live/partners/" + encodeURIComponent(partnerID) + ("/snapshot/" + encodeURIComponent(feedID) + ".jpg"));
    var altText = placeholder.hasAttribute('aria-label') ? 'Loading video - ' + placeholder.getAttribute('aria-label') : 'Loading video';
    placeholder.setAttribute('alt', altText);
    return placeholder;
  }
  /**
   * Sends a command to the player through postMessage.
   * @param {string} command
   * @param {*=} opt_arg
   * @private
   * */
  ;

  _proto.sendCommand_ = function sendCommand_(command, opt_arg) {
    var _this3 = this;

    this.playerReadyPromise_.then(function () {
      if (_this3.iframe_ && _this3.iframe_.contentWindow) {
        var args = opt_arg === undefined ? '' : '|' + opt_arg;
        var message = 'Brid|' + command + args;

        _this3.iframe_.contentWindow.
        /*OK*/
        postMessage(message, '*');
      }
    });
  }
  /**
   * @param {!Event} event
   * @private
   */
  ;

  _proto.handleBridMessage_ = function handleBridMessage_(event) {
    if (!(0, _iframeVideo.originMatches)(event, this.iframe_, 'https://services.brid.tv')) {
      return;
    }

    var eventData =
    /** @type {?string|undefined} */
    (0, _eventHelper.getData)(event);

    if (typeof eventData !== 'string' || eventData.indexOf('Brid') !== 0) {
      return;
    }

    var element = this.element;
    var params = eventData.split('|');

    if (params[2] == 'trigger') {
      if (params[3] == 'ready') {
        this.playerReadyResolver_(this.iframe_);
      }

      (0, _iframeVideo.redispatch)(element, params[3], {
        'ready': _videoInterface.VideoEvents.LOAD,
        'play': _videoInterface.VideoEvents.PLAYING,
        'pause': _videoInterface.VideoEvents.PAUSE
      });
      return;
    }

    if (params[2] == 'volume') {
      this.volume_ = parseFloat(params[3]);
      element.dispatchCustomEvent((0, _iframeVideo.mutedOrUnmutedEvent)(this.volume_ <= 0));
      return;
    }
  }
  /** @override */
  ;

  _proto.supportsPlatform = function supportsPlatform() {
    return true;
  }
  /** @override */
  ;

  _proto.isInteractive = function isInteractive() {
    return true;
  }
  /** @override */
  ;

  _proto.play = function play(unusedIsAutoplay) {
    this.sendCommand_('play');
  }
  /** @override */
  ;

  _proto.pause = function pause() {
    this.sendCommand_('pause');
  }
  /** @override */
  ;

  _proto.mute = function mute() {
    this.sendCommand_('muted', 1);
    this.sendCommand_('volume', 0);
  }
  /** @override */
  ;

  _proto.unmute = function unmute() {
    this.sendCommand_('muted', 0);
    this.sendCommand_('volume', 1);
  }
  /** @override */
  ;

  _proto.showControls = function showControls() {} // Not supported.

  /** @override */
  ;

  _proto.hideControls = function hideControls() {} // Not supported.

  /**
   * @override
   */
  ;

  _proto.fullscreenEnter = function fullscreenEnter() {
    if (!this.iframe_) {
      return;
    }

    (0, _dom.fullscreenEnter)((0, _log.dev)().assertElement(this.iframe_));
  }
  /**
   * @override
   */
  ;

  _proto.fullscreenExit = function fullscreenExit() {
    if (!this.iframe_) {
      return;
    }

    (0, _dom.fullscreenExit)((0, _log.dev)().assertElement(this.iframe_));
  }
  /** @override */
  ;

  _proto.isFullscreen = function isFullscreen() {
    if (!this.iframe_) {
      return false;
    }

    return (0, _dom.isFullscreenElement)((0, _log.dev)().assertElement(this.iframe_));
  }
  /** @override */
  ;

  _proto.getMetadata = function getMetadata() {} // Not implemented

  /** @override */
  ;

  _proto.preimplementsMediaSessionAPI = function preimplementsMediaSessionAPI() {
    return false;
  }
  /** @override */
  ;

  _proto.preimplementsAutoFullscreen = function preimplementsAutoFullscreen() {
    return false;
  }
  /** @override */
  ;

  _proto.getCurrentTime = function getCurrentTime() {
    // Not supported.
    return 0;
  }
  /** @override */
  ;

  _proto.getDuration = function getDuration() {
    // Not supported.
    return 1;
  }
  /** @override */
  ;

  _proto.getPlayedRanges = function getPlayedRanges() {
    // Not supported.
    return [];
  }
  /** @override */
  ;

  _proto.seekTo = function seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  };

  return AmpBridPlayer;
}(AMP.BaseElement);

AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerElement(TAG, AmpBridPlayer);
});

},{"../../../src/dom":7,"../../../src/event-helper":10,"../../../src/iframe-video":12,"../../../src/layout":15,"../../../src/log":16,"../../../src/service/video-manager-impl":23,"../../../src/services":27,"../../../src/static-template":28,"../../../src/url":35,"../../../src/utils/promise":40,"../../../src/video-interface":42}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ActionTrust = exports.DEFAULT_ACTION = exports.RAW_OBJECT_ARGS_KEY = void 0;

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
 * Key string in an action arguments map for an unparsed object literal string.
 *
 * E.g. for the action in <p on="tap:AMP.setState({foo: 'bar'})",
 * then `args[RAW_OBJECT_ARGS_KEY]` is the string "{foo: 'bar'}".
 *
 * The action service delegates parsing of object literals to the corresponding
 * extension (in the example above, amp-bind).
 *
 * @see ./service/action-impl.ActionInfoDef
 * @const {string}
 */
var RAW_OBJECT_ARGS_KEY = '__AMP_OBJECT_STRING__';
/** @const {string} Identifier for an element's default action. */

exports.RAW_OBJECT_ARGS_KEY = RAW_OBJECT_ARGS_KEY;
var DEFAULT_ACTION = 'activate';
/**
 * Trust level of an action.
 *
 * Corresponds to degree of user intent, i.e. events triggered with strong
 * user intent have high trust.
 *
 * @enum {number}
 */

exports.DEFAULT_ACTION = DEFAULT_ACTION;
var ActionTrust = {
  LOW: 1,
  HIGH: 100
};
exports.ActionTrust = ActionTrust;

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"../third_party/css-escape/css-escape":43,"./log":16}],7:[function(require,module,exports){
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

},{"./css":6,"./log":16,"./string":29,"./types":32,"./utils/object":39,"./utils/promise":40}],8:[function(require,module,exports){
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

},{"./dom":7,"./log":16,"./service":22,"./types":32}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"./dom":7,"./event-helper-listen":9,"./log":16}],11:[function(require,module,exports){
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

},{"./log":16,"./mode":19,"./url":35,"./utils/object":39}],12:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.originMatches = originMatches;
exports.redispatch = redispatch;
exports.createFrameFor = createFrameFor;
exports.isJsonOrObj = isJsonOrObj;
exports.objOrParseJson = objOrParseJson;
exports.mutedOrUnmutedEvent = mutedOrUnmutedEvent;
exports.addUnsafeAllowAutoplay = addUnsafeAllowAutoplay;
exports.SandboxOptions = void 0;

var _services = require("./services");

var _videoInterface = require("./video-interface");

var _log = require("./log");

var _staticTemplate = require("./static-template");

var _types = require("./types");

var _string = require("./string");

var _json = require("./json");

function _templateObject() {
  var data = _taggedTemplateLiteralLoose(["<iframe frameborder=0 allowfullscreen></iframe>"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/** @enum {string} */
var SandboxOptions = {
  ALLOW_SCRIPTS: 'allow-scripts',
  ALLOW_SAME_ORIGIN: 'allow-same-origin',
  ALLOW_POPUPS: 'allow-popups',
  ALLOW_POPUPS_TO_ESCAPE_SANDBOX: 'allow-popups-to-escape-sandbox',
  ALLOW_TOP_NAVIGATION_BY_USER_ACTIVATION: 'allow-top-navigation-by-user-activation'
};
/**
 * @param {!Event} event
 * @param {?Element} iframe
 * @param {string|!RegExp} host
 * @return {boolean}
 */

exports.SandboxOptions = SandboxOptions;

function originMatches(event, iframe, host) {
  if (!iframe || event.source != iframe.contentWindow) {
    return false;
  }

  if (typeof host === 'string') {
    return host == event.origin;
  }

  return host.test(event.origin);
}
/**
 * Re-dispatches an event received from postMessage as an event in the host
 * document.
 *
 * @param {!AmpElement} element
 * @param {string} event
 * @param {!Object<string, (string|?Array<string>)>} events
 * @return {boolean}
 */


function redispatch(element, event, events) {
  if (events[event] == null) {
    return false;
  }

  var dispatchEvent = events[event];
  ((0, _types.isArray)(dispatchEvent) ? dispatchEvent : [dispatchEvent]).forEach(function (e) {
    element.dispatchCustomEvent((0, _log.dev)().assertString(e));
  });
  return true;
}
/**
 * @param {!./base-element.BaseElement} video
 * @param {string} src
 * @param {string=} opt_name
 * @param {!Array<!SandboxOptions>=} opt_sandbox
 * @return {!Element}
 */


function createFrameFor(video, src, opt_name, opt_sandbox) {
  var element = video.element;
  var frame = (0, _staticTemplate.htmlFor)(element)(_templateObject());

  if (opt_name) {
    frame.setAttribute('name', opt_name);
  }

  if (opt_sandbox) {
    frame.setAttribute('sandbox', opt_sandbox.join(' '));
  } // Will propagate for every component, but only validation rules will actually
  // allow the attribute to be set.


  video.propagateAttributes(['referrerpolicy'], frame);
  frame.src = _services.Services.urlForDoc(element).assertHttpsUrl(src, element);
  video.applyFillContent(frame);
  element.appendChild(frame);
  return frame;
}
/**
 * @param {?} anything
 * @return {boolean}
 */


function isJsonOrObj(anything) {
  if (!anything) {
    return false;
  }

  return (0, _types.isObject)(anything) || (0, _string.startsWith)(
  /** @type {string} */
  anything, '{');
}
/**
 * @param {?JsonObject|string|undefined} objOrStr
 * @return {?JsonObject|undefined}
 */


function objOrParseJson(objOrStr) {
  if ((0, _types.isObject)(objOrStr)) {
    return (
      /** @type {!JsonObject} */
      objOrStr
    );
  }

  return (0, _json.tryParseJson)(objOrStr);
}
/**
 * @param {boolean} isMuted
 * @return {string}
 */


function mutedOrUnmutedEvent(isMuted) {
  return isMuted ? _videoInterface.VideoEvents.MUTED : _videoInterface.VideoEvents.UNMUTED;
}
/**
 * TEMPORARY workaround for M72-M74 user-activation breakage.
 * If this method is still here in May 2019, please ping @aghassemi
 * Only used by trusted video players: IMA and YouTube.
 * See https://github.com/ampproject/amphtml/issues/21242 for details.
 * TODO(aghassemi, #21247)
 * @param {Element} iframe
 */


function addUnsafeAllowAutoplay(iframe) {
  var val = iframe.getAttribute('allow') || '';
  val += 'autoplay;';
  iframe.setAttribute('allow', val);
}

},{"./json":14,"./log":16,"./services":27,"./static-template":28,"./string":29,"./types":32,"./video-interface":42}],13:[function(require,module,exports){
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
  return '1910072132470';
}

},{}],14:[function(require,module,exports){
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

},{"./dom":7,"./types":32}],15:[function(require,module,exports){
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

},{"./log":16,"./static-template":28,"./string":29,"./style":31,"./types":32}],16:[function(require,module,exports){
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

},{"./config":5,"./internal-version":13,"./mode":19,"./mode-object":18,"./types":32,"./utils/function":36}],17:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setMediaSession = setMediaSession;
exports.parseSchemaImage = parseSchemaImage;
exports.parseOgImage = parseOgImage;
exports.parseFavicon = parseFavicon;
exports.EMPTY_METADATA = exports.MetadataDef = void 0;

var _services = require("./services");

var _log = require("./log");

var _types = require("./types");

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

/**
 * @typedef {{
 *   artwork: Array,
 *   title: string,
 *   album: string,
 *   artist: string,
 * }}
 */
var MetadataDef;
/** @const {MetadataDef} Dummy metadata used to fix a bug */

exports.MetadataDef = MetadataDef;
var EMPTY_METADATA = {
  'title': '',
  'artist': '',
  'album': '',
  'artwork': [{
    'src': ''
  }]
};
/**
 * Updates the Media Session API's metadata
 * @param {!Element} element
 * @param {!Window} win
 * @param {!MetadataDef} metadata
 * @param {function()=} playHandler
 * @param {function()=} pauseHandler
 */

exports.EMPTY_METADATA = EMPTY_METADATA;

function setMediaSession(element, win, metadata, playHandler, pauseHandler) {
  var navigator = win.navigator;

  if ('mediaSession' in navigator && win.MediaMetadata) {
    // Clear mediaSession (required to fix a bug when switching between two
    // videos)
    navigator.mediaSession.metadata = new win.MediaMetadata(EMPTY_METADATA); // Add metadata

    validateMetadata(element, metadata);
    navigator.mediaSession.metadata = new win.MediaMetadata(metadata);
    navigator.mediaSession.setActionHandler('play', playHandler);
    navigator.mediaSession.setActionHandler('pause', pauseHandler); // TODO(@wassgha) Implement seek & next/previous
  }
}
/**
 * Parses the schema.org json-ld formatted meta-data, looks for the page's
 * featured image and returns it
 * @param {!Document} doc
 * @return {string|undefined}
 */


function parseSchemaImage(doc) {
  var schema = doc.querySelector('script[type="application/ld+json"]');

  if (!schema) {
    // No schema element found
    return;
  }

  var schemaJson = (0, _json.tryParseJson)(schema.textContent);

  if (!schemaJson || !schemaJson['image']) {
    // No image found in the schema
    return;
  } // Image definition in schema could be one of :


  if (typeof schemaJson['image'] === 'string') {
    // 1. "image": "http://..",
    return schemaJson['image'];
  } else if (schemaJson['image']['@list'] && typeof schemaJson['image']['@list'][0] === 'string') {
    // 2. "image": {.., "@list": ["http://.."], ..}
    return schemaJson['image']['@list'][0];
  } else if (typeof schemaJson['image']['url'] === 'string') {
    // 3. "image": {.., "url": "http://..", ..}
    return schemaJson['image']['url'];
  } else if (typeof schemaJson['image'][0] === 'string') {
    // 4. "image": ["http://.. "]
    return schemaJson['image'][0];
  } else {
    return;
  }
}
/**
 * Parses the og:image if it exists and returns it
 * @param {!Document} doc
 * @return {string|undefined}
 */


function parseOgImage(doc) {
  var metaTag = doc.querySelector('meta[property="og:image"]');

  if (metaTag) {
    return metaTag.getAttribute('content');
  } else {
    return;
  }
}
/**
 * Parses the website's Favicon and returns it
 * @param {!Document} doc
 * @return {string|undefined}
 */


function parseFavicon(doc) {
  var linkTag = doc.querySelector('link[rel="shortcut icon"]') || doc.querySelector('link[rel="icon"]');

  if (linkTag) {
    return linkTag.getAttribute('href');
  } else {
    return;
  }
}
/**
 * @param {!Element} element
 * @param {!MetadataDef} metadata
 * @private
 */


function validateMetadata(element, metadata) {
  var urlService = _services.Services.urlForDoc(element); // Ensure src of artwork has valid protocol


  if (metadata && metadata.artwork) {
    var artwork = metadata.artwork;
    (0, _log.devAssert)((0, _types.isArray)(artwork));
    artwork.forEach(function (item) {
      if (item) {
        var src = (0, _types.isObject)(item) ? item.src : item;
        (0, _log.userAssert)(urlService.isProtocolValid(src));
      }
    });
  }
}

},{"./json":14,"./log":16,"./services":27,"./types":32}],18:[function(require,module,exports){
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

},{"./mode":19}],19:[function(require,module,exports){
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

},{"./internal-version":13,"./url-parse-query-string":33}],20:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.Observable = void 0;

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
 * This class helps to manage observers. Observers can be added, removed or
 * fired through and instance of this class.
 * @template TYPE
 */
var Observable =
/*#__PURE__*/
function () {
  /**
   * Creates an instance of Observable.
   */
  function Observable() {
    /** @type {?Array<function(TYPE)>} */
    this.handlers_ = null;
  }
  /**
   * Adds the observer to this instance.
   * @param {function(TYPE)} handler Observer's handler.
   * @return {!UnlistenDef}
   */


  var _proto = Observable.prototype;

  _proto.add = function add(handler) {
    var _this = this;

    if (!this.handlers_) {
      this.handlers_ = [];
    }

    this.handlers_.push(handler);
    return function () {
      _this.remove(handler);
    };
  }
  /**
   * Removes the observer from this instance.
   * @param {function(TYPE)} handler Observer's instance.
   */
  ;

  _proto.remove = function remove(handler) {
    if (!this.handlers_) {
      return;
    }

    var index = this.handlers_.indexOf(handler);

    if (index > -1) {
      this.handlers_.splice(index, 1);
    }
  }
  /**
   * Removes all observers.
   */
  ;

  _proto.removeAll = function removeAll() {
    if (!this.handlers_) {
      return;
    }

    this.handlers_.length = 0;
  }
  /**
   * Fires an event. All observers are called.
   * @param {TYPE=} opt_event
   */
  ;

  _proto.fire = function fire(opt_event) {
    if (!this.handlers_) {
      return;
    }

    var handlers = this.handlers_;

    for (var i = 0; i < handlers.length; i++) {
      var handler = handlers[i];
      handler(opt_event);
    }
  }
  /**
   * Returns number of handlers. Mostly needed for tests.
   * @return {number}
   */
  ;

  _proto.getHandlerCount = function getHandlerCount() {
    if (!this.handlers_) {
      return 0;
    }

    return this.handlers_.length;
  };

  return Observable;
}();

exports.Observable = Observable;

},{}],21:[function(require,module,exports){
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

},{"./log":16,"./service":22,"./services":27}],22:[function(require,module,exports){
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

},{"./experiments":11,"./log":16,"./types":32,"./utils/promise":40}],23:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.installVideoManagerForDoc = installVideoManagerForDoc;
exports.AnalyticsPercentageTracker = exports.PERCENTAGE_INTERVAL = exports.AutoFullscreenManager = exports.VideoManager = void 0;

var _actionConstants = require("../action-constants");

var _mediasessionHelper = require("../mediasession-helper");

var _videoInterface = require("../video-interface");

var _services = require("../services");

var _videoSessionManager = require("./video-session-manager");

var _video = require("../utils/video");

var _math = require("../utils/math");

var _eventHelper = require("../event-helper");

var _log = require("../log");

var _object = require("../utils/object");

var _mode = require("../mode");

var _installAutoplayStyles = require("./video/install-autoplay-styles");

var _types = require("../types");

var _function = require("../utils/function");

var _service = require("../service");

var _dom = require("../dom");

var _autoplay = require("./video/autoplay");

var _string = require("../string");

var _style = require("../style");

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

/** @private @const {string} */
var TAG = 'video-manager';
/**
 * @private {number} The minimum number of milliseconds to wait between each
 * video-seconds-played analytics event.
 */

var SECONDS_PLAYED_MIN_DELAY = 1000;
/**
 * VideoManager keeps track of all AMP video players that implement
 * the common Video API {@see ../video-interface.VideoInterface}.
 *
 * It is responsible for providing a unified user experience and analytics for
 * all videos within a document.
 *
 * @implements {../service.Disposable}
 */

var VideoManager =
/*#__PURE__*/
function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function VideoManager(ampdoc) {
    var _this = this;

    /** @const {!./ampdoc-impl.AmpDoc}  */
    this.ampdoc = ampdoc;
    /** @const */

    this.installAutoplayStyles = (0, _function.once)(function () {
      return (0, _installAutoplayStyles.installAutoplayStylesForDoc)(_this.ampdoc);
    });
    /** @private {!../service/viewport/viewport-interface.ViewportInterface} */

    this.viewport_ = _services.Services.viewportForDoc(this.ampdoc);
    /** @private {?Array<!VideoEntry>} */

    this.entries_ = null;
    /** @private {boolean} */

    this.scrollListenerInstalled_ = false;
    /** @private @const */

    this.timer_ = _services.Services.timerFor(ampdoc.win);
    /** @private @const */

    this.actions_ = _services.Services.actionServiceForDoc(ampdoc.getHeadNode());
    /**
     * @private
     * @const
     * @return {undefined}
     */

    this.boundSecondsPlaying_ = function () {
      return _this.secondsPlaying_();
    };
    /** @private @const {function():!AutoFullscreenManager} */


    this.getAutoFullscreenManager_ = (0, _function.once)(function () {
      return new AutoFullscreenManager(_this.ampdoc, _this);
    }); // TODO(cvializ, #10599): It would be nice to only create the timer
    // if video analytics are present, since the timer is not needed if
    // video analytics are not present.

    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
  }
  /** @override */


  var _proto = VideoManager.prototype;

  _proto.dispose = function dispose() {
    this.getAutoFullscreenManager_().dispose();

    if (!this.entries_) {
      return;
    }

    for (var i = 0; i < this.entries_.length; i++) {
      var entry = this.entries_[i];
      entry.dispose();
    }
  }
  /**
   * Each second, trigger video-seconds-played for videos that are playing
   * at trigger time.
   * @private
   */
  ;

  _proto.secondsPlaying_ = function secondsPlaying_() {
    for (var i = 0; i < this.entries_.length; i++) {
      var entry = this.entries_[i];

      if (entry.getPlayingState() !== _videoInterface.PlayingStates.PAUSED) {
        analyticsEvent(entry, _videoInterface.VideoAnalyticsEvents.SECONDS_PLAYED);
        this.timeUpdateActionEvent_(entry);
      }
    }

    this.timer_.delay(this.boundSecondsPlaying_, SECONDS_PLAYED_MIN_DELAY);
  }
  /**
   * Triggers a LOW-TRUST timeupdate event consumable by AMP actions.
   * Frequency of this event is controlled by SECONDS_PLAYED_MIN_DELAY and is
   * every 1 second for now.
   * @param {!VideoEntry} entry
   * @private
   */
  ;

  _proto.timeUpdateActionEvent_ = function timeUpdateActionEvent_(entry) {
    var name = 'timeUpdate';
    var currentTime = entry.video.getCurrentTime();
    var duration = entry.video.getDuration();

    if ((0, _types.isFiniteNumber)(currentTime) && (0, _types.isFiniteNumber)(duration) && duration > 0) {
      var perc = currentTime / duration;
      var event = (0, _eventHelper.createCustomEvent)(this.ampdoc.win, TAG + "." + name, (0, _object.dict)({
        'time': currentTime,
        'percent': perc
      }));
      this.actions_.trigger(entry.video.element, name, event, _actionConstants.ActionTrust.LOW);
    }
  }
  /** @param {!../video-interface.VideoInterface} video */
  ;

  _proto.register = function register(video) {
    (0, _log.devAssert)(video);
    this.registerCommonActions_(video);

    if (!video.supportsPlatform()) {
      return;
    }

    this.entries_ = this.entries_ || [];
    var entry = new VideoEntry(this, video);
    this.maybeInstallVisibilityObserver_(entry);
    this.entries_.push(entry);
    var element = entry.video.element;
    element.dispatchCustomEvent(_videoInterface.VideoEvents.REGISTERED);
    element.classList.add('i-amphtml-video-component'); // Unlike events, signals are permanent. We can wait for `REGISTERED` at any
    // moment in the element's lifecycle and the promise will resolve
    // appropriately each time.

    var signals =
    /** @type {!../base-element.BaseElement} */
    video.signals();
    signals.signal(_videoInterface.VideoEvents.REGISTERED); // Add a class to element to indicate it implements the video interface.

    element.classList.add('i-amphtml-video-interface');
  }
  /**
   * Register common actions such as play, pause, etc... on the video element
   * so they can be called using AMP Actions.
   * For example: <button on="tap:myVideo.play">
   *
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  ;

  _proto.registerCommonActions_ = function registerCommonActions_(video) {
    // Only require ActionTrust.LOW for video actions to defer to platform
    // specific handling (e.g. user gesture requirement for unmuted playback).
    var trust = _actionConstants.ActionTrust.LOW;
    registerAction('play', function () {
      return video.play(
      /* isAutoplay */
      false);
    });
    registerAction('pause', function () {
      return video.pause();
    });
    registerAction('mute', function () {
      return video.mute();
    });
    registerAction('unmute', function () {
      return video.unmute();
    });
    registerAction('fullscreen', function () {
      return video.fullscreenEnter();
    });
    /**
     * @param {string} action
     * @param {function()} fn
     */

    function registerAction(action, fn) {
      video.registerAction(action, function () {
        (0, _videoInterface.userInteractedWith)(video);
        fn();
      }, trust);
    }
  }
  /**
   * Install the necessary listeners to be notified when a video becomes visible
   * in the viewport.
   *
   * Visibility of a video is defined by being in the viewport AND having
   * {@link MIN_VISIBILITY_RATIO_FOR_AUTOPLAY} of the video element visible.
   *
   * @param {VideoEntry} entry
   * @private
   */
  ;

  _proto.maybeInstallVisibilityObserver_ = function maybeInstallVisibilityObserver_(entry) {
    var _this2 = this;

    var element = entry.video.element;
    (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.VISIBILITY, function (details) {
      var data = (0, _eventHelper.getData)(details);

      if (data && data['visible'] == true) {
        entry.updateVisibility(
        /* opt_forceVisible */
        true);
      } else {
        entry.updateVisibility();
      }
    });
    (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.RELOAD, function () {
      entry.videoLoaded();
    }); // TODO(aghassemi, #6425): Use IntersectionObserver

    if (!this.scrollListenerInstalled_) {
      var scrollListener = function scrollListener() {
        for (var i = 0; i < _this2.entries_.length; i++) {
          _this2.entries_[i].updateVisibility();
        }
      };

      this.viewport_.onScroll(scrollListener);
      this.viewport_.onChanged(scrollListener);
      this.scrollListenerInstalled_ = true;
    }
  }
  /**
   * Returns the entry in the video manager corresponding to the video
   * provided
   *
   * @param {!../video-interface.VideoInterface} video
   * @return {VideoEntry} entry
   * @private
   */
  ;

  _proto.getEntryForVideo_ = function getEntryForVideo_(video) {
    for (var i = 0; i < this.entries_.length; i++) {
      if (this.entries_[i].video === video) {
        return this.entries_[i];
      }
    }

    (0, _log.dev)().error(TAG, 'video is not registered to this video manager');
    return null;
  }
  /**
   * Returns the entry in the video manager corresponding to the element
   * provided
   *
   * @param {!AmpElement} element
   * @return {VideoEntry} entry
   * @private
   */
  ;

  _proto.getEntryForElement_ = function getEntryForElement_(element) {
    for (var i = 0; i < this.entries_.length; i++) {
      var entry = this.entries_[i];

      if (entry.video.element === element) {
        return entry;
      }
    }

    (0, _log.dev)().error(TAG, 'video is not registered to this video manager');
    return null;
  }
  /**
   * Gets the current analytics details for the given video.
   * Fails silently if the video is not registered.
   * @param {!AmpElement} videoElement
   * @return {!Promise<!VideoAnalyticsDetailsDef|undefined>}
   */
  ;

  _proto.getAnalyticsDetails = function getAnalyticsDetails(videoElement) {
    var entry = this.getEntryForElement_(videoElement);
    return entry ? entry.getAnalyticsDetails() : Promise.resolve();
  }
  /**
   * Returns whether the video is paused or playing after the user interacted
   * with it or playing through autoplay
   *
   * @param {!../video-interface.VideoInterface} video
   * @return {!../video-interface.PlayingStateDef}
   */
  ;

  _proto.getPlayingState = function getPlayingState(video) {
    return this.getEntryForVideo_(video).getPlayingState();
  }
  /**
   * @param {!../video-interface.VideoInterface} video
   * @return {boolean}
   */
  ;

  _proto.isMuted = function isMuted(video) {
    return this.getEntryForVideo_(video).isMuted();
  }
  /**
   * @param {!../video-interface.VideoInterface} video
   * @return {boolean}
   */
  ;

  _proto.userInteracted = function userInteracted(video) {
    return this.getEntryForVideo_(video).userInteracted();
  }
  /** @param {!VideoEntry} entry */
  ;

  _proto.registerForAutoFullscreen = function registerForAutoFullscreen(entry) {
    this.getAutoFullscreenManager_().register(entry);
  }
  /**
   * @return {!AutoFullscreenManager}
   * @visibleForTesting
   */
  ;

  _proto.getAutoFullscreenManagerForTesting_ = function getAutoFullscreenManagerForTesting_() {
    return this.getAutoFullscreenManager_();
  };

  return VideoManager;
}();
/**
 * VideoEntry represents an entry in the VideoManager's list.
 */


exports.VideoManager = VideoManager;

var VideoEntry =
/*#__PURE__*/
function () {
  /**
   * @param {!VideoManager} manager
   * @param {!../video-interface.VideoOrBaseElementDef} video
   */
  function VideoEntry(manager, video) {
    var _this3 = this;

    /** @private @const {!VideoManager} */
    this.manager_ = manager;
    /** @private @const {!./ampdoc-impl.AmpDoc}  */

    this.ampdoc_ = manager.ampdoc;
    /** @package @const {!../video-interface.VideoOrBaseElementDef} */

    this.video = video;
    /** @private {boolean} */

    this.allowAutoplay_ = true;
    /** @private {boolean} */

    this.loaded_ = false;
    /** @private {boolean} */

    this.isPlaying_ = false;
    /** @private {boolean} */

    this.isVisible_ = false;
    /** @private @const */

    this.actionSessionManager_ = new _videoSessionManager.VideoSessionManager();
    this.actionSessionManager_.onSessionEnd(function () {
      return analyticsEvent(_this3, _videoInterface.VideoAnalyticsEvents.SESSION);
    });
    /** @private @const */

    this.visibilitySessionManager_ = new _videoSessionManager.VideoSessionManager();
    this.visibilitySessionManager_.onSessionEnd(function () {
      return analyticsEvent(_this3, _videoInterface.VideoAnalyticsEvents.SESSION_VISIBLE);
    }); // eslint-disable-next-line jsdoc/require-returns

    /** @private @const {function(): !Promise<boolean>} */

    this.supportsAutoplay_ = function () {
      var win = _this3.ampdoc_.win;
      return _video.VideoUtils.isAutoplaySupported(win, (0, _mode.getMode)(win).lite);
    };
    /** @private @const {function(): !AnalyticsPercentageTracker} */


    this.getAnalyticsPercentageTracker_ = (0, _function.once)(function () {
      return new AnalyticsPercentageTracker(_this3.ampdoc_.win, _this3);
    }); // Autoplay Variables

    /** @private {boolean} */

    this.playCalledByAutoplay_ = false;
    /** @private {boolean} */

    this.pauseCalledByAutoplay_ = false;
    /** @private {?Element} */

    this.internalElement_ = null;
    /** @private {boolean} */

    this.muted_ = false;
    this.hasAutoplay = video.element.hasAttribute(_videoInterface.VideoAttributes.AUTOPLAY);

    if (this.hasAutoplay) {
      this.manager_.installAutoplayStyles();
    } // Media Session API Variables

    /** @private {!../mediasession-helper.MetadataDef} */


    this.metadata_ = _mediasessionHelper.EMPTY_METADATA;
    /** @private @const {function()} */

    this.boundMediasessionPlay_ = function () {
      _this3.video.play(
      /* isAutoplay */
      false);
    };
    /** @private @const {function()} */


    this.boundMediasessionPause_ = function () {
      _this3.video.pause();
    };

    (0, _eventHelper.listenOncePromise)(video.element, _videoInterface.VideoEvents.LOAD).then(function () {
      return _this3.videoLoaded();
    });
    (0, _eventHelper.listen)(video.element, _videoInterface.VideoEvents.PAUSE, function () {
      return _this3.videoPaused_();
    });
    (0, _eventHelper.listen)(video.element, _videoInterface.VideoEvents.PLAYING, function () {
      return _this3.videoPlayed_();
    });
    (0, _eventHelper.listen)(video.element, _videoInterface.VideoEvents.MUTED, function () {
      return _this3.muted_ = true;
    });
    (0, _eventHelper.listen)(video.element, _videoInterface.VideoEvents.UNMUTED, function () {
      return _this3.muted_ = false;
    });
    (0, _eventHelper.listen)(video.element, _videoInterface.VideoEvents.ENDED, function () {
      return _this3.videoEnded_();
    });
    (0, _eventHelper.listen)(video.element, _videoInterface.VideoEvents.AD_START, function () {
      return analyticsEvent(_this3, _videoInterface.VideoAnalyticsEvents.AD_START);
    });
    (0, _eventHelper.listen)(video.element, _videoInterface.VideoEvents.AD_END, function () {
      return analyticsEvent(_this3, _videoInterface.VideoAnalyticsEvents.AD_END);
    });
    (0, _eventHelper.listen)(video.element, _videoInterface.VideoEvents.CUSTOM_TICK, function (e) {
      var data = (0, _eventHelper.getData)(e);
      var eventType = data['eventType'];

      if (!eventType) {
        // CUSTOM_TICK is a generic event for 3p players whose semantics
        // don't fit with other video events.
        // If `eventType` is unset, it's not meant for analytics.
        return;
      }

      _this3.logCustomAnalytics_(eventType, data['vars']);
    });
    video.signals().whenSignal(_videoInterface.VideoEvents.REGISTERED).then(function () {
      return _this3.onRegister_();
    });
    /**
     * Trigger event for first manual play.
     * @private @const {!function()}
     */

    this.firstPlayEventOrNoop_ = (0, _function.once)(function () {
      var firstPlay = 'firstPlay';
      var trust = _actionConstants.ActionTrust.LOW;
      var event = (0, _eventHelper.createCustomEvent)(_this3.ampdoc_.win, firstPlay,
      /* detail */
      (0, _object.dict)({}));
      var element = _this3.video.element;

      var actions = _services.Services.actionServiceForDoc(element);

      actions.trigger(element, firstPlay, event, trust);
    });
    this.listenForAutoplayDelegation_();
  }
  /** @public */


  var _proto2 = VideoEntry.prototype;

  _proto2.dispose = function dispose() {
    this.getAnalyticsPercentageTracker_().stop();
  }
  /**
   * @param {string} eventType
   * @param {!Object<string, string>} vars
   */
  ;

  _proto2.logCustomAnalytics_ = function logCustomAnalytics_(eventType, vars) {
    var _prefixedVars;

    var prefixedVars = (_prefixedVars = {}, _prefixedVars[_videoInterface.videoAnalyticsCustomEventTypeKey] = eventType, _prefixedVars);
    Object.keys(vars).forEach(function (key) {
      prefixedVars["custom_" + key] = vars[key];
    });
    analyticsEvent(this, _videoInterface.VideoAnalyticsEvents.CUSTOM, prefixedVars);
  }
  /** Listens for signals to delegate autoplay to a different module. */
  ;

  _proto2.listenForAutoplayDelegation_ = function listenForAutoplayDelegation_() {
    var _this4 = this;

    var signals = this.video.signals();
    signals.whenSignal(_videoInterface.VideoServiceSignals.AUTOPLAY_DELEGATED).then(function () {
      _this4.allowAutoplay_ = false;

      if (_this4.isPlaying_) {
        _this4.video.pause();
      }
    });
  }
  /** @return {boolean} */
  ;

  _proto2.isMuted = function isMuted() {
    return this.muted_;
  }
  /** @private */
  ;

  _proto2.onRegister_ = function onRegister_() {
    if (this.requiresAutoFullscreen_()) {
      this.manager_.registerForAutoFullscreen(this);
    }

    this.updateVisibility();

    if (this.hasAutoplay) {
      this.autoplayVideoBuilt_();
    }
  }
  /**
   * @return {boolean}
   * @private
   */
  ;

  _proto2.requiresAutoFullscreen_ = function requiresAutoFullscreen_() {
    var element = this.video.element;

    if (this.video.preimplementsAutoFullscreen() || !element.hasAttribute(_videoInterface.VideoAttributes.ROTATE_TO_FULLSCREEN)) {
      return false;
    }

    return (0, _log.userAssert)(this.video.isInteractive(), 'Only interactive videos are allowed to enter fullscreen on rotate. ' + 'Set the `controls` attribute on %s to enable.', element);
  }
  /**
   * Callback for when the video starts playing
   * @private
   */
  ;

  _proto2.videoPlayed_ = function videoPlayed_() {
    this.isPlaying_ = true;

    if (this.getPlayingState() == _videoInterface.PlayingStates.PLAYING_MANUAL) {
      this.firstPlayEventOrNoop_();
    }

    var video = this.video;
    var element = video.element;

    if (!video.preimplementsMediaSessionAPI() && !element.classList.contains('i-amphtml-disable-mediasession')) {
      (0, _mediasessionHelper.setMediaSession)(element, this.ampdoc_.win, this.metadata_, this.boundMediasessionPlay_, this.boundMediasessionPause_);
    }

    this.actionSessionManager_.beginSession();

    if (this.isVisible_) {
      this.visibilitySessionManager_.beginSession();
    }

    analyticsEvent(this, _videoInterface.VideoAnalyticsEvents.PLAY);
  }
  /**
   * Callback for when the video has been paused
   * @private
   */
  ;

  _proto2.videoPaused_ = function videoPaused_() {
    analyticsEvent(this, _videoInterface.VideoAnalyticsEvents.PAUSE);
    this.isPlaying_ = false; // Prevent double-trigger of session if video is autoplay and the video
    // is paused by a the user scrolling the video out of view.

    if (!this.pauseCalledByAutoplay_) {
      this.actionSessionManager_.endSession();
    } else {
      // reset the flag
      this.pauseCalledByAutoplay_ = false;
    }
  }
  /**
   * Callback for when the video has ended
   * @private
   */
  ;

  _proto2.videoEnded_ = function videoEnded_() {
    analyticsEvent(this, _videoInterface.VideoAnalyticsEvents.ENDED);
  }
  /**
   * Called when the video is loaded and can play.
   */
  ;

  _proto2.videoLoaded = function videoLoaded() {
    this.loaded_ = true;
    this.internalElement_ = (0, _video.getInternalVideoElementFor)(this.video.element);
    this.fillMediaSessionMetadata_();
    this.getAnalyticsPercentageTracker_().start();
    this.updateVisibility();

    if (this.isVisible_) {
      // Handles the case when the video becomes visible before loading
      this.loadedVideoVisibilityChanged_();
    }
  }
  /**
   * Gets the provided metadata and fills in missing fields
   * @private
   */
  ;

  _proto2.fillMediaSessionMetadata_ = function fillMediaSessionMetadata_() {
    if (this.video.preimplementsMediaSessionAPI()) {
      return;
    }

    if (this.video.getMetadata()) {
      this.metadata_ = (0, _object.map)(
      /** @type {!../mediasession-helper.MetadataDef} */
      this.video.getMetadata());
    }

    var doc = this.ampdoc_.win.document;

    if (!this.metadata_.artwork || this.metadata_.artwork.length == 0) {
      var posterUrl = (0, _mediasessionHelper.parseSchemaImage)(doc) || (0, _mediasessionHelper.parseOgImage)(doc) || (0, _mediasessionHelper.parseFavicon)(doc);

      if (posterUrl) {
        this.metadata_.artwork = [{
          'src': posterUrl
        }];
      }
    }

    if (!this.metadata_.title) {
      var title = this.video.element.getAttribute('title') || this.video.element.getAttribute('aria-label') || this.internalElement_.getAttribute('title') || this.internalElement_.getAttribute('aria-label') || doc.title;

      if (title) {
        this.metadata_.title = title;
      }
    }
  }
  /**
   * Called when visibility of a video changes.
   * @private
   */
  ;

  _proto2.videoVisibilityChanged_ = function videoVisibilityChanged_() {
    if (this.loaded_) {
      this.loadedVideoVisibilityChanged_();
    }
  }
  /**
   * Only called when visibility of a loaded video changes.
   * @private
   */
  ;

  _proto2.loadedVideoVisibilityChanged_ = function loadedVideoVisibilityChanged_() {
    var _this5 = this;

    if (!this.ampdoc_.isVisible()) {
      return;
    }

    this.supportsAutoplay_().then(function (supportsAutoplay) {
      var canAutoplay = _this5.hasAutoplay && !_this5.userInteracted();

      if (canAutoplay && supportsAutoplay) {
        _this5.autoplayLoadedVideoVisibilityChanged_();
      } else {
        _this5.nonAutoplayLoadedVideoVisibilityChanged_();
      }
    });
  }
  /* Autoplay Behavior */

  /**
   * Called when an autoplay video is built.
   * @private
   */
  ;

  _proto2.autoplayVideoBuilt_ = function autoplayVideoBuilt_() {
    var _this6 = this;

    // Hide controls until we know if autoplay is supported, otherwise hiding
    // and showing the controls quickly becomes a bad user experience for the
    // common case where autoplay is supported.
    if (this.video.isInteractive()) {
      this.video.hideControls();
    }

    this.supportsAutoplay_().then(function (supportsAutoplay) {
      if (!supportsAutoplay && _this6.video.isInteractive()) {
        // Autoplay is not supported, show the controls so user can manually
        // initiate playback.
        _this6.video.showControls();

        return;
      } // Only muted videos are allowed to autoplay


      _this6.video.mute();

      _this6.installAutoplayArtifacts_();
    });
  }
  /**
   * Installs autoplay animation and interaction mask when interactive.
   * The animated icon is appended always, but only displayed by CSS when
   * `controls` is set. See `video-autoplay.css`.
   * @private
   */
  ;

  _proto2.installAutoplayArtifacts_ = function installAutoplayArtifacts_() {
    var _this7 = this;

    var video = this.video;
    var _this$video = this.video,
        element = _this$video.element,
        win = _this$video.win;

    if (element.hasAttribute(_videoInterface.VideoAttributes.NO_AUDIO) || element.signals().get(_videoInterface.VideoServiceSignals.USER_INTERACTED)) {
      return;
    }

    var animation = (0, _autoplay.renderIcon)(win, element);
    /** @param {boolean} isPlaying */

    var toggleAnimation = function toggleAnimation(isPlaying) {
      video.mutateElement(function () {
        animation.classList.toggle('amp-video-eq-play', isPlaying);
      });
    };

    video.mutateElement(function () {
      element.appendChild(animation);
    });
    var unlisteners = [(0, _eventHelper.listen)(element, _videoInterface.VideoEvents.PAUSE, function () {
      return toggleAnimation(false);
    }), (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.PLAYING, function () {
      return toggleAnimation(true);
    })];
    video.signals().whenSignal(_videoInterface.VideoServiceSignals.USER_INTERACTED).then(function () {
      var video = _this7.video;
      var element = video.element;

      _this7.firstPlayEventOrNoop_();

      if (video.isInteractive()) {
        video.showControls();
      }

      video.unmute();
      unlisteners.forEach(function (unlistener) {
        unlistener();
      });
      var animation = element.querySelector('.amp-video-eq');
      var mask = element.querySelector('i-amphtml-video-mask');

      if (animation) {
        (0, _dom.removeElement)(animation);
      }

      if (mask) {
        (0, _dom.removeElement)(mask);
      }
    });

    if (!video.isInteractive()) {
      return;
    }

    var mask = (0, _autoplay.renderInteractionOverlay)(element);
    /** @param {boolean} display */

    var setMaskDisplay = function setMaskDisplay(display) {
      video.mutateElement(function () {
        (0, _style.toggle)(mask, display);
      });
    };

    video.hideControls();
    video.mutateElement(function () {
      element.appendChild(mask);
    });
    [(0, _eventHelper.listen)(mask, 'click', function () {
      return (0, _videoInterface.userInteractedWith)(video);
    }), (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.AD_START, function () {
      setMaskDisplay(false);
      video.showControls();
    }), (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.AD_END, function () {
      setMaskDisplay(true);
      video.hideControls();
    }), (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.UNMUTED, function () {
      return (0, _videoInterface.userInteractedWith)(video);
    })].forEach(function (unlistener) {
      return unlisteners.push(unlistener);
    });
  }
  /**
   * Called when visibility of a loaded autoplay video changes.
   * @private
   */
  ;

  _proto2.autoplayLoadedVideoVisibilityChanged_ = function autoplayLoadedVideoVisibilityChanged_() {
    if (!this.allowAutoplay_) {
      return;
    }

    if (this.isVisible_) {
      this.visibilitySessionManager_.beginSession();
      this.video.play(
      /*autoplay*/
      true);
      this.playCalledByAutoplay_ = true;
    } else {
      if (this.isPlaying_) {
        this.visibilitySessionManager_.endSession();
      }

      this.video.pause();
      this.pauseCalledByAutoplay_ = true;
    }
  }
  /**
   * Called when visibility of a loaded non-autoplay video changes.
   * @private
   */
  ;

  _proto2.nonAutoplayLoadedVideoVisibilityChanged_ = function nonAutoplayLoadedVideoVisibilityChanged_() {
    if (this.isVisible_) {
      this.visibilitySessionManager_.beginSession();
    } else if (this.isPlaying_) {
      this.visibilitySessionManager_.endSession();
    }
  }
  /**
   * Called by all possible events that might change the visibility of the video
   * such as scrolling or {@link ../video-interface.VideoEvents#VISIBILITY}.
   * @param {?boolean=} opt_forceVisible
   * @package
   */
  ;

  _proto2.updateVisibility = function updateVisibility(opt_forceVisible) {
    var wasVisible = this.isVisible_;

    if (opt_forceVisible) {
      this.isVisible_ = true;
    } else {
      var element = this.video.element;
      var ratio = element.getIntersectionChangeEntry().intersectionRatio;
      this.isVisible_ = (!(0, _types.isFiniteNumber)(ratio) ? 0 : ratio) >= _videoInterface.MIN_VISIBILITY_RATIO_FOR_AUTOPLAY;
    }

    if (this.isVisible_ != wasVisible) {
      this.videoVisibilityChanged_();
    }
  }
  /**
   * Returns whether the video is paused or playing after the user interacted
   * with it or playing through autoplay
   * @return {!../video-interface.PlayingStateDef}
   */
  ;

  _proto2.getPlayingState = function getPlayingState() {
    if (!this.isPlaying_) {
      return _videoInterface.PlayingStates.PAUSED;
    }

    if (this.isPlaying_ && this.playCalledByAutoplay_ && !this.userInteracted()) {
      return _videoInterface.PlayingStates.PLAYING_AUTO;
    }

    return _videoInterface.PlayingStates.PLAYING_MANUAL;
  }
  /**
   * Returns whether the video was interacted with or not
   * @return {boolean}
   */
  ;

  _proto2.userInteracted = function userInteracted() {
    return this.video.signals().get(_videoInterface.VideoServiceSignals.USER_INTERACTED) != null;
  }
  /**
   * Collects a snapshot of the current video state for video analytics
   * @return {!Promise<!VideoAnalyticsDetailsDef>}
   */
  ;

  _proto2.getAnalyticsDetails = function getAnalyticsDetails() {
    var _this8 = this;

    var video = this.video;
    return this.supportsAutoplay_().then(function (supportsAutoplay) {
      var _video$element$getLay = video.element.getLayoutBox(),
          width = _video$element$getLay.width,
          height = _video$element$getLay.height;

      var autoplay = _this8.hasAutoplay && supportsAutoplay;
      var playedRanges = video.getPlayedRanges();
      var playedTotal = playedRanges.reduce(function (acc, range) {
        return acc + range[1] - range[0];
      }, 0);
      return {
        'autoplay': autoplay,
        'currentTime': video.getCurrentTime(),
        'duration': video.getDuration(),
        // TODO(cvializ): add fullscreen
        'height': height,
        'id': video.element.id,
        'muted': _this8.muted_,
        'playedTotal': playedTotal,
        'playedRangesJson': JSON.stringify(playedRanges),
        'state': _this8.getPlayingState(),
        'width': width
      };
    });
  };

  return VideoEntry;
}();
/**
 * @param {!AmpElement} video
 * @return {boolean}
 * @restricted
 */


function supportsFullscreenViaApi(video) {
  // TODO(alanorozco): Determine this via a flag in the component itself.
  return !!{
    'amp-dailymotion': true,
    'amp-ima-video': true
  }[video.tagName.toLowerCase()];
}
/** Manages rotate-to-fullscreen video. */


var AutoFullscreenManager =
/*#__PURE__*/
function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!VideoManager} manager
   */
  function AutoFullscreenManager(ampdoc, manager) {
    var _this9 = this;

    /** @private @const {!VideoManager} */
    this.manager_ = manager;
    /** @private @const {!./ampdoc-impl.AmpDoc} */

    this.ampdoc_ = ampdoc;
    /** @private {?../video-interface.VideoOrBaseElementDef} */

    this.currentlyInFullscreen_ = null;
    /** @private {?../video-interface.VideoOrBaseElementDef} */

    this.currentlyCentered_ = null;
    /** @private @const {!Array<!../video-interface.VideoOrBaseElementDef>} */

    this.entries_ = [];
    /**
     * Unlisteners for global objects
     * @private {!Array<!UnlistenDef>}
     */

    this.unlisteners_ = []; // eslint-disable-next-line jsdoc/require-returns

    /** @private @const {function()} */

    this.boundSelectBestCentered_ = function () {
      return _this9.selectBestCenteredInPortrait_();
    };
    /**
     * @param {!../video-interface.VideoOrBaseElementDef} video
     * @return {boolean}
     */


    this.boundIncludeOnlyPlaying_ = function (video) {
      return _this9.getPlayingState_(video) == _videoInterface.PlayingStates.PLAYING_MANUAL;
    };
    /**
     * @param {!../video-interface.VideoOrBaseElementDef} a
     * @param {!../video-interface.VideoOrBaseElementDef} b
     * @return {number}
     */


    this.boundCompareEntries_ = function (a, b) {
      return _this9.compareEntries_(a, b);
    };

    this.installOrientationObserver_();
    this.installFullscreenListener_();
  }
  /** @public */


  var _proto3 = AutoFullscreenManager.prototype;

  _proto3.dispose = function dispose() {
    this.unlisteners_.forEach(function (unlisten) {
      return unlisten();
    });
    this.unlisteners_.length = 0;
  }
  /** @param {!VideoEntry} entry */
  ;

  _proto3.register = function register(entry) {
    var video = entry.video;
    var element = video.element;

    if (!this.canFullscreen_(element)) {
      return;
    }

    this.entries_.push(video);
    (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.PAUSE, this.boundSelectBestCentered_);
    (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.PLAYING, this.boundSelectBestCentered_);
    (0, _eventHelper.listen)(element, _videoInterface.VideoEvents.ENDED, this.boundSelectBestCentered_);
    video.signals().whenSignal(_videoInterface.VideoServiceSignals.USER_INTERACTED).then(this.boundSelectBestCentered_); // Set always

    this.selectBestCenteredInPortrait_();
  }
  /** @private */
  ;

  _proto3.installFullscreenListener_ = function installFullscreenListener_() {
    var _this10 = this;

    var root = this.ampdoc_.getRootNode();

    var exitHandler = function exitHandler() {
      return _this10.onFullscreenExit_();
    };

    this.unlisteners_.push((0, _eventHelper.listen)(root, 'webkitfullscreenchange', exitHandler), (0, _eventHelper.listen)(root, 'mozfullscreenchange', exitHandler), (0, _eventHelper.listen)(root, 'fullscreenchange', exitHandler), (0, _eventHelper.listen)(root, 'MSFullscreenChange', exitHandler));
  }
  /**
   * @return {boolean}
   * @visibleForTesting
   */
  ;

  _proto3.isInLandscape = function isInLandscape() {
    return isLandscape(this.ampdoc_.win);
  }
  /**
   * @param {!AmpElement} video
   * @return {boolean}
   * @private
   */
  ;

  _proto3.canFullscreen_ = function canFullscreen_(video) {
    // Safari and iOS can only fullscreen <video> elements directly. In cases
    // where the player component is implemented via an <iframe>, we need to
    // rely on a postMessage API to fullscreen. Such an API is not necessarily
    // provided by every player.
    var internalElement = (0, _video.getInternalVideoElementFor)(video);

    if (internalElement.tagName.toLowerCase() == 'video') {
      return true;
    }

    var platform = _services.Services.platformFor(this.ampdoc_.win);

    if (!(platform.isIos() || platform.isSafari())) {
      return true;
    }

    return supportsFullscreenViaApi(video);
  }
  /** @private */
  ;

  _proto3.onFullscreenExit_ = function onFullscreenExit_() {
    this.currentlyInFullscreen_ = null;
  }
  /** @private */
  ;

  _proto3.installOrientationObserver_ = function installOrientationObserver_() {
    var _this11 = this;

    // TODO(alanorozco) Update based on support
    var win = this.ampdoc_.win;
    var screen = win.screen; // Chrome considers 'orientationchange' to be an untrusted event, but
    // 'change' on screen.orientation is considered a user interaction.
    // We still need to listen to 'orientationchange' on Chrome in order to
    // exit fullscreen since 'change' does not fire in this case.

    if (screen && 'orientation' in screen) {
      var orient =
      /** @type {!ScreenOrientation} */
      screen.orientation;
      this.unlisteners_.push((0, _eventHelper.listen)(orient, 'change', function () {
        return _this11.onRotation_();
      }));
    } // iOS Safari does not have screen.orientation but classifies
    // 'orientationchange' as a user interaction.


    this.unlisteners_.push((0, _eventHelper.listen)(win, 'orientationchange', function () {
      return _this11.onRotation_();
    }));
  }
  /** @private */
  ;

  _proto3.onRotation_ = function onRotation_() {
    if (this.isInLandscape()) {
      if (this.currentlyCentered_ != null) {
        this.enter_(this.currentlyCentered_);
      }

      return;
    }

    if (this.currentlyInFullscreen_) {
      this.exit_(this.currentlyInFullscreen_);
    }
  }
  /**
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  ;

  _proto3.enter_ = function enter_(video) {
    var platform = _services.Services.platformFor(this.ampdoc_.win);

    this.currentlyInFullscreen_ = video;

    if (platform.isAndroid() && platform.isChrome()) {
      // Chrome on Android somehow knows what we're doing and executes a nice
      // transition by default. Delegating to browser.
      video.fullscreenEnter();
      return;
    }

    this.scrollIntoIfNotVisible_(video).then(function () {
      return video.fullscreenEnter();
    });
  }
  /**
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @private
   */
  ;

  _proto3.exit_ = function exit_(video) {
    this.currentlyInFullscreen_ = null;
    this.scrollIntoIfNotVisible_(video, 'center').then(function () {
      return video.fullscreenExit();
    });
  }
  /**
   * Scrolls to a video if it's not in view.
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @param {?string=} optPos
   * @return {*} TODO(#23582): Specify return type
   * @private
   */
  ;

  _proto3.scrollIntoIfNotVisible_ = function scrollIntoIfNotVisible_(video, optPos) {
    if (optPos === void 0) {
      optPos = null;
    }

    var element = video.element;
    var viewport = this.getViewport_();
    return this.onceOrientationChanges_().then(function () {
      var _element$getIntersect = element.getIntersectionChangeEntry(),
          boundingClientRect = _element$getIntersect.boundingClientRect;

      var top = boundingClientRect.top,
          bottom = boundingClientRect.bottom;
      var vh = viewport.getSize().height;
      var fullyVisible = top >= 0 && bottom <= vh;

      if (fullyVisible) {
        return Promise.resolve();
      }

      var pos = optPos ? (0, _log.dev)().assertString(optPos) : bottom > vh ? 'bottom' : 'top';
      return viewport.animateScrollIntoView(element, pos);
    });
  }
  /**
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  ;

  _proto3.getViewport_ = function getViewport_() {
    return _services.Services.viewportForDoc(this.ampdoc_);
  }
  /**
   * @private
   * @return {!Promise}
   */
  ;

  _proto3.onceOrientationChanges_ = function onceOrientationChanges_() {
    var magicNumber = 330;
    return _services.Services.timerFor(this.ampdoc_.win).promise(magicNumber);
  }
  /**
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  ;

  _proto3.selectBestCenteredInPortrait_ = function selectBestCenteredInPortrait_() {
    if (this.isInLandscape()) {
      return this.currentlyCentered_;
    }

    this.currentlyCentered_ = null;
    var selected = this.entries_.filter(this.boundIncludeOnlyPlaying_).sort(this.boundCompareEntries_)[0];

    if (selected) {
      var _selected$element$get = selected.element.getIntersectionChangeEntry(),
          intersectionRatio = _selected$element$get.intersectionRatio;

      if (intersectionRatio >= _videoInterface.MIN_VISIBILITY_RATIO_FOR_AUTOPLAY) {
        this.currentlyCentered_ = selected;
      }
    }

    return this.currentlyCentered_;
  }
  /**
   * Compares two videos in order to sort them by "best centered".
   * @param {!../video-interface.VideoOrBaseElementDef} a
   * @param {!../video-interface.VideoOrBaseElementDef} b
   * @return {number}
   */
  ;

  _proto3.compareEntries_ = function compareEntries_(a, b) {
    var _a$element$getInterse = a.element.getIntersectionChangeEntry(),
        ratioA = _a$element$getInterse.intersectionRatio,
        rectA = _a$element$getInterse.boundingClientRect;

    var _b$element$getInterse = b.element.getIntersectionChangeEntry(),
        ratioB = _b$element$getInterse.intersectionRatio,
        rectB = _b$element$getInterse.boundingClientRect; // Prioritize by how visible they are, with a tolerance of 10%


    var ratioTolerance = 0.1;
    var ratioDelta = ratioA - ratioB;

    if (Math.abs(ratioDelta) > ratioTolerance) {
      return ratioDelta;
    } // Prioritize by distance from center.


    var viewport = _services.Services.viewportForDoc(this.ampdoc_);

    var centerA = centerDist(viewport, rectA);
    var centerB = centerDist(viewport, rectB);

    if (centerA < centerB || centerA > centerB) {
      return centerA - centerB;
    } // Everything else failing, choose the highest element.


    return rectA.top - rectB.top;
  }
  /**
   * @param {!../video-interface.VideoOrBaseElementDef} video
   * @return {!../video-interface.PlayingStateDef}
   * @private
   */
  ;

  _proto3.getPlayingState_ = function getPlayingState_(video) {
    return this.manager_.getPlayingState(
    /** @type {!../video-interface.VideoInterface} */
    video);
  };

  return AutoFullscreenManager;
}();
/**
 * @param {!./viewport/viewport-interface.ViewportInterface} viewport
 * @param {{top: number, height: number}} rect
 * @return {number}
 */


exports.AutoFullscreenManager = AutoFullscreenManager;

function centerDist(viewport, rect) {
  var centerY = rect.top + rect.height / 2;
  var centerViewport = viewport.getSize().height / 2;
  return Math.abs(centerY - centerViewport);
}
/**
 * @param {!Window} win
 * @return {boolean}
 */


function isLandscape(win) {
  if (win.screen && 'orientation' in win.screen) {
    return (0, _string.startsWith)(win.screen.orientation.type, 'landscape');
  }

  return Math.abs(win.orientation) == 90;
}
/** @visibleForTesting */


var PERCENTAGE_INTERVAL = 5;
/** @private */

exports.PERCENTAGE_INTERVAL = PERCENTAGE_INTERVAL;
var PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS = 500;
/** @private */

var PERCENTAGE_FREQUENCY_MIN_MS = 250;
/** @private */

var PERCENTAGE_FREQUENCY_MAX_MS = 4000;
/**
 * Calculates the "ideal" analytics check frequency from playback start, e.g.
 * the amount of ms after each PERCENTAGE_INTERVAL.
 * @param {number} durationSeconds
 * @return {number}
 */

function calculateIdealPercentageFrequencyMs(durationSeconds) {
  return durationSeconds * 10 * PERCENTAGE_INTERVAL;
}
/**
 * Calculates the "actual" analytics check frequency by calculating the ideal
 * frequency and clamping it between MIN and MAX.
 * @param {number} durationSeconds
 * @return {number}
 */


function calculateActualPercentageFrequencyMs(durationSeconds) {
  return (0, _math.clamp)(calculateIdealPercentageFrequencyMs(durationSeconds), PERCENTAGE_FREQUENCY_MIN_MS, PERCENTAGE_FREQUENCY_MAX_MS);
}
/** @visibleForTesting */


var AnalyticsPercentageTracker =
/*#__PURE__*/
function () {
  /**
   * @param {!Window} win
   * @param {!VideoEntry} entry
   */
  function AnalyticsPercentageTracker(win, entry) {
    // This is destructured in `calculate_()`, but the linter thinks it's unused

    /** @private @const {!./timer-impl.Timer} */
    this.timer_ = _services.Services.timerFor(win); // eslint-disable-line

    /** @private @const {!VideoEntry} */

    this.entry_ = entry;
    /** @private {?Array<!UnlistenDef>} */

    this.unlisteners_ = null;
    /** @private {number} */

    this.last_ = 0;
    /**
     * Counter for each trigger `start`. This is to prevent duplicate events if
     * two consecutive triggers take place, or to prevent events firing once
     * the tracker is stopped.
     * @private {number}
     */

    this.triggerId_ = 0;
  }
  /** @public */


  var _proto4 = AnalyticsPercentageTracker.prototype;

  _proto4.start = function start() {
    var _this12 = this;

    var element = this.entry_.video.element;
    this.stop();
    this.unlisteners_ = this.unlisteners_ || []; // If the video has already emitted LOADEDMETADATA, the event below
    // will never fire, so we check if it's already available here.

    if (this.hasDuration_()) {
      this.calculate_(this.triggerId_);
    } else {
      this.unlisteners_.push((0, _eventHelper.listenOnce)(element, _videoInterface.VideoEvents.LOADEDMETADATA, function () {
        if (_this12.hasDuration_()) {
          _this12.calculate_(_this12.triggerId_);
        }
      }));
    }

    this.unlisteners_.push((0, _eventHelper.listen)(element, _videoInterface.VideoEvents.ENDED, function () {
      if (_this12.hasDuration_()) {
        _this12.maybeTrigger_(
        /* normalizedPercentage */
        100);
      }
    }));
  }
  /** @public */
  ;

  _proto4.stop = function stop() {
    if (!this.unlisteners_) {
      return;
    }

    while (this.unlisteners_.length > 0) {
      this.unlisteners_.pop().call();
    }

    this.triggerId_++;
  }
  /**
   * @return {boolean}
   * @private
   */
  ;

  _proto4.hasDuration_ = function hasDuration_() {
    var video = this.entry_.video;
    var duration = video.getDuration(); // Livestreams or videos with no duration information available.

    if (!duration || isNaN(duration) || duration <= 0) {
      return false;
    }

    if (calculateIdealPercentageFrequencyMs(duration) < PERCENTAGE_FREQUENCY_MIN_MS) {
      var bestResultLength = Math.ceil(PERCENTAGE_FREQUENCY_MIN_MS * (100 / PERCENTAGE_INTERVAL) / 1000);
      this.warnForTesting_('This video is too short for `video-percentage-played`. ' + 'Reports may be innacurate. For best results, use videos over', bestResultLength, 'seconds long.', video.element);
    }

    return true;
  }
  /**
   * @param  {...*} args
   * @private
   */
  ;

  _proto4.warnForTesting_ = function warnForTesting_() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (0, _log.user)().warn.apply((0, _log.user)(), [TAG].concat(args));
  }
  /**
   * @param {number=} triggerId
   * @private
   */
  ;

  _proto4.calculate_ = function calculate_(triggerId) {
    var _this13 = this;

    if (triggerId != this.triggerId_) {
      return;
    }

    var entry = this.entry_,
        timer = this.timer_;
    var video = entry.video;

    var calculateAgain = function calculateAgain() {
      return _this13.calculate_(triggerId);
    };

    if (entry.getPlayingState() == _videoInterface.PlayingStates.PAUSED) {
      timer.delay(calculateAgain, PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS);
      return;
    }

    var duration = video.getDuration();
    var frequencyMs = calculateActualPercentageFrequencyMs(duration);
    var percentage = video.getCurrentTime() / duration * 100;
    var normalizedPercentage = Math.floor(percentage / PERCENTAGE_INTERVAL) * PERCENTAGE_INTERVAL;
    (0, _log.devAssert)((0, _types.isFiniteNumber)(normalizedPercentage));
    this.maybeTrigger_(normalizedPercentage);
    timer.delay(calculateAgain, frequencyMs);
  }
  /**
   * @param {number} normalizedPercentage
   * @private
   */
  ;

  _proto4.maybeTrigger_ = function maybeTrigger_(normalizedPercentage) {
    if (normalizedPercentage <= 0) {
      return;
    }

    if (this.last_ == normalizedPercentage) {
      return;
    }

    this.last_ = normalizedPercentage;
    this.analyticsEventForTesting_(normalizedPercentage);
  }
  /**
   * @param {number} normalizedPercentage
   * @private
   */
  ;

  _proto4.analyticsEventForTesting_ = function analyticsEventForTesting_(normalizedPercentage) {
    analyticsEvent(this.entry_, _videoInterface.VideoAnalyticsEvents.PERCENTAGE_PLAYED, {
      'normalizedPercentage': normalizedPercentage.toString()
    });
  };

  return AnalyticsPercentageTracker;
}();
/**
 * @param {!VideoEntry} entry
 * @param {!VideoAnalyticsEvents} eventType
 * @param {!Object<string, string>=} opt_vars A map of vars and their values.
 * @private
 */


exports.AnalyticsPercentageTracker = AnalyticsPercentageTracker;

function analyticsEvent(entry, eventType, opt_vars) {
  var video = entry.video;
  entry.getAnalyticsDetails().then(function (details) {
    if (opt_vars) {
      Object.assign(details, opt_vars);
    }

    video.element.dispatchCustomEvent(eventType, details);
  });
}
/** @param {!Node|!./ampdoc-impl.AmpDoc} nodeOrDoc */


function installVideoManagerForDoc(nodeOrDoc) {
  (0, _service.registerServiceBuilderForDoc)(nodeOrDoc, 'video-manager', VideoManager);
}

},{"../action-constants":3,"../dom":7,"../event-helper":10,"../log":16,"../mediasession-helper":17,"../mode":19,"../service":22,"../services":27,"../string":29,"../style":31,"../types":32,"../utils/function":36,"../utils/math":38,"../utils/object":39,"../utils/video":41,"../video-interface":42,"./video-session-manager":24,"./video/autoplay":25,"./video/install-autoplay-styles":26}],24:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.VideoSessionManager = void 0;

var _observable = require("../observable");

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
var VideoSessionManager =
/*#__PURE__*/
function () {
  /**
   * Creates an instance of VideoSessionManager.
   */
  function VideoSessionManager() {
    /** @private */
    this.isSessionActive_ = false;
    /** @private */

    this.endSessionObservable_ = new _observable.Observable();
  }
  /**
   * Register a listener to be notified when a session has ended
   * @param {!Function} listener
   */


  var _proto = VideoSessionManager.prototype;

  _proto.onSessionEnd = function onSessionEnd(listener) {
    this.endSessionObservable_.add(listener);
  }
  /**
   * Begin a session.
   */
  ;

  _proto.beginSession = function beginSession() {
    this.isSessionActive_ = true;
  }
  /**
   * End a session.
   */
  ;

  _proto.endSession = function endSession() {
    if (this.isSessionActive_) {
      this.endSessionObservable_.fire();
    }

    this.isSessionActive_ = false;
  }
  /**
   * Get the current session state.
   * @return {*} TODO(#23582): Specify return type
   */
  ;

  _proto.isSessionActive = function isSessionActive() {
    return this.isSessionActive_;
  };

  return VideoSessionManager;
}();

exports.VideoSessionManager = VideoSessionManager;

},{"../observable":20}],25:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.renderInteractionOverlay = renderInteractionOverlay;
exports.renderIcon = renderIcon;

var _services = require("../../services");

var _log = require("../../log");

var _staticTemplate = require("../../static-template");

var _dom = require("../../dom");

function _templateObject2() {
  var data = _taggedTemplateLiteralLoose(["\n    <i-amphtml-video-icon class=\"amp-video-eq\">\n      <div class=\"amp-video-eq-col\">\n        <div class=\"amp-video-eq-filler\"></div>\n        <div class=\"amp-video-eq-filler\"></div>\n      </div>\n    </i-amphtml-video-icon>\n  "]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteralLoose(["\n    <i-amphtml-video-mask class=\"i-amphtml-fill-content\" role=\"button\">\n    </i-amphtml-video-mask>\n  "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/**
 * @param {!Element} node
 * @return {!Element}
 */
function cloneDeep(node) {
  return (0, _log.dev)().assertElement(node.cloneNode(
  /* deep */
  true));
}
/**
 * @param {!Element|!Document} elOrDoc
 * @return {!Element}
 */


function renderInteractionOverlay(elOrDoc) {
  var html = (0, _staticTemplate.htmlFor)(elOrDoc);
  return html(_templateObject());
}
/**
 * @param {!Window} win
 * @param {!Element|!Document} elOrDoc
 * @return {!Element}
 */


function renderIcon(win, elOrDoc) {
  var html = (0, _staticTemplate.htmlFor)(elOrDoc);
  var icon = html(_templateObject2()); // Copy equalizer column 4x and annotate filler positions for animation.

  var firstCol = (0, _log.dev)().assertElement(icon.firstElementChild);

  for (var i = 0; i < 4; i++) {
    var col = cloneDeep(firstCol);
    var fillers = col.children;

    for (var j = 0; j < fillers.length; j++) {
      var filler = fillers[j];
      filler.classList.add("amp-video-eq-" + (i + 1) + "-" + (j + 1));
    }

    icon.appendChild(col);
  } // Remove seed column.


  (0, _dom.removeElement)(firstCol);

  if (_services.Services.platformFor(win).isIos()) {
    // iOS is unable to pause hardware accelerated animations.
    icon.setAttribute('unpausable', '');
  }

  return icon;
}

},{"../../dom":7,"../../log":16,"../../services":27,"../../static-template":28}],26:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.installAutoplayStylesForDoc = installAutoplayStylesForDoc;

var _styleInstaller = require("../../style-installer");

var _videoAutoplay = require("../../../build/video-autoplay.css");

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
// Source for this constant is css/video-autoplay.css

/**
 * @param  {!../ampdoc-impl.AmpDoc} ampdoc
 */
function installAutoplayStylesForDoc(ampdoc) {
  (0, _styleInstaller.installStylesForDoc)(ampdoc, _videoAutoplay.cssText,
  /* callback */
  null,
  /* opt_isRuntimeCss */
  false,
  /* opt_ext */
  'amp-video-autoplay');
}

},{"../../../build/video-autoplay.css":1,"../../style-installer":30}],27:[function(require,module,exports){
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

},{"./element-service":8,"./service":22}],28:[function(require,module,exports){
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

},{"./log":16,"./utils/object.js":39}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"./common-signals":4,"./dom":7,"./log":16,"./render-delaying-services":21,"./service":22,"./services":27,"./style":31,"./utils/object":39}],31:[function(require,module,exports){
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

},{"./log":16,"./string":29,"./utils/object.js":39}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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
    var value = match[2] ? (0, _urlTryDecodeUriComponent.tryDecodeUriComponent_)(match[2], match[2]) : '';
    params[name] = value;
  }

  return params;
}

},{"./url-try-decode-uri-component":34}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"./config":5,"./log":16,"./mode":19,"./string":29,"./types":32,"./url-parse-query-string":33,"./url-try-decode-uri-component":34,"./utils/lru-cache":37,"./utils/object":39}],36:[function(require,module,exports){
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

},{}],37:[function(require,module,exports){
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

},{"../log":16}],38:[function(require,module,exports){
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

},{"../log":16}],39:[function(require,module,exports){
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

},{"../types":32}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getInternalVideoElementFor = getInternalVideoElementFor;
exports.VideoUtils = void 0;

var _log = require("../log");

var _function = require("./function");

var _style = require("../style");

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
 * @param {!Window} win
 * @param {boolean} isLiteViewer
 * @return {!Promise<boolean>}
 */
function isAutoplaySupportedImpl(win, isLiteViewer) {
  // We do not support autoplay in amp-lite viewer regardless of platform.
  if (isLiteViewer) {
    return Promise.resolve(false);
  } // To detect autoplay, we create a video element and call play on it, if
  // `paused` is true after `play()` call, autoplay is supported. Although
  // this is unintuitive, it works across browsers and is currently the lightest
  // way to detect autoplay without using a data source.


  var detectionElement = win.document.createElement('video'); // NOTE(aghassemi): We need both attributes and properties due to Chrome and
  // Safari differences when dealing with non-attached elements.

  detectionElement.setAttribute('muted', '');
  detectionElement.setAttribute('playsinline', '');
  detectionElement.setAttribute('webkit-playsinline', '');
  detectionElement.setAttribute('height', '0');
  detectionElement.setAttribute('width', '0');
  detectionElement.muted = true;
  detectionElement.playsinline = true;
  detectionElement.webkitPlaysinline = true;
  (0, _style.setStyles)(detectionElement, {
    position: 'fixed',
    top: '0',
    width: '0',
    height: '0',
    opacity: '0'
  }); // Promise wrapped this way to catch both sync throws and async rejections.
  // More info: https://github.com/tc39/proposal-promise-try

  new Promise(function (resolve) {
    return resolve(detectionElement.play());
  }).catch(function () {// Suppress any errors, useless to report as they are expected.
  });
  return Promise.resolve(!detectionElement.paused);
}
/** @private {?(function(Window, boolean):!Promise<boolean>)} */


var _isAutoplaySupported = null;
/**
 * Sets if autoplay is supported.
 */

function setIsAutoplaySupported() {
  _isAutoplaySupported =
  /** @type {function(Window, boolean):!Promise<boolean>} */
  (0, _function.once)(isAutoplaySupportedImpl);
}
/**
 * Wrapper around static utilities for testability.
 */


var VideoUtils =
/*#__PURE__*/
function () {
  function VideoUtils() {}

  /**
   * Determines autoplay support.
   *
   * Note that even if platfrom supports autoplay, users or browsers can disable
   * autoplay to save data / battery. This detects both platfrom support and
   * when autoplay has been disabled by the user.
   *
   * @param {!Window} win
   * @param {boolean} isLiteViewer
   * @return {!Promise<boolean>}
   */
  VideoUtils.isAutoplaySupported = function isAutoplaySupported(win, isLiteViewer) {
    if (!_isAutoplaySupported) {
      setIsAutoplaySupported();
    }

    return _isAutoplaySupported(win, isLiteViewer);
  }
  /** @visibleForTesting */
  ;

  VideoUtils.resetIsAutoplaySupported = function resetIsAutoplaySupported() {
    setIsAutoplaySupported();
  };

  return VideoUtils;
}();
/**
 * @param {!Element} element
 * @return {!Element}
 * Note: Not included in `VideoUtils` as we don't need to test a
 * static selector.
 */


exports.VideoUtils = VideoUtils;

function getInternalVideoElementFor(element) {
  return (0, _log.dev)().assertElement(element.querySelector('video, iframe'));
}

},{"../log":16,"../style":31,"./function":36}],42:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isDockable = isDockable;
exports.delegateAutoplay = delegateAutoplay;
exports.userInteractedWith = userInteractedWith;
exports.VideoServiceSignals = exports.VideoOrBaseElementDef = exports.videoAnalyticsCustomEventTypeKey = exports.VideoAnalyticsEvents = exports.PlayingStates = exports.PlayingStateDef = exports.VideoEvents = exports.VideoAttributes = exports.VideoInterface = exports.MIN_VISIBILITY_RATIO_FOR_AUTOPLAY = void 0;

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
var MIN_VISIBILITY_RATIO_FOR_AUTOPLAY = 0.5;
/**
 * VideoInterface defines a common video API which any AMP component that plays
 * videos is expected to implement.
 *
 * AMP runtime uses this common API to provide consistent video experience and
 * analytics across all video players.
 *
 * Components implementing this interface must also extend
 * {@link ./base-element.BaseElement} and register with the
 * Video Manager {@link ./service/video-manager-impl.VideoManager} during
 * their `builtCallback`.
 *
 * @interface
 */

exports.MIN_VISIBILITY_RATIO_FOR_AUTOPLAY = MIN_VISIBILITY_RATIO_FOR_AUTOPLAY;

var VideoInterface =
/*#__PURE__*/
function () {
  function VideoInterface() {}

  var _proto = VideoInterface.prototype;

  /**
   * Whether the component supports video playback in the current platform.
   * If false, component will be not treated as a video component.
   * @return {boolean}
   */
  _proto.supportsPlatform = function supportsPlatform() {}
  /**
   * Whether users can interact with the video such as pausing it.
   * Example of non-interactive videos include design background videos where
   * all controls are hidden from the user.
   *
   * @return {boolean}
   */
  ;

  _proto.isInteractive = function isInteractive() {}
  /**
   * Current playback time in seconds at time of trigger
   * @return {number}
   */
  ;

  _proto.getCurrentTime = function getCurrentTime() {}
  /**
   * Total duration of the video in seconds
   * @return {number}
   */
  ;

  _proto.getDuration = function getDuration() {}
  /**
   * Get a 2d array of start and stop times that the user has watched.
   * @return {!Array<Array<number>>}
   */
  ;

  _proto.getPlayedRanges = function getPlayedRanges() {}
  /**
   * Plays the video..
   *
   * @param {boolean} unusedIsAutoplay Whether the call to the `play` method is
   * triggered by the autoplay functionality. Video players can use this hint
   * to make decisions such as not playing pre-roll video ads.
   */
  ;

  _proto.play = function play(unusedIsAutoplay) {}
  /**
   * Pauses the video.
   */
  ;

  _proto.pause = function pause() {}
  /**
   * Mutes the video.
   */
  ;

  _proto.mute = function mute() {}
  /**
   * Unmutes the video.
   */
  ;

  _proto.unmute = function unmute() {}
  /**
   * Makes the video UI controls visible.
   *
   * AMP will not call this method if `controls` attribute is not set.
   */
  ;

  _proto.showControls = function showControls() {}
  /**
   * Hides the video UI controls.
   *
   * AMP will not call this method if `controls` attribute is not set.
   */
  ;

  _proto.hideControls = function hideControls() {}
  /**
   * Returns video's meta data (artwork, title, artist, album, etc.) for use
   * with the Media Session API
   * artwork (Array): URL to the poster image (preferably a 512x512 PNG)
   * title (string): Name of the video
   * artist (string): Name of the video's author/artist
   * album (string): Name of the video's album if it exists
   * @return {!./mediasession-helper.MetadataDef|undefined} metadata
   */
  ;

  _proto.getMetadata = function getMetadata() {}
  /**
   * If this returns true then it will be assumed that the player implements
   * a feature to enter fullscreen on device rotation internally, so that the
   * video manager does not override it. If not, the video manager will
   * implement this feature automatically for videos with the attribute
   * `rotate-to-fullscreen`.
   *
   * @return {boolean}
   */
  ;

  _proto.preimplementsAutoFullscreen = function preimplementsAutoFullscreen() {}
  /**
   * If this returns true then it will be assumed that the player implements
   * the MediaSession API internally so that the video manager does not override
   * it. If not, the video manager will use the metadata variable as well as
   * inferred meta-data to update the video's Media Session notification.
   *
   * @return {boolean}
   */
  ;

  _proto.preimplementsMediaSessionAPI = function preimplementsMediaSessionAPI() {}
  /**
   * Enables fullscreen on the internal video element
   * NOTE: While implementing, keep in mind that Safari/iOS do not allow taking
   * any element other than <video> to fullscreen, if the player has an internal
   * implementation of fullscreen (flash for example) then check
   * if Services.platformFor(this.win).isSafari is true and use the internal
   * implementation instead. If not, it is recommended to take the iframe
   * to fullscreen using fullscreenEnter from dom.js
   */
  ;

  _proto.fullscreenEnter = function fullscreenEnter() {}
  /**
   * Quits fullscreen mode
   */
  ;

  _proto.fullscreenExit = function fullscreenExit() {}
  /**
   * Returns whether the video is currently in fullscreen mode or not
   * @return {boolean}
   */
  ;

  _proto.isFullscreen = function isFullscreen() {}
  /**
   * Seeks the video to a specified time.
   * @param {number} unusedTimeSeconds
   */
  ;

  _proto.seekTo = function seekTo(unusedTimeSeconds) {};

  return VideoInterface;
}();
/**
 * Attributes
 *
 * Components implementing the VideoInterface are expected to support
 * the following attributes.
 *
 * @const {!Object<string, string>}
 */


exports.VideoInterface = VideoInterface;
var VideoAttributes = {
  /**
   * autoplay
   *
   * Whether the developer has configured autoplay on the component.
   * This is normally done by setting `autoplay` attribute on the component.
   *
   * AMP runtime manages autoplay behavior itself using methods such as `play`,
   * `pause`, `showControls`, `hideControls`, `mute`, etc.. therefore components
   * should not propagate the autoplay attribute to the underlying player
   * implementation.
   *
   * When a video is requested to autoplay, AMP will automatically
   * mute and hide the controls for the video, when video is 75% visible in
   * the viewport, AMP will play the video and later pauses it when 25%
   * or more of the video exits the viewport. If an auto-playing video also has
   * controls, AMP will install a tap
   * handler on the video, and when an end-user taps the video, AMP will show
   * the controls.
   *
   */
  AUTOPLAY: 'autoplay',

  /**
   * dock
   *
   * Setting the `dock` attribute on the component makes the video minimize
   * to the corner when scrolled out of view and has been interacted with.
   */
  DOCK: 'dock',

  /**
   * rotate-to-fullscreen
   *
   * If enabled, this automatically expands the currently visible video and
   * playing to fullscreen when the user changes the device's orientation to
   * landscape if the video was started following a user interaction
   * (not autoplay)
   *
   * Dependent upon browser support of
   * http://caniuse.com/#feat=screen-orientation
   * and http://caniuse.com/#feat=fullscreen
   */
  ROTATE_TO_FULLSCREEN: 'rotate-to-fullscreen',

  /**
   * noaudio
   *
   * If set and autoplay, the equalizer icon will not be displayed.
   */
  NO_AUDIO: 'noaudio'
};
/**
 * Events
 *
 * Components implementing the VideoInterface are expected to dispatch
 * the following DOM events.
 *
 * @const {!Object<string, string>}
 */

exports.VideoAttributes = VideoAttributes;
var VideoEvents = {
  /**
   * registered
   *
   * Fired when the video player element is built and has been registered with
   * the video manager.
   *
   * @event registered
   */
  REGISTERED: 'registered',

  /**
   * load
   *
   * Fired when the video player is loaded and calls to methods such as `play()`
   * are allowed.
   *
   * @event load
   */
  LOAD: 'load',

  /**
   * loadedmetadata
   *
   * Fired when the video's metadata becomes available (e.g. duration).
   *
   * @event loadedmetadata
   */
  LOADEDMETADATA: 'loadedmetadata',

  /**
   * playing
   *
   * Fired when the video begins playing.
   *
   * @event playing
   */
  PLAYING: 'playing',

  /**
   * pause
   *
   * Fired when the video pauses.
   *
   * @event pause
   */
  PAUSE: 'pause',

  /**
   * ended
   *
   * Fired when the video ends.
   *
   * This event should be fired in addition to `pause` when video ends.
   *
   * @event ended
   */
  ENDED: 'ended',

  /**
   * muted
   *
   * Fired when the video is muted.
   *
   * @event muted
   */
  MUTED: 'muted',

  /**
   * unmuted
   *
   * Fired when the video is unmuted.
   *
   * @event unmuted
   */
  UNMUTED: 'unmuted',

  /**
   * amp:video:visibility
   *
   * Fired when the video's visibility changes. Normally fired
   * from `viewportCallback`.
   *
   * @event amp:video:visibility
   * @property {boolean} visible Whether the video player is visible or not.
   */
  VISIBILITY: 'amp:video:visibility',

  /**
   * reload
   *
   * Fired when the video's src changes.
   *
   * @event reloaded
   */
  RELOAD: 'reloaded',

  /**
   * pre/mid/post Ad start
   *
   * Fired when an Ad starts playing.
   *
   * This is used to remove any overlay shims during Ad play during autoplay
   * or minimized-to-corner version of the player.
   *
   * @event ad_start
   */
  AD_START: 'ad_start',

  /**
   * pre/mid/post Ad ends
   *
   * Fired when an Ad ends playing.
   *
   * This is used to restore any overlay shims during Ad play during autoplay
   * or minimized-to-corner version of the player.
   *
   * @event ad_end
   */
  AD_END: 'ad_end',

  /**
   * A 3p video player can send signals for analytics whose meaning doesn't
   * fit for other events. In this case, a `tick` event is sent with additional
   * information in its data property.
   *
   * @event amp:video:tick
   */
  CUSTOM_TICK: 'amp:video:tick'
};
/** @typedef {string} */

exports.VideoEvents = VideoEvents;
var PlayingStateDef;
/**
 * Playing States
 *
 * Internal playing states used to distinguish between video playing on user's
 * command and videos playing automatically
 *
 * @const {!Object<string, PlayingStateDef>}
 */

exports.PlayingStateDef = PlayingStateDef;
var PlayingStates = {
  /**
   * playing_manual
   *
   * When the video user manually interacted with the video and the video
   * is now playing
   *
   * @event playing_manual
   */
  PLAYING_MANUAL: 'playing_manual',

  /**
   * playing_auto
   *
   * When the video has autoplay and the user hasn't interacted with it yet
   *
   * @event playing_auto
   */
  PLAYING_AUTO: 'playing_auto',

  /**
   * paused
   *
   * When the video is paused.
   *
   * @event paused
   */
  PAUSED: 'paused'
};
/** @enum {string} */

exports.PlayingStates = PlayingStates;
var VideoAnalyticsEvents = {
  /**
   * video-ended
   *
   * Indicates that a video ended.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-ended
   */
  ENDED: 'video-ended',

  /**
   * video-pause
   *
   * Indicates that a video paused.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-pause
   */
  PAUSE: 'video-pause',

  /**
   * video-play
   *
   * Indicates that a video began to play.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-play
   */
  PLAY: 'video-play',

  /**
   * video-session
   *
   * Indicates that some segment of the video played.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-session
   */
  SESSION: 'video-session',

  /**
   * video-session-visible
   *
   * Indicates that some segment of the video played in the viewport.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-session-visible
   */
  SESSION_VISIBLE: 'video-session-visible',

  /**
   * video-seconds-played
   *
   * Indicates that a video was playing when the
   * video-seconds-played interval fired.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-session-visible
   */
  SECONDS_PLAYED: 'video-seconds-played',

  /**
   * video-hosted-custom
   *
   * Indicates that a custom event incoming from a 3p frame is to be logged.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-custom
   */
  CUSTOM: 'video-hosted-custom',

  /**
   * video-percentage-played
   *
   * Indicates that a percentage interval has been played.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-custom
   */
  PERCENTAGE_PLAYED: 'video-percentage-played',

  /**
   * video-ad-start
   *
   * Indicates that an ad begins to play.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-ad-start
   */
  AD_START: 'video-ad-start',

  /**
   * video-ad-end
   *
   * Indicates that an ad ended.
   * @property {!VideoAnalyticsDetailsDef} details
   * @event video-ad-end
   */
  AD_END: 'video-ad-end'
};
/**
 * This key can't predictably collide with custom var names as defined in
 * analytics user configuration.
 * @type {string}
 */

exports.VideoAnalyticsEvents = VideoAnalyticsEvents;
var videoAnalyticsCustomEventTypeKey = '__amp:eventType';
/**
 * Helper union type to be used internally, so that the compiler treats
 * `VideoInterface` objects as `BaseElement`s, which they should be anyway.
 *
 * WARNING: Don't use this at the service level. Its `register` method should
 * only allow `VideoInterface` as a guarding measure.
 *
 * @typedef {!VideoInterface|!./base-element.BaseElement}
 */

exports.videoAnalyticsCustomEventTypeKey = videoAnalyticsCustomEventTypeKey;
var VideoOrBaseElementDef;
/**
 * @param {!Element} element
 * @return {boolean}
 */

exports.VideoOrBaseElementDef = VideoOrBaseElementDef;

function isDockable(element) {
  return element.hasAttribute(VideoAttributes.DOCK);
}
/** @enum {string} */


var VideoServiceSignals = {
  USER_INTERACTED: 'user-interacted',
  AUTOPLAY_DELEGATED: 'autoplay-delegated'
};
/** @param {!AmpElement|!VideoOrBaseElementDef} video */

exports.VideoServiceSignals = VideoServiceSignals;

function delegateAutoplay(video) {
  video.signals().signal(VideoServiceSignals.AUTOPLAY_DELEGATED);
}
/** @param {!AmpElement|!VideoOrBaseElementDef} video */


function userInteractedWith(video) {
  video.signals().signal(VideoServiceSignals.USER_INTERACTED);
}

},{}],43:[function(require,module,exports){
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

},{}]},{},[2])


})});
//# sourceMappingURL=amp-brid-player-0.1.max.js.map
