chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;
    document.getElementById('site-name').textContent = domain;

    const btn = document.getElementById('toggle-btn');

    chrome.storage.local.get([domain], (result) => {
        const isDisabled = result[domain] === 'disabled';
        btn.textContent = isDisabled ? "Enable on this site" : "Disable on this site";

        btn.onclick = () => {
            if (isDisabled) {
                chrome.storage.local.remove(domain);
            } else {
                chrome.storage.local.set({ [domain]: 'disabled' });
            }
            chrome.tabs.reload(tabs[0].id);
            window.close();
        };
    });
});