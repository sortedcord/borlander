const domain = window.location.hostname;

chrome.storage.local.get([domain], (result) => {
    if (result[domain] !== 'disabled') {

        let siteMatched = false;


        // 1. SONARR
        const isSonarr = getComputedStyle(document.documentElement).getPropertyValue('--sonarrBlue').trim() !== "" ||
            document.title.toLowerCase().includes('sonarr');

        if (isSonarr) {
            injectSiteStyle('sites/sonarr.local/styles.css');
            siteMatched = true;
        }

        // 2. CHESS.COM
        const isChess = domain.includes('chess.com') || !!document.querySelector('.board-layout-main');

        if (isChess) {
            injectSiteStyle('sites/chess.com/styles.css');
            siteMatched = true;
        }

        const isAnilist = domain.includes('anilist.co');
        if (isAnilist) {
            injectSiteStyle('sites/anilist.co/styles.css');
            siteMatched = true;
        }

        // 3. GITEA
        const isGitea = !!document.querySelector('meta[content*="gitea"]') ||
            !!document.querySelector('.ui.footer .item[href*="gitea.com"]') ||
            domain.includes('gitea');

        if (isGitea) {
            console.log("Borland Theme: Gitea detected.");
            injectSiteStyle('sites/gitea.local/styles.css');
            siteMatched = true;
        }

        // --- GLOBAL FALLBACK ---
        // Only inject global styles if NO specific site was matched
        if (!siteMatched) {
            console.log("Borland Theme: No specific site match. Applying global styles.");
            injectSiteStyle('styles.css');
        }
    }
});

function injectSiteStyle(path) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL(path);
    (document.head || document.documentElement).appendChild(link);
}