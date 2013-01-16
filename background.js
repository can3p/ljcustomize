debugger;
_settings.setData(_storage.fromLocalStorage());
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.action === 'getOptions') {
        sendResponse(_settings.getOptions());
    } else if (request.action === 'reloadOptions') {
        _settings.setData(_storage.fromLocalStorage());
    }
});

