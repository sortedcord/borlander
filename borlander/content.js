const domain = window.location.hostname;

chrome.storage.local.get([domain], (result) => {
    if (result[domain] !== 'disabled') {
        const link = document.createElement('link');
        link.id = 'borland-theme-style';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('styles.css');
        (document.head || document.documentElement).appendChild(link);
    }
});