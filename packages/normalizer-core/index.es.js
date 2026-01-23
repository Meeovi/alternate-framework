import { onServerPrefetch, ref, isRef, useRouter, computed, unref } from 'vue';
import merge from 'lodash-es/merge';
import axios from 'axios';

var onSSR = onServerPrefetch;
var vsfRef = ref;
var configureSSR = function (config) {
    onSSR = config.onSSR || onSSR;
    vsfRef = config.vsfRef || vsfRef;
};

function sharedRef(value, key) {
    var $sharedRefsMap = useVSFContext().$sharedRefsMap;
    var givenKey = key || value;
    if ($sharedRefsMap.has(givenKey)) {
        return $sharedRefsMap.get(givenKey);
    }
    var newRef = vsfRef(key ? value : null, givenKey);
    $sharedRefsMap.set(givenKey, newRef);
    return newRef;
}

function wrap(element) {
    return isRef(element) ? element : ref(element);
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var LogName;
(function (LogName) {
    LogName["Error"] = "error";
    LogName["Info"] = "info";
    LogName["Debug"] = "debug";
    LogName["None"] = "none";
    LogName["Warn"] = "warn";
})(LogName || (LogName = {}));
var LogLevelStyle = {
    Log: 'background:#5ece7b; padding: 2px; border-radius: 0 2px 2px 0;  color: #fff;',
    Info: 'background:#0468DB; padding: 2px; border-radius: 0 2px 2px 0;  color: #fff;',
    Warn: 'background:#ecc713; padding: 2px; border-radius: 0 2px 2px 0;  color: #000;',
    Error: 'background:#d12727; padding: 2px; border-radius: 0 2px 2px 0;  color: #fff'
};

var detectNode = Object.prototype
    .toString
    .call(typeof process !== 'undefined'
    ? process
    : 0) === '[object process]' ||
    process.env.APPLICATION_ENV === 'production';
var mountLog = function (name, style) {
    if (detectNode) {
        return ["".concat(name, ": ")];
    }
    return [
        "%c".concat(name, "%c:"),
        style,
        'background: transparent;'
    ];
};

function makeMessageStyle(logEnum) {
    switch (logEnum) {
        case LogName.Error:
            return mountLog('[VSF][error]', LogLevelStyle.Error);
        case LogName.Info:
            return mountLog('[VSF][info]', LogLevelStyle.Info);
        case LogName.Warn:
            return mountLog('[VSF][warn]', LogLevelStyle.Warn);
        case LogName.Debug:
            return mountLog('[VSF][debug]', LogLevelStyle.Log);
        case LogName.None:
        default:
            return mountLog('[VSF]', LogLevelStyle.Log);
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function makeMethod(logEnum, fn) {
    return function () {
        return Function.prototype.bind.apply(fn, __spreadArray([
            console
        ], makeMessageStyle(logEnum), true));
    };
}

/* istanbul ignore file */
var defaultLogger = {
    debug: makeMethod(LogName.Debug, console.debug)(),
    info: makeMethod(LogName.Info, console.info)(),
    warn: makeMethod(LogName.Warn, console.warn)(),
    error: makeMethod(LogName.Error, console.error)()
};

var defaultModes = {
    // Test
    test: 'none',
    // Development
    dev: 'warn',
    development: 'warn',
    // Production
    prod: 'error',
    production: 'error',
    // Fallback
    default: 'warn'
};
var Logger = defaultLogger;
var registerLogger = function (loggerImplementation, verbosity) {
    if (typeof loggerImplementation === 'function') {
        Logger = loggerImplementation(verbosity);
        return;
    }
    switch (verbosity) {
        case 'info':
            Logger = __assign(__assign(__assign({}, defaultLogger), loggerImplementation), { debug: function () { } });
            break;
        case 'warn':
            Logger = __assign(__assign(__assign({}, defaultLogger), loggerImplementation), { info: function () { }, debug: function () { } });
            break;
        case 'error':
            Logger = __assign(__assign(__assign({}, defaultLogger), loggerImplementation), { info: function () { }, warn: function () { }, debug: function () { } });
            break;
        case 'none':
            Logger = {
                debug: function () { },
                info: function () { },
                warn: function () { },
                error: function () { }
            };
            break;
        default:
            Logger = __assign(__assign({}, defaultLogger), loggerImplementation);
    }
};
registerLogger(defaultLogger, defaultModes[process.env.NODE_ENV] || defaultModes.default);

/**
 * Adds prefix with base path configured in router.base to provided url
 * @param {string} path - url to which base path will be added
 * @returns Relative path prefixed with router.base or not modified absolute path (it needs start from http or https)
 */
function addBasePath(path) {
    var pattern = /^((http|https):\/\/)/;
    if (pattern.test(path)) {
        return path;
    }
    var basePath = (useRouter().options.base).slice(0, -1);
    return "".concat(basePath).concat(path);
}

var maskString = function (el) { return "".concat(el.charAt(0), "***").concat(el.slice(-1)); };
var maskAny = function (el) {
    if (typeof el === 'string') {
        return maskString(el);
    }
    return '***';
};
var mask = function (el) {
    if (typeof el === 'object' && !Array.isArray(el)) {
        return Object.keys(el).reduce(function (prev, key) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = maskAny(el[key]), _a)));
        }, {});
    }
    return maskAny(el);
};

var useVSFContext = function () { return ({}); };
var configureContext = function (config) {
    useVSFContext = config.useVSFContext || useVSFContext;
};
var generateContext = function (factoryParams) {
    var vsfContext = useVSFContext();
    if (factoryParams.provide) {
        return __assign(__assign({}, vsfContext.$vsf), factoryParams.provide(vsfContext.$vsf));
    }
    return vsfContext.$vsf;
};

/**
 * It extends given integartion, defined by `tag` in the context.
 */
var createExtendIntegrationInCtx = function (_a) {
    var tag = _a.tag, nuxtCtx = _a.nuxtCtx, inject = _a.inject;
    return function (integrationProperties) {
        var _a;
        var integrationKey = '$' + tag;
        if (!nuxtCtx.$vsf || !nuxtCtx.$vsf[integrationKey]) {
            inject('vsf', (_a = {}, _a[integrationKey] = {}, _a));
        }
        Object.keys(integrationProperties)
            .filter(function (k) { return !['api', 'client', 'config'].includes(k); })
            .forEach(function (key) {
            nuxtCtx.$vsf[integrationKey][key] = integrationProperties[key];
        });
    };
};
/**
 * It creates a function that adds an integration to the context under the given name, defined by `tag`.
 */
var createAddIntegrationToCtx = function (_a) {
    var tag = _a.tag, nuxtCtx = _a.nuxtCtx, inject = _a.inject;
    return function (integrationProperties) {
        var _a;
        var integrationKey = '$' + tag;
        if (nuxtCtx.$vsf && !nuxtCtx.$vsf[integrationKey]) {
            nuxtCtx.$vsf[integrationKey] = integrationProperties;
            return;
        }
        inject('vsf', (_a = {}, _a[integrationKey] = integrationProperties, _a));
    };
};

var createProxiedApi = function (_a) {
    var givenApi = _a.givenApi, client = _a.client, tag = _a.tag;
    return new Proxy(givenApi, {
        get: function (target, prop, receiver) {
            var functionName = String(prop);
            if (Reflect.has(target, functionName)) {
                return Reflect.get(target, prop, receiver);
            }
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, client
                                .post("/".concat(tag, "/").concat(functionName), args)
                                .then(function (r) { return r.data; })];
                    });
                });
            };
        }
    });
};
var getCookies = function (context) { var _a, _b, _c; return (_c = (_b = (_a = context === null || context === void 0 ? void 0 : context.req) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b.cookie) !== null && _c !== void 0 ? _c : ''; };
var getIntegrationConfig = function (context, configuration) {
    var _a;
    var cookie = getCookies(context);
    if (process.server && ((_a = context === null || context === void 0 ? void 0 : context.$config) === null || _a === void 0 ? void 0 : _a.middlewareUrl)) {
        Logger.info('Applied middlewareUrl as ', context.$config.middlewareUrl);
    }
    var _b = context.$config, middlewareUrl = _b.middlewareUrl, ssrMiddlewareUrl = _b.ssrMiddlewareUrl;
    if (!middlewareUrl) {
        throw new Error('`middlewareUrl` is required. Provide the `middlewareUrl` in your integration\'s configuration.');
    }
    var baseURL = process.server ? ssrMiddlewareUrl || middlewareUrl : middlewareUrl;
    if (!baseURL.match(/https?:\/\//) && baseURL.charAt(0) !== '/') {
        baseURL = "/".concat(baseURL);
    }
    return merge({
        axios: {
            baseURL: baseURL,
            headers: __assign(__assign({}, (cookie ? { cookie: cookie } : {})), (context.req ? { Host: context.req.headers['x-forwarded-host'] || context.req.headers.host } : {}))
        }
    }, configuration);
};

var parseCookies = function (cookieString) {
    return cookieString
        .split(';')
        .filter(String)
        .map(function (item) { return item.split('=').map(function (part) { return part.trim(); }); })
        .reduce(function (obj, _a) {
        var _b;
        var name = _a[0], value = _a[1];
        return (__assign(__assign({}, obj), (_b = {}, _b[name] = value, _b)));
    }, {});
};
var setCookieValues = function (cookieValues, cookieString) {
    if (cookieString === void 0) { cookieString = ''; }
    var parsed = parseCookies(cookieString);
    Object.entries(cookieValues).forEach(function (_a) {
        var name = _a[0], value = _a[1];
        return parsed[name] = value;
    });
    return Object.entries(parsed).map(function (_a) {
        var name = _a[0], value = _a[1];
        return "".concat(name, "=").concat(value);
    }).join('; ');
};
var integrationPlugin = function (pluginFn) { return function (nuxtCtx, inject) {
    var configure = function (tag, configuration) {
        var injectInContext = createAddIntegrationToCtx({ tag: tag, nuxtCtx: nuxtCtx, inject: inject });
        var config = getIntegrationConfig(nuxtCtx, configuration);
        var client = axios.create(config.axios);
        var api = createProxiedApi({ givenApi: configuration.api || {}, client: client, tag: tag });
        if (nuxtCtx.app.i18n.cookieValues) {
            client.defaults.headers.cookie = setCookieValues(nuxtCtx.app.i18n.cookieValues, client.defaults.headers.cookie.toString());
        }
        injectInContext({ api: api, client: client, config: config });
    };
    var extend = function (tag, integrationProperties) {
        createExtendIntegrationInCtx({ tag: tag, nuxtCtx: nuxtCtx, inject: inject })(integrationProperties);
    };
    var integration = { configure: configure, extend: extend };
    pluginFn(__assign(__assign({}, nuxtCtx), { integration: integration }), inject);
}; };

var createFactoryParamsMethod = function (fn, fnName, context) { return function (argObj) {
    if (fnName === 'provide') {
        return fn(context);
    }
    return fn(context, argObj);
}; };
var createFactoryParamsReducer$1 = function (context) { return function (prev, _a) {
    var _b;
    var fnName = _a[0], fn = _a[1];
    return (__assign(__assign({}, prev), (_b = {}, _b[fnName] = createFactoryParamsMethod(fn, fnName, context), _b)));
}; };
var createCommonMethods = function (factoryParams, context) {
    return Object.entries(factoryParams)
        .reduce(createFactoryParamsReducer$1(context), {});
};

var createPlatformMethod = function (context, refs, functionObject) { return function (params) { return __awaiter(void 0, void 0, void 0, function () {
    var mainRef, loading, error, alias, _a, err_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                mainRef = refs.mainRef, loading = refs.loading, error = refs.error, alias = refs.alias;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, 4, 5]);
                loading.value = true;
                _a = mainRef;
                return [4 /*yield*/, functionObject.fn(context, __assign(__assign({}, params), (_b = {}, _b[alias] = mainRef.value, _b)))];
            case 2:
                _a.value = _c.sent();
                loading.value = false;
                return [3 /*break*/, 5];
            case 3:
                err_1 = _c.sent();
                error.value[functionObject.fnName] = err_1;
                Logger.error("api.".concat(functionObject.fnName), err_1);
                return [3 /*break*/, 5];
            case 4:
                loading.value = false;
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); }; };
var createFactoryParamsReducer = function (context, refs) { return function (prev, _a) {
    var _b;
    var fnName = _a[0], fn = _a[1];
    return (__assign(__assign({}, prev), (_b = {}, _b[fnName] = createPlatformMethod(context, refs, { fnName: fnName, fn: fn }), _b)));
}; };
var createPlatformMethods = function (apiSection, context, refs) {
    return Object.entries(apiSection).reduce(createFactoryParamsReducer(context, refs), {});
};

var configureFactoryParams = function (factoryParams, refs) {
    if (refs === void 0) { refs = null; }
    var context = generateContext(factoryParams);
    var api = factoryParams.api, methods = __rest(factoryParams, ["api"]);
    var commonMethods = createCommonMethods(methods, context);
    var platformMethods = refs ? createPlatformMethods(api || {}, context, refs) : {};
    return __assign(__assign({}, commonMethods), { api: platformMethods });
};

var i18nRedirectsUtil = function (_a) {
    var _b;
    var path = _a.path, defaultLocale = _a.defaultLocale, availableLocales = _a.availableLocales, cookieLocale = _a.cookieLocale, acceptedLanguages = _a.acceptedLanguages, autoRedirectByLocale = _a.autoRedirectByLocale;
    var localeRegexp = new RegExp("^/(?<locale>".concat(availableLocales.join('|'), ")(?=(/|$))"), 'g');
    var localeFromPath = (_b = localeRegexp.exec(path)) === null || _b === void 0 ? void 0 : _b.groups.locale;
    var strippedLocaleFromPath = path.replace("/".concat(localeFromPath), '');
    var removeTailingSlash = function (path) { return path.replace(/\/$/, ''); };
    var getTargetLocale = function () {
        var languagesOrderedByPriority = __spreadArray(__spreadArray(__spreadArray([
            localeFromPath
        ], (autoRedirectByLocale && [cookieLocale]), true), (autoRedirectByLocale && acceptedLanguages), true), [
            defaultLocale
        ], false);
        return languagesOrderedByPriority.find(function (code) { return availableLocales.includes(code); });
    };
    var getRedirectPath = function () {
        var targetLocale = getTargetLocale();
        var isTargetDefaultLocale = targetLocale === defaultLocale;
        var isTargetInPath = targetLocale === localeFromPath;
        if (!localeFromPath && !isTargetInPath && !isTargetDefaultLocale) {
            return removeTailingSlash("/".concat(targetLocale).concat(strippedLocaleFromPath));
        }
        return '';
    };
    return {
        getRedirectPath: getRedirectPath,
        getTargetLocale: getTargetLocale
    };
};

var nopBefore = function (_a) {
    var args = _a.args;
    return args;
};
var nopAfter = function (_a) {
    var response = _a.response;
    return response;
};
var createExtendQuery = function (context) { return function (customQuery, defaults) {
    var customQueries = context.customQueries || {};
    var queryArgs = customQuery || {};
    var metadata = (customQuery && customQuery.metadata) || {};
    return Object.entries(defaults)
        .reduce(function (prev, _a) {
        var _b;
        var queryName = _a[0], initialArgs = _a[1];
        var queryFn = customQueries[queryArgs[queryName]] || (function () { return initialArgs; });
        return __assign(__assign({}, prev), (_b = {}, _b[queryName] = queryFn(__assign(__assign({}, initialArgs), { metadata: metadata })), _b));
    }, {});
}; };
var applyContextToApi = function (api, context, 
/**
 * By default we use NOP function for returning the same parameters as they come.
 * It's useful in extensions, when someone don't want to inject into changing arguments or the response,
 * in that case, we use default function, to handle that scenario - NOP
 */
hooks) {
    if (hooks === void 0) { hooks = { before: nopBefore, after: nopAfter }; }
    return Object.entries(api)
        .reduce(function (prev, _a) {
        var _b;
        var callName = _a[0], fn = _a[1];
        return (__assign(__assign({}, prev), (_b = {}, _b[callName] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(void 0, void 0, void 0, function () {
                var extendQuery, transformedArgs, apiClientContext, response, transformedResponse;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            extendQuery = createExtendQuery(context);
                            transformedArgs = hooks.before({ callName: callName, args: args });
                            apiClientContext = __assign(__assign({}, context), { extendQuery: extendQuery });
                            return [4 /*yield*/, fn.apply(void 0, __spreadArray([apiClientContext], transformedArgs, false))];
                        case 1:
                            response = _a.sent();
                            transformedResponse = hooks.after({ callName: callName, args: args, response: response });
                            return [2 /*return*/, transformedResponse];
                    }
                });
            });
        }, _b)));
    }, {});
};

var isFn = function (x) { return typeof x === 'function'; };
var apiClientFactory = function (factoryParams) {
    function createApiClient(config, customApi) {
        var _this = this;
        var _a;
        if (customApi === void 0) { customApi = {}; }
        var rawExtensions = ((_a = this === null || this === void 0 ? void 0 : this.middleware) === null || _a === void 0 ? void 0 : _a.extensions) || [];
        var lifecycles = Object.values(rawExtensions)
            .filter(function (ext) { return isFn(ext.hooks); })
            .map(function (_a) {
            var _b, _c;
            var hooks = _a.hooks;
            return hooks((_b = _this === null || _this === void 0 ? void 0 : _this.middleware) === null || _b === void 0 ? void 0 : _b.req, (_c = _this === null || _this === void 0 ? void 0 : _this.middleware) === null || _c === void 0 ? void 0 : _c.res);
        });
        var extendedApis = Object.keys(rawExtensions)
            .reduce(function (prev, curr) { return (__assign(__assign({}, prev), rawExtensions[curr].extendApiMethods)); }, customApi);
        var _config = lifecycles
            .filter(function (ext) { return isFn(ext.beforeCreate); })
            .reduce(function (prev, curr) { return curr.beforeCreate({ configuration: prev }); }, config);
        var settings = factoryParams.onCreate ? factoryParams.onCreate(_config) : { config: config, client: config.client };
        Logger.debug('apiClientFactory.create', settings);
        settings.config = lifecycles
            .filter(function (ext) { return isFn(ext.afterCreate); })
            .reduce(function (prev, curr) { return curr.afterCreate({ configuration: prev }); }, settings.config);
        var extensionHooks = {
            before: function (params) { return lifecycles
                .filter(function (e) { return isFn(e.beforeCall); })
                .reduce(function (args, e) { return e.beforeCall(__assign(__assign({}, params), { configuration: settings.config, args: args })); }, params.args); },
            after: function (params) { return lifecycles
                .filter(function (e) { return isFn(e.afterCall); })
                .reduce(function (response, e) { return e.afterCall(__assign(__assign({}, params), { configuration: settings.config, response: response })); }, params.response); }
        };
        var api = applyContextToApi(__assign(__assign({}, factoryParams.api), extendedApis), __assign(__assign({}, settings), (this === null || this === void 0 ? void 0 : this.middleware) || {}), extensionHooks);
        return {
            api: api,
            client: settings.client,
            settings: settings.config
        };
    }
    createApiClient._predefinedExtensions = factoryParams.extensions || [];
    return { createApiClient: createApiClient };
};

var useBillingFactory = function (factoryParams) {
    return function useBilling() {
        var _this = this;
        var loading = sharedRef(false, 'useBilling-loading');
        var billing = sharedRef(null, 'useBilling-billing');
        var error = sharedRef({
            load: null,
            save: null
        }, 'useBilling-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: billing, alias: 'currentBilling', loading: loading, error: error });
        var load = function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.customQuery, customQuery = _c === void 0 ? null : _c;
            return __awaiter(_this, void 0, void 0, function () {
                var billingInfo, err_1;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            Logger.debug('useBilling.load');
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.load({ customQuery: customQuery })];
                        case 2:
                            billingInfo = _d.sent();
                            error.value.load = null;
                            billing.value = billingInfo;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _d.sent();
                            error.value.load = err_1;
                            Logger.error('useBilling/load', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var save = function (saveParams) { return __awaiter(_this, void 0, void 0, function () {
            var billingInfo, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Logger.debug('useBilling.save');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        return [4 /*yield*/, _factoryParams.save(saveParams)];
                    case 2:
                        billingInfo = _a.sent();
                        error.value.save = null;
                        billing.value = billingInfo;
                        return [3 /*break*/, 5];
                    case 3:
                        err_2 = _a.sent();
                        error.value.save = err_2;
                        Logger.error('useBilling/save', err_2);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            api: _factoryParams.api,
            billing: computed(function () { return billing.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; }),
            load: load,
            save: save
        };
    };
};

var useCartFactory = function (factoryParams) {
    return function useCart() {
        var _this = this;
        var loading = sharedRef(false, 'useCart-loading');
        var cart = sharedRef(null, 'useCart-cart');
        var error = sharedRef({
            addItem: null,
            removeItem: null,
            updateItemQty: null,
            load: null,
            clear: null,
            applyCoupon: null,
            removeCoupon: null
        }, 'useCart-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: cart, alias: 'currentCart', loading: loading, error: error });
        var setCart = function (newCart) {
            cart.value = newCart;
            Logger.debug('useCartFactory.setCart', newCart);
        };
        var addItem = function (_a) {
            var product = _a.product, quantity = _a.quantity, customQuery = _a.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var updatedCart, err_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            Logger.debug('useCart.addItem', { product: product, quantity: quantity });
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.addItem({
                                    currentCart: cart.value,
                                    product: product,
                                    quantity: quantity,
                                    customQuery: customQuery
                                })];
                        case 2:
                            updatedCart = _b.sent();
                            error.value.addItem = null;
                            cart.value = updatedCart;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _b.sent();
                            error.value.addItem = err_1;
                            Logger.error('useCart/addItem', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var removeItem = function (_a) {
            var product = _a.product, customQuery = _a.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var updatedCart, err_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            Logger.debug('useCart.removeItem', { product: product });
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.removeItem({
                                    currentCart: cart.value,
                                    product: product,
                                    customQuery: customQuery
                                })];
                        case 2:
                            updatedCart = _b.sent();
                            error.value.removeItem = null;
                            cart.value = updatedCart;
                            return [3 /*break*/, 5];
                        case 3:
                            err_2 = _b.sent();
                            error.value.removeItem = err_2;
                            Logger.error('useCart/removeItem', err_2);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var updateItemQty = function (_a) {
            var product = _a.product, quantity = _a.quantity, customQuery = _a.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var updatedCart, err_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            Logger.debug('useCart.updateItemQty', { product: product, quantity: quantity });
                            if (!(quantity && quantity > 0)) return [3 /*break*/, 5];
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.updateItemQty({
                                    currentCart: cart.value,
                                    product: product,
                                    quantity: quantity,
                                    customQuery: customQuery
                                })];
                        case 2:
                            updatedCart = _b.sent();
                            error.value.updateItemQty = null;
                            cart.value = updatedCart;
                            return [3 /*break*/, 5];
                        case 3:
                            err_3 = _b.sent();
                            error.value.updateItemQty = err_3;
                            Logger.error('useCart/updateItemQty', err_3);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var load = function (_a) {
            var _b = _a === void 0 ? { customQuery: undefined } : _a, customQuery = _b.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var _c, err_4;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            Logger.debug('useCart.load');
                            if (cart.value) {
                                /**
                                 * Triggering change for hydration purpose,
                                 * temporary issue related with cpapi plugin
                                 */
                                loading.value = false;
                                error.value.load = null;
                                cart.value = __assign({}, cart.value);
                                return [2 /*return*/];
                            }
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _c = cart;
                            return [4 /*yield*/, _factoryParams.load({ customQuery: customQuery })];
                        case 2:
                            _c.value = _d.sent();
                            error.value.load = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_4 = _d.sent();
                            error.value.load = err_4;
                            Logger.error('useCart/load', err_4);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var clear = function () { return __awaiter(_this, void 0, void 0, function () {
            var updatedCart, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Logger.debug('useCart.clear');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        return [4 /*yield*/, _factoryParams.clear({ currentCart: cart.value })];
                    case 2:
                        updatedCart = _a.sent();
                        error.value.clear = null;
                        cart.value = updatedCart;
                        return [3 /*break*/, 5];
                    case 3:
                        err_5 = _a.sent();
                        error.value.clear = err_5;
                        Logger.error('useCart/clear', err_5);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        var isInCart = function (_a) {
            var product = _a.product;
            return _factoryParams.isInCart({
                currentCart: cart.value,
                product: product
            });
        };
        var applyCoupon = function (_a) {
            var couponCode = _a.couponCode, customQuery = _a.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var updatedCart, err_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            Logger.debug('useCart.applyCoupon');
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.applyCoupon({
                                    currentCart: cart.value,
                                    couponCode: couponCode,
                                    customQuery: customQuery
                                })];
                        case 2:
                            updatedCart = (_b.sent()).updatedCart;
                            error.value.applyCoupon = null;
                            cart.value = updatedCart;
                            return [3 /*break*/, 5];
                        case 3:
                            err_6 = _b.sent();
                            error.value.applyCoupon = err_6;
                            Logger.error('useCart/applyCoupon', err_6);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var removeCoupon = function (_a) {
            var couponCode = _a.couponCode, customQuery = _a.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var updatedCart, err_7;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            Logger.debug('useCart.removeCoupon');
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.removeCoupon({
                                    currentCart: cart.value,
                                    couponCode: couponCode,
                                    customQuery: customQuery
                                })];
                        case 2:
                            updatedCart = (_b.sent()).updatedCart;
                            error.value.removeCoupon = null;
                            cart.value = updatedCart;
                            loading.value = false;
                            return [3 /*break*/, 5];
                        case 3:
                            err_7 = _b.sent();
                            error.value.removeCoupon = err_7;
                            Logger.error('useCart/removeCoupon', err_7);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return {
            api: _factoryParams.api,
            setCart: setCart,
            cart: computed(function () { return cart.value; }),
            isInCart: isInCart,
            addItem: addItem,
            load: load,
            removeItem: removeItem,
            clear: clear,
            updateItemQty: updateItemQty,
            applyCoupon: applyCoupon,
            removeCoupon: removeCoupon,
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
};

function useCategoryFactory(factoryParams) {
    return function useCategory(id) {
        var _this = this;
        var categories = sharedRef([], "useCategory-categories-".concat(id));
        var loading = sharedRef(false, "useCategory-loading-".concat(id));
        var error = sharedRef({
            search: null
        }, "useCategory-error-".concat(id));
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: categories, alias: 'currentCategories', loading: loading, error: error });
        var search = function (searchParams) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug("useCategory/".concat(id, "/search"), searchParams);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = categories;
                        return [4 /*yield*/, _factoryParams.categorySearch(searchParams)];
                    case 2:
                        _a.value = _b.sent();
                        error.value.search = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        error.value.search = err_1;
                        Logger.error("useCategory/".concat(id, "/search"), err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            api: _factoryParams.api,
            search: search,
            loading: computed(function () { return loading.value; }),
            categories: computed(function () { return categories.value; }),
            error: computed(function () { return error.value; })
        };
    };
}

function useContentFactory(factoryParams) {
    return function useContent(id) {
        var _this = this;
        var content = sharedRef([], "useContent-content-".concat(id));
        var loading = sharedRef(false, "useContent-loading-".concat(id));
        var error = sharedRef({
            search: null
        }, "useContent-error-".concat(id));
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: content, alias: 'currentContent', loading: loading, error: error });
        var search = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug("useContent/".concat(id, "/search"), params);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = content;
                        return [4 /*yield*/, _factoryParams.search(params)];
                    case 2:
                        _a.value = _b.sent();
                        error.value.search = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        error.value.search = err_1;
                        Logger.error("useContent/".concat(id, "/search"), err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            api: _factoryParams.api,
            search: search,
            content: computed(function () { return content.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
}
function renderContentFactory(factoryParams) {
    return {
        render: function render(createElement) {
            var components = [];
            // eslint-disable-next-line
            var self = this;
            var content = self.content;
            var resolvedContent = factoryParams.extractContent(content);
            resolvedContent.map(function component(component) {
                var componentName = component.componentName, props = component.props;
                components.push(createElement(componentName, { attrs: { name: componentName }, props: props }, self.$slots.default));
            });
            return createElement('div', components);
        },
        props: {
            content: {
                type: [Array, Object]
            }
        }
    };
}

var useFacetFactory = function (factoryParams) {
    var useFacet = function (id) {
        var ssrKey = id || 'useFacet';
        var loading = sharedRef(false, "".concat(ssrKey, "-loading"));
        var result = sharedRef({ data: null, input: null }, "".concat(ssrKey, "-facets"));
        var _factoryParams = configureFactoryParams(factoryParams);
        var error = sharedRef({
            search: null
        }, "useFacet-error-".concat(id));
        var search = function (params) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug("useFacet/".concat(ssrKey, "/search"), params);
                        result.value.input = params;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = result.value;
                        return [4 /*yield*/, _factoryParams.search(result.value)];
                    case 2:
                        _a.data = _b.sent();
                        error.value.search = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        error.value.search = err_1;
                        Logger.error("useFacet/".concat(ssrKey, "/search"), err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            result: computed(function () { return result.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; }),
            search: search
        };
    };
    return useFacet;
};

var useMakeOrderFactory = function (factoryParams) {
    return function useMakeOrder() {
        var _this = this;
        var order = sharedRef(null, 'useMakeOrder-order');
        var loading = sharedRef(false, 'useMakeOrder-loading');
        var error = sharedRef({
            make: null
        }, 'useMakeOrder-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: order, alias: 'currentOrder', loading: loading, error: error });
        var make = function (params) {
            if (params === void 0) { params = { customQuery: null }; }
            return __awaiter(_this, void 0, void 0, function () {
                var createdOrder, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            Logger.debug('useMakeOrder.make');
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.make(params)];
                        case 2:
                            createdOrder = _a.sent();
                            error.value.make = null;
                            order.value = createdOrder;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _a.sent();
                            error.value.make = err_1;
                            Logger.error('useMakeOrder.make', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return {
            api: _factoryParams.api,
            order: order,
            make: make,
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
};

function useProductFactory(factoryParams) {
    return function useProduct(id) {
        var _this = this;
        var products = sharedRef([], "useProduct-products-".concat(id));
        var loading = sharedRef(false, "useProduct-loading-".concat(id));
        var error = sharedRef({
            search: null
        }, "useProduct-error-".concat(id));
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: products, alias: 'currentProducts', loading: loading, error: error });
        var search = function (searchParams) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug("useProduct/".concat(id, "/search"), searchParams);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = products;
                        return [4 /*yield*/, _factoryParams.productsSearch(searchParams)];
                    case 2:
                        _a.value = _b.sent();
                        error.value.search = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        error.value.search = err_1;
                        Logger.error("useProduct/".concat(id, "/search"), err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            search: search,
            products: computed(function () { return products.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
}

function useReviewFactory(factoryParams) {
    return function useReview(id) {
        var _this = this;
        var reviews = sharedRef([], "useReviews-reviews-".concat(id));
        var loading = sharedRef(false, "useReviews-loading-".concat(id));
        var error = sharedRef({
            search: null,
            addReview: null
        }, "useReviews-error-".concat(id));
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: reviews, alias: 'currentReviews', loading: loading, error: error });
        var search = function (searchParams) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug("useReview/".concat(id, "/search"), searchParams);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = reviews;
                        return [4 /*yield*/, _factoryParams.searchReviews(searchParams)];
                    case 2:
                        _a.value = _b.sent();
                        error.value.search = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        error.value.search = err_1;
                        Logger.error("useReview/".concat(id, "/search"), err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        var addReview = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug("useReview/".concat(id, "/addReview"), params);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = reviews;
                        return [4 /*yield*/, _factoryParams.addReview(params)];
                    case 2:
                        _a.value = _b.sent();
                        error.value.addReview = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_2 = _b.sent();
                        error.value.addReview = err_2;
                        Logger.error("useReview/".concat(id, "/addReview"), err_2);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            api: _factoryParams.api,
            search: search,
            addReview: addReview,
            reviews: computed(function () { return reviews.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
}

var useShippingFactory = function (factoryParams) {
    return function useShipping() {
        var _this = this;
        var loading = sharedRef(false, 'useShipping-loading');
        var shipping = sharedRef(null, 'useShipping-shipping');
        var error = sharedRef({
            load: null,
            save: null
        }, 'useShipping-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: shipping, alias: 'currentShipping', loading: loading, error: error });
        var load = function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.customQuery, customQuery = _c === void 0 ? null : _c;
            return __awaiter(_this, void 0, void 0, function () {
                var shippingInfo, err_1;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            Logger.debug('useShipping.load');
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.load({ customQuery: customQuery })];
                        case 2:
                            shippingInfo = _d.sent();
                            error.value.load = null;
                            shipping.value = shippingInfo;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _d.sent();
                            error.value.load = err_1;
                            Logger.error('useShipping/load', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var save = function (saveParams) { return __awaiter(_this, void 0, void 0, function () {
            var shippingInfo, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Logger.debug('useShipping.save');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        return [4 /*yield*/, _factoryParams.save(saveParams)];
                    case 2:
                        shippingInfo = _a.sent();
                        error.value.save = null;
                        shipping.value = shippingInfo;
                        return [3 /*break*/, 5];
                    case 3:
                        err_2 = _a.sent();
                        error.value.save = err_2;
                        Logger.error('useShipping/save', err_2);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            api: _factoryParams.api,
            shipping: computed(function () { return shipping.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; }),
            load: load,
            save: save
        };
    };
};

var useUserBillingFactory = function (factoryParams) {
    var useUserBilling = function () {
        var loading = sharedRef(false, 'useUserBilling-loading');
        var billing = sharedRef({}, 'useUserBilling-billing');
        var error = sharedRef({
            addAddress: null,
            deleteAddress: null,
            updateAddress: null,
            load: null,
            setDefaultAddress: null
        }, 'useUserBilling-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: billing, alias: 'currentBilling', loading: loading, error: error });
        var readonlyBilling = unref(billing);
        var addAddress = function (_a) {
            var address = _a.address, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, err_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserBilling.addAddress', address);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = billing;
                            return [4 /*yield*/, _factoryParams.addAddress({
                                    address: address,
                                    billing: readonlyBilling,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.addAddress = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _c.sent();
                            error.value.addAddress = err_1;
                            Logger.error('useUserBilling/addAddress', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var deleteAddress = function (_a) {
            var address = _a.address, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, err_2;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserBilling.deleteAddress', address);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = billing;
                            return [4 /*yield*/, _factoryParams.deleteAddress({
                                    address: address,
                                    billing: readonlyBilling,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.deleteAddress = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_2 = _c.sent();
                            error.value.deleteAddress = err_2;
                            Logger.error('useUserBilling/deleteAddress', err_2);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var updateAddress = function (_a) {
            var address = _a.address, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, err_3;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserBilling.updateAddress', address);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = billing;
                            return [4 /*yield*/, _factoryParams.updateAddress({
                                    address: address,
                                    billing: readonlyBilling,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.updateAddress = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_3 = _c.sent();
                            error.value.updateAddress = err_3;
                            Logger.error('useUserBilling/updateAddress', err_3);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var load = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug('useUserBilling.load');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = billing;
                        return [4 /*yield*/, _factoryParams.load({
                                billing: readonlyBilling
                            })];
                    case 2:
                        _a.value = _b.sent();
                        error.value.load = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_4 = _b.sent();
                        error.value.load = err_4;
                        Logger.error('useUserBilling/load', err_4);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        var setDefaultAddress = function (_a) {
            var address = _a.address, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, err_5;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserBilling.setDefaultAddress');
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = billing;
                            return [4 /*yield*/, _factoryParams.setDefaultAddress({
                                    address: address,
                                    billing: readonlyBilling,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.setDefaultAddress = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_5 = _c.sent();
                            error.value.setDefaultAddress = err_5;
                            Logger.error('useUserBilling/setDefaultAddress', err_5);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return {
            api: _factoryParams.api,
            billing: computed(function () { return billing.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; }),
            addAddress: addAddress,
            deleteAddress: deleteAddress,
            updateAddress: updateAddress,
            load: load,
            setDefaultAddress: setDefaultAddress
        };
    };
    return useUserBilling;
};

var useUserFactory = function (factoryParams) {
    return function useUser() {
        var _this = this;
        var errorsFactory = function () { return ({
            updateUser: null,
            register: null,
            login: null,
            logout: null,
            changePassword: null,
            load: null
        }); };
        var user = sharedRef(null, 'useUser-user');
        var loading = sharedRef(false, 'useUser-loading');
        var isAuthenticated = computed(function () { return Boolean(user.value); });
        var error = sharedRef(errorsFactory(), 'useUser-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: user, alias: 'currentUser', loading: loading, error: error });
        var setUser = function (newUser) {
            user.value = newUser;
            Logger.debug('useUserFactory.setUser', newUser);
        };
        var resetErrorValue = function () {
            error.value = errorsFactory();
        };
        var updateUser = function (_a) {
            var providedUser = _a.user, customQuery = _a.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var _b, err_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserFactory.updateUser', providedUser);
                            resetErrorValue();
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = user;
                            return [4 /*yield*/, _factoryParams.updateUser({ currentUser: user.value, updatedUserData: providedUser, customQuery: customQuery })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.updateUser = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _c.sent();
                            error.value.updateUser = err_1;
                            Logger.error('useUser/updateUser', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var register = function (_a) {
            var providedUser = _a.user, customQuery = _a.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var _b, err_2;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserFactory.register', providedUser);
                            resetErrorValue();
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = user;
                            return [4 /*yield*/, _factoryParams.register(__assign(__assign({}, providedUser), { customQuery: customQuery }))];
                        case 2:
                            _b.value = _c.sent();
                            error.value.register = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_2 = _c.sent();
                            error.value.register = err_2;
                            Logger.error('useUser/register', err_2);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var login = function (_a) {
            var providedUser = _a.user, customQuery = _a.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var _b, err_3;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserFactory.login', providedUser);
                            resetErrorValue();
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = user;
                            return [4 /*yield*/, _factoryParams.logIn(__assign(__assign({}, providedUser), { customQuery: customQuery }))];
                        case 2:
                            _b.value = _c.sent();
                            error.value.login = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_3 = _c.sent();
                            error.value.login = err_3;
                            Logger.error('useUser/login', err_3);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var logout = function () { return __awaiter(_this, void 0, void 0, function () {
            var err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Logger.debug('useUserFactory.logout');
                        resetErrorValue();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, _factoryParams.logOut({ currentUser: user.value })];
                    case 2:
                        _a.sent();
                        error.value.logout = null;
                        user.value = null;
                        return [3 /*break*/, 4];
                    case 3:
                        err_4 = _a.sent();
                        error.value.logout = err_4;
                        Logger.error('useUser/logout', err_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        var changePassword = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug('useUserFactory.changePassword', { currentPassword: mask(params.current), newPassword: mask(params.new) });
                        resetErrorValue();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = user;
                        return [4 /*yield*/, _factoryParams.changePassword({
                                currentUser: user.value,
                                currentPassword: params.current,
                                newPassword: params.new,
                                customQuery: params.customQuery
                            })];
                    case 2:
                        _a.value = _b.sent();
                        error.value.changePassword = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_5 = _b.sent();
                        error.value.changePassword = err_5;
                        Logger.error('useUser/changePassword', err_5);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        var load = function (_a) {
            var _b = _a === void 0 ? { customQuery: undefined } : _a, customQuery = _b.customQuery;
            return __awaiter(_this, void 0, void 0, function () {
                var _c, err_6;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            Logger.debug('useUserFactory.load');
                            resetErrorValue();
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _c = user;
                            return [4 /*yield*/, _factoryParams.load({ customQuery: customQuery })];
                        case 2:
                            _c.value = _d.sent();
                            error.value.load = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_6 = _d.sent();
                            error.value.load = err_6;
                            Logger.error('useUser/load', err_6);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return {
            api: _factoryParams.api,
            setUser: setUser,
            user: computed(function () { return user.value; }),
            updateUser: updateUser,
            register: register,
            login: login,
            logout: logout,
            isAuthenticated: isAuthenticated,
            changePassword: changePassword,
            load: load,
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
};

function useUserOrderFactory(factoryParams) {
    return function useUserOrder() {
        var _this = this;
        var orders = sharedRef({
            results: [],
            total: 0
        }, 'useUserOrder-orders');
        var loading = sharedRef(false, 'useUserOrder-loading');
        var error = sharedRef({}, 'useUserOrder-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: orders, alias: 'currentOrders', loading: loading, error: error });
        var search = function (searchParams) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug('useUserOrder.search', searchParams);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = orders;
                        return [4 /*yield*/, _factoryParams.searchOrders(searchParams)];
                    case 2:
                        _a.value = _b.sent();
                        error.value.search = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        error.value.search = err_1;
                        Logger.error('useUserOrder/search', err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            api: _factoryParams.api,
            orders: computed(function () { return orders.value; }),
            search: search,
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
}

var useUserShippingFactory = function (factoryParams) {
    var useUserShipping = function () {
        var loading = sharedRef(false, 'useUserShipping-loading');
        var shipping = sharedRef({}, 'useUserShipping-shipping');
        var readonlyShipping = unref(shipping);
        var error = sharedRef({
            addAddress: null,
            deleteAddress: null,
            updateAddress: null,
            load: null,
            setDefaultAddress: null
        }, 'useUserShipping-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: shipping, alias: 'currentShipping', loading: loading, error: error });
        var addAddress = function (_a) {
            var address = _a.address, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, err_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserShipping.addAddress', mask(address));
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = shipping;
                            return [4 /*yield*/, _factoryParams.addAddress({
                                    address: address,
                                    shipping: readonlyShipping,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.addAddress = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _c.sent();
                            error.value.addAddress = err_1;
                            Logger.error('useUserShipping/addAddress', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var deleteAddress = function (_a) {
            var address = _a.address, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, err_2;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserShipping.deleteAddress', address);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = shipping;
                            return [4 /*yield*/, _factoryParams.deleteAddress({
                                    address: address,
                                    shipping: readonlyShipping,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.deleteAddress = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_2 = _c.sent();
                            error.value.deleteAddress = err_2;
                            Logger.error('useUserShipping/deleteAddress', err_2);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var updateAddress = function (_a) {
            var address = _a.address, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, err_3;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserShipping.updateAddress', address);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = shipping;
                            return [4 /*yield*/, _factoryParams.updateAddress({
                                    address: address,
                                    shipping: readonlyShipping,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.updateAddress = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_3 = _c.sent();
                            error.value.updateAddress = err_3;
                            Logger.error('useUserShipping/updateAddress', err_3);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var load = function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, err_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug('useUserShipping.load');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = shipping;
                        return [4 /*yield*/, _factoryParams.load({
                                shipping: readonlyShipping
                            })];
                    case 2:
                        _a.value = _b.sent();
                        error.value.load = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_4 = _b.sent();
                        error.value.load = err_4;
                        Logger.error('useUserShipping/load', err_4);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        var setDefaultAddress = function (_a) {
            var address = _a.address, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _b, err_5;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useUserShipping.setDefaultAddress', address);
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _b = shipping;
                            return [4 /*yield*/, _factoryParams.setDefaultAddress({
                                    address: address,
                                    shipping: readonlyShipping,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            error.value.setDefaultAddress = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_5 = _c.sent();
                            error.value.setDefaultAddress = err_5;
                            Logger.error('useUserShipping/setDefaultAddress', err_5);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return {
            api: _factoryParams.api,
            shipping: computed(function () { return shipping.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; }),
            addAddress: addAddress,
            deleteAddress: deleteAddress,
            updateAddress: updateAddress,
            load: load,
            setDefaultAddress: setDefaultAddress
        };
    };
    return useUserShipping;
};

var useWishlistFactory = function (factoryParams) {
    var useWishlist = function () {
        var loading = sharedRef(false, 'useWishlist-loading');
        var wishlist = sharedRef(null, 'useWishlist-wishlist');
        var error = sharedRef({
            addItem: null,
            removeItem: null,
            load: null,
            clear: null
        }, 'useWishlist-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: wishlist, alias: 'currentWishlist', loading: loading, error: error });
        var setWishlist = function (newWishlist) {
            wishlist.value = newWishlist;
            Logger.debug('useWishlistFactory.setWishlist', newWishlist);
        };
        var addItem = function (_a) {
            var product = _a.product, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var updatedWishlist, err_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            Logger.debug('useWishlist.addItem', product);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.addItem({
                                    currentWishlist: wishlist.value,
                                    product: product,
                                    customQuery: customQuery
                                })];
                        case 2:
                            updatedWishlist = _b.sent();
                            error.value.addItem = null;
                            wishlist.value = updatedWishlist;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _b.sent();
                            error.value.addItem = err_1;
                            Logger.error('useWishlist/addItem', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var removeItem = function (_a) {
            var product = _a.product, customQuery = _a.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var updatedWishlist, err_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            Logger.debug('useWishlist.removeItem', product);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            return [4 /*yield*/, _factoryParams.removeItem({
                                    currentWishlist: wishlist.value,
                                    product: product,
                                    customQuery: customQuery
                                })];
                        case 2:
                            updatedWishlist = _b.sent();
                            error.value.removeItem = null;
                            wishlist.value = updatedWishlist;
                            return [3 /*break*/, 5];
                        case 3:
                            err_2 = _b.sent();
                            error.value.removeItem = err_2;
                            Logger.error('useWishlist/removeItem', err_2);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var load = function (_a) {
            var _b = _a === void 0 ? { customQuery: undefined } : _a, customQuery = _b.customQuery;
            return __awaiter(void 0, void 0, void 0, function () {
                var _c, err_3;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            Logger.debug('useWishlist.load');
                            if (wishlist.value)
                                return [2 /*return*/];
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _c = wishlist;
                            return [4 /*yield*/, _factoryParams.load({ customQuery: customQuery })];
                        case 2:
                            _c.value = _d.sent();
                            error.value.load = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_3 = _d.sent();
                            error.value.load = err_3;
                            Logger.error('useWishlist/load', err_3);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var clear = function () { return __awaiter(void 0, void 0, void 0, function () {
            var updatedWishlist, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Logger.debug('useWishlist.clear');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        return [4 /*yield*/, _factoryParams.clear({
                                currentWishlist: wishlist.value
                            })];
                    case 2:
                        updatedWishlist = _a.sent();
                        error.value.clear = null;
                        wishlist.value = updatedWishlist;
                        return [3 /*break*/, 5];
                    case 3:
                        err_4 = _a.sent();
                        error.value.clear = err_4;
                        Logger.error('useWishlist/clear', err_4);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        var isInWishlist = function (_a) {
            var product = _a.product;
            Logger.debug('useWishlist.isInWishlist', product);
            return _factoryParams.isInWishlist({
                currentWishlist: wishlist.value,
                product: product
            });
        };
        return {
            api: _factoryParams.api,
            wishlist: computed(function () { return wishlist.value; }),
            isInWishlist: isInWishlist,
            addItem: addItem,
            load: load,
            removeItem: removeItem,
            clear: clear,
            setWishlist: setWishlist,
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
    return useWishlist;
};

var useShippingProviderFactory = function (factoryParams) {
    return function useShippingProvider() {
        var _this = this;
        var loading = sharedRef(false, 'useShippingProvider-loading');
        var state = sharedRef(null, 'useShippingProvider-response');
        var error = sharedRef({
            load: null,
            save: null
        }, 'useShippingProvider-error');
        var _factoryParams = configureFactoryParams(factoryParams, { mainRef: state, alias: 'currentState', loading: loading, error: error });
        var setState = function (newState) {
            state.value = newState;
            Logger.debug('useShippingProvider.setState', newState);
        };
        var save = function (_a) {
            var shippingMethod = _a.shippingMethod, _b = _a.customQuery, customQuery = _b === void 0 ? null : _b;
            return __awaiter(_this, void 0, void 0, function () {
                var _c, err_1;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            Logger.debug('useShippingProvider.save');
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _c = state;
                            return [4 /*yield*/, _factoryParams.save({ shippingMethod: shippingMethod, customQuery: customQuery, state: state })];
                        case 2:
                            _c.value = _d.sent();
                            error.value.save = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _d.sent();
                            error.value.save = err_1;
                            Logger.error('useShippingProvider/save', err_1);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        var load = function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.customQuery, customQuery = _c === void 0 ? null : _c;
            return __awaiter(_this, void 0, void 0, function () {
                var _d, err_2;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            Logger.debug('useShippingProvider.load');
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _d = state;
                            return [4 /*yield*/, _factoryParams.load({ customQuery: customQuery, state: state })];
                        case 2:
                            _d.value = _e.sent();
                            error.value.load = null;
                            return [3 /*break*/, 5];
                        case 3:
                            err_2 = _e.sent();
                            error.value.load = err_2;
                            Logger.error('useShippingProvider/load', err_2);
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return {
            api: _factoryParams.api,
            state: state,
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; }),
            load: load,
            save: save,
            setState: setState
        };
    };
};

function useForgotPasswordFactory(factoryParams) {
    return function useForgotPassword() {
        var _this = this;
        var result = sharedRef({
            resetPasswordResult: null,
            setNewPasswordResult: null
        }, 'useForgotPassword-result');
        var loading = sharedRef(false, 'useProduct-loading');
        var _factoryParams = configureFactoryParams(factoryParams);
        var error = sharedRef({
            request: null,
            setNew: null
        }, 'useForgotPassword-error');
        var request = function (resetPasswordParams) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug('useForgotPassword/request', resetPasswordParams.email);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = result;
                        return [4 /*yield*/, _factoryParams.resetPassword(__assign({ currentResult: result.value }, resetPasswordParams))];
                    case 2:
                        _a.value = _b.sent();
                        error.value.request = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        error.value.request = err_1;
                        Logger.error('useForgotPassword/request', err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        var setNew = function (setNewPasswordParams) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug('useForgotPassword/setNew', setNewPasswordParams);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = result;
                        return [4 /*yield*/, _factoryParams.setNewPassword(__assign({ currentResult: result.value }, setNewPasswordParams))];
                    case 2:
                        _a.value = _b.sent();
                        error.value.setNew = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_2 = _b.sent();
                        error.value.setNew = err_2;
                        Logger.error('useForgotPassword/setNew', err_2);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            request: request,
            setNew: setNew,
            result: computed(function () { return result.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
}

function useStoreFactory(factoryParams) {
    return function useStore() {
        /* @private */
        var _factoryParams = configureFactoryParams(factoryParams);
        /* @readonly */
        var response = sharedRef(null, 'useStore-response');
        var loading = sharedRef(false, 'useStore-loading');
        var error = sharedRef({ load: null, change: null }, 'useStore-error');
        /* @public */
        function load(params) {
            return __awaiter(this, void 0, void 0, function () {
                var customQuery, _a, err_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            Logger.debug('useStoreFactory.load', params);
                            error.value.load = null;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            customQuery = Object(params).customQuery;
                            _a = response;
                            return [4 /*yield*/, _factoryParams.load({
                                    customQuery: customQuery
                                })];
                        case 2:
                            _a.value = _b.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _b.sent();
                            error.value.load = err_1;
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        function change(params) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, customQuery, currentStore, store, _b, err_2;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            Logger.debug('useStoreFactory.change', params);
                            error.value.change = null;
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, 4, 5]);
                            loading.value = true;
                            _a = Object(params), customQuery = _a.customQuery, currentStore = _a.currentStore, store = _a.store;
                            _b = response;
                            return [4 /*yield*/, _factoryParams.change({
                                    currentStore: currentStore,
                                    store: store,
                                    customQuery: customQuery
                                })];
                        case 2:
                            _b.value = _c.sent();
                            return [3 /*break*/, 5];
                        case 3:
                            err_2 = _c.sent();
                            error.value.change = err_2;
                            return [3 /*break*/, 5];
                        case 4:
                            loading.value = false;
                            return [7 /*endfinally*/];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
        /* @interface */
        return {
            load: load,
            change: change,
            response: computed(function () { return response.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
}

function useSearchFactory(factoryParams) {
    return function useSearch(id) {
        var _this = this;
        var result = sharedRef([], "useSearch-products-".concat(id));
        var loading = sharedRef(false, "useSearch-loading-".concat(id));
        var _factoryParams = configureFactoryParams(factoryParams);
        var error = sharedRef({
            search: null
        }, "useSearch-error-".concat(id));
        var search = function (searchParams) { return __awaiter(_this, void 0, void 0, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        Logger.debug("useSearch/".concat(id, "/search"), searchParams);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, 4, 5]);
                        loading.value = true;
                        _a = result;
                        return [4 /*yield*/, _factoryParams.search(searchParams)];
                    case 2:
                        _a.value = _b.sent();
                        error.value.search = null;
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _b.sent();
                        error.value.search = err_1;
                        Logger.error("useSearch/".concat(id, "/search"), err_1);
                        return [3 /*break*/, 5];
                    case 4:
                        loading.value = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        return {
            search: search,
            result: computed(function () { return result.value; }),
            loading: computed(function () { return loading.value; }),
            error: computed(function () { return error.value; })
        };
    };
}

/* istanbul ignore file */
/**
 * Default name of the cookie storing active localization code
 */
var VSF_LOCALE_COOKIE = 'vsf-locale';
/**
 * Default name of the cookie storing active currency code
 */
var VSF_CURRENCY_COOKIE = 'vsf-currency';
/**
 * Default name of the cookie storing active country code
 */
var VSF_COUNTRY_COOKIE = 'vsf-country';
/**
 * Default name of the cookie storing active store code
 */
var VSF_STORE_COOKIE = 'vsf-store';
/**
 * Default name of the cookie storing active channel code
 */
var VSF_CHANNEL_COOKIE = 'vsf-channel';
// TODO - remove this interface
var AgnosticOrderStatus;
(function (AgnosticOrderStatus) {
    AgnosticOrderStatus["Open"] = "Open";
    AgnosticOrderStatus["Pending"] = "Pending";
    AgnosticOrderStatus["Confirmed"] = "Confirmed";
    AgnosticOrderStatus["Shipped"] = "Shipped";
    AgnosticOrderStatus["Complete"] = "Complete";
    AgnosticOrderStatus["Cancelled"] = "Cancelled";
    AgnosticOrderStatus["Refunded"] = "Refunded";
})(AgnosticOrderStatus || (AgnosticOrderStatus = {}));

/**
 * Core Vue Storefront 2 library.
 *
 * @remarks
 * The `@vue-storefront/core` library is a core of the whole Vue Storefront 2 application.
 * It defines common interfaces for all eCommerce integrations, factories for creating
 * composables, logger, SSR helpers and more.
 *
 * @packageDocumentation
 */
if (typeof window !== 'undefined') {
    window.$vuestorefront = window.$vuestorefront || { integrations: [] };
}
function track(id) {
    if (typeof window !== 'undefined') {
        if (window.$vuestorefront) {
            window.$vuestorefront.integrations.push(id);
        }
    }
}

export { AgnosticOrderStatus, Logger, VSF_CHANNEL_COOKIE, VSF_COUNTRY_COOKIE, VSF_CURRENCY_COOKIE, VSF_LOCALE_COOKIE, VSF_STORE_COOKIE, addBasePath, apiClientFactory, configureContext, configureFactoryParams, configureSSR, generateContext, i18nRedirectsUtil, integrationPlugin, mask, onSSR, registerLogger, renderContentFactory, sharedRef, track, useBillingFactory, useCartFactory, useCategoryFactory, useContentFactory, useFacetFactory, useForgotPasswordFactory, useMakeOrderFactory, useProductFactory, useReviewFactory, useSearchFactory, useShippingFactory, useShippingProviderFactory, useStoreFactory, useUserBillingFactory, useUserFactory, useUserOrderFactory, useUserShippingFactory, useVSFContext, useWishlistFactory, vsfRef, wrap };
//# sourceMappingURL=index.es.js.map
