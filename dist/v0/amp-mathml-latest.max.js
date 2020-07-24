(self.AMP=self.AMP||[]).push({n:"amp-mathml",v:"1910081755240",f:(function(AMP,_){
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CSS = void 0;
var CSS = "amp-mathml[inline]{display:inline-block;vertical-align:middle}\n/*# sourceURL=/extensions/amp-mathml/0.1/amp-mathml.css*/";
exports.CSS = CSS;

},{}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpMathml = void 0;

var _ampMathml = require("../../../build/amp-mathml-0.1.css");

var _layout = require("../../../src/layout");

var _pFrame = require("../../../src/3p-frame");

var _iframeHelper = require("../../../src/iframe-helper");

var _dom = require("../../../src/dom");

var _style = require("../../../src/style");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var AmpMathml =
/*#__PURE__*/
function (_AMP$BaseElement) {
  _inheritsLoose(AmpMathml, _AMP$BaseElement);

  /** @param {!AmpElement} element */
  function AmpMathml(element) {
    var _this;

    _this = _AMP$BaseElement.call(this, element) || this;
    /** @private {?HTMLIFrameElement} */

    _this.iframe_ = null;
    return _this;
  }
  /**
   * Adds a preconnect
   *
   */


  var _proto = AmpMathml.prototype;

  _proto.preconnectCallback = function preconnectCallback() {
    this.preconnect.url('https://cdnjs.cloudflare.com');
  }
  /**
   * Adds a callback to mutateElement.
   */
  ;

  _proto.buildCallback = function buildCallback() {
    var _this2 = this;

    // Make the element minimally displayed to make sure that `layoutCallback`
    // is called.
    var sizingWidth;

    if (this.element.hasAttribute('inline')) {
      sizingWidth = '1px';
    }

    this.mutateElement(function () {
      (0, _style.setStyles)(_this2.element, {
        width: sizingWidth,
        height: '1rem'
      });
    });
  }
  /**
   * Adds a layout callback for mathml iframe.
   *
   * @return {!Promise}
   */
  ;

  _proto.layoutCallback = function layoutCallback() {
    var _this3 = this;

    var iframe = (0, _pFrame.getIframe)(this.win, this.element, 'mathml');
    this.applyFillContent(iframe); // Triggered by context.updateDimensions() inside the iframe.

    (0, _iframeHelper.listenFor)(iframe, 'embed-size', function (data) {
      if (!_this3.element.hasAttribute('inline')) {
        // Don't change the width if not inlined.
        data['width'] = undefined;
      }

      _this3.element.getResources().
      /*OK*/
      changeSize(_this3.element, data['height'], data['width']);
    },
    /* opt_is3P */
    true);
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }
  /**
   * Removes mathml iframe.
   *
   * @return {boolean}
   */
  ;

  _proto.unlayoutCallback = function unlayoutCallback() {
    if (this.iframe_) {
      (0, _dom.removeElement)(this.iframe_);
      this.iframe_ = null;
    }

    return true;
  }
  /** @override */
  ;

  _proto.isLayoutSupported = function isLayoutSupported(layout) {
    return layout == _layout.Layout.CONTAINER;
  };

  return AmpMathml;
}(AMP.BaseElement);

exports.AmpMathml = AmpMathml;
AMP.extension('amp-mathml', '0.1', function (AMP) {
  AMP.registerElement('amp-mathml', AmpMathml, _ampMathml.CSS);
});

},{"../../../build/amp-mathml-0.1.css":1,"../../../src/3p-frame":4,"../../../src/dom":7,"../../../src/iframe-helper":13,"../../../src/layout":16,"../../../src/style":24}],3:[function(require,module,exports){
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

},{"./event-helper-listen":9,"./json":15,"./log":17,"./utils/object":33}],4:[function(require,module,exports){
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

},{"../src/iframe-attributes":12,"./config":5,"./internal-version":14,"./json":15,"./log":17,"./mode":19,"./string":23,"./style":24,"./url":28,"./utils/object":33}],5:[function(require,module,exports){
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

},{"../third_party/css-escape/css-escape":35,"./log":17}],7:[function(require,module,exports){
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

},{"./css":6,"./log":17,"./string":23,"./types":25,"./utils/object":33,"./utils/promise":34}],8:[function(require,module,exports){
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

},{"./dom":7,"./log":17,"./service":20,"./types":25}],9:[function(require,module,exports){
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

},{"./dom":7,"./event-helper-listen":9,"./log":17}],11:[function(require,module,exports){
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

},{"./log":17,"./mode":19,"./url":28,"./utils/object":33}],12:[function(require,module,exports){
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

},{"./config":5,"./experiments":11,"./internal-version":14,"./layout":16,"./mode-object":18,"./services":21,"./utils/dom-fingerprint":30,"./utils/object.js":33}],13:[function(require,module,exports){
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

},{"./3p-frame-messaging":3,"./dom":7,"./event-helper":10,"./json":15,"./log":17,"./style":24,"./url":28,"./utils/array":29,"./utils/object":33}],14:[function(require,module,exports){
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
  return '1910081755240';
}

},{}],15:[function(require,module,exports){
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

},{"./dom":7,"./types":25}],16:[function(require,module,exports){
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

},{"./log":17,"./static-template":22,"./string":23,"./style":24,"./types":25}],17:[function(require,module,exports){
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

},{"./config":5,"./internal-version":14,"./mode":19,"./mode-object":18,"./types":25,"./utils/function":31}],18:[function(require,module,exports){
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

},{"./internal-version":14,"./url-parse-query-string":26}],20:[function(require,module,exports){
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

},{"./experiments":11,"./log":17,"./types":25,"./utils/promise":34}],21:[function(require,module,exports){
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

},{"./element-service":8,"./service":20}],22:[function(require,module,exports){
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

},{"./log":17,"./utils/object.js":33}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
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

},{"./log":17,"./string":23,"./utils/object.js":33}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{"./url-try-decode-uri-component":27}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{"./config":5,"./log":17,"./mode":19,"./string":23,"./types":25,"./url-parse-query-string":26,"./url-try-decode-uri-component":27,"./utils/lru-cache":32,"./utils/object":33}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"../string":23}],31:[function(require,module,exports){
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

},{}],32:[function(require,module,exports){
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

},{"../log":17}],33:[function(require,module,exports){
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

},{"../types":25}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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
//# sourceMappingURL=amp-mathml-0.1.max.js.map
