(self.AMP=self.AMP||[]).push({n:"amp-form",v:"1910040511210",f:(function(AMP,_){
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CSS = void 0;
var CSS = "form.amp-form-submit-error [submit-error],form.amp-form-submit-success [submit-success],form.amp-form-submitting [submitting]{display:block}textarea[autoexpand]:not(.i-amphtml-textarea-max){overflow:hidden!important}.i-amphtml-textarea-clone{visibility:hidden;position:absolute;top:-9999px;left:-9999px;height:0!important}.i-amphtml-validation-bubble{transform:translate(-50%,-100%);background-color:#fff;box-shadow:0 5px 15px 0 rgba(0,0,0,0.5);max-width:200px;position:absolute;display:block;box-sizing:border-box;padding:10px;border-radius:5px}.i-amphtml-validation-bubble:after{content:\" \";position:absolute;bottom:-8px;left:30px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #fff}[visible-when-invalid]{color:red}\n/*# sourceURL=/extensions/amp-form/0.1/amp-form.css*/";
exports.CSS = CSS;

},{}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.handleInitialOverflowElements = handleInitialOverflowElements;
exports.getHasOverflow = getHasOverflow;
exports.maybeResizeTextarea = maybeResizeTextarea;
exports.AmpFormTextarea = void 0;

var _ampEvents = require("../../../src/amp-events");

var _services = require("../../../src/services");

var _style = require("../../../src/style");

var _log = require("../../../src/log");

var _dom = require("../../../src/dom");

var _eventHelper = require("../../../src/event-helper");

var _rateLimit = require("../../../src/utils/rate-limit");

var _types = require("../../../src/types");

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
var AMP_FORM_TEXTAREA_EXPAND_ATTR = 'autoexpand';
var MIN_EVENT_INTERVAL_MS = 100;
var AMP_FORM_TEXTAREA_CLONE_CSS = 'i-amphtml-textarea-clone';
var AMP_FORM_TEXTAREA_MAX_CSS = 'i-amphtml-textarea-max';
var AMP_FORM_TEXTAREA_HAS_EXPANDED_DATA = 'iAmphtmlHasExpanded';
/**
 * Install expandable textarea behavior for the given form.
 *
 * This class should be able to be removed when browsers implement
 * `height: max-content` for the textarea element.
 * https://github.com/w3c/csswg-drafts/issues/2141
 */

var AmpFormTextarea =
/*#__PURE__*/
function () {
  /**
   * Install, monitor and cleanup the document as `textarea[autoexpand]`
   * elements are added and removed.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  AmpFormTextarea.install = function install(ampdoc) {
    var root = ampdoc.getRootNode();
    var ampFormTextarea = null;

    var maybeInstall = function maybeInstall() {
      var autoexpandTextarea = root.querySelector('textarea[autoexpand]');

      if (autoexpandTextarea && !ampFormTextarea) {
        ampFormTextarea = new AmpFormTextarea(ampdoc);
        return;
      }

      if (!autoexpandTextarea && ampFormTextarea) {
        ampFormTextarea.dispose();
        ampFormTextarea = null;
        return;
      }
    };

    (0, _eventHelper.listen)(root, _ampEvents.AmpEvents.DOM_UPDATE, maybeInstall);
    maybeInstall();
  }
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  ;

  function AmpFormTextarea(ampdoc) {
    var root = ampdoc.getRootNode();
    /** @private @const */

    this.doc_ = root.ownerDocument || root;
    /** @private @const */

    this.win_ =
    /** @type {!Window} */
    (0, _log.devAssert)(this.doc_.defaultView);
    /** @private @const */

    this.viewport_ = _services.Services.viewportForDoc(ampdoc);
    /** @private */

    this.unlisteners_ = [];
    this.unlisteners_.push((0, _eventHelper.listen)(root, 'input', function (e) {
      var element = (0, _log.dev)().assertElement(e.target);

      if (element.tagName != 'TEXTAREA' || !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
        return;
      }

      maybeResizeTextarea(element);
    }));
    this.unlisteners_.push((0, _eventHelper.listen)(root, 'mousedown', function (e) {
      if (e.which != 1) {
        return;
      }

      var element = (0, _log.dev)().assertElement(e.target); // Handle all text area drag as we want to measure mutate and notify
      // the viewer of possible doc height changes.

      if (element.tagName != 'TEXTAREA') {
        return;
      }

      handleTextareaDrag(element);
    }));
    var cachedTextareaElements = root.querySelectorAll('textarea');
    this.unlisteners_.push((0, _eventHelper.listen)(root, _ampEvents.AmpEvents.DOM_UPDATE, function () {
      cachedTextareaElements = root.querySelectorAll('textarea');
    }));
    var throttledResize = (0, _rateLimit.throttle)(this.win_, function (e) {
      if (e.relayoutAll) {
        resizeTextareaElements(cachedTextareaElements);
      }
    }, MIN_EVENT_INTERVAL_MS);
    this.unlisteners_.push(this.viewport_.onResize(throttledResize));
    handleInitialOverflowElements(cachedTextareaElements);
  }
  /**
   * Cleanup any consumed resources
   */


  var _proto = AmpFormTextarea.prototype;

  _proto.dispose = function dispose() {
    this.unlisteners_.forEach(function (unlistener) {
      return unlistener();
    });
  };

  return AmpFormTextarea;
}();
/**
 * For now, warn if textareas with initial overflow are present, and
 * prevent them from becoming autoexpand textareas.
 * @param {!IArrayLike<!Element>} textareas
 * @return {!Promise}
 */


exports.AmpFormTextarea = AmpFormTextarea;

function handleInitialOverflowElements(textareas) {
  return Promise.all((0, _types.toArray)(textareas).map(function (element) {
    return getHasOverflow(element).then(function (hasOverflow) {
      if (hasOverflow) {
        (0, _log.user)().warn('AMP-FORM', '"textarea[autoexpand]" with initially scrolling content ' + 'will not autoexpand.\n' + 'See https://github.com/ampproject/amphtml/issues/20839');
        element.removeAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR);
      }
    });
  }));
}
/**
 * Measure if any overflow is present on the element.
 * @param {!Element} element
 * @return {!Promise<boolean>}
 * @visibleForTesting
 */


function getHasOverflow(element) {
  var resources = _services.Services.resourcesForDoc(element);

  return resources.measureElement(function () {
    return element.
    /*OK*/
    scrollHeight > element.
    /*OK*/
    clientHeight;
  });
}
/**
 * Attempt to resize all textarea elements
 * @param {!IArrayLike<!Element>} elements
 */


function resizeTextareaElements(elements) {
  (0, _dom.iterateCursor)(elements, function (element) {
    if (element.tagName != 'TEXTAREA' || !element.hasAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR)) {
      return;
    }

    maybeResizeTextarea(element);
  });
}
/**
 * This makes no assumptions about the location of the resize handle, and it
 * assumes that if the user drags the mouse at any position and the height of
 * the textarea changes, then the user intentionally resized the textarea.
 * @param {!Element} element
 */


function handleTextareaDrag(element) {
  var resources = _services.Services.resourcesForDoc(element);

  Promise.all([resources.measureElement(function () {
    return element.
    /*OK*/
    scrollHeight;
  }), (0, _eventHelper.listenOncePromise)(element, 'mouseup')]).then(function (results) {
    var heightMouseDown = results[0];
    var heightMouseUp = 0;
    return resources.measureMutateElement(element, function () {
      heightMouseUp = element.
      /*OK*/
      scrollHeight;
    }, function () {
      maybeRemoveResizeBehavior(element, heightMouseDown, heightMouseUp);
    });
  });
}
/**
 * Remove the resize behavior if a user drags the resize handle and changes
 * the height of the textarea.
 * @param {!Element} element
 * @param {number} startHeight
 * @param {number} endHeight
 */


function maybeRemoveResizeBehavior(element, startHeight, endHeight) {
  if (startHeight != endHeight) {
    element.removeAttribute(AMP_FORM_TEXTAREA_EXPAND_ATTR);
  }
}
/**
 * Resize the textarea to fit its current text, by expanding or shrinking if
 * needed.
 * @param {!Element} element
 * @return {!Promise}
 * @visibleForTesting
 */


function maybeResizeTextarea(element) {
  var resources = _services.Services.resourcesForDoc(element);

  var win =
  /** @type {!Window} */
  (0, _log.devAssert)(element.ownerDocument.defaultView);
  var offset = 0;
  var scrollHeight = 0;
  var maxHeight = 0; // The minScrollHeight is the minimimum height required to contain the
  // text content without showing a scrollbar.
  // This is different than scrollHeight, which is the larger of: 1. the
  // element's content, or 2. the element itself.

  var minScrollHeightPromise = getShrinkHeight(element);
  return resources.measureMutateElement(element, function () {
    var computed = (0, _style.computedStyle)(win, element);
    scrollHeight = element.
    /*OK*/
    scrollHeight;
    var maybeMaxHeight = parseInt(computed.getPropertyValue('max-height'), 10);
    maxHeight = isNaN(maybeMaxHeight) ? Infinity : maybeMaxHeight;

    if (computed.getPropertyValue('box-sizing') == 'content-box') {
      offset = -parseInt(computed.getPropertyValue('padding-top'), 10) + -parseInt(computed.getPropertyValue('padding-bottom'), 10);
    } else {
      offset = parseInt(computed.getPropertyValue('border-top-width'), 10) + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    }
  }, function () {
    return minScrollHeightPromise.then(function (minScrollHeight) {
      var height = minScrollHeight + offset; // Prevent the scrollbar from appearing
      // unless the text is beyond the max-height

      element.classList.toggle(AMP_FORM_TEXTAREA_MAX_CSS, height > maxHeight); // Prevent the textarea from shrinking if it has not yet expanded.

      var hasExpanded = AMP_FORM_TEXTAREA_HAS_EXPANDED_DATA in element.dataset;
      var shouldResize = hasExpanded || scrollHeight <= minScrollHeight;

      if (shouldResize) {
        element.dataset[AMP_FORM_TEXTAREA_HAS_EXPANDED_DATA] = ''; // Set the textarea height to the height of the text

        (0, _style.setStyle)(element, 'height', (0, _style.px)(minScrollHeight + offset));
      }
    });
  });
}
/**
 * If shrink behavior is enabled, get the amount to shrink or expand. This
 * uses a more expensive method to calculate the new height creating a temporary
 * clone of the node and setting its height to 0 to get the minimum scrollHeight
 * of the element's contents.
 * @param {!Element} textarea
 * @return {!Promise<number>}
 */


function getShrinkHeight(textarea) {
  var doc =
  /** @type {!Document} */
  (0, _log.devAssert)(textarea.ownerDocument);
  var win =
  /** @type {!Window} */
  (0, _log.devAssert)(doc.defaultView);
  var body =
  /** @type {!HTMLBodyElement} */
  (0, _log.devAssert)(doc.body);

  var resources = _services.Services.resourcesForDoc(textarea);

  var clone = textarea.cloneNode(
  /*deep*/
  false);
  clone.classList.add(AMP_FORM_TEXTAREA_CLONE_CSS);
  var cloneWidth = 0;
  var resultingHeight = 0;
  var shouldKeepTop = false;
  return resources.measureMutateElement(body, function () {
    var computed = (0, _style.computedStyle)(win, textarea);
    var maxHeight = parseInt(computed.getPropertyValue('max-height'), 10); // TODO(cvializ): what if it's a percent?

    cloneWidth = parseInt(computed.getPropertyValue('width'), 10); // maxHeight is NaN if the max-height property is 'none'.

    shouldKeepTop = isNaN(maxHeight) || textarea.
    /*OK*/
    scrollHeight < maxHeight;
  }, function () {
    // Prevent a jump from the textarea element scrolling
    if (shouldKeepTop) {
      textarea.
      /*OK*/
      scrollTop = 0;
    } // Keep the clone's width consistent if the textarea was sized relative
    // to its parent element.


    (0, _style.setStyle)(clone, 'width', (0, _style.px)(cloneWidth)); // Append the clone to the DOM so its scrollHeight can be read

    doc.body.appendChild(clone);
  }).then(function () {
    return resources.measureMutateElement(body, function () {
      resultingHeight = clone.
      /*OK*/
      scrollHeight;
    }, function () {
      (0, _dom.removeElement)(clone);
    });
  }).then(function () {
    return resultingHeight;
  });
}

},{"../../../src/amp-events":12,"../../../src/dom":18,"../../../src/event-helper":21,"../../../src/log":26,"../../../src/services":32,"../../../src/style":36,"../../../src/types":37,"../../../src/utils/rate-limit":46}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.checkUserValidityAfterInteraction_ = checkUserValidityAfterInteraction_;
exports.AmpFormService = exports.AmpForm = void 0;

var _actionConstants = require("../../../src/action-constants");

var _ampEvents = require("../../../src/amp-events");

var _ampFormTextarea = require("./amp-form-textarea");

var _asyncInput = require("../../../src/async-input");

var _ampForm = require("../../../build/amp-form-0.1.css");

var _promise = require("../../../src/utils/promise");

var _formVerifiers = require("./form-verifiers");

var _formDirtiness = require("./form-dirtiness");

var _formEvents = require("./form-events");

var _formSubmitService = require("./form-submit-service");

var _url = require("../../../src/url");

var _services = require("../../../src/services");

var _ssrTemplateHelper = require("../../../src/ssr-template-helper");

var _dom = require("../../../src/dom");

var _eventHelper = require("../../../src/event-helper");

var _formDataWrapper = require("../../../src/form-data-wrapper");

var _object = require("../../../src/utils/object");

var _log = require("../../../src/log");

var _css = require("../../../src/css");

var _form = require("../../../src/form");

var _formValidators = require("./form-validators");

var _mode = require("../../../src/mode");

var _xhrUtils = require("../../../src/utils/xhr-utils");

var _formProxy = require("./form-proxy");

var _styleInstaller = require("../../../src/style-installer");

var _types = require("../../../src/types");

var _analytics = require("../../../src/analytics");

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

/** @const {string} */
var TAG = 'amp-form';
/**
 * A list of external dependencies that can be included in forms.
 * @const {!Array<string>}
 */

var EXTERNAL_DEPS = ['amp-selector'];
/** @const @enum {string} */

var FormState = {
  INITIAL: 'initial',
  VERIFYING: 'verifying',
  VERIFY_ERROR: 'verify-error',
  SUBMITTING: 'submitting',
  SUBMIT_ERROR: 'submit-error',
  SUBMIT_SUCCESS: 'submit-success'
};
/** @const @enum {string} */

var UserValidityState = {
  NONE: 'none',
  USER_VALID: 'valid',
  USER_INVALID: 'invalid'
};
/** @private @const {string} */

var REDIRECT_TO_HEADER = 'AMP-Redirect-To';
/**
 * Time to wait for services / async input before throwing an error.
 * @private @const {number}
 */

var SUBMIT_TIMEOUT = 10000;

var AmpForm =
/*#__PURE__*/
function () {
  /**
   * Adds functionality to the passed form element and listens to submit event.
   * @param {!HTMLFormElement} element
   * @param {string} id
   */
  function AmpForm(element, id) {
    var _this = this;

    //TODO(dvoytenko, #7063): Remove the try catch.
    try {
      (0, _formProxy.installFormProxy)(element);
    } catch (e) {
      (0, _log.dev)().error(TAG, 'form proxy failed to install', e);
    }

    (0, _form.setFormForElement)(element, this);
    /** @private @const {string} */

    this.id_ = id;
    /** @const @private {!Window} */

    this.win_ = (0, _types.toWin)(element.ownerDocument.defaultView);
    /** @const @private {!../../../src/service/timer-impl.Timer} */

    this.timer_ = _services.Services.timerFor(this.win_);
    /** @const @private {!../../../src/service/url-replacements-impl.UrlReplacements} */

    this.urlReplacement_ = _services.Services.urlReplacementsForDoc(element);
    /** @private {?Promise} */

    this.dependenciesPromise_ = null;
    /** @const @private {!HTMLFormElement} */

    this.form_ = element;
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc}  */

    this.ampdoc_ = _services.Services.ampdoc(this.form_);
    /** @const @private {!../../../src/service/template-impl.Templates} */

    this.templates_ = _services.Services.templatesFor(this.win_);
    /** @const @private {!../../../src/service/xhr-impl.Xhr} */

    this.xhr_ = _services.Services.xhrFor(this.win_);
    /** @const @private {!../../../src/service/action-impl.ActionService} */

    this.actions_ = _services.Services.actionServiceForDoc(this.form_);
    /** @const @private {!../../../src/service/resources-interface.ResourcesInterface} */

    this.resources_ = _services.Services.resourcesForDoc(this.form_);
    /** @const @private {!../../../src/service/viewer-interface.ViewerInterface}  */

    this.viewer_ = _services.Services.viewerForDoc(this.form_);
    /**
     * @const {!../../../src/ssr-template-helper.SsrTemplateHelper}
     * @private
     */

    this.ssrTemplateHelper_ = new _ssrTemplateHelper.SsrTemplateHelper(TAG, this.viewer_, this.templates_);
    /** @const @private {string} */

    this.method_ = (this.form_.getAttribute('method') || 'GET').toUpperCase();
    /** @const @private {string} */

    this.target_ = this.form_.getAttribute('target');
    /** @private {?string} */

    this.xhrAction_ = this.getXhrUrl_('action-xhr');
    /** @const @private {?string} */

    this.xhrVerify_ = this.getXhrUrl_('verify-xhr');
    /** @const @private {boolean} */

    this.shouldValidate_ = !this.form_.hasAttribute('novalidate'); // Need to disable browser validation in order to allow us to take full
    // control of this. This allows us to trigger validation APIs and reporting
    // when we need to.

    this.form_.setAttribute('novalidate', '');

    if (!this.shouldValidate_) {
      this.form_.setAttribute('amp-novalidate', '');
    }

    this.form_.classList.add('i-amphtml-form');
    /** @private {!FormState} */

    this.state_ = FormState.INITIAL;
    var inputs = this.form_.elements;

    for (var i = 0; i < inputs.length; i++) {
      var name = inputs[i].name;
      (0, _log.userAssert)(name != _url.SOURCE_ORIGIN_PARAM && name != _formVerifiers.FORM_VERIFY_PARAM, 'Illegal input name, %s found: %s', name, inputs[i]);
    }
    /** @const @private {!./form-dirtiness.FormDirtiness} */


    this.dirtinessHandler_ = new _formDirtiness.FormDirtiness(this.form_, this.win_);
    /** @const @private {!./form-validators.FormValidator} */

    this.validator_ = (0, _formValidators.getFormValidator)(this.form_);
    /** @const @private {!./form-verifiers.FormVerifier} */

    this.verifier_ = (0, _formVerifiers.getFormVerifier)(this.form_, function () {
      return _this.handleXhrVerify_();
    });
    this.actions_.installActionHandler(this.form_, this.actionHandler_.bind(this));
    this.installEventHandlers_();
    this.installInputMasking_();
    /** @private {?Promise} */

    this.xhrSubmitPromise_ = null;
    /** @private {?Promise} */

    this.renderTemplatePromise_ = null;
    /** @private {?./form-submit-service.FormSubmitService} */

    this.formSubmitService_ = null;

    _services.Services.formSubmitForDoc(element).then(function (service) {
      _this.formSubmitService_ = service;
    });
  }
  /**
   * Gets and validates an attribute for form request URLs.
   * @param {string} attribute
   * @return {?string}
   * @private
   */


  var _proto = AmpForm.prototype;

  _proto.getXhrUrl_ = function getXhrUrl_(attribute) {
    var url = this.form_.getAttribute(attribute);

    if (url) {
      var urlService = _services.Services.urlForDoc(this.form_);

      urlService.assertHttpsUrl(url, this.form_, attribute);
      (0, _log.userAssert)(!urlService.isProxyOrigin(url), 'form %s should not be on AMP CDN: %s', attribute, this.form_);
    }

    return url;
  }
  /**
   * Builds fetch request data for amp-form elements.
   * @param {string} url
   * @param {string} method
   * @param {!Object<string, string>=} opt_extraFields
   * @param {!Array<string>=} opt_fieldBlacklist
   * @return {!Promise<!FetchRequestDef>}
   */
  ;

  _proto.requestForFormFetch = function requestForFormFetch(url, method, opt_extraFields, opt_fieldBlacklist) {
    var xhrUrl, body;
    var isHeadOrGet = method == 'GET' || method == 'HEAD';

    if (isHeadOrGet) {
      this.assertNoSensitiveFields_();
      var values = this.getFormAsObject_();

      if (opt_fieldBlacklist) {
        opt_fieldBlacklist.forEach(function (name) {
          delete values[name];
        });
      }

      if (opt_extraFields) {
        (0, _object.deepMerge)(values, opt_extraFields);
      }

      xhrUrl = (0, _url.addParamsToUrl)(url, values);
    } else {
      xhrUrl = url;
      body = (0, _formDataWrapper.createFormDataWrapper)(this.win_, this.form_);

      if (opt_fieldBlacklist) {
        opt_fieldBlacklist.forEach(function (name) {
          body.delete(name);
        });
      }

      for (var key in opt_extraFields) {
        body.append(key, opt_extraFields[key]);
      }
    }
    /** @type {!FetchRequestDef}*/


    var request = {
      xhrUrl: xhrUrl,
      fetchOpt: (0, _object.dict)({
        'body': body,
        'method': method,
        'credentials': 'include',
        'headers': (0, _object.dict)({
          'Accept': 'application/json'
        })
      })
    };
    return (0, _xhrUtils.getViewerAuthTokenIfAvailable)(this.form_).then(function (token) {
      if (token) {
        (0, _log.userAssert)(request.fetchOpt['method'] == 'POST', 'Cannot attach auth token with GET request.');
        body.append('ampViewerAuthToken', token);
      }

      return request;
    });
  }
  /**
   * Setter to change cached action-xhr.
   * @param {string} url
   */
  ;

  _proto.setXhrAction = function setXhrAction(url) {
    this.xhrAction_ = url;
  }
  /**
   * Handle actions that require at least high trust.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  ;

  _proto.actionHandler_ = function actionHandler_(invocation) {
    var _this2 = this;

    if (!invocation.satisfiesTrust(_actionConstants.ActionTrust.HIGH)) {
      return null;
    }

    if (invocation.method == 'submit') {
      return this.whenDependenciesReady_().then(function () {
        return _this2.handleSubmitAction_(invocation);
      });
    } else if (invocation.method === 'clear') {
      this.handleClearAction_();
    }

    return null;
  }
  /**
   * Returns a promise that will be resolved when all dependencies used inside
   * the form tag are loaded and built (e.g. amp-selector) or 2 seconds timeout
   * - whichever is first.
   * @return {!Promise}
   * @private
   */
  ;

  _proto.whenDependenciesReady_ = function whenDependenciesReady_() {
    if (this.dependenciesPromise_) {
      return this.dependenciesPromise_;
    }

    var depElements = this.form_.
    /*OK*/
    querySelectorAll(EXTERNAL_DEPS.join(',')); // Wait for an element to be built to make sure it is ready.

    var promises = (0, _types.toArray)(depElements).map(function (el) {
      return el.whenBuilt();
    });
    return this.dependenciesPromise_ = this.waitOnPromisesOrTimeout_(promises, 2000);
  }
  /** @private */
  ;

  _proto.installEventHandlers_ = function installEventHandlers_() {
    var _this3 = this;

    this.ampdoc_.whenNextVisible().then(function () {
      var autofocus = _this3.form_.querySelector('[autofocus]');

      if (autofocus) {
        (0, _dom.tryFocus)(autofocus);
      }
    });
    this.form_.addEventListener('submit', this.handleSubmitEvent_.bind(this), true);
    this.form_.addEventListener('blur', function (e) {
      checkUserValidityAfterInteraction_((0, _log.dev)().assertElement(e.target));

      _this3.validator_.onBlur(e);
    }, true); //  Form verification is not supported when SSRing templates is enabled.

    if (!this.ssrTemplateHelper_.isSupported()) {
      this.form_.addEventListener('change', function (e) {
        _this3.verifier_.onCommit().then(function (_ref) {
          var updatedElements = _ref.updatedElements,
              errors = _ref.errors;
          updatedElements.forEach(checkUserValidityAfterInteraction_); // Tell the validation to reveal any input.validationMessage added
          // by the form verifier.

          _this3.validator_.onBlur(e); // Only make the verify XHR if the user hasn't pressed submit.


          if (_this3.state_ === FormState.VERIFYING) {
            if (errors.length) {
              _this3.setState_(FormState.VERIFY_ERROR);

              _this3.renderTemplate_((0, _object.dict)({
                'verifyErrors': errors
              })).then(function () {
                _this3.triggerAction_(_formEvents.FormEvents.VERIFY_ERROR, errors);
              });
            } else {
              _this3.setState_(FormState.INITIAL);
            }
          }
        });
      });
    }

    this.form_.addEventListener('input', function (e) {
      checkUserValidityAfterInteraction_((0, _log.dev)().assertElement(e.target));

      _this3.validator_.onInput(e);
    });
  }
  /** @private */
  ;

  _proto.installInputMasking_ = function installInputMasking_() {
    _services.Services.inputmaskServiceForDocOrNull(this.form_).then(function (inputmaskService) {
      if (inputmaskService) {
        inputmaskService.install();
      }
    });
  }
  /**
   * Triggers 'amp-form-submit' event in 'amp-analytics' and
   * generates variables for form fields to be accessible in analytics
   *
   * @param {string} eventType
   * @private
   */
  ;

  _proto.triggerFormSubmitInAnalytics_ = function triggerFormSubmitInAnalytics_(eventType) {
    this.assertSsrTemplate_(false, 'Form analytics not supported');
    var formDataForAnalytics = (0, _object.dict)({});
    var formObject = this.getFormAsObject_();

    for (var k in formObject) {
      if (Object.prototype.hasOwnProperty.call(formObject, k)) {
        formDataForAnalytics['formFields[' + k + ']'] = formObject[k].join(',');
      }
    }

    formDataForAnalytics['formId'] = this.form_.id;
    this.analyticsEvent_(eventType, formDataForAnalytics);
  }
  /**
   * Handles submissions through action service invocations.
   *   e.g. <img on=tap:form.submit>
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {!Promise}
   * @private
   */
  ;

  _proto.handleSubmitAction_ = function handleSubmitAction_(invocation) {
    if (this.state_ == FormState.SUBMITTING || !this.checkValidity_()) {
      return Promise.resolve(null);
    } // `submit` has the same trust level as the AMP Action that caused it.


    return this.submit_(invocation.trust, null);
  }
  /**
   * Handles clearing the form through action service invocations.
   * @private
   */
  ;

  _proto.handleClearAction_ = function handleClearAction_() {
    this.form_.reset();
    this.setState_(FormState.INITIAL);
    this.form_.classList.remove('user-valid');
    this.form_.classList.remove('user-invalid');
    var validityElements = this.form_.querySelectorAll('.user-valid, .user-invalid');
    (0, _dom.iterateCursor)(validityElements, function (element) {
      element.classList.remove('user-valid');
      element.classList.remove('user-invalid');
    });
    var messageElements = this.form_.querySelectorAll('.visible[validation-for]');
    (0, _dom.iterateCursor)(messageElements, function (element) {
      element.classList.remove('visible');
    });
    removeValidityStateClasses(this.form_);
  }
  /**
   * Note on stopImmediatePropagation usage here, it is important to emulate
   * native browser submit event blocking. Otherwise any other submit listeners
   * would get the event.
   *
   * For example, action service shouldn't trigger 'submit' event if form is
   * actually invalid. stopImmediatePropagation allows us to make sure we don't
   * trigger it.
   *
   * This prevents the default submission event in any of following cases:
   *   - The form is still finishing a previous submission.
   *   - The form is invalid.
   *   - Handling an XHR submission.
   *   - It's a non-XHR POST submission (unsupported).
   *
   * @param {!Event} event
   * @return {!Promise}
   * @private
   */
  ;

  _proto.handleSubmitEvent_ = function handleSubmitEvent_(event) {
    if (this.state_ == FormState.SUBMITTING || !this.checkValidity_()) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return Promise.resolve(null);
    }

    if (this.xhrAction_ || this.method_ == 'POST') {
      event.preventDefault();
    } // Submits caused by user input have high trust.


    return this.submit_(_actionConstants.ActionTrust.HIGH, event);
  }
  /**
   * Helper method that actual handles the different cases (post, get, xhr...).
   * @param {ActionTrust} trust
   * @param {?Event} event
   * @return {!Promise}
   * @private
   */
  ;

  _proto.submit_ = function submit_(trust, event) {
    var _this4 = this;

    try {
      var _event = {
        form: this.form_,
        actionXhrMutator: this.setXhrAction.bind(this)
      };
      (0, _log.devAssert)(this.formSubmitService_).fire(_event);
    } catch (e) {
      (0, _log.dev)().error(TAG, 'Form submit service failed: %s', e);
    } // Get our special fields


    var varSubsFields = this.getVarSubsFields_();
    var asyncInputs = this.form_.getElementsByClassName(_asyncInput.AsyncInputClasses.ASYNC_INPUT);
    this.dirtinessHandler_.onSubmitting(); // Do any assertions we may need to do
    // For NonXhrGET
    // That way we can determine if
    // we can submit synchronously

    if (!this.xhrAction_ && this.method_ == 'GET') {
      this.assertSsrTemplate_(false, 'Non-XHR GETs not supported.');
      this.assertNoSensitiveFields_(); // If we have no async inputs, we can just submit synchronously

      if (asyncInputs.length === 0) {
        for (var i = 0; i < varSubsFields.length; i++) {
          this.urlReplacement_.expandInputValueSync(varSubsFields[i]);
        }
        /**
         * If the submit was called with an event, then we shouldn't
         * manually submit the form
         */


        var shouldSubmitFormElement = !event;
        this.handleNonXhrGet_(shouldSubmitFormElement);
        this.dirtinessHandler_.onSubmitSuccess();
        return Promise.resolve();
      }

      if (event) {
        event.preventDefault();
      }
    } // Set ourselves to the SUBMITTING State


    this.setState_(FormState.SUBMITTING); // Promises to run before submit without timeout.

    var requiredActionPromises = []; // Promises to run before submitting the form

    var presubmitPromises = [];
    presubmitPromises.push(this.doVarSubs_(varSubsFields));
    (0, _dom.iterateCursor)(asyncInputs, function (asyncInput) {
      var asyncCall = _this4.getValueForAsyncInput_(asyncInput);

      if (asyncInput.classList.contains(_asyncInput.AsyncInputClasses.ASYNC_REQUIRED_ACTION)) {
        requiredActionPromises.push(asyncCall);
      } else {
        presubmitPromises.push(asyncCall);
      }
    });
    return Promise.all(requiredActionPromises).then(function () {
      return _this4.waitOnPromisesOrTimeout_(presubmitPromises, SUBMIT_TIMEOUT).then(function () {
        return _this4.handlePresubmitSuccess_(trust);
      }, function (error) {
        return _this4.handlePresubmitError_(error);
      });
    }, function (error) {
      return _this4.handlePresubmitError_(error);
    });
  }
  /**
   * @private
   * Handle form error for presubmit async calls
   * @param {*} error
   * @return {Promise}
   */
  ;

  _proto.handlePresubmitError_ = function handlePresubmitError_(error) {
    var detail = (0, _object.dict)();

    if (error && error.message) {
      detail['error'] = error.message;
    }

    return this.handleSubmitFailure_(error, detail);
  }
  /**
   * Get form fields that require variable substitutions
   * @return {!IArrayLike<!HTMLInputElement>}
   * @private
   */
  ;

  _proto.getVarSubsFields_ = function getVarSubsFields_() {
    // Fields that support var substitutions.
    return this.form_.querySelectorAll('[type="hidden"][data-amp-replace]');
  }
  /**
   * Handle successful presubmit tasks
   * @param {!ActionTrust} trust
   * @return {!Promise}
   */
  ;

  _proto.handlePresubmitSuccess_ = function handlePresubmitSuccess_(trust) {
    if (this.xhrAction_) {
      return this.handleXhrSubmit_(trust);
    } else if (this.method_ == 'POST') {
      this.handleNonXhrPost_();
    } else if (this.method_ == 'GET') {
      this.handleNonXhrGet_(
      /* shouldSubmitFormElement */
      true);
    }

    return Promise.resolve();
  }
  /**
   * Send the verify request and control the VERIFYING state.
   * @return {!Promise}
   * @private
   */
  ;

  _proto.handleXhrVerify_ = function handleXhrVerify_() {
    var _this5 = this;

    if (this.state_ === FormState.SUBMITTING) {
      return Promise.resolve();
    }

    this.setState_(FormState.VERIFYING);
    this.triggerAction_(_formEvents.FormEvents.VERIFY, null);
    return this.doVarSubs_(this.getVarSubsFields_()).then(function () {
      return _this5.doVerifyXhr_();
    });
  }
  /**
   * @private
   * @param {ActionTrust} trust
   * @return {!Promise}
   */
  ;

  _proto.handleXhrSubmit_ = function handleXhrSubmit_(trust) {
    var _this6 = this;

    var p;

    if (this.ssrTemplateHelper_.isSupported()) {
      p = this.handleSsrTemplate_(trust);
    } else {
      this.submittingWithTrust_(trust);
      p = this.doActionXhr_().then(function (response) {
        return _this6.handleXhrSubmitSuccess_(response);
      }, function (error) {
        return _this6.handleXhrSubmitFailure_(error);
      });
    }

    if ((0, _mode.getMode)().test) {
      this.xhrSubmitPromise_ = p;
    }

    return p;
  }
  /**
   * Handles the server side proxying and then rendering of the template.
   * @param {ActionTrust} trust
   * @return {!Promise}
   * @private
   */
  ;

  _proto.handleSsrTemplate_ = function handleSsrTemplate_(trust) {
    var _this7 = this;

    var request; // Render template for the form submitting state.

    var values = this.getFormAsObject_();
    return this.renderTemplate_(values).then(function () {
      return _this7.actions_.trigger(_this7.form_, _formEvents.FormEvents.SUBMIT,
      /* event */
      null, trust);
    }).then(function () {
      return _this7.requestForFormFetch((0, _log.dev)().assertString(_this7.xhrAction_), _this7.method_);
    }).then(function (formRequest) {
      request = formRequest;
      request.fetchOpt = (0, _xhrUtils.setupInit)(request.fetchOpt);
      request.fetchOpt = (0, _xhrUtils.setupAMPCors)(_this7.win_, request.xhrUrl, request.fetchOpt);
      request.xhrUrl = (0, _xhrUtils.setupInput)(_this7.win_, request.xhrUrl, request.fetchOpt);
      return _this7.ssrTemplateHelper_.fetchAndRenderTemplate(_this7.form_, request, _this7.templatesForSsr_());
    }).then(function (response) {
      return _this7.handleSsrTemplateSuccess_(response);
    }, function (error) {
      var detail = (0, _object.dict)();

      if (error && error.message) {
        detail['error'] = error.message;
      }

      return _this7.handleSubmitFailure_(error, detail);
    });
  }
  /**
   * If present, finds and returns the success and error response templates.
   * Note that we do not render the submitting state template and only
   * deal with submit-success or submit-error.
   * @return {!../../../src/ssr-template-helper.SsrTemplateDef}
   * @private
   */
  ;

  _proto.templatesForSsr_ = function templatesForSsr_() {
    var successTemplate;
    var successContainer = this.form_.querySelector('[submit-success]');

    if (successContainer) {
      successTemplate = this.templates_.maybeFindTemplate(successContainer);
    }

    var errorTemplate;
    var errorContainer = this.form_.querySelector('[submit-error]');

    if (errorContainer) {
      errorTemplate = this.templates_.maybeFindTemplate(errorContainer);
    }

    return {
      successTemplate: successTemplate,
      errorTemplate: errorTemplate
    };
  }
  /**
   * Transition the form to the submit success state.
   * @param {!JsonObject} response
   * @return {!Promise}
   * @private
   */
  ;

  _proto.handleSsrTemplateSuccess_ = function handleSsrTemplateSuccess_(response) {
    return this.handleSubmitSuccess_((0, _promise.tryResolve)(function () {
      return response;
    }));
  }
  /**
   * Triggers the analytics and renders any template for submitting state.
   * @param {ActionTrust} trust
   */
  ;

  _proto.submittingWithTrust_ = function submittingWithTrust_(trust) {
    var _this8 = this;

    this.triggerFormSubmitInAnalytics_('amp-form-submit'); // After variable substitution

    var values = this.getFormAsObject_(); // At the form submitting state, we want to display any template
    // messages with the submitting attribute.

    this.renderTemplate_(values).then(function () {
      _this8.actions_.trigger(_this8.form_, _formEvents.FormEvents.SUBMIT,
      /* event */
      null, trust);
    });
  }
  /**
   * Perform asynchronous variable substitution on the fields that require it.
   * @param {!IArrayLike<!HTMLInputElement>} varSubsFields
   * @return {!Promise}
   * @private
   */
  ;

  _proto.doVarSubs_ = function doVarSubs_(varSubsFields) {
    var varSubPromises = [];

    for (var i = 0; i < varSubsFields.length; i++) {
      varSubPromises.push(this.urlReplacement_.expandInputValueAsync(varSubsFields[i]));
    }

    return this.waitOnPromisesOrTimeout_(varSubPromises, 100);
  }
  /**
   * Call getValue() on Async Input elements, and
   * Create hidden inputs containing their returned values
   * @param {!Element} asyncInput
   * @return {!Promise}
   * @private
   */
  ;

  _proto.getValueForAsyncInput_ = function getValueForAsyncInput_(asyncInput) {
    var _this9 = this;

    return asyncInput.getImpl().then(function (implementation) {
      return implementation.getValue();
    }).then(function (value) {
      var name = asyncInput.getAttribute(_asyncInput.AsyncInputAttributes.NAME);

      var input = _this9.form_.querySelector("input[name=" + (0, _css.escapeCssSelectorIdent)(name) + "]");

      if (!input) {
        input = (0, _dom.createElementWithAttributes)(_this9.win_.document, 'input', (0, _object.dict)({
          'name': asyncInput.getAttribute(_asyncInput.AsyncInputAttributes.NAME),
          'hidden': 'true'
        }));
      }

      input.setAttribute('value', value);

      _this9.form_.appendChild(input);
    });
  }
  /**
   * Send a request to the form's action endpoint.
   * @return {!Promise<!Response>}
   * @private
   */
  ;

  _proto.doActionXhr_ = function doActionXhr_() {
    return this.doXhr_((0, _log.dev)().assertString(this.xhrAction_), this.method_);
  }
  /**
   * Send a request to the form's verify endpoint.
   * @return {!Promise<!Response>}
   * @private
   */
  ;

  _proto.doVerifyXhr_ = function doVerifyXhr_() {
    var _this$doXhr_;

    var noVerifyFields = (0, _types.toArray)(this.form_.querySelectorAll("[" + (0, _css.escapeCssSelectorIdent)(_formVerifiers.FORM_VERIFY_OPTOUT) + "]"));
    var blacklist = noVerifyFields.map(function (field) {
      return field.name || field.id;
    });
    return this.doXhr_((0, _log.dev)().assertString(this.xhrVerify_), this.method_, (_this$doXhr_ = {}, _this$doXhr_[_formVerifiers.FORM_VERIFY_PARAM] = true, _this$doXhr_),
    /**opt_fieldBlacklist*/
    blacklist);
  }
  /**
   * Send a request to a form endpoint.
   * @param {string} url
   * @param {string} method
   * @param {!Object<string, string>=} opt_extraFields
   * @param {!Array<string>=} opt_fieldBlacklist
   * @return {!Promise<!Response>}
   * @private
   */
  ;

  _proto.doXhr_ = function doXhr_(url, method, opt_extraFields, opt_fieldBlacklist) {
    var _this10 = this;

    this.assertSsrTemplate_(false, 'XHRs should be proxied.');
    return this.requestForFormFetch(url, method, opt_extraFields, opt_fieldBlacklist).then(function (request) {
      return _this10.xhr_.fetch(request.xhrUrl, request.fetchOpt);
    });
  }
  /**
   * @param {!Response} response
   * @return {!Promise}
   * @private
   */
  ;

  _proto.handleXhrSubmitSuccess_ = function handleXhrSubmitSuccess_(response) {
    var _this11 = this;

    var json =
    /** @type {!Promise<!JsonObject>} */
    response.json();
    return this.handleSubmitSuccess_(json).then(function () {
      _this11.triggerFormSubmitInAnalytics_('amp-form-submit-success');

      _this11.maybeHandleRedirect_(response);
    });
  }
  /**
   * Transition the form to the submit success state.
   * @param {!Promise<!JsonObject>} jsonPromise
   * @return {!Promise}
   * @private visible for testing
   */
  ;

  _proto.handleSubmitSuccess_ = function handleSubmitSuccess_(jsonPromise) {
    var _this12 = this;

    return jsonPromise.then(function (json) {
      _this12.setState_(FormState.SUBMIT_SUCCESS);

      _this12.renderTemplate_(json || {}).then(function () {
        _this12.triggerAction_(_formEvents.FormEvents.SUBMIT_SUCCESS, json);

        _this12.dirtinessHandler_.onSubmitSuccess();
      });
    }, function (error) {
      (0, _log.user)().error(TAG, 'Failed to parse response JSON: %s', error);
    });
  }
  /**
   * @param {*} e
   * @return {!Promise}
   * @private
   */
  ;

  _proto.handleXhrSubmitFailure_ = function handleXhrSubmitFailure_(e) {
    var _this13 = this;

    var promise;

    if (e && e.response) {
      var error =
      /** @type {!Error} */
      e;
      promise = error.response.json().catch(function () {
        return null;
      });
    } else {
      promise = Promise.resolve(null);
    }

    return promise.then(function (responseJson) {
      _this13.triggerFormSubmitInAnalytics_('amp-form-submit-error');

      _this13.handleSubmitFailure_(e, responseJson);

      _this13.maybeHandleRedirect_(e.response);
    });
  }
  /**
   * Transition the form the the submit error state.
   * @param {*} error
   * @param {!JsonObject} json
   * @return {!Promise}
   * @private
   */
  ;

  _proto.handleSubmitFailure_ = function handleSubmitFailure_(error, json) {
    var _this14 = this;

    this.setState_(FormState.SUBMIT_ERROR);
    (0, _log.user)().error(TAG, 'Form submission failed: %s', error);
    return (0, _promise.tryResolve)(function () {
      _this14.renderTemplate_(json).then(function () {
        _this14.triggerAction_(_formEvents.FormEvents.SUBMIT_ERROR, json);

        _this14.dirtinessHandler_.onSubmitError();
      });
    });
  }
  /** @private */
  ;

  _proto.handleNonXhrPost_ = function handleNonXhrPost_() {
    // non-XHR POST requests are not supported.
    (0, _log.userAssert)(false, 'Only XHR based (via action-xhr attribute) submissions are supported ' + 'for POST requests. %s', this.form_);
  }
  /**
   * Triggers Submit Analytics,
   * and Form Element submit if passed by param.
   * shouldSubmitFormElement should ONLY be true
   * If the submit event.preventDefault was called
   * @param {boolean} shouldSubmitFormElement
   */
  ;

  _proto.handleNonXhrGet_ = function handleNonXhrGet_(shouldSubmitFormElement) {
    this.triggerFormSubmitInAnalytics_('amp-form-submit');

    if (shouldSubmitFormElement) {
      this.form_.submit();
    }

    this.setState_(FormState.INITIAL);
  }
  /**
   * Asserts that SSR support is the same as value.
   * @param {boolean} value
   * @param {string} msg
   * @private
   */
  ;

  _proto.assertSsrTemplate_ = function assertSsrTemplate_(value, msg) {
    var supported = this.ssrTemplateHelper_.isSupported();
    (0, _log.userAssert)(supported === value, '[amp-form]: viewerRenderTemplate | %s', msg);
  }
  /**
   * Fail if there are password or file fields present when the function
   * is called.
   * @private
   */
  ;

  _proto.assertNoSensitiveFields_ = function assertNoSensitiveFields_() {
    var fields = this.form_.querySelectorAll('input[type=password],input[type=file]');
    (0, _log.userAssert)(fields.length == 0, 'input[type=password] or input[type=file] ' + 'may only appear in form[method=post]');
  }
  /**
   * @return {boolean} False if the form is invalid.
   * @private
   */
  ;

  _proto.checkValidity_ = function checkValidity_() {
    if ((0, _formValidators.isCheckValiditySupported)(this.win_.document)) {
      // Validity checking should always occur, novalidate only circumvent
      // reporting and blocking submission on non-valid forms.
      var isValid = checkUserValidityOnSubmission(this.form_);

      if (this.shouldValidate_) {
        this.validator_.report();
        return isValid;
      }
    }

    return true;
  }
  /**
   * Handles response redirect throught the AMP-Redirect-To response header.
   * Not applicable if viewer can render templates.
   * @param {?Response} response
   * @private
   */
  ;

  _proto.maybeHandleRedirect_ = function maybeHandleRedirect_(response) {
    this.assertSsrTemplate_(false, 'Redirects not supported.');

    if (!response || !response.headers) {
      return;
    }

    var redirectTo = response.headers.get(REDIRECT_TO_HEADER);

    if (redirectTo) {
      (0, _log.userAssert)(this.target_ != '_blank', 'Redirecting to target=_blank using AMP-Redirect-To is currently ' + 'not supported, use target=_top instead. %s', this.form_);

      try {
        var urlService = _services.Services.urlForDoc(this.form_);

        urlService.assertAbsoluteHttpOrHttpsUrl(redirectTo);
        urlService.assertHttpsUrl(redirectTo, 'AMP-Redirect-To', 'Url');
      } catch (e) {
        (0, _log.userAssert)(false, 'The `AMP-Redirect-To` header value must be an ' + 'absolute URL starting with https://. Found %s', redirectTo);
      }

      var navigator = _services.Services.navigationForDoc(this.form_);

      navigator.navigateTo(this.win_, redirectTo, REDIRECT_TO_HEADER);
    }
  }
  /**
   * Triggers either a submit-success or submit-error action with response data.
   * @param {!FormEvents} name
   * @param {?JsonObject|!Array<{message: string, name: string}>} detail
   * @private
   */
  ;

  _proto.triggerAction_ = function triggerAction_(name, detail) {
    var event = (0, _eventHelper.createCustomEvent)(this.win_, TAG + "." + name, (0, _object.dict)({
      'response': detail
    }));
    this.actions_.trigger(this.form_, name, event, _actionConstants.ActionTrust.HIGH);
  }
  /**
   * Returns a race promise between resolving all promises or timing out.
   * @param {!Array<!Promise>} promises
   * @param {number} timeout
   * @return {!Promise}
   * @private
   */
  ;

  _proto.waitOnPromisesOrTimeout_ = function waitOnPromisesOrTimeout_(promises, timeout) {
    return Promise.race([Promise.all(promises), this.timer_.promise(timeout)]);
  }
  /**
   * @param {string} eventType
   * @param {!JsonObject=} opt_vars A map of vars and their values.
   * @private
   */
  ;

  _proto.analyticsEvent_ = function analyticsEvent_(eventType, opt_vars) {
    (0, _analytics.triggerAnalyticsEvent)(this.form_, eventType, opt_vars);
  }
  /**
   * Returns form data as an object.
   * @return {!JsonObject}
   * @private
   */
  ;

  _proto.getFormAsObject_ = function getFormAsObject_() {
    return (0, _form.getFormAsObject)(this.form_);
  }
  /**
   * Adds proper classes for the state passed.
   * @param {!FormState} newState
   * @private
   */
  ;

  _proto.setState_ = function setState_(newState) {
    var previousState = this.state_;
    this.form_.classList.remove("amp-form-" + previousState);
    this.form_.classList.add("amp-form-" + newState);
    this.cleanupRenderedTemplate_(previousState);
    this.state_ = newState;
  }
  /**
   * Renders a template based on the form state and its presence in the form.
   * @param {!JsonObject} data
   * @return {!Promise}
   * @private
   */
  ;

  _proto.renderTemplate_ = function renderTemplate_(data) {
    var _this15 = this;

    if ((0, _types.isArray)(data)) {
      data = (0, _object.dict)();
      (0, _log.user)().warn(TAG, "Unexpected data type: " + data + ". Expected non JSON array.");
    }

    var container = this.form_.
    /*OK*/
    querySelector("[" + this.state_ + "]");
    var p = Promise.resolve();

    if (container) {
      var messageId = "rendered-message-" + this.id_;
      container.setAttribute('role', 'alert');
      container.setAttribute('aria-labeledby', messageId);
      container.setAttribute('aria-live', 'assertive');

      if (this.templates_.hasTemplate(container)) {
        p = this.ssrTemplateHelper_.renderTemplate((0, _log.devAssert)(container), data).then(function (rendered) {
          rendered.id = messageId;
          rendered.setAttribute('i-amphtml-rendered', '');
          return _this15.resources_.mutateElement((0, _log.dev)().assertElement(container), function () {
            container.appendChild(rendered);
            var renderedEvent = (0, _eventHelper.createCustomEvent)(_this15.win_, _ampEvents.AmpEvents.DOM_UPDATE,
            /* detail */
            null, {
              bubbles: true
            });
            container.dispatchEvent(renderedEvent);
          });
        });
      } else {
        // TODO(vializ): This is to let AMP know that the AMP elements inside
        // this container are now visible so they get scheduled for layout.
        // This will be unnecessary when the AMP Layers implementation is
        // complete.
        this.resources_.mutateElement(container, function () {});
      }
    }

    if ((0, _mode.getMode)().test) {
      this.renderTemplatePromise_ = p;
    }

    return p;
  }
  /**
   * Removes the template for the passed state.
   * @param {!FormState} state
   * @private
   */
  ;

  _proto.cleanupRenderedTemplate_ = function cleanupRenderedTemplate_(state) {
    var container = this.form_.
    /*OK*/
    querySelector("[" + state + "]");

    if (!container) {
      return;
    }

    var previousRender = (0, _dom.childElementByAttr)(container, 'i-amphtml-rendered');

    if (previousRender) {
      (0, _dom.removeElement)(previousRender);
    }
  }
  /**
   * Returns a promise that resolves when tempalte render finishes. The promise
   * will be null if the template render has not started.
   * @visibleForTesting
   * @return {*} TODO(#23582): Specify return type
   */
  ;

  _proto.renderTemplatePromiseForTesting = function renderTemplatePromiseForTesting() {
    return this.renderTemplatePromise_;
  }
  /**
   * Returns a promise that resolves when xhr submit finishes. The promise
   * will be null if xhr submit has not started.
   * @visibleForTesting
   * @return {*} TODO(#23582): Specify return type
   */
  ;

  _proto.xhrSubmitPromiseForTesting = function xhrSubmitPromiseForTesting() {
    return this.xhrSubmitPromise_;
  };

  return AmpForm;
}();
/**
 * Checks user validity for all inputs, fieldsets and the form.
 * @param {!HTMLFormElement} form
 * @return {boolean} Whether the form is currently valid or not.
 */


exports.AmpForm = AmpForm;

function checkUserValidityOnSubmission(form) {
  var elements = form.querySelectorAll('input,select,textarea,fieldset');
  (0, _dom.iterateCursor)(elements, function (element) {
    return checkUserValidity(element);
  });
  return checkUserValidity(form);
}
/**
 * Returns the user validity state of the element.
 * @param {!Element} element
 * @return {string}
 */


function getUserValidityStateFor(element) {
  if (element.classList.contains('user-valid')) {
    return UserValidityState.USER_VALID;
  } else if (element.classList.contains('user-invalid')) {
    return UserValidityState.USER_INVALID;
  }

  return UserValidityState.NONE;
}
/**
 * Updates class names on the element to reflect the active invalid types on it.
 *
 * @param {!Element} element
 */


function updateInvalidTypesClasses(element) {
  if (!element.validity) {
    return;
  }

  for (var validationType in element.validity) {
    element.classList.toggle(validationType, element.validity[validationType]);
  }
}
/**
 * Removes all validity classes from elements in the given form.
 * @param {!Element} form
 */


function removeValidityStateClasses(form) {
  var dummyInput = document.createElement('input');

  var _loop = function _loop(validityState) {
    var elements = form.querySelectorAll("." + (0, _css.escapeCssSelectorIdent)(validityState));
    (0, _dom.iterateCursor)(elements, function (element) {
      (0, _log.dev)().assertElement(element).classList.remove(validityState);
    });
  };

  for (var validityState in dummyInput.validity) {
    _loop(validityState);
  }
}
/**
 * Checks user validity which applies .user-valid and .user-invalid AFTER the
 * user interacts with the input by moving away from the input (blur) or by
 * changing its value (input).
 *
 * See :user-invalid spec for more details:
 *   https://drafts.csswg.org/selectors-4/#user-pseudos
 *
 * The specs are still not fully specified. The current solution tries to follow
 * a common sense approach for when to apply these classes. As the specs gets
 * clearer, we should strive to match it as much as possible.
 *
 * @param {!Element} element
 * @param {boolean=} propagate Whether to propagate the user validity to
 * ancestors.
 * @return {boolean} Whether the element is valid or not.
 */


function checkUserValidity(element, propagate) {
  if (propagate === void 0) {
    propagate = false;
  }

  // TODO(mkhatib, #6930): Implement basic validation for custom inputs like
  // amp-selector.
  // If this is not a field type with checkValidity don't do anything.
  if (!element.checkValidity) {
    return true;
  }

  var shouldPropagate = false;
  var previousValidityState = getUserValidityStateFor(element);
  var isCurrentlyValid = element.checkValidity();

  if (previousValidityState != UserValidityState.USER_VALID && isCurrentlyValid) {
    element.classList.add('user-valid');
    element.classList.remove('user-invalid'); // Don't propagate user-valid unless it was marked invalid before.

    shouldPropagate = previousValidityState == UserValidityState.USER_INVALID;
  } else if (previousValidityState != UserValidityState.USER_INVALID && !isCurrentlyValid) {
    element.classList.add('user-invalid');
    element.classList.remove('user-valid'); // Always propagate an invalid state change. One invalid input field is
    // guaranteed to make the fieldset and form invalid as well.

    shouldPropagate = true;
  }

  updateInvalidTypesClasses(element);

  if (propagate && shouldPropagate) {
    // Propagate user validity to ancestor fieldsets.
    var ancestors = (0, _dom.ancestorElementsByTag)(element, 'fieldset');

    for (var i = 0; i < ancestors.length; i++) {
      checkUserValidity(ancestors[i]);
    } // Also update the form user validity.


    if (element.form) {
      checkUserValidity(element.form);
    }
  }

  return isCurrentlyValid;
}
/**
 * Responds to user interaction with an input by checking user validity of the
 * input and possibly its input-related ancestors (e.g. feildset, form).
 * @param {!Element} input
 * @private visible for testing.
 */


function checkUserValidityAfterInteraction_(input) {
  checkUserValidity(input,
  /* propagate */
  true);
}
/**
 * Bootstraps the amp-form elements
 */


var AmpFormService =
/*#__PURE__*/
function () {
  /**
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AmpFormService(ampdoc) {
    var _this16 = this;

    /** @const @private {!Promise} */
    this.whenInitialized_ = this.installStyles_(ampdoc).then(function () {
      return _this16.installHandlers_(ampdoc);
    }); // Dispatch a test-only event for integration tests.

    if ((0, _mode.getMode)().test) {
      this.whenInitialized_.then(function () {
        var win = ampdoc.win;
        var event = (0, _eventHelper.createCustomEvent)(win, _formEvents.FormEvents.SERVICE_INIT, null, {
          bubbles: true
        });
        win.dispatchEvent(event);
      });
    }
  }
  /**
   * Returns a promise that resolves when all form implementations (if any)
   * have been upgraded.
   * @return {!Promise}
   */


  var _proto2 = AmpFormService.prototype;

  _proto2.whenInitialized = function whenInitialized() {
    return this.whenInitialized_;
  }
  /**
   * Install the amp-form CSS
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise}
   * @private
   */
  ;

  _proto2.installStyles_ = function installStyles_(ampdoc) {
    var deferred = new _promise.Deferred();
    (0, _styleInstaller.installStylesForDoc)(ampdoc, _ampForm.CSS, deferred.resolve, false, TAG);
    return deferred.promise;
  }
  /**
   * Install the event handlers
   * @param  {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Promise}
   * @private
   */
  ;

  _proto2.installHandlers_ = function installHandlers_(ampdoc) {
    var _this17 = this;

    return ampdoc.whenReady().then(function () {
      var root = ampdoc.getRootNode();

      _this17.installSubmissionHandlers_(root.querySelectorAll('form'));

      _ampFormTextarea.AmpFormTextarea.install(ampdoc);

      _this17.installGlobalEventListener_(root);
    });
  }
  /**
   * Install submission handler on all forms in the document.
   * @param {?IArrayLike<T>} forms
   * @template T
   * @private
   */
  ;

  _proto2.installSubmissionHandlers_ = function installSubmissionHandlers_(forms) {
    if (!forms) {
      return;
    }

    (0, _dom.iterateCursor)(forms, function (form, index) {
      var existingAmpForm = (0, _form.formOrNullForElement)(form);

      if (!existingAmpForm) {
        new AmpForm(form, "amp-form-" + index);
      }
    });
  }
  /**
   * Listen for DOM updated messages sent to the document.
   * @param {!Document|!ShadowRoot} doc
   * @private
   */
  ;

  _proto2.installGlobalEventListener_ = function installGlobalEventListener_(doc) {
    var _this18 = this;

    doc.addEventListener(_ampEvents.AmpEvents.DOM_UPDATE, function () {
      _this18.installSubmissionHandlers_(doc.querySelectorAll('form'));
    });
  };

  return AmpFormService;
}();

exports.AmpFormService = AmpFormService;
AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerServiceForDoc('form-submit-service', _formSubmitService.FormSubmitService);
  AMP.registerServiceForDoc(TAG, AmpFormService);
});

},{"../../../build/amp-form-0.1.css":1,"../../../src/action-constants":11,"../../../src/amp-events":12,"../../../src/analytics":13,"../../../src/async-input":14,"../../../src/css":17,"../../../src/dom":18,"../../../src/event-helper":21,"../../../src/form":24,"../../../src/form-data-wrapper":23,"../../../src/log":26,"../../../src/mode":28,"../../../src/services":32,"../../../src/ssr-template-helper":33,"../../../src/style-installer":35,"../../../src/types":37,"../../../src/url":40,"../../../src/utils/object":44,"../../../src/utils/promise":45,"../../../src/utils/xhr-utils":47,"./amp-form-textarea":2,"./form-dirtiness":4,"./form-events":5,"./form-proxy":6,"./form-submit-service":7,"./form-validators":8,"./form-verifiers":9}],4:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.FormDirtiness = exports.DIRTINESS_INDICATOR_CLASS = void 0;

var _ampEvents = require("../../../src/amp-events");

var _eventHelper = require("../../../src/event-helper");

var _formDataWrapper = require("../../../src/form-data-wrapper");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _form = require("../../../src/form");

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
var DIRTINESS_INDICATOR_CLASS = 'amp-form-dirty';
/** @private {!Object<string, boolean>} */

exports.DIRTINESS_INDICATOR_CLASS = DIRTINESS_INDICATOR_CLASS;
var SUPPORTED_TAG_NAMES = {
  'INPUT': true,
  'SELECT': true,
  'TEXTAREA': true
};

var FormDirtiness =
/*#__PURE__*/
function () {
  /**
   * @param {!HTMLFormElement} form
   * @param {!Window} win
   */
  function FormDirtiness(form, win) {
    /** @private @const {!HTMLFormElement} */
    this.form_ = form;
    /** @private @const {!Window} */

    this.win_ = win;
    /** @private {number} */

    this.dirtyFieldCount_ = 0;
    /** @private {!Object<string, boolean>} */

    this.isFieldNameDirty_ = (0, _object.map)();
    /** @private {?FormData} */

    this.submittedFormData_ = null;
    /** @private {boolean} */

    this.isSubmitting_ = false;
    /** @private {boolean} */

    this.wasDirty_ = false;
    this.installEventHandlers_(); // New forms are usually clean. However, if `amp-bind` mutates a form field
    // before the `amp-form` is initialized, the `amp-form` will miss the
    // `FORM_VALUE_CHANGE` event dispatched.

    this.determineInitialDirtiness_();
  }
  /**
   * Processes dirtiness state when a form is being submitted. This puts the
   * form in a "submitting" state, and temporarily clears the dirtiness state.
   */


  var _proto = FormDirtiness.prototype;

  _proto.onSubmitting = function onSubmitting() {
    this.isSubmitting_ = true;
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }
  /**
   * Processes dirtiness state when the form submission fails. This clears the
   * "submitting" state and reverts the form's dirtiness state.
   */
  ;

  _proto.onSubmitError = function onSubmitError() {
    this.isSubmitting_ = false;
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }
  /**
   * Processes dirtiness state when the form submission succeeds. This clears
   * the "submitting" state and the form's overall dirtiness.
   */
  ;

  _proto.onSubmitSuccess = function onSubmitSuccess() {
    this.isSubmitting_ = false;
    this.submittedFormData_ = this.takeFormDataSnapshot_();
    this.clearDirtyFields_();
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }
  /**
   * @return {!FormData}
   * @private
   */
  ;

  _proto.takeFormDataSnapshot_ = function takeFormDataSnapshot_() {
    return (0, _formDataWrapper.createFormDataWrapper)(this.win_, this.form_).getFormData();
  }
  /**
   * Adds or removes the `amp-form-dirty` class and dispatches a
   * `FORM_DIRTINESS_CHANGE` event that reflects the current dirtiness state,
   * when the form dirtiness state changes. Does nothing otherwise.
   * @private
   */
  ;

  _proto.updateClassAndDispatchEventIfDirtyStateChanged_ = function updateClassAndDispatchEventIfDirtyStateChanged_() {
    var isDirty = this.dirtyFieldCount_ > 0 && !this.isSubmitting_;

    if (isDirty !== this.wasDirty_) {
      this.form_.classList.toggle(DIRTINESS_INDICATOR_CLASS, isDirty);
      var formDirtinessChangeEvent = (0, _eventHelper.createCustomEvent)(this.win_, _ampEvents.AmpEvents.FORM_DIRTINESS_CHANGE, (0, _object.dict)({
        'isDirty': isDirty
      }), {
        bubbles: true
      });
      this.form_.dispatchEvent(formDirtinessChangeEvent);
    }

    this.wasDirty_ = isDirty;
  }
  /**
   * @private
   */
  ;

  _proto.installEventHandlers_ = function installEventHandlers_() {
    this.form_.addEventListener('input', this.onInput_.bind(this));
    this.form_.addEventListener('reset', this.onReset_.bind(this)); // `amp-bind` dispatches the custom event `FORM_VALUE_CHANGE` when it
    // mutates the value of a form field (e.g. textarea, input, etc)

    this.form_.addEventListener(_ampEvents.AmpEvents.FORM_VALUE_CHANGE, this.onInput_.bind(this));
  }
  /** @private */
  ;

  _proto.determineInitialDirtiness_ = function determineInitialDirtiness_() {
    for (var i = 0; i < this.form_.elements.length; ++i) {
      this.checkDirtinessAfterUserInteraction_(this.form_.elements[i]);
    }

    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }
  /**
   * Listens to form field value changes, determines the field's dirtiness, and
   * updates the form's overall dirtiness.
   * @param {!Event} event
   * @private
   */
  ;

  _proto.onInput_ = function onInput_(event) {
    var field = (0, _log.dev)().assertElement(event.target);
    this.checkDirtinessAfterUserInteraction_(field);
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }
  /**
   * Listens to the form reset event, and clears the overall dirtiness.
   * @param {!Event} unusedEvent
   * @private
   */
  ;

  _proto.onReset_ = function onReset_(unusedEvent) {
    this.clearDirtyFields_();
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }
  /**
   * Determine the given field's dirtiness.
   * @param {!Element} field
   * @private
   */
  ;

  _proto.checkDirtinessAfterUserInteraction_ = function checkDirtinessAfterUserInteraction_(field) {
    if (shouldSkipDirtinessCheck(field)) {
      return;
    }

    if ((0, _form.isFieldEmpty)(field) || (0, _form.isFieldDefault)(field) || this.isFieldSameAsLastSubmission_(field)) {
      this.removeDirtyField_(field.name);
    } else {
      this.addDirtyField_(field.name);
    }
  }
  /**
   * Returns true if the form field's current value matches its most recent
   * submitted value.
   * @param {!Element} field
   * @return {boolean}
   * @private
   */
  ;

  _proto.isFieldSameAsLastSubmission_ = function isFieldSameAsLastSubmission_(field) {
    if (!this.submittedFormData_) {
      return false;
    }

    var name = field.name,
        value = field.value;
    return this.submittedFormData_.get(name) === value;
  }
  /**
   * Mark the field as dirty and increase the overall dirty field count, if the
   * field is previously clean.
   * @param {string} fieldName
   * @private
   */
  ;

  _proto.addDirtyField_ = function addDirtyField_(fieldName) {
    if (!this.isFieldNameDirty_[fieldName]) {
      this.isFieldNameDirty_[fieldName] = true;
      ++this.dirtyFieldCount_;
    }
  }
  /**
   * Mark the field as clean and decrease the overall dirty field count, if the
   * field is previously dirty.
   * @param {string} fieldName
   * @private
   */
  ;

  _proto.removeDirtyField_ = function removeDirtyField_(fieldName) {
    if (this.isFieldNameDirty_[fieldName]) {
      this.isFieldNameDirty_[fieldName] = false;
      --this.dirtyFieldCount_;
    }
  }
  /**
   * Clears the dirty field name map and counter.
   * @private
   */
  ;

  _proto.clearDirtyFields_ = function clearDirtyFields_() {
    this.isFieldNameDirty_ = (0, _object.map)();
    this.dirtyFieldCount_ = 0;
  };

  return FormDirtiness;
}();
/**
 * Returns true if the form should be subject to dirtiness check. Unsupported
 * elements, disabled elements, hidden elements, or elements without the `name`
 * attribute are skipped.
 * @param {!Element} field
 * @return {boolean}
 */


exports.FormDirtiness = FormDirtiness;

function shouldSkipDirtinessCheck(field) {
  var tagName = field.tagName,
      name = field.name,
      hidden = field.hidden;

  if (!SUPPORTED_TAG_NAMES[tagName]) {
    return true;
  }

  return !name || hidden || (0, _form.isDisabled)(field);
}

},{"../../../src/amp-events":12,"../../../src/event-helper":21,"../../../src/form":24,"../../../src/form-data-wrapper":23,"../../../src/log":26,"../../../src/utils/object":44}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.FormEvents = void 0;

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

/** @enum {string} */
var FormEvents = {
  INVALID: 'invalid',
  SERVICE_INIT: 'amp:form-service:initialize',
  // Dispatched by the window when AmpFormService initializes.
  SUBMIT_ERROR: 'submit-error',
  SUBMIT_SUCCESS: 'submit-success',
  SUBMIT: 'submit',
  VALID: 'valid',
  VERIFY_ERROR: 'verify-error',
  VERIFY: 'verify'
};
exports.FormEvents = FormEvents;

},{}],6:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setBlacklistedPropertiesForTesting = setBlacklistedPropertiesForTesting;
exports.installFormProxy = installFormProxy;

var _services = require("../../../src/services");

var _log = require("../../../src/log");

var _string = require("../../../src/string");

var _types = require("../../../src/types");

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
 * Blacklisted properties. Used mainly fot testing.
 * @type {?Array<string>}
 */
var blacklistedProperties = null;
/**
 * @param {?Array<string>} properties
 * @visibleForTesting
 */

function setBlacklistedPropertiesForTesting(properties) {
  blacklistedProperties = properties;
}
/**
 * Creates a proxy object `form.$p` that proxies all of the methods and
 * properties to the original DOM APIs. This is to work around the problematic
 * forms feature where inputs mask DOM APIs.
 *
 * E.g. a `<input id="id">` will override `form.id` from the original DOM API.
 * Form proxy will give access to the original `id` value via `form.$p.id`.
 *
 * See https://medium.com/@dvoytenko/solving-conflicts-between-form-inputs-and-dom-api-535c45333ae4
 *
 * @param {!HTMLFormElement} form
 * @return {!Object}
 */


function installFormProxy(form) {
  var constr = getFormProxyConstr((0, _types.toWin)(form.ownerDocument.defaultView));
  var proxy = new constr(form);

  if (!('action' in proxy)) {
    setupLegacyProxy(form, proxy);
  }

  form['$p'] = proxy;
  return proxy;
}
/**
 * @param {!Window} win
 * @return {function(new:Object, !HTMLFormElement)}
 */


function getFormProxyConstr(win) {
  if (!win.FormProxy) {
    win.FormProxy = createFormProxyConstr(win);
  }

  return win.FormProxy;
}
/**
 * @param {!Window} win
 * @return {function(new:Object, !HTMLFormElement)}
 */


function createFormProxyConstr(win) {
  /**
   * @param {!HTMLFormElement} form
   * @constructor
   */
  function FormProxy(form) {
    /** @private @const {!HTMLFormElement} */
    this.form_ = form;
  }

  var FormProxyProto = FormProxy.prototype;
  var Object = win.Object;
  var ObjectProto = Object.prototype; // Hierarchy:
  //   Node  <==  Element <== HTMLElement <== HTMLFormElement
  //   EventTarget  <==  HTMLFormElement

  var baseClasses = [win.HTMLFormElement, win.EventTarget];
  var inheritance = baseClasses.reduce(function (all, klass) {
    var proto = klass && klass.prototype;

    while (proto && proto !== ObjectProto) {
      if (all.indexOf(proto) >= 0) {
        break;
      }

      all.push(proto);
      proto = Object.getPrototypeOf(proto);
    }

    return all;
  }, []);
  inheritance.forEach(function (proto) {
    var _loop = function _loop(name) {
      var property = win.Object.getOwnPropertyDescriptor(proto, name);

      if (!property || // Exclude constants.
      name.toUpperCase() == name || // Exclude on-events.
      (0, _string.startsWith)(name, 'on') || // Exclude properties that already been created.
      ObjectProto.hasOwnProperty.call(FormProxyProto, name) || // Exclude some properties. Currently only used for testing.
      blacklistedProperties && blacklistedProperties.includes(name)) {
        return "continue";
      }

      if (typeof property.value == 'function') {
        // A method call. Call the original prototype method via `call`.
        var method = property.value;

        FormProxyProto[name] = function () {
          return method.apply(
          /** @type {!FormProxy} */
          this.form_, arguments);
        };
      } else {
        // A read/write property. Call the original prototype getter/setter.
        var spec = {};

        if (property.get) {
          spec.get = function () {
            return property.get.call(
            /** @type {!FormProxy} */
            this.form_);
          };
        }

        if (property.set) {
          spec.set = function (v) {
            return property.set.call(
            /** @type {!FormProxy} */
            this.form_, v);
          };
        }

        win.Object.defineProperty(FormProxyProto, name, spec);
      }
    };

    for (var name in proto) {
      var _ret = _loop(name);

      if (_ret === "continue") continue;
    }
  });
  return FormProxy;
}
/**
 * This is a very heavy-handed way to support browsers that do not have
 * properties defined in the prototype chain. Specifically, this is necessary
 * for Chrome 45 and under.
 *
 * See https://developers.google.com/web/updates/2015/04/DOM-attributes-now-on-the-prototype-chain
 * for more info.
 *
 * @param {!HTMLFormElement} form
 * @param {!Object} proxy
 */


function setupLegacyProxy(form, proxy) {
  var win = form.ownerDocument.defaultView;
  var proto = win.HTMLFormElement.prototype.cloneNode.call(form,
  /* deep */
  false);

  var _loop2 = function _loop2(name) {
    if (name in proxy || // Exclude constants.
    name.toUpperCase() == name || // Exclude on-events.
    (0, _string.startsWith)(name, 'on')) {
      return "continue";
    }

    var desc = LEGACY_PROPS[name];
    var current = form[name];

    if (desc) {
      if (desc.access == LegacyPropAccessType.READ_ONCE) {
        // A property such as `style`. The only way is to read this value
        // once and use it for all subsequent calls.
        var actual;

        if (current && current.nodeType) {
          // The overriding input, if present, has to be removed and re-added
          // (renaming does NOT work). Completely insane, I know.
          var element = (0, _log.dev)().assertElement(current);
          var nextSibling = element.nextSibling,
              parent = element.parentNode;
          parent.removeChild(element);

          try {
            actual = form[name];
          } finally {
            parent.insertBefore(element, nextSibling);
          }
        } else {
          actual = current;
        }

        Object.defineProperty(proxy, name, {
          get: function get() {
            return actual;
          }
        });
      } else if (desc.access == LegacyPropAccessType.ATTR) {
        // An attribute-based property. We can use DOM API to read and write
        // with a minimal type conversion.
        var attr = desc.attr || name;
        Object.defineProperty(proxy, name, {
          get: function get() {
            var value = proxy.getAttribute(attr);

            if (value == null && desc.def !== undefined) {
              return desc.def;
            }

            if (desc.type == LegacyPropDataType.BOOL) {
              return value === 'true';
            }

            if (desc.type == LegacyPropDataType.TOGGLE) {
              return value != null;
            }

            if (desc.type == LegacyPropDataType.URL) {
              // URLs, e.g. in `action` attribute are resolved against the
              // document's base.
              var str =
              /** @type {string} */
              value || '';
              return _services.Services.urlForDoc(form).parse(str).href;
            }

            return value;
          },
          set: function set(value) {
            if (desc.type == LegacyPropDataType.TOGGLE) {
              if (value) {
                value = '';
              } else {
                value = null;
              }
            }

            if (value != null) {
              proxy.setAttribute(attr, value);
            } else {
              proxy.removeAttribute(attr);
            }
          }
        });
      } else {
        (0, _log.devAssert)(false, 'unknown property access type: %s', desc.access);
      }
    } else {
      // Not a known property - proxy directly.
      Object.defineProperty(proxy, name, {
        get: function get() {
          return form[name];
        },
        set: function set(value) {
          form[name] = value;
        }
      });
    }
  };

  for (var name in proto) {
    var _ret2 = _loop2(name);

    if (_ret2 === "continue") continue;
  }
}
/**
 * @enum {number}
 */


var LegacyPropAccessType = {
  ATTR: 1,
  READ_ONCE: 2
};
/**
 * @enum {number}
 */

var LegacyPropDataType = {
  URL: 1,
  BOOL: 2,
  TOGGLE: 3
};
/**
 * @const {!Object<string, {
 *   access: !LegacyPropAccessType,
 *   attr: (string|undefined),
 *   type: (LegacyPropDataType|undefined),
 *   def: *,
 * }>}
 */

var LEGACY_PROPS = {
  'acceptCharset': {
    access: LegacyPropAccessType.ATTR,
    attr: 'accept-charset'
  },
  'accessKey': {
    access: LegacyPropAccessType.ATTR,
    attr: 'accesskey'
  },
  'action': {
    access: LegacyPropAccessType.ATTR,
    type: LegacyPropDataType.URL
  },
  'attributes': {
    access: LegacyPropAccessType.READ_ONCE
  },
  'autocomplete': {
    access: LegacyPropAccessType.ATTR,
    def: 'on'
  },
  'children': {
    access: LegacyPropAccessType.READ_ONCE
  },
  'dataset': {
    access: LegacyPropAccessType.READ_ONCE
  },
  'dir': {
    access: LegacyPropAccessType.ATTR
  },
  'draggable': {
    access: LegacyPropAccessType.ATTR,
    type: LegacyPropDataType.BOOL,
    def: false
  },
  'elements': {
    access: LegacyPropAccessType.READ_ONCE
  },
  'encoding': {
    access: LegacyPropAccessType.READ_ONCE
  },
  'enctype': {
    access: LegacyPropAccessType.ATTR
  },
  'hidden': {
    access: LegacyPropAccessType.ATTR,
    type: LegacyPropDataType.TOGGLE,
    def: false
  },
  'id': {
    access: LegacyPropAccessType.ATTR,
    def: ''
  },
  'lang': {
    access: LegacyPropAccessType.ATTR
  },
  'localName': {
    access: LegacyPropAccessType.READ_ONCE
  },
  'method': {
    access: LegacyPropAccessType.ATTR,
    def: 'get'
  },
  'name': {
    access: LegacyPropAccessType.ATTR
  },
  'noValidate': {
    access: LegacyPropAccessType.ATTR,
    attr: 'novalidate',
    type: LegacyPropDataType.TOGGLE,
    def: false
  },
  'prefix': {
    access: LegacyPropAccessType.READ_ONCE
  },
  'spellcheck': {
    access: LegacyPropAccessType.ATTR
  },
  'style': {
    access: LegacyPropAccessType.READ_ONCE
  },
  'target': {
    access: LegacyPropAccessType.ATTR,
    def: ''
  },
  'title': {
    access: LegacyPropAccessType.ATTR
  },
  'translate': {
    access: LegacyPropAccessType.ATTR
  }
};

},{"../../../src/log":26,"../../../src/services":32,"../../../src/string":34,"../../../src/types":37}],7:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.FormSubmitService = exports.FormSubmitEventDef = void 0;

var _observable = require("../../../src/observable");

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
 * @typedef {{
 *   form: !HTMLFormElement,
 *   actionXhrMutator: function(string)
 * }}
 */
var FormSubmitEventDef;
exports.FormSubmitEventDef = FormSubmitEventDef;

var FormSubmitService =
/*#__PURE__*/
function () {
  /**
   * Global service used to register callbacks we wish to execute when an
   * amp-form is submitted.
   */
  function FormSubmitService() {
    this.observable_ = new _observable.Observable();
  }
  /**
   * Used to register callbacks.
   * @param {function(!FormSubmitEventDef)} cb
   * @return {!UnlistenDef}
   */


  var _proto = FormSubmitService.prototype;

  _proto.beforeSubmit = function beforeSubmit(cb) {
    return this.observable_.add(cb);
  }
  /**
   * Fired when form is submitted.
   * @param {!FormSubmitEventDef} event
   */
  ;

  _proto.fire = function fire(event) {
    this.observable_.fire(event);
  };

  return FormSubmitService;
}();

exports.FormSubmitService = FormSubmitService;

},{"../../../src/observable":29}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.setReportValiditySupportedForTesting = setReportValiditySupportedForTesting;
exports.setCheckValiditySupportedForTesting = setCheckValiditySupportedForTesting;
exports.getFormValidator = getFormValidator;
exports.isCheckValiditySupported = isCheckValiditySupported;
exports.InteractAndSubmitValidator = exports.AsYouGoValidator = exports.ShowAllOnSubmitValidator = exports.ShowFirstOnSubmitValidator = exports.AbstractCustomValidator = exports.PolyfillDefaultValidator = exports.DefaultValidator = exports.FormValidator = void 0;

var _formEvents = require("./form-events");

var _services = require("../../../src/services");

var _validationBubble = require("./validation-bubble");

var _eventHelper = require("../../../src/event-helper");

var _log = require("../../../src/log");

var _dom = require("../../../src/dom");

var _types = require("../../../src/types");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/** @const @private {string} */
var VALIDATION_CACHE_PREFIX = '__AMP_VALIDATION_';
/** @const @private {string} */

var VISIBLE_VALIDATION_CACHE = '__AMP_VISIBLE_VALIDATION';
/** @const @private {string} */

var ARIA_DESC_ID_PREFIX = 'i-amphtml-aria-desc-';
/**
 * Validation user message for non-standard pattern mismatch errors.
 * Note this isn't localized but custom validation can be used instead.
 * @const @private {string}
 */

var CUSTOM_PATTERN_ERROR = 'Please match the requested format.';
/** @type {boolean|undefined} */

var reportValiditySupported;
/** @type {boolean|undefined} */

var checkValiditySupported;
/** @type {number} */

var validationBubbleCount = 0;
/**
 * @param {boolean} isSupported
 * @private visible for testing.
 */

function setReportValiditySupportedForTesting(isSupported) {
  reportValiditySupported = isSupported;
}
/**
 * @param {boolean} isSupported
 * @private visible for testing.
 */


function setCheckValiditySupportedForTesting(isSupported) {
  checkValiditySupported = isSupported;
}
/** @const @enum {string} */


var CustomValidationTypes = {
  AsYouGo: 'as-you-go',
  ShowAllOnSubmit: 'show-all-on-submit',
  InteractAndSubmit: 'interact-and-submit',
  ShowFirstOnSubmit: 'show-first-on-submit'
};
/**
 * Form validator interface.
 * @abstract
 */

var FormValidator =
/*#__PURE__*/
function () {
  /**
   * @param {!HTMLFormElement} form
   */
  function FormValidator(form) {
    /** @protected @const {!HTMLFormElement} */
    this.form = form;
    /** @protected @const {!../../../src/service/ampdoc-impl.AmpDoc} */

    this.ampdoc = _services.Services.ampdoc(form);
    /** @const @protected {!../../../src/service/resources-interface.ResourcesInterface} */

    this.resources = _services.Services.resourcesForDoc(form);
    /** @protected @const {!Document|!ShadowRoot} */

    this.root = this.ampdoc.getRootNode();
    /**
     * Tribool indicating last known validity of form.
     * @private {boolean|null}
     */

    this.formValidity_ = null;
  }
  /**
   * Called to report validation errors.
   */


  var _proto = FormValidator.prototype;

  _proto.report = function report() {}
  /**
   * @param {!Event} unusedEvent
   */
  ;

  _proto.onBlur = function onBlur(unusedEvent) {}
  /**
   * @param {!Event} unusedEvent
   */
  ;

  _proto.onInput = function onInput(unusedEvent) {}
  /** @return {!NodeList} */
  ;

  _proto.inputs = function inputs() {
    return this.form.querySelectorAll('input,select,textarea');
  }
  /**
   * Wraps `checkValidity` on input elements to support `pattern` attribute on
   * <textarea> which is not supported in HTML5.
   * @param {!Element} input
   * @return {boolean}
   * @protected
   */
  ;

  _proto.checkInputValidity = function checkInputValidity(input) {
    if (input.tagName === 'TEXTAREA' && input.hasAttribute('pattern')) {
      // FormVerifier also uses setCustomValidity() to signal verification
      // errors. Make sure we only override pattern errors here.
      if (input.checkValidity() || input.validationMessage === CUSTOM_PATTERN_ERROR) {
        var pattern = input.getAttribute('pattern');
        var re = new RegExp("^" + pattern + "$", 'm');
        var valid = re.test(input.value);
        input.setCustomValidity(valid ? '' : CUSTOM_PATTERN_ERROR);
      }
    }

    return input.checkValidity();
  }
  /**
   * Wraps `checkValidity` on form elements to support `pattern` attribute on
   * <textarea> which is not supported in HTML5.
   * @param {!HTMLFormElement} form
   * @return {boolean}
   * @protected
   */
  ;

  _proto.checkFormValidity = function checkFormValidity(form) {
    this.checkTextAreaValidityInForm_(form);
    return form.checkValidity();
  }
  /**
   * Wraps `reportValidity` on form elements to support `pattern` attribute on
   * <textarea> which is not supported in HTML5.
   * @param {!HTMLFormElement} form
   * @return {boolean}
   * @protected
   */
  ;

  _proto.reportFormValidity = function reportFormValidity(form) {
    this.checkTextAreaValidityInForm_(form);
    return form.reportValidity();
  }
  /**
   * @param {!HTMLFormElement} form
   * @private
   */
  ;

  _proto.checkTextAreaValidityInForm_ = function checkTextAreaValidityInForm_(form) {
    var _this = this;

    (0, _dom.iterateCursor)(form.elements, function (element) {
      if (element.tagName == 'TEXTAREA') {
        _this.checkInputValidity(element);
      }
    });
  }
  /**
   * Fires a valid/invalid event from the form if its validity state
   * has changed since the last invocation of this function.
   * @visibleForTesting
   */
  ;

  _proto.fireValidityEventIfNecessary = function fireValidityEventIfNecessary() {
    var previousValidity = this.formValidity_;
    this.formValidity_ = this.checkFormValidity(this.form);

    if (previousValidity !== this.formValidity_) {
      var win = (0, _types.toWin)(this.form.ownerDocument.defaultView);
      var type = this.formValidity_ ? _formEvents.FormEvents.VALID : _formEvents.FormEvents.INVALID;
      var event = (0, _eventHelper.createCustomEvent)(win, type, null, {
        bubbles: true
      });
      this.form.dispatchEvent(event);
    }
  };

  return FormValidator;
}();
/** @private visible for testing */


exports.FormValidator = FormValidator;

var DefaultValidator =
/*#__PURE__*/
function (_FormValidator) {
  _inheritsLoose(DefaultValidator, _FormValidator);

  function DefaultValidator() {
    return _FormValidator.apply(this, arguments) || this;
  }

  var _proto2 = DefaultValidator.prototype;

  /** @override */
  _proto2.report = function report() {
    this.reportFormValidity(this.form);
    this.fireValidityEventIfNecessary();
  };

  return DefaultValidator;
}(FormValidator);
/** @private visible for testing */


exports.DefaultValidator = DefaultValidator;

var PolyfillDefaultValidator =
/*#__PURE__*/
function (_FormValidator2) {
  _inheritsLoose(PolyfillDefaultValidator, _FormValidator2);

  /**
   * Creates an instance of PolyfillDefaultValidator.
   * @param {!HTMLFormElement} form
   */
  function PolyfillDefaultValidator(form) {
    var _this2;

    _this2 = _FormValidator2.call(this, form) || this;
    var bubbleId = "i-amphtml-validation-bubble-" + validationBubbleCount++;
    /** @private @const {!./validation-bubble.ValidationBubble} */

    _this2.validationBubble_ = new _validationBubble.ValidationBubble(_this2.ampdoc, bubbleId);
    return _this2;
  }
  /** @override */


  var _proto3 = PolyfillDefaultValidator.prototype;

  _proto3.report = function report() {
    var inputs = this.inputs();

    for (var i = 0; i < inputs.length; i++) {
      if (!this.checkInputValidity(inputs[i])) {
        inputs[i].
        /*REVIEW*/
        focus();
        this.validationBubble_.show(inputs[i], inputs[i].validationMessage);
        break;
      }
    }

    this.fireValidityEventIfNecessary();
  }
  /** @override */
  ;

  _proto3.onBlur = function onBlur(e) {
    // NOTE: IE11 focuses the submit button after submitting a form.
    // Then amp-form focuses the first field with an error, which causes the
    // submit button to blur. So we need to disregard the submit button blur.
    if (e.target.type == 'submit') {
      return;
    }

    this.validationBubble_.hide();
  }
  /** @override */
  ;

  _proto3.onInput = function onInput(event) {
    var input = (0, _log.dev)().assertElement(event.target);

    if (!this.validationBubble_.isActiveOn(input)) {
      return;
    }

    if (this.checkInputValidity(input)) {
      input.removeAttribute('aria-invalid');
      this.validationBubble_.hide();
    } else {
      input.setAttribute('aria-invalid', 'true');
      this.validationBubble_.show(input, input.validationMessage);
    }
  };

  return PolyfillDefaultValidator;
}(FormValidator);
/**
 * @abstract
 * @private visible for testing
 */


exports.PolyfillDefaultValidator = PolyfillDefaultValidator;

var AbstractCustomValidator =
/*#__PURE__*/
function (_FormValidator3) {
  _inheritsLoose(AbstractCustomValidator, _FormValidator3);

  /**
   * Creates an instance of AbstractCustomValidator.
   * @param {!HTMLFormElement} form
   */
  function AbstractCustomValidator(form) {
    var _this3;

    _this3 = _FormValidator3.call(this, form) || this;
    /** @private {string} */

    _this3.uniqueFormId_ = _this3.form.id ? _this3.form.id : String(Date.now() + Math.floor(Math.random() * 100));
    /**
     * Counter used to create a unique id for every validation message
     * to be used with `aria-describedby`.
     * @private {number}
     */

    _this3.ariaDescCounter_ = 0;
    return _this3;
  }
  /**
   * @param {!Element} input
   */


  var _proto4 = AbstractCustomValidator.prototype;

  _proto4.reportInput = function reportInput(input) {
    var invalidType = getInvalidType(input);

    if (invalidType) {
      this.showValidationFor(input, invalidType);
    }
  }
  /**
   * @return {string} A unique ID.
   * @private
   */
  ;

  _proto4.createUniqueAriaDescId_ = function createUniqueAriaDescId_() {
    return "" + ARIA_DESC_ID_PREFIX + this.uniqueFormId_ + "-" + this.ariaDescCounter_++;
  }
  /**
   * Hides all validation messages.
   */
  ;

  _proto4.hideAllValidations = function hideAllValidations() {
    var inputs = this.inputs();

    for (var i = 0; i < inputs.length; i++) {
      this.hideValidationFor((0, _log.dev)().assertElement(inputs[i]));
    }
  }
  /**
   * @param {!Element} input
   * @param {string=} inputInvalidType
   * @return {?Element}
   */
  ;

  _proto4.getValidationFor = function getValidationFor(input, inputInvalidType) {
    if (inputInvalidType === void 0) {
      inputInvalidType = undefined;
    }

    if (!input.id) {
      return null;
    }

    var invalidType = this.getInvalidType_(input, inputInvalidType);
    var property = VALIDATION_CACHE_PREFIX + invalidType;

    if (!(property in input)) {
      var selector = "[visible-when-invalid=" + invalidType + "]" + ("[validation-for=" + input.id + "]");
      input[property] = this.root.querySelector(selector);
    }

    return input[property];
  }
  /**
   * Wraps the validity type for inputs to support pattern on <textarea>
   * @param {!Element} input
   * @param {string=} inputInvalidType
   * @return {*} TODO(#23582): Specify return type
   */
  ;

  _proto4.getInvalidType_ = function getInvalidType_(input, inputInvalidType) {
    if (inputInvalidType === void 0) {
      inputInvalidType = undefined;
    }

    var tagName = input.tagName,
        validationMessage = input.validationMessage; // <textarea> only supports `pattern` and `valueMissing`.
    // `pattern` is implemented via setCustomValidity(),
    // which results in the 'customError' validity state.

    if (tagName === 'TEXTAREA' && inputInvalidType === 'customError' && validationMessage === CUSTOM_PATTERN_ERROR) {
      return 'patternMismatch';
    }

    return inputInvalidType;
  }
  /**
   * @param {!Element} input
   * @param {string} invalidType
   */
  ;

  _proto4.showValidationFor = function showValidationFor(input, invalidType) {
    var validation = this.getValidationFor(input, invalidType);

    if (!validation) {
      return;
    }

    if (!validation.textContent.trim()) {
      validation.textContent = input.validationMessage;
    }

    input[VISIBLE_VALIDATION_CACHE] = validation;
    var validationId = validation.getAttribute('id');

    if (!validationId) {
      validationId = this.createUniqueAriaDescId_();
      validation.setAttribute('id', validationId);
    }

    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', validationId);
    this.resources.mutateElement(validation, function () {
      return validation.classList.add('visible');
    });
  }
  /**
   * @param {!Element} input
   */
  ;

  _proto4.hideValidationFor = function hideValidationFor(input) {
    var visibleValidation = this.getVisibleValidationFor(input);

    if (!visibleValidation) {
      return;
    }

    delete input[VISIBLE_VALIDATION_CACHE];
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    this.resources.mutateElement(visibleValidation, function () {
      return visibleValidation.classList.remove('visible');
    });
  }
  /**
   * @param {!Element} input
   * @return {?Element}
   */
  ;

  _proto4.getVisibleValidationFor = function getVisibleValidationFor(input) {
    return input[VISIBLE_VALIDATION_CACHE];
  }
  /**
   * Whether an input should validate after an interaction.
   * @param {!Element} unusedInput
   * @return {boolean}
   */
  ;

  _proto4.shouldValidateOnInteraction = function shouldValidateOnInteraction(unusedInput) {
    throw Error('Not Implemented');
  }
  /**
   * @param {!Event} event
   */
  ;

  _proto4.onInteraction = function onInteraction(event) {
    var input = (0, _log.dev)().assertElement(event.target);
    var shouldValidate = !!input.checkValidity && this.shouldValidateOnInteraction(input);
    this.hideValidationFor(input);

    if (shouldValidate && !this.checkInputValidity(input)) {
      this.reportInput(input);
    }
  }
  /** @override */
  ;

  _proto4.onBlur = function onBlur(event) {
    this.onInteraction(event);
  }
  /** @override */
  ;

  _proto4.onInput = function onInput(event) {
    this.onInteraction(event);
  };

  return AbstractCustomValidator;
}(FormValidator);
/** @private visible for testing */


exports.AbstractCustomValidator = AbstractCustomValidator;

var ShowFirstOnSubmitValidator =
/*#__PURE__*/
function (_AbstractCustomValida) {
  _inheritsLoose(ShowFirstOnSubmitValidator, _AbstractCustomValida);

  function ShowFirstOnSubmitValidator() {
    return _AbstractCustomValida.apply(this, arguments) || this;
  }

  var _proto5 = ShowFirstOnSubmitValidator.prototype;

  /** @override */
  _proto5.report = function report() {
    this.hideAllValidations();
    var inputs = this.inputs();

    for (var i = 0; i < inputs.length; i++) {
      if (!this.checkInputValidity(inputs[i])) {
        this.reportInput(inputs[i]);
        inputs[i].
        /*REVIEW*/
        focus();
        break;
      }
    }

    this.fireValidityEventIfNecessary();
  }
  /** @override */
  ;

  _proto5.shouldValidateOnInteraction = function shouldValidateOnInteraction(input) {
    return !!this.getVisibleValidationFor(input);
  };

  return ShowFirstOnSubmitValidator;
}(AbstractCustomValidator);
/** @private visible for testing */


exports.ShowFirstOnSubmitValidator = ShowFirstOnSubmitValidator;

var ShowAllOnSubmitValidator =
/*#__PURE__*/
function (_AbstractCustomValida2) {
  _inheritsLoose(ShowAllOnSubmitValidator, _AbstractCustomValida2);

  function ShowAllOnSubmitValidator() {
    return _AbstractCustomValida2.apply(this, arguments) || this;
  }

  var _proto6 = ShowAllOnSubmitValidator.prototype;

  /** @override */
  _proto6.report = function report() {
    this.hideAllValidations();
    var firstInvalidInput = null;
    var inputs = this.inputs();

    for (var i = 0; i < inputs.length; i++) {
      if (!this.checkInputValidity(inputs[i])) {
        firstInvalidInput = firstInvalidInput || inputs[i];
        this.reportInput(inputs[i]);
      }
    }

    if (firstInvalidInput) {
      firstInvalidInput.
      /*REVIEW*/
      focus();
    }

    this.fireValidityEventIfNecessary();
  }
  /** @override */
  ;

  _proto6.shouldValidateOnInteraction = function shouldValidateOnInteraction(input) {
    return !!this.getVisibleValidationFor(input);
  };

  return ShowAllOnSubmitValidator;
}(AbstractCustomValidator);
/** @private visible for testing */


exports.ShowAllOnSubmitValidator = ShowAllOnSubmitValidator;

var AsYouGoValidator =
/*#__PURE__*/
function (_AbstractCustomValida3) {
  _inheritsLoose(AsYouGoValidator, _AbstractCustomValida3);

  function AsYouGoValidator() {
    return _AbstractCustomValida3.apply(this, arguments) || this;
  }

  var _proto7 = AsYouGoValidator.prototype;

  /** @override */
  _proto7.shouldValidateOnInteraction = function shouldValidateOnInteraction(unusedInput) {
    return true;
  }
  /** @override */
  ;

  _proto7.onInteraction = function onInteraction(event) {
    _AbstractCustomValida3.prototype.onInteraction.call(this, event);

    this.fireValidityEventIfNecessary();
  };

  return AsYouGoValidator;
}(AbstractCustomValidator);
/** @private visible for testing */


exports.AsYouGoValidator = AsYouGoValidator;

var InteractAndSubmitValidator =
/*#__PURE__*/
function (_ShowAllOnSubmitValid) {
  _inheritsLoose(InteractAndSubmitValidator, _ShowAllOnSubmitValid);

  function InteractAndSubmitValidator() {
    return _ShowAllOnSubmitValid.apply(this, arguments) || this;
  }

  var _proto8 = InteractAndSubmitValidator.prototype;

  /** @override */
  _proto8.shouldValidateOnInteraction = function shouldValidateOnInteraction(unusedInput) {
    return true;
  }
  /** @override */
  ;

  _proto8.onInteraction = function onInteraction(event) {
    _ShowAllOnSubmitValid.prototype.onInteraction.call(this, event);

    this.fireValidityEventIfNecessary();
  };

  return InteractAndSubmitValidator;
}(ShowAllOnSubmitValidator);
/**
 * Returns the form validator instance.
 *
 * @param {!HTMLFormElement} form
 * @return {!FormValidator}
 */


exports.InteractAndSubmitValidator = InteractAndSubmitValidator;

function getFormValidator(form) {
  var customValidation = form.getAttribute('custom-validation-reporting');

  switch (customValidation) {
    case CustomValidationTypes.AsYouGo:
      return new AsYouGoValidator(form);

    case CustomValidationTypes.ShowAllOnSubmit:
      return new ShowAllOnSubmitValidator(form);

    case CustomValidationTypes.InteractAndSubmit:
      return new InteractAndSubmitValidator(form);

    case CustomValidationTypes.ShowFirstOnSubmit:
      return new ShowFirstOnSubmitValidator(form);
  }

  if (isReportValiditySupported(form.ownerDocument)) {
    return new DefaultValidator(form);
  }

  return new PolyfillDefaultValidator(form);
}
/**
 * Returns whether reportValidity API is supported.
 * @param {?Document} doc
 * @return {boolean}
 */


function isReportValiditySupported(doc) {
  if (doc && reportValiditySupported === undefined) {
    reportValiditySupported = !!document.createElement('form').reportValidity;
  }

  return !!reportValiditySupported;
}
/**
 * Returns whether reportValidity API is supported.
 * @param {!Document} doc
 * @return {boolean}
 */


function isCheckValiditySupported(doc) {
  if (checkValiditySupported === undefined) {
    checkValiditySupported = !!doc.createElement('input').checkValidity;
  }

  return checkValiditySupported;
}
/**
 * Returns invalid error type on the input.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
 * @param {!Element} input
 * @return {?string}
 */


function getInvalidType(input) {
  // 'badInput' takes precedence over others.
  var validityTypes = ['badInput'];

  for (var invalidType in input.validity) {
    // add other types after
    if (!validityTypes.includes(invalidType)) {
      validityTypes.push(invalidType);
    }
  } // Finding error type with value true


  var response = validityTypes.filter(function (type) {
    return input.validity[type] === true;
  });
  return response.length ? response[0] : null;
}

},{"../../../src/dom":18,"../../../src/event-helper":21,"../../../src/log":26,"../../../src/services":32,"../../../src/types":37,"./form-events":5,"./validation-bubble":10}],9:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getFormVerifier = getFormVerifier;
exports.AsyncVerifier = exports.DefaultVerifier = exports.FormVerifier = exports.FORM_VERIFY_OPTOUT = exports.FORM_VERIFY_PARAM = void 0;

var _promise = require("../../../src/utils/promise");

var _form = require("../../../src/form");

var _dom = require("../../../src/dom");

var _log = require("../../../src/log");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var FORM_VERIFY_PARAM = '__amp_form_verify';
exports.FORM_VERIFY_PARAM = FORM_VERIFY_PARAM;
var FORM_VERIFY_OPTOUT = 'no-verify';
/**
 * @typedef {{
 *    name:string,
 *    message:string
 *  }}
 */

exports.FORM_VERIFY_OPTOUT = FORM_VERIFY_OPTOUT;
var VerificationErrorDef;
/**
 * @typedef {{
 *   updatedElements:!Array<!Element>,
 *   errors:!Array<!VerificationErrorDef>
 * }}
 */

var UpdatedErrorsDef;
/**
 * Construct the correct form verifier based on whether
 * a config block is present.
 * @param {!HTMLFormElement} form
 * @param {function():Promise<!Response>} xhr
 * @return {!FormVerifier}
 */

function getFormVerifier(form, xhr) {
  if (form.hasAttribute('verify-xhr')) {
    return new AsyncVerifier(form, xhr);
  } else {
    return new DefaultVerifier(form);
  }
}
/**
 * An interface for a form verifier. Implementations could check for duplicate
 * usernames on a remote server, check against an in-memory cache to verify
 * data in ways not possible with standard form validation, or check
 * values against sets of data too large to fit in browser memory
 * e.g. ensuring zip codes match with cities.
 * @visibleForTesting
 * @abstract
 */


var FormVerifier =
/*#__PURE__*/
function () {
  /**
   * @param {!HTMLFormElement} form
   */
  function FormVerifier(form) {
    /** @protected @const */
    this.form_ = form;
  }
  /**
   * Called when the user has fully set a value to be verified,
   * e.g. the input's 'change' event
   * @return {!Promise<!UpdatedErrorsDef>}
   */


  var _proto = FormVerifier.prototype;

  _proto.onCommit = function onCommit() {
    this.clearVerificationErrors_();

    if (this.isDirty_()) {
      return this.verify_();
    } else {
      return Promise.resolve(
      /** @type {UpdatedErrorsDef} */
      {
        updatedElements: [],
        errors: []
      });
    }
  }
  /**
   * Sends the verify request if any group is ready to verify.
   * @return {!Promise<!UpdatedErrorsDef>} The list of elements whose state
   *    must change
   * @protected
   */
  ;

  _proto.verify_ = function verify_() {
    return Promise.resolve(
    /** @type {UpdatedErrorsDef} */
    {
      updatedElements: [],
      errors: []
    });
  }
  /**
   * Checks if the form has been changed from its initial state.
   * @return {boolean}
   * @private
   */
  ;

  _proto.isDirty_ = function isDirty_() {
    var elements = this.form_.elements;

    for (var i = 0; i < elements.length; i++) {
      var field = elements[i];

      if (field.disabled) {
        continue;
      }

      if (!(0, _form.isFieldDefault)(field)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Removes all custom verification errors from the elements.
   * @private
   */
  ;

  _proto.clearVerificationErrors_ = function clearVerificationErrors_() {
    var elements = this.form_.elements;

    if (elements) {
      (0, _dom.iterateCursor)(elements, function (e) {
        e.setCustomValidity('');
      });
    }
  };

  return FormVerifier;
}();
/**
 * A no-op verifier.
 * @visibleForTesting
 */


exports.FormVerifier = FormVerifier;

var DefaultVerifier =
/*#__PURE__*/
function (_FormVerifier) {
  _inheritsLoose(DefaultVerifier, _FormVerifier);

  function DefaultVerifier() {
    return _FormVerifier.apply(this, arguments) || this;
  }

  return DefaultVerifier;
}(FormVerifier);
/**
 * A verifier that verifies values via an XHR
 * @visibleForTesting
 */


exports.DefaultVerifier = DefaultVerifier;

var AsyncVerifier =
/*#__PURE__*/
function (_FormVerifier2) {
  _inheritsLoose(AsyncVerifier, _FormVerifier2);

  /**
   * @param {!HTMLFormElement} form
   * @param {function():Promise<!Response>} xhr
   */
  function AsyncVerifier(form, xhr) {
    var _this;

    _this = _FormVerifier2.call(this, form) || this;
    /** @protected @const*/

    _this.doXhr_ = xhr;
    /** @protected {?LastAddedResolver} */

    _this.xhrResolver_ = null;
    /** @private {!Array<!VerificationErrorDef>} */

    _this.previousErrors_ = [];
    return _this;
  }
  /** @override */


  var _proto2 = AsyncVerifier.prototype;

  _proto2.verify_ = function verify_() {
    var _this2 = this;

    var xhrConsumeErrors = this.doXhr_().then(function () {
      return [];
    }, function (error) {
      return getResponseErrorData_(
      /** @type {!Error} */
      error);
    });
    return this.addToResolver_(xhrConsumeErrors).then(function (errors) {
      return _this2.applyErrors_(errors);
    });
  }
  /**
   * Prevent race conditions from XHRs that arrive out of order by resolving
   * only the most recently initiated XHR.
   * TODO(cvializ): Replace this when the Fetch API adds cancelable fetches.
   * @param {!Promise} promise
   * @return {!Promise} The resolver result promise
   */
  ;

  _proto2.addToResolver_ = function addToResolver_(promise) {
    var _this3 = this;

    if (!this.xhrResolver_) {
      this.xhrResolver_ = new _promise.LastAddedResolver();

      var cleanup = function cleanup() {
        return _this3.xhrResolver_ = null;
      };

      this.xhrResolver_.then(cleanup, cleanup);
    }

    return this.xhrResolver_.add(promise);
  }
  /**
   * Set errors on elements that failed verification, and clear any
   * verification state for elements that passed verification.
   * @param {!Array<!VerificationErrorDef>} errors
   * @return {!UpdatedErrorsDef} Updated elements e.g. elements with new errors,
   *    and elements that previously had errors but were fixed. The form will
   *    update their user-valid/user-invalid state.
   * @private
   */
  ;

  _proto2.applyErrors_ = function applyErrors_(errors) {
    var _this4 = this;

    var errorElements = [];
    var previousErrors = this.previousErrors_;
    this.previousErrors_ = errors; // Set the error message on each element that caused an error.

    for (var i = 0; i < errors.length; i++) {
      var error = errors[i];
      var name = (0, _log.user)().assertString(error.name, 'Verification errors must have a name property');
      var message = (0, _log.user)().assertString(error.message, 'Verification errors must have a message property'); // If multiple elements share the same name, the first should be selected.
      // This matches the behavior of HTML5 validation, e.g. with radio buttons.

      var element = (0, _log.user)().assertElement(this.form_.
      /*OK*/
      querySelector("[name=\"" + name + "\"]"), 'Verification error name property must match a field name'); // Only put verification errors on elements that are client-side valid.
      // This prevents errors from appearing on elements that have not been
      // filled out yet.

      if (element.checkValidity()) {
        element.setCustomValidity(message);
        errorElements.push(element);
      }
    } // Create a list of form elements that had an error, but are now fixed.


    var isFixed = function isFixed(previousError) {
      return errors.every(function (error) {
        return previousError.name !== error.name;
      });
    };

    var fixedElements = previousErrors.filter(isFixed).map(function (e) {
      return _this4.form_.
      /*OK*/
      querySelector("[name=\"" + e.name + "\"]");
    });
    return (
      /** @type {!UpdatedErrorsDef} */
      {
        updatedElements: errorElements.concat(fixedElements),
        errors: errors
      }
    );
  };

  return AsyncVerifier;
}(FormVerifier);
/**
 * @param {!Error} error
 * @return {!Promise<!Array<VerificationErrorDef>>}
 * @private
 */


exports.AsyncVerifier = AsyncVerifier;

function getResponseErrorData_(error) {
  var response = error.response;

  if (!response) {
    return Promise.resolve([]);
  }

  return response.json().then(function (json) {
    return json.verifyErrors || [];
  }, function () {
    return [];
  });
}

},{"../../../src/dom":18,"../../../src/form":24,"../../../src/log":26,"../../../src/utils/promise":45}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ValidationBubble = void 0;

var _services = require("../../../src/services");

var _dom = require("../../../src/dom");

var _style = require("../../../src/style");

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

/** @type {string} */
var OBJ_PROP = '__BUBBLE_OBJ';

var ValidationBubble =
/*#__PURE__*/
function () {
  /**
   * Creates a bubble component to display messages in.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {string} id
   */
  function ValidationBubble(ampdoc, id) {
    /** @private @const {string} */
    this.id_ = id;
    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */

    this.viewport_ = _services.Services.viewportForDoc(ampdoc);
    /** @private @const {!../../../src/service/vsync-impl.Vsync} */

    this.vsync_ = _services.Services.vsyncFor(ampdoc.win);
    /** @private {?Element} */

    this.currentTargetElement_ = null;
    /** @private {string} */

    this.currentMessage_ = '';
    /** @private {boolean} */

    this.isVisible_ = false;
    /** @private @const {!Element} */

    this.bubbleElement_ = ampdoc.win.document.createElement('div');
    (0, _style.toggle)(this.bubbleElement_, false);
    this.bubbleElement_.classList.add('i-amphtml-validation-bubble');
    this.bubbleElement_[OBJ_PROP] = this;
    ampdoc.getBody().appendChild(this.bubbleElement_);
  }
  /**
   * @param {!Element} element
   * @return {boolean}
   */


  var _proto = ValidationBubble.prototype;

  _proto.isActiveOn = function isActiveOn(element) {
    return this.isVisible_ && element == this.currentTargetElement_;
  }
  /**
   * Hides the bubble off screen.
   */
  ;

  _proto.hide = function hide() {
    if (!this.isVisible_) {
      return;
    }

    this.isVisible_ = false;
    this.currentTargetElement_ = null;
    this.currentMessage_ = '';
    this.vsync_.run({
      measure: undefined,
      mutate: hideBubble
    }, {
      bubbleElement: this.bubbleElement_
    });
  }
  /**
   * Shows the bubble targeted to an element with the passed message.
   * @param {!Element} targetElement
   * @param {string} message
   */
  ;

  _proto.show = function show(targetElement, message) {
    if (this.isActiveOn(targetElement) && message == this.currentMessage_) {
      return;
    }

    this.isVisible_ = true;
    this.currentTargetElement_ = targetElement;
    this.currentMessage_ = message;
    var state = {
      message: message,
      targetElement: targetElement,
      bubbleElement: this.bubbleElement_,
      viewport: this.viewport_,
      id: this.id_
    };
    this.vsync_.run({
      measure: measureTargetElement,
      mutate: showBubbleElement
    }, state);
  };

  return ValidationBubble;
}();
/**
 * Hides the bubble element passed through state object.
 * @param {!Object} state
 * @private
 */


exports.ValidationBubble = ValidationBubble;

function hideBubble(state) {
  state.bubbleElement.removeAttribute('aria-alert');
  state.bubbleElement.removeAttribute('role');
  (0, _dom.removeChildren)(state.bubbleElement);
  (0, _style.toggle)(state.bubbleElement, false);
}
/**
 * Measures the layout for the target element passed through state object.
 * @param {!Object} state
 * @private
 */


function measureTargetElement(state) {
  state.targetRect = state.viewport.getLayoutRect(state.targetElement);
}
/**
 * Updates text content, positions and displays the bubble.
 * @param {!Object} state
 * @private
 */


function showBubbleElement(state) {
  (0, _dom.removeChildren)(state.bubbleElement);
  var messageDiv = state.bubbleElement.ownerDocument.createElement('div');
  messageDiv.id = "bubble-message-" + state.id;
  messageDiv.textContent = state.message;
  state.bubbleElement.setAttribute('aria-labeledby', messageDiv.id);
  state.bubbleElement.setAttribute('role', 'alert');
  state.bubbleElement.setAttribute('aria-live', 'assertive');
  state.bubbleElement.appendChild(messageDiv);
  (0, _style.toggle)(state.bubbleElement, true);
  (0, _style.setStyles)(state.bubbleElement, {
    top: state.targetRect.top - 10 + "px",
    left: state.targetRect.left + state.targetRect.width / 2 + "px"
  });
}

},{"../../../src/dom":18,"../../../src/services":32,"../../../src/style":36}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./services":32}],14:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AsyncInputClasses = exports.AsyncInputAttributes = exports.AsyncInput = void 0;

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
 * Interface for all AMP Async Input Elements.
 * enforces the overridable function, getValue().
 * Async Input should be implemented
 * by components like AMP form, to async request
 * a value from a component, and then be used for
 * some other action. For examples, this can be used
 * by reCAPTCHA to request tokens for the form.
 *
 * NOTE: Elements that implemented AsyncInput must
 * Also add and follow the other exported constants.
 * See amp-recaptcha-input as an example.
 *
 * @interface
 */
var AsyncInput =
/*#__PURE__*/
function () {
  function AsyncInput() {}

  var _proto = AsyncInput.prototype;

  /**
   * Called to get the asynchronous value of an
   * AsyncInput field.
   * @return {!Promise<string>}
   */
  _proto.getValue = function getValue() {};

  return AsyncInput;
}();
/**
 * Attributes
 *
 * Components implementing the AsyncInput,
 * are expected to assert these attributes
 * at the appropriate time.
 *
 * @enum {string}
 */


exports.AsyncInput = AsyncInput;
var AsyncInputAttributes = {
  /**
   * data-name
   *
   * Required attribute that must be asserted by every async-input
   * Element. This is used by AMP form to add the key
   * for the form submission request
   */
  NAME: 'name'
};
/**
 * Classes
 *
 * Components implementing the AsyncInput,
 * are expected to add the following classes
 * at the appropriate time.
 *
 * @enum {string}
 */

exports.AsyncInputAttributes = AsyncInputAttributes;
var AsyncInputClasses = {
  /**
   * i-amphtml-async-input
   *
   * Required base class that must be added to the async-input
   * element on buildCallback or layoutCallback.
   * This will be used by other amp components to find
   * and use async-input elements.
   */
  'ASYNC_INPUT': 'i-amphtml-async-input',

  /**
   * i-async-require-action
   *
   * Class that is added when the async call should be treated
   * as a required action for the form. These calls will be
   * executed before the presubmit calls of all async inputs.
   */
  'ASYNC_REQUIRED_ACTION': 'i-async-require-action'
};
exports.AsyncInputClasses = AsyncInputClasses;

},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"../third_party/css-escape/css-escape":48,"./log":26}],18:[function(require,module,exports){
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

},{"./css":17,"./log":26,"./string":34,"./types":37,"./utils/object":44,"./utils/promise":45}],19:[function(require,module,exports){
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

},{"./dom":18,"./log":26,"./service":31,"./types":37}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{"./dom":18,"./event-helper-listen":20,"./log":26}],22:[function(require,module,exports){
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

},{"./log":26,"./mode":28,"./url":40,"./utils/object":44}],23:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.createFormDataWrapper = createFormDataWrapper;
exports.isFormDataWrapper = isFormDataWrapper;
exports.PolyfillFormDataWrapper = void 0;

var _services = require("./services");

var _form = require("./form");

var _dom = require("./dom");

var _object = require("./utils/object");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * Create a form data wrapper. The wrapper is necessary to provide a common
 * API for FormData objects on all browsers. For example, not all browsers
 * support the FormData#entries or FormData#delete functions.
 *
 * @param {!Window} win
 * @param {!HTMLFormElement=} opt_form
 * @return {!FormDataWrapperInterface}
 */
function createFormDataWrapper(win, opt_form) {
  var platform = _services.Services.platformFor(win);

  if (platform.isIos() && platform.getMajorVersion() == 11) {
    return new Ios11NativeFormDataWrapper(opt_form);
  } else if (FormData.prototype.entries && FormData.prototype.delete) {
    return new NativeFormDataWrapper(opt_form);
  } else {
    return new PolyfillFormDataWrapper(opt_form);
  }
}
/**
 * Check if the given object is a FormDataWrapper instance
 * @param {*} o
 * @return {boolean} True if the object is a FormDataWrapper instance.
 */


function isFormDataWrapper(o) {
  // instanceof doesn't work as expected, so we detect with duck-typing.
  return !!o && typeof o.getFormData == 'function';
}
/**
 * A polyfill wrapper for a `FormData` object.
 *
 * If there's no native `FormData#entries`, chances are there are no native
 * methods to read the content of the `FormData` after construction, so the
 * only way to implement `entries` in this class is to capture the fields in
 * the form passed to the constructor (and the arguments passed to the
 * `append` method).
 *
 * For more details on this, see http://mdn.io/FormData.
 *
 * @implements {FormDataWrapperInterface}
 * @visibleForTesting
 */


var PolyfillFormDataWrapper =
/*#__PURE__*/
function () {
  /** @override */
  function PolyfillFormDataWrapper(opt_form) {
    if (opt_form === void 0) {
      opt_form = undefined;
    }

    /** @private @const {!Object<string, !Array<string>>} */
    this.fieldValues_ = opt_form ? (0, _form.getFormAsObject)(opt_form) : (0, _object.map)();
  }
  /**
   * @param {string} name
   * @param {string|!File} value
   * @param {string=} opt_filename
   * @override
   */


  var _proto = PolyfillFormDataWrapper.prototype;

  _proto.append = function append(name, value, opt_filename) {
    // Coercion to string is required to match
    // the native FormData.append behavior
    var nameString = String(name);
    this.fieldValues_[nameString] = this.fieldValues_[nameString] || [];
    this.fieldValues_[nameString].push(String(value));
  }
  /** @override */
  ;

  _proto.delete = function _delete(name) {
    delete this.fieldValues_[name];
  }
  /** @override */
  ;

  _proto.entries = function entries() {
    var _this = this;

    var fieldEntries = [];
    Object.keys(this.fieldValues_).forEach(function (name) {
      var values = _this.fieldValues_[name];
      values.forEach(function (value) {
        return fieldEntries.push([name, value]);
      });
    }); // Generator functions are not supported by the current Babel configuration,
    // so we must manually implement the iterator interface.

    var nextIndex = 0;
    return (
      /** @type {!Iterator<!Array<string>>} */
      {
        next: function next() {
          return nextIndex < fieldEntries.length ? {
            value: fieldEntries[nextIndex++],
            done: false
          } : {
            value: undefined,
            done: true
          };
        }
      }
    );
  }
  /** @override */
  ;

  _proto.getFormData = function getFormData() {
    var _this2 = this;

    var formData = new FormData();
    Object.keys(this.fieldValues_).forEach(function (name) {
      var values = _this2.fieldValues_[name];
      values.forEach(function (value) {
        return formData.append(name, value);
      });
    });
    return formData;
  };

  return PolyfillFormDataWrapper;
}();
/**
 * Wrap the native `FormData` implementation.
 *
 * NOTE: This differs from the standard `FormData` constructor. This constructor
 * includes a submit button if it was used to submit the `opt_form`, where
 * the native `FormData` constructor does not include the submit button used to
 * submit the form.
 * {@link https://xhr.spec.whatwg.org/#dom-formdata}
 * @implements {FormDataWrapperInterface}
 */


exports.PolyfillFormDataWrapper = PolyfillFormDataWrapper;

var NativeFormDataWrapper =
/*#__PURE__*/
function () {
  /** @override */
  function NativeFormDataWrapper(opt_form) {
    /** @private @const {!FormData} */
    this.formData_ = new FormData(opt_form);
    this.maybeIncludeSubmitButton_(opt_form);
  }
  /**
   * If a submit button is focused (because it was used to submit the form),
   * or was the first submit button present, add its name and value to the
   * `FormData`, since publishers expect the submit button to be present.
   * @param {!HTMLFormElement=} opt_form
   * @private
   */


  var _proto2 = NativeFormDataWrapper.prototype;

  _proto2.maybeIncludeSubmitButton_ = function maybeIncludeSubmitButton_(opt_form) {
    // If a form is not passed to the constructor,
    // we are not in a submitting code path.
    if (!opt_form) {
      return;
    }

    var button = (0, _form.getSubmitButtonUsed)(opt_form);

    if (button && button.name) {
      this.append(button.name, button.value);
    }
  }
  /**
   * @param {string} name
   * @param {string|!File} value
   * @param {string=} opt_filename
   * @override
   */
  ;

  _proto2.append = function append(name, value, opt_filename) {
    this.formData_.append(name, value);
  }
  /** @override */
  ;

  _proto2.delete = function _delete(name) {
    this.formData_.delete(name);
  }
  /** @override */
  ;

  _proto2.entries = function entries() {
    return this.formData_.entries();
  }
  /** @override */
  ;

  _proto2.getFormData = function getFormData() {
    return this.formData_;
  };

  return NativeFormDataWrapper;
}();
/**
 * iOS 11 has a bug when submitting empty file inputs.
 * This works around the bug by replacing the empty files with Blob objects.
 */


var Ios11NativeFormDataWrapper =
/*#__PURE__*/
function (_NativeFormDataWrappe) {
  _inheritsLoose(Ios11NativeFormDataWrapper, _NativeFormDataWrappe);

  /** @override */
  function Ios11NativeFormDataWrapper(opt_form) {
    var _this3;

    _this3 = _NativeFormDataWrappe.call(this, opt_form) || this;

    if (opt_form) {
      (0, _dom.iterateCursor)(opt_form.elements, function (input) {
        if (input.type == 'file' && input.files.length == 0) {
          _this3.formData_.delete(input.name);

          _this3.formData_.append(input.name, new Blob([]), '');
        }
      });
    }

    return _this3;
  }
  /**
   * @param {string} name
   * @param {string|!File} value
   * @param {string=} opt_filename
   * @override
   */


  var _proto3 = Ios11NativeFormDataWrapper.prototype;

  _proto3.append = function append(name, value, opt_filename) {
    // Safari 11 breaks on submitting empty File values.
    if (value && typeof value == 'object' && isEmptyFile(value)) {
      this.formData_.append(name, new Blob([]), opt_filename || '');
    } else {
      this.formData_.append(name, value);
    }
  };

  return Ios11NativeFormDataWrapper;
}(NativeFormDataWrapper);
/**
 * A wrapper for a native `FormData` object that allows the retrieval of entries
 * in the form data after construction even on browsers that don't natively
 * support `FormData.prototype.entries`.
 *
 * @interface
 * Subclassing `FormData` doesn't work in this case as the transpiler
 *     generates code that calls the super constructor directly using
 *     `Function.prototype.call`. WebKit (Safari) doesn't allow this and
 *     enforces that constructors be called with the `new` operator.
 */


var FormDataWrapperInterface =
/*#__PURE__*/
function () {
  /**
   * Creates a new wrapper for a `FormData` object.
   *
   * If there's no native `FormData#entries`, chances are there are no native
   * methods to read the content of the `FormData` after construction, so the
   * only way to implement `entries` in this class is to capture the fields in
   * the form passed to the constructor (and the arguments passed to the
   * `append` method).
   *
   * This constructor should also add the submitter element as defined in the
   * HTML spec for Form Submission Algorithm, but is not defined by the standard
   * when using the `FormData` constructor directly.
   *
   * For more details on this, see http://mdn.io/FormData.
   *
   * @param {!HTMLFormElement=} opt_form An HTML `<form>` element — when
   *     specified, the `FormData` object will be populated with the form's
   *     current keys/values using the name property of each element for the
   *     keys and their submitted value for the values. It will also encode file
   *     input content.
   */
  function FormDataWrapperInterface(opt_form) {}
  /**
   * Appends a new value onto an existing key inside a `FormData` object, or
   * adds the key if it does not already exist.
   *
   * Appending a `File` object is not yet supported and the `filename`
   * parameter is ignored for this wrapper.
   *
   * For more details on this, see http://mdn.io/FormData/append.
   *
   * TODO(cvializ): Update file support
   *
   * @param {string} unusedName The name of the field whose data is contained in
   *     `value`.
   * @param {string|!File} unusedValue The field's value.
   * @param {string=} opt_filename The filename to use if the value is a file.
   */


  var _proto4 = FormDataWrapperInterface.prototype;

  _proto4.append = function append(unusedName, unusedValue, opt_filename) {}
  /**
   * Remove the given value from the FormData.
   *
   * For more details on this, see http://mdn.io/FormData/delete.
   *
   * @param {string} unusedName The name of the field to remove from the FormData.
   */
  ;

  _proto4.delete = function _delete(unusedName) {}
  /**
   * Returns an iterator of all key/value pairs contained in this object.
   *
   * For more details on this, see http://mdn.io/FormData/entries.
   *
   * @return {!Iterator<!Array<string|!File>>}
   */
  ;

  _proto4.entries = function entries() {}
  /**
   * Returns the wrapped native `FormData` object.
   *
   * @return {!FormData}
   */
  ;

  _proto4.getFormData = function getFormData() {};

  return FormDataWrapperInterface;
}();
/**
 * Check if the given file is an empty file, which is the result of submitting
 * an empty `<input type="file">`. These cause errors when submitting forms
 * in Safari 11.
 *
 * @param {!File} file
 * @return {boolean}
 */


function isEmptyFile(file) {
  return file.name == '' && file.size == 0;
}

},{"./dom":18,"./form":24,"./services":32,"./utils/object":44}],24:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.formOrNullForElement = formOrNullForElement;
exports.setFormForElement = setFormForElement;
exports.getFormAsObject = getFormAsObject;
exports.getSubmitButtonUsed = getSubmitButtonUsed;
exports.isDisabled = isDisabled;
exports.isFieldDefault = isFieldDefault;
exports.isFieldEmpty = isFieldEmpty;

var _dom = require("./dom");

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

/** @const {string} */
var FORM_PROP_ = '__AMP_FORM';
/**
 * @param {!Element} element
 * @return {../extensions/amp-form/0.1/amp-form.AmpForm}
 */

function formOrNullForElement(element) {
  return element[FORM_PROP_] || null;
}
/**
 * @param {!Element} element
 * @param {!../extensions/amp-form/0.1/amp-form.AmpForm} form
 */


function setFormForElement(element, form) {
  element[FORM_PROP_] = form;
}
/**
 * Returns form data in the passed-in form as an object.
 * Includes focused submit buttons.
 * @param {!HTMLFormElement} form
 * @return {!JsonObject}
 */


function getFormAsObject(form) {
  var elements = form.elements;
  var data =
  /** @type {!JsonObject} */
  {}; // <button> is handled separately

  var submittableTagsRegex = /^(?:input|select|textarea)$/i; // type=submit is handled separately

  var unsubmittableTypesRegex = /^(?:submit|button|image|file|reset)$/i;
  var checkableType = /^(?:checkbox|radio)$/i;

  var _loop = function _loop(i) {
    var input = elements[i];
    var checked = input.checked,
        name = input.name,
        multiple = input.multiple,
        options = input.options,
        tagName = input.tagName,
        type = input.type,
        value = input.value;

    if (!name || isDisabled(input) || !submittableTagsRegex.test(tagName) || unsubmittableTypesRegex.test(type) || checkableType.test(type) && !checked) {
      return "continue";
    }

    if (data[name] === undefined) {
      data[name] = [];
    }

    if (multiple) {
      (0, _dom.iterateCursor)(options, function (option) {
        if (option.selected) {
          data[name].push(option.value);
        }
      });
      return "continue";
    }

    data[name].push(value);
  };

  for (var i = 0; i < elements.length; i++) {
    var _ret = _loop(i);

    if (_ret === "continue") continue;
  }

  var submitButton = getSubmitButtonUsed(form);

  if (submitButton && submitButton.name) {
    var name = submitButton.name;

    if (data[name] === undefined) {
      data[name] = [];
    }

    data[submitButton.name].push(submitButton.value);
  } // Wait until the end to remove the empty values, since
  // we don't know when evaluating any one input whether
  // there will be or have already been inputs with the same names.
  // e.g. We want to remove empty <select multiple name=x> but
  // there could also be an <input name=x>. At the end we know if an empty name
  // can be deleted.


  Object.keys(data).forEach(function (key) {
    if (data[key].length == 0) {
      delete data[key];
    }
  });
  return data;
}
/**
 * Gets the submit button used to submit the form.
 * This searches through the form elements to find:
 * 1. The first submit button element OR
 * 2. a focused submit button, indicating it was specifically used to submit.
 * 3. null, if neither of the above is found.
 * @param {!HTMLFormElement} form
 * @return {?Element}
 */


function getSubmitButtonUsed(form) {
  var elements = form.elements;
  var length = elements.length;
  var activeElement = form.ownerDocument.activeElement;
  var firstSubmitButton = null;

  for (var i = 0; i < length; i++) {
    var element = elements[i];

    if (!isSubmitButton(element)) {
      continue;
    }

    if (!firstSubmitButton) {
      firstSubmitButton = element;
    }

    if (activeElement == element) {
      return activeElement;
    }
  }

  return firstSubmitButton;
}
/**
 * True if the given button can submit a form.
 * @param {!Element} element
 * @return {boolean}
 */


function isSubmitButton(element) {
  var tagName = element.tagName,
      type = element.type;
  return tagName == 'BUTTON' || type == 'submit';
}
/**
 * Checks if a field is disabled.
 * @param {!Element} element
 * @return {boolean}
 */


function isDisabled(element) {
  if (element.disabled) {
    return true;
  }

  var ancestors = (0, _dom.ancestorElementsByTag)(element, 'fieldset');

  for (var i = 0; i < ancestors.length; i++) {
    if (ancestors[i].disabled) {
      return true;
    }
  }

  return false;
}
/**
 * Checks if a form field is in its default state.
 * @param {!Element} field
 * @return {boolean}
 */


function isFieldDefault(field) {
  switch (field.type) {
    case 'select-multiple':
    case 'select-one':
      var options = field.options;

      for (var j = 0; j < options.length; j++) {
        if (options[j].selected !== options[j].defaultSelected) {
          return false;
        }
      }

      break;

    case 'checkbox':
    case 'radio':
      return field.checked === field.defaultChecked;

    default:
      return field.value === field.defaultValue;
  }

  return true;
}
/**
 * Checks if a form field is empty. It expects a form field element,
 * i.e. `<input>`, `<textarea>`, or `<select>`.
 * @param {!Element} field
 * @throws {Error}
 * @return {boolean}
 */


function isFieldEmpty(field) {
  switch (field.tagName) {
    case 'INPUT':
      if (field.type == 'checkbox' || field.type == 'radio') {
        return !field.checked;
      } else {
        return !field.value;
      }

    case 'TEXTAREA':
      return !field.value;

    case 'SELECT':
      // dropdown menu has at least one option always selected
      return false;

    default:
      throw new Error("isFieldEmpty: " + field.tagName + " is not a supported field element.");
  }
}

},{"./dom":18}],25:[function(require,module,exports){
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
  return '1910040511210';
}

},{}],26:[function(require,module,exports){
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

},{"./config":16,"./internal-version":25,"./mode":28,"./mode-object":27,"./types":37,"./utils/function":42}],27:[function(require,module,exports){
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

},{"./mode":28}],28:[function(require,module,exports){
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

},{"./internal-version":25,"./url-parse-query-string":38}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"./log":26,"./service":31,"./services":32}],31:[function(require,module,exports){
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

},{"./experiments":22,"./log":26,"./types":37,"./utils/promise":45}],32:[function(require,module,exports){
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

},{"./element-service":19,"./service":31}],33:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.SsrTemplateHelper = exports.SsrTemplateDef = void 0;

var _object = require("./utils/object");

var _types = require("./types");

var _xhrUtils = require("./utils/xhr-utils");

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
 * @typedef {{
 *   successTemplate: ?(Element|JsonObject|undefined),
 *   errorTemplate: ?(Element|JsonObject|undefined)
 * }}
 */
var SsrTemplateDef;
/**
 * Helper, that manages the proxying of template rendering to the viewer.
 */

exports.SsrTemplateDef = SsrTemplateDef;

var SsrTemplateHelper =
/*#__PURE__*/
function () {
  /**
   * @param {string} sourceComponent
   * @param {!./service/viewer-interface.ViewerInterface} viewer
   * @param {!./service/template-impl.Templates} templates
   */
  function SsrTemplateHelper(sourceComponent, viewer, templates) {
    /** @private @const */
    this.viewer_ = viewer;
    /** @private @const */

    this.templates_ = templates;
    /** @private @const */

    this.sourceComponent_ = sourceComponent;
  }
  /**
   * Whether the viewer can render templates. A doc-level opt in as
   * trusted viewers must set this capability explicitly, as a security
   * measure for potential abuse of feature.
   * @return {boolean}
   */


  var _proto = SsrTemplateHelper.prototype;

  _proto.isSupported = function isSupported() {
    var ampdoc = this.viewer_.getAmpDoc();

    if (ampdoc.isSingleDoc()) {
      var htmlElement = ampdoc.getRootNode().documentElement;

      if (htmlElement.hasAttribute('allow-viewer-render-template')) {
        return this.viewer_.hasCapability('viewerRenderTemplate');
      }
    }

    return false;
  }
  /**
   * Proxies xhr and template rendering to the viewer and renders the response.
   * @param {!Element} element
   * @param {!FetchRequestDef} request The fetch/XHR related data.
   * @param {?SsrTemplateDef=} opt_templates Response templates to pass into
   *     the payload. If provided, finding the template in the passed in
   *     element is not attempted.
   * @param {!Object=} opt_attributes Additional JSON to send to viewer.
   * @return {!Promise<?JsonObject|string|undefined>}
   */
  ;

  _proto.fetchAndRenderTemplate = function fetchAndRenderTemplate(element, request, opt_templates, opt_attributes) {
    if (opt_templates === void 0) {
      opt_templates = null;
    }

    if (opt_attributes === void 0) {
      opt_attributes = {};
    }

    var mustacheTemplate;

    if (!opt_templates) {
      mustacheTemplate = this.templates_.maybeFindTemplate(element);
    }

    return this.viewer_.sendMessageAwaitResponse('viewerRenderTemplate', this.buildPayload_(request, mustacheTemplate, opt_templates, opt_attributes));
  }
  /**
   * @param {!Element} element
   * @param {(?JsonObject|string|undefined|!Array)} data
   * @return {!Promise}
   */
  ;

  _proto.renderTemplate = function renderTemplate(element, data) {
    var renderTemplatePromise;

    if (this.isSupported()) {
      (0, _log.userAssert)(typeof data['html'] === 'string', 'Server side html response must be defined');
      renderTemplatePromise = this.templates_.findAndSetHtmlForTemplate(element,
      /** @type {string} */
      data['html']);
    } else if ((0, _types.isArray)(data)) {
      renderTemplatePromise = this.templates_.findAndRenderTemplateArray(element,
      /** @type {!Array} */
      data);
    } else {
      renderTemplatePromise = this.templates_.findAndRenderTemplate(element,
      /** @type {!JsonObject} */
      data);
    }

    return renderTemplatePromise;
  }
  /**
   * @param {!FetchRequestDef} request
   * @param {?Element|undefined} mustacheTemplate
   * @param {?SsrTemplateDef=} opt_templates
   * @param {!Object=} opt_attributes
   * @return {!JsonObject}
   * @private
   */
  ;

  _proto.buildPayload_ = function buildPayload_(request, mustacheTemplate, opt_templates, opt_attributes) {
    if (opt_attributes === void 0) {
      opt_attributes = {};
    }

    var ampComponent = (0, _object.dict)({
      'type': this.sourceComponent_
    });
    var successTemplateKey = 'successTemplate';
    var successTemplate = opt_templates && opt_templates[successTemplateKey] ? opt_templates[successTemplateKey] : mustacheTemplate;

    if (successTemplate) {
      ampComponent[successTemplateKey] = {
        'type': 'amp-mustache',
        'payload': successTemplate.
        /*REVIEW*/
        innerHTML
      };
    }

    var errorTemplateKey = 'errorTemplate';
    var errorTemplate = opt_templates && opt_templates[errorTemplateKey] ? opt_templates[errorTemplateKey] : null;

    if (errorTemplate) {
      ampComponent[errorTemplateKey] = {
        'type': 'amp-mustache',
        'payload': errorTemplate.
        /*REVIEW*/
        innerHTML
      };
    }

    if (opt_attributes) {
      Object.assign(ampComponent, opt_attributes);
    }

    var data = (0, _object.dict)({
      'originalRequest': (0, _xhrUtils.toStructuredCloneable)(request.xhrUrl, request.fetchOpt),
      'ampComponent': ampComponent
    });
    return data;
  };

  return SsrTemplateHelper;
}();

exports.SsrTemplateHelper = SsrTemplateHelper;

},{"./log":26,"./types":37,"./utils/object":44,"./utils/xhr-utils":47}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"./common-signals":15,"./dom":18,"./log":26,"./render-delaying-services":30,"./service":31,"./services":32,"./style":36,"./utils/object":44}],36:[function(require,module,exports){
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

},{"./log":26,"./string":34,"./utils/object.js":44}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{"./url-try-decode-uri-component":39}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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

},{"./config":16,"./log":26,"./mode":28,"./string":34,"./types":37,"./url-parse-query-string":38,"./url-try-decode-uri-component":39,"./utils/lru-cache":43,"./utils/object":44}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
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

},{"../log":26}],44:[function(require,module,exports){
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

},{"../types":37}],45:[function(require,module,exports){
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

},{}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.toStructuredCloneable = toStructuredCloneable;
exports.fromStructuredCloneable = fromStructuredCloneable;
exports.getViewerInterceptResponse = getViewerInterceptResponse;
exports.setupInput = setupInput;
exports.setupInit = setupInit;
exports.setupAMPCors = setupAMPCors;
exports.setupJsonFetchInit = setupJsonFetchInit;
exports.assertSuccess = assertSuccess;
exports.getViewerAuthTokenIfAvailable = getViewerAuthTokenIfAvailable;

var _services = require("../services");

var _log = require("../log");

var _object = require("./object");

var _array = require("./array");

var _url = require("../url");

var _mode = require("../mode");

var _types = require("../types");

var _experiments = require("../experiments");

var _formDataWrapper = require("../form-data-wrapper");

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

/** @private @const {!Array<string>} */
var allowedMethods_ = ['GET', 'POST'];
/** @private @const {!Array<function(*):boolean>} */

var allowedJsonBodyTypes_ = [_types.isArray, _types.isObject];
/**
 * Serializes a fetch request so that it can be passed to `postMessage()`,
 * i.e., can be cloned using the
 * [structured clone algorithm](http://mdn.io/Structured_clone_algorithm).
 *
 * The request is serialized in the following way:
 *
 * 1. If the `init.body` is a `FormData`, set content-type header to
 * `multipart/form-data` and transform `init.body` into an
 * `!Array<!Array<string>>` holding the list of form entries, where each
 * element in the array is a form entry (key-value pair) represented as a
 * 2-element array.
 *
 * 2. Return a new object having properties `input` and the transformed
 * `init`.
 *
 * The serialized request is assumed to be de-serialized in the following way:
 *
 * 1.If content-type header starts with `multipart/form-data`
 * (case-insensitive), transform the entry array in `init.body` into a
 * `FormData` object.
 *
 * 2. Pass `input` and transformed `init` to `fetch` (or the constructor of
 * `Request`).
 *
 * Currently only `FormData` used in `init.body` is handled as it's the only
 * type being used in AMP runtime that needs serialization. The `Headers` type
 * also needs serialization, but callers should not be passing `Headers`
 * object in `init`, as that fails `fetchPolyfill` on browsers that don't
 * support fetch. Some serialization-needing types for `init.body` such as
 * `ArrayBuffer` and `Blob` are already supported by the structured clone
 * algorithm. Other serialization-needing types such as `URLSearchParams`
 * (which is not supported in IE and Safari) and `FederatedCredentials` are
 * not used in AMP runtime.
 *
 * @param {string} input The URL of the XHR to convert to structured
 *     cloneable.
 * @param {!FetchInitDef} init The options of the XHR to convert to structured
 *     cloneable.
 * @return {{input: string, init: !FetchInitDef}} The serialized structurally-
 *     cloneable request.
 * @private
 */

function toStructuredCloneable(input, init) {
  var newInit = Object.assign({}, init);

  if ((0, _formDataWrapper.isFormDataWrapper)(init.body)) {
    var wrapper =
    /** @type {!FormDataWrapperInterface} */
    init.body;
    newInit.headers['Content-Type'] = 'multipart/form-data;charset=utf-8';
    newInit.body = (0, _array.fromIterator)(wrapper.entries());
  }

  return {
    input: input,
    init: newInit
  };
}
/**
 * De-serializes a fetch response that was made possible to be passed to
 * `postMessage()`, i.e., can be cloned using the
 * [structured clone algorithm](http://mdn.io/Structured_clone_algorithm).
 *
 * The response is assumed to be serialized in the following way:
 *
 * 1. Transform the entries in the headers of the response into an
 * `!Array<!Array<string>>` holding the list of header entries, where each
 * element in the array is a header entry (key-value pair) represented as a
 * 2-element array. The header key is case-insensitive.
 *
 * 2. Include the header entry list and `status` and `statusText` properties
 * of the response in as `headers`, `status` and `statusText` properties of
 * `init`.
 *
 * 3. Include the body of the response serialized as string in `body`.
 *
 * 4. Return a new object having properties `body` and `init`.
 *
 * The response is de-serialized in the following way:
 *
 * 1. If the `Response` type is supported and `responseType` is not
 * document, pass `body` and `init` directly to the constructor of `Response`.
 *
 * 2. Otherwise, populate a fake XHR object to pass to `FetchResponse` as if
 * the response is returned by the fetch polyfill.
 *
 * 3. If `responseType` is `document`, also parse the body and populate
 * `responseXML` as a `Document` type.
 *
 * @param {JsonObject|string|undefined} response The structurally-cloneable
 *     response to convert back to a regular Response.
 * @param {string|undefined} responseType The original response type used to
 *     initiate the XHR.
 * @return {!Response} The deserialized regular response.
 * @private
 */


function fromStructuredCloneable(response, responseType) {
  (0, _log.userAssert)((0, _types.isObject)(response), 'Object expected: %s', response);
  var isDocumentType = responseType == 'document';

  if (!isDocumentType) {
    // Use native `Response` type if available for performance. If response
    // type is `document`, we must fall back to `FetchResponse` polyfill
    // because callers would then rely on the `responseXML` property being
    // present, which is not supported by the Response type.
    return new Response(response['body'], response['init']);
  }

  var lowercasedHeaders = (0, _object.map)();
  var data = {
    status: 200,
    statusText: 'OK',

    /**
     * @param {string} name
     * @return {string}
     */
    getResponseHeader: function getResponseHeader(name) {
      return lowercasedHeaders[String(name).toLowerCase()] || null;
    }
  };

  if (response['init']) {
    var init = response['init'];

    if ((0, _types.isArray)(init.headers)) {
      init.headers.forEach(function (entry) {
        var headerName = entry[0];
        var headerValue = entry[1];
        lowercasedHeaders[String(headerName).toLowerCase()] = String(headerValue);
      });
    }

    if (init.status) {
      data.status = parseInt(init.status, 10);
    }

    if (init.statusText) {
      data.statusText = String(init.statusText);
    }
  }

  return new Response(response['body'] ? String(response['body']) : '', data);
}
/**
 * Intercepts the XHR and proxies it through the viewer if necessary.
 *
 * XHRs are intercepted if all of the following are true:
 * - The AMP doc is in single doc mode
 * - The requested resource is not a 1p request.
 * - The viewer has the `xhrInterceptor` capability
 * - The Viewer is a trusted viewer or AMP is currently in developement mode
 * - The AMP doc is opted-in for XHR interception (`<html>` tag has
 *   `allow-xhr-interception` attribute)
 *
 * @param {!Window} win
 * @param {?../service/ampdoc-impl.AmpDoc} ampdocSingle
 * @param {string} input The URL of the XHR which may get intercepted.
 * @param {!FetchInitDef} init The options of the XHR which may get
 *     intercepted.
 * @return {!Promise<!Response|undefined>}
 *     A response returned by the interceptor if XHR is intercepted or
 *     `Promise<undefined>` otherwise.
 * @private
 */


function getViewerInterceptResponse(win, ampdocSingle, input, init) {
  if (!ampdocSingle) {
    return Promise.resolve();
  }

  var whenUnblocked = init.prerenderSafe ? Promise.resolve() : ampdocSingle.whenFirstVisible();

  var viewer = _services.Services.viewerForDoc(ampdocSingle);

  var urlIsProxy = (0, _url.isProxyOrigin)(input);
  var viewerCanIntercept = viewer.hasCapability('xhrInterceptor');
  var interceptorDisabledForLocalDev = init.bypassInterceptorForDev && (0, _mode.getMode)(win).localDev;

  if (urlIsProxy || !viewerCanIntercept || interceptorDisabledForLocalDev) {
    return whenUnblocked;
  }

  var htmlElement = ampdocSingle.getRootNode().documentElement;
  var docOptedIn = htmlElement.hasAttribute('allow-xhr-interception');

  if (!docOptedIn) {
    return whenUnblocked;
  }

  return whenUnblocked.then(function () {
    return viewer.isTrustedViewer();
  }).then(function (viewerTrusted) {
    if (!(viewerTrusted || (0, _mode.getMode)(win).localDev || (0, _experiments.isExperimentOn)(win, 'untrusted-xhr-interception'))) {
      return;
    }

    var messagePayload = (0, _object.dict)({
      'originalRequest': toStructuredCloneable(input, init)
    });
    return viewer.sendMessageAwaitResponse('xhr', messagePayload).then(function (response) {
      return fromStructuredCloneable(response, init.responseType);
    });
  });
}
/**
 * Sets up URL based on ampCors
 * @param {!Window} win
 * @param {string} input
 * @param {!FetchInitDef} init The options of the XHR which may get
 * intercepted.
 * @return {string}
 */


function setupInput(win, input, init) {
  (0, _log.devAssert)(typeof input == 'string', 'Only URL supported: %s', input);

  if (init.ampCors !== false) {
    input = (0, _url.getCorsUrl)(win, input);
  }

  return input;
}
/**
 * Sets up and normalizes the FetchInitDef
 *
 * @param {?FetchInitDef=} opt_init Fetch options object.
 * @param {string=} opt_accept The HTTP Accept header value.
 * @return {!FetchInitDef}
 */


function setupInit(opt_init, opt_accept) {
  var init = opt_init || {}; // In particular, Firefox does not tolerate `null` values for
  // `credentials`.

  var creds = init.credentials;
  (0, _log.devAssert)(creds === undefined || creds == 'include' || creds == 'omit', 'Only credentials=include|omit support: %s', creds);
  init.method = normalizeMethod_(init.method);
  init.headers = init.headers || (0, _object.dict)({});

  if (opt_accept) {
    init.headers['Accept'] = opt_accept;
  } // In edge a `TypeMismatchError` is thrown when body is set to null.


  (0, _log.devAssert)(init.body !== null, 'fetch `body` can not be `null`');
  return init;
}
/**
 *
 * Sets up AMPSpecific CORS headers.
 * @param {!Window} win
 * @param {string} input
 * @param {?FetchInitDef=} init
 * @return {!FetchInitDef}
 */


function setupAMPCors(win, input, init) {
  init = init || {}; // For some same origin requests, add AMP-Same-Origin: true header to allow
  // publishers to validate that this request came from their own origin.

  var currentOrigin = (0, _url.getWinOrigin)(win);
  var targetOrigin = (0, _url.parseUrlDeprecated)(input).origin;

  if (currentOrigin == targetOrigin) {
    init['headers'] = init['headers'] || {};
    init['headers']['AMP-Same-Origin'] = 'true';
  }

  return init;
}
/**
 * @param {?FetchInitDef=} init
 * @return {!FetchInitDef}
 */


function setupJsonFetchInit(init) {
  var fetchInit = setupInit(init, 'application/json');

  if (fetchInit.method == 'POST' && !(0, _formDataWrapper.isFormDataWrapper)(fetchInit.body)) {
    // Assume JSON strict mode where only objects or arrays are allowed
    // as body.
    (0, _log.devAssert)(allowedJsonBodyTypes_.some(function (test) {
      return test(fetchInit.body);
    }), 'body must be of type object or array. %s', fetchInit.body); // Content should be 'text/plain' to avoid CORS preflight.

    fetchInit.headers['Content-Type'] = fetchInit.headers['Content-Type'] || 'text/plain;charset=utf-8';
    var headerContentType = fetchInit.headers['Content-Type']; // Cast is valid, because we checked that it is not form data above.

    if (headerContentType === 'application/x-www-form-urlencoded') {
      fetchInit.body = (0, _url.serializeQueryString)(
      /** @type {!JsonObject} */
      fetchInit.body);
    } else {
      fetchInit.body = JSON.stringify(
      /** @type {!JsonObject} */
      fetchInit.body);
    }
  }

  return fetchInit;
}
/**
 * Normalized method name by uppercasing.
 * @param {string|undefined} method
 * @return {string}
 * @private
 */


function normalizeMethod_(method) {
  if (method === undefined) {
    return 'GET';
  }

  method = method.toUpperCase();
  (0, _log.devAssert)(allowedMethods_.includes(method), 'Only one of %s is currently allowed. Got %s', allowedMethods_.join(', '), method);
  return method;
}
/**
 * If 415 or in the 5xx range.
 * @param {number} status
 * @return {boolean}
 */


function isRetriable(status) {
  return status == 415 || status >= 500 && status < 600;
}
/**
 * Returns the response if successful or otherwise throws an error.
 * @param {!Response} response
 * @return {!Promise<!Response>}
 * @private Visible for testing
 */


function assertSuccess(response) {
  return new Promise(function (resolve) {
    if (response.ok) {
      return resolve(response);
    }

    var status = response.status;
    var err = (0, _log.user)().createError("HTTP error " + status);
    err.retriable = isRetriable(status); // TODO(@jridgewell, #9448): Callers who need the response should
    // skip processing.

    err.response = response;
    throw err;
  });
}
/**
 * Returns a promise resolving to a string identity token if the element
 * contains the 'crossorigin' attribute and the amp-viewer-assistance extension
 * is present. Resolves to undefined otherwise.
 * @param {!Element} element
 * @return {!Promise<undefined>}
 */


function getViewerAuthTokenIfAvailable(element) {
  var crossOriginAttr = element.getAttribute('crossorigin');

  if (crossOriginAttr && crossOriginAttr.trim() === 'amp-viewer-auth-token-via-post') {
    return _services.Services.viewerAssistanceForDocOrNull(element).then(function (va) {
      (0, _log.userAssert)(va, 'crossorigin="amp-viewer-auth-token-post" ' + 'requires amp-viewer-assistance extension.');
      return va.getIdTokenPromise();
    }) // If crossorigin attr is present, resolve with token or empty string.
    .then(function (token) {
      return token || '';
    }).catch(function () {
      return '';
    });
  } // If crossorigin attribute is missing, always resolve with undefined.


  return Promise.resolve(undefined);
}

},{"../experiments":22,"../form-data-wrapper":23,"../log":26,"../mode":28,"../services":32,"../types":37,"../url":40,"./array":41,"./object":44}],48:[function(require,module,exports){
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

},{}]},{},[3])


})});
//# sourceMappingURL=amp-form-0.1.max.js.map
