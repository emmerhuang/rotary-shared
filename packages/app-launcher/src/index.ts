/**
 * @rotary/app-launcher — public exports.
 *
 * Host app 只 import 這個檔案。route-agnostic / 資料驅動：host 注入 app 清單
 * （或惰性 fetcher）+ 當前 app key，元件負責九宮格 UI、fallback 圖示、a11y。
 */
export { AppLauncher } from './AppLauncher'
export type { AppLauncherProps, LauncherApp } from './AppLauncher'
