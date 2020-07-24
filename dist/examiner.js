(function(){isLongTaskApiSupported(self)&&detectLongTasks(self);
function detectLongTasks(a){var e=new a.PerformanceObserver(function(a){for(var c=a.getEntries(),b=0;b<c.length;b++)if("longtask"==c[b].entryType&&"cross-origin-descendant"==c[b].name){var d=c[b].attribution[0];if(d&&d.containerSrc){var e=c[b].duration,f=d.containerSrc;if(d.containerName){var g=d.containerName.match(/"type":"([^"]*)"/);1<g.length&&(f='<amp-ad type="'+g[1]+'">')}console.log("%c LONG TASK %c "+e+"ms from "+f,"background: red; color: white","background: #fff; color: #000")}}});e.observe({entryTypes:["longtask"]})}
function isLongTaskApiSupported(a){return!!a.PerformanceObserver&&!!a.TaskAttributionTiming&&"containerName"in a.TaskAttributionTiming.prototype};})();

//# sourceMappingURL=examiner.js.map
