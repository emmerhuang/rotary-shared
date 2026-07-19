'use client';
'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

// src/AppLauncher.tsx

// src/internal/icon.ts
var PALETTE = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#4b5563"
];
function fallbackColor(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = hash * 31 + key.charCodeAt(i) | 0;
  }
  const idx = Math.abs(hash) % PALETTE.length;
  return PALETTE[idx];
}
function initial(name) {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "?";
  return Array.from(trimmed)[0].toUpperCase();
}
function isSafeIconUrl(url) {
  if (!url) return false;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
function initialState(apps) {
  return apps != null ? { status: "ready", apps } : { status: "idle" };
}
function AppLauncher({
  apps,
  fetchApps,
  currentAppKey,
  moreUrl,
  label = "\u61C9\u7528\u670D\u52D9",
  className
}) {
  const [open, setOpen] = react.useState(false);
  const [hover, setHover] = react.useState(false);
  const [state, setState] = react.useState(() => initialState(apps));
  const containerRef = react.useRef(null);
  const triggerRef = react.useRef(null);
  const fetchedRef = react.useRef(false);
  react.useEffect(() => {
    if (apps != null) setState({ status: "ready", apps });
  }, [apps]);
  const loadApps = react.useCallback(async () => {
    if (!fetchApps || fetchedRef.current) return;
    fetchedRef.current = true;
    setState({ status: "loading" });
    try {
      const result = await fetchApps();
      setState(result ? { status: "ready", apps: result } : { status: "error" });
    } catch {
      setState({ status: "error" });
    }
  }, [fetchApps]);
  const toggle = react.useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next && apps == null) void loadApps();
      return next;
    });
  }, [apps, loadApps]);
  const close = react.useCallback(() => setOpen(false), []);
  react.useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  react.useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: containerRef, style: { position: "relative", display: "inline-block" }, children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        ref: triggerRef,
        type: "button",
        "aria-haspopup": "true",
        "aria-expanded": open,
        "aria-label": label,
        title: label,
        onClick: toggle,
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        className,
        style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          padding: 0,
          border: "none",
          // 中性灰 overlay：於深色 navbar 與淺色 host 皆可見（跨 host 自足，不依賴 host CSS）
          background: hover || open ? "rgba(127,127,127,0.18)" : "transparent",
          color: "currentColor",
          cursor: "pointer",
          borderRadius: 8
        },
        children: /* @__PURE__ */ jsxRuntime.jsx(WaffleIcon, {})
      }
    ),
    open && /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        role: "menu",
        "aria-label": label,
        style: {
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          zIndex: 50,
          width: 288,
          maxWidth: "92vw",
          background: "#ffffff",
          color: "#111827",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
          padding: 12,
          fontSize: 14
        },
        children: /* @__PURE__ */ jsxRuntime.jsx(
          PanelBody,
          {
            state,
            currentAppKey: currentAppKey ?? null,
            moreUrl,
            onNavigate: close
          }
        )
      }
    )
  ] });
}
function WaffleIcon() {
  const rows = [0, 1, 2];
  const cols = [0, 1, 2];
  const dots = rows.flatMap((r) => cols.map((c) => ({ cx: 4 + c * 8, cy: 4 + r * 8, k: `${r}-${c}` })));
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { width: 20, height: 20, viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false", children: dots.map((d) => /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: d.cx, cy: d.cy, r: 2, fill: "currentColor" }, d.k)) });
}
function PanelBody({
  state,
  currentAppKey,
  moreUrl,
  onNavigate
}) {
  if (state.status === "idle" || state.status === "loading") {
    return /* @__PURE__ */ jsxRuntime.jsx(SkeletonGrid, {});
  }
  if (state.status === "error") {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("p", { style: { margin: "8px 4px", color: "#6b7280" }, children: "\u66AB\u6642\u7121\u6CD5\u8F09\u5165\u61C9\u7528\u6E05\u55AE" }),
      moreUrl && /* @__PURE__ */ jsxRuntime.jsx(MoreLink, { moreUrl, onNavigate })
    ] });
  }
  if (state.apps.length === 0) {
    return /* @__PURE__ */ jsxRuntime.jsx("p", { style: { margin: "12px 4px", color: "#6b7280" }, children: "\u76EE\u524D\u5C1A\u7121\u53EF\u7528\u7684\u61C9\u7528\u7CFB\u7D71" });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }, children: state.apps.map((app) => /* @__PURE__ */ jsxRuntime.jsx(
      AppTile,
      {
        app,
        current: currentAppKey != null && app.key === currentAppKey,
        onNavigate
      },
      app.key
    )) }),
    moreUrl && /* @__PURE__ */ jsxRuntime.jsx("div", { style: { borderTop: "1px solid #f0f0f0", marginTop: 10, paddingTop: 8 }, children: /* @__PURE__ */ jsxRuntime.jsx(MoreLink, { moreUrl, onNavigate }) })
  ] });
}
function AppTile({
  app,
  current,
  onNavigate
}) {
  const base = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "10px 6px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#111827",
    textAlign: "center"
  };
  const inner = /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(AppIcon, { app }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { style: { fontSize: 14, lineHeight: 1.25, maxHeight: "2.5em", overflow: "hidden", color: "#111827" }, children: app.name })
  ] });
  if (current) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        role: "menuitem",
        "aria-current": "true",
        title: `${app.name}\uFF08\u76EE\u524D\uFF09`,
        onClick: onNavigate,
        style: { ...base, border: "none", outline: "2px solid #2563eb", background: "#eff6ff", cursor: "default", font: "inherit" },
        children: inner
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "a",
    {
      role: "menuitem",
      href: app.url,
      target: "_blank",
      rel: "noopener noreferrer",
      title: app.name,
      onClick: onNavigate,
      style: { ...base, background: "transparent" },
      children: inner
    }
  );
}
function AppIcon({ app }) {
  const [broken, setBroken] = react.useState(false);
  const showImg = isSafeIconUrl(app.iconUrl) && !broken;
  if (showImg) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "img",
      {
        src: app.iconUrl,
        alt: "",
        width: 40,
        height: 40,
        style: { width: 40, height: 40, borderRadius: 10, objectFit: "contain" },
        onError: () => setBroken(true)
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      "aria-hidden": "true",
      style: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: fallbackColor(app.key),
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: 700
      },
      children: initial(app.name)
    }
  );
}
function MoreLink({ moreUrl, onNavigate }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "a",
    {
      href: moreUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      onClick: onNavigate,
      style: { display: "block", textAlign: "center", fontSize: 14, color: "#2563eb", textDecoration: "none", padding: 4 },
      children: "\u67E5\u770B\u5168\u90E8\u61C9\u7528 \u2192"
    }
  );
}
function SkeletonGrid() {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { "data-testid": "launcher-skeleton", style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }, children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntime.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 6px" }, children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { style: { width: 40, height: 40, borderRadius: 10, background: "#f0f0f0" } }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { style: { width: "70%", height: 8, borderRadius: 4, background: "#f0f0f0" } })
  ] }, i)) });
}

exports.AppLauncher = AppLauncher;
