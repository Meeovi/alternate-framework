var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/@algolia/events/events.js
var require_events = __commonJS({
  "node_modules/@algolia/events/events.js"(exports, module) {
    function EventEmitter() {
      this._events = this._events || {};
      this._maxListeners = this._maxListeners || void 0;
    }
    module.exports = EventEmitter;
    EventEmitter.prototype._events = void 0;
    EventEmitter.prototype._maxListeners = void 0;
    EventEmitter.defaultMaxListeners = 10;
    EventEmitter.prototype.setMaxListeners = function(n) {
      if (!isNumber(n) || n < 0 || isNaN(n))
        throw TypeError("n must be a positive number");
      this._maxListeners = n;
      return this;
    };
    EventEmitter.prototype.emit = function(type) {
      var er, handler, len, args, i, listeners;
      if (!this._events)
        this._events = {};
      if (type === "error") {
        if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
          er = arguments[1];
          if (er instanceof Error) {
            throw er;
          } else {
            var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
            err.context = er;
            throw err;
          }
        }
      }
      handler = this._events[type];
      if (isUndefined(handler))
        return false;
      if (isFunction(handler)) {
        switch (arguments.length) {
          // fast cases
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            args = Array.prototype.slice.call(arguments, 1);
            handler.apply(this, args);
        }
      } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++)
          listeners[i].apply(this, args);
      }
      return true;
    };
    EventEmitter.prototype.addListener = function(type, listener) {
      var m;
      if (!isFunction(listener))
        throw TypeError("listener must be a function");
      if (!this._events)
        this._events = {};
      if (this._events.newListener)
        this.emit(
          "newListener",
          type,
          isFunction(listener.listener) ? listener.listener : listener
        );
      if (!this._events[type])
        this._events[type] = listener;
      else if (isObject(this._events[type]))
        this._events[type].push(listener);
      else
        this._events[type] = [this._events[type], listener];
      if (isObject(this._events[type]) && !this._events[type].warned) {
        if (!isUndefined(this._maxListeners)) {
          m = this._maxListeners;
        } else {
          m = EventEmitter.defaultMaxListeners;
        }
        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error(
            "(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",
            this._events[type].length
          );
          if (typeof console.trace === "function") {
            console.trace();
          }
        }
      }
      return this;
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.once = function(type, listener) {
      if (!isFunction(listener))
        throw TypeError("listener must be a function");
      var fired = false;
      function g() {
        this.removeListener(type, g);
        if (!fired) {
          fired = true;
          listener.apply(this, arguments);
        }
      }
      g.listener = listener;
      this.on(type, g);
      return this;
    };
    EventEmitter.prototype.removeListener = function(type, listener) {
      var list, position, length, i;
      if (!isFunction(listener))
        throw TypeError("listener must be a function");
      if (!this._events || !this._events[type])
        return this;
      list = this._events[type];
      length = list.length;
      position = -1;
      if (list === listener || isFunction(list.listener) && list.listener === listener) {
        delete this._events[type];
        if (this._events.removeListener)
          this.emit("removeListener", type, listener);
      } else if (isObject(list)) {
        for (i = length; i-- > 0; ) {
          if (list[i] === listener || list[i].listener && list[i].listener === listener) {
            position = i;
            break;
          }
        }
        if (position < 0)
          return this;
        if (list.length === 1) {
          list.length = 0;
          delete this._events[type];
        } else {
          list.splice(position, 1);
        }
        if (this._events.removeListener)
          this.emit("removeListener", type, listener);
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function(type) {
      var key, listeners;
      if (!this._events)
        return this;
      if (!this._events.removeListener) {
        if (arguments.length === 0)
          this._events = {};
        else if (this._events[type])
          delete this._events[type];
        return this;
      }
      if (arguments.length === 0) {
        for (key in this._events) {
          if (key === "removeListener") continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = {};
        return this;
      }
      listeners = this._events[type];
      if (isFunction(listeners)) {
        this.removeListener(type, listeners);
      } else if (listeners) {
        while (listeners.length)
          this.removeListener(type, listeners[listeners.length - 1]);
      }
      delete this._events[type];
      return this;
    };
    EventEmitter.prototype.listeners = function(type) {
      var ret;
      if (!this._events || !this._events[type])
        ret = [];
      else if (isFunction(this._events[type]))
        ret = [this._events[type]];
      else
        ret = this._events[type].slice();
      return ret;
    };
    EventEmitter.prototype.listenerCount = function(type) {
      if (this._events) {
        var evlistener = this._events[type];
        if (isFunction(evlistener))
          return 1;
        else if (evlistener)
          return evlistener.length;
      }
      return 0;
    };
    EventEmitter.listenerCount = function(emitter, type) {
      return emitter.listenerCount(type);
    };
    function isFunction(arg) {
      return typeof arg === "function";
    }
    function isNumber(arg) {
      return typeof arg === "number";
    }
    function isObject(arg) {
      return typeof arg === "object" && arg !== null;
    }
    function isUndefined(arg) {
      return arg === void 0;
    }
  }
});

// node_modules/algoliasearch-helper/src/functions/inherits.js
var require_inherits = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/inherits.js"(exports, module) {
    "use strict";
    function inherits(ctor, superCtor) {
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
    module.exports = inherits;
  }
});

// node_modules/algoliasearch-helper/src/DerivedHelper/index.js
var require_DerivedHelper = __commonJS({
  "node_modules/algoliasearch-helper/src/DerivedHelper/index.js"(exports, module) {
    "use strict";
    var EventEmitter = require_events();
    var inherits = require_inherits();
    function DerivedHelper(mainHelper, fn, recommendFn) {
      this.main = mainHelper;
      this.fn = fn;
      this.recommendFn = recommendFn;
      this.lastResults = null;
      this.lastRecommendResults = null;
    }
    inherits(DerivedHelper, EventEmitter);
    DerivedHelper.prototype.detach = function() {
      this.removeAllListeners();
      this.main.detachDerivedHelper(this);
    };
    DerivedHelper.prototype.getModifiedState = function(parameters) {
      return this.fn(parameters);
    };
    DerivedHelper.prototype.getModifiedRecommendState = function(parameters) {
      return this.recommendFn(parameters);
    };
    module.exports = DerivedHelper;
  }
});

// node_modules/algoliasearch-helper/src/functions/escapeFacetValue.js
var require_escapeFacetValue = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/escapeFacetValue.js"(exports, module) {
    "use strict";
    function escapeFacetValue(value) {
      if (typeof value !== "string") return value;
      return String(value).replace(/^-/, "\\-");
    }
    function unescapeFacetValue(value) {
      if (typeof value !== "string") return value;
      return value.replace(/^\\-/, "-");
    }
    module.exports = {
      escapeFacetValue,
      unescapeFacetValue
    };
  }
});

// node_modules/algoliasearch-helper/src/functions/merge.js
var require_merge = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/merge.js"(exports, module) {
    "use strict";
    function clone(value) {
      if (typeof value === "object" && value !== null) {
        return _merge(Array.isArray(value) ? [] : {}, value);
      }
      return value;
    }
    function isObjectOrArrayOrFunction(value) {
      return typeof value === "function" || Array.isArray(value) || Object.prototype.toString.call(value) === "[object Object]";
    }
    function _merge(target, source) {
      if (target === source) {
        return target;
      }
      for (var key in source) {
        if (!Object.prototype.hasOwnProperty.call(source, key) || key === "__proto__" || key === "constructor") {
          continue;
        }
        var sourceVal = source[key];
        var targetVal = target[key];
        if (typeof targetVal !== "undefined" && typeof sourceVal === "undefined") {
          continue;
        }
        if (isObjectOrArrayOrFunction(targetVal) && isObjectOrArrayOrFunction(sourceVal)) {
          target[key] = _merge(targetVal, sourceVal);
        } else {
          target[key] = clone(sourceVal);
        }
      }
      return target;
    }
    function merge(target) {
      if (!isObjectOrArrayOrFunction(target)) {
        target = {};
      }
      for (var i = 1, l = arguments.length; i < l; i++) {
        var source = arguments[i];
        if (isObjectOrArrayOrFunction(source)) {
          _merge(target, source);
        }
      }
      return target;
    }
    module.exports = merge;
  }
});

// node_modules/algoliasearch-helper/src/functions/objectHasKeys.js
var require_objectHasKeys = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/objectHasKeys.js"(exports, module) {
    "use strict";
    function objectHasKeys(obj) {
      return obj && Object.keys(obj).length > 0;
    }
    module.exports = objectHasKeys;
  }
});

// node_modules/algoliasearch-helper/src/functions/omit.js
var require_omit = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/omit.js"(exports, module) {
    "use strict";
    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source === null) return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key;
      var i;
      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }
      return target;
    }
    module.exports = _objectWithoutPropertiesLoose;
  }
});

// node_modules/algoliasearch-helper/src/RecommendParameters/index.js
var require_RecommendParameters = __commonJS({
  "node_modules/algoliasearch-helper/src/RecommendParameters/index.js"(exports, module) {
    "use strict";
    function RecommendParameters(opts) {
      opts = opts || {};
      this.params = opts.params || [];
    }
    RecommendParameters.prototype = {
      constructor: RecommendParameters,
      addParams: function(params) {
        var newParams = this.params.slice();
        newParams.push(params);
        return new RecommendParameters({ params: newParams });
      },
      removeParams: function(id) {
        return new RecommendParameters({
          params: this.params.filter(function(param) {
            return param.$$id !== id;
          })
        });
      },
      addFrequentlyBoughtTogether: function(params) {
        return this.addParams(
          Object.assign({}, params, { model: "bought-together" })
        );
      },
      addRelatedProducts: function(params) {
        return this.addParams(
          Object.assign({}, params, { model: "related-products" })
        );
      },
      addTrendingItems: function(params) {
        return this.addParams(
          Object.assign({}, params, { model: "trending-items" })
        );
      },
      addTrendingFacets: function(params) {
        return this.addParams(
          Object.assign({}, params, { model: "trending-facets" })
        );
      },
      addLookingSimilar: function(params) {
        return this.addParams(
          Object.assign({}, params, { model: "looking-similar" })
        );
      },
      _buildQueries: function(indexName, cache) {
        return this.params.filter(function(params) {
          return cache[params.$$id] === void 0;
        }).map(function(params) {
          var query = Object.assign({}, params, {
            indexName,
            // @TODO: remove this if it ever gets handled by the API
            threshold: params.threshold || 0
          });
          delete query.$$id;
          return query;
        });
      }
    };
    module.exports = RecommendParameters;
  }
});

// node_modules/algoliasearch-helper/src/RecommendResults/index.js
var require_RecommendResults = __commonJS({
  "node_modules/algoliasearch-helper/src/RecommendResults/index.js"(exports, module) {
    "use strict";
    function RecommendResults(state, results) {
      this._state = state;
      this._rawResults = {};
      var self = this;
      state.params.forEach(function(param) {
        var id = param.$$id;
        self[id] = results[id];
        self._rawResults[id] = results[id];
      });
    }
    RecommendResults.prototype = {
      constructor: RecommendResults
    };
    module.exports = RecommendResults;
  }
});

// node_modules/algoliasearch-helper/src/requestBuilder.js
var require_requestBuilder = __commonJS({
  "node_modules/algoliasearch-helper/src/requestBuilder.js"(exports, module) {
    "use strict";
    var merge = require_merge();
    function sortObject(obj) {
      return Object.keys(obj).sort().reduce(function(acc, curr) {
        acc[curr] = obj[curr];
        return acc;
      }, {});
    }
    var requestBuilder = {
      /**
       * Get all the queries to send to the client, those queries can used directly
       * with the Algolia client.
       * @private
       * @param  {string} index The name of the index
       * @param  {SearchParameters} state The state from which to get the queries
       * @return {object[]} The queries
       */
      _getQueries: function getQueries(index, state) {
        var queries = [];
        queries.push({
          indexName: index,
          params: requestBuilder._getHitsSearchParams(state)
        });
        state.getRefinedDisjunctiveFacets().forEach(function(refinedFacet) {
          queries.push({
            indexName: index,
            params: requestBuilder._getDisjunctiveFacetSearchParams(
              state,
              refinedFacet
            )
          });
        });
        state.getRefinedHierarchicalFacets().forEach(function(refinedFacet) {
          var hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);
          var currentRefinement = state.getHierarchicalRefinement(refinedFacet);
          var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
          if (currentRefinement.length > 0 && currentRefinement[0].split(separator).length > 1) {
            var filtersMap = currentRefinement[0].split(separator).slice(0, -1).reduce(function createFiltersMap(map, segment, level) {
              return map.concat({
                attribute: hierarchicalFacet.attributes[level],
                value: level === 0 ? segment : [map[map.length - 1].value, segment].join(separator)
              });
            }, []);
            filtersMap.forEach(function(filter, level) {
              var params = requestBuilder._getDisjunctiveFacetSearchParams(
                state,
                filter.attribute,
                level === 0
              );
              function hasHierarchicalFacetFilter(value) {
                return hierarchicalFacet.attributes.some(function(attribute) {
                  return attribute === value.split(":")[0];
                });
              }
              var filteredFacetFilters = (params.facetFilters || []).reduce(
                function(acc, facetFilter) {
                  if (Array.isArray(facetFilter)) {
                    var filtered = facetFilter.filter(function(filterValue) {
                      return !hasHierarchicalFacetFilter(filterValue);
                    });
                    if (filtered.length > 0) {
                      acc.push(filtered);
                    }
                  }
                  if (typeof facetFilter === "string" && !hasHierarchicalFacetFilter(facetFilter)) {
                    acc.push(facetFilter);
                  }
                  return acc;
                },
                []
              );
              var parent = filtersMap[level - 1];
              if (level > 0) {
                params.facetFilters = filteredFacetFilters.concat(
                  parent.attribute + ":" + parent.value
                );
              } else if (filteredFacetFilters.length > 0) {
                params.facetFilters = filteredFacetFilters;
              } else {
                delete params.facetFilters;
              }
              queries.push({ indexName: index, params });
            });
          }
        });
        return queries;
      },
      /**
       * Get all the queries to send to the client, those queries can used directly
       * with the Algolia client.
       * @private
       * @param  {SearchParameters} state The state from which to get the queries
       * @return {object[]} The queries
       */
      _getCompositionQueries: function getQueries(state) {
        return [
          {
            compositionID: state.index,
            requestBody: {
              params: requestBuilder._getCompositionHitsSearchParams(state)
            }
          }
        ];
      },
      /**
       * Build search parameters used to fetch hits
       * @private
       * @param  {SearchParameters} state The state from which to get the queries
       * @return {object.<string, any>} The search parameters for hits
       */
      _getHitsSearchParams: function(state) {
        var facets = state.facets.concat(state.disjunctiveFacets).concat(requestBuilder._getHitsHierarchicalFacetsAttributes(state)).sort();
        var facetFilters = requestBuilder._getFacetFilters(state);
        var numericFilters = requestBuilder._getNumericFilters(state);
        var tagFilters = requestBuilder._getTagFilters(state);
        var additionalParams = {};
        if (facets.length > 0) {
          additionalParams.facets = facets.indexOf("*") > -1 ? ["*"] : facets;
        }
        if (tagFilters.length > 0) {
          additionalParams.tagFilters = tagFilters;
        }
        if (facetFilters.length > 0) {
          additionalParams.facetFilters = facetFilters;
        }
        if (numericFilters.length > 0) {
          additionalParams.numericFilters = numericFilters;
        }
        return sortObject(merge({}, state.getQueryParams(), additionalParams));
      },
      /**
       * Build search parameters used to fetch hits
       * @private
       * @param  {SearchParameters} state The state from which to get the queries
       * @return {object.<string, any>} The search parameters for hits
       */
      _getCompositionHitsSearchParams: function(state) {
        var facets = state.facets.concat(
          state.disjunctiveFacets.map(function(value) {
            if (state.disjunctiveFacetsRefinements && state.disjunctiveFacetsRefinements[value] && state.disjunctiveFacetsRefinements[value].length > 0) {
              return "disjunctive(" + value + ")";
            }
            return value;
          })
        ).concat(requestBuilder._getHitsHierarchicalFacetsAttributes(state)).sort();
        var facetFilters = requestBuilder._getFacetFilters(state);
        var numericFilters = requestBuilder._getNumericFilters(state);
        var tagFilters = requestBuilder._getTagFilters(state);
        var additionalParams = {};
        if (facets.length > 0) {
          additionalParams.facets = facets.indexOf("*") > -1 ? ["*"] : facets;
        }
        if (tagFilters.length > 0) {
          additionalParams.tagFilters = tagFilters;
        }
        if (facetFilters.length > 0) {
          additionalParams.facetFilters = facetFilters;
        }
        if (numericFilters.length > 0) {
          additionalParams.numericFilters = numericFilters;
        }
        var params = state.getQueryParams();
        delete params.highlightPreTag;
        delete params.highlightPostTag;
        delete params.index;
        return sortObject(merge({}, params, additionalParams));
      },
      /**
       * Build search parameters used to fetch a disjunctive facet
       * @private
       * @param  {SearchParameters} state The state from which to get the queries
       * @param  {string} facet the associated facet name
       * @param  {boolean} hierarchicalRootLevel ?? FIXME
       * @return {object} The search parameters for a disjunctive facet
       */
      _getDisjunctiveFacetSearchParams: function(state, facet, hierarchicalRootLevel) {
        var facetFilters = requestBuilder._getFacetFilters(
          state,
          facet,
          hierarchicalRootLevel
        );
        var numericFilters = requestBuilder._getNumericFilters(state, facet);
        var tagFilters = requestBuilder._getTagFilters(state);
        var additionalParams = {
          hitsPerPage: 0,
          page: 0,
          analytics: false,
          clickAnalytics: false
        };
        if (tagFilters.length > 0) {
          additionalParams.tagFilters = tagFilters;
        }
        var hierarchicalFacet = state.getHierarchicalFacetByName(facet);
        if (hierarchicalFacet) {
          additionalParams.facets = requestBuilder._getDisjunctiveHierarchicalFacetAttribute(
            state,
            hierarchicalFacet,
            hierarchicalRootLevel
          );
        } else {
          additionalParams.facets = facet;
        }
        if (numericFilters.length > 0) {
          additionalParams.numericFilters = numericFilters;
        }
        if (facetFilters.length > 0) {
          additionalParams.facetFilters = facetFilters;
        }
        return sortObject(merge({}, state.getQueryParams(), additionalParams));
      },
      /**
       * Return the numeric filters in an algolia request fashion
       * @private
       * @param {SearchParameters} state the state from which to get the filters
       * @param {string} [facetName] the name of the attribute for which the filters should be excluded
       * @return {string[]} the numeric filters in the algolia format
       */
      _getNumericFilters: function(state, facetName) {
        if (state.numericFilters) {
          return state.numericFilters;
        }
        var numericFilters = [];
        Object.keys(state.numericRefinements).forEach(function(attribute) {
          var operators = state.numericRefinements[attribute] || {};
          Object.keys(operators).forEach(function(operator) {
            var values = operators[operator] || [];
            if (facetName !== attribute) {
              values.forEach(function(value) {
                if (Array.isArray(value)) {
                  var vs = value.map(function(v) {
                    return attribute + operator + v;
                  });
                  numericFilters.push(vs);
                } else {
                  numericFilters.push(attribute + operator + value);
                }
              });
            }
          });
        });
        return numericFilters;
      },
      /**
       * Return the tags filters depending on which format is used, either tagFilters or tagRefinements
       * @private
       * @param {SearchParameters} state the state from which to get the filters
       * @return {string} Tag filters in a single string
       */
      _getTagFilters: function(state) {
        if (state.tagFilters) {
          return state.tagFilters;
        }
        return state.tagRefinements.join(",");
      },
      /**
       * Build facetFilters parameter based on current refinements. The array returned
       * contains strings representing the facet filters in the algolia format.
       * @private
       * @param  {SearchParameters} state The state from which to get the queries
       * @param  {string} [facet] if set, the current disjunctive facet
       * @param  {boolean} [hierarchicalRootLevel] ?? FIXME
       * @return {array.<string>} The facet filters in the algolia format
       */
      _getFacetFilters: function(state, facet, hierarchicalRootLevel) {
        var facetFilters = [];
        var facetsRefinements = state.facetsRefinements || {};
        Object.keys(facetsRefinements).sort().forEach(function(facetName) {
          var facetValues = facetsRefinements[facetName] || [];
          facetValues.slice().sort().forEach(function(facetValue) {
            facetFilters.push(facetName + ":" + facetValue);
          });
        });
        var facetsExcludes = state.facetsExcludes || {};
        Object.keys(facetsExcludes).sort().forEach(function(facetName) {
          var facetValues = facetsExcludes[facetName] || [];
          facetValues.sort().forEach(function(facetValue) {
            facetFilters.push(facetName + ":-" + facetValue);
          });
        });
        var disjunctiveFacetsRefinements = state.disjunctiveFacetsRefinements || {};
        Object.keys(disjunctiveFacetsRefinements).sort().forEach(function(facetName) {
          var facetValues = disjunctiveFacetsRefinements[facetName] || [];
          if (facetName === facet || !facetValues || facetValues.length === 0) {
            return;
          }
          var orFilters = [];
          facetValues.slice().sort().forEach(function(facetValue) {
            orFilters.push(facetName + ":" + facetValue);
          });
          facetFilters.push(orFilters);
        });
        var hierarchicalFacetsRefinements = state.hierarchicalFacetsRefinements || {};
        Object.keys(hierarchicalFacetsRefinements).sort().forEach(function(facetName) {
          var facetValues = hierarchicalFacetsRefinements[facetName] || [];
          var facetValue = facetValues[0];
          if (facetValue === void 0) {
            return;
          }
          var hierarchicalFacet = state.getHierarchicalFacetByName(facetName);
          var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
          var rootPath = state._getHierarchicalRootPath(hierarchicalFacet);
          var attributeToRefine;
          var attributesIndex;
          if (facet === facetName) {
            if (facetValue.indexOf(separator) === -1 || !rootPath && hierarchicalRootLevel === true || rootPath && rootPath.split(separator).length === facetValue.split(separator).length) {
              return;
            }
            if (!rootPath) {
              attributesIndex = facetValue.split(separator).length - 2;
              facetValue = facetValue.slice(0, facetValue.lastIndexOf(separator));
            } else {
              attributesIndex = rootPath.split(separator).length - 1;
              facetValue = rootPath;
            }
            attributeToRefine = hierarchicalFacet.attributes[attributesIndex];
          } else {
            attributesIndex = facetValue.split(separator).length - 1;
            attributeToRefine = hierarchicalFacet.attributes[attributesIndex];
          }
          if (attributeToRefine) {
            facetFilters.push([attributeToRefine + ":" + facetValue]);
          }
        });
        return facetFilters;
      },
      _getHitsHierarchicalFacetsAttributes: function(state) {
        var out = [];
        return state.hierarchicalFacets.reduce(
          // ask for as much levels as there's hierarchical refinements
          function getHitsAttributesForHierarchicalFacet(allAttributes, hierarchicalFacet) {
            var hierarchicalRefinement = state.getHierarchicalRefinement(
              hierarchicalFacet.name
            )[0];
            if (!hierarchicalRefinement) {
              allAttributes.push(hierarchicalFacet.attributes[0]);
              return allAttributes;
            }
            var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
            var level = hierarchicalRefinement.split(separator).length;
            var newAttributes = hierarchicalFacet.attributes.slice(0, level + 1);
            return allAttributes.concat(newAttributes);
          },
          out
        );
      },
      _getDisjunctiveHierarchicalFacetAttribute: function(state, hierarchicalFacet, rootLevel) {
        var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
        if (rootLevel === true) {
          var rootPath = state._getHierarchicalRootPath(hierarchicalFacet);
          var attributeIndex = 0;
          if (rootPath) {
            attributeIndex = rootPath.split(separator).length;
          }
          return [hierarchicalFacet.attributes[attributeIndex]];
        }
        var hierarchicalRefinement = state.getHierarchicalRefinement(hierarchicalFacet.name)[0] || "";
        var parentLevel = hierarchicalRefinement.split(separator).length - 1;
        return hierarchicalFacet.attributes.slice(0, parentLevel + 1);
      },
      getSearchForFacetQuery: function(facetName, query, maxFacetHits, state) {
        var stateForSearchForFacetValues = state.isDisjunctiveFacet(facetName) ? state.clearRefinements(facetName) : state;
        var searchForFacetSearchParameters = {
          facetQuery: query,
          facetName
        };
        if (typeof maxFacetHits === "number") {
          searchForFacetSearchParameters.maxFacetHits = maxFacetHits;
        }
        return sortObject(
          merge(
            {},
            requestBuilder._getHitsSearchParams(stateForSearchForFacetValues),
            searchForFacetSearchParameters
          )
        );
      }
    };
    module.exports = requestBuilder;
  }
});

// node_modules/algoliasearch-helper/src/functions/defaultsPure.js
var require_defaultsPure = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/defaultsPure.js"(exports, module) {
    "use strict";
    module.exports = function defaultsPure() {
      var sources = Array.prototype.slice.call(arguments);
      return sources.reduceRight(function(acc, source) {
        Object.keys(Object(source)).forEach(function(key) {
          if (source[key] === void 0) {
            return;
          }
          if (acc[key] !== void 0) {
            delete acc[key];
          }
          acc[key] = source[key];
        });
        return acc;
      }, {});
    };
  }
});

// node_modules/algoliasearch-helper/src/functions/find.js
var require_find = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/find.js"(exports, module) {
    "use strict";
    module.exports = function find(array, comparator) {
      if (!Array.isArray(array)) {
        return void 0;
      }
      for (var i = 0; i < array.length; i++) {
        if (comparator(array[i])) {
          return array[i];
        }
      }
      return void 0;
    };
  }
});

// node_modules/algoliasearch-helper/src/functions/intersection.js
var require_intersection = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/intersection.js"(exports, module) {
    "use strict";
    function intersection(arr1, arr2) {
      return arr1.filter(function(value, index) {
        return arr2.indexOf(value) > -1 && arr1.indexOf(value) === index;
      });
    }
    module.exports = intersection;
  }
});

// node_modules/algoliasearch-helper/src/functions/valToNumber.js
var require_valToNumber = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/valToNumber.js"(exports, module) {
    "use strict";
    function valToNumber(v) {
      if (typeof v === "number") {
        return v;
      } else if (typeof v === "string") {
        return parseFloat(v);
      } else if (Array.isArray(v)) {
        return v.map(valToNumber);
      }
      throw new Error(
        "The value should be a number, a parsable string or an array of those."
      );
    }
    module.exports = valToNumber;
  }
});

// node_modules/algoliasearch-helper/src/utils/isValidUserToken.js
var require_isValidUserToken = __commonJS({
  "node_modules/algoliasearch-helper/src/utils/isValidUserToken.js"(exports, module) {
    "use strict";
    module.exports = function isValidUserToken(userToken) {
      if (userToken === null) {
        return false;
      }
      return /^[a-zA-Z0-9_-]{1,64}$/.test(userToken);
    };
  }
});

// node_modules/algoliasearch-helper/src/SearchParameters/RefinementList.js
var require_RefinementList = __commonJS({
  "node_modules/algoliasearch-helper/src/SearchParameters/RefinementList.js"(exports, module) {
    "use strict";
    var defaultsPure = require_defaultsPure();
    var objectHasKeys = require_objectHasKeys();
    var omit = require_omit();
    var lib = {
      /**
       * Adds a refinement to a RefinementList
       * @param {RefinementList} refinementList the initial list
       * @param {string} attribute the attribute to refine
       * @param {string} value the value of the refinement, if the value is not a string it will be converted
       * @return {RefinementList} a new and updated refinement list
       */
      addRefinement: function addRefinement(refinementList, attribute, value) {
        if (lib.isRefined(refinementList, attribute, value)) {
          return refinementList;
        }
        var valueAsString = "" + value;
        var facetRefinement = !refinementList[attribute] ? [valueAsString] : refinementList[attribute].concat(valueAsString);
        var mod = {};
        mod[attribute] = facetRefinement;
        return defaultsPure(mod, refinementList);
      },
      /**
       * Removes refinement(s) for an attribute:
       *  - if the value is specified removes the refinement for the value on the attribute
       *  - if no value is specified removes all the refinements for this attribute
       * @param {RefinementList} refinementList the initial list
       * @param {string} attribute the attribute to refine
       * @param {string} [value] the value of the refinement
       * @return {RefinementList} a new and updated refinement lst
       */
      removeRefinement: function removeRefinement(refinementList, attribute, value) {
        if (value === void 0) {
          return lib.clearRefinement(refinementList, function(v, f) {
            return attribute === f;
          });
        }
        var valueAsString = "" + value;
        return lib.clearRefinement(refinementList, function(v, f) {
          return attribute === f && valueAsString === v;
        });
      },
      /**
       * Toggles the refinement value for an attribute.
       * @param {RefinementList} refinementList the initial list
       * @param {string} attribute the attribute to refine
       * @param {string} value the value of the refinement
       * @return {RefinementList} a new and updated list
       */
      toggleRefinement: function toggleRefinement(refinementList, attribute, value) {
        if (value === void 0)
          throw new Error("toggleRefinement should be used with a value");
        if (lib.isRefined(refinementList, attribute, value)) {
          return lib.removeRefinement(refinementList, attribute, value);
        }
        return lib.addRefinement(refinementList, attribute, value);
      },
      /**
       * Clear all or parts of a RefinementList. Depending on the arguments, three
       * kinds of behavior can happen:
       *  - if no attribute is provided: clears the whole list
       *  - if an attribute is provided as a string: clears the list for the specific attribute
       *  - if an attribute is provided as a function: discards the elements for which the function returns true
       * @param {RefinementList} refinementList the initial list
       * @param {string} [attribute] the attribute or function to discard
       * @param {string} [refinementType] optional parameter to give more context to the attribute function
       * @return {RefinementList} a new and updated refinement list
       */
      clearRefinement: function clearRefinement(refinementList, attribute, refinementType) {
        if (attribute === void 0) {
          if (!objectHasKeys(refinementList)) {
            return refinementList;
          }
          return {};
        } else if (typeof attribute === "string") {
          return omit(refinementList, [attribute]);
        } else if (typeof attribute === "function") {
          var hasChanged = false;
          var newRefinementList = Object.keys(refinementList).reduce(function(memo, key) {
            var values = refinementList[key] || [];
            var facetList = values.filter(function(value) {
              return !attribute(value, key, refinementType);
            });
            if (facetList.length !== values.length) {
              hasChanged = true;
            }
            memo[key] = facetList;
            return memo;
          }, {});
          if (hasChanged) return newRefinementList;
          return refinementList;
        }
        return void 0;
      },
      /**
       * Test if the refinement value is used for the attribute. If no refinement value
       * is provided, test if the refinementList contains any refinement for the
       * given attribute.
       * @param {RefinementList} refinementList the list of refinement
       * @param {string} attribute name of the attribute
       * @param {string} [refinementValue] value of the filter/refinement
       * @return {boolean} true if the attribute is refined, false otherwise
       */
      isRefined: function isRefined(refinementList, attribute, refinementValue) {
        var containsRefinements = Boolean(refinementList[attribute]) && refinementList[attribute].length > 0;
        if (refinementValue === void 0 || !containsRefinements) {
          return containsRefinements;
        }
        var refinementValueAsString = "" + refinementValue;
        return refinementList[attribute].indexOf(refinementValueAsString) !== -1;
      }
    };
    module.exports = lib;
  }
});

// node_modules/algoliasearch-helper/src/SearchParameters/index.js
var require_SearchParameters = __commonJS({
  "node_modules/algoliasearch-helper/src/SearchParameters/index.js"(exports, module) {
    "use strict";
    var defaultsPure = require_defaultsPure();
    var find = require_find();
    var intersection = require_intersection();
    var merge = require_merge();
    var objectHasKeys = require_objectHasKeys();
    var omit = require_omit();
    var valToNumber = require_valToNumber();
    var isValidUserToken = require_isValidUserToken();
    var RefinementList = require_RefinementList();
    function isEqualNumericRefinement(a, b) {
      if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length && a.every(function(el, i) {
          return isEqualNumericRefinement(b[i], el);
        });
      }
      return a === b;
    }
    function findArray(array, searchedValue) {
      return find(array, function(currentValue) {
        return isEqualNumericRefinement(currentValue, searchedValue);
      });
    }
    function SearchParameters(newParameters) {
      var params = newParameters ? SearchParameters._parseNumbers(newParameters) : {};
      if (params.userToken !== void 0 && !isValidUserToken(params.userToken)) {
        console.warn(
          "[algoliasearch-helper] The `userToken` parameter is invalid. This can lead to wrong analytics.\n  - Format: [a-zA-Z0-9_-]{1,64}"
        );
      }
      this.facets = params.facets || [];
      this.disjunctiveFacets = params.disjunctiveFacets || [];
      this.hierarchicalFacets = params.hierarchicalFacets || [];
      this.facetsRefinements = params.facetsRefinements || {};
      this.facetsExcludes = params.facetsExcludes || {};
      this.disjunctiveFacetsRefinements = params.disjunctiveFacetsRefinements || {};
      this.numericRefinements = params.numericRefinements || {};
      this.tagRefinements = params.tagRefinements || [];
      this.hierarchicalFacetsRefinements = params.hierarchicalFacetsRefinements || {};
      var self = this;
      Object.keys(params).forEach(function(paramName) {
        var isKeyKnown = SearchParameters.PARAMETERS.indexOf(paramName) !== -1;
        var isValueDefined = params[paramName] !== void 0;
        if (!isKeyKnown && isValueDefined) {
          self[paramName] = params[paramName];
        }
      });
    }
    SearchParameters.PARAMETERS = Object.keys(new SearchParameters());
    function parseFiniteFloat(value) {
      var n = parseFloat(value);
      return isFinite(n) ? n : null;
    }
    SearchParameters._parseNumbers = function(partialState) {
      if (partialState instanceof SearchParameters) return partialState;
      var numbers = {};
      var numberKeys = [
        "aroundPrecision",
        "aroundRadius",
        "getRankingInfo",
        "minWordSizefor2Typos",
        "minWordSizefor1Typo",
        "page",
        "maxValuesPerFacet",
        "distinct",
        "minimumAroundRadius",
        "hitsPerPage",
        "minProximity"
      ];
      numberKeys.forEach(function(k) {
        var value = partialState[k];
        if (typeof value === "string") {
          var parsedValue = parseFloat(value);
          if (isNaN(parsedValue)) {
            numbers[k] = value;
          } else if (!isFinite(parsedValue)) {
            numbers[k] = null;
          } else {
            numbers[k] = parsedValue;
          }
        } else if (typeof value === "number" && !isFinite(value)) {
          numbers[k] = null;
        }
      });
      if (Array.isArray(partialState.insideBoundingBox)) {
        numbers.insideBoundingBox = partialState.insideBoundingBox.map(
          function(geoRect) {
            if (Array.isArray(geoRect)) {
              return geoRect.map(function(value) {
                if (typeof value === "string") {
                  return parseFiniteFloat(value);
                }
                if (typeof value === "number" && !isFinite(value)) {
                  return null;
                }
                return value;
              });
            }
            return geoRect;
          }
        );
      }
      if (partialState.numericRefinements) {
        var numericRefinements = {};
        Object.keys(partialState.numericRefinements).forEach(function(attribute) {
          var operators = partialState.numericRefinements[attribute] || {};
          numericRefinements[attribute] = {};
          Object.keys(operators).forEach(function(operator) {
            var values = operators[operator];
            var parsedValues = values.map(function(v) {
              if (Array.isArray(v)) {
                return v.map(function(vPrime) {
                  if (typeof vPrime === "string") {
                    return parseFiniteFloat(vPrime);
                  }
                  if (typeof vPrime === "number" && !isFinite(vPrime)) {
                    return null;
                  }
                  return vPrime;
                });
              } else if (typeof v === "string") {
                return parseFiniteFloat(v);
              } else if (typeof v === "number" && !isFinite(v)) {
                return null;
              }
              return v;
            });
            numericRefinements[attribute][operator] = parsedValues;
          });
        });
        numbers.numericRefinements = numericRefinements;
      }
      return merge(partialState, numbers);
    };
    SearchParameters.make = function makeSearchParameters(newParameters) {
      var instance = new SearchParameters(newParameters);
      var hierarchicalFacets = newParameters.hierarchicalFacets || [];
      hierarchicalFacets.forEach(function(facet) {
        if (facet.rootPath) {
          var currentRefinement = instance.getHierarchicalRefinement(facet.name);
          if (currentRefinement.length > 0 && currentRefinement[0].indexOf(facet.rootPath) !== 0) {
            instance = instance.clearRefinements(facet.name);
          }
          currentRefinement = instance.getHierarchicalRefinement(facet.name);
          if (currentRefinement.length === 0) {
            instance = instance.toggleHierarchicalFacetRefinement(
              facet.name,
              facet.rootPath
            );
          }
        }
      });
      return instance;
    };
    SearchParameters.validate = function(currentState, parameters) {
      var params = parameters || {};
      if (currentState.tagFilters && params.tagRefinements && params.tagRefinements.length > 0) {
        return new Error(
          "[Tags] Cannot switch from the managed tag API to the advanced API. It is probably an error, if it is really what you want, you should first clear the tags with clearTags method."
        );
      }
      if (currentState.tagRefinements.length > 0 && params.tagFilters) {
        return new Error(
          "[Tags] Cannot switch from the advanced tag API to the managed API. It is probably an error, if it is not, you should first clear the tags with clearTags method."
        );
      }
      if (currentState.numericFilters && params.numericRefinements && objectHasKeys(params.numericRefinements)) {
        return new Error(
          "[Numeric filters] Can't switch from the advanced to the managed API. It is probably an error, if this is really what you want, you have to first clear the numeric filters."
        );
      }
      if (objectHasKeys(currentState.numericRefinements) && params.numericFilters) {
        return new Error(
          "[Numeric filters] Can't switch from the managed API to the advanced. It is probably an error, if this is really what you want, you have to first clear the numeric filters."
        );
      }
      return null;
    };
    SearchParameters.prototype = {
      constructor: SearchParameters,
      /**
       * Remove all refinements (disjunctive + conjunctive + excludes + numeric filters)
       * @method
       * @param {undefined|string|SearchParameters.clearCallback} [attribute] optional string or function
       * - If not given, means to clear all the filters.
       * - If `string`, means to clear all refinements for the `attribute` named filter.
       * - If `function`, means to clear all the refinements that return truthy values.
       * @return {SearchParameters} new instance with filters cleared
       */
      clearRefinements: function clearRefinements(attribute) {
        var patch = {
          numericRefinements: this._clearNumericRefinements(attribute),
          facetsRefinements: RefinementList.clearRefinement(
            this.facetsRefinements,
            attribute,
            "conjunctiveFacet"
          ),
          facetsExcludes: RefinementList.clearRefinement(
            this.facetsExcludes,
            attribute,
            "exclude"
          ),
          disjunctiveFacetsRefinements: RefinementList.clearRefinement(
            this.disjunctiveFacetsRefinements,
            attribute,
            "disjunctiveFacet"
          ),
          hierarchicalFacetsRefinements: RefinementList.clearRefinement(
            this.hierarchicalFacetsRefinements,
            attribute,
            "hierarchicalFacet"
          )
        };
        if (patch.numericRefinements === this.numericRefinements && patch.facetsRefinements === this.facetsRefinements && patch.facetsExcludes === this.facetsExcludes && patch.disjunctiveFacetsRefinements === this.disjunctiveFacetsRefinements && patch.hierarchicalFacetsRefinements === this.hierarchicalFacetsRefinements) {
          return this;
        }
        return this.setQueryParameters(patch);
      },
      /**
       * Remove all the refined tags from the SearchParameters
       * @method
       * @return {SearchParameters} new instance with tags cleared
       */
      clearTags: function clearTags() {
        if (this.tagFilters === void 0 && this.tagRefinements.length === 0)
          return this;
        return this.setQueryParameters({
          tagFilters: void 0,
          tagRefinements: []
        });
      },
      /**
       * Set the index.
       * @method
       * @param {string} index the index name
       * @return {SearchParameters} new instance
       */
      setIndex: function setIndex(index) {
        if (index === this.index) return this;
        return this.setQueryParameters({
          index
        });
      },
      /**
       * Query setter
       * @method
       * @param {string} newQuery value for the new query
       * @return {SearchParameters} new instance
       */
      setQuery: function setQuery(newQuery) {
        if (newQuery === this.query) return this;
        return this.setQueryParameters({
          query: newQuery
        });
      },
      /**
       * Page setter
       * @method
       * @param {number} newPage new page number
       * @return {SearchParameters} new instance
       */
      setPage: function setPage(newPage) {
        if (newPage === this.page) return this;
        return this.setQueryParameters({
          page: newPage
        });
      },
      /**
       * Facets setter
       * The facets are the simple facets, used for conjunctive (and) faceting.
       * @method
       * @param {string[]} facets all the attributes of the algolia records used for conjunctive faceting
       * @return {SearchParameters} new instance
       */
      setFacets: function setFacets(facets) {
        return this.setQueryParameters({
          facets
        });
      },
      /**
       * Disjunctive facets setter
       * Change the list of disjunctive (or) facets the helper chan handle.
       * @method
       * @param {string[]} facets all the attributes of the algolia records used for disjunctive faceting
       * @return {SearchParameters} new instance
       */
      setDisjunctiveFacets: function setDisjunctiveFacets(facets) {
        return this.setQueryParameters({
          disjunctiveFacets: facets
        });
      },
      /**
       * HitsPerPage setter
       * Hits per page represents the number of hits retrieved for this query
       * @method
       * @param {number} n number of hits retrieved per page of results
       * @return {SearchParameters} new instance
       */
      setHitsPerPage: function setHitsPerPage(n) {
        if (this.hitsPerPage === n) return this;
        return this.setQueryParameters({
          hitsPerPage: n
        });
      },
      /**
       * typoTolerance setter
       * Set the value of typoTolerance
       * @method
       * @param {string} typoTolerance new value of typoTolerance ("true", "false", "min" or "strict")
       * @return {SearchParameters} new instance
       */
      setTypoTolerance: function setTypoTolerance(typoTolerance) {
        if (this.typoTolerance === typoTolerance) return this;
        return this.setQueryParameters({
          typoTolerance
        });
      },
      /**
       * Add a numeric filter for a given attribute
       * When value is an array, they are combined with OR
       * When value is a single value, it will combined with AND
       * @method
       * @param {string} attribute attribute to set the filter on
       * @param {string} operator operator of the filter (possible values: =, >, >=, <, <=, !=)
       * @param {number | number[]} value value of the filter
       * @return {SearchParameters} new instance
       * @example
       * // for price = 50 or 40
       * state.addNumericRefinement('price', '=', [50, 40]);
       * @example
       * // for size = 38 and 40
       * state.addNumericRefinement('size', '=', 38);
       * state.addNumericRefinement('size', '=', 40);
       */
      addNumericRefinement: function(attribute, operator, value) {
        var val = valToNumber(value);
        if (this.isNumericRefined(attribute, operator, val)) return this;
        var mod = merge({}, this.numericRefinements);
        mod[attribute] = merge({}, mod[attribute]);
        if (mod[attribute][operator]) {
          mod[attribute][operator] = mod[attribute][operator].slice();
          mod[attribute][operator].push(val);
        } else {
          mod[attribute][operator] = [val];
        }
        return this.setQueryParameters({
          numericRefinements: mod
        });
      },
      /**
       * Get the list of conjunctive refinements for a single facet
       * @param {string} facetName name of the attribute used for faceting
       * @return {string[]} list of refinements
       */
      getConjunctiveRefinements: function(facetName) {
        if (!this.isConjunctiveFacet(facetName)) {
          return [];
        }
        return this.facetsRefinements[facetName] || [];
      },
      /**
       * Get the list of disjunctive refinements for a single facet
       * @param {string} facetName name of the attribute used for faceting
       * @return {string[]} list of refinements
       */
      getDisjunctiveRefinements: function(facetName) {
        if (!this.isDisjunctiveFacet(facetName)) {
          return [];
        }
        return this.disjunctiveFacetsRefinements[facetName] || [];
      },
      /**
       * Get the list of hierarchical refinements for a single facet
       * @param {string} facetName name of the attribute used for faceting
       * @return {string[]} list of refinements
       */
      getHierarchicalRefinement: function(facetName) {
        return this.hierarchicalFacetsRefinements[facetName] || [];
      },
      /**
       * Get the list of exclude refinements for a single facet
       * @param {string} facetName name of the attribute used for faceting
       * @return {string[]} list of refinements
       */
      getExcludeRefinements: function(facetName) {
        if (!this.isConjunctiveFacet(facetName)) {
          return [];
        }
        return this.facetsExcludes[facetName] || [];
      },
      /**
       * Remove all the numeric filter for a given (attribute, operator)
       * @method
       * @param {string} attribute attribute to set the filter on
       * @param {string} [operator] operator of the filter (possible values: =, >, >=, <, <=, !=)
       * @param {number} [number] the value to be removed
       * @return {SearchParameters} new instance
       */
      removeNumericRefinement: function(attribute, operator, number) {
        var paramValue = number;
        if (paramValue !== void 0) {
          if (!this.isNumericRefined(attribute, operator, paramValue)) {
            return this;
          }
          return this.setQueryParameters({
            numericRefinements: this._clearNumericRefinements(
              function(value, key) {
                return key === attribute && value.op === operator && isEqualNumericRefinement(value.val, valToNumber(paramValue));
              }
            )
          });
        } else if (operator !== void 0) {
          if (!this.isNumericRefined(attribute, operator)) return this;
          return this.setQueryParameters({
            numericRefinements: this._clearNumericRefinements(
              function(value, key) {
                return key === attribute && value.op === operator;
              }
            )
          });
        }
        if (!this.isNumericRefined(attribute)) return this;
        return this.setQueryParameters({
          numericRefinements: this._clearNumericRefinements(function(value, key) {
            return key === attribute;
          })
        });
      },
      /**
       * Get the list of numeric refinements for a single facet
       * @param {string} facetName name of the attribute used for faceting
       * @return {SearchParameters.OperatorList} list of refinements
       */
      getNumericRefinements: function(facetName) {
        return this.numericRefinements[facetName] || {};
      },
      /**
       * Return the current refinement for the (attribute, operator)
       * @param {string} attribute attribute in the record
       * @param {string} operator operator applied on the refined values
       * @return {Array.<number|number[]>} refined values
       */
      getNumericRefinement: function(attribute, operator) {
        return this.numericRefinements[attribute] && this.numericRefinements[attribute][operator];
      },
      /**
       * Clear numeric filters.
       * @method
       * @private
       * @param {string|SearchParameters.clearCallback} [attribute] optional string or function
       * - If not given, means to clear all the filters.
       * - If `string`, means to clear all refinements for the `attribute` named filter.
       * - If `function`, means to clear all the refinements that return truthy values.
       * @return {Object.<string, OperatorList>} new numeric refinements
       */
      _clearNumericRefinements: function _clearNumericRefinements(attribute) {
        if (attribute === void 0) {
          if (!objectHasKeys(this.numericRefinements)) {
            return this.numericRefinements;
          }
          return {};
        } else if (typeof attribute === "string") {
          return omit(this.numericRefinements, [attribute]);
        } else if (typeof attribute === "function") {
          var hasChanged = false;
          var numericRefinements = this.numericRefinements;
          var newNumericRefinements = Object.keys(numericRefinements).reduce(
            function(memo, key) {
              var operators = numericRefinements[key];
              var operatorList = {};
              operators = operators || {};
              Object.keys(operators).forEach(function(operator) {
                var values = operators[operator] || [];
                var outValues = [];
                values.forEach(function(value) {
                  var predicateResult = attribute(
                    { val: value, op: operator },
                    key,
                    "numeric"
                  );
                  if (!predicateResult) outValues.push(value);
                });
                if (outValues.length !== values.length) {
                  hasChanged = true;
                }
                operatorList[operator] = outValues;
              });
              memo[key] = operatorList;
              return memo;
            },
            {}
          );
          if (hasChanged) return newNumericRefinements;
          return this.numericRefinements;
        }
        return void 0;
      },
      /**
       * Add a facet to the facets attribute of the helper configuration, if it
       * isn't already present.
       * @method
       * @param {string} facet facet name to add
       * @return {SearchParameters} new instance
       */
      addFacet: function addFacet(facet) {
        if (this.isConjunctiveFacet(facet)) {
          return this;
        }
        return this.setQueryParameters({
          facets: this.facets.concat([facet])
        });
      },
      /**
       * Add a disjunctive facet to the disjunctiveFacets attribute of the helper
       * configuration, if it isn't already present.
       * @method
       * @param {string} facet disjunctive facet name to add
       * @return {SearchParameters} new instance
       */
      addDisjunctiveFacet: function addDisjunctiveFacet(facet) {
        if (this.isDisjunctiveFacet(facet)) {
          return this;
        }
        return this.setQueryParameters({
          disjunctiveFacets: this.disjunctiveFacets.concat([facet])
        });
      },
      /**
       * Add a hierarchical facet to the hierarchicalFacets attribute of the helper
       * configuration.
       * @method
       * @param {object} hierarchicalFacet hierarchical facet to add
       * @return {SearchParameters} new instance
       * @throws will throw an error if a hierarchical facet with the same name was already declared
       */
      addHierarchicalFacet: function addHierarchicalFacet(hierarchicalFacet) {
        if (this.isHierarchicalFacet(hierarchicalFacet.name)) {
          throw new Error(
            "Cannot declare two hierarchical facets with the same name: `" + hierarchicalFacet.name + "`"
          );
        }
        return this.setQueryParameters({
          hierarchicalFacets: this.hierarchicalFacets.concat([hierarchicalFacet])
        });
      },
      /**
       * Add a refinement on a "normal" facet
       * @method
       * @param {string} facet attribute to apply the faceting on
       * @param {string} value value of the attribute (will be converted to string)
       * @return {SearchParameters} new instance
       */
      addFacetRefinement: function addFacetRefinement(facet, value) {
        if (!this.isConjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the facets attribute of the helper configuration"
          );
        }
        if (RefinementList.isRefined(this.facetsRefinements, facet, value))
          return this;
        return this.setQueryParameters({
          facetsRefinements: RefinementList.addRefinement(
            this.facetsRefinements,
            facet,
            value
          )
        });
      },
      /**
       * Exclude a value from a "normal" facet
       * @method
       * @param {string} facet attribute to apply the exclusion on
       * @param {string} value value of the attribute (will be converted to string)
       * @return {SearchParameters} new instance
       */
      addExcludeRefinement: function addExcludeRefinement(facet, value) {
        if (!this.isConjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the facets attribute of the helper configuration"
          );
        }
        if (RefinementList.isRefined(this.facetsExcludes, facet, value))
          return this;
        return this.setQueryParameters({
          facetsExcludes: RefinementList.addRefinement(
            this.facetsExcludes,
            facet,
            value
          )
        });
      },
      /**
       * Adds a refinement on a disjunctive facet.
       * @method
       * @param {string} facet attribute to apply the faceting on
       * @param {string} value value of the attribute (will be converted to string)
       * @return {SearchParameters} new instance
       */
      addDisjunctiveFacetRefinement: function addDisjunctiveFacetRefinement(facet, value) {
        if (!this.isDisjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the disjunctiveFacets attribute of the helper configuration"
          );
        }
        if (RefinementList.isRefined(this.disjunctiveFacetsRefinements, facet, value))
          return this;
        return this.setQueryParameters({
          disjunctiveFacetsRefinements: RefinementList.addRefinement(
            this.disjunctiveFacetsRefinements,
            facet,
            value
          )
        });
      },
      /**
       * addTagRefinement adds a tag to the list used to filter the results
       * @param {string} tag tag to be added
       * @return {SearchParameters} new instance
       */
      addTagRefinement: function addTagRefinement(tag) {
        if (this.isTagRefined(tag)) return this;
        var modification = {
          tagRefinements: this.tagRefinements.concat(tag)
        };
        return this.setQueryParameters(modification);
      },
      /**
       * Remove a facet from the facets attribute of the helper configuration, if it
       * is present.
       * @method
       * @param {string} facet facet name to remove
       * @return {SearchParameters} new instance
       */
      removeFacet: function removeFacet(facet) {
        if (!this.isConjunctiveFacet(facet)) {
          return this;
        }
        return this.clearRefinements(facet).setQueryParameters({
          facets: this.facets.filter(function(f) {
            return f !== facet;
          })
        });
      },
      /**
       * Remove a disjunctive facet from the disjunctiveFacets attribute of the
       * helper configuration, if it is present.
       * @method
       * @param {string} facet disjunctive facet name to remove
       * @return {SearchParameters} new instance
       */
      removeDisjunctiveFacet: function removeDisjunctiveFacet(facet) {
        if (!this.isDisjunctiveFacet(facet)) {
          return this;
        }
        return this.clearRefinements(facet).setQueryParameters({
          disjunctiveFacets: this.disjunctiveFacets.filter(function(f) {
            return f !== facet;
          })
        });
      },
      /**
       * Remove a hierarchical facet from the hierarchicalFacets attribute of the
       * helper configuration, if it is present.
       * @method
       * @param {string} facet hierarchical facet name to remove
       * @return {SearchParameters} new instance
       */
      removeHierarchicalFacet: function removeHierarchicalFacet(facet) {
        if (!this.isHierarchicalFacet(facet)) {
          return this;
        }
        return this.clearRefinements(facet).setQueryParameters({
          hierarchicalFacets: this.hierarchicalFacets.filter(function(f) {
            return f.name !== facet;
          })
        });
      },
      /**
       * Remove a refinement set on facet. If a value is provided, it will clear the
       * refinement for the given value, otherwise it will clear all the refinement
       * values for the faceted attribute.
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {string} [value] value used to filter
       * @return {SearchParameters} new instance
       */
      removeFacetRefinement: function removeFacetRefinement(facet, value) {
        if (!this.isConjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the facets attribute of the helper configuration"
          );
        }
        if (!RefinementList.isRefined(this.facetsRefinements, facet, value))
          return this;
        return this.setQueryParameters({
          facetsRefinements: RefinementList.removeRefinement(
            this.facetsRefinements,
            facet,
            value
          )
        });
      },
      /**
       * Remove a negative refinement on a facet
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {string} value value used to filter
       * @return {SearchParameters} new instance
       */
      removeExcludeRefinement: function removeExcludeRefinement(facet, value) {
        if (!this.isConjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the facets attribute of the helper configuration"
          );
        }
        if (!RefinementList.isRefined(this.facetsExcludes, facet, value))
          return this;
        return this.setQueryParameters({
          facetsExcludes: RefinementList.removeRefinement(
            this.facetsExcludes,
            facet,
            value
          )
        });
      },
      /**
       * Remove a refinement on a disjunctive facet
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {string} value value used to filter
       * @return {SearchParameters} new instance
       */
      removeDisjunctiveFacetRefinement: function removeDisjunctiveFacetRefinement(facet, value) {
        if (!this.isDisjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the disjunctiveFacets attribute of the helper configuration"
          );
        }
        if (!RefinementList.isRefined(this.disjunctiveFacetsRefinements, facet, value))
          return this;
        return this.setQueryParameters({
          disjunctiveFacetsRefinements: RefinementList.removeRefinement(
            this.disjunctiveFacetsRefinements,
            facet,
            value
          )
        });
      },
      /**
       * Remove a tag from the list of tag refinements
       * @method
       * @param {string} tag the tag to remove
       * @return {SearchParameters} new instance
       */
      removeTagRefinement: function removeTagRefinement(tag) {
        if (!this.isTagRefined(tag)) return this;
        var modification = {
          tagRefinements: this.tagRefinements.filter(function(t) {
            return t !== tag;
          })
        };
        return this.setQueryParameters(modification);
      },
      /**
       * Generic toggle refinement method to use with facet, disjunctive facets
       * and hierarchical facets
       * @param  {string} facet the facet to refine
       * @param  {string} value the associated value
       * @return {SearchParameters} new instance
       * @throws will throw an error if the facet is not declared in the settings of the helper
       * @deprecated since version 2.19.0, see {@link SearchParameters#toggleFacetRefinement}
       */
      toggleRefinement: function toggleRefinement(facet, value) {
        return this.toggleFacetRefinement(facet, value);
      },
      /**
       * Generic toggle refinement method to use with facet, disjunctive facets
       * and hierarchical facets
       * @param  {string} facet the facet to refine
       * @param  {string} value the associated value
       * @return {SearchParameters} new instance
       * @throws will throw an error if the facet is not declared in the settings of the helper
       */
      toggleFacetRefinement: function toggleFacetRefinement(facet, value) {
        if (this.isHierarchicalFacet(facet)) {
          return this.toggleHierarchicalFacetRefinement(facet, value);
        } else if (this.isConjunctiveFacet(facet)) {
          return this.toggleConjunctiveFacetRefinement(facet, value);
        } else if (this.isDisjunctiveFacet(facet)) {
          return this.toggleDisjunctiveFacetRefinement(facet, value);
        }
        throw new Error(
          "Cannot refine the undeclared facet " + facet + "; it should be added to the helper options facets, disjunctiveFacets or hierarchicalFacets"
        );
      },
      /**
       * Switch the refinement applied over a facet/value
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {value} value value used for filtering
       * @return {SearchParameters} new instance
       */
      toggleConjunctiveFacetRefinement: function toggleConjunctiveFacetRefinement(facet, value) {
        if (!this.isConjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the facets attribute of the helper configuration"
          );
        }
        return this.setQueryParameters({
          facetsRefinements: RefinementList.toggleRefinement(
            this.facetsRefinements,
            facet,
            value
          )
        });
      },
      /**
       * Switch the refinement applied over a facet/value
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {value} value value used for filtering
       * @return {SearchParameters} new instance
       */
      toggleExcludeFacetRefinement: function toggleExcludeFacetRefinement(facet, value) {
        if (!this.isConjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the facets attribute of the helper configuration"
          );
        }
        return this.setQueryParameters({
          facetsExcludes: RefinementList.toggleRefinement(
            this.facetsExcludes,
            facet,
            value
          )
        });
      },
      /**
       * Switch the refinement applied over a facet/value
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {value} value value used for filtering
       * @return {SearchParameters} new instance
       */
      toggleDisjunctiveFacetRefinement: function toggleDisjunctiveFacetRefinement(facet, value) {
        if (!this.isDisjunctiveFacet(facet)) {
          throw new Error(
            facet + " is not defined in the disjunctiveFacets attribute of the helper configuration"
          );
        }
        return this.setQueryParameters({
          disjunctiveFacetsRefinements: RefinementList.toggleRefinement(
            this.disjunctiveFacetsRefinements,
            facet,
            value
          )
        });
      },
      /**
       * Switch the refinement applied over a facet/value
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {value} value value used for filtering
       * @return {SearchParameters} new instance
       */
      toggleHierarchicalFacetRefinement: function toggleHierarchicalFacetRefinement(facet, value) {
        if (!this.isHierarchicalFacet(facet)) {
          throw new Error(
            facet + " is not defined in the hierarchicalFacets attribute of the helper configuration"
          );
        }
        var separator = this._getHierarchicalFacetSeparator(
          this.getHierarchicalFacetByName(facet)
        );
        var mod = {};
        var upOneOrMultipleLevel = this.hierarchicalFacetsRefinements[facet] !== void 0 && this.hierarchicalFacetsRefinements[facet].length > 0 && // remove current refinement:
        // refinement was 'beer > IPA', call is toggleRefine('beer > IPA'), refinement should be `beer`
        (this.hierarchicalFacetsRefinements[facet][0] === value || // remove a parent refinement of the current refinement:
        //  - refinement was 'beer > IPA > Flying dog'
        //  - call is toggleRefine('beer > IPA')
        //  - refinement should be `beer`
        this.hierarchicalFacetsRefinements[facet][0].indexOf(
          value + separator
        ) === 0);
        if (upOneOrMultipleLevel) {
          if (value.indexOf(separator) === -1) {
            mod[facet] = [];
          } else {
            mod[facet] = [value.slice(0, value.lastIndexOf(separator))];
          }
        } else {
          mod[facet] = [value];
        }
        return this.setQueryParameters({
          hierarchicalFacetsRefinements: defaultsPure(
            mod,
            this.hierarchicalFacetsRefinements
          )
        });
      },
      /**
       * Adds a refinement on a hierarchical facet.
       * @param {string} facet the facet name
       * @param {string} path the hierarchical facet path
       * @return {SearchParameter} the new state
       * @throws Error if the facet is not defined or if the facet is refined
       */
      addHierarchicalFacetRefinement: function(facet, path) {
        if (this.isHierarchicalFacetRefined(facet)) {
          throw new Error(facet + " is already refined.");
        }
        if (!this.isHierarchicalFacet(facet)) {
          throw new Error(
            facet + " is not defined in the hierarchicalFacets attribute of the helper configuration."
          );
        }
        var mod = {};
        mod[facet] = [path];
        return this.setQueryParameters({
          hierarchicalFacetsRefinements: defaultsPure(
            mod,
            this.hierarchicalFacetsRefinements
          )
        });
      },
      /**
       * Removes the refinement set on a hierarchical facet.
       * @param {string} facet the facet name
       * @return {SearchParameter} the new state
       * @throws Error if the facet is not defined or if the facet is not refined
       */
      removeHierarchicalFacetRefinement: function(facet) {
        if (!this.isHierarchicalFacetRefined(facet)) {
          return this;
        }
        var mod = {};
        mod[facet] = [];
        return this.setQueryParameters({
          hierarchicalFacetsRefinements: defaultsPure(
            mod,
            this.hierarchicalFacetsRefinements
          )
        });
      },
      /**
       * Switch the tag refinement
       * @method
       * @param {string} tag the tag to remove or add
       * @return {SearchParameters} new instance
       */
      toggleTagRefinement: function toggleTagRefinement(tag) {
        if (this.isTagRefined(tag)) {
          return this.removeTagRefinement(tag);
        }
        return this.addTagRefinement(tag);
      },
      /**
       * Test if the facet name is from one of the disjunctive facets
       * @method
       * @param {string} facet facet name to test
       * @return {boolean} true if facet is a disjunctive facet
       */
      isDisjunctiveFacet: function(facet) {
        return this.disjunctiveFacets.indexOf(facet) > -1;
      },
      /**
       * Test if the facet name is from one of the hierarchical facets
       * @method
       * @param {string} facetName facet name to test
       * @return {boolean} true if facetName is a hierarchical facet
       */
      isHierarchicalFacet: function(facetName) {
        return this.getHierarchicalFacetByName(facetName) !== void 0;
      },
      /**
       * Test if the facet name is from one of the conjunctive/normal facets
       * @method
       * @param {string} facet facet name to test
       * @return {boolean} true if facet is a conjunctive facet
       */
      isConjunctiveFacet: function(facet) {
        return this.facets.indexOf(facet) > -1;
      },
      /**
       * Returns true if the facet is refined, either for a specific value or in
       * general.
       * @method
       * @param {string} facet name of the attribute for used for faceting
       * @param {string} value, optional value. If passed will test that this value
       * is filtering the given facet.
       * @return {boolean} returns true if refined
       */
      isFacetRefined: function isFacetRefined(facet, value) {
        if (!this.isConjunctiveFacet(facet)) {
          return false;
        }
        return RefinementList.isRefined(this.facetsRefinements, facet, value);
      },
      /**
       * Returns true if the facet contains exclusions or if a specific value is
       * excluded.
       *
       * @method
       * @param {string} facet name of the attribute for used for faceting
       * @param {string} [value] optional value. If passed will test that this value
       * is filtering the given facet.
       * @return {boolean} returns true if refined
       */
      isExcludeRefined: function isExcludeRefined(facet, value) {
        if (!this.isConjunctiveFacet(facet)) {
          return false;
        }
        return RefinementList.isRefined(this.facetsExcludes, facet, value);
      },
      /**
       * Returns true if the facet contains a refinement, or if a value passed is a
       * refinement for the facet.
       * @method
       * @param {string} facet name of the attribute for used for faceting
       * @param {string} value optional, will test if the value is used for refinement
       * if there is one, otherwise will test if the facet contains any refinement
       * @return {boolean} true if the facet is refined
       */
      isDisjunctiveFacetRefined: function isDisjunctiveFacetRefined(facet, value) {
        if (!this.isDisjunctiveFacet(facet)) {
          return false;
        }
        return RefinementList.isRefined(
          this.disjunctiveFacetsRefinements,
          facet,
          value
        );
      },
      /**
       * Returns true if the facet contains a refinement, or if a value passed is a
       * refinement for the facet.
       * @method
       * @param {string} facet name of the attribute for used for faceting
       * @param {string} value optional, will test if the value is used for refinement
       * if there is one, otherwise will test if the facet contains any refinement
       * @return {boolean} true if the facet is refined
       */
      isHierarchicalFacetRefined: function isHierarchicalFacetRefined(facet, value) {
        if (!this.isHierarchicalFacet(facet)) {
          return false;
        }
        var refinements = this.getHierarchicalRefinement(facet);
        if (!value) {
          return refinements.length > 0;
        }
        return refinements.indexOf(value) !== -1;
      },
      /**
       * Test if the triple (attribute, operator, value) is already refined.
       * If only the attribute and the operator are provided, it tests if the
       * contains any refinement value.
       * @method
       * @param {string} attribute attribute for which the refinement is applied
       * @param {string} [operator] operator of the refinement
       * @param {string} [value] value of the refinement
       * @return {boolean} true if it is refined
       */
      isNumericRefined: function isNumericRefined(attribute, operator, value) {
        if (value === void 0 && operator === void 0) {
          return Boolean(this.numericRefinements[attribute]);
        }
        var isOperatorDefined = this.numericRefinements[attribute] && this.numericRefinements[attribute][operator] !== void 0;
        if (value === void 0 || !isOperatorDefined) {
          return isOperatorDefined;
        }
        var parsedValue = valToNumber(value);
        var isAttributeValueDefined = findArray(this.numericRefinements[attribute][operator], parsedValue) !== void 0;
        return isOperatorDefined && isAttributeValueDefined;
      },
      /**
       * Returns true if the tag refined, false otherwise
       * @method
       * @param {string} tag the tag to check
       * @return {boolean} true if tag is refined
       */
      isTagRefined: function isTagRefined(tag) {
        return this.tagRefinements.indexOf(tag) !== -1;
      },
      /**
       * Returns the list of all disjunctive facets refined
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {value} value value used for filtering
       * @return {string[]} returns the list of refinements
       */
      getRefinedDisjunctiveFacets: function getRefinedDisjunctiveFacets() {
        var self = this;
        var disjunctiveNumericRefinedFacets = intersection(
          Object.keys(this.numericRefinements).filter(function(facet) {
            return Object.keys(self.numericRefinements[facet]).length > 0;
          }),
          this.disjunctiveFacets
        );
        return Object.keys(this.disjunctiveFacetsRefinements).filter(function(facet) {
          return self.disjunctiveFacetsRefinements[facet].length > 0;
        }).concat(disjunctiveNumericRefinedFacets).concat(this.getRefinedHierarchicalFacets()).sort();
      },
      /**
       * Returns the list of all disjunctive facets refined
       * @method
       * @param {string} facet name of the attribute used for faceting
       * @param {value} value value used for filtering
       * @return {string[]} returns the list of refinements
       */
      getRefinedHierarchicalFacets: function getRefinedHierarchicalFacets() {
        var self = this;
        return intersection(
          // enforce the order between the two arrays,
          // so that refinement name index === hierarchical facet index
          this.hierarchicalFacets.map(function(facet) {
            return facet.name;
          }),
          Object.keys(this.hierarchicalFacetsRefinements).filter(function(facet) {
            return self.hierarchicalFacetsRefinements[facet].length > 0;
          })
        ).sort();
      },
      /**
       * Returned the list of all disjunctive facets not refined
       * @method
       * @return {string[]} returns the list of facets that are not refined
       */
      getUnrefinedDisjunctiveFacets: function() {
        var refinedFacets = this.getRefinedDisjunctiveFacets();
        return this.disjunctiveFacets.filter(function(f) {
          return refinedFacets.indexOf(f) === -1;
        });
      },
      managedParameters: [
        "index",
        "facets",
        "disjunctiveFacets",
        "facetsRefinements",
        "hierarchicalFacets",
        "facetsExcludes",
        "disjunctiveFacetsRefinements",
        "numericRefinements",
        "tagRefinements",
        "hierarchicalFacetsRefinements"
      ],
      getQueryParams: function getQueryParams() {
        var managedParameters = this.managedParameters;
        var queryParams = {};
        var self = this;
        Object.keys(this).forEach(function(paramName) {
          var paramValue = self[paramName];
          if (managedParameters.indexOf(paramName) === -1 && paramValue !== void 0) {
            queryParams[paramName] = paramValue;
          }
        });
        return queryParams;
      },
      /**
       * Let the user set a specific value for a given parameter. Will return the
       * same instance if the parameter is invalid or if the value is the same as the
       * previous one.
       * @method
       * @param {string} parameter the parameter name
       * @param {any} value the value to be set, must be compliant with the definition
       * of the attribute on the object
       * @return {SearchParameters} the updated state
       */
      setQueryParameter: function setParameter(parameter, value) {
        if (this[parameter] === value) return this;
        var modification = {};
        modification[parameter] = value;
        return this.setQueryParameters(modification);
      },
      /**
       * Let the user set any of the parameters with a plain object.
       * @method
       * @param {object} params all the keys and the values to be updated
       * @return {SearchParameters} a new updated instance
       */
      setQueryParameters: function setQueryParameters(params) {
        if (!params) return this;
        var error = SearchParameters.validate(this, params);
        if (error) {
          throw error;
        }
        var self = this;
        var nextWithNumbers = SearchParameters._parseNumbers(params);
        var previousPlainObject = Object.keys(this).reduce(function(acc, key) {
          acc[key] = self[key];
          return acc;
        }, {});
        var nextPlainObject = Object.keys(nextWithNumbers).reduce(function(previous, key) {
          var isPreviousValueDefined = previous[key] !== void 0;
          var isNextValueDefined = nextWithNumbers[key] !== void 0;
          if (isPreviousValueDefined && !isNextValueDefined) {
            return omit(previous, [key]);
          }
          if (isNextValueDefined) {
            previous[key] = nextWithNumbers[key];
          }
          return previous;
        }, previousPlainObject);
        return new this.constructor(nextPlainObject);
      },
      /**
       * Returns a new instance with the page reset. Two scenarios possible:
       * the page is omitted -> return the given instance
       * the page is set -> return a new instance with a page of 0
       * @return {SearchParameters} a new updated instance
       */
      resetPage: function() {
        if (this.page === void 0) {
          return this;
        }
        return this.setPage(0);
      },
      /**
       * Helper function to get the hierarchicalFacet separator or the default one (`>`)
       * @param  {object} hierarchicalFacet the hierarchicalFacet object
       * @return {string} returns the hierarchicalFacet.separator or `>` as default
       */
      _getHierarchicalFacetSortBy: function(hierarchicalFacet) {
        return hierarchicalFacet.sortBy || ["isRefined:desc", "name:asc"];
      },
      /**
       * Helper function to get the hierarchicalFacet separator or the default one (`>`)
       * @private
       * @param  {object} hierarchicalFacet the hierarchicalFacet object
       * @return {string} returns the hierarchicalFacet.separator or `>` as default
       */
      _getHierarchicalFacetSeparator: function(hierarchicalFacet) {
        return hierarchicalFacet.separator || " > ";
      },
      /**
       * Helper function to get the hierarchicalFacet prefix path or null
       * @private
       * @param  {object} hierarchicalFacet the hierarchicalFacet object
       * @return {string} returns the hierarchicalFacet.rootPath or null as default
       */
      _getHierarchicalRootPath: function(hierarchicalFacet) {
        return hierarchicalFacet.rootPath || null;
      },
      /**
       * Helper function to check if we show the parent level of the hierarchicalFacet
       * @private
       * @param  {object} hierarchicalFacet the hierarchicalFacet object
       * @return {string} returns the hierarchicalFacet.showParentLevel or true as default
       */
      _getHierarchicalShowParentLevel: function(hierarchicalFacet) {
        if (typeof hierarchicalFacet.showParentLevel === "boolean") {
          return hierarchicalFacet.showParentLevel;
        }
        return true;
      },
      /**
       * Helper function to get the hierarchicalFacet by it's name
       * @param  {string} hierarchicalFacetName the hierarchicalFacet name
       * @return {object} a hierarchicalFacet
       */
      getHierarchicalFacetByName: function(hierarchicalFacetName) {
        return find(this.hierarchicalFacets, function(f) {
          return f.name === hierarchicalFacetName;
        });
      },
      /**
       * Get the current breadcrumb for a hierarchical facet, as an array
       * @param  {string} facetName Hierarchical facet name
       * @return {array.<string>} the path as an array of string
       */
      getHierarchicalFacetBreadcrumb: function(facetName) {
        if (!this.isHierarchicalFacet(facetName)) {
          return [];
        }
        var refinement = this.getHierarchicalRefinement(facetName)[0];
        if (!refinement) return [];
        var separator = this._getHierarchicalFacetSeparator(
          this.getHierarchicalFacetByName(facetName)
        );
        var path = refinement.split(separator);
        return path.map(function(part) {
          return part.trim();
        });
      },
      toString: function() {
        return JSON.stringify(this, null, 2);
      }
    };
    module.exports = SearchParameters;
  }
});

// node_modules/algoliasearch-helper/src/functions/compact.js
var require_compact = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/compact.js"(exports, module) {
    "use strict";
    module.exports = function compact(array) {
      if (!Array.isArray(array)) {
        return [];
      }
      return array.filter(Boolean);
    };
  }
});

// node_modules/algoliasearch-helper/src/functions/findIndex.js
var require_findIndex = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/findIndex.js"(exports, module) {
    "use strict";
    module.exports = function find(array, comparator) {
      if (!Array.isArray(array)) {
        return -1;
      }
      for (var i = 0; i < array.length; i++) {
        if (comparator(array[i])) {
          return i;
        }
      }
      return -1;
    };
  }
});

// node_modules/algoliasearch-helper/src/functions/formatSort.js
var require_formatSort = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/formatSort.js"(exports, module) {
    "use strict";
    var find = require_find();
    module.exports = function formatSort(sortBy, defaults) {
      var defaultInstructions = (defaults || []).map(function(sort) {
        return sort.split(":");
      });
      return sortBy.reduce(
        function preparePredicate(out, sort) {
          var sortInstruction = sort.split(":");
          var matchingDefault = find(
            defaultInstructions,
            function(defaultInstruction) {
              return defaultInstruction[0] === sortInstruction[0];
            }
          );
          if (sortInstruction.length > 1 || !matchingDefault) {
            out[0].push(sortInstruction[0]);
            out[1].push(sortInstruction[1]);
            return out;
          }
          out[0].push(matchingDefault[0]);
          out[1].push(matchingDefault[1]);
          return out;
        },
        [[], []]
      );
    };
  }
});

// node_modules/algoliasearch-helper/src/functions/mergeNumericMax.js
var require_mergeNumericMax = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/mergeNumericMax.js"(exports, module) {
    "use strict";
    function mergeNumericMax() {
      var sources = Array.prototype.slice.call(arguments);
      return sources.reduceRight(function(acc, source) {
        Object.keys(Object(source)).forEach(function(key) {
          var accValue = typeof acc[key] === "number" ? acc[key] : 0;
          var sourceValue = source[key];
          if (sourceValue === void 0) {
            return;
          }
          if (sourceValue >= accValue) {
            if (acc[key] !== void 0) {
              delete acc[key];
            }
            acc[key] = sourceValue;
          }
        });
        return acc;
      }, {});
    }
    module.exports = mergeNumericMax;
  }
});

// node_modules/algoliasearch-helper/src/functions/orderBy.js
var require_orderBy = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/orderBy.js"(exports, module) {
    "use strict";
    function compareAscending(value, other) {
      if (value !== other) {
        var valIsDefined = value !== void 0;
        var valIsNull = value === null;
        var othIsDefined = other !== void 0;
        var othIsNull = other === null;
        if (!othIsNull && value > other || valIsNull && othIsDefined || !valIsDefined) {
          return 1;
        }
        if (!valIsNull && value < other || othIsNull && valIsDefined || !othIsDefined) {
          return -1;
        }
      }
      return 0;
    }
    function orderBy(collection, iteratees, orders) {
      if (!Array.isArray(collection)) {
        return [];
      }
      if (!Array.isArray(orders)) {
        orders = [];
      }
      var result = collection.map(function(value, index) {
        return {
          criteria: iteratees.map(function(iteratee) {
            return value[iteratee];
          }),
          index,
          value
        };
      });
      result.sort(function comparer(object, other) {
        var index = -1;
        while (++index < object.criteria.length) {
          var res = compareAscending(object.criteria[index], other.criteria[index]);
          if (res) {
            if (index >= orders.length) {
              return res;
            }
            if (orders[index] === "desc") {
              return -res;
            }
            return res;
          }
        }
        return object.index - other.index;
      });
      return result.map(function(res) {
        return res.value;
      });
    }
    module.exports = orderBy;
  }
});

// node_modules/algoliasearch-helper/src/SearchResults/generate-hierarchical-tree.js
var require_generate_hierarchical_tree = __commonJS({
  "node_modules/algoliasearch-helper/src/SearchResults/generate-hierarchical-tree.js"(exports, module) {
    "use strict";
    module.exports = generateTrees;
    var fv = require_escapeFacetValue();
    var find = require_find();
    var prepareHierarchicalFacetSortBy = require_formatSort();
    var orderBy = require_orderBy();
    var escapeFacetValue = fv.escapeFacetValue;
    var unescapeFacetValue = fv.unescapeFacetValue;
    function generateTrees(state) {
      return function generate(hierarchicalFacetResult, hierarchicalFacetIndex) {
        var hierarchicalFacet = state.hierarchicalFacets[hierarchicalFacetIndex];
        var hierarchicalFacetRefinement = state.hierarchicalFacetsRefinements[hierarchicalFacet.name] && state.hierarchicalFacetsRefinements[hierarchicalFacet.name][0] || "";
        var hierarchicalSeparator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
        var hierarchicalRootPath = state._getHierarchicalRootPath(hierarchicalFacet);
        var hierarchicalShowParentLevel = state._getHierarchicalShowParentLevel(hierarchicalFacet);
        var sortBy = prepareHierarchicalFacetSortBy(
          state._getHierarchicalFacetSortBy(hierarchicalFacet)
        );
        var rootExhaustive = hierarchicalFacetResult.every(function(facetResult) {
          return facetResult.exhaustive;
        });
        var generateTreeFn = generateHierarchicalTree(
          sortBy,
          hierarchicalSeparator,
          hierarchicalRootPath,
          hierarchicalShowParentLevel,
          hierarchicalFacetRefinement
        );
        var results = hierarchicalFacetResult;
        if (hierarchicalRootPath) {
          results = hierarchicalFacetResult.slice(
            hierarchicalRootPath.split(hierarchicalSeparator).length
          );
        }
        return results.reduce(generateTreeFn, {
          name: state.hierarchicalFacets[hierarchicalFacetIndex].name,
          count: null,
          // root level, no count
          isRefined: true,
          // root level, always refined
          path: null,
          // root level, no path
          escapedValue: null,
          exhaustive: rootExhaustive,
          data: null
        });
      };
    }
    function generateHierarchicalTree(sortBy, hierarchicalSeparator, hierarchicalRootPath, hierarchicalShowParentLevel, currentRefinement) {
      return function generateTree(hierarchicalTree, hierarchicalFacetResult, currentHierarchicalLevel) {
        var parent = hierarchicalTree;
        if (currentHierarchicalLevel > 0) {
          var level = 0;
          parent = hierarchicalTree;
          while (level < currentHierarchicalLevel) {
            var data = parent && Array.isArray(parent.data) ? parent.data : [];
            parent = find(data, function(subtree) {
              return subtree.isRefined;
            });
            level++;
          }
        }
        if (parent) {
          var picked = Object.keys(hierarchicalFacetResult.data).map(function(facetValue) {
            return [facetValue, hierarchicalFacetResult.data[facetValue]];
          }).filter(function(tuple) {
            var facetValue = tuple[0];
            return onlyMatchingTree(
              facetValue,
              parent.path || hierarchicalRootPath,
              currentRefinement,
              hierarchicalSeparator,
              hierarchicalRootPath,
              hierarchicalShowParentLevel
            );
          });
          parent.data = orderBy(
            picked.map(function(tuple) {
              var facetValue = tuple[0];
              var facetCount = tuple[1];
              return format(
                facetCount,
                facetValue,
                hierarchicalSeparator,
                unescapeFacetValue(currentRefinement),
                hierarchicalFacetResult.exhaustive
              );
            }),
            sortBy[0],
            sortBy[1]
          );
        }
        return hierarchicalTree;
      };
    }
    function onlyMatchingTree(facetValue, parentPath, currentRefinement, hierarchicalSeparator, hierarchicalRootPath, hierarchicalShowParentLevel) {
      if (hierarchicalRootPath && (facetValue.indexOf(hierarchicalRootPath) !== 0 || hierarchicalRootPath === facetValue)) {
        return false;
      }
      return !hierarchicalRootPath && facetValue.indexOf(hierarchicalSeparator) === -1 || // if there is a rootPath, being root level mean 1 level under rootPath
      hierarchicalRootPath && facetValue.split(hierarchicalSeparator).length - hierarchicalRootPath.split(hierarchicalSeparator).length === 1 || // if current refinement is a root level and current facetValue is a root level,
      // keep the facetValue
      facetValue.indexOf(hierarchicalSeparator) === -1 && currentRefinement.indexOf(hierarchicalSeparator) === -1 || // currentRefinement is a child of the facet value
      currentRefinement.indexOf(facetValue) === 0 || // facetValue is a child of the current parent, add it
      facetValue.indexOf(parentPath + hierarchicalSeparator) === 0 && (hierarchicalShowParentLevel || facetValue.indexOf(currentRefinement) === 0);
    }
    function format(facetCount, facetValue, hierarchicalSeparator, currentRefinement, exhaustive) {
      var parts = facetValue.split(hierarchicalSeparator);
      return {
        name: parts[parts.length - 1].trim(),
        path: facetValue,
        escapedValue: escapeFacetValue(facetValue),
        count: facetCount,
        isRefined: currentRefinement === facetValue || currentRefinement.indexOf(facetValue + hierarchicalSeparator) === 0,
        exhaustive,
        data: null
      };
    }
  }
});

// node_modules/algoliasearch-helper/src/SearchResults/index.js
var require_SearchResults = __commonJS({
  "node_modules/algoliasearch-helper/src/SearchResults/index.js"(exports, module) {
    "use strict";
    var compact = require_compact();
    var defaultsPure = require_defaultsPure();
    var fv = require_escapeFacetValue();
    var find = require_find();
    var findIndex = require_findIndex();
    var formatSort = require_formatSort();
    var mergeNumericMax = require_mergeNumericMax();
    var orderBy = require_orderBy();
    var escapeFacetValue = fv.escapeFacetValue;
    var unescapeFacetValue = fv.unescapeFacetValue;
    var generateHierarchicalTree = require_generate_hierarchical_tree();
    function getIndices(attributes) {
      var indices = {};
      attributes.forEach(function(val, idx) {
        indices[val] = idx;
      });
      return indices;
    }
    function assignFacetStats(dest, facetStats, key) {
      if (facetStats && facetStats[key]) {
        dest.stats = facetStats[key];
      }
    }
    function findMatchingHierarchicalFacetFromAttributeName(hierarchicalFacets, hierarchicalAttributeName) {
      return find(
        hierarchicalFacets,
        function facetKeyMatchesAttribute(hierarchicalFacet) {
          var facetNames = hierarchicalFacet.attributes || [];
          return facetNames.indexOf(hierarchicalAttributeName) > -1;
        }
      );
    }
    function SearchResults(state, results, options) {
      var mainSubResponse = results[0] || {};
      this._rawResults = results;
      var self = this;
      Object.keys(mainSubResponse).forEach(function(key) {
        self[key] = mainSubResponse[key];
      });
      var opts = defaultsPure(options, {
        persistHierarchicalRootCount: false
      });
      Object.keys(opts).forEach(function(key) {
        self[key] = opts[key];
      });
      this.processingTimeMS = results.reduce(function(sum, result) {
        return result.processingTimeMS === void 0 ? sum : sum + result.processingTimeMS;
      }, 0);
      this.disjunctiveFacets = [];
      this.hierarchicalFacets = state.hierarchicalFacets.map(
        function initFutureTree() {
          return [];
        }
      );
      this.facets = [];
      var disjunctiveFacets = state.getRefinedDisjunctiveFacets();
      var facetsIndices = getIndices(state.facets);
      var disjunctiveFacetsIndices = getIndices(state.disjunctiveFacets);
      var nextDisjunctiveResult = 1;
      var mainFacets = mainSubResponse.facets || {};
      Object.keys(mainFacets).forEach(function(facetKey) {
        var facetValueObject = mainFacets[facetKey];
        var hierarchicalFacet = findMatchingHierarchicalFacetFromAttributeName(
          state.hierarchicalFacets,
          facetKey
        );
        if (hierarchicalFacet) {
          var facetIndex = hierarchicalFacet.attributes.indexOf(facetKey);
          var idxAttributeName = findIndex(state.hierarchicalFacets, function(f) {
            return f.name === hierarchicalFacet.name;
          });
          self.hierarchicalFacets[idxAttributeName][facetIndex] = {
            attribute: facetKey,
            data: facetValueObject,
            exhaustive: mainSubResponse.exhaustiveFacetsCount
          };
        } else {
          var isFacetDisjunctive = state.disjunctiveFacets.indexOf(facetKey) !== -1;
          var isFacetConjunctive = state.facets.indexOf(facetKey) !== -1;
          var position;
          if (isFacetDisjunctive) {
            position = disjunctiveFacetsIndices[facetKey];
            self.disjunctiveFacets[position] = {
              name: facetKey,
              data: facetValueObject,
              exhaustive: mainSubResponse.exhaustiveFacetsCount
            };
            assignFacetStats(
              self.disjunctiveFacets[position],
              mainSubResponse.facets_stats,
              facetKey
            );
          }
          if (isFacetConjunctive) {
            position = facetsIndices[facetKey];
            self.facets[position] = {
              name: facetKey,
              data: facetValueObject,
              exhaustive: mainSubResponse.exhaustiveFacetsCount
            };
            assignFacetStats(
              self.facets[position],
              mainSubResponse.facets_stats,
              facetKey
            );
          }
        }
      });
      this.hierarchicalFacets = compact(this.hierarchicalFacets);
      disjunctiveFacets.forEach(function(disjunctiveFacet) {
        var result = results[nextDisjunctiveResult];
        var facets = result && result.facets ? result.facets : {};
        var hierarchicalFacet = state.getHierarchicalFacetByName(disjunctiveFacet);
        Object.keys(facets).forEach(function(dfacet) {
          var facetResults = facets[dfacet];
          var position;
          if (hierarchicalFacet) {
            position = findIndex(state.hierarchicalFacets, function(f) {
              return f.name === hierarchicalFacet.name;
            });
            var attributeIndex = findIndex(
              self.hierarchicalFacets[position],
              function(f) {
                return f.attribute === dfacet;
              }
            );
            if (attributeIndex === -1) {
              return;
            }
            self.hierarchicalFacets[position][attributeIndex].data = self.persistHierarchicalRootCount ? mergeNumericMax(
              self.hierarchicalFacets[position][attributeIndex].data,
              facetResults
            ) : defaultsPure(
              facetResults,
              self.hierarchicalFacets[position][attributeIndex].data
            );
          } else {
            position = disjunctiveFacetsIndices[dfacet];
            var dataFromMainRequest = mainSubResponse.facets && mainSubResponse.facets[dfacet] || {};
            self.disjunctiveFacets[position] = {
              name: dfacet,
              data: mergeNumericMax(dataFromMainRequest, facetResults),
              exhaustive: result.exhaustiveFacetsCount
            };
            assignFacetStats(
              self.disjunctiveFacets[position],
              result.facets_stats,
              dfacet
            );
            if (state.disjunctiveFacetsRefinements[dfacet]) {
              state.disjunctiveFacetsRefinements[dfacet].forEach(
                function(refinementValue) {
                  if (!self.disjunctiveFacets[position].data[refinementValue] && state.disjunctiveFacetsRefinements[dfacet].indexOf(
                    unescapeFacetValue(refinementValue)
                  ) > -1) {
                    self.disjunctiveFacets[position].data[refinementValue] = 0;
                  }
                }
              );
            }
          }
        });
        nextDisjunctiveResult++;
      });
      state.getRefinedHierarchicalFacets().forEach(function(refinedFacet) {
        var hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);
        var separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
        var currentRefinement = state.getHierarchicalRefinement(refinedFacet);
        if (currentRefinement.length === 0 || currentRefinement[0].split(separator).length < 2) {
          return;
        }
        results.slice(nextDisjunctiveResult).forEach(function(result) {
          var facets = result && result.facets ? result.facets : {};
          Object.keys(facets).forEach(function(dfacet) {
            var facetResults = facets[dfacet];
            var position = findIndex(state.hierarchicalFacets, function(f) {
              return f.name === hierarchicalFacet.name;
            });
            var attributeIndex = findIndex(
              self.hierarchicalFacets[position],
              function(f) {
                return f.attribute === dfacet;
              }
            );
            if (attributeIndex === -1) {
              return;
            }
            var defaultData = {};
            if (currentRefinement.length > 0 && !self.persistHierarchicalRootCount) {
              var root = currentRefinement[0].split(separator)[0];
              defaultData[root] = self.hierarchicalFacets[position][attributeIndex].data[root];
            }
            self.hierarchicalFacets[position][attributeIndex].data = defaultsPure(
              defaultData,
              facetResults,
              self.hierarchicalFacets[position][attributeIndex].data
            );
          });
          nextDisjunctiveResult++;
        });
      });
      Object.keys(state.facetsExcludes).forEach(function(facetName) {
        var excludes = state.facetsExcludes[facetName];
        var position = facetsIndices[facetName];
        self.facets[position] = {
          name: facetName,
          data: mainFacets[facetName],
          exhaustive: mainSubResponse.exhaustiveFacetsCount
        };
        excludes.forEach(function(facetValue) {
          self.facets[position] = self.facets[position] || { name: facetName };
          self.facets[position].data = self.facets[position].data || {};
          self.facets[position].data[facetValue] = 0;
        });
      });
      this.hierarchicalFacets = this.hierarchicalFacets.map(
        generateHierarchicalTree(state)
      );
      this.facets = compact(this.facets);
      this.disjunctiveFacets = compact(this.disjunctiveFacets);
      this._state = state;
    }
    SearchResults.prototype.getFacetByName = function(name) {
      function predicate(facet) {
        return facet.name === name;
      }
      return find(this.facets, predicate) || find(this.disjunctiveFacets, predicate) || find(this.hierarchicalFacets, predicate);
    };
    function extractNormalizedFacetValues(results, attribute) {
      function predicate(facet2) {
        return facet2.name === attribute;
      }
      if (results._state.isConjunctiveFacet(attribute)) {
        var facet = find(results.facets, predicate);
        if (!facet) return [];
        return Object.keys(facet.data).map(function(name) {
          var value = escapeFacetValue(name);
          return {
            name,
            escapedValue: value,
            count: facet.data[name],
            isRefined: results._state.isFacetRefined(attribute, value),
            isExcluded: results._state.isExcludeRefined(attribute, name)
          };
        });
      } else if (results._state.isDisjunctiveFacet(attribute)) {
        var disjunctiveFacet = find(results.disjunctiveFacets, predicate);
        if (!disjunctiveFacet) return [];
        return Object.keys(disjunctiveFacet.data).map(function(name) {
          var value = escapeFacetValue(name);
          return {
            name,
            escapedValue: value,
            count: disjunctiveFacet.data[name],
            isRefined: results._state.isDisjunctiveFacetRefined(attribute, value)
          };
        });
      } else if (results._state.isHierarchicalFacet(attribute)) {
        var hierarchicalFacetValues = find(results.hierarchicalFacets, predicate);
        if (!hierarchicalFacetValues) return hierarchicalFacetValues;
        var hierarchicalFacet = results._state.getHierarchicalFacetByName(attribute);
        var separator = results._state._getHierarchicalFacetSeparator(hierarchicalFacet);
        var currentRefinement = unescapeFacetValue(
          results._state.getHierarchicalRefinement(attribute)[0] || ""
        );
        if (currentRefinement.indexOf(hierarchicalFacet.rootPath) === 0) {
          currentRefinement = currentRefinement.replace(
            hierarchicalFacet.rootPath + separator,
            ""
          );
        }
        var currentRefinementSplit = currentRefinement.split(separator);
        currentRefinementSplit.unshift(attribute);
        setIsRefined(hierarchicalFacetValues, currentRefinementSplit, 0);
        return hierarchicalFacetValues;
      }
      return void 0;
    }
    function setIsRefined(item, currentRefinement, depth) {
      item.isRefined = item.name === (currentRefinement[depth] && currentRefinement[depth].trim());
      if (item.data) {
        item.data.forEach(function(child) {
          setIsRefined(child, currentRefinement, depth + 1);
        });
      }
    }
    function recSort(sortFn, node, names, level) {
      level = level || 0;
      if (Array.isArray(node)) {
        return sortFn(node, names[level]);
      }
      if (!node.data || node.data.length === 0) {
        return node;
      }
      var children = node.data.map(function(childNode) {
        return recSort(sortFn, childNode, names, level + 1);
      });
      var sortedChildren = sortFn(children, names[level]);
      var newNode = defaultsPure({ data: sortedChildren }, node);
      return newNode;
    }
    SearchResults.DEFAULT_SORT = ["isRefined:desc", "count:desc", "name:asc"];
    function vanillaSortFn(order, data) {
      return data.sort(order);
    }
    function sortViaFacetOrdering(facetValues, facetOrdering) {
      var orderedFacets = [];
      var remainingFacets = [];
      var hide = facetOrdering.hide || [];
      var order = facetOrdering.order || [];
      var reverseOrder = order.reduce(function(acc, name, i) {
        acc[name] = i;
        return acc;
      }, {});
      facetValues.forEach(function(item) {
        var name = item.path || item.name;
        var hidden = hide.indexOf(name) > -1;
        if (!hidden && reverseOrder[name] !== void 0) {
          orderedFacets[reverseOrder[name]] = item;
        } else if (!hidden) {
          remainingFacets.push(item);
        }
      });
      orderedFacets = orderedFacets.filter(function(facet) {
        return facet;
      });
      var sortRemainingBy = facetOrdering.sortRemainingBy;
      var ordering;
      if (sortRemainingBy === "hidden") {
        return orderedFacets;
      } else if (sortRemainingBy === "alpha") {
        ordering = [
          ["path", "name"],
          ["asc", "asc"]
        ];
      } else {
        ordering = [["count"], ["desc"]];
      }
      return orderedFacets.concat(
        orderBy(remainingFacets, ordering[0], ordering[1])
      );
    }
    function getFacetOrdering(results, attribute) {
      return results.renderingContent && results.renderingContent.facetOrdering && results.renderingContent.facetOrdering.values && results.renderingContent.facetOrdering.values[attribute];
    }
    SearchResults.prototype.getFacetValues = function(attribute, opts) {
      var facetValues = extractNormalizedFacetValues(this, attribute);
      if (!facetValues) {
        return void 0;
      }
      var options = defaultsPure(opts, {
        sortBy: SearchResults.DEFAULT_SORT,
        // if no sortBy is given, attempt to sort based on facetOrdering
        // if it is given, we still allow to sort via facet ordering first
        facetOrdering: !(opts && opts.sortBy)
      });
      var results = this;
      var attributes;
      if (Array.isArray(facetValues)) {
        attributes = [attribute];
      } else {
        var config = results._state.getHierarchicalFacetByName(facetValues.name);
        attributes = config.attributes;
      }
      return recSort(
        function(data, facetName) {
          var facetOrdering = getFacetOrdering(results, facetName);
          if (options.facetOrdering) {
            if (facetOrdering) {
              return sortViaFacetOrdering(data, facetOrdering);
            }
          }
          if (Array.isArray(options.sortBy)) {
            var order = formatSort(options.sortBy, SearchResults.DEFAULT_SORT);
            var items = orderBy(data, order[0], order[1]);
            var hide = facetOrdering && facetOrdering.hide ? facetOrdering.hide : [];
            if (hide.length > 0) {
              var visible = [];
              items.forEach(function(item) {
                var name = item.path || item.name;
                if (hide.indexOf(name) === -1) {
                  visible.push(item);
                }
              });
              return visible;
            }
            return items;
          } else if (typeof options.sortBy === "function") {
            return vanillaSortFn(options.sortBy, data);
          }
          throw new Error(
            "options.sortBy is optional but if defined it must be either an array of string (predicates) or a sorting function"
          );
        },
        facetValues,
        attributes
      );
    };
    SearchResults.prototype.getFacetStats = function(attribute) {
      if (this._state.isConjunctiveFacet(attribute)) {
        return getFacetStatsIfAvailable(this.facets, attribute);
      } else if (this._state.isDisjunctiveFacet(attribute)) {
        return getFacetStatsIfAvailable(this.disjunctiveFacets, attribute);
      }
      return void 0;
    };
    function getFacetStatsIfAvailable(facetList, facetName) {
      var data = find(facetList, function(facet) {
        return facet.name === facetName;
      });
      return data && data.stats;
    }
    SearchResults.prototype.getRefinements = function() {
      var state = this._state;
      var results = this;
      var res = [];
      Object.keys(state.facetsRefinements).forEach(function(attributeName) {
        state.facetsRefinements[attributeName].forEach(function(name) {
          res.push(
            getRefinement(state, "facet", attributeName, name, results.facets)
          );
        });
      });
      Object.keys(state.facetsExcludes).forEach(function(attributeName) {
        state.facetsExcludes[attributeName].forEach(function(name) {
          res.push(
            getRefinement(state, "exclude", attributeName, name, results.facets)
          );
        });
      });
      Object.keys(state.disjunctiveFacetsRefinements).forEach(
        function(attributeName) {
          state.disjunctiveFacetsRefinements[attributeName].forEach(
            function(name) {
              res.push(
                getRefinement(
                  state,
                  "disjunctive",
                  attributeName,
                  name,
                  results.disjunctiveFacets
                )
              );
            }
          );
        }
      );
      Object.keys(state.hierarchicalFacetsRefinements).forEach(
        function(attributeName) {
          state.hierarchicalFacetsRefinements[attributeName].forEach(
            function(name) {
              res.push(
                getHierarchicalRefinement(
                  state,
                  attributeName,
                  name,
                  results.hierarchicalFacets
                )
              );
            }
          );
        }
      );
      Object.keys(state.numericRefinements).forEach(function(attributeName) {
        var operators = state.numericRefinements[attributeName];
        Object.keys(operators).forEach(function(operator) {
          operators[operator].forEach(function(value) {
            res.push({
              type: "numeric",
              attributeName,
              name: value,
              numericValue: value,
              operator
            });
          });
        });
      });
      state.tagRefinements.forEach(function(name) {
        res.push({ type: "tag", attributeName: "_tags", name });
      });
      return res;
    };
    function getRefinement(state, type, attributeName, name, resultsFacets) {
      var facet = find(resultsFacets, function(f) {
        return f.name === attributeName;
      });
      var count = facet && facet.data && facet.data[name] ? facet.data[name] : 0;
      var exhaustive = facet && facet.exhaustive || false;
      return {
        type,
        attributeName,
        name,
        count,
        exhaustive
      };
    }
    function getHierarchicalRefinement(state, attributeName, name, resultsFacets) {
      var facetDeclaration = state.getHierarchicalFacetByName(attributeName);
      var separator = state._getHierarchicalFacetSeparator(facetDeclaration);
      var split = name.split(separator);
      var rootFacet = find(resultsFacets, function(facet2) {
        return facet2.name === attributeName;
      });
      var facet = split.reduce(function(intermediateFacet, part) {
        var newFacet = intermediateFacet && find(intermediateFacet.data, function(f) {
          return f.name === part;
        });
        return newFacet !== void 0 ? newFacet : intermediateFacet;
      }, rootFacet);
      var count = facet && facet.count || 0;
      var exhaustive = facet && facet.exhaustive || false;
      var path = facet && facet.path || "";
      return {
        type: "hierarchical",
        attributeName,
        name: path,
        count,
        exhaustive
      };
    }
    module.exports = SearchResults;
  }
});

// node_modules/algoliasearch-helper/src/functions/flat.js
var require_flat = __commonJS({
  "node_modules/algoliasearch-helper/src/functions/flat.js"(exports, module) {
    module.exports = function flat(arr) {
      return arr.reduce(function(acc, val) {
        return acc.concat(val);
      }, []);
    };
  }
});

// node_modules/algoliasearch-helper/src/utils/sortAndMergeRecommendations.js
var require_sortAndMergeRecommendations = __commonJS({
  "node_modules/algoliasearch-helper/src/utils/sortAndMergeRecommendations.js"(exports, module) {
    "use strict";
    var find = require_find();
    var flat = require_flat();
    function getAverageIndices(indexTracker, nrOfObjs) {
      var avgIndices = [];
      Object.keys(indexTracker).forEach(function(key) {
        if (indexTracker[key].count < 2) {
          indexTracker[key].indexSum += 100;
        }
        avgIndices.push({
          objectID: key,
          avgOfIndices: indexTracker[key].indexSum / nrOfObjs
        });
      });
      return avgIndices.sort(function(a, b) {
        return a.avgOfIndices > b.avgOfIndices ? 1 : -1;
      });
    }
    function sortAndMergeRecommendations(objectIDs, results) {
      var indexTracker = {};
      results.forEach(function(hits) {
        hits.forEach(function(hit, index) {
          if (objectIDs.includes(hit.objectID)) return;
          if (!indexTracker[hit.objectID]) {
            indexTracker[hit.objectID] = { indexSum: index, count: 1 };
          } else {
            indexTracker[hit.objectID] = {
              indexSum: indexTracker[hit.objectID].indexSum + index,
              count: indexTracker[hit.objectID].count + 1
            };
          }
        });
      });
      var sortedAverageIndices = getAverageIndices(indexTracker, results.length);
      var finalOrder = sortedAverageIndices.reduce(function(orderedHits, avgIndexRef) {
        var result = find(flat(results), function(hit) {
          return hit.objectID === avgIndexRef.objectID;
        });
        return result ? orderedHits.concat(result) : orderedHits;
      }, []);
      return finalOrder;
    }
    module.exports = sortAndMergeRecommendations;
  }
});

// node_modules/algoliasearch-helper/src/version.js
var require_version = __commonJS({
  "node_modules/algoliasearch-helper/src/version.js"(exports, module) {
    "use strict";
    module.exports = "3.29.3";
  }
});

// node_modules/algoliasearch-helper/src/algoliasearch.helper.js
var require_algoliasearch_helper = __commonJS({
  "node_modules/algoliasearch-helper/src/algoliasearch.helper.js"(exports, module) {
    "use strict";
    var EventEmitter = require_events();
    var DerivedHelper = require_DerivedHelper();
    var escapeFacetValue = require_escapeFacetValue().escapeFacetValue;
    var inherits = require_inherits();
    var merge = require_merge();
    var objectHasKeys = require_objectHasKeys();
    var omit = require_omit();
    var RecommendParameters = require_RecommendParameters();
    var RecommendResults = require_RecommendResults();
    var requestBuilder = require_requestBuilder();
    var SearchParameters = require_SearchParameters();
    var SearchResults = require_SearchResults();
    var sortAndMergeRecommendations = require_sortAndMergeRecommendations();
    var version = require_version();
    function AlgoliaSearchHelper(client, index, options, searchResultsOptions) {
      if (typeof client.addAlgoliaAgent === "function") {
        client.addAlgoliaAgent("JS Helper (" + version + ")");
      }
      this.setClient(client);
      var opts = options || {};
      opts.index = index;
      this.state = SearchParameters.make(opts);
      this.recommendState = new RecommendParameters({
        params: opts.recommendState
      });
      this.lastResults = null;
      this.lastRecommendResults = null;
      this._queryId = 0;
      this._recommendQueryId = 0;
      this._lastQueryIdReceived = -1;
      this._lastRecommendQueryIdReceived = -1;
      this.derivedHelpers = [];
      this._currentNbQueries = 0;
      this._currentNbRecommendQueries = 0;
      this._searchResultsOptions = searchResultsOptions;
      this._recommendCache = {};
    }
    inherits(AlgoliaSearchHelper, EventEmitter);
    AlgoliaSearchHelper.prototype.search = function() {
      this._search({ onlyWithDerivedHelpers: false });
      return this;
    };
    AlgoliaSearchHelper.prototype.searchOnlyWithDerivedHelpers = function() {
      this._search({ onlyWithDerivedHelpers: true });
      return this;
    };
    AlgoliaSearchHelper.prototype.searchWithComposition = function() {
      this._runComposition({ onlyWithDerivedHelpers: true });
      return this;
    };
    AlgoliaSearchHelper.prototype.recommend = function() {
      this._recommend();
      return this;
    };
    AlgoliaSearchHelper.prototype.getQuery = function() {
      var state = this.state;
      return requestBuilder._getHitsSearchParams(state);
    };
    AlgoliaSearchHelper.prototype.searchOnce = function(options, cb) {
      var tempState = !options ? this.state : this.state.setQueryParameters(options);
      var queries = requestBuilder._getQueries(tempState.index, tempState);
      var self = this;
      this._currentNbQueries++;
      this.emit("searchOnce", {
        state: tempState
      });
      if (cb) {
        this.client.search(queries).then(function(content) {
          self._currentNbQueries--;
          if (self._currentNbQueries === 0) {
            self.emit("searchQueueEmpty");
          }
          cb(null, new SearchResults(tempState, content.results), tempState);
        }).catch(function(err) {
          self._currentNbQueries--;
          if (self._currentNbQueries === 0) {
            self.emit("searchQueueEmpty");
          }
          cb(err, null, tempState);
        });
        return void 0;
      }
      return this.client.search(queries).then(
        function(content) {
          self._currentNbQueries--;
          if (self._currentNbQueries === 0) self.emit("searchQueueEmpty");
          return {
            content: new SearchResults(tempState, content.results),
            state: tempState,
            _originalResponse: content
          };
        },
        function(e) {
          self._currentNbQueries--;
          if (self._currentNbQueries === 0) self.emit("searchQueueEmpty");
          throw e;
        }
      );
    };
    AlgoliaSearchHelper.prototype.findAnswers = function(options) {
      console.warn("[algoliasearch-helper] answers is no longer supported");
      var state = this.state;
      var derivedHelper = this.derivedHelpers[0];
      if (!derivedHelper) {
        return Promise.resolve([]);
      }
      var derivedState = derivedHelper.getModifiedState(state);
      var data = merge(
        {
          attributesForPrediction: options.attributesForPrediction,
          nbHits: options.nbHits
        },
        {
          params: omit(requestBuilder._getHitsSearchParams(derivedState), [
            "attributesToSnippet",
            "hitsPerPage",
            "restrictSearchableAttributes",
            "snippetEllipsisText"
          ])
        }
      );
      var errorMessage = "search for answers was called, but this client does not have a function client.initIndex(index).findAnswers";
      if (typeof this.client.initIndex !== "function") {
        throw new Error(errorMessage);
      }
      var index = this.client.initIndex(derivedState.index);
      if (typeof index.findAnswers !== "function") {
        throw new Error(errorMessage);
      }
      return index.findAnswers(derivedState.query, options.queryLanguages, data);
    };
    AlgoliaSearchHelper.prototype.searchForFacetValues = function(facet, query, maxFacetHits, userState) {
      var clientHasSFFV = typeof this.client.searchForFacetValues === "function" && // v5 has a wrong sffv signature
      typeof this.client.searchForFacets !== "function";
      var clientHasInitIndex = typeof this.client.initIndex === "function";
      if (!clientHasSFFV && !clientHasInitIndex && typeof this.client.search !== "function") {
        throw new Error(
          "search for facet values (searchable) was called, but this client does not have a function client.searchForFacetValues or client.initIndex(index).searchForFacetValues"
        );
      }
      var state = this.state.setQueryParameters(userState || {});
      var isDisjunctive = state.isDisjunctiveFacet(facet);
      var algoliaQuery = requestBuilder.getSearchForFacetQuery(
        facet,
        query,
        maxFacetHits,
        state
      );
      this._currentNbQueries++;
      var self = this;
      var searchForFacetValuesPromise;
      if (clientHasSFFV) {
        searchForFacetValuesPromise = this.client.searchForFacetValues([
          { indexName: state.index, params: algoliaQuery }
        ]);
      } else if (clientHasInitIndex) {
        searchForFacetValuesPromise = this.client.initIndex(state.index).searchForFacetValues(algoliaQuery);
      } else {
        delete algoliaQuery.facetName;
        searchForFacetValuesPromise = this.client.search([
          {
            type: "facet",
            facet,
            indexName: state.index,
            params: algoliaQuery
          }
        ]).then(function processResponse(response) {
          return response.results[0];
        });
      }
      this.emit("searchForFacetValues", {
        state,
        facet,
        query
      });
      var hide = this.lastResults && this.lastResults.index === state.index && this.lastResults.renderingContent && this.lastResults.renderingContent.facetOrdering && this.lastResults.renderingContent.facetOrdering.values && this.lastResults.renderingContent.facetOrdering.values[facet] && this.lastResults.renderingContent.facetOrdering.values[facet].hide || [];
      return searchForFacetValuesPromise.then(
        function addIsRefined(content) {
          self._currentNbQueries--;
          if (self._currentNbQueries === 0) self.emit("searchQueueEmpty");
          content = Array.isArray(content) ? content[0] : content;
          content.facetHits = content.facetHits.reduce(function(acc, f) {
            if (hide.indexOf(f.value) > -1) {
              return acc;
            }
            f.escapedValue = escapeFacetValue(f.value);
            f.isRefined = isDisjunctive ? state.isDisjunctiveFacetRefined(facet, f.escapedValue) : state.isFacetRefined(facet, f.escapedValue);
            acc.push(f);
            return acc;
          }, []);
          return content;
        },
        function(e) {
          self._currentNbQueries--;
          if (self._currentNbQueries === 0) self.emit("searchQueueEmpty");
          throw e;
        }
      );
    };
    AlgoliaSearchHelper.prototype.searchForCompositionFacetValues = function(facet, query, maxFacetHits, userState) {
      if (typeof this.client.searchForFacetValues !== "function") {
        throw new Error(
          "search for facet values (searchable) was called, but this client does not have a function client.searchForFacetValues"
        );
      }
      var state = this.state.setQueryParameters(userState || {});
      var isDisjunctive = state.isDisjunctiveFacet(facet);
      this._currentNbQueries++;
      var self = this;
      var searchForFacetValuesPromise;
      searchForFacetValuesPromise = this.client.searchForFacetValues({
        compositionID: state.index,
        facetName: facet,
        searchForFacetValuesRequest: {
          params: {
            query,
            maxFacetHits,
            searchQuery: requestBuilder._getCompositionHitsSearchParams(state)
          }
        }
      });
      this.emit("searchForFacetValues", {
        state,
        facet,
        query
      });
      return searchForFacetValuesPromise.then(
        function addIsRefined(content) {
          self._currentNbQueries--;
          if (self._currentNbQueries === 0) self.emit("searchQueueEmpty");
          content = content.results[0];
          content.facetHits.forEach(function(f) {
            f.escapedValue = escapeFacetValue(f.value);
            f.isRefined = isDisjunctive ? state.isDisjunctiveFacetRefined(facet, f.escapedValue) : state.isFacetRefined(facet, f.escapedValue);
          });
          return content;
        },
        function(e) {
          self._currentNbQueries--;
          if (self._currentNbQueries === 0) self.emit("searchQueueEmpty");
          throw e;
        }
      );
    };
    AlgoliaSearchHelper.prototype.setQuery = function(q) {
      this._change({
        state: this.state.resetPage().setQuery(q),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.clearRefinements = function(name) {
      this._change({
        state: this.state.resetPage().clearRefinements(name),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.clearTags = function() {
      this._change({
        state: this.state.resetPage().clearTags(),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addDisjunctiveFacetRefinement = function(facet, value) {
      this._change({
        state: this.state.resetPage().addDisjunctiveFacetRefinement(facet, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addDisjunctiveRefine = function() {
      return this.addDisjunctiveFacetRefinement.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.addHierarchicalFacetRefinement = function(facet, path) {
      this._change({
        state: this.state.resetPage().addHierarchicalFacetRefinement(facet, path),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addNumericRefinement = function(attribute, operator, value) {
      this._change({
        state: this.state.resetPage().addNumericRefinement(attribute, operator, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addFacetRefinement = function(facet, value) {
      this._change({
        state: this.state.resetPage().addFacetRefinement(facet, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addRefine = function() {
      return this.addFacetRefinement.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.addFacetExclusion = function(facet, value) {
      this._change({
        state: this.state.resetPage().addExcludeRefinement(facet, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addExclude = function() {
      return this.addFacetExclusion.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.addTag = function(tag) {
      this._change({
        state: this.state.resetPage().addTagRefinement(tag),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addFrequentlyBoughtTogether = function(params) {
      this._recommendChange({
        state: this.recommendState.addFrequentlyBoughtTogether(params)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addRelatedProducts = function(params) {
      this._recommendChange({
        state: this.recommendState.addRelatedProducts(params)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addTrendingItems = function(params) {
      this._recommendChange({
        state: this.recommendState.addTrendingItems(params)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addTrendingFacets = function(params) {
      this._recommendChange({
        state: this.recommendState.addTrendingFacets(params)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.addLookingSimilar = function(params) {
      this._recommendChange({
        state: this.recommendState.addLookingSimilar(params)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeNumericRefinement = function(attribute, operator, value) {
      this._change({
        state: this.state.resetPage().removeNumericRefinement(attribute, operator, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeDisjunctiveFacetRefinement = function(facet, value) {
      this._change({
        state: this.state.resetPage().removeDisjunctiveFacetRefinement(facet, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeDisjunctiveRefine = function() {
      return this.removeDisjunctiveFacetRefinement.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.removeHierarchicalFacetRefinement = function(facet) {
      this._change({
        state: this.state.resetPage().removeHierarchicalFacetRefinement(facet),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeFacetRefinement = function(facet, value) {
      this._change({
        state: this.state.resetPage().removeFacetRefinement(facet, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeRefine = function() {
      return this.removeFacetRefinement.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.removeFacetExclusion = function(facet, value) {
      this._change({
        state: this.state.resetPage().removeExcludeRefinement(facet, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeExclude = function() {
      return this.removeFacetExclusion.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.removeTag = function(tag) {
      this._change({
        state: this.state.resetPage().removeTagRefinement(tag),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeFrequentlyBoughtTogether = function(id) {
      this._recommendChange({
        state: this.recommendState.removeParams(id)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeRelatedProducts = function(id) {
      this._recommendChange({
        state: this.recommendState.removeParams(id)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeTrendingItems = function(id) {
      this._recommendChange({
        state: this.recommendState.removeParams(id)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeTrendingFacets = function(id) {
      this._recommendChange({
        state: this.recommendState.removeParams(id)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.removeLookingSimilar = function(id) {
      this._recommendChange({
        state: this.recommendState.removeParams(id)
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.toggleFacetExclusion = function(facet, value) {
      this._change({
        state: this.state.resetPage().toggleExcludeFacetRefinement(facet, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.toggleExclude = function() {
      return this.toggleFacetExclusion.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.toggleRefinement = function(facet, value) {
      return this.toggleFacetRefinement(facet, value);
    };
    AlgoliaSearchHelper.prototype.toggleFacetRefinement = function(facet, value) {
      this._change({
        state: this.state.resetPage().toggleFacetRefinement(facet, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.toggleRefine = function() {
      return this.toggleFacetRefinement.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.toggleTag = function(tag) {
      this._change({
        state: this.state.resetPage().toggleTagRefinement(tag),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.nextPage = function() {
      var page = this.state.page || 0;
      return this.setPage(page + 1);
    };
    AlgoliaSearchHelper.prototype.previousPage = function() {
      var page = this.state.page || 0;
      return this.setPage(page - 1);
    };
    function setCurrentPage(page) {
      if (page < 0) throw new Error("Page requested below 0.");
      this._change({
        state: this.state.setPage(page),
        isPageReset: false
      });
      return this;
    }
    AlgoliaSearchHelper.prototype.setCurrentPage = setCurrentPage;
    AlgoliaSearchHelper.prototype.setPage = setCurrentPage;
    AlgoliaSearchHelper.prototype.setIndex = function(name) {
      this._change({
        state: this.state.resetPage().setIndex(name),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.setQueryParameter = function(parameter, value) {
      this._change({
        state: this.state.resetPage().setQueryParameter(parameter, value),
        isPageReset: true
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.setState = function(newState) {
      this._change({
        state: SearchParameters.make(newState),
        isPageReset: false
      });
      return this;
    };
    AlgoliaSearchHelper.prototype.overrideStateWithoutTriggeringChangeEvent = function(newState) {
      this.state = new SearchParameters(newState);
      return this;
    };
    AlgoliaSearchHelper.prototype.hasRefinements = function(attribute) {
      if (objectHasKeys(this.state.getNumericRefinements(attribute))) {
        return true;
      } else if (this.state.isConjunctiveFacet(attribute)) {
        return this.state.isFacetRefined(attribute);
      } else if (this.state.isDisjunctiveFacet(attribute)) {
        return this.state.isDisjunctiveFacetRefined(attribute);
      } else if (this.state.isHierarchicalFacet(attribute)) {
        return this.state.isHierarchicalFacetRefined(attribute);
      }
      return false;
    };
    AlgoliaSearchHelper.prototype.isExcluded = function(facet, value) {
      return this.state.isExcludeRefined(facet, value);
    };
    AlgoliaSearchHelper.prototype.isDisjunctiveRefined = function(facet, value) {
      return this.state.isDisjunctiveFacetRefined(facet, value);
    };
    AlgoliaSearchHelper.prototype.hasTag = function(tag) {
      return this.state.isTagRefined(tag);
    };
    AlgoliaSearchHelper.prototype.isTagRefined = function() {
      return this.hasTagRefinements.apply(this, arguments);
    };
    AlgoliaSearchHelper.prototype.getIndex = function() {
      return this.state.index;
    };
    function getCurrentPage() {
      return this.state.page;
    }
    AlgoliaSearchHelper.prototype.getCurrentPage = getCurrentPage;
    AlgoliaSearchHelper.prototype.getPage = getCurrentPage;
    AlgoliaSearchHelper.prototype.getTags = function() {
      return this.state.tagRefinements;
    };
    AlgoliaSearchHelper.prototype.getRefinements = function(facetName) {
      var refinements = [];
      if (this.state.isConjunctiveFacet(facetName)) {
        var conjRefinements = this.state.getConjunctiveRefinements(facetName);
        conjRefinements.forEach(function(r) {
          refinements.push({
            value: r,
            type: "conjunctive"
          });
        });
        var excludeRefinements = this.state.getExcludeRefinements(facetName);
        excludeRefinements.forEach(function(r) {
          refinements.push({
            value: r,
            type: "exclude"
          });
        });
      } else if (this.state.isDisjunctiveFacet(facetName)) {
        var disjunctiveRefinements = this.state.getDisjunctiveRefinements(facetName);
        disjunctiveRefinements.forEach(function(r) {
          refinements.push({
            value: r,
            type: "disjunctive"
          });
        });
      }
      var numericRefinements = this.state.getNumericRefinements(facetName);
      Object.keys(numericRefinements).forEach(function(operator) {
        var value = numericRefinements[operator];
        refinements.push({
          value,
          operator,
          type: "numeric"
        });
      });
      return refinements;
    };
    AlgoliaSearchHelper.prototype.getNumericRefinement = function(attribute, operator) {
      return this.state.getNumericRefinement(attribute, operator);
    };
    AlgoliaSearchHelper.prototype.getHierarchicalFacetBreadcrumb = function(facetName) {
      return this.state.getHierarchicalFacetBreadcrumb(facetName);
    };
    AlgoliaSearchHelper.prototype._search = function(options) {
      var state = this.state;
      var states = [];
      var mainQueries = [];
      if (!options.onlyWithDerivedHelpers) {
        mainQueries = requestBuilder._getQueries(state.index, state);
        states.push({
          state,
          queriesCount: mainQueries.length,
          helper: this
        });
        this.emit("search", {
          state,
          results: this.lastResults
        });
      }
      var derivedQueries = this.derivedHelpers.map(function(derivedHelper) {
        var derivedState = derivedHelper.getModifiedState(state);
        var derivedStateQueries = derivedState.index ? requestBuilder._getQueries(derivedState.index, derivedState) : [];
        states.push({
          state: derivedState,
          queriesCount: derivedStateQueries.length,
          helper: derivedHelper
        });
        derivedHelper.emit("search", {
          state: derivedState,
          results: derivedHelper.lastResults
        });
        return derivedStateQueries;
      });
      var queries = Array.prototype.concat.apply(mainQueries, derivedQueries);
      var queryId = this._queryId++;
      this._currentNbQueries++;
      if (!queries.length) {
        return Promise.resolve({ results: [] }).then(
          this._dispatchAlgoliaResponse.bind(this, states, queryId)
        );
      }
      try {
        this.client.search(queries).then(this._dispatchAlgoliaResponse.bind(this, states, queryId)).catch(this._dispatchAlgoliaError.bind(this, queryId));
      } catch (error) {
        this.emit("error", {
          error
        });
      }
      return void 0;
    };
    AlgoliaSearchHelper.prototype._runComposition = function() {
      var state = this.state;
      var states = [];
      var mainQueries = [];
      var derivedQueries = this.derivedHelpers.map(function(derivedHelper) {
        var derivedState = derivedHelper.getModifiedState(state);
        var derivedStateQueries = requestBuilder._getCompositionQueries(derivedState);
        states.push({
          state: derivedState,
          helper: derivedHelper
        });
        derivedHelper.emit("search", {
          state: derivedState,
          results: derivedHelper.lastResults
        });
        return derivedStateQueries;
      });
      var queries = Array.prototype.concat.apply(mainQueries, derivedQueries);
      var queryId = this._queryId++;
      this._currentNbQueries++;
      if (!queries.length) {
        return Promise.resolve({ results: [] }).then(
          this._dispatchAlgoliaResponse.bind(this, states, queryId)
        );
      }
      if (queries.length > 1) {
        throw new Error("Only one query is allowed when using a composition.");
      }
      var query = queries[0];
      try {
        this.client.search(query).then(this._dispatchAlgoliaResponse.bind(this, states, queryId)).catch(this._dispatchAlgoliaError.bind(this, queryId));
      } catch (error) {
        this.emit("error", {
          error
        });
      }
      return void 0;
    };
    AlgoliaSearchHelper.prototype._recommend = function() {
      var searchState = this.state;
      var recommendState = this.recommendState;
      var index = this.getIndex();
      var states = [{ state: recommendState, index, helper: this }];
      var ids = recommendState.params.map(function(param) {
        return param.$$id;
      });
      this.emit("fetch", {
        recommend: {
          state: recommendState,
          results: this.lastRecommendResults
        }
      });
      var cache = this._recommendCache;
      var derivedQueries = this.derivedHelpers.map(function(derivedHelper) {
        var derivedIndex = derivedHelper.getModifiedState(searchState).index;
        if (!derivedIndex) {
          return [];
        }
        var derivedState = derivedHelper.getModifiedRecommendState(
          new RecommendParameters()
        );
        states.push({
          state: derivedState,
          index: derivedIndex,
          helper: derivedHelper
        });
        ids = Array.prototype.concat.apply(
          ids,
          derivedState.params.map(function(param) {
            return param.$$id;
          })
        );
        derivedHelper.emit("fetch", {
          recommend: {
            state: derivedState,
            results: derivedHelper.lastRecommendResults
          }
        });
        return derivedState._buildQueries(derivedIndex, cache);
      });
      var queries = Array.prototype.concat.apply(
        this.recommendState._buildQueries(index, cache),
        derivedQueries
      );
      if (queries.length === 0) {
        return;
      }
      if (queries.length > 0 && typeof this.client.getRecommendations === "undefined") {
        console.warn(
          "Please update algoliasearch/lite to the latest version in order to use recommend widgets."
        );
        return;
      }
      var queryId = this._recommendQueryId++;
      this._currentNbRecommendQueries++;
      try {
        this.client.getRecommendations(queries).then(this._dispatchRecommendResponse.bind(this, queryId, states, ids)).catch(this._dispatchRecommendError.bind(this, queryId));
      } catch (error) {
        this.emit("error", {
          error
        });
      }
      return;
    };
    AlgoliaSearchHelper.prototype._dispatchAlgoliaResponse = function(states, queryId, content) {
      var self = this;
      if (queryId < this._lastQueryIdReceived) {
        return;
      }
      this._currentNbQueries -= queryId - this._lastQueryIdReceived;
      this._lastQueryIdReceived = queryId;
      if (this._currentNbQueries === 0) this.emit("searchQueueEmpty");
      var results = content.results.slice();
      var rawContent = Object.keys(content).reduce(function(value, key) {
        if (key !== "results") value[key] = content[key];
        return value;
      }, {});
      if (Object.keys(rawContent).length <= 0) {
        rawContent = void 0;
      }
      states.forEach(function(s) {
        var state = s.state;
        var queriesCount = s.queriesCount;
        var helper = s.helper;
        var specificResults = queriesCount !== void 0 ? results.splice(0, queriesCount) : results;
        if (!state.index) {
          helper.emit("result", {
            results: null,
            state
          });
          return;
        }
        if (specificResults.length > 0 && specificResults[0].feedID) {
          var feeds = specificResults.map(function(r) {
            var sr = new SearchResults(state, [r], self._searchResultsOptions);
            if (rawContent !== void 0) sr._rawContent = rawContent;
            return sr;
          });
          helper.lastResults = new SearchResults(
            state,
            [specificResults[0]],
            self._searchResultsOptions
          );
          helper.lastResults.feeds = feeds;
          if (rawContent !== void 0) helper.lastResults._rawContent = rawContent;
        } else {
          helper.lastResults = new SearchResults(
            state,
            specificResults,
            self._searchResultsOptions
          );
          if (rawContent !== void 0) helper.lastResults._rawContent = rawContent;
        }
        helper.emit("result", {
          results: helper.lastResults,
          state
        });
      });
    };
    AlgoliaSearchHelper.prototype._dispatchRecommendResponse = function(queryId, states, ids, content) {
      if (queryId < this._lastRecommendQueryIdReceived) {
        return;
      }
      this._currentNbRecommendQueries -= queryId - this._lastRecommendQueryIdReceived;
      this._lastRecommendQueryIdReceived = queryId;
      if (this._currentNbRecommendQueries === 0) this.emit("recommendQueueEmpty");
      var cache = this._recommendCache;
      var idsMap = {};
      ids.filter(function(id) {
        return cache[id] === void 0;
      }).forEach(function(id, index) {
        if (!idsMap[id]) idsMap[id] = [];
        idsMap[id].push(index);
      });
      Object.keys(idsMap).forEach(function(id) {
        var indices = idsMap[id];
        var firstResult = content.results[indices[0]];
        if (indices.length === 1) {
          cache[id] = firstResult;
          return;
        }
        cache[id] = Object.assign({}, firstResult, {
          hits: sortAndMergeRecommendations(
            ids,
            indices.map(function(idx) {
              return content.results[idx].hits;
            })
          )
        });
      });
      var results = {};
      ids.forEach(function(id) {
        results[id] = cache[id];
      });
      states.forEach(function(s) {
        var state = s.state;
        var helper = s.helper;
        if (!s.index) {
          helper.emit("recommend:result", {
            results: null,
            state
          });
          return;
        }
        helper.lastRecommendResults = new RecommendResults(state, results);
        helper.emit("recommend:result", {
          recommend: {
            results: helper.lastRecommendResults,
            state
          }
        });
      });
    };
    AlgoliaSearchHelper.prototype._dispatchAlgoliaError = function(queryId, error) {
      if (queryId < this._lastQueryIdReceived) {
        return;
      }
      this._currentNbQueries -= queryId - this._lastQueryIdReceived;
      this._lastQueryIdReceived = queryId;
      this.emit("error", {
        error
      });
      if (this._currentNbQueries === 0) this.emit("searchQueueEmpty");
    };
    AlgoliaSearchHelper.prototype._dispatchRecommendError = function(queryId, error) {
      if (queryId < this._lastRecommendQueryIdReceived) {
        return;
      }
      this._currentNbRecommendQueries -= queryId - this._lastRecommendQueryIdReceived;
      this._lastRecommendQueryIdReceived = queryId;
      this.emit("error", {
        error
      });
      if (this._currentNbRecommendQueries === 0) this.emit("recommendQueueEmpty");
    };
    AlgoliaSearchHelper.prototype.containsRefinement = function(query, facetFilters, numericFilters, tagFilters) {
      return query || facetFilters.length !== 0 || numericFilters.length !== 0 || tagFilters.length !== 0;
    };
    AlgoliaSearchHelper.prototype._hasDisjunctiveRefinements = function(facet) {
      return this.state.disjunctiveRefinements[facet] && this.state.disjunctiveRefinements[facet].length > 0;
    };
    AlgoliaSearchHelper.prototype._change = function(event) {
      var state = event.state;
      var isPageReset = event.isPageReset;
      if (state !== this.state) {
        this.state = state;
        this.emit("change", {
          state: this.state,
          results: this.lastResults,
          isPageReset
        });
      }
    };
    AlgoliaSearchHelper.prototype._recommendChange = function(event) {
      var state = event.state;
      if (state !== this.recommendState) {
        this.recommendState = state;
        this.emit("recommend:change", {
          search: {
            results: this.lastResults,
            state: this.state
          },
          recommend: {
            results: this.lastRecommendResults,
            state: this.recommendState
          }
        });
      }
    };
    AlgoliaSearchHelper.prototype.clearCache = function() {
      if (this.client.clearCache) this.client.clearCache();
      return this;
    };
    AlgoliaSearchHelper.prototype.setClient = function(newClient) {
      if (this.client === newClient) return this;
      if (typeof newClient.addAlgoliaAgent === "function") {
        newClient.addAlgoliaAgent("JS Helper (" + version + ")");
      }
      this.client = newClient;
      return this;
    };
    AlgoliaSearchHelper.prototype.getClient = function() {
      return this.client;
    };
    AlgoliaSearchHelper.prototype.derive = function(fn, recommendFn) {
      var derivedHelper = new DerivedHelper(this, fn, recommendFn);
      this.derivedHelpers.push(derivedHelper);
      return derivedHelper;
    };
    AlgoliaSearchHelper.prototype.detachDerivedHelper = function(derivedHelper) {
      var pos = this.derivedHelpers.indexOf(derivedHelper);
      if (pos === -1) throw new Error("Derived helper already detached");
      this.derivedHelpers.splice(pos, 1);
    };
    AlgoliaSearchHelper.prototype.hasPendingRequests = function() {
      return this._currentNbQueries > 0;
    };
    module.exports = AlgoliaSearchHelper;
  }
});

// node_modules/algoliasearch-helper/index.js
var require_index = __commonJS({
  "node_modules/algoliasearch-helper/index.js"(exports, module) {
    var AlgoliaSearchHelper = require_algoliasearch_helper();
    var RecommendParameters = require_RecommendParameters();
    var RecommendResults = require_RecommendResults();
    var SearchParameters = require_SearchParameters();
    var SearchResults = require_SearchResults();
    function algoliasearchHelper(client, index, opts, searchResultsOptions) {
      return new AlgoliaSearchHelper(client, index, opts, searchResultsOptions);
    }
    algoliasearchHelper.version = require_version();
    algoliasearchHelper.AlgoliaSearchHelper = AlgoliaSearchHelper;
    algoliasearchHelper.SearchParameters = SearchParameters;
    algoliasearchHelper.RecommendParameters = RecommendParameters;
    algoliasearchHelper.SearchResults = SearchResults;
    algoliasearchHelper.RecommendResults = RecommendResults;
    module.exports = algoliasearchHelper;
  }
});
export default require_index();
