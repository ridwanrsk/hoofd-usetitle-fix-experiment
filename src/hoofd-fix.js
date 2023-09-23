import { createContext, useContext, useEffect, useRef, useMemo } from "react";
function _extends() {
  _extends = Object.assign
    ? Object.assign.bind()
    : function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
  return _extends.apply(this, arguments);
}

var isServerSide = typeof document === "undefined";

var META = "M";
var TITLE = "T";
var LINK = "L";
var TEMPLATE = "P";
var SCRIPT = "S";
var applyTitleTemplate = function applyTitleTemplate(title, template) {
  return template ? template.replace(/%s/g, title || "") : title;
};
var changeOrCreateMetaTag = function changeOrCreateMetaTag(meta) {
  var result = document.head.querySelectorAll(
    meta.charset
      ? "meta[" + meta.keyword + "]"
      : "meta[" + meta.keyword + '="' + meta[meta.keyword] + '"]'
  );
  if (result[0]) {
    if (meta.charset) {
      result[0].setAttribute(meta.keyword, meta.charset);
    } else {
      result[0].setAttribute("content", meta.content);
    }
  } else {
    var metaTag = document.createElement("meta");
    if (meta.charset) {
      metaTag.setAttribute(meta.keyword, meta.charset);
    } else {
      metaTag.setAttribute(meta.keyword, meta[meta.keyword]);
      metaTag.setAttribute("content", meta.content);
    }
    document.head.appendChild(metaTag);
  }
};
var createDispatcher = function createDispatcher() {
  var lang;
  var linkQueue = [];
  var scriptQueue = [];
  var titleQueue = [];
  var titleTemplateQueue = [];
  var metaQueue = [];
  var currentTitleIndex = 0;
  var currentTitleTemplateIndex = 0;
  var currentMetaIndex = 0;
  var processQueue = (function () {
    var timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        timeout = null;
        var visited = new Set();
        document.title = applyTitleTemplate(
          titleQueue[0],
          titleTemplateQueue[0]
        );
        metaQueue.forEach(function (meta) {
          if (!visited.has(meta.charset ? meta.keyword : meta[meta.keyword])) {
            visited.add(meta.charset ? meta.keyword : meta[meta.keyword]);
            changeOrCreateMetaTag(meta);
          }
        });
        currentTitleIndex = currentTitleTemplateIndex = currentMetaIndex = 0;
      }, 1000 / 60);
    };
  })();
  return {
    _setLang: function _setLang(l) {
      lang = l;
    },
    _addToQueue: function _addToQueue(type, payload) {
      if (!isServerSide) processQueue();
      if (type === SCRIPT) {
        scriptQueue.push(payload);
      } else if (type === TITLE) {
        titleQueue.splice(currentTitleIndex++, 0, payload);
      } else if (type === TEMPLATE) {
        titleTemplateQueue.splice(currentTitleTemplateIndex++, 0, payload);
      } else if (type === META) {
        metaQueue.splice(currentMetaIndex++, 0, payload);
      } else {
        linkQueue.push(payload);
      }
    },
    _removeFromQueue: function _removeFromQueue(type, payload) {
      if (type === TITLE || type === TEMPLATE) {
        var queue = type === TEMPLATE ? titleTemplateQueue : titleQueue;
        var index = queue.indexOf(payload);
        queue.splice(index, 1);
        if (index === 0)
          document.title = applyTitleTemplate(
            titleQueue[0] || "",
            titleTemplateQueue[0]
          );
      } else {
        var _index = metaQueue.indexOf(payload);
        var oldMeta = metaQueue[_index];
        if (oldMeta) {
          metaQueue.splice(_index, 1);
          var newMeta = metaQueue.find(function (m) {
            return (
              m.keyword === oldMeta.keyword &&
              (m.charset || m[m.keyword] === oldMeta[m.keyword])
            );
          });
          if (newMeta) {
            changeOrCreateMetaTag(newMeta);
          } else {
            var result = document.head.querySelectorAll(
              oldMeta.charset
                ? "meta[" + oldMeta.keyword + "]"
                : "meta[" +
                    oldMeta.keyword +
                    '="' +
                    oldMeta[oldMeta.keyword] +
                    '"]'
            );
            if (result[0]) {
              document.head.removeChild(result[0]);
            }
          }
        }
      }
    },
    _change: function _change(type, prevPayload, payload) {
      if (type === TITLE || type === TEMPLATE) {
        var queue = type === TEMPLATE ? titleTemplateQueue : titleQueue;
        queue[queue.indexOf(prevPayload)] = payload;
        if (queue.indexOf(payload) === 0) {
          document.title = applyTitleTemplate(
            queue[queue.indexOf(payload)],
            titleTemplateQueue[0]
          );
        }
      } else {
        changeOrCreateMetaTag(
          (metaQueue[metaQueue.indexOf(prevPayload)] = payload)
        );
      }
    },
    _reset: undefined,
    toStatic: function toStatic() {
      var ESCAPED_CHARS = /['"&<>]/;
      function escape(str) {
        if (str.length === 0 || ESCAPED_CHARS.test(str) === false) return str;
        var last = 0,
          i = 0,
          out = "",
          ch = "";
        for (; i < str.length; i++) {
          switch (str.charCodeAt(i)) {
            case 34:
              ch = '"';
              break;
            case 38:
              ch = "&";
              break;
            case 39:
              ch = "'";
              break;
            case 60:
              ch = "<";
              break;
            case 62:
              ch = ">";
              break;
            default:
              continue;
          }
          if (i !== last) out += str.slice(last, i);
          out += ch;
          last = i + 1;
        }
        if (i !== last) out += str.slice(last, i);
        return out;
      }
      var title = applyTitleTemplate(
        titleQueue[titleQueue.length - 1],
        titleTemplateQueue[titleTemplateQueue.length - 1]
      );
      var visited = new Set();
      var links = [].concat(linkQueue);
      var scripts = [].concat(scriptQueue);
      metaQueue.reverse();
      var metas = [].concat(metaQueue).filter(function (meta) {
        if (!visited.has(meta.charset ? meta.keyword : meta[meta.keyword])) {
          visited.add(meta.charset ? meta.keyword : meta[meta.keyword]);
          return true;
        }
      });
      titleQueue = [];
      titleTemplateQueue = [];
      metaQueue = [];
      linkQueue = [];
      scriptQueue = [];
      currentTitleIndex = currentTitleTemplateIndex = currentMetaIndex = 0;
      return {
        lang: lang,
        title: title,
        links: links.map(function (x) {
          var _extends2;
          return _extends(
            {},
            x,
            ((_extends2 = {}), (_extends2["data-hoofd"] = "1"), _extends2)
          );
        }),
        scripts: scripts,
        metas: metas.map(function (meta) {
          var _ref;
          return meta.keyword === "charset"
            ? {
                charset: meta[meta.keyword],
              }
            : ((_ref = {}),
              (_ref[meta.keyword] = meta[meta.keyword]),
              (_ref.content = escape(meta.content)),
              _ref);
        }),
      };
    },
  };
};
var defaultDispatcher = createDispatcher();
var DispatcherContext = createContext(defaultDispatcher);

var useLang = function useLang(language) {
  var dispatcher = useContext(DispatcherContext);
  if (isServerSide) {
    dispatcher._setLang(language);
  }
  useEffect(
    function () {
      document.getElementsByTagName("html")[0].setAttribute("lang", language);
    },
    [language]
  );
};

var useLink = function useLink(options) {
  var dispatcher = useContext(DispatcherContext);
  var hasMounted = useRef(false);
  var node = useRef();
  if (isServerSide && !hasMounted.current) {
    dispatcher._addToQueue(LINK, options);
  }
  useEffect(
    function () {
      if (hasMounted.current) {
        Object.keys(options).forEach(function (key) {
          node.current.setAttribute(key, options[key]);
        });
      }
    },
    [
      options.href,
      options.media,
      options.as,
      options.rel,
      options.crossorigin,
      options.type,
      options.hreflang,
      options.sizes,
    ]
  );
  useEffect(function () {
    hasMounted.current = true;
    var preExistingElements = document.querySelectorAll('link[data-hoofd="1"]');
    preExistingElements.forEach(function (x) {
      var found = true;
      Object.keys(options).forEach(function (key) {
        if (x.getAttribute(key) !== options[key]) {
          found = false;
        }
      });
      if (found) {
        node.current = x;
      }
    });
    if (!node.current) {
      node.current = document.createElement("link");
      Object.keys(options).forEach(function (key) {
        node.current.setAttribute(key, options[key]);
      });
      document.head.appendChild(node.current);
    }
    return function () {
      hasMounted.current = false;
      if (node.current) {
        document.head.removeChild(node.current);
        node.current = undefined;
      }
    };
  }, []);
};

var useScript = function useScript(options) {
  var dispatcher = useContext(DispatcherContext);
  if (isServerSide) {
    dispatcher._addToQueue(SCRIPT, options);
  }
  useEffect(function () {
    var preExistingElements = options.id
      ? document.querySelectorAll('script[id="' + options.id + '"]')
      : document.querySelectorAll('script[src="' + options.src + '"]');
    var script;
    if (!preExistingElements[0] && (options.src || options.id)) {
      var _script = document.createElement("script");
      if (options.type) _script.type = options.type;
      if (options.module) _script.type = "module";
      if (options.integrity)
        _script.setAttribute("integrity", options.integrity);
      if (options.crossorigin)
        _script.setAttribute("crossorigin", options.crossorigin);
      if (options.defer) _script.setAttribute("defer", "true");
      else if (options.async) _script.setAttribute("async", "true");
      if (options.id) _script.id = options.id;
      if (options.src) _script.src = options.src;
      if (options.text) _script.text = options.text;
      document.head.appendChild(_script);
    } else if (preExistingElements[0]) {
      script = preExistingElements[0];
    }
    return function () {
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);
};

function extractKeyword(meta) {
  return meta.charset
    ? "charset"
    : meta.name
    ? "name"
    : meta.property
    ? "property"
    : "http-equiv";
}
var useHead = function useHead(_ref) {
  var title = _ref.title,
    metas = _ref.metas,
    language = _ref.language;
  var dispatcher = useContext(DispatcherContext);
  var hasMounted = useRef(false);
  var prevTitle = useRef();
  var prevMetas = useRef();
  var addedMetas = useRef();
  var memoizedMetas = useMemo(
    function () {
      var calculatedMetas = (metas || []).map(function (meta) {
        var keyword = extractKeyword(meta);
        if (prevMetas.current) {
          var found = prevMetas.current.find(function (x) {
            return (
              x.keyword === keyword &&
              x.name === meta.name &&
              x.charset === meta.charset &&
              x["http-equiv"] === meta.httpEquiv &&
              x.property === meta.property &&
              x.content === meta.content
            );
          });
          if (found) return found;
        }
        return {
          keyword: keyword,
          name: meta.name,
          charset: meta.charset,
          "http-equiv": meta.httpEquiv,
          property: meta.property,
          content: meta.content,
        };
      });
      return calculatedMetas;
    },
    [metas]
  );
  if (isServerSide && !hasMounted.current) {
    if (title) dispatcher._addToQueue(TITLE, title);
    if (language) dispatcher._setLang(language);
    memoizedMetas.forEach(function (meta) {
      dispatcher._addToQueue(META, meta);
    });
  }
  useEffect(
    function () {
      if (prevMetas.current) {
        var previousMetas = [].concat(prevMetas.current);
        var added = [];
        memoizedMetas.forEach(function (meta) {
          added.push(meta);
          if (previousMetas.includes(meta)) {
            previousMetas.splice(previousMetas.indexOf(meta), 1);
          } else {
            var previousIteration = previousMetas.find(function (x) {
              return (
                x.keyword === meta.keyword &&
                meta[meta.keyword] === x[meta.keyword]
              );
            });
            if (previousIteration) {
              dispatcher._change(META, previousIteration, meta);
            } else {
              dispatcher._addToQueue(META, meta);
            }
          }
        });
        if (previousMetas.length) {
          previousMetas.forEach(function (meta) {
            dispatcher._removeFromQueue(META, meta);
          });
        }
        addedMetas.current = added;
        prevMetas.current = memoizedMetas;
      }
    },
    [memoizedMetas]
  );
  useEffect(function () {
    memoizedMetas.forEach(function (meta) {
      dispatcher._addToQueue(META, meta);
    });
    prevMetas.current = addedMetas.current = memoizedMetas;
    return function () {
      (addedMetas.current || []).forEach(function (meta) {
        dispatcher._removeFromQueue(META, meta);
      });
    };
  }, []);
  useEffect(
    function () {
      if (hasMounted.current && title) {
        if (prevTitle.current != null) {
          dispatcher._change(
            TITLE,
            prevTitle.current,
            (prevTitle.current = title)
          );
        } else {
          dispatcher._addToQueue(TITLE, (prevTitle.current = title));
        }
      } else if (hasMounted.current && prevTitle.current) {
        dispatcher._removeFromQueue(TITLE, prevTitle.current);
        prevTitle.current = undefined;
      }
    },
    [title]
  );
  useEffect(function () {
    hasMounted.current = true;
    dispatcher._addToQueue(TITLE, (prevTitle.current = title));
    return function () {
      hasMounted.current = false;
      if (prevTitle.current != null)
        dispatcher._removeFromQueue(TITLE, prevTitle.current);
    };
  }, []);
  useEffect(
    function () {
      if (language)
        document.getElementsByTagName("html")[0].setAttribute("lang", language);
    },
    [language]
  );
};

var useMeta = function useMeta(options) {
  var dispatcher = useContext(DispatcherContext);
  var hasMounted = useRef(false);
  var keyword = useRef();
  var metaObject = useRef({
    keyword: (keyword.current = extractKeyword(options)),
    name: options.name,
    charset: options.charset,
    "http-equiv": options.httpEquiv,
    property: options.property,
    content: options.content,
  });
  if (isServerSide && !hasMounted.current) {
    dispatcher._addToQueue(META, metaObject.current);
  }
  useEffect(
    function () {
      if (hasMounted.current) {
        dispatcher._change(
          META,
          metaObject.current,
          (metaObject.current = {
            keyword: keyword.current,
            name: options.name,
            charset: options.charset,
            "http-equiv": options.httpEquiv,
            property: options.property,
            content: options.content,
          })
        );
      }
    },
    [options.content]
  );
  useEffect(function () {
    dispatcher._addToQueue(META, metaObject.current);
    hasMounted.current = true;
    return function () {
      hasMounted.current = false;
      dispatcher._removeFromQueue(META, metaObject.current);
    };
  }, []);
};

var useTitle = function useTitle(title, template) {
  var dispatcher = useContext(DispatcherContext);
  var hasMounted = useRef(false);
  var prevTitle = useRef();
  if (isServerSide && !hasMounted.current) {
    dispatcher._addToQueue(template ? TEMPLATE : TITLE, title);
  }
  useEffect(
    function () {
      if (hasMounted.current) {
        dispatcher._change(
          template ? TEMPLATE : TITLE,
          prevTitle.current,
          (prevTitle.current = title)
        );
      }
    },
    [title, template]
  );
  useEffect(
    function () {
      hasMounted.current = true;
      dispatcher._addToQueue(
        template ? TEMPLATE : TITLE,
        (prevTitle.current = title)
      );
      return function () {
        hasMounted.current = false;
        dispatcher._removeFromQueue(
          template ? TEMPLATE : TITLE,
          prevTitle.current
        );
      };
    },
    [template]
  );
};

var useTitleTemplate = function useTitleTemplate(template) {
  useTitle(template, true);
};

var toStatic = defaultDispatcher.toStatic;
var HoofdProvider = DispatcherContext.Provider;

export {
  HoofdProvider,
  createDispatcher,
  toStatic,
  useHead,
  useLang,
  useLink,
  useMeta,
  useScript,
  useTitle,
  useTitleTemplate,
};
//# sourceMappingURL=hoofd.module.js.map
