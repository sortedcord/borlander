async function loadThemesRegistry() {
    try {
        const url = chrome.runtime.getURL('themes.json');
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load themes.json: ${res.status}`);
        return await res.json();
    } catch (e) {
        console.warn('Borlander: could not load themes registry', e);
        return { themes: [] };
    }
}

chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs[0] || !tabs[0].url) return;

    const activeTab = tabs[0];
    const url = new URL(activeTab.url);
    const domain = url.hostname;
    document.getElementById('site-name').textContent = domain;

    const btn = document.getElementById('toggle-btn');
    const themeBtn = document.getElementById('theme-mode-btn');

    const registry = await loadThemesRegistry();
    const themes = Array.isArray(registry.themes) ? registry.themes : [];

    let hasSpecificTheme = false;
    try {
        // Detect using the same rules as content.js, but executed within the actual page.
        const detectionResult = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            args: [themes],
            func: (themesFromExtension) => {
                const domain = window.location.hostname;

                function themeApplies(theme) {
                    if (!theme) return false;

                    if (theme.type === 'hostname') {
                        return typeof theme.hostnameIncludes === 'string' && domain.includes(theme.hostnameIncludes);
                    }

                    if (theme.type === 'heuristic' && theme.detect) {
                        const d = theme.detect;
                        let ok = false;

                        if (typeof d.hostnameIncludes === 'string') {
                            ok = ok || domain.includes(d.hostnameIncludes);
                        }
                        if (typeof d.titleIncludes === 'string') {
                            ok = ok || document.title.toLowerCase().includes(d.titleIncludes.toLowerCase());
                        }
                        if (typeof d.metaContentIncludes === 'string') {
                            ok = ok || !!document.querySelector(`meta[content*="${CSS.escape(d.metaContentIncludes)}"]`);
                        }
                        if (typeof d.cssVarNonEmpty === 'string') {
                            ok = ok || getComputedStyle(document.documentElement)
                                .getPropertyValue(d.cssVarNonEmpty)
                                .trim() !== '';
                        }

                        return ok;
                    }

                    return false;
                }

                // Prefer hostname rules, then heuristics.
                for (const t of themesFromExtension) {
                    if (t.type === 'hostname' && themeApplies(t)) return true;
                }
                for (const t of themesFromExtension) {
                    if (t.type === 'heuristic' && themeApplies(t)) return true;
                }

                return false;
            }
        });
        hasSpecificTheme = detectionResult[0]?.result || false;
    } catch (e) {
        console.warn('Could not inspect page for site-specific theme:', e);
    }

    chrome.storage.local.get([domain, `${domain}_mode`], (result) => {
        const isDisabled = result[domain] === 'disabled';
        btn.textContent = isDisabled ? 'Enable' : 'Disable';

        btn.onclick = () => {
            if (isDisabled) chrome.storage.local.remove(domain);
            else chrome.storage.local.set({ [domain]: 'disabled' });
            chrome.tabs.reload(activeTab.id);
            window.close();
        };

        if (hasSpecificTheme && !isDisabled) {
            themeBtn.style.display = 'block';
            const isStaticMode = result[`${domain}_mode`] === 'global' || result[`${domain}_mode`] === 'static';
            themeBtn.textContent = isStaticMode ? 'Site Theme' : 'Static Theme';

            themeBtn.onclick = () => {
                const newMode = isStaticMode ? 'site' : 'static';
                chrome.storage.local.set({ [`${domain}_mode`]: newMode });
                chrome.tabs.reload(activeTab.id);
                window.close();
            };
        } else {
            themeBtn.style.display = 'none';
        }
    });
});