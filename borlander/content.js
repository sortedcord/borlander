const domain = window.location.hostname;

async function loadThemesRegistry() {
    try {
        const url = chrome.runtime.getURL('themes.json');
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load themes.json: ${res.status}`);
        return await res.json();
    } catch (e) {
        console.warn('Borlander: could not load themes registry, falling back to static theme', e);
        return { themes: [] };
    }
}

function themeAppliesToPage(theme) {
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

function pickBestSiteTheme(themes) {
    // Prefer hostname matches first, then heuristics.
    for (const t of themes) {
        if (t.type === 'hostname' && themeAppliesToPage(t)) return t;
    }
    for (const t of themes) {
        if (t.type === 'heuristic' && themeAppliesToPage(t)) return t;
    }
    return null;
}

(async () => {
    const registry = await loadThemesRegistry();
    const themes = Array.isArray(registry.themes) ? registry.themes : [];
    const applicable = pickBestSiteTheme(themes);

    chrome.storage.local.get([domain, `${domain}_mode`], (result) => {
        if (result[domain] === 'disabled') return;

        // historical value is "global"; treat as "static".
        const forceStatic = result[`${domain}_mode`] === 'global' || result[`${domain}_mode`] === 'static';

        if (!forceStatic && applicable?.cssPath) {
            injectSiteStyle(applicable.cssPath);
            return;
        }

        injectSiteStyle('styles.css');
    });
})();

function injectSiteStyle(path) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL(path);
    (document.head || document.documentElement).appendChild(link);
}