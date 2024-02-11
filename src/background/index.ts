import { SiteWatcher } from "../lib/storage";

console.log("running tsugi background worker..");

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

const siteWatcher = new SiteWatcher();

await siteWatcher.prunePending();

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    if (tab.url && tab.title) {
      siteWatcher.processSite({
        url: tab.url,
        title: tab.title,
      });
    }
  }
});
