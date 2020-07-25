(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fs'), require('path'), require('util'), require('events')) :
  typeof define === 'function' && define.amd ? define(['fs', 'path', 'util', 'events'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Toolbelt = factory(global.fs, global.path, global.util, global.events));
}(this, (function (fs, path, util, events) { 'use strict';

  var fs__default = 'default' in fs ? fs['default'] : fs;
  path = path && Object.prototype.hasOwnProperty.call(path, 'default') ? path['default'] : path;
  util = util && Object.prototype.hasOwnProperty.call(util, 'default') ? util['default'] : util;
  events = events && Object.prototype.hasOwnProperty.call(events, 'default') ? events['default'] : events;

  /* @flow */

  function log(message /*: string */) {
    console.log(`[dotenv][DEBUG] ${message}`);
  }

  const NEWLINE = '\n';
  const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
  const RE_NEWLINES = /\\n/g;

  // Parses src into an Object
  function parse(
    src /*: string | Buffer */,
    options /*: ?DotenvParseOptions */
  ) /*: DotenvParseOutput */ {
    const debug = Boolean(options && options.debug);
    const obj = {};

    // convert Buffers before splitting into lines and processing
    src
      .toString()
      .split(NEWLINE)
      .forEach(function (line, idx) {
        // matching "KEY' and 'VAL' in 'KEY=VAL'
        const keyValueArr = line.match(RE_INI_KEY_VAL);
        // matched?
        if (keyValueArr != null) {
          const key = keyValueArr[1];
          // default undefined or missing values to empty string
          let val = keyValueArr[2] || '';
          const end = val.length - 1;
          const isDoubleQuoted = val[0] === '"' && val[end] === '"';
          const isSingleQuoted = val[0] === "'" && val[end] === "'";

          // if single or double quoted, remove quotes
          if (isSingleQuoted || isDoubleQuoted) {
            val = val.substring(1, end);

            // if double quoted, expand newlines
            if (isDoubleQuoted) {
              val = val.replace(RE_NEWLINES, NEWLINE);
            }
          } else {
            // remove surrounding whitespace
            val = val.trim();
          }

          obj[key] = val;
        } else if (debug) {
          log(`did not match key and value when parsing line ${idx + 1}: ${line}`);
        }
      });

    return obj
  }

  // Populates process.env from .env file
  function config(options /*: ?DotenvConfigOptions */) /*: DotenvConfigOutput */ {
    let dotenvPath = path.resolve(process.cwd(), '.env');
    let encoding /*: string */ = 'utf8';
    let debug = false;

    if (options) {
      if (options.path != null) {
        dotenvPath = options.path;
      }
      if (options.encoding != null) {
        encoding = options.encoding;
      }
      if (options.debug != null) {
        debug = true;
      }
    }

    try {
      // specifying an encoding returns a string instead of a buffer
      const parsed = parse(fs__default.readFileSync(dotenvPath, { encoding }), { debug });

      Object.keys(parsed).forEach(function (key) {
        if (!process.env.hasOwnProperty(key)) {
          process.env[key] = parsed[key];
        } else if (debug) {
          log(
            `"${key}" is already defined in \`process.env\` and will not be overwritten`
          );
        }
      });

      return { parsed }
    } catch (e) {
      return { error: e }
    }
  }

  /*!
   * is.js 0.9.0
   * Author: Aras Atasaygin
   */

  // define 'is' object and current version
  var is = {};
  is.VERSION = '0.9.0';

  // define interfaces
  is.not = {};
  is.all = {};
  is.any = {};

  // cache some methods to call later on
  var toString = Object.prototype.toString;
  var slice = Array.prototype.slice;
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  // helper function which reverses the sense of predicate result
  function not(func) {
    return function () {
      return !func.apply(null, slice.call(arguments))
    }
  }

  // helper function which call predicate function per parameter and return true if all pass
  function all(func) {
    return function () {
      var params = getParams(arguments);
      var length = params.length;
      for (var i = 0; i < length; i++) {
        if (!func.call(null, params[i])) {
          return false
        }
      }
      return true
    }
  }

  // helper function which call predicate function per parameter and return true if any pass
  function any(func) {
    return function () {
      var params = getParams(arguments);
      var length = params.length;
      for (var i = 0; i < length; i++) {
        if (func.call(null, params[i])) {
          return true
        }
      }
      return false
    }
  }

  // build a 'comparator' object for various comparison checks
  var comparator = {
    '<': function (a, b) {
      return a < b
    },
    '<=': function (a, b) {
      return a <= b
    },
    '>': function (a, b) {
      return a > b
    },
    '>=': function (a, b) {
      return a >= b
    },
  };

  // helper function which compares a version to a range
  function compareVersion(version, range) {
    var string = range + '';
    var n = +(string.match(/\d+/) || NaN);
    var op = string.match(/^[<>]=?|/)[0];
    return comparator[op] ? comparator[op](version, n) : version == n || n !== n
  }

  // helper function which extracts params from arguments
  function getParams(args) {
    var params = slice.call(args);
    var length = params.length;
    if (length === 1 && is.array(params[0])) {
      // support array
      params = params[0];
    }
    return params
  }

  // Type checks
  /* -------------------------------------------------------------------------- */

  // is a given value Arguments?
  is.arguments = function (value) {
    // fallback check is for IE
    return (
      toString.call(value) === '[object Arguments]' ||
      (value != null && typeof value === 'object' && 'callee' in value)
    )
  };

  // is a given value Array?
  is.array =
    Array.isArray ||
    function (value) {
      // check native isArray first
      return toString.call(value) === '[object Array]'
    };

  // is a given value Boolean?
  is.boolean = function (value) {
    return (
      value === true ||
      value === false ||
      toString.call(value) === '[object Boolean]'
    )
  };

  // is a given value Char?
  is.char = function (value) {
    return is.string(value) && value.length === 1
  };

  // is a given value Date Object?
  is.date = function (value) {
    return toString.call(value) === '[object Date]'
  };

  // is a given object a DOM node?
  is.domNode = function (object) {
    return is.object(object) && object.nodeType > 0
  };

  // is a given value Error object?
  is.error = function (value) {
    return toString.call(value) === '[object Error]'
  };

  // is a given value function?
  is['function'] = function (value) {
    // fallback check is for IE
    return (
      toString.call(value) === '[object Function]' || typeof value === 'function'
    )
  };

  // is given value a pure JSON object?
  is.json = function (value) {
    return toString.call(value) === '[object Object]'
  };

  // is a given value NaN?
  is.nan = function (value) {
    // NaN is number :) Also it is the only value which does not equal itself
    return value !== value
  };

  // is a given value null?
  is['null'] = function (value) {
    return value === null
  };

  // is a given value number?
  is.number = function (value) {
    return is.not.nan(value) && toString.call(value) === '[object Number]'
  };

  // is a given value object?
  is.object = function (value) {
    return Object(value) === value
  };

  // is a given value RegExp?
  is.regexp = function (value) {
    return toString.call(value) === '[object RegExp]'
  };

  // are given values same type?
  // prevent NaN, Number same type check
  is.sameType = function (value, other) {
    var tag = toString.call(value);
    if (tag !== toString.call(other)) {
      return false
    }
    if (tag === '[object Number]') {
      return !is.any.nan(value, other) || is.all.nan(value, other)
    }
    return true
  };
  // sameType method does not support 'all' and 'any' interfaces
  is.sameType.api = ['not'];

  // is a given value String?
  is.string = function (value) {
    return toString.call(value) === '[object String]'
  };

  // is a given value undefined?
  is.undefined = function (value) {
    return value === void 0
  };

  // is a given value window?
  // setInterval method is only available for window object
  is.windowObject = function (value) {
    return value != null && typeof value === 'object' && 'setInterval' in value
  };

  // Presence checks
  /* -------------------------------------------------------------------------- */

  //is a given value empty? Objects, arrays, strings
  is.empty = function (value) {
    if (is.object(value)) {
      var length = Object.getOwnPropertyNames(value).length;
      if (
        length === 0 ||
        (length === 1 && is.array(value)) ||
        (length === 2 && is.arguments(value))
      ) {
        return true
      }
      return false
    }
    return value === ''
  };

  // is a given value existy?
  is.existy = function (value) {
    return value != null
  };

  // is a given value falsy?
  is.falsy = function (value) {
    return !value
  };

  // is a given value truthy?
  is.truthy = not(is.falsy);

  // Arithmetic checks
  /* -------------------------------------------------------------------------- */

  // is a given number above minimum parameter?
  is.above = function (n, min) {
    return is.all.number(n, min) && n > min
  };
  // above method does not support 'all' and 'any' interfaces
  is.above.api = ['not'];

  // is a given number decimal?
  is.decimal = function (n) {
    return is.number(n) && n % 1 !== 0
  };

  // are given values equal? supports numbers, strings, regexes, booleans
  // TODO: Add object and array support
  is.equal = function (value, other) {
    // check 0 and -0 equity with Infinity and -Infinity
    if (is.all.number(value, other)) {
      return value === other && 1 / value === 1 / other
    }
    // check regexes as strings too
    if (is.all.string(value, other) || is.all.regexp(value, other)) {
      return '' + value === '' + other
    }
    if (is.all.boolean(value, other)) {
      return value === other
    }
    return false
  };
  // equal method does not support 'all' and 'any' interfaces
  is.equal.api = ['not'];

  // is a given number even?
  is.even = function (n) {
    return is.number(n) && n % 2 === 0
  };

  // is a given number finite?
  is.finite =
    isFinite ||
    function (n) {
      return is.not.infinite(n) && is.not.nan(n)
    };

  // is a given number infinite?
  is.infinite = function (n) {
    return n === Infinity || n === -Infinity
  };

  // is a given number integer?
  is.integer = function (n) {
    return is.number(n) && n % 1 === 0
  };

  // is a given number negative?
  is.negative = function (n) {
    return is.number(n) && n < 0
  };

  // is a given number odd?
  is.odd = function (n) {
    return is.number(n) && (n % 2 === 1 || n % 2 === -1)
  };

  // is a given number positive?
  is.positive = function (n) {
    return is.number(n) && n > 0
  };

  // is a given number above maximum parameter?
  is.under = function (n, max) {
    return is.all.number(n, max) && n < max
  };
  // least method does not support 'all' and 'any' interfaces
  is.under.api = ['not'];

  // is a given number within minimum and maximum parameters?
  is.within = function (n, min, max) {
    return is.all.number(n, min, max) && n > min && n < max
  };
  // within method does not support 'all' and 'any' interfaces
  is.within.api = ['not'];

  // Regexp checks
  /* -------------------------------------------------------------------------- */
  // Steven Levithan, Jan Goyvaerts: Regular Expressions Cookbook
  // Scott Gonzalez: Email address validation

  // dateString match m/d/yy and mm/dd/yyyy, allowing any combination of one or two digits for the day and month, and two or four digits for the year
  // eppPhone match extensible provisioning protocol format
  // nanpPhone match north american number plan format
  // time match hours, minutes, and seconds, 24-hour clock
  var regexes = {
    affirmative: /^(?:1|t(?:rue)?|y(?:es)?|ok(?:ay)?)$/,
    alphaNumeric: /^[A-Za-z0-9]+$/,
    caPostalCode: /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z]\s?[0-9][A-Z][0-9]$/,
    creditCard: /^(?:(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11}))$/,
    dateString: /^(1[0-2]|0?[1-9])([\/-])(3[01]|[12][0-9]|0?[1-9])(?:\2)(?:[0-9]{2})?[0-9]{2}$/,
    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i, // eslint-disable-line no-control-regex
    eppPhone: /^\+[0-9]{1,3}\.[0-9]{4,14}(?:x.+)?$/,
    hexadecimal: /^(?:0x)?[0-9a-fA-F]+$/,
    hexColor: /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    ipv4: /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,
    ipv6: /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,
    nanpPhone: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
    socialSecurityNumber: /^(?!000|666)[0-8][0-9]{2}-?(?!00)[0-9]{2}-?(?!0000)[0-9]{4}$/,
    timeString: /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,
    ukPostCode: /^[A-Z]{1,2}[0-9RCHNQ][0-9A-Z]?\s?[0-9][ABD-HJLNP-UW-Z]{2}$|^[A-Z]{2}-?[0-9]{4}$/,
    url: /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i,
    usZipCode: /^[0-9]{5}(?:-[0-9]{4})?$/,
  };

  function regexpCheck(regexp, regexes) {
    is[regexp] = function (value) {
      return is.existy(value) && regexes[regexp].test(value)
    };
  }

  // create regexp checks methods from 'regexes' object
  for (var regexp in regexes) {
    if (regexes.hasOwnProperty(regexp)) {
      regexpCheck(regexp, regexes);
    }
  }

  // simplify IP checks by calling the regex helpers for IPv4 and IPv6
  is.ip = function (value) {
    return is.ipv4(value) || is.ipv6(value)
  };

  // String checks
  /* -------------------------------------------------------------------------- */

  // is a given string or sentence capitalized?
  is.capitalized = function (string) {
    if (is.not.string(string)) {
      return false
    }
    var words = string.split(' ');
    for (var i = 0; i < words.length; i++) {
      var word = words[i];
      if (word.length) {
        var chr = word.charAt(0);
        if (chr !== chr.toUpperCase()) {
          return false
        }
      }
    }
    return true
  };

  // is string end with a given target parameter?
  is.endWith = function (string, target) {
    if (is.not.string(string)) {
      return false
    }
    target += '';
    var position = string.length - target.length;
    return position >= 0 && string.indexOf(target, position) === position
  };
  // endWith method does not support 'all' and 'any' interfaces
  is.endWith.api = ['not'];

  // is a given string include parameter target?
  is.include = function (string, target) {
    return string.indexOf(target) > -1
  };
  // include method does not support 'all' and 'any' interfaces
  is.include.api = ['not'];

  // is a given string all lowercase?
  is.lowerCase = function (string) {
    return is.string(string) && string === string.toLowerCase()
  };

  // is a given string palindrome?
  is.palindrome = function (string) {
    if (is.not.string(string)) {
      return false
    }
    string = string.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
    var length = string.length - 1;
    for (var i = 0, half = Math.floor(length / 2); i <= half; i++) {
      if (string.charAt(i) !== string.charAt(length - i)) {
        return false
      }
    }
    return true
  };

  // is a given value space?
  // horizontal tab: 9, line feed: 10, vertical tab: 11, form feed: 12, carriage return: 13, space: 32
  is.space = function (value) {
    if (is.not.char(value)) {
      return false
    }
    var charCode = value.charCodeAt(0);
    return (charCode > 8 && charCode < 14) || charCode === 32
  };

  // is string start with a given target parameter?
  is.startWith = function (string, target) {
    return is.string(string) && string.indexOf(target) === 0
  };
  // startWith method does not support 'all' and 'any' interfaces
  is.startWith.api = ['not'];

  // is a given string all uppercase?
  is.upperCase = function (string) {
    return is.string(string) && string === string.toUpperCase()
  };

  // Time checks
  /* -------------------------------------------------------------------------- */

  var days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  var months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  // is a given dates day equal given day parameter?
  is.day = function (date, day) {
    return is.date(date) && day.toLowerCase() === days[date.getDay()]
  };
  // day method does not support 'all' and 'any' interfaces
  is.day.api = ['not'];

  // is a given date in daylight saving time?
  is.dayLightSavingTime = function (date) {
    var january = new Date(date.getFullYear(), 0, 1);
    var july = new Date(date.getFullYear(), 6, 1);
    var stdTimezoneOffset = Math.max(
      january.getTimezoneOffset(),
      july.getTimezoneOffset()
    );
    return date.getTimezoneOffset() < stdTimezoneOffset
  };

  // is a given date future?
  is.future = function (date) {
    var now = new Date();
    return is.date(date) && date.getTime() > now.getTime()
  };

  // is date within given range?
  is.inDateRange = function (date, start, end) {
    if (is.not.date(date) || is.not.date(start) || is.not.date(end)) {
      return false
    }
    var stamp = date.getTime();
    return stamp > start.getTime() && stamp < end.getTime()
  };
  // inDateRange method does not support 'all' and 'any' interfaces
  is.inDateRange.api = ['not'];

  // is a given date in last month range?
  is.inLastMonth = function (date) {
    return is.inDateRange(
      date,
      new Date(new Date().setMonth(new Date().getMonth() - 1)),
      new Date()
    )
  };

  // is a given date in last week range?
  is.inLastWeek = function (date) {
    return is.inDateRange(
      date,
      new Date(new Date().setDate(new Date().getDate() - 7)),
      new Date()
    )
  };

  // is a given date in last year range?
  is.inLastYear = function (date) {
    return is.inDateRange(
      date,
      new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      new Date()
    )
  };

  // is a given date in next month range?
  is.inNextMonth = function (date) {
    return is.inDateRange(
      date,
      new Date(),
      new Date(new Date().setMonth(new Date().getMonth() + 1))
    )
  };

  // is a given date in next week range?
  is.inNextWeek = function (date) {
    return is.inDateRange(
      date,
      new Date(),
      new Date(new Date().setDate(new Date().getDate() + 7))
    )
  };

  // is a given date in next year range?
  is.inNextYear = function (date) {
    return is.inDateRange(
      date,
      new Date(),
      new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    )
  };

  // is the given year a leap year?
  is.leapYear = function (year) {
    return (
      is.number(year) &&
      ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)
    )
  };

  // is a given dates month equal given month parameter?
  is.month = function (date, month) {
    return is.date(date) && month.toLowerCase() === months[date.getMonth()]
  };
  // month method does not support 'all' and 'any' interfaces
  is.month.api = ['not'];

  // is a given date past?
  is.past = function (date) {
    var now = new Date();
    return is.date(date) && date.getTime() < now.getTime()
  };

  // is a given date in the parameter quarter?
  is.quarterOfYear = function (date, quarter) {
    return (
      is.date(date) &&
      is.number(quarter) &&
      quarter === Math.floor((date.getMonth() + 3) / 3)
    )
  };
  // quarterOfYear method does not support 'all' and 'any' interfaces
  is.quarterOfYear.api = ['not'];

  // is a given date indicate today?
  is.today = function (date) {
    var now = new Date();
    var todayString = now.toDateString();
    return is.date(date) && date.toDateString() === todayString
  };

  // is a given date indicate tomorrow?
  is.tomorrow = function (date) {
    var now = new Date();
    var tomorrowString = new Date(now.setDate(now.getDate() + 1)).toDateString();
    return is.date(date) && date.toDateString() === tomorrowString
  };

  // is a given date weekend?
  // 6: Saturday, 0: Sunday
  is.weekend = function (date) {
    return is.date(date) && (date.getDay() === 6 || date.getDay() === 0)
  };

  // is a given date weekday?
  is.weekday = not(is.weekend);

  // is a given dates year equal given year parameter?
  is.year = function (date, year) {
    return is.date(date) && is.number(year) && year === date.getFullYear()
  };
  // year method does not support 'all' and 'any' interfaces
  is.year.api = ['not'];

  // is a given date indicate yesterday?
  is.yesterday = function (date) {
    var now = new Date();
    var yesterdayString = new Date(now.setDate(now.getDate() - 1)).toDateString();
    return is.date(date) && date.toDateString() === yesterdayString
  };

  // Environment checks
  /* -------------------------------------------------------------------------- */

  var freeGlobal = is.windowObject(typeof global == 'object' && global) && global;
  var freeSelf = is.windowObject(typeof self == 'object' && self) && self;
  var thisGlobal = is.windowObject(typeof undefined == 'object' && undefined) && undefined;
  var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

  var document = freeSelf && freeSelf.document;
  var previousIs = root.is;

  // store navigator properties to use later
  var navigator = freeSelf && freeSelf.navigator;
  var platform = ((navigator && navigator.platform) || '').toLowerCase();
  var userAgent = ((navigator && navigator.userAgent) || '').toLowerCase();
  var vendor = ((navigator && navigator.vendor) || '').toLowerCase();

  // is current device android?
  is.android = function () {
    return /android/.test(userAgent)
  };
  // android method does not support 'all' and 'any' interfaces
  is.android.api = ['not'];

  // is current device android phone?
  is.androidPhone = function () {
    return /android/.test(userAgent) && /mobile/.test(userAgent)
  };
  // androidPhone method does not support 'all' and 'any' interfaces
  is.androidPhone.api = ['not'];

  // is current device android tablet?
  is.androidTablet = function () {
    return /android/.test(userAgent) && !/mobile/.test(userAgent)
  };
  // androidTablet method does not support 'all' and 'any' interfaces
  is.androidTablet.api = ['not'];

  // is current device blackberry?
  is.blackberry = function () {
    return /blackberry/.test(userAgent) || /bb10/.test(userAgent)
  };
  // blackberry method does not support 'all' and 'any' interfaces
  is.blackberry.api = ['not'];

  // is current browser chrome?
  // parameter is optional
  is.chrome = function (range) {
    var match = /google inc/.test(vendor)
      ? userAgent.match(/(?:chrome|crios)\/(\d+)/)
      : null;
    return match !== null && is.not.opera() && compareVersion(match[1], range)
  };
  // chrome method does not support 'all' and 'any' interfaces
  is.chrome.api = ['not'];

  // is current device desktop?
  is.desktop = function () {
    return is.not.mobile() && is.not.tablet()
  };
  // desktop method does not support 'all' and 'any' interfaces
  is.desktop.api = ['not'];

  // is current browser edge?
  // parameter is optional
  is.edge = function (range) {
    var match = userAgent.match(/edge\/(\d+)/);
    return match !== null && compareVersion(match[1], range)
  };
  // edge method does not support 'all' and 'any' interfaces
  is.edge.api = ['not'];

  // is current browser firefox?
  // parameter is optional
  is.firefox = function (range) {
    var match = userAgent.match(/(?:firefox|fxios)\/(\d+)/);
    return match !== null && compareVersion(match[1], range)
  };
  // firefox method does not support 'all' and 'any' interfaces
  is.firefox.api = ['not'];

  // is current browser internet explorer?
  // parameter is optional
  is.ie = function (range) {
    var match = userAgent.match(/(?:msie |trident.+?; rv:)(\d+)/);
    return match !== null && compareVersion(match[1], range)
  };
  // ie method does not support 'all' and 'any' interfaces
  is.ie.api = ['not'];

  // is current device ios?
  is.ios = function () {
    return is.iphone() || is.ipad() || is.ipod()
  };
  // ios method does not support 'all' and 'any' interfaces
  is.ios.api = ['not'];

  // is current device ipad?
  // parameter is optional
  is.ipad = function (range) {
    var match = userAgent.match(/ipad.+?os (\d+)/);
    return match !== null && compareVersion(match[1], range)
  };
  // ipad method does not support 'all' and 'any' interfaces
  is.ipad.api = ['not'];

  // is current device iphone?
  // parameter is optional
  is.iphone = function (range) {
    // avoid false positive for Facebook in-app browser on ipad;
    // original iphone doesn't have the OS portion of the UA
    var match = is.ipad() ? null : userAgent.match(/iphone(?:.+?os (\d+))?/);
    return match !== null && compareVersion(match[1] || 1, range)
  };
  // iphone method does not support 'all' and 'any' interfaces
  is.iphone.api = ['not'];

  // is current device ipod?
  // parameter is optional
  is.ipod = function (range) {
    var match = userAgent.match(/ipod.+?os (\d+)/);
    return match !== null && compareVersion(match[1], range)
  };
  // ipod method does not support 'all' and 'any' interfaces
  is.ipod.api = ['not'];

  // is current operating system linux?
  is.linux = function () {
    return /linux/.test(platform) && is.not.android()
  };
  // linux method does not support 'all' and 'any' interfaces
  is.linux.api = ['not'];

  // is current operating system mac?
  is.mac = function () {
    return /mac/.test(platform)
  };
  // mac method does not support 'all' and 'any' interfaces
  is.mac.api = ['not'];

  // is current device mobile?
  is.mobile = function () {
    return (
      is.iphone() ||
      is.ipod() ||
      is.androidPhone() ||
      is.blackberry() ||
      is.windowsPhone()
    )
  };
  // mobile method does not support 'all' and 'any' interfaces
  is.mobile.api = ['not'];

  // is current state offline?
  is.offline = not(is.online);
  // offline method does not support 'all' and 'any' interfaces
  is.offline.api = ['not'];

  // is current state online?
  is.online = function () {
    return !navigator || navigator.onLine === true
  };
  // online method does not support 'all' and 'any' interfaces
  is.online.api = ['not'];

  // is current browser opera?
  // parameter is optional
  is.opera = function (range) {
    var match = userAgent.match(/(?:^opera.+?version|opr)\/(\d+)/);
    return match !== null && compareVersion(match[1], range)
  };
  // opera method does not support 'all' and 'any' interfaces
  is.opera.api = ['not'];

  // is current browser opera mini?
  // parameter is optional
  is.operaMini = function (range) {
    var match = userAgent.match(/opera mini\/(\d+)/);
    return match !== null && compareVersion(match[1], range)
  };
  // operaMini method does not support 'all' and 'any' interfaces
  is.operaMini.api = ['not'];

  // is current browser phantomjs?
  // parameter is optional
  is.phantom = function (range) {
    var match = userAgent.match(/phantomjs\/(\d+)/);
    return match !== null && compareVersion(match[1], range)
  };
  // phantom method does not support 'all' and 'any' interfaces
  is.phantom.api = ['not'];

  // is current browser safari?
  // parameter is optional
  is.safari = function (range) {
    var match = userAgent.match(/version\/(\d+).+?safari/);
    return match !== null && compareVersion(match[1], range)
  };
  // safari method does not support 'all' and 'any' interfaces
  is.safari.api = ['not'];

  // is current device tablet?
  is.tablet = function () {
    return is.ipad() || is.androidTablet() || is.windowsTablet()
  };
  // tablet method does not support 'all' and 'any' interfaces
  is.tablet.api = ['not'];

  // is current device supports touch?
  is.touchDevice = function () {
    return (
      !!document &&
      ('ontouchstart' in freeSelf ||
        ('DocumentTouch' in freeSelf && document instanceof DocumentTouch))
    )
  };
  // touchDevice method does not support 'all' and 'any' interfaces
  is.touchDevice.api = ['not'];

  // is current operating system windows?
  is.windows = function () {
    return /win/.test(platform)
  };
  // windows method does not support 'all' and 'any' interfaces
  is.windows.api = ['not'];

  // is current device windows phone?
  is.windowsPhone = function () {
    return is.windows() && /phone/.test(userAgent)
  };
  // windowsPhone method does not support 'all' and 'any' interfaces
  is.windowsPhone.api = ['not'];

  // is current device windows tablet?
  is.windowsTablet = function () {
    return is.windows() && is.not.windowsPhone() && /touch/.test(userAgent)
  };
  // windowsTablet method does not support 'all' and 'any' interfaces
  is.windowsTablet.api = ['not'];

  // Object checks
  /* -------------------------------------------------------------------------- */

  // has a given object got parameterized count property?
  is.propertyCount = function (object, count) {
    if (is.not.object(object) || is.not.number(count)) {
      return false
    }
    var n = 0;
    for (var property in object) {
      if (hasOwnProperty.call(object, property) && ++n > count) {
        return false
      }
    }
    return n === count
  };
  // propertyCount method does not support 'all' and 'any' interfaces
  is.propertyCount.api = ['not'];

  // is given object has parameterized property?
  is.propertyDefined = function (object, property) {
    return is.object(object) && is.string(property) && property in object
  };
  // propertyDefined method does not support 'all' and 'any' interfaces
  is.propertyDefined.api = ['not'];

  // is a given value thenable (like Promise)?
  is.thenable = function (value) {
    return is.object(value) && typeof value.then === 'function'
  };

  // Array checks
  /* -------------------------------------------------------------------------- */

  // is a given item in an array?
  is.inArray = function (value, array) {
    if (is.not.array(array)) {
      return false
    }
    for (var i = 0; i < array.length; i++) {
      if (array[i] === value) {
        return true
      }
    }
    return false
  };
  // inArray method does not support 'all' and 'any' interfaces
  is.inArray.api = ['not'];

  // is a given array sorted?
  is.sorted = function (array, sign) {
    if (is.not.array(array)) {
      return false
    }
    var predicate = comparator[sign] || comparator['>='];
    for (var i = 1; i < array.length; i++) {
      if (!predicate(array[i], array[i - 1])) {
        return false
      }
    }
    return true
  };

  // API
  // Set 'not', 'all' and 'any' interfaces to methods based on their api property
  /* -------------------------------------------------------------------------- */

  function setInterfaces() {
    var options = is;
    for (var option in options) {
      if (
        hasOwnProperty.call(options, option) &&
        is['function'](options[option])
      ) {
        var interfaces = options[option].api || ['not', 'all', 'any'];
        for (var i = 0; i < interfaces.length; i++) {
          if (interfaces[i] === 'not') {
            is.not[option] = not(is[option]);
          }
          if (interfaces[i] === 'all') {
            is.all[option] = all(is[option]);
          }
          if (interfaces[i] === 'any') {
            is.any[option] = any(is[option]);
          }
        }
      }
    }
  }
  setInterfaces();

  // Configuration methods
  // Intentionally added after setInterfaces function
  /* -------------------------------------------------------------------------- */

  // change namespace of library to prevent name collisions
  // var preferredName = is.setNamespace();
  // preferredName.odd(3);
  // => true
  is.setNamespace = function () {
    root.is = previousIs;
    return this
  };

  // set optional regexes to methods
  is.setRegexp = function (regexp, name) {
    for (var r in regexes) {
      if (hasOwnProperty.call(regexes, r) && name === r) {
        regexes[r] = regexp;
      }
    }
  };

  const ok = is.existy;

  var env = Object.create({
    /**
     * @description Fetches the env var with the given key. If no env var
     * with the specified key exists, the default value is returned if it is
     * provided else it returns undefined
     *
     * @param {(string|string[])} keyObj - A unique key for an item or a list of possible keys
     * @param {(string|number)} defaultVal - The default value of an item if it doesn't
     * already exist
     *
     */
    get(keyObj, defaultVal) {
      let keys;
      let value;

      if (is.string(keyObj)) {
        keys = [keyObj];
      } else if (is.array(keyObj)) {
        keys = keyObj.map((k) => k.trim());
      } else {
        throw Error(`Invalid key(s) ${keyObj}`)
      }

      keys.some((key) => {
        if (ok(process.env[key])) {
          value = process.env[key];
          return true
        }
      });

      if (!ok(value) && typeof ok(defaultVal)) {
        value = defaultVal;
      }

      value = is.string(value) ? value.trim() : value;

      return value
    },

    /**
     * @description Gets all items specified in the object. If the item is an
     * array, the function will perform a standard get with no defaults. If the
     * item is an object {}, the function will use the values as defaults -
     * null values will be treated as no default specified
     *
     * @param {string[]} items - An array of keys
     *
     */
    getAll(items) {
      if (!items) items = process.env;

      const objReducer = (obj, getter) =>
        Object.keys(obj).reduce((prev, next, index) => {
          prev[next] = getter(next, obj[next]);
          return prev
        }, {});

      const arrReducer = (keys, getter) => {
        const arr = items.map((key) => getter(key));
        return arr.reduce((prev, next, index) => {
          prev[keys[index]] = arr[index];
          return prev
        }, {})
      };

      if (is.array(items)) {
        return arrReducer(items, this.get)
      } else if (is.json(items)) {
        return objReducer(items, this.get)
      } else {
        throw Error(`Invalid arg ${items}`)
      }
    },

    /**
     * @description Determines whether or not all of the values given key is
     * truthy
     *
     * @param {(string|string[])} keys - A unique key or array of keys
     *
     */
    ok: (...keys) => keys.every((key) => ok(process.env[key])),

    /**
     * @description This method ensures 1 to many environment variables either
     * exist, or exist and are of a designated type
     *
     * @example
     * ensure(
     *  // Will ensure 'HOSTNAME' exists
     *  'HOSTNAME',
     *  // Will ensure 'PORT' both exists and is a number
     *  { 'PORT': { type: 'number' }},
     *  // Will ensure 'INTERVAL' exists, it's a number and its value is greater
     *  // than or equal to 1000
     *  { 'INTERVAL': { type: 'number', ok: s => s >= 1000 }}
     *  // ...
     * )
     *
     */
    ensure(...items) {
      const self = this;
      const getKit = (item) => {
        switch (item) {
          case 'string':
            console.log('triggered string');
            return { validator: is.string, getter: self.get.bind(self) }
          case 'number':
            console.log('triggered number');
            return { validator: is.number, getter: self.getNumber.bind(self) }
          case 'boolean':
            console.log('triggered boolean');
            return { validator: is.boolean, getter: self.getBool.bind(self) }
          default:
            console.log(`i thould throw\n`);
            throw Error(`Invalid type "${item}"`)
        }
      };

      return items.every((item) => {
        if (is.string(item)) {
          if (this.ok(item)) {
            return true
          } else {
            throw Error(`No environment configuration for var "${item}"`)
          }
        } else if (is.json(item)) {
          const key = Object.keys(item)[0];
          const type = item[key].type;
          const validator = item[key].ok;

          if (type && !validType(type)) {
            throw Error(`Invalid expected type "${type}"`)
          } else {
            const kit = getKit(type);
            const val = kit.getter(key);
            const result = kit.validator(val);
            if (!result) {
              throw Error(
                `Unexpected result for key="${key}". It may not exist or may not be a valid "${type}"`
              )
            }

            if (validator && is.function(validator)) {
              const valid = validator(val);
              if (!valid) {
                throw Error(
                  `Value ${val} did not pass validator function for key "${key}"`
                )
              }
            }
            return true
          }
        } else {
          throw Error(`Invalid key ${item}`)
        }
      })
    },

    /**
     * @description Fetches the value at the given key and attempts to coerce
     * it into a boolean
     *
     * @param {string} key - A unique key
     * @param {boolean} defaultVal - The default value
     *
     */
    getBool(key, defaultVal) {
      let value;

      value = process.env[key];

      if (ok(value)) {
        let ret;
        value = value.toLowerCase().trim();
        if (value === 'true') {
          ret = true;
        } else if (value === 'false') {
          ret = false;
        }
        return ret
      } else if (defaultVal === true || defaultVal === false) {
        return defaultVal
      }

      return false
    },

    /**
     * @description An alias function for getBool()
     *
     * @param {string} key - A unique key
     * @param {boolean} defaultVal - The default value if none exists
     *
     */
    bool(key, defaultVal) {
      return this.getBool(key, defaultVal)
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into an integer
     *
     * @param {string} key - A unique key
     * @param {number} defaultVal - The default value
     *
     */
    getNumber(key, defaultVal) {
      let value;
      let intVal;
      let valIsInt;

      value = this.get(key, defaultVal);
      intVal = parseInt(value, 10);
      valIsInt = is.integer(intVal);

      if (value === defaultVal) {
        return value
      } else if (valIsInt) {
        return intVal
      }
    },

    /**
     * @description An alias function for getNumber()
     *
     */
    num(key, defaultVal) {
      return this.getNumber(key, defaultVal)
    },

    /**
     * @description Fetches the value at the given key and attempts to
     * coherse it into a list of literal values
     *
     * @param {string} key - A unique key
     * @param {object} options
     *
     */
    getList(key, opts = { dilim: ',', cast: null }) {
      const { dilim, cast } = opts;
      let value;

      value = this.get(key, []);

      if (!is.array(value)) {
        let ret = value.split(dilim).map((i) => i.trim());
        if (cast && cast === 'number') {
          ret = mapNums(ret);
        }
        return ret
      } else {
        return value
      }
    },

    /**
     * @description An alias function for getList()
     *
     * @param {string} key - A unique key
     * @param {object} options
     *
     */
    list(key, opts) {
      return this.getList(key, opts)
    },
  });

  const parse$1 = (items, converter) => items.map((t) => converter(t, 10));
  const mapNums = (items) => parse$1(items, parseInt);
  const validType = (item) => ['number', 'boolean', 'string'].includes(item);

  const __dirname$1 = path.resolve();
  const cpath = __dirname$1;
  // Local ENV
  config({ path: cpath + '/../../../../.env' });

  // Frontier ENV
  config({ path: cpath + '/front.env' });

  let args = function (args, opts) {
    if (env.get('FRONT_DEBUG')) console.log({ full: process.argv });
    if (!opts) opts = {};

    var flags = { bools: {}, strings: {}, unknownFn: null };

    if (typeof opts['unknown'] === 'function') {
      flags.unknownFn = opts['unknown'];
    }

    if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
      flags.allBools = true;
    } else {
  []
        .concat(opts['boolean'])
        .filter(Boolean)
        .forEach(function (key) {
          flags.bools[key] = true;
        });
    }

    var aliases = {};
    Object.keys(opts.alias || {}).forEach(function (key) {
      aliases[key] = [].concat(opts.alias[key]);
      aliases[key].forEach(function (x) {
        aliases[x] = [key].concat(
          aliases[key].filter(function (y) {
            return x !== y
          })
        );
      });
    })
    ;[]
      .concat(opts.string)
      .filter(Boolean)
      .forEach(function (key) {
        flags.strings[key] = true;
        if (aliases[key]) {
          flags.strings[aliases[key]] = true;
        }
      });

    var defaults = opts['default'] || {};

    var argv = { _: [] };
    Object.keys(flags.bools).forEach(function (key) {
      setArg(key, defaults[key] === undefined ? false : defaults[key]);
    });

    var notFlags = [];

    if (args.indexOf('--') !== -1) {
      notFlags = args.slice(args.indexOf('--') + 1);
      args = args.slice(0, args.indexOf('--'));
    }

    function argDefined(key, arg) {
      return (
        (flags.allBools && /^--[^=]+$/.test(arg)) ||
        flags.strings[key] ||
        flags.bools[key] ||
        aliases[key]
      )
    }

    function setArg(key, val, arg) {
      if (arg && flags.unknownFn && !argDefined(key, arg)) {
        if (flags.unknownFn(arg) === false) return
      }

      var value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
      setKey(argv, key.split('.'), value)
      ;(aliases[key] || []).forEach(function (x) {
        setKey(argv, x.split('.'), value);
      });
    }

    function setKey(obj, keys, value) {
      var o = obj;
      keys.slice(0, -1).forEach(function (key) {
        if (o[key] === undefined) o[key] = {};
        o = o[key];
      });

      var key = keys[keys.length - 1];
      if (
        o[key] === undefined ||
        flags.bools[key] ||
        typeof o[key] === 'boolean'
      ) {
        o[key] = value;
      } else if (Array.isArray(o[key])) {
        o[key].push(value);
      } else {
        o[key] = [o[key], value];
      }
    }

    function aliasIsBoolean(key) {
      return aliases[key].some(function (x) {
        return flags.bools[x]
      })
    }

    for (var i = 0; i < args.length; i++) {
      var arg = args[i];

      if (/^--.+=/.test(arg)) {
        // Using [\s\S] instead of . because js doesn't support the
        // 'dotall' regex modifier. See:
        // http://stackoverflow.com/a/1068308/13216
        var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
        var key = m[1];
        var value = m[2];
        if (flags.bools[key]) {
          value = value !== 'false';
        }
        setArg(key, value, arg);
      } else if (/^--no-.+/.test(arg)) {
        var key = arg.match(/^--no-(.+)/)[1];
        setArg(key, false, arg);
      } else if (/^--.+/.test(arg)) {
        var key = arg.match(/^--(.+)/)[1];
        var next = args[i + 1];
        if (
          next !== undefined &&
          !/^-/.test(next) &&
          !flags.bools[key] &&
          !flags.allBools &&
          (aliases[key] ? !aliasIsBoolean(key) : true)
        ) {
          setArg(key, next, arg);
          i++;
        } else if (/^(true|false)$/.test(next)) {
          setArg(key, next === 'true', arg);
          i++;
        } else {
          setArg(key, flags.strings[key] ? '' : true, arg);
        }
      } else if (/^-[^-]+/.test(arg)) {
        var letters = arg.slice(1, -1).split('');

        var broken = false;
        for (var j = 0; j < letters.length; j++) {
          var next = arg.slice(j + 2);

          if (next === '-') {
            setArg(letters[j], next, arg);
            continue
          }

          if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
            setArg(letters[j], next.split('=')[1], arg);
            broken = true;
            break
          }

          if (
            /[A-Za-z]/.test(letters[j]) &&
            /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)
          ) {
            setArg(letters[j], next, arg);
            broken = true;
            break
          }

          if (letters[j + 1] && letters[j + 1].match(/\W/)) {
            setArg(letters[j], arg.slice(j + 2), arg);
            broken = true;
            break
          } else {
            setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
          }
        }

        var key = arg.slice(-1)[0];
        if (!broken && key !== '-') {
          if (
            args[i + 1] &&
            !/^(-|--)[^-]/.test(args[i + 1]) &&
            !flags.bools[key] &&
            (aliases[key] ? !aliasIsBoolean(key) : true)
          ) {
            setArg(key, args[i + 1], arg);
            i++;
          } else if (args[i + 1] && /true|false/.test(args[i + 1])) {
            setArg(key, args[i + 1] === 'true', arg);
            i++;
          } else {
            setArg(key, flags.strings[key] ? '' : true, arg);
          }
        }
      } else {
        if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
          argv._.push(flags.strings['_'] || !isNumber(arg) ? arg : Number(arg));
        }
        if (opts.stopEarly) {
          argv._.push.apply(argv._, args.slice(i + 1));
          break
        }
      }
    }

    Object.keys(defaults).forEach(function (key) {
      if (!hasKey(argv, key.split('.'))) {
        setKey(argv, key.split('.'), defaults[key])
        ;(aliases[key] || []).forEach(function (x) {
          setKey(argv, x.split('.'), defaults[key]);
        });
      }
    });

    if (opts['--']) {
      argv['--'] = new Array();
      notFlags.forEach(function (key) {
        argv['--'].push(key);
      });
    } else {
      notFlags.forEach(function (key) {
        argv._.push(key);
      });
    }

    return argv
  };

  function hasKey(obj, keys) {
    var o = obj;
    keys.slice(0, -1).forEach(function (key) {
      o = o[key] || {};
    });

    var key = keys[keys.length - 1];
    return key in o
  }

  function isNumber(x) {
    if (typeof x === 'number') return true
    if (/^0x[0-9a-f]+$/i.test(x)) return true
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x)
  }

  // This will be for what services I use in
  // such as github versus bitbucket

  //
  let arsenal = 'needed';

  /*
    Catch Errors Handler

    With async/await, you need some way to catch errors
    Instead of using try{} catch(e) {} in each controller, we wrap the function in
    catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
  */

  function catchErrors(fn) {
    return function (req, res, next) {
      return fn(req, res, next).catch(next)
    }
  }

  /*
    Not Found Error Handler

    If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
  */
  function notFound(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  }

  /*
    MongoDB Validation Error Handler

    Detect if there are mongodb validation errors that we can nicely show via flash messages
  */

  function flashValidationErrors(err, req, res, next) {
    if (!err.errors) return next(err)
    // validation errors look like
    const errorKeys = Object.keys(err.errors);
    errorKeys.forEach((key) => req.flash('error', err.errors[key].message));
    res.redirect('back');
  }

  /*
    Development Error Handler

    In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
  */
  function developmentErrors(err, req, res, next) {
    err.stack = err.stack || '';
    const errorDetails = {
      message: err.message,
      status: err.status,
      stackHighlighted: err.stack.replace(
        /[a-z_-\d]+.js:\d+:\d+/gi,
        '<mark>$&</mark>'
      ),
    };
    res.status(err.status || 500);
    res.format({
      // Based on the `Accept` http header
      'text/html': () => {
        res.render('error', errorDetails);
      }, // Form Submit, Reload the page
      'application/json': () => res.json(errorDetails), // Ajax call, send JSON back
    });
  }

  /*
    Production Error Handler

    No stacktraces are leaked to user
  */
  function productionErrors(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
    });
  }

  let errorHandling = {
    notFound,
    flashValidationErrors,
    catchErrors,
    developmentErrors,
    productionErrors,
  };

  // create github repo for this and interact with it
  const github = 'support needed';

  let _fs = fs__default;
  let fromCallback = function (fn) {
    return Object.defineProperty(
      function () {
        if (typeof arguments[arguments.length - 1] === 'function')
          fn.apply(this, arguments);
        else {
          return new Promise((resolve, reject) => {
            arguments[arguments.length] = (err, res) => {
              if (err) return reject(err)
              resolve(res);
            };
            arguments.length++;
            fn.apply(this, arguments);
          })
        }
      },
      'name',
      { value: fn.name }
    )
  };

  //const universalify = require('universalify')

  function readFileWithCallback(file, options, callback) {
    if (callback == null) {
      callback = options;
      options = {};
    }

    if (typeof options === 'string') {
      options = { encoding: options };
    }

    options = options || {};
    const fs = options.fs || _fs;

    let shouldThrow = true;
    if ('throws' in options) {
      shouldThrow = options.throws;
    }

    fs.readFile(file, options, (err, data) => {
      if (err) return callback(err)

      data = stripBom(data);

      let obj;
      try {
        obj = JSON.parse(data, options ? options.reviver : null);
      } catch (err2) {
        if (shouldThrow) {
          err2.message = `${file}: ${err2.message}`;
          return callback(err2)
        } else {
          return callback(null, null)
        }
      }

      callback(null, obj);
    });
  }

  const readFile = fromCallback(readFileWithCallback);

  function readFileSync(file, options) {
    options = options || {};
    if (typeof options === 'string') {
      options = { encoding: options };
    }

    const fs = options.fs || _fs;

    let shouldThrow = true;
    if ('throws' in options) {
      shouldThrow = options.throws;
    }

    try {
      let content = fs.readFileSync(file, options);
      content = stripBom(content);
      return JSON.parse(content, options.reviver)
    } catch (err) {
      if (shouldThrow) {
        err.message = `${file}: ${err.message}`;
        throw err
      } else {
        return null
      }
    }
  }

  function stringify(obj, options) {
    let spaces;
    let EOL = '\n';
    if (typeof options === 'object' && options !== null) {
      if (options.spaces) {
        spaces = options.spaces;
      }
      if (options.EOL) {
        EOL = options.EOL;
      }
    }

    const str = JSON.stringify(obj, options ? options.replacer : null, spaces);

    return str.replace(/\n/g, EOL) + EOL
  }

  function writeFileWithCallback(file, obj, options, callback) {
    if (callback == null) {
      callback = options;
      options = {};
    }
    options = options || {};
    const fs = options.fs || _fs;

    let str = '';
    try {
      str = stringify(obj, options);
    } catch (err) {
      return callback(err, null)
    }

    fs.writeFile(file, str, options, callback);
  }

  const writeFile = fromCallback(writeFileWithCallback);

  function writeFileSync(file, obj, options) {
    options = options || {};
    const fs = options.fs || _fs;

    const str = stringify(obj, options);
    // not sure if fs.writeFileSync returns anything, but just in case
    return fs.writeFileSync(file, str, options)
  }

  function stripBom(content) {
    // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
    if (Buffer.isBuffer(content)) content = content.toString('utf8');
    content = content.replace(/^\uFEFF/, '');
    return content
  }

  const jsonFiles = {
    readFile,
    readFileSync,
    writeFile,
    writeFileSync,
  };

  const { FORCE_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

  const $ = {
    enabled: !NODE_DISABLE_COLORS && TERM !== 'dumb' && FORCE_COLOR !== '0',

    // modifiers
    reset: init(0, 0),
    bold: init(1, 22),
    dim: init(2, 22),
    italic: init(3, 23),
    underline: init(4, 24),
    inverse: init(7, 27),
    hidden: init(8, 28),
    strikethrough: init(9, 29),

    // colors
    black: init(30, 39),
    red: init(31, 39),
    green: init(32, 39),
    yellow: init(33, 39),
    blue: init(34, 39),
    magenta: init(35, 39),
    cyan: init(36, 39),
    white: init(37, 39),
    gray: init(90, 39),
    grey: init(90, 39),

    // background colors
    bgBlack: init(40, 49),
    bgRed: init(41, 49),
    bgGreen: init(42, 49),
    bgYellow: init(43, 49),
    bgBlue: init(44, 49),
    bgMagenta: init(45, 49),
    bgCyan: init(46, 49),
    bgWhite: init(47, 49),
  };

  function run(arr, str) {
    let i = 0,
      tmp,
      beg = '',
      end = '';
    for (; i < arr.length; i++) {
      tmp = arr[i];
      beg += tmp.open;
      end += tmp.close;
      if (str.includes(tmp.close)) {
        str = str.replace(tmp.rgx, tmp.close + tmp.open);
      }
    }
    return beg + str + end
  }

  function chain(has, keys) {
    let ctx = { has, keys };

    ctx.reset = $.reset.bind(ctx);
    ctx.bold = $.bold.bind(ctx);
    ctx.dim = $.dim.bind(ctx);
    ctx.italic = $.italic.bind(ctx);
    ctx.underline = $.underline.bind(ctx);
    ctx.inverse = $.inverse.bind(ctx);
    ctx.hidden = $.hidden.bind(ctx);
    ctx.strikethrough = $.strikethrough.bind(ctx);

    ctx.black = $.black.bind(ctx);
    ctx.red = $.red.bind(ctx);
    ctx.green = $.green.bind(ctx);
    ctx.yellow = $.yellow.bind(ctx);
    ctx.blue = $.blue.bind(ctx);
    ctx.magenta = $.magenta.bind(ctx);
    ctx.cyan = $.cyan.bind(ctx);
    ctx.white = $.white.bind(ctx);
    ctx.gray = $.gray.bind(ctx);
    ctx.grey = $.grey.bind(ctx);

    ctx.bgBlack = $.bgBlack.bind(ctx);
    ctx.bgRed = $.bgRed.bind(ctx);
    ctx.bgGreen = $.bgGreen.bind(ctx);
    ctx.bgYellow = $.bgYellow.bind(ctx);
    ctx.bgBlue = $.bgBlue.bind(ctx);
    ctx.bgMagenta = $.bgMagenta.bind(ctx);
    ctx.bgCyan = $.bgCyan.bind(ctx);
    ctx.bgWhite = $.bgWhite.bind(ctx);

    return ctx
  }

  function init(open, close) {
    let blk = {
      open: `\x1b[${open}m`,
      close: `\x1b[${close}m`,
      rgx: new RegExp(`\\x1b\\[${close}m`, 'g'),
    };
    return function (txt) {
      if (this !== void 0 && this.has !== void 0) {
        this.has.includes(open) || (this.has.push(open), this.keys.push(blk));
        return txt === void 0
          ? this
          : $.enabled
          ? run(this.keys, txt + '')
          : txt + ''
      }
      return txt === void 0
        ? chain([open], [blk])
        : $.enabled
        ? run([blk], txt + '')
        : txt + ''
    }
  }

  var format = util.format;
  var EventEmitter = events.EventEmitter;
  var version = '2.2.0';
  var pattern = new RegExp(
    /^at (([^ ]+) )?(\(?([^:]+)*:([0-9]+)*:([0-9]+)*\)?)?$/g
  );
  var slice$1 = Array.prototype.slice;
  var globalEventName = 'message';
  var loglevels = ['log', 'info', 'warn', 'error'];
  var proxies = ['dir', 'time', 'timeEnd', 'trace', 'assert'];
  var times = {};
  var emptyStack = { object: null, path: null, line: null, char: null };
  var prevTime = {};

  /**
   * Default Listener for Konsole
   * @param level String Level used for logging. log|info|warn|error
   * @param args Array Original arguments of the konsole.* call
   */
  function defaultListener(level, args) {
    var trace = this.trace; // trace is a getter, if you do not access the property it will not generate a trace
    this.write(
      ' ' +
        this.label +
        ' ' +
        this.processType +
        ':' +
        this.pid +
        ' ' +
        level.toUpperCase() +
        ' ' +
        '+' +
        this.diff +
        'ms ' +
        (trace.path ? '(' + trace.path : '') +
        (trace.line ? ':' + trace.line + ') ' : '') +
        "\n'" +
        this.format.apply(this, args) +
        "'"
    );
  }

  function parseStackLine(line) {
    var match,
      stack = [];
    while ((match = pattern.exec(line))) {
      stack.push({
        object: match[2] || null,
        path: match[4] || null,
        line: match[5] || null,
        char: match[6] || null,
      });
    }
    return stack[0] || emptyStack
  }

  function getTrace() {
    return parseStackLine(getTraceLine())
  }

  function getTraceLine() {
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack.split('\n'),
      i = 0,
      l = stack.length,
      line;
    for (l; l > i; l--) {
      line = (stack[l] || '').trim();
      if (line.match(/\(\/|\\.+\)/)) return line
    }
  }

  function getDiff(label) {
    var curr = new Date(),
      diff = curr - (prevTime[label] || curr);
    prevTime[label] = curr;
    return diff
  }

  function Konsole(label) {
    EventEmitter.call(this);
    this._label = label || '';
    this._processType = process.env.NODE_WORKER_ID ? 'worker' : 'master';
  }
  util.inherits(Konsole, EventEmitter);

  loglevels.forEach(function (funcName) {
    Konsole.prototype[funcName] = function () {
      var args = slice$1.call(arguments) || [],
        level = funcName;
      this.emit(globalEventName, level, args);
      this.emit(level, args);
    };
  });
  proxies.forEach(function (funcName) {
    Konsole.prototype[funcName] = function () {
      return console[funcName].apply(console, arguments)
    };
  });

  Konsole.prototype.write = function () {
    process.stdout.write(format.apply(this, arguments) + '\n');
  };
  Konsole.prototype.format = function () {
    return format.apply(this, arguments)
  };
  Konsole.prototype.relay = function () {
    var that = this,
      origins = slice$1.call(arguments);
    origins.forEach(function (origin) {
      that.listeners(globalEventName).forEach(function (listener) {
        origin.on(globalEventName, listener);
      });
    });
  };
  Konsole.prototype.version = version;
  Konsole.prototype.addDefaultListener = function () {
    this.on(globalEventName, defaultListener);
  };
  Konsole.prototype.__defineGetter__('trace', function () {
    return getTrace.call(this)
  });
  Konsole.prototype.__defineGetter__('diff', function () {
    return getDiff.apply(this, [this.label])
  });
  Konsole.prototype.__defineGetter__('processType', function () {
    return this._processType
  });
  Konsole.prototype.__defineGetter__('pid', function () {
    return process.pid
  });
  Konsole.prototype.__defineGetter__('label', function () {
    return this._label || ''
  });
  Konsole.prototype.time = function (label) {
    times[label] = Date.now();
  };
  Konsole.prototype.timeEnd = function (label) {
    var duration = Date.now() - times[label];
    this.log('%s: %dms', label, duration);
  };

  let red = $.red;
  let green = $.green;
  let yellow = $.yellow;
  let blue = $.blue;

  const konsole = new Konsole('Frontier');
  konsole.addDefaultListener();

  class Logger {
    log(msg, color) {
      msg = util.inspect(msg, false, null, true /* enable colors */);
      msg = color(msg);
      konsole.log(msg);
      return 0
    }

    info(msg) {
      this.log(msg, blue);
    }
    err(msg) {
      this.log(msg, red);
    }
    good(msg) {
      this.log(msg, green);
    }
    warn(msg) {
      this.log(msg, yellow);
    }
  }

  let minimist = function (args, opts) {
    if (!opts) opts = {};

    var flags = { bools: {}, strings: {}, unknownFn: null };

    if (typeof opts['unknown'] === 'function') {
      flags.unknownFn = opts['unknown'];
    }

    if (typeof opts['boolean'] === 'boolean' && opts['boolean']) {
      flags.allBools = true;
    } else {
  []
        .concat(opts['boolean'])
        .filter(Boolean)
        .forEach(function (key) {
          flags.bools[key] = true;
        });
    }

    var aliases = {};
    Object.keys(opts.alias || {}).forEach(function (key) {
      aliases[key] = [].concat(opts.alias[key]);
      aliases[key].forEach(function (x) {
        aliases[x] = [key].concat(
          aliases[key].filter(function (y) {
            return x !== y
          })
        );
      });
    })
    ;[]
      .concat(opts.string)
      .filter(Boolean)
      .forEach(function (key) {
        flags.strings[key] = true;
        if (aliases[key]) {
          flags.strings[aliases[key]] = true;
        }
      });

    var defaults = opts['default'] || {};

    var argv = { _: [] };
    Object.keys(flags.bools).forEach(function (key) {
      setArg(key, defaults[key] === undefined ? false : defaults[key]);
    });

    var notFlags = [];

    if (args.indexOf('--') !== -1) {
      notFlags = args.slice(args.indexOf('--') + 1);
      args = args.slice(0, args.indexOf('--'));
    }

    function argDefined(key, arg) {
      return (
        (flags.allBools && /^--[^=]+$/.test(arg)) ||
        flags.strings[key] ||
        flags.bools[key] ||
        aliases[key]
      )
    }

    function setArg(key, val, arg) {
      if (arg && flags.unknownFn && !argDefined(key, arg)) {
        if (flags.unknownFn(arg) === false) return
      }

      var value = !flags.strings[key] && isNumber$1(val) ? Number(val) : val;
      setKey(argv, key.split('.'), value)
      ;(aliases[key] || []).forEach(function (x) {
        setKey(argv, x.split('.'), value);
      });
    }

    function setKey(obj, keys, value) {
      var o = obj;
      keys.slice(0, -1).forEach(function (key) {
        if (o[key] === undefined) o[key] = {};
        o = o[key];
      });

      var key = keys[keys.length - 1];
      if (
        o[key] === undefined ||
        flags.bools[key] ||
        typeof o[key] === 'boolean'
      ) {
        o[key] = value;
      } else if (Array.isArray(o[key])) {
        o[key].push(value);
      } else {
        o[key] = [o[key], value];
      }
    }

    function aliasIsBoolean(key) {
      return aliases[key].some(function (x) {
        return flags.bools[x]
      })
    }

    for (var i = 0; i < args.length; i++) {
      var arg = args[i];

      if (/^--.+=/.test(arg)) {
        // Using [\s\S] instead of . because js doesn't support the
        // 'dotall' regex modifier. See:
        // http://stackoverflow.com/a/1068308/13216
        var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
        var key = m[1];
        var value = m[2];
        if (flags.bools[key]) {
          value = value !== 'false';
        }
        setArg(key, value, arg);
      } else if (/^--no-.+/.test(arg)) {
        var key = arg.match(/^--no-(.+)/)[1];
        setArg(key, false, arg);
      } else if (/^--.+/.test(arg)) {
        var key = arg.match(/^--(.+)/)[1];
        var next = args[i + 1];
        if (
          next !== undefined &&
          !/^-/.test(next) &&
          !flags.bools[key] &&
          !flags.allBools &&
          (aliases[key] ? !aliasIsBoolean(key) : true)
        ) {
          setArg(key, next, arg);
          i++;
        } else if (/^(true|false)$/.test(next)) {
          setArg(key, next === 'true', arg);
          i++;
        } else {
          setArg(key, flags.strings[key] ? '' : true, arg);
        }
      } else if (/^-[^-]+/.test(arg)) {
        var letters = arg.slice(1, -1).split('');

        var broken = false;
        for (var j = 0; j < letters.length; j++) {
          var next = arg.slice(j + 2);

          if (next === '-') {
            setArg(letters[j], next, arg);
            continue
          }

          if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
            setArg(letters[j], next.split('=')[1], arg);
            broken = true;
            break
          }

          if (
            /[A-Za-z]/.test(letters[j]) &&
            /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)
          ) {
            setArg(letters[j], next, arg);
            broken = true;
            break
          }

          if (letters[j + 1] && letters[j + 1].match(/\W/)) {
            setArg(letters[j], arg.slice(j + 2), arg);
            broken = true;
            break
          } else {
            setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
          }
        }

        var key = arg.slice(-1)[0];
        if (!broken && key !== '-') {
          if (
            args[i + 1] &&
            !/^(-|--)[^-]/.test(args[i + 1]) &&
            !flags.bools[key] &&
            (aliases[key] ? !aliasIsBoolean(key) : true)
          ) {
            setArg(key, args[i + 1], arg);
            i++;
          } else if (args[i + 1] && /true|false/.test(args[i + 1])) {
            setArg(key, args[i + 1] === 'true', arg);
            i++;
          } else {
            setArg(key, flags.strings[key] ? '' : true, arg);
          }
        }
      } else {
        if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
          argv._.push(flags.strings['_'] || !isNumber$1(arg) ? arg : Number(arg));
        }
        if (opts.stopEarly) {
          argv._.push.apply(argv._, args.slice(i + 1));
          break
        }
      }
    }

    Object.keys(defaults).forEach(function (key) {
      if (!hasKey$1(argv, key.split('.'))) {
        setKey(argv, key.split('.'), defaults[key])
        ;(aliases[key] || []).forEach(function (x) {
          setKey(argv, x.split('.'), defaults[key]);
        });
      }
    });

    if (opts['--']) {
      argv['--'] = new Array();
      notFlags.forEach(function (key) {
        argv['--'].push(key);
      });
    } else {
      notFlags.forEach(function (key) {
        argv._.push(key);
      });
    }

    return argv
  };

  function hasKey$1(obj, keys) {
    var o = obj;
    keys.slice(0, -1).forEach(function (key) {
      o = o[key] || {};
    });

    var key = keys[keys.length - 1];
    return key in o
  }

  function isNumber$1(x) {
    if (typeof x === 'number') return true
    if (/^0x[0-9a-f]+$/i.test(x)) return true
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x)
  }

  // module.exports = front = (file) => require(__dirname + '/' + file)
  let front = (file) => require(__dirname + '/' + file);

  let til = function (promise) {
    return promise.then((data) => [null, data]).catch((err) => [err])
  };

  const cwd = process.cwd() + '/';
  const __dirname$2 = path.resolve();
  const cpath$1 = __dirname$2 + '/../../';

  // Local ENV and if not check for api one level down or parallel
  let envSource = {
    sources: [
      { source: 'api', file: '.env' },
      { source: 'app', file: '../api/.env' },
      { source: 'frontier', file: 'api/.env' },
    ],
    load: function () {
      this.sources.forEach(({ source, file }) => {
        if (fs.existsSync(cwd + file)) {
          console.log('Loading from ... ' + source + ' and file ' + file);
          config({ path: cwd + file });
          return
        }
      });
    },
  };

  envSource.load();

  // Frontier ENV
  config({ path: cpath$1 + 'front.env' });
  let Toolbelt = {
    env,
    dotenv: config,
    args,
    arsenal,
    errorHandling,
    github,
    jsonFiles,
    kleur: $,
    logger: Logger,
    minimist,
    outfitter: front,
    til,
  };

  return Toolbelt;

})));
//# sourceMappingURL=build.js.map
