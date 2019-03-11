var a;
//BEHAVIOUR(IsIABEnabled == true)
!function(e){function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}var t={};n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},n.p="",n(n.s=4)}([function(e,n,t){"use strict";function r(e){if(Array.isArray(e)){for(var n=0,t=Array(e.length);n<e.length;n++)t[n]=e[n];return t}return c(e)}function o(e){for(var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],t="",r=1;r<=e;r+=1)t+=-1!==n.indexOf(r)?"1":"0";return f(t,Math.max(0,e-t.length))}function i(e){for(var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:new Set,t=Math.max.apply(Math,[0].concat(r(e.map(function(e){return e.id})),r(c(n)))),o="",i=1;i<=t;i+=1)o+=-1!==n.indexOf(i)?"1":"0";return o}function a(e,n){var t=[],o=e.map(function(e){return e.id});return e.reduce(function(i,a,u){var s=a.id;if(-1!==n.indexOf(s)&&t.push(s),(-1===n.indexOf(s)||u===e.length-1||-1===o.indexOf(s+1))&&t.length){var c=t.shift(),l=t.pop();return t=[],[].concat(r(i),[{isRange:"number"==typeof l,startVendorId:c,endVendorId:l}])}return i},[])}var u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e},c=Array.from||function(){var e=function(e){return"function"==typeof e},n=function(e){var n=Number(e);return isNaN(n)?0:0!==n&&isFinite(n)?(n>0?1:-1)*Math.floor(Math.abs(n)):n},t=Math.pow(2,53)-1,r=function(e){var r=n(e);return Math.min(Math.max(r,0),t)},o=function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(void 0===e?"undefined":u(e))>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}},i=function(n,t){if(null!=n&&null!=t){var r=n[t];if(null==r)return;if(!e(r))throw new TypeError(r+" is not a function");return r}},a=function(e){var n=e.next();return!Boolean(n.done)&&n};return function(n){var t,u=this,s=arguments.length>1?arguments[1]:void 0;if(void 0!==s){if(!e(s))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(t=arguments[2])}var c,l,d=i(n,o(n));if(void 0!==d){c=e(u)?Object(new u):[];var f=d.call(n);if(null==f)throw new TypeError("Array.from requires an array-like or iterable object");l=0;for(var p,m;;){if(!(p=a(f)))return c.length=l,c;m=p.value,c[l]=s?s.call(t,m,l):m,l++}}else{var y=Object(n);if(null==n)throw new TypeError("Array.from requires an array-like object - not null or undefined");var v=r(y.length);c=e(u)?Object(new u(v)):new Array(v),l=0;for(var h;l<v;)h=y[l],c[l]=s?s.call(t,h,l):h,l++;c.length=v}return c}}(),l=t(1),d=l.encodeToBase64,f=l.padRight;e.exports={convertVendorsToRanges:a,encodeConsentString:function(e){var n=e.maxVendorId,t=e.vendorList,r=void 0===t?{}:t,u=e.allowedPurposeIds,c=e.allowedVendorIds,l=r.vendors,f=void 0===l?[]:l,p=r.purposes,m=void 0===p?[]:p;n||(n=0,f.forEach(function(e){e.id>n&&(n=e.id)}));var y=d(s({},e,{maxVendorId:n,purposeIdBitString:i(m,u),isRange:!1,vendorIdBitString:o(n,c)})),v=a(f,c),h=d(s({},e,{maxVendorId:n,purposeIdBitString:i(m,u),isRange:!0,defaultConsent:!1,numEntries:v.length,vendorRangeList:v}));return y.length<h.length?y:h}}},function(e,n,t){"use strict";function r(e){if(Array.isArray(e)){for(var n=0,t=Array(e.length);n<e.length;n++)t[n]=e[n];return t}return C(e)}function o(e){for(var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"0",t="",r=0;r<e;r+=1)t+=n;return t}function i(e,n){return o(Math.max(0,n))+e}function a(e,n){return e+o(Math.max(0,n))}function u(e,n){var t="";return"number"!=typeof e||isNaN(e)||(t=parseInt(e,10).toString(2)),n>=t.length&&(t=i(t,n-t.length)),t.length>n&&(t=t.substring(0,n)),t}function s(e){return u(!0===e?1:0,1)}function c(e,n){return e instanceof Date?u(e.getTime()/100,n):u(e,n)}function l(e,n){return u(e.toUpperCase().charCodeAt(0)-65,n)}function d(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:12;return l(e.slice(0,1),n/2)+l(e.slice(1),n/2)}function f(e,n,t){return parseInt(e.substr(n,t),2)}function p(e,n,t){return new Date(100*f(e,n,t))}function m(e,n){return 1===parseInt(e.substr(n,1),2)}function y(e){var n=f(e);return String.fromCharCode(n+65).toLowerCase()}function v(e,n,t){var r=e.substr(n,t);return y(r.slice(0,t/2))+y(r.slice(t/2))}function h(e){var n=e.input,t=e.field,r=t.name,o=t.type,i=t.numBits,l=t.encoder,f=t.validator;if("function"==typeof f&&!f(n))return"";if("function"==typeof l)return l(n);var p="function"==typeof i?i(n):i,m=n[r],y=null===m||void 0===m?"":m;switch(o){case"int":return u(y,p);case"bool":return s(y);case"date":return c(y,p);case"bits":return a(y,p-y.length).substring(0,p);case"list":return y.reduce(function(e,n){return e+g({input:n,fields:t.fields})},"");case"language":return d(y,p);default:throw new Error("ConsentString - Unknown field type "+o+" for encoding")}}function g(e){var n=e.input;return e.fields.reduce(function(e,t){return e+=h({input:n,field:t})},"")}function b(e){var n=e.input,t=e.output,o=e.startPosition,i=e.field,a=i.type,u=i.numBits,s=i.decoder,c=i.validator,l=i.listCount;if("function"==typeof c&&!c(t))return{newPosition:o};if("function"==typeof s)return s(n,t,o);var d="function"==typeof u?u(t):u,y=0;switch("function"==typeof l?y=l(t):"number"==typeof l&&(y=l),a){case"int":return{fieldValue:f(n,o,d)};case"bool":return{fieldValue:m(n,o)};case"date":return{fieldValue:p(n,o,d)};case"bits":return{fieldValue:n.substr(o,d)};case"list":return new Array(y).fill().reduce(function(e){var t=w({input:n,fields:i.fields,startPosition:e.newPosition}),o=t.decodedObject,a=t.newPosition;return{fieldValue:[].concat(r(e.fieldValue),[o]),newPosition:a}},{fieldValue:[],newPosition:o});case"language":return{fieldValue:v(n,o,d)};default:throw new Error("ConsentString - Unknown field type "+a+" for decoding")}}function w(e){var n=e.input,t=e.fields,r=e.startPosition,o=void 0===r?0:r;return{decodedObject:t.reduce(function(e,t){var r=t.name,i=t.numBits,a=b({input:n,output:e,startPosition:o,field:t}),u=a.fieldValue,s=a.newPosition;return void 0!==u&&(e[r]=u),void 0!==s?o=s:"number"==typeof i&&(o+=i),e},{}),newPosition:o}}function S(e,n){var t=e.version;if("number"!=typeof t)throw new Error("ConsentString - No version field to encode");if(n[t])return g({input:e,fields:n[t].fields});throw new Error("ConsentString - No definition for version "+t)}function V(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:L,t=f(e,0,A);if("number"!=typeof t)throw new Error("ConsentString - Unknown version number in the string to decode");if(!L[t])throw new Error("ConsentString - Unsupported version "+t+" in the string to decode");return w({input:e,fields:n[t].fields}).decodedObject}var I="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},C=Array.from||function(){var e=function(e){return"function"==typeof e},n=function(e){var n=Number(e);return isNaN(n)?0:0!==n&&isFinite(n)?(n>0?1:-1)*Math.floor(Math.abs(n)):n},t=Math.pow(2,53)-1,r=function(e){var r=n(e);return Math.min(Math.max(r,0),t)},o=function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(void 0===e?"undefined":I(e))>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}},i=function(n,t){if(null!=n&&null!=t){var r=n[t];if(null==r)return;if(!e(r))throw new TypeError(r+" is not a function");return r}},a=function(e){var n=e.next();return!Boolean(n.done)&&n};return function(n){var t,u=this,s=arguments.length>1?arguments[1]:void 0;if(void 0!==s){if(!e(s))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(t=arguments[2])}var c,l,d=i(n,o(n));if(void 0!==d){c=e(u)?Object(new u):[];var f=d.call(n);if(null==f)throw new TypeError("Array.from requires an array-like or iterable object");l=0;for(var p,m;;){if(!(p=a(f)))return c.length=l,c;m=p.value,c[l]=s?s.call(t,m,l):m,l++}}else{var y=Object(n);if(null==n)throw new TypeError("Array.from requires an array-like object - not null or undefined");var v=r(y.length);c=e(u)?Object(new u(v)):new Array(v),l=0;for(var h;l<v;)h=y[l],c[l]=s?s.call(t,h,l):h,l++;c.length=v}return c}}(),x=t(7),B=t(2),A=B.versionNumBits,L=B.vendorVersionMap;e.exports={padRight:a,padLeft:i,encodeField:h,encodeDataToBits:S,encodeIntToBits:u,encodeBoolToBits:s,encodeDateToBits:c,encodeLanguageToBits:d,encodeLetterToBits:l,encodeToBase64:function(e){var n=S(e,arguments.length>1&&void 0!==arguments[1]?arguments[1]:L);if(n){for(var t=a(n,7-(n.length+7)%8),r="",o=0;o<t.length;o+=8)r+=String.fromCharCode(parseInt(t.substr(o,8),2));return x.encode(r).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}return null},decodeBitsToIds:function(e){return e.split("").reduce(function(e,n,t){return"1"===n&&-1===e.indexOf(t+1)&&e.push(t+1),e},[])},decodeBitsToInt:f,decodeBitsToDate:p,decodeBitsToBool:m,decodeBitsToLanguage:v,decodeBitsToLetter:y,decodeFromBase64:function(e,n){for(var t=e;t.length%4!=0;)t+="=";t=t.replace(/-/g,"+").replace(/_/g,"/");for(var r=x.decode(t),o="",a=0;a<r.length;a+=1){var u=r.charCodeAt(a).toString(2);o+=i(u,8-u.length)}return V(o,n)}}},function(e,n,t){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o=(Array.from||function(){var e=function(e){return"function"==typeof e},n=function(e){var n=Number(e);return isNaN(n)?0:0!==n&&isFinite(n)?(n>0?1:-1)*Math.floor(Math.abs(n)):n},t=Math.pow(2,53)-1,o=function(e){var r=n(e);return Math.min(Math.max(r,0),t)},i=function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(void 0===e?"undefined":r(e))>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}},a=function(n,t){if(null!=n&&null!=t){var r=n[t];if(null==r)return;if(!e(r))throw new TypeError(r+" is not a function");return r}},u=function(e){var n=e.next();return!Boolean(n.done)&&n}}(),{1:{version:1,metadataFields:["version","created","lastUpdated","cmpId","cmpVersion","consentScreen","vendorListVersion"],fields:[{name:"version",type:"int",numBits:6},{name:"created",type:"date",numBits:36},{name:"lastUpdated",type:"date",numBits:36},{name:"cmpId",type:"int",numBits:12},{name:"cmpVersion",type:"int",numBits:12},{name:"consentScreen",type:"int",numBits:6},{name:"consentLanguage",type:"language",numBits:12},{name:"vendorListVersion",type:"int",numBits:12},{name:"purposeIdBitString",type:"bits",numBits:24},{name:"maxVendorId",type:"int",numBits:16},{name:"isRange",type:"bool",numBits:1},{name:"vendorIdBitString",type:"bits",numBits:function(e){return e.maxVendorId},validator:function(e){return!e.isRange}},{name:"defaultConsent",type:"bool",numBits:1,validator:function(e){return e.isRange}},{name:"numEntries",numBits:12,type:"int",validator:function(e){return e.isRange}},{name:"vendorRangeList",type:"list",listCount:function(e){return e.numEntries},validator:function(e){return e.isRange},fields:[{name:"isRange",type:"bool",numBits:1},{name:"startVendorId",type:"int",numBits:16},{name:"endVendorId",type:"int",numBits:16,validator:function(e){return e.isRange}}]}]}});e.exports={versionNumBits:6,vendorVersionMap:o}},function(e,n,t){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o=(Array.from||function(){var e=function(e){return"function"==typeof e},n=function(e){var n=Number(e);return isNaN(n)?0:0!==n&&isFinite(n)?(n>0?1:-1)*Math.floor(Math.abs(n)):n},t=Math.pow(2,53)-1,o=function(e){var r=n(e);return Math.min(Math.max(r,0),t)},i=function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(void 0===e?"undefined":r(e))>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}},a=function(n,t){if(null!=n&&null!=t){var r=n[t];if(null==r)return;if(!e(r))throw new TypeError(r+" is not a function");return r}},u=function(e){var n=e.next();return!Boolean(n.done)&&n}}(),t(1)),i=o.decodeBitsToIds,a=o.decodeFromBase64;e.exports={decodeConsentString:function(e){var n=a(e),t=n.version,r=n.cmpId,o=n.vendorListVersion,u=n.purposeIdBitString,s=n.maxVendorId,c=n.created,l=n.lastUpdated,d=n.isRange,f=n.defaultConsent,p=n.vendorIdBitString,m=n.vendorRangeList,y=n.cmpVersion,v=n.consentScreen,h=n.consentLanguage,g={version:t,cmpId:r,vendorListVersion:o,allowedPurposeIds:i(u),maxVendorId:s,created:c,lastUpdated:l,cmpVersion:y,consentScreen:v,consentLanguage:h};if(d){var b=m.reduce(function(e,n){for(var t=n.isRange,r=n.startVendorId,o=n.endVendorId,i=t?o:r,a=r;a<=i;a+=1)e[a]=!0;return e},{});g.allowedVendorIds=[];for(var w=0;w<=s;w+=1)(f&&!b[w]||!f&&b[w])&&-1===g.allowedVendorIds.indexOf(w)&&g.allowedVendorIds.push(w)}else g.allowedVendorIds=i(p);return g}}},function(e,n,t){"use strict";window.consentString=t(5)},function(e,n,t){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o=(Array.from||function(){var e=function(e){return"function"==typeof e},n=function(e){var n=Number(e);return isNaN(n)?0:0!==n&&isFinite(n)?(n>0?1:-1)*Math.floor(Math.abs(n)):n},t=Math.pow(2,53)-1,o=function(e){var r=n(e);return Math.min(Math.max(r,0),t)},i=function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(void 0===e?"undefined":r(e))>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}},a=function(n,t){if(null!=n&&null!=t){var r=n[t];if(null==r)return;if(!e(r))throw new TypeError(r+" is not a function");return r}},u=function(e){var n=e.next();return!Boolean(n.done)&&n}}(),t(6).ConsentString),i=t(3).decodeConsentString,a=t(0).encodeConsentString;e.exports={ConsentString:o,decodeConsentString:i,encodeConsentString:a}},function(e,n,t){"use strict";function r(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},i=function(){function e(e,n){for(var t=0;t<n.length;t++){var r=n[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(n,t,r){return t&&e(n.prototype,t),r&&e(n,r),n}}(),a=(Array.from||function(){var e=function(e){return"function"==typeof e},n=function(e){var n=Number(e);return isNaN(n)?0:0!==n&&isFinite(n)?(n>0?1:-1)*Math.floor(Math.abs(n)):n},t=Math.pow(2,53)-1,r=function(e){var r=n(e);return Math.min(Math.max(r,0),t)},i=function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(void 0===e?"undefined":o(e))>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}},a=function(n,t){if(null!=n&&null!=t){var r=n[t];if(null==r)return;if(!e(r))throw new TypeError(r+" is not a function");return r}},u=function(e){var n=e.next();return!Boolean(n.done)&&n}}(),t(0).encodeConsentString),u=t(3).decodeConsentString,s=t(2).vendorVersionMap,c=/^[a-z]{2}$/,l=function(){function e(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;r(this,e),this.created=new Date,this.lastUpdated=new Date,this.version=1,this.vendorList=null,this.vendorListVersion=null,this.cmpId=null,this.cmpVersion=null,this.consentScreen=null,this.consentLanguage=null,this.allowedPurposeIds=[],this.allowedVendorIds=[],n&&Object.assign(this,u(n))}return i(e,[{key:"getConsentString",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];if(!this.vendorList)throw new Error("ConsentString - A vendor list is required to encode a consent string");return!0===e&&(this.lastUpdated=new Date),a({version:this.getVersion(),vendorList:this.vendorList,allowedPurposeIds:this.allowedPurposeIds,allowedVendorIds:this.allowedVendorIds,created:this.created,lastUpdated:this.lastUpdated,cmpId:this.cmpId,cmpVersion:this.cmpVersion,consentScreen:this.consentScreen,consentLanguage:this.consentLanguage,vendorListVersion:this.vendorListVersion})}},{key:"getMetadataString",value:function(){return a({version:this.getVersion(),created:this.created,lastUpdated:this.lastUpdated,cmpId:this.cmpId,cmpVersion:this.cmpVersion,consentScreen:this.consentScreen,vendorListVersion:this.vendorListVersion})}},{key:"getVersion",value:function(){return this.version}},{key:"getVendorListVersion",value:function(){return this.vendorListVersion}},{key:"setGlobalVendorList",value:function(e){if("object"!==(void 0===e?"undefined":o(e)))throw new Error("ConsentString - You must provide an object when setting the global vendor list");if(!e.vendorListVersion||!Array.isArray(e.purposes)||!Array.isArray(e.vendors))throw new Error("ConsentString - The provided vendor list does not respect the schema from the IAB EU’s GDPR Consent and Transparency Framework");this.vendorList={vendorListVersion:e.vendorListVersion,lastUpdated:e.lastUpdated,purposes:e.purposes,features:e.features,vendors:e.vendors.slice(0).sort(function(e,n){return e.id<n.id?-1:1})},this.vendorListVersion=e.vendorListVersion}},{key:"setCmpId",value:function(e){this.cmpId=e}},{key:"getCmpId",value:function(){return this.cmpId}},{key:"setCmpVersion",value:function(e){this.cmpVersion=e}},{key:"getCmpVersion",value:function(){return this.cmpVersion}},{key:"setConsentScreen",value:function(e){this.consentScreen=e}},{key:"getConsentScreen",value:function(){return this.consentScreen}},{key:"setConsentLanguage",value:function(e){if(!1===c.test(e))throw new Error("ConsentString - The consent language must be a two-letter ISO639-1 code (en, fr, de, etc.)");this.consentLanguage=e}},{key:"getConsentLanguage",value:function(){return this.consentLanguage}},{key:"setPurposesAllowed",value:function(e){this.allowedPurposeIds=e}},{key:"getPurposesAllowed",value:function(){return this.allowedPurposeIds}},{key:"setPurposeAllowed",value:function(e,n){var t=this.allowedPurposeIds.indexOf(e);!0===n?-1===t&&this.allowedPurposeIds.push(e):!1===n&&-1!==t&&this.allowedPurposeIds.splice(t,1)}},{key:"isPurposeAllowed",value:function(e){return-1!==this.allowedPurposeIds.indexOf(e)}},{key:"setVendorsAllowed",value:function(e){this.allowedVendorIds=e}},{key:"getVendorsAllowed",value:function(){return this.allowedVendorIds}},{key:"setVendorAllowed",value:function(e,n){var t=this.allowedVendorIds.indexOf(e);!0===n?-1===t&&this.allowedVendorIds.push(e):!1===n&&-1!==t&&this.allowedVendorIds.splice(t,1)}},{key:"isVendorAllowed",value:function(e){return-1!==this.allowedVendorIds.indexOf(e)}}],[{key:"decodeMetadataString",value:function(e){var n=u(e),t={};return s[n.version].metadataFields.forEach(function(e){t[e]=n[e]}),t}}]),e}();e.exports={ConsentString:l}},function(e,n,t){(function(e,r){var o;!function(i){var a="object"==typeof n&&n,u=("object"==typeof e&&e&&e.exports,"object"==typeof r&&r);var s=function(e){this.message=e};(s.prototype=new Error).name="InvalidCharacterError";var c=function(e){throw new s(e)},l="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",d=/[\t\n\f\r ]/g,f={encode:function(e){e=String(e),/[^\0-\xFF]/.test(e)&&c("The string to be encoded contains characters outside of the Latin1 range.");for(var n,t=e.length%3,r="",o=-1,i=e.length-t;++o<i;)n=(e.charCodeAt(o)<<16)+(e.charCodeAt(++o)<<8)+e.charCodeAt(++o),r+=l.charAt(n>>18&63)+l.charAt(n>>12&63)+l.charAt(n>>6&63)+l.charAt(63&n);return 2==t?(n=(e.charCodeAt(o)<<8)+e.charCodeAt(++o),r+=l.charAt(n>>10)+l.charAt(n>>4&63)+l.charAt(n<<2&63)+"="):1==t&&(n=e.charCodeAt(o),r+=l.charAt(n>>2)+l.charAt(n<<4&63)+"=="),r},decode:function(e){var n=(e=String(e).replace(d,"")).length;n%4==0&&(n=(e=e.replace(/==?$/,"")).length),(n%4==1||/[^+a-zA-Z0-9/]/.test(e))&&c("Invalid character: the string to be decoded is not correctly encoded.");for(var t,r,o=0,i="",a=-1;++a<n;)r=l.indexOf(e.charAt(a)),t=o%4?64*t+r:r,o++%4&&(i+=String.fromCharCode(255&t>>(-2*o&6)));return i},version:"0.1.0"};void 0!==(o=function(){return f}.call(n,t,n,e))&&(e.exports=o)}()}).call(n,t(8)(e),t(9))},function(e,n){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}},function(e,n){var t;t=function(){return this}();try{t=t||Function("return this")()||(0,eval)("this")}catch(e){"object"==typeof window&&(t=window)}e.exports=t}]),"undefined"==typeof __cmp&&(__cmp={}),function(e){e.__cmp=function(){function n(){if(!e.frames.__cmpLocator)if(document.body){var t=document.body,r=document.createElement("iframe");r.style="display:none",r.name="__cmpLocator",t.appendChild(r)}else setTimeout(n,5)}var t=[];!function(){if(__cmp.a)for(var e=0;e<__cmp.a.length;e++){var n={},r=__cmp.a[e];n.commandmethod=r[0],n.parameter=r[1],n.callback=r[2],t.push(n)}}(),n(),(e.attachEvent||e.addEventListener)("message",function(n){e.__cmp.receiveMessage(n)},!1);var r=function(e,n,t){if(t)switch(e){case"ping":Optanon.getPingRequest(t);break;case"getVendorConsents":Optanon.getVendorConsentsRequest(t);break;case"getConsentData":Optanon.getConsentDataRequest(t)}};return r.receiveMessage=function(e){var n=e.data,t=e.origin,o=e.source;if(n&&n.__cmpCall){var i=n.__cmpCall.callId,a=n.__cmpCall.command;n.__cmpCall.parameter;r(a,0,function(e,n){o.postMessage({__cmpReturn:{returnValue:e,success:n,callId:i,command:a}},t)})}else n&&n.OnetrustIABCookies&&Optanon.updateConsentFromCookies(n.OnetrustIABCookies)},r.proccessQueue=function(){if(t)for(var e=0;e<t.length;e++)r(t[e].commandmethod,t[e].parameter,t[e].callback)},r}()}(window);
//BEHAVIOUR_END
var c;
if (typeof Optanon == 'undefined') {
    Optanon = OneTrust = {};
}

(function () {
    "use strict";

    // Polyfill Helpers For IE 11
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
          if (typeof start !== 'number') {
            start = 0;
          }
    
          if (start + search.length > this.length) {
            return false;
          } else {
            return this.indexOf(search, start) !== -1;
          }
        };
    }

    var optanonVersion = '4.3.1',
        optanonCookieName = 'OptanonConsent',
        optanonCookieDomain = '[[OptanonCookieDomain]]',
        optanonAlertBoxClosedCookieName = 'OptanonAlertBoxClosed',
        
        
            useLatestJquey = [[UseLatestJqueryVersion]],
           

        optanonPreview = [[OptanonPreview]],
        optanonGeolocationExecuteAllScripts = false,
        optanonDoNotTrackEnabled = navigator.doNotTrack == 'yes' || navigator.doNotTrack == '1' || navigator.msDoNotTrack == '1',
        doNotTrackText = 'do not track',
        optanonIsOptInMode = getIsOptInMode(),
        optanonIsSoftOptInMode = getIsSoftOptInMode(),
        optanonEnsureCookieDataCompatibilityComplete = false,
        optanonHtmlGroupData, //Stores pending html Optanon Group Id changes before writing to cookie
        optanonWrapperScriptExecutedGroups = [], //Stores Optanon Group Ids for which wrapper InsertScript has already been executed for
        optanonWrapperHtmlExecutedGroups = [], //Stores Optanon Group Ids for which wrapper InsertHtml has already been executed for
        optanonWrapperScriptExecutedGroupsTemp = [],
        optanonWrapperHtmlExecutedGroupsTemp = [],
        optanonGroupIdPerformanceCookies = [[OptanonGroupIdPerformanceCookies]],
        optanonGroupIdFunctionalityCookies = [[OptanonGroupIdFunctionalityCookies]],
        optanonGroupIdTargetingCookies = [[OptanonGroupIdTargetingCookies]],
        optanonGroupIdSocialCookies = [[OptanonGroupIdSocialCookies]],
        optanonAboutCookiesGroupName = optanonData().AboutCookiesText,
        optanonNotLandingPageName = 'NotLandingPage',
        optanonAwaitingReconsentName = 'AwaitingReconsent',
        optanonShowSubGroupCookies = [[ShowSubGroupCookies]],
        optanonShowSubGroupDescription = [[ShowSubGroupDescription]],
        onetrustClientScriptUrl = null,
        isWebsiteContainFixedHeader = false,
        isRTL = false,
        isClassic = false,
        isCenterTile = [[IsCenterTile]],
        geolookupCookieParamName = "EU",
        //BEHAVIOUR(IsIABEnabled == true)
        oneTrustIABConsent = {
            purpose : [],
            vendors : [],
            vendorList : null
        },
        oneTrustIABCookieName = 'eupubconsent',
        oneTrustIAB3rdPartyCookie = 'euconsent',     
        oneTrustIABgdprAppliesGlobally = true,
        IAB3rdPartyCookieValue = "",
        IABCookieValue = "",
        //BEHAVIOUR_END
        //BEHAVIOUR(IsConsentIntegration == true)
        onetrustConsentParamName = "consentId",
        //BEHAVIOUR_END
        firstTimebannerLoad = true,        
        optanonJsonData,
        isInEU = false,
        useGeoLocationService = true,
        optanonHtmlGroupDataTemp,
        impliedConsentDirty = false,
        constant = {
            KEEPCENTERTILEBANNEROPEN : "keepBannerOpen",
            IMPLIEDCONSENT: 'implied consent',
            FIRSTPAGEVIEW: 'firstPageView'
        }
        ,$Opt ;

    function isTouchDevice() {
        return 'ontouchstart' in window || !!(navigator.msMaxTouchPoints);
    }

    function updateGtmMacros(allowAll) {
        var gtmOptanonActiveGroups = [],
            i,
            json = optanonData();

        if(json.ConsentModel && json.ConsentModel.Name.toLowerCase() === constant.IMPLIEDCONSENT && !impliedConsentDirty && !allowAll) {
            for (i = 0; i < optanonHtmlGroupDataTemp.length; i++) {
                if (endsWith(optanonHtmlGroupDataTemp[i], ':1') && canSoftOptInInsertForGroup(optanonHtmlGroupDataTemp[i].replace(':1', ''))) {
                    gtmOptanonActiveGroups.push(optanonHtmlGroupDataTemp[i].replace(':1', ''));
                }
            }
        } else {
            for (i = 0; i < optanonHtmlGroupData.length; i++) {
                if (endsWith(optanonHtmlGroupData[i], ':1') && canSoftOptInInsertForGroup(optanonHtmlGroupData[i].replace(':1', ''))) {
                    gtmOptanonActiveGroups.push(optanonHtmlGroupData[i].replace(':1', ''));
                }
            }
        }

        // Setting "optanon-active-groups" global variable for Google Tag Manager macro
        var serializeArrayString = ',' + serialiseArrayToString(gtmOptanonActiveGroups) + ',';
        window.OnetrustActiveGroups = serializeArrayString;
 		window.OptanonActiveGroups = serializeArrayString;

        // Setting "optanon-active-groups" data layer field for Google Tag Manager macro
        if (typeof dataLayer != 'undefined') {
            if (dataLayer.constructor === Array) {
                dataLayer.push({ 'OnetrustActiveGroups' : serializeArrayString });
				dataLayer.push({ 'OptanonActiveGroups' : serializeArrayString });
            }
        } else {
            window.dataLayer = [{ 'event': 'OptanonLoaded', 'OnetrustActiveGroups' : serializeArrayString }];
			window.dataLayer = [{ 'event': 'OptanonLoaded', 'OptanonActiveGroups' : serializeArrayString }];
        }

        // Trigger consent changed event
        setTimeout(function() {
            var event = new CustomEvent('consent.onetrust', { detail: gtmOptanonActiveGroups });
            window.dispatchEvent(event);    
        });
    }

    function initialiseCssReferences() {
        insertCssReference(updateCorrectUrl('[[CssFilePathUrl]]'));

        var links = document.querySelectorAll('link');

        for(var i = 0; i < links.length; i++){
            if(links[i].href.includes('onetrust-rtl.css')){
                isRTL = true;
            }
            if(links[i].href.includes('default_responsive')){
                isClassic = true;
            }
        }

        // Figure out foreground colour for buttons
        var color = hexToRgb("[[OptanonSecondaryColor]]");
        var textColor = color ? (((color.r * 0.299 + color.g * 0.587 + color.b * 0.114) > 186) ? "#000000" : "#ffffff") : "";

        // Insert custom skin css
        var style = document.createElement("style")
        style.innerHTML = "#optanon ul#optanon-menu li { background-color: [[OptanonMenuColor]] !important }" +
            "#optanon ul#optanon-menu li.menu-item-selected { background-color: [[OptanonMenuHighlightColor]] !important }" +
            "#optanon #optanon-popup-wrapper .optanon-white-button-middle { background-color: [[OptanonSecondaryColor]] !important }" +
            ".optanon-alert-box-wrapper .optanon-alert-box-button-middle { background-color: [[OptanonSecondaryColor]] !important; border-color: [[OptanonSecondaryColor]] !important; }" +
            "#optanon #optanon-popup-wrapper .optanon-white-button-middle button { color: " + textColor + " !important }" +
            ".optanon-alert-box-wrapper .optanon-alert-box-button-middle button { color: " + textColor + " !important }" +
            "#optanon #optanon-popup-bottom { background-color: [[OptanonPrimaryColor]] !important }" +
            "#optanon.modern #optanon-popup-top, #optanon.modern #optanon-popup-body-left-shading { background-color: [[OptanonPrimaryColor]] !important }" +
            ".optanon-alert-box-wrapper { background-color:[[OnetrustBannerBackgroundColor]] !important }" +
            ".optanon-alert-box-wrapper .optanon-alert-box-bg p { color:[[OnetrustBannerTextColor]] !important }" +
            "[[OptanonCustomCSS]]";

            if(isCenterTile) {
                style.innerHTML +=
                ".optanon-alert-box-button-container .optanon-alert-box-accept-button { background-color: [[OptanonSecondaryColor]] !important }" +
                ".optanon-alert-box-wrapper .optanon-alert-box-notice, .optanon-banner-title, .optanon-alert-box-footer, #optanon-popup-bottom-content { color:[[OnetrustBannerTextColor]] !important }";
            }

        document.getElementsByTagName('head')[0].appendChild(style);
    }

    function initialiseLandingPath() {
        var existingPath = readCookieParam(optanonCookieName, 'landingPath');

        // landing page viewed - ensure the parameter is updated but don't hide the alert box
        if (!existingPath || existingPath === location.href) {
            setLandingPathParam(location.href);
            return;
        }

        var awaitingReconsent = readCookieParam(optanonCookieName, optanonAwaitingReconsentName) === 'true';
        var json = optanonData(), cookie = getCookie(optanonAlertBoxClosedCookieName), reconsentDate = json.LastReconsentDate;
        var needsReconsent = cookie && reconsentDate && new Date(reconsentDate) > new Date(cookie);
        if (needsReconsent && !awaitingReconsent) {
            // we need the reconsent so we're updating the landing page parameter and setting the reconsent flag
            setLandingPathParam(location.href);
            writeCookieParam(optanonCookieName, optanonAwaitingReconsentName, true);
            return;
        }

        // make sure the initial landing page isn't treated as such after navigating away
        setLandingPathParam(optanonNotLandingPageName);
        writeCookieParam(optanonCookieName, optanonAwaitingReconsentName, false);

        if (optanonIsSoftOptInMode) {
            Optanon.SetAlertBoxClosed(true);
        }
    }

    function setLandingPathParam(value) {
        writeCookieParam(optanonCookieName, 'landingPath', value);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function insertCssReference(url) {
        var link = document.createElement('link');

        link.type = 'text/css';
        link.href = url;
        link.rel = 'stylesheet';
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function injectConsentNotice() {
        var json = optanonData();
        $Opt = jQuery.noConflict(true);

        


        //BEHAVIOUR(IsIABEnabled == true)
        var IabDataJson = IABData();
        if (json.IsIABEnabled) {
            if(!oneTrustIABConsent.vendorList) {
                var vendorlistUrl = "https://vendorlist.consensu.org/vendorlist.json";
                if(IabDataJson.vendorListVersion && IabDataJson.vendorListVersion>0) {
                    vendorlistUrl = "https://vendorlist.consensu.org/v-"+IabDataJson.vendorListVersion+"/vendorlist.json";
                }
                $Opt.getJSON(vendorlistUrl, function (response) {
                    oneTrustIABConsent.vendorList = response;
                });
            }
          
            if(!json.euOnly) {              
                window.jsonFeed = function (data) {
                    if(!readCookieParam(optanonCookieName, geolookupCookieParamName)) {
                        writeCookieParam(optanonCookieName, geolookupCookieParamName, data.displayPopup);
                    }
                    assignIABGlobalScope(data.displayPopup);
                }
            }
        }
        //BEHAVIOUR_END

        //Set up default banner trigger
        $Opt(window).on('load', Optanon.LoadBanner);

        if(optanonPreview){
            Optanon.loadDefaultBannerGroup();
        }

        window.jsonFeed = function (data) {
            if(!readCookieParam(optanonCookieName, geolookupCookieParamName)) {
                writeCookieParam(optanonCookieName, geolookupCookieParamName, data.displayPopup);
            }

            //BEHAVIOUR(IsIABEnabled == true)
            assignIABGlobalScope(data.displayPopup);
            //BEHAVIOUR_END
            if (data.displayPopup == true || data.displayPopup == 'true' || isInEU == 'true' || isInEU == true) {

                Optanon.loadDefaultBannerGroup(data);

            } else {

                if(!json.euOnly) {
                    Optanon.loadDefaultBannerGroup();
                } else {
                    if(!optanonPreview && readCookieParam(optanonCookieName, geolookupCookieParamName)) {
                        updateCookieParam(optanonCookieName, geolookupCookieParamName, isInEU);
                    }

                    if(!readCookieParam(optanonCookieName, constant.FIRSTPAGEVIEW)) {
                        writeCookieParam(optanonCookieName, constant.FIRSTPAGEVIEW, true);
                    } else {
                        if (!performance.navigation.type == 1) {
                            updateCookieParam(optanonCookieName, constant.FIRSTPAGEVIEW, false);
                            if(json.ConsentModel && json.ConsentModel.Name.toLowerCase() === constant.IMPLIEDCONSENT) {
                                closeBannerHandler(true); 
                            }
                        }
                    }

                    optanonGeolocationExecuteAllScripts = true;
    
                    $Opt(window).one('otloadbanner', function () {
    
                        substitutePlainTextScriptTags();
    
                        var showCookieSettingsLink = false;
                        if($Opt('.optanon-show-settings').length > 0) {
                            if($Opt('.optanon-show-settings').attr('data-ignore-geolocation'))
                            {
                                if($Opt('.optanon-show-settings').attr('data-ignore-geolocation').toLowerCase() === "true") {
                                    showCookieSettingsLink = true;
                                }
                            }
                        }
    
                        if(showCookieSettingsLink) {
                            //Insert Optanon main consent notice component
                            if(!checkIscenterTile()) {
                                insertConsentNoticeHtml();
                            } else {
                                insertCenterTileConsentNoticeHtml()
                            }
    
                            //common
                            initialiseConsentNoticeHandlers();
    
                            //Insert Optanon Show Settings component
                            insertShowSettingsButtonsHtml();
                            initialiseShowSettingsButtonsHandlers();
                            //BEHAVIOUR(IsIABEnabled == true)
                            if (json.IsIABEnabled) {
                                InitializeVendorList();
                            }
                            //BEHAVIOUR_END
    
                            if (!firstTimebannerLoad) {
                                Optanon.AllowAll(true);
                            }
    
                        } else {
                            //Remove Optanon Show Settings component
                            $Opt('.optanon-show-settings').remove();
    
                            //Remove Optanon consent notice handlers
                            $Opt('.optanon-close-consent').remove();
                            $Opt('.optanon-close-ui').remove();
                            $Opt('.optanon-toggle-display').remove();
                            $Opt('.optanon-allow-all').remove();
                            //When cookie groups are disabled(opt-in) set all groups to enable as banner not available.
                            Optanon.AllowAll(true);
                        }
    
                        //Insert Optanon Cookie Policy component
                        if ($Opt('#optanon-cookie-policy').length > 0) {
                            insertCookiePolicyHtml();
                        }
    
                        // Setting focus on appropriate button
                        onLoadButtonFocus();
                    });
                }

            }
        };
    }

    this.loadDefaultBannerGroup = function (data) {
        var json = optanonData();
        
        if(!optanonPreview && readCookieParam(optanonCookieName, geolookupCookieParamName)) {
            updateCookieParam(optanonCookieName, geolookupCookieParamName, (data && data.displayPopup) ? data.displayPopup : isInEU);
        }

        if(!readCookieParam(optanonCookieName, constant.FIRSTPAGEVIEW)) {
            writeCookieParam(optanonCookieName, constant.FIRSTPAGEVIEW, true);
        } else {
            if (!performance.navigation.type == 1) {
                updateCookieParam(optanonCookieName, constant.FIRSTPAGEVIEW, false);
                if(json.ConsentModel && json.ConsentModel.Name.toLowerCase() === constant.IMPLIEDCONSENT) {
                    closeBannerHandler(true); 
                }
            }
        }

        $Opt(window).one('otloadbanner', function () {

            substitutePlainTextScriptTags();

            //Insert Optanon main consent notice component
            if(!checkIscenterTile()) {
                insertConsentNoticeHtml();
            } else {
                insertCenterTileConsentNoticeHtml()
            }

            initialiseConsentNoticeHandlers();

            //Insert Optanon alert component
            //BEHAVIOUR(ShowAlert == true)
            if(!checkIscenterTile()) {
                insertAlertHtml();
                initialiseAlertHandlers();
            }
            //BEHAVIOUR_END

            //Insert Optanon Center Tilealert component
            //BEHAVIOUR(CenterTile == true)
            if(checkIscenterTile()) {
                insertCenterTileAlertHTML();
                initialiseAlertHandlers();
            }
            //BEHAVIOUR_END

            //BEHAVIOUR(IsIABEnabled == true)
            if(!IAB3rdPartyCookieValue){
                setIAB3rdPartyCookie(oneTrustIAB3rdPartyCookie, "", 0, true);
            }
            
            if (json.IsIABEnabled) {
                InitializeVendorList();
            }
            //BEHAVIOUR_END


            //Insert Optanon Show Settings component
            if ($Opt('.optanon-show-settings').length > 0) {
                insertShowSettingsButtonsHtml();
            }

            //Insert Optanon Cookie Policy component
            if ($Opt('#optanon-cookie-policy').length > 0) {
                insertCookiePolicyHtml();
            }

            executeOptanonWrapper();

            //Always set cookie if not set yet
            if (!readCookieParam(optanonCookieName, 'groups')) {
                writeCookieGroupsParam(optanonCookieName);
            }

            // Setting focus on appropriate button
            onLoadButtonFocus();    
        });
    }

    function onLoadButtonFocus() {
        if($Opt('.optanon-alert-box-button-container .cookie-settings-button').length > 0) {
            $Opt('.optanon-alert-box-button-container .cookie-settings-button').focus();
        } else if ($Opt('.optanon-alert-box-button-container .accept-cookies-button').length > 0) {
            $Opt('.optanon-alert-box-button-container .accept-cookies-button').focus();
        } else if ($Opt('.optanon-alert-box-button-container .banner-close-button').length > 0) {
            $Opt('.optanon-alert-box-button-container .banner-close-button').focus();
        } 
    }

    //Substitute text/plain script type attributes with text/javascript
    function substitutePlainTextScriptTags() {
        $Opt('script').filter(function () {
            return $Opt(this).attr('type') && $Opt(this).attr('type').toLowerCase() == 'text/plain' && $Opt(this).attr('class') && $Opt(this).attr('class').toLowerCase().match(/optanon-category(-[a-zA-Z0-9]+)+($|\s)/);
        }).each(function () {
            var groupIds = $Opt(this).attr('class').toLowerCase().split('optanon-category-')[1].split('-');
            var isInsertGroup = true;
            if(groupIds && groupIds.length>0)
            {
                for (var i = 0; i < groupIds.length; i++) {                
                    if(!canInsertForGroup(groupIds[i], optanonGeolocationExecuteAllScripts)){
                        isInsertGroup = false;
                        break;
                    }
                }
                if(isInsertGroup) {
                    $Opt(this).replaceWith($Opt(this).attr('type', 'text/javascript')[0].outerHTML);
                }
            }
        });
    }

    function insertConsentNoticeHtml() {
        var group,
            json = optanonData(),
            groupIsAboutCookies,
            groupIsActive,
            menuItem,
            moreInfo,
            i;

        jsonAddAboutCookies(json);

        $Opt('body').prepend('<div id="optanon" class="[[OptanonStyle]]"></div>');

        var preferenceCenterDataHTML = '<div id="optanon-popup-bg"></div>' +
            '<div id="optanon-popup-wrapper" role="dialog" aria-modal="true" tabindex="-1">' +
            '<div id="optanon-popup-top">';

            if (json.ShowPreferenceCenterCloseButton) {
                if(!json.CloseText) {
                    json.CloseText = "Close";
                }
                preferenceCenterDataHTML = preferenceCenterDataHTML + '<button onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Close Button\');" '+
                    'aria-label="'+ json.CloseText +'" class="optanon-close-link optanon-close optanon-close-ui" title="'+ json.CloseText +'">'+
                    '<div id="optanon-close" '+
                    'style="background: url('+updateCorrectUrl('[[OptanonStaticContentLocation]]/images/optanon-pop-up-close.png')+');width:34px;height:34px;">'+
                    '</div></button>';
            }
            
            var logoUrl = "'" + updateCorrectUrl('[[OptanonLogo]]') + "'";
            preferenceCenterDataHTML = preferenceCenterDataHTML + '</div>' +
            '<div id="optanon-popup-body">' +
            '<div id="optanon-popup-body-left">' +
            '<div id="optanon-popup-body-left-shading"></div>' +
            '<div id="optanon-branding-top-logo" style="background-image: url('+ logoUrl +') !important;"></div>' +
            '<ul id="optanon-menu" aria-label="Navigation Menu" role="tablist"></ul></div></div></div></div>';

            $Opt('#optanon').html(preferenceCenterDataHTML);

        if (json.Language && json.Language.Culture) {
            $Opt("#optanon-popup-wrapper").attr("lang", json.Language.Culture);
        }

        for (i = 0; i < json.Groups.length; i += 1) {
            group = json.Groups[i];
            if (safeGroupName(group) == optanonAboutCookiesGroupName || (isTopLevelGroup(group) && isValidConsentNoticeGroup(group))) {
                groupIsAboutCookies = safeGroupName(group) == optanonAboutCookiesGroupName;
                groupIsActive = $Opt.inArray((getGroupIdForCookie(group) + ':1'), optanonHtmlGroupData) != -1;
                menuItem = $Opt('<li class="menu-item-necessary ' + (groupIsAboutCookies || groupIsActive ? 'menu-item-on' : 'menu-item-off') +
                    '" title="' + safeGroupName(group) + '">' +
                    '<p class="preference-menu-item"><button role="tab" aria-selected="' + (i === 0 ? "true" : "false") + '" aria-controls="tab-' + i + '" id="' + safeGroupName(group).split(' ')[0] + '-'+ safeGroupName(group).split(' ')[1] + '">' + safeGroupName(group) + '</button></p>' +
                    '</li>');

                if (safeGroupName(group) == optanonAboutCookiesGroupName) {
                    menuItem.removeClass('menu-item-necessary').addClass('menu-item-about');
                }

                switch (group.OptanonGroupId) {
                    case optanonGroupIdPerformanceCookies: //Performance Cookies
                        menuItem.removeClass('menu-item-necessary').addClass('menu-item-performance');
                        break;
                    case optanonGroupIdFunctionalityCookies: //Functionality Cookies
                        menuItem.removeClass('menu-item-necessary').addClass('menu-item-functional');
                        break;
                    case optanonGroupIdTargetingCookies: //Targeting Cookies
                        menuItem.removeClass('menu-item-necessary').addClass('menu-item-advertising');
                        break;
                    case optanonGroupIdSocialCookies: //Social Cookies
                        menuItem.removeClass('menu-item-necessary').addClass('menu-item-social');
                        break;
                    default:
                        break;
                }

                menuItem.data('group', group);
                menuItem.data('optanonGroupId', getGroupIdForCookie(group));
                menuItem.click(consentNoticeMenuItemClick);

                $Opt('#optanon #optanon-menu').append(menuItem);
            }
        }

        moreInfo = $Opt('<li class="menu-item-moreinfo menu-item-off" title="' + json.AboutText + '">' +
            '<p class="preference-menu-item"><a target="_blank" aria-label="'+ json.AboutText +'" href="' + json.AboutLink + '"'+
            ' onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Cookie Policy\');">' + json.AboutText + '</a></p>' +
            '</li>');
        $Opt('#optanon #optanon-menu').append(moreInfo);

        $Opt('#optanon #optanon-popup-body').append('<div id="optanon-popup-body-right">' +
            '<p role="heading" aria-level="2" class="legacy-preference-banner-title h2" aria-label="'+ json.MainText +'">' + json.MainText + '</p>' +
            '<div class="vendor-header-container">'+
            '<p class="header-3" role="heading" aria-level="3"></p>'+
            '<div id="optanon-popup-more-info-bar">'+
            '<div class="optanon-status">' +
            getGroupToggle(json, "chkMain") +
            getGroupAlwaysActive(json) +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="optanon-main-info-text" role="tabpanel"></div>' +
            (json.IsIABEnabled && json.VendorLevelOptOut ? '<div id="optanon-vendor-consent-text">'+
            '<button class="vendor-consent-link" aria-label="View Vendor Consent">View Vendor Consent</button></div>':'') +
            '</div>' +
            '<div class="optanon-bottom-spacer"></div>');

        $Opt('#optanon #optanon-popup-wrapper').append('<div id="optanon-popup-bottom"> <a href="https://onetrust.com/poweredbyonetrust" target="_blank">' +
            '<div id="optanon-popup-bottom-logo" style="background: url('+updateCorrectUrl('[[OptanonStaticContentLocation]]/images/cookie-collective-top-bottom.png')+');width:155px;height:35px;" title="powered by OneTrust"></div></a>' +
            '<div class="optanon-button-wrapper optanon-save-settings-button optanon-close optanon-close-consent">'+
            '<div class="optanon-white-button-left"></div>'+
            '<div class="optanon-white-button-middle">'+
            '<button title="'+ json.AllowAllText +'" aria-label="' + json.AllowAllText + '" onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Save Settings\');">' + 
            json.AllowAllText + '</button>'+
            '</div><div class="optanon-white-button-right"></div></div>' +
            '<div class="optanon-button-wrapper optanon-allow-all-button optanon-allow-all">'+
            '<div class="optanon-white-button-left"></div><div class="optanon-white-button-middle">'+
            '<button title="'+ json.ConfirmText +'" aria-label="'+ json.ConfirmText +'" onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Allow All\');">' + 
            json.ConfirmText + 
            '</button></div><div class="optanon-white-button-right"></div></div>' +
            '</div>');

        setAllowAllButton();
    }

    function getGroupToggle(json, toggleId) {
        var p = isRTL ? '<p class="togglerChk mainToggle">' : isClassic && !json.ShowPreferenceCenterCloseButton ? '<p class="no-closeBtn">': '<p>',
            span = (isRTL) ? '<span class="toggleChk"></span>' : '';
       
        return '<div class="optanon-status-editable">' +
            '<form>' +
            '<span class="fieldset">' +
            p +
            span +
            '<input type="checkbox" value="check" id="' + toggleId + '" checked class="legacy-group-status optanon-status-checkbox" />' +
            '<label for="' + toggleId + '">' + (isRTL ? '' : json.ActiveText) + '</label>' +
            '</p>' +
            '</span>' +
            '</form>' +
            '</div>';
    }

    function getSubgroupToggle(json, group) {
        //BEHAVIOUR(ShowSubgroupToggles == true)
        var p = isRTL ? '<p class="togglerChk subToggle"><span class="toggleChk"></span>' : '<p>';
        
        var toggleId = 'chk' + getGroupIdForCookie(group);
        var $toggle = $Opt('<span class="optanon-subgroup-fieldset fieldset">' + p + '</span><input type="checkbox" value="check" id="' + toggleId +
            '" checked="" class="optanon-subgroup-checkbox optanon-status-checkbox" aria-label="'+safeGroupName(group) +'">' +
            '<label for="' + toggleId + '">' + (isRTL ? '' : json.ActiveText) + '</label></p></span>');
        $toggle.find("input").data('group', group);
        $toggle.find("input").data('optanonGroupId', getGroupIdForCookie(group));
        return $toggle;
        //BEHAVIOUR_END
        //BEHAVIOUR(ShowSubgroupToggles == false)
        return null;
        //BEHAVIOUR_END
    }

    function getGroupAlwaysActive(json) {
        var p = isClassic && !json.ShowPreferenceCenterCloseButton ? '<p class="no-closeBtn">': '<p>';
        return '<div class="optanon-status-always-active optanon-status-on">' +
            p + json.AlwaysActiveText + '</p>' +
            '</div>';
    }

    function consentNoticeMenuItemClick() {
        var json = optanonData(),
            group = $Opt(this).data('group'),
            subGroups = getGroupSubGroups(group),
            groupCookiesHtml,
            groupCookiesHtml,
            ariaLabel = this.childNodes[0].children[0].id,
            id = ariaLabel.split('-')[0] + '-description';

        jsonAddAboutCookies(json);
        var groupName = safeGroupName(group);
        $Opt("#optanon #optanon-menu li").removeClass('menu-item-selected');
        $Opt(this).addClass('menu-item-selected');

        $Opt('#optanon p.header-3').text(groupName);

        document.querySelector("#optanon-popup-body-right").children[2].setAttribute('id', id);
        document.querySelector("#optanon-popup-body-right").children[2].setAttribute('aria-labelledby', ariaLabel);
        document.querySelector('#optanon #'+ id).innerHTML = safeFormattedGroupDescription(group);
        
        var menuItem = document.querySelectorAll('.preference-menu-item button');
        
        for(var i = 0; i < menuItem.length; i++){
            if(menuItem[i].attributes[1].value === 'true'){
                menuItem[i].setAttribute('aria-selected', false);
            }
            if(menuItem[i].parentElement.parentElement.classList.contains('menu-item-selected')){
                menuItem[i].setAttribute('aria-selected', true);
            }
        }

        //Show cookie data table
        if (group && !json.HideToolbarCookieList) {
            groupCookiesHtml = getGroupCookiesHtml(group);
            $Opt('#optanon .optanon-main-info-text').append(groupCookiesHtml);
        }

        setGroupStatus(group, json);

        if (subGroups && subGroups.length > 0) {
            for (var j = 0; j < subGroups.length; j += 1) {
                setGroupStatus(subGroups[j], json);
            }
        }

        var headerCheckbox = document.querySelector('#optanon .optanon-status-checkbox'),
            subgroupCheckbox = document.querySelectorAll('#optanon .optanon-subgroup-checkbox'),
            headerSpan = document.createElement('span');
            headerSpan.classList.add('sr-only');
            headerSpan.innerText = groupName;
        headerCheckbox.nextSibling.insertBefore(headerSpan, headerCheckbox.firstChild);

        if(subgroupCheckbox.length > 0){
            subGroups.forEach(function(subgroup, idx) {
                var subgroupSpan = document.createElement('span');
                subgroupSpan.classList.add('sr-only');
                subgroupSpan.innerText = safeGroupName(subgroup);
                subgroupCheckbox[idx].nextSibling.insertBefore(subgroupSpan, subgroupCheckbox.firstChild);
            })
        }

        if (groupName == optanonAboutCookiesGroupName) {
            $Opt('#optanon #optanon-popup-more-info-bar').hide();
        } else {
            $Opt('#optanon #optanon-popup-more-info-bar').show();
        }

        if(json.IsIABEnabled && json.VendorLevelOptOut) {
            getVendorText();
        }     

        return false;
    }

    function setGroupStatus(group, json) {
        
        if (safeGroupDefaultStatus(group).toLowerCase() == 'always active' || safeGroupDefaultStatus(group.Parent).toLowerCase() == 'always active') {
            $Opt('#optanon .optanon-status-always-active').show();
            $Opt('#optanon .optanon-status-editable').hide();
        } else {
            $Opt('#optanon .optanon-status-editable').show();
            $Opt('#optanon .optanon-status-always-active').hide();
             // Updating group toggle id to unique value
             $Opt('#optanon .optanon-status-editable .optanon-status-checkbox').prop('id', 'chk'+group.GroupId);
             $Opt('#optanon .optanon-status-editable label').attr('for', 'chk'+group.GroupId);

            var isGroupActive = $Opt.inArray((getGroupIdForCookie(group) + ':1'), optanonHtmlGroupData) != -1;
            var groupCheckbox = $Opt(isTopLevelGroup(group) ? "#chk"+group.GroupId : '#optanon #chk' + getGroupIdForCookie(group)),
                option = (isRTL ? groupCheckbox.prev('.toggleChk') : groupCheckbox.next('label'));
                
            if (isGroupActive) {
                groupCheckbox.prop('checked', true);
                groupCheckbox.parent().addClass('optanon-status-on');
                option.text(json.ActiveText);
            } else {
                groupCheckbox.prop('checked', false);
                groupCheckbox.parent().removeClass('optanon-status-on');
                if (json.InactiveText) option.text(json.InactiveText);
            }
        }
    }
    //BEHAVIOUR(IsIABEnabled == true)
    function InitializeVendorList() {
        var json = optanonData(),
            vendors = IABData(),
            i;
            vendors = vendors?vendors.activeVendors :null;

        if (checkIscenterTile()) {
            $Opt('#optanon-popup-body').append('<div id="optanon-vendor-consent-back"><button class="vendor-consent-back-link" aria-label="Back">Back</button></div>');
            $Opt('#optanon-popup-body').append('<div class="optanon-vendor-center-tile">' +
                '<div id="optanon-vendor-consent-list">' +
                '<div></div>');
        } else {
            $Opt('#optanon-popup-body-left').append('<div id="optanon-vendor-consent-back"><button class="vendor-consent-back-link" aria-label="Back">Back</button></div>');
            $Opt('#optanon-popup-body-right').append('<div id="optanon-vendor-consent-list"></div>');
        }
       
        if(vendors && vendors.length>0){
            for (i = 0; i < vendors.length; i ++) {
                vendors[i].policyUrl = getValidUrl(vendors[i].policyUrl);
                $Opt("#optanon-vendor-consent-list").append('<div class="vendor-item">' +
                    '<div class="vendor-detail">' +
                    '<div class="vendor-name">' + vendors[i].vendorName + '</div>' +
                    '<a class="vendor-privacy-policy" rel="nofollow" target="_blank" href="' + vendors[i].policyUrl + '" onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Cookie Policy\');">' + vendors[i].policyUrl + '</a>' +
                    '</div>' +
                    '<div class="vendor-toggle-content">' + getVendorToggle(json, vendors[i].vendorId) + '</div>' +
                    '</div>');
            }
        }

        if (checkIscenterTile()) {
            $Opt('#optanon-popup-body .optanon-vendor-center-tile').prepend('<div class="vendor-list-title"><div class="vendor-consent-title">Vendor Consent </div>' +
            '<div class="optanon-vendor-list-allow-all">' +
            getVenderListAllowAllToggle() +
            '</div></div>'); 
            $Opt('#optanon-popup-body .optanon-vendor-center-tile').hide();
            $Opt('#optanon-popup-body #optanon-vendor-consent-back').hide();
           
        } else {
            $Opt('#optanon #optanon-popup-body-right .vendor-header-container').append('<div class="optanon-vendor-list-allow-all">' +
            getVenderListAllowAllToggle() +
            '</div>');
            $Opt('#optanon-popup-body-right #optanon-vendor-consent-list').hide();
            $Opt('#optanon-popup-body-left #optanon-vendor-consent-back').hide();
            $Opt('#optanon-popup-body-right .optanon-vendor-list-allow-all').hide();
        }
        setVendorStatus();
    }

    function getValidUrl(url) {
        if(!url) return;
        var urlWithHttpRegex = /^(http)s?:\/\//i; // http(s)://domain.com
        var protocolRelativeUrlRegex = /^:\/\//; // ://domain.com
        if(url.match(protocolRelativeUrlRegex)){
            return "http" + url;
        } else if(!url.match(urlWithHttpRegex)){
            return "http://" + url;
        } else {
            return url;
        }
    }

    function DisplayVendorList() {
        if (checkIscenterTile()) {
            $Opt("#optanon-popup-body #optanon-popup-body-content").hide();
            $Opt("#optanon-popup-body #optanon-vendor-consent-text").hide();
            $Opt('#optanon-popup-body #optanon-vendor-consent-back').show();
            $Opt('#optanon-popup-body .optanon-vendor-center-tile').show();
        } else {
            $Opt("#optanon-popup-body-left #optanon-menu").hide();
            $Opt("#optanon-popup-body-right .optanon-main-info-text").hide();
            $Opt("#optanon-popup-body-right #optanon-vendor-consent-text").hide();
            $Opt('#optanon-popup-body-left #optanon-vendor-consent-back').show();
            $Opt('#optanon-popup-body-right #optanon-vendor-consent-list').show();
            $Opt('#optanon-popup-body-right .optanon-vendor-list-allow-all').show();
        }
    }

    function setVendorStatus() {
        var json = optanonData();
        var vendorCheckBoxList = $Opt(".optanon-vendor-status-editable .optanon-vendor-status");
        if (oneTrustIABConsent.vendors && vendorCheckBoxList && vendorCheckBoxList.length > 0) {
            for (var i = 0; i < vendorCheckBoxList.length; i++) {
                var isVendorActive = $Opt.inArray((vendorCheckBoxList[i].id + ':true'), oneTrustIABConsent.vendors) != -1;
                var venodrToggleLabelId = "#lblVendorToggle_" + vendorCheckBoxList[i].id;
                var venodrToggleLabel = $Opt(venodrToggleLabelId),
                    option = (isRTL ? venodrToggleLabel.parent().siblings()[0].innerText : venodrToggleLabel.innerText);
                if (isVendorActive) {
                    vendorCheckBoxList[i].checked =  true;
                    option = json.ActiveText;
                } else {
                    vendorCheckBoxList[i].checked =  false;
                    option = json.InactiveText;
                }
            }
        }
        var totalVendor = $Opt(".optanon-vendor-status-editable .optanon-vendor-status");
        var selectedVendor = $Opt(".optanon-vendor-status-editable .optanon-vendor-status:checked");
        if(totalVendor && selectedVendor){
            if(selectedVendor.length>= (totalVendor.length/2)) {
                $Opt("#chkVendorListAllowAll").prop("checked",true);
            } else {
                $Opt("#chkVendorListAllowAll").prop("checked",false);
            }
        }
    }

    function saveVendorStatus() {
        var enableVendors = [];
        var vendorCheckBoxList = $Opt(".optanon-vendor-status-editable .optanon-vendor-status:checked");
        if (vendorCheckBoxList) {
            for (var i = 0; i < vendorCheckBoxList.length; i++) {
                enableVendors.push(vendorCheckBoxList[i].id + ':true');                
            }
        }
        oneTrustIABConsent.vendors = enableVendors;
    }

    function getVenderListAllowAllToggle() {
        return '<div class="optanon-vendor-allow-all-editable">' +
            '<form>' +
            '<span class="fieldset">' +
            '<input type="checkbox" aria-checked="false" value="check" id="chkVendorListAllowAll" checked class="optanon-vendor-status" />' +
            '<label for="chkVendorListAllowAll"><span class="vendor-allow-all-text">Allow All</span></label>' +
            '</span>' +
            '</form>' +
            '</div>';
    }
    
    function getVendorText() {
        var json = optanonData();
        if ($Opt('.menu-item-about').hasClass('menu-item-selected') && (json.IsIABEnabled && json.VendorLevelOptOut)) {
            if($Opt("#optanon-vendor-consent-list").css('display') === 'none') {
                $Opt('#optanon-vendor-consent-text').show();
            } else {
                DisplayVendorList();
                $Opt('#optanon-vendor-consent-text').hide(); 
            }
        } else { $Opt('#optanon-vendor-consent-text').hide(); }
    }

    function getVendorToggle(json, vendorId) {
        var venodrToggleLabelId = "lblVendorToggle_" + vendorId;
        var span = (isRTL ? '<span class="toggleChk">' + json.ActiveText + '</span>': '')
        return '<div class="optanon-vendor-status-editable">' +
            '<form>' +
            span +
            '<span class="fieldset">' +
            '<input type="checkbox" aria-checked="false" value="check" id="' + vendorId + '" checked class="optanon-vendor-status vendor-group-status" />' +
            '<label class="vendor-status-label" for="' + vendorId + '" id="' + venodrToggleLabelId + '">' + (isRTL ? '' : json.ActiveText) + '</label>' +
            '</span>' +
            '</form>' +
            '</div>';
    }
    //BEHAVIOUR_END

    function initialiseConsentNoticeHandlers() {
        var json = optanonData();

        //adding click events to page elements
        //.optanon-close-consent: set cookie and close consent notice
        //.optanon-close-ui: only hide consent notice
        //.optanon-toggle-display: show/close consent notice (set cookie if close)
        //.optanon-allow-all: activate all groups, set cookie and close consent notice
        //.optanon-status: toggle for center tile layout
        //.optanon-banner-tile: close and go back to banner tile

        $Opt(document).on('click', '.optanon-close-consent', function () {
            Optanon.Close();
            closeOptanonAlertBox(true, true);
            return false;
        });

        $Opt(document).on('click', '.optanon-close-ui', function () {
            hideConsentNotice(constant.KEEPCENTERTILEBANNEROPEN);
            return false;
        });

        $Opt(document).on('click', '.optanon-toggle-display', function () {
            Optanon.ToggleInfoDisplay();
            return false;
        });

        $Opt(document).on('click', '.optanon-allow-all', function () {
            Optanon.AllowAll();
            closeOptanonAlertBox(true, true);
            return false;
        });

        $Opt(document).on('keydown', '#optanon', function (e) {
            if (e.keyCode == 27) {
                hideConsentNotice(constant.KEEPCENTERTILEBANNEROPEN);
            }
        });

        //BEHAVIOUR(IsIABEnabled == true)
        $Opt(document).on('click', '#optanon-vendor-consent-text', function () {
            DisplayVendorList(json);
            return false;
        });
        $Opt(document).on('change','.vendor-group-status', function(){
            if ($Opt(this).is(':checked')) {
                if(isRTL){
                    if(this.classList.contains('optanon-vendor-status')){
                        $Opt(this).parent().siblings()[0].innerText = json.ActiveText;
                    } else {
                        $Opt(this).prev('.toggleChk').text(json.ActiveText);
                    }
                } else {
                    $Opt(this).next('label').text(json.ActiveText);
                }
            } else {
                if(isRTL){
                    if(this.classList.contains('optanon-vendor-status')){
                        $Opt(this).parent().siblings()[0].innerText = json.InactiveText;
                    } else { 
                        $Opt(this).prev('.toggleChk').text(json.InactiveText);
                    }
                } else {
                    $Opt(this).next('label').text(json.InactiveText);
                }
            }
        });
        $Opt(document).on('change','.optanon-vendor-allow-all-editable #chkVendorListAllowAll', function() {
            if ($Opt(this).is(':checked')) {
                $Opt(".optanon-vendor-status-editable .optanon-vendor-status").prop('checked',true);
                $Opt(".optanon-vendor-status-editable " + (isRTL ? '.toggleChk' : '.vendor-status-label')).text(json.ActiveText);
            } else {
                $Opt(".optanon-vendor-status-editable .optanon-vendor-status:checked").prop('checked',false);
                $Opt(".optanon-vendor-status-editable " + (isRTL ? '.toggleChk' : '.vendor-status-label')).text(json.InactiveText);
            }
        });
        $Opt(document).on('click', '#optanon-vendor-consent-back', function () {
            $Opt("#optanon-popup-body-left #optanon-menu").show();
            $Opt("#optanon-popup-body-right .optanon-main-info-text").show();
            $Opt("#optanon-popup-body-right #optanon-vendor-consent-text").show();
            $Opt("#optanon-popup-body-right #optanon-popup-more-info-bar").hide();
            $Opt('#optanon-popup-body-right #optanon-vendor-consent-list').hide();
            $Opt('#optanon-popup-body-left #optanon-vendor-consent-back').hide();
            $Opt('#optanon-popup-body-right .optanon-vendor-list-allow-all').hide();

            if (checkIscenterTile()) {
                $Opt("#optanon-popup-body #optanon-popup-body-content").show();
                $Opt("#optanon-popup-body #optanon-vendor-consent-text").show();
                $Opt('#optanon-popup-body #optanon-vendor-consent-back').hide();
                $Opt('#optanon-popup-body .optanon-vendor-center-tile').hide();
            }
            return false;
        });
        //BEHAVIOUR_END
        $Opt('#optanon').on('change', ".optanon-status-checkbox", function () {
            var group = $Opt(this).data('group') || $Opt('#optanon #optanon-menu li.menu-item-selected').data('group');
            if ($Opt(this).is(':checked')) {
                toggleGroupStatusOn(json, group, this);
                //BEHAVIOUR(ShowSubgroupToggles == true)
                if (isTopLevelGroup(group)) {
                    toggleAllSubGroupStatusOn(json);
                }
                //BEHAVIOUR_END
            } else {
                toggleGroupStatusOff(json, group, this);
                //BEHAVIOUR(ShowSubgroupToggles == true)
                if (isTopLevelGroup(group)) {
                    toggleAllSubGroupStatusOff(json);
                }
                //BEHAVIOUR_END
            }

            setAllowAllButton();
        });
        //BEHAVIOUR(CenterTile == true)
        $Opt('#optanon').on('change', ".optanon-status", function () {
            var group = $Opt(this).parent('#optanon-popup-body-content').data('group');
            if ($Opt(this).is(':checked')) {
                toggleCheckBoxesForCenterTile(json, group, "1");
                if(json.IsIABEnabled){
                    setIABConsent(group, "true", true);
                }
            } else {
                toggleCheckBoxesForCenterTile(json, group, "0");
                if(json.IsIABEnabled){
                    setIABConsent(group, "false", true);
                }
            }
            setAllowAllButton();
        });

        $Opt(document).on('click', '.optanon-banner-tile', function () {
            hideConsentNotice(constant.KEEPCENTERTILEBANNEROPEN);
            return false;
        });
        //BEHAVIOUR_END
    }

    //BEHAVIOUR(ShowSubgroupToggles == true)
    function toggleAllSubGroupStatusOn(json) {
        $Opt(".optanon-status-checkbox").each(function () {
            if (!$Opt(this).is(':checked')) {
                $Opt(this).prop('checked', true);
                var subGroup = $Opt(this).data('group');
                toggleGroupStatusOn(json, subGroup, this);
            }
        });
    }

    function toggleAllSubGroupStatusOff(json) {
        $Opt(".optanon-status-checkbox").each(function () {
            if ($Opt(this).is(':checked')) {
                $Opt(this).prop('checked', false);
                var subGroup = $Opt(this).data('group');
                toggleGroupStatusOff(json, subGroup, this);
            }
        });
    }
    //BEHAVIOUR_END

    function getGroupIdForCookie(group) {
        if(group.CustomGroupId) {
            return group.CustomGroupId;
        } else if(group.OptanonGroupId == 0) {
            return '0_' + group.GroupId;
        } else {
            return group.OptanonGroupId;
        }
    }


    function toggleGroupStatusOn(json, group, checkbox) {
        var groupName = safeGroupName(group);

        //Google Analytics event tracking
        Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Preferences Toggle On', groupName);

        //updating selected menu item icon colour
        $Opt('#optanon #optanon-menu li.menu-item-selected').removeClass('menu-item-off');
        $Opt('#optanon #optanon-menu li.menu-item-selected').addClass('menu-item-on');
        //updating checkbox label colour
        $Opt(checkbox).parent().addClass('optanon-status-on');
        //updating optanonHtmlGroupData with new group status
        var index = indexOf(optanonHtmlGroupData, (getGroupIdForCookie(group) + ':0'));
        if (index != -1) {
            optanonHtmlGroupData[index] = getGroupIdForCookie(group) + ':1';
            //BEHAVIOUR(IsIABEnabled == true)
            if(json.IsIABEnabled){
                setIABConsent(group, "true", true);
            }
            //BEHAVIOUR_END

        }
        var option = (isRTL ? $Opt(checkbox).prev('.toggleChk') : $Opt(checkbox).next('label'));
        option.text(json.ActiveText);
    }

    function toggleGroupStatusOff(json, group, checkbox) {
        var groupName = safeGroupName(group);
        //Google Analytics event tracking
        Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Preferences Toggle Off', groupName);

        //updating selected menu item icon colour
        $Opt('#optanon #optanon-menu li.menu-item-selected ').removeClass('menu-item-on');
        $Opt('#optanon #optanon-menu li.menu-item-selected').addClass('menu-item-off');
        //updating checkbox label colour
        $Opt(checkbox).parent().removeClass('optanon-status-on');
        //updating optanonHtmlGroupData with new group status
        var index = indexOf(optanonHtmlGroupData, (getGroupIdForCookie(group) + ':1'));
        if (index != -1) {
            optanonHtmlGroupData[index] = getGroupIdForCookie(group) + ':0';
            //BEHAVIOUR(IsIABEnabled == true)
            if(json.IsIABEnabled) {
                setIABConsent(group, "false", true);
            }
            //BEHAVIOUR_END

        }
        var option = (isRTL ? $Opt(checkbox).prev('.toggleChk') : $Opt(checkbox).next('label'));
        if (json.InactiveText) option.text(json.InactiveText);
    }


    /**** Center Tile Start */
    function checkIscenterTile() {
        return isCenterTile;
    }

    //BEHAVIOUR(CenterTile == true)
    function insertCenterTileConsentNoticeHtml() {
        var group,
            json = optanonData(),
            groupIsAboutCookies,
            groupIsActive,
            groupMenuItem,
            moreGroupInfo,
            i;

        jsonAddAboutCookies(json);

        $Opt('body').prepend('<div id="optanon" class="modern"></div>');
        var preferenceCenterDataHTML = '<div id="optanon-popup-bg"></div>' +
            '<div id="optanon-popup-wrapper" role="dialog" aria-modal="true" tabindex="-1">' +
            '<div id="optanon-popup-top">';

            if (json.ShowPreferenceCenterCloseButton) {
                if(!json.CloseText) {
                    json.CloseText = "Close";
                }
                preferenceCenterDataHTML = preferenceCenterDataHTML + '<button onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Close Button\');" '+
                'aria-label="'+ json.CloseText +'" class="center-tile-preference-close-button optanon-close-link optanon-close optanon-close-ui" title="'+ json.CloseText +'">'+
                '<div id="optanon-close" style="background: url('+updateCorrectUrl('[[OptanonStaticContentLocation]]/images/optanon-pop-up-close.png')+');width:34px;height:34px;">'+
                '</div></button>';
            }

            preferenceCenterDataHTML = preferenceCenterDataHTML + '<p role="heading" aria-level="1" class="center-tile-preference-center-title h1" aria-label="' + json.MainText + '">' + json.MainText + '</p>' +
            '</div>' +
            '<div id="optanon-popup-body">' +
            (json.IsIABEnabled && json.VendorLevelOptOut ? '<div tabindex="1" id="optanon-vendor-consent-text">'+
            '<button class="vendor-consent-link" aria-label="View Vendor Consent">View Vendor Consent</button></div>' : '') +
            '</div></div>';

            $Opt('#optanon').html(preferenceCenterDataHTML);

        if (json.Language && json.Language.Culture) {
            $Opt("#optanon-popup-wrapper").attr("lang", json.Language.Culture);
        }

        var preferenceTabIndex = 1;
        for (i = 0; i < json.Groups.length; i += 1) {
            group = json.Groups[i];
            var groupName = safeGroupName(group);
            if (groupName == optanonAboutCookiesGroupName || (isTopLevelGroup(group) && isValidConsentNoticeGroup(group))) {
                groupIsAboutCookies = groupName == optanonAboutCookiesGroupName;
                groupIsActive = $Opt.inArray((getGroupIdForCookie(group) + ':1'), optanonHtmlGroupData) != -1;
                var checkBoxHTML = "";
                if (groupName == optanonAboutCookiesGroupName) {
                    checkBoxHTML = "";
                } else {
                    ++preferenceTabIndex;
                    checkBoxHTML = getCheckBox(preferenceTabIndex, groupName, group.GroupId);
                }
                groupMenuItem = $Opt('<div id="optanon-popup-body-content" class="menu-item-necessary ' + 
                    (groupIsAboutCookies || groupIsActive ? 'menu-item-on' : 'menu-item-off') +
                    '" title="' + groupName + '">' +
                    checkBoxHTML +
                    '<h2 class="center-tile-preference-group-name">' + groupName + '</h2>' +
                    '<div class="optanon-main-info-text">' + safeFormattedGroupDescription(group) + '</div></div>');

                setGroupChkBoxStatus(group, groupMenuItem, groupIsActive, group.GroupId);
                groupMenuItem.data('group', group);
                groupMenuItem.data('optanonGroupId', getGroupIdForCookie(group));
                $Opt('#optanon #optanon-popup-body').append(groupMenuItem);
            }
        }

        moreGroupInfo = '<div class="center-tile-more-info-text">' +
            '<h3> <a class="center-tile-more-info-link" aria-label="More Information" target="_blank" tabindex="'+ ++preferenceTabIndex +'" '+
            'href="' + json.AboutLink + '" onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Cookie Policy\');">' + 
            json.AboutText + '</a></h3></div>';
        // $Opt('#optanon #optanon-popup-body').append(moreGroupInfo);

        $Opt('#optanon #optanon-popup-wrapper').append('<div id="optanon-popup-bottom">' +
            '<div class="optanon-bottom-spacer"></div>' +
            moreGroupInfo +
            '<div class="optanon-button-wrapper optanon-button-wrapper-content">' +
            '<div class="optanon-button-wrapper optanon-save-settings-button optanon-close optanon-close-consent">'+
            '<div class="optanon-white-button-left"></div><div class="optanon-white-button-middle">'+
            '<button tabindex="'+ ++preferenceTabIndex +'" title="'+ json.AllowAllText +'" onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Save Settings\');">' + 
            json.AllowAllText + '</button></div><div class="optanon-white-button-right"></div></div>' +
            '<div class="optanon-button-wrapper optanon-allow-all-button optanon-allow-all"><div class="optanon-white-button-left"></div>'+
            '<div class="optanon-white-button-middle">'+
            '<button tabindex="'+ ++preferenceTabIndex +'" title="'+ json.ConfirmText +'" onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Preferences Allow All\');">' + 
            json.ConfirmText + '</button></div><div class="optanon-white-button-right"></div></div>' +
            '</div>' +
            '<div id="optanon-popup-bottom-content">' + json.FooterDescriptionText + '</div>' +
            '</div>');

        // updating tabindex of the modal close button
        $Opt('.center-tile-preference-close-button').attr('tabindex', ++preferenceTabIndex);
        setAllowAllButton();
    }

    function getCheckBox(tabindex, groupName, toggleId) {
        return '<input tabindex="'+ tabindex +'" type="checkbox" value="check" aria-label="'+ groupName +'" '+
        'id="' + toggleId + '" checked class="optanon-status" />'
    }

    function setGroupChkBoxStatus(group, groupMenuItem, groupStatus, elementId) {
        var chkBox = groupMenuItem.find("#"+elementId);
        var groupDefaultStatus = safeGroupDefaultStatus(group).toLowerCase();
        if (groupDefaultStatus == 'always active' ||
            safeGroupDefaultStatus(group.Parent).toLowerCase() == 'always active') {
            chkBox.prop('checked', true);
            chkBox.prop('disabled', true);
        } else {
            chkBox.prop('checked', groupStatus);
        }
    }

    // Toggle function for center tile
    function toggleCheckBoxesForCenterTile(json, group, newStatus) {
        var groupName = safeGroupName(group);
        //Google Analytics event tracking
        var activeStatus;
        if (newStatus === "1") {
            activeStatus = "0";
            Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Preferences Toggle On', groupName);
        } else {
            activeStatus = "1";
            Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Preferences Toggle Off', groupName);
        }
        //updating optanonHtmlGroupData with new group status
        var index = indexOf(optanonHtmlGroupData, (getGroupIdForCookie(group) + ':' + activeStatus));
        if (index != -1) {
            optanonHtmlGroupData[index] = getGroupIdForCookie(group) + ':' + newStatus;
        }
    }

    function insertCenterTileAlertHTML() {
        var json = optanonData();
        var bannerHtml = '<div id="center-tile-banner-popup" role="alertdialog"  aria-labelledby="alert-box-title" aria-describedby="alert-box-message" '+
            'class="optanon-alert-box-wrapper [[OptanonHideAcceptButton]] [[OptanonHideCookieSettingButton]]" style="display:none">' +
            '<div class="optanon-alert-box-bottom-top">';

        if (json.showBannerCloseButton) {
            if (!json.BannerCloseButtonText) {
                json.BannerCloseButtonText = "Close";
            }
            bannerHtml = bannerHtml + '<div class="optanon-alert-box-corner-close">' +
                '<button class="optanon-alert-box-close banner-close-button" aria-label="' + json.BannerCloseButtonText + '" title="'+ json.BannerCloseButtonText +'" ' +
                'onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Close Button\');"></a></div>';
        }

        bannerHtml = bannerHtml + '</div>' +
            '<div class="optanon-alert-box-bg">' +
            '<div class="optanon-alert-box-logo"></div>' +
            '<div class="optanon-alert-box-body">';

        if (json.BannerTitle) {
            bannerHtml = bannerHtml + '<div class="optanon-alert-box-title">' + '<p role="heading" aria-level="1" class="center-tile-banner-title optanon-banner-title h1" id="alert-box-title">' + 
            json.BannerTitle + '</p>' + '</div>';
        }

        bannerHtml = bannerHtml + '<div class="optanon-alert-box-notice banner-content" id="alert-box-message">' + json.AlertNoticeText + '</div>' +
            '<div class="optanon-alert-box-button-container">';
        // Accept all cookies button
        if (bannerHtml.indexOf("hide-accept-button") <= 0) {
            bannerHtml = bannerHtml + '<div class="optanon-alert-box-accept-button">'+
                '<div class="optanon-alert-box-yes-i-accept accept-cookie-container">' +
                '<button class="optanon-allow-all accept-cookies-button" title="'+ json.AlertAllowCookiesText +'" aria-label="' + json.AlertAllowCookiesText + '" ' +
                'onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Accept Cookies\');">' +
                json.AlertAllowCookiesText + '</button>'+
                '</div></div>';
        }
        // Cookie setting button
        if (bannerHtml.indexOf("hide-cookie-setting-button") <= 0) {
            bannerHtml = bannerHtml + '<div class="optanon-alert-box-more-info-button">' +
                '<button class="optanon-toggle-display cookie-settings-button" title="'+ json.AlertMoreInfoText +'" aria-label="' + json.AlertMoreInfoText + '" ' +
                'onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Open Preferences\');">' +
                json.AlertMoreInfoText + '</button></div>';
        }
        bannerHtml = bannerHtml + '</div>' +
            '<div class="optanon-alert-box-bottom">' +
            '<div class="optanon-alert-box-bottom-spacer">' + '</div>' +
            '<div class="optanon-alert-box-footer">' + json.FooterDescriptionText + '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        $Opt('#optanon').before(bannerHtml);
        setBannerTabIndex();
    }

    function setBannerPositionForCenterTile() {

        $Opt('.optanon-alert-box-wrapper').show().animate({ 'bottom': '0px' }, 1000);
        return;


        $Opt('.optanon-alert-box-wrapper').show().animate({ 'top': '50%' }, 1000);
        return;

    }

    /**** Center Tile End */
    //BEHAVIOUR_END

    function insertShowSettingsButtonsHtml() {
        $Opt('.optanon-show-settings').wrap('<div class="optanon-show-settings-popup-wrapper">').wrap('<div class="optanon-show-settings-button">').wrap('<div class="optanon-show-settings-middle">');
        $Opt('.optanon-show-settings-middle').before('<div class="optanon-show-settings-left"></div>');
        $Opt('.optanon-show-settings-middle').after('<div class="optanon-show-settings-right"></div>');
        $Opt('.optanon-show-settings-button').addClass('optanon-toggle-display');
    }

    function initialiseShowSettingsButtonsHandlers() {
        $Opt('.optanon-show-settings-button').click(
            function () {
                Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Privacy Settings Click');
            }
        );
    }

    //BEHAVIOUR(ShowAlert == true)
    function insertAlertHtml() {
        var json = optanonData();
        var bannerHtml = '<div class="optanon-alert-box-wrapper [[OptanonHideAcceptButton]] [[OptanonHideCookieSettingButton]]" role="alertdialog" '+
            'aria-labelledby="alert-box-title" aria-describedby="alert-box-message" style="display:none">' +
            '<div class="optanon-alert-box-bottom-top">';
        if (json.showBannerCloseButton) {
            if (!json.BannerCloseButtonText) {
                json.BannerCloseButtonText = "Close";
            }
            bannerHtml = bannerHtml + '<div class="optanon-alert-box-corner-close">' +
                '<button class="optanon-alert-box-close banner-close-button" aria-label="' + json.BannerCloseButtonText + '" title="'+ json.BannerCloseButtonText +'" ' +
                'onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Close Button\');"></button></div>';
        }
        bannerHtml = bannerHtml + '</div>' +
            '<div class="optanon-alert-box-bg">' +
            '<div class="optanon-alert-box-logo"> </div>' +
            '<div class="optanon-alert-box-body">';

        bannerHtml = bannerHtml + '<p class="optanon-alert-box-title legacy-banner-title' + (json.BannerTitle ? '': ' sr-only') + '" id="alert-box-title" role="heading" aria-level="2">' + (json.BannerTitle ? json.BannerTitle : 'Cookie Notice') + '</p>';

        bannerHtml = bannerHtml + '<p class="banner-content" id="alert-box-message">' + json.AlertNoticeText + '</p>' +
            '</div><div class="optanon-clearfix"></div>' +
            '<div class="optanon-alert-box-button-container">' +
            '<div class="optanon-alert-box-button optanon-button-close"><div class="optanon-alert-box-button-middle">' +
            '<button class="optanon-alert-box-close" aria-label="' + json.AlertCloseText + '">' + json.AlertCloseText + '</button></div></div>';
        // Accept all cookies button
        if (bannerHtml.indexOf("hide-accept-button") <= 0) {
            bannerHtml = bannerHtml + '<div class="optanon-alert-box-button optanon-button-allow"><div class="optanon-alert-box-button-middle accept-cookie-container">' +
                '<button class="optanon-allow-all accept-cookies-button" title="'+ json.AlertAllowCookiesText +'" aria-label="' + json.AlertAllowCookiesText + '" ' +
                'onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Accept Cookies\');">' +
                json.AlertAllowCookiesText + '</button></div></div>';
        }
        // Cookie setting button
        if (bannerHtml.indexOf("hide-cookie-setting-button") <= 0) {
            bannerHtml = bannerHtml + '<div class="optanon-alert-box-button optanon-button-more"><div class="optanon-alert-box-button-middle">' +
                '<button class="optanon-toggle-display cookie-settings-button" title="'+ json.AlertMoreInfoText +'" aria-label="' + json.AlertMoreInfoText + '" ' +
                'onClick="Optanon.TriggerGoogleAnalyticsEvent(\'OneTrust Cookie Consent\', \'Banner Open Preferences\');">' +
                json.AlertMoreInfoText + '</button></div></div>';
        }
        bannerHtml = bannerHtml + '</div><div class="optanon-clearfix optanon-alert-box-bottom-padding"></div></div></div>';
        $Opt('#optanon').before(bannerHtml);
        setBannerTabIndex();
    }

    function setBannerPosition(){
        //BEHAVIOUR(AlertLayout == 'bottom')
        $Opt('.optanon-alert-box-wrapper').show().animate({ 'bottom': '0px' }, 1000);
        return;
        //BEHAVIOUR_END

        //BEHAVIOUR(BannerPushesDown == true)
        if(checkBrowserSupportPushPageDown()) {
            pushPageDown();
            $Opt(window).resize(function () {
                if ($Opt(".optanon-alert-box-wrapper").is(":visible")) {
                    pushPageDown();
                }
            });
            return;
        }
        //BEHAVIOUR_END

        $Opt('.optanon-alert-box-wrapper').show().animate({ 'top': '0px' }, 1000);
        return;
    }

    //BEHAVIOUR(BannerPushesDown == true)
    function pushPageDown(){
        var bannerHeightPx = $Opt(".optanon-alert-box-wrapper").height() + "px";
        var bannerTransform = "translateY(" + bannerHeightPx + ")";
        $Opt(".optanon-alert-box-wrapper").stop().show().css("top", "-"+ bannerHeightPx);
        $Opt(".optanon-alert-box-wrapper").css("-ms-transform", bannerTransform);
        $Opt("body").css("-ms-transform", bannerTransform);
        $Opt("body").css("transform", bannerTransform);
    }

    function pushPageUp(){
        $Opt("body").css("-ms-transform", "translateY(0px)")
        $Opt("body").css("transform", "translateY(0px)")
    }
    //BEHAVIOUR_END


    function closeBannerHandler(closeOnLoad) {
        var json = optanonData();
        $Opt('.optanon-alert-box-wrapper').fadeOut(200);
        $Opt("#optanon-popup-bg").hide();
        if (json.CloseShouldAcceptAllCookies == true) {
            Optanon.AllowAll();
        }
        if(json.ConsentModel && json.ConsentModel.Name.toLowerCase() === constant.IMPLIEDCONSENT) {
            if(closeOnLoad) {
               Optanon.Close(true) 
            } else {
                Optanon.Close(false)
            }
        }
        Optanon.SetAlertBoxClosed(true);
        return false;
    }

    function initialiseAlertHandlers() {
        if (!Optanon.IsAlertBoxClosedAndValid()) {
            var json = optanonData();

            if (checkIscenterTile()) {
                setBannerPositionForCenterTile();
            } else {
                setBannerPosition();
            }

            if (json.ForceConsent) {
                if(!isCookiePolicyPage(json.AlertNoticeText)) {
                    $Opt("#optanon-popup-bg").css({ 'z-index': '7000' }).show();
                }
            }

            //Click handler for close buttons
            $Opt('.optanon-alert-box-close').click(function () {
                closeBannerHandler();
            });

            if(document.querySelector('.optanon-alert-box-corner-close')) {
                document.querySelector('.optanon-alert-box-corner-close').addEventListener('click',function () {
                    closeBannerHandler();
                });
            }

            //BEHAVIOUR(ScrollingAcceptsCookies == true)
            if (!optanonIsOptInMode || optanonIsSoftOptInMode) {
                $Opt(window).scroll(function () {
                    var overflowHeight = $Opt(document).height() - $Opt(window).height();
                    if (overflowHeight === 0) {
                        // when doctype is not specified, document height equals window height
                        overflowHeight = $Opt(window).height();
                    }

                    var scrollPercent = 100 * $Opt(window).scrollTop() / overflowHeight;
                    if (scrollPercent > 25 && !Optanon.IsAlertBoxClosedAndValid()) {
                        Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Banner Auto Close');
                        Optanon.Close();
                        $Opt('.optanon-alert-box-wrapper').fadeOut(400);
                        Optanon.SetAlertBoxClosed(true);
                    }
                });
            }
            //BEHAVIOUR_END

            // On Click Accepts All
            if (json.OnClickAcceptAllCookies && !isCenterTile) {
                var body = document.querySelector('body').children;

                for(var i = 0; i < body.length; i++){
                    // Listen for clicks anywhere on the DOM execept Cookie banner && Optanon Id
                    if(!body[i].classList.contains('optanon-alert-box-wrapper') && body[i].id !== 'optanon'){
                        body[i].addEventListener('click', clickAcceptsAllEvent);
                    } 
                }

                document.querySelector('.optanon-alert-box-close').addEventListener('click', bannerClosed);
                document.querySelector('.optanon-allow-all-button').addEventListener('click', bannerClosed);
                document.querySelector('.optanon-save-settings-button').addEventListener('click', bannerClosed);
                document.querySelector('.optanon-button-allow').addEventListener('click', bannerClosed);

            } // On Click Accepts All END

            // On Scroll Accepts All
            if (json.ScrollAcceptsAllCookiesAndClosesBanner && !isCenterTile) {
                window.addEventListener('scroll', scrollAcceptsAllEvent);

                 document.querySelector('.optanon-alert-box-close').addEventListener('click', rmScrollEventListener);
                 document.querySelector('.optanon-allow-all-button').addEventListener('click', rmScrollEventListener);
                 document.querySelector('.optanon-save-settings-button').addEventListener('click', rmScrollEventListener);
                 document.querySelector('.optanon-button-allow').addEventListener('click', rmScrollEventListener);
            } // On Scroll Accepts All END
        }
    }
    //BEHAVIOUR_END

    function clickAcceptsAllEvent(e){
        var body = document.querySelector('body').children;
        Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Banner Auto Close');
        Optanon.AllowAll();
        OTfadeOut('.optanon-alert-box-wrapper', 40);
        Optanon.SetAlertBoxClosed(true);
        for(var y = 0; y < body.length; y++){
            rmClickEventListener(body[y]);
        }
        e.stopPropagation();
    }

    function scrollAcceptsAllEvent() {
        var scroll = this.scrollY;

        var alertBox = document.getElementById('optanon-popup-wrapper');
        var alertBoxOpen = !!(alertBox.offsetWidth && alertBox.offsetHeight);

        if (scroll > 200 && !alertBoxOpen) {
            Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Banner Auto Close');
            Optanon.AllowAll();
            OTfadeOut('.optanon-alert-box-wrapper', 40);
            Optanon.SetAlertBoxClosed(true);
            rmScrollEventListener();
        }
    }

    function rmScrollEventListener() {
        window.removeEventListener('scroll', scrollAcceptsAllEvent);
    }

    // User Closed Banner, Click Accepts All
    function bannerClosed(){
        var body = document.querySelector('body').children;
        for(var y = 0; y < body.length; y++){
            rmClickEventListener(body[y]);
        }
        rmScrollEventListener();
    }

    // Remove Event Listener
    function rmClickEventListener(el){
        el.removeEventListener('click', clickAcceptsAllEvent);
    }

    function insertCookiePolicyHtml() {
        var group,
            cookie,
            i,
            j,
            k,
            l,
            subGroupCookie,
            json = optanonData(),
            groupHtml,
            subGroups,
            subgroupTableHtml,
            subgroupHtml;

        for (i = 0; i < json.Groups.length; i += 1) {
            group = json.Groups[i];
            if (isTopLevelGroup(group) && isValidConsentNoticeGroup(group)) {
                //Insert group html
                groupHtml = $Opt('<div class="optanon-cookie-policy-group"></div>');
                groupHtml.append('<h2 class="optanon-cookie-policy-group-name">' + safeGroupName(group) + '</h2>');
                groupHtml.append('<p class="optanon-cookie-policy-group-description">' + safeFormattedGroupDescription(group) + '</p>');

                if (group.Cookies.length > 0) {
                    //Insert group cookies html
                    groupHtml.append('<p class="optanon-cookie-policy-cookies-used">' + json.CookiesUsedText + '</p>');
                    groupHtml.append('<ul class="optanon-cookie-policy-group-cookies-list"></ul>');

                    for (k = 0; k < group.Cookies.length; k += 1) {
                        cookie = group.Cookies[k];
                        var cookiepediaLabel = getCookieLabel(cookie);
                        groupHtml.find('.optanon-cookie-policy-group-cookies-list').append('<li>' + ((isRTL) ? '<div class="keep-ltr">' : '<div>') + cookiepediaLabel + '</div></li>');
                    }
                }

                subGroups = getGroupSubGroups(group);
                if (subGroups.length > 0) {
                    if (!json.CookiesText) {
                        json.CookiesText = "Cookies";
                    }
                    if (!json.CategoriesText) {
                        json.CategoriesText = "Categories";
                    }
                    if (!json.LifespanText) {
                        json.LifespanText = "Lifespan";
                    }
                    if(!json.LifespanTypeText) {
                        json.LifespanTypeText = "Session";
                    }
                    if(!json.LifespanDurationText) {
                        json.LifespanDurationText = "days";
                    }

                    //Insert sub group html
                    subgroupTableHtml = $Opt('<table class="optanon-cookie-policy-subgroup-table"></table>');
                    subgroupTableHtml.append('<tr></tr>');

                    var lifespanHtml = '';
                    if (json.IsLifespanEnabled) {
                        lifespanHtml = '&nbsp;(' + json.LifespanText + ')';
                    }
                    subgroupTableHtml.find('tr').append(
                        '<th class="optanon-cookie-policy-left"><p class="optanon-cookie-policy-subgroup-table-column-header">'
                        + json.CategoriesText + '</p></th>'
                    );

                    subgroupTableHtml.find('tr').append(
                        '<th class="optanon-cookie-policy-right"><p class="optanon-cookie-policy-subgroup-table-column-header">'
                        + json.CookiesText + lifespanHtml +
                        '</p></th>');                   


                    for (j = 0; j < subGroups.length; j += 1) {
                        subgroupHtml = $Opt('<tr class="optanon-cookie-policy-subgroup"></tr>');
                        subgroupHtml.append('<td class="optanon-cookie-policy-left"></td>');

                        var groupLabel = getSubGroupLabel(subGroups[j]);
                        subgroupHtml.find('.optanon-cookie-policy-left').append('<p class="optanon-cookie-policy-subgroup-name">' + groupLabel + '</p>');
                        subgroupHtml.find('.optanon-cookie-policy-left').append('<p class="optanon-cookie-policy-subgroup-description">' + safeFormattedGroupDescription(subGroups[j]) + '</p>');

                        subgroupHtml.append('<td class="optanon-cookie-policy-right"></td>');
                        subgroupHtml.find('.optanon-cookie-policy-right').append('<ul class="optanon-cookie-policy-subgroup-cookies-list"></ul>');

                        if (json.IsLifespanEnabled) {
                            for (l = 0; l < subGroups[j].Cookies.length; l += 1) {
                                subGroupCookie = subGroups[j].Cookies[l];
                                var lifespan = '';
                                if (subGroupCookie.IsSession) {
                                    lifespan = json.LifespanTypeText;
                                } else if (subGroupCookie.Length === 0) {
                                    lifespan = '< 1 '+ json.LifespanDurationText;
                                } else {
                                    lifespan = subGroupCookie.Length + ' '+json.LifespanDurationText;
                                }
                                //Insert sub group cookies html
                                subgroupHtml.find('.optanon-cookie-policy-subgroup-cookies-list').append(
                                    ((isRTL) ? '<li class="keep-ltr">' : '<li>') + subGroupCookie.Name + '&nbsp;(' + lifespan + ')</li>'
                                );
                            }
                        } else {
                            for (l = 0; l < subGroups[j].Cookies.length; l += 1) {
                                subGroupCookie = subGroups[j].Cookies[l];
                                //Insert sub group cookies html
                                subgroupHtml.find('.optanon-cookie-policy-subgroup-cookies-list').append(
                                    ((isRTL) ? '<li class="keep-ltr">' : '<li>') + subGroupCookie.Name + '</li>'
                                );
                            }
                        }

                        subgroupTableHtml.append(subgroupHtml);
                    }

                    groupHtml.append(subgroupTableHtml);
                }

                $Opt('#optanon-cookie-policy').append(groupHtml);

                //Setting subgroup columns to be same height for vertical border to extend all the way down
                setCookiePolicyHtmlSubGroupHeights();
            }
        }

        //Resetting cookie policy subgroup columns to be the same height on window resize
        $Opt(window).resize(function () {
            setCookiePolicyHtmlSubGroupHeights();
        });
    }

    function getGroupCookiesHtml(group) {
        var json = optanonData(),
            groupHtml = $Opt('<div class="optanon-cookie-list"></div>'),
            j,
            k,
            l,
            subGroups = getGroupSubGroups(group),
            cookie,
            subGroupCookie,
            $group,
            $subgroup;

        if ((group.Cookies && group.Cookies.length > 0) || (subGroups && subGroups.length > 0)) {
            groupHtml.append('<h4 class="optanon-cookies-used">' + json.CookiesUsedText + '</h4>');
        }

        if (group.Cookies && group.Cookies.length > 0) {
            //Insert group cookies html
            $group = $Opt('<p class="optanon-group-cookies-list"></p>');

            for (k = 0; k < group.Cookies.length; k += 1) {
                cookie = group.Cookies[k];
                var cookiepediaLabel = getCookieLabel(cookie);
                $group.append(cookiepediaLabel + (k < (group.Cookies.length - 1) ? ', ' : ''));
            }

            groupHtml.append($group);
        }

        if (subGroups && subGroups.length > 0) {
            for (j = 0; j < subGroups.length; j += 1) {
                $subgroup = $Opt('<p class="optanon-subgroup-cookies-list ' + (!optanonShowSubGroupCookies ? 'subgroup-cookies-list' : '') + '"></p>');

                var groupLabel = getSubGroupLabel(subGroups[j]);
                var description = safeFormattedGroupDescription(subGroups[j]);
                var headerSeparator = optanonShowSubGroupCookies || (optanonShowSubGroupDescription && description) ? ":" : "";
                $subgroup.append('<span class="optanon-subgroup-header">' + groupLabel + headerSeparator + ' </span>');
                //BEHAVIOUR(ShowSubgroupToggles == true)
                if (safeGroupDefaultStatus(subGroups[j].Parent).toLowerCase() != 'always active') {
                    var subgroupToggle = getSubgroupToggle(json, subGroups[j]);
                    $subgroup.append(subgroupToggle);
                }
                //BEHAVIOUR_END
                var $subgroupCookies = $Opt('<div class="optanon-subgroup-cookies"></div>');
                if (optanonShowSubGroupCookies) {
                    for (l = 0; l < subGroups[j].Cookies.length; l += 1) {
                        subGroupCookie = subGroups[j].Cookies[l];
                        $subgroupCookies.append(subGroupCookie.Name + (l < (subGroups[j].Cookies.length - 1) ? ', ' : ''));
                    }
                }

                $subgroup.append($subgroupCookies);

                if (optanonShowSubGroupDescription && description) {
                    $subgroup.append('<div class="optanon-subgroup-description">' + description + '</div>');
                }

                groupHtml.append($subgroup);
            }
        }

        return groupHtml;
    }

    function safeFormattedGroupDescription(group) {
        if (!group || !group.GroupLanguagePropertiesSets || !group.GroupLanguagePropertiesSets[0] ||
            !group.GroupLanguagePropertiesSets[0].GroupDescription || !group.GroupLanguagePropertiesSets[0].GroupDescription.Text) {
            return "";
        }
        return group.GroupLanguagePropertiesSets[0].GroupDescription.Text.replace(/\r\n/g, '<br>');
    }

    function safeGroupName(group) {
        var hasName = group && group.GroupLanguagePropertiesSets &&
            group.GroupLanguagePropertiesSets[0] && group.GroupLanguagePropertiesSets[0].GroupName;
        if (!hasName) {
            return "";
        }
        return group.GroupLanguagePropertiesSets[0].GroupName.Text;
    }

    function safeGroupDefaultStatus(group) {
        var json = optanonData();
        var hasDefaultStatus = group && group.GroupLanguagePropertiesSets &&
            group.GroupLanguagePropertiesSets[0] && group.GroupLanguagePropertiesSets[0].DefaultStatus;
        if (!hasDefaultStatus) {
            return "";
        }
        if (optanonDoNotTrackEnabled && json.IsDntEnabled && group.GroupLanguagePropertiesSets[0].IsDntEnabled) {
            return doNotTrackText;
        }
        return group.GroupLanguagePropertiesSets[0].DefaultStatus.Text;
    }

    function getSubGroupLabel(group) {
        if (!group) return "";
        var groupLabel = safeGroupName(group);

        //BEHAVIOUR(AddLinksToCookiepedia == true)
        var cookie = group.Cookies[0];
        if (!cookie) return groupLabel;

        // third party cookie linked by host of the first cookie
        groupLabel = '<a href="http://cookiepedia.co.uk/host/' + cookie.Host + '" target="_blank" style="text-decoration: underline;">' + groupLabel + '</a>';

        //BEHAVIOUR_END
        return groupLabel;
    }

    function getCookieLabel(cookie) {
        if (!cookie) return "";

        var cookieLabel = cookie.Name;
        //BEHAVIOUR(AddLinksToCookiepedia == true)
        // first party cookie linked by name
        cookieLabel = '<a href="http://cookiepedia.co.uk/cookies/' + cookie.Name + '" target="_blank" style="text-decoration: underline;">' + cookie.Name + '</a>';
        //BEHAVIOUR_END
        return cookieLabel;
    }

    //Setting cookie policy subgroup columns to be the same height
    function setCookiePolicyHtmlSubGroupHeights() {
        $Opt('#optanon-cookie-policy .optanon-cookie-policy-subgroup').each(function () {
            $Opt(this).find('.optanon-cookie-policy-left').height('auto');
            $Opt(this).find('.optanon-cookie-policy-right').height('auto');
            if ($Opt(this).find('.optanon-cookie-policy-left').height() >= $Opt(this).find('.optanon-cookie-policy-right').height()) {
                $Opt(this).find('.optanon-cookie-policy-right').height($Opt(this).find('.optanon-cookie-policy-left').height());
            } else {
                $Opt(this).find('.optanon-cookie-policy-left').height($Opt(this).find('.optanon-cookie-policy-right').height());
            }
        });
    }

    function showConsentNotice() {
        if (checkIscenterTile()) { 
            // hiding banner modal
            $Opt('.optanon-alert-box-wrapper').hide();
        }
        $Opt("#optanon #optanon-menu li").removeClass('menu-item-selected');
        $Opt("#optanon #optanon-menu li").each(function () {
            if ($Opt(this).text() == optanonAboutCookiesGroupName) {
                $Opt(this).click();
            }
        });

        setAllowAllButton();

        // Center consent notice on screen
        var $notice = $Opt('#optanon-popup-wrapper'),
            width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        $notice.css("margin-top", "10px");

        if (width < 720) {
            $notice.css("top", "10px");
        } else if ($notice.outerHeight() > height) {
            $notice.css("top", Math.max(0, ((height - $notice.outerHeight()) / 2) + $Opt(window).scrollTop()) + "px");
        } else {
            $notice.css("top", Math.max(0, ((height - $notice.outerHeight()) / 2)) + "px");
        }

        // Select pop up elements and attach animation class
        var bg = document.querySelector('#optanon #optanon-popup-bg');
        var wrapper = document.querySelector('#optanon #optanon-popup-wrapper');
        bg.classList.add('fade-in');
        wrapper.classList.add('fade-in');

        // Toggle element display attribute to replace jQuery.hide()
        bg.style.display = 'block';
        wrapper.style.display = 'block';

        $notice.focus();
    }

    function hideConsentNotice(caller) {
        if (checkIscenterTile()) {
            // showing banner modal
            $Opt('.optanon-alert-box-wrapper').show();
            if (caller === constant.KEEPCENTERTILEBANNEROPEN) {
                $Opt('#optanon #optanon-popup-wrapper').fadeOut(400);
            } else {
                $Opt('#optanon #optanon-popup-bg, #optanon #optanon-popup-wrapper').fadeOut(400);
            }
        } else {
            $Opt('#optanon #optanon-popup-bg, #optanon #optanon-popup-wrapper').fadeOut(400);
        }
    }

    function checkIsActiveByDefault(group) {
        if (!safeGroupDefaultStatus(group)){
            return true;
        } else {
            var groupStatus = safeGroupDefaultStatus(group).toLowerCase();
            if(group.Parent) {
                groupStatus = safeGroupDefaultStatus(group.Parent).toLowerCase();
            }
            return groupStatus == 'always active' || groupStatus == 'active' || (groupStatus == doNotTrackText && !optanonDoNotTrackEnabled);
        }
    }

    function ensureHtmlGroupDataInitialised() {
        var group,
            json = optanonData(),
            i;

        if (!readCookieParam(optanonCookieName, 'groups')) {
            //Populate optanonHtmlGroupData from json
            optanonHtmlGroupData = [];
            optanonHtmlGroupDataTemp = [];
            for (i = 0; i < json.Groups.length; i += 1) {
                group = json.Groups[i];
                if (isValidConsentNoticeGroup(group)) {
                    //Group should show in popup
                    if (checkIsActiveByDefault(group) || json.ConsentModel && json.ConsentModel.Name.toLowerCase() === constant.IMPLIEDCONSENT) {
                        //Group is active
                        optanonHtmlGroupData.push(getGroupIdForCookie(group) + ':1');
                        //BEHAVIOUR(IsIABEnabled == true)
                        if (json.IsIABEnabled && checkIsActiveByDefault(group)) {
                            setIABConsent(group, "true");
                        } else {
                            setIABConsent(group, "false");
                        }
                        //BEHAVIOUR_END


                    } else {
                        //Group is inactive
                        optanonHtmlGroupData.push(getGroupIdForCookie(group) + ':0');
                        //BEHAVIOUR(IsIABEnabled == true)
                        if(json.IsIABEnabled) {
                            setIABConsent(group, "false");
                        }
                        //BEHAVIOUR_END

                    }

                    if (checkIsActiveByDefault(group)) {
                        //Group is active
                        optanonHtmlGroupDataTemp.push(getGroupIdForCookie(group) + ':1');

                    } else {
                        //Group is inactive
                        optanonHtmlGroupDataTemp.push(getGroupIdForCookie(group) + ':0');
                    }
                }
            }
            optanonEnsureCookieDataCompatibilityComplete = true;

        } else {
            firstTimebannerLoad = false;
            //Populate optanonHtmlGroupData from cookie
            ensureCookieDataCompatibility();
            synchroniseCookieGroupData();
            optanonHtmlGroupData = deserialiseStringToArray(readCookieParam(optanonCookieName, 'groups'));
            optanonHtmlGroupDataTemp = deserialiseStringToArray(readCookieParam(optanonCookieName, 'groups'));
            //BEHAVIOUR(IsIABEnabled == true)
            if (optanonHtmlGroupData && json.IsIABEnabled) {
                assignIABConsentFromHtmlGroupData(optanonHtmlGroupData, true);
            }
            //BEHAVIOUR_END
        }
        //BEHAVIOUR(IsIABEnabled == true)
        initializeIABData();
        //BEHAVIOUR_END
    }

    //BEHAVIOUR(IsConsentIntegration == true)
    function ensureConsentId() {
        var consentId =  readCookieParam(optanonCookieName, onetrustConsentParamName);
        if (!consentId) {
            consentId = generateUUID();
            writeCookieParam(optanonCookieName, onetrustConsentParamName, consentId);
        }
        return consentId;
    }

    function createConsentTransaction() {
        var consentId = ensureConsentId();
        var json = populateConsentData();
        var domainData = optanonData();
        if(json && json.consentApi) {
            json.consentPayload.identifier = consentId;
            json.consentPayload.customPayload = {
                "activeGroup": serialiseArrayToString(optanonHtmlGroupData),
                "Date": new Date(),
                "language": domainData.Language.Culture
            };
            
            if(json.consentPayload.purposes[0].id){
                json.consentPayload.purposes[0].Id = json.consentPayload.purposes[0].id;
                delete json.consentPayload.purposes[0].id;
            }

            OTajax({
                url: json.consentApi,
                type: 'post',
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {

                },
                error: function(error) {
                    console.log('ERROR', error);
                },
                data: JSON.stringify(json.consentPayload)
            });
        }
       
    }
    //BEHAVIOUR_END


    function getGroupById(groupId) {
        var json = optanonData(), i;

        for (i = 0; i < json.Groups.length; i += 1) {
            if (getGroupIdForCookie(json.Groups[i]) == groupId) {
                return json.Groups[i];
            }
        }

    }

    //BEHAVIOUR(IsIABEnabled == true)
    function assignIABConsentFromHtmlGroupData(optanonHtmlGroupData, init) {
        var group = {};
        for (var index = 0; index < optanonHtmlGroupData.length; index++) {
            if (optanonHtmlGroupData[index].indexOf('_') === -1) {
                var groupData = optanonHtmlGroupData[index].split(':');
                group = getGroupById(groupData[0]);
                if (groupData[1] == "1") {
                    setIABConsent(group, "true");
                } else {
                    setIABConsent(group, "false");
                }
            }

        }
    }

   

    function setIABConsent(group, isActive, replace) {
        if (isTopLevelGroup(group)) {
            if (group.Purposes && group.Purposes.length > 0) {
                for (var index = 0; index < group.Purposes.length; index++) {
                    if (replace) {
                        var isExist = indexOf(oneTrustIABConsent.purpose, (group.Purposes[index].purposes.purposeId+ ":" + !(isActive=="true")));
                        if (isExist != -1) {
                            oneTrustIABConsent.purpose[isExist] = group.Purposes[index].purposes.purposeId + ":" + isActive;
                        }
                    } else {
                        var isExist = indexOf(oneTrustIABConsent.purpose, (group.Purposes[index].purposes.purposeId+ ":" + isActive));
                        if (isExist == -1) {
                            oneTrustIABConsent.purpose.push(group.Purposes[index].purposes.purposeId + ":" + isActive);
                        }
                    }
                }
            }
        }
    }
    
    function setIABVendor() {
        var i,
            jsonIABData = IABData();
        if (jsonIABData && jsonIABData.activeVendors && jsonIABData.activeVendors.length>0) {
            for (i = 0; i < jsonIABData.activeVendors.length; i++) {
                oneTrustIABConsent.vendors.push(jsonIABData.activeVendors[i].vendorId.toString()+ ":true");
            }
        }
    }
    //BEHAVIOUR_END

    //If cookie exists, ensures to add any new groups and remove any redundant groups to data
    function synchroniseCookieGroupData() {
        var toUpdateCookie = false,
            cookieGroupData = deserialiseStringToArray(readCookieParam(optanonCookieName, 'groups')),
            cookieGroupDataStripped = deserialiseStringToArray(readCookieParam(optanonCookieName, 'groups').replace(/:0/g, '').replace(/:1/g, '')),
            json = optanonData(),
            group,
            i,
            j,
            index,
            foundMatchingJsonGroup;

        if (readCookieParam(optanonCookieName, 'groups')) {
            //Adding missing groups to cookie
            for (i = 0; i < json.Groups.length; i += 1) {
                group = json.Groups[i];
                if (isValidConsentNoticeGroup(group)) {
                    //Group should show in popup
                    index = indexOf(cookieGroupDataStripped, getGroupIdForCookie(group));
                    if (index == -1) {
                        //Json group does not exist in cookie
                        toUpdateCookie = true;

                        if (checkIsActiveByDefault(group)) {
                            //Group is active
                            cookieGroupData.push(getGroupIdForCookie(group) + ':1');
                        } else {
                            //Group is inactive
                            cookieGroupData.push(getGroupIdForCookie(group) + ':0');
                        }
                    }
                }
            }

            //Removing redundant groups from cookie
            for (i = cookieGroupData.length - 1; i >= 0; i -= 1) {
                foundMatchingJsonGroup = false;
                for (j = 0; j < json.Groups.length; j += 1) {
                    group = json.Groups[j];
                    if (isValidConsentNoticeGroup(group)) {
                        if (getGroupIdForCookie(group) == cookieGroupData[i].replace(/:0/g, '').replace(/:1/g, '')) {
                            foundMatchingJsonGroup = true;
                            break;
                        }
                    }
                }

                if (!foundMatchingJsonGroup) {
                    //Cookie group does not exist in json
                    toUpdateCookie = true;
                    cookieGroupData.splice(i, 1);
                }
            }

            //Writing updated cookie
            if (toUpdateCookie) {
                writeCookieGroupsParam(optanonCookieName, cookieGroupData);
            }
        }
    }

    // Returns true if all json default group statuses are set to inactive (excluding 'always active' groups)
    function getIsOptInMode() {
        var isOptIn = true,
            group,
            json = optanonData(),
            i;

        for (i = 0; i < json.Groups.length; i += 1) {
            group = json.Groups[i];
            if (isValidConsentNoticeGroup(group)) {
                //TODO: confirm if should consider DNT here
                if (!safeGroupDefaultStatus(group) ||
                    (safeGroupDefaultStatus(group) &&
                        (safeGroupDefaultStatus(group).toLowerCase() == 'active' ||
                            safeGroupDefaultStatus(group).toLowerCase() == 'inactive landingpage' ||
                            safeGroupDefaultStatus(group).toLowerCase() == doNotTrackText))) {
                    isOptIn = false;
                    break;
                }
            }
        }

        return isOptIn;
    }

    // Returns true if all json default group statuses are set to inactive landingpage (excluding 'always active' groups)
    function getIsSoftOptInMode() {
        var isSoftOptIn = true,
            group,
            json = optanonData(),
            i;

        for (i = 0; i < json.Groups.length; i += 1) {
            group = json.Groups[i];
            if (!isValidConsentNoticeGroup(group)) continue;

            var statusText = safeGroupDefaultStatus(group).toLowerCase();
            if (statusText !== 'inactive landingpage' && statusText !== 'always active') {
                isSoftOptIn = false;
                break;
            }
        }

        return isSoftOptIn;
    }

    // Ensure cookie data is compatible with latest version
    function ensureCookieDataCompatibility() {
        var toUpdateCookie = false;

        if (readCookieParam(optanonCookieName, 'groups') && !optanonEnsureCookieDataCompatibilityComplete) {

            //Add functionality here to update cookie data

            //Writing updated cookie
            if (toUpdateCookie) {
                writeCookieGroupsParam(optanonCookieName, cookieGroupData);
            }

            optanonEnsureCookieDataCompatibilityComplete = true;
        }
    }

    function writeCookieGroupsParam(cookieName, groupData) {
        if (groupData) {
            writeCookieParam(cookieName, 'groups', serialiseArrayToString(groupData));
        } else {
            writeCookieParam(cookieName, 'groups', serialiseArrayToString(optanonHtmlGroupData));
        }
    }

    function updateCookieParam(cookieName, paramName, paramValue){
        var data = {},
        cookie = getCookie(cookieName),
        i,
        values,
        pair,
        value,
        updatedValues,
        updatedCookie,
        needToUpdateCookie = false;
         
        values = cookie.split('&');
        values.forEach(function(param) {
            // Update Selected Param
            if(param.includes(paramName)){
                if(param.split('=')[1] !== paramValue.toString()){
                    needToUpdateCookie = true;
                    updatedCookie = cookie.replace(param, paramName + '=' + paramValue); 
                }
            }
        })

        if(needToUpdateCookie){
            updatedValues = updatedCookie.split('&');
                
            if (updatedCookie) {
                for (i = 0; i < updatedValues.length; i += 1) {
                    pair = updatedValues[i].split('=');
                    data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]).replace(/\+/g, ' ');
                }
            }
            data.datestamp = new Date().toString();
            data.version = optanonVersion;
            value = param(data);
            setCookie(cookieName, value, 365);
        }
    }

    function writeCookieParam(cookieName, paramName, paramValue) {
        var data = {},
            cookie = getCookie(cookieName),
            i,
            values,
            pair,
            value,
            json = optanonData();

        if (cookie) {
            values = cookie.split('&');
            for (i = 0; i < values.length; i += 1) {
                pair = values[i].split('=');
                data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]).replace(/\+/g, ' ');
            }
        }
        data[paramName] = paramValue;
        data.datestamp = new Date().toString();
        data.version = optanonVersion;
        value = param(data);
        setCookie(cookieName, value, 365);
        //BEHAVIOUR(IsIABEnabled == true)
        if (cookieName === optanonCookieName && json.IsIABEnabled) {
            if (oneTrustIABConsent && oneTrustIABConsent.purpose && oneTrustIABConsent.vendors) {
                IABCookieValue = getIABConsentData();
                setCookie(oneTrustIABCookieName, IABCookieValue, 30);
                if(json.IsIabThirdPartyCookieEnabled && IAB3rdPartyCookieValue) {
                    setIAB3rdPartyCookie(oneTrustIAB3rdPartyCookie, IABCookieValue, 30, false);                     
                }
            }
        }
        //BEHAVIOUR_END

    }

    function readCookieParam(cookieName, paramName) {
        var cookie = getCookie(cookieName),
            i,
            data,
            values,
            pair;

        if (cookie) {
            data = {};
            values = cookie.split('&');
            for (i = 0; i < values.length; i += 1) {
                pair = values[i].split('=');
                data[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]).replace(/\+/g, ' ');
            }
            if (paramName && data[paramName]) {
                //Found cookie value for valid param
                return data[paramName];
            }
            if (paramName && !data[paramName]) {
                //Found no cookie value for valid param
                return "";
            }
            //Invalid param, returns entire cookie
            return data;

        }
        return "";
    }

    function setCookie(name, value, days) {
        var expires,
            date;

        if (!optanonPreview) {
            if (days) {
                date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toGMTString();
            } else {
                expires = '';
            }

            var domainAndPath = optanonCookieDomain.split('/');
            if (domainAndPath.length <= 1) {
                domainAndPath[1] = '';
            }

            document.cookie = name + '=' + value + expires + '; path=/' + domainAndPath[1] + '; domain=.' + domainAndPath[0];
        }
    }

    function getCookie(name) {
        var nameEq = name + '=',
            ca = document.cookie.split(';'),
            i,
            c;

        if (!optanonPreview) {
            for (i = 0; i < ca.length; i += 1) {
                c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEq) == 0) {
                    return c.substring(nameEq.length, c.length);
                }
            }
        }
        return null;
    }

    function setIAB3rdPartyCookie(name, value, days, isFirstRequest) {
        var IABUrl = "[[IabThirdPartyCookieUrl]]";
        var thirdPartyCookie, 
            firstPartyCookie,
            allPurposes,
            allVendors;

        if(IABUrl && document.body) {

            if(!isFirstRequest && !isInitIABCookieData()) {
                var IABDataValue = IABData();  
                thirdPartyCookie = new consentString.ConsentString(IAB3rdPartyCookieValue);
                firstPartyCookie = new consentString.ConsentString(value);
                allPurposes = getIdArray(oneTrustIABConsent.purpose);
                allVendors = IABDataValue.activeVendors.map(function(vendor) {
                    return vendor.vendorId;
                });
                thirdPartyCookie.allowedPurposeIds =  thirdPartyCookie.allowedPurposeIds.filter(function(el){ return allPurposes.indexOf(el)<0; });
                thirdPartyCookie.allowedVendorIds = thirdPartyCookie.allowedVendorIds.filter(function(el){ return allVendors.indexOf(el)<0; });

                allPurposes =  thirdPartyCookie.allowedPurposeIds.concat(firstPartyCookie.allowedPurposeIds);
                allVendors = thirdPartyCookie.allowedVendorIds.concat(firstPartyCookie.allowedVendorIds);
                IAB3rdPartyCookieValue = value = getIABConsentData(allPurposes, allVendors);
            }
            var url = window.location.protocol + "//" + IABUrl + "/?name=" + name + "&value=" + value + "&expire=" + days + "&isFirstRequest=" +isFirstRequest;
            if(document.getElementById('onetrustIabCookie')){
                document.getElementById('onetrustIabCookie').contentWindow.location.replace(url);
            } else {
                var i = document.createElement('iframe');
                i.style.display = 'none';
                i.id="onetrustIabCookie";
                i.src = url;
                document.body.appendChild(i);
            }
        }     
    }

    function canInsertForGroup(groupId, ignoreGroupCheck) {
        var validGroup = groupId != null && typeof groupId != 'undefined',
            isExistingActiveGroup,
            isNonExistingGroup;

        if (!optanonPreview) {
            if (!ignoreGroupCheck) {
                ensureHtmlGroupDataInitialised();
                isExistingActiveGroup = contains(optanonHtmlGroupData, (groupId + ':1'));
                isNonExistingGroup = !doesGroupExist(groupId);
                if (validGroup && (isExistingActiveGroup && canSoftOptInInsertForGroup(groupId) || isNonExistingGroup)) {
                    return true;
                }
                return false;
            }
            return true;
        }
        return true;
    }

    // Returns true if group is not soft opt-in or if group is soft opt-in and landing page was left (i.e. after user interaction)
    function canSoftOptInInsertForGroup(groupId) {
        var group = getGroupById(groupId),
            isSoftOptInGroup;

        isSoftOptInGroup = safeGroupDefaultStatus(group).toLowerCase() == 'inactive landingpage';
        if (!isSoftOptInGroup) {
            return true;
        }
        var landingPath = readCookieParam(optanonCookieName, 'landingPath');
        if (!landingPath || landingPath === location.href) {
            return false;
        }
        return true;
    }

    // Returns true if group id exist in json
    function doesGroupExist(groupId) {
        var json = optanonData(),
            i;

        for (i = 0; i < json.Groups.length; i += 1) {
            if(json.Groups[i].CustomGroupId) {
               if(json.Groups[i].CustomGroupId == groupId) {
                   return true;
               } 
            } else if (json.Groups[i].OptanonGroupId == groupId) {
                return true;
            }
        }
        return false;
    }

    //Returns comma delimited string from array
    function serialiseArrayToString(cookieGroupsArray) {
        return cookieGroupsArray.toString().toLowerCase();
    }

    //Returns array from comma delimited string
    function deserialiseStringToArray(cookieGroupsString) {
        if (!cookieGroupsString) return [];
        return cookieGroupsString.toLowerCase().split(',');
    }

    function executeCustomScript(){
        var json = optanonData();
        if(json.CustomJs) {
            (new Function(json.CustomJs))();
        }
    }

    function executeOptanonWrapper() {
        var i;
        executeCustomScript();
        if (typeof OptanonWrapper == 'function') {
            if (OptanonWrapper != 'undefined') {
                OptanonWrapper();

                //Adding Optanon Group Id to optanonWrapperScriptExecutedGroups
                for (i = 0; i < optanonWrapperScriptExecutedGroupsTemp.length; i += 1) {
                    if (!contains(optanonWrapperScriptExecutedGroups, optanonWrapperScriptExecutedGroupsTemp[i])) {
                        optanonWrapperScriptExecutedGroups.push(optanonWrapperScriptExecutedGroupsTemp[i]);
                    }
                }
                optanonWrapperScriptExecutedGroupsTemp = [];

                //Adding Optanon Group Id to optanonWrapperHtmlExecutedGroups
                for (i = 0; i < optanonWrapperHtmlExecutedGroupsTemp.length; i += 1) {
                    if (!contains(optanonWrapperHtmlExecutedGroups, optanonWrapperHtmlExecutedGroupsTemp[i])) {
                        optanonWrapperHtmlExecutedGroups.push(optanonWrapperHtmlExecutedGroupsTemp[i]);
                    }
                }
                optanonWrapperHtmlExecutedGroupsTemp = [];
            }
        }
    }

    function jsonAddAboutCookies(json) {
        json.Groups.unshift(
            { 'GroupLanguagePropertiesSets': [{ 'GroupName': { 'Text': optanonAboutCookiesGroupName }, 'GroupDescription': { 'Text': json.MainInfoText } }] }
        );
    }

    /* JS Helper functions start*/
    function empty(id) {
        var elem = document.getElementById(id);

        if (elem) {
            while (elem.hasChildNodes()) {
                elem.removeChild(elem.lastChild);
            }
        }
    }

    function show(id) {
        var elem = document.getElementById(id);

        if (elem) {
            elem.style.display = 'block';
        }
    }

    function remove(id) {
        var elem = document.getElementById(id);

        if (elem) {
            elem.parentNode.removeChild(elem);
        }
    }

    function appendTo(id, element) {
        var elem = document.getElementById(id),
            div;

        if (elem) {
            div = document.createElement('div');
            div.innerHTML = element;
            elem.appendChild(div);
        }
    }

    function contains(array, item) {
        var i;

        for (i = 0; i < array.length; i += 1) {
            if (array[i].toString().toLowerCase() == item.toString().toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    function indexOf(array, item) {
        var i;

        for (i = 0; i < array.length; i += 1) {
            if (array[i] == item) {
                return i;
            }
        }
        return -1;
    }

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) != -1;
    }

    function param(obj) {
        var str = '',
            key;

        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (str != '') {
                    str += '&';
                }
                str += key + '=' + encodeURIComponent(obj[key]).replace(/%20/g, '+');
            }
        }
        return str;
    }

    function generateUUID() {
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function convertIABVendorPurposeArrayToObject(IabData){
        var result = {};
        IabData.map(function(item){
            var data = item.split(':');
            result[parseInt(data[0])] = data[1] ==="true";
        });
        return result;
    }

    function getActiveIdArray(arrayData) {
        return arrayData.filter(function (item) {
            return item.split(':')[1] === "true";
        }).map(function (item1) {
            return parseInt(item1.split(":")[0]);
        });
    }

    function distinctArray(arrayData) {
        var result = [];
        arrayData.forEach(function (item) {
            if (result.indexOf(item) < 0) {
                result.push(item);
            }
        });
        return result;
    }


    function getIdArray(keyValueArray) {
        return keyValueArray.map(function (item) {
            return parseInt(item.split(":")[0]);
        });
    }

    /* JS Helper functions end*/

    function setAllowAllButton() {
        var deactiveCount = 0,
            group,
            json = optanonData(),
            i;

        for (i = 0; i < json.Groups.length; i += 1) {
            group = json.Groups[i];
            if (isValidConsentNoticeGroup(group)) {
                if (contains(optanonHtmlGroupData, (getGroupIdForCookie(group) + ':0'))) {
                    deactiveCount += 1;
                    if (deactiveCount >= 1) {
                        $Opt('#optanon .optanon-allow-all-button').show();
                        return true;
                    }
                }
            }
        }
        $Opt('#optanon .optanon-allow-all-button').hide();
        return false;
    }

    //Closing Optanon alert box with predefined class = optanon-alert-box-wrapper
    function closeOptanonAlertBox(setOptanonAlertBoxCookie, isOptanonAlertBoxCookiePersistent) {
        $Opt('.optanon-alert-box-wrapper').fadeOut(400);
        if (setOptanonAlertBoxCookie && (optanonIsOptInMode || (!optanonIsOptInMode && !Optanon.IsAlertBoxClosedAndValid()))) {
            Optanon.SetAlertBoxClosed(isOptanonAlertBoxCookiePersistent);
        }
    }

    function isValidConsentNoticeGroup(group) {
        //does current group have visible sub groups with cookies or is a subgroup with cookies
        var group2,
            json = optanonData(),
            hasValidSubGroupsWithCookies = false,
            isIABData = false,
            i;
        var isMainGroupCookieNotEmpty = (group.Cookies != null && group.Cookies.length > 0);
        if (isTopLevelGroup(group)) {
            isIABData = (group.Purposes && group.Purposes.length > 0) && json.IsIABEnabled;
            for (i = 0; i < json.Groups.length; i += 1) {
                group2 = json.Groups[i];
                var isSubGroupCookieNotEmpty = (group2.Cookies != null && group2.Cookies.length > 0);
                if (group2.Parent != null && safeGroupName(group) && safeGroupName(group2.Parent) == safeGroupName(group) &&
                    group2.ShowInPopup && isSubGroupCookieNotEmpty) {
                    hasValidSubGroupsWithCookies = true;
                    break;
                }
            }
            return group.ShowInPopup && (isMainGroupCookieNotEmpty || hasValidSubGroupsWithCookies || isIABData);
        }
        return group.ShowInPopup && isMainGroupCookieNotEmpty;
    }

    function isTopLevelGroup(group) {
        return group && group.Parent == null;
    }

    function getGroupSubGroups(group) {
        var group2,
            json = optanonData(),
            subGroups = [],
            i;

        for (i = 0; i < json.Groups.length; i += 1) {
            group2 = json.Groups[i];
            var isSubGroupCookieNotEmpty = (group2.Cookies != null && group2.Cookies.length > 0);
            if (group2.Parent != null && safeGroupName(group2.Parent) == safeGroupName(group) &&
                group2.ShowInPopup && isSubGroupCookieNotEmpty) {
                subGroups.push(group2);
            }
        }

        return subGroups;
    }

    function optanonData() {
        if (!optanonJsonData) {
            var json = [[OptanonDataJSON]];
            //BEHAVIOUR(CenterTile == true)
            json.ForceConsent = true;
            //BEHAVIOUR_END
            optanonJsonData = json;
            return optanonJsonData;
        }
        else {
            return optanonJsonData;
        }
    }

    //BEHAVIOUR(IsConsentIntegration == true)
    function populateConsentData() {
        var consentData = {};
        consentData.consentPayload = [[consentPayload]];
        consentData.consentApi = "[[consentApi]]";
        return consentData;
    }
    //BEHAVIOUR_END

    //BEHAVIOUR(IsIABEnabled == true)
    function IABData() {
        var json = [[IABDataJSON]];
        if(json.iabVendorJson && !oneTrustIABConsent.vendorList) {
            oneTrustIABConsent.vendorList = JSON.parse(json.iabVendorJson);
        }        
        return json;
    }
    //BEHAVIOUR_END

    this.useGeoLocationService = useGeoLocationService;

    this.LoadBanner = function () {
        $Opt(window).trigger("otloadbanner");
    };

    this.Init = function () {

        initObjectAssignPolyfill();

        initArrayFillPolyfill();

        updateScriptAndCssUrl();

        //Populates optanonHtmlGroupData from cookie or default statuses
        ensureHtmlGroupDataInitialised();

        // CustomEvent polyfill
        // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
        (function () {
            if ( typeof window.CustomEvent === "function" ) return false; //If CustomEvent supported return
            function CustomEvent ( event, params ) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent( 'CustomEvent' );
                evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                return evt;
            }
            CustomEvent.prototype = window.Event.prototype;
            window.CustomEvent = CustomEvent;
        })();

        //Populates Google Tag Manager macro global Optanon variable
        updateGtmMacros(false);

        //Inserts reguired css references
        initialiseCssReferences();

        //Save landing page url
        initialiseLandingPath();

        
            //Inserts required jquery reference
            injectJquery();
        

        
    };

    function updateScriptAndCssUrl(){
        var json = optanonData();
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; ++i) {
            if (isOptanonFile(scripts[i], json.cctId)) {
                var OptanonScript = scripts[i].src;
                onetrustClientScriptUrl = getURL(OptanonScript);
                break;
            }
        }
    }

    function updateCorrectUrl(sourceUrl) {
        var sourceUrI = getURL(sourceUrl);
        if (onetrustClientScriptUrl && sourceUrI && onetrustClientScriptUrl.hostname !== sourceUrI.hostname) {
            sourceUrl = sourceUrl.replace(sourceUrI.hostname, onetrustClientScriptUrl.hostname);
        }
        return sourceUrl;
    }

    function isOptanonFile(scriptElem, filePathPart){
        if(scriptElem.getAttribute('src')){
            return scriptElem.getAttribute('src').indexOf(filePathPart) !== -1;
        }
        return false;
    }

    function getURL(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };


    // Inserts a script tag into page at specified location //
    // url: script tag reference url
    // selector: container element of script tag (possible values: 'head', 'body', '<element id>')
    // callback: callback method after script tag has been inserted
    // options: contains behaviors once the script is inserted
    //      options.deleteSelectorContent (boolean): set to true to delete all selector content before inserting script
    //      options.makeSelectorVisible (boolean): set to true to show selector after inserting script
    //      options.makeElementsVisible (array[string]): set the id's of arbitrary elements to show after inserting script
    //      options.deleteElements (array[string]): set the id's of arbitrary elements to delete after inserting script
    // groupId: if implied consent, the Optanon Group Id for which the script tag should be inserted
    this.InsertScript = function (url, selector, callback, options, groupId, async) {
        var validOptions = options != null && typeof options != 'undefined',
            ignoreGroupCheck = ((validOptions && typeof options.ignoreGroupCheck != 'undefined' && options.ignoreGroupCheck == true) || optanonGeolocationExecuteAllScripts),
            i,
            j,
            script,
            done;

        if (canInsertForGroup(groupId, ignoreGroupCheck) && !contains(optanonWrapperScriptExecutedGroups, groupId)) {
            //Delay adding group to optanonWrapperScriptExecutedGroups
            optanonWrapperScriptExecutedGroupsTemp.push(groupId);

            if (validOptions && typeof options.deleteSelectorContent != 'undefined' && options.deleteSelectorContent == true) {
                empty(selector);
            }

            script = document.createElement('script');

            if (callback != null && typeof callback != 'undefined') {
                done = false;
                script.onload = script.onreadystatechange = function () {
                    if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
                        done = true;
                        callback();
                    }
                };
            }

            script.type = 'text/javascript';
            script.src = url;
            if (async) {
                script.async = async;
            }

            switch (selector) {
                case 'head':
                    document.getElementsByTagName('head')[0].appendChild(script);
                    break;
                case 'body':
                    document.getElementsByTagName('body')[0].appendChild(script);
                    break;
                default:
                    if (document.getElementById(selector)) {
                        document.getElementById(selector).appendChild(script);
                        if (validOptions && typeof options.makeSelectorVisible != 'undefined' && options.makeSelectorVisible == true) {
                            show(selector);
                        }
                    }
                    break;
            }

            if (validOptions && typeof options.makeElementsVisible != 'undefined') {
                for (i = 0; i < options.makeElementsVisible.length; i += 1) {
                    show(options.makeElementsVisible[i]);
                }
            }

            if (validOptions && typeof options.deleteElements != 'undefined') {
                for (j = 0; j < options.deleteElements.length; j += 1) {
                    remove(options.deleteElements[j]);
                }
            }
        }
    };

    // Inserts an arbitrary html tag into page at specified location //
    // element: html element
    // selector: container element of html element (possible values: '<element id>')
    // callback: callback method after html element has been inserted
    // options: contains behaviors once the html is inserted
    //      options.deleteSelectorContent (boolean): set to true to delete all selector content before inserting html
    //      options.makeSelectorVisible (boolean): set to true to show selector after inserting html
    //      options.makeElementsVisible (array[string]): set the id's of arbitrary elements to show after inserting html
    //      options.deleteElements (array[string]): set the id's of arbitrary elements to delete after inserting html
    // groupId: if implied consent, the Optanon Group Id for which the html element should be inserted
    this.InsertHtml = function (element, selector, callback, options, groupId) {
        var validOptions = options != null && typeof options != 'undefined',
            ignoreGroupCheck = ((validOptions && typeof options.ignoreGroupCheck != 'undefined' && options.ignoreGroupCheck == true) || optanonGeolocationExecuteAllScripts),
            i,
            j;

        if (canInsertForGroup(groupId, ignoreGroupCheck) && !contains(optanonWrapperHtmlExecutedGroups, groupId)) {
            //Delay adding group to optanonWrapperHtmlExecutedGroups
            optanonWrapperHtmlExecutedGroupsTemp.push(groupId);

            if (validOptions && typeof options.deleteSelectorContent != 'undefined' && options.deleteSelectorContent == true) {
                empty(selector);
            }

            appendTo(selector, element);

            if (validOptions && typeof options.makeSelectorVisible != 'undefined' && options.makeSelectorVisible == true) {
                show(selector);
            }

            if (validOptions && typeof options.makeElementsVisible != 'undefined') {
                for (i = 0; i < options.makeElementsVisible.length; i += 1) {
                    show(options.makeElementsVisible[i]);
                }
            }

            if (validOptions && typeof options.deleteElements != 'undefined') {
                for (j = 0; j < options.deleteElements.length; j += 1) {
                    remove(options.deleteElements[j]);
                }
            }

            if (callback != null && typeof callback != 'undefined') {
                callback();
            }
        }
    };

    // Close consent notice and writes cookie
    this.Close = function (closeFromCookie) {  
        // Update Toggled On Group
        var json = optanonData(); 

        // Implied Consent
        if(!closeFromCookie && json.ConsentModel && json.ConsentModel.Name.toLowerCase() === constant.IMPLIEDCONSENT) {
            impliedConsentDirty = true;
            if(isCenterTile) {
                Array.prototype.forEach.call(document.querySelectorAll('.optanon-popup-body-content'), function (domEl, idx) {
                   if ($Opt(domEl).data('group') && domEl.querySelector('input')) {
                       var group = $Opt(domEl).data('group'),
                           groupName = safeGroupName(group);
                           
                       if (domEl.querySelector('input').checked) {
                          
                           //Google Analytics event tracking
                           Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Preferences Toggle On', groupName);
                   
                           //updating optanonHtmlGroupData with new group status
                           var index = indexOf(optanonHtmlGroupData, getGroupIdForCookie(group) + ':0');
                           if (index != -1) {
                               optanonHtmlGroupData[index] = getGroupIdForCookie(group) + ':1';
                   
                               if (json.IsIABEnabled) {
                                   setIABConsent(group, "true", true);
                               }
                           }
                       } else {
                           
                           //Google Analytics event tracking
                           Optanon.TriggerGoogleAnalyticsEvent('OneTrust Cookie Consent', 'Preferences Toggle Off', groupName);
                   
                           //updating optanonHtmlGroupData with new group status
                           var index = indexOf(optanonHtmlGroupData, getGroupIdForCookie(group) + ':1');
                           if (index != -1) {
                               optanonHtmlGroupData[index] = getGroupIdForCookie(group) + ':0';
                   
                               if (json.IsIABEnabled) {
                                   setIABConsent(group, "false", false);
                               }
                           }
                           
                       }
                   }
               });
           } else {
                Array.prototype.forEach.call(document.querySelector('#optanon-menu').children, function (el, idx) {
                    if(el.title !== 'More Information') {
                    $Opt(el).click()
                    
                    Array.prototype.forEach.call(document.querySelectorAll('.optanon-status-checkbox'), function (domEl, idx) {
                        if($Opt(domEl).data('group')) {
                            if (domEl.checked) {
                                toggleGroupStatusOn(json, $Opt(domEl).data('group'), domEl);
                            } 
                        }
                    });
                        
                    }
                });
           }
        }

        hideConsentNotice();
        updateConsentData();    
        //BEHAVIOUR(IsConsentIntegration == true)
        createConsentTransaction();
        //BEHAVIOUR_END
        executeOptanonWrapper();
    };

    function updateConsentData() {
        //BEHAVIOUR(IsIABEnabled == true)
        saveVendorStatus();
        //BEHAVIOUR_END
        setLandingPathParam(optanonNotLandingPageName);
        writeCookieGroupsParam(optanonCookieName);
        substitutePlainTextScriptTags();
        updateGtmMacros(false);
    }

    // Close consent notice, writes cookies and executes wrapper function
    this.AllowAll = function (consentIgnoreForGeoLookup) {
        var group,
            json = optanonData(),
            i;

        optanonHtmlGroupData = [];
        for (i = 0; i < json.Groups.length; i += 1) {
            group = json.Groups[i];
            if (isValidConsentNoticeGroup(group)) {
                optanonHtmlGroupData.push(getGroupIdForCookie(group) + ':1');
            }
        }
        //BEHAVIOUR(IsIABEnabled == true)
        if (optanonHtmlGroupData && json.IsIABEnabled) {
            oneTrustIABConsent.purpose = [];
            assignIABConsentFromHtmlGroupData(optanonHtmlGroupData);
        }
        //BEHAVIOUR_END


        $Opt('#optanon #optanon-menu li').removeClass('menu-item-off');
        $Opt('#optanon #optanon-menu li').addClass('menu-item-on');

        hideConsentNotice();
        setLandingPathParam(optanonNotLandingPageName);
        writeCookieGroupsParam(optanonCookieName);
        substitutePlainTextScriptTags();
        updateGtmMacros(true);
        //BEHAVIOUR(IsConsentIntegration == true)
        if(!consentIgnoreForGeoLookup) {
            createConsentTransaction();
        }        
        //BEHAVIOUR_END
        executeOptanonWrapper();
    };

    // Toggles consent notice visible state
    this.ToggleInfoDisplay = function () {
        if ($Opt('#optanon #optanon-popup-bg, #optanon #optanon-popup-wrapper').is(':hidden')) {
            showConsentNotice();

            if(!isCenterTile) {
                var venderConsentLink = document.querySelector('#optanon-vendor-consent-text'),
                popUpHeader = document.querySelector('#optanon-popup-top').children,
                popUpBottom = document.querySelector('#optanon-popup-bottom').children,
                sideNav = document.querySelector('#optanon-menu').children,
                closeLink = document.querySelector('.optanon-close-ui'),
                optanon = document.querySelector('#optanon'),
                headerItems = [],
                footerItems = [];

                for(var i = 0; i < popUpHeader.length; i++){
                    if(popUpHeader[i].style.display !== 'none'){
                        headerItems.push(popUpHeader[i]);
                    }
                }
                for(var i = 0; i < popUpBottom.length; i++){
                    if(popUpBottom[i].style.display !== 'none'){
                        footerItems.push(popUpBottom[i]);
                    }
                }

                if(headerItems.length > 0){
                    popUpHeader[0].addEventListener('keydown', popUpHeaderHandler);
                } else {
                    sideNav[0].addEventListener('keydown', popUpHeaderHandler);
                }
                if(footerItems.length > 0){
                    var allowAllBtn = document.querySelector('.optanon-button-wrapper.optanon-allow-all-button.optanon-allow-all');
                    if(allowAllBtn.style.display === 'block'){
                        footerItems[footerItems.length - 1].addEventListener('keydown', footerItemsHandler);
                    } else {
                        footerItems[footerItems.length - 2].addEventListener('keydown', footerItemsHandler);
                    }
                }

                sideNav[sideNav.length - 1].addEventListener('keydown', sideNavHandler);
                optanon.addEventListener('keyup', optanonHandler);
                if(venderConsentLink) venderConsentLink.addEventListener('keyup', venderConsentHandler);

                if(closeLink){
                    closeLink.addEventListener('keydown', closeLinkHandler);
                }
            }
        } else {
            hideConsentNotice();
            writeCookieGroupsParam(optanonCookieName);
            substitutePlainTextScriptTags();
            updateGtmMacros(false);
            executeOptanonWrapper();
        }
    };

    function venderConsentHandler(event){
        var popUpWrapper = document.querySelector('#optanon-popup-wrapper');
        if(event.keyCode === 13){
            popUpWrapper.focus();
        }
    } 
    
    function optanonHandler(event){
        var cookieSettingsBtn = document.querySelector('.optanon-toggle-display.cookie-settings-button');
        if(event.keyCode === 27){
            cookieSettingsBtn.focus();
            closeLinkHandler(event);
        }
    }  

    function closeLinkHandler(event){
        var closeLink = document.querySelector('.optanon-close-ui'),
            popUpHeader = document.querySelector('#optanon-popup-top').children[0],
            popUpBottom = document.querySelector('#optanon-popup-bottom').children,
            sideNav = document.querySelector('#optanon-menu').children,
            venderConsentLink = document.querySelector('#optanon-vendor-consent-text'),
            optanon = document.querySelector('#optanon');

        if(event.keyCode === 13 || event.keyCode === 27){
            hideConsentNotice();
            document.querySelector('.optanon-toggle-display.cookie-settings-button').focus();

            if(popUpHeader){
                popUpHeader.removeEventListener('keydown', popUpHeaderHandler);
            } else {
                sideNav[0].removeEventListener('keydown', popUpHeaderHandler);
            }
            if(popUpBottom.length > 0){
                var allowAllBtn = document.querySelector('.optanon-button-wrapper.optanon-allow-all-button.optanon-allow-all');
                if(allowAllBtn.style.display === 'block'){
                    popUpBottom[popUpBottom.length - 1].removeEventListener('keydown', footerItemsHandler);
                } else {
                    popUpBottom[popUpBottom.length - 2].removeEventListener('keydown', footerItemsHandler);
                }
            }
            
            sideNav[sideNav.length - 1].removeEventListener('keydown', sideNavHandler);
            optanon.removeEventListener('keyup',venderConsentHandler);

            if(venderConsentLink) {
                venderConsentLink.removeEventListener('keyup', venderConsentHandler);
            }
            
            if(closeLink){
                closeLink.removeEventListener('keydown', closeLinkHandler);
            }
        }
    }

    function sideNavHandler(event){
        if(event.keyCode === 9 && !event.shiftKey){
            document.querySelector('.optanon-white-button-middle > button').removeAttribute('tabindex');
            document.querySelector('.optanon-allow-all > .optanon-white-button-middle > button').removeAttribute('tabindex');
        } 
    }

    function footerItemsHandler(event){
        var popUpWrapper = document.querySelector('#optanon-popup-wrapper'),
            allowAllBtn = allowAllBtn = document.querySelector('.optanon-allow-all > .optanon-white-button-middle > button');
        if(event.keyCode === 9){
            popUpWrapper.focus();
        } 
        if(event.keyCode === 9 && !event.shiftKey){
            document.querySelector('.optanon-white-button-middle > button').removeAttribute('tabindex');
            allowAllBtn.removeAttribute('tabindex');
        } 
        if(event.keyCode === 9 && event.shiftKey){
            document.querySelector('#optanon-popup-bottom > a').focus();
        }
    }

    function popUpHeaderHandler(event){
        var allowAllBtn = document.querySelector('.optanon-allow-all > .optanon-white-button-middle > button'),
            saveSettingsBtn = document.querySelector('.optanon-white-button-middle > button');

        if(event.keyCode === 9 && event.shiftKey){
            saveSettingsBtn.setAttribute('tabindex', 5);
            allowAllBtn.setAttribute('tabindex', 4);
        }
        if(event.keyCode === 9 && !event.shiftKey){
            saveSettingsBtn.removeAttribute('tabindex');
            allowAllBtn.removeAttribute('tabindex');
        } 
    }

    // Selectively blocks Google Analytics tracking functionality when consent has not been given
    this.BlockGoogleAnalytics = function (gaId, groupId) {
        window['ga-disable-' + gaId] = !canInsertForGroup(groupId);
    };

    // Optanon UI Google Analytics event tracking
    this.TriggerGoogleAnalyticsEvent = function (category, action, label, value) {
        //Google Analytics (w/o Google Tag Manager)
        if (typeof _gaq != 'undefined') {
            _gaq.push(['_trackEvent', category, action, label, value]);
        }
        //Universal Analytics (w/o Google Tag Manager)
        if (typeof ga != 'undefined') {
            ga('send', 'event', category, action, label, value);
        }
        //Google Tag Manager
        if (typeof dataLayer != 'undefined' && dataLayer.constructor === Array) {
            dataLayer.push({ 'event': 'trackOptanonEvent', 'optanonCategory': category, 'optanonAction': action, 'optanonLabel': label, 'optanonValue': value });
        }
    };

    // Returns if alert box has been closed by checking if setOptanonAlertBoxCookie exists
    this.IsAlertBoxClosedAndValid = function () {
        var json = optanonData(),
            cookie = getCookie(optanonAlertBoxClosedCookieName),
            reconsentDate = json.LastReconsentDate;

        if (cookie === null) return false;
        if (!reconsentDate) return true;

        var needsReconsent = new Date(reconsentDate) > new Date(cookie);
        if (needsReconsent) {
            Optanon.ReconsentGroups();
        }

        return !needsReconsent;
    };

    // Alias for old function name
    this.IsAlertBoxClosed = this.IsAlertBoxClosedAndValid;

    // if Re-consent is needed, update groups according to their default status
    this.ReconsentGroups = function () {
        var toUpdateCookie = false,
            cookieGroupData = deserialiseStringToArray(readCookieParam(optanonCookieName, 'groups')),
            cookieGroupDataStripped = deserialiseStringToArray(readCookieParam(optanonCookieName, 'groups').replace(/:0/g, '').replace(/:1/g, '')),
            json = optanonData();

        if (readCookieParam(optanonCookieName, 'groups')) {
            for (var i = 0; i < json.Groups.length; i += 1) {
                var group = json.Groups[i];
                if (!isValidConsentNoticeGroup(group)) continue;
                //Group should show in popup
                var index = indexOf(cookieGroupDataStripped, getGroupIdForCookie(group));
                if (index == -1) continue;

                var statusText = safeGroupDefaultStatus(group).toLowerCase();
                var reconsentStatuses = ["inactive", "inactive landingpage", "do not track"];
                if (reconsentStatuses.indexOf(statusText) > -1) {
                    toUpdateCookie = true;
                    var groupValue = statusText === "inactive landingpage" ? ':1' : ':0';
                    cookieGroupData[index] = getGroupIdForCookie(group) + groupValue;
                }
            }

            //Writing updated cookie
            if (toUpdateCookie) {
                writeCookieGroupsParam(optanonCookieName, cookieGroupData);
            }
        }
    };

    // Sets setOptanonAlertBoxCookie cookie indicating alert box has been closed
    this.SetAlertBoxClosed = function (isOptanonAlertBoxCookiePersistent) {
        var consentDate = new Date().toISOString();
        if (isOptanonAlertBoxCookiePersistent) {
            setCookie(optanonAlertBoxClosedCookieName, consentDate, 365);
        } else {
            setCookie(optanonAlertBoxClosedCookieName, consentDate);
        }
        //BEHAVIOUR(BannerPushesDown == true)
        if(checkBrowserSupportPushPageUp()) {
            pushPageUp();
        }
        //BEHAVIOUR_END
    };

    // Client facing wrapper around optanonData, returns groups, cookies and other domain data
    this.GetDomainData = function () {
        var domainData = optanonData();
        return domainData;
    };

    // Add listener to be called when consent is available
    this.OnConsentChanged = function (f) {
        window.addEventListener("consent.onetrust", f);
    }    

    //BEHAVIOUR(IsIABEnabled == true)
    this.getPingRequest = function (callback) {
        if (callback) {
            var domainJson = optanonData();
            if (domainJson.IsIABEnabled) {
                var pingData = {
                    gdprAppliesGlobally: oneTrustIABgdprAppliesGlobally,
                    cmpLoaded: oneTrustIABConsent.vendorList && !(oneTrustIABgdprAppliesGlobally==null)
                };
                callback(pingData, true);
            } else {
                callback({}, false);
            }
        }
    }

    this.getVendorConsentsRequest = function (callback) {
        if (callback) {
            var domainJson = optanonData();
            if (domainJson.IsIABEnabled) {
                var IABJsonData = IABData();
                if (IABJsonData) {
                    var venderConsentData = {
                        metadata: IABCookieValue ? IABCookieValue : getIABConsentData(),
                        gdprApplies: oneTrustIABgdprAppliesGlobally,
                        hasGlobalScope: domainJson.IsIabThirdPartyCookieEnabled,
                        cookieVersion: IABJsonData.cookieVersion,
                        created: IABJsonData.createdTime,
                        lastUpdated: IABJsonData.updatedTime,
                        cmpId: IABJsonData.cmpId,
                        cmpVersion: IABJsonData.cmpVersion,
                        consentLanguage: IABJsonData.consentLanguage,
                        consentScreen: IABJsonData.consentScreen,
                        vendorListVersion: IABJsonData.vendorListVersion,
                        maxVendorId: IABJsonData.maxVendorId,
                        purposeConsents: convertIABVendorPurposeArrayToObject(oneTrustIABConsent.purpose),
                        vendorConsents: convertIABVendorPurposeArrayToObject(distinctArray(oneTrustIABConsent.vendors))
                    };

                    callback(venderConsentData, true);
                } else {
                    callback({}, false);
                }
            } else {
                callback({}, false);
            }
        }
    }

    this.getConsentDataRequest = function (callback) {
        if (callback) {
            var domainJson = optanonData();
            if (domainJson.IsIABEnabled) {
                var consentData = {
                    gdprApplies: oneTrustIABgdprAppliesGlobally,
                    hasGlobalScope: domainJson.IsIabThirdPartyCookieEnabled,
                    consentData: IABCookieValue ? IABCookieValue : getIABConsentData()
                };

                callback(consentData, true);
            } else {
                callback({}, false);
            }
        }
    }

    function getIABConsentData(allowedPurposes, allowedVendors) {
        var domainJson = optanonData();
        if (domainJson.IsIABEnabled) {
            var IABJsonData = IABData();
            if (IABJsonData) {
                var consentData = new consentString.ConsentString();
                consentData.setGlobalVendorList(oneTrustIABConsent.vendorList ? oneTrustIABConsent.vendorList : {});
                consentData.setCmpId(parseInt(IABJsonData.cmpId));
                consentData.setCmpVersion(parseInt(IABJsonData.cmpVersion));
                consentData.setConsentLanguage(IABJsonData.consentLanguage.toLocaleLowerCase());
                consentData.setConsentScreen(parseInt(IABJsonData.consentScreen));
                consentData.setPurposesAllowed(allowedPurposes ? allowedPurposes : getActiveIdArray(oneTrustIABConsent.purpose));
                consentData.setVendorsAllowed(allowedVendors ? allowedVendors : getActiveIdArray(distinctArray(oneTrustIABConsent.vendors)));
                return consentData.getConsentString();
            }
        } else {
            return null;
        }

    }

    function initializeIABData() {
        var IABCookie = getCookie(oneTrustIABCookieName);
        if (IABCookie) {
            var consentData = new consentString.ConsentString(IABCookie);
            var vendors = consentData.getVendorsAllowed();
            if (consentData && vendors) {
                for (var index = 0; index < vendors.length; index++) {
                    oneTrustIABConsent.vendors.push(vendors[index].toString() + ":true");
                }
            }
        }
        else {
            setIABVendor();
        }
    }

    function assignIABGlobalScope(displayPopup){
        if (displayPopup == true || displayPopup == 'true') {
            oneTrustIABgdprAppliesGlobally = true;
        } else {
            oneTrustIABgdprAppliesGlobally = false;
        }
    }

    //BEHAVIOUR_END

    //BEHAVIOUR(BannerPushesDown == true)
    function checkBrowserSupportPushPageDown() {
        if(checkIsBrowserIE11OrBelow()) {
            //removed this logic as it is navigaating to all tags which create performance issue 
            //return !checkPositionFixed(document.body.children);
            return false;
        }
        return true;
    }

    function checkBrowserSupportPushPageUp() {
        if(checkIsBrowserIE11OrBelow()) {
            return !isWebsiteContainFixedHeader;
        }
        return true;
    }

    function checkIsBrowserIE11OrBelow() {
      var ua = window.navigator.userAgent;
      return (ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0)
    }

    function checkPositionFixed(tags) {
        var i;
        for (i = 0; i < tags.length; i++) {
            var currentElement = tags[i];
            if($Opt(currentElement).css('position') == 'fixed')
            {
                if(tags[i].className.indexOf('optanon') == -1 &&
                tags[i].id.indexOf('optanon') == -1) {
                    isWebsiteContainFixedHeader = true;
                    break;
                }
            } else {
                var childElements = currentElement.getElementsByTagName("*");
                if(childElements.length > 0) {
                    checkPositionFixed(childElements);
                }
            }
        }
        return isWebsiteContainFixedHeader;
    }
    //BEHAVIOUR_END

    function isCookiePolicyPage(bannerText) {
        var isMatching = false;
        var currentURL = removeURLPrefixes(window.location.href);
        var el = $Opt('<div></div>');
        el.html(bannerText);
        var hrefElements = $Opt('a', el)
        var i;
        for (i = 0; i < hrefElements.length; i++) {
            if(removeURLPrefixes(hrefElements[i].href) == currentURL)
            {
                isMatching = true;
                break;
            }
        }
        return isMatching;
    }

    function removeURLPrefixes(url) {
        return url.toLowerCase().replace(/(^\w+:|^)\/\//, '').replace('www.','');
    }

    function initObjectAssignPolyfill() {
        if (typeof Object.assign != 'function') {
            // Must be writable: true, enumerable: false, configurable: true
            Object.defineProperty(Object, "assign", {
                value: function assign(target, varArgs) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                        }
                    }
                    }
                }
                return to;
                },
                writable: true,
                configurable: true
            });
        }
    }

    function initArrayFillPolyfill () {
        if (!Array.prototype.fill) {
            Object.defineProperty(Array.prototype, 'fill', {
              value: function(value) {

                // Steps 1-2.
                if (this == null) {
                  throw new TypeError('this is null or not defined');
                }

                var O = Object(this);

                // Steps 3-5.
                var len = O.length >>> 0;

                // Steps 6-7.
                var start = arguments[1];
                var relativeStart = start >> 0;

                // Step 8.
                var k = relativeStart < 0 ?
                  Math.max(len + relativeStart, 0) :
                  Math.min(relativeStart, len);

                // Steps 9-10.
                var end = arguments[2];
                var relativeEnd = end === undefined ?
                  len : end >> 0;

                // Step 11.
                var finalVal = relativeEnd < 0 ?
                  Math.max(len + relativeEnd, 0) :
                  Math.min(relativeEnd, len);

                // Step 12.
                while (k < finalVal) {
                  O[k] = value;
                  k++;
                }

                // Step 13.
                return O;
              }
            });
        }
    }

    function setBannerTabIndex() {
        var bannerTabIndex = 0;
        // policy link
        if ($Opt('.banner-content a').length) {
            $Opt('.banner-content a').each(function(index, element) {
               $Opt(element).addClass('banner-policy-link');
               $Opt(element).attr('tabindex', ++bannerTabIndex);
               $Opt(element).attr('aria-label',$Opt(element).text());
              });
        }
        if(checkIscenterTile()){
            if ($Opt(".accept-cookies-button").length) {
                $Opt(".accept-cookies-button").attr('tabindex', ++bannerTabIndex);
            }
            if ($Opt(".cookie-settings-button").length) {
                $Opt(".cookie-settings-button").attr('tabindex', ++bannerTabIndex);
            }
        } else  {
            if ($Opt(".cookie-settings-button").length) {
                $Opt(".cookie-settings-button").attr('tabindex', ++bannerTabIndex);
            }
            if ($Opt(".accept-cookies-button").length) {
                $Opt(".accept-cookies-button").attr('tabindex', ++bannerTabIndex);
            }
        }
        if ($Opt(".banner-close-button").length) {
            $Opt(".banner-close-button").attr('tabindex', ++bannerTabIndex);
        }
    }

    //BEHAVIOUR(IsIABEnabled == true)
    this.updateConsentFromCookies = function (OnetrustIABCookies) {
        var allowedGroup = [], isExist;
        IAB3rdPartyCookieValue = OnetrustIABCookies;
        if (OnetrustIABCookies && !isInitIABCookieData()) {
            var globalConsentData = new consentString.ConsentString(OnetrustIABCookies);
            if (oneTrustIABConsent && oneTrustIABConsent.purpose) {
                for (var i = 0; i < oneTrustIABConsent.purpose.length; i++) {
                    var purpose = oneTrustIABConsent.purpose[i].split(':');
                    var isExist = indexOf(globalConsentData.allowedPurposeIds, purpose[0]);
                    if (isExist != -1) {
                        oneTrustIABConsent.purpose[i] = purpose[0] + ":true";
                        var group = getGroupByPurposeId(purpose[0])
                        if (group && group.GroupId) {
                            allowedGroup.push(group);
                        }
                    }
                }
                for (var index = 0; index < allowedGroup.length; index++) {
                    var element = allowedGroup[index];
                    isExist = indexOf(optanonHtmlGroupData, (getGroupIdForCookie(element) + ':0'));
                    if (isExist != -1) {
                        optanonHtmlGroupData[index] = getGroupIdForCookie(element) + ':1';
                    }
                }
            }

            if (oneTrustIABConsent && oneTrustIABConsent.vendors) {
                for (var j = 0; j < oneTrustIABConsent.vendors.length; j++) {
                    var vendor = oneTrustIABConsent.vendors[j].split(':');
                    isExist = indexOf(globalConsentData.allowedVendorIds, vendor[0]);
                    if (isExist != -1) {
                        oneTrustIABConsent.vendors[j] = vendor[0] + ":true";
                    }
                }
            }
            
            updateConsentData();
        }            
    }

    function isInitIABCookieData() {
        return IAB3rdPartyCookieValue ==="init" ? true: false;
    }
    
    function getGroupByPurposeId(purposeId) {
        var json = optanonData(), group;
        if (json && json.Groups) {
            for (var i = 0; i < json.Groups.length; i++) {
                group = json.Groups[i];
                if (isTopLevelGroup(group) && group.Purposes && group.Purposes.length > 0) {
                    for (var index = 0; index < group.Purposes.length; index++) {
                        if (group.Purposes[index].purposes.purposeId == purposeId) {
                            return group;
                        }
                    }
                }
            }
        }
       
    }
    
    //BEHAVIOUR_END

    // ONETRUST FUNCTIONS (jQuery Overhaul)
    function OTfadeOut(el, ms) {
        var domEl = document.querySelector(el);
        var fadeEffect = setInterval(function() {
            if (!domEl.style.opacity) {
                domEl.style.opacity = 1;
            }
            if (domEl.style.opacity > 0) {
                domEl.style.opacity -= 0.1;
            } else {
                domEl.style.display="none";
                clearInterval(fadeEffect);
            }
        }, ms);
    }

    function OTajax(options) {
        var type = void 0,
            url = void 0,
            success = void 0,
            error = void 0,
            data = null,
            dataType = void 0,
            contentType = void 0,
            request = new XMLHttpRequest();

        type = options.type;
        url = options.url;
        success = options.success;
        error = options.error;
        data = options.data;
        dataType = options.dataType;
        contentType = options.contentType;

        request.open(type, url, true);
        request.setRequestHeader('Content-Type', contentType);
        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                var response = JSON.parse(this.response);
                success(response);
            } else {
                // We reached our target server, but it returned an error
                error({ message: 'Error Loading Data', statusCode: this.status });
            }
        };
        request.onerror = function (err) {
            // There was a connection error of some sort
            error(err);
        };

        type.toLowerCase() === 'post' || type.toLowerCase() === 'put' ? request.send(data) : request.send();
    }

    this.setGeoLocation = function (response) {
        isInEU = response;
    }

    function getGeoLocation() {
        $.ajax({
          type: 'GET',
          crossDomain: true,
          dataType: 'json',
          url: '[[OptanonIsIpAllowedForCountryUrl]]'
        })
    }

    function injectJquery() {
        var script1 = document.createElement('script');
        var script2 = document.createElement('script');
        script1.type = 'text/javascript';
        script1.src = 'https://code.jquery.com/jquery-3.3.1.min.js';
        script1.integrity = 'sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=';
        script1.crossOrigin = 'anonymous';

        script2.type = 'text/javascript';
        script2.src = 'https://code.jquery.com/jquery-1.11.2.min.js';
        script2.integrity = 'sha256-Ls0pXSlb7AYs7evhd+VLnWsZ/AqEHcXBeMZUycz/CcA=';
        script2.crossOrigin = 'anonymous';

        if(useLatestJquey){
            document.getElementsByTagName('head')[0].appendChild(script1);
            script1.onload = script1.onreadystatechange = function () {
                if(!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
                    if(!optanonPreview) {
                        getGeoLocation();
                    }
                    injectConsentNotice();
                }
            };
        } else {
            document.getElementsByTagName('head')[0].appendChild(script2);
            script2.onload = script2.onreadystatechange = function () {
                if(!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
                    if(!optanonPreview) {
                        getGeoLocation();
                    }
                    injectConsentNotice();
                }
            };
        }
    }

}).call(Optanon);

if(typeof window.jsonFeed !== 'function') {
    var jsonFeed = function (options) {
        Optanon.setGeoLocation(options.displayPopup)
    }
}

Optanon.Init();
//BEHAVIOUR(IsIABEnabled == true)
window.__cmp.proccessQueue();
//BEHAVIOUR_END
