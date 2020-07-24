(self.AMP=self.AMP||[]).push({n:"amp-analytics",v:"1910151804560",f:(function(AMP,_){
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.installActivityServiceForTesting = installActivityServiceForTesting;
exports.Activity = void 0;

var _services = require("../../../src/services");

var _object = require("../../../src/utils/object");

var _eventHelper = require("../../../src/event-helper");

var _service = require("../../../src/service");

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
 * @fileoverview Provides an ability to collect data about activities the user
 * has performed on the page.
 */

/**
 * The amount of time after an activity the user is considered engaged.
 * @private @const {number}
 */
var DEFAULT_ENGAGED_SECONDS = 5;
/**
 * @enum {string}
 */

var ActivityEventType = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};
/**
 * @typedef {{
 *   type: string,
 *   time: number
 * }}
 */

var ActivityEventDef;
/**
 * Find the engaged time between the event and the time (exclusive of the time)
 * @param {ActivityEventDef} activityEvent
 * @param {number} time
 * @return {number}
 * @private
 */

function findEngagedTimeBetween(activityEvent, time) {
  var engagementBonus = 0;

  if (activityEvent.type === ActivityEventType.ACTIVE) {
    engagementBonus = DEFAULT_ENGAGED_SECONDS;
  }

  return Math.min(time - activityEvent.time, engagementBonus);
}

var ActivityHistory =
/*#__PURE__*/
function () {
  /**
   * Creates an instance of ActivityHistory.
   */
  function ActivityHistory() {
    /** @private {number} */
    this.totalEngagedTime_ = 0;
    /**
     * prevActivityEvent_ remains undefined until the first valid push call.
     * @private {ActivityEventDef|undefined}
     */

    this.prevActivityEvent_ = undefined;
  }
  /**
   * Indicate that an activity took place at the given time.
   * @param {ActivityEventDef} activityEvent
   */


  var _proto = ActivityHistory.prototype;

  _proto.push = function push(activityEvent) {
    if (!this.prevActivityEvent_) {
      this.prevActivityEvent_ = activityEvent;
    }

    if (this.prevActivityEvent_.time < activityEvent.time) {
      this.totalEngagedTime_ += findEngagedTimeBetween(this.prevActivityEvent_, activityEvent.time);
      this.prevActivityEvent_ = activityEvent;
    }
  }
  /**
   * Get the total engaged time up to the given time recorded in
   * ActivityHistory.
   * @param {number} time
   * @return {number}
   */
  ;

  _proto.getTotalEngagedTime = function getTotalEngagedTime(time) {
    var totalEngagedTime = 0;

    if (this.prevActivityEvent_ !== undefined) {
      totalEngagedTime = this.totalEngagedTime_ + findEngagedTimeBetween(this.prevActivityEvent_, time);
    }

    return totalEngagedTime;
  };

  return ActivityHistory;
}();
/**
 * Array of event types which will be listened for on the document to indicate
 * activity. Other activities are also observed on the AmpDoc and Viewport
 * objects. See {@link setUpActivityListeners_} for listener implementation.
 * @private @const {Array<string>}
 */


var ACTIVE_EVENT_TYPES = ['mousedown', 'mouseup', 'mousemove', 'keydown', 'keyup'];
/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
 */

function installActivityServiceForTesting(ampDoc) {
  (0, _service.registerServiceBuilderForDoc)(ampDoc, 'activity', Activity);
}

var Activity =
/*#__PURE__*/
function () {
  /**
   * Activity tracks basic user activity on the page.
   *  - Listeners are not registered on the activity event types until the
   *    AmpDoc's `whenFirstVisible` is resolved.
   *  - When the `whenFirstVisible` of AmpDoc is resolved, a first activity
   *    is recorded.
   *  - The first activity in any second causes all other activities to be
   *    ignored. This is similar to debounce functionality since some events
   *    (e.g. scroll) could occur in rapid succession.
   *  - In any one second period, active events or inactive events can override
   *    each other. Whichever type occured last has precedence.
   *  - Active events give a 5 second "bonus" to engaged time.
   *  - Inactive events cause an immediate stop to the engaged time bonus of
   *    any previous activity event.
   *  - At any point after instantiation, `getTotalEngagedTime` can be used
   *    to get the engage time up to the time the function is called. If
   *    `whenFirstVisible` has not yet resolved, engaged time is 0.
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function Activity(ampdoc) {
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc */
    this.ampdoc = ampdoc;
    /** @private @const {function()} */

    this.boundStopIgnore_ = this.stopIgnore_.bind(this);
    /** @private @const {function()} */

    this.boundHandleActivity_ = this.handleActivity_.bind(this);
    /** @private @const {function()} */

    this.boundHandleVisibilityChange_ = this.handleVisibilityChange_.bind(this);
    /**
     * Contains the incrementalEngagedTime timestamps for named triggers.
     * @private {Object<string, number>}
     */

    this.totalEngagedTimeByTrigger_ = {
      /*
       * "$triggerName" : ${lastRequestTimestamp}
       */
    };
    /** @private {Array<!UnlistenDef>} */

    this.unlistenFuncs_ = [];
    /** @private {boolean} */

    this.ignoreActivity_ = false;
    /** @private {boolean} */

    this.ignoreInactive_ = false;
    /** @private @const {!ActivityHistory} */

    this.activityHistory_ = new ActivityHistory();
    /** @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface} */

    this.viewport_ = _services.Services.viewportForDoc(this.ampdoc);
    this.ampdoc.whenFirstVisible().then(this.start_.bind(this));
  }
  /** @private */


  var _proto2 = Activity.prototype;

  _proto2.start_ = function start_() {
    /** @private @const {number} */
    this.startTime_ = Date.now(); // record an activity since this is when the page became visible

    this.handleActivity_();
    this.setUpActivityListeners_();
  }
  /**
   * @private
   * @return {number}
   */
  ;

  _proto2.getTimeSinceStart_ = function getTimeSinceStart_() {
    var timeSinceStart = Date.now() - this.startTime_; // Ensure that a negative time is never returned. This may cause loss of
    // data if there is a time change during the session but it will decrease
    // the likelyhood of errors in that situation.

    return timeSinceStart > 0 ? timeSinceStart : 0;
  }
  /**
   * Return to a state where neither activities or inactivity events are
   * ignored when that event type is fired.
   * @private
   */
  ;

  _proto2.stopIgnore_ = function stopIgnore_() {
    this.ignoreActivity_ = false;
    this.ignoreInactive_ = false;
  }
  /** @private */
  ;

  _proto2.setUpActivityListeners_ = function setUpActivityListeners_() {
    for (var i = 0; i < ACTIVE_EVENT_TYPES.length; i++) {
      this.unlistenFuncs_.push((0, _eventHelper.listen)(this.ampdoc.getRootNode(), ACTIVE_EVENT_TYPES[i], this.boundHandleActivity_));
    }

    this.unlistenFuncs_.push(this.ampdoc.onVisibilityChanged(this.boundHandleVisibilityChange_)); // Viewport.onScroll does not return an unlisten function.
    // TODO(britice): If Viewport is updated to return an unlisten function,
    // update this to capture the unlisten function.

    this.viewport_.onScroll(this.boundHandleActivity_);
  }
  /** @private */
  ;

  _proto2.handleActivity_ = function handleActivity_() {
    if (this.ignoreActivity_) {
      return;
    }

    this.ignoreActivity_ = true;
    this.ignoreInactive_ = false;
    this.handleActivityEvent_(ActivityEventType.ACTIVE);
  }
  /** @private */
  ;

  _proto2.handleInactive_ = function handleInactive_() {
    if (this.ignoreInactive_) {
      return;
    }

    this.ignoreInactive_ = true;
    this.ignoreActivity_ = false;
    this.handleActivityEvent_(ActivityEventType.INACTIVE);
  }
  /**
   * @param {ActivityEventType} type
   * @private
   */
  ;

  _proto2.handleActivityEvent_ = function handleActivityEvent_(type) {
    var timeSinceStart = this.getTimeSinceStart_();
    var secondKey = Math.floor(timeSinceStart / 1000);
    var timeToWait = 1000 - timeSinceStart % 1000; // stop ignoring activity at the start of the next activity bucket

    setTimeout(this.boundStopIgnore_, timeToWait);
    this.activityHistory_.push({
      type: type,
      time: secondKey
    });
  }
  /** @private */
  ;

  _proto2.handleVisibilityChange_ = function handleVisibilityChange_() {
    if (this.ampdoc.isVisible()) {
      this.handleActivity_();
    } else {
      this.handleInactive_();
    }
  }
  /**
   * Remove all listeners associated with this Activity instance.
   * @private
   */
  ;

  _proto2.unlisten_ = function unlisten_() {
    for (var i = 0; i < this.unlistenFuncs_.length; i++) {
      var unlistenFunc = this.unlistenFuncs_[i]; // TODO(britice): Due to eslint typechecking, this check may not be
      // necessary.

      if (typeof unlistenFunc === 'function') {
        unlistenFunc();
      }
    }

    this.unlistenFuncs_ = [];
  }
  /**
   * @private
   * @visibleForTesting
   */
  ;

  _proto2.cleanup_ = function cleanup_() {
    this.unlisten_();
  }
  /**
   * Get total engaged time since the page became visible.
   * @return {number}
   */
  ;

  _proto2.getTotalEngagedTime = function getTotalEngagedTime() {
    var secondsSinceStart = Math.floor(this.getTimeSinceStart_() / 1000);
    return this.activityHistory_.getTotalEngagedTime(secondsSinceStart);
  }
  /**
   * Get the incremental engaged time since the last push and reset it if asked.
   * @param {string} name
   * @param {boolean=} reset
   * @return {number}
   */
  ;

  _proto2.getIncrementalEngagedTime = function getIncrementalEngagedTime(name, reset) {
    if (reset === void 0) {
      reset = true;
    }

    if (!(0, _object.hasOwn)(this.totalEngagedTimeByTrigger_, name)) {
      if (reset) {
        this.totalEngagedTimeByTrigger_[name] = this.getTotalEngagedTime();
      }

      return this.getTotalEngagedTime();
    }

    var currentIncrementalEngagedTime = this.totalEngagedTimeByTrigger_[name];

    if (reset === false) {
      return this.getTotalEngagedTime() - currentIncrementalEngagedTime;
    }

    this.totalEngagedTimeByTrigger_[name] = this.getTotalEngagedTime();
    return this.totalEngagedTimeByTrigger_[name] - currentIncrementalEngagedTime;
  };

  return Activity;
}();

exports.Activity = Activity;

},{"../../../src/event-helper":114,"../../../src/service":131,"../../../src/services":141,"../../../src/utils/object":154}],2:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AmpAnalytics = void 0;

var _activityImpl = require("./activity-impl");

var _config = require("./config");

var _events = require("./events");

var _cookieWriter = require("./cookie-writer");

var _variables = require("./variables");

var _instrumentation = require("./instrumentation");

var _layout = require("../../../src/layout");

var _linkerManager = require("./linker-manager");

var _requests = require("./requests");

var _services = require("../../../src/services");

var _transport = require("./transport");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _string = require("../../../src/string");

var _mode = require("../../../src/mode");

var _linkerReader = require("./linker-reader");

var _types = require("../../../src/types");

var _dom = require("../../../src/dom");

var _iframeHelper = require("../../../src/iframe-helper");

var _style = require("../../../src/style");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var TAG = 'amp-analytics';
var MAX_REPLACES = 16; // The maximum number of entries in a extraUrlParamsReplaceMap

var WHITELIST_EVENT_IN_SANDBOX = [_events.AnalyticsEventType.VISIBLE, _events.AnalyticsEventType.HIDDEN];

var AmpAnalytics =
/*#__PURE__*/
function (_AMP$BaseElement) {
  _inheritsLoose(AmpAnalytics, _AMP$BaseElement);

  /** @param {!AmpElement} element */
  function AmpAnalytics(element) {
    var _this;

    _this = _AMP$BaseElement.call(this, element) || this;
    /** @private {!Promise} */

    _this.consentPromise_ = Promise.resolve();
    /**
     * The html id of the `amp-user-notification` element.
     * @private {?string}
     */

    _this.consentNotificationId_ = null;
    /** @private {boolean} */

    _this.isSandbox_ = false;
    /**
     * @private {Object<string, RequestHandler>} A map of request handler with requests
     */

    _this.requests_ = {};
    /**
     * @private {!JsonObject}
     */

    _this.config_ = (0, _object.dict)();
    /** @private {?./instrumentation.InstrumentationService} */

    _this.instrumentation_ = null;
    /** @private {?./analytics-group.AnalyticsGroup} */

    _this.analyticsGroup_ = null;
    /** @private {?./variables.VariableService} */

    _this.variableService_ = null;
    /** @private {!../../../src/service/crypto-impl.Crypto} */

    _this.cryptoService_ = _services.Services.cryptoFor(_this.win);
    /** @private {?Promise} */

    _this.iniPromise_ = null;
    /** @private {./transport.Transport} */

    _this.transport_ = null;
    /** @private {boolean} */

    _this.isInabox_ = (0, _mode.getMode)(_this.win).runtime == 'inabox';
    /** @private {?./linker-manager.LinkerManager} */

    _this.linkerManager_ = null;
    return _this;
  }
  /** @override */


  var _proto = AmpAnalytics.prototype;

  _proto.getLayoutPriority = function getLayoutPriority() {
    // Load immediately if inabox, otherwise after other content.
    return this.isInabox_ ? _layout.LayoutPriority.CONTENT : _layout.LayoutPriority.METADATA;
  }
  /** @override */
  ;

  _proto.isAlwaysFixed = function isAlwaysFixed() {
    return !(0, _iframeHelper.isInFie)(this.element);
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

    this.isSandbox_ = this.element.hasAttribute('sandbox');
    this.element.setAttribute('aria-hidden', 'true');
    this.consentNotificationId_ = this.element.getAttribute('data-consent-notification-id');

    if (this.consentNotificationId_ != null) {
      this.consentPromise_ = _services.Services.userNotificationManagerForDoc(this.element).then(function (service) {
        return service.get((0, _log.dev)().assertString(_this2.consentNotificationId_));
      });
    }

    if (this.element.getAttribute('trigger') == 'immediate') {
      this.ensureInitialized_();
    }
  }
  /** @override */
  ;

  _proto.layoutCallback = function layoutCallback() {
    // Now that we are rendered, stop rendering the element to reduce
    // resource consumption.
    return this.ensureInitialized_();
  }
  /** @override */
  ;

  _proto.detachedCallback = function detachedCallback() {
    if (this.analyticsGroup_) {
      this.analyticsGroup_.dispose();
      this.analyticsGroup_ = null;
    }

    if (this.linkerManager_) {
      this.linkerManager_.dispose();
      this.linkerManager_ = null;
    }

    for (var request in this.requests_) {
      this.requests_[request].dispose();
      delete this.requests_[request];
    }
  }
  /** @override */
  ;

  _proto.resumeCallback = function resumeCallback() {
    var _this3 = this;

    if (this.iniPromise_) {
      this.iniPromise_.then(function () {
        _this3.transport_.maybeInitIframeTransport(_this3.getAmpDoc().win, _this3.element);
      });
    }
  }
  /** @override */
  ;

  _proto.unlayoutCallback = function unlayoutCallback() {
    var _this4 = this;

    if (this.getAmpDoc().isVisible()) {
      // amp-analytics tag was just set to display:none. Page is still loaded.
      return false;
    }

    if (this.iniPromise_) {
      this.iniPromise_.then(function () {
        // Page was unloaded - free up owned resources.
        _this4.transport_.deleteIframeTransport();
      });
    }

    return _AMP$BaseElement.prototype.unlayoutCallback.call(this);
  }
  /**
   * @return {!Promise}
   * @private
   */
  ;

  _proto.ensureInitialized_ = function ensureInitialized_() {
    var _this5 = this;

    if (this.iniPromise_) {
      return this.iniPromise_;
    }

    (0, _style.toggle)(this.element, false);
    this.iniPromise_ = this.getAmpDoc().whenFirstVisible() // Rudimentary "idle" signal.
    .then(function () {
      return _services.Services.timerFor(_this5.win).promise(1);
    }).then(function () {
      return _this5.consentPromise_;
    }).then(function () {
      return _services.Services.ampdocServiceFor(_this5.win);
    }).then(function (ampDocService) {
      return ampDocService.getAmpDoc(_this5.element);
    }).then(function (ampdoc) {
      return Promise.all([(0, _instrumentation.instrumentationServicePromiseForDoc)(ampdoc), (0, _variables.variableServicePromiseForDoc)(ampdoc)]);
    }).then(function (services) {
      _this5.instrumentation_ = services[0];
      _this5.variableService_ = services[1];
      return new _config.AnalyticsConfig(_this5.element).loadConfig();
    }).then(function (config) {
      _this5.config_ =
      /** @type {!JsonObject} */
      config;
      return new _cookieWriter.CookieWriter(_this5.win, _this5.element, _this5.config_).write();
    }).then(function () {
      _this5.transport_ = new _transport.Transport(_this5.win, _this5.config_['transport'] || {});
    }).then(this.registerTriggers_.bind(this)).then(this.initializeLinker_.bind(this));
    return this.iniPromise_;
  }
  /**
   * Registers triggers.
   * @return {!Promise|undefined}
   * @private
   */
  ;

  _proto.registerTriggers_ = function registerTriggers_() {
    var _this6 = this;

    if (this.hasOptedOut_()) {
      // Nothing to do when the user has opted out.
      var _TAG = this.getName_();

      (0, _log.user)().fine(_TAG, 'User has opted out. No hits will be sent.');
      return Promise.resolve();
    }

    this.generateRequests_();

    if (!this.config_['triggers']) {
      var _TAG2 = this.getName_();

      this.user().error(_TAG2, 'No triggers were found in the ' + 'config. No analytics data will be sent.');
      return Promise.resolve();
    }

    this.processExtraUrlParams_(this.config_['extraUrlParams'], this.config_['extraUrlParamsReplaceMap']);
    this.analyticsGroup_ = this.instrumentation_.createAnalyticsGroup(this.element);
    this.transport_.maybeInitIframeTransport(this.getAmpDoc().win, this.element, this.preconnect);
    var promises = []; // Trigger callback can be synchronous. Do the registration at the end.

    for (var k in this.config_['triggers']) {
      if ((0, _object.hasOwn)(this.config_['triggers'], k)) {
        var _ret = function () {
          var trigger = _this6.config_['triggers'][k];

          var expansionOptions = _this6.expansionOptions_((0, _object.dict)({}), trigger, undefined, true);

          var TAG = _this6.getName_();

          if (!trigger) {
            _this6.user().error(TAG, 'Trigger should be an object: ', k);

            return "continue";
          }

          var hasRequestOrPostMessage = trigger['request'] || trigger['parentPostMessage'] && _this6.isInabox_;

          if (!trigger['on'] || !hasRequestOrPostMessage) {
            var errorMsgSeg = _this6.isInabox_ ? '/"parentPostMessage"' : '';

            _this6.user().error(TAG, '"on" and "request"' + errorMsgSeg + ' attributes are required for data to be collected.');

            return "continue";
          } // Check for not supported trigger for sandboxed analytics


          if (_this6.isSandbox_) {
            var eventType = trigger['on'];

            if ((0, _types.isEnumValue)(_events.AnalyticsEventType, eventType) && !WHITELIST_EVENT_IN_SANDBOX.includes(eventType)) {
              _this6.user().error(TAG, eventType + ' is not supported for amp-analytics in scope');

              return "continue";
            }
          }

          _this6.processExtraUrlParams_(trigger['extraUrlParams'], _this6.config_['extraUrlParamsReplaceMap']);

          promises.push(_this6.isSampledIn_(trigger).then(function (result) {
            if (!result) {
              return;
            } // replace selector and selectionMethod


            if (_this6.isSandbox_) {
              // Only support selection of parent element for analytics in scope
              if (!_this6.element.parentElement) {
                // In case parent element has been removed from DOM, do nothing
                return;
              }

              trigger['selector'] = _this6.element.parentElement.tagName;
              trigger['selectionMethod'] = 'closest';

              _this6.addTrigger_(trigger);
            } else if (trigger['selector']) {
              // Expand the selector using variable expansion.
              return _this6.variableService_.expandTemplate(trigger['selector'], expansionOptions).then(function (selector) {
                trigger['selector'] = selector;

                _this6.addTrigger_(trigger);
              });
            } else {
              _this6.addTrigger_(trigger);
            }
          }));
        }();

        if (_ret === "continue") continue;
      }
    }

    return Promise.all(promises);
  }
  /**
   * Asks the browser to preload a URL. Always also does a preconnect
   * because browser support for that is better.
   *
   * @param {string} url
   * @param {string=} opt_preloadAs
   * @visibleForTesting
   */
  ;

  _proto.preload = function preload(url, opt_preloadAs) {
    this.preconnect.preload(url, opt_preloadAs);
  }
  /**
   * Calls `AnalyticsGroup.addTrigger` and reports any errors.
   * @param {!JsonObject} config
   * @private
   * @noinline
   */
  ;

  _proto.addTrigger_ = function addTrigger_(config) {
    if (!this.analyticsGroup_) {
      // No need to handle trigger for component that has already been detached
      // from DOM
      return;
    }

    try {
      this.analyticsGroup_.addTrigger(config, this.handleEvent_.bind(this, config));
    } catch (e) {
      var _TAG3 = this.getName_();

      var eventType = config['on'];
      (0, _log.rethrowAsync)(_TAG3, 'Failed to process trigger "' + eventType + '"', e);
    }
  }
  /**
   * Replace the names of keys in params object with the values in replace map.
   *
   * @param {!Object<string, string>} params The params that need to be renamed.
   * @param {!Object<string, string>} replaceMap A map of pattern and replacement
   *    value.
   * @private
   */
  ;

  _proto.processExtraUrlParams_ = function processExtraUrlParams_(params, replaceMap) {
    if (params && replaceMap) {
      // If the config includes a extraUrlParamsReplaceMap, apply it as a set
      // of params to String.replace to allow aliasing of the keys in
      // extraUrlParams.
      var count = 0;

      for (var replaceMapKey in replaceMap) {
        if (++count > MAX_REPLACES) {
          var _TAG4 = this.getName_();

          this.user().error(_TAG4, 'More than ' + MAX_REPLACES + ' extraUrlParamsReplaceMap rules ' + "aren't allowed; Skipping the rest");
          break;
        }

        for (var extraUrlParamsKey in params) {
          var newkey = extraUrlParamsKey.replace(replaceMapKey, replaceMap[replaceMapKey]);

          if (extraUrlParamsKey != newkey) {
            var value = params[extraUrlParamsKey];
            delete params[extraUrlParamsKey];
            params[newkey] = value;
          }
        }
      }
    }
  }
  /**
   * @return {boolean} true if the user has opted out.
   */
  ;

  _proto.hasOptedOut_ = function hasOptedOut_() {
    var elementId = this.config_['optoutElementId'];

    if (elementId && this.win.document.getElementById(elementId)) {
      return true;
    }

    if (!this.config_['optout']) {
      return false;
    }

    var props = this.config_['optout'].split('.');
    var k = this.win;

    for (var i = 0; i < props.length; i++) {
      if (!k) {
        return false;
      }

      k = k[props[i]];
    } // The actual property being called is controlled by vendor configs only
    // that are approved in code reviews. User customization of the `optout`
    // property is not allowed.


    return k();
  }
  /**
   * Goes through all the requests in predefined vendor config and tag's config
   * and creates a map of request name to request template. These requests can
   * then be used while sending a request to a server.
   *
   * @private
   */
  ;

  _proto.generateRequests_ = function generateRequests_() {
    var _this7 = this;

    if (!this.config_['requests']) {
      if (!this.isInabox_) {
        var _TAG5 = this.getName_();

        this.user().error(_TAG5, 'No request strings defined. Analytics ' + 'data will not be sent from this page.');
      }

      return;
    }

    if (this.config_['requests']) {
      for (var k in this.config_['requests']) {
        if ((0, _object.hasOwn)(this.config_['requests'], k)) {
          var request = this.config_['requests'][k];

          if (!request['baseUrl']) {
            this.user().error(TAG, 'request must have a baseUrl');
            delete this.config_['requests'][k];
          }
        }
      } // Expand any placeholders. For requests, we expand each string up to 5
      // times to support nested requests. Leave any unresolved placeholders.
      // Expand any requests placeholder.


      for (var _k in this.config_['requests']) {
        this.config_['requests'][_k]['baseUrl'] = (0, _string.expandTemplate)(this.config_['requests'][_k]['baseUrl'], function (key) {
          var request = _this7.config_['requests'][key];
          return request && request['baseUrl'] || '${' + key + '}';
        }, 5);
      }

      var requests = {};

      for (var _k2 in this.config_['requests']) {
        if ((0, _object.hasOwn)(this.config_['requests'], _k2)) {
          var _request = this.config_['requests'][_k2];
          requests[_k2] = new _requests.RequestHandler(this.element, _request, this.preconnect, this.transport_, this.isSandbox_);
        }
      }

      this.requests_ = requests;
    }
  }
  /**
   * Create the linker-manager that will append linker params as necessary.
   * @private
   */
  ;

  _proto.initializeLinker_ = function initializeLinker_() {
    var type = this.element.getAttribute('type');
    this.linkerManager_ = new _linkerManager.LinkerManager(this.getAmpDoc(), this.config_, type, this.element);
    this.linkerManager_.init();
  }
  /**
   * Callback for events that are registered by the config's triggers. This
   * method generates requests and sends them out.
   *
   * @param {!JsonObject} trigger JSON config block that resulted in this event.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @private
   */
  ;

  _proto.handleEvent_ = function handleEvent_(trigger, event) {
    var requests = (0, _types.isArray)(trigger['request']) ? trigger['request'] : [trigger['request']];

    for (var r = 0; r < requests.length; r++) {
      var requestName = requests[r];
      this.handleRequestForEvent_(requestName, trigger, event);
    }
  }
  /**
   * Processes a request for an event callback and sends it out.
   *
   * @param {string} requestName The requestName to process.
   * @param {!JsonObject} trigger JSON config block that resulted in this event.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @private
   */
  ;

  _proto.handleRequestForEvent_ = function handleRequestForEvent_(requestName, trigger, event) {
    var _this8 = this;

    if (!this.element.ownerDocument.defaultView) {
      var _TAG6 = this.getName_();

      (0, _log.dev)().warn(_TAG6, 'request against destroyed embed: ', trigger['on']);
    }

    var request = this.requests_[requestName];
    var hasPostMessage = this.isInabox_ && trigger['parentPostMessage'];

    if (requestName != undefined && !request) {
      var _TAG7 = this.getName_();

      this.user().error(_TAG7, 'Ignoring request for event. Request string not found: ', trigger['request']);

      if (!hasPostMessage) {
        return;
      }
    }

    this.checkTriggerEnabled_(trigger, event).then(function (enabled) {
      if (!enabled) {
        return;
      }

      _this8.expandAndSendRequest_(request, trigger, event);

      _this8.expandAndPostMessage_(trigger, event);
    });
  }
  /**
   * @param {RequestHandler} request The request to process.
   * @param {!JsonObject} trigger JSON config block that resulted in this event.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @private
   */
  ;

  _proto.expandAndSendRequest_ = function expandAndSendRequest_(request, trigger, event) {
    if (!request) {
      return;
    }

    this.config_['vars']['requestCount']++;
    var expansionOptions = this.expansionOptions_(event, trigger);
    request.send(this.config_['extraUrlParams'], trigger, expansionOptions);
  }
  /**
   * Expand and post message to parent window if applicable.
   * @param {!JsonObject} trigger JSON config block that resulted in this event.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @private
   */
  ;

  _proto.expandAndPostMessage_ = function expandAndPostMessage_(trigger, event) {
    var _this9 = this;

    var msg = trigger['parentPostMessage'];

    if (!msg || !this.isInabox_) {
      // Only send message in inabox runtime with parentPostMessage specified.
      return;
    }

    var expansionOptions = this.expansionOptions_(event, trigger);
    (0, _requests.expandPostMessage)(this.getAmpDoc(), msg, this.config_['extraUrlParams'], trigger, expansionOptions, this.element).then(function (message) {
      if ((0, _dom.isIframed)(_this9.win)) {
        // Only post message with explict `parentPostMessage` to inabox host
        _this9.win.parent.
        /*OK*/
        postMessage(message, '*');
      }
    });
  }
  /**
   * @param {!JsonObject} trigger The config to use to determine sampling.
   * @return {!Promise<boolean>} Whether the request should be sampled in or
   * not based on sampleSpec.
   * @private
   */
  ;

  _proto.isSampledIn_ = function isSampledIn_(trigger) {
    var _this10 = this;

    /** @const {!JsonObject} */
    var spec = trigger['sampleSpec'];
    var resolve = Promise.resolve(true);
    var TAG = this.getName_();

    if (!spec) {
      return resolve;
    }

    var sampleOn = spec['sampleOn'];

    if (!sampleOn) {
      this.user().error(TAG, 'Invalid sampleOn value.');
      return resolve;
    }

    var threshold = parseFloat(spec['threshold']); // Threshold can be NaN.

    if (threshold >= 0 && threshold <= 100) {
      var expansionOptions = this.expansionOptions_((0, _object.dict)({}), trigger);
      return this.expandTemplateWithUrlParams_(sampleOn, expansionOptions).then(function (key) {
        return _this10.cryptoService_.uniform(key);
      }).then(function (digest) {
        return digest * 100 < threshold;
      });
    }

    (0, _log.user)().
    /*OK*/
    error(TAG, 'Invalid threshold for sampling.');
    return resolve;
  }
  /**
   * Checks if request for a trigger is enabled.
   * @param {!JsonObject} trigger The config to use to determine if trigger is
   * enabled.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @return {!Promise<boolean>} Whether trigger must be called.
   * @private
   */
  ;

  _proto.checkTriggerEnabled_ = function checkTriggerEnabled_(trigger, event) {
    var expansionOptions = this.expansionOptions_(event, trigger);
    var enabledOnTagLevel = this.checkSpecEnabled_(this.config_['enabled'], expansionOptions);
    var enabledOnTriggerLevel = this.checkSpecEnabled_(trigger['enabled'], expansionOptions);
    return Promise.all([enabledOnTagLevel, enabledOnTriggerLevel]).then(function (enabled) {
      (0, _log.devAssert)(enabled.length === 2);
      return enabled[0] && enabled[1];
    });
  }
  /**
   * Checks result of 'enabled' spec evaluation. Returns false if spec is
   * provided and value resolves to a falsey value (empty string, 0, false,
   * null, NaN or undefined).
   * @param {string|boolean} spec Expression that will be evaluated.
   * @param {!ExpansionOptions} expansionOptions Expansion options.
   * @return {!Promise<boolean>} False only if spec is provided and value is
   * falsey.
   * @private
   */
  ;

  _proto.checkSpecEnabled_ = function checkSpecEnabled_(spec, expansionOptions) {
    // Spec absence always resolves to true.
    if (spec === undefined) {
      return Promise.resolve(true);
    }

    if (typeof spec === 'boolean') {
      return Promise.resolve(spec);
    }

    return this.expandTemplateWithUrlParams_(spec, expansionOptions).then(function (val) {
      return (0, _variables.stringToBool)(val);
    });
  }
  /**
   * Expands spec using provided expansion options and applies url replacement
   * if necessary.
   * @param {string} spec Expression that needs to be expanded.
   * @param {!ExpansionOptions} expansionOptions Expansion options.
   * @return {!Promise<string>} expanded spec.
   * @private
   */
  ;

  _proto.expandTemplateWithUrlParams_ = function expandTemplateWithUrlParams_(spec, expansionOptions) {
    var _this11 = this;

    return this.variableService_.expandTemplate(spec, expansionOptions).then(function (key) {
      return _services.Services.urlReplacementsForDoc(_this11.element).expandUrlAsync(key, _this11.variableService_.getMacros(_this11.element));
    });
  }
  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  ;

  _proto.getName_ = function getName_() {
    return 'AmpAnalytics ' + (this.element.getAttribute('id') || '<unknown id>');
  }
  /**
   * @param {!JsonObject|!./events.AnalyticsEvent} source1
   * @param {!JsonObject} source2
   * @param {number=} opt_iterations
   * @param {boolean=} opt_noEncode
   * @return {!ExpansionOptions}
   */
  ;

  _proto.expansionOptions_ = function expansionOptions_(source1, source2, opt_iterations, opt_noEncode) {
    var vars = (0, _object.dict)();
    (0, _config.mergeObjects)(this.config_['vars'], vars);
    (0, _config.mergeObjects)(source2['vars'], vars);
    (0, _config.mergeObjects)(source1['vars'], vars);
    return new _variables.ExpansionOptions(vars, opt_iterations, opt_noEncode);
  };

  return AmpAnalytics;
}(AMP.BaseElement);

exports.AmpAnalytics = AmpAnalytics;
AMP.extension(TAG, '0.1', function (AMP) {
  // Register doc-service factory.
  AMP.registerServiceForDoc('amp-analytics-instrumentation', _instrumentation.InstrumentationService);
  AMP.registerServiceForDoc('activity', _activityImpl.Activity);
  (0, _linkerReader.installLinkerReaderService)(AMP.win);
  AMP.registerServiceForDoc('amp-analytics-variables', _variables.VariableService); // Register the element.

  AMP.registerElement(TAG, AmpAnalytics);
});

},{"../../../src/dom":111,"../../../src/iframe-helper":116,"../../../src/layout":124,"../../../src/log":125,"../../../src/mode":127,"../../../src/services":141,"../../../src/string":143,"../../../src/style":144,"../../../src/types":145,"../../../src/utils/object":154,"./activity-impl":1,"./config":5,"./cookie-writer":7,"./events":9,"./instrumentation":13,"./linker-manager":14,"./linker-reader":15,"./requests":18,"./transport":23,"./variables":24}],3:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AnalyticsGroup = void 0;

var _log = require("../../../src/log");

var _events = require("./events");

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
 * Represents the group of analytics triggers for a single config. All triggers
 * are declared and released at the same time.
 *
 * @implements {../../../src/service.Disposable}
 */
var AnalyticsGroup =
/*#__PURE__*/
function () {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   * @param {!Element} analyticsElement
   */
  function AnalyticsGroup(root, analyticsElement) {
    /** @const */
    this.root_ = root;
    /** @const */

    this.analyticsElement_ = analyticsElement;
    /** @private @const {!Array<!UnlistenDef>} */

    this.listeners_ = [];
  }
  /** @override */


  var _proto = AnalyticsGroup.prototype;

  _proto.dispose = function dispose() {
    this.listeners_.forEach(function (listener) {
      listener();
    });
  }
  /**
   * Adds a trigger with the specified config and listener. The config must
   * contain `on` property specifying the type of the event.
   *
   * Triggers registered on a group are automatically released when the
   * group is disposed.
   *
   * @param {!JsonObject} config
   * @param {function(!./events.AnalyticsEvent)} handler
   */
  ;

  _proto.addTrigger = function addTrigger(config, handler) {
    var eventType = (0, _log.dev)().assertString(config['on']);
    var trackerKey = (0, _events.getTrackerKeyName)(eventType);
    var trackerWhitelist = (0, _events.getTrackerTypesForParentType)(this.root_.getType());
    var tracker = this.root_.getTrackerForWhitelist(trackerKey, trackerWhitelist);
    (0, _log.userAssert)(!!tracker, 'Trigger type "%s" is not allowed in the %s', eventType, this.root_.getType());
    var unlisten = tracker.add(this.analyticsElement_, eventType, config, handler);
    this.listeners_.push(unlisten);
  };

  return AnalyticsGroup;
}();

exports.AnalyticsGroup = AnalyticsGroup;

},{"../../../src/log":125,"./events":9}],4:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.EmbedAnalyticsRoot = exports.AmpdocAnalyticsRoot = exports.AnalyticsRoot = void 0;

var _hostServices = require("../../../src/inabox/host-services");

var _scrollManager = require("./scroll-manager");

var _services = require("../../../src/services");

var _visibilityManagerForMapp = require("./visibility-manager-for-mapp");

var _dom = require("../../../src/dom");

var _log = require("../../../src/log");

var _mode = require("../../../src/mode");

var _layoutRect = require("../../../src/layout-rect");

var _object = require("../../../src/utils/object");

var _visibilityManager = require("./visibility-manager");

var _promise = require("../../../src/utils/promise");

var _iniLoad = require("../../../src/ini-load");

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var TAG = 'amp-analytics/analytics-root';
/**
 * An analytics root. Analytics can be scoped to either ampdoc, embed or
 * an arbitrary AMP element.
 *
 * TODO(#22733): merge analytics root properties into ampdoc.
 *
 * @implements {../../../src/service.Disposable}
 * @abstract
 */

var AnalyticsRoot =
/*#__PURE__*/
function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AnalyticsRoot(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;
    /** @const */

    this.trackers_ = (0, _object.map)();
    /** @private {?./visibility-manager.VisibilityManager} */

    this.visibilityManager_ = null;
    /** @private {?./scroll-manager.ScrollManager} */

    this.scrollManager_ = null;
    /** @private {?Promise} */

    this.usingHostAPIPromise_ = null;
    /** @private {?../../../src/inabox/host-services.VisibilityInterface} */

    this.hostVisibilityService_ = null;
  }
  /**
   * @return {!Promise<boolean>}
   */


  var _proto = AnalyticsRoot.prototype;

  _proto.isUsingHostAPI = function isUsingHostAPI() {
    var _this = this;

    if (this.usingHostAPIPromise_) {
      return this.usingHostAPIPromise_;
    }

    if (!_hostServices.HostServices.isAvailable(this.ampdoc)) {
      this.usingHostAPIPromise_ = Promise.resolve(false);
    } else {
      // TODO: Using the visibility service and apply it for all tracking types
      var promise = _hostServices.HostServices.visibilityForDoc(this.ampdoc);

      this.usingHostAPIPromise_ = promise.then(function (visibilityService) {
        _this.hostVisibilityService_ = visibilityService;
        return true;
      }).catch(function (error) {
        (0, _log.dev)().fine(TAG, 'VisibilityServiceError - fallback=' + error.fallback);

        if (error.fallback) {
          // Do not use HostAPI, fallback to original implementation.
          return false;
        } // Cannot fallback, service error. Throw user error.


        throw (0, _log.user)().createError('Host Visibility Service Error');
      });
    }

    return this.usingHostAPIPromise_;
  }
  /** @override */
  ;

  _proto.dispose = function dispose() {
    for (var k in this.trackers_) {
      this.trackers_[k].dispose();
      delete this.trackers_[k];
    }

    if (this.visibilityManager_) {
      this.visibilityManager_.dispose();
    }

    if (this.scrollManager_) {
      this.scrollManager_.dispose();
    }
  }
  /**
   * Returns the type of the tracker.
   * @return {string}
   * @abstract
   */
  ;

  _proto.getType = function getType() {}
  /**
   * The root node the analytics is scoped to.
   *
   * @return {!Document|!ShadowRoot}
   * @abstract
   */
  ;

  _proto.getRoot = function getRoot() {}
  /**
   * The viewer of analytics root
   * @return {!../../../src/service/viewer-interface.ViewerInterface}
   */
  ;

  _proto.getViewer = function getViewer() {
    return _services.Services.viewerForDoc(this.ampdoc);
  }
  /**
   * The root element within the analytics root.
   *
   * @return {!Element}
   */
  ;

  _proto.getRootElement = function getRootElement() {
    var root = this.getRoot();
    return (0, _log.dev)().assertElement(root.documentElement || root.body || root);
  }
  /**
   * The host element of the analytics root.
   *
   * @return {?Element}
   * @abstract
   */
  ;

  _proto.getHostElement = function getHostElement() {}
  /**
   * The signals for the root.
   *
   * @return {!../../../src/utils/signals.Signals}
   * @abstract
   */
  ;

  _proto.signals = function signals() {}
  /**
   * Whether this analytics root contains the specified node.
   *
   * @param {!Node} node
   * @return {boolean}
   */
  ;

  _proto.contains = function contains(node) {
    return this.getRoot().contains(node);
  }
  /**
   * Returns the element with the specified ID in the scope of this root.
   *
   * @param {string} unusedId
   * @return {?Element}
   * @abstract
   */
  ;

  _proto.getElementById = function getElementById(unusedId) {}
  /**
   * Returns the tracker for the specified name and list of allowed types.
   *
   * @param {string} name
   * @param {!Object<string, function(new:./events.EventTracker)>} whitelist
   * @return {?./events.EventTracker}
   */
  ;

  _proto.getTrackerForWhitelist = function getTrackerForWhitelist(name, whitelist) {
    var trackerProfile = whitelist[name];

    if (trackerProfile) {
      return this.getTracker(name, trackerProfile);
    }

    return null;
  }
  /**
   * Returns the tracker for the specified name and type. If the tracker
   * has not been requested before, it will be created.
   *
   * @param {string} name
   * @param {function(new:./events.CustomEventTracker, !AnalyticsRoot)|function(new:./events.ClickEventTracker, !AnalyticsRoot)|function(new:./events.ScrollEventTracker, !AnalyticsRoot)|function(new:./events.SignalTracker, !AnalyticsRoot)|function(new:./events.IniLoadTracker, !AnalyticsRoot)|function(new:./events.VideoEventTracker, !AnalyticsRoot)|function(new:./events.VideoEventTracker, !AnalyticsRoot)|function(new:./events.VisibilityTracker, !AnalyticsRoot)|function(new:./events.AmpStoryEventTracker, !AnalyticsRoot)} klass
   * @return {!./events.EventTracker}
   */
  ;

  _proto.getTracker = function getTracker(name, klass) {
    var tracker = this.trackers_[name];

    if (!tracker) {
      tracker = new klass(this);
      this.trackers_[name] = tracker;
    }

    return tracker;
  }
  /**
   * Returns the tracker for the specified name or `null`.
   * @param {string} name
   * @return {?./events.EventTracker}
   */
  ;

  _proto.getTrackerOptional = function getTrackerOptional(name) {
    return this.trackers_[name] || null;
  }
  /**
   * Searches the element that matches the selector within the scope of the
   * analytics root in relationship to the specified context node.
   *
   * @param {!Element} context
   * @param {string} selector DOM query selector.
   * @param {?string=} selectionMethod Allowed values are `null`,
   *   `'closest'` and `'scope'`.
   * @return {!Promise<!Element>} Element corresponding to the selector.
   */
  ;

  _proto.getElement = function getElement(context, selector, selectionMethod) {
    var _this2 = this;

    if (selectionMethod === void 0) {
      selectionMethod = null;
    }

    // Special case selectors. The selection method is irrelavant.
    // And no need to wait for document ready.
    if (selector == ':root') {
      return (0, _promise.tryResolve)(function () {
        return _this2.getRootElement();
      });
    }

    if (selector == ':host') {
      return new Promise(function (resolve) {
        resolve((0, _log.user)().assertElement(_this2.getHostElement(), "Element \"" + selector + "\" not found"));
      });
    } // Wait for document-ready to avoid false missed searches


    return this.ampdoc.whenReady().then(function () {
      var found;
      var result = null; // Query search based on the selection method.

      try {
        if (selectionMethod == 'scope') {
          found = (0, _dom.scopedQuerySelector)(context, selector);
        } else if (selectionMethod == 'closest') {
          found = (0, _dom.closestAncestorElementBySelector)(context, selector);
        } else {
          found = _this2.getRoot().querySelector(selector);
        }
      } catch (e) {
        (0, _log.userAssert)(false, "Invalid query selector " + selector);
      } // DOM search can "look" outside the boundaries of the root, thus make
      // sure the result is contained.


      if (found && _this2.contains(found)) {
        result = found;
      }

      return (0, _log.user)().assertElement(result, "Element \"" + selector + "\" not found");
    });
  }
  /**
   * Searches the AMP element that matches the selector within the scope of the
   * analytics root in relationship to the specified context node.
   *
   * @param {!Element} context
   * @param {string} selector DOM query selector.
   * @param {?string=} selectionMethod Allowed values are `null`,
   *   `'closest'` and `'scope'`.
   * @return {!Promise<!AmpElement>} AMP element corresponding to the selector if found.
   */
  ;

  _proto.getAmpElement = function getAmpElement(context, selector, selectionMethod) {
    return this.getElement(context, selector, selectionMethod).then(function (element) {
      (0, _log.userAssert)(element.classList.contains('i-amphtml-element'), 'Element "%s" is required to be an AMP element', selector);
      return element;
    });
  }
  /**
   * Creates listener-filter for DOM events to check against the specified
   * selector. If the node (or its ancestors) match the selector the listener
   * will be called.
   *
   * @param {function(!Element, !Event)} listener The first argument is the
   *   matched target node and the second is the original event.
   * @param {!Element} context
   * @param {string} selector DOM query selector.
   * @param {?string=} selectionMethod Allowed values are `null`,
   *   `'closest'` and `'scope'`.
   * @return {function(!Event)}
   */
  ;

  _proto.createSelectiveListener = function createSelectiveListener(listener, context, selector, selectionMethod) {
    var _this3 = this;

    if (selectionMethod === void 0) {
      selectionMethod = null;
    }

    return function (event) {
      if (selector == ':host') {
        // `:host` is not reachable via selective listener b/c event path
        // cannot be retargeted across the boundary of the embed.
        return;
      } // Navigate up the DOM tree to find the actual target.


      var rootElement = _this3.getRootElement();

      var isSelectAny = selector == '*';
      var isSelectRoot = selector == ':root';
      var target = event.target;

      while (target) {
        // Target must be contained by this root.
        if (!_this3.contains(target)) {
          break;
        } // `:scope` context must contain the target.


        if (selectionMethod == 'scope' && !isSelectRoot && !context.contains(target)) {
          break;
        } // `closest()` target must contain the conext.


        if (selectionMethod == 'closest' && !target.contains(context)) {
          // However, the search must continue!
          target = target.parentElement;
          continue;
        } // Check if the target matches the selector.


        if (isSelectAny || isSelectRoot && target == rootElement || tryMatches_(target, selector)) {
          listener(target, event); // Don't fire the event multiple times even if the more than one
          // ancestor matches the selector.

          break;
        }

        target = target.parentElement;
      }
    };
  }
  /**
   * Returns the promise that will be resolved as soon as the elements within
   * the root have been loaded inside the first viewport of the root.
   * @return {!Promise}
   * @abstract
   */
  ;

  _proto.whenIniLoaded = function whenIniLoaded() {}
  /**
   * Returns the visibility root corresponding to this analytics root (ampdoc
   * or embed). The visibility root is created lazily as needed and takes
   * care of all visibility tracking functions.
   *
   * The caller needs to make sure to call getVisibilityManager after
   * usingHostAPIPromise has resolved
   * @return {!./visibility-manager.VisibilityManager}
   */
  ;

  _proto.getVisibilityManager = function getVisibilityManager() {
    if (!this.visibilityManager_) {
      if (this.hostVisibilityService_) {
        // If there is hostAPI (hostAPI never exist with the FIE case)
        this.visibilityManager_ = new _visibilityManagerForMapp.VisibilityManagerForMApp(this.ampdoc, this.hostVisibilityService_);
      } else {
        this.visibilityManager_ = (0, _visibilityManager.provideVisibilityManager)(this.getRoot());
      }
    }

    return this.visibilityManager_;
  }
  /**
   *  Returns the Scroll Managet corresponding to this analytics root.
   * The Scroll Manager is created lazily as needed, and will handle
   * calling all handlers for a scroll event.
   * @return {!./scroll-manager.ScrollManager}
   */
  ;

  _proto.getScrollManager = function getScrollManager() {
    // TODO (zhouyx@): Disallow scroll trigger with host API
    if (!this.scrollManager_) {
      this.scrollManager_ = new _scrollManager.ScrollManager(this.ampdoc);
    }

    return this.scrollManager_;
  };

  return AnalyticsRoot;
}();
/**
 * The implementation of the analytics root for an ampdoc.
 */


exports.AnalyticsRoot = AnalyticsRoot;

var AmpdocAnalyticsRoot =
/*#__PURE__*/
function (_AnalyticsRoot) {
  _inheritsLoose(AmpdocAnalyticsRoot, _AnalyticsRoot);

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function AmpdocAnalyticsRoot(ampdoc) {
    return _AnalyticsRoot.call(this, ampdoc) || this;
  }
  /** @override */


  var _proto2 = AmpdocAnalyticsRoot.prototype;

  _proto2.getType = function getType() {
    return 'ampdoc';
  }
  /** @override */
  ;

  _proto2.getRoot = function getRoot() {
    return this.ampdoc.getRootNode();
  }
  /** @override */
  ;

  _proto2.getHostElement = function getHostElement() {
    // ampdoc is always the root of everything - no host.
    return null;
  }
  /** @override */
  ;

  _proto2.signals = function signals() {
    return this.ampdoc.signals();
  }
  /** @override */
  ;

  _proto2.getElementById = function getElementById(id) {
    return this.ampdoc.getElementById(id);
  }
  /** @override */
  ;

  _proto2.whenIniLoaded = function whenIniLoaded() {
    var viewport = _services.Services.viewportForDoc(this.ampdoc);

    var rect;

    if ((0, _mode.getMode)(this.ampdoc.win).runtime == 'inabox') {
      // TODO(dvoytenko, #7971): This is currently addresses incorrect position
      // calculations in a in-a-box viewport where all elements are offset
      // to the bottom of the embed. The current approach, even if fixed, still
      // creates a significant probability of risk condition.
      // Once address, we can simply switch to the 0/0 approach in the `else`
      // clause.
      rect = viewport.getLayoutRect(this.getRootElement());
    } else {
      var size = viewport.getSize();
      rect = (0, _layoutRect.layoutRectLtwh)(0, 0, size.width, size.height);
    }

    return (0, _iniLoad.whenContentIniLoad)(this.ampdoc, this.ampdoc.win, rect);
  };

  return AmpdocAnalyticsRoot;
}(AnalyticsRoot);
/**
 * The implementation of the analytics root for FIE.
 * TODO(#22733): merge into AnalyticsRoot once ampdoc-fie is launched.
 */


exports.AmpdocAnalyticsRoot = AmpdocAnalyticsRoot;

var EmbedAnalyticsRoot =
/*#__PURE__*/
function (_AnalyticsRoot2) {
  _inheritsLoose(EmbedAnalyticsRoot, _AnalyticsRoot2);

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  function EmbedAnalyticsRoot(ampdoc, embed) {
    var _this4;

    _this4 = _AnalyticsRoot2.call(this, ampdoc) || this;
    /** @const */

    _this4.embed = embed;
    return _this4;
  }
  /** @override */


  var _proto3 = EmbedAnalyticsRoot.prototype;

  _proto3.getType = function getType() {
    return 'embed';
  }
  /** @override */
  ;

  _proto3.getRoot = function getRoot() {
    return this.embed.win.document;
  }
  /** @override */
  ;

  _proto3.getHostElement = function getHostElement() {
    return this.embed.iframe;
  }
  /** @override */
  ;

  _proto3.signals = function signals() {
    return this.embed.signals();
  }
  /** @override */
  ;

  _proto3.getElementById = function getElementById(id) {
    return this.embed.win.document.getElementById(id);
  }
  /** @override */
  ;

  _proto3.whenIniLoaded = function whenIniLoaded() {
    return this.embed.whenIniLoaded();
  };

  return EmbedAnalyticsRoot;
}(AnalyticsRoot);
/**
 * @param  {!Element} el
 * @param  {string} selector
 * @return {boolean}
 * @noinline
 */


exports.EmbedAnalyticsRoot = EmbedAnalyticsRoot;

function tryMatches_(el, selector) {
  try {
    return (0, _dom.matches)(el, selector);
  } catch (e) {
    (0, _log.user)().error(TAG, 'Bad query selector.', selector, e);
    return false;
  }
}

},{"../../../src/dom":111,"../../../src/inabox/host-services":118,"../../../src/ini-load":119,"../../../src/layout-rect":123,"../../../src/log":125,"../../../src/mode":127,"../../../src/services":141,"../../../src/utils/object":154,"../../../src/utils/promise":156,"./scroll-manager":21,"./visibility-manager":101,"./visibility-manager-for-mapp":100}],5:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.mergeObjects = mergeObjects;
exports.expandConfigRequest = expandConfigRequest;
exports.AnalyticsConfig = void 0;

var _vendors = require("./vendors");

var _services = require("../../../src/services");

var _url = require("../../../src/url");

var _extensionLocation = require("../../../src/service/extension-location");

var _object = require("../../../src/utils/object");

var _log = require("../../../src/log");

var _json = require("../../../src/json");

var _mode = require("../../../src/mode");

var _types = require("../../../src/types");

var _experiments = require("../../../src/experiments");

var _variables = require("./variables");

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
var TAG = 'amp-analytics/config';

var AnalyticsConfig =
/*#__PURE__*/
function () {
  /**
   * @param {!Element} element
   */
  function AnalyticsConfig(element) {
    /** @private {!Element} */
    this.element_ = element;
    /** @private {?Window} */

    this.win_ = null;
    /**
     * @const {!JsonObject} Copied here for tests.
     * @private
     */

    this.predefinedConfig_ = _vendors.ANALYTICS_CONFIG;
    /**
     * @private {JsonObject}
     */

    this.config_ = (0, _object.dict)();
    /**
     * @private {JsonObject}
     */

    this.remoteConfig_ = (0, _object.dict)();
    /** @private {boolean} */

    this.isSandbox_ = false;
  }
  /**
   * @return {!Promise<JsonObject>}
   */


  var _proto = AnalyticsConfig.prototype;

  _proto.loadConfig = function loadConfig() {
    var _this = this;

    this.win_ = this.element_.ownerDocument.defaultView;
    this.isSandbox_ = this.element_.hasAttribute('sandbox');
    return Promise.all([this.fetchRemoteConfig_(), this.fetchVendorConfig_()]).then(this.processConfigs_.bind(this)).then(this.checkWarningMessage_.bind(this)).then(this.addExperimentParams_.bind(this)).then(function () {
      return _this.config_;
    });
  }
  /**
   * Constructs the URL where the given vendor config is located
   * @private
   * @param {string} vendor the vendor name
   * @return {string} the URL to request the vendor config file from
   */
  ;

  _proto.getVendorUrl_ = function getVendorUrl_(vendor) {
    var baseUrl = (0, _extensionLocation.calculateScriptBaseUrl)(this.win_.location, (0, _mode.getMode)().localDev); // bg has a special canary config

    var canary = vendor === 'bg' && (0, _experiments.isCanary)(self) ? '.canary' : '';
    return baseUrl + "/rtv/" + (0, _mode.getMode)().rtvVersion + "/v0/analytics-vendors/" + vendor + canary + ".json";
  }
  /**
   * Returns a promise that resolves when vendor config is ready (or
   * immediately if no vendor config is specified)
   * @private
   * @return {!Promise<undefined>}
   */
  ;

  _proto.fetchVendorConfig_ = function fetchVendorConfig_() {
    var _this2 = this;

    // eslint-disable-next-line no-undef
    if (!false) {
      return Promise.resolve();
    }

    var type = this.element_.getAttribute('type');

    if (!type) {
      return Promise.resolve();
    }

    var vendorUrl = this.getVendorUrl_(type);
    var TAG = this.getName_();
    (0, _log.dev)().fine(TAG, 'Fetching vendor config', vendorUrl);
    return _services.Services.xhrFor((0, _types.toWin)(this.win_)).fetchJson(vendorUrl).then(function (res) {
      return res.json();
    }).then(function (jsonValue) {
      _this2.predefinedConfig_[type] = jsonValue;
      (0, _log.dev)().fine(TAG, 'Vendor config loaded for ' + type, jsonValue);
    }, function (err) {
      (0, _log.user)().error(TAG, 'Error loading vendor config: ', vendorUrl, err);
    });
  }
  /**
   * TODO: cleanup #22757 @jonathantyng
   * Append special param to pageview request for RC and experiment builds
   * for the googleanalytics component. This is to track pageview changes
   * in AB experiment
   */
  ;

  _proto.addExperimentParams_ = function addExperimentParams_() {
    var type = this.element_.getAttribute('type');
    var rtv = (0, _mode.getMode)().rtvVersion;
    var isRc = rtv ? rtv.substring(0, 2) === '03' : false; // eslint-disable-next-line no-undef

    var isExperiment = false;

    if (type === 'googleanalytics' && (isRc || isExperiment) && this.config_['requests']) {
      if (this.config_['requests']['pageview']) {
        this.config_['requests']['pageview']['baseUrl'] += "&aae=" + isExperiment;
      }

      if (this.config_['requests']['timing']) {
        this.config_['requests']['timing']['baseUrl'] += "&aae=" + isExperiment;
      }
    }
  }
  /**
   * Returns a promise that resolves when remote config is ready (or
   * immediately if no remote config is specified.)
   * @private
   * @return {!Promise<undefined>}
   */
  ;

  _proto.fetchRemoteConfig_ = function fetchRemoteConfig_() {
    var _this3 = this;

    var remoteConfigUrl = this.element_.getAttribute('config');

    if (!remoteConfigUrl || this.isSandbox_) {
      return Promise.resolve();
    }

    (0, _url.assertHttpsUrl)(remoteConfigUrl, this.element_);
    var TAG = this.getName_();
    (0, _log.dev)().fine(TAG, 'Fetching remote config', remoteConfigUrl);
    var fetchConfig = {};

    if (this.element_.hasAttribute('data-credentials')) {
      fetchConfig.credentials = this.element_.getAttribute('data-credentials');
    }

    return _services.Services.urlReplacementsForDoc(this.element_).expandUrlAsync(remoteConfigUrl).then(function (expandedUrl) {
      remoteConfigUrl = expandedUrl;
      return _services.Services.xhrFor((0, _types.toWin)(_this3.win_)).fetchJson(remoteConfigUrl, fetchConfig);
    }).then(function (res) {
      return res.json();
    }).then(function (jsonValue) {
      _this3.remoteConfig_ = jsonValue;
      (0, _log.dev)().fine(TAG, 'Remote config loaded', remoteConfigUrl);
    }, function (err) {
      (0, _log.user)().error(TAG, 'Error loading remote config: ', remoteConfigUrl, err);
    });
  }
  /**
   * Returns a promise that resolves when configuration is re-written if
   * configRewriter is configured by a vendor.
   * @private
   * @return {!Promise<undefined>}
   */
  ;

  _proto.processConfigs_ = function processConfigs_() {
    var configRewriterUrl = this.getConfigRewriter_()['url'];
    var config = (0, _object.dict)({});
    var inlineConfig = this.getInlineConfig_();
    this.validateTransport_(inlineConfig);
    mergeObjects(inlineConfig, config);
    mergeObjects(this.remoteConfig_, config);

    if (!configRewriterUrl || this.isSandbox_) {
      this.config_ = this.mergeConfigs_(config); // use default configuration merge.

      return Promise.resolve();
    }

    return this.handleConfigRewriter_(config, configRewriterUrl);
  }
  /**
   * Handles logic if configRewriter is enabled.
   * @param {!JsonObject} config
   * @param {string} configRewriterUrl
   * @return {!Promise<undefined>}
   */
  ;

  _proto.handleConfigRewriter_ = function handleConfigRewriter_(config, configRewriterUrl) {
    var _this4 = this;

    (0, _url.assertHttpsUrl)(configRewriterUrl, this.element_);
    var TAG = this.getName_();
    (0, _log.dev)().fine(TAG, 'Rewriting config', configRewriterUrl);
    return this.handleVarGroups_(config).then(function () {
      var fetchConfig = {
        method: 'POST',
        body: config
      };

      if (_this4.element_.hasAttribute('data-credentials')) {
        fetchConfig.credentials = _this4.element_.getAttribute('data-credentials');
      }

      return _services.Services.urlReplacementsForDoc(_this4.element_).expandUrlAsync(configRewriterUrl).then(function (expandedUrl) {
        return _services.Services.xhrFor((0, _types.toWin)(_this4.win_)).fetchJson(expandedUrl, fetchConfig);
      }).then(function (res) {
        return res.json();
      }).then(function (jsonValue) {
        _this4.config_ = _this4.mergeConfigs_(jsonValue);
        (0, _log.dev)().fine(TAG, 'Configuration re-written', configRewriterUrl);
      }, function (err) {
        (0, _log.user)().error(TAG, 'Error rewriting configuration: ', configRewriterUrl, err);
      });
    });
  }
  /**
   * Check if config has warning, display on console and
   * remove the property.
   * @private
   */
  ;

  _proto.checkWarningMessage_ = function checkWarningMessage_() {
    if (this.config_['warningMessage']) {
      var _TAG = this.getName_();

      var type = this.element_.getAttribute('type');
      var remoteConfigUrl = this.element_.getAttribute('config');
      (0, _log.user)().warn(_TAG, 'Warning from analytics vendor%s%s: %s', type ? ' ' + type : '', remoteConfigUrl ? ' with remote config url ' + remoteConfigUrl : '', String(this.config_['warningMessage']));
      delete this.config_['warningMessage'];
    }
  }
  /**
   * Check to see which varGroups are enabled, resolve and merge them into
   * vars object.
   * @param {!JsonObject} pubConfig
   * @return {!Promise}
   */
  ;

  _proto.handleVarGroups_ = function handleVarGroups_(pubConfig) {
    var _this5 = this;

    var pubRewriterConfig = pubConfig['configRewriter'];
    var pubVarGroups = pubRewriterConfig && pubRewriterConfig['varGroups'];
    var vendorVarGroups = this.getConfigRewriter_()['varGroups'];

    if (!pubVarGroups && !vendorVarGroups) {
      return Promise.resolve();
    }

    if (pubVarGroups && !vendorVarGroups) {
      var _TAG2 = this.getName_();

      (0, _log.user)().warn(_TAG2, 'This analytics provider does not currently support varGroups');
      return Promise.resolve();
    } // Create object that will later hold all the resolved variables, and any
    // intermediary objects as necessary.


    pubConfig['configRewriter'] = pubConfig['configRewriter'] || (0, _object.dict)();
    var rewriterConfig = pubConfig['configRewriter'];
    rewriterConfig['vars'] = (0, _object.dict)({});
    var allPromises = []; // Merge publisher && vendor varGroups to see what has been enabled.

    var mergedConfig = pubVarGroups || (0, _object.dict)();
    (0, _object.deepMerge)(mergedConfig, vendorVarGroups);
    Object.keys(mergedConfig).forEach(function (groupName) {
      var group = mergedConfig[groupName];

      if (!group['enabled']) {
        // Any varGroups must be explicitly enabled.
        return;
      }

      var groupPromise = _this5.shallowExpandObject(_this5.element_, group).then(function (expandedGroup) {
        // This is part of the user config and should not be sent.
        delete expandedGroup['enabled']; // Merge all groups into single `vars` object.

        Object.assign(rewriterConfig['vars'], expandedGroup);
      });

      allPromises.push(groupPromise);
    });
    return Promise.all(allPromises).then(function () {
      // Don't send an empty vars payload.
      if (!Object.keys(rewriterConfig['vars']).length) {
        return delete pubConfig['configRewriter'];
      } // Don't send varGroups in payload to configRewriter endpoint.


      pubVarGroups && delete rewriterConfig['varGroups'];
    });
  }
  /**
   * Merges various sources of configs and stores them in a member variable.
   *
   * Order of precedence for configs from highest to lowest:
   * - Remote config: specified through an attribute of the tag.
   * - Inline config: specified insize the tag.
   * - Predefined config: Defined as part of the platform.
   * - Default config: Built-in config shared by all amp-analytics tags.
   *
   * @private
   * @param {!JsonObject} rewrittenConfig
   * @return {!JsonObject}
   */
  ;

  _proto.mergeConfigs_ = function mergeConfigs_(rewrittenConfig) {
    // Initialize config with analytics related vars.
    var config = (0, _object.dict)({
      'vars': {
        'requestCount': 0
      }
    });
    var defaultConfig = this.predefinedConfig_['default'] || {};
    mergeObjects(expandConfigRequest(defaultConfig), config);
    mergeObjects(expandConfigRequest(this.getTypeConfig_()), config,
    /* predefined */
    true);
    mergeObjects(expandConfigRequest(rewrittenConfig), config,
    /* predefined */
    true);
    return config;
  }
  /**
   * Reads configRewriter from a vendor config.
   * @return {!JsonObject}
   */
  ;

  _proto.getConfigRewriter_ = function getConfigRewriter_() {
    return this.getTypeConfig_()['configRewriter'] || {};
  }
  /**
   * Reads a vendor configuration.
   * @return {!JsonObject}
   */
  ;

  _proto.getTypeConfig_ = function getTypeConfig_() {
    var type = this.element_.getAttribute('type');
    return this.predefinedConfig_[type] || {};
  }
  /**
   * @private
   * @return {!JsonObject}
   * @noinline
   */
  ;

  _proto.getInlineConfig_ = function getInlineConfig_() {
    if (this.element_.CONFIG) {
      // If the analytics element is created by runtime, return cached config.
      return this.element_.CONFIG;
    }

    var inlineConfig = {};
    var TAG = this.getName_();

    try {
      var children = this.element_.children;

      if (children.length == 1) {
        inlineConfig = (0, _json.getChildJsonConfig)(this.element_);
      } else if (children.length > 1) {
        (0, _log.user)().error(TAG, 'The tag should contain only one <script> child.');
      }
    } catch (er) {
      (0, _log.user)().error(TAG, er.message);
    }

    return (
      /** @type {!JsonObject} */
      inlineConfig
    );
  }
  /**
   * Validates transport configuration.
   * @param {!JsonObject} inlineConfig
   */
  ;

  _proto.validateTransport_ = function validateTransport_(inlineConfig) {
    var type = this.element_.getAttribute('type');

    if (this.predefinedConfig_[type]) {
      // TODO(zhouyx, #7096) Track overwrite percentage. Prevent transport
      // overwriting
      if (inlineConfig['transport'] || this.remoteConfig_['transport']) {
        var _TAG3 = this.getName_();

        (0, _log.user)().error(_TAG3, 'Inline or remote config should not ' + 'overwrite vendor transport settings');
      }
    } // Do NOT allow inline or remote config to use 'transport: iframe'


    if (inlineConfig['transport'] && inlineConfig['transport']['iframe']) {
      (0, _log.user)().error(TAG, 'Inline configs are not allowed to specify transport iframe');

      if (!(0, _mode.getMode)().localDev || (0, _mode.getMode)().test) {
        inlineConfig['transport']['iframe'] = undefined;
      }
    }

    if (this.remoteConfig_['transport'] && this.remoteConfig_['transport']['iframe']) {
      (0, _log.user)().error(TAG, 'Remote configs are not allowed to specify transport iframe');
      this.remoteConfig_['transport']['iframe'] = undefined;
    }
  }
  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  ;

  _proto.getName_ = function getName_() {
    return 'AmpAnalytics ' + (this.element_.getAttribute('id') || '<unknown id>');
  }
  /**
   * Expands all key value pairs asynchronously and returns a promise that will
   * resolve with the expanded object.
   * @param {!Element} element
   * @param {!Object} obj
   * @return {!Promise<!Object>}
   */
  ;

  _proto.shallowExpandObject = function shallowExpandObject(element, obj) {
    var expandedObj = (0, _object.dict)();
    var keys = [];
    var expansionPromises = [];

    var urlReplacements = _services.Services.urlReplacementsForDoc(element);

    var bindings = (0, _variables.variableServiceForDoc)(element).getMacros(element);
    Object.keys(obj).forEach(function (key) {
      keys.push(key);
      var expanded = urlReplacements.expandStringAsync(obj[key], bindings);
      expansionPromises.push(expanded);
    });
    return Promise.all(expansionPromises).then(function (expandedValues) {
      keys.forEach(function (key, i) {
        return expandedObj[key] = expandedValues[i];
      });
      return expandedObj;
    });
  };

  return AnalyticsConfig;
}();
/**
 * Merges two objects. If the value is array or plain object, the values are
 * merged otherwise the value is overwritten.
 *
 * @param {Object|Array} from Object or array to merge from
 * @param {Object|Array} to Object or Array to merge into
 * @param {boolean=} opt_predefinedConfig
 * @return {*} TODO(#23582): Specify return type
 */


exports.AnalyticsConfig = AnalyticsConfig;

function mergeObjects(from, to, opt_predefinedConfig) {
  if (to === null || to === undefined) {
    to = {};
  } // Assert that optouts are allowed only in predefined configs.
  // The last expression adds an exception of known, safe optout function
  // that is already being used in the wild.


  (0, _log.userAssert)(opt_predefinedConfig || !from || !from['optout'] || from['optout'] == '_gaUserPrefs.ioo' || from['optoutElementId'] == '__gaOptOutExtension', 'optout property is only available to vendor config.');

  for (var property in from) {
    (0, _log.userAssert)(opt_predefinedConfig || property != 'iframePing', 'iframePing config is only available to vendor config.'); // Only deal with own properties.

    if ((0, _object.hasOwn)(from, property)) {
      if ((0, _types.isArray)(from[property])) {
        if (!(0, _types.isArray)(to[property])) {
          to[property] = [];
        }

        to[property] = mergeObjects(from[property], to[property], opt_predefinedConfig);
      } else if ((0, _types.isObject)(from[property])) {
        if (!(0, _types.isObject)(to[property])) {
          to[property] = {};
        }

        to[property] = mergeObjects(from[property], to[property], opt_predefinedConfig);
      } else {
        to[property] = from[property];
      }
    }
  }

  return to;
}
/**
 * Expand config's request to object
 * @param {!JsonObject} config
 * @return {?JsonObject}
 * @visibleForTesting
 */


function expandConfigRequest(config) {
  if (!config['requests']) {
    return config;
  }

  for (var k in config['requests']) {
    if ((0, _object.hasOwn)(config['requests'], k)) {
      config['requests'][k] = expandRequestStr(config['requests'][k]);
    }
  }

  return handleTopLevelAttributes_(config);
}
/**
 * Expand single request to an object
 * @param {!JsonObject} request
 * @return {*} TODO(#23582): Specify return type
 */


function expandRequestStr(request) {
  if ((0, _types.isObject)(request)) {
    return request;
  }

  return {
    'baseUrl': request
  };
}
/**
 * Handles top level fields in the given config
 * @param {!JsonObject} config
 * @return {JsonObject}
 */


function handleTopLevelAttributes_(config) {
  // handle a top level requestOrigin
  if ((0, _object.hasOwn)(config, 'requests') && (0, _object.hasOwn)(config, 'requestOrigin')) {
    var requestOrigin = config['requestOrigin'];

    for (var requestName in config['requests']) {
      // only add top level request origin into request if it doesn't have one
      if (!(0, _object.hasOwn)(config['requests'][requestName], 'origin')) {
        config['requests'][requestName]['origin'] = requestOrigin;
      }
    }
  }

  return config;
}

},{"../../../src/experiments":115,"../../../src/json":122,"../../../src/log":125,"../../../src/mode":127,"../../../src/service/extension-location":135,"../../../src/services":141,"../../../src/types":145,"../../../src/url":148,"../../../src/utils/object":154,"./variables":24,"./vendors":25}],6:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.cookieReader = cookieReader;
exports.isCookieAllowed = isCookieAllowed;

var _cookies = require("../../../src/cookies");

var _mode = require("../../../src/mode");

var _iframeHelper = require("../../../src/iframe-helper");

var _url = require("../../../src/url");

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
 * COOKIE macro resolver
 * @param {!Window} win
 * @param {!Element} element
 * @param {string} name
 * @return {?string}
 */
function cookieReader(win, element, name) {
  if (!isCookieAllowed(win, element)) {
    return null;
  }

  return (0, _cookies.getCookie)(win, name);
}
/**
 * Determine if cookie writing/reading feature is supported in current
 * environment.
 * Disable cookie writer in friendly iframe and proxy origin and inabox.
 * @param {!Window} win
 * @param {!Element} element
 * @return {boolean}
 */


function isCookieAllowed(win, element) {
  return !(0, _iframeHelper.isInFie)(element) && !(0, _url.isProxyOrigin)(win.location) && !((0, _mode.getMode)(win).runtime == 'inabox');
}

},{"../../../src/cookies":109,"../../../src/iframe-helper":116,"../../../src/mode":127,"../../../src/url":148}],7:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CookieWriter = void 0;

var _cidImpl = require("../../../src/service/cid-impl");

var _services = require("../../../src/services");

var _object = require("../../../src/utils/object");

var _cookieReader = require("./cookie-reader");

var _types = require("../../../src/types");

var _cookies = require("../../../src/cookies");

var _log = require("../../../src/log");

var _variables = require("./variables");

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
var TAG = 'amp-analytics/cookie-writer';
var RESERVED_KEYS = {
  'referrerDomains': true,
  'enabled': true,
  'cookiePath': true,
  'cookieMaxAge': true,
  'cookieSecure': true,
  'cookieDomain': true
};

var CookieWriter =
/*#__PURE__*/
function () {
  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {!JsonObject} config
   */
  function CookieWriter(win, element, config) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {!Element} */

    this.element_ = element;
    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */

    this.urlReplacementService_ = _services.Services.urlReplacementsForDoc(element);
    /** @private {?Promise} */

    this.writePromise_ = null;
    /** @private {!JsonObject} */

    this.config_ = config;
    /** @const @private {!JsonObject} */

    this.bindings_ = (0, _variables.variableServiceForDoc)(element).getMacros(element);
  }
  /**
   * @return {!Promise}
   */


  var _proto = CookieWriter.prototype;

  _proto.write = function write() {
    if (!this.writePromise_) {
      this.writePromise_ = this.init_();
    }

    return this.writePromise_;
  }
  /**
   * Parse the config and write to cookie
   * Config looks like
   * cookies: {
   *   enabled: true/false, //Default to true
   *   cookieNameA: {
   *     value: cookieValueA (QUERY_PARAM/LINKER_PARAM)
   *   },
   *   cookieValueB: {
   *     value: cookieValueB
   *   }
   *   ...
   * }
   * @return {!Promise}
   */
  ;

  _proto.init_ = function init_() {
    // TODO: Need the consider the case for shadow doc.
    if (!(0, _cookieReader.isCookieAllowed)(this.win_, this.element_)) {
      // Note: It's important to check origin here so that setCookie doesn't
      // throw error "should not attempt ot set cookie on proxy origin"
      return Promise.resolve();
    }

    if (!(0, _object.hasOwn)(this.config_, 'cookies')) {
      return Promise.resolve();
    }

    if (!(0, _types.isObject)(this.config_['cookies'])) {
      (0, _log.user)().error(TAG, 'cookies config must be an object');
      return Promise.resolve();
    }

    var inputConfig = this.config_['cookies'];

    if (inputConfig['enabled'] === false) {
      // Enabled by default
      // TODO: Allow indiviual cookie object to override the value
      return Promise.resolve();
    }

    var cookieExpireDateMs = this.getCookieMaxAgeMs_(inputConfig);
    var ids = Object.keys(inputConfig);
    var promises = [];

    for (var i = 0; i < ids.length; i++) {
      var cookieName = ids[i];
      var cookieObj = inputConfig[cookieName];

      if (this.isValidCookieConfig_(cookieName, cookieObj)) {
        promises.push(this.expandAndWrite_(cookieName, cookieObj['value'], cookieExpireDateMs));
      }
    }

    return Promise.all(promises);
  }
  /**
   * Retrieves cookieMaxAge from given config, provides default value if no
   * value is found or value is invalid
   * @param {JsonObject} inputConfig
   * @return {number}
   */
  ;

  _proto.getCookieMaxAgeMs_ = function getCookieMaxAgeMs_(inputConfig) {
    if (!(0, _object.hasOwn)(inputConfig, 'cookieMaxAge')) {
      return _cidImpl.BASE_CID_MAX_AGE_MILLIS;
    }

    var cookieMaxAgeNumber = Number(inputConfig['cookieMaxAge']); // 0 is a special case which we allow

    if (!cookieMaxAgeNumber && cookieMaxAgeNumber !== 0) {
      (0, _log.user)().error(TAG, 'invalid cookieMaxAge %s, falling back to default value (1 year)', inputConfig['cookieMaxAge']);
      return _cidImpl.BASE_CID_MAX_AGE_MILLIS;
    }

    if (cookieMaxAgeNumber <= 0) {
      (0, _log.user)().warn(TAG, 'cookieMaxAge %s less than or equal to 0, cookie will immediately expire', inputConfig['cookieMaxAge']);
    } // convert cookieMaxAge (sec) to milliseconds


    return cookieMaxAgeNumber * 1000;
  }
  /**
   * Check whether the cookie value is supported. Currently only support
   * QUERY_PARAM(***) and LINKER_PARAM(***, ***)
   *
   * CookieObj should looks like
   * cookieName: {
   *  value: string (cookieValue),
   * }
   * @param {string} cookieName
   * @param {*} cookieConfig
   * @return {boolean}
   */
  ;

  _proto.isValidCookieConfig_ = function isValidCookieConfig_(cookieName, cookieConfig) {
    if (RESERVED_KEYS[cookieName]) {
      return false;
    }

    if (!(0, _types.isObject)(cookieConfig)) {
      (0, _log.user)().error(TAG, 'cookieValue must be configured in an object');
      return false;
    }

    if (!(0, _object.hasOwn)(cookieConfig, 'value')) {
      (0, _log.user)().error(TAG, 'value is required in the cookieValue object');
      return false;
    }

    return true;
  }
  /**
   * Expand the value and write to cookie if necessary
   * @param {string} cookieName
   * @param {string} cookieValue
   * @param {number} cookieExpireDateMs
   * @return {!Promise}
   */
  ;

  _proto.expandAndWrite_ = function expandAndWrite_(cookieName, cookieValue, cookieExpireDateMs) {
    var _this = this;

    // Note: Have to use `expandStringAsync` because QUERY_PARAM can wait for
    // trackImpressionPromise and resolve async
    return this.urlReplacementService_.expandStringAsync(cookieValue, this.bindings_).then(function (value) {
      // Note: We ignore empty cookieValue, that means currently we don't
      // provide a way to overwrite or erase existing cookie
      if (value) {
        var expireDate = Date.now() + cookieExpireDateMs;
        (0, _cookies.setCookie)(_this.win_, cookieName, value, expireDate, {
          highestAvailableDomain: true
        });
      }
    }).catch(function (e) {
      (0, _log.user)().error(TAG, 'Error expanding cookie string', e);
    });
  };

  return CookieWriter;
}();

exports.CookieWriter = CookieWriter;

},{"../../../src/cookies":109,"../../../src/log":125,"../../../src/service/cid-impl":134,"../../../src/services":141,"../../../src/types":145,"../../../src/utils/object":154,"./cookie-reader":6,"./variables":24}],8:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.crc32 = crc32;

var _bytes = require("../../../src/utils/bytes");

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
 * Standard key for CRC32
 * https://en.wikipedia.org/wiki/Cyclic_redundancy_check#Polynomial_representations_of_cyclic_redundancy_checks
 * @const {number}
 */
var CRC32_KEY = 0xedb88320;
/** @private {?Array<number>} */

var crcTable = null;
/**
 * Returns CRC32 checksum for provided string.
 * @param {string} str
 * @return {number}
 */

function crc32(str) {
  if (!crcTable) {
    crcTable = makeCrcTable();
  }

  var bytes = (0, _bytes.utf8Encode)(str); // Shrink to 32 bits.

  var crc = -1 >>> 0;

  for (var i = 0; i < bytes.length; i++) {
    var lookupIndex = (crc ^ bytes[i]) & 0xff;
    crc = crc >>> 8 ^ crcTable[lookupIndex];
  }

  return (crc ^ -1) >>> 0;
}
/**
 * Generates CRC lookup table.
 * @return {!Array<number>}
 */


function makeCrcTable() {
  var crcTable = new Array(256);

  for (var i = 0; i < 256; i++) {
    var c = i;

    for (var j = 0; j < 8; j++) {
      if (c & 1) {
        c = c >>> 1 ^ CRC32_KEY;
      } else {
        c = c >>> 1;
      }
    }

    crcTable[i] = c;
  }

  return crcTable;
}

},{"../../../src/utils/bytes":151}],9:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getTrackerKeyName = getTrackerKeyName;
exports.getTrackerTypesForParentType = getTrackerTypesForParentType;
exports.VisibilityTracker = exports.VideoEventTracker = exports.TimerEventTracker = exports.IniLoadTracker = exports.SignalTracker = exports.ScrollEventTracker = exports.ClickEventTracker = exports.AmpStoryEventTracker = exports.CustomEventTracker = exports.EventTracker = exports.AnalyticsEvent = exports.trackerTypeForTesting = exports.AnalyticsEventType = void 0;

var _commonSignals = require("../../../src/common-signals");

var _promise = require("../../../src/utils/promise");

var _observable = require("../../../src/observable");

var _videoInterface = require("../../../src/video-interface");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _eventHelper = require("../../../src/event-helper");

var _dom = require("../../../src/dom");

var _types = require("../../../src/types");

var _string = require("../../../src/string");

var _Object$freeze;

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var SCROLL_PRECISION_PERCENT = 5;
var VAR_H_SCROLL_BOUNDARY = 'horizontalScrollBoundary';
var VAR_V_SCROLL_BOUNDARY = 'verticalScrollBoundary';
var MIN_TIMER_INTERVAL_SECONDS = 0.5;
var DEFAULT_MAX_TIMER_LENGTH_SECONDS = 7200;
var VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;

var NO_UNLISTEN = function NO_UNLISTEN() {};

var TAG = 'amp-analytics/events';
/**
 * Events that can result in analytics data to be sent.
 * @const
 * @enum {string}
 */

var AnalyticsEventType = {
  CLICK: 'click',
  CUSTOM: 'custom',
  HIDDEN: 'hidden',
  INI_LOAD: 'ini-load',
  RENDER_START: 'render-start',
  SCROLL: 'scroll',
  STORY: 'story',
  TIMER: 'timer',
  VIDEO: 'video',
  VISIBLE: 'visible'
};
exports.AnalyticsEventType = AnalyticsEventType;
var ALLOWED_FOR_ALL_ROOT_TYPES = ['ampdoc', 'embed'];
/**
 * Events that can result in analytics data to be sent.
 * @const {!Object<string, {
 *     name: string,
 *     allowedFor: !Array<string>,
 *     klass: function(new:./events.EventTracker)
 *   }>}
 */

var TRACKER_TYPE = Object.freeze((_Object$freeze = {}, _Object$freeze[AnalyticsEventType.CLICK] = {
  name: AnalyticsEventType.CLICK,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  // Escape the temporal dead zone by not referencing a class directly.
  klass: function klass(root) {
    return new ClickEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.CUSTOM] = {
  name: AnalyticsEventType.CUSTOM,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new CustomEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.HIDDEN] = {
  name: AnalyticsEventType.VISIBLE,
  // Reuse tracker with visibility
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VisibilityTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.INI_LOAD] = {
  name: AnalyticsEventType.INI_LOAD,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer', 'visible']),
  klass: function klass(root) {
    return new IniLoadTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.RENDER_START] = {
  name: AnalyticsEventType.RENDER_START,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer', 'visible']),
  klass: function klass(root) {
    return new SignalTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.SCROLL] = {
  name: AnalyticsEventType.SCROLL,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new ScrollEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.STORY] = {
  name: AnalyticsEventType.STORY,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
  klass: function klass(root) {
    return new AmpStoryEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.TIMER] = {
  name: AnalyticsEventType.TIMER,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES,
  klass: function klass(root) {
    return new TimerEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.VIDEO] = {
  name: AnalyticsEventType.VIDEO,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VideoEventTracker(root);
  }
}, _Object$freeze[AnalyticsEventType.VISIBLE] = {
  name: AnalyticsEventType.VISIBLE,
  allowedFor: ALLOWED_FOR_ALL_ROOT_TYPES.concat(['timer']),
  klass: function klass(root) {
    return new VisibilityTracker(root);
  }
}, _Object$freeze));
/** @visibleForTesting */

var trackerTypeForTesting = TRACKER_TYPE;
/**
 * @param {string} triggerType
 * @return {boolean}
 */

exports.trackerTypeForTesting = trackerTypeForTesting;

function isAmpStoryTriggerType(triggerType) {
  return (0, _string.startsWith)(triggerType, 'story');
}
/**
 * @param {string} triggerType
 * @return {boolean}
 */


function isVideoTriggerType(triggerType) {
  return (0, _string.startsWith)(triggerType, 'video');
}
/**
 * @param {string} triggerType
 * @return {boolean}
 */


function isReservedTriggerType(triggerType) {
  return (0, _types.isEnumValue)(AnalyticsEventType, triggerType);
}
/**
 * @param {string} eventType
 * @return {string}
 */


function getTrackerKeyName(eventType) {
  if (isVideoTriggerType(eventType)) {
    return AnalyticsEventType.VIDEO;
  }

  if (isAmpStoryTriggerType(eventType)) {
    return AnalyticsEventType.STORY;
  }

  if (!isReservedTriggerType(eventType)) {
    return AnalyticsEventType.CUSTOM;
  }

  return (0, _object.hasOwn)(TRACKER_TYPE, eventType) ? TRACKER_TYPE[eventType].name : eventType;
}
/**
 * @param {string} parentType
 * @return {!Object<string, function(new:EventTracker)>}
 */


function getTrackerTypesForParentType(parentType) {
  var filtered = {};
  Object.keys(TRACKER_TYPE).forEach(function (key) {
    if ((0, _object.hasOwn)(TRACKER_TYPE, key) && TRACKER_TYPE[key].allowedFor.indexOf(parentType) != -1) {
      filtered[key] = TRACKER_TYPE[key].klass;
    }
  }, this);
  return filtered;
}
/**
 * @interface
 */


var SignalTrackerDef =
/*#__PURE__*/
function () {
  function SignalTrackerDef() {}

  var _proto = SignalTrackerDef.prototype;

  /**
   * @param {string} unusedEventType
   * @return {!Promise}
   */
  _proto.getRootSignal = function getRootSignal(unusedEventType) {}
  /**
   * @param {string} unusedEventType
   * @param {!Element} unusedElement
   * @return {!Promise}
   */
  ;

  _proto.getElementSignal = function getElementSignal(unusedEventType, unusedElement) {};

  return SignalTrackerDef;
}();
/**
 * The analytics event.
 * @dict
 */


var AnalyticsEvent =
/**
 * @param {!Element} target The most relevant target element.
 * @param {string} type The type of event.
 * @param {?JsonObject=} opt_vars A map of vars and their values.
 */
function AnalyticsEvent(target, type, opt_vars) {
  /** @const */
  this['target'] = target;
  /** @const */

  this['type'] = type;
  /** @const */

  this['vars'] = opt_vars || (0, _object.dict)();
};
/**
 * The base class for all trackers. A tracker tracks all events of the same
 * type for a single analytics root.
 *
 * @implements {../../../src/service.Disposable}
 * @abstract
 * @visibleForTesting
 */


exports.AnalyticsEvent = AnalyticsEvent;

var EventTracker =
/*#__PURE__*/
function () {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function EventTracker(root) {
    /** @const */
    this.root = root;
  }
  /** @override @abstract */


  var _proto2 = EventTracker.prototype;

  _proto2.dispose = function dispose() {}
  /**
   * @param {!Element} unusedContext
   * @param {string} unusedEventType
   * @param {!JsonObject} unusedConfig
   * @param {function(!AnalyticsEvent)} unusedListener
   * @return {!UnlistenDef}
   * @abstract
   */
  ;

  _proto2.add = function add(unusedContext, unusedEventType, unusedConfig, unusedListener) {};

  return EventTracker;
}();
/**
 * Tracks custom events.
 */


exports.EventTracker = EventTracker;

var CustomEventTracker =
/*#__PURE__*/
function (_EventTracker) {
  _inheritsLoose(CustomEventTracker, _EventTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function CustomEventTracker(root) {
    var _this;

    _this = _EventTracker.call(this, root) || this;
    /** @const @private {!Object<string, !Observable<!AnalyticsEvent>>} */

    _this.observables_ = {};
    /**
     * Early events have to be buffered because there's no way to predict
     * how fast all `amp-analytics` elements will be instrumented.
     * @private {!Object<string, !Array<!AnalyticsEvent>>|undefined}
     */

    _this.buffer_ = {};
    /**
     * Sandbox events get their own buffer, because handler to those events will
     * be added after parent element's layout. (Time varies, can be later than
     * 10s) sandbox events buffer will never expire but will cleared when
     * handler is ready.
     * @private {!Object<string, !Array<!AnalyticsEvent>|undefined>|undefined}
     */

    _this.sandboxBuffer_ = {}; // Stop buffering of custom events after 10 seconds. Assumption is that all
    // `amp-analytics` elements will have been instrumented by this time.

    setTimeout(function () {
      _this.buffer_ = undefined;
    }, 10000);
    return _this;
  }
  /** @override */


  var _proto3 = CustomEventTracker.prototype;

  _proto3.dispose = function dispose() {
    this.buffer_ = undefined;
    this.sandboxBuffer_ = undefined;

    for (var k in this.observables_) {
      this.observables_[k].removeAll();
    }
  }
  /** @override */
  ;

  _proto3.add = function add(context, eventType, config, listener) {
    var _this2 = this;

    var selector = config['selector'];

    if (!selector) {
      selector = ':root';
    }

    var selectionMethod = config['selectionMethod'] || null;
    var targetReady = this.root.getElement(context, selector, selectionMethod);
    var isSandboxEvent = (0, _string.startsWith)(eventType, 'sandbox-'); // Push recent events if any.

    var buffer = isSandboxEvent ? this.sandboxBuffer_ && this.sandboxBuffer_[eventType] : this.buffer_ && this.buffer_[eventType];

    if (buffer) {
      var bufferLength = buffer.length;
      targetReady.then(function (target) {
        setTimeout(function () {
          for (var i = 0; i < bufferLength; i++) {
            var event = buffer[i];

            if (target.contains(event['target'])) {
              listener(event);
            }
          }

          if (isSandboxEvent) {
            // We assume sandbox event will only has single listener.
            // It is safe to clear buffer once handler is ready.
            _this2.sandboxBuffer_[eventType] = undefined;
          }
        }, 1);
      });
    }

    var observables = this.observables_[eventType];

    if (!observables) {
      observables = new _observable.Observable();
      this.observables_[eventType] = observables;
    }

    return this.observables_[eventType].add(function (event) {
      // Wait for target selected
      targetReady.then(function (target) {
        if (target.contains(event['target'])) {
          listener(event);
        }
      });
    });
  }
  /**
   * Triggers a custom event for the associated root.
   * @param {!AnalyticsEvent} event
   */
  ;

  _proto3.trigger = function trigger(event) {
    var eventType = event['type'];
    var isSandboxEvent = (0, _string.startsWith)(eventType, 'sandbox-');
    var observables = this.observables_[eventType]; // If listeners already present - trigger right away.

    if (observables) {
      observables.fire(event);

      if (isSandboxEvent) {
        // No need to buffer sandbox event if handler ready
        return;
      }
    } // Create buffer and enqueue buffer if needed


    if (isSandboxEvent) {
      this.sandboxBuffer_[eventType] = this.sandboxBuffer_[eventType] || [];
      this.sandboxBuffer_[eventType].push(event);
    } else {
      // Check if buffer has expired
      if (this.buffer_) {
        this.buffer_[eventType] = this.buffer_[eventType] || [];
        this.buffer_[eventType].push(event);
      }
    }
  };

  return CustomEventTracker;
}(EventTracker); // TODO(Enriqe): If needed, add support for sandbox story event.
// (e.g. sandbox-story-xxx).


exports.CustomEventTracker = CustomEventTracker;

var AmpStoryEventTracker =
/*#__PURE__*/
function (_CustomEventTracker) {
  _inheritsLoose(AmpStoryEventTracker, _CustomEventTracker);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function AmpStoryEventTracker(root) {
    return _CustomEventTracker.call(this, root) || this;
  }
  /** @override */


  var _proto4 = AmpStoryEventTracker.prototype;

  _proto4.add = function add(context, eventType, config, listener) {
    var _this3 = this;

    // TODO(Enriqe): add support for storySpec.
    var rootTarget = this.root.getRootElement(); // Fire buffered events if any.

    var buffer = this.buffer_ && this.buffer_[eventType];

    if (buffer) {
      var bufferLength = buffer.length;

      for (var i = 0; i < bufferLength; i++) {
        var event = buffer[i];
        this.fireListener_(event, rootTarget, config, listener);
      }
    }

    var observables = this.observables_[eventType];

    if (!observables) {
      observables = new _observable.Observable();
      this.observables_[eventType] = observables;
    }

    return this.observables_[eventType].add(function (event) {
      _this3.fireListener_(event, rootTarget, config, listener);
    });
  }
  /**
   * Fires listener given the specified configuration.
   * @param {!AnalyticsEvent} event
   * @param {!Element} rootTarget
   * @param {!JsonObject} config
    * @param {function(!AnalyticsEvent)} listener
   */
  ;

  _proto4.fireListener_ = function fireListener_(event, rootTarget, config, listener) {
    var type = event['type'];
    var vars = event['vars'];
    listener(new AnalyticsEvent(rootTarget, type, vars));
  }
  /**
   * Triggers a custom event for the associated root, or buffers them if the
   * observables aren't present yet.
   * @param {!AnalyticsEvent} event
   */
  ;

  _proto4.trigger = function trigger(event) {
    var eventType = event['type'];
    var observables = this.observables_[eventType]; // If listeners already present - trigger right away.

    if (observables) {
      observables.fire(event);
    } // Create buffer and enqueue event if needed.


    if (this.buffer_) {
      this.buffer_[eventType] = this.buffer_[eventType] || [];
      this.buffer_[eventType].push(event);
    }
  };

  return AmpStoryEventTracker;
}(CustomEventTracker);
/**
 * Tracks click events.
 */


exports.AmpStoryEventTracker = AmpStoryEventTracker;

var ClickEventTracker =
/*#__PURE__*/
function (_EventTracker2) {
  _inheritsLoose(ClickEventTracker, _EventTracker2);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function ClickEventTracker(root) {
    var _this4;

    _this4 = _EventTracker2.call(this, root) || this;
    /** @private {!Observable<!Event>} */

    _this4.clickObservable_ = new _observable.Observable();
    /** @private @const {function(!Event)} */

    _this4.boundOnClick_ = _this4.clickObservable_.fire.bind(_this4.clickObservable_);

    _this4.root.getRoot().addEventListener('click', _this4.boundOnClick_);

    return _this4;
  }
  /** @override */


  var _proto5 = ClickEventTracker.prototype;

  _proto5.dispose = function dispose() {
    this.root.getRoot().removeEventListener('click', this.boundOnClick_);
    this.clickObservable_.removeAll();
  }
  /** @override */
  ;

  _proto5.add = function add(context, eventType, config, listener) {
    var selector = (0, _log.userAssert)(config['selector'], 'Missing required selector on click trigger');
    var selectionMethod = config['selectionMethod'] || null;
    return this.clickObservable_.add(this.root.createSelectiveListener(this.handleClick_.bind(this, listener), context.parentElement || context, selector, selectionMethod));
  }
  /**
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Element} target
   * @param {!Event} unusedEvent
   * @private
   */
  ;

  _proto5.handleClick_ = function handleClick_(listener, target, unusedEvent) {
    var params = (0, _dom.getDataParamsFromAttributes)(target,
    /* computeParamNameFunc */
    undefined, VARIABLE_DATA_ATTRIBUTE_KEY);
    listener(new AnalyticsEvent(target, 'click', params));
  };

  return ClickEventTracker;
}(EventTracker);
/**
 * Tracks scroll events.
 */


exports.ClickEventTracker = ClickEventTracker;

var ScrollEventTracker =
/*#__PURE__*/
function (_EventTracker3) {
  _inheritsLoose(ScrollEventTracker, _EventTracker3);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function ScrollEventTracker(root) {
    var _this5;

    _this5 = _EventTracker3.call(this, root) || this;
    /** @private {!./analytics-root.AnalyticsRoot} root */

    _this5.root_ = root;
    /** @private {function(!Object)|null} */

    _this5.boundScrollHandler_ = null;
    return _this5;
  }
  /** @override */


  var _proto6 = ScrollEventTracker.prototype;

  _proto6.dispose = function dispose() {
    if (this.boundScrollHandler_ !== null) {
      this.root_.getScrollManager().removeScrollHandler(this.boundScrollHandler_);
      this.boundScrollHandler_ = null;
    }
  }
  /** @override */
  ;

  _proto6.add = function add(context, eventType, config, listener) {
    if (!config['scrollSpec']) {
      (0, _log.user)().error(TAG, 'Missing scrollSpec on scroll trigger.');
      return NO_UNLISTEN;
    }

    if (!Array.isArray(config['scrollSpec']['verticalBoundaries']) && !Array.isArray(config['scrollSpec']['horizontalBoundaries'])) {
      (0, _log.user)().error(TAG, 'Boundaries are required for the scroll trigger to work.');
      return NO_UNLISTEN;
    }

    var boundsV = this.normalizeBoundaries_(config['scrollSpec']['verticalBoundaries']);
    var boundsH = this.normalizeBoundaries_(config['scrollSpec']['horizontalBoundaries']);
    this.boundScrollHandler_ = this.scrollHandler_.bind(this, boundsV, boundsH, listener);
    return this.root_.getScrollManager().addScrollHandler(this.boundScrollHandler_);
  }
  /**
   * Function to handle scroll events from the Scroll manager
   * @param {!Object<number,boolean>} boundsV
   * @param {!Object<number,boolean>} boundsH
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Object} e
   * @private
   */
  ;

  _proto6.scrollHandler_ = function scrollHandler_(boundsV, boundsH, listener, e) {
    // Calculates percentage scrolled by adding screen height/width to
    // top/left and dividing by the total scroll height/width.
    this.triggerScrollEvents_(boundsV, (e.top + e.height) * 100 / e.
    /*OK*/
    scrollHeight, VAR_V_SCROLL_BOUNDARY, listener);
    this.triggerScrollEvents_(boundsH, (e.left + e.width) * 100 / e.
    /*OK*/
    scrollWidth, VAR_H_SCROLL_BOUNDARY, listener);
  }
  /**
   * Rounds the boundaries for scroll trigger to nearest
   * SCROLL_PRECISION_PERCENT and returns an object with normalized boundaries
   * as keys and false as values.
   *
   * @param {!Array<number>} bounds array of bounds.
   * @return {!JsonObject} Object with normalized bounds as keys
   * and false as value.
   * @private
   */
  ;

  _proto6.normalizeBoundaries_ = function normalizeBoundaries_(bounds) {
    var result = (0, _object.dict)({});

    if (!bounds || !Array.isArray(bounds)) {
      return result;
    }

    for (var b = 0; b < bounds.length; b++) {
      var bound = bounds[b];

      if (typeof bound !== 'number' || !isFinite(bound)) {
        (0, _log.user)().error(TAG, 'Scroll trigger boundaries must be finite.');
        return result;
      }

      bound = Math.min(Math.round(bound / SCROLL_PRECISION_PERCENT) * SCROLL_PRECISION_PERCENT, 100);
      result[bound] = false;
    }

    return result;
  }
  /**
   * @param {!Object<number, boolean>} bounds
   * @param {number} scrollPos Number representing the current scroll
   * @param {string} varName variable name to assign to the bound that
   * @param {function(!AnalyticsEvent)} listener
   * triggers the event position.
   */
  ;

  _proto6.triggerScrollEvents_ = function triggerScrollEvents_(bounds, scrollPos, varName, listener) {
    if (!scrollPos) {
      return;
    } // Goes through each of the boundaries and fires an event if it has not
    // been fired so far and it should be.


    for (var b in bounds) {
      if (!(0, _object.hasOwn)(bounds, b)) {
        continue;
      }

      var bound = parseInt(b, 10);

      if (bound > scrollPos || bounds[bound]) {
        continue;
      }

      bounds[bound] = true;
      var vars = (0, _object.dict)();
      vars[varName] = b;
      listener(new AnalyticsEvent(this.root_.getRootElement(), AnalyticsEventType.SCROLL, vars));
    }
  };

  return ScrollEventTracker;
}(EventTracker);
/**
 * Tracks events based on signals.
 * @implements {SignalTrackerDef}
 */


exports.ScrollEventTracker = ScrollEventTracker;

var SignalTracker =
/*#__PURE__*/
function (_EventTracker4) {
  _inheritsLoose(SignalTracker, _EventTracker4);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function SignalTracker(root) {
    return _EventTracker4.call(this, root) || this;
  }
  /** @override */


  var _proto7 = SignalTracker.prototype;

  _proto7.dispose = function dispose() {}
  /** @override */
  ;

  _proto7.add = function add(context, eventType, config, listener) {
    var _this6 = this;

    var target;
    var signalsPromise;
    var selector = config['selector'] || ':root';

    if (selector == ':root' || selector == ':host') {
      // Root selectors are delegated to analytics roots.
      target = this.root.getRootElement();
      signalsPromise = this.getRootSignal(eventType);
    } else {
      // Look for the AMP-element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      var selectionMethod = config['selectionMethod'];
      signalsPromise = this.root.getAmpElement(context.parentElement || context, selector, selectionMethod).then(function (element) {
        target = element;
        return _this6.getElementSignal(eventType, target);
      });
    } // Wait for the target and the event signal.


    signalsPromise.then(function () {
      listener(new AnalyticsEvent(target, eventType));
    });
    return NO_UNLISTEN;
  }
  /** @override */
  ;

  _proto7.getRootSignal = function getRootSignal(eventType) {
    return this.root.signals().whenSignal(eventType);
  }
  /** @override */
  ;

  _proto7.getElementSignal = function getElementSignal(eventType, element) {
    if (typeof element.signals != 'function') {
      return Promise.resolve();
    }

    return element.signals().whenSignal(eventType);
  };

  return SignalTracker;
}(EventTracker);
/**
 * Tracks when the elements in the first viewport has been loaded - "ini-load".
 * @implements {SignalTrackerDef}
 */


exports.SignalTracker = SignalTracker;

var IniLoadTracker =
/*#__PURE__*/
function (_EventTracker5) {
  _inheritsLoose(IniLoadTracker, _EventTracker5);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function IniLoadTracker(root) {
    return _EventTracker5.call(this, root) || this;
  }
  /** @override */


  var _proto8 = IniLoadTracker.prototype;

  _proto8.dispose = function dispose() {}
  /** @override */
  ;

  _proto8.add = function add(context, eventType, config, listener) {
    var _this7 = this;

    var target;
    var promise;
    var selector = config['selector'] || ':root';

    if (selector == ':root' || selector == ':host') {
      // Root selectors are delegated to analytics roots.
      target = this.root.getRootElement();
      promise = this.getRootSignal();
    } else {
      // An AMP-element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      var selectionMethod = config['selectionMethod'];
      promise = this.root.getAmpElement(context.parentElement || context, selector, selectionMethod).then(function (element) {
        target = element;
        return _this7.getElementSignal('ini-load', target);
      });
    } // Wait for the target and the event.


    promise.then(function () {
      listener(new AnalyticsEvent(target, eventType));
    });
    return NO_UNLISTEN;
  }
  /** @override */
  ;

  _proto8.getRootSignal = function getRootSignal() {
    return this.root.whenIniLoaded();
  }
  /** @override */
  ;

  _proto8.getElementSignal = function getElementSignal(unusedEventType, element) {
    if (typeof element.signals != 'function') {
      return Promise.resolve();
    }

    var signals = element.signals();
    return Promise.race([signals.whenSignal(_commonSignals.CommonSignals.INI_LOAD), signals.whenSignal(_commonSignals.CommonSignals.LOAD_END)]);
  };

  return IniLoadTracker;
}(EventTracker);
/**
 * Timer event handler.
 */


exports.IniLoadTracker = IniLoadTracker;

var TimerEventHandler =
/*#__PURE__*/
function () {
  /**
   * @param {JsonObject} timerSpec The timer specification.
   * @param {function(): UnlistenDef=} opt_startBuilder Factory for building
   *     start trackers for this timer.
   * @param {function(): UnlistenDef=} opt_stopBuilder Factory for building stop
   *     trackers for this timer.
   */
  function TimerEventHandler(timerSpec, opt_startBuilder, opt_stopBuilder) {
    /** @private {number|undefined} */
    this.intervalId_ = undefined;
    (0, _log.userAssert)('interval' in timerSpec, 'Timer interval specification required');
    /** @private @const {number} */

    this.intervalLength_ = Number(timerSpec['interval']) || 0;
    (0, _log.userAssert)(this.intervalLength_ >= MIN_TIMER_INTERVAL_SECONDS, 'Bad timer interval specification');
    /** @private @const {number} */

    this.maxTimerLength_ = 'maxTimerLength' in timerSpec ? Number(timerSpec['maxTimerLength']) : DEFAULT_MAX_TIMER_LENGTH_SECONDS;
    (0, _log.userAssert)(this.maxTimerLength_ > 0, 'Bad maxTimerLength specification');
    /** @private @const {boolean} */

    this.maxTimerInSpec_ = 'maxTimerLength' in timerSpec;
    /** @private @const {boolean} */

    this.callImmediate_ = 'immediate' in timerSpec ? Boolean(timerSpec['immediate']) : true;
    /** @private {?function()} */

    this.intervalCallback_ = null;
    /** @private {?UnlistenDef} */

    this.unlistenStart_ = null;
    /** @private {?UnlistenDef} */

    this.unlistenStop_ = null;
    /** @private @const {?function(): UnlistenDef} */

    this.startBuilder_ = opt_startBuilder || null;
    /** @private @const {?function(): UnlistenDef} */

    this.stopBuilder_ = opt_stopBuilder || null;
    /** @private {number|undefined} */

    this.startTime_ = undefined; // milliseconds

    /** @private {number|undefined} */

    this.lastRequestTime_ = undefined; // milliseconds
  }
  /**
   * @param {function()} startTimer
   */


  var _proto9 = TimerEventHandler.prototype;

  _proto9.init = function init(startTimer) {
    if (!this.startBuilder_) {
      // Timer starts on load.
      startTimer();
    } else {
      // Timer starts on event.
      this.listenForStart_();
    }
  }
  /**
   * Unlistens for start and stop.
   */
  ;

  _proto9.dispose = function dispose() {
    this.unlistenForStop_();
    this.unlistenForStart_();
  }
  /** @private */
  ;

  _proto9.listenForStart_ = function listenForStart_() {
    if (this.startBuilder_) {
      this.unlistenStart_ = this.startBuilder_();
    }
  }
  /** @private */
  ;

  _proto9.unlistenForStart_ = function unlistenForStart_() {
    if (this.unlistenStart_) {
      this.unlistenStart_();
      this.unlistenStart_ = null;
    }
  }
  /** @private */
  ;

  _proto9.listenForStop_ = function listenForStop_() {
    if (this.stopBuilder_) {
      try {
        this.unlistenStop_ = this.stopBuilder_();
      } catch (e) {
        this.dispose(); // Stop timer and then throw error.

        throw e;
      }
    }
  }
  /** @private */
  ;

  _proto9.unlistenForStop_ = function unlistenForStop_() {
    if (this.unlistenStop_) {
      this.unlistenStop_();
      this.unlistenStop_ = null;
    }
  }
  /** @return {boolean} */
  ;

  _proto9.isRunning = function isRunning() {
    return !!this.intervalId_;
  }
  /**
   * @param {!Window} win
   * @param {function()} timerCallback
   * @param {function()} timeoutCallback
   */
  ;

  _proto9.startIntervalInWindow = function startIntervalInWindow(win, timerCallback, timeoutCallback) {
    if (this.isRunning()) {
      return;
    }

    this.startTime_ = Date.now();
    this.lastRequestTime_ = undefined;
    this.intervalCallback_ = timerCallback;
    this.intervalId_ = win.setInterval(function () {
      timerCallback();
    }, this.intervalLength_ * 1000); // If there's no way to turn off the timer, cap it.

    if (!this.stopBuilder_ || this.stopBuilder_ && this.maxTimerInSpec_) {
      win.setTimeout(function () {
        timeoutCallback();
      }, this.maxTimerLength_ * 1000);
    }

    this.unlistenForStart_();

    if (this.callImmediate_) {
      timerCallback();
    }

    this.listenForStop_();
  }
  /**
   * @param {!Window} win
   * @restricted
   */
  ;

  _proto9.stopTimer_ = function stopTimer_(win) {
    if (!this.isRunning()) {
      return;
    }

    this.intervalCallback_();
    this.intervalCallback_ = null;
    win.clearInterval(this.intervalId_);
    this.intervalId_ = undefined;
    this.lastRequestTime_ = undefined;
    this.unlistenForStop_();
    this.listenForStart_();
  }
  /**
   * @private
   * @return {number}
   */
  ;

  _proto9.calculateDuration_ = function calculateDuration_() {
    if (this.startTime_) {
      return Date.now() - (this.lastRequestTime_ || this.startTime_);
    }

    return 0;
  }
  /** @return {!JsonObject} */
  ;

  _proto9.getTimerVars = function getTimerVars() {
    var timerDuration = 0;

    if (this.isRunning()) {
      timerDuration = this.calculateDuration_();
      this.lastRequestTime_ = Date.now();
    }

    return (0, _object.dict)({
      'timerDuration': timerDuration,
      'timerStart': this.startTime_ || 0
    });
  };

  return TimerEventHandler;
}();
/**
 * Tracks timer events.
 */


var TimerEventTracker =
/*#__PURE__*/
function (_EventTracker6) {
  _inheritsLoose(TimerEventTracker, _EventTracker6);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function TimerEventTracker(root) {
    var _this8;

    _this8 = _EventTracker6.call(this, root) || this;
    /** @const @private {!Object<number, TimerEventHandler>} */

    _this8.trackers_ = {};
    /** @private {number} */

    _this8.timerIdSequence_ = 1;
    return _this8;
  }
  /**
   * @return {!Array<number>}
   * @visibleForTesting
   */


  var _proto10 = TimerEventTracker.prototype;

  _proto10.getTrackedTimerKeys = function getTrackedTimerKeys() {
    return (
      /** @type {!Array<number>} */
      Object.keys(this.trackers_)
    );
  }
  /** @override */
  ;

  _proto10.dispose = function dispose() {
    var _this9 = this;

    this.getTrackedTimerKeys().forEach(function (timerId) {
      _this9.removeTracker_(timerId);
    });
  }
  /** @override */
  ;

  _proto10.add = function add(context, eventType, config, listener) {
    var _this10 = this;

    var timerSpec = config['timerSpec'];
    (0, _log.userAssert)(timerSpec && typeof timerSpec == 'object', 'Bad timer specification');
    var timerStart = 'startSpec' in timerSpec ? timerSpec['startSpec'] : null;
    (0, _log.userAssert)(!timerStart || typeof timerStart == 'object', 'Bad timer start specification');
    var timerStop = 'stopSpec' in timerSpec ? timerSpec['stopSpec'] : null;
    (0, _log.userAssert)(!timerStart && !timerStop || typeof timerStop == 'object', 'Bad timer stop specification');
    var timerId = this.generateTimerId_();
    var startBuilder;
    var stopBuilder;

    if (timerStart) {
      var startTracker = this.getTracker_(timerStart);
      (0, _log.userAssert)(startTracker, 'Cannot track timer start');
      startBuilder = startTracker.add.bind(startTracker, context, timerStart['on'], timerStart, this.handleTimerToggle_.bind(this, timerId, eventType, listener));
    }

    if (timerStop) {
      var stopTracker = this.getTracker_(timerStop);
      (0, _log.userAssert)(stopTracker, 'Cannot track timer stop');
      stopBuilder = stopTracker.add.bind(stopTracker, context, timerStop['on'], timerStop, this.handleTimerToggle_.bind(this, timerId, eventType, listener));
    }

    var timerHandler = new TimerEventHandler(timerSpec, startBuilder, stopBuilder);
    this.trackers_[timerId] = timerHandler;
    timerHandler.init(this.startTimer_.bind(this, timerId, eventType, listener));
    return function () {
      _this10.removeTracker_(timerId);
    };
  }
  /**
   * @return {number}
   * @private
   */
  ;

  _proto10.generateTimerId_ = function generateTimerId_() {
    return ++this.timerIdSequence_;
  }
  /**
   * @param {!JsonObject} config
   * @return {?EventTracker}
   * @private
   */
  ;

  _proto10.getTracker_ = function getTracker_(config) {
    var eventType = (0, _log.user)().assertString(config['on']);
    var trackerKey = getTrackerKeyName(eventType);
    return this.root.getTrackerForWhitelist(trackerKey, getTrackerTypesForParentType('timer'));
  }
  /**
   * Toggles which listeners are active depending on timer state, so no race
   * conditions can occur in the case where the timer starts and stops on the
   * same event type from the same target.
   * @param {number} timerId
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @private
   */
  ;

  _proto10.handleTimerToggle_ = function handleTimerToggle_(timerId, eventType, listener) {
    var timerHandler = this.trackers_[timerId];

    if (!timerHandler) {
      return;
    }

    if (timerHandler.isRunning()) {
      this.stopTimer_(timerId);
    } else {
      this.startTimer_(timerId, eventType, listener);
    }
  }
  /**
   * @param {number} timerId
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @private
   */
  ;

  _proto10.startTimer_ = function startTimer_(timerId, eventType, listener) {
    var _this11 = this;

    var timerHandler = this.trackers_[timerId];

    var timerCallback = function timerCallback() {
      listener(_this11.createEvent_(timerId, eventType));
    };

    timerHandler.startIntervalInWindow(this.root.ampdoc.win, timerCallback, this.removeTracker_.bind(this, timerId));
  }
  /**
   * @param {number} timerId
   * @private
   */
  ;

  _proto10.stopTimer_ = function stopTimer_(timerId) {
    this.trackers_[timerId].stopTimer_(this.root.ampdoc.win);
  }
  /**
   * @param {number} timerId
   * @param {string} eventType
   * @return {!AnalyticsEvent}
   * @private
   */
  ;

  _proto10.createEvent_ = function createEvent_(timerId, eventType) {
    return new AnalyticsEvent(this.root.getRootElement(), eventType, this.trackers_[timerId].getTimerVars());
  }
  /**
   * @param {number} timerId
   * @private
   */
  ;

  _proto10.removeTracker_ = function removeTracker_(timerId) {
    if (this.trackers_[timerId]) {
      this.stopTimer_(timerId);
      this.trackers_[timerId].dispose();
      delete this.trackers_[timerId];
    }
  };

  return TimerEventTracker;
}(EventTracker);
/**
 * Tracks video session events
 */


exports.TimerEventTracker = TimerEventTracker;

var VideoEventTracker =
/*#__PURE__*/
function (_EventTracker7) {
  _inheritsLoose(VideoEventTracker, _EventTracker7);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function VideoEventTracker(root) {
    var _this12;

    _this12 = _EventTracker7.call(this, root) || this;
    /** @private {?Observable<!Event>} */

    _this12.sessionObservable_ = new _observable.Observable();
    /** @private {?function(!Event)} */

    _this12.boundOnSession_ = _this12.sessionObservable_.fire.bind(_this12.sessionObservable_);
    Object.keys(_videoInterface.VideoAnalyticsEvents).forEach(function (key) {
      _this12.root.getRoot().addEventListener(_videoInterface.VideoAnalyticsEvents[key], _this12.boundOnSession_);
    });
    return _this12;
  }
  /** @override */


  var _proto11 = VideoEventTracker.prototype;

  _proto11.dispose = function dispose() {
    var _this13 = this;

    var root = this.root.getRoot();
    Object.keys(_videoInterface.VideoAnalyticsEvents).forEach(function (key) {
      root.removeEventListener(_videoInterface.VideoAnalyticsEvents[key], _this13.boundOnSession_);
    });
    this.boundOnSession_ = null;
    this.sessionObservable_ = null;
  }
  /** @override */
  ;

  _proto11.add = function add(context, eventType, config, listener) {
    var videoSpec = config['videoSpec'] || {};
    var selector = config['selector'] || videoSpec['selector'];
    var selectionMethod = config['selectionMethod'] || null;
    var targetReady = this.root.getElement(context, selector, selectionMethod);
    var endSessionWhenInvisible = videoSpec['end-session-when-invisible'];
    var excludeAutoplay = videoSpec['exclude-autoplay'];
    var interval = videoSpec['interval'];
    var percentages = videoSpec['percentages'];
    var on = config['on'];
    var percentageInterval = 5;
    var intervalCounter = 0;
    var lastPercentage = 0;
    return this.sessionObservable_.add(function (event) {
      var type = event.type;
      var details =
      /** @type {?JsonObject|undefined} */
      (0, _eventHelper.getData)(event);
      var normalizedType = normalizeVideoEventType(type, details);

      if (normalizedType !== on) {
        return;
      }

      if (normalizedType === _videoInterface.VideoAnalyticsEvents.SECONDS_PLAYED && !interval) {
        (0, _log.user)().error(TAG, 'video-seconds-played requires interval spec with non-zero value');
        return;
      }

      if (normalizedType === _videoInterface.VideoAnalyticsEvents.SECONDS_PLAYED) {
        intervalCounter++;

        if (intervalCounter % interval !== 0) {
          return;
        }
      }

      if (normalizedType === _videoInterface.VideoAnalyticsEvents.PERCENTAGE_PLAYED) {
        if (!percentages) {
          (0, _log.user)().error(TAG, 'video-percentage-played requires percentages spec.');
          return;
        }

        for (var i = 0; i < percentages.length; i++) {
          var percentage = percentages[i];

          if (percentage <= 0 || percentage % percentageInterval != 0) {
            (0, _log.user)().error(TAG, 'Percentages must be set in increments of %s with non-zero ' + 'values', percentageInterval);
            return;
          }
        }

        var normalizedPercentage = details['normalizedPercentage'];
        var normalizedPercentageInt = parseInt(normalizedPercentage, 10);
        (0, _log.devAssert)((0, _types.isFiniteNumber)(normalizedPercentageInt));
        (0, _log.devAssert)(normalizedPercentageInt % percentageInterval == 0);

        if (lastPercentage == normalizedPercentageInt) {
          return;
        }

        if (percentages.indexOf(normalizedPercentageInt) < 0) {
          return;
        }

        lastPercentage = normalizedPercentageInt;
      }

      if (type === _videoInterface.VideoAnalyticsEvents.SESSION_VISIBLE && !endSessionWhenInvisible) {
        return;
      }

      if (excludeAutoplay && details['state'] === _videoInterface.PlayingStates.PLAYING_AUTO) {
        return;
      }

      var el = (0, _log.dev)().assertElement(event.target, 'No target specified by video session event.');
      targetReady.then(function (target) {
        if (!target.contains(el)) {
          return;
        }

        var normalizedDetails = removeInternalVars(details);
        listener(new AnalyticsEvent(target, normalizedType, normalizedDetails));
      });
    });
  };

  return VideoEventTracker;
}(EventTracker);
/**
 * Normalize video type from internal representation into the observed string
 * from the analytics configuration.
 * @param {string} type
 * @param {?JsonObject|undefined} details
 * @return {string}
 */


exports.VideoEventTracker = VideoEventTracker;

function normalizeVideoEventType(type, details) {
  if (type == _videoInterface.VideoAnalyticsEvents.SESSION_VISIBLE) {
    return _videoInterface.VideoAnalyticsEvents.SESSION;
  } // Custom video analytics events are listened to from one signal type,
  // but they're configured by user with their custom name.


  if (type == _videoInterface.VideoAnalyticsEvents.CUSTOM) {
    return (0, _log.dev)().assertString(details[_videoInterface.videoAnalyticsCustomEventTypeKey]);
  }

  return type;
}
/**
 * @param {?JsonObject|undefined} details
 * @return {?JsonObject|undefined}
 */


function removeInternalVars(details) {
  if (!details) {
    return details;
  }

  var clean = Object.assign({}, details);
  delete clean[_videoInterface.videoAnalyticsCustomEventTypeKey];
  return (
    /** @type {!JsonObject} */
    clean
  );
}
/**
 * Tracks visibility events.
 */


var VisibilityTracker =
/*#__PURE__*/
function (_EventTracker8) {
  _inheritsLoose(VisibilityTracker, _EventTracker8);

  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   */
  function VisibilityTracker(root) {
    var _this14;

    _this14 = _EventTracker8.call(this, root) || this;
    /** @private */

    _this14.waitForTrackers_ = {};
    return _this14;
  }
  /** @override */


  var _proto12 = VisibilityTracker.prototype;

  _proto12.dispose = function dispose() {}
  /** @override */
  ;

  _proto12.add = function add(context, eventType, config, listener) {
    var _this15 = this;

    var visibilitySpec = config['visibilitySpec'] || {};
    var selector = config['selector'] || visibilitySpec['selector'];
    var waitForSpec = visibilitySpec['waitFor'];
    var reportWhenSpec = visibilitySpec['reportWhen'];
    var createReportReadyPromiseFunc = null;

    if (reportWhenSpec) {
      (0, _log.userAssert)(!visibilitySpec['repeat'], 'reportWhen and repeat are mutually exclusive.');
    }

    if (eventType === AnalyticsEventType.HIDDEN) {
      if (reportWhenSpec) {
        (0, _log.user)().error(TAG, 'ReportWhen should not be defined when eventType is "hidden"');
      } // special polyfill for eventType: 'hidden'


      reportWhenSpec = 'documentHidden';
    }

    var visibilityManagerPromise = this.root.isUsingHostAPI().then(function (hasHostAPI) {
      if (hasHostAPI) {
        _this15.assertMeasurableWithHostApi_(selector, reportWhenSpec);
      }

      return _this15.root.getVisibilityManager();
    });

    if (reportWhenSpec == 'documentHidden') {
      createReportReadyPromiseFunc = this.createReportReadyPromiseForDocumentHidden_.bind(this);
    } else if (reportWhenSpec == 'documentExit') {
      createReportReadyPromiseFunc = this.createReportReadyPromiseForDocumentExit_.bind(this);
    } else {
      (0, _log.userAssert)(!reportWhenSpec, 'reportWhen value "%s" not supported.', reportWhenSpec);
    }

    var unlistenPromise; // Root selectors are delegated to analytics roots.

    if (!selector || selector == ':root' || selector == ':host') {
      // When `selector` is specified, we always use "ini-load" signal as
      // a "ready" signal.
      unlistenPromise = visibilityManagerPromise.then(function (visibilityManager) {
        return visibilityManager.listenRoot(visibilitySpec, _this15.getReadyPromise(waitForSpec, selector), createReportReadyPromiseFunc, _this15.onEvent_.bind(_this15, eventType, listener, _this15.root.getRootElement()));
      }, function () {});
    } else {
      // An AMP-element. Wait for DOM to be fully parsed to avoid
      // false missed searches.
      var selectionMethod = config['selectionMethod'] || visibilitySpec['selectionMethod'];
      unlistenPromise = this.root.getAmpElement(context.parentElement || context, selector, selectionMethod).then(function (element) {
        return visibilityManagerPromise.then(function (visibilityManager) {
          return visibilityManager.listenElement(element, visibilitySpec, _this15.getReadyPromise(waitForSpec, selector, element), createReportReadyPromiseFunc, _this15.onEvent_.bind(_this15, eventType, listener, element));
        }, function () {});
      });
    }

    return function () {
      unlistenPromise.then(function (unlisten) {
        unlisten();
      });
    };
  }
  /**
   * Assert that the setting is measurable with host API
   * @param {string=} selector
   * @param {string=} reportWhenSpec
   */
  ;

  _proto12.assertMeasurableWithHostApi_ = function assertMeasurableWithHostApi_(selector, reportWhenSpec) {
    (0, _log.userAssert)(!selector || selector == ':root' || selector == ':host', 'Element %s that is not root is not supported with host API', selector);
    (0, _log.userAssert)(reportWhenSpec !== 'documentExit', 'reportWhen : documentExit is not supported with host API');
  }
  /**
   * Returns a Promise indicating that we're ready to report the analytics,
   * in the case of reportWhen: documentHidden
   * @return {!Promise}
   * @private
   */
  ;

  _proto12.createReportReadyPromiseForDocumentHidden_ = function createReportReadyPromiseForDocumentHidden_() {
    var ampdoc = this.root.ampdoc;

    if (!ampdoc.isVisible()) {
      return Promise.resolve();
    }

    return new Promise(function (resolve) {
      ampdoc.onVisibilityChanged(function () {
        if (!ampdoc.isVisible()) {
          resolve();
        }
      });
    });
  }
  /**
   * Returns a Promise indicating that we're ready to report the analytics,
   * in the case of reportWhen: documentExit
   * @return {!Promise}
   * @private
   */
  ;

  _proto12.createReportReadyPromiseForDocumentExit_ = function createReportReadyPromiseForDocumentExit_() {
    var deferred = new _promise.Deferred();
    var win = this.root.ampdoc.win;

    var _unloadListener, _pageHideListener; // Do not add an unload listener unless pagehide is not available.
    // If an unload listener is present, the back/forward cache will not work.
    // The BFCache saves pages to be instantly loaded when navigating back
    // or forward and pauses their JavaScript. The pagehide event was added
    // to give developers control over the behavior, and the unload listener
    // interferes with it. To allow publishers to use the default BFCache
    // behavior, we should not add an unload listener.


    if (!this.supportsPageHide_()) {
      win.addEventListener(
      /*OK*/
      'unload', _unloadListener = function unloadListener() {
        win.removeEventListener('unload', _unloadListener);
        deferred.resolve();
      });
    } // Note: pagehide is currently not supported on Opera Mini, nor IE<=10.
    // Documentation conflicts as to whether Safari on iOS will also fire it
    // when switching tabs or switching to another app. Chrome does not fire it
    // in this case.
    // Good, but several years old, analysis at:
    // https://www.igvita.com/2015/11/20/dont-lose-user-and-app-state-use-page-visibility/
    // Especially note the event table on this page.


    win.addEventListener('pagehide', _pageHideListener = function pageHideListener() {
      win.removeEventListener('pagehide', _pageHideListener);
      deferred.resolve();
    });
    return deferred.promise;
  }
  /**
   * Detect support for the pagehide event.
   * IE<=10 and Opera Mini do not support the pagehide event and
   * possibly others, so we feature-detect support with this method.
   * This is in a stubbable method for testing.
   * @return {boolean}
   * @private visible for testing
   */
  ;

  _proto12.supportsPageHide_ = function supportsPageHide_() {
    return 'onpagehide' in this.root.ampdoc.win;
  }
  /**
   * @param {string|undefined} waitForSpec
   * @param {string|undefined} selector
   * @param {Element=} opt_element
   * @return {?Promise}
   * @visibleForTesting
   */
  ;

  _proto12.getReadyPromise = function getReadyPromise(waitForSpec, selector, opt_element) {
    if (!waitForSpec) {
      // Default case:
      if (!selector) {
        // waitFor selector is not defined, wait for nothing
        return null;
      } else {
        // otherwise wait for ini-load by default
        waitForSpec = 'ini-load';
      }
    }

    var trackerWhitelist = getTrackerTypesForParentType('visible');
    (0, _log.userAssert)(waitForSpec == 'none' || trackerWhitelist[waitForSpec] !== undefined, 'waitFor value %s not supported', waitForSpec);
    var waitForTracker = this.waitForTrackers_[waitForSpec] || this.root.getTrackerForWhitelist(waitForSpec, trackerWhitelist);

    if (waitForTracker) {
      this.waitForTrackers_[waitForSpec] = waitForTracker;
    } else {
      return null;
    } // Wait for root signal if there's no element selected.


    return opt_element ? waitForTracker.getElementSignal(waitForSpec, opt_element) : waitForTracker.getRootSignal(waitForSpec);
  }
  /**
   * @param {string} eventType
   * @param {function(!AnalyticsEvent)} listener
   * @param {!Element} target
   * @param {!JsonObject} state
   * @private
   */
  ;

  _proto12.onEvent_ = function onEvent_(eventType, listener, target, state) {
    var attr = (0, _dom.getDataParamsFromAttributes)(target,
    /* computeParamNameFunc */
    undefined, VARIABLE_DATA_ATTRIBUTE_KEY);

    for (var key in attr) {
      state[key] = attr[key];
    }

    listener(new AnalyticsEvent(target, eventType, state));
  };

  return VisibilityTracker;
}(EventTracker);

exports.VisibilityTracker = VisibilityTracker;

},{"../../../src/common-signals":105,"../../../src/dom":111,"../../../src/event-helper":114,"../../../src/log":125,"../../../src/observable":128,"../../../src/string":143,"../../../src/types":145,"../../../src/utils/object":154,"../../../src/utils/promise":156,"../../../src/video-interface":157}],10:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.IframeTransportMessageQueue = void 0;

var _pFrameMessaging = require("../../../src/3p-frame-messaging");

var _iframeHelper = require("../../../src/iframe-helper");

var _log = require("../../../src/log");

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

/** @private @const {string} */
var TAG_ = 'amp-analytics/iframe-transport-message-queue';
/** @private @const {number} */

var MAX_QUEUE_SIZE_ = 100;
/**
 * @visibleForTesting
 */

var IframeTransportMessageQueue =
/*#__PURE__*/
function () {
  /**
   * Constructor
   * @param {!Window} win The window element
   * @param {!HTMLIFrameElement} frame The cross-domain iframe to send
   * messages to
   */
  function IframeTransportMessageQueue(win, frame) {
    var _this = this;

    /** @private {!HTMLIFrameElement} */
    this.frame_ = frame;
    /** @private {boolean} */

    this.isReady_ = false;
    /**
     * @private
     * {!Array<!../../../src/3p-frame-messaging.IframeTransportEvent>}
     */

    this.pendingEvents_ = [];
    /** @private {!../../../src/iframe-helper.SubscriptionApi} */

    this.postMessageApi_ = new _iframeHelper.SubscriptionApi(this.frame_, _pFrameMessaging.MessageType.SEND_IFRAME_TRANSPORT_EVENTS, true, function () {
      _this.setIsReady();
    });
  }
  /**
   * Returns whether the queue has been marked as ready yet
   * @return {boolean}
   * @visibleForTesting
   */


  var _proto = IframeTransportMessageQueue.prototype;

  _proto.isReady = function isReady() {
    return this.isReady_;
  }
  /**
   * Indicate that a cross-domain frame is ready to receive messages, and
   * send all messages that were previously queued for it.
   * @visibleForTesting
   */
  ;

  _proto.setIsReady = function setIsReady() {
    this.isReady_ = true;
    this.flushQueue_();
  }
  /**
   * Returns how many creativeId -> message(s) mappings there are
   * @return {number}
   * @visibleForTesting
   */
  ;

  _proto.queueSize = function queueSize() {
    return this.pendingEvents_.length;
  }
  /**
   * Enqueues an event to be sent to a cross-domain iframe.
   * @param {!../../../src/3p-frame-messaging.IframeTransportEvent} event
   * Identifies the event and which Transport instance (essentially which
   * creative) is sending it.
   */
  ;

  _proto.enqueue = function enqueue(event) {
    (0, _log.devAssert)(event && event.creativeId && event.message, 'Attempted to enqueue malformed message for: ' + event.creativeId);
    this.pendingEvents_.push(event);

    if (this.queueSize() >= MAX_QUEUE_SIZE_) {
      (0, _log.dev)().warn(TAG_, 'Exceeded maximum size of queue for: ' + event.creativeId);
      this.pendingEvents_.shift();
    }

    this.flushQueue_();
  }
  /**
   * Send queued data (if there is any) to a cross-domain iframe
   * @private
   */
  ;

  _proto.flushQueue_ = function flushQueue_() {
    if (this.isReady() && this.queueSize()) {
      this.postMessageApi_.send(_pFrameMessaging.MessageType.IFRAME_TRANSPORT_EVENTS,
      /** @type {!JsonObject} */
      {
        events: this.pendingEvents_
      });
      this.pendingEvents_ = [];
    }
  };

  return IframeTransportMessageQueue;
}();

exports.IframeTransportMessageQueue = IframeTransportMessageQueue;

},{"../../../src/3p-frame-messaging":103,"../../../src/iframe-helper":116,"../../../src/log":125}],11:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.IFRAME_TRANSPORTS_CANARY = exports.IFRAME_TRANSPORTS = void 0;

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
 * Vendors who have IAB viewability certification may use iframe transport
 * (see ../amp-analytics.md and ../integrating-analytics.md). In this case,
 * put only the specification of the iframe location in the object below.
 *
 * This object is separated from vendors.js to be shared with extensions
 * other than amp-analytics, for instance amp-ad-exit.
 *
 * @const {!Object}
 */
var prodConfig = {
  'bg': 'https://tpc.googlesyndication.com/b4a/b4a-runner.html',
  'moat': 'https://z.moatads.com/ampanalytics093284/iframe.html'
};
/**
 * Canary config override
 *
 * @const {!Object}
 */

var canaryConfig = Object.assign({}, prodConfig, {
  'bg': 'https://tpc.googlesyndication.com/b4a/experimental/b4a-runner.html'
});
var IFRAME_TRANSPORTS =
/** @type {!JsonObject} */
prodConfig;
exports.IFRAME_TRANSPORTS = IFRAME_TRANSPORTS;
var IFRAME_TRANSPORTS_CANARY =
/** @type {!JsonObject} */
canaryConfig;
exports.IFRAME_TRANSPORTS_CANARY = IFRAME_TRANSPORTS_CANARY;

},{}],12:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getIframeTransportScriptUrl = getIframeTransportScriptUrl;
exports.IframeTransport = exports.FrameData = void 0;

var _iframeTransportMessageQueue = require("./iframe-transport-message-queue");

var _dom = require("../../../src/dom");

var _log = require("../../../src/log");

var _mode = require("../../../src/mode");

var _object = require("../../../src/utils/object");

var _internalVersion = require("../../../src/internal-version");

var _jankMeter = require("../../../src/service/jank-meter");

var _style = require("../../../src/style");

var _config = require("../../../src/config");

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

/** @private @const {string} */
var TAG_ = 'amp-analytics/iframe-transport';
/** @private @const {number} */

var LONG_TASK_REPORTING_THRESHOLD = 5;
/** @typedef {{
 *    frame: Element,
 *    sentinel: string,
 *    usageCount: number,
 *    queue: IframeTransportMessageQueue,
 *  }} */

var FrameData;
/**
 * Get the URL of the client lib
 * @param {!Window} ampWin The window object of the AMP document
 * @param {boolean=} opt_forceProdUrl If true, prod URL will be returned even
 *     in local/test modes.
 * @return {string}
 */

exports.FrameData = FrameData;

function getIframeTransportScriptUrl(ampWin, opt_forceProdUrl) {
  if (((0, _mode.getMode)().localDev || (0, _mode.getMode)().test) && !opt_forceProdUrl && ampWin.parent && ampWin.parent.location) {
    var loc = ampWin.parent.location;
    return loc.protocol + "//" + loc.host + "/dist/iframe-transport-client-lib.js";
  }

  return _config.urls.thirdParty + ("/" + (0, _internalVersion.internalRuntimeVersion)() + "/iframe-transport-client-v0.js");
}
/**
 * @visibleForTesting
 */


var IframeTransport =
/*#__PURE__*/
function () {
  /**
   * @param {!Window} ampWin The window object of the AMP document
   * @param {string} type The value of the amp-analytics tag's type attribute
   * @param {!JsonObject} config
   * @param {string} id If (potentially) using sendResponseToCreative(), it
   *     should be something that the recipient can use to identify the
   *     context of the message, e.g. the resourceID of a DOM element.
   */
  function IframeTransport(ampWin, type, config, id) {
    /** @private @const {!Window} */
    this.ampWin_ = ampWin;
    /** @private @const {string} */

    this.type_ = type;
    /** @private @const {string} */

    this.creativeId_ = id;
    (0, _log.devAssert)(config && config['iframe'], 'Must supply iframe URL to constructor!');
    this.frameUrl_ = config['iframe'];
    /** @private {number} */

    this.numLongTasks_ = 0;
    this.processCrossDomainIframe();
  }
  /**
   * Called when a Transport instance is being removed from the DOM
   */


  var _proto = IframeTransport.prototype;

  _proto.detach = function detach() {
    IframeTransport.markCrossDomainIframeAsDone(this.ampWin_.document, this.type_);
  }
  /**
   * If iframe is specified in config/transport, check whether third-party
   * iframe already exists, and if not, create it.
   */
  ;

  _proto.processCrossDomainIframe = function processCrossDomainIframe() {
    var frameData;

    if (IframeTransport.hasCrossDomainIframe(this.type_)) {
      frameData = IframeTransport.getFrameData(this.type_);
      ++frameData.usageCount;
    } else {
      frameData = this.createCrossDomainIframe();
      this.ampWin_.document.body.appendChild(frameData.frame);
      this.createPerformanceObserver_();
    }

    (0, _log.devAssert)(frameData, 'Trying to use non-existent frame');
  }
  /**
   * Create a cross-domain iframe for third-party vendor analytics
   * @return {!FrameData}
   * @visibleForTesting
   */
  ;

  _proto.createCrossDomainIframe = function createCrossDomainIframe() {
    // Explanation of IDs:
    // Each instance of IframeTransport (owned by a specific amp-analytics
    // tag, in turn owned by a specific creative) has an ID
    // (this.getCreativeId()).
    // Each cross-domain iframe also has an ID, stored here in sentinel.
    // These two types of IDs have different formats.
    // There is a many-to-one relationship, in that several creatives may
    // utilize the same analytics vendor, so perhaps two creatives might
    // both use the same vendor iframe.
    // Of course, a given creative may use multiple analytics vendors, but
    // in that case it would use multiple amp-analytics tags, so the
    // iframeTransport.getCreativeId() -> sentinel relationship is *not*
    // many-to-many.
    var sentinel = IframeTransport.createUniqueId_();
    var frameName = JSON.stringify(
    /** @type {JsonObject} */
    {
      scriptSrc: getIframeTransportScriptUrl(this.ampWin_),
      sentinel: sentinel,
      type: this.type_
    });
    var frame = (0, _dom.createElementWithAttributes)(this.ampWin_.document, 'iframe',
    /** @type {!JsonObject} */
    {
      sandbox: 'allow-scripts allow-same-origin',
      name: frameName,
      'data-amp-3p-sentinel': sentinel
    });
    frame.sentinel = sentinel;
    (0, _style.toggle)(frame, false);
    frame.src = this.frameUrl_;
    var frameData =
    /** @type {FrameData} */
    {
      frame: frame,
      usageCount: 1,
      queue: new _iframeTransportMessageQueue.IframeTransportMessageQueue(this.ampWin_,
      /** @type {!HTMLIFrameElement} */
      frame)
    };
    IframeTransport.crossDomainIframes_[this.type_] = frameData;
    return frameData;
  }
  /**
   * Uses the Long Task API to create an observer for when 3p vendor frames
   * take more than 50ms of continuous CPU time.
   * Currently the only action in response to that is to log. It will log
   * once per LONG_TASK_REPORTING_THRESHOLD that a long task occurs. (This
   * implies that there is a grace period for the first
   * LONG_TASK_REPORTING_THRESHOLD-1 occurrences.)
   * @private
   */
  ;

  _proto.createPerformanceObserver_ = function createPerformanceObserver_() {
    var _this = this;

    if (!(0, _jankMeter.isLongTaskApiSupported)(this.ampWin_)) {
      return;
    } // TODO(jonkeller): Consider merging with jank-meter.js


    IframeTransport.performanceObservers_[this.type_] = new this.ampWin_.PerformanceObserver(function (entryList) {
      if (!entryList) {
        return;
      }

      entryList.getEntries().forEach(function (entry) {
        if (entry && entry['entryType'] == 'longtask' && entry['name'] == 'cross-origin-descendant' && entry.attribution) {
          entry.attribution.forEach(function (attrib) {
            if (_this.frameUrl_ == attrib['containerSrc'] && ++_this.numLongTasks_ % LONG_TASK_REPORTING_THRESHOLD == 0) {
              (0, _log.user)().error(TAG_, "Long Task: Vendor: \"" + _this.type_ + "\"");
            }
          });
        }
      });
    });
    IframeTransport.performanceObservers_[this.type_].observe({
      entryTypes: ['longtask']
    });
  }
  /**
   * Called when a creative no longer needs its cross-domain iframe (for
   * instance, because the creative has been removed from the DOM).
   * Once all creatives using a frame are done with it, the frame can be
   * destroyed.
   * @param {!HTMLDocument} ampDoc The AMP document
   * @param {string} type The type attribute of the amp-analytics tag
   */
  ;

  IframeTransport.markCrossDomainIframeAsDone = function markCrossDomainIframeAsDone(ampDoc, type) {
    var frameData = IframeTransport.getFrameData(type);
    (0, _log.devAssert)(frameData && frameData.frame && frameData.usageCount, 'Marked the ' + type + ' frame as done, but there is no' + ' record of it existing.');

    if (--frameData.usageCount) {
      // Some other instance is still using it
      return;
    }

    ampDoc.body.removeChild(frameData.frame);
    delete IframeTransport.crossDomainIframes_[type];

    if (IframeTransport.performanceObservers_[type]) {
      IframeTransport.performanceObservers_[type].disconnect();
      IframeTransport.performanceObservers_[type] = null;
    }
  }
  /**
   * Returns whether this type of cross-domain frame is already known
   * @param {string} type The type attribute of the amp-analytics tag
   * @return {boolean}
   * @visibleForTesting
   */
  ;

  IframeTransport.hasCrossDomainIframe = function hasCrossDomainIframe(type) {
    return (0, _object.hasOwn)(IframeTransport.crossDomainIframes_, type);
  }
  /**
   * Create a unique value to differentiate messages from a particular
   * creative to the cross-domain iframe, or to identify the iframe itself.
   * @return {string}
   * @private
   */
  ;

  IframeTransport.createUniqueId_ = function createUniqueId_() {
    return String(++IframeTransport.nextId_);
  }
  /**
   * Sends an AMP Analytics trigger event to a vendor's cross-domain iframe,
   * or queues the message if the frame is not yet ready to receive messages.
   * @param {string} event A string describing the trigger event
   * @visibleForTesting
   */
  ;

  _proto.sendRequest = function sendRequest(event) {
    var frameData = IframeTransport.getFrameData(this.type_);
    (0, _log.devAssert)(frameData, 'Trying to send message to non-existent frame');
    (0, _log.devAssert)(frameData.queue, 'Event queue is missing for messages from ' + this.type_ + ' to creative ID ' + this.creativeId_);
    frameData.queue.enqueue(
    /**
     * @type {!../../../src/3p-frame-messaging.IframeTransportEvent}
     */
    {
      creativeId: this.creativeId_,
      message: event
    });
  }
  /**
   * Gets the FrameData associated with a particular cross-domain frame type.
   * @param {string} type The type attribute of the amp-analytics tag
   * @return {FrameData}
   * @visibleForTesting
   */
  ;

  IframeTransport.getFrameData = function getFrameData(type) {
    return IframeTransport.crossDomainIframes_[type];
  }
  /**
   * Removes all knowledge of cross-domain iframes.
   * Does not actually remove them from the DOM.
   * @visibleForTesting
   */
  ;

  IframeTransport.resetCrossDomainIframes = function resetCrossDomainIframes() {
    IframeTransport.crossDomainIframes_ = {};
  }
  /**
   * @return {string} Unique ID of this instance of IframeTransport
   * @visibleForTesting
   */
  ;

  _proto.getCreativeId = function getCreativeId() {
    return this.creativeId_;
  }
  /**
   * @return {string} Type attribute of parent amp-analytics instance
   * @visibleForTesting
   */
  ;

  _proto.getType = function getType() {
    return this.type_;
  };

  return IframeTransport;
}();
/** @private {Object<string, FrameData>} */


exports.IframeTransport = IframeTransport;
IframeTransport.crossDomainIframes_ = {};
/** @private {number} */

IframeTransport.nextId_ = 0;
/** @private {Object<string, PerformanceObserver>} */

IframeTransport.performanceObservers_ = {};

},{"../../../src/config":106,"../../../src/dom":111,"../../../src/internal-version":120,"../../../src/log":125,"../../../src/mode":127,"../../../src/service/jank-meter":136,"../../../src/style":144,"../../../src/utils/object":154,"./iframe-transport-message-queue":10}],13:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.instrumentationServicePromiseForDoc = instrumentationServicePromiseForDoc;
exports.instrumentationServiceForDocForTesting = instrumentationServiceForDocForTesting;
exports.InstrumentationService = void 0;

var _events = require("./events");

var _analyticsRoot = require("./analytics-root");

var _analyticsGroup = require("./analytics-group");

var _services = require("../../../src/services");

var _iframeHelper = require("../../../src/iframe-helper");

var _service = require("../../../src/service");

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
var PROP = '__AMP_AN_ROOT';
/**
 * @implements {../../../src/service.Disposable}
 * @private
 * @visibleForTesting
 */

var InstrumentationService =
/*#__PURE__*/
function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function InstrumentationService(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;
    /** @const */

    this.root_ = this.findRoot_(ampdoc.getRootNode());
  }
  /** @override */


  var _proto = InstrumentationService.prototype;

  _proto.dispose = function dispose() {
    this.root_.dispose();
  }
  /**
   * @param {!Node} context
   * @return {!./analytics-root.AnalyticsRoot}
   */
  ;

  _proto.getAnalyticsRoot = function getAnalyticsRoot(context) {
    return this.findRoot_(context);
  }
  /**
   * @param {!Element} analyticsElement
   * @return {!AnalyticsGroup}
   */
  ;

  _proto.createAnalyticsGroup = function createAnalyticsGroup(analyticsElement) {
    var root = this.findRoot_(analyticsElement);
    return new _analyticsGroup.AnalyticsGroup(root, analyticsElement);
  }
  /**
   * @param {string} trackerName
   * @private
   */
  ;

  _proto.getTrackerClass_ = function getTrackerClass_(trackerName) {
    switch (trackerName) {
      case _events.AnalyticsEventType.STORY:
        return _events.AmpStoryEventTracker;

      default:
        return _events.CustomEventTracker;
    }
  }
  /**
   * Triggers the analytics event with the specified type.
   *
   * @param {!Element} target
   * @param {string} eventType
   * @param {!JsonObject=} opt_vars A map of vars and their values.
   */
  ;

  _proto.triggerEventForTarget = function triggerEventForTarget(target, eventType, opt_vars) {
    var event = new _events.AnalyticsEvent(target, eventType, opt_vars);
    var root = this.findRoot_(target);
    var trackerName = (0, _events.getTrackerKeyName)(eventType);
    var tracker =
    /** @type {!CustomEventTracker|!AmpStoryEventTracker} */
    root.getTracker(trackerName, this.getTrackerClass_(trackerName));
    tracker.trigger(event);
  }
  /**
   * @param {!Node} context
   * @return {!./analytics-root.AnalyticsRoot}
   */
  ;

  _proto.findRoot_ = function findRoot_(context) {
    // TODO(#22733): cleanup when ampdoc-fie is launched. Just use
    // `ampdoc.getParent()`.
    var ampdoc = _services.Services.ampdoc(context);

    var frame = (0, _service.getParentWindowFrameElement)(context);
    var embed = frame && (0, _iframeHelper.getFriendlyIframeEmbedOptional)(frame);

    if (ampdoc == this.ampdoc && !embed && this.root_) {
      // Main root already exists.
      return this.root_;
    }

    return this.getOrCreateRoot_(embed || ampdoc, function () {
      if (embed) {
        return new _analyticsRoot.EmbedAnalyticsRoot(ampdoc, embed);
      }

      return new _analyticsRoot.AmpdocAnalyticsRoot(ampdoc);
    });
  }
  /**
   * @param {!Object} holder
   * @param {function():!./analytics-root.AnalyticsRoot} factory
   * @return {!./analytics-root.AnalyticsRoot}
   */
  ;

  _proto.getOrCreateRoot_ = function getOrCreateRoot_(holder, factory) {
    var root =
    /** @type {?./analytics-root.AnalyticsRoot} */
    holder[PROP];

    if (!root) {
      root = factory();
      holder[PROP] = root;
    }

    return root;
  };

  return InstrumentationService;
}();
/**
 * It's important to resolve instrumentation asynchronously in elements that
 * depends on it in multi-doc scope. Otherwise an element life-cycle could
 * resolve way before we have the service available.
 *
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<InstrumentationService>}
 */


exports.InstrumentationService = InstrumentationService;

function instrumentationServicePromiseForDoc(elementOrAmpDoc) {
  return (
    /** @type {!Promise<InstrumentationService>} */
    (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, 'amp-analytics-instrumentation')
  );
}
/**
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!InstrumentationService}
 */


function instrumentationServiceForDocForTesting(elementOrAmpDoc) {
  (0, _service.registerServiceBuilderForDoc)(elementOrAmpDoc, 'amp-analytics-instrumentation', InstrumentationService);
  return (0, _service.getServiceForDoc)(elementOrAmpDoc, 'amp-analytics-instrumentation');
}

},{"../../../src/iframe-helper":116,"../../../src/service":131,"../../../src/services":141,"./analytics-group":3,"./analytics-root":4,"./events":9}],14:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.areFriendlyDomains = areFriendlyDomains;
exports.isWildCardMatch = isWildCardMatch;
exports.LinkerManager = void 0;

var _variables = require("./variables");

var _navigation = require("../../../src/service/navigation");

var _services = require("../../../src/services");

var _windowInterface = require("../../../src/window-interface");

var _url = require("../../../src/url");

var _dom = require("../../../src/dom");

var _linker = require("./linker");

var _object = require("../../../src/utils/object");

var _cookies = require("../../../src/cookies");

var _types = require("../../../src/types");

var _log = require("../../../src/log");

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
var TAG = 'amp-analytics/linker-manager';
/** @const {string} */

var LINKER_CREATED = 'i-amphtml-linker-created';

var LinkerManager =
/*#__PURE__*/
function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} config
   * @param {?string} type
   * @param {!Element} element
   */
  function LinkerManager(ampdoc, config, type, element) {
    /** @const @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
    /** @private {?JsonObject|undefined} */

    this.config_ = config['linkers'];
    /** @const @private {!JsonObject} */

    this.vars_ = config['vars'] || {};
    /** @const @private {?string} */

    this.type_ = type;
    /** @const @private {!Element} */

    this.element_ = element;
    /** @private {!Array<Promise>} */

    this.allLinkerPromises_ = [];
    /** @const @private {!JsonObject} */

    this.resolvedIds_ = (0, _object.dict)();
    /** @const @private {!../../../src/service/url-impl.Url} */

    this.urlService_ = _services.Services.urlForDoc(this.element_);
    /** @const @private {!Promise<../../amp-form/0.1/form-submit-service.FormSubmitService>} */

    this.formSubmitService_ = _services.Services.formSubmitForDoc(ampdoc);
    /** @private {?UnlistenDef} */

    this.formSubmitUnlistener_ = null;
    /** @const @private {!./variables.VariableService} */

    this.variableService_ = (0, _variables.variableServiceForDoc)(this.ampdoc_);
    /** @private {?string} */

    this.highestAvailableDomain_ = null;
  }
  /**
   * Start resolving any macros that may exist in the linker configuration
   * and register the callback with the navigation service. Since macro
   * resolution is asynchronous the callback may be looking for these values
   * before they are ready.
   * @return {*} TODO(#23582): Specify return type
   */


  var _proto = LinkerManager.prototype;

  _proto.init = function init() {
    var _this = this;

    if (!(0, _types.isObject)(this.config_)) {
      return;
    }

    this.highestAvailableDomain_ = (0, _cookies.getHighestAvailableDomain)(this.ampdoc_.win);
    this.config_ = this.processConfig_(
    /** @type {!JsonObject} */
    this.config_); // Each linker config has it's own set of macros to resolve.

    this.allLinkerPromises_ = Object.keys(this.config_).map(function (name) {
      var ids = _this.config_[name]['ids']; // Keys for linker data.

      var keys = Object.keys(ids); // Expand the value of each key value pair (if necessary).

      var valuePromises = keys.map(function (key) {
        var expansionOptions = new _variables.ExpansionOptions(_this.vars_,
        /* opt_iterations */
        undefined,
        /* opt_noencode */
        true);
        return _this.expandTemplateWithUrlParams_(ids[key], expansionOptions);
      });
      return Promise.all(valuePromises).then(function (values) {
        // Rejoin each key with its expanded value.
        var expandedIds = {};
        values.forEach(function (value, i) {
          // Omit pair if value resolves to empty.
          if (value) {
            expandedIds[keys[i]] = value;
          }
        });
        _this.resolvedIds_[name] = expandedIds;
        return expandedIds;
      });
    });

    if (this.allLinkerPromises_.length) {
      var navigation = _services.Services.navigationForDoc(this.ampdoc_);

      navigation.registerAnchorMutator(function (element, event) {
        if (!element.href || event.type !== 'click') {
          return;
        }

        element.href = _this.applyLinkers_(element.href);
      }, _navigation.Priority.ANALYTICS_LINKER);
      navigation.registerNavigateToMutator(function (url) {
        return _this.applyLinkers_(url);
      }, _navigation.Priority.ANALYTICS_LINKER);
    }

    this.enableFormSupport_();
    return Promise.all(this.allLinkerPromises_);
  }
  /**
   * Remove any listeners created to manage form submission.
   */
  ;

  _proto.dispose = function dispose() {
    if (this.formSubmitUnlistener_) {
      this.formSubmitUnlistener_();
    }
  }
  /**
   * @param {!JsonObject} config
   * @return {!JsonObject}
   * @private
   */
  ;

  _proto.processConfig_ = function processConfig_(config) {
    var processedConfig = (0, _object.dict)();
    var defaultConfig = {
      enabled: this.isLegacyOptIn_() && this.isSafari12OrAbove_()
    };
    var linkerNames = Object.keys(config).filter(function (key) {
      var value = config[key];
      var isLinkerConfig = (0, _types.isObject)(value);

      if (!isLinkerConfig) {
        defaultConfig[key] = value;
      }

      return isLinkerConfig;
    });

    var location = _windowInterface.WindowInterface.getLocation(this.ampdoc_.win);

    var isProxyOrigin = this.urlService_.isProxyOrigin(location);
    linkerNames.forEach(function (name) {
      var mergedConfig = Object.assign({}, defaultConfig, config[name]);

      if (mergedConfig['enabled'] !== true) {
        (0, _log.user)().info(TAG, 'linker config for %s is not enabled and will be ignored.', name);
        return;
      }

      if (!isProxyOrigin && mergedConfig['proxyOnly'] !== false) {
        return;
      }

      if (!mergedConfig['ids']) {
        (0, _log.user)().error(TAG, '"ids" is a required field for use of "linkers".');
        return;
      }

      processedConfig[name] = mergedConfig;
    });
    return processedConfig;
  }
  /**
   * Expands spec using provided expansion options and applies url replacement
   * if necessary.
   * @param {string} template Expression that needs to be expanded.
   * @param {!ExpansionOptions} expansionOptions Expansion options.
   * @return {!Promise<string>} expanded template.
   */
  ;

  _proto.expandTemplateWithUrlParams_ = function expandTemplateWithUrlParams_(template, expansionOptions) {
    var _this2 = this;

    var bindings = this.variableService_.getMacros(this.element_);
    return this.variableService_.expandTemplate(template, expansionOptions).then(function (expanded) {
      var urlReplacements = _services.Services.urlReplacementsForDoc(_this2.element_);

      return urlReplacements.expandUrlAsync(expanded, bindings);
    });
  }
  /**
   * If the document has existing cid meta tag they do not need to explicity
   * opt-in to use linker.
   * @return {boolean}
   * @private
   */
  ;

  _proto.isLegacyOptIn_ = function isLegacyOptIn_() {
    var optInMeta = this.ampdoc_.win.document.head.
    /*OK*/
    querySelector('meta[name="amp-google-client-id-api"][content="googleanalytics"]');

    if (!optInMeta || optInMeta.hasAttribute(LINKER_CREATED) || this.type_ !== 'googleanalytics') {
      return false;
    }

    optInMeta.setAttribute(LINKER_CREATED, '');
    return true;
  }
  /**
   * If the browser is Safari 12 or above.
   * @return {boolean}
   * @private
   */
  ;

  _proto.isSafari12OrAbove_ = function isSafari12OrAbove_() {
    var platform = _services.Services.platformFor(this.ampdoc_.win);

    return platform.isSafari() && platform.getMajorVersion() >= 12;
  }
  /**
   * Apply linkers to the given url. Linker params are appended if there
   * are matching linker configs.
   *
   * @param {string} url
   * @return {string}
   * @private
   */
  ;

  _proto.applyLinkers_ = function applyLinkers_(url) {
    var linkerConfigs = this.config_;

    for (var linkerName in linkerConfigs) {
      // The linker param is created asynchronously. This callback should be
      // synchronous, so we skip if value is not there yet.
      if (this.resolvedIds_[linkerName]) {
        url = this.maybeAppendLinker_(url, linkerName, linkerConfigs[linkerName]);
      }
    }

    return url;
  }
  /**
   * Appends the linker param if the given url falls within rules defined in
   * linker configuration.
   * @param {string} url
   * @param {string} name
   * @param {!Object} config
   * @return {string}
   * @private
   */
  ;

  _proto.maybeAppendLinker_ = function maybeAppendLinker_(url, name, config) {
    var
    /** @type {Array} */
    domains = config['destinationDomains'];

    if (this.isDomainMatch_(url, name, domains)) {
      var linkerValue = (0, _linker.createLinker)(
      /* version */
      '1', this.resolvedIds_[name]);

      if (linkerValue) {
        var params = (0, _object.dict)();
        params[name] = linkerValue;
        return (0, _url.addMissingParamsToUrl)(url, params);
      }
    }

    return url;
  }
  /**
   * Check to see if the url is a match for the given set of domains.
   * @param {string} url
   * @param {string} name Name given in linker config.
   * @param {?Array} domains
   * @return {*} TODO(#23582): Specify return type
   */
  ;

  _proto.isDomainMatch_ = function isDomainMatch_(url, name, domains) {
    var _this$urlService_$par = this.urlService_.parse(url),
        hostname = _this$urlService_$par.hostname; // If given domains, but not in the right format.


    if (domains && !Array.isArray(domains)) {
      (0, _log.user)().warn(TAG, '%s destinationDomains must be an array.', name);
      return false;
    } // If destinationDomain is specified specifically, respect it.


    if (domains) {
      return this.destinationDomainsMatch_(domains, hostname);
    } // Fallback to default behavior
    // Don't append linker for exact domain match, relative urls, or
    // fragments.


    var winHostname = _windowInterface.WindowInterface.getHostname(this.ampdoc_.win);

    if (winHostname === hostname) {
      return false;
    }

    var _Services$documentInf = _services.Services.documentInfoForDoc(this.ampdoc_),
        sourceUrl = _Services$documentInf.sourceUrl,
        canonicalUrl = _Services$documentInf.canonicalUrl;

    var canonicalOrigin = this.urlService_.parse(canonicalUrl).hostname;
    var isFriendlyCanonicalOrigin = areFriendlyDomains(canonicalOrigin, hostname); // Default to all subdomains matching (if there's one) plus canonicalOrigin

    if (this.highestAvailableDomain_) {
      var destinationDomain = [this.highestAvailableDomain_, '*' + this.highestAvailableDomain_];
      return this.destinationDomainsMatch_(destinationDomain, hostname) || isFriendlyCanonicalOrigin;
    } // In the case where highestAvailableDomain cannot be found.
    // (proxyOrigin, no <meta name='amp-cookie-scope'> found)
    // default to friendly domain matching.


    var sourceOrigin = this.urlService_.parse(sourceUrl).hostname;
    return areFriendlyDomains(sourceOrigin, hostname) || isFriendlyCanonicalOrigin;
  }
  /**
   * Helper method to find out if hostname match the destinationDomain array.
   * @param {Array<string>} domains
   * @param {string} hostname
   * @return {boolean}
   */
  ;

  _proto.destinationDomainsMatch_ = function destinationDomainsMatch_(domains, hostname) {
    for (var i = 0; i < domains.length; i++) {
      var domain = domains[i]; // Exact match.

      if (domain === hostname) {
        return true;
      } // Allow wildcard subdomain matching.


      if (domain.indexOf('*') !== -1 && isWildCardMatch(hostname, domain)) {
        return true;
      }
    }

    return false;
  }
  /**
   * Register callback that will handle form sumbits.
   */
  ;

  _proto.enableFormSupport_ = function enableFormSupport_() {
    var _this3 = this;

    if (this.formSubmitUnlistener_) {
      return;
    }

    this.formSubmitService_.then(function (formService) {
      _this3.formSubmitUnlistener_ = formService.beforeSubmit(_this3.handleFormSubmit_.bind(_this3));
    });
  }
  /**
   * Check to see if any linker configs match this form's url, if so, send
   * along the resolved linker value
   * @param {!../../amp-form/0.1/form-submit-service.FormSubmitEventDef} event
   */
  ;

  _proto.handleFormSubmit_ = function handleFormSubmit_(event) {
    var form = event.form,
        actionXhrMutator = event.actionXhrMutator;

    for (var linkerName in this.config_) {
      var config = this.config_[linkerName];
      var
      /** @type {Array} */
      domains = config['destinationDomains'];
      var url = form.getAttribute('action-xhr') || form.getAttribute('action');

      if (this.isDomainMatch_(url, linkerName, domains)) {
        this.addDataToForm_(form, actionXhrMutator, linkerName);
      }
    }
  }
  /**
   * Add the linker data to form. If action-xhr is present we can update the
   * action-xhr, if not we fallback to adding hidden inputs.
   * @param {!Element} form
   * @param {function(string)} actionXhrMutator
   * @param {string} linkerName
   * @return {*} TODO(#23582): Specify return type
   */
  ;

  _proto.addDataToForm_ = function addDataToForm_(form, actionXhrMutator, linkerName) {
    var ids = this.resolvedIds_[linkerName];

    if (!ids) {
      // Form was clicked before macros resolved.
      return;
    }

    var linkerValue = (0, _linker.createLinker)(
    /* version */
    '1', ids); // Runtime controls submits with `action-xhr`, so we can append the linker
    // param

    var actionXhrUrl = form.getAttribute('action-xhr');

    if (actionXhrUrl) {
      var decoratedUrl = (0, _url.addParamToUrl)(actionXhrUrl, linkerName, linkerValue);
      return actionXhrMutator(decoratedUrl);
    } // If we are not using `action-xhr` it must be a GET request using the
    // standard action attribute. Browsers will not let you change this in the
    // middle of a submit, so we add the input hidden attributes.


    this.addHiddenInputs_(form, linkerName, linkerValue);
  }
  /**
   * Add the linker pairs as <input> elements to form.
   * @param {!Element} form
   * @param {string} linkerName
   * @param {string} linkerValue
   */
  ;

  _proto.addHiddenInputs_ = function addHiddenInputs_(form, linkerName, linkerValue) {
    var attrs = (0, _object.dict)({
      'type': 'hidden',
      'name': linkerName,
      'value': linkerValue
    });
    var inputEl = (0, _dom.createElementWithAttributes)(
    /** @type {!Document} */
    form.ownerDocument, 'input', attrs);
    form.appendChild(inputEl);
  };

  return LinkerManager;
}();
/**
 * Domains are considered to be friends if they are identical
 * after removing these prefixes: m. www. amp.
 * URL scheme & port are not taken into consideration.
 *
 * Note that this algorithm will break corner cases like
 *   www.com vs amp.com vs m.com
 * Or
 *   amp.wordpress.com vs www.wordpress.com
 *
 * @param {string} domain1
 * @param {string} domain2
 * @return {boolean}
 * @visibleForTesting
 */


exports.LinkerManager = LinkerManager;

function areFriendlyDomains(domain1, domain2) {
  return getBaseDomain(domain1) === getBaseDomain(domain2);
}
/**
 * Strips out all prefixing m. www. amp. from a domain name.
 * @param {string} domain
 * @return {string}
 */


function getBaseDomain(domain) {
  return domain.replace(/^(?:www\.|m\.|amp\.)+/, '');
}
/**
 * Escape any regex flags other than `*`
 * @param {string} str
 * @return {*} TODO(#23582): Specify return type
 */


function regexEscape(str) {
  return str.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
}
/**
 * Allows specified wildcard matching of domains.
 * Example:
 *    `*.foo.com` matches `amp.foo.com`
 *    `*.foo.com*` matches `amp.foo.com.uk`
 * @param {string} hostname
 * @param {string} domain
 * @return {boolean}
 * @visibleForTesting
 */


function isWildCardMatch(hostname, domain) {
  var escaped = regexEscape(domain);
  var regex = escaped.replace(/\*/g, '.*');
  return new RegExp('^' + regex + '$').test(hostname);
}

},{"../../../src/cookies":109,"../../../src/dom":111,"../../../src/log":125,"../../../src/service/navigation":138,"../../../src/services":141,"../../../src/types":145,"../../../src/url":148,"../../../src/utils/object":154,"../../../src/window-interface":158,"./linker":16,"./variables":24}],15:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.installLinkerReaderService = installLinkerReaderService;
exports.linkerReaderServiceFor = linkerReaderServiceFor;
exports.LinkerReader = void 0;

var _service = require("../../../src/service");

var _object = require("../../../src/utils/object");

var _linker = require("./linker");

var _url = require("../../../src/url");

var _log = require("../../../src/log");

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
var TAG = 'amp-analytics/linker-reader';

var LinkerReader =
/*#__PURE__*/
function () {
  /**
   * @param {!Window} win
   */
  function LinkerReader(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {!Object<string, ?Object<string, string>>} */

    this.linkerParams_ = {};
  }
  /**
   * Get the LINKER_PARAM(name, id) value from url and clean the value
   * @param {string} name
   * @param {string} id
   * @return {?string}
   */


  var _proto = LinkerReader.prototype;

  _proto.get = function get(name, id) {
    if (!name || !id) {
      (0, _log.user)().error(TAG, 'LINKER_PARAM requires two params, name and id');
      return null;
    }

    if (!(0, _object.hasOwn)(this.linkerParams_, name)) {
      this.linkerParams_[name] = this.parseAndCleanQueryString_(name);
    }

    if (this.linkerParams_[name] && this.linkerParams_[name][id]) {
      return this.linkerParams_[name][id];
    }

    return null;
  }
  /**
   * Parse the url get the key value pair for the linker name
   * and remove the LINKER_PARAM from window location
   * @param {string} name
   * @return {?Object<string, string>}
   */
  ;

  _proto.parseAndCleanQueryString_ = function parseAndCleanQueryString_(name) {
    var parsedUrl = (0, _url.parseUrlDeprecated)(this.win_.location.href);
    var params = (0, _url.parseQueryString)(parsedUrl.search);

    if (!(0, _object.hasOwn)(params, name)) {
      // Linker param not found.
      return null;
    }

    var value = params[name];
    this.removeLinkerParam_(parsedUrl, name);
    return (0, _linker.parseLinker)(value);
  }
  /**
   * Remove the linker param from the current url
   * @param {!Location} url
   * @param {string} name
   */
  ;

  _proto.removeLinkerParam_ = function removeLinkerParam_(url, name) {
    if (!this.win_.history.replaceState) {
      // Can't replace state. Ignore
      return;
    }

    var searchUrl = url.search;
    var removedLinkerParamSearchUrl = (0, _url.removeParamsFromSearch)(searchUrl, name);
    var newHref = url.origin + url.pathname + removedLinkerParamSearchUrl + (url.hash || '');
    this.win_.history.replaceState(null, '', newHref);
  };

  return LinkerReader;
}();
/**
 * @param {!Window} win
 */


exports.LinkerReader = LinkerReader;

function installLinkerReaderService(win) {
  (0, _service.registerServiceBuilder)(win, 'amp-analytics-linker-reader', LinkerReader);
}
/**
 * @param {!Window} win
 * @return {!LinkerReader}
 */


function linkerReaderServiceFor(win) {
  return (0, _service.getService)(win, 'amp-analytics-linker-reader');
}

},{"../../../src/log":125,"../../../src/service":131,"../../../src/url":148,"../../../src/utils/object":154,"./linker":16}],16:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.createLinker = createLinker;
exports.parseLinker = parseLinker;

var _windowInterface = require("../../../src/window-interface");

var _base = require("../../../src/utils/base64");

var _crc = require("./crc32");

var _log = require("../../../src/log");

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
var DELIMITER = '*';
var KEY_VALIDATOR = /^[a-zA-Z0-9\-_.]+$/;
var CHECKSUM_OFFSET_MAX_MIN = 1;
var VALID_VERSION = 1;
var TAG = 'amp-analytics/linker';
/**
 * Creates the linker string, in the format of
 * <version>*<checksum>*<serializedIds>
 *
 * where
 *   checksum: base36(CRC32(<fingerprint>*<minuteSinceEpoch>*<serializedIds>))
 *   serializedIds: <id1>*<idValue1>*<id2>*<idValue2>...
 *                  values are base64 encoded
 *   fingerprint: <userAgent>*<timezoneOffset>*<userLanguage>
 *
 * @param {string} version
 * @param {!Object} ids
 * @return {string}
 */

function createLinker(version, ids) {
  var serializedIds = serialize(ids);

  if (serializedIds === '') {
    return '';
  }

  var checksum = getCheckSum(serializedIds);
  return [version, checksum, serializedIds].join(DELIMITER);
}
/**
 * Return the key value pairs
 * @param {string} value
 * @return {?Object<string, string>}
 */


function parseLinker(value) {
  var linkerObj = parseLinkerParamValue(value);

  if (!linkerObj) {
    return null;
  }

  var checksum = linkerObj.checksum,
      serializedIds = linkerObj.serializedIds;

  if (!isCheckSumValid(serializedIds, checksum)) {
    (0, _log.user)().error(TAG, 'LINKER_PARAM value checksum not valid');
    return null;
  }

  return deserialize(serializedIds);
}
/**
 * Parse the linker param value to version checksum and serializedParams
 * @param {string} value
 * @return {?Object}
 */


function parseLinkerParamValue(value) {
  var parts = value.split(DELIMITER);
  var isEven = parts.length % 2 == 0;

  if (parts.length < 4 || !isEven) {
    // Format <version>*<checksum>*<key1>*<value1>
    // Note: linker makes sure there's at least one pair of non empty key value
    // Make sure there is at least three delimiters.
    (0, _log.user)().error(TAG, "Invalid linker_param value " + value);
    return null;
  }

  var version = Number(parts.shift());

  if (version !== VALID_VERSION) {
    (0, _log.user)().error(TAG, "Invalid version number " + version);
    return null;
  }

  var checksum = parts.shift();
  var serializedIds = parts.join(DELIMITER);
  return {
    checksum: checksum,
    serializedIds: serializedIds
  };
}
/**
 * Check if the checksum is valid with time offset tolerance.
 * @param {string} serializedIds
 * @param {string} checksum
 * @return {boolean}
 */


function isCheckSumValid(serializedIds, checksum) {
  for (var i = 0; i <= CHECKSUM_OFFSET_MAX_MIN; i++) {
    var calculateCheckSum = getCheckSum(serializedIds, i);

    if (calculateCheckSum == checksum) {
      return true;
    }
  }

  return false;
}
/**
 * Create a unique checksum hashing the fingerprint and a few other values.
 * @param {string} serializedIds
 * @param {number=} opt_offsetMin
 * @return {string}
 */


function getCheckSum(serializedIds, opt_offsetMin) {
  var fingerprint = getFingerprint();
  var offset = opt_offsetMin || 0;
  var timestamp = getMinSinceEpoch() - offset;
  var crc = (0, _crc.crc32)([fingerprint, timestamp, serializedIds].join(DELIMITER)); // Encoded to base36 for less bytes.

  return crc.toString(36);
}
/**
 * Generates a semi-unique value for page visitor.
 * @return {string}
 */


function getFingerprint() {
  var date = new Date();
  var timezone = date.getTimezoneOffset();

  var language = _windowInterface.WindowInterface.getUserLanguage(window);

  return [_windowInterface.WindowInterface.getUserAgent(window), timezone, language].join(DELIMITER);
}
/**
 * Encode all values & join them together
 * @param {!Object} pairs
 * @return {string}
 */


function serialize(pairs) {
  if (!pairs) {
    return '';
  }

  return Object.keys(pairs).filter(function (key) {
    var valid = KEY_VALIDATOR.test(key);

    if (!valid) {
      (0, _log.user)().error(TAG, 'Invalid linker key: ' + key);
    }

    return valid;
  }).map(function (key) {
    return key + DELIMITER + encode(pairs[key]);
  }).join(DELIMITER);
}
/**
 * Deserialize the serializedIds and return keyValue pairs.
 * @param {string} serializedIds
 * @return {!Object<string, string>}
 */


function deserialize(serializedIds) {
  var keyValuePairs = {};
  var params = serializedIds.split(DELIMITER);

  for (var i = 0; i < params.length; i += 2) {
    var key = params[i];
    var valid = KEY_VALIDATOR.test(key);

    if (!valid) {
      (0, _log.user)().error(TAG, "Invalid linker key " + key + ", value ignored");
      continue;
    }

    var value = decode(params[i + 1]);
    keyValuePairs[key] = value;
  }

  return keyValuePairs;
}
/**
 * Rounded time used to check if t2 - t1 is within our time tolerance.
 * @return {number}
 */


function getMinSinceEpoch() {
  // Timestamp in minutes, floored.
  return Math.floor(Date.now() / 60000);
}
/**
 * Function that encodesURIComponent but also tilde, since we are using it as
 * our delimiter.
 * @param {string} value
 * @return {*} TODO(#23582): Specify return type
 */


function encode(value) {
  return (0, _base.base64UrlEncodeFromString)(String(value));
}
/**
 * @param {string} value
 * @return {string}
 */


function decode(value) {
  return (0, _base.base64UrlDecodeFromString)(String(value));
}

},{"../../../src/log":125,"../../../src/utils/base64":150,"../../../src/window-interface":158,"./crc32":8}],17:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getMinOpacity = getMinOpacity;

var _style = require("../../../src/style");

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
 *  Returns the min opacity found amongst the element and its ancestors
 *  @param {!Element|null} el
 *  @return {number} minimum opacity value
 */
function getMinOpacity(el) {
  var parentNodeTree = getElementNodeTree(el.parentElement);
  parentNodeTree.push(el);
  var minOpacityFound = 1;
  var opacity;

  for (var i = 0; i < parentNodeTree.length; i++) {
    var node = parentNodeTree[i];
    opacity = getElementOpacity(node);

    if (opacity < minOpacityFound) {
      minOpacityFound = opacity;
    }

    if (minOpacityFound === 0) {
      return minOpacityFound;
    }
  }

  return minOpacityFound;
}
/**
 * Returns the Opacity value of the element.
 * @param {!Element} el
 * @return {number}
 */


function getElementOpacity(el) {
  var win = window;
  var fullyVisibleValue = 1;
  var fullyHiddenValue = 0;

  if (!el) {
    return fullyVisibleValue;
  }

  var _computedStyle = (0, _style.computedStyle)(win, el),
      visibility = _computedStyle.visibility,
      opacity = _computedStyle.opacity;

  if (visibility === 'hidden') {
    return fullyHiddenValue;
  }

  var opacityValue = opacity === '' ? fullyVisibleValue : parseFloat(opacity);

  if (isNaN(opacityValue)) {
    return fullyVisibleValue;
  }

  return opacityValue;
}
/**
 * Returns the node tree of the current element starting from
 * the document root
 * @param {!Element|null} el
 * @return {Array} node list of the element's node tree
 */


function getElementNodeTree(el) {
  var nodeList = [];

  if (!el) {
    return nodeList;
  }

  var CAP = 50;
  var DOCUMENT_NODE_TYPE = 9;
  var ELEMENT_WITH_PARENT_TYPE = 1;
  var parent;
  var element = el;
  nodeList.push(element);

  for (var i = 0; i < CAP; i++) {
    parent = element.parentNode || element.parentElement;

    if (parent && parent.nodeType == ELEMENT_WITH_PARENT_TYPE) {
      element = parent;
      nodeList.push(element);
    } else if (parent && parent.nodeType == DOCUMENT_NODE_TYPE) {
      parent = element.ownerDocument.defaultView.frameElement;

      if (parent && parent.nodeType == ELEMENT_WITH_PARENT_TYPE) {
        element = parent;
        nodeList.push(element);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return nodeList;
}

},{"../../../src/style":144}],18:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.expandPostMessage = expandPostMessage;
exports.RequestHandler = void 0;

var _events = require("./events");

var _transportSerializer = require("./transport-serializer");

var _variables = require("./variables");

var _sandboxVarsWhitelist = require("./sandbox-vars-whitelist");

var _services = require("../../../src/services");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _resourceTiming = require("./resource-timing");

var _types = require("../../../src/types");

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
var BATCH_INTERVAL_MIN = 200;

var RequestHandler =
/*#__PURE__*/
function () {
  /**
   * @param {!Element} element
   * @param {!JsonObject} request
   * @param {!../../../src/preconnect.Preconnect} preconnect
   * @param {./transport.Transport} transport
   * @param {boolean} isSandbox
   */
  function RequestHandler(element, request, preconnect, transport, isSandbox) {
    /** @const {!Element} */
    this.element_ = element;
    /** @const {!../../../src/service/ampdoc-impl.AmpDoc} */

    this.ampdoc_ = element.getAmpDoc();
    /** @const {!Window} */

    this.win = this.ampdoc_.win;
    /** @const {string} !if specified, all requests are prepended with this */

    this.requestOrigin_ = request['origin'];
    /** @const {string} */

    this.baseUrl = (0, _log.devAssert)(request['baseUrl']);
    /** @private {Array<number>|number|undefined} */

    this.batchInterval_ = request['batchInterval']; //unit is sec

    /** @private {?number} */

    this.reportWindow_ = Number(request['reportWindow']) || null; // unit is sec

    /** @private {?number} */

    this.batchIntervalPointer_ = null;
    /** @private {!./variables.VariableService} */

    this.variableService_ = (0, _variables.variableServiceForDoc)(element);
    /** @private {!../../../src/service/url-replacements-impl.UrlReplacements} */

    this.urlReplacementService_ = _services.Services.urlReplacementsForDoc(element);
    /** @private {!../../../src/service/url-impl.Url} */

    this.urlService_ = _services.Services.urlForDoc(element);
    /** @private {?Promise<string>} */

    this.baseUrlPromise_ = null;
    /** @private {?Promise<string>} */

    this.baseUrlTemplatePromise_ = null;
    /** @private {?Promise<string>} */

    this.requestOriginPromise_ = null;
    /** @private {!Array<!Promise<!BatchSegmentDef>>} */

    this.batchSegmentPromises_ = [];
    /** @private {!../../../src/preconnect.Preconnect} */

    this.preconnect_ = preconnect;
    /** @private {./transport.Transport} */

    this.transport_ = transport;
    /** @const @private {!Object|undefined} */

    this.whiteList_ = isSandbox ? _sandboxVarsWhitelist.SANDBOX_AVAILABLE_VARS : undefined;
    /** @private {?number} */

    this.batchIntervalTimeoutId_ = null;
    /** @private {?number} */

    this.reportWindowTimeoutId_ = null;
    /** @private {boolean} */

    this.reportRequest_ = true;
    /** @private {?JsonObject} */

    this.lastTrigger_ = null;
    /** @private {number} */

    this.queueSize_ = 0;
    /** @private @const {number} */

    this.startTime_ = Date.now();
    this.initReportWindow_();
    this.initBatchInterval_();
  }
  /**
   * Exposed method to send a request on event.
   * Real ping may be batched and send out later.
   * @param {?JsonObject} configParams
   * @param {!JsonObject} trigger
   * @param {!./variables.ExpansionOptions} expansionOption
   */


  var _proto = RequestHandler.prototype;

  _proto.send = function send(configParams, trigger, expansionOption) {
    var _this = this;

    var isImportant = trigger['important'] === true;

    if (!this.reportRequest_ && !isImportant) {
      // Ignore non important trigger out reportWindow
      return;
    }

    this.queueSize_++;
    this.lastTrigger_ = trigger;
    var bindings = this.variableService_.getMacros(this.element_);
    bindings['RESOURCE_TIMING'] = (0, _resourceTiming.getResourceTiming)(this.ampdoc_, trigger['resourceTimingSpec'], this.startTime_);

    if (!this.baseUrlPromise_) {
      expansionOption.freezeVar('extraUrlParams');
      this.baseUrlTemplatePromise_ = this.variableService_.expandTemplate(this.baseUrl, expansionOption);
      this.baseUrlPromise_ = this.baseUrlTemplatePromise_.then(function (baseUrl) {
        return _this.urlReplacementService_.expandUrlAsync(baseUrl, bindings, _this.whiteList_);
      });
    } // expand requestOrigin if it is declared


    if (!this.requestOriginPromise_ && this.requestOrigin_) {
      // do not encode vars in request origin
      var requestOriginExpansionOpt = new _variables.ExpansionOptions(expansionOption.vars, expansionOption.iterations, true // opt_noEncode
      );
      this.requestOriginPromise_ = this.variableService_ // expand variables in request origin
      .expandTemplate(this.requestOrigin_, requestOriginExpansionOpt) // substitute in URL values e.g. DOCUMENT_REFERRER -> https://example.com
      .then(function (expandedRequestOrigin) {
        return _this.urlReplacementService_.expandUrlAsync(expandedRequestOrigin, bindings, _this.whiteList_, true // opt_noEncode
        );
      });
    }

    var params = Object.assign({}, configParams, trigger['extraUrlParams']);
    var timestamp = this.win.Date.now();
    var batchSegmentPromise = expandExtraUrlParams(this.variableService_, this.urlReplacementService_, params, expansionOption, bindings, this.whiteList_).then(function (params) {
      return (0, _object.dict)({
        'trigger': trigger['on'],
        'timestamp': timestamp,
        'extraUrlParams': params
      });
    });
    this.batchSegmentPromises_.push(batchSegmentPromise);
    this.trigger_(isImportant || !this.batchInterval_);
  }
  /**
   * Dispose function that clear request handler state.
   */
  ;

  _proto.dispose = function dispose() {
    this.reset_(); // Clear batchInterval timeout

    if (this.batchIntervalTimeoutId_) {
      this.win.clearTimeout(this.batchIntervalTimeoutId_);
      this.batchIntervalTimeoutId_ = null;
    }

    if (this.reportWindowTimeoutId_) {
      this.win.clearTimeout(this.reportWindowTimeoutId_);
      this.reportWindowTimeoutId_ = null;
    }
  }
  /**
   * Function that schedule the actual request send.
   * @param {boolean} isImmediate
   * @private
   */
  ;

  _proto.trigger_ = function trigger_(isImmediate) {
    if (this.queueSize_ == 0) {
      // Do nothing if no request in queue
      return;
    }

    if (isImmediate) {
      // If not batched, or batchInterval scheduler schedule trigger immediately
      this.fire_();
    }
  }
  /**
   * Send out request. Should only be called by `trigger_` function
   * @private
   */
  ;

  _proto.fire_ = function fire_() {
    var _this2 = this;

    var requestOriginPromise = this.requestOriginPromise_,
        baseUrlTemplatePromise = this.baseUrlTemplatePromise_,
        baseUrlPromise = this.baseUrlPromise_,
        segmentPromises = this.batchSegmentPromises_;
    var trigger =
    /** @type {!JsonObject} */
    this.lastTrigger_;
    this.reset_(); // preconnect to requestOrigin if available, otherwise baseUrlTemplate

    var preconnectPromise = requestOriginPromise ? requestOriginPromise : baseUrlTemplatePromise;
    preconnectPromise.then(function (preUrl) {
      _this2.preconnect_.url(preUrl, true);
    });
    Promise.all([baseUrlPromise, Promise.all(segmentPromises), requestOriginPromise]).then(function (results) {
      var requestUrl = _this2.composeRequestUrl_(results[0], results[2]);

      var batchSegments = results[1];

      if (batchSegments.length === 0) {
        return;
      } // TODO: iframePing will not work with batch. Add a config validation.


      if (trigger['iframePing']) {
        (0, _log.userAssert)(trigger['on'] == _events.AnalyticsEventType.VISIBLE, 'iframePing is only available on page view requests.');

        _this2.transport_.sendRequestUsingIframe(requestUrl, batchSegments[0]);
      } else {
        _this2.transport_.sendRequest(requestUrl, batchSegments, !!_this2.batchInterval_);
      }
    });
  }
  /**
   * Reset batching status
   * @private
   */
  ;

  _proto.reset_ = function reset_() {
    this.queueSize_ = 0;
    this.baseUrlPromise_ = null;
    this.baseUrlTemplatePromise_ = null;
    this.batchSegmentPromises_ = [];
    this.lastTrigger_ = null;
  }
  /**
   * Handle batchInterval
   */
  ;

  _proto.initBatchInterval_ = function initBatchInterval_() {
    if (!this.batchInterval_) {
      return;
    }

    this.batchInterval_ = (0, _types.isArray)(this.batchInterval_) ? this.batchInterval_ : [this.batchInterval_];

    for (var i = 0; i < this.batchInterval_.length; i++) {
      var interval = this.batchInterval_[i];
      (0, _log.userAssert)((0, _types.isFiniteNumber)(interval), 'Invalid batchInterval value: %s', this.batchInterval_);
      interval = Number(interval) * 1000;
      (0, _log.userAssert)(interval >= BATCH_INTERVAL_MIN, 'Invalid batchInterval value: %s, ' + 'interval value must be greater than %s ms.', this.batchInterval_, BATCH_INTERVAL_MIN);
      this.batchInterval_[i] = interval;
    }

    this.batchIntervalPointer_ = 0;
    this.refreshBatchInterval_();
  }
  /**
   * Initializes report window.
   */
  ;

  _proto.initReportWindow_ = function initReportWindow_() {
    var _this3 = this;

    if (this.reportWindow_) {
      this.reportWindowTimeoutId_ = this.win.setTimeout(function () {
        // Flush batch queue;
        _this3.trigger_(true);

        _this3.reportRequest_ = false; // Clear batchInterval timeout

        if (_this3.batchIntervalTimeoutId_) {
          _this3.win.clearTimeout(_this3.batchIntervalTimeoutId_);

          _this3.batchIntervalTimeoutId_ = null;
        }
      }, this.reportWindow_ * 1000);
    }
  }
  /**
   * Schedule sending request regarding to batchInterval
   */
  ;

  _proto.refreshBatchInterval_ = function refreshBatchInterval_() {
    var _this4 = this;

    (0, _log.devAssert)(this.batchIntervalPointer_ != null, 'Should not start batchInterval without pointer');
    var interval = this.batchIntervalPointer_ < this.batchInterval_.length ? this.batchInterval_[this.batchIntervalPointer_++] : this.batchInterval_[this.batchInterval_.length - 1];
    this.batchIntervalTimeoutId_ = this.win.setTimeout(function () {
      _this4.trigger_(true);

      _this4.refreshBatchInterval_();
    }, interval);
  }
  /**
   * Composes a request URL given a base and requestOrigin
   * @private
   * @param {string} baseUrl
   * @param {string=} opt_requestOrigin
   * @return {string}
   */
  ;

  _proto.composeRequestUrl_ = function composeRequestUrl_(baseUrl, opt_requestOrigin) {
    if (opt_requestOrigin) {
      // We expect requestOrigin to always contain the URL origin. In the case
      // where requestOrigin has a relative URL, the current page's origin will
      // be used. We will simply respect the requestOrigin and baseUrl, we don't
      // check if they form a valid URL and request will fail silently
      var requestOriginInfo = this.urlService_.parse(opt_requestOrigin);
      return requestOriginInfo.origin + baseUrl;
    }

    return baseUrl;
  };

  return RequestHandler;
}();
/**
 * Expand the postMessage string
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} msg
 * @param {?JsonObject} configParams
 * @param {!JsonObject} trigger
 * @param {!./variables.ExpansionOptions} expansionOption
 * @param {!Element} element
 * @return {Promise<string>}
 */


exports.RequestHandler = RequestHandler;

function expandPostMessage(ampdoc, msg, configParams, trigger, expansionOption, element) {
  var variableService = (0, _variables.variableServiceForDoc)(ampdoc);

  var urlReplacementService = _services.Services.urlReplacementsForDoc(element);

  var bindings = variableService.getMacros(element);
  expansionOption.freezeVar('extraUrlParams');
  var basePromise = variableService.expandTemplate(msg, expansionOption).then(function (base) {
    return urlReplacementService.expandStringAsync(base, bindings);
  });

  if (msg.indexOf('${extraUrlParams}') < 0) {
    // No need to append extraUrlParams
    return basePromise;
  }

  return basePromise.then(function (expandedMsg) {
    var params = Object.assign({}, configParams, trigger['extraUrlParams']); //return base url with the appended extra url params;

    return expandExtraUrlParams(variableService, urlReplacementService, params, expansionOption, bindings).then(function (extraUrlParams) {
      return (0, _transportSerializer.defaultSerializer)(expandedMsg, [(0, _object.dict)({
        'extraUrlParams': extraUrlParams
      })]);
    });
  });
}
/**
 * Function that handler extraUrlParams from config and trigger.
 * @param {!./variables.VariableService} variableService
 * @param {!../../../src/service/url-replacements-impl.UrlReplacements} urlReplacements
 * @param {!Object} params
 * @param {!./variables.ExpansionOptions} expansionOption
 * @param {!Object} bindings
 * @param {!Object=} opt_whitelist
 * @return {!Promise<!Object>}
 * @private
 */


function expandExtraUrlParams(variableService, urlReplacements, params, expansionOption, bindings, opt_whitelist) {
  var requestPromises = []; // Don't encode param values here,
  // as we'll do it later in the getExtraUrlParamsString call.

  var option = new _variables.ExpansionOptions(expansionOption.vars, expansionOption.iterations, true
  /* noEncode */
  );

  var expandObject = function expandObject(params, key) {
    var value = params[key];

    if (typeof value === 'string') {
      var request = variableService.expandTemplate(value, option).then(function (value) {
        return urlReplacements.expandStringAsync(value, bindings, opt_whitelist);
      }).then(function (value) {
        return params[key] = value;
      });
      requestPromises.push(request);
    } else if ((0, _types.isArray)(value)) {
      value.forEach(function (_, index) {
        return expandObject(value, index);
      });
    } else if ((0, _types.isObject)(value) && value !== null) {
      Object.keys(value).forEach(function (key) {
        return expandObject(value, key);
      });
    }
  };

  Object.keys(params).forEach(function (key) {
    return expandObject(params, key);
  });
  return Promise.all(requestPromises).then(function () {
    return params;
  });
}

},{"../../../src/log":125,"../../../src/services":141,"../../../src/types":145,"../../../src/utils/object":154,"./events":9,"./resource-timing":19,"./sandbox-vars-whitelist":20,"./transport-serializer":22,"./variables":24}],19:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getResourceTiming = getResourceTiming;

var _variables = require("./variables");

var _array = require("../../../src/utils/array");

var _types = require("../../../src/types");

var _url = require("../../../src/url");

var _log = require("../../../src/log");

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
 * A user-supplied JSON object that defines a resource to be reported. It is
 * expected to have some fields.
 * A resource timing enty will match against this resource if all of the
 * following properties match.
 * @property {string=} host A string whose value should be a RegExp. It defines
 *     a host or set of hosts to match against. By default, the RegExp will
 *     match all hosts if omitted.
 * @property {string=} path A string whose value should be a RegExp. It defines
 *     a path or set of paths to match against. By default, the RegExp will
 *     match all paths if omitted.
 * @property {string=} query A string whose value should be a RegExp. It defines
 *     a query string or set of query strings to match against. By default, the
 *     RegExp will match all query strings if omitted.
 * @typedef {!JsonObject}
 */
var IndividualResourceSpecDef;
/**
 * A parsed resource spec for a specific host or sets of hosts (as defined by
 * the hostPattern).
 * @typedef {{
 *   hostPattern: !RegExp,
 *   resources: !Array<{
 *     name: string,
 *     pathPattern: !RegExp,
 *     queryPattern: !RegExp,
 *   }>,
 * }}
 */

var ResourceSpecForHostDef;
/**
 * The default maximum buffer size for resource timing entries. After the limit
 * has been reached, the browser will stop recording resource timing entries.
 * This number is chosen by the spec: https://w3c.github.io/resource-timing.
 * @const {number}
 */

var RESOURCE_TIMING_BUFFER_SIZE = 150;
/**
 * Yields the thread before running the function to avoid causing jank. (i.e. a
 * task that takes over 16ms.)
 * @param {function(): OUT} fn
 * @return {!Promise<OUT>}
 * @template OUT
 */

function yieldThread(fn) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      return resolve(fn());
    });
  });
}
/**
 * Checks whether the given object is a valid resource timing spec.
 * @param {!JsonObject} spec
 * @return {boolean}
 */


function validateResourceTimingSpec(spec) {
  if (!(0, _types.isObject)(spec['resources'])) {
    (0, _log.user)().warn('ANALYTICS', 'resourceTimingSpec missing "resources" field');
    return false;
  }

  if (!spec['encoding'] || !spec['encoding']['entry'] || !spec['encoding']['delim']) {
    (0, _log.user)().warn('ANALYTICS', 'resourceTimingSpec is missing or has incomplete encoding options');
    return false;
  }

  if (spec['encoding']['base'] < 2 || spec['encoding']['base'] > 36) {
    (0, _log.user)().warn('ANALYTICS', 'resource timing variables only supports bases between 2 and 36');
    return false;
  }

  if (spec['responseAfter'] != null && typeof spec['responseAfter'] != 'number') {
    (0, _log.user)().warn('ANALYTICS', 'resourceTimingSpec["responseAfter"] must be a number');
    return false;
  }

  return true;
}
/**
 * Gets all resource timing entries from the given window.
 * @param {!Window} win
 * @return {!Array<!PerformanceResourceTiming>}
 */


function getResourceTimingEntries(win) {
  return (
    /** @type {!Array<!PerformanceResourceTiming>} */
    win.performance.getEntriesByType('resource')
  );
}
/**
 * Converts a resource timing entry to the variables for this resource.
 * @param {!PerformanceResourceTiming} entry
 * @param {string} name Name of the resource set by the resourceTimingSpec.
 * @param {function(number, number=): string} format A function to format
 *    timestamps and intervals. (Two numbers will be passed in for intervals.)
 * @return {!ExpansionOptions}
 */


function entryToExpansionOptions(entry, name, format) {
  var vars = {
    // ${key} is the name of the resource from the resourceTimingSpec. i.e. it's
    // the key of the object that specifies the host and path patterns that this
    // resource matched against.
    'key': name,
    'startTime': format(entry.startTime),
    'redirectTime': format(entry.redirectEnd, entry.redirectStart),
    'domainLookupTime': format(entry.domainLookupEnd, entry.domainLookupStart),
    'tcpConnectTime': format(entry.connectEnd, entry.connectStart),
    'serverResponseTime': format(entry.responseStart, entry.requestStart),
    'networkTransferTime': format(entry.responseEnd, entry.responseStart),
    'transferSize': format(entry.transferSize || 0),
    'encodedBodySize': format(entry.encodedBodySize || 0),
    'decodedBodySize': format(entry.decodedBodySize || 0),
    'duration': format(entry.duration),
    'initiatorType': entry.initiatorType
  };
  return new _variables.ExpansionOptions(vars, 1
  /* opt_iterations */
  );
}
/**
 * Returns the variables for the given resource timing entry if it matches one
 * of the defined resources, or null otherwise.
 * @param {!PerformanceResourceTiming} entry
 * @param {!Array<!ResourceSpecForHostDef>} resourcesByHost An array of resource
 *     specs to match against.
 * @return {?string} The name of the entry, or null if no matching name exists.
 */


function nameForEntry(entry, resourcesByHost) {
  var url = (0, _url.parseUrlDeprecated)(entry.name);

  for (var i = 0; i < resourcesByHost.length; ++i) {
    var _resourcesByHost$i = resourcesByHost[i],
        hostPattern = _resourcesByHost$i.hostPattern,
        resources = _resourcesByHost$i.resources;

    if (!hostPattern.test(url.host)) {
      continue;
    }

    var index = (0, _array.findIndex)(resources, function (res) {
      return res.pathPattern.test(url.pathname) && res.queryPattern.test(url.search);
    });

    if (index != -1) {
      return resources[index].name;
    }
  }

  return null; // No match.
}
/**
 * Groups all resource specs (which are defined in terms of {host, path, query}
 * patterns) by host pattern. This is used downstream to avoid running RegExps
 * for host patterns multiple times because we expect multiple resources to
 * use the same host pattern.
 * @param {!Object<string, !IndividualResourceSpecDef>} resourceDefs A map of
 *     names to the resource spec for that name.
 * @return {!Array<!ResourceSpecForHostDef>}
 */


function groupSpecsByHost(resourceDefs) {
  var byHost = {};

  for (var name in resourceDefs) {
    var host = resourceDefs[name]['host'] || '';
    var path = resourceDefs[name]['path'] || '';
    var query = resourceDefs[name]['query'] || '';
    var pattern = {
      name: name,
      pathPattern: new RegExp(path),
      queryPattern: new RegExp(query)
    };

    if (byHost[host]) {
      byHost[host].resources.push(pattern);
    } else {
      byHost[host] = {
        hostPattern: new RegExp(host),
        resources: [pattern]
      };
    }
  }

  var byHostArray = [];

  for (var _host in byHost) {
    byHostArray.push(byHost[_host]);
  }

  return byHostArray;
}
/**
 * Filters out resource timing entries that don't have a name defined in
 * resourceDefs. It returns a new array where each element contains a
 * resource timing entry and the corresponding name.
 * @param {!Array<!PerformanceResourceTiming>} entries
 * @param {!Object<string, !IndividualResourceSpecDef>} resourceDefs
 * @return {!Array<{entry: !PerformanceResourceTiming, name: string}>}
 */


function filterEntries(entries, resourceDefs) {
  // Group resource timing definitions by host since we expect multiple
  // definitions to have the same host.
  var byHost = groupSpecsByHost(resourceDefs);
  var results = [];
  entries.forEach(function (entry) {
    var name = nameForEntry(entry, byHost);

    if (name) {
      results.push({
        entry: entry,
        name: name
      });
    }
  });
  return results;
}
/**
 * Serializes resource timing entries that match the resourceTimingSpec into a
 * single string.
 * @param {!Array<!PerformanceResourceTiming>} entries
 * @param {!JsonObject} resourceTimingSpec
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<string>}
 */


function serialize(entries, resourceTimingSpec, ampdoc) {
  var resources = resourceTimingSpec['resources'];
  var encoding = resourceTimingSpec['encoding'];
  var variableService = (0, _variables.variableServiceForDoc)(ampdoc);

  var format = function format(val, relativeTo) {
    if (relativeTo === void 0) {
      relativeTo = 0;
    }

    return Math.round(val - relativeTo).toString(encoding['base'] || 10);
  };

  var promises = filterEntries(entries, resources).map(function (_ref) {
    var entry = _ref.entry,
        name = _ref.name;
    return entryToExpansionOptions(entry, name, format);
  }).map(function (expansion) {
    return variableService.expandTemplate(encoding['entry'], expansion);
  });
  return Promise.all(promises).then(function (vars) {
    return vars.join(encoding['delim']);
  });
}
/**
 * Serializes resource timing entries according to the resource timing spec.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject} resourceTimingSpec
 * @return {!Promise<string>}
 */


function serializeResourceTiming(ampdoc, resourceTimingSpec) {
  var win = ampdoc.win; // Check that the performance timing API exists before and that the spec is
  // valid before proceeding. If not, we simply return an empty string.

  if (resourceTimingSpec['done'] || !win.performance || !win.performance.now || !win.performance.getEntriesByType || !validateResourceTimingSpec(resourceTimingSpec)) {
    resourceTimingSpec['done'] = true;
    return Promise.resolve('');
  }

  var entries = getResourceTimingEntries(win);

  if (entries.length >= RESOURCE_TIMING_BUFFER_SIZE) {
    // We've exceeded the maximum buffer size so no additional metrics will be
    // reported for this resourceTimingSpec.
    resourceTimingSpec['done'] = true;
  }

  var responseAfter = resourceTimingSpec['responseAfter'] || 0; // Update responseAfter for next time to avoid reporting the same resource
  // multiple times.

  resourceTimingSpec['responseAfter'] = Math.max(responseAfter, win.performance.now()); // Filter resources that are too early.

  entries = entries.filter(function (e) {
    return e.startTime + e.duration >= responseAfter;
  });

  if (!entries.length) {
    return Promise.resolve('');
  } // Yield the thread in case iterating over all resources takes a long time.


  return yieldThread(function () {
    return serialize(entries, resourceTimingSpec, ampdoc);
  });
}
/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!JsonObject|undefined} spec resource timing spec.
 * @param {number} startTime start timestamp.
 * @return {!Promise<string>}
 */


function getResourceTiming(ampdoc, spec, startTime) {
  // Only allow collecting timing within 1s
  if (spec && Date.now() < startTime + 60 * 1000) {
    return serializeResourceTiming(ampdoc, spec);
  } else {
    return Promise.resolve('');
  }
}

},{"../../../src/log":125,"../../../src/types":145,"../../../src/url":148,"../../../src/utils/array":149,"./variables":24}],20:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.SANDBOX_AVAILABLE_VARS = void 0;

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
 * Used for inserted scoped analytics element.
 * @const {!Object<string, boolean>}
 */
var SANDBOX_AVAILABLE_VARS = {
  'RANDOM': true,
  'CANONICAL_URL': true,
  'CANONICAL_HOST': true,
  'CANONICAL_HOSTNAME': true,
  'CANONICAL_PATH': true,
  'AMPDOC_URL': true,
  'AMPDOC_HOST': true,
  'AMPDOC_HOSTNAME': true,
  'SOURCE_URL': true,
  'SOURCE_HOST': true,
  'SOURCE_HOSTNAME': true,
  'SOURCE_PATH': true,
  'TIMESTAMP': true,
  'TIMEZONE': true,
  'TIMEZONE_CODE': true,
  'VIEWPORT_HEIGHT': true,
  'VIEWPORT_WIDTH': true,
  'SCREEN_WIDTH': true,
  'SCREEN_HEIGHT': true,
  'AVAILABLE_SCREEN_HEIGHT': true,
  'AVAILABLE_SCREEN_WIDTH': true,
  'SCREEN_COLOR_DEPTH': true,
  'DOCUMENT_CHARSET': true,
  'BROWSER_LANGUAGE': true,
  'AMP_VERSION': true,
  'BACKGROUND_STATE': true,
  'USER_AGENT': true,
  'FIRST_CONTENTFUL_PAINT': true,
  'FIRST_VIEWPORT_READY': true,
  'MAKE_BODY_VISIBLE': true
};
exports.SANDBOX_AVAILABLE_VARS = SANDBOX_AVAILABLE_VARS;

},{}],21:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ScrollManager = exports.ScrollEventDef = void 0;

var _observable = require("../../../src/observable");

var _services = require("../../../src/services");

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
 *   top: number,
 *   left: number,
 *   width: number,
 *   height: number,
 *   scrollHeight: number,
 *   scrollWidth: number,
 * }}
 */
var ScrollEventDef;
/**
 * A manager for handling multiple Scroll Event Trackers.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all scroll triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 */

exports.ScrollEventDef = ScrollEventDef;

var ScrollManager =
/*#__PURE__*/
function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function ScrollManager(ampdoc) {
    /** @const @private {!../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = _services.Services.viewportForDoc(ampdoc);
    /** @private {!UnlistenDef|null} */

    this.viewportOnChangedUnlistener_ = null;
    /** @private {!Observable<!./scroll-manager.ScrollEventDef>} */

    this.scrollObservable_ = new _observable.Observable();
  }
  /**
   * Function to dispose of all handlers on the scroll observable
   */


  var _proto = ScrollManager.prototype;

  _proto.dispose = function dispose() {
    this.scrollObservable_.removeAll();
    this.removeViewportOnChangedListener_();
  }
  /**
   * @param {function(!Object)} handler
   */
  ;

  _proto.removeScrollHandler = function removeScrollHandler(handler) {
    this.scrollObservable_.remove(handler);

    if (this.scrollObservable_.getHandlerCount() <= 0) {
      this.removeViewportOnChangedListener_();
    }
  }
  /**
   * @param {function(!Object)} handler
   * @return {!UnlistenDef}
   */
  ;

  _proto.addScrollHandler = function addScrollHandler(handler) {
    // Trigger an event to fire events that might have already happened.
    var size = this.viewport_.getSize();
    /** {./scroll-manager.ScrollEventDef} */

    var scrollEvent = {
      top: this.viewport_.getScrollTop(),
      left: this.viewport_.getScrollLeft(),
      width: size.width,
      height: size.height,
      scrollWidth: this.viewport_.getScrollWidth(),
      scrollHeight: this.viewport_.getScrollHeight()
    };
    handler(scrollEvent);

    if (this.scrollObservable_.getHandlerCount() === 0) {
      this.addViewportOnChangedListener_();
    }

    return this.scrollObservable_.add(handler);
  }
  /**
   * @param {!../../../src/service/viewport/viewport-interface.ViewportChangedEventDef} e
   * @private
   */
  ;

  _proto.onScroll_ = function onScroll_(e) {
    /** {./scroll-manager.ScrollEventDef} */
    var scrollEvent = {
      top: e.top,
      left: e.left,
      width: e.width,
      height: e.height,
      scrollWidth: this.viewport_.getScrollWidth(),
      scrollHeight: this.viewport_.getScrollHeight()
    }; // Fire all of our children scroll observables

    this.scrollObservable_.fire(scrollEvent);
  }
  /**
   * Function to remove the viewport onChanged listener
   * @private
   */
  ;

  _proto.removeViewportOnChangedListener_ = function removeViewportOnChangedListener_() {
    if (this.viewportOnChangedUnlistener_) {
      this.viewportOnChangedUnlistener_();
      this.viewportOnChangedUnlistener_ = null;
    }
  }
  /**
   * Function to add the viewport onChanged listener
   * @private
   */
  ;

  _proto.addViewportOnChangedListener_ = function addViewportOnChangedListener_() {
    this.viewportOnChangedUnlistener_ = this.viewport_.onChanged(this.onScroll_.bind(this));
  };

  return ScrollManager;
}();

exports.ScrollManager = ScrollManager;

},{"../../../src/observable":128,"../../../src/services":141}],22:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.defaultSerializer = defaultSerializer;
exports.TransportSerializers = exports.TransportSerializerDef = exports.RequestDef = exports.BatchSegmentDef = void 0;

var _url = require("../../../src/url");

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
var EXTRA_URL_PARAM_VAR = '${extraUrlParams}';
/**
 * @typedef {{
 *   trigger: (string|undefined),
 *   timestamp: (number|undefined),
 *   extraUrlParams: (!JsonObject|undefined)
 * }}
 */

var BatchSegmentDef;
/**
 * @typedef {{
 *   url: string,
 *   payload: (string|undefined),
 * }}
 */

exports.BatchSegmentDef = BatchSegmentDef;
var RequestDef;
/**
 * The interface for all TransportSerializer to implement.
 * @interface
 */

exports.RequestDef = RequestDef;

var TransportSerializerDef =
/*#__PURE__*/
function () {
  function TransportSerializerDef() {}

  var _proto = TransportSerializerDef.prototype;

  /**
   * @param {string} unusedBaseUrl
   * @param {!BatchSegmentDef} unusedSegment
   * @param {boolean} unusedWithPayload
   * @return {!RequestDef}
   */
  _proto.generateRequest = function generateRequest(unusedBaseUrl, unusedSegment, unusedWithPayload) {}
  /**
   * @param {string} unusedBaseUrl
   * @param {!Array<!BatchSegmentDef>} unusedSegments
   * @param {boolean} unusedWithPayload
   * @return {!RequestDef}
   */
  ;

  _proto.generateBatchRequest = function generateBatchRequest(unusedBaseUrl, unusedSegments, unusedWithPayload) {};

  return TransportSerializerDef;
}();
/**
 * The default serializer.
 *
 * @implements {TransportSerializerDef}
 */


exports.TransportSerializerDef = TransportSerializerDef;

var DefaultTransportSerializer =
/*#__PURE__*/
function () {
  function DefaultTransportSerializer() {}

  var _proto2 = DefaultTransportSerializer.prototype;

  /** @override */
  _proto2.generateRequest = function generateRequest(baseUrl, segment, withPayload) {
    if (withPayload === void 0) {
      withPayload = false;
    }

    if (withPayload) {
      return {
        url: baseUrl.replace(EXTRA_URL_PARAM_VAR, ''),
        payload: JSON.stringify(segment['extraUrlParams'])
      };
    }

    return {
      url: defaultSerializer(baseUrl, [segment])
    };
  }
  /** @override */
  ;

  _proto2.generateBatchRequest = function generateBatchRequest(baseUrl, segments, withPayload) {
    if (withPayload === void 0) {
      withPayload = false;
    }

    if (withPayload) {
      return {
        url: baseUrl.replace(EXTRA_URL_PARAM_VAR, ''),
        payload: JSON.stringify(segments.map(function (segment) {
          return segment['extraUrlParams'];
        }))
      };
    }

    return {
      url: defaultSerializer(baseUrl, segments)
    };
  };

  return DefaultTransportSerializer;
}();
/**
 * Please register your serializer below.
 * Please keep the object in alphabetic order.
 *
 * @const {Object<string, TransportSerializerDef>}
 */


var TransportSerializers = {
  'default': new DefaultTransportSerializer()
};
/**
 * The default way for merging batch segments
 *
 * @param {string} baseUrl
 * @param {!Array<!BatchSegmentDef>} batchSegments
 * @return {string}
 */

exports.TransportSerializers = TransportSerializers;

function defaultSerializer(baseUrl, batchSegments) {
  var extraUrlParamsStr = batchSegments.map(function (item) {
    return (0, _url.serializeQueryString)(item['extraUrlParams']);
  }).filter(function (queryString) {
    return !!queryString;
  }).join('&');
  var requestUrl;

  if (baseUrl.indexOf(EXTRA_URL_PARAM_VAR) >= 0) {
    requestUrl = baseUrl.replace(EXTRA_URL_PARAM_VAR, extraUrlParamsStr);
  } else {
    requestUrl = (0, _url.appendEncodedParamStringToUrl)(baseUrl, extraUrlParamsStr);
  }

  return requestUrl;
}

},{"../../../src/url":148}],23:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.Transport = void 0;

var _transportSerializer = require("./transport-serializer");

var _iframeTransport = require("./iframe-transport");

var _services = require("../../../src/services");

var _windowInterface = require("../../../src/window-interface");

var _url = require("../../../src/url");

var _pixel = require("../../../src/pixel");

var _log = require("../../../src/log");

var _adHelper = require("../../../src/ad-helper");

var _mode = require("../../../src/mode");

var _service = require("../../../src/service");

var _eventHelper = require("../../../src/event-helper");

var _dom = require("../../../src/dom");

var _style = require("../../../src/style");

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
var TAG_ = 'amp-analytics/transport';
/**
 * Transport defines the ways how the analytics pings are going to be sent.
 */

var Transport =
/*#__PURE__*/
function () {
  /**
   * @param {!Window} win
   * @param {!JsonObject} options
   */
  function Transport(win, options) {
    if (options === void 0) {
      options =
      /** @type {!JsonObject} */
      {};
    }

    /** @private {!Window} */
    this.win_ = win;
    /** @private {!JsonObject} */

    this.options_ = options;
    /** @private {string|undefined} */

    this.referrerPolicy_ =
    /** @type {string|undefined} */
    this.options_['referrerPolicy']; // no-referrer is only supported in image transport

    if (this.referrerPolicy_ === 'no-referrer') {
      this.options_['beacon'] = false;
      this.options_['xhrpost'] = false;
    }
    /** @private {boolean} */


    this.useBody_ = !!this.options_['useBody'];
    /** @private {?IframeTransport} */

    this.iframeTransport_ = null;
    /** @private {boolean} */

    this.isInabox_ = (0, _mode.getMode)(win).runtime == 'inabox';
  }
  /**
   * @param {string} url
   * @param {!Array<!BatchSegmentDef>} segments
   * @param {boolean} inBatch
   */


  var _proto = Transport.prototype;

  _proto.sendRequest = function sendRequest(url, segments, inBatch) {
    if (!url || segments.length === 0) {
      (0, _log.dev)().info(TAG_, 'Empty request not sent: ', url);
      return;
    }

    var serializer = this.getSerializer_();
    /**
     * @param {boolean} withPayload
     * @return {!RequestDef}
     */

    function generateRequest(withPayload) {
      var request = inBatch ? serializer.generateBatchRequest(url, segments, withPayload) : serializer.generateRequest(url, segments[0], withPayload);
      (0, _url.assertHttpsUrl)(request.url, 'amp-analytics request');
      (0, _url.checkCorsUrl)(request.url);
      return request;
    }

    var getRequest = cacheFuncResult(generateRequest);

    if (this.options_['iframe']) {
      if (!this.iframeTransport_) {
        (0, _log.dev)().error(TAG_, 'iframe transport was inadvertently deleted');
        return;
      }

      this.iframeTransport_.sendRequest(getRequest(false).url);
      return;
    }

    if (this.options_['beacon'] && Transport.sendRequestUsingBeacon(this.win_, getRequest(this.useBody_))) {
      return;
    }

    if (this.options_['xhrpost'] && Transport.sendRequestUsingXhr(this.win_, getRequest(this.useBody_))) {
      return;
    }

    var image = this.options_['image'];

    if (image) {
      var suppressWarnings = typeof image == 'object' && image['suppressWarnings'];
      Transport.sendRequestUsingImage(this.win_, getRequest(false), suppressWarnings,
      /** @type {string|undefined} */
      this.referrerPolicy_);
      return;
    }

    (0, _log.user)().warn(TAG_, 'Failed to send request', url, this.options_);
  }
  /**
   * amp-analytics will create an iframe for vendors in
   * extensions/amp-analytics/0.1/vendors.js who have transport/iframe defined.
   * This is limited to MRC-accreddited vendors. The frame is removed if the
   * user navigates/swipes away from the page, and is recreated if the user
   * navigates back to the page.
   *
   * @param {!Window} win
   * @param {!Element} element
   * @param {(!../../../src/preconnect.Preconnect)=} opt_preconnect
   */
  ;

  _proto.maybeInitIframeTransport = function maybeInitIframeTransport(win, element, opt_preconnect) {
    if (!this.options_['iframe'] || this.iframeTransport_) {
      return;
    }

    if (opt_preconnect) {
      opt_preconnect.preload((0, _iframeTransport.getIframeTransportScriptUrl)(win), 'script');
    }

    var type = element.getAttribute('type'); // In inabox there is no amp-ad element.

    var ampAdResourceId = this.isInabox_ ? '1' : (0, _log.user)().assertString((0, _adHelper.getAmpAdResourceId)(element, (0, _service.getTopWindow)(win)), 'No friendly amp-ad ancestor element was found ' + 'for amp-analytics tag with iframe transport.');
    this.iframeTransport_ = new _iframeTransport.IframeTransport(win, type, this.options_, ampAdResourceId);
  }
  /**
   * Deletes iframe transport.
   */
  ;

  _proto.deleteIframeTransport = function deleteIframeTransport() {
    if (this.iframeTransport_) {
      this.iframeTransport_.detach();
      this.iframeTransport_ = null;
    }
  }
  /**
   * Sends a ping request using an iframe, that is removed 5 seconds after
   * it is loaded.
   * This is not available as a standard transport, but rather used for
   * specific, whitelisted requests.
   * Note that this is unrelated to the iframeTransport
   *
   * @param {string} url
   * @param {!BatchSegmentDef} segment
   */
  ;

  _proto.sendRequestUsingIframe = function sendRequestUsingIframe(url, segment) {
    var _this = this;

    var request = (0, _transportSerializer.defaultSerializer)(url, [segment]);

    if (!request) {
      (0, _log.user)().error(TAG_, 'Request not sent. Contents empty.');
      return;
    }

    (0, _url.assertHttpsUrl)(request, 'amp-analytics request');
    (0, _log.userAssert)((0, _url.parseUrlDeprecated)(request).origin != (0, _url.parseUrlDeprecated)(this.win_.location.href).origin, 'Origin of iframe request must not be equal to the document origin.' + ' See https://github.com/ampproject/' + 'amphtml/blob/master/spec/amp-iframe-origin-policy.md for details.');
    /** @const {!Element} */

    var iframe = this.win_.document.createElement('iframe');
    (0, _style.toggle)(iframe, false);

    iframe.onload = iframe.onerror = function () {
      _services.Services.timerFor(_this.win_).delay(function () {
        (0, _dom.removeElement)(iframe);
      }, 5000);
    };

    iframe.setAttribute('amp-analytics', '');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.src = request;
    this.win_.document.body.appendChild(iframe);
  }
  /**
   * @return {!TransportSerializerDef}
   */
  ;

  _proto.getSerializer_ = function getSerializer_() {
    return (
      /** @type {!TransportSerializerDef} */
      _transportSerializer.TransportSerializers['default']
    );
  }
  /**
   * @param {!Window} win
   * @param {!RequestDef} request
   * @param {boolean} suppressWarnings
   * @param {string|undefined} referrerPolicy
   */
  ;

  Transport.sendRequestUsingImage = function sendRequestUsingImage(win, request, suppressWarnings, referrerPolicy) {
    var image = (0, _pixel.createPixel)(win, request.url, referrerPolicy);
    (0, _eventHelper.loadPromise)(image).then(function () {
      (0, _log.dev)().fine(TAG_, 'Sent image request', request.url);
    }).catch(function () {
      if (!suppressWarnings) {
        (0, _log.user)().warn(TAG_, 'Response unparseable or failed to send image request', request.url);
      }
    });
  }
  /**
   * @param {!Window} win
   * @param {!RequestDef} request
   * @return {boolean} True if this browser supports navigator.sendBeacon.
   */
  ;

  Transport.sendRequestUsingBeacon = function sendRequestUsingBeacon(win, request) {
    var sendBeacon = _windowInterface.WindowInterface.getSendBeacon(win);

    if (!sendBeacon) {
      return false;
    }

    var result = sendBeacon(request.url, request.payload || '');

    if (result) {
      (0, _log.dev)().fine(TAG_, 'Sent beacon request', request);
    }

    return result;
  }
  /**
   * @param {!Window} win
   * @param {!RequestDef} request
   * @return {boolean} True if this browser supports cross-domain XHR.
   */
  ;

  Transport.sendRequestUsingXhr = function sendRequestUsingXhr(win, request) {
    var XMLHttpRequest = _windowInterface.WindowInterface.getXMLHttpRequest(win);

    if (!XMLHttpRequest) {
      return false;
    }

    var xhr = new XMLHttpRequest();

    if (!('withCredentials' in xhr)) {
      return false; // Looks like XHR level 1 - CORS is not supported.
    }

    xhr.open('POST', request.url, true);
    xhr.withCredentials = true; // Prevent pre-flight HEAD request.

    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        (0, _log.dev)().fine(TAG_, 'Sent XHR request', request.url);
      }
    };

    xhr.send(request.payload || '');
    return true;
  };

  return Transport;
}();
/**
 * A helper method that wraps a function and cache its return value.
 *
 * @param {!Function} func the function to cache
 * @return {!Function}
 */


exports.Transport = Transport;

function cacheFuncResult(func) {
  var cachedValue = {};
  return function (arg) {
    var key = String(arg);

    if (cachedValue[key] === undefined) {
      cachedValue[key] = func(arg);
    }

    return cachedValue[key];
  };
}

},{"../../../src/ad-helper":104,"../../../src/dom":111,"../../../src/event-helper":114,"../../../src/log":125,"../../../src/mode":127,"../../../src/pixel":130,"../../../src/service":131,"../../../src/services":141,"../../../src/style":144,"../../../src/url":148,"../../../src/window-interface":158,"./iframe-transport":12,"./transport-serializer":22}],24:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.encodeVars = encodeVars;
exports.getNameArgs = getNameArgs;
exports.installVariableServiceForTesting = installVariableServiceForTesting;
exports.variableServiceForDoc = variableServiceForDoc;
exports.variableServicePromiseForDoc = variableServicePromiseForDoc;
exports.getNameArgsForTesting = getNameArgsForTesting;
exports.stringToBool = stringToBool;
exports.VariableService = exports.ExpansionOptions = void 0;

var _services = require("../../../src/services");

var _base = require("../../../src/utils/base64");

var _cookieReader = require("./cookie-reader");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _consent = require("../../../src/consent");

var _service = require("../../../src/service");

var _types = require("../../../src/types");

var _linkerReader = require("./linker-reader");

var _promise = require("../../../src/utils/promise");

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
var TAG = 'amp-analytics/variables';
/** @const {RegExp} */

var VARIABLE_ARGS_REGEXP = /^(?:([^\s]*)(\([^)]*\))|[^]+)$/;
var EXTERNAL_CONSENT_POLICY_STATE_STRING = {
  1: 'sufficient',
  2: 'insufficient',
  3: 'not_required',
  4: 'unknown'
};
/** @typedef {{name: string, argList: string}} */

var FunctionNameArgsDef;
/**
 * The structure that contains all details needed to expand a template
 * @struct
 * @const
 * @package For type.
 */

var ExpansionOptions =
/*#__PURE__*/
function () {
  /**
   * @param {!Object<string, *>} vars
   * @param {number=} opt_iterations
   * @param {boolean=} opt_noEncode
   */
  function ExpansionOptions(vars, opt_iterations, opt_noEncode) {
    /** @const {!Object<string, string|Array<string>>} */
    this.vars = vars;
    /** @const {number} */

    this.iterations = opt_iterations === undefined ? 2 : opt_iterations;
    /** @const {boolean} */

    this.noEncode = !!opt_noEncode;
    this.freezeVars = {};
  }
  /**
   * Freeze special variable name so that they don't get expanded.
   * For example ${extraUrlParams}
   * @param {string} str
   */


  var _proto = ExpansionOptions.prototype;

  _proto.freezeVar = function freezeVar(str) {
    this.freezeVars[str] = true;
  }
  /**
   * @param {string} name
   * @return {*}
   */
  ;

  _proto.getVar = function getVar(name) {
    var value = this.vars[name];

    if (value == null) {
      value = '';
    }

    return value;
  };

  return ExpansionOptions;
}();
/**
 * @param {string} value
 * @param {string} s
 * @param {string=} opt_l
 * @return {string}
 */


exports.ExpansionOptions = ExpansionOptions;

function substrMacro(value, s, opt_l) {
  var start = Number(s);
  var length = value.length;
  (0, _log.userAssert)((0, _types.isFiniteNumber)(start), 'Start index ' + start + 'in substr macro should be a number');

  if (opt_l) {
    length = Number(opt_l);
    (0, _log.userAssert)((0, _types.isFiniteNumber)(length), 'Length ' + length + ' in substr macro should be a number');
  }

  return value.substr(start, length);
}
/**
 * @param {string} value
 * @param {string} defaultValue
 * @return {string}
 */


function defaultMacro(value, defaultValue) {
  if (!value || !value.length) {
    return defaultValue;
  }

  return value;
}
/**
 * @param {string} string input to be replaced
 * @param {string} matchPattern string representation of regex pattern
 * @param {string=} opt_newSubStr pattern to be substituted in
 * @return {string}
 */


function replaceMacro(string, matchPattern, opt_newSubStr) {
  if (!matchPattern) {
    (0, _log.user)().warn(TAG, 'REPLACE macro must have two or more arguments');
  }

  if (!opt_newSubStr) {
    opt_newSubStr = '';
  }

  var regex = new RegExp(matchPattern, 'g');
  return string.replace(regex, opt_newSubStr);
}
/**
 * Applies the match function to the given string with the given regex
 * @param {string} string input to be replaced
 * @param {string} matchPattern string representation of regex pattern
 * @param {string=} opt_matchingGroupIndexStr the matching group to return.
 *                  Index of 0 indicates the full match. Defaults to 0
 * @return {string} returns the matching group given by opt_matchingGroupIndexStr
 */


function matchMacro(string, matchPattern, opt_matchingGroupIndexStr) {
  if (!matchPattern) {
    (0, _log.user)().warn(TAG, 'MATCH macro must have two or more arguments');
  }

  var index = 0;

  if (opt_matchingGroupIndexStr) {
    index = parseInt(opt_matchingGroupIndexStr, 10); // if given a non-number or negative number

    if (index != 0 && !index || index < 0) {
      (0, _log.user)().error(TAG, 'Third argument in MATCH macro must be a number >= 0');
      index = 0;
    }
  }

  var regex = new RegExp(matchPattern);
  var matches = string.match(regex);
  return matches && matches[index] ? matches[index] : '';
}
/**
 * Provides support for processing of advanced variable syntax like nested
 * expansions macros etc.
 */


var VariableService =
/*#__PURE__*/
function () {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function VariableService(ampdoc) {
    var _this = this;

    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
    /** @private {!JsonObject} */

    this.macros_ = (0, _object.dict)({});
    /** @const @private {!./linker-reader.LinkerReader} */

    this.linkerReader_ = (0, _linkerReader.linkerReaderServiceFor)(this.ampdoc_.win);
    this.register_('$DEFAULT', defaultMacro);
    this.register_('$SUBSTR', substrMacro);
    this.register_('$TRIM', function (value) {
      return value.trim();
    });
    this.register_('$TOLOWERCASE', function (value) {
      return value.toLowerCase();
    });
    this.register_('$TOUPPERCASE', function (value) {
      return value.toUpperCase();
    });
    this.register_('$NOT', function (value) {
      return String(!value);
    });
    this.register_('$BASE64', function (value) {
      return (0, _base.base64UrlEncodeFromString)(value);
    });
    this.register_('$HASH', this.hashMacro_.bind(this));
    this.register_('$IF', function (value, thenValue, elseValue) {
      return stringToBool(value) ? thenValue : elseValue;
    });
    this.register_('$REPLACE', replaceMacro);
    this.register_('$MATCH', matchMacro);
    this.register_('$EQUALS', function (firstValue, secValue) {
      return firstValue === secValue;
    }); // TODO(ccordry): Make sure this stays a window level service when this
    // VariableService is migrated to document level.

    this.register_('LINKER_PARAM', function (name, id) {
      return _this.linkerReader_.get(name, id);
    });
  }
  /**
   * @param {!Element} element
   * @return {!JsonObject} contains all registered macros
   */


  var _proto2 = VariableService.prototype;

  _proto2.getMacros = function getMacros(element) {
    var _this2 = this;

    var elementMacros = {
      'COOKIE': function COOKIE(name) {
        return (0, _cookieReader.cookieReader)(_this2.ampdoc_.win, (0, _log.dev)().assertElement(element), name);
      },
      'CONSENT_STATE': getConsentStateStr(element)
    };
    var merged = Object.assign({}, this.macros_, elementMacros);
    return (
      /** @type {!JsonObject} */
      merged
    );
  }
  /**
   * @param {string} name
   * @param {*} macro
   */
  ;

  _proto2.register_ = function register_(name, macro) {
    (0, _log.devAssert)(!this.macros_[name], 'Macro "' + name + '" already registered.');
    this.macros_[name] = macro;
  }
  /**
   * @param {string} template The template to expand
   * @param {!ExpansionOptions} options configuration to use for expansion
   * @return {!Promise<string>} The expanded string
   */
  ;

  _proto2.expandTemplate = function expandTemplate(template, options) {
    return (0, _promise.tryResolve)(this.expandTemplateSync.bind(this, template, options));
  }
  /**
   * @param {string} template The template to expand
   * @param {!ExpansionOptions} options configuration to use for expansion
   * @return {string} The expanded string
   * @visibleForTesting
   */
  ;

  _proto2.expandTemplateSync = function expandTemplateSync(template, options) {
    var _this3 = this;

    return template.replace(/\${([^}]*)}/g, function (match, key) {
      if (options.iterations < 0) {
        (0, _log.user)().error(TAG, 'Maximum depth reached while expanding variables. ' + 'Please ensure that the variables are not recursive.');
        return match;
      }

      if (!key) {
        return '';
      } // Split the key to name and args
      // e.g.: name='SOME_MACRO', args='(arg1, arg2)'


      var _getNameArgs = getNameArgs(key),
          name = _getNameArgs.name,
          argList = _getNameArgs.argList;

      if (options.freezeVars[name]) {
        // Do nothing with frozen params
        return match;
      }

      var value = options.getVar(name);

      if (typeof value == 'string') {
        value = _this3.expandTemplateSync(value, new ExpansionOptions(options.vars, options.iterations - 1, true
        /* noEncode */
        ));
      }

      if (!options.noEncode) {
        value = encodeVars(
        /** @type {string|?Array<string>} */
        value);
      }

      if (value) {
        value += argList;
      }

      return value;
    });
  }
  /**
   * @param {string} value
   * @return {!Promise<string>}
   */
  ;

  _proto2.hashMacro_ = function hashMacro_(value) {
    return _services.Services.cryptoFor(this.ampdoc_.win).sha384Base64(value);
  };

  return VariableService;
}();
/**
 * @param {string|?Array<string>} raw The values to URI encode.
 * @return {string} The encoded value.
 */


exports.VariableService = VariableService;

function encodeVars(raw) {
  if (raw == null) {
    return '';
  }

  if ((0, _types.isArray)(raw)) {
    return raw.map(encodeVars).join(',');
  } // Separate out names and arguments from the value and encode the value.


  var _getNameArgs2 = getNameArgs(String(raw)),
      name = _getNameArgs2.name,
      argList = _getNameArgs2.argList;

  return encodeURIComponent(name) + argList;
}
/**
 * Returns an array containing two values: name and args parsed from the key.
 *
 * case 1) 'SOME_MACRO(abc,def)' => name='SOME_MACRO', argList='(abc,def)'
 * case 2) 'randomString' => name='randomString', argList=''
 * @param {string} key The key to be parsed.
 * @return {!FunctionNameArgsDef}
 */


function getNameArgs(key) {
  if (!key) {
    return {
      name: '',
      argList: ''
    };
  }

  var match = key.match(VARIABLE_ARGS_REGEXP);
  (0, _log.userAssert)(match, 'Variable with invalid format found: ' + key);
  return {
    name: match[1] || match[0],
    argList: match[2] || ''
  };
}
/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */


function installVariableServiceForTesting(ampdoc) {
  (0, _service.registerServiceBuilderForDoc)(ampdoc, 'amp-analytics-variables', VariableService);
}
/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!VariableService}
 */


function variableServiceForDoc(elementOrAmpDoc) {
  return (0, _service.getServiceForDoc)(elementOrAmpDoc, 'amp-analytics-variables');
}
/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<!VariableService>}
 */


function variableServicePromiseForDoc(elementOrAmpDoc) {
  return (
    /** @type {!Promise<!VariableService>} */
    (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, 'amp-analytics-variables')
  );
}
/**
 * @param {string} key
 * @return {{name, argList}|!FunctionNameArgsDef}
 * @visibleForTesting
 */


function getNameArgsForTesting(key) {
  return getNameArgs(key);
}
/**
 * Get the resolved consent state value to send with analytics request
 * @param {!Element} element
 * @return {!Promise<?string>}
 */


function getConsentStateStr(element) {
  return (0, _consent.getConsentPolicyState)(element).then(function (consent) {
    if (!consent) {
      return null;
    }

    return EXTERNAL_CONSENT_POLICY_STATE_STRING[consent];
  });
}
/**
 * Converts string to boolean
 * @param {string} str
 * @return {boolean}
 */


function stringToBool(str) {
  return str !== 'false' && str !== '' && str !== '0' && str !== 'null' && str !== 'NaN' && str !== 'undefined';
}

},{"../../../src/consent":108,"../../../src/log":125,"../../../src/service":131,"../../../src/services":141,"../../../src/types":145,"../../../src/utils/base64":150,"../../../src/utils/object":154,"../../../src/utils/promise":156,"./cookie-reader":6,"./linker-reader":15}],25:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ANALYTICS_CONFIG = void 0;

var _iframeTransportVendors = require("./iframe-transport-vendors");

var _mode = require("../../../src/mode");

var _object = require("../../../src/utils/object");

var _json = require("../../../src/json");

var _experiments = require("../../../src/experiments");

var _acquialift = require("./vendors/acquialift");

var _adobeanalytics = require("./vendors/adobeanalytics");

var _adobeanalytics_nativeConfig = require("./vendors/adobeanalytics_nativeConfig");

var _afsanalytics = require("./vendors/afsanalytics");

var _alexametrics = require("./vendors/alexametrics");

var _amplitude = require("./vendors/amplitude");

var _atinternet = require("./vendors/atinternet");

var _baiduanalytics = require("./vendors/baiduanalytics");

var _bg = require("./vendors/bg");

var _burt = require("./vendors/burt");

var _byside = require("./vendors/byside");

var _chartbeat = require("./vendors/chartbeat");

var _clicky = require("./vendors/clicky");

var _colanalytics = require("./vendors/colanalytics");

var _comscore = require("./vendors/comscore");

var _cxense = require("./vendors/cxense");

var _dynatrace = require("./vendors/dynatrace");

var _epica = require("./vendors/epica");

var _euleriananalytics = require("./vendors/euleriananalytics");

var _facebookpixel = require("./vendors/facebookpixel");

var _gemius = require("./vendors/gemius");

var _googleadwords = require("./vendors/googleadwords");

var _googleanalytics = require("./vendors/googleanalytics");

var _gtag = require("./vendors/gtag");

var _ibeatanalytics = require("./vendors/ibeatanalytics");

var _infonline = require("./vendors/infonline");

var _iplabel = require("./vendors/iplabel");

var _keen = require("./vendors/keen");

var _kenshoo = require("./vendors/kenshoo");

var _krux = require("./vendors/krux");

var _linkpulse = require("./vendors/linkpulse");

var _lotame = require("./vendors/lotame");

var _marinsoftware = require("./vendors/marinsoftware");

var _mediametrie = require("./vendors/mediametrie");

var _mediarithmics = require("./vendors/mediarithmics");

var _mediator = require("./vendors/mediator");

var _metrika = require("./vendors/metrika");

var _moat = require("./vendors/moat");

var _mobify = require("./vendors/mobify");

var _mparticle = require("./vendors/mparticle");

var _mpulse = require("./vendors/mpulse");

var _navegg = require("./vendors/navegg");

var _newrelic = require("./vendors/newrelic");

var _nielsen = require("./vendors/nielsen");

var _nielsenMarketingCloud = require("./vendors/nielsen-marketing-cloud");

var _oewadirect = require("./vendors/oewadirect");

var _oewa = require("./vendors/oewa");

var _oracleInfinityAnalytics = require("./vendors/oracleInfinityAnalytics");

var _parsely = require("./vendors/parsely");

var _permutive = require("./vendors/permutive");

var _piano = require("./vendors/piano");

var _pinpoll = require("./vendors/pinpoll");

var _piStats = require("./vendors/piStats");

var _pressboard = require("./vendors/pressboard");

var _quantcast = require("./vendors/quantcast");

var _rakam = require("./vendors/rakam");

var _reppublika = require("./vendors/reppublika");

var _retargetly = require("./vendors/retargetly");

var _segment = require("./vendors/segment");

var _shinystat = require("./vendors/shinystat");

var _simplereach = require("./vendors/simplereach");

var _snowplow = require("./vendors/snowplow");

var _teaanalytics = require("./vendors/teaanalytics");

var _tealiumcollect = require("./vendors/tealiumcollect");

var _top = require("./vendors/top100");

var _topmailru = require("./vendors/topmailru");

var _treasuredata = require("./vendors/treasuredata");

var _umenganalytics = require("./vendors/umenganalytics");

var _upscore = require("./vendors/upscore");

var _vponanalytics = require("./vendors/vponanalytics");

var _webengage = require("./vendors/webengage");

var _webtrekk = require("./vendors/webtrekk");

var _webtrekk_v = require("./vendors/webtrekk_v2");

var _fake_ = require("./vendors/_fake_.js");

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
var DEFAULT_CONFIG = "{\"transport\":{\"beacon\":true,\"xhrpost\":true,\"image\":true},\"vars\":{\"accessReaderId\":\"ACCESS_READER_ID\",\"ampdocHost\":\"AMPDOC_HOST\",\"ampdocHostname\":\"AMPDOC_HOSTNAME\",\"ampdocUrl\":\"AMPDOC_URL\",\"ampGeo\":\"AMP_GEO\",\"ampUserLocation\":\"AMP_USER_LOCATION\",\"ampUserLocationPoll\":\"AMP_USER_LOCATION_POLL\",\"ampState\":\"AMP_STATE\",\"ampVersion\":\"AMP_VERSION\",\"ancestorOrigin\":\"ANCESTOR_ORIGIN\",\"authdata\":\"AUTHDATA\",\"availableScreenHeight\":\"AVAILABLE_SCREEN_HEIGHT\",\"availableScreenWidth\":\"AVAILABLE_SCREEN_WIDTH\",\"backgroundState\":\"BACKGROUND_STATE\",\"browserLanguage\":\"BROWSER_LANGUAGE\",\"canonicalHost\":\"CANONICAL_HOST\",\"canonicalHostname\":\"CANONICAL_HOSTNAME\",\"canonicalPath\":\"CANONICAL_PATH\",\"canonicalUrl\":\"CANONICAL_URL\",\"clientId\":\"CLIENT_ID\",\"consentState\":\"CONSENT_STATE\",\"contentLoadTime\":\"CONTENT_LOAD_TIME\",\"cookie\":\"COOKIE\",\"counter\":\"COUNTER\",\"documentCharset\":\"DOCUMENT_CHARSET\",\"documentReferrer\":\"DOCUMENT_REFERRER\",\"domainLookupTime\":\"DOMAIN_LOOKUP_TIME\",\"domInteractiveTime\":\"DOM_INTERACTIVE_TIME\",\"externalReferrer\":\"EXTERNAL_REFERRER\",\"firstContentfulPaint\":\"FIRST_CONTENTFUL_PAINT\",\"firstViewportReady\":\"FIRST_VIEWPORT_READY\",\"fragmentParam\":\"FRAGMENT_PARAM\",\"makeBodyVisible\":\"MAKE_BODY_VISIBLE\",\"htmlAttr\":\"HTML_ATTR\",\"incrementalEngagedTime\":\"INCREMENTAL_ENGAGED_TIME\",\"navRedirectCount\":\"NAV_REDIRECT_COUNT\",\"navTiming\":\"NAV_TIMING\",\"navType\":\"NAV_TYPE\",\"pageDownloadTime\":\"PAGE_DOWNLOAD_TIME\",\"pageLoadTime\":\"PAGE_LOAD_TIME\",\"pageViewId\":\"PAGE_VIEW_ID\",\"queryParam\":\"QUERY_PARAM\",\"random\":\"RANDOM\",\"redirectTime\":\"REDIRECT_TIME\",\"resourceTiming\":\"RESOURCE_TIMING\",\"screenColorDepth\":\"SCREEN_COLOR_DEPTH\",\"screenHeight\":\"SCREEN_HEIGHT\",\"screenWidth\":\"SCREEN_WIDTH\",\"scrollHeight\":\"SCROLL_HEIGHT\",\"scrollLeft\":\"SCROLL_LEFT\",\"scrollTop\":\"SCROLL_TOP\",\"scrollWidth\":\"SCROLL_WIDTH\",\"serverResponseTime\":\"SERVER_RESPONSE_TIME\",\"sourceUrl\":\"SOURCE_URL\",\"sourceHost\":\"SOURCE_HOST\",\"sourceHostname\":\"SOURCE_HOSTNAME\",\"sourcePath\":\"SOURCE_PATH\",\"tcpConnectTime\":\"TCP_CONNECT_TIME\",\"timestamp\":\"TIMESTAMP\",\"timezone\":\"TIMEZONE\",\"timezoneCode\":\"TIMEZONE_CODE\",\"title\":\"TITLE\",\"totalEngagedTime\":\"TOTAL_ENGAGED_TIME\",\"userAgent\":\"USER_AGENT\",\"viewer\":\"VIEWER\",\"viewportHeight\":\"VIEWPORT_HEIGHT\",\"viewportWidth\":\"VIEWPORT_WIDTH\"}}";
/**
 * @const {!JsonObject}
 */

var ANALYTICS_CONFIG = // eslint-disable-next-line no-undef
false ? JSON.parse("{\"default\":" + DEFAULT_CONFIG + "}") : JSON.parse("{\"default\":" + DEFAULT_CONFIG + ",\"acquialift\":" + _acquialift.ACQUIALIFT_CONFIG + ",\"adobeanalytics\":" + _adobeanalytics.ADOBEANALYTICS_CONFIG + ",\"adobeanalytics_nativeConfig\":" + _adobeanalytics_nativeConfig.ADOBEANALYTICS_NATIVECONFIG_CONFIG + ",\"afsanalytics\":" + _afsanalytics.AFSANALYTICS_CONFIG + ",\"alexametrics\":" + _alexametrics.ALEXAMETRICS_CONFIG + ",\"amplitude\":" + _amplitude.AMPLITUDE_CONFIG + ",\"atinternet\":" + _atinternet.ATINTERNET_CONFIG + ",\"baiduanalytics\":" + _baiduanalytics.BAIDUANALYTICS_CONFIG + ",\"bg\":" + _bg.BG_CONFIG + ",\"burt\":" + _burt.BURT_CONFIG + ",\"byside\":" + _byside.BYSIDE_CONFIG + ",\"chartbeat\":" + _chartbeat.CHARTBEAT_CONFIG + ",\"clicky\":" + _clicky.CLICKY_CONFIG + ",\"colanalytics\":" + _colanalytics.COLANALYTICS_CONFIG + ",\"comscore\":" + _comscore.COMSCORE_CONFIG + ",\"cxense\":" + _cxense.CXENSE_CONFIG + ",\"dynatrace\":" + _dynatrace.DYNATRACE_CONFIG + ",\"epica\":" + _epica.EPICA_CONFIG + ",\"euleriananalytics\":" + _euleriananalytics.EULERIANANALYTICS_CONFIG + ",\"facebookpixel\":" + _facebookpixel.FACEBOOKPIXEL_CONFIG + ",\"gemius\":" + _gemius.GEMIUS_CONFIG + ",\"googleadwords\":" + _googleadwords.GOOGLEADWORDS_CONFIG + ",\"googleanalytics\":" + _googleanalytics.GOOGLEANALYTICS_CONFIG + ",\"gtag\":" + _gtag.GTAG_CONFIG + ",\"ibeatanalytics\":" + _ibeatanalytics.IBEATANALYTICS_CONFIG + ",\"infonline\":" + _infonline.INFONLINE_CONFIG + ",\"iplabel\":" + _iplabel.IPLABEL_CONFIG + ",\"keen\":" + _keen.KEEN_CONFIG + ",\"kenshoo\":" + _kenshoo.KENSHOO_CONFIG + ",\"krux\":" + _krux.KRUX_CONFIG + ",\"linkpulse\":" + _linkpulse.LINKPULSE_CONFIG + ",\"lotame\":" + _lotame.LOTAME_CONFIG + ",\"marinsoftware\":" + _marinsoftware.MARINSOFTWARE_CONFIG + ",\"mediametrie\":" + _mediametrie.MEDIAMETRIE_CONFIG + ",\"mediarithmics\":" + _mediarithmics.MEDIARITHMICS_CONFIG + ",\"mediator\":" + _mediator.MEDIATOR_CONFIG + ",\"metrika\":" + _metrika.METRIKA_CONFIG + ",\"moat\":" + _moat.MOAT_CONFIG + ",\"mobify\":" + _mobify.MOBIFY_CONFIG + ",\"mparticle\":" + _mparticle.MPARTICLE_CONFIG + ",\"mpulse\":" + _mpulse.MPULSE_CONFIG + ",\"navegg\":" + _navegg.NAVEGG_CONFIG + ",\"newrelic\":" + _newrelic.NEWRELIC_CONFIG + ",\"nielsen\":" + _nielsen.NIELSEN_CONFIG + ",\"nielsen-marketing-cloud\":" + _nielsenMarketingCloud.NIELSEN_MARKETING_CLOUD_CONFIG + ",\"oewa\":" + _oewa.OEWA_CONFIG + ",\"oewadirect\":" + _oewadirect.OEWADIRECT_CONFIG + ",\"oracleInfinityAnalytics\":" + _oracleInfinityAnalytics.ORACLEINFINITYANALYTICS_CONFIG + ",\"parsely\":" + _parsely.PARSELY_CONFIG + ",\"piStats\":" + _piStats.PISTATS_CONFIG + ",\"permutive\":" + _permutive.PERMUTIVE_CONFIG + ",\"piano\":" + _piano.PIANO_CONFIG + ",\"pinpoll\":" + _pinpoll.PINPOLL_CONFIG + ",\"pressboard\":" + _pressboard.PRESSBOARD_CONFIG + ",\"quantcast\":" + _quantcast.QUANTCAST_CONFIG + ",\"retargetly\":" + _retargetly.RETARGETLY_CONFIG + ",\"rakam\":" + _rakam.RAKAM_CONFIG + ",\"reppublika\":" + _reppublika.REPPUBLIKA_CONFIG + ",\"segment\":" + _segment.SEGMENT_CONFIG + ",\"shinystat\":" + _shinystat.SHINYSTAT_CONFIG + ",\"simplereach\":" + _simplereach.SIMPLEREACH_CONFIG + ",\"snowplow\":" + _snowplow.SNOWPLOW_CONFIG + ",\"teaanalytics\":" + _teaanalytics.TEAANALYTICS_CONFIG + ",\"tealiumcollect\":" + _tealiumcollect.TEALIUMCOLLECT_CONFIG + ",\"top100\":" + _top.TOP100_CONFIG + ",\"topmailru\":" + _topmailru.TOPMAILRU_CONFIG + ",\"treasuredata\":" + _treasuredata.TREASUREDATA_CONFIG + ",\"umenganalytics\":" + _umenganalytics.UMENGANALYTICS_CONFIG + ",\"upscore\":" + _upscore.UPSCORE_CONFIG + ",\"vponanalytics\":" + _vponanalytics.VPONANALYTICS_CONFIG + ",\"webengage\":" + _webengage.WEBENGAGE_CONFIG + ",\"webtrekk\":" + _webtrekk.WEBTREKK_CONFIG + ",\"webtrekk_v2\":" + _webtrekk_v.WEBTREKK_V2_CONFIG + "}"); // eslint-disable-next-line no-undef

exports.ANALYTICS_CONFIG = ANALYTICS_CONFIG;

if (!false) {
  if ((0, _mode.getMode)().test || (0, _mode.getMode)().localDev) {
    ANALYTICS_CONFIG['_fake_'] = _fake_._FAKE_;
  }

  ANALYTICS_CONFIG['infonline']['triggers']['pageview']['iframePing'] = true;
  ANALYTICS_CONFIG['adobeanalytics_nativeConfig']['triggers']['pageLoad']['iframePing'] = true;
  ANALYTICS_CONFIG['oewa']['triggers']['pageview']['iframePing'] = true;
  mergeIframeTransportConfig(ANALYTICS_CONFIG, (0, _experiments.isCanary)(self) ? _iframeTransportVendors.IFRAME_TRANSPORTS_CANARY : _iframeTransportVendors.IFRAME_TRANSPORTS);
}
/**
 * Merges iframe transport config.
 *
 * @param {!JsonObject} config
 * @param {!JsonObject} iframeTransportConfig
 */


function mergeIframeTransportConfig(config, iframeTransportConfig) {
  for (var vendor in iframeTransportConfig) {
    if ((0, _object.hasOwn)(iframeTransportConfig, vendor)) {
      var url = iframeTransportConfig[vendor];
      config[vendor]['transport'] = Object.assign({}, config[vendor]['transport'], {
        'iframe': url
      });
    }
  }
}

},{"../../../src/experiments":115,"../../../src/json":122,"../../../src/mode":127,"../../../src/utils/object":154,"./iframe-transport-vendors":11,"./vendors/_fake_.js":26,"./vendors/acquialift":27,"./vendors/adobeanalytics":28,"./vendors/adobeanalytics_nativeConfig":29,"./vendors/afsanalytics":30,"./vendors/alexametrics":31,"./vendors/amplitude":32,"./vendors/atinternet":33,"./vendors/baiduanalytics":34,"./vendors/bg":35,"./vendors/burt":36,"./vendors/byside":37,"./vendors/chartbeat":38,"./vendors/clicky":39,"./vendors/colanalytics":40,"./vendors/comscore":41,"./vendors/cxense":42,"./vendors/dynatrace":43,"./vendors/epica":44,"./vendors/euleriananalytics":45,"./vendors/facebookpixel":46,"./vendors/gemius":47,"./vendors/googleadwords":48,"./vendors/googleanalytics":49,"./vendors/gtag":50,"./vendors/ibeatanalytics":51,"./vendors/infonline":52,"./vendors/iplabel":53,"./vendors/keen":54,"./vendors/kenshoo":55,"./vendors/krux":56,"./vendors/linkpulse":57,"./vendors/lotame":58,"./vendors/marinsoftware":59,"./vendors/mediametrie":60,"./vendors/mediarithmics":61,"./vendors/mediator":62,"./vendors/metrika":63,"./vendors/moat":64,"./vendors/mobify":65,"./vendors/mparticle":66,"./vendors/mpulse":67,"./vendors/navegg":68,"./vendors/newrelic":69,"./vendors/nielsen":71,"./vendors/nielsen-marketing-cloud":70,"./vendors/oewa":72,"./vendors/oewadirect":73,"./vendors/oracleInfinityAnalytics":74,"./vendors/parsely":75,"./vendors/permutive":76,"./vendors/piStats":77,"./vendors/piano":78,"./vendors/pinpoll":79,"./vendors/pressboard":80,"./vendors/quantcast":81,"./vendors/rakam":82,"./vendors/reppublika":83,"./vendors/retargetly":84,"./vendors/segment":85,"./vendors/shinystat":86,"./vendors/simplereach":87,"./vendors/snowplow":88,"./vendors/teaanalytics":89,"./vendors/tealiumcollect":90,"./vendors/top100":91,"./vendors/topmailru":92,"./vendors/treasuredata":93,"./vendors/umenganalytics":94,"./vendors/upscore":95,"./vendors/vponanalytics":96,"./vendors/webengage":97,"./vendors/webtrekk":98,"./vendors/webtrekk_v2":99}],26:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports._FAKE_ = void 0;

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
var _FAKE_ =
/** @type {!JsonObject} */
{
  'requests': {
    'endpoint': '/analytics/fake'
  },
  'transport': {
    'useBody': true
  },
  'triggers': {
    'view': {
      'on': 'visible',
      'request': 'endpoint'
    }
  },
  'configRewriter': {
    'url': '/analytics/rewriter',
    'varGroups': {
      'feature1': {
        'dr': 'DOCUMENT_REFERRER',
        'su': 'SOURCE_URL'
      },
      'feature2': {
        'name': 'cats',
        'title': 'TITLE'
      },
      'alwaysOnFeature': {
        'title2': 'TITLE',
        'enabled': true
      }
    }
  },
  'vars': {
    'clientId': 'CLIENT_ID(_fake_)',
    'dataSource': 'AMP'
  }
};
exports._FAKE_ = _FAKE_;

},{}],27:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ACQUIALIFT_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var ACQUIALIFT_CONFIG = "{\"vars\":{\"decisionApiUrl\":\"us-east-1-decisionapi.lift.acquia.com\",\"accountId\":\"xxxxxxxx\",\"siteId\":\"xxxxxxxx\"},\"transport\":{\"beacon\":true,\"xhrpost\":true,\"image\":false},\"requests\":{\"base\":\"https://${decisionApiUrl}/capture?account_id=${accountId}&site_id=${siteId}\",\"basicCapture\":\"${base}&ident=${clientId(tc_ptid)}&identsrc=amp&es=Amp&url=${canonicalUrl}&rurl=${documentReferrer}&cttl=${title}\",\"pageview\":\"${basicCapture}&en=Content View\",\"click\":\"${basicCapture}&en=Click-Through\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.ACQUIALIFT_CONFIG = ACQUIALIFT_CONFIG;

},{"../../../../src/json":122}],28:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ADOBEANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var ADOBEANALYTICS_CONFIG = "{\"transport\":{\"xhrpost\":false,\"beacon\":false,\"image\":true},\"vars\":{\"pageName\":\"TITLE\",\"host\":\"\",\"reportSuites\":\"\",\"linkType\":\"o\",\"linkUrl\":\"\",\"linkName\":\"\"},\"requests\":{\"requestPath\":\"/b/ss/${reportSuites}/0/amp-1.0/s${random}\",\"basePrefix\":\"vid=z${clientId(adobe_amp_id)}&ndh=0&ce=${documentCharset}&pageName=${pageName}&g=${ampdocUrl}&r=${documentReferrer}&bh=${availableScreenHeight}&bw=${availableScreenWidth}&c=${screenColorDepth}&j=amp&s=${screenWidth}x${screenHeight}\",\"pageview\":\"https://${host}${requestPath}?${basePrefix}\",\"click\":\"https://${host}${requestPath}?${basePrefix}&pe=lnk_${linkType}&pev1=${linkUrl}&pev2=${linkName}\"}}";
exports.ADOBEANALYTICS_CONFIG = ADOBEANALYTICS_CONFIG;

},{"../../../../src/json":122}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ADOBEANALYTICS_NATIVECONFIG_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var ADOBEANALYTICS_NATIVECONFIG_CONFIG = "{\"triggers\":{\"pageLoad\":{\"on\":\"visible\",\"request\":\"iframeMessage\"}}}";
exports.ADOBEANALYTICS_NATIVECONFIG_CONFIG = ADOBEANALYTICS_NATIVECONFIG_CONFIG;

},{"../../../../src/json":122}],30:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AFSANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var AFSANALYTICS_CONFIG = "{\"vars\":{\"server\":\"www\",\"websiteid\":\"xxxxxxxx\",\"event\":\"click\",\"clicklabel\":\"clicked from AMP page\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"requests\":{\"host\":\"//${server}.afsanalytics.com\",\"base\":\"${host}/cgi_bin/\",\"pageview\":\"${base}connect.cgi?usr=${websiteid}Pauto&js=1&amp=1&title=${title}&url=${canonicalUrl}&refer=${documentReferrer}&resolution=${screenWidth}x${screenHeight}&color=${screenColorDepth}&Tips=${random}\",\"click\":\"${base}click.cgi?usr=${websiteid}&event=${event}&exit=${clicklabel}\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.AFSANALYTICS_CONFIG = AFSANALYTICS_CONFIG;

},{"../../../../src/json":122}],31:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ALEXAMETRICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var ALEXAMETRICS_CONFIG = "{\"requests\":{\"base\":\"https://${ampAtrkHost}/atrk.gif?account=${atrk_acct}&domain=${domain}\",\"pageview\":\"${base}&jsv=amp-${ampVersion}&frame_height=${viewportHeight}&frame_width=${viewportWidth}&title=${title}&time=${timestamp}&time_zone_offset=${timezone}&screen_params=${screenWidth}x${screenHeight}x${screenColorDepth}&ref_url=${documentReferrer}&host_url=${sourceUrl}&random_number=${random}&user_cookie=${clientId(__auc)}&user_cookie_flag=0&user_lang=${browserLanguage}&amp_doc_url=${ampdocUrl}\"},\"vars\":{\"atrk_acct\":\"\",\"domain\":\"\",\"ampAtrkHost\":\"certify-amp.alexametrics.com\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"xhrpost\":false,\"beacon\":false,\"image\":true}}";
exports.ALEXAMETRICS_CONFIG = ALEXAMETRICS_CONFIG;

},{"../../../../src/json":122}],32:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.AMPLITUDE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var AMPLITUDE_CONFIG = "{\"transport\":{\"beacon\":true,\"xhrpost\":true,\"useBody\":true,\"image\":false},\"vars\":{\"deviceId\":\"CLIENT_ID(amplitude_amp_id)\"},\"requests\":{\"host\":\"https://api.amplitude.com\",\"event\":{\"baseUrl\":\"${host}/amp/event\"}},\"extraUrlParams\":{\"api_key\":\"${apiKey}\",\"device_id\":\"${deviceId}\",\"library\":\"amp/${ampVersion}\",\"time\":\"${timestamp}\",\"language\":\"${browserLanguage}\",\"user_agent\":\"${userAgent}\"},\"linkers\":{\"amplitude\":{\"ids\":{\"amplitude_amp_id\":\"${deviceId}\"},\"proxyOnly\":false}},\"cookies\":{\"amplitude_amp_id\":{\"value\":\"LINKER_PARAM(amplitude, amplitude_amp_id)\"}}}";
exports.AMPLITUDE_CONFIG = AMPLITUDE_CONFIG;

},{"../../../../src/json":122}],33:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ATINTERNET_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var ATINTERNET_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"vars\":{\"pixelPath\":\"hit.xiti\",\"domain\":\".xiti.com\"},\"requests\":{\"base\":\"https://${log}${domain}/${pixelPath}?s=${site}&ts=${timestamp}&r=${screenWidth}x${screenHeight}x${screenColorDepth}&re=${availableScreenWidth}x${availableScreenHeight}\",\"suffix\":\"&medium=amp&${extraUrlParams}&ref=${documentReferrer}\",\"pageview\":\"${base}&p=${title}&s2=${level2}${suffix}\",\"click\":\"${base}&pclick=${title}&s2click=${level2}&p=${label}&s2=${level2Click}&type=click&click=${type}${suffix}\"}}";
exports.ATINTERNET_CONFIG = ATINTERNET_CONFIG;

},{"../../../../src/json":122}],34:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.BAIDUANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var BAIDUANALYTICS_CONFIG = "{\"requests\":{\"host\":\"https://hm.baidu.com\",\"base\":\"${host}/hm.gif?si=${token}&nv=0&st=4&v=pixel-1.0&rnd=${timestamp}\",\"pageview\":\"${base}&et=0\",\"event\":\"${base}&ep=${category}*${action}*${label}*${value}&et=4&api=8_0\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.BAIDUANALYTICS_CONFIG = BAIDUANALYTICS_CONFIG;

},{"../../../../src/json":122}],35:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.BG_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var BG_CONFIG = "{}";
exports.BG_CONFIG = BG_CONFIG;

},{"../../../../src/json":122}],36:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.BURT_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var BURT_CONFIG = "{\"vars\":{\"trackingKey\":\"ignore\",\"category\":\"\",\"subCategory\":\"\"},\"requests\":{\"host\":\"//${trackingKey}.c.richmetrics.com/\",\"base\":\"${host}imglog?e=${trackingKey}&pi=${trackingKey}|${pageViewId}|${canonicalPath}|${clientId(burt-amp-user-id)}&ui=${clientId(burt-amp-user-id)}&v=amp&ts=${timestamp}&sn=${requestCount}&\",\"pageview\":\"${base}type=page&ca=${category}&sc=${subCategory}&ln=${browserLanguage}&lr=${documentReferrer}&eu=${sourceUrl}&tz=${timezone}&pd=${scrollWidth}x${scrollHeight}&sd=${screenWidth}x${screenHeight}&wd=${availableScreenWidth}x${availableScreenHeight}&ws=${scrollLeft}x${scrollTop}\",\"pageping\":\"${base}type=pageping\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"},\"pageping\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":15,\"maxTimerLength\":1200},\"request\":\"pageping\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.BURT_CONFIG = BURT_CONFIG;

},{"../../../../src/json":122}],37:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.BYSIDE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var BYSIDE_CONFIG = "{\"vars\":{\"webcareZone\":\"webcare\",\"webcareId\":\"\",\"channel\":\"\",\"fid\":\"\",\"lang\":\"pt\"},\"requests\":{\"host\":\"//${webcareZone}.byside.com/\",\"base\":\"${host}BWA${webcareId}/amp/\",\"pageview\":\"${base}pixel.php\",\"event\":\"${base}signal.php?event_id=${eventId}&event_label=${eventLabel}&fields=${fields}\"},\"extraUrlParams\":{\"webcare_id\":\"${webcareId}\",\"bwch\":\"${channel}\",\"lang\":\"${lang}\",\"fid\":\"${fid}\",\"bwit\":\"A\",\"tuid\":\"${clientId(byside_webcare_tuid)}\",\"suid\":\"\",\"puid\":\"${pageViewId}p${timestamp}\",\"referrer\":\"${documentReferrer}\",\"page\":\"${sourceUrl}\",\"amppage\":\"${ampdocUrl}\",\"bwpt\":\"${title}\",\"bres\":\"${viewportWidth}x${viewportHeight}\",\"res\":\"${screenWidth}x${screenHeight}\",\"v\":\"v20171116a\",\"ampv\":\"${ampVersion}\",\"viewer\":\"${viewer}\",\"ua\":\"${userAgent}\",\"r\":\"${random}\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.BYSIDE_CONFIG = BYSIDE_CONFIG;

},{"../../../../src/json":122}],38:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CHARTBEAT_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var CHARTBEAT_CONFIG = "{\"requests\":{\"host\":\"https://ping.chartbeat.net\",\"basePrefix\":\"/ping?h=${domain}&p=${canonicalPath}&u=${clientId(_cb)}&d=${canonicalHost}&g=${uid}&g0=${sections}&g1=${authors}&g2=${zone}&g3=${sponsorName}&g4=${contentType}&c=120&x=${scrollTop}&y=${scrollHeight}&o=${scrollWidth}&w=${viewportHeight}&j=${decayTime}&R=1&W=0&I=0&E=${totalEngagedTime}&r=${documentReferrer}&t=${pageViewId}${clientId(_cb)}&b=${pageLoadTime}&i=${title}&T=${timestamp}&tz=${timezone}&C=2\",\"baseSuffix\":\"&_\",\"interval\":\"${host}${basePrefix}${baseSuffix}\",\"anchorClick\":\"${host}${basePrefix}${baseSuffix}\"},\"triggers\":{\"trackInterval\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":15,\"maxTimerLength\":7200},\"request\":\"interval\",\"vars\":{\"decayTime\":30}},\"trackAnchorClick\":{\"on\":\"click\",\"selector\":\"a\",\"request\":\"anchorClick\",\"vars\":{\"decayTime\":30}}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.CHARTBEAT_CONFIG = CHARTBEAT_CONFIG;

},{"../../../../src/json":122}],39:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CLICKY_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var CLICKY_CONFIG = "{\"vars\":{\"site_id\":\"\"},\"requests\":{\"base\":\"https://in.getclicky.com/in.php?site_id=${site_id}\",\"baseSuffix\":\"&mime=${contentType}&x=${random}\",\"pageview\":\"${base}&res=${screenWidth}x${screenHeight}&lang=${browserLanguage}&secure=1&type=pageview&href=${canonicalPath}&title=${title}${baseSuffix}\",\"interval\":\"${base}&type=ping${baseSuffix}\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"},\"interval\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":60,\"maxTimerLength\":600},\"request\":\"interval\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.CLICKY_CONFIG = CLICKY_CONFIG;

},{"../../../../src/json":122}],40:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.COLANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var COLANALYTICS_CONFIG = "{\"requests\":{\"host\":\"https://ase.clmbtech.com\",\"base\":\"${host}/message\",\"pageview\":\"${base}?cid=${id}&val_101=${id}&val_101=${canonicalPath}&ch=${canonicalHost}&uuid=${uid}&au=${authors}&zo=${zone}&sn=${sponsorName}&ct=${contentType}&st=${scrollTop}&sh=${scrollHeight}&dct=${decayTime}&tet=${totalEngagedTime}&dr=${documentReferrer}&plt=${pageLoadTime}&val_108=${title}&val_120=3\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.COLANALYTICS_CONFIG = COLANALYTICS_CONFIG;

},{"../../../../src/json":122}],41:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.COMSCORE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var COMSCORE_CONFIG = "{\"vars\":{\"c2\":\"1000001\"},\"requests\":{\"host\":\"https://sb.scorecardresearch.com\",\"base\":\"${host}/b?\",\"pageview\":\"${base}c1=2&c2=${c2}&cs_amp_consent=${consentState}&cs_pv=${pageViewId}&c12=${clientId(comScore)}&rn=${random}&c8=${title}&c7=${canonicalUrl}&c9=${documentReferrer}&cs_c7amp=${ampdocUrl}\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.COMSCORE_CONFIG = COMSCORE_CONFIG;

},{"../../../../src/json":122}],42:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CXENSE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var CXENSE_CONFIG = "{\"requests\":{\"host\":\"https://scomcluster.cxense.com\",\"base\":\"${host}/Repo/rep.gif\",\"pageview\":\"${base}?ver=1&typ=pgv&sid=${siteId}&ckp=${clientId(cX_P)}&loc=${sourceUrl}&rnd=${random}&ref=${documentReferrer}&ltm=${timestamp}&wsz=${screenWidth}x${screenHeight}&bln=${browserLanguage}&chs=${documentCharset}&col=${screenColorDepth}&tzo=${timezone}&cp_cx_channel=amp\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.CXENSE_CONFIG = CXENSE_CONFIG;

},{"../../../../src/json":122}],43:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.DYNATRACE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var DYNATRACE_CONFIG = "{\"requests\":{\"endpoint\":\"${protocol}://${tenant}${separator}${environment}:${port}/ampbf/${tenantpath}\",\"pageview\":\"${endpoint}?type=js&flavor=amp&v=1&a=1%7C1%7C_load_%7C_load_%7C-%7C${navTiming(navigationStart)}%7C${navTiming(domContentLoadedEventEnd)}%7C0%2C2%7C2%7C_onload_%7C_load_%7C-%7C${navTiming(domContentLoadedEventStart)}%7C${navTiming(domContentLoadedEventEnd)}%7C0&fId=${pageViewId}&vID=${clientId(rxVisitor)}&url=${sourceUrl}&title=${title}&sw=${screenWidth}&sh=${screenHeight}&w=${viewportWidth}&h=${viewportHeight}&nt=a${navType}b${navTiming(navigationStart)}c${navTiming(navigationStart,redirectStart)}d${navTiming(navigationStart,redirectEnd)}e${navTiming(navigationStart,fetchStart)}f${navTiming(navigationStart,domainLookupStart)}g${navTiming(navigationStart,domainLookupEnd)}h${navTiming(navigationStart,connectStart)}i${navTiming(navigationStart,connectEnd)}j${navTiming(navigationStart,secureConnectionStart)}k${navTiming(navigationStart,requestStart)}l${navTiming(navigationStart,responseStart)}m${navTiming(navigationStart,responseEnd)}n${navTiming(navigationStart,domLoading)}o${navTiming(navigationStart,domInteractive)}p${navTiming(navigationStart,domContentLoadedEventStart)}q${navTiming(navigationStart,domContentLoadedEventEnd)}r${navTiming(navigationStart,domComplete)}s${navTiming(navigationStart,loadEventStart)}t${navTiming(navigationStart,loadEventEnd)}&app=${app}&time=${timestamp}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"vars\":{\"app\":\"ampapp\",\"protocol\":\"https\",\"tenant\":\"\",\"environment\":\"live.dynatrace.com\",\"port\":\"443\",\"separator\":\".\"}}";
exports.DYNATRACE_CONFIG = DYNATRACE_CONFIG;

},{"../../../../src/json":122}],44:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.EPICA_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var EPICA_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"vars\":{\"anonymousId\":\"CLIENT_ID(epica_amp_id)\"},\"requests\":{\"host\":\"https://cat.poder.io/api/v1/pixel\",\"base\":\"?writeKey=${writeKey}&context.library.name=amp&anonymousId=${anonymousId}&context.locale=${browserLanguage}&context.page.path=${canonicalPath}&context.page.url=${canonicalUrl}&context.page.referrer=${documentReferrer}&context.page.title=${title}&context.screen.width=${screenWidth}&context.screen.height=${screenHeight}\",\"page\":\"${host}/page${base}&name=${name}\",\"track\":\"${host}/track${base}&event=${event}\"},\"triggers\":{\"page\":{\"on\":\"visible\",\"request\":\"page\"}}}";
exports.EPICA_CONFIG = EPICA_CONFIG;

},{"../../../../src/json":122}],45:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.EULERIANANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var EULERIANANALYTICS_CONFIG = "{\"vars\":{\"analyticsHost\":\"\",\"documentLocation\":\"SOURCE_URL\"},\"requests\":{\"base\":\"https://${analyticsHost}\",\"basePrefix\":\"-/${random}?euid-amp=${clientId(etuix)}&url=${documentLocation}&\",\"pageview\":\"${base}/col2/${basePrefix}rf=${externalReferrer}&urlp=${pagePath}&ss=${screenWidth}x${screenHeight}&sd=${screenColorDepth}\",\"action\":\"${base}/action/${basePrefix}eact=${actionCode}&actr=${actionRef}\",\"user\":\"${base}/uparam/${basePrefix}euk${userParamKey}=${userParamVal}\",\"contextflag\":\"${base}/cflag2/${basePrefix}ecf0k=${cflagKey}&ecf0v=${cflagVal}\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.EULERIANANALYTICS_CONFIG = EULERIANANALYTICS_CONFIG;

},{"../../../../src/json":122}],46:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.FACEBOOKPIXEL_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var FACEBOOKPIXEL_CONFIG = "{\"vars\":{\"pixelId\":\"PIXEL-ID\"},\"requests\":{\"host\":\"https://www.facebook.com\",\"base\":\"${host}/tr?noscript=1\",\"pageview\":\"${base}&ev=PageView&id=${pixelId}\",\"event\":\"${base}&ev=${eventName}&id=${pixelId}&cd[content_name]=${content_name}\",\"eventViewContent\":\"${base}&ev=ViewContent&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_type]=${content_type}&cd[content_ids]=${content_ids}\",\"eventSearch\":\"${base}&ev=Search&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_category]=${content_category}&cd[content_ids]=${content_ids}&cd[search_string]=${search_string}\",\"eventAddToCart\":\"${base}&ev=AddToCart&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_type]=${content_type}&cd[content_ids]=${content_ids}\",\"eventAddToWishlist\":\"${base}&ev=AddToWishlist&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_category]=${content_category}&cd[content_ids]=${content_ids}\",\"eventInitiateCheckout\":\"${base}&ev=InitiateCheckout&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_category]=${content_category}&cd[num_items]=${num_items}&cd[content_ids]=${content_ids}\",\"eventAddPaymentInfo\":\"${base}&ev=AddPaymentInfo&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_category]=${content_category}&cd[content_ids]=${content_ids}\",\"eventPurchase\":\"${base}&ev=Purchase&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_type]=${content_type}&cd[content_ids]=${content_ids}&cd[num_items]=${num_items}\",\"eventLead\":\"${base}&ev=Lead&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[content_category]=${content_category}\",\"eventCompleteRegistration\":\"${base}&ev=CompleteRegistration&id=${pixelId}&cd[value]=${value}&cd[currency]=${currency}&cd[content_name]=${content_name}&cd[status]=${status}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.FACEBOOKPIXEL_CONFIG = FACEBOOKPIXEL_CONFIG;

},{"../../../../src/json":122}],47:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.GEMIUS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var GEMIUS_CONFIG = "{\"vars\":{\"dnt\":\"0\"},\"requests\":{\"base\":\"https://${prefix}.hit.gemius.pl/_${timestamp}/redot.gif?l=91&id=${identifier}&tz=${timezone}&col=${screenColorDepth}&screen=${screenWidth}x${screenHeight}&window=${viewportWidth}x${viewportHeight}&fr=1&href=${sourceUrl}&ref=${documentReferrer}&sarg=${canonicalUrl}&extra=gemamp%3D1%7Campid%3D${clientId(gemius)}%7C${extraparams}&nc=${dnt}\",\"pageview\":\"${base}&et=view&hsrc=1\",\"event\":\"${base}&et=action&hsrc=3\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.GEMIUS_CONFIG = GEMIUS_CONFIG;

},{"../../../../src/json":122}],48:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.GOOGLEADWORDS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var GOOGLEADWORDS_CONFIG = "{\"requests\":{\"conversion_prefix\":\"https://www.googleadservices.com/pagead/conversion/\",\"remarketing_prefix\":\"https://googleads.g.doubleclick.net/pagead/viewthroughconversion/\",\"common_params\":\"${googleConversionId}/?cv=amp2&label=${googleConversionLabel}&random=${random}&url=${sourceUrl}&ref=${documentReferrer}&fst=${pageViewId}&num=${counter(googleadwords)}&fmt=3&async=1&u_h=${screenHeight}&u_w=${screenWidth}&u_ah=${availableScreenHeight}&u_aw=${availableScreenWidth}&u_cd=${screenColorDepth}&u_tz=${timezone}&tiba=${title}&guid=ON&script=0\",\"conversion_params\":\"value=${googleConversionValue}&currency_code=${googleConversionCurrency}&bg=${googleConversionColor}&hl=${googleConversionLanguage}\",\"conversion\":\"${conversion_prefix}${common_params}&${conversion_params}\",\"remarketing\":\"${remarketing_prefix}${common_params}\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.GOOGLEADWORDS_CONFIG = GOOGLEADWORDS_CONFIG;

},{"../../../../src/json":122}],49:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.GOOGLEANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var GOOGLEANALYTICS_CONFIG = "{\"vars\":{\"eventValue\":\"0\",\"documentLocation\":\"SOURCE_URL\",\"clientId\":\"CLIENT_ID(AMP_ECID_GOOGLE,,_ga)\",\"dataSource\":\"AMP\",\"anonymizeIP\":\"aip\",\"errorParam\":\"${errorName}-${errorMessage}\"},\"requests\":{\"host\":\"https://www.google-analytics.com\",\"basePrefix\":\"v=1&_v=a1&ds=${dataSource}&${anonymizeIP}&_s=${requestCount}&dt=${title}&sr=${screenWidth}x${screenHeight}&_utmht=${timestamp}&cid=${clientId}&tid=${account}&dl=${documentLocation}&dr=${externalReferrer}&sd=${screenColorDepth}&ul=${browserLanguage}&de=${documentCharset}\",\"baseSuffix\":\"&a=${pageViewId}&z=${random}\",\"pageview\":\"${host}/r/collect?${basePrefix}&t=pageview&jid=${random}&_r=1${baseSuffix}\",\"event\":\"${host}/collect?${basePrefix}&t=event&jid=&ec=${eventCategory}&ea=${eventAction}&el=${eventLabel}&ev=${eventValue}${baseSuffix}\",\"social\":\"${host}/collect?${basePrefix}&t=social&jid=&sa=${socialAction}&sn=${socialNetwork}&st=${socialTarget}${baseSuffix}\",\"timing\":\"${host}/collect?${basePrefix}&t=${timingRequestType}&jid=&plt=${pageLoadTime}&dns=${domainLookupTime}&tcp=${tcpConnectTime}&rrt=${redirectTime}&srt=${serverResponseTime}&pdt=${pageDownloadTime}&clt=${contentLoadTime}&dit=${domInteractiveTime}${baseSuffix}\",\"error\":\"${host}/collect?${basePrefix}&t=exception&exd=${errorParam}${baseSuffix}\"},\"triggers\":{\"performanceTiming\":{\"on\":\"visible\",\"request\":\"timing\",\"sampleSpec\":{\"sampleOn\":\"${clientId}\",\"threshold\":1},\"vars\":{\"timingRequestType\":\"timing\"}},\"adwordsTiming\":{\"on\":\"visible\",\"request\":\"timing\",\"enabled\":\"${queryParam(gclid)}\",\"vars\":{\"timingRequestType\":\"adtiming\"}},\"storyProgress\":{\"on\":\"story-page-visible\",\"enabled\":false,\"request\":\"event\",\"vars\":{\"eventAction\":\"story_progress\",\"eventCategory\":\"${title}\",\"eventLabel\":\"${storyPageId}\"}},\"storyEnd\":{\"on\":\"story-last-page-visible\",\"enabled\":false,\"request\":\"event\",\"vars\":{\"eventAction\":\"story_complete\",\"eventCategory\":\"${title}\"}}},\"extraUrlParamsReplaceMap\":{\"dimension\":\"cd\",\"metric\":\"cm\"},\"optout\":\"_gaUserPrefs.ioo\",\"optoutElementId\":\"__gaOptOutExtension\",\"linkers\":{\"_gl\":{\"ids\":{\"_ga\":\"${clientId}\"}}},\"cookies\":{\"_ga\":{\"value\":\"LINKER_PARAM(_gl, _ga)\"}}}";
exports.GOOGLEANALYTICS_CONFIG = GOOGLEANALYTICS_CONFIG;

},{"../../../../src/json":122}],50:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.GTAG_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var GTAG_CONFIG = "{\"configRewriter\":{\"url\":\"https://www.googletagmanager.com/gtag/amp\",\"varGroups\":{\"dns\":{\"dr\":\"DOCUMENT_REFERRER\",\"dl\":\"SOURCE_URL\"},\"conversion\":{\"gclsrc\":\"QUERY_PARAM(gclsrc)\",\"hasGcl\":\"$IF(QUERY_PARAM(gclid), 1, 0)\",\"hasDcl\":\"$IF(QUERY_PARAM(dclid), 1, 0)\",\"hasExtRef\":\"$IF(EXTERNAL_REFERRER, 1, 0)\",\"hasDocRef\":\"$IF(DOCUMENT_REFERRER, 1, 0)\",\"enabled\":true}}},\"vars\":{\"eventValue\":\"0\",\"clientId\":\"CLIENT_ID(AMP_ECID_GOOGLE,,_ga)\",\"dataSource\":\"AMP\",\"anonymizeIP\":\"aip\",\"errorParam\":\"${errorName}-${errorMessage}\"},\"requests\":{\"uaHost\":\"https://www.google-analytics.com\",\"uaBasePrefix\":\"v=1&_v=a1&ds=${dataSource}&${anonymizeIP}&_s=${requestCount}&dt=${title}&sr=${screenWidth}x${screenHeight}&cid=${clientId}&tid=${trackingId}&dl=${sourceUrl}&dr=${externalReferrer}&sd=${screenColorDepth}&ul=${browserLanguage}&de=${documentCharset}\",\"uaBaseSuffix\":\"&a=${pageViewId}&z=${random}\",\"uaPageviewCommon\":\"&t=pageview&jid=${random}&gjid=${random}&_r=1\",\"uaPageview\":\"${uaHost}/r/collect?${uaBasePrefix}${uaPageviewCommon}${uaBaseSuffix}\",\"uaPageviewNpa\":\"${uaHost}/collect?${uaBasePrefix}${uaPageviewCommon}${uaBaseSuffix}\",\"uaEvent\":\"${uaHost}/collect?${uaBasePrefix}&t=event&jid=${uaBaseSuffix}\",\"uaTiming\":\"${uaHost}/collect?${uaBasePrefix}&jid=&plt=${pageLoadTime}&dns=${domainLookupTime}&tcp=${tcpConnectTime}&rrt=${redirectTime}&srt=${serverResponseTime}&pdt=${pageDownloadTime}&clt=${contentLoadTime}&dit=${domInteractiveTime}${uaBaseSuffix}\",\"uaError\":\"${uaHost}/collect?${uaBasePrefix}&t=exception&exd=${errorParam}${uaBaseSuffix}\",\"awConversionPrefix\":\"https://www.googleadservices.com/pagead/conversion/\",\"awRemarketingPrefix\":\"https://googleads.g.doubleclick.net/pagead/viewthroughconversion/\",\"awCommonParams\":\"${conversionId}/?cv=amp3&label=${conversionLabel}&random=${random}&url=${sourceUrl}&ref=${documentReferrer}&fst=${pageViewId}&num=${counter(googleadwords)}&fmt=3&async=1&u_h=${screenHeight}&u_w=${screenWidth}&u_ah=${availableScreenHeight}&u_aw=${availableScreenWidth}&u_cd=${screenColorDepth}&u_tz=${timezone}&tiba=${title}&guid=ON&script=0\",\"awConversion\":\"${awConversionPrefix}${awCommonParams}\",\"awRemarketing\":\"${awRemarketingPrefix}${awCommonParams}\",\"flBase\":\"https://ad.doubleclick.net/activity;src=${flSrc};type=${flType};cat=${flCat}\",\"flDynamicBase\":\"https://${flSrc}.fls.doubleclick.net/activityi;src=${flSrc};type=${flType};cat=${flCat}\",\"dnsBase\":\"https://ad.doubleclick.net/ddm/clk/\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.GTAG_CONFIG = GTAG_CONFIG;

},{"../../../../src/json":122}],51:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.IBEATANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var IBEATANALYTICS_CONFIG = "{\"requests\":{\"host\":\"https://ibeat.indiatimes.com\",\"base\":\"https://ibeat.indiatimes.com/iBeat/pageTrendlogAmp.html\",\"pageview\":\"${base}?&h=${h}&d=${h}&url=${url}&k=${key}&ts=${time}&ch=${channel}&sid=${uid}&at=${agentType}&ref=${documentReferrer}&aid=${aid}&loc=1&ct=1&cat=${cat}&scat=${scat}&ac=1&tg=${tags}&ctids=${catIds}&pts=${pagePublishTime}&auth=${author}&pos=${position}&iBeatField=${ibeatFields}&cid=${clientId(MSCSAuthDetails)}\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.IBEATANALYTICS_CONFIG = IBEATANALYTICS_CONFIG;

},{"../../../../src/json":122}],52:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.INFONLINE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var INFONLINE_CONFIG = "{\"vars\":{\"sv\":\"ke\",\"ap\":\"1\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"requests\":{\"pageview\":\"${url}?st=${st}&sv=${sv}&ap=${ap}&co=${co}&cp=${cp}&ps=${ps}&host=${canonicalHost}&path=${canonicalPath}\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.INFONLINE_CONFIG = INFONLINE_CONFIG;

},{"../../../../src/json":122}],53:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.IPLABEL_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var IPLABEL_CONFIG = "{\"requests\":{\"collectorUrl\":\"m.col.ip-label.net\",\"endpoint\":\"https://${collectorUrl}/coll/\",\"onload\":\"${endpoint}?T=${trackerId}&m=2502|${navTiming(navigationStart)}|2508|${navTiming(domainLookupStart)}|2509|${navTiming(domainLookupEnd)}|2510|${navTiming(connectStart)}|2512|${navTiming(connectEnd)}|2514|${navTiming(responseStart)}|2515|${navTiming(responseEnd)}|2517|${navTiming(domInteractive)}|2520|${navTiming(loadEventStart)}&ts=${timestamp}&ua=${userAgent}&d=${ipldim}&i=${clientip}&d[1]=${customdim}&d[2]=${business}&d[3]=${abtesting}&d[4]=${infrastructure}&d[5]=${customer}&u=${urlgroup}&w=${availableScreenWidth}&h=${availableScreenHeight}&r=${documentReferrer}&l=${browserLanguage}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"onload\"}},\"transport\":{\"beacon\":true,\"xhrpost\":true,\"image\":{\"suppressWarnings\":true}},\"vars\":{\"trackerId\":\"notrackerID\",\"customdim\":\"\",\"business\":\"\",\"abtesting\":\"\",\"infrastructure\":\"\",\"customer\":\"\",\"clientip\":\"\",\"urlgroup\":\"\"}}";
exports.IPLABEL_CONFIG = IPLABEL_CONFIG;

},{"../../../../src/json":122}],54:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.KEEN_CONFIG = void 0;

var _json = require("../../../../src/json");

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var KEEN_CONFIG = "{\"requests\":{\"base\":\"https://api.keen.io/3.0/projects/${projectId}/events\",\"pageview\":\"${base}/pageviews?api_key=${writeKey}\",\"click\":\"${base}/clicks?api_key=${writeKey}\",\"custom\":\"${base}/${collection}?api_key=${writeKey}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"extraUrlParams\":{\"amp\":true,\"ampdocHostname\":\"${ampdocHostname}\",\"ampdocUrl\":\"${ampdocUrl}\",\"ampVersion\":\"${ampVersion}\",\"backgroundState\":\"${backgroundState}\",\"backgroundedAtStart\":\"${backgroundedAtStart}\",\"browserLanguage\":\"${browserLanguage}\",\"canonicalHost\":\"${canonicalHost}\",\"canonicalHostname\":\"${canonicalHostname}\",\"canonicalPath\":\"${canonicalPath}\",\"canonicalUrl\":\"${canonicalUrl}\",\"clientId\":\"CLIENT_ID(cid)\",\"contentLoadTime\":\"${contentLoadTime}\",\"documentReferrer\":\"${documentReferrer}\",\"domainLookupTime\":\"${domainLookupTime}\",\"domInteractiveTime\":\"${domInteractiveTime}\",\"externalReferrer\":\"${externalReferrer}\",\"incrementalEngagedTime\":\"${incrementalEngagedTime}\",\"pageDownloadTime\":\"${pageDownloadTime}\",\"pageLoadTime\":\"${pageLoadTime}\",\"screenHeight\":\"${screenHeight}\",\"screenWidth\":\"${screenWidth}\",\"screenColorDepth\":\"${screenColorDepth}\",\"scrollHeight\":\"${scrollHeight}\",\"scrollWidth\":\"${scrollWidth}\",\"scrollTop\":\"${scrollTop}\",\"scrollLeft\":\"${scrollLeft}\",\"serverResponseTime\":\"${serverResponseTime}\",\"timestamp\":\"${timestamp}\",\"timezone\":\"${timezone}\",\"title\":\"${title}\",\"totalEngagedTime\":\"${totalEngagedTime}\",\"totalTime\":\"${totalTime}\",\"userAgent\":\"${userAgent}\",\"viewportHeight\":\"${viewportHeight}\",\"viewportWidth\":\"${viewportWidth}\"},\"transport\":{\"beacon\":true,\"xhrpost\":true,\"img\":false,\"useBody\":true}}";
exports.KEEN_CONFIG = KEEN_CONFIG;

},{"../../../../src/json":122}],55:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.KENSHOO_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var KENSHOO_CONFIG = "{\"vars\":{\"clientId\":\"CLIENT_ID(ken_amp_id)\",\"channelClickId\":\"QUERY_PARAM(gclid)\"},\"requests\":{\"host\":\"https://amp.xg4ken.com\",\"parameters\":\"ampcid=${clientId}&chcid=${channelClickId}&tid=${tid}&uid=${userId}&domain=${canonicalHostname}\",\"landingPage\":\"${host}/amp/v1/match?${parameters}\"},\"triggers\":{\"trackLandingPage\":{\"enabled\":\"QUERY_PARAM(gclid)\",\"on\":\"visible\",\"request\":\"landingPage\"}},\"linkers\":{\"linker\":{\"ids\":{\"clientId\":\"${clientId}\",\"channelClickId\":\"${channelClickId}\"},\"proxyOnly\":false,\"enabled\":true}},\"cookies\":{\"enabled\":true,\"ken_gclid\":{\"value\":\"QUERY_PARAM(gclid)\"},\"ken_amp_gclid\":{\"value\":\"QUERY_PARAM(gclid)\"}}}";
exports.KENSHOO_CONFIG = KENSHOO_CONFIG;

},{"../../../../src/json":122}],56:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.KRUX_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var KRUX_CONFIG = "{\"requests\":{\"beaconHost\":\"https://beacon.krxd.net\",\"timing\":\"t_navigation_type=0&t_dns=${domainLookupTime}&t_tcp=${tcpConnectTime}&t_http_request=${serverResponseTime}&t_http_response=${pageDownloadTime}&t_content_ready=${contentLoadTime}&t_window_load=${pageLoadTime}&t_redirect=${redirectTime}\",\"common\":\"source=amp&confid=${confid}&_kpid=${pubid}&_kcp_s=${site}&_kcp_sc=${section}&_kcp_ssc=${subsection}&_kcp_d=${canonicalHost}&_kpref_=${documentReferrer}&_kua_kx_amp_client_id=${clientId(_kuid_)}&_kua_kx_lang=${browserLanguage}&_kua_kx_tech_browser_language=${browserLanguage}&_kua_kx_tz=${timezone}\",\"pageview\":\"${beaconHost}/pixel.gif?${common}&${timing}\",\"event\":\"${beaconHost}/event.gif?${common}&${timing}&pageview=false\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"extraUrlParamsReplaceMap\":{\"user.\":\"_kua_\",\"page.\":\"_kpa_\"}}";
exports.KRUX_CONFIG = KRUX_CONFIG;

},{"../../../../src/json":122}],57:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.LINKPULSE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var LINKPULSE_CONFIG = "{\"vars\":{\"id\":\"\",\"pageUrl\":\"CANONICAL_URL\",\"title\":\"TITLE\",\"section\":\"\",\"channel\":\"amp\",\"type\":\"\",\"host\":\"pp.lp4.io\",\"empty\":\"\"},\"requests\":{\"base\":\"https://${host}\",\"pageview\":\"${base}/p?i=${id}&r=${documentReferrer}&p=${pageUrl}&s=${section}&t=${type}&c=${channel}&mt=${title}&_t=amp&_r=${random}\",\"pageload\":\"${base}/pl?i=${id}&ct=${domInteractiveTime}&rt=${pageDownloadTime}&pt=${pageLoadTime}&p=${pageUrl}&c=${channel}&t=${type}&s=${section}&_t=amp&_r=${random}\",\"ping\":\"${base}/u?i=${id}&u=${clientId(_lp4_u)}&p=${pageUrl}&uActive=true&isPing=yes&c=${channel}&t=${type}&s=${section}&_t=amp&_r=${random}\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"},\"pageload\":{\"on\":\"visible\",\"request\":\"pageload\"},\"ping\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":30,\"maxTimerLength\":7200},\"request\":\"ping\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.LINKPULSE_CONFIG = LINKPULSE_CONFIG;

},{"../../../../src/json":122}],58:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.LOTAME_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var LOTAME_CONFIG = "{\"requests\":{\"pageview\":\"https://bcp.crwdcntrl.net/amp?c=${account}&pv=y\"},\"triggers\":{\"track pageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.LOTAME_CONFIG = LOTAME_CONFIG;

},{"../../../../src/json":122}],59:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MARINSOFTWARE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var MARINSOFTWARE_CONFIG = "{\"requests\":{\"base\":\"https://tracker.marinsm.com/tp\",\"baseParams\":\"cid=${trackerId}&ampVersion=${ampVersion}&ds=AMP&ref=${externalReferrer}&page=${sourceUrl}&uuid=${clientId(marin_amp_id)}&rnd=${random}\",\"pageView\":\"${base}?${baseParams}&act=1\",\"conversion\":\"${base}?${baseParams}&act=2&trans=UTM:I|${orderId}|${marinConversionType}|${productName}|${category}|${price}|${quantity}\"},\"transport\":{\"beacon\":true,\"xhrpost\":false,\"image\":true}}";
exports.MARINSOFTWARE_CONFIG = MARINSOFTWARE_CONFIG;

},{"../../../../src/json":122}],60:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MEDIAMETRIE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var MEDIAMETRIE_CONFIG = "{\"requests\":{\"host\":\"https://prof.estat.com/m/web\",\"pageview\":\"${host}/${serial}?c=${level1}&dom=${ampdocUrl}&enc=${documentCharset}&l3=${level3}&l4=${level4}&n=${random}&p=${level2}&r=${documentReferrer}&sch=${screenHeight}&scw=${screenWidth}&tn=amp&v=1&vh=${availableScreenHeight}&vw=${availableScreenWidth}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.MEDIAMETRIE_CONFIG = MEDIAMETRIE_CONFIG;

},{"../../../../src/json":122}],61:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MEDIARITHMICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var MEDIARITHMICS_CONFIG = "{\"vars\":{\"domain\":\"events.mediarithmics.com\",\"url\":\"SOURCE_URL\",\"event_name\":\"$page_view\",\"referrer\":\"DOCUMENT_REFERRER\"},\"requests\":{\"host\":\"https://${domain}\",\"pageview\":\"${host}/v1/visits/pixel?$site_token=${site_token}&$url=${url}&$ev=${event_name}&$referrer=${referrer}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.MEDIARITHMICS_CONFIG = MEDIARITHMICS_CONFIG;

},{"../../../../src/json":122}],62:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MEDIATOR_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var MEDIATOR_CONFIG = "{\"requests\":{\"host\":\"//collector.mediator.media/script/${mediator_id}/amp/\",\"renderstart\":\"${host}init/?url=${canonicalUrl}\",\"prefix\":\"${host}register/?url=${canonicalUrl}&ref=${documentReferrer}&\",\"suffix\":\"vh=${viewportHeight}&sh=${scrollHeight}&st=${scrollTop}\",\"pageview\":\"${prefix}e=v\",\"timer\":\"${prefix}e=t&${suffix}\",\"s0\":\"${prefix}e=s0\",\"s1\":\"${prefix}e=s1\",\"s2\":\"${prefix}e=s2\",\"s3\":\"${prefix}e=s3\"},\"vars\":{\"mediator_id\":\"\"},\"triggers\":{\"renderStart\":{\"on\":\"render-start\",\"request\":\"renderstart\"},\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"},\"scrollPing0\":{\"on\":\"scroll\",\"scrollSpec\":{\"verticalBoundaries\":[5]},\"request\":\"s0\"},\"scrollPing1\":{\"on\":\"scroll\",\"scrollSpec\":{\"verticalBoundaries\":[35]},\"request\":\"s1\"},\"scrollPing2\":{\"on\":\"scroll\",\"scrollSpec\":{\"verticalBoundaries\":[65]},\"request\":\"s2\"},\"scrollPing3\":{\"on\":\"scroll\",\"scrollSpec\":{\"verticalBoundaries\":[95]},\"request\":\"s3\"},\"pageTimer\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":5,\"maxTimerLength\":600,\"immediate\":false},\"request\":\"timer\"}}}";
exports.MEDIATOR_CONFIG = MEDIATOR_CONFIG;

},{"../../../../src/json":122}],63:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.METRIKA_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var METRIKA_CONFIG = "{\"transport\":{\"beacon\":true,\"xhrpost\":true,\"image\":false},\"requests\":{\"pageview\":\"${_watch}?browser-info=${_brInfo}&${_siteInfo}&${_suffix}\",\"notBounce\":\"${_watch}?browser-info=ar%3A1%3Anb%3A1%3A${_brInfo}&${_suffix}\",\"externalLink\":\"${_watch}?browser-info=ln%3A1%3A${_brInfo}&${_suffix}\",\"reachGoal\":\"${_watch}?browser-info=ar%3A1%3A${_brInfo}&${_siteInfo}&${_goalSuffix}\",\"_domain\":\"https://mc.yandex.ru\",\"_watch\":\"${_domain}/watch/${counterId}\",\"_suffix\":\"page-url=${sourceUrl}&page-ref=${documentReferrer}\",\"_goalSuffix\":\"page-url=goal%3A%2F%2F${sourceHost}%2F${goalId}&page-ref=${sourceUrl}\",\"_techInfo\":\"amp%3A1%3Az%3A${timezone}%3Ai%3A${timestamp}%3Arn%3A${random}%3Ala%3A${browserLanguage}%3Aen%3A${documentCharset}%3Arqn%3A${requestCount}%3As%3A${screenWidth}x${screenHeight}x${screenColorDepth}%3Aw%3A${availableScreenWidth}x${availableScreenHeight}%3Ads%3A${_timings}%3Auid%3A${clientId(_ym_uid)}%3Apvid%3A${pageViewId}\",\"_timings\":\"${domainLookupTime}%2C${tcpConnectTime}%2C${serverResponseTime}%2C${pageDownloadTime}%2C${redirectTime}%2C${navTiming(redirectStart,redirectEnd)}%2C${navRedirectCount}%2C${navTiming(domLoading,domInteractive)}%2C${navTiming(domContentLoadedEventStart,domContentLoadedEventEnd)}%2C${navTiming(navigationStart,domComplete)}%2C${pageLoadTime}%2C${navTiming(loadEventStart,loadEventEnd)}%2C${contentLoadTime}\",\"_brInfo\":\"${_techInfo}%3A${_title}\",\"_title\":\"t%3A${title}\",\"_siteInfo\":\"site-info=${yaParams}\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.METRIKA_CONFIG = METRIKA_CONFIG;

},{"../../../../src/json":122}],64:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MOAT_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var load = "\"{\\\"type\\\":\\\"load\\\",\\\"pcode\\\":\\\"${pcode}\\\",\\\"l0t\\\":\\\"${l0t}\\\",\\\"acctType\\\":\\\"${acctType}\\\",\\\"adType\\\":\\\"${adType}\\\",\\\"qs\\\":\\\"${qs}\\\",\\\"element\\\":{\\\"src\\\":\\\"${htmlAttr(img,src,width)}\\\",\\\"viewer\\\":\\\"${viewer}\\\"},\\\"document\\\":{\\\"AMPDocumentHostname\\\":\\\"${ampdocHostname}\\\",\\\"AMPDocumentURL\\\":\\\"${ampdocUrl}\\\",\\\"canonicalHost\\\":\\\"${canonicalHost}\\\",\\\"canonicalHostname\\\":\\\"${canonicalHostname}\\\",\\\"canonicalPath\\\":\\\"${canonicalPath}\\\",\\\"canonicalURL\\\":\\\"${canonicalUrl}\\\",\\\"documentCharset\\\":\\\"${documentCharset}\\\",\\\"documentReferrer\\\":\\\"${documentReferrer}\\\",\\\"externalReferrer\\\":\\\"${externalReferrer}\\\",\\\"sourceURL\\\":\\\"${sourceUrl}\\\",\\\"sourceHost\\\":\\\"${sourceHost}\\\",\\\"sourceHostname\\\":\\\"${sourceHostname}\\\",\\\"sourcePath\\\":\\\"${sourcePath}\\\",\\\"title\\\":\\\"${title}\\\",\\\"viewer\\\":\\\"${viewer}\\\"},\\\"device\\\":{\\\"availableScreenHeight\\\":\\\"${availableScreenHeight}\\\",\\\"availableScreenWidth\\\":\\\"${availableScreenWidth}\\\",\\\"browserLanguage\\\":\\\"${browserLanguage}\\\",\\\"screenColorDepth\\\":\\\"${screenColorDepth}\\\",\\\"screenHeight\\\":\\\"${screenHeight}\\\",\\\"screenWidth\\\":\\\"${screenWidth}\\\",\\\"scrollHeight\\\":\\\"${scrollHeight}\\\",\\\"scrollWidth\\\":\\\"${scrollWidth}\\\",\\\"scrollLeft\\\":\\\"${scrollLeft}\\\",\\\"scrollTop\\\":\\\"${scrollTop}\\\",\\\"timezone\\\":\\\"${timezone}\\\",\\\"userAgent\\\":\\\"${userAgent}\\\",\\\"viewportHeight\\\":\\\"${viewportHeight}\\\",\\\"viewportWidth\\\":\\\"${viewportWidth}\\\"},\\\"requestCount\\\":\\\"${requestCount}\\\",\\\"timeStamp\\\":\\\"${timestamp}\\\"}\"";
var unload = "\"{\\\"type\\\":\\\"unload\\\",\\\"pcode\\\":\\\"${pcode}\\\",\\\"l0t\\\":\\\"${l0t}\\\",\\\"requestCount\\\":\\\"${requestCount}\\\",\\\"timeStamp\\\":\\\"${timestamp}\\\"}\"";
var click = "\"{\\\"type\\\":\\\"click\\\",\\\"pcode\\\":\\\"${pcode}\\\",\\\"l0t\\\":\\\"${l0t}\\\",\\\"requestCount\\\":\\\"${requestCount}\\\",\\\"timeStamp\\\":\\\"${timestamp}\\\"}\"";
var viewability = "\"{\\\"type\\\":\\\"viewability\\\",\\\"pcode\\\":\\\"${pcode}\\\",\\\"l0t\\\":\\\"${l0t}\\\",\\\"backgroundState\\\":\\\"${backgroundState}\\\",\\\"intersectionRect\\\":\\\"${intersectionRect}\\\",\\\"intersectionRatio\\\":\\\"${intersectionRatio}\\\",\\\"maxVisiblePercentage\\\":\\\"${maxVisiblePercentage}\\\",\\\"minVisiblePercentage\\\":\\\"${minVisiblePercentage}\\\",\\\"x\\\":\\\"${elementX}\\\",\\\"y\\\":\\\"${elementY}\\\",\\\"height\\\":\\\"${elementHeight}\\\",\\\"width\\\":\\\"${elementWidth}\\\",\\\"viewportHeight\\\":\\\"${viewportHeight}\\\",\\\"viewportWidth\\\":\\\"${viewportWidth}\\\",\\\"opacity\\\":\\\"${opacity}\\\",\\\"timeStamp\\\":\\\"${timestamp}\\\",\\\"requestCount\\\":\\\"${requestCount}\\\"}\"";
var iframe = "\"{\\\"type\\\":\\\"iframe\\\",\\\"pcode\\\":\\\"${pcode}\\\",\\\"height\\\":\\\"${elementHeight}\\\",\\\"width\\\":\\\"${elementWidth}\\\",\\\"x\\\":\\\"${elementX}\\\",\\\"y\\\":\\\"${elementY}\\\",\\\"requestCount\\\":\\\"${requestCount}\\\"}\"";
var MOAT_CONFIG = "{\"vars\":{\"element\":\":root\"},\"requests\":{\"load\":" + load + ",\"unload\":" + unload + ",\"click\":" + click + ",\"viewability\":" + viewability + ",\"iframe\":" + iframe + "},\"triggers\":{\"load\":{\"on\":\"ini-load\",\"request\":\"load\"},\"unload\":{\"on\":\"ad-refresh\",\"selector\":\"${element}\",\"request\":\"unload\"},\"click\":{\"on\":\"click\",\"selector\":\"${element}\",\"request\":\"click\"},\"viewability\":{\"on\":\"visible\",\"selector\":\"${element}\",\"request\":\"viewability\",\"visibilitySpec\":{\"repeat\":true,\"visiblePercentageThresholds\":[[0,0],[0,5],[5,10],[10,15],[15,20],[20,25],[25,30],[30,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70],[70,75],[75,80],[80,85],[85,90],[90,95],[95,100],[100,100]]}},\"iframe\":{\"on\":\"visible\",\"selector\":\":root\",\"request\":\"iframe\",\"visibilitySpec\":{\"repeat\":true,\"visiblePercentageThresholds\":[[0,0]]}}}}";
exports.MOAT_CONFIG = MOAT_CONFIG;

},{"../../../../src/json":122}],65:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MOBIFY_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var MOBIFY_CONFIG = "{\"vars\":{\"projectSlug\":\"mobify-project-id\",\"templateName\":\"page-type\"},\"requests\":{\"_host\":\"https://engagement-collector.mobify.net\",\"_dimensions\":\"%22platform%22%3a%22AMP%22%2c%22client_id%22%3a%22${clientId(sandy-client-id)}%22%2c%22title%22%3a%22${title}%22%2c%22location%22%3a%22${sourceUrl}%22%2c%22page%22%3a%22${sourcePath}%22%2c%22src_location%22%3a%22${ampdocUrl}%22%2c%22referrer%22%3a%22${documentReferrer}%22%2c%22templateName%22%3a%22${templateName}%22\",\"_basePrefix\":\"${_host}/s.gif?slug=${projectSlug}&timestamp_local=${timestamp}&channel=web&dimensions=%7b${_dimensions}%7d\",\"ampstart\":\"${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c%22action%22%3a%22ampStart%22%2c%22value%22%3a${navTiming(navigationStart,domLoading)}%7d\",\"pageview\":\"${_basePrefix}&data=%7b%22action%22%3a%22pageview%22%7d\",\"pageload\":\"${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c%22action%22%3a%22load%22%2c%22value%22%3a${pageLoadTime}%7d\",\"pagedcl\":\"${_basePrefix}&data=%7b%22category%22%3a%22timing%22%2c%22action%22%3a%22DOMContentLoaded%22%2c%22value%22%3a${contentLoadTime}%7d\"},\"triggers\":{\"triggerName\":{\"on\":\"visible\",\"request\":[\"ampstart\",\"pageload\",\"pagedcl\"]},\"pageview\":{\"on\":\"ini-load\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":true,\"xhrpost\":false,\"image\":true}}";
exports.MOBIFY_CONFIG = MOBIFY_CONFIG;

},{"../../../../src/json":122}],66:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MPARTICLE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var MPARTICLE_CONFIG = "{\"vars\":{\"eventType\":\"Unknown\",\"debug\":false,\"amp_clientId\":\"CLIENT_ID(mparticle_amp_id)\"},\"requests\":{\"host\":\"https://pixels.mparticle.com\",\"endpointPath\":\"/v1/${apiKey}/Pixel\",\"baseParams\":\"et=${eventType}&amp_id=${amp_clientId}&attrs_k=${eventAttributes_Keys}&attrs_v=${eventAttributes_Values}&ua_k=${userAttributes_Keys}&ua_v=${userAttributes_Values}&ui_t=${userIdentities_Types}&ui_v=${userIdentities_Values}&flags_k=${customFlags_Keys}&flags_v=${customFlags_Values}&ct=${timestamp}&dbg=${debug}&lc=${location}&av=${appVersion}\",\"pageview\":\"${host}${endpointPath}?dt=ScreenView&n=${pageName}&hn=${ampdocUrl}&ttl=${title}&path=${canonicalPath}&${baseParams}\",\"event\":\"${host}${endpointPath}?dt=AppEvent&n=${eventName}&${baseParams}\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.MPARTICLE_CONFIG = MPARTICLE_CONFIG;

},{"../../../../src/json":122}],67:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.MPULSE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var MPULSE_CONFIG = "{\"requests\":{\"onvisible\":\"https://${beacon_url}?h.d=${h.d}&h.key=${h.key}&h.t=${h.t}&h.cr=${h.cr}&rt.start=navigation&rt.si=${clientId(amp_mpulse)}&rt.ss=${timestamp}&rt.end=${timestamp}&t_resp=${navTiming(navigationStart,responseStart)}&t_page=${navTiming(responseStart,loadEventStart)}&t_done=${navTiming(navigationStart,loadEventStart)}&nt_nav_type=${navType}&nt_red_cnt=${navRedirectCount}&nt_nav_st=${navTiming(navigationStart)}&nt_red_st=${navTiming(redirectStart)}&nt_red_end=${navTiming(redirectEnd)}&nt_fet_st=${navTiming(fetchStart)}&nt_dns_st=${navTiming(domainLookupStart)}&nt_dns_end=${navTiming(domainLookupEnd)}&nt_con_st=${navTiming(connectStart)}&nt_ssl_st=${navTiming(secureConnectionStart)}&nt_con_end=${navTiming(connectEnd)}&nt_req_st=${navTiming(requestStart)}&nt_res_st=${navTiming(responseStart)}&nt_unload_st=${navTiming(unloadEventStart)}&nt_unload_end=${navTiming(unloadEventEnd)}&nt_domloading=${navTiming(domLoading)}&nt_res_end=${navTiming(responseEnd)}&nt_domint=${navTiming(domInteractive)}&nt_domcontloaded_st=${navTiming(domContentLoadedEventStart)}&nt_domcontloaded_end=${navTiming(domContentLoadedEventEnd)}&nt_domcomp=${navTiming(domComplete)}&nt_load_st=${navTiming(loadEventStart)}&nt_load_end=${navTiming(loadEventEnd)}&v=1&http.initiator=amp&u=${sourceUrl}&amp.u=${ampdocUrl}&r2=${documentReferrer}&scr.xy=${screenWidth}x${screenHeight}\"},\"triggers\":{\"onvisible\":{\"on\":\"visible\",\"request\":\"onvisible\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"extraUrlParamsReplaceMap\":{\"ab_test\":\"h.ab\",\"page_group\":\"h.pg\",\"custom_dimension.\":\"cdim.\",\"custom_metric.\":\"cmet.\"}}";
exports.MPULSE_CONFIG = MPULSE_CONFIG;

},{"../../../../src/json":122}],68:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.NAVEGG_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var NAVEGG_CONFIG = "{\"requests\":{\"pageview\":\"https://amp.navdmp.com/amp?aid=${clientId(navegg_id)}&url=${canonicalUrl}&ref=${documentReferrer}&tit=${title}&lan=${browserLanguage}&acc=${account}&v=7\"},\"triggers\":{\"trackpageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":{\"suppressWarnings\":true}}}";
exports.NAVEGG_CONFIG = NAVEGG_CONFIG;

},{"../../../../src/json":122}],69:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.NEWRELIC_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var NEWRELIC_CONFIG = "{\"requests\":{\"pageview\":\"https://${beacon}/amp?appId=${appId}&licenseKey=${licenseKey}&ampUrl=${ampdocUrl}&canonicalUrl=${canonicalUrl}&timeToDomContentLoadedEventEnd=${navTiming(domContentLoadedEventEnd)}&timeToDomInteractive=${navTiming(domInteractive)}&timeToDomComplete=${navTiming(domComplete)}&timeToDomLoading=${navTiming(domLoading)}&timeToResponseStart=${navTiming(responseStart)}&timeToResponseEnd=${navTiming(responseEnd)}&timeToLoadEventStart=${navTiming(loadEventStart)}&timeToLoadEventEnd=${navTiming(loadEventEnd)}&timeToConnectStart=${navTiming(connectStart)}&timeToConnectEnd=${navTiming(connectEnd)}&timeToFetchStart=${navTiming(fetchStart)}&timeToRequestStart=${navTiming(requestStart)}&timeToUnloadEventStart=${navTiming(unloadEventStart)}&timeToUnloadEventEnd=${navTiming(unloadEventEnd)}&timeToDomainLookupStart=${navTiming(domainLookupStart)}&timeToDomainLookupEnd=${navTiming(domainLookupEnd)}&timeToRedirectStart=${navTiming(redirectStart)}&timeToRedirectEnd=${navTiming(redirectEnd)}&timeToSecureConnection=${navTiming(secureConnectionStart)}&timestamp=${timestamp}&ampVersion=${ampVersion}&pageLoadTime=${pageLoadTime}\"},\"vars\":{\"beacon\":\"bam.nr-data.net\",\"appId\":[],\"licenseKey\":\"\"},\"triggers\":{\"trackPageview\":{\"on\":\"ini-load\",\"request\":\"pageview\"}}}";
exports.NEWRELIC_CONFIG = NEWRELIC_CONFIG;

},{"../../../../src/json":122}],70:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.NIELSEN_MARKETING_CLOUD_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var NIELSEN_MARKETING_CLOUD_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"vars\":{\"pubId\":\"\",\"siteId\":\"\"},\"requests\":{\"host\":\"loadeu.exelator.com\",\"pathPrefix\":\"load/\",\"trackurl\":\"https://${host}/${pathPrefix}?p=${pubId}&g=${siteId}&j=0\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"trackurl\"}}}";
exports.NIELSEN_MARKETING_CLOUD_CONFIG = NIELSEN_MARKETING_CLOUD_CONFIG;

},{"../../../../src/json":122}],71:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.NIELSEN_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var NIELSEN_CONFIG = "{\"vars\":{\"sessionId\":\"CLIENT_ID(imrworldwide)\",\"prefix\":\"\"},\"requests\":{\"session\":\"https://${prefix}uaid-linkage.imrworldwide.com/cgi-bin/gn?prd=session&c13=asid,P${apid}&sessionId=${sessionId}_${pageViewId}&pingtype=4&enc=false&c61=createtm,${timestamp}&rnd=${random}\",\"cloudapi\":\"https://${prefix}cloudapi.imrworldwide.com/nmapi/v2/${apid}/${sessionId}_${pageViewId}/a?b=%7B%22devInfo%22%3A%7B%22devId%22%3A%22${sessionId}_${pageViewId}%22%2C%22apn%22%3A%22${apn}%22%2C%22apv%22%3A%22${apv}%22%2C%22apid%22%3A%22${apid}%22%7D%2C%22metadata%22%3A%7B%22static%22%3A%7B%22type%22%3A%22static%22%2C%22section%22%3A%22${section}%22%2C%22assetid%22%3A%22${pageViewId}%22%2C%22segA%22%3A%22${segA}%22%2C%22segB%22%3A%22${segB}%22%2C%22segC%22%3A%22${segC}%22%2C%22adModel%22%3A%220%22%2C%22dataSrc%22%3A%22cms%22%7D%2C%22content%22%3A%7B%7D%2C%22ad%22%3A%7B%7D%7D%2C%22event%22%3A%22playhead%22%2C%22position%22%3A%22${timestamp}%22%2C%22data%22%3A%7B%22hidden%22%3A%22${backgroundState}%22%2C%22blur%22%3A%22${backgroundState}%22%2C%22position%22%3A%22${timestamp}%22%7D%2C%22type%22%3A%22static%22%2C%22utc%22%3A%22${timestamp}%22%2C%22index%22%3A%22${requestCount}%22%2C%22pageURL%22%3A%22${canonicalUrl}%22%7D\"},\"triggers\":{\"visible\":{\"on\":\"visible\",\"request\":[\"session\",\"cloudapi\"]},\"hidden\":{\"on\":\"hidden\",\"request\":\"cloudapi\"},\"duration\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":10,\"maxTimerLength\":86400,\"immediate\":false},\"request\":\"cloudapi\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true,\"referrerPolicy\":\"no-referrer\"}}";
exports.NIELSEN_CONFIG = NIELSEN_CONFIG;

},{"../../../../src/json":122}],72:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.OEWA_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var OEWA_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"requests\":{\"pageview\":\"${url}?s=${s}&amp=1&cp=${cp}&host=${canonicalHost}&path=${canonicalPath}\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.OEWA_CONFIG = OEWA_CONFIG;

},{"../../../../src/json":122}],73:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.OEWADIRECT_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var OEWADIRECT_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"requests\":{\"pageview\":\"https://${s}.oewabox.at/j0=,,,r=${canonicalUrl};+,amp=1+cp=${cp}+ssl=1+hn=${canonicalHost};;;?lt=${pageViewId}&x=${screenWidth}x${screenHeight}x24&c=CLIENT_ID(oewa)\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.OEWADIRECT_CONFIG = OEWADIRECT_CONFIG;

},{"../../../../src/json":122}],74:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ORACLEINFINITYANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var ORACLEINFINITYANALYTICS_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"requests\":{\"host\":\"https://dc.oracleinfinity.io/${guid}/dcs.gif?\",\"baseUrl\":\"dcssip=${dcssip}&dcsuri=${dcsuri}\",\"baseRef\":\"&dcsref=${documentReferrer}\",\"baseEs\":\"&WT.es=${sourceHost}${sourcePath}\",\"baseTi\":\"&WT.ti=${ti}&dcsdat=${timestamp}\",\"basePrefix\":\"${baseUrl}${baseTi}${baseRef}${baseEs}\",\"screenBs\":\"&WT.bs=${availableScreenWidth}x${availableScreenHeight}\",\"screenSr\":\"&WT.sr=${screenWidth}x${screenHeight}\",\"screenDc\":\"&WT.cd=${screenColorDepth}\",\"screenMeasures\":\"${screenBs}${screenSr}${screenDc}\",\"browserUl\":\"&WT.ul=${browserLanguage}\",\"browserLe\":\"&WT.le=${documentCharset}\",\"browserMeasures\":\"${browserUl}${browserLe}&WT.js=Yes\",\"sessCof\":\"&WT.co_f=${clientId(WT_AMP)}\",\"sessVer\":\"&ora.tv_amp=1.0.0&ora.amp_ver=${ampVersion}\",\"sessionization\":\"${sessCof}${sessVer}&dcscfg=3\",\"baseP1\":\"${host}${basePrefix}\",\"baseP2\":\"${screenMeasures}${browserMeasures}${sessionization}\",\"baseDl\":\"&WT.dl=${dl}\",\"pageview\":\"${baseP1}${baseP2}${baseDl}\",\"event\":\"${baseP1}${baseP2}${baseDl}\",\"dlPdf\":\"a[href$=\\\".pdf\\\"]\",\"dlXls\":\",a[href$=\\\".xls\\\"]\",\"dlPpt\":\",a[href$=\\\".ppt\\\"]\",\"dlZip\":\",a[href$=\\\".zip\\\"]\",\"dlTxt\":\",a[href$=\\\".txt\\\"]\",\"dlRtf\":\",a[href$=\\\".rtf\\\"]\",\"dlXml\":\",a[href$=\\\".xml\\\"]\",\"downLoad\":\"${dlPdf}${dlXls}${dlPpt}${dlZip}${dlTxt}${dlRtf}${dlXml}\"},\"vars\":{\"dcssip\":\"${sourceHost}\",\"dcsuri\":\"${sourcePath}\",\"dl\":\"0\",\"ti\":\"${title}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"},\"trackAnchorClicks\":{\"on\":\"click\",\"selector\":\"a\",\"request\":\"event\",\"vars\":{\"dl\":\"99\",\"ti\":\"Link Click\"}}},\"trackDownloadClicks\":{\"on\":\"click\",\"selector\":\"${downLoad}\",\"request\":\"event\",\"vars\":{\"dl\":\"20\",\"ti\":\"Download Click\"}}}";
exports.ORACLEINFINITYANALYTICS_CONFIG = ORACLEINFINITYANALYTICS_CONFIG;

},{"../../../../src/json":122}],75:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.PARSELY_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var PARSELY_CONFIG = "{\"requests\":{\"host\":\"https://srv.pixel.parsely.com\",\"basePrefix\":\"${host}/plogger/?rand=${timestamp}&idsite=${apikey}&url=${ampdocUrl}&urlref=${documentReferrer}&screen=${screenWidth}x${screenHeight}%7C${availableScreenWidth}x${availableScreenHeight}%7C${screenColorDepth}&title=${title}&date=${timestamp}&ampid=${clientId(_parsely_visitor)}\",\"pageview\":\"${basePrefix}&action=pageview&metadata={\\\"canonical_url\\\":\\\"${canonicalUrl}\\\"}\",\"heartbeat\":\"${basePrefix}&action=heartbeat&tt=${totalEngagedTime}&inc=${incrementalEngagedTime(parsely-js)}\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"},\"defaultHeartbeat\":{\"on\":\"timer\",\"enabled\":\"${incrementalEngagedTime(parsely-js,false)}\",\"timerSpec\":{\"interval\":10,\"maxTimerLength\":7200},\"request\":\"heartbeat\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.PARSELY_CONFIG = PARSELY_CONFIG;

},{"../../../../src/json":122}],76:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.PERMUTIVE_CONFIG = void 0;

var _json = require("../../../../src/json");

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var PERMUTIVE_CONFIG = "{\"vars\":{\"identity\":\"${clientId(_ga)}\"},\"requests\":{\"track\":\"https://${namespace}.amp.permutive.com/track?k=${key}&i=${identity}&it=amp\",\"pageview\":\"${track}&e=Pageview&_ep_isp_info=%24ip_isp_info&_ep_geo_info=%24ip_geo_info\",\"engagement\":\"${track}&e=PageviewEngagement&_ep_engaged_time=5\",\"completion\":\"${track}&e=PageviewEngagement&_ep_completion=0.25\",\"custom\":\"${track}&e=${event}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"},\"trackEngagement\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":5,\"maxTimerLength\":600,\"immediate\":false},\"request\":\"engagement\"},\"trackCompletion\":{\"on\":\"scroll\",\"scrollSpec\":{\"verticalBoundaries\":[25,50,75,100]},\"request\":\"completion\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"extraUrlParams\":{\"properties.client.type\":\"amp\",\"properties.client.title\":\"${title}\",\"properties.client.domain\":\"${canonicalHost}\",\"properties.client.url\":\"${canonicalUrl}\",\"properties.client.referrer\":\"${documentReferrer}\",\"properties.client.user_agent\":\"${userAgent}\"},\"extraUrlParamsReplaceMap\":{\"properties.\":\"_ep_\"}}";
exports.PERMUTIVE_CONFIG = PERMUTIVE_CONFIG;

},{"../../../../src/json":122}],77:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.PISTATS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var PISTATS_CONFIG = "{\"requests\":{\"host\":\"https://events.pi-stats.com\",\"basePrefix\":\"${host}/eventsamp/?e=PageLoad&pid=${property}&url=${ampdocUrl}&cnt=${cntId}&lang=${language}&ref=${documentReferrer}&id=${clientId(piStatsDEVICEID)}&ua=${userAgent}&ctype=web&blang=${browserLanguage}&v=2.0&dist=Javascript\",\"pageview\":\"${basePrefix}&eventtype=pageview\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.PISTATS_CONFIG = PISTATS_CONFIG;

},{"../../../../src/json":122}],78:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.PIANO_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var PIANO_CONFIG = "{\"requests\":{\"host\":\"https://api-v3.tinypass.com\",\"basePrefix\":\"/api/v3\",\"baseSuffix\":\"&pageview_id=${pageViewId}&rand=${random}&amp_client_id=${clientId}&aid=${aid}\",\"pageview\":\"${host}${basePrefix}/page/track?url=${canonicalUrl}&referer=${documentReferrer}&content_created=${contentCreated}&content_author=${contentAuthor}&content_section=${contentSection}&timezone_offset=${timezone}&tags=${tags}&amp_url=${ampdocUrl}&screen=${screenWidth}x${screenHeight}${baseSuffix}\"}}";
exports.PIANO_CONFIG = PIANO_CONFIG;

},{"../../../../src/json":122}],79:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.PINPOLL_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var PINPOLL_CONFIG = "{\"requests\":{\"pageview\":\"${protocol}://${host}/${version}?url=${sourceUrl}&sourceHost=${sourceHost}&sourceHostname=${sourceHostname}&sourcePath=${sourcePath}&canonicalUrl=${canonicalUrl}&platform=AMP&title=${title}&referrer=${documentReferrer}&screenHeight=${screenHeight}&screenWidth=${screenWidth}&screenColorDepth=${screenColorDepth}&ua=${userAgent}&clientId=${clientId(pinpoll)}\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"vars\":{\"version\":\"v1\",\"protocol\":\"https\",\"host\":\"pa.pinpoll.com\"}}";
exports.PINPOLL_CONFIG = PINPOLL_CONFIG;

},{"../../../../src/json":122}],80:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.PRESSBOARD_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var PRESSBOARD_CONFIG = "{\"vars\":{\"mediaId\":\"\",\"campaignId\":\"\",\"storyRequestId\":\"\",\"geoNameId\":\"\",\"country\":\"\",\"region\":\"\",\"city\":\"\",\"dbInstance\":\"\",\"timeZoneOffset\":\"\",\"clientId\":\"CLIENT_ID(_pressboardmedia)\"},\"requests\":{\"host\":\"https://adserver.pressboard.ca\",\"common_params\":\"&amp=1&url=${canonicalUrl}&referrer=${documentReferrer}&ts=${timestamp}&ua=${userAgent}&rand=${random}&uid=${clientId}&mid=${mediaId}&cid=${campaignId}&sid=${storyRequestId}&geoid=${geoNameId}&cn=${country}&rg=${region}&ct=${city}&dbi=${dbInstance}&tz=${timeZoneOffset}\",\"conversion_params\":\"&hbt=${requestCount}&pvid=${pageViewId}&asurl=${sourceUrl}&ash=${scrollHeight}&asnh=${screenHeight}&aasnh=${availableScreenHeight}&avh=${viewportHeight}&ast=${scrollTop}&atet=${totalEngagedTime}\",\"conversion\":\"${host}/track/attention-amp?${common_params}${conversion_params}\"},\"triggers\":{\"pageTimer\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":1,\"startSpec\":{\"on\":\"visible\"},\"stopSpec\":{\"on\":\"hidden\"}},\"request\":\"conversion\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.PRESSBOARD_CONFIG = PRESSBOARD_CONFIG;

},{"../../../../src/json":122}],81:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.QUANTCAST_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var QUANTCAST_CONFIG = "{\"vars\":{\"labels\":\"\"},\"requests\":{\"host\":\"https://pixel.quantserve.com/pixel\",\"pageview\":\"${host};r=${random};a=${pcode};labels=${labels};fpan=;fpa=${clientId(__qca)};ns=0;ce=1;cm=;je=0;sr=${screenWidth}x${screenHeight}x${screenColorDepth};enc=n;et=${timestamp};ref=${documentReferrer};url=${canonicalUrl}\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.QUANTCAST_CONFIG = QUANTCAST_CONFIG;

},{"../../../../src/json":122}],82:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.RAKAM_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var RAKAM_CONFIG = "{\"vars\":{\"deviceId\":\"CLIENT_ID(rakam_device_id)\"},\"requests\":{\"base\":\"?api.api_key=${writeKey}&prop._platform=amp&prop._device_id=${deviceId}&prop.locale=${browserLanguage}&prop.path=${canonicalPath}&prop.url=${canonicalUrl}&prop.color_depth=${screenColorDepth}&prop._referrer=${documentReferrer}&prop.title=${title}&prop.timezone=${timezone}&prop._time=${timestamp}&prop.resolution=${screenWidth} \xD7 ${screenHeight}\",\"pageview\":\"https://${apiEndpoint}/event/pixel${base}&collection=${pageViewName}\",\"custom\":\"https://${apiEndpoint}/event/pixel${base}&collection=${collection}\"}}";
exports.RAKAM_CONFIG = RAKAM_CONFIG;

},{"../../../../src/json":122}],83:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.REPPUBLIKA_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var REPPUBLIKA_CONFIG = "{\"requests\":{\"host\":\"https://t5.mindtake.com\",\"basePrefix\":\"/tag/cid/\",\"baseSuffix\":\"Service=${service}&Category=${category}&Url=${sourceUrl}&Device=${device}&uid=${random}\",\"pageview\":\"${host}${basePrefix}${code}/track.gif?${baseSuffix}\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.REPPUBLIKA_CONFIG = REPPUBLIKA_CONFIG;

},{"../../../../src/json":122}],84:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.RETARGETLY_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var RETARGETLY_CONFIG = "{\"requests\":{\"host\":\"https://api.retargetly.com\",\"page\":\"${host}/api?id=${accountId}&src=${sourceId}&url=${sourceUrl}&n=${title}&ref=${documentReferrer}&ua=${userAgent}&random=${random}&bl=${browserLanguage}&source=amp\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"page\"}}}";
exports.RETARGETLY_CONFIG = RETARGETLY_CONFIG;

},{"../../../../src/json":122}],85:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.SEGMENT_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var SEGMENT_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"vars\":{\"anonymousId\":\"CLIENT_ID(AMP_ECID_GOOGLE,,_ga)\"},\"requests\":{\"host\":\"https://api.segment.io/v1/pixel\",\"base\":\"?writeKey=${writeKey}&context.library.name=amp&anonymousId=${anonymousId}&context.locale=${browserLanguage}&context.page.path=${canonicalPath}&context.page.url=${canonicalUrl}&context.page.referrer=${documentReferrer}&context.page.title=${title}&context.screen.width=${screenWidth}&context.screen.height=${screenHeight}\",\"page\":\"${host}/page${base}&name=${name}\",\"track\":\"${host}/track${base}&event=${event}\"},\"triggers\":{\"page\":{\"on\":\"visible\",\"request\":\"page\"}},\"linkers\":{\"segment\":{\"ids\":{\"s_amp_id\":\"${anonymousId}\"},\"proxyOnly\":false}},\"cookies\":{\"_ga\":{\"value\":\"LINKER_PARAM(segment, s_amp_id)\"}}}";
exports.SEGMENT_CONFIG = SEGMENT_CONFIG;

},{"../../../../src/json":122}],86:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.SHINYSTAT_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var SHINYSTAT_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"requests\":{\"base\":\"https://amp.shinystat.com/cgi-bin/shinyamp.cgi\",\"commpar\":\"AMP=1&RM=${random}&USER=${account}&PAG=${page}&HR=${sourceUrl}&REFER=${documentReferrer}&RES=${screenWidth}X${screenHeight}&COLOR=${screenColorDepth}&CID=${clientId(AMP_CID)}&PAGID=${pageViewId}&TITL=${title}&RQC=${requestCount}\",\"pagepar\":\"&VIE=${viewer}&PLT=${pageLoadTime}\",\"eventpar\":\"&SSXL=1\",\"linkpar\":\"&LINK=${outboundLink}\",\"pageview\":\"${base}?${commpar}${pagepar}\",\"event\":\"${base}?${commpar}${eventpar}\",\"link\":\"${base}?${commpar}${linkpar}\"},\"triggers\":{\"pageview\":{\"on\":\"visible\",\"request\":\"pageview\"}}}";
exports.SHINYSTAT_CONFIG = SHINYSTAT_CONFIG;

},{"../../../../src/json":122}],87:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.SIMPLEREACH_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var SIMPLEREACH_CONFIG = "{\"vars\":{\"pid\":\"\",\"published_at\":\"\",\"authors\":[],\"channels\":[],\"tags\":[]},\"requests\":{\"host\":\"https://edge.simplereach.com\",\"baseParams\":\"amp=true&pid=${pid}&title=${title}&url=${canonicalUrl}&date=${published_at}&authors=${authors}&channels=${categories}&tags=${tags}&referrer=${documentReferrer}&page_url=${sourceUrl}&user_id=${clientId(sr_amp_id)}&domain=${canonicalHost}&article_id=${article_id}&ignore_metadata=${ignore_metadata}\",\"visible\":\"${host}/n?${baseParams}\",\"timer\":\"${host}/t?${baseParams}&t=5000&e=5000\"},\"triggers\":{\"visible\":{\"on\":\"visible\",\"request\":\"visible\"},\"timer\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":5,\"maxTimerLength\":1200},\"request\":\"timer\"}}}";
exports.SIMPLEREACH_CONFIG = SIMPLEREACH_CONFIG;

},{"../../../../src/json":122}],88:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.SNOWPLOW_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var SNOWPLOW_CONFIG = "{\"vars\":{\"duid\":\"CLIENT_ID(_sp_id)\"},\"requests\":{\"aaVersion\":\"amp-0.3\",\"basePrefix\":\"https://${collectorHost}/i?url=${canonicalUrl}&page=${title}&res=${screenWidth}x${screenHeight}&stm=${timestamp}&tz=${timezoneCode}&aid=${appId}&p=web&tv=${aaVersion}&cd=${screenColorDepth}&cs=${documentCharset}&duid=${duid}&lang=${browserLanguage}&refr=${documentReferrer}&vp=${viewportWidth}x${viewportHeight}&ds=${scrollWidth}x${scrollHeight}\",\"pageView\":\"${basePrefix}&e=pv\",\"structEvent\":\"${basePrefix}&e=se&se_ca=${structEventCategory}&se_ac=${structEventAction}&se_la=${structEventLabel}&se_pr=${structEventProperty}&se_va=${structEventValue}\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.SNOWPLOW_CONFIG = SNOWPLOW_CONFIG;

},{"../../../../src/json":122}],89:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.TEAANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var TEAANALYTICS_CONFIG = "{\"vars\":{\"userUniqueId\":\"${clientId(__tea_sdk__user_unique_id)}\",\"debug\":0},\"requests\":{\"domain\":\"https://${channel}/v1/amp\",\"commonParams\":\"user.user_unique_id=${userUniqueId}&header.app_id=${app_id}&header.language=${browserLanguage}&header.screen_height=${screenHeight}&header.screen_width=${screenWidth}&header.resolution=${screenHeight}x${screenWidth}&header.tz_offset=${timezone}&header.tz_name=${timezoneCode}&header.referrer=${documentReferrer}&header.custom.user_agent=${userAgent}&event.local_time_ms=${timestamp}&event.params._staging_flag=${debug}&verbose=${debug}\",\"base\":\"${domain}?${commonParams}&rnd=${random}\",\"pageview\":\"${base}&event=predefine_pageview&event.params.url=${sourceUrl}&event.params.url_path=${sourcePath}&event.params.title=${title}\",\"event\":\"${base}\"}}";
exports.TEAANALYTICS_CONFIG = TEAANALYTICS_CONFIG;

},{"../../../../src/json":122}],90:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.TEALIUMCOLLECT_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var TEALIUMCOLLECT_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"vars\":{\"account\":\"TEALIUM_ACCOUNT\",\"profile\":\"TEALIUM_PROFILE\",\"datasource\":\"TEALIUM_DATASOURCE\",\"visitor_id\":\"CLIENT_ID(AMP_ECID_GOOGLE,,_ga)\"},\"requests\":{\"host\":\"https://collect.tealiumiq.com\",\"base\":\"${host}/event/?${tealium}&${dom1}&${dom2}&${datetime}&tealium_event=${tealium_event}&amp_version=${ampVersion}&amp_request_count=${requestCount}\",\"tealium\":\"tealium_account=${account}&tealium_profile=${profile}&tealium_datasource=${datasource}&tealium_visitor_id=${visitor_id}\",\"dom1\":\"url=${sourceUrl}&ampdoc_url=${ampdocUrl}&domain=${sourceHost}&pathname=${sourcePath}&amp_hostname=${ampdocHostname}&canonical_hostname=${canonicalHostname}\",\"dom2\":\"title=${title}&viewport_width=${availableScreenWidth}&viewport_height=${availableScreenHeight}\",\"datetime\":\"timestamp=${timestamp}&tz=${timezone}&lang=${browserLanguage}\",\"pageview\":\"${base}&referrer=${documentReferrer}&screen_size=${screenWidth}x${screenHeight}&content_load_ms=${contentLoadTime}&page_view_id=${pageViewId}\",\"event\":\"${base}&scroll_y=${scrollTop}&scroll_x=${scrollLeft}\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\",\"vars\":{\"tealium_event\":\"screen_view\"}}}}";
exports.TEALIUMCOLLECT_CONFIG = TEALIUMCOLLECT_CONFIG;

},{"../../../../src/json":122}],91:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.TOP100_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var TOP100_CONFIG = "{\"vars\":{\"pid\":\"\",\"rid\":\"PAGE_VIEW_ID\",\"ruid\":\"CLIENT_ID(ruid)\",\"version\":\"1.0.0\"},\"requests\":{\"host\":\"https://kraken.rambler.ru\",\"base\":\"${host}/cnt/?pid=${pid}&rid=${rid}&v=${version}&rn=${random}&ruid=${ruid}&ct=amp\",\"pageview\":\"${base}&et=pv${_pageData}${_screenData}\",\"_screenData\":\"&sr=${screenWidth}x${screenHeight}&cd=${screenColorDepth}-bit&bs=${scrollWidth}x${scrollHeight}\",\"_pageData\":\"&pt=${title}&rf=${documentReferrer}&en=${documentCharset}&la=${browserLanguage}&tz=${timezone}\"},\"triggers\":{\"trackPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.TOP100_CONFIG = TOP100_CONFIG;

},{"../../../../src/json":122}],92:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.TOPMAILRU_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var TOPMAILRU_CONFIG = "{\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true},\"vars\":{\"url\":\"${sourceUrl}\",\"referrer\":\"${documentReferrer}\"},\"requests\":{\"pageView\":\"${_domain}/counter?${_basicMessage};title=${title}\",\"reachGoal\":\"${_domain}/tracker?${_basicMessage};title=${title};e=RG%3A${value}%2F${goal}\",\"sendEvent\":\"${_domain}/tracker?${_basicMessage};e=CE%3A${value}%2F${category}%3B${action}%3B${label}\",\"_domain\":\"https://top-fwz1.mail.ru\",\"_basicMessage\":\"js=13;id=${id};u=${url};r=${referrer};s=${screenWidth}*${screenHeight};vp=${viewportWidth}*${viewportHeight};st=${start};gender=${gender};age=${age};pid=${pid};userid=${userid};device=${device};params=${params};_=${random}\"},\"triggers\":{\"pageView\":{\"on\":\"visible\",\"request\":\"pageView\"}}}";
exports.TOPMAILRU_CONFIG = TOPMAILRU_CONFIG;

},{"../../../../src/json":122}],93:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.TREASUREDATA_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var TREASUREDATA_CONFIG = "{\"vars\":{\"host\":\"in.treasuredata.com\",\"writeKey\":\"\",\"database\":\"\",\"table\":\"events\"},\"requests\":{\"base\":\"https://${host}/postback/v3/event/${database}\",\"baseParams\":\"td_write_key=${writeKey}&td_global_id=td_global_id&td_client_id=CLIENT_ID(_td)&td_charset=DOCUMENT_CHARSET&td_language=BROWSER_LANGUAGE&td_color=SCREEN_COLOR_DEPTH&td_screen=${screenWidth}x${scrollHeight}&td_viewport=${availableScreenWidth}x${availableScreenHeight}&td_title=TITLE&td_url=SOURCE_URL&td_user_agent=USER_AGENT&td_host=SOURCE_HOST&td_path=SOURCE_PATH&td_referrer=DOCUMENT_REFERRER&td_ip=td_ip\",\"pageview\":\"${base}/${table}?${baseParams}\",\"event\":\"${base}/${table}?${baseParams}\"}}";
exports.TREASUREDATA_CONFIG = TREASUREDATA_CONFIG;

},{"../../../../src/json":122}],94:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.UMENGANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var UMENGANALYTICS_CONFIG = "{\"vars\":{\"siteid\":\"\",\"initial_view_time\":\"\",\"eventName\":\"\",\"eventProps\":\"\"},\"requests\":{\"base\":\"https://b.cnzz.com/utrack?&_siteid=${siteid}&_distinct_id=${clientId(umeng_amp_id)}&_t=${timestamp}&_s=google&_b=web&_r=${externalReferrer}&_h=${screenHeight}&_w=${screenWidth}&_ivt=${initial_view_time}\",\"pageview\":\"${base}&_ename=$w_page_view&_eprops=${eventProps}\",\"event\":\"${base}&_ename=${eventName}&_eprops=${eventProps}\"},\"triggers\":{\"defaultPageview\":{\"on\":\"visible\",\"request\":\"pageview\"}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.UMENGANALYTICS_CONFIG = UMENGANALYTICS_CONFIG;

},{"../../../../src/json":122}],95:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.UPSCORE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var UPSCORE_CONFIG = "{\"requests\":{\"host\":\"https://hit-pool.upscore.com/amp?\",\"basePrefix\":\"u_id=${clientId(upscore)}&hit_id=${pageViewId}&scTop=${scrollTop}&scHeight=${scrollHeight}&vHeight=${viewportHeight}&domain=${domain}&load=${domInteractiveTime}&timespent=${totalEngagedTime}\",\"initialHit\":\"author=${author}&creator=${creator}&o_id=${object_id}&o_type=${object_type}&pubdate=${pubdate}&ref=${documentReferrer}&section=${section}&url=${ampdocUrl}&agent=${userAgent}&location=${ampGeo(ISOCountry)}\",\"finalbeat\":\"${host}${basePrefix}&type=final\",\"heartbeat\":\"${host}${basePrefix}&type=pulse\",\"pageview\":\"${host}${basePrefix}&${initialHit}&type=init\"},\"triggers\":{\"initHit\":{\"on\":\"visible\",\"request\":\"pageview\"},\"pulse\":{\"on\":\"timer\",\"timerSpec\":{\"interval\":10,\"immediate\":false,\"stopSpec\":{\"on\":\"hidden\"}},\"request\":\"heartbeat\"},\"final\":{\"on\":\"hidden\",\"visibilitySpec\":{\"totalTimeMin\":5000},\"request\":\"finalbeat\"}},\"transport\":{\"beacon\":true,\"xhrpost\":true,\"image\":false}}";
exports.UPSCORE_CONFIG = UPSCORE_CONFIG;

},{"../../../../src/json":122}],96:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.VPONANALYTICS_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var VPONANALYTICS_CONFIG = "{\"vars\":{\"ctid\":\"${clientId(vpadn-ctid)}\"},\"requests\":{\"host\":\"https://tags-dmp.vpadn.com\",\"sync\":\"https://ids-dmp.vpadn.com/set?t=${timestamp}&dn=&ctid=${ctid}\",\"scroll\":\"${host}/et?t=${timestamp}&sdkn=j&sdkv=1.2.0&lk=${licence_key}&en=UTF-8&ctid=${ctid}&ev=element_interact&pl={\\\"name\\\":\\\"${category}\\\",\\\"action\\\":\\\"${action}\\\",\\\"value\\\":\\\"${documentReferrer}\\\"}\",\"event\":\"${host}/et?t=${timestamp}&sdkn=j&sdkv=1.2.0&lk=${licence_key}&en=UTF-8&ctid=${ctid}&ev=${ev_name}&pl=${payload}\",\"elementInteract\":\"${host}/et?t=${timestamp}&sdkn=j&sdkv=1.2.0&lk=${licence_key}&en=UTF-8&ctid=${ctid}&ev=element_interact&pl={\\\"name\\\":\\\"${category}\\\",\\\"action\\\":\\\"${action}\\\",\\\"value\\\":\\\"${label}\\\"}\"},\"extraUrlParams\":{\"is_amp\":\"1\",\"page_id\":\"${pageViewId}\"},\"triggers\":{\"cookieSync\":{\"on\":\"visible\",\"request\":\"sync\"},\"trackPageview\":{\"on\":\"visible\",\"request\":\"event\",\"vars\":{\"ev_name\":\"page_view\",\"payload\":\"{\\\"title\\\":\\\"${title}\\\",\\\"current\\\":\\\"${canonicalUrl}\\\",\\\"previous\\\":\\\"${documentReferrer}\\\"}\"}}},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.VPONANALYTICS_CONFIG = VPONANALYTICS_CONFIG;

},{"../../../../src/json":122}],97:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.WEBENGAGE_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var WEBENGAGE_CONFIG = "{\"requests\":{\"base\":\"https://c.${region}.webengage.com/amp?licenseCode=${licenseCode}&luid=${clientId(we_luid)}&pageUrl=${canonicalUrl}&pageTitle=${title}&referrer=${documentReferrer}&vh=${viewportHeight}&vw=${viewportWidth}&category=application\",\"wePageview\":{\"baseUrl\":\"${base}&eventName=Page Viewed\"}},\"extraUrlParams\":{\"isAmp\":1},\"triggers\":{\"wePageviewTrigger\":{\"on\":\"visible\",\"request\":\"wePageview\"}}}";
exports.WEBENGAGE_CONFIG = WEBENGAGE_CONFIG;

},{"../../../../src/json":122}],98:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.WEBTREKK_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var WEBTREKK_CONFIG = "{\"requests\":{\"trackURL\":\"https://${trackDomain}/${trackId}/wt\",\"parameterPrefix\":\"?p=432,${contentId},1,${screenWidth}x${screenHeight},${screenColorDepth},1,${timestamp},${documentReferrer},${viewportWidth}x${viewportHeight},0&tz=${timezone}&eid=${clientId(amp-wt3-eid)}&la=${browserLanguage}\",\"parameterSuffix\":\"&pu=${sourceUrl}\",\"pageParameter\":\"&cp1=${pageParameter1}&cp2=${pageParameter2}&cp3=${pageParameter3}&cp4=${pageParameter4}&cp5=${pageParameter5}&cp6=${pageParameter6}&cp7=${pageParameter7}&cp8=${pageParameter8}&cp9=${pageParameter9}&cp10=${pageParameter10}\",\"pageCategories\":\"&cg1=${pageCategory1}&cg2=${pageCategory2}&cg3=${pageCategory3}&cg4=${pageCategory4}&cg5=${pageCategory5}&cg6=${pageCategory6}&cg7=${pageCategory7}&cg8=${pageCategory8}&cg9=${pageCategory9}&cg10=${pageCategory10}\",\"pageview\":\"${trackURL}${parameterPrefix}${pageParameter}${pageCategories}${parameterSuffix}\",\"actionParameter\":\"&ck1=${actionParameter1}&ck2=${actionParameter2}&ck3=${actionParameter3}&ck4=${actionParameter4}&ck5=${actionParameter5}\",\"event\":\"${trackURL}${parameterPrefix}&ct=${actionName}${actionParameter}${parameterSuffix}\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.WEBTREKK_CONFIG = WEBTREKK_CONFIG;

},{"../../../../src/json":122}],99:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.WEBTREKK_V2_CONFIG = void 0;

var _json = require("../../../../src/json");

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
var WEBTREKK_V2_CONFIG = "{\"vars\":{\"actionName\":\"webtrekk_ignore\",\"contentId\":\"${title}\",\"mediaName\":\"${id}\",\"everId\":\"${clientId(amp-wt3-eid)}\"},\"requests\":{\"trackURL\":\"https://${trackDomain}/${trackId}/wt\",\"basePrefix\":\"?p=440,${contentId},1,${screenWidth}x${screenHeight},${screenColorDepth},1,\",\"baseSuffix\":\",${documentReferrer},${viewportWidth}x${viewportHeight},0&tz=${timezone}&eid=${everId}&la=${browserLanguage}\",\"parameterPrefix\":\"${basePrefix}${timestamp}${baseSuffix}\",\"parameterSuffix\":\"&pu=${sourceUrl}&eor=1\",\"pageview\":\"${trackURL}${parameterPrefix}&${extraUrlParams}&cp570=${pageLoadTime}${parameterSuffix}\",\"event\":\"${trackURL}${parameterPrefix}&ct=${actionName}&${extraUrlParams}${parameterSuffix}\",\"scroll\":\"${trackURL}${parameterPrefix}&ct=${actionName}&ck540=${verticalScrollBoundary}${parameterSuffix}\",\"mediaPrefix\":\"${trackURL}${basePrefix}${baseSuffix}&mi=${mediaName}\",\"mediaSuffix\":\"&mt1=${currentTime}&mt2=${duration}&${extraUrlParams}${parameterSuffix}&x=${playedTotal}\",\"mediaPlay\":\"${mediaPrefix}&mk=play${mediaSuffix}\",\"mediaPause\":\"${mediaPrefix}&mk=pause${mediaSuffix}\",\"mediaPosition\":\"${mediaPrefix}&mk=pos${mediaSuffix}\",\"mediaEnded\":\"${mediaPrefix}&mk=eof${mediaSuffix}\"},\"extraUrlParamsReplaceMap\":{\"pageParameter\":\"cp\",\"contentGroup\":\"cg\",\"actionParameter\":\"ck\",\"sessionParameter\":\"cs\",\"ecommerceParameter\":\"cb\",\"urmCategory\":\"uc\",\"campaignParameter\":\"cc\",\"mediaCategory\":\"mg\"},\"transport\":{\"beacon\":false,\"xhrpost\":false,\"image\":true}}";
exports.WEBTREKK_V2_CONFIG = WEBTREKK_V2_CONFIG;

},{"../../../../src/json":122}],100:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.VisibilityManagerForMApp = void 0;

var _visibilityManager = require("./visibility-manager");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _opacity = require("./opacity");

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var TAG = 'amp-analytics/visibility-manager';

var VisibilityManagerForMApp =
/*#__PURE__*/
function (_VisibilityManager) {
  _inheritsLoose(VisibilityManagerForMApp, _VisibilityManager);

  /**
   *
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!../../../src/inabox/host-services.VisibilityInterface} visibilityInterface
   */
  function VisibilityManagerForMApp(ampdoc, visibilityInterface) {
    var _this;

    _this = _VisibilityManager.call(this,
    /* parent */
    null, ampdoc) || this;
    /**
     * In VisibilityManagerForMApp case,
     */

    /** @const @private {!../../../src/inabox/host-services.VisibilityInterface} */

    _this.visibilityInterface_ = visibilityInterface;
    /** @const @private {boolean} */

    _this.backgroundedAtStart_ = !ampdoc.isVisible();
    /** @private {?../../../src/layout-rect.LayoutRectDef} */

    _this.intersectionRect_ = null;
    /** @private {boolean} */

    _this.disposed_ = false; // Initate the listener

    _this.visibilityInterface_.onVisibilityChange(_this.onVisibilityChangeHandler_.bind(_assertThisInitialized(_this)));

    return _this;
  }
  /** @override */


  var _proto = VisibilityManagerForMApp.prototype;

  _proto.dispose = function dispose() {
    _VisibilityManager.prototype.dispose.call(this);

    this.disposed_ = true;
  }
  /** @override */
  ;

  _proto.getStartTime = function getStartTime() {
    // AmpDoc.getFirstVisibleTime depend on the visibilitychange API and
    // document['hidden']
    // Expect the ampdoc is always visible in webview
    return (0, _log.dev)().assertNumber(this.ampdoc.getFirstVisibleTime());
  }
  /** @override */
  ;

  _proto.isBackgrounded = function isBackgrounded() {
    // Listens to visibilitychange event, in theory this never fires
    return !this.ampdoc.isVisible();
  }
  /** @override */
  ;

  _proto.isBackgroundedAtStart = function isBackgroundedAtStart() {
    // Return the first visible state. In theory this is always true in mApp
    return this.backgroundedAtStart_;
  }
  /** @override */
  ;

  _proto.getRootMinOpacity = function getRootMinOpacity() {
    // Copied the implementation from VisibilityManagerForDoc,
    // doesn't count iframe opacity
    var root = this.ampdoc.getRootNode();
    var rootElement = (0, _log.dev)().assertElement(root.documentElement || root.body || root);
    return (0, _opacity.getMinOpacity)(rootElement);
  }
  /** @override */
  ;

  _proto.listenElement = function listenElement() {
    // #listenElement not supported in mApp
    (0, _log.devAssert)(false, '%s: element level visibility not supported, ' + 'getElementIntersectionRect should not be called in ' + 'VisibilityManager for mApp', TAG);
    return function () {};
  }
  /**
   * @override
   */
  ;

  _proto.getRootLayoutBox = function getRootLayoutBox() {
    // By the time `#getRootLayoutBox` is called, it is guaranteed that
    // onVisibilityChangeHandler has been called at least once
    return (
      /** @type {!../../../src/layout-rect.LayoutRectDef} */
      (0, _log.devAssert)(this.intersectionRect_)
    );
  }
  /**
   * @param {!../../../src/inabox/host-services.VisibilityDataDef} visibilityData
   * @private
   */
  ;

  _proto.onVisibilityChangeHandler_ = function onVisibilityChangeHandler_(visibilityData) {
    if (this.disposed_) {
      return;
    } //TODO: Need discussion
    // rootVisibility is set by hostAPI, instead of ampdoc.isVisible


    var ratio = visibilityData.visibleRatio; // Convert to valid ratio range in [0, 1]

    ratio = Math.min(Math.max(0, ratio), 1);
    this.setRootVisibility(ratio);
    this.intersectionRect_ = visibilityData.visibleRect;
  }
  /**
   * @override
   */
  ;

  _proto.observe = function observe() {
    (0, _log.devAssert)(false, '%s: element level visibility not supported, ' + 'getElementIntersectionRect should not be called in ' + 'VisibilityManager for mApp', TAG);
    return function () {};
  }
  /**
   * @override
   */
  ;

  _proto.getElementVisibility = function getElementVisibility() {
    (0, _log.devAssert)(false, '%s: element level visibility not supported, ' + 'getElementIntersectionRect should not be called in ' + 'VisibilityManager for mApp', TAG);
    return 0;
  }
  /**
   * @override
   * @return {?JsonObject}
   */
  ;

  _proto.getElementIntersectionRect = function getElementIntersectionRect() {
    (0, _log.dev)().error(TAG, 'element level visibility not supported, ' + 'getElementIntersectionRect should not be called in ' + 'VisibilityManager for mApp');
    return (0, _object.dict)({});
  };

  return VisibilityManagerForMApp;
}(_visibilityManager.VisibilityManager);

exports.VisibilityManagerForMApp = VisibilityManagerForMApp;

},{"../../../src/log":125,"../../../src/utils/object":154,"./opacity":17,"./visibility-manager":101}],101:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.provideVisibilityManager = provideVisibilityManager;
exports.VisibilityManagerForEmbed = exports.VisibilityManagerForDoc = exports.VisibilityManager = void 0;

var _intersectionObserverPolyfill = require("../../../src/intersection-observer-polyfill");

var _services = require("../../../src/services");

var _visibilityModel = require("./visibility-model");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

var _iframeHelper = require("../../../src/iframe-helper");

var _opacity = require("./opacity");

var _mode = require("../../../src/mode");

var _service = require("../../../src/service");

var _types = require("../../../src/types");

var _layoutRect = require("../../../src/layout-rect");

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var TAG = 'amp-analytics/visibility-manager';
var PROP = '__AMP_VIS';
var VISIBILITY_ID_PROP = '__AMP_VIS_ID';
/** @type {number} */

var visibilityIdCounter = 1;
/**
 * @param {!Element} element
 * @return {number}
 */

function getElementId(element) {
  var id = element[VISIBILITY_ID_PROP];

  if (!id) {
    id = ++visibilityIdCounter;
    element[VISIBILITY_ID_PROP] = id;
  }

  return id;
}
/**
 * @param {!Node} rootNode
 * @return {!VisibilityManager}
 */


function provideVisibilityManager(rootNode) {
  if (!rootNode[PROP]) {
    rootNode[PROP] = createVisibilityManager(rootNode);
  }

  return rootNode[PROP];
}
/**
 * @param {!Node} rootNode
 * @return {!VisibilityManager}
 */


function createVisibilityManager(rootNode) {
  // TODO(#22733): cleanup when ampdoc-fie is launched.
  var ampdoc = _services.Services.ampdoc(rootNode);

  var frame = (0, _service.getParentWindowFrameElement)(rootNode);
  var embed = frame && (0, _iframeHelper.getFriendlyIframeEmbedOptional)(frame);

  if (embed && frame && frame.ownerDocument) {
    return new VisibilityManagerForEmbed(provideVisibilityManager(frame.ownerDocument), embed);
  }

  return new VisibilityManagerForDoc(ampdoc);
}
/**
 * A base class for `VisibilityManagerForDoc` and `VisibilityManagerForEmbed`.
 * The instance of this class corresponds 1:1 to `AnalyticsRoot`. It represents
 * a collection of all visibility triggers declared within the `AnalyticsRoot`.
 * @implements {../../../src/service.Disposable}
 * @abstract
 */


var VisibilityManager =
/*#__PURE__*/
function () {
  /**
   * @param {?VisibilityManager} parent
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function VisibilityManager(parent, ampdoc) {
    var _this = this;

    /** @const @protected */
    this.parent = parent;
    /** @const @protected */

    this.ampdoc = ampdoc;
    /** @const @private */

    this.resources_ = _services.Services.resourcesForDoc(ampdoc);
    /** @private {number} */

    this.rootVisibility_ = 0;
    /** @const @private {!Array<!VisibilityModel>}> */

    this.models_ = [];
    /** @private {?Array<!VisibilityManager>} */

    this.children_ = null;
    /** @const @private {!Array<!UnlistenDef>} */

    this.unsubscribe_ = [];
    /** @private {number} Maximum scroll position attained */

    this.maxScrollDepth_ = 0;

    if (this.parent) {
      this.parent.addChild_(this);
    }

    var viewport = _services.Services.viewportForDoc(this.ampdoc);

    viewport.onChanged(function () {
      _this.maybeUpdateMaxScrollDepth(viewport.getScrollTop());
    });
  }
  /**
   * @param {!VisibilityManager} child
   * @private
   */


  var _proto = VisibilityManager.prototype;

  _proto.addChild_ = function addChild_(child) {
    if (!this.children_) {
      this.children_ = [];
    }

    this.children_.push(child);
  }
  /**
   * @param {!VisibilityManager} child
   * @private
   */
  ;

  _proto.removeChild_ = function removeChild_(child) {
    if (this.children_) {
      var index = this.children_.indexOf(child);

      if (index != -1) {
        this.children_.splice(index, 1);
      }
    }
  }
  /** @override */
  ;

  _proto.dispose = function dispose() {
    // Give the chance for all events to complete.
    this.setRootVisibility(0); // Dispose all models.

    for (var i = this.models_.length - 1; i >= 0; i--) {
      this.models_[i].dispose();
    } // Unsubscribe everything else.


    this.unsubscribe_.forEach(function (unsubscribe) {
      unsubscribe();
    });
    this.unsubscribe_.length = 0;

    if (this.parent) {
      this.parent.removeChild_(this);
    }

    if (this.children_) {
      for (var _i = 0; _i < this.children_.length; _i++) {
        this.children_[_i].dispose();
      }
    }
  }
  /**
   * @param {!UnlistenDef} handler
   */
  ;

  _proto.unsubscribe = function unsubscribe(handler) {
    this.unsubscribe_.push(handler);
  }
  /**
   * The start time from which all visibility events and times are measured.
   * @return {number}
   * @abstract
   */
  ;

  _proto.getStartTime = function getStartTime() {}
  /**
   * Whether the visibility root is currently in the background.
   * @return {boolean}
   * @abstract
   */
  ;

  _proto.isBackgrounded = function isBackgrounded() {}
  /**
   * Whether the visibility root has been created in the background mode.
   * @return {boolean}
   * @abstract
   */
  ;

  _proto.isBackgroundedAtStart = function isBackgroundedAtStart() {}
  /**
   * Returns the root's, root's parent's and root's children's
   * lowest opacity value
   * @return {number}
   * @abstract
   */
  ;

  _proto.getRootMinOpacity = function getRootMinOpacity() {}
  /**
   * Returns the root's layout rect.
   * @return {!../../../src/layout-rect.LayoutRectDef}
   * @abstract
   */
  ;

  _proto.getRootLayoutBox = function getRootLayoutBox() {}
  /**
   * @return {number}
   */
  ;

  _proto.getRootVisibility = function getRootVisibility() {
    if (!this.parent) {
      return this.rootVisibility_;
    }

    return this.parent.getRootVisibility() > 0 ? this.rootVisibility_ : 0;
  }
  /**
   * @param {number} visibility
   */
  ;

  _proto.setRootVisibility = function setRootVisibility(visibility) {
    this.rootVisibility_ = visibility;
    this.updateModels_();

    if (this.children_) {
      for (var i = 0; i < this.children_.length; i++) {
        this.children_[i].updateModels_();
      }
    }
  }
  /**
   * Update the maximum amount that the user has scrolled down the page.
   * @param {number} depth
   */
  ;

  _proto.maybeUpdateMaxScrollDepth = function maybeUpdateMaxScrollDepth(depth) {
    if (depth > this.maxScrollDepth_) {
      this.maxScrollDepth_ = depth;
    }
  }
  /**
   * Gets the maximum amount that the user has scrolled down the page.
   * @return {number} depth
   */
  ;

  _proto.getMaxScrollDepth = function getMaxScrollDepth() {
    return this.maxScrollDepth_;
  }
  /** @private */
  ;

  _proto.updateModels_ = function updateModels_() {
    for (var i = 0; i < this.models_.length; i++) {
      this.models_[i].update();
    }
  }
  /**
   * Listens to the visibility events on the root as the whole and the given
   * visibility spec. The visibility tracking can be deferred until
   * `readyPromise` is resolved, if specified.
   * @param {!JsonObject} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!JsonObject)} callback
   * @return {!UnlistenDef}
   */
  ;

  _proto.listenRoot = function listenRoot(spec, readyPromise, createReportPromiseFunc, callback) {
    var calcVisibility = this.getRootVisibility.bind(this);
    return this.createModelAndListen_(calcVisibility, spec, readyPromise, createReportPromiseFunc, callback);
  }
  /**
   * Listens to the visibility events for the specified element and the given
   * visibility spec. The visibility tracking can be deferred until
   * `readyPromise` is resolved, if specified.
   * @param {!Element} element
   * @param {!JsonObject} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!JsonObject)} callback
   * @return {!UnlistenDef}
   */
  ;

  _proto.listenElement = function listenElement(element, spec, readyPromise, createReportPromiseFunc, callback) {
    var calcVisibility = this.getElementVisibility.bind(this, element);
    return this.createModelAndListen_(calcVisibility, spec, readyPromise, createReportPromiseFunc, callback, element);
  }
  /**
   * Create visibilityModel and listen to visible events.
   * @param {function():number} calcVisibility
   * @param {!JsonObject} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!JsonObject)} callback
   * @param {!Element=} opt_element
   * @return {!UnlistenDef}
   */
  ;

  _proto.createModelAndListen_ = function createModelAndListen_(calcVisibility, spec, readyPromise, createReportPromiseFunc, callback, opt_element) {
    if (spec['visiblePercentageThresholds'] && spec['visiblePercentageMin'] == undefined && spec['visiblePercentageMax'] == undefined) {
      var unlisteners = [];
      var ranges = spec['visiblePercentageThresholds'];

      if (!ranges || !(0, _types.isArray)(ranges)) {
        (0, _log.user)().error(TAG, 'invalid visiblePercentageThresholds');
        return function () {};
      }

      for (var i = 0; i < ranges.length; i++) {
        var percents = ranges[i];

        if (!(0, _types.isArray)(percents) || percents.length != 2) {
          (0, _log.user)().error(TAG, 'visiblePercentageThresholds entry length is not 2');
          continue;
        }

        if (!(0, _types.isFiniteNumber)(percents[0]) || !(0, _types.isFiniteNumber)(percents[1])) {
          // not valid number
          (0, _log.user)().error(TAG, 'visiblePercentageThresholds entry is not valid number');
          continue;
        }

        var min = Number(percents[0]);
        var max = Number(percents[1]); // Min and max must be valid percentages. Min may not be more than max.
        // Max is inclusive. Min is usually exclusive, but there are two
        // special cases: if min and max are both 0, or both 100, then both
        // are inclusive. Otherwise it would not be possible to trigger an
        // event on exactly 0% or 100%.

        if (min < 0 || max > 100 || min > max || min == max && min != 100 && max != 0) {
          (0, _log.user)().error(TAG, 'visiblePercentageThresholds entry invalid min/max value');
          continue;
        }

        var newSpec = spec;
        newSpec['visiblePercentageMin'] = min;
        newSpec['visiblePercentageMax'] = max;

        var _model = new _visibilityModel.VisibilityModel(newSpec, calcVisibility);

        unlisteners.push(this.listen_(_model, spec, readyPromise, createReportPromiseFunc, callback, opt_element));
      }

      return function () {
        unlisteners.forEach(function (unlistener) {
          return unlistener();
        });
      };
    }

    var model = new _visibilityModel.VisibilityModel(spec, calcVisibility);
    return this.listen_(model, spec, readyPromise, createReportPromiseFunc, callback, opt_element);
  }
  /**
   * @param {!VisibilityModel} model
   * @param {!JsonObject} spec
   * @param {?Promise} readyPromise
   * @param {?function():!Promise} createReportPromiseFunc
   * @param {function(!JsonObject)} callback
   * @param {!Element=} opt_element
   * @return {!UnlistenDef}
   * @private
   */
  ;

  _proto.listen_ = function listen_(model, spec, readyPromise, createReportPromiseFunc, callback, opt_element) {
    var _this2 = this;

    if (createReportPromiseFunc) {
      model.setReportReady(createReportPromiseFunc);
    }

    var viewport = _services.Services.viewportForDoc(this.ampdoc);

    var scrollDepth = viewport.getScrollTop();
    this.maybeUpdateMaxScrollDepth(scrollDepth); // Block visibility.

    if (readyPromise) {
      model.setReady(false);
      readyPromise.then(function () {
        model.setReady(true);
        model.maybeSetInitialScrollDepth(scrollDepth);
      });
    } else {
      model.maybeSetInitialScrollDepth(scrollDepth);
    } // Process the event.


    model.onTriggerEvent(function () {
      var startTime = _this2.getStartTime();

      var state = model.getState(startTime); // Additional doc-level state.

      state['backgrounded'] = _this2.isBackgrounded() ? 1 : 0;
      state['backgroundedAtStart'] = _this2.isBackgroundedAtStart() ? 1 : 0;
      state['totalTime'] = Date.now() - startTime; // Optionally, element-level state.

      var layoutBox;

      if (opt_element) {
        state['opacity'] = (0, _opacity.getMinOpacity)(opt_element);

        var resource = _this2.resources_.getResourceForElementOptional(opt_element);

        layoutBox = resource ? resource.getLayoutBox() : viewport.getLayoutRect(opt_element);

        var intersectionRatio = _this2.getElementVisibility(opt_element);

        var intersectionRect = _this2.getElementIntersectionRect(opt_element);

        Object.assign(state, (0, _object.dict)({
          'intersectionRatio': intersectionRatio,
          'intersectionRect': JSON.stringify(intersectionRect)
        }));
      } else {
        state['opacity'] = _this2.getRootMinOpacity();
        state['intersectionRatio'] = _this2.getRootVisibility();
        layoutBox = _this2.getRootLayoutBox();
      }

      model.maybeDispose();

      if (layoutBox) {
        Object.assign(state, (0, _object.dict)({
          'elementX': layoutBox.left,
          'elementY': layoutBox.top,
          'elementWidth': layoutBox.width,
          'elementHeight': layoutBox.height
        }));
        state['initialScrollDepth'] = (0, _layoutRect.layoutPositionRelativeToScrolledViewport)(layoutBox, viewport, model.getInitialScrollDepth());
        state['maxScrollDepth'] = (0, _layoutRect.layoutPositionRelativeToScrolledViewport)(layoutBox, viewport, _this2.getMaxScrollDepth());
      }

      callback(state);
    });
    this.models_.push(model);
    model.unsubscribe(function () {
      var index = _this2.models_.indexOf(model);

      if (index != -1) {
        _this2.models_.splice(index, 1);
      }
    }); // Observe the element via InOb.

    if (opt_element) {
      // It's important that this happens after all the setup is done, b/c
      // intersection observer can fire immedidately. Per spec, this should
      // NOT happen. However, all of the existing InOb polyfills, as well as
      // some versions of native implementations, make this mistake.
      model.unsubscribe(this.observe(opt_element, function () {
        return model.update();
      }));
    } // Start update.


    model.update();
    return function () {
      model.dispose();
    };
  }
  /**
   * Observes the intersections of the specified element in the viewport.
   * @param {!Element} unusedElement
   * @param {function(number)} unusedListener
   * @return {!UnlistenDef}
   * @protected
   * @abstract
   */
  ;

  _proto.observe = function observe(unusedElement, unusedListener) {}
  /**
   * @param {!Element} unusedElement
   * @return {number}
   * @abstract
   */
  ;

  _proto.getElementVisibility = function getElementVisibility(unusedElement) {}
  /**
   * @param {!Element} unusedElement
   * @return {?JsonObject}
   * @abstract
   */
  ;

  _proto.getElementIntersectionRect = function getElementIntersectionRect(unusedElement) {};

  return VisibilityManager;
}();
/**
 * The implementation of `VisibilityManager` for an AMP document. Two
 * distinct modes are supported: the main AMP doc and a in-a-box doc.
 */


exports.VisibilityManager = VisibilityManager;

var VisibilityManagerForDoc =
/*#__PURE__*/
function (_VisibilityManager) {
  _inheritsLoose(VisibilityManagerForDoc, _VisibilityManager);

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  function VisibilityManagerForDoc(ampdoc) {
    var _this3;

    _this3 = _VisibilityManager.call(this,
    /* parent */
    null, ampdoc) || this;
    /** @const @private */

    _this3.viewport_ = _services.Services.viewportForDoc(ampdoc);
    /** @private {boolean} */

    _this3.backgrounded_ = !ampdoc.isVisible();
    /** @const @private {boolean} */

    _this3.backgroundedAtStart_ = _this3.isBackgrounded();
    /**
     * @const
     * @private {!Object<number, {
     *   element: !Element,
     *   intersectionRatio: number,
     *   listeners: !Array<function(number)>
     * }>}
     */

    _this3.trackedElements_ = (0, _object.map)();
    /** @private {?IntersectionObserver|?IntersectionObserverPolyfill} */

    _this3.intersectionObserver_ = null;

    if ((0, _mode.getMode)(_this3.ampdoc.win).runtime == 'inabox') {
      // In-a-box: visibility depends on the InOb.
      var root = _this3.ampdoc.getRootNode();

      var rootElement = (0, _log.dev)().assertElement(root.documentElement || root.body || root);

      _this3.unsubscribe(_this3.observe(rootElement, _this3.setRootVisibility.bind(_assertThisInitialized(_this3))));
    } else {
      // Main document: visibility is based on the ampdoc.
      _this3.setRootVisibility(_this3.ampdoc.isVisible() ? 1 : 0);

      _this3.unsubscribe(_this3.ampdoc.onVisibilityChanged(function () {
        var isVisible = _this3.ampdoc.isVisible();

        if (!isVisible) {
          _this3.backgrounded_ = true;
        }

        _this3.setRootVisibility(isVisible ? 1 : 0);
      }));
    }

    return _this3;
  }
  /** @override */


  var _proto2 = VisibilityManagerForDoc.prototype;

  _proto2.dispose = function dispose() {
    _VisibilityManager.prototype.dispose.call(this);

    if (this.intersectionObserver_) {
      this.intersectionObserver_.disconnect();
      this.intersectionObserver_ = null;
    }
  }
  /** @override */
  ;

  _proto2.getStartTime = function getStartTime() {
    return (0, _log.dev)().assertNumber(this.ampdoc.getFirstVisibleTime());
  }
  /** @override */
  ;

  _proto2.isBackgrounded = function isBackgrounded() {
    return this.backgrounded_;
  }
  /** @override */
  ;

  _proto2.isBackgroundedAtStart = function isBackgroundedAtStart() {
    return this.backgroundedAtStart_;
  }
  /** @override */
  ;

  _proto2.getRootMinOpacity = function getRootMinOpacity() {
    var root = this.ampdoc.getRootNode();
    var rootElement = (0, _log.dev)().assertElement(root.documentElement || root.body || root);
    return (0, _opacity.getMinOpacity)(rootElement);
  }
  /** @override */
  ;

  _proto2.getRootLayoutBox = function getRootLayoutBox() {
    // This code is the same for "in-a-box" and standalone doc.
    var root = this.ampdoc.getRootNode();
    var rootElement = (0, _log.dev)().assertElement(root.documentElement || root.body || root);
    return this.viewport_.getLayoutRect(rootElement);
  }
  /** @override */
  ;

  _proto2.observe = function observe(element, listener) {
    var _this4 = this;

    this.polyfillAmpElementIfNeeded_(element);
    var id = getElementId(element);
    var trackedElement = this.trackedElements_[id];

    if (!trackedElement) {
      trackedElement = {
        element: element,
        intersectionRatio: 0,
        intersectionRect: null,
        listeners: []
      };
      this.trackedElements_[id] = trackedElement;
    } else if (trackedElement.intersectionRatio > 0) {
      // This has already been tracked and the `intersectionRatio` is fresh.
      listener(trackedElement.intersectionRatio);
    }

    trackedElement.listeners.push(listener);
    this.getIntersectionObserver_().observe(element);
    return function () {
      var trackedElement = _this4.trackedElements_[id];

      if (trackedElement) {
        var index = trackedElement.listeners.indexOf(listener);

        if (index != -1) {
          trackedElement.listeners.splice(index, 1);
        }

        if (trackedElement.listeners.length == 0) {
          _this4.intersectionObserver_.unobserve(element);

          delete _this4.trackedElements_[id];
        }
      }
    };
  }
  /** @override */
  ;

  _proto2.getElementVisibility = function getElementVisibility(element) {
    if (this.getRootVisibility() == 0) {
      return 0;
    }

    var id = getElementId(element);
    var trackedElement = this.trackedElements_[id];
    return trackedElement && trackedElement.intersectionRatio || 0;
  }
  /**
   * Gets the intersection element.
   *
   * @param {!Element} element
   * @return {?JsonObject}
   */
  ;

  _proto2.getElementIntersectionRect = function getElementIntersectionRect(element) {
    if (this.getElementVisibility(element) <= 0) {
      return null;
    }

    var id = getElementId(element);
    var trackedElement = this.trackedElements_[id];

    if (trackedElement) {
      return (
        /** @type {!JsonObject} */
        trackedElement.intersectionRect
      );
    }

    return null;
  }
  /**
   * @return {!IntersectionObserver|!IntersectionObserverPolyfill}
   * @private
   */
  ;

  _proto2.getIntersectionObserver_ = function getIntersectionObserver_() {
    if (!this.intersectionObserver_) {
      this.intersectionObserver_ = this.createIntersectionObserver_();
    }

    return this.intersectionObserver_;
  }
  /**
   * @return {!IntersectionObserver|!IntersectionObserverPolyfill}
   * @private
   */
  ;

  _proto2.createIntersectionObserver_ = function createIntersectionObserver_() {
    var _this5 = this;

    // Native.
    var win = this.ampdoc.win;

    if ((0, _intersectionObserverPolyfill.nativeIntersectionObserverSupported)(win)) {
      return new win.IntersectionObserver(this.onIntersectionChanges_.bind(this), {
        threshold: _intersectionObserverPolyfill.DEFAULT_THRESHOLD
      });
    } // Polyfill.


    var intersectionObserverPolyfill = new _intersectionObserverPolyfill.IntersectionObserverPolyfill(this.onIntersectionChanges_.bind(this), {
      threshold: _intersectionObserverPolyfill.DEFAULT_THRESHOLD
    });

    var ticker = function ticker() {
      intersectionObserverPolyfill.tick(_this5.viewport_.getRect());
    };

    this.unsubscribe(this.viewport_.onScroll(ticker));
    this.unsubscribe(this.viewport_.onChanged(ticker)); // Tick in the next event loop. That's how native InOb works.

    setTimeout(ticker);
    return intersectionObserverPolyfill;
  }
  /**
   * @param {!Element} element
   * @private
   */
  ;

  _proto2.polyfillAmpElementIfNeeded_ = function polyfillAmpElementIfNeeded_(element) {
    var _this6 = this;

    var win = this.ampdoc.win;

    if ((0, _intersectionObserverPolyfill.nativeIntersectionObserverSupported)(win)) {
      return;
    } // InOb polyfill requires partial AmpElement implementation.


    if (typeof element.getLayoutBox == 'function') {
      return;
    }

    element.getLayoutBox = function () {
      return _this6.viewport_.getLayoutRect(element);
    };

    element.getOwner = function () {
      return null;
    };
  }
  /**
   * @param {!Array<!IntersectionObserverEntry>} entries
   * @private
   */
  ;

  _proto2.onIntersectionChanges_ = function onIntersectionChanges_(entries) {
    var _this7 = this;

    entries.forEach(function (change) {
      var intersection = change.intersectionRect; // IntersectionRect type now changed from ClientRect to DOMRectReadOnly.
      // TODO(@zhouyx): Fix all InOb related type.

      intersection = (0, _layoutRect.layoutRectLtwh)(Number(intersection.left), Number(intersection.top), Number(intersection.width), Number(intersection.height));

      _this7.onIntersectionChange_(change.target, change.intersectionRatio, intersection);
    });
  }
  /**
   * @param {!Element} target
   * @param {number} intersectionRatio
   * @param {!../../../src/layout-rect.LayoutRectDef} intersectionRect
   * @private
   */
  ;

  _proto2.onIntersectionChange_ = function onIntersectionChange_(target, intersectionRatio, intersectionRect) {
    intersectionRatio = Math.min(Math.max(intersectionRatio, 0), 1);
    var id = getElementId(target);
    var trackedElement = this.trackedElements_[id];

    if (trackedElement) {
      trackedElement.intersectionRatio = intersectionRatio;
      trackedElement.intersectionRect = intersectionRect;

      for (var i = 0; i < trackedElement.listeners.length; i++) {
        trackedElement.listeners[i](intersectionRatio);
      }
    }
  };

  return VisibilityManagerForDoc;
}(VisibilityManager);
/**
 * The implementation of `VisibilityManager` for a FIE embed. This visibility
 * root delegates most of tracking functions to its parent, the ampdoc root.
 */


exports.VisibilityManagerForDoc = VisibilityManagerForDoc;

var VisibilityManagerForEmbed =
/*#__PURE__*/
function (_VisibilityManager2) {
  _inheritsLoose(VisibilityManagerForEmbed, _VisibilityManager2);

  /**
   * @param {!VisibilityManager} parent
   * @param {!../../../src/friendly-iframe-embed.FriendlyIframeEmbed} embed
   */
  function VisibilityManagerForEmbed(parent, embed) {
    var _this8;

    _this8 = _VisibilityManager2.call(this, parent, parent.ampdoc) || this;
    /** @const */

    _this8.embed = embed;
    /** @const @private {boolean} */

    _this8.backgroundedAtStart_ = _this8.parent.isBackgrounded();

    _this8.unsubscribe(_this8.parent.observe((0, _log.dev)().assertElement(embed.host), _this8.setRootVisibility.bind(_assertThisInitialized(_this8))));

    return _this8;
  }
  /** @override */


  var _proto3 = VisibilityManagerForEmbed.prototype;

  _proto3.getStartTime = function getStartTime() {
    return this.embed.getStartTime();
  }
  /** @override */
  ;

  _proto3.isBackgrounded = function isBackgrounded() {
    return this.parent.isBackgrounded();
  }
  /** @override */
  ;

  _proto3.isBackgroundedAtStart = function isBackgroundedAtStart() {
    return this.backgroundedAtStart_;
  }
  /** @override */
  ;

  _proto3.getRootMinOpacity = function getRootMinOpacity() {
    var rootElement = (0, _log.dev)().assertElement(this.embed.iframe);
    return (0, _opacity.getMinOpacity)(rootElement);
  }
  /**
   * Gets the layout box of the embedded document. Note that this may be
   * smaller than the size allocated by the host. In that case, the document
   * will be centered, and the unfilled space will not be reflected in this
   * return value.
   * embed.iframe is used to calculate the root layoutbox, since it is more
   * important for the embedded document to know its own size, rather than
   * the size of the host rectangle which it may or may not entirely fill.
   * embed.host is used to calculate the root visibility, however, since
   * the visibility of the host element directly determines the embedded
   * document's visibility.
   * @override
   */
  ;

  _proto3.getRootLayoutBox = function getRootLayoutBox() {
    var rootElement = (0, _log.dev)().assertElement(this.embed.iframe);
    return _services.Services.viewportForDoc(this.ampdoc).getLayoutRect(rootElement);
  }
  /** @override */
  ;

  _proto3.observe = function observe(element, listener) {
    return this.parent.observe(element, listener);
  }
  /** @override */
  ;

  _proto3.getElementVisibility = function getElementVisibility(element) {
    if (this.getRootVisibility() == 0) {
      return 0;
    }

    return this.parent.getElementVisibility(element);
  }
  /**
   * Returns intersecting element.
   * @override
   */
  ;

  _proto3.getElementIntersectionRect = function getElementIntersectionRect(element) {
    if (this.getRootVisibility() == 0) {
      return null;
    }

    return this.parent.getElementIntersectionRect(element);
  };

  return VisibilityManagerForEmbed;
}(VisibilityManager);

exports.VisibilityManagerForEmbed = VisibilityManagerForEmbed;

},{"../../../src/iframe-helper":116,"../../../src/intersection-observer-polyfill":121,"../../../src/layout-rect":123,"../../../src/log":125,"../../../src/mode":127,"../../../src/service":131,"../../../src/services":141,"../../../src/types":145,"../../../src/utils/object":154,"./opacity":17,"./visibility-model":102}],102:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.VisibilityModel = void 0;

var _promise = require("../../../src/utils/promise");

var _observable = require("../../../src/observable");

var _log = require("../../../src/log");

var _object = require("../../../src/utils/object");

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
 * This class implements visibility calculations based on the
 * visibility ratio. It's used for documents, embeds and individual element.
 * @implements {../../../src/service.Disposable}
 */
var VisibilityModel =
/*#__PURE__*/
function () {
  /**
   * @param {!JsonObject} spec
   * @param {function():number} calcVisibility
   */
  function VisibilityModel(spec, calcVisibility) {
    var _this = this;

    /** @const @private */
    this.calcVisibility_ = calcVisibility;
    /**
     * Spec parameters.
     * @private {!JsonObject}
     */

    this.spec_ = (0, _object.dict)({
      'visiblePercentageMin': Number(spec['visiblePercentageMin']) / 100 || 0,
      'visiblePercentageMax': Number(spec['visiblePercentageMax']) / 100 || 1,
      'totalTimeMin': Number(spec['totalTimeMin']) || 0,
      'totalTimeMax': Number(spec['totalTimeMax']) || Infinity,
      'continuousTimeMin': Number(spec['continuousTimeMin']) || 0,
      'continuousTimeMax': Number(spec['continuousTimeMax']) || Infinity
    }); // Above, if visiblePercentageMax was not specified, assume 100%.
    // Here, do allow 0% to be the value if that is what was specified.

    if (String(spec['visiblePercentageMax']).trim() === '0') {
      this.spec_['visiblePercentageMax'] = 0;
    }
    /**
     * Accumulate visibility counters but do not fire the trigger until the
     * ready promise resolves.
     * @private @const {boolean}
     */


    this.ignoreVisibilityForReport_ = spec['reportWhen'] !== undefined;
    /** @private {boolean} */

    this.repeat_ = spec['repeat'] === true;
    /** @private {?Observable} */

    this.onTriggerObservable_ = new _observable.Observable();
    var deferred = new _promise.Deferred();
    /** @private */

    this.eventPromise_ = deferred.promise;
    /** @private {?function()} */

    this.eventResolver_ = deferred.resolve;
    this.eventPromise_.then(function () {
      _this.onTriggerObservable_.fire();
    });
    /** @private {!Array<!UnlistenDef>} */

    this.unsubscribe_ = [];
    /** @const @private {time} */

    this.createdTime_ = Date.now(); // TODO(warrengm): Consider refactoring so that the ready defaults are
    // false.

    /** @private {boolean} */

    this.ready_ = true;
    /** @private {boolean} */

    this.reportReady_ = true;
    /** @private {?function():!Promise} */

    this.createReportReadyPromise_ = null;
    /** @private {?number} */

    this.scheduledUpdateTimeoutId_ = null;
    /** @private {boolean} */

    this.matchesVisibility_ = false;
    /** @private {boolean} */

    this.everMatchedVisibility_ = false;
    /** @private {time} duration in milliseconds */

    this.continuousTime_ = 0;
    /** @private {time} duration in milliseconds */

    this.maxContinuousVisibleTime_ = 0;
    /** @private {time} duration in milliseconds */

    this.totalVisibleTime_ = 0;
    /** @private {time} milliseconds since epoch */

    this.firstSeenTime_ = 0;
    /** @private {time} milliseconds since epoch */

    this.lastSeenTime_ = 0;
    /** @private {time} milliseconds since epoch */

    this.firstVisibleTime_ = 0;
    /** @private {time} milliseconds since epoch */

    this.lastVisibleTime_ = 0;
    /** @private {time} percent value in a [0, 1] range */

    this.loadTimeVisibility_ = 0;
    /** @private {number} percent value in a [0, 1] range */

    this.minVisiblePercentage_ = 0;
    /** @private {number} percent value in a [0, 1] range */

    this.maxVisiblePercentage_ = 0;
    /** @private {time} milliseconds since epoch */

    this.lastVisibleUpdateTime_ = 0;
    /** @private {number} Scroll position at ini-load time */

    this.initialScrollDepth_ = 0;
    /**
     * @private {boolean} Whether scroll position at ini-load time has
     * been set
     */

    this.initialScrollDepthAlreadySet_ = false;
    /** @private {boolean} */

    this.waitToReset_ = false;
    /** @private {?number} */

    this.scheduleRepeatId_ = null;
  }
  /**
   * Refresh counter on visible reset.
   * TODO: Right now all state value are scoped state values that gets reset.
   * We may need to add support to global state values,
   * that never reset like globalTotalVisibleTime.
   * Note: loadTimeVisibility is an exception.
   * @private
   */


  var _proto = VisibilityModel.prototype;

  _proto.reset_ = function reset_() {
    var _this2 = this;

    (0, _log.devAssert)(!this.eventResolver_, 'Attempt to refresh visible event before previous one resolve');
    var deferred = new _promise.Deferred();
    this.eventPromise_ = deferred.promise;
    this.eventResolver_ = deferred.resolve;
    this.eventPromise_.then(function () {
      _this2.onTriggerObservable_.fire();
    });
    this.scheduleRepeatId_ = null;
    this.everMatchedVisibility_ = false;
    this.matchesVisibility_ = false;
    this.continuousTime_ = 0;
    this.maxContinuousVisibleTime_ = 0;
    this.totalVisibleTime_ = 0;
    this.firstVisibleTime_ = 0;
    this.firstSeenTime_ = 0;
    this.lastSeenTime_ = 0;
    this.lastVisibleTime_ = 0;
    this.minVisiblePercentage_ = 0;
    this.maxVisiblePercentage_ = 0;
    this.lastVisibleUpdateTime_ = 0;
    this.waitToReset_ = false;
  }
  /**
   * Function that visibilityManager can used to dispose model or reset model
   */
  ;

  _proto.maybeDispose = function maybeDispose() {
    if (!this.repeat_) {
      this.dispose();
    }
  }
  /** @override */
  ;

  _proto.dispose = function dispose() {
    if (this.scheduledUpdateTimeoutId_) {
      clearTimeout(this.scheduledUpdateTimeoutId_);
      this.scheduledUpdateTimeoutId_ = null;
    }

    if (this.scheduleRepeatId_) {
      clearTimeout(this.scheduleRepeatId_);
      this.scheduleRepeatId_ = null;
    }

    this.unsubscribe_.forEach(function (unsubscribe) {
      unsubscribe();
    });
    this.unsubscribe_.length = 0;
    this.eventResolver_ = null;

    if (this.onTriggerObservable_) {
      this.onTriggerObservable_.removeAll();
      this.onTriggerObservable_ = null;
    }
  }
  /**
   * Adds the unsubscribe handler that will be called when this visibility
   * model is destroyed.
   * @param {!UnlistenDef} handler
   */
  ;

  _proto.unsubscribe = function unsubscribe(handler) {
    this.unsubscribe_.push(handler);
  }
  /**
   * Adds the event handler that will be called when all visibility conditions
   * have been met.
   * @param {function()} handler
   */
  ;

  _proto.onTriggerEvent = function onTriggerEvent(handler) {
    if (this.onTriggerObservable_) {
      this.onTriggerObservable_.add(handler);
    }

    if (this.eventPromise_ && !this.eventResolver_) {
      // If eventPromise has already resolved, need to call handler manually.
      handler();
    }
  }
  /**
   * Sets whether this object is ready. Ready means that visibility is
   * ready to be calculated, e.g. because an element has been
   * sufficiently rendered.
   * @param {boolean} ready
   */
  ;

  _proto.setReady = function setReady(ready) {
    this.ready_ = ready;
    this.update();
  }
  /**
   * Sets that the model needs to wait on extra report ready promise
   * after all visibility conditions have been met to call report handler
   * @param {function():!Promise} callback
   */
  ;

  _proto.setReportReady = function setReportReady(callback) {
    this.reportReady_ = false;
    this.createReportReadyPromise_ = callback;
  }
  /**
   * @return {number}
   * @private
   */
  ;

  _proto.getVisibility_ = function getVisibility_() {
    return this.ready_ ? this.calcVisibility_() : 0;
  }
  /**
   * Runs the calculation cycle.
   */
  ;

  _proto.update = function update() {
    this.update_(this.getVisibility_());
  }
  /**
   * Returns the calculated state of visibility.
   * @param {time} startTime
   * @return {!JsonObject}
   */
  ;

  _proto.getState = function getState(startTime) {
    return (0, _object.dict)({
      // Observed times, relative to the `startTime`.
      'firstSeenTime': timeBase(this.firstSeenTime_, startTime),
      'lastSeenTime': timeBase(this.lastSeenTime_, startTime),
      'lastVisibleTime': timeBase(this.lastVisibleTime_, startTime),
      'firstVisibleTime': timeBase(this.firstVisibleTime_, startTime),
      // Durations.
      'maxContinuousVisibleTime': this.maxContinuousVisibleTime_,
      'totalVisibleTime': this.totalVisibleTime_,
      // Visibility percents.
      'loadTimeVisibility': this.loadTimeVisibility_ * 100 || 0,
      'minVisiblePercentage': this.minVisiblePercentage_ * 100,
      'maxVisiblePercentage': this.maxVisiblePercentage_ * 100
    });
  }
  /**
   * @param {number} visibility
   * @private
   */
  ;

  _proto.update_ = function update_(visibility) {
    var _this3 = this;

    // Update state and check if all conditions are satisfied
    if (this.waitToReset_) {
      if (!this.isVisibilityMatch_(visibility)) {
        // We were waiting for a condition to become unmet, and now it has
        this.reset_();
      }

      return;
    }

    if (!this.eventResolver_) {
      return;
    } // When ignoreVisibilityForReport_ is true, we update counters but fire the
    // event when the report ready promise is resolved.


    var conditionsMet = this.updateCounters_(visibility) || this.ignoreVisibilityForReport_;

    if (conditionsMet) {
      if (this.scheduledUpdateTimeoutId_) {
        clearTimeout(this.scheduledUpdateTimeoutId_);
        this.scheduledUpdateTimeoutId_ = null;
      }

      if (this.reportReady_) {
        // TODO(jonkeller): Can we eliminate eventResolver_?
        this.eventResolver_();
        this.eventResolver_ = null;

        if (this.repeat_) {
          this.waitToReset_ = true;
          this.continuousTime_ = 0;
        }
      } else if (this.createReportReadyPromise_) {
        // Report when report ready promise resolve
        var reportReadyPromise = this.createReportReadyPromise_();
        this.createReportReadyPromise_ = null;
        reportReadyPromise.then(function () {
          _this3.reportReady_ = true; // Need to update one more time in case time exceeds
          // maxContinuousVisibleTime.

          _this3.update();
        });
      }
    } else if (this.matchesVisibility_ && !this.scheduledUpdateTimeoutId_) {
      // There is unmet duration condition, schedule a check
      var timeToWait = this.computeTimeToWait_();

      if (timeToWait > 0) {
        this.scheduledUpdateTimeoutId_ = setTimeout(function () {
          _this3.scheduledUpdateTimeoutId_ = null;

          _this3.update();
        }, timeToWait);
      }
    } else if (!this.matchesVisibility_ && this.scheduledUpdateTimeoutId_) {
      clearTimeout(this.scheduledUpdateTimeoutId_);
      this.scheduledUpdateTimeoutId_ = null;
    }
  }
  /**
   * Check if visibility fall into the percentage range
   * @param {number} visibility
   * @return {boolean}
   */
  ;

  _proto.isVisibilityMatch_ = function isVisibilityMatch_(visibility) {
    (0, _log.devAssert)(visibility >= 0 && visibility <= 1, 'invalid visibility value: %s', visibility); // Special case: If visiblePercentageMin is 100%, then it doesn't make
    // sense to do the usual (min, max] since that would never be true.

    if (this.spec_['visiblePercentageMin'] == 1) {
      return visibility == 1;
    } // Special case: If visiblePercentageMax is 0%, then we
    // want to ping when the creative becomes not visible.


    if (this.spec_['visiblePercentageMax'] == 0) {
      return visibility == 0;
    }

    return visibility > this.spec_['visiblePercentageMin'] && visibility <= this.spec_['visiblePercentageMax'];
  }
  /**
   * @param {number} visibility
   * @return {boolean} true
   * @private
   */
  ;

  _proto.updateCounters_ = function updateCounters_(visibility) {
    (0, _log.devAssert)(visibility >= 0 && visibility <= 1, 'invalid visibility value: %s', visibility);
    var now = Date.now();

    if (visibility > 0) {
      this.firstSeenTime_ = this.firstSeenTime_ || now;
      this.lastSeenTime_ = now; // Consider it as load time visibility if this happens within 300ms of
      // page load.

      if (!this.loadTimeVisibility_ && now - this.createdTime_ < 300) {
        this.loadTimeVisibility_ = visibility;
      }
    }

    var prevMatchesVisibility = this.matchesVisibility_;
    var timeSinceLastUpdate = this.lastVisibleUpdateTime_ ? now - this.lastVisibleUpdateTime_ : 0;
    this.matchesVisibility_ = this.isVisibilityMatch_(visibility);

    if (this.matchesVisibility_) {
      this.everMatchedVisibility_ = true;

      if (prevMatchesVisibility) {
        // Keep counting.
        this.totalVisibleTime_ += timeSinceLastUpdate;
        this.continuousTime_ += timeSinceLastUpdate;
        this.maxContinuousVisibleTime_ = Math.max(this.maxContinuousVisibleTime_, this.continuousTime_);
      } else {
        // The resource came into view: start counting.
        (0, _log.devAssert)(!this.lastVisibleUpdateTime_);
        this.firstVisibleTime_ = this.firstVisibleTime_ || now;
      }

      this.lastVisibleUpdateTime_ = now;
      this.minVisiblePercentage_ = this.minVisiblePercentage_ > 0 ? Math.min(this.minVisiblePercentage_, visibility) : visibility;
      this.maxVisiblePercentage_ = Math.max(this.maxVisiblePercentage_, visibility);
      this.lastVisibleTime_ = now;
    } else if (prevMatchesVisibility) {
      // The resource went out of view. Do final calculations and reset state.
      (0, _log.devAssert)(this.lastVisibleUpdateTime_ > 0);
      this.maxContinuousVisibleTime_ = Math.max(this.maxContinuousVisibleTime_, this.continuousTime_ + timeSinceLastUpdate); // Reset for next visibility event.

      this.lastVisibleUpdateTime_ = 0;
      this.totalVisibleTime_ += timeSinceLastUpdate;
      this.continuousTime_ = 0; // Clear only after max is calculated above.

      this.lastVisibleTime_ = now;
    }

    return this.everMatchedVisibility_ && this.totalVisibleTime_ >= this.spec_['totalTimeMin'] && this.totalVisibleTime_ <= this.spec_['totalTimeMax'] && this.maxContinuousVisibleTime_ >= this.spec_['continuousTimeMin'] && this.maxContinuousVisibleTime_ <= this.spec_['continuousTimeMax'];
  }
  /**
   * Set the amount that the user had scrolled down the page at the time of
   * page loading.
   * @param {number} depth
   */
  ;

  _proto.maybeSetInitialScrollDepth = function maybeSetInitialScrollDepth(depth) {
    if (!this.initialScrollDepthAlreadySet_) {
      this.initialScrollDepth_ = depth;
      this.initialScrollDepthAlreadySet_ = true;
    }
  }
  /**
   * Gets the amount that the user had scrolled down the page, at the time of
   * ini-load.
   * @return {number} depth
   */
  ;

  _proto.getInitialScrollDepth = function getInitialScrollDepth() {
    return this.initialScrollDepth_;
  }
  /**
   * Computes time, assuming the object is currently visible, that it'd take
   * it to match all timing requirements.
   * @return {time}
   * @private
   */
  ;

  _proto.computeTimeToWait_ = function computeTimeToWait_() {
    var waitForContinuousTime = Math.max(this.spec_['continuousTimeMin'] - this.continuousTime_, 0);
    var waitForTotalTime = Math.max(this.spec_['totalTimeMin'] - this.totalVisibleTime_, 0);
    var maxWaitTime = Math.max(waitForContinuousTime, waitForTotalTime);
    return Math.min(maxWaitTime, waitForContinuousTime || Infinity, waitForTotalTime || Infinity);
  };

  return VisibilityModel;
}();
/**
 * Calculates the specified time based on the given `baseTime`.
 * @param {time} time
 * @param {time} baseTime
 * @return {time}
 */


exports.VisibilityModel = VisibilityModel;

function timeBase(time, baseTime) {
  return time >= baseTime ? time - baseTime : 0;
}

},{"../../../src/log":125,"../../../src/observable":128,"../../../src/utils/object":154,"../../../src/utils/promise":156}],103:[function(require,module,exports){
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

},{"./event-helper-listen":113,"./json":122,"./log":125,"./utils/object":154}],104:[function(require,module,exports){
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

},{"./log":125,"./service":131,"./style":144}],105:[function(require,module,exports){
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

},{}],106:[function(require,module,exports){
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

},{}],107:[function(require,module,exports){
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

},{}],108:[function(require,module,exports){
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

},{"./consent-state":107,"./log":125,"./services":141}],109:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getCookie = getCookie;
exports.setCookie = setCookie;
exports.getHighestAvailableDomain = getHighestAvailableDomain;
exports.SameSite = void 0;

var _string = require("./string");

var _url = require("./url");

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
var TEST_COOKIE_NAME = '-test-amp-cookie-tmp';
/** @enum {string} */

var SameSite = {
  LAX: 'Lax',
  STRICT: 'Strict',
  NONE: 'None'
};
/**
 * Returns the value of the cookie. The cookie access is restricted and must
 * go through the privacy review. Before using this method please file a
 * GitHub issue with "Privacy Review" label.
 *
 * Returns the cookie's value or `null`.
 *
 * @param {!Window} win
 * @param {string} name
 * @return {?string}
 */

exports.SameSite = SameSite;

function getCookie(win, name) {
  var cookieString = tryGetDocumentCookie_(win);

  if (!cookieString) {
    return null;
  }

  var cookies = cookieString.split(';');

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    var eq = cookie.indexOf('=');

    if (eq == -1) {
      continue;
    }

    if ((0, _url.tryDecodeUriComponent)(cookie.substring(0, eq).trim()) == name) {
      var value = cookie.substring(eq + 1).trim();
      return (0, _url.tryDecodeUriComponent)(value, value);
    }
  }

  return null;
}
/**
 * This method should not be inlined to prevent TryCatch deoptimization.
 * @param {!Window} win
 * @return {string}
 * @noinline
 */


function tryGetDocumentCookie_(win) {
  try {
    return win.document.cookie;
  } catch (e) {
    // Act as if no cookie is available. Exceptions can be thrown when
    // AMP docs are opened on origins that do not allow setting
    // cookies such as null origins.
    return '';
  }
}
/**
 * Sets the value of the cookie. The cookie access is restricted and must
 * go through the privacy review. Before using this method please file a
 * GitHub issue with "Privacy Review" label.
 *
 * @param {!Window} win
 * @param {string} name
 * @param {string} value
 * @param {time} expirationTime
 * @param {{
 *   highestAvailableDomain:(boolean|undefined),
 *   domain:(string|undefined),
 *   sameSite: (!SameSite|undefined),
 * }=} options
 *     - highestAvailableDomain: If true, set the cookie at the widest domain
 *       scope allowed by the browser. E.g. on example.com if we are currently
 *       on www.example.com.
 *     - domain: Explicit domain to set. domain overrides HigestAvailableDomain
 *     - allowOnProxyOrigin: Allow setting a cookie on the AMP Cache.
 *     - sameSite: The SameSite value to use when setting the cookie.
 */


function setCookie(win, name, value, expirationTime, options) {
  if (options === void 0) {
    options = {};
  }

  checkOriginForSettingCookie(win, options, name);
  var domain = undefined; // Respect explicitly set domain over higestAvailabeDomain

  if (options.domain) {
    domain = options.domain;
  } else if (options.highestAvailableDomain) {
    domain =
    /** @type {string} */
    getHighestAvailableDomain(win);
  }

  trySetCookie(win, name, value, expirationTime, domain, options.sameSite);
}
/**
 * Attemp to find the HighestAvailableDomain on
 * @param {!Window} win
 * @return {?string}
 */


function getHighestAvailableDomain(win) {
  // <meta name='amp-cookie-scope'>. Need to respect the meta first.
  // Note: The same logic applies to shadow docs. Where all shadow docs are
  // considered to be in the same origin. And only the <meta> from
  // shell will be respected. (Header from shadow doc will be removed)
  var metaTag = win.document.head && win.document.head.querySelector("meta[name='amp-cookie-scope']");

  if (metaTag) {
    // The content value could be an empty string. Return null instead
    var cookieScope = metaTag.getAttribute('content') || ''; // Verify the validness of the amp-cookie-scope meta value

    var sourceOrigin = (0, _url.getSourceOrigin)(win.location.href); // Verify the meta tag content value is valid

    if ((0, _string.endsWith)(sourceOrigin, '.' + cookieScope)) {
      return cookieScope;
    } else {
      // When the amp-cookie-scope value is invalid, fallback to the exact origin
      // the document is contained in.
      // sourceOrigin in the format of 'https://xxx or http://xxx'
      return sourceOrigin.split('://')[1];
    }
  }

  if (!(0, _url.isProxyOrigin)(win.location.href)) {
    var parts = win.location.hostname.split('.');
    var domain = parts[parts.length - 1];
    var testCookieName = getTempCookieName(win);

    for (var i = parts.length - 2; i >= 0; i--) {
      domain = parts[i] + '.' + domain; // Try set a cookie for testing only, expire after 1 sec

      trySetCookie(win, testCookieName, 'delete', Date.now() + 1000, domain);

      if (getCookie(win, testCookieName) == 'delete') {
        // Remove the cookie for testing
        trySetCookie(win, testCookieName, 'delete', Date.now() - 1000, domain);
        return domain;
      }
    }
  } // Proxy origin w/o <meta name='amp-cookie-scope>
  // We cannot calculate the etld+1 without the public suffix list.
  // Return null instead.
  // Note: This should not affect cookie writing because we don't allow writing
  // cookie to highestAvailableDomain on proxy origin
  // In the case of link decoration on proxy origin,
  // we expect the correct meta tag to be
  // set by publisher or cache order for AMP runtime to find all subdomains.


  return null;
}
/**
 * Attempt to set a cookie with the given params.
 *
 * @param {!Window} win
 * @param {string} name
 * @param {string} value
 * @param {time} expirationTime
 * @param {string|undefined} domain
 * @param {!SameSite=} sameSite
 */


function trySetCookie(win, name, value, expirationTime, domain, sameSite) {
  // We do not allow setting cookies on the domain that contains both
  // the cdn. and www. hosts.
  // Note: we need to allow cdn.ampproject.org in order to optin to experiments
  if (domain == 'ampproject.org') {
    // Actively delete them.
    value = 'delete';
    expirationTime = 0;
  }

  var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + '; path=/' + (domain ? '; domain=' + domain : '') + '; expires=' + new Date(expirationTime).toUTCString() + getSameSiteString(win, sameSite);

  try {
    win.document.cookie = cookie;
  } catch (ignore) {// Do not throw if setting the cookie failed Exceptions can be thrown
    // when AMP docs are opened on origins that do not allow setting
    // cookies such as null origins.
  }
}
/**
 * Gets the cookie string to use for SameSite. This only sets the SameSite
 * value if specified, falling back to the browser default. The default value
 * is equivalent to SameSite.NONE, but is planned to be set to SameSite.LAX in
 * Chrome 80.
 *
 * Note: In Safari 12, if the value is set to SameSite.NONE, it is treated by
 * the browser as SameSite.STRICT.
 * @param {Window} win
 * @param {!SameSite|undefined} sameSite
 * @return {string} The string to use when setting the cookie.
 */


function getSameSiteString(win, sameSite) {
  if (!sameSite) {
    return '';
  }

  return "; SameSite=" + sameSite;
}
/**
 * Throws if a given cookie should not be set on the given origin.
 * This is a defense-in-depth. Callers should never run into this.
 *
 * @param {!Window} win
 * @param {!Object} options
 * @param {string} name For the error message.
 */


function checkOriginForSettingCookie(win, options, name) {
  if (options.allowOnProxyOrigin) {
    (0, _log.userAssert)(!options.highestAvailableDomain, 'Could not support higestAvailable Domain on proxy origin, ' + 'specify domain explicitly');
    return;
  }

  (0, _log.userAssert)(!(0, _url.isProxyOrigin)(win.location.href), "Should never attempt to set cookie on proxy origin: " + name);
  var current = (0, _url.parseUrlDeprecated)(win.location.href).hostname.toLowerCase();
  var proxy = (0, _url.parseUrlDeprecated)(_config.urls.cdn).hostname.toLowerCase();
  (0, _log.userAssert)(!(current == proxy || (0, _string.endsWith)(current, '.' + proxy)), 'Should never attempt to set cookie on proxy origin. (in depth check): ' + name);
}
/**
 * Return a temporary cookie name for testing only
 * @param {!Window} win
 * @return {string}
 */


function getTempCookieName(win) {
  var testCookieName = TEST_COOKIE_NAME;
  var counter = 0;

  while (getCookie(win, testCookieName)) {
    // test cookie name conflict, append counter to test cookie name
    testCookieName = TEST_COOKIE_NAME + counter;
  }

  return testCookieName;
}

},{"./config":106,"./log":125,"./string":143,"./url":148}],110:[function(require,module,exports){
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

},{"../third_party/css-escape/css-escape":159,"./log":125}],111:[function(require,module,exports){
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

},{"./css":110,"./log":125,"./string":143,"./types":145,"./utils/object":154,"./utils/promise":156}],112:[function(require,module,exports){
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

},{"./dom":111,"./log":125,"./service":131,"./types":145}],113:[function(require,module,exports){
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

},{}],114:[function(require,module,exports){
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

},{"./dom":111,"./event-helper-listen":113,"./log":125}],115:[function(require,module,exports){
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

},{"./log":125,"./mode":127,"./url":148,"./utils/object":154}],116:[function(require,module,exports){
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

},{"./3p-frame-messaging":103,"./dom":111,"./event-helper":114,"./json":122,"./log":125,"./style":144,"./url":148,"./utils/array":149,"./utils/object":154}],117:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getTrackImpressionPromise = getTrackImpressionPromise;
exports.resetTrackImpressionPromiseForTesting = resetTrackImpressionPromiseForTesting;
exports.maybeTrackImpression = maybeTrackImpression;
exports.doNotTrackImpression = doNotTrackImpression;
exports.isTrustedReferrer = isTrustedReferrer;
exports.shouldAppendExtraParams = shouldAppendExtraParams;
exports.getExtraParamsUrl = getExtraParamsUrl;

var _promise = require("./utils/promise");

var _services = require("./services");

var _url = require("./url");

var _log = require("./log");

var _mode = require("./mode");

var _experiments = require("./experiments");

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
var TIMEOUT_VALUE = 8000;
var trackImpressionPromise = null;
var DEFAULT_APPEND_URL_PARAM = ['gclid', 'gclsrc'];
/**
 * These domains are trusted with more sensitive viewer operations such as
 * sending impression requests. If you believe your domain should be here,
 * file the issue on GitHub to discuss. The process will be similar
 * (but somewhat more stringent) to the one described in the [3p/README.md](
 * https://github.com/ampproject/amphtml/blob/master/3p/README.md)
 *
 * @export {!Array<!RegExp>}
 */

var TRUSTED_REFERRER_HOSTS = [
/**
 * Twitter's link wrapper domains:
 * - t.co
 */
/^t.co$/];
/**
 * A function to get the trackImpressionPromise;
 * @return {!Promise}
 */

function getTrackImpressionPromise() {
  return (0, _log.userAssert)(trackImpressionPromise, 'E#19457 trackImpressionPromise');
}
/**
 * Function that reset the trackImpressionPromise only for testing
 * @visibleForTesting
 */


function resetTrackImpressionPromiseForTesting() {
  trackImpressionPromise = null;
}
/**
 * Emit a HTTP request to a destination defined on the incoming URL.
 * Launched for trusted viewer. Otherwise guarded by experiment.
 * @param {!Window} win
 */


function maybeTrackImpression(win) {
  var deferred = new _promise.Deferred();
  var promise = deferred.promise,
      resolveImpression = deferred.resolve;
  trackImpressionPromise = _services.Services.timerFor(win).timeoutPromise(TIMEOUT_VALUE, promise, 'TrackImpressionPromise timeout').catch(function (error) {
    (0, _log.dev)().warn('IMPRESSION', error);
  });

  var viewer = _services.Services.viewerForDoc(win.document.documentElement);

  var isTrustedViewerPromise = viewer.isTrustedViewer();
  var isTrustedReferrerPromise = viewer.getReferrerUrl().then(function (referrer) {
    return isTrustedReferrer(referrer);
  });
  Promise.all([isTrustedViewerPromise, isTrustedReferrerPromise]).then(function (results) {
    var isTrustedViewer = results[0];
    var isTrustedReferrer = results[1]; // Enable the feature in the case of trusted viewer,
    // or trusted referrer
    // or with experiment turned on

    if (!isTrustedViewer && !isTrustedReferrer && !(0, _experiments.isExperimentOn)(win, 'alp')) {
      resolveImpression();
      return;
    }

    var replaceUrlPromise = handleReplaceUrl(win);
    var clickUrlPromise = handleClickUrl(win);
    Promise.all([replaceUrlPromise, clickUrlPromise]).then(function () {
      resolveImpression();
    }, function () {});
  });
}
/**
 * Signal that impression tracking is not relevant in this environment.
 */


function doNotTrackImpression() {
  trackImpressionPromise = Promise.resolve();
}
/**
 * Handle the getReplaceUrl and return a promise when url is replaced Only
 * handles replaceUrl when viewer indicates AMP to do so. Viewer should indicate
 * by setting the legacy replaceUrl init param and add `replaceUrl` to its
 * capability param. Future plan is to change the type of legacy init replaceUrl
 * param from url string to boolean value. Please NOTE replaceUrl and adLocation
 * will never arrive at same time, so there is no race condition on the order of
 * handling url replacement.
 * @param {!Window} win
 * @return {!Promise}
 */


function handleReplaceUrl(win) {
  var viewer = _services.Services.viewerForDoc(win.document.documentElement); // ReplaceUrl substitution doesn't have to wait until the document is visible


  if (!viewer.getParam('replaceUrl')) {
    // The init replaceUrl param serve as a signal on whether replaceUrl is
    // required for this doc.
    return Promise.resolve();
  }

  if (!viewer.hasCapability('replaceUrl')) {
    // If Viewer is not capability of providing async replaceUrl, use the legacy
    // init replaceUrl param.
    viewer.replaceUrl(viewer.getParam('replaceUrl') || null);
    return Promise.resolve();
  } // request async replaceUrl is viewer support getReplaceUrl.


  return viewer.sendMessageAwaitResponse('getReplaceUrl',
  /* data */
  undefined).then(function (response) {
    if (!response || typeof response != 'object') {
      (0, _log.dev)().warn('IMPRESSION', 'get invalid replaceUrl response');
      return;
    }

    viewer.replaceUrl(response['replaceUrl'] || null);
  }, function (err) {
    (0, _log.dev)().warn('IMPRESSION', 'Error request replaceUrl from viewer', err);
  });
}
/**
 * @param {string} referrer
 * @return {boolean}
 * @visibleForTesting
 */


function isTrustedReferrer(referrer) {
  var url = (0, _url.parseUrlDeprecated)(referrer);

  if (url.protocol != 'https:') {
    return false;
  }

  return TRUSTED_REFERRER_HOSTS.some(function (th) {
    return th.test(url.hostname);
  });
}
/**
 * Perform the impression request if it has been provided via
 * the click param in the viewer arguments. Returns a promise.
 * @param {!Window} win
 * @return {!Promise}
 */


function handleClickUrl(win) {
  var ampdoc = _services.Services.ampdoc(win.document.documentElement);

  var viewer = _services.Services.viewerForDoc(ampdoc);
  /** @const {?string} */


  var clickUrl = viewer.getParam('click');

  if (!clickUrl) {
    return Promise.resolve();
  }

  if (clickUrl.indexOf('https://') != 0) {
    (0, _log.user)().warn('IMPRESSION', 'click fragment param should start with https://. Found ', clickUrl);
    return Promise.resolve();
  }

  if (win.location.hash) {
    // This is typically done using replaceState inside the viewer.
    // If for some reason it failed, get rid of the fragment here to
    // avoid duplicate tracking.
    win.location.hash = '';
  } // TODO(@zhouyx) need test with a real response.


  return ampdoc.whenFirstVisible().then(function () {
    return invoke(win, (0, _log.dev)().assertString(clickUrl));
  }).then(function (response) {
    applyResponse(win, response);
  }).catch(function (err) {
    (0, _log.user)().warn('IMPRESSION', 'Error on request clickUrl: ', err);
  });
}
/**
 * Send the url to ad server and wait for its response
 * @param {!Window} win
 * @param {string} clickUrl
 * @return {!Promise<?JsonObject>}
 */


function invoke(win, clickUrl) {
  if ((0, _mode.getMode)().localDev && !(0, _mode.getMode)().test) {
    clickUrl = 'http://localhost:8000/impression-proxy?url=' + clickUrl;
  }

  return _services.Services.xhrFor(win).fetchJson(clickUrl, {
    credentials: 'include'
  }).then(function (res) {
    // Treat 204 no content response specially
    if (res.status == 204) {
      return null;
    }

    return res.json();
  });
}
/**
 * parse the response back from ad server
 * Set for analytics purposes
 * @param {!Window} win
 * @param {?JsonObject} response
 */


function applyResponse(win, response) {
  if (!response) {
    return;
  }

  var adLocation = response['location'];
  var adTracking = response['tracking_url']; // If there is a tracking_url, need to track it
  // Otherwise track the location

  var trackUrl = adTracking || adLocation;

  if (trackUrl && !(0, _url.isProxyOrigin)(trackUrl)) {
    // To request the provided trackUrl for tracking purposes.
    new Image().src = trackUrl;
  } // Replace the location href params with new location params we get (if any).


  if (adLocation) {
    if (!win.history.replaceState) {
      return;
    }

    var viewer = _services.Services.viewerForDoc(win.document.documentElement);

    var currentHref = win.location.href;
    var url = (0, _url.parseUrlDeprecated)(adLocation);
    var params = (0, _url.parseQueryString)(url.search);
    var newHref = (0, _url.addParamsToUrl)(currentHref, params); // TODO: Avoid overwriting the fragment parameter.

    win.history.replaceState(null, '', newHref);
    viewer.maybeUpdateFragmentForCct();
  }
}
/**
 * Return a promise that whether appending extra url params to outgoing link is
 * required.
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<boolean>}
 */


function shouldAppendExtraParams(ampdoc) {
  return ampdoc.whenReady().then(function () {
    return !!ampdoc.getBody().querySelector('amp-analytics[type=googleanalytics]');
  });
}
/**
 * Return the extra url params string that should be appended to outgoing link
 * @param {!Window} win
 * @param {!Element} target
 * @return {string}
 */


function getExtraParamsUrl(win, target) {
  // Get an array with extra params that needs to append.
  var url = (0, _url.parseUrlDeprecated)(win.location.href);
  var params = (0, _url.parseQueryString)(url.search);
  var appendParams = [];

  for (var i = 0; i < DEFAULT_APPEND_URL_PARAM.length; i++) {
    var param = DEFAULT_APPEND_URL_PARAM[i];

    if (typeof params[param] !== 'undefined') {
      appendParams.push(param);
    }
  } // Check if the param already exists


  var additionalUrlParams = target.getAttribute('data-amp-addparams');
  var href = target.href;

  if (additionalUrlParams) {
    href = (0, _url.addParamsToUrl)(href, (0, _url.parseQueryString)(additionalUrlParams));
  }

  var loc = (0, _url.parseUrlDeprecated)(href);
  var existParams = (0, _url.parseQueryString)(loc.search);

  for (var _i = appendParams.length - 1; _i >= 0; _i--) {
    var _param = appendParams[_i];

    if (typeof existParams[_param] !== 'undefined') {
      appendParams.splice(_i, 1);
    }
  }

  return getQueryParamUrl(appendParams);
}
/**
 * Helper method to convert an query param array to string
 * @param {!Array<string>} params
 * @return {string}
 */


function getQueryParamUrl(params) {
  var url = '';

  for (var i = 0; i < params.length; i++) {
    var param = params[i];
    url += i == 0 ? param + "=QUERY_PARAM(" + param + ")" : "&" + param + "=QUERY_PARAM(" + param + ")";
  }

  return url;
}

},{"./experiments":115,"./log":125,"./mode":127,"./services":141,"./url":148,"./utils/promise":156}],118:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ExitInterface = exports.FullscreenInterface = exports.VisibilityDataDef = exports.VisibilityInterface = exports.HostServices = exports.HostServiceError = void 0;

var _services = require("../services");

var _service = require("../service");

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
var ServiceNames = {
  VISIBILITY: 'host-visibility',
  FULLSCREEN: 'host-fullscreen',
  EXIT: 'host-exit'
};
/**
 * Error object for various host services. It is passed around in case
 * of host service failures for proper error handling.
 *
 * - fallback: if the caller should fallback to other impl
 *
 * @typedef {{
 *   fallback: boolean
 * }}
 */

var HostServiceError;
/**
 * A set of service interfaces that is used when the AMP document is loaded
 * in an environment that does not provide regular web APIs for things like
 * - open URL
 * - scroll events, IntersectionObserver
 * - expand to fullscreen
 *
 * The consumers of those services should get the service by calling
 * XXXForDoc(), which returns a Promise that resolves to the service Object,
 * or gets rejected with an error Object. (See HostServiceError)
 *
 * The providers of those services should install the service by calling
 * installXXXServiceForDoc() when it's available, or
 * rejectXXXServiceForDoc() when there is a failure.
 */

exports.HostServiceError = HostServiceError;

var HostServices =
/*#__PURE__*/
function () {
  function HostServices() {}

  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {boolean}
   */
  HostServices.isAvailable = function isAvailable(elementOrAmpDoc) {
    var head = _services.Services.ampdoc(elementOrAmpDoc).getHeadNode();

    return !!head.querySelector('script[host-service]');
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!VisibilityInterface>}
   */
  ;

  HostServices.visibilityForDoc = function visibilityForDoc(elementOrAmpDoc) {
    return (
      /** @type {!Promise<!VisibilityInterface>} */
      (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, ServiceNames.VISIBILITY)
    );
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {function(new:Object, !../service/ampdoc-impl.AmpDoc)} impl
   */
  ;

  HostServices.installVisibilityServiceForDoc = function installVisibilityServiceForDoc(elementOrAmpDoc, impl) {
    (0, _service.registerServiceBuilderForDoc)(elementOrAmpDoc, ServiceNames.VISIBILITY, impl,
    /* opt_instantiate */
    true);
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!HostServiceError} error
   */
  ;

  HostServices.rejectVisibilityServiceForDoc = function rejectVisibilityServiceForDoc(elementOrAmpDoc, error) {
    (0, _service.rejectServicePromiseForDoc)(elementOrAmpDoc, ServiceNames.VISIBILITY, error);
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!FullscreenInterface>}
   */
  ;

  HostServices.fullscreenForDoc = function fullscreenForDoc(elementOrAmpDoc) {
    return (
      /** @type {!Promise<!FullscreenInterface>} */
      (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, ServiceNames.FULLSCREEN)
    );
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {function(new:Object, !../service/ampdoc-impl.AmpDoc)} impl
   */
  ;

  HostServices.installFullscreenServiceForDoc = function installFullscreenServiceForDoc(elementOrAmpDoc, impl) {
    (0, _service.registerServiceBuilderForDoc)(elementOrAmpDoc, ServiceNames.FULLSCREEN, impl,
    /* opt_instantiate */
    true);
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!HostServiceError} error
   */
  ;

  HostServices.rejectFullscreenServiceForDoc = function rejectFullscreenServiceForDoc(elementOrAmpDoc, error) {
    (0, _service.rejectServicePromiseForDoc)(elementOrAmpDoc, ServiceNames.FULLSCREEN, error);
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @return {!Promise<!ExitInterface>}
   */
  ;

  HostServices.exitForDoc = function exitForDoc(elementOrAmpDoc) {
    return (
      /** @type {!Promise<!ExitInterface>} */
      (0, _service.getServicePromiseForDoc)(elementOrAmpDoc, ServiceNames.EXIT)
    );
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {function(new:Object, !../service/ampdoc-impl.AmpDoc)} impl
   */
  ;

  HostServices.installExitServiceForDoc = function installExitServiceForDoc(elementOrAmpDoc, impl) {
    (0, _service.registerServiceBuilderForDoc)(elementOrAmpDoc, ServiceNames.EXIT, impl,
    /* opt_instantiate */
    true);
  }
  /**
   * @param {!Element|!../service/ampdoc-impl.AmpDoc} elementOrAmpDoc
   * @param {!HostServiceError} error
   */
  ;

  HostServices.rejectExitServiceForDoc = function rejectExitServiceForDoc(elementOrAmpDoc, error) {
    (0, _service.rejectServicePromiseForDoc)(elementOrAmpDoc, ServiceNames.EXIT, error);
  };

  return HostServices;
}();
/**
 * VisibilityInterface defines interface provided by host for visibility
 * detection.
 *
 * @interface
 */


exports.HostServices = HostServices;

var VisibilityInterface =
/*#__PURE__*/
function () {
  function VisibilityInterface() {}

  var _proto = VisibilityInterface.prototype;

  /**
   * Register a callback for visibility change events.
   *
   * @param {function(!VisibilityDataDef)} unusedCallback
   */
  _proto.onVisibilityChange = function onVisibilityChange(unusedCallback) {};

  return VisibilityInterface;
}();
/**
 * The structure that combines position and size for an element. The exact
 * interpretation of position and size depends on the use case.
 *
 * @typedef {{
 *   visibleRect: (?../layout-rect.LayoutRectDef),
 *   visibleRatio: number
 * }}
 */


exports.VisibilityInterface = VisibilityInterface;
var VisibilityDataDef;
/**
 * FullscreenInterface defines interface provided by host to enable/disable
 * fullscreen mode.
 *
 * @interface
 */

exports.VisibilityDataDef = VisibilityDataDef;

var FullscreenInterface =
/*#__PURE__*/
function () {
  function FullscreenInterface() {}

  var _proto2 = FullscreenInterface.prototype;

  /**
   * Request to expand the given element to fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  _proto2.enterFullscreenOverlay = function enterFullscreenOverlay(unusedTargetElement) {}
  /**
   * Request to exit from fullscreen overlay.
   *
   * @param {!Element} unusedTargetElement
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  ;

  _proto2.exitFullscreenOverlay = function exitFullscreenOverlay(unusedTargetElement) {};

  return FullscreenInterface;
}();
/**
 * ExitInterface defines interface provided by host for navigating out.
 *
 * @interface
 */


exports.FullscreenInterface = FullscreenInterface;

var ExitInterface =
/*#__PURE__*/
function () {
  function ExitInterface() {}

  var _proto3 = ExitInterface.prototype;

  /**
   * Request to navigate to URL.
   *
   * @param {string} unusedUrl
   * @return {!Promise<boolean>} promise resolves to a boolean
   *     indicating if the request was fulfilled
   */
  _proto3.openUrl = function openUrl(unusedUrl) {};

  return ExitInterface;
}();

exports.ExitInterface = ExitInterface;

},{"../service":131,"../services":141}],119:[function(require,module,exports){
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

},{"./service/resources-interface":139,"./services":141}],120:[function(require,module,exports){
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

},{}],121:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.getIntersectionChangeEntry = getIntersectionChangeEntry;
exports.nativeIntersectionObserverSupported = nativeIntersectionObserverSupported;
exports.intersectionRatio = intersectionRatio;
exports.getThresholdSlot = getThresholdSlot;
exports.IntersectionObserverPolyfill = exports.IntersectionObserverApi = exports.DEFAULT_THRESHOLD = exports.DOMRect = void 0;

var _pass = require("./pass");

var _services = require("./services");

var _iframeHelper = require("./iframe-helper");

var _log = require("./log");

var _object = require("./utils/object");

var _types = require("./types");

var _layoutRect = require("./layout-rect");

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
exports.DOMRect = DOMRect;
var DEFAULT_THRESHOLD = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];
/** @typedef {{
 *    element: !Element,
 *    currentThresholdSlot: number,
 *  }}
 */

exports.DEFAULT_THRESHOLD = DEFAULT_THRESHOLD;
var ElementIntersectionStateDef;
/** @const @private */

var TAG = 'INTERSECTION-OBSERVER';
/** @const @private */

var INIT_TIME = Date.now();
/**
 * A function to get the element's current IntersectionObserverEntry
 * regardless of the intersetion ratio. Only available when element is not
 * nested in a container iframe.
 * TODO: support opt_iframe if there's valid use cases.
 * @param {!./layout-rect.LayoutRectDef} element element's rect
 * @param {?./layout-rect.LayoutRectDef} owner element's owner rect
 * @param {!./layout-rect.LayoutRectDef} hostViewport hostViewport's rect
 * @return {!IntersectionObserverEntry} A change entry.
 */

function getIntersectionChangeEntry(element, owner, hostViewport) {
  var intersection = (0, _layoutRect.rectIntersection)(element, owner, hostViewport) || (0, _layoutRect.layoutRectLtwh)(0, 0, 0, 0);
  var ratio = intersectionRatio(intersection, element);
  return calculateChangeEntry(element, hostViewport, intersection, ratio);
}
/**
 * @param {!Window} win
 * @return {boolean}
 */


function nativeIntersectionObserverSupported(win) {
  return 'IntersectionObserver' in win && 'IntersectionObserverEntry' in win && 'intersectionRatio' in win.IntersectionObserverEntry.prototype;
}
/**
 * A class to help amp-iframe and amp-ad nested iframe listen to intersection
 * change.
 */


var IntersectionObserverApi =
/*#__PURE__*/
function () {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} iframe
   * @param {boolean=} opt_is3p
   */
  function IntersectionObserverApi(baseElement, iframe, opt_is3p) {
    var _this = this;

    /** @private @const {!AMP.BaseElement} */
    this.baseElement_ = baseElement;
    /** @private {?IntersectionObserverPolyfill} */

    this.intersectionObserver_ = null;
    /** @private {boolean} */

    this.shouldObserve_ = false;
    /** @private {boolean} */

    this.isInViewport_ = false;
    /** @private {?function()} */

    this.unlistenOnDestroy_ = null;
    /** @private {!./service/viewport/viewport-interface.ViewportInterface} */

    this.viewport_ = baseElement.getViewport();
    /** @private {?SubscriptionApi} */

    this.subscriptionApi_ = new _iframeHelper.SubscriptionApi(iframe, 'send-intersections', opt_is3p || false, function () {
      _this.startSendingIntersection_();
    });
    this.intersectionObserver_ = new IntersectionObserverPolyfill(function (entries) {
      // Remove target info from cross origin iframe.
      for (var i = 0; i < entries.length; i++) {
        delete entries[i]['target'];
      }

      _this.subscriptionApi_.send('intersection', (0, _object.dict)({
        'changes': entries
      }));
    }, {
      threshold: DEFAULT_THRESHOLD
    });
    this.intersectionObserver_.tick(this.viewport_.getRect());
    /** @const {function()} */

    this.fire = function () {
      if (!_this.shouldObserve_ || !_this.isInViewport_) {
        return;
      }

      _this.intersectionObserver_.tick(_this.viewport_.getRect());
    };
  }
  /**
   * Function to start listening to viewport event. and observer intersection
   * change on the element.
   */


  var _proto = IntersectionObserverApi.prototype;

  _proto.startSendingIntersection_ = function startSendingIntersection_() {
    var _this2 = this;

    this.shouldObserve_ = true;
    this.intersectionObserver_.observe(this.baseElement_.element);
    this.baseElement_.getVsync().measure(function () {
      _this2.isInViewport_ = _this2.baseElement_.isInViewport();

      _this2.fire();
    });
    var unlistenViewportScroll = this.viewport_.onScroll(this.fire);
    var unlistenViewportChange = this.viewport_.onChanged(this.fire);

    this.unlistenOnDestroy_ = function () {
      unlistenViewportScroll();
      unlistenViewportChange();
    };
  }
  /**
   * Enable to the PositionObserver to listen to viewport events
   * @param {boolean} inViewport
   */
  ;

  _proto.onViewportCallback = function onViewportCallback(inViewport) {
    this.isInViewport_ = inViewport;
  }
  /**
   * Clean all listenrs
   */
  ;

  _proto.destroy = function destroy() {
    this.shouldObserve_ = false;
    this.intersectionObserver_.disconnect();
    this.intersectionObserver_ = null;

    if (this.unlistenOnDestroy_) {
      this.unlistenOnDestroy_();
      this.unlistenOnDestroy_ = null;
    }

    this.subscriptionApi_.destroy();
    this.subscriptionApi_ = null;
  };

  return IntersectionObserverApi;
}();
/**
 * The IntersectionObserverPolyfill class lets any element receive its
 * intersection data with the viewport. It acts like native browser supported
 * IntersectionObserver.
 * The IntersectionObserver receives a callback function and an optional option
 * as params. Whenever the element intersection ratio cross a threshold value,
 * IntersectionObserverPolyfill will call the provided callback function with
 * the change entry. Only Works with one document for now.
 * @visibleForTesting
 */


exports.IntersectionObserverApi = IntersectionObserverApi;

var IntersectionObserverPolyfill =
/*#__PURE__*/
function () {
  /**
   * @param {function(!Array<!IntersectionObserverEntry>)} callback
   * @param {Object=} opt_option
   */
  function IntersectionObserverPolyfill(callback, opt_option) {
    /** @private @const {function(!Array<!IntersectionObserverEntry>)} */
    this.callback_ = callback; // The input threshold can be a number or an array of numbers.

    var threshold = opt_option && opt_option.threshold;

    if (threshold) {
      threshold = (0, _types.isArray)(threshold) ? threshold : [threshold];
    } else {
      threshold = [0];
    }

    for (var i = 0; i < threshold.length; i++) {
      (0, _log.devAssert)((0, _types.isFiniteNumber)(threshold[i]), 'Threshold should be a finite number or an array of finite numbers');
    }
    /**
     * A list of threshold, sorted in increasing numeric order
     * @private @const {!Array}
     */


    this.threshold_ = threshold.sort();
    (0, _log.devAssert)(this.threshold_[0] >= 0 && this.threshold_[this.threshold_.length - 1] <= 1, 'Threshold should be in the range from "[0, 1]"');
    /** @private {?./layout-rect.LayoutRectDef} */

    this.lastViewportRect_ = null;
    /** @private {./layout-rect.LayoutRectDef|undefined} */

    this.lastIframeRect_ = undefined;
    /**
     * Store a list of observed elements and their current threshold slot which
     * their intersection ratio fills, range from [0, this.threshold_.length]
     * @private {Array<!ElementIntersectionStateDef>}
     */

    this.observeEntries_ = [];
    /**
     * Mutation observer to fire off on visibility changes
     * @private {?function()}
     */

    this.hiddenObserverUnlistener_ = null;
    /** @private {Pass} */

    this.mutationPass_ = null;
  }
  /**
   * Function to unobserve all elements.
   * and clean up the polyfill.
   */


  var _proto2 = IntersectionObserverPolyfill.prototype;

  _proto2.disconnect = function disconnect() {
    this.observeEntries_.length = 0;
    this.disconnectMutationObserver_();
  }
  /**
   * Provide a way to observe the intersection change for a specific element
   * Please note IntersectionObserverPolyfill only support AMP element now
   * TODO: Support non AMP element
   * @param {!Element} element
   */
  ;

  _proto2.observe = function observe(element) {
    // Check the element is an AMP element.
    (0, _log.devAssert)(element.getLayoutBox); // If the element already exists in current observeEntries, do nothing

    for (var i = 0; i < this.observeEntries_.length; i++) {
      if (this.observeEntries_[i].element === element) {
        (0, _log.dev)().warn(TAG, 'should observe same element once');
        return;
      }
    }

    var newState = {
      element: element,
      currentThresholdSlot: 0
    }; // Get the new observed element's first changeEntry based on last viewport

    if (this.lastViewportRect_) {
      var change = this.getValidIntersectionChangeEntry_(newState, this.lastViewportRect_, this.lastIframeRect_);

      if (change) {
        this.callback_([change]);
      }
    } // Add a mutation observer to tick ourself
    // TODO (@torch2424): Allow this to observe elements,
    // from multiple documents.


    var ampdoc = _services.Services.ampdoc(element);

    if (ampdoc.win.MutationObserver && !this.hiddenObserverUnlistener_) {
      this.mutationPass_ = new _pass.Pass(ampdoc.win, this.handleMutationObserverPass_.bind(this, element));

      var hiddenObserver = _services.Services.hiddenObserverForDoc(element);

      this.hiddenObserverUnlistener_ = hiddenObserver.add(this.handleMutationObserverNotification_.bind(this));
    } // push new observed element


    this.observeEntries_.push(newState);
  }
  /**
   * Provide a way to unobserve intersection change for a specified element
   * @param {!Element} element
   */
  ;

  _proto2.unobserve = function unobserve(element) {
    // find the unobserved element in observeEntries
    for (var i = 0; i < this.observeEntries_.length; i++) {
      if (this.observeEntries_[i].element === element) {
        this.observeEntries_.splice(i, 1);

        if (this.observeEntries_.length <= 0) {
          this.disconnectMutationObserver_();
        }

        return;
      }
    }

    (0, _log.dev)().warn(TAG, 'unobserve non-observed element');
  }
  /**
   * Tick function that update the DOMRect of the root of observed elements.
   * Caller needs to make sure to pass in the correct container.
   * Note: the opt_iframe param is the iframe position relative to the host doc,
   * The iframe must be a non-scrollable iframe.
   * @param {!./layout-rect.LayoutRectDef} hostViewport
   * @param {./layout-rect.LayoutRectDef=} opt_iframe
   */
  ;

  _proto2.tick = function tick(hostViewport, opt_iframe) {
    if (opt_iframe) {
      // If element inside an iframe. Adjust origin to the iframe.left/top.
      hostViewport = (0, _layoutRect.moveLayoutRect)(hostViewport, -opt_iframe.left, -opt_iframe.top);
      opt_iframe = (0, _layoutRect.moveLayoutRect)(opt_iframe, -opt_iframe.left, -opt_iframe.top);
    }

    this.lastViewportRect_ = hostViewport;
    this.lastIframeRect_ = opt_iframe;
    var changes = [];

    for (var i = 0; i < this.observeEntries_.length; i++) {
      var change = this.getValidIntersectionChangeEntry_(this.observeEntries_[i], hostViewport, opt_iframe);

      if (change) {
        changes.push(change);
      }
    }

    if (changes.length) {
      this.callback_(changes);
    }
  }
  /**
   * Return a change entry for one element that should be compatible with
   * IntersectionObserverEntry if it's valid with current config.
   * When the new intersection ratio doesn't cross one of a threshold value,
   * the function will return null.
   *
   * @param {!ElementIntersectionStateDef} state
   * @param {!./layout-rect.LayoutRectDef} hostViewport hostViewport's rect
   * @param {./layout-rect.LayoutRectDef=} opt_iframe iframe container rect
   *    If opt_iframe is provided, all LayoutRect has position relative to
   *    the iframe. If opt_iframe is not provided,
   *    all LayoutRect has position relative to the host document.
   * @return {?IntersectionObserverEntry} A valid change entry or null if ratio
   * @private
   */
  ;

  _proto2.getValidIntersectionChangeEntry_ = function getValidIntersectionChangeEntry_(state, hostViewport, opt_iframe) {
    var element = state.element;
    var elementRect = element.getLayoutBox();
    var owner = element.getOwner();
    var ownerRect = owner && owner.getLayoutBox(); // calculate intersectionRect. that the element intersects with hostViewport
    // and intersects with owner element and container iframe if exists.

    var intersectionRect = (0, _layoutRect.rectIntersection)(elementRect, ownerRect, hostViewport, opt_iframe) || (0, _layoutRect.layoutRectLtwh)(0, 0, 0, 0); // calculate ratio, call callback based on new ratio value.

    var ratio = intersectionRatio(intersectionRect, elementRect);
    var newThresholdSlot = getThresholdSlot(this.threshold_, ratio);

    if (newThresholdSlot == state.currentThresholdSlot) {
      return null;
    }

    state.currentThresholdSlot = newThresholdSlot; // To get same behavior as native IntersectionObserver set hostViewport null
    // if inside an iframe

    var changeEntry = calculateChangeEntry(elementRect, opt_iframe ? null : hostViewport, intersectionRect, ratio);
    changeEntry.target = element;
    return changeEntry;
  }
  /**
   * Handle Mutation Oberserver events
   * @private
   */
  ;

  _proto2.handleMutationObserverNotification_ = function handleMutationObserverNotification_() {
    if (this.mutationPass_.isPending()) {
      return;
    } // Wait one animation frame so that other mutations may arrive.


    this.mutationPass_.schedule(16);
  }
  /**
   * Handle Mutation Observer Pass
   * This performas the tick, and is wrapped in a paas
   * To handle throttling of the observer
   * @param {!Element} element
   * @private
   */
  ;

  _proto2.handleMutationObserverPass_ = function handleMutationObserverPass_(element) {
    var _this3 = this;

    var viewport = _services.Services.viewportForDoc(element);

    var resources = _services.Services.resourcesForDoc(element);

    resources.onNextPass(function () {
      _this3.tick(viewport.getRect());
    });
  }
  /**
   * Clean up the mutation observer
   * @private
   */
  ;

  _proto2.disconnectMutationObserver_ = function disconnectMutationObserver_() {
    if (this.hiddenObserverUnlistener_) {
      this.hiddenObserverUnlistener_();
    }

    this.hiddenObserverUnlistener_ = null;

    if (this.mutationPass_) {
      this.mutationPass_.cancel();
    }

    this.mutationPass_ = null;
  };

  return IntersectionObserverPolyfill;
}();
/**
 * Returns the ratio of the smaller box's area to the larger box's area.
 * @param {!./layout-rect.LayoutRectDef} smaller
 * @param {!./layout-rect.LayoutRectDef} larger
 * @return {number}
 * @visibleForTesting
 */


exports.IntersectionObserverPolyfill = IntersectionObserverPolyfill;

function intersectionRatio(smaller, larger) {
  var smallerBoxArea = smaller.width * smaller.height;
  var largerBoxArea = larger.width * larger.height; // Check for a divide by zero

  return largerBoxArea === 0 ? 0 : smallerBoxArea / largerBoxArea;
}
/**
 * Returns the slot number that the current ratio fills in.
 * @param {!Array} sortedThreshold valid sorted IoB threshold
 * @param {number} ratio Range from [0, 1]
 * @return {number} Range from [0, threshold.length]
 * @visibleForTesting
 */


function getThresholdSlot(sortedThreshold, ratio) {
  var startIdx = 0;
  var endIdx = sortedThreshold.length; // 0 is a special case that does not fit into [small, large) range

  if (ratio == 0) {
    return 0;
  }

  var mid = (startIdx + endIdx) / 2 | 0;

  while (startIdx < mid) {
    var midValue = sortedThreshold[mid]; // In the range of [small, large)

    if (ratio < midValue) {
      endIdx = mid;
    } else {
      startIdx = mid;
    }

    mid = (startIdx + endIdx) / 2 | 0;
  }

  return endIdx;
}
/**
 * Helper function to calculate the IntersectionObserver change entry.
 * @param {!./layout-rect.LayoutRectDef} element element's rect
 * @param {?./layout-rect.LayoutRectDef} hostViewport hostViewport's rect
 * @param {!./layout-rect.LayoutRectDef} intersection
 * @param {number} ratio
 * @return {!IntersectionObserverEntry}}
 */


function calculateChangeEntry(element, hostViewport, intersection, ratio) {
  // If element not in an iframe.
  // adjust all LayoutRect to hostViewport Origin.
  var boundingClientRect = element;
  var rootBounds = hostViewport; // If no hostViewport is provided, element is inside an non-scrollable iframe.
  // Every Layoutrect has already adjust their origin according to iframe
  // rect origin. LayoutRect position is relative to iframe origin,
  // thus relative to iframe's viewport origin because the viewport is at the
  // iframe origin. No need to adjust position here.

  if (hostViewport) {
    // If element not in an iframe.
    // adjust all LayoutRect to hostViewport Origin.
    rootBounds =
    /** @type {!./layout-rect.LayoutRectDef} */
    rootBounds;
    intersection = (0, _layoutRect.moveLayoutRect)(intersection, -hostViewport.left, -hostViewport.top); // The element is relative to (0, 0), while the viewport moves. So, we must
    // adjust.

    boundingClientRect = (0, _layoutRect.moveLayoutRect)(boundingClientRect, -hostViewport.left, -hostViewport.top); // Now, move the viewport to (0, 0)

    rootBounds = (0, _layoutRect.moveLayoutRect)(rootBounds, -hostViewport.left, -hostViewport.top);
  }

  return (
    /** @type {!IntersectionObserverEntry} */
    {
      time: typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now() - INIT_TIME,
      rootBounds: rootBounds,
      boundingClientRect: boundingClientRect,
      intersectionRect: intersection,
      intersectionRatio: ratio
    }
  );
}

},{"./iframe-helper":116,"./layout-rect":123,"./log":125,"./pass":129,"./services":141,"./types":145,"./utils/object":154}],122:[function(require,module,exports){
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

},{"./dom":111,"./types":145}],123:[function(require,module,exports){
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

},{}],124:[function(require,module,exports){
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

},{"./log":125,"./static-template":142,"./string":143,"./style":144,"./types":145}],125:[function(require,module,exports){
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

},{"./config":106,"./internal-version":120,"./mode":127,"./mode-object":126,"./types":145,"./utils/function":152}],126:[function(require,module,exports){
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

},{"./mode":127}],127:[function(require,module,exports){
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

},{"./internal-version":120,"./url-parse-query-string":146}],128:[function(require,module,exports){
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

},{}],129:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.Pass = void 0;

var _services = require("./services");

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
 * Pass class helps to manage single-pass process. A pass is scheduled using
 * delay method. Only one pass can be pending at a time. If no pass is pending
 * the process is considered to be "idle".
 */
var Pass =
/*#__PURE__*/
function () {
  /**
   * Creates a new Pass instance.
   * @param {!Window} win
   * @param {function()} handler Handler to be executed when pass is triggered.
   * @param {number=} opt_defaultDelay Default delay to be used when schedule
   *   is called without one.
   */
  function Pass(win, handler, opt_defaultDelay) {
    var _this = this;

    this.timer_ = _services.Services.timerFor(win);
    /** @private @const {function()} */

    this.handler_ = handler;
    /** @private @const {number} */

    this.defaultDelay_ = opt_defaultDelay || 0;
    /** @private {number|string} */

    this.scheduled_ = -1;
    /** @private {number} */

    this.nextTime_ = 0;
    /** @private {boolean} */

    this.running_ = false;
    /**
     * @private
     * @const {function()}
     */

    this.boundPass_ = function () {
      _this.pass_();
    };
  }
  /**
   * Whether or not a pass is currently pending.
   * @return {boolean}
   */


  var _proto = Pass.prototype;

  _proto.isPending = function isPending() {
    return this.scheduled_ != -1;
  }
  /**
   * Tries to schedule a new pass optionally with specified delay. If the new
   * requested pass is requested before the pending pass, the pending pass is
   * canceled. If the new pass is requested after the pending pass, the newly
   * requested pass is ignored.
   *
   * Returns {@code true} if the pass has been scheduled and {@code false} if
   * ignored.
   *
   * @param {number=} opt_delay Delay to schedule the pass. If not specified
   *   the default delay is used, falling back to 0.
   * @return {boolean}
   */
  ;

  _proto.schedule = function schedule(opt_delay) {
    var delay = opt_delay || this.defaultDelay_;

    if (this.running_ && delay < 10) {
      // If we get called recursively, wait at least 10ms for the next
      // execution.
      delay = 10;
    }

    var nextTime = Date.now() + delay; // Schedule anew if nothing is scheduled currently or if the new time is
    // sooner then previously requested.

    if (!this.isPending() || nextTime - this.nextTime_ < -10) {
      this.cancel();
      this.nextTime_ = nextTime;
      this.scheduled_ = this.timer_.delay(this.boundPass_, delay);
      return true;
    }

    return false;
  }
  /**
   *
   */
  ;

  _proto.pass_ = function pass_() {
    this.scheduled_ = -1;
    this.nextTime_ = 0;
    this.running_ = true;
    this.handler_();
    this.running_ = false;
  }
  /**
   * Cancels the pending pass if any.
   */
  ;

  _proto.cancel = function cancel() {
    if (this.isPending()) {
      this.timer_.cancel(this.scheduled_);
      this.scheduled_ = -1;
    }
  };

  return Pass;
}();

exports.Pass = Pass;

},{"./services":141}],130:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.createPixel = createPixel;

var _windowInterface = require("../src/window-interface");

var _dom = require("../src/dom");

var _object = require("../src/utils/object");

var _log = require("../src/log");

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
var TAG = 'pixel';
/**
 * @param {!Window} win
 * @param {string} src
 * @param {?string=} referrerPolicy
 * @return {!Element}
 */

function createPixel(win, src, referrerPolicy) {
  if (referrerPolicy && referrerPolicy !== 'no-referrer') {
    (0, _log.user)().error(TAG, 'Unsupported referrerPolicy: %s', referrerPolicy);
  }

  return referrerPolicy === 'no-referrer' ? createNoReferrerPixel(win, src) : createImagePixel(win, src);
}
/**
 * @param {!Window} win
 * @param {string} src
 * @return {!Element}
 */


function createNoReferrerPixel(win, src) {
  if (isReferrerPolicySupported()) {
    return createImagePixel(win, src, true);
  } else {
    // if "referrerPolicy" is not supported, use iframe wrapper
    // to scrub the referrer.
    var iframe = (0, _dom.createElementWithAttributes)(
    /** @type {!Document} */
    win.document, 'iframe', (0, _object.dict)({
      'src': 'about:blank',
      'style': 'display:none'
    }));
    win.document.body.appendChild(iframe);
    createImagePixel(iframe.contentWindow, src);
    return iframe;
  }
}
/**
 * @param {!Window} win
 * @param {string} src
 * @param {boolean=} noReferrer
 * @return {!Image}
 */


function createImagePixel(win, src, noReferrer) {
  if (noReferrer === void 0) {
    noReferrer = false;
  }

  var Image = _windowInterface.WindowInterface.getImage(win);

  var image = new Image();

  if (noReferrer) {
    image.referrerPolicy = 'no-referrer';
  }

  image.src = src;
  return image;
}
/**
 * Check if element attribute "referrerPolicy" is supported by the browser.
 * Safari 11.1 does not support it yet.
 *
 * @return {boolean}
 */


function isReferrerPolicySupported() {
  return 'referrerPolicy' in Image.prototype;
}

},{"../src/dom":111,"../src/log":125,"../src/utils/object":154,"../src/window-interface":158}],131:[function(require,module,exports){
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

},{"./experiments":115,"./log":125,"./types":145,"./utils/promise":156}],132:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.CacheCidApi = void 0;

var _services = require("../services");

var _log = require("../log");

var _object = require("../utils/object");

var _url = require("../url");

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
 * The Client ID service key.
 * @const @private {string}
 */
var SERVICE_KEY_ = 'AIzaSyDKtqGxnoeIqVM33Uf7hRSa3GJxuzR7mLc';
/**
 * Tag for debug logging.
 * @const @private {string}
 */

var TAG_ = 'CacheCidApi';
/**
 * The URL for the cache-served CID API.
 * @const @private {string}
 */

var CACHE_API_URL = 'https://ampcid.google.com/v1/cache:getClientId?key=';
/**
 * The XHR timeout in milliseconds for requests to the CID API.
 * @const @private {number}
 */

var TIMEOUT_ = 30000;
/**
 * Exposes CID API for cache-served pages without a viewer.
 */

var CacheCidApi =
/*#__PURE__*/
function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function CacheCidApi(ampdoc) {
    /** @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
    /** @private {!./viewer-interface.ViewerInterface} */

    this.viewer_ = _services.Services.viewerForDoc(this.ampdoc_);
    /** @private {?Promise<?string>} */

    this.publisherCidPromise_ = null;
    /** @private {!./timer-impl.Timer} */

    this.timer_ = _services.Services.timerFor(this.ampdoc_.win);
  }
  /**
   * Returns true if the page is embedded in CCT and is served by a proxy.
   * @return {boolean}
   */


  var _proto = CacheCidApi.prototype;

  _proto.isSupported = function isSupported() {
    return this.viewer_.isCctEmbedded() && this.viewer_.isProxyOrigin();
  }
  /**
   * Returns scoped CID retrieved from the Viewer.
   * @param {string} scope
   * @return {!Promise<?string>}
   */
  ;

  _proto.getScopedCid = function getScopedCid(scope) {
    var _this = this;

    if (!this.viewer_.isCctEmbedded()) {
      return (
        /** @type {!Promise<?string>} */
        Promise.resolve(null)
      );
    }

    if (!this.publisherCidPromise_) {
      var url = CACHE_API_URL + SERVICE_KEY_;
      this.publisherCidPromise_ = this.fetchCid_(url);
    }

    return this.publisherCidPromise_.then(function (publisherCid) {
      return publisherCid ? _this.scopeCid_(publisherCid, scope) : null;
    });
  }
  /**
   * Returns scoped CID retrieved from the Viewer.
   * @param {string} url
   * @param {boolean=} useAlternate
   * @return {!Promise<?string>}
   */
  ;

  _proto.fetchCid_ = function fetchCid_(url, useAlternate) {
    var _this2 = this;

    if (useAlternate === void 0) {
      useAlternate = true;
    }

    var payload = (0, _object.dict)({
      'publisherOrigin': (0, _url.getSourceOrigin)(this.ampdoc_.win.location)
    }); // Make the XHR request to the cache endpoint.

    var timeoutMessage = 'fetchCidTimeout';
    return this.timer_.timeoutPromise(TIMEOUT_, _services.Services.xhrFor(this.ampdoc_.win).fetchJson(url, {
      method: 'POST',
      ampCors: false,
      credentials: 'include',
      mode: 'cors',
      body: payload
    }), timeoutMessage).then(function (res) {
      return res.json().then(function (response) {
        if (response['optOut']) {
          return null;
        }

        var cid = response['publisherClientId'];

        if (!cid && useAlternate && response['alternateUrl']) {
          // If an alternate url is provided, try again with the alternate url
          // The client is still responsible for appending API keys to the URL.
          var alt = response['alternateUrl'] + "?key=" + SERVICE_KEY_;
          return _this2.fetchCid_((0, _log.dev)().assertString(alt), false);
        }

        return cid;
      });
    }).catch(function (e) {
      if (e && e.response) {
        e.response.json().then(function (res) {
          (0, _log.dev)().error(TAG_, JSON.stringify(res));
        });
      } else {
        var isTimeout = e && e.message == timeoutMessage;

        if (isTimeout) {
          (0, _log.dev)().expectedError(TAG_, e);
        } else {
          (0, _log.dev)().error(TAG_, e);
        }
      }

      return null;
    });
  }
  /**
   * Returns scoped CID extracted from the fetched publisherCid.
   * @param {string} publisherCid
   * @param {string} scope
   * @return {!Promise<string>}
   */
  ;

  _proto.scopeCid_ = function scopeCid_(publisherCid, scope) {
    var text = publisherCid + ';' + scope;
    return _services.Services.cryptoFor(this.ampdoc_.win).sha384Base64(text).then(function (enc) {
      return 'amp-' + enc;
    });
  };

  return CacheCidApi;
}();

exports.CacheCidApi = CacheCidApi;

},{"../log":125,"../services":141,"../url":148,"../utils/object":154}],133:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.GoogleCidApi = exports.TokenStatus = void 0;

var _services = require("../services");

var _windowInterface = require("../window-interface");

var _log = require("../log");

var _object = require("../utils/object");

var _cookies = require("../cookies");

var _url = require("../url");

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
var GOOGLE_API_URL = 'https://ampcid.google.com/v1/publisher:getClientId?key=';
var TAG = 'GoogleCidApi';
var AMP_TOKEN = 'AMP_TOKEN';
/** @enum {string} */

var TokenStatus = {
  RETRIEVING: '$RETRIEVING',
  OPT_OUT: '$OPT_OUT',
  NOT_FOUND: '$NOT_FOUND',
  ERROR: '$ERROR'
};
exports.TokenStatus = TokenStatus;
var TIMEOUT = 30000;
var HOUR = 60 * 60 * 1000;
var DAY = 24 * HOUR;
var YEAR = 365 * DAY;
/**
 * Client impl for Google CID API
 */

var GoogleCidApi =
/*#__PURE__*/
function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function GoogleCidApi(ampdoc) {
    /**
     * @private {!Window}
     */
    this.win_ = ampdoc.win;
    /**
     * @private {!./timer-impl.Timer}
     */

    this.timer_ = _services.Services.timerFor(this.win_);
    /**
     * @private {!Object<string, !Promise<?string>>}
     */

    this.cidPromise_ = {};

    var _Services$documentInf = _services.Services.documentInfoForDoc(ampdoc),
        canonicalUrl = _Services$documentInf.canonicalUrl;
    /** @private {?string} */


    this.canonicalOrigin_ = canonicalUrl ? (0, _url.parseUrlDeprecated)(canonicalUrl).origin : null;
  }
  /**
   * @param {string} apiKey
   * @param {string} scope
   * @return {!Promise<?string>}
   */


  var _proto = GoogleCidApi.prototype;

  _proto.getScopedCid = function getScopedCid(apiKey, scope) {
    var _this = this;

    if (this.cidPromise_[scope]) {
      return this.cidPromise_[scope];
    }

    var token; // Block the request if a previous request is on flight
    // Poll every 200ms. Longer interval means longer latency for the 2nd CID.

    return this.cidPromise_[scope] = this.timer_.poll(200, function () {
      token = (0, _cookies.getCookie)(_this.win_, AMP_TOKEN);
      return token !== TokenStatus.RETRIEVING;
    }).then(function () {
      if (token === TokenStatus.OPT_OUT) {
        return TokenStatus.OPT_OUT;
      } // If the page referrer is proxy origin, we force to use API even the
      // token indicates a previous fetch returned nothing


      var forceFetch = token === TokenStatus.NOT_FOUND && _this.isReferrerProxyOrigin_(); // Token is in a special state, fallback to existing cookie


      if (!forceFetch && _this.isStatusToken_(token)) {
        return null;
      }

      if (!token || _this.isStatusToken_(token)) {
        _this.persistToken_(TokenStatus.RETRIEVING, TIMEOUT);
      }

      var url = GOOGLE_API_URL + apiKey;
      return _this.fetchCid_((0, _log.dev)().assertString(url), scope, token).then(function (response) {
        var cid = _this.handleResponse_(response);

        if (!cid && response['alternateUrl']) {
          // If an alternate url is provided, try again with the alternate
          // url The client is still responsible for appending API keys to
          // the URL.
          var altUrl = response['alternateUrl'] + "?key=" + apiKey;
          return _this.fetchCid_((0, _log.dev)().assertString(altUrl), scope, token).then(_this.handleResponse_.bind(_this));
        }

        return cid;
      }).catch(function (e) {
        _this.persistToken_(TokenStatus.ERROR, TIMEOUT);

        if (e && e.response) {
          e.response.json().then(function (res) {
            (0, _log.dev)().error(TAG, JSON.stringify(res));
          });
        } else {
          (0, _log.dev)().error(TAG, e);
        }

        return null;
      });
    });
  }
  /**
   * @param {string} url
   * @param {string} scope
   * @param {?string} token
   * @return {!Promise<!JsonObject>}
   */
  ;

  _proto.fetchCid_ = function fetchCid_(url, scope, token) {
    var payload = (0, _object.dict)({
      'originScope': scope,
      'canonicalOrigin': this.canonicalOrigin_
    });

    if (token) {
      payload['securityToken'] = token;
    }

    return this.timer_.timeoutPromise(TIMEOUT, _services.Services.xhrFor(this.win_).fetchJson(url, {
      method: 'POST',
      ampCors: false,
      credentials: 'include',
      mode: 'cors',
      body: payload
    }).then(function (res) {
      return res.json();
    }));
  }
  /**
   * @param {!JsonObject} res
   * @return {?string}
   */
  ;

  _proto.handleResponse_ = function handleResponse_(res) {
    if (res['optOut']) {
      this.persistToken_(TokenStatus.OPT_OUT, YEAR);
      return TokenStatus.OPT_OUT;
    }

    if (res['clientId']) {
      this.persistToken_(res['securityToken'], YEAR);
      return res['clientId'];
    }

    if (res['alternateUrl']) {
      return null;
    }

    this.persistToken_(TokenStatus.NOT_FOUND, HOUR);
    return null;
  }
  /**
   * @param {string|undefined} tokenValue
   * @param {number} expires
   */
  ;

  _proto.persistToken_ = function persistToken_(tokenValue, expires) {
    if (tokenValue) {
      (0, _cookies.setCookie)(this.win_, AMP_TOKEN, tokenValue, this.expiresIn_(expires), {
        highestAvailableDomain: true
      });
    }
  }
  /**
   * @param {number} time
   * @return {number}
   */
  ;

  _proto.expiresIn_ = function expiresIn_(time) {
    return this.win_.Date.now() + time;
  }
  /**
   * @return {boolean}
   */
  ;

  _proto.isReferrerProxyOrigin_ = function isReferrerProxyOrigin_() {
    return (0, _url.isProxyOrigin)(_windowInterface.WindowInterface.getDocumentReferrer(this.win_));
  }
  /**
   * @param {?string} token
   * @return {boolean}
   */
  ;

  _proto.isStatusToken_ = function isStatusToken_(token) {
    return (
      /** @type {boolean} */
      token && token[0] === '$'
    );
  };

  return GoogleCidApi;
}();

exports.GoogleCidApi = GoogleCidApi;

},{"../cookies":109,"../log":125,"../services":141,"../url":148,"../utils/object":154,"../window-interface":158}],134:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.optOutOfCid = optOutOfCid;
exports.isOptedOutOfCid = isOptedOutOfCid;
exports.getProxySourceOrigin = getProxySourceOrigin;
exports.viewerBaseCid = viewerBaseCid;
exports.getRandomString64 = getRandomString64;
exports.installCidService = installCidService;
exports.cidServiceForDocForTesting = cidServiceForDocForTesting;
exports.CidDef = exports.BASE_CID_MAX_AGE_MILLIS = void 0;

var _cidApi = require("./cid-api");

var _log = require("../log");

var _cookies = require("../cookies");

var _service = require("../service");

var _url = require("../url");

var _json = require("../json");

var _cacheCidApi = require("./cache-cid-api");

var _services = require("../services");

var _viewerCidApi = require("./viewer-cid-api");

var _base = require("../utils/base64");

var _object = require("../utils/object");

var _bytes = require("../utils/bytes");

var _dom = require("../dom");

var _promise = require("../utils/promise");

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
 * @fileoverview Provides per AMP document source origin and use case
 * persistent client identifiers for use in analytics and similar use
 * cases.
 *
 * For details, see https://goo.gl/Mwaacs
 */
var ONE_DAY_MILLIS = 24 * 3600 * 1000;
/**
 * We ignore base cids that are older than (roughly) one year.
 */

var BASE_CID_MAX_AGE_MILLIS = 365 * ONE_DAY_MILLIS;
exports.BASE_CID_MAX_AGE_MILLIS = BASE_CID_MAX_AGE_MILLIS;
var SCOPE_NAME_VALIDATOR = /^[a-zA-Z0-9-_.]+$/;
var CID_OPTOUT_STORAGE_KEY = 'amp-cid-optout';
var CID_OPTOUT_VIEWER_MESSAGE = 'cidOptOut';
/**
 * Tag for debug logging.
 * @const @private {string}
 */

var TAG_ = 'CID';
/**
 * The name of the Google CID API as it appears in the meta tag to opt-in.
 * @const @private {string}
 */

var GOOGLE_CID_API_META_NAME = 'amp-google-client-id-api';
/**
 * The mapping from analytics providers to CID scopes.
 * @const @private {Object<string, string>}
 */

var CID_API_SCOPE_WHITELIST = {
  'googleanalytics': 'AMP_ECID_GOOGLE'
};
/**
 * The mapping from analytics providers to their CID API service keys.
 * @const @private {Object<string, string>}
 */

var API_KEYS = {
  'googleanalytics': 'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM'
};
/**
 * A base cid string value and the time it was last read / stored.
 * @typedef {{time: time, cid: string}}
 */

var BaseCidInfoDef;
/**
 * The "get CID" parameters.
 * - createCookieIfNotPresent: Whether CID is allowed to create a cookie when.
 *   Default value is `false`.
 * @typedef {{
 *   scope: string,
 *   createCookieIfNotPresent: (boolean|undefined),
 *   cookieName: (string|undefined),
 * }}
 */

var GetCidDef;
/**
 * @interface
 */

var CidDef =
/*#__PURE__*/
function () {
  function CidDef() {}

  var _proto = CidDef.prototype;

  /**
   * @param {!GetCidDef} unusedGetCidStruct an object provides CID scope name for
   *     proxy case and cookie name for non-proxy case.
   * @param {!Promise} unusedConsent Promise for when the user has given consent
   *     (if deemed necessary by the publisher) for use of the client
   *     identifier.
   * @param {!Promise=} opt_persistenceConsent Dedicated promise for when
   *     it is OK to persist a new tracking identifier. This could be
   *     supplied ONLY by the code that supplies the actual consent
   *     cookie.
   *     If this is given, the consent param should be a resolved promise
   *     because this call should be only made in order to get consent.
   *     The consent promise passed to other calls should then itself
   *     depend on the opt_persistenceConsent promise (and the actual
   *     consent, of course).
   * @return {!Promise<?string>} A client identifier that should be used
   *      within the current source origin and externalCidScope. Might be
   *      null if user has opted out of cid or no identifier was found
   *      or it could be made.
   *      This promise may take a long time to resolve if consent isn't
   *      given.
   */
  _proto.get = function get(unusedGetCidStruct, unusedConsent, opt_persistenceConsent) {}
  /**
   * User will be opted out of Cid issuance for all scopes.
   * When opted-out Cid service will reject all `get` requests.
   *
   * @return {!Promise}
   */
  ;

  _proto.optOut = function optOut() {};

  return CidDef;
}();
/**
 * @implements {CidDef}
 */


exports.CidDef = CidDef;

var Cid =
/*#__PURE__*/
function () {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  function Cid(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;
    /**
     * Cached base cid once read from storage to avoid repeated
     * reads.
     * @private {?Promise<string>}
     * @restricted
     */

    this.baseCid_ = null;
    /**
     * Cache to store external cids. Scope is used as the key and cookie value
     * is the value.
     * @private {!Object<string, !Promise<string>>}
     * @restricted
     */

    this.externalCidCache_ = Object.create(null);
    /**
     * @private @const {!CacheCidApi}
     */

    this.cacheCidApi_ = new _cacheCidApi.CacheCidApi(ampdoc);
    /**
     * @private {!ViewerCidApi}
     */

    this.viewerCidApi_ = new _viewerCidApi.ViewerCidApi(ampdoc);
    this.cidApi_ = new _cidApi.GoogleCidApi(ampdoc);
    /** @private {?Object<string, string>} */

    this.apiKeyMap_ = null;
  }
  /** @override */


  var _proto2 = Cid.prototype;

  _proto2.get = function get(getCidStruct, consent, opt_persistenceConsent) {
    var _this = this;

    (0, _log.userAssert)(SCOPE_NAME_VALIDATOR.test(getCidStruct.scope) && SCOPE_NAME_VALIDATOR.test(getCidStruct.cookieName), 'The CID scope and cookie name must only use the characters ' + '[a-zA-Z0-9-_.]+\nInstead found: %s', getCidStruct.scope);
    return consent.then(function () {
      return _this.ampdoc.whenFirstVisible();
    }).then(function () {
      // Check if user has globally opted out of CID, we do this after
      // consent check since user can optout during consent process.
      return isOptedOutOfCid(_this.ampdoc);
    }).then(function (optedOut) {
      if (optedOut) {
        return '';
      }

      var cidPromise = _this.getExternalCid_(getCidStruct, opt_persistenceConsent || consent); // Getting the CID might involve an HTTP request. We timeout after 10s.


      return _services.Services.timerFor(_this.ampdoc.win).timeoutPromise(10000, cidPromise, "Getting cid for \"" + getCidStruct.scope + "\" timed out").catch(function (error) {
        (0, _log.rethrowAsync)(error);
      });
    });
  }
  /** @override */
  ;

  _proto2.optOut = function optOut() {
    return optOutOfCid(this.ampdoc);
  }
  /**
   * Returns the "external cid". This is a cid for a specific purpose
   * (Say Analytics provider X). It is unique per user, userAssert, that purpose
   * and the AMP origin site.
   * @param {!GetCidDef} getCidStruct
   * @param {!Promise} persistenceConsent
   * @return {!Promise<?string>}
   */
  ;

  _proto2.getExternalCid_ = function getExternalCid_(getCidStruct, persistenceConsent) {
    var _this2 = this;

    var scope = getCidStruct.scope;
    /** @const {!Location} */

    var url = (0, _url.parseUrlDeprecated)(this.ampdoc.win.location.href);

    if (!(0, _url.isProxyOrigin)(url)) {
      var apiKey = this.isScopeOptedIn_(scope);

      if (apiKey) {
        return this.cidApi_.getScopedCid(apiKey, scope).then(function (scopedCid) {
          if (scopedCid == _cidApi.TokenStatus.OPT_OUT) {
            return null;
          }

          if (scopedCid) {
            var cookieName = getCidStruct.cookieName || scope;
            setCidCookie(_this2.ampdoc.win, cookieName, scopedCid);
            return scopedCid;
          }

          return getOrCreateCookie(_this2, getCidStruct, persistenceConsent);
        });
      }

      return getOrCreateCookie(this, getCidStruct, persistenceConsent);
    }

    return this.viewerCidApi_.isSupported().then(function (supported) {
      if (supported) {
        var _apiKey = _this2.isScopeOptedIn_(scope);

        return _this2.viewerCidApi_.getScopedCid(_apiKey, scope);
      }

      if (_this2.cacheCidApi_.isSupported() && _this2.isScopeOptedIn_(scope)) {
        return _this2.cacheCidApi_.getScopedCid(scope).then(function (scopedCid) {
          if (scopedCid) {
            return scopedCid;
          }

          return _this2.scopeBaseCid_(persistenceConsent, scope, url);
        });
      }

      return _this2.scopeBaseCid_(persistenceConsent, scope, url);
    });
  }
  /**
   *
   * @param {!Promise} persistenceConsent
   * @param {*} scope
   * @param {!Location} url
   * @return {*}
   */
  ;

  _proto2.scopeBaseCid_ = function scopeBaseCid_(persistenceConsent, scope, url) {
    var _this3 = this;

    return getBaseCid(this, persistenceConsent).then(function (baseCid) {
      return _services.Services.cryptoFor(_this3.ampdoc.win).sha384Base64(baseCid + getProxySourceOrigin(url) + scope);
    });
  }
  /**
   * Checks if the page has opted in CID API for the given scope.
   * Returns the API key that should be used, or null if page hasn't opted in.
   *
   * @param {string} scope
   * @return {string|undefined}
   */
  ;

  _proto2.isScopeOptedIn_ = function isScopeOptedIn_(scope) {
    if (!this.apiKeyMap_) {
      this.apiKeyMap_ = this.getOptedInScopes_();
    }

    return this.apiKeyMap_[scope];
  }
  /**
   * Reads meta tags for opted in scopes.  Meta tags will have the form
   * <meta name="provider-api-name" content="provider-name">
   * @return {!Object<string, string>}
   */
  ;

  _proto2.getOptedInScopes_ = function getOptedInScopes_() {
    var apiKeyMap = {};
    var optInMeta = this.ampdoc.win.document.head.
    /*OK*/
    querySelector("meta[name=" + GOOGLE_CID_API_META_NAME + "]");

    if (optInMeta && optInMeta.hasAttribute('content')) {
      var list = optInMeta.getAttribute('content').split(',');
      list.forEach(function (item) {
        item = item.trim();

        if (item.indexOf('=') > 0) {
          var pair = item.split('=');
          var scope = pair[0].trim();
          apiKeyMap[scope] = pair[1].trim();
        } else {
          var clientName = item;
          var _scope = CID_API_SCOPE_WHITELIST[clientName];

          if (_scope) {
            apiKeyMap[_scope] = API_KEYS[clientName];
          } else {
            (0, _log.user)().warn(TAG_, "Unsupported client for Google CID API: " + clientName + "." + ("Please remove or correct " + optInMeta.
            /*OK*/
            outerHTML));
          }
        }
      });
    }

    return apiKeyMap;
  };

  return Cid;
}();
/**
 * User will be opted out of Cid issuance for all scopes.
 * When opted-out Cid service will reject all `get` requests.
 *
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise}
 * @visibleForTesting
 */


function optOutOfCid(ampdoc) {
  // Tell the viewer that user has opted out.
  _services.Services.viewerForDoc(ampdoc).
  /*OK*/
  sendMessage(CID_OPTOUT_VIEWER_MESSAGE, (0, _object.dict)()); // Store the optout bit in storage


  return _services.Services.storageForDoc(ampdoc).then(function (storage) {
    return storage.set(CID_OPTOUT_STORAGE_KEY, true);
  });
}
/**
 * Whether user has opted out of Cid issuance for all scopes.
 *
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<boolean>}
 * @visibleForTesting
 */


function isOptedOutOfCid(ampdoc) {
  return _services.Services.storageForDoc(ampdoc).then(function (storage) {
    return storage.get(CID_OPTOUT_STORAGE_KEY).then(function (val) {
      return !!val;
    });
  }).catch(function () {
    // If we fail to read the flag, assume not opted out.
    return false;
  });
}
/**
 * Sets a new CID cookie for expire 1 year from now.
 * @param {!Window} win
 * @param {string} scope
 * @param {string} cookie
 */


function setCidCookie(win, scope, cookie) {
  var expiration = Date.now() + BASE_CID_MAX_AGE_MILLIS;
  (0, _cookies.setCookie)(win, scope, cookie, expiration, {
    highestAvailableDomain: true
  });
}
/**
 * If cookie exists it's returned immediately. Otherwise, if instructed, the
 * new cookie is created.
 *
 * @param {!Cid} cid
 * @param {!GetCidDef} getCidStruct
 * @param {!Promise} persistenceConsent
 * @return {!Promise<?string>}
 */


function getOrCreateCookie(cid, getCidStruct, persistenceConsent) {
  var win = cid.ampdoc.win;
  var scope = getCidStruct.scope;
  var cookieName = getCidStruct.cookieName || scope;
  var existingCookie = (0, _cookies.getCookie)(win, cookieName);

  if (!existingCookie && !getCidStruct.createCookieIfNotPresent) {
    return (
      /** @type {!Promise<?string>} */
      Promise.resolve(null)
    );
  }

  if (cid.externalCidCache_[scope]) {
    return (
      /** @type {!Promise<?string>} */
      cid.externalCidCache_[scope]
    );
  }

  if (existingCookie) {
    // If we created the cookie, update it's expiration time.
    if (/^amp-/.test(existingCookie)) {
      setCidCookie(win, cookieName, existingCookie);
    }

    return (
      /** @type {!Promise<?string>} */
      Promise.resolve(existingCookie)
    );
  }

  var newCookiePromise = getRandomString64(win) // Create new cookie, always prefixed with "amp-", so that we can see from
  // the value whether we created it.
  .then(function (randomStr) {
    return 'amp-' + randomStr;
  }); // Store it as a cookie based on the persistence consent.

  Promise.all([newCookiePromise, persistenceConsent]).then(function (results) {
    // The initial CID generation is inherently racy. First one that gets
    // consent wins.
    var newCookie = results[0];
    var relookup = (0, _cookies.getCookie)(win, cookieName);

    if (!relookup) {
      setCidCookie(win, cookieName, newCookie);
    }
  });
  return cid.externalCidCache_[scope] = newCookiePromise;
}
/**
 * Returns the source origin of an AMP document for documents served
 * on a proxy origin. Throws an error if the doc is not on a proxy origin.
 * @param {!Location} url URL of an AMP document.
 * @return {string} The source origin of the URL.
 * @visibleForTesting BUT if this is needed elsewhere it could be
 *     factored into its own package.
 */


function getProxySourceOrigin(url) {
  (0, _log.userAssert)((0, _url.isProxyOrigin)(url), 'Expected proxy origin %s', url.origin);
  return (0, _url.getSourceOrigin)(url);
}
/**
 * Returns the base cid for the current user(). This string must not
 * be exposed to users without hashing with the current source origin
 * and the externalCidScope.
 * On a proxy this value is the same for a user across all source
 * origins.
 * @param {!Cid} cid
 * @param {!Promise} persistenceConsent
 * @return {!Promise<string>}
 */


function getBaseCid(cid, persistenceConsent) {
  if (cid.baseCid_) {
    return cid.baseCid_;
  }

  var win = cid.ampdoc.win;
  return cid.baseCid_ = read(cid.ampdoc).then(function (stored) {
    var needsToStore = false;
    var baseCid; // See if we have a stored base cid and whether it is still valid
    // in terms of expiration.

    if (stored && !isExpired(stored)) {
      baseCid = Promise.resolve(stored.cid);

      if (shouldUpdateStoredTime(stored)) {
        needsToStore = true;
      }
    } else {
      // We need to make a new one.
      baseCid = _services.Services.cryptoFor(win).sha384Base64(getEntropy(win));
      needsToStore = true;
    }

    if (needsToStore) {
      baseCid.then(function (baseCid) {
        store(cid.ampdoc, persistenceConsent, baseCid);
      });
    }

    return baseCid;
  });
}
/**
 * Stores a new cidString in localStorage. Adds the current time to the
 * stored value.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Promise} persistenceConsent
 * @param {string} cidString Actual cid string to store.
 */


function store(ampdoc, persistenceConsent, cidString) {
  var win = ampdoc.win;

  if ((0, _dom.isIframed)(win)) {
    // If we are being embedded, try to save the base cid to the viewer.
    viewerBaseCid(ampdoc, createCidData(cidString));
  } else {
    // To use local storage, we need user's consent.
    persistenceConsent.then(function () {
      try {
        win.localStorage.setItem('amp-cid', createCidData(cidString));
      } catch (ignore) {// Setting localStorage may fail. In practice we don't expect that to
        // happen a lot (since we don't go anywhere near the quota, but
        // in particular in Safari private browsing mode it always fails.
        // In that case we just don't store anything, which is just fine.
      }
    });
  }
}
/**
 * Get/set the Base CID from/to the viewer.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {string=} opt_data Stringified JSON object {cid, time}.
 * @return {!Promise<string|undefined>}
 */


function viewerBaseCid(ampdoc, opt_data) {
  var viewer = _services.Services.viewerForDoc(ampdoc);

  return viewer.isTrustedViewer().then(function (trusted) {
    if (!trusted) {
      return undefined;
    } // TODO(lannka, #11060): clean up when all Viewers get migrated


    (0, _log.dev)().expectedError('CID', 'Viewer does not provide cap=cid');
    return viewer.sendMessageAwaitResponse('cid', opt_data).then(function (data) {
      // For backward compatibility: #4029
      if (data && !(0, _json.tryParseJson)(data)) {
        // TODO(lannka, #11060): clean up when all Viewers get migrated
        (0, _log.dev)().expectedError('CID', 'invalid cid format');
        return JSON.stringify((0, _object.dict)({
          'time': Date.now(),
          // CID returned from old API is always fresh
          'cid': data
        }));
      }

      return data;
    });
  });
}
/**
 * Creates a JSON object that contains the given CID and the current time as
 * a timestamp.
 * @param {string} cidString
 * @return {string}
 */


function createCidData(cidString) {
  return JSON.stringify((0, _object.dict)({
    'time': Date.now(),
    'cid': cidString
  }));
}
/**
 * Gets the persisted CID data as a promise. It tries to read from
 * localStorage first then from viewer if it is in embedded mode.
 * Returns null if none was found.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<?BaseCidInfoDef>}
 */


function read(ampdoc) {
  var win = ampdoc.win;
  var data;

  try {
    data = win.localStorage.getItem('amp-cid');
  } catch (ignore) {// If reading from localStorage fails, we assume it is empty.
  }

  var dataPromise = Promise.resolve(data);

  if (!data && (0, _dom.isIframed)(win)) {
    // If we are being embedded, try to get the base cid from the viewer.
    dataPromise = viewerBaseCid(ampdoc);
  }

  return dataPromise.then(function (data) {
    if (!data) {
      return null;
    }

    var item = (0, _json.parseJson)(data);
    return {
      time: item['time'],
      cid: item['cid']
    };
  });
}
/**
 * Whether the retrieved cid object is expired and should be ignored.
 * @param {!BaseCidInfoDef} storedCidInfo
 * @return {boolean}
 */


function isExpired(storedCidInfo) {
  var createdTime = storedCidInfo.time;
  var now = Date.now();
  return createdTime + BASE_CID_MAX_AGE_MILLIS < now;
}
/**
 * Whether we should write a new timestamp to the stored cid value.
 * We say yes if it is older than 1 day, so we only do this max once
 * per day to avoid writing to localStorage all the time.
 * @param {!BaseCidInfoDef} storedCidInfo
 * @return {boolean}
 */


function shouldUpdateStoredTime(storedCidInfo) {
  var createdTime = storedCidInfo.time;
  var now = Date.now();
  return createdTime + ONE_DAY_MILLIS < now;
}
/**
 * Returns an array with a total of 128 of random values based on the
 * `win.crypto.getRandomValues` API. If that is not available concatenates
 * a string of other values that might be hard to guess including
 * `Math.random` and the current time.
 * @param {!Window} win
 * @return {!Uint8Array|string} Entropy.
 */


function getEntropy(win) {
  // Use win.crypto.getRandomValues to get 128 bits of random value
  var uint8array = (0, _bytes.getCryptoRandomBytesArray)(win, 16); // 128 bit

  if (uint8array) {
    return uint8array;
  } // Support for legacy browsers.


  return String(win.location.href + Date.now() + win.Math.random() + win.screen.width + win.screen.height);
}
/**
 * Produces an external CID for use in a cookie.
 * @param {!Window} win
 * @return {!Promise<string>} The cid
 */


function getRandomString64(win) {
  var entropy = getEntropy(win);

  if (typeof entropy == 'string') {
    return _services.Services.cryptoFor(win).sha384Base64(entropy);
  } else {
    // If our entropy is a pure random number, we can just directly turn it
    // into base 64
    var cast =
    /** @type {!Uint8Array} */
    entropy;
    return (0, _promise.tryResolve)(function () {
      return (0, _base.base64UrlEncodeFromBytes)(cast) // Remove trailing padding
      .replace(/\.+$/, '');
    });
  }
}
/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {*} TODO(#23582): Specify return type
 */


function installCidService(ampdoc) {
  return (0, _service.registerServiceBuilderForDoc)(ampdoc, 'cid', Cid);
}
/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!Cid}
 * @private visible for testing
 */


function cidServiceForDocForTesting(ampdoc) {
  (0, _service.registerServiceBuilderForDoc)(ampdoc, 'cid', Cid);
  return (0, _service.getServiceForDoc)(ampdoc, 'cid');
}

},{"../cookies":109,"../dom":111,"../json":122,"../log":125,"../service":131,"../services":141,"../url":148,"../utils/base64":150,"../utils/bytes":151,"../utils/object":154,"../utils/promise":156,"./cache-cid-api":132,"./cid-api":133,"./viewer-cid-api":140}],135:[function(require,module,exports){
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

},{"../config":106,"../mode":127}],136:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.isLongTaskApiSupported = isLongTaskApiSupported;
exports.JankMeter = void 0;

var _services = require("../services");

var _log = require("../log");

var _staticTemplate = require("../static-template");

var _experiments = require("../experiments");

function _templateObject() {
  var data = _taggedTemplateLiteralLoose(["\n      <div class=\"i-amphtml-jank-meter\"></div>"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteralLoose(strings, raw) { if (!raw) { raw = strings.slice(0); } strings.raw = raw; return strings; }

/** @const {number} */
var NTH_FRAME = 200;

var JankMeter =
/*#__PURE__*/
function () {
  /**
   * @param {!Window} win
   */
  function JankMeter(win) {
    /** @private {!Window} */
    this.win_ = win;
    /** @private {number} */

    this.badFrameCnt_ = 0;
    /** @private {number} */

    this.totalFrameCnt_ = 0;
    /** @private {number} */

    this.longTaskChild_ = 0;
    /** @private {number} */

    this.longTaskSelf_ = 0;
    /** @private {?number} */

    this.scheduledTime_ = null;
    /** @private {?./performance-impl.Performance} */

    this.perf_ = _services.Services.performanceForOrNull(win);
    /** @private {?BatteryManager} */

    this.batteryManager_ = null;
    /** @private {?number} */

    this.batteryLevelStart_ = null;
    this.initializeBatteryManager_();
    /** @private {?PerformanceObserver} */

    this.longTaskObserver_ = null;
    this.initializeLongTaskObserver_();
  }
  /**
   * Callback for scheduled.
   */


  var _proto = JankMeter.prototype;

  _proto.onScheduled = function onScheduled() {
    if (!this.isEnabled_()) {
      return;
    } // only take the first schedule for the current frame.


    if (this.scheduledTime_ == null) {
      this.scheduledTime_ = this.win_.Date.now();
    }
  }
  /**
   * Callback for run.
   */
  ;

  _proto.onRun = function onRun() {
    if (!this.isEnabled_() || this.scheduledTime_ == null) {
      return;
    }

    var paintLatency = this.win_.Date.now() - this.scheduledTime_;
    this.scheduledTime_ = null;
    this.totalFrameCnt_++;

    if (paintLatency > 16) {
      this.badFrameCnt_++;
      (0, _log.dev)().info('JANK', 'Paint latency: ' + paintLatency + 'ms');
    } // Report metrics on Nth frame, so we have sort of normalized numbers.


    if (this.perf_ && this.totalFrameCnt_ == NTH_FRAME) {
      // gfp: Good Frame Probability
      var gfp = this.calculateGfp_();
      this.perf_.tickDelta('gfp', gfp); // bf: Bad Frames

      this.perf_.tickDelta('bf', this.badFrameCnt_);

      if (this.longTaskObserver_) {
        // lts: Long Tasks of Self frame
        this.perf_.tickDelta('lts', this.longTaskSelf_); // ltc: Long Tasks of Child frames

        this.perf_.tickDelta('ltc', this.longTaskChild_);
        this.longTaskObserver_.disconnect();
        this.longTaskObserver_ = null;
      }

      var batteryDrop = 0;

      if (this.batteryManager_ && this.batteryLevelStart_ != null) {
        batteryDrop = this.win_.Math.max(0, this.win_.Math.floor(this.batteryManager_.level * 100 - this.batteryLevelStart_)); // bd: Battery Drop

        this.perf_.tickDelta('bd', batteryDrop);
      }

      this.perf_.flush();

      if (isJankMeterEnabled(this.win_)) {
        this.displayMeterDisplay_(batteryDrop);
      }
    }
  }
  /**
   * Returns if is enabled
   *
   * @return {?boolean}
   */
  ;

  _proto.isEnabled_ = function isEnabled_() {
    return isJankMeterEnabled(this.win_) || this.perf_ && this.perf_.isPerformanceTrackingOn() && this.totalFrameCnt_ < NTH_FRAME;
  }
  /**
   * @param {number} batteryDrop
   * @private
   */
  ;

  _proto.displayMeterDisplay_ = function displayMeterDisplay_(batteryDrop) {
    var doc = this.win_.document;
    var display = (0, _staticTemplate.htmlFor)(doc)(_templateObject());
    display.textContent = "bf:" + this.badFrameCnt_ + ", lts: " + this.longTaskSelf_ + ", " + ("ltc:" + this.longTaskChild_ + ", bd:" + batteryDrop);
    doc.body.appendChild(display);
  }
  /**
   * Calculate Good Frame Probability, which is a value range from 0 to 100.
   * @return {number}
   * @private
   */
  ;

  _proto.calculateGfp_ = function calculateGfp_() {
    return this.win_.Math.floor((this.totalFrameCnt_ - this.badFrameCnt_) / this.totalFrameCnt_ * 100);
  }
  /**
   * Initializes long task observer.
   */
  ;

  _proto.initializeLongTaskObserver_ = function initializeLongTaskObserver_() {
    var _this = this;

    if (!this.isEnabled_() || !isLongTaskApiSupported(this.win_)) {
      return;
    }

    this.longTaskObserver_ = new this.win_.PerformanceObserver(function (entryList) {
      var entries = entryList.getEntries();

      for (var i = 0; i < entries.length; i++) {
        if (entries[i].entryType == 'longtask') {
          // longtask is any task with duration of bigger than 50ms
          // we sum up the number of 50ms a task spans.
          var span = _this.win_.Math.floor(entries[i].duration / 50);

          if (entries[i].name == 'cross-origin-descendant') {
            _this.longTaskChild_ += span;
            (0, _log.user)().info('LONGTASK', "from child frame " + entries[i].duration + "ms");
          } else {
            _this.longTaskSelf_ += span;
            (0, _log.dev)().info('LONGTASK', "from self frame " + entries[i].duration + "ms");
          }
        }
      }
    });
    this.longTaskObserver_.observe({
      entryTypes: ['longtask']
    });
  }
  /**
   * Initializes battery manager.
   */
  ;

  _proto.initializeBatteryManager_ = function initializeBatteryManager_() {
    var _this2 = this;

    if (isBatteryApiSupported(this.win_)) {
      this.win_.navigator.getBattery().then(function (battery) {
        _this2.batteryManager_ = battery;
        _this2.batteryLevelStart_ = battery.level * 100;
      });
    }
  };

  return JankMeter;
}();
/**
 * @param {!Window} win
 * @return {boolean}
 */


exports.JankMeter = JankMeter;

function isJankMeterEnabled(win) {
  return (0, _experiments.isExperimentOn)(win, 'jank-meter');
}
/**
 * @param {!Window} win
 * @return {boolean}
 */


function isLongTaskApiSupported(win) {
  return !!win.PerformanceObserver && !!win['TaskAttributionTiming'] && 'containerName' in win['TaskAttributionTiming'].prototype;
}
/**
 * @param {!Window} unusedWin
 * @return {boolean}
 */


function isBatteryApiSupported(unusedWin) {
  // TODO: (@lannka, #9749)
  return false;
}

},{"../experiments":115,"../log":125,"../services":141,"../static-template":142}],137:[function(require,module,exports){
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

},{}],138:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.installGlobalNavigationHandlerForDoc = installGlobalNavigationHandlerForDoc;
exports.maybeExpandUrlParamsForTesting = maybeExpandUrlParamsForTesting;
exports.Navigation = exports.Priority = void 0;

var _services = require("../services");

var _dom = require("../dom");

var _log = require("../log");

var _object = require("../utils/object");

var _css = require("../css");

var _impression = require("../impression");

var _mode = require("../mode");

var _service = require("../service");

var _types = require("../types");

var _priorityQueue = _interopRequireDefault(require("../utils/priority-queue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
var TAG = 'navigation';
/** @private @const {string} */

var EVENT_TYPE_CLICK = 'click';
/** @private @const {string} */

var EVENT_TYPE_CONTEXT_MENU = 'contextmenu';
var VALID_TARGETS = ['_top', '_blank'];
/** @private @const {string} */

var ORIG_HREF_ATTRIBUTE = 'data-a4a-orig-href';
/**
 * Key used for retargeting event target originating from shadow DOM.
 * @const {string}
 */

var AMP_CUSTOM_LINKER_TARGET = '__AMP_CUSTOM_LINKER_TARGET__';
/**
 * @enum {number} Priority reserved for extensions in anchor mutations.
 * The higher the priority, the sooner it's invoked.
 */

var Priority = {
  LINK_REWRITER_MANAGER: 0,
  ANALYTICS_LINKER: 2
};
/**
 * Install navigation service for ampdoc, which handles navigations from anchor
 * tag clicks and other runtime features like AMP.navigateTo().
 *
 * Immediately instantiates the service.
 *
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 */

exports.Priority = Priority;

function installGlobalNavigationHandlerForDoc(ampdoc) {
  (0, _service.registerServiceBuilderForDoc)(ampdoc, TAG, Navigation,
  /* opt_instantiate */
  true);
}
/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Event} e
 * @visibleForTesting
 */


function maybeExpandUrlParamsForTesting(ampdoc, e) {
  maybeExpandUrlParams(ampdoc, e);
}
/**
 * Intercept any click on the current document and prevent any
 * linking to an identifier from pushing into the history stack.
 * @implements {../service.EmbeddableService}
 * @visibleForTesting
 */


var Navigation =
/*#__PURE__*/
function () {
  /**
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {(!Document|!ShadowRoot)=} opt_rootNode
   */
  function Navigation(ampdoc, opt_rootNode) {
    var _this = this;

    // TODO(#22733): remove subroooting once ampdoc-fie is launched.

    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;
    /** @private @const {!Document|!ShadowRoot} */

    this.rootNode_ = opt_rootNode || ampdoc.getRootNode();
    /** @private @const {!./viewport/viewport-interface.ViewportInterface} */

    this.viewport_ = _services.Services.viewportForDoc(this.ampdoc);
    /** @private @const {!./viewer-interface.ViewerInterface} */

    this.viewer_ = _services.Services.viewerForDoc(this.ampdoc);
    /** @private @const {!./history-impl.History} */

    this.history_ = _services.Services.historyForDoc(this.ampdoc);
    /** @private @const {!./platform-impl.Platform} */

    this.platform_ = _services.Services.platformFor(this.ampdoc.win);
    /** @private @const {boolean} */

    this.isIosSafari_ = this.platform_.isIos() && this.platform_.isSafari();
    /** @private @const {boolean} */

    this.isIframed_ = (0, _dom.isIframed)(this.ampdoc.win) && this.viewer_.isOvertakeHistory();
    /** @private @const {boolean} */

    this.isEmbed_ = this.rootNode_ != this.ampdoc.getRootNode() || !!this.ampdoc.getParent();
    /** @private @const {boolean} */

    this.isInABox_ = (0, _mode.getMode)(this.ampdoc.win).runtime == 'inabox';
    /**
     * Must use URL parsing scoped to `rootNode_` for correct FIE behavior.
     * @private @const {!Element|!ShadowRoot}
     */

    this.serviceContext_ =
    /** @type {!Element|!ShadowRoot} */
    this.rootNode_.nodeType == Node.DOCUMENT_NODE ? this.rootNode_.documentElement : this.rootNode_;
    /** @private @const {!function(!Event)|undefined} */

    this.boundHandle_ = this.handle_.bind(this);
    this.rootNode_.addEventListener(EVENT_TYPE_CLICK, this.boundHandle_);
    this.rootNode_.addEventListener(EVENT_TYPE_CONTEXT_MENU, this.boundHandle_);
    /** @private {boolean} */

    this.appendExtraParams_ = false;
    (0, _impression.shouldAppendExtraParams)(this.ampdoc).then(function (res) {
      _this.appendExtraParams_ = res;
    });
    /**
     * Lazy-generated list of A2A-enabled navigation features.
     * @private {?Array<string>}
     */

    this.a2aFeatures_ = null;
    /**
     * @type {!PriorityQueue<function(!Element, !Event)>}
     * @private
     * @const
     */

    this.anchorMutators_ = new _priorityQueue.default();
    /**
     * @type {!PriorityQueue<function(string)>}
     * @private
     * @const
     */

    this.navigateToMutators_ = new _priorityQueue.default();
  }
  /**
   * Registers a handler that performs URL replacement on the href
   * of an ad click.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @param {!Window} win
   */


  Navigation.installAnchorClickInterceptor = function installAnchorClickInterceptor(ampdoc, win) {
    win.document.documentElement.addEventListener('click', maybeExpandUrlParams.bind(null, ampdoc),
    /* capture */
    true);
  }
  /**
   * @param {!Window} embedWin
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   * @nocollapse
   */
  ;

  Navigation.installInEmbedWindow = function installInEmbedWindow(embedWin, ampdoc) {
    (0, _service.installServiceInEmbedScope)(embedWin, TAG, new Navigation(ampdoc, embedWin.document));
  }
  /**
   * Removes all event listeners.
   */
  ;

  var _proto = Navigation.prototype;

  _proto.cleanup = function cleanup() {
    if (this.boundHandle_) {
      this.rootNode_.removeEventListener(EVENT_TYPE_CLICK, this.boundHandle_);
      this.rootNode_.removeEventListener(EVENT_TYPE_CONTEXT_MENU, this.boundHandle_);
    }
  }
  /**
   * Opens a new window with the specified target.
   *
   * @param {!Window} win A window to use to open a new window.
   * @param {string} url THe URL to open.
   * @param {string} target The target for the newly opened window.
   * @param {boolean} opener Whether or not the new window should have acccess
   *   to the opener (win).
   */
  ;

  _proto.openWindow = function openWindow(win, url, target, opener) {
    var options = ''; // We don't pass noopener for Chrome since it opens a new window without
    // tabs. Instead, we remove the opener property from the newly opened
    // window.
    // Note: for Safari, we need to use noopener instead of clearing the opener
    // property.

    if ((this.platform_.isIos() || !this.platform_.isChrome()) && !opener) {
      options += 'noopener';
    }

    var newWin = (0, _dom.openWindowDialog)(win, url, target, options); // For Chrome, since we cannot use noopener.

    if (newWin && !opener) {
      newWin.opener = null;
    }
  }
  /**
   * Navigates a window to a URL.
   *
   * If opt_requestedBy matches a feature name in a <meta> tag with attribute
   * name="amp-to-amp-navigation", then treats the URL as an AMP URL (A2A).
   *
   * @param {!Window} win
   * @param {string} url
   * @param {string=} opt_requestedBy
   * @param {!{
   *   target: (string|undefined),
   *   opener: (boolean|undefined),
   * }=} opt_options
   */
  ;

  _proto.navigateTo = function navigateTo(win, url, opt_requestedBy, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        _ref$target = _ref.target,
        target = _ref$target === void 0 ? '_top' : _ref$target,
        _ref$opener = _ref.opener,
        opener = _ref$opener === void 0 ? false : _ref$opener;

    url = this.applyNavigateToMutators_(url);

    var urlService = _services.Services.urlForDoc(this.serviceContext_);

    if (!urlService.isProtocolValid(url)) {
      (0, _log.user)().error(TAG, 'Cannot navigate to invalid protocol: ' + url);
      return;
    }

    (0, _log.userAssert)(VALID_TARGETS.includes(target), "Target '" + target + "' not supported."); // Resolve navigateTos relative to the source URL, not the proxy URL.

    url = urlService.getSourceUrl(url); // If we have a target of "_blank", we will want to open a new window. A
    // target of "_top" should behave like it would on an anchor tag and
    // update the URL.

    if (target == '_blank') {
      this.openWindow(win, url, target, opener);
      return;
    } // If this redirect was requested by a feature that opted into A2A,
    // try to ask the viewer to navigate this AMP URL.


    if (opt_requestedBy) {
      if (!this.a2aFeatures_) {
        this.a2aFeatures_ = this.queryA2AFeatures_();
      }

      if (this.a2aFeatures_.includes(opt_requestedBy)) {
        if (this.navigateToAmpUrl(url, opt_requestedBy)) {
          return;
        }
      }
    } // Otherwise, perform normal behavior of navigating the top frame.


    win.top.location.href = url;
  }
  /**
   * Requests A2A navigation to the given destination. If the viewer does
   * not support this operation, does nothing.
   * The URL is assumed to be in AMP Cache format already.
   * @param {string} url An AMP article URL.
   * @param {string} requestedBy Informational string about the entity that
   *     requested the navigation.
   * @return {boolean} Returns true if navigation message was sent to viewer.
   *     Otherwise, returns false.
   */
  ;

  _proto.navigateToAmpUrl = function navigateToAmpUrl(url, requestedBy) {
    if (this.viewer_.hasCapability('a2a')) {
      this.viewer_.sendMessage('a2aNavigate', (0, _object.dict)({
        'url': url,
        'requestedBy': requestedBy
      }));
      return true;
    }

    return false;
  }
  /**
   * @return {!Array<string>}
   * @private
   */
  ;

  _proto.queryA2AFeatures_ = function queryA2AFeatures_() {
    var meta = this.rootNode_.querySelector('meta[name="amp-to-amp-navigation"]');

    if (meta && meta.hasAttribute('content')) {
      return meta.getAttribute('content').split(',').map(function (s) {
        return s.trim();
      });
    }

    return [];
  }
  /**
   * Intercept any click on the current document and prevent any
   * linking to an identifier from pushing into the history stack.
   *
   * This also handles custom protocols (e.g. whatsapp://) when iframed
   * on iOS Safari.
   *
   * @param {!Event} e
   * @private
   */
  ;

  _proto.handle_ = function handle_(e) {
    if (e.defaultPrevented) {
      return;
    }

    var element = (0, _log.dev)().assertElement(e[AMP_CUSTOM_LINKER_TARGET] || e.target);
    var target = (0, _dom.closestAncestorElementBySelector)(element, 'A');

    if (!target || !target.href) {
      return;
    }

    if (e.type == EVENT_TYPE_CLICK) {
      this.handleClick_(target, e);
    } else if (e.type == EVENT_TYPE_CONTEXT_MENU) {
      this.handleContextMenuClick_(target, e);
    }
  }
  /**
   * @param {!Element} target
   * @param {!Event} e
   * @private
   */
  ;

  _proto.handleClick_ = function handleClick_(target, e) {
    this.expandVarsForAnchor_(target);
    var tgtLoc = this.parseUrl_(target.href); // Handle AMP-to-AMP navigation if rel=amphtml.

    if (this.handleA2AClick_(e, target, tgtLoc)) {
      return;
    } // Handle navigating to custom protocol if applicable.


    if (this.handleCustomProtocolClick_(e, target, tgtLoc)) {
      return;
    } // In test mode, we're not able to properly fix the anchor tag's base URL.
    // So, we have to use the (mocked) window's location instead.


    var baseHref = (0, _mode.getMode)().test && !this.isEmbed_ ? this.ampdoc.win.location.href : '';
    var curLoc = this.parseUrl_(baseHref);
    var tgtHref = getHref(tgtLoc);
    var curHref = getHref(curLoc);

    if (tgtHref != curHref) {
      // Only apply anchor mutator if this is an external navigation
      this.applyAnchorMutators_(target, e);
      tgtLoc = this.parseUrl_(target.href);
    } // Finally, handle normal click-navigation behavior.


    this.handleNavClick_(e, target, tgtLoc, curLoc);
  }
  /**
   * @param {!Element} target
   * @param {!Event} e
   * @private
   */
  ;

  _proto.handleContextMenuClick_ = function handleContextMenuClick_(target, e) {
    // Handles contextmenu click. Note that currently this only deals
    // with url variable substitution and expansion, as there is
    // straightforward way of determining what the user clicked in the
    // context menu, required for A2A navigation and custom link protocol
    // handling.
    // TODO(alabiaga): investigate fix for handling A2A and custom link
    // protocols.
    this.expandVarsForAnchor_(target);
    this.applyAnchorMutators_(target, e);
  }
  /**
   * Apply anchor transformations.
   * @param {!Element} target
   * @param {!Event} e
   */
  ;

  _proto.applyAnchorMutators_ = function applyAnchorMutators_(target, e) {
    this.anchorMutators_.forEach(function (anchorMutator) {
      anchorMutator(target, e);
    });
  }
  /**
   * Apply URL transformations for AMP.navigateTo.
   * @param {string} url
   * @return {string}
   */
  ;

  _proto.applyNavigateToMutators_ = function applyNavigateToMutators_(url) {
    this.navigateToMutators_.forEach(function (mutator) {
      url = mutator(url);
    });
    return url;
  }
  /**
   * @param {!Element} el
   * @private
   */
  ;

  _proto.expandVarsForAnchor_ = function expandVarsForAnchor_(el) {
    // First check if need to handle external link decoration.
    var defaultExpandParamsUrl = null;

    if (this.appendExtraParams_ && !this.isEmbed_) {
      // Only decorate outgoing link when needed to and is not in FIE.
      defaultExpandParamsUrl = (0, _impression.getExtraParamsUrl)(this.ampdoc.win, el);
    }

    var urlReplacements = _services.Services.urlReplacementsForDoc(el);

    urlReplacements.maybeExpandLink(el, defaultExpandParamsUrl);
  }
  /**
   * Handles clicking on a custom protocol link.
   * Returns true if the navigation was handled. Otherwise, returns false.
   * @param {!Event} e
   * @param {!Element} target
   * @param {!Location} location
   * @return {boolean}
   * @private
   */
  ;

  _proto.handleCustomProtocolClick_ = function handleCustomProtocolClick_(e, target, location) {
    // Handle custom protocols only if the document is iframed.
    if (!this.isIframed_) {
      return false;
    }
    /** @const {!Window} */


    var win = (0, _types.toWin)(target.ownerDocument.defaultView);
    var url = target.href;
    var protocol = location.protocol; // On Safari iOS, custom protocol links will fail to open apps when the
    // document is iframed - in order to go around this, we set the top.location
    // to the custom protocol href.

    var isFTP = protocol == 'ftp:'; // In case of FTP Links in embedded documents always open then in _blank.

    if (isFTP) {
      (0, _dom.openWindowDialog)(win, url, '_blank');
      e.preventDefault();
      return true;
    }

    var isNormalProtocol = /^(https?|mailto):$/.test(protocol);

    if (this.isIosSafari_ && !isNormalProtocol) {
      (0, _dom.openWindowDialog)(win, url, '_top'); // Without preventing default the page would should an alert error twice
      // in the case where there's no app to handle the custom protocol.

      e.preventDefault();
      return true;
    }

    return false;
  }
  /**
   * Handles clicking on an AMP link.
   * Returns true if the navigation was handled. Otherwise, returns false.
   * @param {!Event} e
   * @param {!Element} target
   * @param {!Location} location
   * @return {boolean}
   * @private
   */
  ;

  _proto.handleA2AClick_ = function handleA2AClick_(e, target, location) {
    if (!target.hasAttribute('rel')) {
      return false;
    }

    var relations = target.getAttribute('rel').split(' ').map(function (s) {
      return s.trim();
    });

    if (!relations.includes('amphtml')) {
      return false;
    } // The viewer may not support the capability for navigating AMP links.


    if (this.navigateToAmpUrl(location.href, '<a rel=amphtml>')) {
      e.preventDefault();
      return true;
    }

    return false;
  }
  /**
   * Handles clicking on a link with hash navigation.
   * @param {!Event} e
   * @param {!Element} target
   * @param {!Location} tgtLoc
   * @param {!Location} curLoc
   * @private
   */
  ;

  _proto.handleNavClick_ = function handleNavClick_(e, target, tgtLoc, curLoc) {
    var tgtHref = getHref(tgtLoc);
    var curHref = getHref(curLoc); // If the current target anchor link is the same origin + path
    // as the current document then we know we are just linking to an
    // identifier in the document. Otherwise, it's an external navigation.

    if (!tgtLoc.hash || tgtHref != curHref) {
      if (this.isEmbed_ || this.isInABox_) {
        // Target in the embed must be either _top or _blank. If none specified,
        // force to _blank.
        var targetAttr = (target.getAttribute('target') || '').toLowerCase();

        if (targetAttr != '_top' && targetAttr != '_blank') {
          target.setAttribute('target', '_blank');
        }

        return; // bail early.
      } // Accessibility fix for IE browser.
      // Issue: anchor navigation in IE changes visual focus of the browser
      // and shifts to the element being linked to,
      // where the input focus stays where it was.
      // @see https://humanwhocodes.com/blog/2013/01/15/fixing-skip-to-content-links/
      // @see https://github.com/ampproject/amphtml/issues/18671


      if (_services.Services.platformFor(this.ampdoc.win).isIe()) {
        var internalTargetElmId = tgtLoc.hash.substring(1);
        var internalElm = this.ampdoc.getElementById(internalTargetElmId);

        if (internalElm) {
          if (!/^(?:a|select|input|button|textarea)$/i.test(internalElm.tagName)) {
            internalElm.tabIndex = -1;
          }

          (0, _dom.tryFocus)(internalElm);
        }
      }

      return;
    }

    this.handleInternalNavigation_(e, tgtLoc, curLoc);
  }
  /**
   * Handles clicking on an internal link
   * @param {!Event} e
   * @param {!Location} tgtLoc
   * @param {!Location} curLoc
   * @private
   */
  ;

  _proto.handleInternalNavigation_ = function handleInternalNavigation_(e, tgtLoc, curLoc) {
    var _this2 = this;

    // We prevent default so that the current click does not push
    // into the history stack as this messes up the external documents
    // history which contains the amp document.
    e.preventDefault(); // For an embed, do not perform scrolling or global history push - both have
    // significant UX and browser problems.

    if (this.isEmbed_) {
      return;
    } // Look for the referenced element.


    var hash = tgtLoc.hash.slice(1);
    var elem = null;

    if (hash) {
      var escapedHash = (0, _css.escapeCssSelectorIdent)(hash);
      elem = this.rootNode_.getElementById(hash) || // Fallback to anchor[name] if element with id is not found.
      // Linking to an anchor element with name is obsolete in html5.
      this.rootNode_.
      /*OK*/
      querySelector("a[name=\"" + escapedHash + "\"]");
    } // If possible do update the URL with the hash. As explained above
    // we do `replace` to avoid messing with the container's history.


    if (tgtLoc.hash != curLoc.hash) {
      this.history_.replaceStateForTarget(tgtLoc.hash).then(function () {
        _this2.scrollToElement_(elem, hash);
      });
    } else {
      // If the hash did not update just scroll to the element.
      this.scrollToElement_(elem, hash);
    }
  }
  /**
   * @param {function(!Element, !Event)} callback
   * @param {number} priority
   */
  ;

  _proto.registerAnchorMutator = function registerAnchorMutator(callback, priority) {
    this.anchorMutators_.enqueue(callback, priority);
  }
  /**
   * @param {function(string)} callback
   * @param {number} priority
   */
  ;

  _proto.registerNavigateToMutator = function registerNavigateToMutator(callback, priority) {
    this.navigateToMutators_.enqueue(callback, priority);
  }
  /**
   * Scrolls the page to the given element.
   * @param {?Element} elem
   * @param {string} hash
   * @private
   */
  ;

  _proto.scrollToElement_ = function scrollToElement_(elem, hash) {
    var _this3 = this;

    // Scroll to the element if found.
    if (elem) {
      // The first call to scrollIntoView overrides browsers' default scrolling
      // behavior. The second call insides setTimeout allows us to scroll to
      // that element properly. Without doing this, the viewport will not catch
      // the updated scroll position on iOS Safari and hence calculate the wrong
      // scrollTop for the scrollbar jumping the user back to the top for
      // failing to calculate the new jumped offset. Without the first call
      // there will be a visual jump due to browser scroll. See
      // https://github.com/ampproject/amphtml/issues/5334 for more details.
      this.viewport_.
      /*OK*/
      scrollIntoView(elem);

      _services.Services.timerFor(this.ampdoc.win).delay(function () {
        return _this3.viewport_.
        /*OK*/
        scrollIntoView((0, _log.dev)().assertElement(elem));
      }, 1);
    } else {
      (0, _log.dev)().warn(TAG, "failed to find element with id=" + hash + " or a[name=" + hash + "]");
    }
  }
  /**
   * @param {string} url
   * @return {!Location}
   * @private
   */
  ;

  _proto.parseUrl_ = function parseUrl_(url) {
    return _services.Services.urlForDoc(this.serviceContext_).parse(url);
  };

  return Navigation;
}();
/**
 * Handle click on links and replace variables in the click URL.
 * The function changes the actual href value and stores the
 * template in the ORIGINAL_HREF_ATTRIBUTE attribute
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Event} e
 */


exports.Navigation = Navigation;

function maybeExpandUrlParams(ampdoc, e) {
  var target = (0, _dom.closestAncestorElementBySelector)((0, _log.dev)().assertElement(e.target), 'A');

  if (!target || !target.href) {
    // Not a click on a link.
    return;
  }

  var hrefToExpand = target.getAttribute(ORIG_HREF_ATTRIBUTE) || target.getAttribute('href');

  if (!hrefToExpand) {
    return;
  }

  var vars = {
    'CLICK_X': function CLICK_X() {
      return e.pageX;
    },
    'CLICK_Y': function CLICK_Y() {
      return e.pageY;
    }
  };

  var newHref = _services.Services.urlReplacementsForDoc(target).expandUrlSync(hrefToExpand, vars, undefined,
  /* opt_whitelist */
  {
    // For now we only allow to replace the click location vars
    // and nothing else.
    // NOTE: Addition to this whitelist requires additional review.
    'CLICK_X': true,
    'CLICK_Y': true
  });

  if (newHref != hrefToExpand) {
    // Store original value so that later clicks can be processed with
    // freshest values.
    if (!target.getAttribute(ORIG_HREF_ATTRIBUTE)) {
      target.setAttribute(ORIG_HREF_ATTRIBUTE, hrefToExpand);
    }

    target.setAttribute('href', newHref);
  }
}
/**
 * Calculate and return the href from the Location
 * @param {!Location} location
 * @return {string}
 */


function getHref(location) {
  return "" + location.origin + location.pathname + location.search;
}

},{"../css":110,"../dom":111,"../impression":117,"../log":125,"../mode":127,"../service":131,"../services":141,"../types":145,"../utils/object":154,"../utils/priority-queue":155}],139:[function(require,module,exports){
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

},{"./mutator-interface":137}],140:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.ViewerCidApi = void 0;

var _services = require("../services");

var _object = require("../utils/object");

var _url = require("../url");

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
 * Exposes CID API if provided by the Viewer.
 */
var ViewerCidApi =
/*#__PURE__*/
function () {
  /**
   * Creates an instance of ViewerCidApi.
   * @param {!./ampdoc-impl.AmpDoc} ampdoc
   */
  function ViewerCidApi(ampdoc) {
    /** @private {!./ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;
    /** @private {!./viewer-interface.ViewerInterface} */

    this.viewer_ = _services.Services.viewerForDoc(this.ampdoc_);

    var _Services$documentInf = _services.Services.documentInfoForDoc(this.ampdoc_),
        canonicalUrl = _Services$documentInf.canonicalUrl;
    /** @private {?string} */


    this.canonicalOrigin_ = canonicalUrl ? (0, _url.parseUrlDeprecated)(canonicalUrl).origin : null;
  }
  /**
   * Resolves to true if Viewer is trusted and supports CID API.
   * @return {!Promise<boolean>}
   */


  var _proto = ViewerCidApi.prototype;

  _proto.isSupported = function isSupported() {
    if (!this.viewer_.hasCapability('cid')) {
      return Promise.resolve(false);
    }

    return this.viewer_.isTrustedViewer();
  }
  /**
   * Returns scoped CID retrieved from the Viewer.
   * @param {string|undefined} apiKey
   * @param {string} scope
   * @return {!Promise<?JsonObject|string|undefined>}
   */
  ;

  _proto.getScopedCid = function getScopedCid(apiKey, scope) {
    var payload = (0, _object.dict)({
      'scope': scope,
      'clientIdApi': !!apiKey,
      'canonicalOrigin': this.canonicalOrigin_
    });

    if (apiKey) {
      payload['apiKey'] = apiKey;
    }

    return this.viewer_.sendMessageAwaitResponse('cid', payload);
  };

  return ViewerCidApi;
}();

exports.ViewerCidApi = ViewerCidApi;

},{"../services":141,"../url":148,"../utils/object":154}],141:[function(require,module,exports){
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

},{"./element-service":112,"./service":131}],142:[function(require,module,exports){
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

},{"./log":125,"./utils/object.js":154}],143:[function(require,module,exports){
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

},{}],144:[function(require,module,exports){
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

},{"./log":125,"./string":143,"./utils/object.js":154}],145:[function(require,module,exports){
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

},{}],146:[function(require,module,exports){
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

},{"./url-try-decode-uri-component":147}],147:[function(require,module,exports){
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

},{}],148:[function(require,module,exports){
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

},{"./config":106,"./log":125,"./mode":127,"./string":143,"./types":145,"./url-parse-query-string":146,"./url-try-decode-uri-component":147,"./utils/lru-cache":153,"./utils/object":154}],149:[function(require,module,exports){
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

},{}],150:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.base64UrlDecodeToBytes = base64UrlDecodeToBytes;
exports.base64DecodeToBytes = base64DecodeToBytes;
exports.base64UrlEncodeFromBytes = base64UrlEncodeFromBytes;
exports.base64UrlEncodeFromString = base64UrlEncodeFromString;
exports.base64UrlDecodeFromString = base64UrlDecodeFromString;
exports.base64EncodeFromBytes = base64EncodeFromBytes;

var _bytes = require("./bytes");

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
 * Character mapping from base64url to base64.
 * @const {!Object<string, string>}
 */
var base64UrlDecodeSubs = {
  '-': '+',
  '_': '/',
  '.': '='
};
/**
 * Character mapping from base64 to base64url.
 * @const {!Object<string, string>}
 */

var base64UrlEncodeSubs = {
  '+': '-',
  '/': '_',
  '=': '.'
};
/**
 * Converts a string which is in base64url encoding into a Uint8Array
 * containing the decoded value.
 * @param {string} str
 * @return {!Uint8Array}
 */

function base64UrlDecodeToBytes(str) {
  var encoded = atob(str.replace(/[-_.]/g, function (ch) {
    return base64UrlDecodeSubs[ch];
  }));
  return (0, _bytes.stringToBytes)(encoded);
}
/**
 * Converts a string which is in base64 encoding into a Uint8Array
 * containing the decoded value.
 * @param {string} str
 * @return {!Uint8Array}
 */


function base64DecodeToBytes(str) {
  return (0, _bytes.stringToBytes)(atob(str));
}
/**
 * Converts a bytes array into base64url encoded string.
 * base64url is defined in RFC 4648. It is sometimes referred to as "web safe".
 * @param {!Uint8Array} bytes
 * @return {string}
 */


function base64UrlEncodeFromBytes(bytes) {
  var str = (0, _bytes.bytesToString)(bytes);
  return btoa(str).replace(/[+/=]/g, function (ch) {
    return base64UrlEncodeSubs[ch];
  });
}
/**
 * Converts a string into base64url encoded string.
 * base64url is defined in RFC 4648. It is sometimes referred to as "web safe".
 * @param {string} str
 * @return {string}
 */


function base64UrlEncodeFromString(str) {
  var bytes = (0, _bytes.utf8Encode)(str);
  return base64UrlEncodeFromBytes(bytes);
}
/**
 * Decode a base64url encoded string by `base64UrlEncodeFromString`
 * @param {string} str
 * @return {string}
 */


function base64UrlDecodeFromString(str) {
  var bytes = base64UrlDecodeToBytes(str);
  return (0, _bytes.utf8Decode)(bytes);
}
/**
 * Converts a bytes array into base64 encoded string.
 * @param {!Uint8Array} bytes
 * @return {string}
 */


function base64EncodeFromBytes(bytes) {
  return btoa((0, _bytes.bytesToString)(bytes));
}

},{"./bytes":151}],151:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.utf8Decode = utf8Decode;
exports.utf8Encode = utf8Encode;
exports.stringToBytes = stringToBytes;
exports.bytesToString = bytesToString;
exports.bytesToUInt32 = bytesToUInt32;
exports.getCryptoRandomBytesArray = getCryptoRandomBytesArray;

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
 * Interpret a byte array as a UTF-8 string.
 * @param {!BufferSource} bytes
 * @return {string}
 */
function utf8Decode(bytes) {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }

  var asciiString = bytesToString(new Uint8Array(bytes.buffer || bytes));
  return decodeURIComponent(escape(asciiString));
}
/**
 * Turn a string into UTF-8 bytes.
 * @param {string} string
 * @return {!Uint8Array}
 */


function utf8Encode(string) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder('utf-8').encode(string);
  }

  return stringToBytes(unescape(encodeURIComponent(string)));
}
/**
 * Converts a string which holds 8-bit code points, such as the result of atob,
 * into a Uint8Array with the corresponding bytes.
 * If you have a string of characters, you probably want to be using utf8Encode.
 * @param {string} str
 * @return {!Uint8Array}
 */


function stringToBytes(str) {
  var bytes = new Uint8Array(str.length);

  for (var i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i);
    (0, _log.devAssert)(charCode <= 255, 'Characters must be in range [0,255]');
    bytes[i] = charCode;
  }

  return bytes;
}
/**
 * Converts a 8-bit bytes array into a string
 * @param {!Uint8Array} bytes
 * @return {string}
 */


function bytesToString(bytes) {
  // Intentionally avoids String.fromCharCode.apply so we don't suffer a
  // stack overflow. #10495, https://jsperf.com/bytesToString-2
  var array = new Array(bytes.length);

  for (var i = 0; i < bytes.length; i++) {
    array[i] = String.fromCharCode(bytes[i]);
  }

  return array.join('');
}
/**
 * Converts a 4-item byte array to an unsigned integer.
 * Assumes bytes are big endian.
 * @param {!Uint8Array} bytes
 * @return {number}
 */


function bytesToUInt32(bytes) {
  if (bytes.length != 4) {
    throw new Error('Received byte array with length != 4');
  }

  var val = (bytes[0] & 0xff) << 24 | (bytes[1] & 0xff) << 16 | (bytes[2] & 0xff) << 8 | bytes[3] & 0xff; // Convert to unsigned.

  return val >>> 0;
}
/**
 * Generate a random bytes array with specific length using
 * win.crypto.getRandomValues. Return null if it is not available.
 * @param {!Window} win
 * @param {number} length
 * @return {?Uint8Array}
 */


function getCryptoRandomBytesArray(win, length) {
  if (!win.crypto || !win.crypto.getRandomValues) {
    return null;
  } // Widely available in browsers we support:
  // http://caniuse.com/#search=getRandomValues


  var uint8array = new Uint8Array(length);
  win.crypto.getRandomValues(uint8array);
  return uint8array;
}

},{"../log":125}],152:[function(require,module,exports){
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

},{}],153:[function(require,module,exports){
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

},{"../log":125}],154:[function(require,module,exports){
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

},{"../types":145}],155:[function(require,module,exports){
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

},{}],156:[function(require,module,exports){
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

},{}],157:[function(require,module,exports){
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

},{}],158:[function(require,module,exports){
"use strict";

exports.__esModule = true;
exports.WindowInterface = void 0;

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
 * An interface to interact with browser window object.
 * Mainly used to mock out read only APIs in test.
 * See test-helper.js#mockWindowInterface
 */
var WindowInterface =
/*#__PURE__*/
function () {
  function WindowInterface() {}

  /**
   * @static
   * @param {!Window} win
   * @return {!Location}
   */
  WindowInterface.getLocation = function getLocation(win) {
    return win.location;
  }
  /**
   * @static
   * @param {!Window} win
   * @return {string}
   */
  ;

  WindowInterface.getDocumentReferrer = function getDocumentReferrer(win) {
    return win.document.referrer;
  }
  /**
   * @static
   * @param {!Window} win
   * @return {string}
   */
  ;

  WindowInterface.getHostname = function getHostname(win) {
    return win.location.hostname;
  }
  /**
   * @static
   * @param {!Window} win
   * @return {string}
   */
  ;

  WindowInterface.getUserAgent = function getUserAgent(win) {
    return win.navigator.userAgent;
  }
  /**
   * @static
   * @param {!Window} win
   * @return {string}
   */
  ;

  WindowInterface.getUserLanguage = function getUserLanguage(win) {
    return win.navigator.userLanguage || win.navigator.language;
  }
  /**
   * @static
   * @return {number}
   */
  ;

  WindowInterface.getDevicePixelRatio = function getDevicePixelRatio() {
    // No matter the window, the device-pixel-ratio is always one.
    return self.devicePixelRatio || 1;
  }
  /**
   * @static
   * @param {!Window} win
   * @return {function(string,(ArrayBufferView|Blob|FormData|null|string)=):boolean|undefined}
   */
  ;

  WindowInterface.getSendBeacon = function getSendBeacon(win) {
    if (!win.navigator.sendBeacon) {
      return undefined;
    }

    return win.navigator.sendBeacon.bind(win.navigator);
  }
  /**
   * @static
   * @param {!Window} win
   * @return {function(new:XMLHttpRequest)}
   */
  ;

  WindowInterface.getXMLHttpRequest = function getXMLHttpRequest(win) {
    return win.XMLHttpRequest;
  }
  /**
   * @static
   * @param {!Window} win
   * @return {function(new:Image)}
   */
  ;

  WindowInterface.getImage = function getImage(win) {
    return win.Image;
  };

  return WindowInterface;
}();

exports.WindowInterface = WindowInterface;

},{}],159:[function(require,module,exports){
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
//# sourceMappingURL=amp-analytics-0.1.max.js.map
