var ml = chrome.i18n.getMessage,
    translates = document.querySelectorAll('.lje___ml');

document.title = ml(document.title);
for (var i = 0, l = translates.length; i < l; ++i) {
    translates[i].innerHTML = ml(translates[i].innerHTML);
}
