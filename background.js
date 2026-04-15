let isBreakActive = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['enabled'], (data) => {
    if (data.enabled === undefined) {
      chrome.storage.local.set({
        enabled: true,
        interval: 20, 
        breakDuration: 20,
        showExercises: true,
        showNotification: true,
        customMessage: "Take a break!",
        theme: 'dark'
      });
    }
    createAlarm();
  });
});

function createAlarm() {
  // If a break is active, don't schedule a new one until it's finished
  if (isBreakActive) return;

  chrome.storage.local.get(['enabled', 'interval'], (data) => {
    chrome.alarms.clear("breakAlarm");
    if (data.enabled) {
      chrome.alarms.create("breakAlarm", { delayInMinutes: data.interval || 20 });
    }
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.interval || changes.enabled) {
    createAlarm();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "breakAlarm") {
    isBreakActive = true;
    triggerBreak();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "breakFinished") {
    isBreakActive = false;
    createAlarm();
  }
});

function triggerBreak() {
  chrome.storage.local.get(['showExercises', 'showNotification', 'customMessage'], (data) => {
    if (data.showNotification) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png', 
        title: 'EyeRest',
        message: data.customMessage || 'Take a break! Spend a few seconds now, for a healthier future.'
      });
    }
    
    if (data.showExercises) {
      chrome.tabs.create({ url: chrome.runtime.getURL("break.html") });
    } else {
      isBreakActive = false;
      createAlarm();
    }
  });
}
