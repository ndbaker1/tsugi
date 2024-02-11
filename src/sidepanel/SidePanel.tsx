import { useEffect, useState } from "react";
import "./SidePanel.css";
import { ChromeStore, Shows } from "../lib/watcher";

const store = new ChromeStore();

export const SidePanel = () => {
  const [shows, setShows] = useState<Shows>({});

  async function updateShows() {
    const storedShows = await store.getAll();
    const activeShows = Object.entries(storedShows)
      .filter(([_, info]) => !info.pending)
      // currently this behavior means that shows will be moved to the bottom of
      // the list once they have been visited
      .toSorted(([__, a], [_, b]) => (a.lastUpdated < b.lastUpdated ? -1 : 1))
      .reduce((res, [name, info]) => {
        res[name] = info;
        return res;
      }, {} as Shows);
    setShows(activeShows);
  }

  useEffect(() => {
    updateShows();
    chrome.storage.onChanged.addListener(updateShows);
    return () => {
      chrome.storage.onChanged.removeListener(updateShows);
    };
  });

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 md:p-6">
      {Object.entries(shows).map(([name, show]) => (
        <div className="grid rounded-lg">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-t-lg" style={{ backgroundColor: "#9C88E2" }}>
            <button
              type="button"
              className="rounded-lg p-1 flex items-center justify-center bg-black bg-opacity-50 transition-bg-opacity duration-200 hover:bg-opacity-90"
              onClick={() => chrome.tabs.update({ url: show.url })}
            >
              🍿 Episode {show.episode}
            </button>
            <button
              type="button"
              className="rounded-lg p-1 flex items-center justify-center bg-black bg-opacity-50 transition-bg-opacity duration-200 hover:bg-opacity-90"
              onClick={() => store.remove(name)}
            >
              ❌ Remove
            </button>
          </div>
          <div
            className="p-3 rounded-b-lg text-balance flex flex-col text-center items-center justify-center"
            style={{ backgroundColor: "rgb(28 24 39)" }}
          >
            <span>{show.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SidePanel;
