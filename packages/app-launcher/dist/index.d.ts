import * as react_jsx_runtime from 'react/jsx-runtime';

/** 單一 app 條目。route-agnostic：url 是最終可直接跳轉的絕對網址，元件不組任何路由。 */
interface LauncherApp {
    /** 穩定唯一鍵（rotarysso 傳 clientId）；決定 fallback 顏色與「目前」比對。 */
    key: string;
    /** 顯示名稱。 */
    name: string;
    /** 點擊跳轉的最終網址（新分頁開啟）。 */
    url: string;
    /** 圖示網址；缺失 / 非 https 時 graceful fallback 成色塊+首字。 */
    iconUrl?: string | null;
}
interface AppLauncherProps {
    /**
     * 已解析好的 app 清單（controlled 模式）。提供此 prop 即直接渲染、不 fetch。
     * 與 fetchApps 二擇一；tests 與簡單 host 用這個。
     */
    apps?: LauncherApp[] | null;
    /**
     * 惰性取清單函式（async 模式）。首次開啟時呼叫一次；回 null ⇒ graceful degrade。
     * route-agnostic：元件不知道資料從哪來（rotarysso 注入 () => fetch('/api/apps')…）。
     */
    fetchApps?: () => Promise<LauncherApp[] | null>;
    /** 目前所在 app 的 key → 標「目前」；rotarysso（IdP 不在清單）傳 null/undefined ⇒ 無標示。 */
    currentAppKey?: string | null;
    /** footer「查看全部應用」連結（可選）。 */
    moreUrl?: string;
    /** 觸發器 aria-label / tooltip，預設「應用服務」。 */
    label?: string;
    /** 觸發器 className 透傳，供 host 調色以貼合自家 navbar（高反差）。 */
    className?: string;
}
declare function AppLauncher({ apps, fetchApps, currentAppKey, moreUrl, label, className, }: AppLauncherProps): react_jsx_runtime.JSX.Element;

export { AppLauncher, type AppLauncherProps, type LauncherApp };
