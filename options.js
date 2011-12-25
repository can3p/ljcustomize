(function() {

    var options;

    function initForm() {
        _settings.setData(_storage.fromLocalStorage());

        options = _settings.getOptions();
        Object.keys(options).forEach(function(opt) {
            document.getElementById(opt).value = options[opt];
        })

        document.querySelector('.save').addEventListener('click', saveForm, false);
    }

    function saveForm() {
        Object.keys(options).forEach(function(opt) {
            _settings.setValue(opt, document.getElementById(opt).value);
        })

        _storage.toLocalStorage(_settings.getData());
        chrome.extension.sendRequest({action: 'reloadOptions'});

        saved = document.querySelector('.saved');
        saved.style.display = 'inline';
        setTimeout(function() {
            saved.style.display = '';
        }, 5000);
    }

    initForm();

})();
