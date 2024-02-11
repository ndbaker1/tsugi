export interface SiteInfo {
  title: string;
  url: string;
}

export type Shows = Record<string, ShowData>;

export interface ShowData {
  episode: number;
  lastUpdated: number;
  pending: boolean;
  title: string;
  url: string;
}

interface ShowStore {
  get(key: string): Promise<ShowData>;
  getAll(): Promise<Shows>;
  remove(key: string): void;
  set(key: string, value: ShowData): void;
}

export class ChromeStore implements ShowStore {
  getAll(): Promise<Shows> {
    return new Promise((res, _) => {
      chrome.storage.local.get(null, (items: Shows | null) => {
        if (items) {
          res(items);
        } else {
          res({});
        }
      });
    });
  }
  get(name: string): Promise<ShowData> {
    return new Promise((res, _) => {
      chrome.storage.local.get([name], ({ [name]: show }) => res(show));
    });
  }
  set(name: string, show: ShowData) {
    return chrome.storage.local.set({ [name]: show });
  }
  remove(name: string) {
    return chrome.storage.local.remove([name]);
  }
}

function notify(message: string) {
  const extensionId = "cafkiphkjomhpipkggdngopcmefdkbda";
  chrome.notifications.create(
    extensionId,
    {
      type: "basic",
      iconUrl: `chrome-extension://${extensionId}/icons/logo.ico`,
      title: "Show update",
      message: message,
    },
    console.log,
  );
}

export class SiteWatcher {
  constructor(private store: ShowStore = new ChromeStore()) { }

  public async prunePending() {
    // prune the existing pending queue
    for (const [name, showInfo] of Object.entries(await this.store.getAll())) {
      if (showInfo.pending) {
        this.store.remove(name);
      }
    }
  }

  private extractEpisode(info: SiteInfo): number {
    const r = /episode[\s-_]*(\d+)/gim;
    const matches = r.exec(info.url);
    if (matches) {
      return parseInt(matches[1]);
    }
    return -1;
  }

  private extractShowName(info: SiteInfo): string {
    let title = info.title;

    const suffixIndex = /episode/dgim.exec(title)?.index;
    if (suffixIndex) {
      title = title.substring(0, suffixIndex).trim();
    }
    const prefixIndicies = /watch/dgim.exec(title)?.indices;
    if (prefixIndicies) {
      // these are start and end indicies of matching groups, so start from
      // the last one of the prefix
      const prefixIndex = prefixIndicies[0][1];
      title = title.substring(prefixIndex).trim();
    }

    return title;
  }

  public async processSite(info: SiteInfo) {
    const showName = this.extractShowName(info);
    const showEpisode = this.extractEpisode(info);
    const timeStamp = Date.now();

    if (showEpisode === -1) {
      console.log(`cannot parse episode from site: ${info.url}. skipping..`);
      return;
    }

    for (const [name, showInfo] of Object.entries(await this.store.getAll())) {
      if (this.levenshteinDistance(showName, name) <= 2) {
        console.log("found match for:", showName);

        if (showInfo.pending) {
          notify(`Adding ${showName} to your show list!`);
          showInfo.pending = false;
        }

        // update last seen timestamp for this show
        showInfo.lastUpdated = timeStamp;
        // check if we are visiting a more recent episode than before
        if (showInfo.episode < showEpisode) {
          showInfo.url = info.url;
          showInfo.episode = showEpisode;
        }

        console.log("updated info:", showInfo);
        this.store.set(name, showInfo);
        return;
      }
    }

    const showInfo: ShowData = {
      episode: showEpisode,
      lastUpdated: timeStamp,
      pending: true,
      title: showName,
      url: info.url,
    };

    console.log(
      "did not find entry. creating new show with pending status:",
      showInfo,
    );
    this.store.set(showName, showInfo);
  }

  // levenshtein distance between two strings
  private levenshteinDistance(s: string, t: string): number {
    if (s.length === 0) return t.length;
    if (t.length === 0) return s.length;
    const dp = [];
    for (let i = 0; i <= t.length; i++) {
      dp[i] = [i];
      for (let j = 1; j <= s.length; j++) {
        if (i === 0) {
          dp[i][j] = j;
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1),
          );
        }
      }
    }
    return dp[t.length][s.length];
  }
}
