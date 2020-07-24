(self.AMP=self.AMP||[]).push({n:"amp-bind",v:"1910072132470",f:(function(AMP,_){
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpBindMacro = void 0;

var _layout = require("../../../src/layout");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * The <amp-bind-macro> element is used to define an expression macro that can
 * be called from other amp-bind expressions within the document.
 */
var AmpBindMacro =
/*#__PURE__*/
function (_AMP$BaseElement) {
  _inheritsLoose(AmpBindMacro, _AMP$BaseElement);

  function AmpBindMacro() {
    return _AMP$BaseElement.apply(this, arguments) || this;
  }

  var _proto = AmpBindMacro.prototype;

  /** @override */
  _proto.getLayoutPriority = function getLayoutPriority() {
    // Loads after other content.
    return _layout.LayoutPriority.METADATA;
  }
  /** @override */
  ;

  _proto.isAlwaysFixed = function isAlwaysFixed() {
    return true;
  }
  /** @override */
  ;

  _proto.isLayoutSupported = function isLayoutSupported(unusedLayout) {
    return true;
  }
  /** @override */
  ;

  _proto.renderOutsideViewport = function renderOutsideViewport() {
    // We want the macro to be available wherever it is in the document.
    return true;
  }
  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   *     if the element name is not unique.
   * @protected
   */
  ;

  _proto.getName_ = function getName_() {
    return '<amp-bind-macro> ' + (this.element.getAttribute('id') || '<unknown id>');
  };

  return AmpBindMacro;
}(AMP.BaseElement);

exports.AmpBindMacro = AmpBindMacro;

},{"../../../src/layout":28}],2:[function(require,module,exports){
"use strict";

var _ampBindMacro = require("./amp-bind-macro");

var _ampState = require("./amp-state");

var _bindImpl = require("./bind-impl");

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
var TAG = 'amp-bind';
AMP.extension(TAG, '0.1', function (AMP) {
  AMP.registerServiceForDoc('bind', _bindImpl.Bind);
  AMP.registerElement('amp-state', _ampState.AmpState);
  AMP.registerElement('amp-bind-macro', _ampBindMacro.AmpBindMacro);
});

},{"./amp-bind-macro":1,"./amp-state":3,"./bind-impl":5}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpState = void 0;

var _actionConstants = require("../../../src/action-constants");

var _layout = require("../../../src/layout");

var _services = require("../../../src/services");

var _batchedJson = require("../../../src/batched-json");

var _eventHelper = require("../../../src/event-helper");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _url = require("../../../src/url");

var _xhrUtils = require("../../../src/utils/xhr-utils");

var _dom = require("../../../src/dom");

var _style = require("../../../src/style");

var _json = require("../../../src/json");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var AmpState =
/*#__PURE__*/
function (_AMP$BaseElement) {
  _inheritsLoose(AmpState, _AMP$BaseElement);

  /**
   * @param {!Element} element
   */
  function AmpState(element) {
    var _this;

    _this = _AMP$BaseElement.call(this, element) || this;
    /**
     * JSON in child <script>, if any.
     * - `undefined` if the script has never been parsed.
     * - `null` or `!JsonObject` once the script has been parsed.
     * @private {?JsonObject|undefined}
     */

    _this.localData_ = undefined;
    return _this;
  }
  /** @override */


  var _proto = AmpState.prototype;

  _proto.getLayoutPriority = function getLayoutPriority() {
    // Loads after other content.
    return _layout.LayoutPriority.METADATA;
  }
  /** @override */
  ;

  _proto.isAlwaysFixed = function isAlwaysFixed() {
    return true;
  }
  /** @override */
  ;

  _proto.isLayoutSupported = function isLayoutSupported(unusedLayout) {
    return true;
  }
  /** @override */
  ;

  _proto.buildCallback = function buildCallback() {
    var _this2 = this;

    (0, _style.toggle)(this.element,
    /* opt_display */
    false);
    this.element.setAttribute('aria-hidden', 'true');
    var element = this.element;

    if (element.hasAttribute('overridable')) {
      _services.Services.bindForDocOrNull(element).then(function (bind) {
        (0, _log.devAssert)(bind);
        bind.addOverridableKey(element.getAttribute('id'));
      });
    } // Parse child <script> tag and/or fetch JSON from `src` attribute.
    // The latter is allowed to overwrite the former.


    this.parseAndUpdate();

    if (this.element.hasAttribute('src')) {
      this.fetchAndUpdate_(
      /* isInit */
      true);
    }

    this.registerAction('refresh', function () {
      (0, _log.userAssert)(_this2.element.hasAttribute('src'), 'Can\'t refresh <amp-state> without "src" attribute.');

      _this2.fetchAndUpdate_(
      /* isInit */
      false,
      /* opt_refresh */
      true);
    }, _actionConstants.ActionTrust.HIGH);
  }
  /** @override */
  ;

  _proto.mutatedAttributesCallback = function mutatedAttributesCallback(mutations) {
    if (!this.getAmpDoc().hasBeenVisible()) {
      var TAG = this.getName_();
      (0, _log.dev)().error(TAG, 'ampdoc must be visible before mutation.');
      return;
    } // "src" attribute may be missing if mutated with a non-primitive.


    if (mutations['src'] !== undefined && this.element.hasAttribute('src')) {
      this.fetchAndUpdate_(
      /* isInit */
      false);
    }
  }
  /** @override */
  ;

  _proto.renderOutsideViewport = function renderOutsideViewport() {
    // We want the state data to be available wherever it is in the document.
    return true;
  }
  /**
   * Parses JSON in child <script> and updates state.
   * @return {!Promise}
   */
  ;

  _proto.parseAndUpdate = function parseAndUpdate() {
    if (this.localData_ === undefined) {
      this.localData_ = this.parse_();

      if (this.localData_ !== null) {
        return this.updateState_(this.localData_,
        /* isInit */
        true);
      }
    }

    return Promise.resolve();
  }
  /**
   * Parses JSON in child <script> and returns it.
   * @return {?JsonObject}
   * @private
   */
  ;

  _proto.parse_ = function parse_() {
    var _this3 = this;

    var children = this.element.children;

    if (children.length == 0) {
      return null;
    }

    var TAG = this.getName_();

    if (children.length != 1) {
      this.user().error(TAG, 'Should contain exactly one <script> child.');
      return null;
    }

    var firstChild = children[0];

    if (!(0, _dom.isJsonScriptTag)(firstChild)) {
      this.user().error(TAG, 'State should be in a <script> tag with type="application/json".');
      return null;
    }

    return (0, _json.tryParseJson)(firstChild.textContent, function (e) {
      _this3.user().error(TAG, 'Failed to parse state. Is it valid JSON?', e);
    });
  }
  /**
   * Wrapper to stub during testing.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!UrlReplacementPolicy} policy
   * @param {boolean=} opt_refresh
   * @param {string=} token
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   * @private
   */
  ;

  _proto.fetch_ = function fetch_(ampdoc, policy, opt_refresh, token) {
    if (token === void 0) {
      token = undefined;
    }

    return (0, _batchedJson.batchFetchJsonFor)(ampdoc, this.element,
    /* opt_expr */
    undefined, policy, opt_refresh, token);
  }
  /**
   * Transforms and prepares the fetch request.
   * @param {boolean} isInit
   * @param {boolean=} opt_refresh
   * @return {!Promise<!JsonObject|!Array<JsonObject>>}
   */
  ;

  _proto.prepareAndSendFetch_ = function prepareAndSendFetch_(isInit, opt_refresh) {
    var _this4 = this;

    var element = this.element;
    var ampdoc = this.getAmpDoc();
    var src = element.getAttribute('src');
    var isCorsFetch = (0, _url.getSourceOrigin)(src) !== (0, _url.getSourceOrigin)(ampdoc.win.location); // Require opt-in for URL variable replacements on CORS fetches triggered
    // by [src] mutation. @see spec/amp-var-substitutions.md

    var policy = isCorsFetch && !isInit ? _batchedJson.UrlReplacementPolicy.OPT_IN : _batchedJson.UrlReplacementPolicy.ALL;
    return (0, _xhrUtils.getViewerAuthTokenIfAvailable)(element).then(function (token) {
      return _this4.fetch_(ampdoc, policy, opt_refresh, token).catch(function (error) {
        var event = error ? (0, _eventHelper.createCustomEvent)(_this4.win, 'amp-state.error', (0, _object.dict)({
          'response': error.response
        })) : null; // Trigger "fetch-error" event on fetch failure.

        var actions = _services.Services.actionServiceForDoc(element);

        actions.trigger(element, 'fetch-error', event, _actionConstants.ActionTrust.LOW);
      });
    });
  }
  /**
   * @param {boolean} isInit
   * @param {boolean=} opt_refresh
   * @return {!Promise<undefined>}
   * @private
   */
  ;

  _proto.fetchAndUpdate_ = function fetchAndUpdate_(isInit, opt_refresh) {
    var _this5 = this;

    // Don't fetch in prerender mode.
    return this.getAmpDoc().whenFirstVisible().then(function () {
      return _this5.prepareAndSendFetch_(isInit, opt_refresh);
    }).then(function (json) {
      return _this5.updateState_(json, isInit);
    });
  }
  /**
   * @param {*} json
   * @param {boolean} isInit
   * @return {!Promise}
   * @private
   */
  ;

  _proto.updateState_ = function updateState_(json, isInit) {
    if (json === undefined || json === null) {
      return Promise.resolve();
    }

    var id = (0, _log.userAssert)(this.element.id, '<amp-state> must have an id.');
    return _services.Services.bindForDocOrNull(this.element).then(function (bind) {
      (0, _log.devAssert)(bind);
      var state =
      /** @type {!JsonObject} */
      (0, _object.map)();
      state[id] = json; // As a rule, initialization should skip evaluation.
      // If we're not initializing then this must be a mutation, so we must
      // skip <amp-state> evaluation to prevent update cycles.

      bind.setState(state,
      /* skipEval */
      isInit,
      /* skipAmpState */
      !isInit);
    });
  }
  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   *     if the element id is not unique.
   * @private
   */
  ;

  _proto.getName_ = function getName_() {
    return '<amp-state> ' + (this.element.getAttribute('id') || '<unknown id>');
  };

  return AmpState;
}(AMP.BaseElement);

exports.AmpState = AmpState;

},{"../../../src/action-constants":7,"../../../src/batched-json":10,"../../../src/dom":16,"../../../src/event-helper":20,"../../../src/json":27,"../../../src/layout":28,"../../../src/log":29,"../../../src/services":35,"../../../src/style":40,"../../../src/url":45,"../../../src/utils/object":49,"../../../src/utils/xhr-utils":54}],4:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.BindEvents = void 0;

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
 * TODO(choumx, #19657): Remove/replace with DOM polling in integration tests.
 * @enum {string}
 */
var BindEvents = {
  INITIALIZE: 'amp:bind:initialize',
  RESCAN_TEMPLATE: 'amp:bind:rescan-template',
  SET_STATE: 'amp:bind:setState'
};
exports.BindEvents = BindEvents;

},{}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.Bind = void 0;

var _ampEvents = require("../../../src/amp-events");

var _bindEvents = require("./bind-events");

var _bindValidator = require("./bind-validator");

var _chunk = require("../../../src/chunk");

var _promise = require("../../../src/utils/promise");

var _actionConstants = require("../../../src/action-constants");

var _services = require("../../../src/services");

var _signals = require("../../../src/utils/signals");

var _dom = require("../../../src/dom");

var _eventHelper = require("../../../src/event-helper");

var _rateLimit = require("../../../src/utils/rate-limit");

var _json = require("../../../src/json");

var _object = require("../../../src/utils/object");

var _log = require("../../../src/log");

var _array = require("../../../src/utils/array");

var _mode = require("../../../src/mode");

var _service = require("../../../src/service");

var _ampWorker = require("../../../src/web-worker/amp-worker");

var _format = require("../../../src/format");

var _types = require("../../../src/types");

var _error = require("../../../src/error");

var _urlRewrite = require("../../../src/url-rewrite");

var _string = require("../../../src/string");

var _documentReady = require("../../../src/document-ready");

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
var TAG = 'amp-bind';
/**
 * Regular expression that identifies AMP CSS classes.
 * Includes 'i-amphtml-', '-amp-', and 'amp-' prefixes.
 * @type {!RegExp}
 */

var AMP_CSS_RE = /^(i?-)?amp(html)?-/;
/**
 * Maximum depth for state merge.
 * @type {number}
 */

var MAX_MERGE_DEPTH = 10;
/** @const {!Object<string, !Object<string, boolean>>} */

var FORM_VALUE_PROPERTIES = {
  'INPUT': {
    'checked': true,
    'value': true
  },
  'OPTION': {
    'selected': true
  },
  'TEXTAREA': {
    'text': true
  }
};
/**
 * A bound property, e.g. [property]="expression".
 * `previousResult` is the result of this expression during the last evaluation.
 * @typedef {{property: string, expressionString: string, previousResult: (BindExpressionResultDef|undefined)}}
 */

var BoundPropertyDef;
/**
 * A tuple containing a single element and all of its bound properties.
 * @typedef {{boundProperties: !Array<BoundPropertyDef>, element: !Element}}
 */

var BoundElementDef;
/**
 * A map of tag names to arrays of attributes that do not have non-bind
 * counterparts. For instance, amp-carousel allows a `[slide]` attribute,
 * but does not support a `slide` attribute.
 * @const {!Object<string, !Array<string>>}
 */

var BIND_ONLY_ATTRIBUTES = (0, _object.map)({
  'AMP-CAROUSEL': ['slide'],
  // TODO (#18875): add is-layout-container to validator file for amp-list
  'AMP-LIST': ['state', 'is-layout-container'],
  'AMP-SELECTOR': ['selected']
});
/**
 * Elements that opt-out of tree walking in favor of rescan() with {fast: true}.
 * @const {!Array<string>}
 */

var FAST_RESCAN_TAGS = ['AMP-LIST'];
/**
 * Bind is an ampdoc-scoped service that handles the Bind lifecycle, from
 * scanning for bindings to evaluating expressions to mutating elements.
 * @implements {../../../src/service.EmbeddableService}
 */

var Bind =
/*#__PURE__*/
function () {
  /**
   * If `opt_win` is provided, scans its document for bindings instead.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!Window=} opt_win
   */
  function Bind(ampdoc, opt_win) {
    var _this = this;

    // TODO(#22733): remove opt_win subroooting once ampdoc-fie is launched.

    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;
    /** @const @private {!Window} */

    this.win_ = ampdoc.win;
    /**
     * The window containing the document to scan.
     * May differ from the `ampdoc`'s window e.g. in FIE.
     * @const @private {!Window}
     */

    this.localWin_ = opt_win || ampdoc.win;
    /**
     * Array of ActionInvocation.sequenceId values that have been invoked.
     * Used to ensure that only one "AMP.setState" or "AMP.pushState" action
     * may be triggered per event. Periodically cleared.
     * @const @private {!Array<number>}
     */

    this.actionSequenceIds_ = [];
    /** @const @private {!Function} */

    this.eventuallyClearActionSequenceIds_ = (0, _rateLimit.debounce)(this.win_, function () {
      _this.actionSequenceIds_.length = 0;
    }, 5000);
    /** @private {!Array<BoundElementDef>} */

    this.boundElements_ = [];
    /**
     * Maps expression string to the element(s) that contain it.
     * @private @const {!Object<string, !Array<!Element>>}
     */

    this.expressionToElements_ = (0, _object.map)();
    /** @private {!../../../src/service/history-impl.History} */

    this.history_ = _services.Services.historyForDoc(ampdoc);
    /** @private {!Array<string>} */

    this.overridableKeys_ = [];
    /**
     * Upper limit on total number of bindings.
     *
     * The initial value is set to 1000 which, based on ~2ms expression parse
     * time, caps "time to interactive" at ~2s after page load.
     *
     * User interactions can add new bindings (e.g. infinite scroll), so this
     * can increase over time to a final limit of 2000 bindings.
     *
     * @private {number}
     */

    this.maxNumberOfBindings_ = 1000;
    /** @const @private {!../../../src/service/resources-interface.ResourcesInterface} */

    this.resources_ = _services.Services.resourcesForDoc(ampdoc);
    /**
     * The current values of all bound expressions on the page.
     * @const @private {!JsonObject}
     */

    this.state_ =
    /** @type {!JsonObject} */
    (0, _object.map)();
    /** @const {!../../../src/service/timer-impl.Timer} */

    this.timer_ = _services.Services.timerFor(this.win_);
    /** @private {?./bind-validator.BindValidator} */

    this.validator_ = null;
    /** @const @private {!../../../src/service/viewer-interface.ViewerInterface} */

    this.viewer_ = _services.Services.viewerForDoc(this.ampdoc);
    this.viewer_.onMessageRespond('premutate', this.premutate_.bind(this));
    /**
     * Resolved when the service finishes scanning the document for bindings.
     * @const @private {Promise}
     */

    this.initializePromise_ = ampdoc.whenFirstVisible().then(function () {
      if (opt_win) {
        // In FIE, scan the document node of the iframe window.
        var document = opt_win.document;
        return (0, _documentReady.whenDocumentReady)(document).then(function () {
          return document;
        });
      } else {
        // Otherwise, scan the root node of the ampdoc.
        return ampdoc.whenReady().then(function () {
          return ampdoc.getRootNode();
        });
      }
    }).then(function (root) {
      return _this.initialize_(root);
    });
    /** @const @private {!Deferred} */

    this.addMacrosDeferred_ = new _promise.Deferred();
    /** @private {Promise} */

    this.setStatePromise_ = null;
    /** @private @const {!../../../src/utils/signals.Signals} */

    this.signals_ = new _signals.Signals(); // Install debug tools.

    var g = self.AMP;
    g.printState = g.printState || this.debugPrintState_.bind(this);

    g.setState = g.setState || function (state) {
      return _this.setState(state);
    };

    g.eval = g.eval || this.debugEvaluate_.bind(this);
  }
  /**
   * @param {!Window} embedWin
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @nocollapse
   */


  Bind.installInEmbedWindow = function installInEmbedWindow(embedWin, ampdoc) {
    (0, _service.installServiceInEmbedScope)(embedWin, 'bind', new Bind(ampdoc, embedWin));
  }
  /**
   * @return {!../../../src/utils/signals.Signals}
   */
  ;

  var _proto = Bind.prototype;

  _proto.signals = function signals() {
    return this.signals_;
  }
  /**
   * Merges `state` into the current state and immediately triggers an
   * evaluation unless `opt_skipEval` is false.
   * @param {!JsonObject} state
   * @param {boolean=} opt_skipEval
   * @param {boolean=} opt_skipAmpState
   * @return {!Promise}
   */
  ;

  _proto.setState = function setState(state, opt_skipEval, opt_skipAmpState) {
    var _this2 = this;

    (0, _log.dev)().info(TAG, 'setState (init=%s):', opt_skipEval, state);

    try {
      (0, _object.deepMerge)(this.state_, state, MAX_MERGE_DEPTH);
    } catch (e) {
      (0, _log.user)().error(TAG, 'Failed to merge result from AMP.setState().', e);
    }

    if (opt_skipEval) {
      return Promise.resolve();
    }

    var promise = this.initializePromise_.then(function () {
      return _this2.evaluate_();
    }).then(function (results) {
      return _this2.apply_(results, opt_skipAmpState);
    });

    if ((0, _mode.getMode)().test) {
      promise.then(function () {
        _this2.dispatchEventForTesting_(_bindEvents.BindEvents.SET_STATE);
      });
    }

    return this.setStatePromise_ = promise;
  }
  /**
   * Executes an `AMP.setState()` or `AMP.pushState()` action.
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {!Promise}
   */
  ;

  _proto.invoke = function invoke(invocation) {
    var args = invocation.args,
        event = invocation.event,
        method = invocation.method,
        sequenceId = invocation.sequenceId,
        tagOrTarget = invocation.tagOrTarget; // Store the sequenceId values of action invocations and only allow one
    // setState() or pushState() event per sequence.

    if (this.actionSequenceIds_.includes(sequenceId)) {
      (0, _log.user)().error(TAG, 'One state action allowed per event.');
      return Promise.resolve();
    }

    this.actionSequenceIds_.push(sequenceId); // Flush stored sequence IDs five seconds after the last invoked action.

    this.eventuallyClearActionSequenceIds_();
    var expression = args[_actionConstants.RAW_OBJECT_ARGS_KEY];

    if (expression) {
      // Increment bindings limit by 500 on each invocation to a max of 2000.
      this.maxNumberOfBindings_ = Math.min(2000, Math.max(1000, this.maxNumberOfBindings_ + 500));
      this.signals_.signal('FIRST_MUTATE');
      var scope = (0, _object.dict)();

      if (event && (0, _eventHelper.getDetail)(
      /** @type {!Event} */
      event)) {
        scope['event'] = (0, _eventHelper.getDetail)(
        /** @type {!Event} */
        event);
      }

      switch (method) {
        case 'setState':
          return this.setStateWithExpression(expression, scope);

        case 'pushState':
          return this.pushStateWithExpression(expression, scope);

        default:
          return Promise.reject((0, _log.dev)().createError('Unrecognized method: %s.%s', tagOrTarget, method));
      }
    } else {
      (0, _log.user)().error('AMP-BIND', 'Please use the object-literal syntax, ' + 'e.g. "AMP.setState({foo: \'bar\'})" instead of ' + '"AMP.setState(foo=\'bar\')".');
    }

    return Promise.resolve();
  }
  /**
   * Parses and evaluates an expression with a given scope and merges the
   * resulting object into current state.
   * @param {string} expression
   * @param {!JsonObject} scope
   * @return {!Promise}
   */
  ;

  _proto.setStateWithExpression = function setStateWithExpression(expression, scope) {
    var _this3 = this;

    (0, _log.dev)().info(TAG, 'setState:', expression);
    this.setStatePromise_ = this.evaluateExpression_(expression, scope).then(function (result) {
      return _this3.setState(result);
    }).then(function () {
      return _this3.getDataForHistory_();
    }).then(function (data) {
      // Don't bother calling History.replace with empty data.
      if (data) {
        _this3.history_.replace(data);
      }
    });
    return this.setStatePromise_;
  }
  /**
   * Same as setStateWithExpression() except also pushes new history.
   * Popping the new history stack entry will restore the values of variables
   * in `expression`.
   * @param {string} expression
   * @param {!JsonObject} scope
   * @return {!Promise}
   */
  ;

  _proto.pushStateWithExpression = function pushStateWithExpression(expression, scope) {
    var _this4 = this;

    (0, _log.dev)().info(TAG, 'pushState:', expression);
    return this.evaluateExpression_(expression, scope).then(function (result) {
      // Store the current values of each referenced variable in `expression`
      // so that we can restore them on history-pop.
      var oldState = (0, _object.map)();
      Object.keys(result).forEach(function (variable) {
        var value = _this4.state_[variable]; // Store a deep copy of `value` to make sure `oldState` isn't
        // modified by subsequent setState() actions.

        oldState[variable] = _this4.copyJsonObject_(value);
      });

      var onPop = function onPop() {
        return _this4.setState(oldState);
      };

      return _this4.setState(result).then(function () {
        return _this4.getDataForHistory_();
      }).then(function (data) {
        _this4.history_.push(onPop, data);
      });
    });
  }
  /**
   * Returns data that should be saved in browser history on AMP.setState() or
   * AMP.pushState(). This enables features like restoring browser tabs.
   * @return {!Promise<?JsonObject>}
   */
  ;

  _proto.getDataForHistory_ = function getDataForHistory_() {
    var data = (0, _object.dict)({
      'data': (0, _object.dict)({
        'amp-bind': this.state_
      }),
      'title': this.localWin_.document.title
    });

    if (!this.viewer_.isEmbedded()) {
      // CC doesn't recognize !JsonObject as a subtype of (JsonObject|null).
      return (
        /** @type {!Promise<?JsonObject>} */
        Promise.resolve(data)
      );
    } // Only pass state for history updates to trusted viewers, since they
    // may contain user data e.g. form input.


    return this.viewer_.isTrustedViewer().then(function (trusted) {
      return trusted ? data : null;
    });
  }
  /**
   * Removes bindings from `removedElements` and adds new bindings in
   * `addedElements`.
   *
   * If `options.update` is true, evaluates and applies changes to
   * `addedElements` after adding new bindings.
   *
   * If `options.fast` is true, uses a faster scan method that requires
   * (1) elements with bindings to have the attribute `i-amphtml-binding` and
   * (2) the parent element tag name be listed in FAST_RESCAN_TAGS.
   *
   * @param {!Array<!Element>} addedElements
   * @param {!Array<!Element>} removedElements
   * @param {BindRescanOptionsDef=} options
   * @return {!Promise} Resolved when all operations complete. If they don't
   * complete within `options.timeout` (default=2000), promise is rejected.
   */
  ;

  _proto.rescan = function rescan(addedElements, removedElements, options) {
    var _this5 = this;

    if (options === void 0) {
      options = {};
    }

    // * In non-fast mode, wait for initial tree walk to avoid racy double
    //   scanning of `addedElements` which may cause duplicate bindings.
    // * In fast mode, the initial tree walk skips subtrees of FAST_RESCAN_TAGS
    //   so only wait for <amp-bind-macro> setup (much faster!).
    var waitFor = options.fast ? this.addMacrosDeferred_.promise : this.initializePromise_;
    return waitFor.then(function () {
      return _this5.timer_.timeoutPromise(options.timeout || 2000, _this5.rescan_(addedElements, removedElements, options), 'Timed out waiting for amp-bind to rescan.');
    });
  }
  /**
   * @param {!Array<!Element>} addedElements
   * @param {!Array<!Element>} removedElements
   * @param {!BindRescanOptionsDef} options
   * @return {!Promise}
   * @private
   */
  ;

  _proto.rescan_ = function rescan_(addedElements, removedElements, options) {
    var _this6 = this;

    (0, _log.dev)().info(TAG, 'rescan: ', addedElements, removedElements, options);
    var rescanPromise = options.fast ? this.fastScan_(addedElements, removedElements) : this.slowScan_(addedElements, removedElements);
    return rescanPromise.then(function () {
      if (options.update) {
        return _this6.evaluate_().then(function (results) {
          return _this6.applyElements_(results, addedElements);
        });
      }
    });
  }
  /**
   * @param {!Array<!Element>} addedElements
   * @param {!Array<!Element>} removedElements
   * @return {!Promise}
   * @private
   */
  ;

  _proto.fastScan_ = function fastScan_(addedElements, removedElements) {
    var _this7 = this;

    // Sync remove bindings from internal state first, but don't chain on
    // returned promise (worker message) as an optimization.
    var removePromise = this.removeBindingsForNodes_(removedElements); // Scan `addedElements` and descendants for bindings.

    var bindings = [];
    var elementsToScan = addedElements.filter(function (el) {
      return el.hasAttribute('i-amphtml-binding');
    });
    addedElements.forEach(function (el) {
      var children = el.querySelectorAll('[i-amphtml-binding]');
      Array.prototype.push.apply(elementsToScan, children);
    });
    var quota = this.maxNumberOfBindings_ - this.numberOfBindings();

    for (var i = 0; i < elementsToScan.length; i++) {
      var el = elementsToScan[i];

      if (this.scanElement_(el, quota - bindings.length, bindings)) {
        break;
      }
    }

    removePromise.then(function (removed) {
      (0, _log.dev)().info(TAG, 'rescan.fast: delta=%s, total=%s', bindings.length - removed, _this7.numberOfBindings());
    });

    if (bindings.length > 0) {
      return this.sendBindingsToWorker_(bindings);
    } else {
      return Promise.resolve();
    }
  }
  /**
   * Returns the stringified value of the global state for a given field-based
   * expression, e.g. "foo.bar.baz".
   * @param {string} expr
   * @return {string}
   */
  ;

  _proto.getStateValue = function getStateValue(expr) {
    var value = (0, _json.getValueForExpr)(this.state_, expr);

    if ((0, _types.isObject)(value) || (0, _types.isArray)(value)) {
      return JSON.stringify(
      /** @type {JsonObject} */
      value);
    } else {
      return String(value);
    }
  }
  /**
   * Scans the root node (and array of optional nodes) for bindings.
   * @param {!Node} root
   * @return {!Promise}
   * @private
   */
  ;

  _proto.initialize_ = function initialize_(root) {
    var _this8 = this;

    // Disallow URL property bindings in AMP4EMAIL.
    var allowUrlProperties = !(0, _format.isAmp4Email)(this.localWin_.document);
    this.validator_ = new _bindValidator.BindValidator(allowUrlProperties); // The web worker's evaluator also has an instance of BindValidator
    // that should be initialized with the same `allowUrlProperties` value.

    return this.ww_('bind.init', [allowUrlProperties]).then(function () {
      return Promise.all([_this8.addMacros_().then(function () {
        return _this8.addMacrosDeferred_.resolve();
      }), _this8.addBindingsForNodes_([root])]);
    }).then(function () {
      // Listen for DOM updates (e.g. template render) to rescan for bindings.
      root.addEventListener(_ampEvents.AmpEvents.DOM_UPDATE, function (e) {
        return _this8.onDomUpdate_(e);
      });
    }).then(function () {
      var ampStates = root.querySelectorAll('AMP-STATE'); // Force all query-able <amp-state> elements to parse local data instead
      // of waiting for runtime to build them all.

      var whenBuilt = false;
      var whenParsed = (0, _types.toArray)(ampStates).map(function (el) {
        return (0, _dom.whenUpgradedToCustomElement)(el).then(function () {
          return el.getImpl(whenBuilt);
        }).then(function (impl) {
          return impl.parseAndUpdate();
        });
      });
      return Promise.all(whenParsed);
    }).then(function () {
      // In dev mode, check default values against initial expression results.
      if ((0, _mode.getMode)().development) {
        return _this8.evaluate_().then(function (results) {
          return _this8.verify_(results);
        });
      } // Bind is "ready" when its initialization completes _and_ all <amp-state>
      // elements' local data is parsed and processed (not remote data).


      _this8.viewer_.sendMessage('bindReady', undefined);

      _this8.dispatchEventForTesting_(_bindEvents.BindEvents.INITIALIZE);
    });
  }
  /**
   * The current number of bindings.
   * @return {number}
   * @visibleForTesting
   */
  ;

  _proto.numberOfBindings = function numberOfBindings() {
    return this.boundElements_.reduce(function (number, boundElement) {
      return number + boundElement.boundProperties.length;
    }, 0);
  }
  /**
   * @param {number} value
   * @visibleForTesting
   */
  ;

  _proto.setMaxNumberOfBindingsForTesting = function setMaxNumberOfBindingsForTesting(value) {
    this.maxNumberOfBindings_ = value;
  }
  /** @return {!../../../src/service/history-impl.History} */
  ;

  _proto.historyForTesting = function historyForTesting() {
    return this.history_;
  }
  /**
   * Calls setState(s), where s is data.state with the non-overridable keys
   * removed.
   * @param {!JsonObject} data
   * @return {!Promise}
   * @private
   */
  ;

  _proto.premutate_ = function premutate_(data) {
    var _this9 = this;

    var ignoredKeys = [];
    return this.initializePromise_.then(function () {
      Object.keys(data['state']).forEach(function (key) {
        if (!_this9.overridableKeys_.includes(key)) {
          delete data['state'][key];
          ignoredKeys.push(key);
        }
      });

      if (ignoredKeys.length > 0) {
        (0, _log.user)().warn(TAG, 'Some state keys could not be premutated ' + 'because they are missing the overridable attribute: ' + ignoredKeys.join(', '));
      }

      return _this9.setState(data['state']);
    });
  }
  /**
   * Marks the given key as overridable so that it can be overriden by
   * a premutate message from the viewer.
   * @param {string} key
   */
  ;

  _proto.addOverridableKey = function addOverridableKey(key) {
    this.overridableKeys_.push(key);
  }
  /**
   * Scans the document for <amp-bind-macro> elements, and adds them to the
   * bind-evaluator.
   *
   * Returns a promise that resolves after macros have been added.
   *
   * @return {!Promise<number>}
   * @private
   */
  ;

  _proto.addMacros_ = function addMacros_() {
    var _this10 = this;

    // TODO(choumx, #17194): One-time query selector can miss dynamically
    // created elements. Should do what <amp-state> does.
    var elements = this.ampdoc.getBody().querySelectorAll('AMP-BIND-MACRO');
    var macros =
    /** @type {!Array<!BindMacroDef>} */
    [];
    (0, _dom.iterateCursor)(elements, function (element) {
      var argumentNames = (element.getAttribute('arguments') || '').split(',').map(function (s) {
        return s.trim();
      });
      macros.push({
        id: element.getAttribute('id'),
        argumentNames: argumentNames,
        expressionString: element.getAttribute('expression')
      });
    });

    if (macros.length == 0) {
      return Promise.resolve(0);
    } else {
      return this.ww_('bind.addMacros', [macros]).then(function (errors) {
        // Report macros that failed to parse (e.g. expression size exceeded).
        errors.forEach(function (e, i) {
          _this10.reportWorkerError_(e, TAG + ": Parsing amp-bind-macro failed.", elements[i]);
        });
        return macros.length;
      });
    }
  }
  /**
   * For each node in an array, scans it and its descendants for bindings.
   * This function is not idempotent.
   *
   * Returns a promise that resolves with the number of bindings added upon
   * completion.
   *
   * @param {!Array<!Node>} nodes
   * @return {!Promise<number>}
   * @private
   */
  ;

  _proto.addBindingsForNodes_ = function addBindingsForNodes_(nodes) {
    var _this11 = this;

    if (!nodes.length) {
      return Promise.resolve(0);
    } // For each node, scan it for bindings and store them.


    var scanPromises = nodes.map(function (node) {
      // Limit number of total bindings (unless in local manual testing).
      var limit = (0, _mode.getMode)().localDev && !(0, _mode.getMode)().test ? Number.POSITIVE_INFINITY : _this11.maxNumberOfBindings_ - _this11.numberOfBindings();
      return _this11.scanNode_(node, limit).then(function (results) {
        var bindings = results.bindings,
            limitExceeded = results.limitExceeded;

        if (limitExceeded) {
          _this11.emitMaxBindingsExceededError_();
        }

        return bindings;
      });
    }); // Once all scans are complete, combine the bindings and ask web-worker to
    // evaluate expressions in a single RPC.

    return Promise.all(scanPromises).then(function (results) {
      // `results` is a 2D array where results[i] is an array of bindings.
      // Flatten this into a 1D array of bindings via concat.
      var bindings = Array.prototype.concat.apply([], results);
      return bindings.length > 0 ? _this11.sendBindingsToWorker_(bindings) : 0;
    });
  }
  /** Emits console error stating that the binding limit was exceeded. */
  ;

  _proto.emitMaxBindingsExceededError_ = function emitMaxBindingsExceededError_() {
    (0, _log.dev)().expectedError(TAG, 'Maximum number of bindings reached ' + '(%s). Additional elements with bindings will be ignored.', this.maxNumberOfBindings_);
  }
  /**
   * Sends new bindings to the web worker for parsing.
   * @param {!Array<!BindBindingDef>} bindings
   * @return {!Promise<number>}
   */
  ;

  _proto.sendBindingsToWorker_ = function sendBindingsToWorker_(bindings) {
    var _this12 = this;

    return this.ww_('bind.addBindings', [bindings]).then(function (parseErrors) {
      // Report each parse error.
      Object.keys(parseErrors).forEach(function (expressionString) {
        var elements = _this12.expressionToElements_[expressionString];

        if (elements.length > 0) {
          _this12.reportWorkerError_(parseErrors[expressionString], TAG + ": Expression compile error in \"" + expressionString + "\".", elements[0]);
        }
      });
      return bindings.length;
    });
  }
  /**
   * For each node in an array, removes all bindings for it and its descendants.
   *
   * Returns a promise that resolves with the number of removed bindings upon
   * completion.
   *
   * @param {!Array<!Node>} nodes
   * @return {!Promise<number>}
   * @private
   */
  ;

  _proto.removeBindingsForNodes_ = function removeBindingsForNodes_(nodes) {
    if (!nodes.length) {
      return Promise.resolve(0);
    } // Eliminate bound elements that are descendants of `nodes`.


    (0, _array.remove)(this.boundElements_, function (boundElement) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].contains(boundElement.element)) {
          return true;
        }
      }

      return false;
    }); // Eliminate elements from the expression to elements map that
    // have node as an ancestor. Delete expressions that are no longer
    // bound to elements.

    var deletedExpressions =
    /** @type {!Array<string>} */
    [];

    for (var expression in this.expressionToElements_) {
      var elements = this.expressionToElements_[expression];
      (0, _array.remove)(elements, function (element) {
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].contains(element)) {
            return true;
          }
        }

        return false;
      });

      if (elements.length == 0) {
        deletedExpressions.push(expression);
        delete this.expressionToElements_[expression];
      }
    } // Remove the bindings from the evaluator.


    var removed = deletedExpressions.length;

    if (removed > 0) {
      return this.ww_('bind.removeBindingsWithExpressionStrings', [deletedExpressions]).then(function () {
        return removed;
      });
    } else {
      return Promise.resolve(0);
    }
  }
  /**
   * Scans `node` for attributes that conform to bind syntax and returns
   * a tuple containing bound elements and binding data for the evaluator.
   * @param {!Node} node
   * @param {number} limit
   * @return {!Promise<{bindings: !Array<!BindBindingDef>, limitExceeded: boolean}>}
   * @private
   */
  ;

  _proto.scanNode_ = function scanNode_(node, limit) {
    var _this13 = this;

    /** @type {!Array<!BindBindingDef>} */
    var bindings = [];
    var doc = (0, _log.devAssert)(node.nodeType == Node.DOCUMENT_NODE ? node : node.ownerDocument, 'ownerDocument is null.'); // Third and fourth params of `createTreeWalker` are not optional on IE11.

    var walker = doc.createTreeWalker(node, NodeFilter.SHOW_ELEMENT, null,
    /* entityReferenceExpansion */
    false); // Set to true if number of bindings in `node` exceeds `limit`.

    var limitExceeded = false; // Helper function for scanning the tree walker's next node.
    // Returns true if the walker has no more nodes.

    var scanNextNode_ = function scanNextNode_() {
      var node = walker.currentNode;

      if (!node) {
        return true;
      } // If `node` is a Document, it will be scanned first (despite
      // NodeFilter.SHOW_ELEMENT). Skip it.


      if (node.nodeType !== Node.ELEMENT_NODE) {
        return !walker.nextNode();
      }

      var element = (0, _log.dev)().assertElement(node);
      var remainingQuota = limit - bindings.length;

      if (_this13.scanElement_(element, remainingQuota, bindings)) {
        limitExceeded = true;
      } // Elements in FAST_RESCAN_TAGS opt-out of "slow" tree walking in favor of
      // rescan() with {fast: true} for better performance. Note that only
      // children are opted-out (e.g. amp-list children, not amp-list itself).


      var next = FAST_RESCAN_TAGS.includes(node.nodeName) ? _this13.skipSubtree_(walker) : walker.nextNode();
      return !next || limitExceeded;
    };

    return new Promise(function (resolve) {
      var chunktion = function chunktion(idleDeadline) {
        var completed = false; // If `requestIdleCallback` is available, scan elements until
        // idle time runs out.

        if (idleDeadline && !idleDeadline.didTimeout) {
          while (idleDeadline.timeRemaining() > 1 && !completed) {
            completed = scanNextNode_();
          }
        } else {
          // If `requestIdleCallback` isn't available, scan elements in buckets.
          // Bucket size is a magic number that fits within a single frame.
          var bucketSize = 250;

          for (var i = 0; i < bucketSize && !completed; i++) {
            completed = scanNextNode_();
          }
        } // If we scanned all elements, resolve. Otherwise, continue chunking.


        if (completed) {
          resolve({
            bindings: bindings,
            limitExceeded: limitExceeded
          });
        } else {
          (0, _chunk.chunk)(_this13.ampdoc, chunktion, _chunk.ChunkPriority.LOW);
        }
      };

      (0, _chunk.chunk)(_this13.ampdoc, chunktion, _chunk.ChunkPriority.LOW);
    });
  }
  /**
   * Skips the subtree at the walker's current node and returns the next node
   * in document order, if any. Otherwise, returns null.
   * @param {!TreeWalker} walker
   * @return {?Node}
   * @private
   */
  ;

  _proto.skipSubtree_ = function skipSubtree_(walker) {
    for (var n = walker.currentNode; n; n = walker.parentNode()) {
      var sibling = walker.nextSibling();

      if (sibling) {
        return sibling;
      }
    }

    return null;
  }
  /**
   * Scans the element for bindings and adds up to |quota| to `outBindings`.
   * Also updates ivars `boundElements_` and `expressionToElements_`.
   * @param {!Element} element
   * @param {number} quota
   * @param {!Array<!BindBindingDef>} outBindings
   * @return {boolean} Returns true if `element` contains more than `quota`
   *     bindings. Otherwise, returns false.
   */
  ;

  _proto.scanElement_ = function scanElement_(element, quota, outBindings) {
    var _this14 = this;

    var quotaExceeded = false;
    var boundProperties = this.boundPropertiesInElement_(element);

    if (boundProperties.length > quota) {
      boundProperties.length = quota;
      quotaExceeded = true;
    }

    if (boundProperties.length > 0) {
      this.boundElements_.push({
        element: element,
        boundProperties: boundProperties
      });
    }

    var tagName = element.tagName;
    boundProperties.forEach(function (boundProperty) {
      var property = boundProperty.property,
          expressionString = boundProperty.expressionString;
      outBindings.push({
        tagName: tagName,
        property: property,
        expressionString: expressionString
      });

      if (!_this14.expressionToElements_[expressionString]) {
        _this14.expressionToElements_[expressionString] = [];
      }

      _this14.expressionToElements_[expressionString].push(element);
    });
    return quotaExceeded;
  }
  /**
   * Returns bound properties for an element.
   * @param {!Element} element
   * @return {!Array<{property: string, expressionString: string}>}
   * @private
   */
  ;

  _proto.boundPropertiesInElement_ = function boundPropertiesInElement_(element) {
    var boundProperties = [];
    var attrs = element.attributes;

    for (var i = 0, numberOfAttrs = attrs.length; i < numberOfAttrs; i++) {
      var attr = attrs[i];
      var boundProperty = this.boundPropertyInAttribute_(attr, element);

      if (boundProperty) {
        boundProperties.push(boundProperty);
      }
    }

    return boundProperties;
  }
  /**
   * Returns the bound property and expression string within a given attribute,
   * if it exists. Otherwise, returns null.
   * @param {!Attr} attribute
   * @param {!Element} element
   * @return {?{property: string, expressionString: string}}
   * @private
   */
  ;

  _proto.boundPropertyInAttribute_ = function boundPropertyInAttribute_(attribute, element) {
    var tag = element.tagName;
    var attr = attribute.name;
    var property;

    if (attr.length > 2 && attr[0] === '[' && attr[attr.length - 1] === ']') {
      property = attr.substr(1, attr.length - 2);
    } else if ((0, _string.startsWith)(attr, 'data-amp-bind-')) {
      property = attr.substr(14); // Ignore `data-amp-bind-foo` if `[foo]` already exists.

      if (element.hasAttribute("[" + property + "]")) {
        return null;
      }
    }

    if (property) {
      if (this.validator_.canBind(tag, property)) {
        return {
          property: property,
          expressionString: attribute.value
        };
      } else {
        var err = (0, _log.user)().createError('%s: Binding to [%s] on <%s> is not allowed.', TAG, property, tag);
        this.reportError_(err, element);
      }
    }

    return null;
  }
  /**
   * Evaluates a single expression and returns its result.
   * @param {string} expression
   * @param {!JsonObject} scope
   * @return {!Promise<!JsonObject>}
   */
  ;

  _proto.evaluateExpression_ = function evaluateExpression_(expression, scope) {
    var _this15 = this;

    return this.initializePromise_.then(function () {
      // Allow expression to reference current state in addition to event state.
      Object.assign(scope, _this15.state_);
      return _this15.ww_('bind.evaluateExpression', [expression, scope]);
    }).then(function (returnValue) {
      var result = returnValue.result,
          error = returnValue.error;

      if (error) {
        // Throw to reject promise.
        throw _this15.reportWorkerError_(error, TAG + ": Expression eval failed.");
      } else {
        return result;
      }
    });
  }
  /**
   * Reevaluates all expressions and returns a map of expressions to results.
   * @return {!Promise<!Object<string, BindExpressionResultDef>>}
   * @private
   */
  ;

  _proto.evaluate_ = function evaluate_() {
    var _this16 = this;

    var evaluatePromise = this.ww_('bind.evaluateBindings', [this.state_]);
    return evaluatePromise.then(function (returnValue) {
      var results = returnValue.results,
          errors = returnValue.errors; // Report evaluation errors.

      Object.keys(errors).forEach(function (expressionString) {
        var elements = _this16.expressionToElements_[expressionString];

        if (elements.length > 0) {
          var evalError = errors[expressionString];
          var userError = (0, _log.user)().createError('%s: Expression evaluation error in "%s". %s', TAG, expressionString, evalError.message);
          userError.stack = evalError.stack;

          _this16.reportError_(userError, elements[0]);
        }
      });
      (0, _log.dev)().info(TAG, 'evaluation:', results);
      return results;
    });
  }
  /**
   * Verifies expression results vs. current DOM state and returns an
   * array of bindings with mismatches (if any).
   * @param {Object<string, BindExpressionResultDef>} results
   * @param {?Array<!Element>=} elements If provided, only verifies bindings
   *     contained within the given elements. Otherwise, verifies all bindings.
   * @param {boolean=} warn If true, emits a user warning for verification
   *     mismatches. Otherwise, does not emit a warning.
   * @return {!Array<string>}
   * @private
   */
  ;

  _proto.verify_ = function verify_(results, elements, warn) {
    var _this17 = this;

    if (elements === void 0) {
      elements = null;
    }

    if (warn === void 0) {
      warn = true;
    }

    // Collate strings containing details of verification mismatches to return.
    var mismatches = {};
    this.boundElements_.forEach(function (boundElement) {
      var element = boundElement.element,
          boundProperties = boundElement.boundProperties; // If provided, filter elements that are _not_ children of `opt_elements`.

      if (elements && !_this17.elementsContains_(elements, element)) {
        return;
      }

      boundProperties.forEach(function (boundProperty) {
        var newValue = results[boundProperty.expressionString];

        if (newValue === undefined) {
          return;
        }

        var mismatch = _this17.verifyBinding_(boundProperty, element, newValue);

        if (!mismatch) {
          return;
        }

        var tagName = element.tagName;
        var property = boundProperty.property,
            expressionString = boundProperty.expressionString;
        var expected = mismatch.expected,
            actual = mismatch.actual; // Only store unique mismatches (dupes possible when rendering an array
        // of data to a template).

        mismatches[tagName + "[" + property + "]" + expected + ":" + actual] = true;

        if (warn) {
          (0, _log.user)().warn(TAG, "Default value (" + actual + ") does not match first " + ("result (" + expected + ") for <" + tagName + " [" + property + "]=\"") + (expressionString + "\">. We recommend writing expressions with ") + 'matching default values, but this can be safely ignored if ' + 'intentional.');
        }
      });
    });
    return Object.keys(mismatches);
  }
  /**
   * Returns true if `el` is contained within any element in `elements`.
   * @param {!Array<!Element>} elements
   * @param {!Element} el
   * @return {boolean}
   * @private
   */
  ;

  _proto.elementsContains_ = function elementsContains_(elements, el) {
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].contains(el)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Determines which properties to update based on results of evaluation
   * of all bound expression strings with the current state. This method
   * will only return properties that need to be updated along with their
   * new value.
   * @param {!Array<!BoundPropertyDef>} boundProperties
   * @param {Object<string, BindExpressionResultDef>} results
   * @return {!Array<{boundProperty: !BoundPropertyDef, newValue: BindExpressionResultDef}>}
   * @private
   */
  ;

  _proto.calculateUpdates_ = function calculateUpdates_(boundProperties, results) {
    var updates = [];
    boundProperties.forEach(function (boundProperty) {
      var expressionString = boundProperty.expressionString,
          previousResult = boundProperty.previousResult;
      var newValue = results[expressionString]; // Support equality checks for arrays of objects containing arrays.
      // Useful for rendering amp-list with amp-bind state via [src].

      if (newValue === undefined || (0, _json.deepEquals)(newValue, previousResult,
      /* depth */
      20)) {} else {
        boundProperty.previousResult = newValue;
        updates.push({
          boundProperty: boundProperty,
          newValue: newValue
        });
      }
    });
    return updates;
  }
  /**
   * Applies expression results to all elements in the document.
   * @param {Object<string, BindExpressionResultDef>} results
   * @param {boolean=} opt_skipAmpState
   * @return {!Promise}
   * @private
   */
  ;

  _proto.apply_ = function apply_(results, opt_skipAmpState) {
    var _this18 = this;

    var promises = this.boundElements_.map(function (boundElement) {
      // If this evaluation is triggered by an <amp-state> mutation, we must
      // ignore updates to any <amp-state> element to prevent update cycles.
      if (opt_skipAmpState && boundElement.element.tagName === 'AMP-STATE') {
        return Promise.resolve();
      }

      return _this18.applyBoundElement_(results, boundElement);
    });
    return Promise.all(promises);
  }
  /**
   * Applies expression results to only given elements and their descendants.
   * @param {Object<string, BindExpressionResultDef>} results
   * @param {!Array<!Element>} elements
   * @return {!Promise}
   */
  ;

  _proto.applyElements_ = function applyElements_(results, elements) {
    var _this19 = this;

    var promises = [];
    this.boundElements_.forEach(function (boundElement) {
      elements.forEach(function (element) {
        if (element.contains(boundElement.element)) {
          promises.push(_this19.applyBoundElement_(results, boundElement));
        }
      });
    });
    return Promise.all(promises);
  }
  /**
   * Applies expression results to a single BoundElementDef.
   * @param {Object<string, BindExpressionResultDef>} results
   * @param {BoundElementDef} boundElement
   * @return {!Promise}
   */
  ;

  _proto.applyBoundElement_ = function applyBoundElement_(results, boundElement) {
    var _this20 = this;

    var element = boundElement.element,
        boundProperties = boundElement.boundProperties;
    var updates = this.calculateUpdates_(boundProperties, results);

    if (updates.length === 0) {
      return Promise.resolve();
    }

    return this.resources_.mutateElement(element, function () {
      var mutations = (0, _object.map)();
      var width, height;
      updates.forEach(function (update) {
        var boundProperty = update.boundProperty,
            newValue = update.newValue;
        var property = boundProperty.property;

        var mutation = _this20.applyBinding_(boundProperty, element, newValue);

        if (mutation) {
          mutations[mutation.name] = mutation.value;

          if (property == 'width') {
            width = (0, _types.isFiniteNumber)(newValue) ? Number(newValue) : width;
          } else if (property == 'height') {
            height = (0, _types.isFiniteNumber)(newValue) ? Number(newValue) : height;
          }
        }

        _this20.dispatchFormValueChangeEventIfNecessary_(element, property);
      });

      if (width !== undefined || height !== undefined) {
        // TODO(choumx): Add new Resources method for adding change-size
        // request without scheduling vsync pass since `mutateElement()`
        // will schedule a pass after a short delay anyways.
        _this20.resources_.
        /*OK*/
        changeSize(element, height, width);
      }

      if (typeof element.mutatedAttributesCallback === 'function') {
        // Prevent an exception in the callback from interrupting execution,
        // instead wrap in user error and give a helpful message.
        try {
          element.mutatedAttributesCallback(mutations);
        } catch (e) {
          var error = (0, _log.user)().createError('%s: Applying expression results (%s) failed with error,', TAG, JSON.stringify(mutations), e);

          _this20.reportError_(error, element);
        }
      }
    });
  }
  /**
   * Dispatches an `AmpEvents.FORM_VALUE_CHANGE` if the element's changed
   * property represents the value of a form field.
   * @param {!Element} element
   * @param {string} property
   */
  ;

  _proto.dispatchFormValueChangeEventIfNecessary_ = function dispatchFormValueChangeEventIfNecessary_(element, property) {
    var isPropertyAFormValue = FORM_VALUE_PROPERTIES[element.tagName];

    if (!isPropertyAFormValue || !isPropertyAFormValue[property]) {
      return;
    } // The native `InputEvent` is dispatched at the parent `<select>` when its
    // selected `<option>` changes.


    var dispatchAt = element.tagName === 'OPTION' ? (0, _dom.closestAncestorElementBySelector)(element, 'SELECT') : element;

    if (dispatchAt) {
      var ampValueChangeEvent = (0, _eventHelper.createCustomEvent)(this.localWin_, _ampEvents.AmpEvents.FORM_VALUE_CHANGE,
      /* detail */
      null, {
        bubbles: true
      });
      dispatchAt.dispatchEvent(ampValueChangeEvent);
    }
  }
  /**
   * Mutates the bound property of `element` with `newValue`.
   * @param {!BoundPropertyDef} boundProperty
   * @param {!Element} element
   * @param {BindExpressionResultDef} newValue
   * @return {?{name: string, value:BindExpressionResultDef}}
   * @private
   */
  ;

  _proto.applyBinding_ = function applyBinding_(boundProperty, element, newValue) {
    var property = boundProperty.property;
    var tag = element.tagName;

    switch (property) {
      case 'defaulttext':
        element.textContent = String(newValue);
        break;

      case 'text':
        var stringValue = String(newValue); // If <title> element in the <head>, also update the document title.

        if (tag === 'TITLE' && element.parentNode === this.localWin_.document.head) {
          this.localWin_.document.title = stringValue;
        } // For <textarea>, [text] sets `value` (current value), while
        // [defaultText] sets `textContent` (initial value).


        if (tag === 'TEXTAREA') {
          element.value = stringValue;
        } else {
          element.textContent = stringValue;
        }

        break;

      case 'class':
        // Preserve internal AMP classes.
        var ampClasses = [];

        for (var i = 0; i < element.classList.length; i++) {
          var cssClass = element.classList[i];

          if (AMP_CSS_RE.test(cssClass)) {
            ampClasses.push(cssClass);
          }
        }

        if (Array.isArray(newValue) || typeof newValue === 'string') {
          element.setAttribute('class', ampClasses.concat(newValue).join(' '));
        } else if (newValue === null) {
          element.setAttribute('class', ampClasses.join(' '));
        } else {
          var err = (0, _log.user)().createError('%s: "%s" is not a valid result for [class].', TAG, newValue);
          this.reportError_(err, element);
        }

        break;

      default:
        // For input elements, update both the attribute (initial value) and
        // property (current value) for bindings e.g. [value].
        // TODO(choumx): Investigate if splitting into [value] and
        // [defaultValue] is possible without version bump.
        var updateProperty = tag === 'INPUT' && property in element;
        var oldValue = element.getAttribute(property);
        var mutated = false;

        if (typeof newValue === 'boolean') {
          if (updateProperty && element[property] !== newValue) {
            // Property value _must_ be read before the attribute is changed.
            // Before user interaction, attribute updates affect the property.
            element[property] = newValue;
            mutated = true;
          }

          if (newValue && oldValue !== '') {
            element.setAttribute(property, '');
            mutated = true;
          } else if (!newValue && oldValue !== null) {
            element.removeAttribute(property);
            mutated = true;
          }

          if (mutated) {
            // Safari-specific workaround for updating <select> elements
            // when a child option[selected] attribute changes.
            this.updateSelectForSafari_(element, property, newValue);
          }
        } else if (typeof newValue === 'object' && newValue !== null) {
          // If newValue is an object or array (e.g. amp-list[src] binding),
          // don't bother updating the element since attribute values like
          // "[Object object]" have no meaning in the DOM.
          mutated = true;
        } else if (newValue !== oldValue) {
          mutated = this.rewriteAttributes_(element, property, String(newValue), updateProperty);
        }

        if (mutated) {
          return {
            name: property,
            value: newValue
          };
        }

        break;
    }

    return null;
  }
  /**
   * Hopefully we can delete this with Safari 13+.
   * @param {!Element} element
   * @param {string} property
   * @param {BindExpressionResultDef} newValue
   */
  ;

  _proto.updateSelectForSafari_ = function updateSelectForSafari_(element, property, newValue) {
    // We only care about option[selected].
    if (element.tagName !== 'OPTION' || property !== 'selected') {
      return;
    } // We only care if this option was selected, not deselected.


    if (!newValue) {
      return;
    } // Workaround only needed for Safari.


    if (!_services.Services.platformFor(this.win_).isSafari()) {
      return;
    }

    var select = (0, _dom.closestAncestorElementBySelector)(element, 'select');

    if (!select) {
      return;
    } // Set corresponding selectedIndex on <select> parent.


    var index = (0, _types.toArray)(select.options).indexOf(element);

    if (index >= 0) {
      select.selectedIndex = index;
    }
  }
  /**
   * Performs CDN rewrites for the given mutation and updates the element.
   * @see amp-cache-modifications.md#url-rewrites
   * @param {!Element} element
   * @param {string} attrName
   * @param {string} value
   * @param {boolean} updateProperty If the property with the same name should
   *    be updated as well.
   * @return {boolean} Whether or not the rewrite was successful.
   * @private
   */
  ;

  _proto.rewriteAttributes_ = function rewriteAttributes_(element, attrName, value, updateProperty) {
    // Rewrite attributes if necessary. Not done in worker since it relies on
    // `url#parseUrl` which uses <a>. Worker has URL API but not on IE11.
    try {
      (0, _urlRewrite.rewriteAttributesForElement)(element, attrName, value,
      /* opt_location */
      undefined, updateProperty);
      return true;
    } catch (e) {
      var error = (0, _log.user)().createError('%s: "%s" is not a valid result for [%]', TAG, value, attrName, e);
      this.reportError_(error, element);
    }

    return false;
  }
  /**
   * If current state of `element` matches `expectedValue`, returns null.
   * Otherwise, returns a tuple containing the expected and actual values.
   * @param {!BoundPropertyDef} boundProperty
   * @param {!Element} element
   * @param {BindExpressionResultDef} expectedValue
   * @return {?{expected: *, actual: *}}
   * @private
   */
  ;

  _proto.verifyBinding_ = function verifyBinding_(boundProperty, element, expectedValue) {
    var property = boundProperty.property;
    var tagName = element.tagName; // Don't show a warning for bind-only attributes,
    // like 'slide' on amp-carousel.

    var bindOnlyAttrs = BIND_ONLY_ATTRIBUTES[tagName];

    if (bindOnlyAttrs && bindOnlyAttrs.includes(property)) {
      return null;
    }

    var initialValue;
    var match;

    switch (property) {
      case 'text':
        initialValue = element.textContent;
        expectedValue = String(expectedValue);
        match = initialValue.trim() === expectedValue.trim();
        break;

      case 'class':
        initialValue = [];

        for (var i = 0; i < element.classList.length; i++) {
          var cssClass = element.classList[i]; // Ignore internal AMP classes.

          if (AMP_CSS_RE.test(cssClass)) {
            continue;
          }

          initialValue.push(cssClass);
        }
        /** @type {!Array<string>} */


        var classes = [];

        if (Array.isArray(expectedValue)) {
          classes = expectedValue;
        } else if (typeof expectedValue === 'string') {
          var trimmed = expectedValue.trim();

          if (trimmed.length > 0) {
            classes = trimmed.split(' ');
          }
        } else {
          var err = (0, _log.user)().createError('%s: "%s" is not a valid result for [class].', TAG, expectedValue);
          this.reportError_(err, element);
        }

        match = this.compareStringArrays_(initialValue, classes);
        break;

      default:
        initialValue = element.getAttribute(property); // Boolean attributes return values of either '' or null.

        if (expectedValue === true) {
          match = initialValue === '';
        } else if (expectedValue === false) {
          match = initialValue === null;
        } else if (typeof expectedValue === 'number') {
          match = Number(initialValue) === expectedValue;
        } else {
          match = initialValue === expectedValue;
        }

        break;
    }

    return match ? null : {
      expected: expectedValue,
      actual: initialValue
    };
  }
  /**
   * @param {!Event} event
   */
  ;

  _proto.onDomUpdate_ = function onDomUpdate_(event) {
    var _this21 = this;

    var target = (0, _log.dev)().assertElement(event.target); // TODO(choumx): Consider removing this check now that slowScan_() skips
    // FAST_RESCAN_TAGS internally, and because this makes an assumption about
    // the DOM structure of the EventTarget.

    var parent = target.parentNode;

    if (parent && FAST_RESCAN_TAGS.includes(parent.nodeName)) {
      return;
    }

    (0, _log.dev)().info(TAG, 'dom_update:', target);
    this.slowScan_([target], [target], 'dom_update.end').then(function () {
      _this21.dispatchEventForTesting_(_bindEvents.BindEvents.RESCAN_TEMPLATE);
    });
  }
  /**
   * Removes bindings for nodes in `remove`, then scans for bindings in `add`.
   * Return promise that resolves upon completion with struct containing number
   * of removed and added bindings.
   * @param {!Array<!Node>} addedNodes
   * @param {!Array<!Node>} removedNodes
   * @param {string=} label
   * @return {!Promise}
   * @private
   */
  ;

  _proto.slowScan_ = function slowScan_(addedNodes, removedNodes, label) {
    var _this22 = this;

    if (label === void 0) {
      label = 'rescan.slow';
    }

    var removed = 0;
    return this.removeBindingsForNodes_(removedNodes).then(function (r) {
      removed = r;
      return _this22.addBindingsForNodes_(addedNodes);
    }).then(function (added) {
      (0, _log.dev)().info(TAG, '%s: delta=%s, total=%s', label, added - removed, _this22.numberOfBindings());
    });
  }
  /**
   * Helper for invoking a method on web worker.
   * @param {string} method
   * @param {!Array=} opt_args
   * @return {!Promise}
   */
  ;

  _proto.ww_ = function ww_(method, opt_args) {
    return (0, _ampWorker.invokeWebWorker)(this.win_, method, opt_args, this.localWin_);
  }
  /**
   * @param {{message: string, stack:string}} e
   * @param {string} message
   * @param {!Element=} opt_element
   * @return {!Error}
   * @private
   */
  ;

  _proto.reportWorkerError_ = function reportWorkerError_(e, message, opt_element) {
    var userError = (0, _log.user)().createError('%s %s', message, e.message);
    userError.stack = e.stack;
    this.reportError_(userError, opt_element);
    return userError;
  }
  /**
   * @param {!Error} error
   * @param {!Element=} opt_element
   */
  ;

  _proto.reportError_ = function reportError_(error, opt_element) {
    if ((0, _mode.getMode)().test) {
      return;
    }

    (0, _error.reportError)(error, opt_element);
  }
  /**
   * Returns true if both arrays contain the same strings.
   * @param {!(IArrayLike<string>|Array<string>)} a
   * @param {!(IArrayLike<string>|Array<string>)} b
   * @return {boolean}
   * @private
   */
  ;

  _proto.compareStringArrays_ = function compareStringArrays_(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    var sortedA = ((0, _types.isArray)(a) ? a : (0, _types.toArray)(a)).sort();
    var sortedB = ((0, _types.isArray)(b) ? b : (0, _types.toArray)(b)).sort();

    for (var i = 0; i < a.length; i++) {
      if (sortedA[i] !== sortedB[i]) {
        return false;
      }
    }

    return true;
  }
  /**
   * Copies an object containing JSON data and returns it.
   * Returns null if input object contains invalid JSON (e.g. undefined or
   * circular references).
   * @param {?JsonObject|undefined} o
   * @return {?JsonObject}
   */
  ;

  _proto.copyJsonObject_ = function copyJsonObject_(o) {
    if (o === undefined) {
      return null;
    }

    try {
      return (0, _json.parseJson)(JSON.stringify(o));
    } catch (e) {
      (0, _log.dev)().error(TAG, 'Failed to copy JSON (' + o + ') with error: ' + e);
    }

    return null;
  }
  /**
   * Print out the current state in the console.
   * @param {(!Element|string)=} opt_elementOrExpr
   * @private
   */
  ;

  _proto.debugPrintState_ = function debugPrintState_(opt_elementOrExpr) {
    if (opt_elementOrExpr) {
      if (typeof opt_elementOrExpr == 'string') {
        var value = (0, _json.getValueForExpr)(this.state_, opt_elementOrExpr);
        (0, _log.user)().info(TAG, value);
      } else if (opt_elementOrExpr.nodeType == Node.ELEMENT_NODE) {
        var element = (0, _log.user)().assertElement(opt_elementOrExpr);
        this.debugPrintElement_(element);
      } else {
        (0, _log.user)().info(TAG, 'Invalid argument. Pass a JSON expression or an ' + 'element instead e.g. AMP.printState("foo.bar") or ' + 'AMP.printState($0) after selecting an element.');
      }
    } else {
      (0, _log.user)().info(TAG, this.state_);
    }
  }
  /**
   * Print out the element's bound attributes and respective expression values.
   * @param {!Element} element
   * @private
   */
  ;

  _proto.debugPrintElement_ = function debugPrintElement_(element) {
    var _this23 = this;

    var index = (0, _array.findIndex)(this.boundElements_, function (boundElement) {
      return boundElement.element == element;
    });

    if (index < 0) {
      (0, _log.user)().info(TAG, 'Element has no bindings:', element);
      return;
    } // Evaluate expressions in bindings in `element`.


    var promises = [];
    var boundProperties = this.boundElements_[index].boundProperties;
    boundProperties.forEach(function (boundProperty) {
      var expressionString = boundProperty.expressionString;
      promises.push(_this23.evaluateExpression_(expressionString, _this23.state_));
    }); // Print the map of attribute to expression value for `element`.

    Promise.all(promises).then(function (results) {
      var output = (0, _object.map)();
      boundProperties.forEach(function (boundProperty, i) {
        var property = boundProperty.property;
        output[property] = results[i];
      });
      (0, _log.user)().info(TAG, output);
    });
  }
  /**
   * @param {string} expression
   */
  ;

  _proto.debugEvaluate_ = function debugEvaluate_(expression) {
    this.evaluateExpression_(expression, this.state_).then(function (result) {
      (0, _log.user)().info(TAG, result);
    });
  }
  /**
   * Wait for bind scan to finish for testing.
   *
   * @return {?Promise}
   * @visibleForTesting
   */
  ;

  _proto.initializePromiseForTesting = function initializePromiseForTesting() {
    return this.initializePromise_;
  }
  /**
   * Wait for bindings to evaluate and apply for testing. Should
   * be called once for each event that changes bindings.
   *
   * @return {?Promise}
   * @visibleForTesting
   */
  ;

  _proto.setStatePromiseForTesting = function setStatePromiseForTesting() {
    return this.setStatePromise_;
  }
  /**
   * @param {string} name
   * @private
   */
  ;

  _proto.dispatchEventForTesting_ = function dispatchEventForTesting_(name) {
    if ((0, _mode.getMode)().test) {
      var event;

      if (typeof this.localWin_.Event === 'function') {
        event = new Event(name, {
          bubbles: true,
          cancelable: true
        });
      } else {
        event = this.localWin_.document.createEvent('Event');
        event.initEvent(name,
        /* bubbles */
        true,
        /* cancelable */
        true);
      }

      this.localWin_.dispatchEvent(event);
    }
  };

  return Bind;
}();

exports.Bind = Bind;

},{"../../../src/action-constants":7,"../../../src/amp-events":8,"../../../src/chunk":11,"../../../src/document-ready":15,"../../../src/dom":16,"../../../src/error":18,"../../../src/event-helper":20,"../../../src/format":25,"../../../src/json":27,"../../../src/log":29,"../../../src/mode":31,"../../../src/service":33,"../../../src/services":35,"../../../src/string":38,"../../../src/types":41,"../../../src/url-rewrite":43,"../../../src/utils/array":46,"../../../src/utils/object":49,"../../../src/utils/promise":51,"../../../src/utils/rate-limit":52,"../../../src/utils/signals":53,"../../../src/web-worker/amp-worker":55,"./bind-events":4,"./bind-validator":6}],6:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.BindValidator = void 0;

var _object = require("../../../src/utils/object");

var _srcset = require("../../../src/srcset");

var _string = require("../../../src/string");

var _log = require("../../../src/log");

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
var TAG = 'amp-bind';
/**
 * @typedef {{
 *   allowedProtocols: (!Object<string,boolean>|undefined),
 *   alternativeName: (string|undefined),
 * }}
 */

var PropertyRulesDef;
/**
 * Property rules that apply to any and all tags.
 * @private {Object<string, ?PropertyRulesDef>}
 */

var GLOBAL_PROPERTY_RULES = {
  'class': {
    blacklistedValueRegex: '(^|\\W)i-amphtml-'
  },
  'hidden': null,
  'text': null
};
/**
 * Property rules that apply to all AMP elements.
 * @private {Object<string, ?PropertyRulesDef>}
 */

var AMP_PROPERTY_RULES = {
  'width': null,
  'height': null
};
/**
 * Maps tag names to property names to PropertyRulesDef.
 * If `ELEMENT_RULES[tag][property]` is null, then all values are valid
 * for that property in that tag.
 * @private {Object<string, Object<string, ?PropertyRulesDef>>}}
 */

var ELEMENT_RULES = createElementRules_();
/**
 * Map whose keys comprise all properties that contain URLs.
 * @private {Object<string, boolean>}
 */

var URL_PROPERTIES = {
  'src': true,
  'srcset': true,
  'href': true,
  'xlink:href': true
};
/**
 * BindValidator performs runtime validation of Bind expression results.
 *
 * For performance reasons, the validation rules enforced are a subset
 * of the AMP validator's, selected with a focus on security and UX.
 */

var BindValidator =
/*#__PURE__*/
function () {
  /**
   * @param {boolean} allowUrlBindings
   */
  function BindValidator(allowUrlBindings) {
    /** @const @private {boolean} */
    this.allowUrlBindings_ = allowUrlBindings;
  }
  /**
   * Returns true if (tag, property) binding is allowed.
   * Otherwise, returns false.
   * NOTE: `tag` and `property` are case-sensitive.
   * @param {string} tag
   * @param {string} property
   * @return {boolean}
   */


  var _proto = BindValidator.prototype;

  _proto.canBind = function canBind(tag, property) {
    return this.rulesForTagAndProperty_(tag, property) !== undefined;
  }
  /**
   * Returns true if `value` is a valid result for a (tag, property) binding.
   * Otherwise, returns false.
   * @param {string} tag
   * @param {string} property
   * @param {?string} value
   * @return {boolean}
   */
  ;

  _proto.isResultValid = function isResultValid(tag, property, value) {
    var rules = this.rulesForTagAndProperty_(tag, property); // `alternativeName` is a reference to another property's rules.

    if (rules && rules.alternativeName) {
      rules = this.rulesForTagAndProperty_(tag, rules.alternativeName);
    } // If binding to (tag, property) is not allowed, return false.


    if (rules === undefined) {
      return false;
    } // If binding is allowed but have no specific rules, return true.


    if (rules === null) {
      return true;
    } // Validate URL(s) if applicable.


    if (value && (0, _object.ownProperty)(URL_PROPERTIES, property)) {
      var urls;

      if (property === 'srcset') {
        var srcset;

        try {
          srcset = (0, _srcset.parseSrcset)(value);
        } catch (e) {
          (0, _log.user)().error(TAG, 'Failed to parse srcset: ', e);
          return false;
        }

        urls = srcset.getUrls();
      } else {
        urls = [value];
      }

      for (var i = 0; i < urls.length; i++) {
        if (!this.isUrlValid_(urls[i], rules)) {
          return false;
        }
      }
    } // @see validator/engine/validator.ParsedTagSpec.validateAttributes()


    var _rules = rules,
        blacklistedValueRegex = _rules.blacklistedValueRegex;

    if (value && blacklistedValueRegex) {
      var re = new RegExp(blacklistedValueRegex, 'i');

      if (re.test(value)) {
        return false;
      }
    }

    return true;
  }
  /**
   * Returns true if a url's value is valid within a property rules spec.
   * @param {string} url
   * @param {!PropertyRulesDef} rules
   * @return {boolean}
   * @private
   */
  ;

  _proto.isUrlValid_ = function isUrlValid_(url, rules) {
    // @see validator/engine/validator.js#validateUrlAndProtocol()
    if (url) {
      if (/__amp_source_origin/.test(url)) {
        return false;
      }

      var allowedProtocols = rules.allowedProtocols;

      if (allowedProtocols) {
        var re = /^([^:\/?#.]+):[\s\S]*$/;
        var match = re.exec(url);

        if (match !== null) {
          var protocol = match[1].toLowerCase().trim(); // hasOwn() needed since nested objects are not prototype-less.

          if (!(0, _object.hasOwn)(allowedProtocols, protocol)) {
            return false;
          }
        }
      }
    }

    return true;
  }
  /**
   * Returns the property rules object for (tag, property), if it exists.
   * Returns null if binding is allowed without constraints.
   * Returns undefined if binding is not allowed.
   * @param {string} tag
   * @param {string} property
   * @return {(?PropertyRulesDef|undefined)}
   * @private
   */
  ;

  _proto.rulesForTagAndProperty_ = function rulesForTagAndProperty_(tag, property) {
    // Allow binding to all ARIA attributes.
    if ((0, _string.startsWith)(property, 'aria-')) {
      return null;
    } // Disallow URL property bindings if configured as such.


    if ((0, _object.ownProperty)(URL_PROPERTIES, property) && !this.allowUrlBindings_) {
      return undefined;
    }

    var globalRules = (0, _object.ownProperty)(GLOBAL_PROPERTY_RULES, property);

    if (globalRules !== undefined) {
      return (
        /** @type {PropertyRulesDef} */
        globalRules
      );
    }

    var ampPropertyRules = (0, _object.ownProperty)(AMP_PROPERTY_RULES, property);

    if ((0, _string.startsWith)(tag, 'AMP-') && ampPropertyRules !== undefined) {
      return (
        /** @type {PropertyRulesDef} */
        ampPropertyRules
      );
    }

    var tagRules = (0, _object.ownProperty)(ELEMENT_RULES, tag);

    if (tagRules) {
      return tagRules[property];
    }

    return undefined;
  };

  return BindValidator;
}();
/**
 * @return {Object<string, Object<string, ?PropertyRulesDef>>}}
 * @private
 */


exports.BindValidator = BindValidator;

function createElementRules_() {
  // Initialize `rules` with tag-specific constraints.
  var rules = {
    'AMP-AUTOCOMPLETE': {
      'src': {
        'allowedProtocols': {
          'https': true
        }
      }
    },
    'AMP-BASE-CAROUSEL': {
      'advance-count': null,
      'auto-advance-count': null,
      'auto-advance-interval': null,
      'auto-advance-loops': null,
      'auto-advance': null,
      'horizontal': null,
      'initial-index': null,
      'loop': null,
      'mixed-length': null,
      'side-slide-count': null,
      'slide': null,
      'snap-align': null,
      'snap-by': null,
      'snap': null,
      'visible-count': null
    },
    'AMP-BRIGHTCOVE': {
      'data-account': null,
      'data-embed': null,
      'data-player': null,
      'data-player-id': null,
      'data-playlist-id': null,
      'data-video-id': null
    },
    'AMP-CAROUSEL': {
      'slide': null
    },
    'AMP-DATE-PICKER': {
      'max': null,
      'min': null,
      'src': {
        'allowedProtocols': {
          'https': true
        }
      }
    },
    'AMP-GOOGLE-DOCUMENT-EMBED': {
      'src': null,
      'title': null
    },
    'AMP-IFRAME': {
      'src': null
    },
    'AMP-IMG': {
      'alt': null,
      'attribution': null,
      'src': {
        'allowedProtocols': {
          'data': true,
          'http': true,
          'https': true
        }
      },
      'srcset': {
        'alternativeName': 'src'
      }
    },
    'AMP-LIGHTBOX': {
      'open': null
    },
    'AMP-LIST': {
      'src': {
        'allowedProtocols': {
          'https': true
        }
      },
      'state': null,
      'is-layout-container': null
    },
    'AMP-SELECTOR': {
      'disabled': null,
      'selected': null
    },
    'AMP-STATE': {
      'src': {
        'allowedProtocols': {
          'https': true
        }
      }
    },
    'AMP-TIMEAGO': {
      'datetime': null,
      'title': null
    },
    'AMP-TWITTER': {
      'data-tweetid': null
    },
    'AMP-VIDEO': {
      'alt': null,
      'attribution': null,
      'controls': null,
      'loop': null,
      'poster': null,
      'preload': null,
      'src': {
        'allowedProtocols': {
          'https': true
        }
      }
    },
    'AMP-YOUTUBE': {
      'data-videoid': null
    },
    'A': {
      'href': {
        'allowedProtocols': {
          'ftp': true,
          'http': true,
          'https': true,
          'mailto': true,
          'fb-messenger': true,
          'intent': true,
          'skype': true,
          'sms': true,
          'snapchat': true,
          'tel': true,
          'tg': true,
          'threema': true,
          'twitter': true,
          'viber': true,
          'whatsapp': true
        }
      }
    },
    'BUTTON': {
      'disabled': null,
      'type': null,
      'value': null
    },
    'DETAILS': {
      'open': null
    },
    'FIELDSET': {
      'disabled': null
    },
    'IMAGE': {
      'xlink:href': {
        'allowedProtocols': {
          'http': true,
          'https': true
        }
      }
    },
    'INPUT': {
      'accept': null,
      'accesskey': null,
      'autocomplete': null,
      'checked': null,
      'disabled': null,
      'height': null,
      'inputmode': null,
      'max': null,
      'maxlength': null,
      'min': null,
      'minlength': null,
      'multiple': null,
      'pattern': null,
      'placeholder': null,
      'readonly': null,
      'required': null,
      'selectiondirection': null,
      'size': null,
      'spellcheck': null,
      'step': null,
      'type': {
        blacklistedValueRegex: '(^|\\s)(button|image|)(\\s|$)'
      },
      'value': null,
      'width': null
    },
    'OPTION': {
      'disabled': null,
      'label': null,
      'selected': null,
      'value': null
    },
    'OPTGROUP': {
      'disabled': null,
      'label': null
    },
    'SECTION': {
      'data-expand': null
    },
    'SELECT': {
      'autofocus': null,
      'disabled': null,
      'multiple': null,
      'required': null,
      'size': null
    },
    'SOURCE': {
      'src': {
        'allowedProtocols': {
          'https': true
        }
      },
      'type': null
    },
    'TRACK': {
      'label': null,
      'src': {
        'allowedProtocols': {
          'https': true
        }
      },
      'srclang': null
    },
    'TEXTAREA': {
      'autocomplete': null,
      'autofocus': null,
      'cols': null,
      'disabled': null,
      'maxlength': null,
      'minlength': null,
      'pattern': null,
      'placeholder': null,
      'readonly': null,
      'required': null,
      'rows': null,
      'selectiondirection': null,
      'selectionend': null,
      'selectionstart': null,
      'spellcheck': null,
      'wrap': null,
      // Non-standard property.
      'defaulttext': null
    }
  };
  return rules;
}

},{"../../../src/log":29,"../../../src/srcset":36,"../../../src/string":38,"../../../src/utils/object":49}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"./services":35}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.batchFetchJsonFor = batchFetchJsonFor;
exports.requestForBatchFetch = requestForBatchFetch;
exports.UrlReplacementPolicy = void 0;

var _services = require("./services");

var _url = require("./url");

var _json = require("./json");

var _log = require("./log");

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
 * @enum {number}
 */
var UrlReplacementPolicy = {
  NONE: 0,
  OPT_IN: 1,
  ALL: 2
};
/**
 * Batch fetches the JSON endpoint at the given element's `src` attribute.
 * Sets the fetch credentials option from the element's `credentials` attribute,
 * if it exists.
 *
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!Element} element
 * @param {string=} opt_expr Dot-syntax reference to subdata of JSON result
 *     to return. If not specified, entire JSON result is returned.
 * @param {UrlReplacementPolicy=} opt_urlReplacement If ALL, replaces all URL
 *     vars. If OPT_IN, replaces whitelisted URL vars. Otherwise, don't expand..
 * @param {boolean=} opt_refresh Forces refresh of browser cache.
 * @param {string=} opt_token Auth token that forces a POST request.
 * @return {!Promise<!JsonObject|!Array<JsonObject>>} Resolved with JSON
 *     result or rejected if response is invalid.
 */

exports.UrlReplacementPolicy = UrlReplacementPolicy;

function batchFetchJsonFor(ampdoc, element, opt_expr, opt_urlReplacement, opt_refresh, opt_token) {
  if (opt_expr === void 0) {
    opt_expr = '.';
  }

  if (opt_urlReplacement === void 0) {
    opt_urlReplacement = UrlReplacementPolicy.NONE;
  }

  if (opt_refresh === void 0) {
    opt_refresh = false;
  }

  if (opt_token === void 0) {
    opt_token = undefined;
  }

  (0, _url.assertHttpsUrl)(element.getAttribute('src'), element);

  var xhr = _services.Services.batchedXhrFor(ampdoc.win);

  return requestForBatchFetch(element, opt_urlReplacement, opt_refresh).then(function (data) {
    if (opt_token !== undefined) {
      data.fetchOpt['method'] = 'POST';
      data.fetchOpt['headers'] = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };
      data.fetchOpt['body'] = {
        'ampViewerAuthToken': opt_token
      };
    }

    return xhr.fetchJson(data.xhrUrl, data.fetchOpt);
  }).then(function (res) {
    return res.json();
  }).then(function (data) {
    if (data == null) {
      throw new Error('Response is undefined.');
    }

    return (0, _json.getValueForExpr)(data, opt_expr || '.');
  });
}
/**
 * Handles url replacement and constructs the FetchInitJsonDef required for a
 * fetch.
 * @param {!Element} element
 * @param {!UrlReplacementPolicy} replacement If ALL, replaces all URL
 *     vars. If OPT_IN, replaces whitelisted URL vars. Otherwise, don't expand.
 * @param {boolean} refresh Forces refresh of browser cache.
 * @return {!Promise<!FetchRequestDef>}
 */


function requestForBatchFetch(element, replacement, refresh) {
  var url = element.getAttribute('src'); // Replace vars in URL if desired.

  var urlReplacements = _services.Services.urlReplacementsForDoc(element);

  var promise = replacement >= UrlReplacementPolicy.OPT_IN ? urlReplacements.expandUrlAsync(url) : Promise.resolve(url);
  return promise.then(function (xhrUrl) {
    // Throw user error if this element is performing URL substitutions
    // without the soon-to-be-required opt-in (#12498).
    if (replacement == UrlReplacementPolicy.OPT_IN) {
      var invalid = urlReplacements.collectUnwhitelistedVarsSync(element);

      if (invalid.length > 0) {
        throw (0, _log.user)().createError('URL variable substitutions in CORS ' + 'fetches from dynamic URLs (e.g. via amp-bind) require opt-in. ' + ("Please add data-amp-replace=\"" + invalid.join(' ') + "\" to the ") + ("<" + element.tagName + "> element. See https://bit.ly/amp-var-subs."));
      }
    }

    var fetchOpt = {};

    if (element.hasAttribute('credentials')) {
      fetchOpt.credentials = element.getAttribute('credentials');
    } // https://hacks.mozilla.org/2016/03/referrer-and-cache-control-apis-for-fetch/


    if (refresh) {
      fetchOpt.cache = 'reload';
    }

    return {
      'xhrUrl': xhrUrl,
      'fetchOpt': fetchOpt
    };
  });
}

},{"./json":27,"./log":29,"./services":35,"./url":45}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.startupChunk = startupChunk;
exports.chunk = chunk;
exports.chunkInstanceForTesting = chunkInstanceForTesting;
exports.deactivateChunking = deactivateChunking;
exports.activateChunkingForTesting = activateChunkingForTesting;
exports.runChunksForTesting = runChunksForTesting;
exports.onIdle = onIdle;
exports.ChunkPriority = void 0;

var _services = require("./services");

var _log = require("./log");

var _eventHelper = require("./event-helper");

var _service = require("./service");

var _experiments = require("./experiments");

var _styleInstaller = require("./style-installer");

var _priorityQueue = _interopRequireDefault(require("./utils/priority-queue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * @const {string}
 */
var TAG = 'CHUNK';
/**
 * @type {boolean}
 */

var deactivated = /nochunking=1/.test(self.location.hash);
/**
 * @const {!Promise}
 */

var resolved = Promise.resolve();
/**
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Chunks}
 * @private
 */

function chunkServiceForDoc(elementOrAmpDoc) {
  (0, _service.registerServiceBuilderForDoc)(elementOrAmpDoc, 'chunk', Chunks);
  return (0, _service.getServiceForDoc)(elementOrAmpDoc, 'chunk');
}
/**
 * Run the given function. For visible documents the function will be
 * called in a micro task (Essentially ASAP). If the document is
 * not visible, tasks will yield to the event loop (to give the browser
 * time to do other things) and may even be further delayed until
 * there is time.
 *
 * @param {!Document|!./service/ampdoc-impl.AmpDoc} doc
 * @param {function(?IdleDeadline)} fn
 * @param {boolean=} opt_makesBodyVisible Pass true if this service makes
 *     the body visible. This is relevant because it may influence the
 *     task scheduling strategy.
 */


function startupChunk(doc, fn, opt_makesBodyVisible) {
  if (deactivated) {
    resolved.then(fn);
    return;
  }

  var service = chunkServiceForDoc(doc.documentElement || doc);
  service.runForStartup(fn);

  if (opt_makesBodyVisible) {
    service.runForStartup(function () {
      service.bodyIsVisible_ = true;
    });
  }
}
/**
 * Run the given function sometime in the future without blocking UI.
 *
 * Higher priority tasks are executed before lower priority tasks.
 * Tasks with the same priority are executed in FIFO order.
 *
 * Uses `requestIdleCallback` if available and passes the `IdleDeadline`
 * object to the function, which can be used to perform a variable amount
 * of work depending on the remaining amount of idle time.
 *
 * @param {!Element|!ShadowRoot|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @param {function(?IdleDeadline)} fn
 * @param {ChunkPriority} priority
 */


function chunk(elementOrAmpDoc, fn, priority) {
  if (deactivated) {
    resolved.then(fn);
    return;
  }

  var service = chunkServiceForDoc(elementOrAmpDoc);
  service.run(fn, priority);
}
/**
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Chunks}
 */


function chunkInstanceForTesting(elementOrAmpDoc) {
  return chunkServiceForDoc(elementOrAmpDoc);
}
/**
 * Use a standard micro task for every invocation. This should only
 * be called from the AMP bootstrap script if it is known that
 * chunking makes no sense. In particular this is the case when
 * AMP runs in the `amp-shadow` multi document mode.
 */


function deactivateChunking() {
  deactivated = true;
}
/**
 * @visibleForTesting
 */


function activateChunkingForTesting() {
  deactivated = false;
}
/**
 * Runs all currently scheduled chunks.
 * Independent of errors it will unwind the queue. Will afterwards
 * throw the first encountered error.
 * @param {!Element|!./service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 */


function runChunksForTesting(elementOrAmpDoc) {
  var service = chunkInstanceForTesting(elementOrAmpDoc);
  var errors = [];

  while (true) {
    try {
      if (!service.execute_(
      /* idleDeadline */
      null)) {
        break;
      }
    } catch (e) {
      errors.push(e);
    }
  }

  if (errors.length) {
    throw errors[0];
  }
}
/**
 * The priority of a chunk task. Higher priority tasks have higher values.
 * @enum {number}
 */


var ChunkPriority = {
  HIGH: 20,
  LOW: 10,
  BACKGROUND: 0
};
/** @enum {string} */

exports.ChunkPriority = ChunkPriority;
var TaskState = {
  NOT_RUN: 'not_run',
  RUN: 'run'
};
/**
 * A default chunkable task.
 * @private
 */

var Task =
/*#__PURE__*/
function () {
  /**
   * @param {function(?IdleDeadline)} fn
   */
  function Task(fn) {
    /** @public {TaskState} */
    this.state = TaskState.NOT_RUN;
    /** @private @const {!function(?IdleDeadline)} */

    this.fn_ = fn;
  }
  /**
   * Executes the wrapped function.
   * @param {?IdleDeadline} idleDeadline
   * @throws {Error}
   * @protected
   */


  var _proto = Task.prototype;

  _proto.runTask_ = function runTask_(idleDeadline) {
    if (this.state == TaskState.RUN) {
      return;
    }

    this.state = TaskState.RUN;

    try {
      this.fn_(idleDeadline);
    } catch (e) {
      this.onTaskError_(e);
      throw e;
    }
  }
  /**
   * @return {string}
   * @protected
   */
  ;

  _proto.getName_ = function getName_() {
    return this.fn_.displayName || this.fn_.name;
  }
  /**
   * Optional handling when a task run throws an error.
   * @param {Error} unusedError
   * @private
   */
  ;

  _proto.onTaskError_ = function onTaskError_(unusedError) {} // By default, no-op.

  /**
   * Returns true if this task should be run without delay.
   * @return {boolean}
   * @protected
   */
  ;

  _proto.immediateTriggerCondition_ = function immediateTriggerCondition_() {
    // By default, there are no immediate trigger conditions.
    return false;
  }
  /**
   * Returns true if this task should be scheduled using `requestIdleCallback`.
   * Otherwise, task is scheduled as macro-task on next event loop.
   * @return {boolean}
   * @protected
   */
  ;

  _proto.useRequestIdleCallback_ = function useRequestIdleCallback_() {
    // By default, never use requestIdleCallback.
    return false;
  };

  return Task;
}();
/**
 * A task that's run as part of AMP's startup sequence.
 * @private
 */


var StartupTask =
/*#__PURE__*/
function (_Task) {
  _inheritsLoose(StartupTask, _Task);

  /**
   * @param {function(?IdleDeadline)} fn
   * @param {!Window} win
   * @param {!Chunks} chunks
   */
  function StartupTask(fn, win, chunks) {
    var _this;

    _this = _Task.call(this, fn) || this;
    /** @private @const */

    _this.chunks_ = chunks;
    return _this;
  }
  /** @override */


  var _proto2 = StartupTask.prototype;

  _proto2.onTaskError_ = function onTaskError_(unusedError) {
    // Startup tasks run early in init. All errors should show the doc.
    (0, _styleInstaller.makeBodyVisibleRecovery)(self.document);
  }
  /** @override */
  ;

  _proto2.immediateTriggerCondition_ = function immediateTriggerCondition_() {
    // Run in a micro task when the doc is visible. Otherwise, run after
    // having yielded to the event queue once.
    return this.isVisible_();
  }
  /** @override */
  ;

  _proto2.useRequestIdleCallback_ = function useRequestIdleCallback_() {
    // We only start using requestIdleCallback when the core runtime has
    // been initialized. Otherwise we risk starving ourselves
    // before the render-critical work is done.
    return this.chunks_.coreReady_;
  }
  /**
   * @return {boolean}
   * @private
   */
  ;

  _proto2.isVisible_ = function isVisible_() {
    return this.chunks_.ampdoc.isVisible();
  };

  return StartupTask;
}(Task);
/**
 * Handles queueing, scheduling and executing tasks.
 */


var Chunks =
/*#__PURE__*/
function () {
  /**
   * @param {!./service/ampdoc-impl.AmpDoc} ampDoc
   */
  function Chunks(ampDoc) {
    var _this2 = this;

    /** @protected @const {!./service/ampdoc-impl.AmpDoc} */
    this.ampdoc = ampDoc;
    /** @private @const {!Window} */

    this.win_ = ampDoc.win;
    /** @private @const {!PriorityQueue<Task>} */

    this.tasks_ = new _priorityQueue.default();
    /** @private @const {function(?IdleDeadline)} */

    this.boundExecute_ = this.execute_.bind(this);
    /** @private {number} */

    this.durationOfLastExecution_ = 0;
    /** @private {boolean} */

    this.macroAfterLongTask_ = (0, _experiments.isExperimentOn)(this.win_, 'macro-after-long-task');
    /**
     * Set to true if we scheduled a macro or micro task to execute the next
     * task. If true, we don't schedule another one.
     * Not set to true if we use rIC, because we always want to transition
     * to immeditate invocation from that state.
     * @private {boolean}
     */

    this.scheduledImmediateInvocation_ = false;
    /** @private {boolean} Whether the document can actually be painted. */

    this.bodyIsVisible_ = this.win_.document.documentElement.hasAttribute('i-amphtml-no-boilerplate');
    this.win_.addEventListener('message', function (e) {
      if ((0, _eventHelper.getData)(e) == 'amp-macro-task') {
        _this2.execute_(
        /* idleDeadline */
        null);
      }
    });
    /** @protected {boolean} */

    this.coreReady_ = false;

    _services.Services.viewerPromiseForDoc(ampDoc).then(function () {
      // Once the viewer has been resolved, most of core runtime has been
      // initialized as well.
      _this2.coreReady_ = true;
    });

    ampDoc.onVisibilityChanged(function () {
      if (ampDoc.isVisible()) {
        _this2.schedule_();
      }
    });
  }
  /**
   * Run fn as a "chunk".
   * @param {function(?IdleDeadline)} fn
   * @param {number} priority
   */


  var _proto3 = Chunks.prototype;

  _proto3.run = function run(fn, priority) {
    var t = new Task(fn);
    this.enqueueTask_(t, priority);
  }
  /**
   * Run a fn that's part of AMP's startup sequence as a "chunk".
   * @param {function(?IdleDeadline)} fn
   */
  ;

  _proto3.runForStartup = function runForStartup(fn) {
    var t = new StartupTask(fn, this.win_, this);
    this.enqueueTask_(t, Number.POSITIVE_INFINITY);
  }
  /**
   * Queues a task to be executed later with given priority.
   * @param {!Task} task
   * @param {number} priority
   * @private
   */
  ;

  _proto3.enqueueTask_ = function enqueueTask_(task, priority) {
    this.tasks_.enqueue(task, priority);
    this.schedule_();
  }
  /**
   * Returns the next task that hasn't been run yet.
   * If `opt_dequeue` is true, remove the returned task from the queue.
   * @param {boolean=} opt_dequeue
   * @return {?Task}
   * @private
   */
  ;

  _proto3.nextTask_ = function nextTask_(opt_dequeue) {
    var t = this.tasks_.peek(); // Dequeue tasks until we find one that hasn't been run yet.

    while (t && t.state !== TaskState.NOT_RUN) {
      this.tasks_.dequeue();
      t = this.tasks_.peek();
    } // If `opt_dequeue` is true, remove this task from the queue.


    if (t && opt_dequeue) {
      this.tasks_.dequeue();
    }

    return t;
  }
  /**
   * Run a task.
   * Schedule the next round if there are more tasks.
   * @param {?IdleDeadline} idleDeadline
   * @return {boolean} Whether anything was executed.
   * @private
   */
  ;

  _proto3.execute_ = function execute_(idleDeadline) {
    var _this3 = this;

    var t = this.nextTask_(
    /* opt_dequeue */
    true);

    if (!t) {
      this.scheduledImmediateInvocation_ = false;
      this.durationOfLastExecution_ = 0;
      return false;
    }

    var before;

    try {
      before = Date.now();
      t.runTask_(idleDeadline);
    } finally {
      // We want to capture the time of the entire task duration including
      // scheduled immediate (from resolved promises) micro tasks.
      // Lacking a better way to do this we just scheduled 10 nested
      // micro tasks.
      resolved.then().then().then().then().then().then().then().then().then(function () {
        _this3.scheduledImmediateInvocation_ = false;
        _this3.durationOfLastExecution_ += Date.now() - before;
        (0, _log.dev)().fine(TAG, t.getName_(), 'Chunk duration', Date.now() - before, _this3.durationOfLastExecution_);

        _this3.schedule_();
      });
    }

    return true;
  }
  /**
   * Calls `execute_()` asynchronously.
   * @param {?IdleDeadline} idleDeadline
   * @private
   */
  ;

  _proto3.executeAsap_ = function executeAsap_(idleDeadline) {
    var _this4 = this;

    // If we've spent over 5 millseconds executing the
    // last instruction yeild back to the main thread.
    // 5 milliseconds is a magic number.
    if (this.macroAfterLongTask_ && this.bodyIsVisible_ && this.durationOfLastExecution_ > 5) {
      this.durationOfLastExecution_ = 0;
      this.requestMacroTask_();
      return;
    }

    resolved.then(function () {
      _this4.boundExecute_(idleDeadline);
    });
  }
  /**
   * Schedule running the next queued task.
   * @private
   */
  ;

  _proto3.schedule_ = function schedule_() {
    if (this.scheduledImmediateInvocation_) {
      return;
    }

    var nextTask = this.nextTask_();

    if (!nextTask) {
      return;
    }

    if (nextTask.immediateTriggerCondition_()) {
      this.scheduledImmediateInvocation_ = true;
      this.executeAsap_(
      /* idleDeadline */
      null);
      return;
    } // If requestIdleCallback exists, schedule a task with it, but
    // do not wait longer than two seconds.


    if (nextTask.useRequestIdleCallback_() && this.win_.requestIdleCallback) {
      onIdle(this.win_, // Wait until we have a budget of at least 15ms.
      // 15ms is a magic number. Budgets are higher when the user
      // is completely idle (around 40), but that occurs too
      // rarely to be usable. 15ms budgets can happen during scrolling
      // but only if the device is doing super, super well, and no
      // real processing is done between frames.
      15
      /* minimumTimeRemaining */
      , 2000
      /* timeout */
      , this.boundExecute_);
      return;
    }

    this.requestMacroTask_();
  }
  /**
   * Requests executing of a macro task. Yields to the event queue
   * before executing the task.
   * Places task on browser message queue which then respectively
   * triggers dequeuing and execution of a chunk.
   */
  ;

  _proto3.requestMacroTask_ = function requestMacroTask_() {
    // The message doesn't actually matter.
    this.win_.
    /*OK*/
    postMessage('amp-macro-task', '*');
  };

  return Chunks;
}();
/**
 * Delays calling the given function until the browser is notifying us
 * about a certain minimum budget or the timeout is reached.
 * @param {!Window} win
 * @param {number} minimumTimeRemaining Minimum number of millis idle
 *     budget for callback to fire.
 * @param {number} timeout in millis for callback to fire.
 * @param {function(?IdleDeadline)} fn Callback.
 * @visibleForTesting
 */


function onIdle(win, minimumTimeRemaining, timeout, fn) {
  var startTime = Date.now();
  /**
   * @param {!IdleDeadline} info
   */

  function rIC(info) {
    if (info.timeRemaining() < minimumTimeRemaining) {
      var remainingTimeout = timeout - (Date.now() - startTime);

      if (remainingTimeout <= 0 || info.didTimeout) {
        (0, _log.dev)().fine(TAG, 'Timed out', timeout, info.didTimeout);
        fn(info);
      } else {
        (0, _log.dev)().fine(TAG, 'Rescheduling with', remainingTimeout, info.timeRemaining());
        win.requestIdleCallback(rIC, {
          timeout: remainingTimeout
        });
      }
    } else {
      (0, _log.dev)().fine(TAG, 'Running idle callback with ', minimumTimeRemaining);
      fn(info);
    }
  }

  win.requestIdleCallback(rIC, {
    timeout: timeout
  });
}

},{"./event-helper":20,"./experiments":21,"./log":29,"./service":33,"./services":35,"./style-installer":39,"./utils/priority-queue":50}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"../third_party/css-escape/css-escape":56,"./log":29}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./css":14,"./log":29,"./string":38,"./types":41,"./utils/object":49,"./utils/promise":51}],17:[function(require,module,exports){
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

},{"./dom":16,"./log":29,"./service":33,"./types":41}],18:[function(require,module,exports){
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

},{"./amp-events":8,"./analytics":9,"./config":13,"./event-helper":20,"./experiments":21,"./exponential-backoff":22,"./log":29,"./mode":31,"./services":35,"./string":38,"./style-installer":39,"./url":45,"./utils/object":49}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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

},{"./dom":16,"./event-helper-listen":19,"./log":29}],21:[function(require,module,exports){
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

},{"./log":29,"./mode":31,"./url":45,"./utils/object":49}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"./dom":16,"./form":24,"./services":35,"./utils/object":49}],24:[function(require,module,exports){
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

},{"./dom":16}],25:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isAmp4Email = isAmp4Email;
exports.isAmphtml = isAmphtml;

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
 * Checks that the document is of an AMP format type.
 * @param {!Array<string>} formats
 * @param {!Document} doc
 * @return {boolean}
 */
function isAmpFormatType(formats, doc) {
  var html = doc.documentElement;
  var isFormatType = formats.some(function (format) {
    return html.hasAttribute(format);
  });
  return isFormatType;
}
/**
 * @param {!Document} doc
 * @return {boolean}
 */


function isAmp4Email(doc) {
  return isAmpFormatType(['⚡4email', 'amp4email'], doc);
}
/**
 * @param {!Document} doc
 * @return {boolean}
 */


function isAmphtml(doc) {
  return isAmpFormatType(['⚡', 'amp'], doc);
}

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{"./dom":16,"./types":41}],28:[function(require,module,exports){
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

},{"./log":29,"./static-template":37,"./string":38,"./style":40,"./types":41}],29:[function(require,module,exports){
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

},{"./config":13,"./internal-version":26,"./mode":31,"./mode-object":30,"./types":41,"./utils/function":47}],30:[function(require,module,exports){
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

},{"./mode":31}],31:[function(require,module,exports){
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

},{"./internal-version":26,"./url-parse-query-string":42}],32:[function(require,module,exports){
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

},{"./log":29,"./service":33,"./services":35}],33:[function(require,module,exports){
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

},{"./experiments":21,"./log":29,"./types":41,"./utils/promise":51}],34:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.calculateScriptBaseUrl = calculateScriptBaseUrl;
exports.calculateExtensionScriptUrl = calculateExtensionScriptUrl;
exports.calculateEntryPointScriptUrl = calculateEntryPointScriptUrl;
exports.parseExtensionUrl = parseExtensionUrl;

var _mode = require("../mode");

var _config = require("../config");

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
 * Internal structure that maintains the state of an extension through loading.
 *
 * @typedef {{
 *   extensionId: (string|undefined),
 *   extensionVersion: (string|undefined),
 * }}
 * @private
 */
var ExtensionInfoDef;
/**
 * Calculate the base url for any scripts.
 * @param {!Location} location The window's location
 * @param {boolean=} opt_isLocalDev
 * @return {string}
 */

function calculateScriptBaseUrl(location, opt_isLocalDev) {
  if (opt_isLocalDev) {
    var prefix = location.protocol + "//" + location.host;

    if (location.protocol == 'about:') {
      prefix = '';
    }

    return prefix + "/dist";
  }

  return _config.urls.cdn;
}
/**
 * Calculates if we need a single pass folder or not.
 *
 * @return {string}
 */


function getSinglePassExperimentPath() {
  return (0, _mode.getMode)().singlePassType ? (0, _mode.getMode)().singlePassType + "/" : '';
}
/**
 * Calculate script url for an extension.
 * @param {!Location} location The window's location
 * @param {string} extensionId
 * @param {string=} opt_extensionVersion
 * @param {boolean=} opt_isLocalDev
 * @return {string}
 */


function calculateExtensionScriptUrl(location, extensionId, opt_extensionVersion, opt_isLocalDev) {
  var base = calculateScriptBaseUrl(location, opt_isLocalDev);
  var rtv = (0, _mode.getMode)().rtvVersion;

  if (opt_extensionVersion == null) {
    opt_extensionVersion = '0.1';
  }

  var extensionVersion = opt_extensionVersion ? '-' + opt_extensionVersion : '';
  var spPath = getSinglePassExperimentPath();
  return base + "/rtv/" + rtv + "/" + spPath + "v0/" + extensionId + extensionVersion + ".js";
}
/**
 * Calculate script url for an entry point.
 * If `opt_rtv` is true, returns the URL matching the current RTV.
 * @param {!Location} location The window's location
 * @param {string} entryPoint
 * @param {boolean=} isLocalDev
 * @param {boolean=} opt_rtv
 * @return {string}
 */


function calculateEntryPointScriptUrl(location, entryPoint, isLocalDev, opt_rtv) {
  var base = calculateScriptBaseUrl(location, isLocalDev);

  if (opt_rtv) {
    var spPath = getSinglePassExperimentPath();
    return base + "/rtv/" + (0, _mode.getMode)().rtvVersion + "/" + spPath + entryPoint + ".js";
  }

  return base + "/" + entryPoint + ".js";
}
/**
 * Parse the extension version from a given script URL.
 * @param {string} scriptUrl
 * @return {!ExtensionInfoDef}
 */


function parseExtensionUrl(scriptUrl) {
  var regex = /^(.*)\/(.*)-([0-9.]+)\.js$/i;
  var matches = scriptUrl.match(regex);
  return {
    extensionId: matches ? matches[2] : undefined,
    extensionVersion: matches ? matches[3] : undefined
  };
}

},{"../config":13,"../mode":31}],35:[function(require,module,exports){
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

},{"./element-service":17,"./service":33}],36:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.srcsetFromElement = srcsetFromElement;
exports.srcsetFromSrc = srcsetFromSrc;
exports.parseSrcset = parseSrcset;
exports.Srcset = void 0;

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
 * A single source within a srcset. Only one: width or DPR can be specified at
 * a time.
 * @typedef {{
 *   url: string,
 *   width: (number|undefined),
 *   dpr: (number|undefined)
 * }}
 */
var SrcsetSourceDef;
/**
 * General grammar: (URL [NUM[w|x]],)*
 * Example 1: "image1.png 100w, image2.png 50w"
 * Example 2: "image1.png 2x, image2.png"
 * Example 3: "image1,100w.png 100w, image2.png 50w"
 */

var srcsetRegex = /(\S+)(?:\s+(?:(-?\d+(?:\.\d+)?)([a-zA-Z]*)))?\s*(?:,|$)/g;
/**
 * Extracts `srcset` and fallbacks to `src` if not available.
 * @param {!Element} element
 * @return {!Srcset}
 */

function srcsetFromElement(element) {
  var srcsetAttr = element.getAttribute('srcset');

  if (srcsetAttr) {
    return parseSrcset(srcsetAttr);
  } // We can't push `src` via `parseSrcset` because URLs in `src` are not always
  // RFC compliant and can't be easily parsed as an `srcset`. For instance,
  // they sometimes contain space characters.


  var srcAttr = (0, _log.userAssert)(element.getAttribute('src'), 'Either non-empty "srcset" or "src" attribute must be specified: %s', element);
  return srcsetFromSrc(srcAttr);
}
/**
 * Creates a Srcset from a `src` attribute value.
 * @param {string} src
 * @return {!Srcset}
 */


function srcsetFromSrc(src) {
  return new Srcset([{
    url: src,
    width: undefined,
    dpr: 1
  }]);
}
/**
 * Parses the text representation of srcset into Srcset object.
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes.
 * See http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
 * @param {string} s
 * @return {!Srcset}
 */


function parseSrcset(s) {
  var sources = [];
  var match;

  while (match = srcsetRegex.exec(s)) {
    var url = match[1];
    var width = void 0,
        dpr = void 0;

    if (match[2]) {
      var type = match[3].toLowerCase();

      if (type == 'w') {
        width = parseInt(match[2], 10);
      } else if (type == 'x') {
        dpr = parseFloat(match[2]);
      } else {
        continue;
      }
    } else {
      // If no "w" or "x" specified, we assume it's "1x".
      dpr = 1;
    }

    sources.push({
      url: url,
      width: width,
      dpr: dpr
    });
  }

  return new Srcset(sources);
}
/**
 * A srcset object contains one or more sources.
 *
 * There are two types of sources: width-based and DPR-based. Only one type
 * of sources allowed to be specified within a single srcset. Depending on a
 * usecase, the components are free to choose any source that best corresponds
 * to the required rendering quality and network and CPU conditions. See
 * "select" method for details on how this selection is performed.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Attributes
 */


var Srcset =
/*#__PURE__*/
function () {
  /**
   * @param {!Array<!SrcsetSourceDef>} sources
   */
  function Srcset(sources) {
    (0, _log.userAssert)(sources.length > 0, 'Srcset must have at least one source');
    /** @private @const {!Array<!SrcsetSourceDef>} */

    this.sources_ = sources; // Only one type of source specified can be used - width or DPR.

    var hasWidth = false;
    var hasDpr = false;

    for (var i = 0; i < sources.length; i++) {
      var source = sources[i];
      hasWidth = hasWidth || !!source.width;
      hasDpr = hasDpr || !!source.dpr;
    }

    (0, _log.userAssert)(!!(hasWidth ^ hasDpr), 'Srcset must have width or dpr sources, but not both'); // Source and assert duplicates.

    sources.sort(hasWidth ? sortByWidth : sortByDpr);
    /** @private @const {boolean} */

    this.widthBased_ = hasWidth;
  }
  /**
   * Performs selection for specified width and DPR. Here, width is the width
   * in screen pixels and DPR is the device-pixel-ratio or pixel density of
   * the device. Depending on the circumstances, such as low network conditions,
   * it's possible to manipulate the result of this method by passing a lower
   * DPR value.
   *
   * The source selection depends on whether this is width-based or DPR-based
   * srcset.
   *
   * In a width-based source, the source's width is the physical width of a
   * resource (e.g. an image). Depending on the provided DPR, this width is
   * converted to the screen pixels as following:
   *   pixelWidth = sourceWidth / DPR
   *
   * Then, the source closest to the requested "width" is selected using
   * the "pixelWidth". The slight preference is given to the bigger sources to
   * ensure the most optimal quality.
   *
   * In a DPR-based source, the source's DPR is used to return the source that
   * is closest to the requested DPR.
   *
   * Based on
   * http://www.w3.org/html/wg/drafts/html/master/semantics.html#attr-img-srcset.
   * @param {number} width
   * @param {number} dpr
   * @return {string}
   */


  var _proto = Srcset.prototype;

  _proto.select = function select(width, dpr) {
    (0, _log.devAssert)(width, 'width=%s', width);
    (0, _log.devAssert)(dpr, 'dpr=%s', dpr);
    var index = 0;

    if (this.widthBased_) {
      index = this.selectByWidth_(width * dpr);
    } else {
      index = this.selectByDpr_(dpr);
    }

    return this.sources_[index].url;
  }
  /**
   * @param {number} width
   * @return {number}
   * @private
   */
  ;

  _proto.selectByWidth_ = function selectByWidth_(width) {
    var sources = this.sources_;
    var minIndex = 0;
    var minScore = Infinity;
    var minWidth = Infinity;

    for (var i = 0; i < sources.length; i++) {
      var sWidth = sources[i].width;
      var score = Math.abs(sWidth - width); // Select the one that is closer with a slight preference toward larger
      // widths. If smaller size is closer, enforce minimum ratio to ensure
      // image isn't too distorted.

      if (score <= minScore * 1.1 || width / minWidth > 1.2) {
        minIndex = i;
        minScore = score;
        minWidth = sWidth;
      } else {
        break;
      }
    }

    return minIndex;
  }
  /**
   * @param {number} dpr
   * @return {number}
   * @private
   */
  ;

  _proto.selectByDpr_ = function selectByDpr_(dpr) {
    var sources = this.sources_;
    var minIndex = 0;
    var minScore = Infinity;

    for (var i = 0; i < sources.length; i++) {
      var score = Math.abs(sources[i].dpr - dpr);

      if (score <= minScore) {
        minIndex = i;
        minScore = score;
      } else {
        break;
      }
    }

    return minIndex;
  }
  /**
   * Returns all URLs in the srcset.
   * @return {!Array<string>}
   */
  ;

  _proto.getUrls = function getUrls() {
    return this.sources_.map(function (s) {
      return s.url;
    });
  }
  /**
   * Reconstructs the string expression for this srcset.
   * @param {function(string):string=} opt_mapper
   * @return {string}
   */
  ;

  _proto.stringify = function stringify(opt_mapper) {
    var res = [];
    var sources = this.sources_;

    for (var i = 0; i < sources.length; i++) {
      var source = sources[i];
      var src = source.url;

      if (opt_mapper) {
        src = opt_mapper(src);
      }

      if (this.widthBased_) {
        src += " " + source.width + "w";
      } else {
        src += " " + source.dpr + "x";
      }

      res.push(src);
    }

    return res.join(', ');
  };

  return Srcset;
}();
/**
 * Sorts by width
 *
 * @param {number} s1
 * @param {number} s2
 * @return {number}
 */


exports.Srcset = Srcset;

function sortByWidth(s1, s2) {
  (0, _log.userAssert)(s1.width != s2.width, 'Duplicate width: %s', s1.width);
  return s1.width - s2.width;
}
/**
 * Sorts by dpr
 *
 * @param {!Object} s1
 * @param {!Object} s2
 * @return {number}
 */


function sortByDpr(s1, s2) {
  (0, _log.userAssert)(s1.dpr != s2.dpr, 'Duplicate dpr: %s', s1.dpr);
  return s1.dpr - s2.dpr;
}

},{"./log":29}],37:[function(require,module,exports){
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

},{"./log":29,"./utils/object.js":49}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{"./common-signals":12,"./dom":16,"./log":29,"./render-delaying-services":32,"./service":33,"./services":35,"./style":40,"./utils/object":49}],40:[function(require,module,exports){
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

},{"./log":29,"./string":38,"./utils/object.js":49}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
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

},{"./url-try-decode-uri-component":44}],43:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.rewriteAttributesForElement = rewriteAttributesForElement;
exports.rewriteAttributeValue = rewriteAttributeValue;
exports.isUrlAttribute = isUrlAttribute;
exports.resolveUrlAttr = resolveUrlAttr;

var _url = require("./url");

var _srcset = require("./srcset");

var _string = require("./string");

var _config = require("./config");

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
var TAG = 'URL-REWRITE';
/** @private @const {string} */

var ORIGINAL_TARGET_VALUE = '__AMP_ORIGINAL_TARGET_VALUE_';
/**
 * The same as rewriteAttributeValue() but actually updates the element and
 * modifies other related attribute(s) for special cases, i.e. `target` for <a>.
 * @param {!Element} element
 * @param {string} attrName
 * @param {string} attrValue
 * @param {!Location=} opt_location
 * @param {boolean=} opt_updateProperty
 * @return {string}
 */

function rewriteAttributesForElement(element, attrName, attrValue, opt_location, opt_updateProperty) {
  var tag = element.tagName.toLowerCase();
  var attr = attrName.toLowerCase();
  var rewrittenValue = rewriteAttributeValue(tag, attr, attrValue); // When served from proxy (CDN), changing an <a> tag from a hash link to a
  // non-hash link requires updating `target` attribute per cache modification
  // rules. @see amp-cache-modifications.md#url-rewrites

  var isProxy = (0, _url.isProxyOrigin)(opt_location || self.location);

  if (isProxy && tag === 'a' && attr === 'href') {
    var oldValue = element.getAttribute(attr);
    var newValueIsHash = rewrittenValue[0] === '#';
    var oldValueIsHash = oldValue && oldValue[0] === '#';

    if (newValueIsHash && !oldValueIsHash) {
      // Save the original value of `target` so it can be restored (if needed).
      if (!element[ORIGINAL_TARGET_VALUE]) {
        element[ORIGINAL_TARGET_VALUE] = element.getAttribute('target');
      }

      element.removeAttribute('target');
    } else if (oldValueIsHash && !newValueIsHash) {
      // Restore the original value of `target` or default to `_top`.
      element.setAttribute('target', element[ORIGINAL_TARGET_VALUE] || '_top');
    }
  }

  if (opt_updateProperty) {
    // Must be done first for <input> elements to correctly update the UI for
    // the first change on Safari and Chrome.
    element[attr] = rewrittenValue;
  }

  element.setAttribute(attr, rewrittenValue);
  return rewrittenValue;
}
/**
 * If (tagName, attrName) is a CDN-rewritable URL attribute, returns the
 * rewritten URL value. Otherwise, returns the unchanged `attrValue`.
 * See resolveUrlAttr() for rewriting rules.
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {string} attrValue
 * @return {string}
 * @private
 * @visibleForTesting
 */


function rewriteAttributeValue(tagName, attrName, attrValue) {
  if (isUrlAttribute(attrName)) {
    return resolveUrlAttr(tagName, attrName, attrValue, self.location);
  }

  return attrValue;
}
/**
 * @param {string} attrName Lowercase attribute name.
 * @return {boolean}
 */


function isUrlAttribute(attrName) {
  return attrName == 'src' || attrName == 'href' || attrName == 'srcset';
}
/**
 * Rewrites the URL attribute values. URLs are rewritten as following:
 * - If URL is absolute, it is not rewritten
 * - If URL is relative, it's rewritten as absolute against the source origin
 * - If resulting URL is a `http:` URL and it's for image, the URL is rewritten
 *   again to be served with AMP Cache (cdn.ampproject.org).
 *
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {string} attrValue
 * @param {!Location} windowLocation
 * @return {string}
 * @private
 * @visibleForTesting
 */


function resolveUrlAttr(tagName, attrName, attrValue, windowLocation) {
  (0, _url.checkCorsUrl)(attrValue);
  var isProxyHost = (0, _url.isProxyOrigin)(windowLocation);
  var baseUrl = (0, _url.parseUrlDeprecated)((0, _url.getSourceUrl)(windowLocation));

  if (attrName == 'href' && !(0, _string.startsWith)(attrValue, '#')) {
    return (0, _url.resolveRelativeUrl)(attrValue, baseUrl);
  }

  if (attrName == 'src') {
    if (tagName == 'amp-img') {
      return resolveImageUrlAttr(attrValue, baseUrl, isProxyHost);
    }

    return (0, _url.resolveRelativeUrl)(attrValue, baseUrl);
  }

  if (attrName == 'srcset') {
    var srcset;

    try {
      srcset = (0, _srcset.parseSrcset)(attrValue);
    } catch (e) {
      // Do not fail the whole template just because one srcset is broken.
      // An AMP element will pick it up and report properly.
      (0, _log.user)().error(TAG, 'Failed to parse srcset: ', e);
      return attrValue;
    }

    return srcset.stringify(function (url) {
      return resolveImageUrlAttr(url, baseUrl, isProxyHost);
    });
  }

  return attrValue;
}
/**
 * Non-HTTPs image URLs are rewritten via proxy.
 * @param {string} attrValue
 * @param {!Location} baseUrl
 * @param {boolean} isProxyHost
 * @return {string}
 */


function resolveImageUrlAttr(attrValue, baseUrl, isProxyHost) {
  var src = (0, _url.parseUrlDeprecated)((0, _url.resolveRelativeUrl)(attrValue, baseUrl)); // URLs such as `data:` or proxy URLs are returned as is. Unsafe protocols
  // do not arrive here - already stripped by the sanitizer.

  if (src.protocol == 'data:' || (0, _url.isProxyOrigin)(src) || !isProxyHost) {
    return src.href;
  } // Rewrite as a proxy URL.


  return _config.urls.cdn + "/i/" + (src.protocol == 'https:' ? 's/' : '') + encodeURIComponent(src.host) + src.pathname + (src.search || '') + (src.hash || '');
}

},{"./config":13,"./log":29,"./srcset":36,"./string":38,"./url":45}],44:[function(require,module,exports){
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

},{}],45:[function(require,module,exports){
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

},{"./config":13,"./log":29,"./mode":31,"./string":38,"./types":41,"./url-parse-query-string":42,"./url-try-decode-uri-component":44,"./utils/lru-cache":48,"./utils/object":49}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
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

},{}],48:[function(require,module,exports){
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

},{"../log":29}],49:[function(require,module,exports){
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

},{"../types":41}],50:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.default = void 0;

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
 * A priority queue backed with sorted array.
 * @template T
 */
var PriorityQueue =
/*#__PURE__*/
function () {
  /**
   * Creates an instance of PriorityQueue.
   */
  function PriorityQueue() {
    /** @private @const {Array<{item: T, priority: number}>} */
    this.queue_ = [];
  }
  /**
   * Returns the max priority item without dequeueing it.
   * @return {T}
   */


  var _proto = PriorityQueue.prototype;

  _proto.peek = function peek() {
    var l = this.queue_.length;

    if (!l) {
      return null;
    }

    return this.queue_[l - 1].item;
  }
  /**
   * Enqueues an item with the given priority.
   * @param {T} item
   * @param {number} priority
   */
  ;

  _proto.enqueue = function enqueue(item, priority) {
    if (isNaN(priority)) {
      throw new Error('Priority must not be NaN.');
    }

    var i = this.binarySearch_(priority);
    this.queue_.splice(i, 0, {
      item: item,
      priority: priority
    });
  }
  /**
   * Returns index at which item with `target` priority should be inserted.
   * @param {number} target
   * @return {number}
   * @private
   */
  ;

  _proto.binarySearch_ = function binarySearch_(target) {
    var i = -1;
    var lo = 0;
    var hi = this.queue_.length;

    while (lo <= hi) {
      i = Math.floor((lo + hi) / 2); // This means `target` is the new max priority in the queue.

      if (i === this.queue_.length) {
        break;
      } // Stop searching once p[i] >= target AND p[i-1] < target.
      // This way, we'll return the index of the first occurence of `target`
      // priority (if any), which preserves FIFO order of same-priority items.


      if (this.queue_[i].priority < target) {
        lo = i + 1;
      } else if (i > 0 && this.queue_[i - 1].priority >= target) {
        hi = i - 1;
      } else {
        break;
      }
    }

    return i;
  }
  /**
   * @param {function(T)} callback
   */
  ;

  _proto.forEach = function forEach(callback) {
    var index = this.queue_.length;

    while (index--) {
      callback(this.queue_[index].item);
    }
  }
  /**
   * Dequeues the max priority item.
   * Items with the same priority are dequeued in FIFO order.
   * @return {T}
   */
  ;

  _proto.dequeue = function dequeue() {
    if (!this.queue_.length) {
      return null;
    }

    return this.queue_.pop().item;
  }
  /**
   * The number of items in the queue.
   * @return {number}
   */
  ;

  _createClass(PriorityQueue, [{
    key: "length",
    get: function get() {
      return this.queue_.length;
    }
  }]);

  return PriorityQueue;
}();

exports.default = PriorityQueue;

},{}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.Signals = void 0;

var _promise2 = require("./promise");

var _object = require("./object");

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
 * This object tracts signals and allows blocking until a signal has been
 * received.
 */
var Signals =
/*#__PURE__*/
function () {
  /**
   * Creates an instance of Signals.
   */
  function Signals() {
    /**
     * A mapping from a signal name to the signal response: either time or
     * an error.
     * @private @const {!Object<string, (time|!Error)>}
     */
    this.map_ = (0, _object.map)();
    /**
     * A mapping from a signal name to the signal promise, resolve and reject.
     * Only allocated when promise has been requested.
     * @private {?Object<string, {
     *   promise: !Promise,
     *   resolve: (function(time)|undefined),
     *   reject: (function(!Error)|undefined)
     * }>}
     */

    this.promiseMap_ = null;
  }
  /**
   * Returns the current known value of the signal. If signal is not yet
   * available, `null` is returned.
   * @param {string} name
   * @return {number|!Error|null}
   */


  var _proto = Signals.prototype;

  _proto.get = function get(name) {
    var v = this.map_[name];
    return v == null ? null : v;
  }
  /**
   * Returns the promise that's resolved when the signal is triggered. The
   * resolved value is the time of the signal.
   * @param {string} name
   * @return {!Promise<time>}
   */
  ;

  _proto.whenSignal = function whenSignal(name) {
    var promiseStruct = this.promiseMap_ && this.promiseMap_[name];

    if (!promiseStruct) {
      var result = this.map_[name];

      if (result != null) {
        // Immediately resolve signal.
        var promise = typeof result == 'number' ? Promise.resolve(result) : Promise.reject(result);
        promiseStruct = {
          promise: promise
        };
      } else {
        // Allocate the promise/resolver for when the signal arrives in the
        // future.
        var deferred = new _promise2.Deferred();
        var _promise = deferred.promise,
            resolve = deferred.resolve,
            reject = deferred.reject;
        promiseStruct = {
          promise: _promise,
          resolve: resolve,
          reject: reject
        };
      }

      if (!this.promiseMap_) {
        this.promiseMap_ = (0, _object.map)();
      }

      this.promiseMap_[name] = promiseStruct;
    }

    return promiseStruct.promise;
  }
  /**
   * Triggers the signal with the specified name on the element. The time is
   * optional; if not provided, the current time is used. The associated
   * promise is resolved with the resulting time.
   * @param {string} name
   * @param {time=} opt_time
   */
  ;

  _proto.signal = function signal(name, opt_time) {
    if (this.map_[name] != null) {
      // Do not duplicate signals.
      return;
    }

    var time = opt_time || Date.now();
    this.map_[name] = time;
    var promiseStruct = this.promiseMap_ && this.promiseMap_[name];

    if (promiseStruct && promiseStruct.resolve) {
      promiseStruct.resolve(time);
      promiseStruct.resolve = undefined;
      promiseStruct.reject = undefined;
    }
  }
  /**
   * Rejects the signal. Indicates that the signal will never succeed. The
   * associated signal is rejected.
   * @param {string} name
   * @param {!Error} error
   */
  ;

  _proto.rejectSignal = function rejectSignal(name, error) {
    if (this.map_[name] != null) {
      // Do not duplicate signals.
      return;
    }

    this.map_[name] = error;
    var promiseStruct = this.promiseMap_ && this.promiseMap_[name];

    if (promiseStruct && promiseStruct.reject) {
      promiseStruct.reject(error);
      promiseStruct.resolve = undefined;
      promiseStruct.reject = undefined;
    }
  }
  /**
   * Resets all signals.
   * @param {string} name
   */
  ;

  _proto.reset = function reset(name) {
    if (this.map_[name]) {
      delete this.map_[name];
    } // Reset promise it has already been resolved.


    var promiseStruct = this.promiseMap_ && this.promiseMap_[name];

    if (promiseStruct && !promiseStruct.resolve) {
      delete this.promiseMap_[name];
    }
  };

  return Signals;
}();

exports.Signals = Signals;

},{"./object":49,"./promise":51}],54:[function(require,module,exports){
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

},{"../experiments":21,"../form-data-wrapper":23,"../log":29,"../mode":31,"../services":35,"../types":41,"../url":45,"./array":46,"./object":49}],55:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.invokeWebWorker = invokeWebWorker;
exports.ampWorkerForTesting = ampWorkerForTesting;

var _mode = require("../mode");

var _services = require("../services");

var _extensionLocation = require("../service/extension-location");

var _log = require("../log");

var _service = require("../service");

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
var TAG = 'web-worker';
/**
 * @typedef {{method: string, resolve: !Function, reject: !Function}}
 */

var PendingMessageDef;
/**
 * Invokes function named `method` with args `opt_args` on the web worker
 * and returns a Promise that will be resolved with the function's return value.
 *
 * If `opt_localWin` is provided, method will be executed in a scope limited
 * to other invocations with `opt_localWin`.
 *
 * Note: Currently only works in a single entry point (amp-bind.js).
 *
 * @param {!Window} win
 * @param {string} method
 * @param {!Array=} opt_args
 * @param {!Window=} opt_localWin
 * @return {!Promise}
 */

function invokeWebWorker(win, method, opt_args, opt_localWin) {
  if (!win.Worker) {
    return Promise.reject('Worker not supported in window.');
  }

  (0, _service.registerServiceBuilder)(win, 'amp-worker', AmpWorker);
  var worker = (0, _service.getService)(win, 'amp-worker');
  return worker.sendMessage_(method, opt_args || [], opt_localWin);
}
/**
 * @param {!Window} win
 * @return {!AmpWorker}
 * @visibleForTesting
 */


function ampWorkerForTesting(win) {
  (0, _service.registerServiceBuilder)(win, 'amp-worker', AmpWorker);
  return (0, _service.getService)(win, 'amp-worker');
}
/**
 * A Promise-based API wrapper around a single Web Worker.
 * @private
 */


var AmpWorker =
/*#__PURE__*/
function () {
  /**
   * @param {!Window} win
   */
  function AmpWorker(win) {
    var _this = this;

    /** @const @private {!Window} */
    this.win_ = win;
    /** @const @private {!../service/xhr-impl.Xhr} */

    this.xhr_ = _services.Services.xhrFor(win); // Use `testLocation` for testing with iframes. @see testing/iframe.js.

    var loc = win.location;

    if ((0, _mode.getMode)().test && win.testLocation) {
      loc = win.testLocation;
    } // Use RTV to make sure we fetch prod/canary/experiment correctly.


    var useLocal = (0, _mode.getMode)().localDev || (0, _mode.getMode)().test;
    var useRtvVersion = !useLocal;
    var url = (0, _extensionLocation.calculateEntryPointScriptUrl)(loc, 'ww', useLocal, useRtvVersion);
    (0, _log.dev)().fine(TAG, 'Fetching web worker from', url);
    /** @private {Worker} */

    this.worker_ = null;
    /** @const @private {!Promise} */

    this.fetchPromise_ = this.xhr_.fetchText(url, {
      ampCors: false,
      bypassInterceptorForDev: (0, _mode.getMode)().localDev
    }).then(function (res) {
      return res.text();
    }).then(function (text) {
      // Workaround since Worker constructor only accepts same origin URLs.
      var blob = new win.Blob([text + '\n//# sourceurl=' + url], {
        type: 'text/javascript'
      });
      var blobUrl = win.URL.createObjectURL(blob);
      _this.worker_ = new win.Worker(blobUrl);
      _this.worker_.onmessage = _this.receiveMessage_.bind(_this);
    });
    /**
     * Array of in-flight messages pending response from worker.
     * @const @private {!Object<number, PendingMessageDef>}
     */

    this.messages_ = {};
    /**
     * Monotonically increasing integer that increments on each message.
     * @private {number}
     */

    this.counter_ = 0;
    /**
     * Array of top-level and local windows passed into `invokeWebWorker`.
     * Used to uniquely identify windows for scoping worker functions when
     * a single worker is used for multiple windows (i.e. FIE).
     * @const @private {!Array<!Window>}
     */

    this.windows_ = [win];
  }
  /**
   * Sends a method invocation request to the worker and returns a Promise.
   * @param {string} method
   * @param {!Array} args
   * @param {Window=} opt_localWin
   * @return {!Promise}
   * @private
   * @restricted
   */


  var _proto = AmpWorker.prototype;

  _proto.sendMessage_ = function sendMessage_(method, args, opt_localWin) {
    var _this2 = this;

    return this.fetchPromise_.then(function () {
      return new Promise(function (resolve, reject) {
        var id = _this2.counter_++;
        _this2.messages_[id] = {
          method: method,
          resolve: resolve,
          reject: reject
        };

        var scope = _this2.idForWindow_(opt_localWin || _this2.win_);

        var message =
        /** @type {ToWorkerMessageDef} */
        {
          method: method,
          args: args,
          scope: scope,
          id: id
        };

        _this2.worker_.
        /*OK*/
        postMessage(message);
      });
    });
  }
  /**
   * Receives the result of a method invocation from the worker and resolves
   * the Promise returned from the corresponding `sendMessage_()` call.
   * @param {!MessageEvent} event
   * @private
   */
  ;

  _proto.receiveMessage_ = function receiveMessage_(event) {
    var _event$data =
    /** @type {FromWorkerMessageDef} */
    event.data,
        method = _event$data.method,
        returnValue = _event$data.returnValue,
        id = _event$data.id;
    var message = this.messages_[id];

    if (!message) {
      (0, _log.dev)().error(TAG, "Received unexpected message (" + method + ", " + id + ") from worker.");
      return;
    }

    (0, _log.devAssert)(method == message.method, 'Received mismatched method ' + ("(" + method + ", " + id + "), expected " + message.method + "."));
    message.resolve(returnValue);
    delete this.messages_[id];
  }
  /**
   * @return {boolean}
   * @visibleForTesting
   */
  ;

  _proto.hasPendingMessages = function hasPendingMessages() {
    return Object.keys(this.messages_).length > 0;
  }
  /**
   * Returns an identifier for `win`, unique for set of windows seen so far.
   * @param {!Window} win
   * @return {number}
   * @private
   */
  ;

  _proto.idForWindow_ = function idForWindow_(win) {
    var index = this.windows_.indexOf(win);

    if (index >= 0) {
      return index;
    } else {
      return this.windows_.push(win) - 1;
    }
  }
  /**
   * @return {!Promise}
   * @visibleForTesting
   */
  ;

  _proto.fetchPromiseForTesting = function fetchPromiseForTesting() {
    return this.fetchPromise_;
  };

  return AmpWorker;
}();

},{"../log":29,"../mode":31,"../service":33,"../service/extension-location":34,"../services":35}],56:[function(require,module,exports){
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
//# sourceMappingURL=amp-bind-0.1.max.js.map
