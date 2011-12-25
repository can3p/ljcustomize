
var client = {
    init: function() {
        this._pageContainer = document.querySelector('.b-singlepost');

        chrome.extension.sendRequest({action: 'getOptions'}, function(response) {
            _settings.setData(response);

            var options = _settings.getOptions();

            Object.keys(options).forEach(function(prop) {
                var method = 'init' + _utils.firstUpper(prop);
                (method in this) && this[method](options[prop], options); 
            }.bind(this));
        }.bind(this));
    },

    initCommentsize: function(value, options) {
        if (value === 'smaller' || value === 'small') {
            this._pageContainer.classList.add('lje-commentsize-' + value);
        }
    }
}

client.init();
