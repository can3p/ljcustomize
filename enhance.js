var _utils = {
    extend: function() {
        var args = [].slice.call(arguments),
            result = {};

        args.forEach(function(obj) {
            if (!obj) { return; }

            for (var prop in obj) {
                result[prop] = obj[prop];
            }
        })

        return result;
    },

    filter: function(toFilter, filter) {
        Object.keys(filter).forEach(function(prop) {
            if (prop in toFilter && toFilter[prop] === filter[prop]) {
                delete toFilter[prop];
            }
        });
    },

    firstUpper: function(str) {
        str = '' + str; //cast any value to string
        return str.replace(/^(\w{1})/, function(str, p1) { return p1.toUpperCase(); } );
    }
};

var _settings = function() {
    var defaultOptions = {
        commentsize: 'm',
        commentfont: 'arial',
        suppressgradient: false,
        showsubjects: false,
        showcontrols: false
    }

    var _data = {},
        _mergedData = _utils.extend({}, defaultOptions);

    return {
        setData: function(data) {
            data = data || {};
            _data = data;
            _mergedData = _utils.extend({}, defaultOptions, _data);
        },

        getData: function() {
            return _utils.extend({}, _data);
        },

        setValue: function(key, value) {
            if (!(key in defaultOptions)) { throw new Error('no such option, ' + key); }

            if (value === 'false') {
                value = false;
            }

            if (defaultOptions[key] === value) {
                if (_data && key in _data) {
                    delete _data[key];
                }
            } else {
                _data[key] = value;
            }

            _mergedData[key] = value;
        },

        getValue: function(key) {
            return _mergedData[key];
        },

        getOptions: function() {
            return _utils.extend({}, _mergedData);
        }
    }
}();

var _storage = {
    toLocalStorage: function(options) {
        localStorage.setItem('jseOptions', JSON.stringify(options));
    },

    fromLocalStorage: function() {
            return JSON.parse(localStorage.getItem('jseOptions'));
    }
};
// 
// 
// var addClasses = function() {
//     var commentsize = settings.getValue('commentsize');
// 
//     switch(commentsize) {
//         case 'smaller':
//         case 'small':
//             document.body.className += ' leaves-' + commentsize;
//     };
// };
// 
// 
// if (location.href.match(/\w\.livejournal\.com/)) {
//     addClasses();
// }
//
