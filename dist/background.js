"use strict";
const DEFAULT_MAP = {
    'R': 'nextTab',
    'L': 'prevTab',
    'DR': 'closeTab',
    'UD': 'reloadTab',
};
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get('gestureMap', (res) => {
        if (!res.gestureMap)
            chrome.storage.sync.set({ gestureMap: DEFAULT_MAP });
    });
});
chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type !== 'gesture' || !sender.tab)
        return;
    chrome.storage.sync.get('gestureMap', (res) => {
        const map = res.gestureMap ?? DEFAULT_MAP;
        const action = map[msg.pattern];
        if (!action)
            return;
        switch (action) {
            case 'nextTab':
                activateRelativeTab(+1);
                break;
            case 'prevTab':
                activateRelativeTab(-1);
                break;
            case 'closeTab':
                chrome.tabs.remove(sender.tab.id);
                break;
            case 'reloadTab':
                chrome.tabs.reload(sender.tab.id);
                break;
        }
    });
});
function activateRelativeTab(offset) {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const activeIdx = tabs.findIndex(t => t.active);
        if (activeIdx === -1)
            return;
        let next = (activeIdx + offset + tabs.length) % tabs.length;
        chrome.tabs.update(tabs[next].id, { active: true });
    });
}
