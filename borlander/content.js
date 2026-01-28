const domain = window.location.hostname;

chrome.storage.local.get([domain, `${domain}_mode`], (result) => {
    if (result[domain] === 'disabled') return;

    const forceGlobal = result[`${domain}_mode`] === 'global';
    let siteMatched = false;

    if (!forceGlobal) {

        // 1. SONARR
        const isSonarr = getComputedStyle(document.documentElement).getPropertyValue('--sonarrBlue').trim() !== "" ||
            document.title.toLowerCase().includes('sonarr');
        if (isSonarr) { injectSiteStyle('sites/sonarr.local/styles.css'); siteMatched = true; }

        // 2. CHESS.COM
        if (!siteMatched && (domain.includes('chess.com') || !!document.querySelector('.board-layout-main'))) {
            injectSiteStyle('sites/chess.com/styles.css'); siteMatched = true;
        }

        // 3. ANILIST
        if (!siteMatched && domain.includes('anilist.co')) {
            injectSiteStyle('sites/anilist.co/styles.css'); siteMatched = true;
        }

        // 4. GITEA
        if (!siteMatched && (!!document.querySelector('meta[content*="gitea"]') || domain.includes('gitea'))) {
            injectSiteStyle('sites/gitea.local/styles.css'); siteMatched = true;
        }

        // 5. GITHUB
        if (!siteMatched && domain.includes('github.com')) {
            injectSiteStyle('sites/github.com/styles.css'); siteMatched = true;
        }

        if (!siteMatched && domain.includes('solana.com')) {
            injectSiteStyle('sites/solana.com/styles.css'); siteMatched = true;
        }

        if (!siteMatched && domain.includes('chatgpt.com')) {
            injectSiteStyle('sites/chatgpt.com/styles.css'); siteMatched = true;
        }
    }

    if (!siteMatched) {
        injectSiteStyle('styles.css');
    }
});

function injectSiteStyle(path) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL(path);
    (document.head || document.documentElement).appendChild(link);
}