chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs[0] || !tabs[0].url) return;

    const activeTab = tabs[0];
    const url = new URL(activeTab.url);
    const domain = url.hostname;
    document.getElementById('site-name').textContent = domain;

    const btn = document.getElementById('toggle-btn');
    const themeBtn = document.getElementById('theme-mode-btn');

    let hasSpecificTheme = false;

    try {
        // Run detection logic inside the tab to match content.js logic
        const detectionResult = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => {
                const domain = window.location.hostname;
                const isSonarr = getComputedStyle(document.documentElement).getPropertyValue('--sonarrBlue').trim() !== "" ||
                    document.title.toLowerCase().includes('sonarr');
                const isChess = domain.includes('chess.com') || !!document.querySelector('.board-layout-main');
                const isAnilist = domain.includes('anilist.co');
                const isGitea = !!document.querySelector('meta[content*="gitea"]') || domain.includes('gitea');
                const isGithub = domain.includes('github.com');
                const isSolana = domain.includes('solana.com');

                return isSonarr || isChess || isSolana || isAnilist || isGitea || isGithub;
            }
        });
        hasSpecificTheme = detectionResult[0]?.result || false;
    } catch (e) {
        console.warn("Could not inspect page for site-specific theme:", e);
    }

    chrome.storage.local.get([domain, `${domain}_mode`], (result) => {
        const isDisabled = result[domain] === 'disabled';
        btn.textContent = isDisabled ? "Enable" : "Disable";

        btn.onclick = () => {
            if (isDisabled) chrome.storage.local.remove(domain);
            else chrome.storage.local.set({ [domain]: 'disabled' });
            chrome.tabs.reload(activeTab.id);
            window.close();
        };

        if (hasSpecificTheme && !isDisabled) {
            themeBtn.style.display = 'block';
            const isGlobalMode = result[`${domain}_mode`] === 'global';
            themeBtn.textContent = isGlobalMode ? "Site Theme" : "Static Theme";

            themeBtn.onclick = () => {
                const newMode = isGlobalMode ? 'site' : 'global';
                chrome.storage.local.set({ [`${domain}_mode`]: newMode });
                chrome.tabs.reload(activeTab.id);
                window.close();
            };
        }
    });
});