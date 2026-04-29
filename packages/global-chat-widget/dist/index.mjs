'use client';
import { forwardRef, createElement, useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// src/GlobalChatWidget.tsx

// ../../node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.js
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

// ../../node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.js
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// ../../node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.js
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match3, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);

// ../../node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.js
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

// ../../node_modules/lucide-react/dist/esm/defaultAttributes.js
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// ../../node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.js
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};

// ../../node_modules/lucide-react/dist/esm/Icon.js
var Icon = forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);

// ../../node_modules/lucide-react/dist/esm/createLucideIcon.js
var createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef(
    ({ className, ...props }, ref) => createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

// ../../node_modules/lucide-react/dist/esm/icons/arrow-left.js
var __iconNode = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
var ArrowLeft = createLucideIcon("arrow-left", __iconNode);

// ../../node_modules/lucide-react/dist/esm/icons/file-text.js
var __iconNode2 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
var FileText = createLucideIcon("file-text", __iconNode2);

// ../../node_modules/lucide-react/dist/esm/icons/message-circle.js
var __iconNode3 = [
  [
    "path",
    {
      d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
      key: "1sd12s"
    }
  ]
];
var MessageCircle = createLucideIcon("message-circle", __iconNode3);

// ../../node_modules/lucide-react/dist/esm/icons/paperclip.js
var __iconNode4 = [
  [
    "path",
    {
      d: "m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551",
      key: "1miecu"
    }
  ]
];
var Paperclip = createLucideIcon("paperclip", __iconNode4);

// ../../node_modules/lucide-react/dist/esm/icons/reply.js
var __iconNode5 = [
  ["path", { d: "M20 18v-2a4 4 0 0 0-4-4H4", key: "5vmcpk" }],
  ["path", { d: "m9 17-5-5 5-5", key: "nvlc11" }]
];
var Reply = createLucideIcon("reply", __iconNode5);

// ../../node_modules/lucide-react/dist/esm/icons/send.js
var __iconNode6 = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
];
var Send = createLucideIcon("send", __iconNode6);

// ../../node_modules/lucide-react/dist/esm/icons/smile.js
var __iconNode7 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M8 14s1.5 2 4 2 4-2 4-2", key: "1y1vjs" }],
  ["line", { x1: "9", x2: "9.01", y1: "9", y2: "9", key: "yxxnd0" }],
  ["line", { x1: "15", x2: "15.01", y1: "9", y2: "9", key: "1p4y9e" }]
];
var Smile = createLucideIcon("smile", __iconNode7);

// ../../node_modules/lucide-react/dist/esm/icons/x.js
var __iconNode8 = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
var X = createLucideIcon("x", __iconNode8);

// ../../node_modules/date-fns/toDate.mjs
function toDate(argument) {
  const argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") {
    return new argument.constructor(+argument);
  } else if (typeof argument === "number" || argStr === "[object Number]" || typeof argument === "string" || argStr === "[object String]") {
    return new Date(argument);
  } else {
    return /* @__PURE__ */ new Date(NaN);
  }
}

// ../../node_modules/date-fns/constructFrom.mjs
function constructFrom(date, value) {
  if (date instanceof Date) {
    return new date.constructor(value);
  } else {
    return new Date(value);
  }
}
var minutesInMonth = 43200;
var minutesInDay = 1440;

// ../../node_modules/date-fns/_lib/defaultOptions.mjs
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// ../../node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.mjs
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}

// ../../node_modules/date-fns/compareAsc.mjs
function compareAsc(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const diff = _dateLeft.getTime() - _dateRight.getTime();
  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
  } else {
    return diff;
  }
}

// ../../node_modules/date-fns/constructNow.mjs
function constructNow(date) {
  return constructFrom(date, Date.now());
}

// ../../node_modules/date-fns/differenceInCalendarMonths.mjs
function differenceInCalendarMonths(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const yearDiff = _dateLeft.getFullYear() - _dateRight.getFullYear();
  const monthDiff = _dateLeft.getMonth() - _dateRight.getMonth();
  return yearDiff * 12 + monthDiff;
}

// ../../node_modules/date-fns/_lib/getRoundingMethod.mjs
function getRoundingMethod(method) {
  return (number) => {
    const round = Math.trunc;
    const result = round(number);
    return result === 0 ? 0 : result;
  };
}

// ../../node_modules/date-fns/differenceInMilliseconds.mjs
function differenceInMilliseconds(dateLeft, dateRight) {
  return +toDate(dateLeft) - +toDate(dateRight);
}

// ../../node_modules/date-fns/endOfDay.mjs
function endOfDay(date) {
  const _date = toDate(date);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

// ../../node_modules/date-fns/endOfMonth.mjs
function endOfMonth(date) {
  const _date = toDate(date);
  const month = _date.getMonth();
  _date.setFullYear(_date.getFullYear(), month + 1, 0);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

// ../../node_modules/date-fns/isLastDayOfMonth.mjs
function isLastDayOfMonth(date) {
  const _date = toDate(date);
  return +endOfDay(_date) === +endOfMonth(_date);
}

// ../../node_modules/date-fns/differenceInMonths.mjs
function differenceInMonths(dateLeft, dateRight) {
  const _dateLeft = toDate(dateLeft);
  const _dateRight = toDate(dateRight);
  const sign = compareAsc(_dateLeft, _dateRight);
  const difference = Math.abs(
    differenceInCalendarMonths(_dateLeft, _dateRight)
  );
  let result;
  if (difference < 1) {
    result = 0;
  } else {
    if (_dateLeft.getMonth() === 1 && _dateLeft.getDate() > 27) {
      _dateLeft.setDate(30);
    }
    _dateLeft.setMonth(_dateLeft.getMonth() - sign * difference);
    let isLastMonthNotFull = compareAsc(_dateLeft, _dateRight) === -sign;
    if (isLastDayOfMonth(toDate(dateLeft)) && difference === 1 && compareAsc(dateLeft, _dateRight) === 1) {
      isLastMonthNotFull = false;
    }
    result = sign * (difference - Number(isLastMonthNotFull));
  }
  return result === 0 ? 0 : result;
}

// ../../node_modules/date-fns/differenceInSeconds.mjs
function differenceInSeconds(dateLeft, dateRight, options) {
  const diff = differenceInMilliseconds(dateLeft, dateRight) / 1e3;
  return getRoundingMethod()(diff);
}

// ../../node_modules/date-fns/locale/en-US/_lib/formatDistance.mjs
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
};
var formatDistance = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", count.toString());
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return "in " + result;
    } else {
      return result + " ago";
    }
  }
  return result;
};

// ../../node_modules/date-fns/locale/_lib/buildFormatLongFn.mjs
function buildFormatLongFn(args) {
  return (options = {}) => {
    const width = options.width ? String(options.width) : args.defaultWidth;
    const format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}

// ../../node_modules/date-fns/locale/en-US/_lib/formatLong.mjs
var dateFormats = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
};
var timeFormats = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
};
var dateTimeFormats = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};

// ../../node_modules/date-fns/locale/en-US/_lib/formatRelative.mjs
var formatRelativeLocale = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
};
var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

// ../../node_modules/date-fns/locale/_lib/buildLocalizeFn.mjs
function buildLocalizeFn(args) {
  return (value, options) => {
    const context = options?.context ? String(options.context) : "standalone";
    let valuesArray;
    if (context === "formatting" && args.formattingValues) {
      const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      const width = options?.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      const defaultWidth = args.defaultWidth;
      const width = options?.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[width] || args.values[defaultWidth];
    }
    const index = args.argumentCallback ? args.argumentCallback(value) : value;
    return valuesArray[index];
  };
}

// ../../node_modules/date-fns/locale/en-US/_lib/localize.mjs
var eraValues = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
};
var monthValues = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};
var dayValues = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
};
var dayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
};
var ordinalNumber = (dirtyNumber, _options) => {
  const number = Number(dirtyNumber);
  const rem100 = number % 100;
  if (rem100 > 20 || rem100 < 10) {
    switch (rem100 % 10) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
    }
  }
  return number + "th";
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};

// ../../node_modules/date-fns/locale/_lib/buildMatchFn.mjs
function buildMatchFn(args) {
  return (string, options = {}) => {
    const width = options.width;
    const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    const matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    const matchedString = matchResult[0];
    const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      findKey(parsePatterns, (pattern) => pattern.test(matchedString))
    );
    let value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I challange you to fix the type
      options.valueCallback(value)
    ) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}
function findKey(object, predicate) {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (let key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}

// ../../node_modules/date-fns/locale/_lib/buildMatchPatternFn.mjs
function buildMatchPatternFn(args) {
  return (string, options = {}) => {
    const matchResult = string.match(args.matchPattern);
    if (!matchResult) return null;
    const matchedString = matchResult[0];
    const parseResult = string.match(args.parsePattern);
    if (!parseResult) return null;
    let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    const rest = string.slice(matchedString.length);
    return { value, rest };
  };
}

// ../../node_modules/date-fns/locale/en-US/_lib/match.mjs
var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
};
var parseEraPatterns = {
  any: [/^b/i, /^(a|c)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
};
var parseQuarterPatterns = {
  any: [/1/i, /2/i, /3/i, /4/i]
};
var matchMonthPatterns = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
};
var parseMonthPatterns = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
};
var matchDayPatterns = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
};
var parseDayPatterns = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
};
var matchDayPeriodPatterns = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};

// ../../node_modules/date-fns/locale/en-US.mjs
var enUS = {
  code: "en-US",
  formatDistance,
  formatLong,
  formatRelative,
  localize,
  match,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

// ../../node_modules/date-fns/formatDistance.mjs
function formatDistance2(date, baseDate, options) {
  const defaultOptions2 = getDefaultOptions();
  const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
  const minutesInAlmostTwoDays = 2520;
  const comparison = compareAsc(date, baseDate);
  if (isNaN(comparison)) {
    throw new RangeError("Invalid time value");
  }
  const localizeOptions = Object.assign({}, options, {
    addSuffix: options?.addSuffix,
    comparison
  });
  let dateLeft;
  let dateRight;
  if (comparison > 0) {
    dateLeft = toDate(baseDate);
    dateRight = toDate(date);
  } else {
    dateLeft = toDate(date);
    dateRight = toDate(baseDate);
  }
  const seconds = differenceInSeconds(dateRight, dateLeft);
  const offsetInSeconds = (getTimezoneOffsetInMilliseconds(dateRight) - getTimezoneOffsetInMilliseconds(dateLeft)) / 1e3;
  const minutes = Math.round((seconds - offsetInSeconds) / 60);
  let months;
  if (minutes < 2) {
    if (options?.includeSeconds) {
      if (seconds < 5) {
        return locale.formatDistance("lessThanXSeconds", 5, localizeOptions);
      } else if (seconds < 10) {
        return locale.formatDistance("lessThanXSeconds", 10, localizeOptions);
      } else if (seconds < 20) {
        return locale.formatDistance("lessThanXSeconds", 20, localizeOptions);
      } else if (seconds < 40) {
        return locale.formatDistance("halfAMinute", 0, localizeOptions);
      } else if (seconds < 60) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", 1, localizeOptions);
      }
    } else {
      if (minutes === 0) {
        return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
      } else {
        return locale.formatDistance("xMinutes", minutes, localizeOptions);
      }
    }
  } else if (minutes < 45) {
    return locale.formatDistance("xMinutes", minutes, localizeOptions);
  } else if (minutes < 90) {
    return locale.formatDistance("aboutXHours", 1, localizeOptions);
  } else if (minutes < minutesInDay) {
    const hours = Math.round(minutes / 60);
    return locale.formatDistance("aboutXHours", hours, localizeOptions);
  } else if (minutes < minutesInAlmostTwoDays) {
    return locale.formatDistance("xDays", 1, localizeOptions);
  } else if (minutes < minutesInMonth) {
    const days = Math.round(minutes / minutesInDay);
    return locale.formatDistance("xDays", days, localizeOptions);
  } else if (minutes < minutesInMonth * 2) {
    months = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("aboutXMonths", months, localizeOptions);
  }
  months = differenceInMonths(dateRight, dateLeft);
  if (months < 12) {
    const nearestMonth = Math.round(minutes / minutesInMonth);
    return locale.formatDistance("xMonths", nearestMonth, localizeOptions);
  } else {
    const monthsSinceStartOfYear = months % 12;
    const years = Math.trunc(months / 12);
    if (monthsSinceStartOfYear < 3) {
      return locale.formatDistance("aboutXYears", years, localizeOptions);
    } else if (monthsSinceStartOfYear < 9) {
      return locale.formatDistance("overXYears", years, localizeOptions);
    } else {
      return locale.formatDistance("almostXYears", years + 1, localizeOptions);
    }
  }
}

// ../../node_modules/date-fns/formatDistanceToNow.mjs
function formatDistanceToNow(date, options) {
  return formatDistance2(date, constructNow(date), options);
}

// ../../node_modules/date-fns/locale/zh-TW/_lib/formatDistance.mjs
var formatDistanceLocale2 = {
  lessThanXSeconds: {
    one: "\u5C11\u65BC 1 \u79D2",
    other: "\u5C11\u65BC {{count}} \u79D2"
  },
  xSeconds: {
    one: "1 \u79D2",
    other: "{{count}} \u79D2"
  },
  halfAMinute: "\u534A\u5206\u9418",
  lessThanXMinutes: {
    one: "\u5C11\u65BC 1 \u5206\u9418",
    other: "\u5C11\u65BC {{count}} \u5206\u9418"
  },
  xMinutes: {
    one: "1 \u5206\u9418",
    other: "{{count}} \u5206\u9418"
  },
  xHours: {
    one: "1 \u5C0F\u6642",
    other: "{{count}} \u5C0F\u6642"
  },
  aboutXHours: {
    one: "\u5927\u7D04 1 \u5C0F\u6642",
    other: "\u5927\u7D04 {{count}} \u5C0F\u6642"
  },
  xDays: {
    one: "1 \u5929",
    other: "{{count}} \u5929"
  },
  aboutXWeeks: {
    one: "\u5927\u7D04 1 \u500B\u661F\u671F",
    other: "\u5927\u7D04 {{count}} \u500B\u661F\u671F"
  },
  xWeeks: {
    one: "1 \u500B\u661F\u671F",
    other: "{{count}} \u500B\u661F\u671F"
  },
  aboutXMonths: {
    one: "\u5927\u7D04 1 \u500B\u6708",
    other: "\u5927\u7D04 {{count}} \u500B\u6708"
  },
  xMonths: {
    one: "1 \u500B\u6708",
    other: "{{count}} \u500B\u6708"
  },
  aboutXYears: {
    one: "\u5927\u7D04 1 \u5E74",
    other: "\u5927\u7D04 {{count}} \u5E74"
  },
  xYears: {
    one: "1 \u5E74",
    other: "{{count}} \u5E74"
  },
  overXYears: {
    one: "\u8D85\u904E 1 \u5E74",
    other: "\u8D85\u904E {{count}} \u5E74"
  },
  almostXYears: {
    one: "\u5C07\u8FD1 1 \u5E74",
    other: "\u5C07\u8FD1 {{count}} \u5E74"
  }
};
var formatDistance3 = (token, count, options) => {
  let result;
  const tokenValue = formatDistanceLocale2[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", String(count));
  }
  if (options?.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return result + "\u5167";
    } else {
      return result + "\u524D";
    }
  }
  return result;
};

// ../../node_modules/date-fns/locale/zh-TW/_lib/formatLong.mjs
var dateFormats2 = {
  full: "y'\u5E74'M'\u6708'd'\u65E5' EEEE",
  long: "y'\u5E74'M'\u6708'd'\u65E5'",
  medium: "yyyy-MM-dd",
  short: "yy-MM-dd"
};
var timeFormats2 = {
  full: "zzzz a h:mm:ss",
  long: "z a h:mm:ss",
  medium: "a h:mm:ss",
  short: "a h:mm"
};
var dateTimeFormats2 = {
  full: "{{date}} {{time}}",
  long: "{{date}} {{time}}",
  medium: "{{date}} {{time}}",
  short: "{{date}} {{time}}"
};
var formatLong2 = {
  date: buildFormatLongFn({
    formats: dateFormats2,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats2,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats2,
    defaultWidth: "full"
  })
};

// ../../node_modules/date-fns/locale/zh-TW/_lib/formatRelative.mjs
var formatRelativeLocale2 = {
  lastWeek: "'\u4E0A\u500B'eeee p",
  yesterday: "'\u6628\u5929' p",
  today: "'\u4ECA\u5929' p",
  tomorrow: "'\u660E\u5929' p",
  nextWeek: "'\u4E0B\u500B'eeee p",
  other: "P"
};
var formatRelative2 = (token, _date, _baseDate, _options) => formatRelativeLocale2[token];

// ../../node_modules/date-fns/locale/zh-TW/_lib/localize.mjs
var eraValues2 = {
  narrow: ["\u524D", "\u516C\u5143"],
  abbreviated: ["\u524D", "\u516C\u5143"],
  wide: ["\u516C\u5143\u524D", "\u516C\u5143"]
};
var quarterValues2 = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["\u7B2C\u4E00\u523B", "\u7B2C\u4E8C\u523B", "\u7B2C\u4E09\u523B", "\u7B2C\u56DB\u523B"],
  wide: ["\u7B2C\u4E00\u523B\u9418", "\u7B2C\u4E8C\u523B\u9418", "\u7B2C\u4E09\u523B\u9418", "\u7B2C\u56DB\u523B\u9418"]
};
var monthValues2 = {
  narrow: [
    "\u4E00",
    "\u4E8C",
    "\u4E09",
    "\u56DB",
    "\u4E94",
    "\u516D",
    "\u4E03",
    "\u516B",
    "\u4E5D",
    "\u5341",
    "\u5341\u4E00",
    "\u5341\u4E8C"
  ],
  abbreviated: [
    "1\u6708",
    "2\u6708",
    "3\u6708",
    "4\u6708",
    "5\u6708",
    "6\u6708",
    "7\u6708",
    "8\u6708",
    "9\u6708",
    "10\u6708",
    "11\u6708",
    "12\u6708"
  ],
  wide: [
    "\u4E00\u6708",
    "\u4E8C\u6708",
    "\u4E09\u6708",
    "\u56DB\u6708",
    "\u4E94\u6708",
    "\u516D\u6708",
    "\u4E03\u6708",
    "\u516B\u6708",
    "\u4E5D\u6708",
    "\u5341\u6708",
    "\u5341\u4E00\u6708",
    "\u5341\u4E8C\u6708"
  ]
};
var dayValues2 = {
  narrow: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
  short: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
  abbreviated: ["\u9031\u65E5", "\u9031\u4E00", "\u9031\u4E8C", "\u9031\u4E09", "\u9031\u56DB", "\u9031\u4E94", "\u9031\u516D"],
  wide: ["\u661F\u671F\u65E5", "\u661F\u671F\u4E00", "\u661F\u671F\u4E8C", "\u661F\u671F\u4E09", "\u661F\u671F\u56DB", "\u661F\u671F\u4E94", "\u661F\u671F\u516D"]
};
var dayPeriodValues2 = {
  narrow: {
    am: "\u4E0A",
    pm: "\u4E0B",
    midnight: "\u51CC\u6668",
    noon: "\u5348",
    morning: "\u65E9",
    afternoon: "\u4E0B\u5348",
    evening: "\u665A",
    night: "\u591C"
  },
  abbreviated: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u9593"
  },
  wide: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u9593"
  }
};
var formattingDayPeriodValues2 = {
  narrow: {
    am: "\u4E0A",
    pm: "\u4E0B",
    midnight: "\u51CC\u6668",
    noon: "\u5348",
    morning: "\u65E9",
    afternoon: "\u4E0B\u5348",
    evening: "\u665A",
    night: "\u591C"
  },
  abbreviated: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u9593"
  },
  wide: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u9593"
  }
};
var ordinalNumber2 = (dirtyNumber, options) => {
  const number = Number(dirtyNumber);
  switch (options?.unit) {
    case "date":
      return number + "\u65E5";
    case "hour":
      return number + "\u6642";
    case "minute":
      return number + "\u5206";
    case "second":
      return number + "\u79D2";
    default:
      return "\u7B2C " + number;
  }
};
var localize2 = {
  ordinalNumber: ordinalNumber2,
  era: buildLocalizeFn({
    values: eraValues2,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues2,
    defaultWidth: "wide",
    argumentCallback: (quarter) => quarter - 1
  }),
  month: buildLocalizeFn({
    values: monthValues2,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues2,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues2,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues2,
    defaultFormattingWidth: "wide"
  })
};

// ../../node_modules/date-fns/locale/zh-TW/_lib/match.mjs
var matchOrdinalNumberPattern2 = /^(第\s*)?\d+(日|時|分|秒)?/i;
var parseOrdinalNumberPattern2 = /\d+/i;
var matchEraPatterns2 = {
  narrow: /^(前)/i,
  abbreviated: /^(前)/i,
  wide: /^(公元前|公元)/i
};
var parseEraPatterns2 = {
  any: [/^(前)/i, /^(公元)/i]
};
var matchQuarterPatterns2 = {
  narrow: /^[1234]/i,
  abbreviated: /^第[一二三四]刻/i,
  wide: /^第[一二三四]刻鐘/i
};
var parseQuarterPatterns2 = {
  any: [/(1|一)/i, /(2|二)/i, /(3|三)/i, /(4|四)/i]
};
var matchMonthPatterns2 = {
  narrow: /^(一|二|三|四|五|六|七|八|九|十[二一])/i,
  abbreviated: /^(一|二|三|四|五|六|七|八|九|十[二一]|\d|1[12])月/i,
  wide: /^(一|二|三|四|五|六|七|八|九|十[二一])月/i
};
var parseMonthPatterns2 = {
  narrow: [
    /^一/i,
    /^二/i,
    /^三/i,
    /^四/i,
    /^五/i,
    /^六/i,
    /^七/i,
    /^八/i,
    /^九/i,
    /^十(?!(一|二))/i,
    /^十一/i,
    /^十二/i
  ],
  any: [
    /^一|1/i,
    /^二|2/i,
    /^三|3/i,
    /^四|4/i,
    /^五|5/i,
    /^六|6/i,
    /^七|7/i,
    /^八|8/i,
    /^九|9/i,
    /^十(?!(一|二))|10/i,
    /^十一|11/i,
    /^十二|12/i
  ]
};
var matchDayPatterns2 = {
  narrow: /^[一二三四五六日]/i,
  short: /^[一二三四五六日]/i,
  abbreviated: /^週[一二三四五六日]/i,
  wide: /^星期[一二三四五六日]/i
};
var parseDayPatterns2 = {
  any: [/日/i, /一/i, /二/i, /三/i, /四/i, /五/i, /六/i]
};
var matchDayPeriodPatterns2 = {
  any: /^(上午?|下午?|午夜|[中正]午|早上?|下午|晚上?|凌晨)/i
};
var parseDayPeriodPatterns2 = {
  any: {
    am: /^上午?/i,
    pm: /^下午?/i,
    midnight: /^午夜/i,
    noon: /^[中正]午/i,
    morning: /^早上/i,
    afternoon: /^下午/i,
    evening: /^晚上?/i,
    night: /^凌晨/i
  }
};
var match2 = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern2,
    parsePattern: parseOrdinalNumberPattern2,
    valueCallback: (value) => parseInt(value, 10)
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns2,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns2,
    defaultParseWidth: "any",
    valueCallback: (index) => index + 1
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns2,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns2,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns2,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns2,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns2,
    defaultParseWidth: "any"
  })
};

// ../../node_modules/date-fns/locale/zh-TW.mjs
var zhTW = {
  code: "zh-TW",
  formatDistance: formatDistance3,
  formatLong: formatLong2,
  formatRelative: formatRelative2,
  localize: localize2,
  match: match2,
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 4
  }
};

// src/internal/stickers.ts
var STICKER_CDN = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg";
var STICKERS = [
  { emoji: "\u{1F60A}", id: "1f60a" },
  { emoji: "\u{1F602}", id: "1f602" },
  { emoji: "\u{1F970}", id: "1f970" },
  { emoji: "\u{1F60E}", id: "1f60e" },
  { emoji: "\u{1F605}", id: "1f605" },
  { emoji: "\u{1F62D}", id: "1f62d" },
  { emoji: "\u{1F624}", id: "1f624" },
  { emoji: "\u{1F914}", id: "1f914" },
  { emoji: "\u{1F634}", id: "1f634" },
  { emoji: "\u{1F917}", id: "1f917" },
  { emoji: "\u{1F618}", id: "1f618" },
  { emoji: "\u{1F643}", id: "1f643" },
  { emoji: "\u{1F607}", id: "1f607" },
  { emoji: "\u{1F929}", id: "1f929" },
  { emoji: "\u{1F60B}", id: "1f60b" },
  { emoji: "\u{1F923}", id: "1f923" },
  { emoji: "\u{1F44D}", id: "1f44d" },
  { emoji: "\u{1F44E}", id: "1f44e" },
  { emoji: "\u{1F44F}", id: "1f44f" },
  { emoji: "\u{1F64F}", id: "1f64f" },
  { emoji: "\u{1F91D}", id: "1f91d" },
  { emoji: "\u{1F4AA}", id: "1f4aa" },
  { emoji: "\u{1F44B}", id: "1f44b" },
  { emoji: "\u{1F91E}", id: "1f91e" },
  { emoji: "\u{1F389}", id: "1f389" },
  { emoji: "\u{1F525}", id: "1f525" },
  { emoji: "\u{1F495}", id: "1f495" },
  { emoji: "\u{1F4AF}", id: "1f4af" },
  { emoji: "\u2B50", id: "2b50" },
  { emoji: "\u{1F3AF}", id: "1f3af" },
  { emoji: "\u{1F3C6}", id: "1f3c6" },
  { emoji: "\u{1F680}", id: "1f680" }
];
function stickerUrl(id) {
  return `${STICKER_CDN}/${id}.svg`;
}
function getStickerMatch(text) {
  return STICKERS.find((s) => s.emoji === text.trim()) ?? null;
}

// src/internal/messageClient.ts
var MessageHubError = class extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "MessageHubError";
  }
  status;
  code;
};
function defaultUuid() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
var MessageClient = class {
  apiBaseUrl;
  getAccessToken;
  sourceApp;
  fetchImpl;
  uuidImpl;
  constructor(config) {
    this.apiBaseUrl = config.apiBaseUrl.replace(/\/+$/, "");
    this.getAccessToken = config.getAccessToken;
    this.sourceApp = config.sourceApp;
    this.fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.uuidImpl = config.uuidImpl ?? defaultUuid;
  }
  // ── Internal helper ────────────────────────────────────────────────
  async authHeaders() {
    const token = await this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  /**
   * Standard JSON envelope handler。處理 hub 標準 `{success, data, error, code}` 格式。
   * Throws MessageHubError on failure；回 data on success。
   */
  async requestJson(path, init = {}, envelopeKey = "data") {
    const url = `${this.apiBaseUrl}${path}`;
    const auth = await this.authHeaders();
    const res = await this.fetchImpl(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...auth,
        ...init.headers ?? {}
      }
    });
    let body = {};
    try {
      body = await res.json();
    } catch {
      throw new MessageHubError(
        `Hub \u56DE\u61C9\u975E JSON\uFF08status=${res.status}\uFF09`,
        res.status
      );
    }
    if (!res.ok || body.success === false) {
      throw new MessageHubError(
        body.error ?? `Hub \u8ACB\u6C42\u5931\u6557\uFF08status=${res.status}\uFF09`,
        res.status,
        body.code
      );
    }
    if (envelopeKey === "count") {
      return body.count;
    }
    return body.data;
  }
  // ── 1. listConversations ──────────────────────────────────────────
  /** GET /api/hub/messages — 列出對話清單 + 最新訊息 + 未讀數 */
  async listConversations() {
    return this.requestJson("/api/hub/messages");
  }
  // ── 2. createOrGetConversation ────────────────────────────────────
  /**
   * POST /api/hub/messages — 建立或取得既有對話。
   * 雙向找，restore my soft-delete view if previously deleted。
   */
  async createOrGetConversation(targetUserId) {
    return this.requestJson("/api/hub/messages", {
      method: "POST",
      body: JSON.stringify({ targetUserId })
    });
  }
  // ── 3. getConversation ────────────────────────────────────────────
  /**
   * GET /api/hub/messages/[id]?since=N — 列訊息。
   * `since` 為訊息 id cursor，poll 時帶上一次最大 id。
   */
  async getConversation(conversationId, opts = {}) {
    const qs = opts.since != null ? `?since=${opts.since}` : "";
    return this.requestJson(`/api/hub/messages/${conversationId}${qs}`);
  }
  // ── 4. sendMessage ────────────────────────────────────────────────
  /**
   * POST /api/hub/messages/[id] — 送訊息。
   *
   * 自動產 clientMessageId UUID（除非 caller 自帶；測試會用）。
   * 自動帶 sourceApp（從 client config 帶）。
   *
   * Idempotency 由 hub 端保證：同一 sender 的同 UUID 回現有 row 而非重複 insert。
   */
  async sendMessage(conversationId, input) {
    const clientMessageId = input.clientMessageId ?? this.uuidImpl();
    const sourceApp = input.sourceApp ?? this.sourceApp;
    return this.requestJson(`/api/hub/messages/${conversationId}`, {
      method: "POST",
      body: JSON.stringify({
        content: input.content ?? "",
        attachmentUrl: input.attachmentUrl ?? null,
        attachmentName: input.attachmentName ?? null,
        attachmentType: input.attachmentType ?? null,
        replyToId: input.replyToId ?? null,
        replyToContent: input.replyToContent ?? null,
        replyToSenderName: input.replyToSenderName ?? null,
        clientMessageId,
        sourceApp: sourceApp ?? null
      })
    });
  }
  // ── 5. deleteConversation ─────────────────────────────────────────
  /**
   * DELETE /api/hub/messages/[id] — 軟刪除對話（雙方都刪才硬刪）。
   *
   * F4 補實作（F3 為 stub）。對等於 rotarycredit `DELETE /api/messages/[id]`：
   *   - 設 conversations.deletedByParticipantNAt + pNVisibleFrom = now
   *   - 雙方都刪 → hard delete row
   *   - 對方既已刪除狀態下我方再 delete 也照流程走（對方收到新訊息會 restore，與此無關）
   */
  async deleteConversation(conversationId) {
    await this.requestJson(`/api/hub/messages/${conversationId}`, {
      method: "DELETE"
    });
  }
  // ── 6. markRead ───────────────────────────────────────────────────
  /**
   * PATCH /api/hub/messages/[id]/read — 標記對方來訊為已讀。
   *
   * Verb 是 PATCH 不是 POST（R2 對等性，rotarycredit 用 PATCH）。
   */
  async markRead(conversationId) {
    await this.requestJson(`/api/hub/messages/${conversationId}/read`, {
      method: "PATCH"
    });
  }
  // ── 7. getUnreadCount ─────────────────────────────────────────────
  /**
   * GET /api/hub/messages/unread — 全域未讀數。
   *
   * Quirk：response shape 是 `{ success, count }`，不是 `{ success, data }`。
   */
  async getUnreadCount() {
    return this.requestJson("/api/hub/messages/unread", {}, "count");
  }
  // ── 8. getAttachmentUrl ───────────────────────────────────────────
  /**
   * 組附件下載 URL — 不執行 fetch（widget <img src=...> 由瀏覽器發 request）。
   *
   * ⚠ 瀏覽器 <img> 不會自帶 Authorization header。Hub auth 走 cookie 不接受，所以
   * 附件 URL 必須由 widget 在 fetch + objectURL 模式下取得 BLOB（或由 host app
   * proxy）。但既有 rotarycredit widget 目前直接用 <img src={attachmentUrl}>，那是
   * 因為 attachmentUrl 是 vercel-blob URL（外部 CDN），不是這個 endpoint。
   *
   * 本 method 留給 widget 內 fetch BLOB 模式（`fetchAttachment` below），實際 widget
   * UI 仍可繼續用 attachmentUrl 直接顯示外部 CDN 連結。
   */
  getAttachmentUrl(attachmentId) {
    return `${this.apiBaseUrl}/api/hub/messages/attachment/${attachmentId}`;
  }
  /**
   * 真正下載附件 BLOB（含 Authorization header）。
   * Caller 自行 createObjectURL / revokeObjectURL。
   */
  async fetchAttachment(attachmentId) {
    const url = this.getAttachmentUrl(attachmentId);
    const auth = await this.authHeaders();
    const res = await this.fetchImpl(url, { headers: auth });
    if (!res.ok) {
      throw new MessageHubError(
        `\u4E0B\u8F09\u9644\u4EF6\u5931\u6557\uFF08status=${res.status}\uFF09`,
        res.status
      );
    }
    return res.blob();
  }
  // ── 9. blockUser / unblockUser ────────────────────────────────────
  /** POST /api/hub/blocks — 加封鎖；冪等（重複封同人回現有 row） */
  async blockUser(targetUserId) {
    return this.requestJson("/api/hub/blocks", {
      method: "POST",
      body: JSON.stringify({ targetUserId })
    });
  }
  /** DELETE /api/hub/blocks/[blocked_id] — 解封；冪等（不存在也回 success） */
  async unblockUser(blockedUserId) {
    await this.requestJson(`/api/hub/blocks/${blockedUserId}`, {
      method: "DELETE"
    });
  }
};

// src/GlobalChatWidget.tsx
var ONLINE_MS = 45 * 1e3;
function isOnline(lastSeenAt) {
  if (!lastSeenAt) return false;
  return Date.now() - (/* @__PURE__ */ new Date(lastSeenAt.replace(" ", "T") + "Z")).getTime() < ONLINE_MS;
}
function GlobalChatWidget({
  apiBaseUrl,
  getAccessToken,
  sourceApp,
  myUserId,
  pathname = "",
  onOpenFullPage,
  onOpenInbox,
  onUnreadChange,
  onUploadAttachment
}) {
  const clientRef = useRef(null);
  if (!clientRef.current || clientRef.current.__apiBaseUrl !== apiBaseUrl) {
    clientRef.current = new MessageClient({ apiBaseUrl, getAccessToken, sourceApp });
    clientRef.current.__apiBaseUrl = apiBaseUrl;
  }
  const client = clientRef.current;
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [convs, setConvs] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const lastIdRef = useRef(0);
  const isSendingRef = useRef(false);
  const isAtBottomRef = useRef(true);
  const bottomRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const openRef = useRef(false);
  const dismissedRef = useRef(false);
  const prevUnreadRef = useRef(-1);
  const prevHiddenRef = useRef(true);
  const hidden = pathname.startsWith("/messages");
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const refreshUnread = useCallback(async () => {
    try {
      const n = await client.getUnreadCount();
      setUnread(n);
      onUnreadChange?.(n);
    } catch {
    }
  }, [client, onUnreadChange]);
  useEffect(() => {
    if (!myUserId) return;
    refreshUnread();
    const t = setInterval(refreshUnread, 3e4);
    return () => clearInterval(t);
  }, [myUserId, refreshUnread]);
  useEffect(() => {
    if (prevHiddenRef.current && !hidden) {
      setOpen(false);
      setActiveConvId(null);
      setMsgs([]);
      setConvs([]);
      refreshUnread();
    }
    prevHiddenRef.current = hidden;
  }, [hidden, refreshUnread]);
  useEffect(() => {
    const prev = prevUnreadRef.current;
    prevUnreadRef.current = unread;
    if (hidden) return;
    if (openRef.current) return;
    if (unread === 0) {
      dismissedRef.current = false;
      return;
    }
    const isNewMessages = prev === -1 || unread > prev;
    if (isNewMessages) dismissedRef.current = false;
    if (dismissedRef.current) return;
    if (!isNewMessages) return;
    client.listConversations().then((allConvs) => {
      const unreadConvs = allConvs.filter((c) => c.unreadCount > 0);
      if (unreadConvs.length === 1) {
        setConvs(allConvs);
        setOpen(true);
        openConv(unreadConvs[0].id);
      } else if (unreadConvs.length > 1) {
        onOpenInbox?.();
      }
    }).catch(() => {
    });
  }, [unread, hidden]);
  const fetchConvs = useCallback(() => {
    client.listConversations().then(setConvs).catch(() => {
    });
  }, [client]);
  useEffect(() => {
    if (open && !activeConvId) fetchConvs();
  }, [open, activeConvId, fetchConvs]);
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgs]);
  function handleScroll() {
    const el = scrollContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }
  const poll = useCallback(async () => {
    if (!activeConvId) return;
    try {
      const detail = await client.getConversation(activeConvId, { since: lastIdRef.current });
      const newMsgs = detail.messages;
      if (newMsgs.length > 0) {
        setMsgs((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          const toAdd = newMsgs.filter((m) => !seen.has(m.id));
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
        lastIdRef.current = newMsgs.at(-1).id;
      }
    } catch {
    }
  }, [activeConvId, client]);
  useEffect(() => {
    if (!activeConvId) return;
    const t = setInterval(poll, 2e3);
    return () => clearInterval(t);
  }, [poll, activeConvId]);
  useEffect(() => {
    if (!activeConvId) return;
    const t = setInterval(() => {
      client.getConversation(activeConvId).then((d) => {
        setMsgs(d.messages);
        lastIdRef.current = d.messages.at(-1)?.id ?? lastIdRef.current;
      }).catch(() => {
      });
    }, 3e4);
    return () => clearInterval(t);
  }, [activeConvId, client]);
  useEffect(() => {
    if (pendingFile?.type.startsWith("image/")) {
      const url = URL.createObjectURL(pendingFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [pendingFile]);
  function openConv(convId) {
    setActiveConvId(convId);
    setMsgs([]);
    lastIdRef.current = 0;
    isAtBottomRef.current = true;
    client.getConversation(convId).then((d) => {
      setMsgs(d.messages);
      lastIdRef.current = d.messages.at(-1)?.id ?? 0;
    }).catch(() => {
    });
    client.markRead(convId).catch(() => {
    });
    setTimeout(refreshUnread, 300);
  }
  async function send() {
    if (!activeConvId) return;
    const content = draft.trim();
    if (!content && !pendingFile || isSendingRef.current) return;
    isSendingRef.current = true;
    setUploading(true);
    setDraft("");
    const fileToSend = pendingFile;
    const replyTarget = replyTo;
    setPendingFile(null);
    setReplyTo(null);
    try {
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;
      if (fileToSend) {
        if (!onUploadAttachment) {
          setUploadError("host app \u672A\u63D0\u4F9B onUploadAttachment \u8655\u7406\u51FD\u5F0F");
          return;
        }
        try {
          const uploaded = await onUploadAttachment(fileToSend);
          attachmentUrl = uploaded.url;
          attachmentName = uploaded.name;
          attachmentType = uploaded.type;
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : "\u4E0A\u50B3\u5931\u6557");
          return;
        }
      }
      try {
        const msg = await client.sendMessage(activeConvId, {
          content,
          attachmentUrl,
          attachmentName,
          attachmentType,
          replyToId: replyTarget?.id ?? null,
          replyToContent: replyTarget?.content ?? null,
          replyToSenderName: replyTarget ? activeConv && replyTarget.senderId === activeConv.other.id ? activeConv.other.contactName : "\u4F60" : null
        });
        isAtBottomRef.current = true;
        setMsgs((prev) => [...prev, msg]);
        lastIdRef.current = msg.id;
      } catch (err) {
        if (err instanceof MessageHubError) {
          setUploadError(err.message);
        }
      }
    } finally {
      isSendingRef.current = false;
      setUploading(false);
      inputRef.current?.focus();
    }
  }
  async function sendSticker(emoji) {
    if (!activeConvId || isSendingRef.current) return;
    isSendingRef.current = true;
    setStickerOpen(false);
    try {
      const msg = await client.sendMessage(activeConvId, { content: emoji });
      isAtBottomRef.current = true;
      setMsgs((prev) => [...prev, msg]);
      lastIdRef.current = msg.id;
    } catch {
    } finally {
      isSendingRef.current = false;
      inputRef.current?.focus();
    }
  }
  function backToList() {
    setActiveConvId(null);
    setMsgs([]);
    setReplyTo(null);
    setStickerOpen(false);
    fetchConvs();
  }
  if (!mounted || hidden || !myUserId) return null;
  const activeConv = convs.find((c) => c.id === activeConvId);
  const lightbox = lightboxUrl ? createPortal(
    /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[200] bg-black/80 flex items-center justify-center", onClick: () => setLightboxUrl(null) }, /* @__PURE__ */ React.createElement("button", { className: "absolute top-4 right-4 text-white hover:text-gray-300" }, /* @__PURE__ */ React.createElement(X, { size: 28 })), /* @__PURE__ */ React.createElement("img", { src: lightboxUrl, alt: "\u5168\u5716", className: "max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl", onClick: (e) => e.stopPropagation() })),
    document.body
  ) : null;
  const widget = /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2" }, open && /* @__PURE__ */ React.createElement("div", { className: "w-80 bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden", style: { height: "420px" } }, /* @__PURE__ */ React.createElement("div", { className: "px-3 py-2.5 bg-blue-700 text-white flex items-center justify-between shrink-0" }, activeConvId ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 min-w-0" }, /* @__PURE__ */ React.createElement("button", { onClick: backToList, className: "hover:text-blue-200 shrink-0" }, /* @__PURE__ */ React.createElement(ArrowLeft, { size: 14 })), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setOpen(false);
        if (activeConvId && onOpenFullPage) onOpenFullPage(activeConvId);
      },
      className: "flex items-center gap-1 hover:underline text-left min-w-0"
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium truncate" }, activeConv?.other.rotaryClubName ?? "")
  )), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setOpen(false);
    dismissedRef.current = true;
  }, className: "hover:text-blue-200 shrink-0 ml-1" }, /* @__PURE__ */ React.createElement(X, { size: 15 }))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium" }, "\u79C1\u4EBA\u8A0A\u606F"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setOpen(false);
    dismissedRef.current = true;
  }, className: "hover:text-blue-200" }, /* @__PURE__ */ React.createElement(X, { size: 15 })))), !activeConvId && /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto divide-y divide-gray-100" }, convs.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "text-center text-sm text-gray-400 py-10" }, "\u5C1A\u7121\u5C0D\u8A71"), convs.map((conv) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: conv.id,
      onClick: () => openConv(conv.id),
      className: "w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 text-left transition-colors"
    },
    /* @__PURE__ */ React.createElement("div", { className: "relative shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-semibold text-sm" }, conv.other.rotaryClubName.slice(0, 1)), isOnline(conv.other.lastSeenAt) && /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" })),
    /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-gray-900 truncate" }, conv.other.rotaryClubName), conv.latestMessage?.createdAt && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-400 shrink-0 ml-1" }, formatDistanceToNow(/* @__PURE__ */ new Date(conv.latestMessage.createdAt.replace(" ", "T") + "Z"), { locale: zhTW, addSuffix: true }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mt-0.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-gray-500 truncate" }, conv.latestMessage?.content ?? "\u5C1A\u7121\u8A0A\u606F"), conv.unreadCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "ml-1 shrink-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1" }, conv.unreadCount > 99 ? "99+" : conv.unreadCount)))
  ))), activeConvId && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { ref: scrollContainerRef, onScroll: handleScroll, className: "flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50" }, msgs.length === 0 && /* @__PURE__ */ React.createElement("p", { className: "text-center text-xs text-gray-400 py-6" }, "\u958B\u59CB\u50B3\u9001\u7B2C\u4E00\u5247\u8A0A\u606F\u5427\uFF01"), msgs.map((msg) => {
    const isMine = activeConv ? msg.senderId !== activeConv.other.id : false;
    return /* @__PURE__ */ React.createElement("div", { key: msg.id, className: `group flex flex-col ${isMine ? "items-end" : "items-start"}` }, /* @__PURE__ */ React.createElement("div", { className: `flex items-end gap-1 ${isMine ? "flex-row-reverse" : "flex-row"}` }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => {
          setReplyTo(msg);
          inputRef.current?.focus();
        },
        className: "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-400 hover:text-blue-500 shrink-0 mb-1",
        title: "\u56DE\u8986"
      },
      /* @__PURE__ */ React.createElement(Reply, { size: 12 })
    ), /* @__PURE__ */ React.createElement("div", { className: `max-w-[80%] px-2.5 py-1.5 rounded-xl text-sm ${isMine ? "bg-blue-600 text-white" : "bg-white shadow-sm text-gray-900"}` }, msg.replyToContent != null && /* @__PURE__ */ React.createElement("div", { className: `mb-1 px-1.5 py-1 rounded text-xs border-l-2 ${isMine ? "border-blue-300 bg-blue-500 text-blue-100" : "border-gray-300 bg-gray-100 text-gray-500"}` }, /* @__PURE__ */ React.createElement("p", { className: "font-medium" }, msg.replyToSenderName), /* @__PURE__ */ React.createElement("p", { className: "truncate" }, msg.replyToContent || "\u9644\u4EF6")), msg.content && (() => {
      const sm = getStickerMatch(msg.content);
      return sm ? /* @__PURE__ */ React.createElement("img", { src: stickerUrl(sm.id), alt: sm.emoji, className: "w-14 h-14" }) : /* @__PURE__ */ React.createElement("p", { className: "whitespace-pre-wrap break-words" }, msg.content);
    })(), msg.attachmentUrl ? msg.attachmentType?.startsWith("image/") ? /* @__PURE__ */ React.createElement("button", { onClick: () => setLightboxUrl(msg.attachmentUrl), className: "mt-1 block" }, /* @__PURE__ */ React.createElement("img", { src: msg.attachmentUrl, alt: msg.attachmentName ?? "\u5716\u7247", className: "max-w-[160px] max-h-[160px] rounded-lg object-cover cursor-zoom-in hover:opacity-90 transition-opacity" })) : /* @__PURE__ */ React.createElement(
      "a",
      {
        href: msg.attachmentUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: `flex items-center gap-1.5 mt-1 text-xs ${isMine ? "text-blue-100 hover:text-white" : "text-gray-600 hover:text-gray-900"}`
      },
      /* @__PURE__ */ React.createElement(FileText, { size: 12 }),
      /* @__PURE__ */ React.createElement("span", { className: "truncate max-w-[120px]" }, msg.attachmentName ?? "\u9644\u4EF6")
    ) : !msg.content && msg.replyToContent == null && /* @__PURE__ */ React.createElement("p", { className: "text-xs opacity-60" }, "\u9644\u4EF6\u5DF2\u904E\u671F"))), isMine && msg.readAt && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-gray-400 mt-0.5 px-1" }, "\u5DF2\u8B80"));
  }), /* @__PURE__ */ React.createElement("div", { ref: bottomRef })), replyTo && /* @__PURE__ */ React.createElement("div", { className: "px-2 py-1.5 bg-blue-50 border-t flex items-center gap-2 text-xs shrink-0" }, /* @__PURE__ */ React.createElement(Reply, { size: 11, className: "text-blue-500 shrink-0" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-blue-600 font-medium" }, replyTo.replyToSenderName ?? (activeConv && replyTo.senderId === activeConv.other.id ? activeConv.other.contactName : "\u4F60")), /* @__PURE__ */ React.createElement("p", { className: "text-gray-500 truncate" }, replyTo.content || replyTo.attachmentName || "\u9644\u4EF6")), /* @__PURE__ */ React.createElement("button", { onClick: () => setReplyTo(null), className: "hover:text-red-500 shrink-0" }, /* @__PURE__ */ React.createElement(X, { size: 11 }))), pendingFile && /* @__PURE__ */ React.createElement("div", { className: "px-2 py-1.5 bg-blue-50 border-t shrink-0" }, previewUrl ? /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2" }, /* @__PURE__ */ React.createElement("img", { src: previewUrl, alt: "\u9810\u89BD", className: "max-h-[80px] max-w-[120px] rounded-lg object-cover border border-blue-200" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0 mt-0.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-xs text-blue-700 truncate" }, pendingFile.name), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-blue-400 mt-0.5" }, "\u6309\u9001\u51FA\u9375\u4E0A\u50B3")), /* @__PURE__ */ React.createElement("button", { onClick: () => setPendingFile(null), className: "shrink-0 text-gray-400 hover:text-red-500" }, /* @__PURE__ */ React.createElement(X, { size: 12 }))) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs text-blue-700" }, /* @__PURE__ */ React.createElement(FileText, { size: 12 }), /* @__PURE__ */ React.createElement("span", { className: "flex-1 truncate" }, pendingFile.name), /* @__PURE__ */ React.createElement("button", { onClick: () => setPendingFile(null), className: "hover:text-red-500" }, /* @__PURE__ */ React.createElement(X, { size: 12 })))), uploadError && /* @__PURE__ */ React.createElement("div", { className: "px-2 py-1.5 bg-red-50 border-t flex items-center gap-1.5 text-xs text-red-600 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "flex-1" }, uploadError), /* @__PURE__ */ React.createElement("button", { onClick: () => setUploadError(null), className: "hover:text-red-800" }, /* @__PURE__ */ React.createElement(X, { size: 11 }))), stickerOpen && /* @__PURE__ */ React.createElement("div", { className: "px-2 py-2 border-t bg-white grid grid-cols-8 gap-1 shrink-0" }, STICKERS.map((s) => /* @__PURE__ */ React.createElement("button", { key: s.id, onClick: () => sendSticker(s.emoji), className: "hover:bg-gray-100 rounded-lg p-0.5 transition-colors flex items-center justify-center" }, /* @__PURE__ */ React.createElement("img", { src: stickerUrl(s.id), alt: s.emoji, className: "w-7 h-7" })))), /* @__PURE__ */ React.createElement("div", { className: "px-2 py-2 border-t flex gap-1.5 shrink-0 bg-white" }, /* @__PURE__ */ React.createElement("input", { ref: fileInputRef, type: "file", className: "hidden", onChange: (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 3 * 1024 * 1024) {
      setUploadError("\u6A94\u6848\u5927\u5C0F\u4E0D\u53EF\u8D85\u904E 3 MB");
      e.target.value = "";
      return;
    }
    setPendingFile(file);
  } }), /* @__PURE__ */ React.createElement("button", { onClick: () => fileInputRef.current?.click(), className: "shrink-0 p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors", title: "\u9644\u52A0\u6A94\u6848" }, /* @__PURE__ */ React.createElement(Paperclip, { size: 15 })), /* @__PURE__ */ React.createElement("button", { onClick: () => setStickerOpen((o) => !o), className: `shrink-0 p-1.5 rounded-lg transition-colors ${stickerOpen ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600"}`, title: "\u8CBC\u5716" }, /* @__PURE__ */ React.createElement(Smile, { size: 15 })), /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: inputRef,
      className: "flex-1 text-sm border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500",
      placeholder: "\u8F38\u5165\u8A0A\u606F\u2026",
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          send();
        }
      },
      autoFocus: true
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: send,
      disabled: !draft.trim() && !pendingFile || uploading,
      className: "p-2 bg-blue-600 text-white rounded-lg disabled:opacity-40 hover:bg-blue-700 transition-colors"
    },
    /* @__PURE__ */ React.createElement(Send, { size: 14 })
  )))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (open) dismissedRef.current = true;
        setOpen((o) => !o);
      },
      className: "w-12 h-12 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg flex items-center justify-center transition-colors relative"
    },
    /* @__PURE__ */ React.createElement(MessageCircle, { size: 22 }),
    unread > 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none" }, unread > 99 ? "99+" : unread)
  ));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, lightbox, createPortal(widget, document.body));
}
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils/mergeClasses.js:
lucide-react/dist/esm/shared/src/utils/toKebabCase.js:
lucide-react/dist/esm/shared/src/utils/toCamelCase.js:
lucide-react/dist/esm/shared/src/utils/toPascalCase.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/shared/src/utils/hasA11yProp.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/arrow-left.js:
lucide-react/dist/esm/icons/file-text.js:
lucide-react/dist/esm/icons/message-circle.js:
lucide-react/dist/esm/icons/paperclip.js:
lucide-react/dist/esm/icons/reply.js:
lucide-react/dist/esm/icons/send.js:
lucide-react/dist/esm/icons/smile.js:
lucide-react/dist/esm/icons/x.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.575.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/

export { GlobalChatWidget };
