
var client = {
    init: function() {
        this._pageContainer = document.querySelector('.b-singlepost');

        chrome.extension.sendRequest({action: 'getOptions'}, function(response) {
            _settings.setData(response);

            var options = _settings.getOptions();

            var domains = options.workingDomains.split('\n'),
                doInit = false;

            domains.forEach(function(domain) {
                if (location.href.match(RegExp('^http:\/\/[a-z0-9]+\.' + domain.replace(/(\.|\+|\*)/g, '\\$1'), 'i'))) {
                    doInit = true;
                }
            });

            if (!doInit) {
                return;
            }

            Object.keys(options).forEach(function(prop) {
                var method = 'init' + _utils.firstUpper(prop);
                (method in this) && this[method](options[prop], options); 
            }.bind(this));
        }.bind(this));
    },

    initCommentsize: function(value, options) {
        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        if (value !== 'm') {
            this._pageContainer.classList.add('lje-commentsize-' + value);
        }
    },

    initCommentfont: function(value, options) {
        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        this._pageContainer.classList.add('lje-commentfont-' + value);
    },

    initSuppressgradient: function(value, options) {
        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        if (value) {
            this._pageContainer.classList.add('lje-suppressgradient');
        }
    },

    initShowcontrols: function(value, options) {
        if (!this._pageContainer) { return; } //we need only s1 pages with new design

        if (value) {
            this._pageContainer.classList.add('lje-commenthover-visible');
        }
    },

    initShowsubjects: function(value, options) {
        if (!value) { return; }
        if (!this._pageContainer) { return; } //we need only s1 pages with new design


        this._pageContainer.classList.add('lje-commentsubject-show');

        var form =  document.getElementById('postform'),
            subject = form.subject,
            subjectval = subject.value;

        var moveSubjectField = function() {
                subject.type = 'text';
                subject.size = 55;
                subject.placeholder = chrome.i18n.getMessage('client_subject');
                subject.classList.add('b-watering-subject');

                var markup = '<div class="b-watering-subjectbox"></div>';
                    div = document.createElement('div');

                div.innerHTML = markup;
                var insertEl = div.firstChild,
                    comment = form.querySelector('.b-watering-comment');

                comment.parentNode.insertBefore(insertEl, comment);
                insertEl.appendChild(subject);
            },
            bindAddCommentLinks = function(container) {
                container.addEventListener('click', function(ev) {
                    var control = ev.srcElement;
                    //we set subject input value on every click, because if the form will close,
                    //this action will do no harm, and it's a correct action otherwise.
                    if (_utils.matchesSelector(control, '.b-leaf-actions-reply .b-pseudo')) {
                        var comment = _utils.closest(control, '.b-leaf'),
                            subjectNode = comment.querySelector('.b-leaf-subject'),
                            subjectHeader = subjectNode && subjectNode.innerHTML.replace(/^(Re:\s*)+/,'') || '';

                        if (subjectHeader.length > 0) {
                            subject.value = 'Re: ' + subjectHeader;
                        }
                    }
                }, false)
            };
        
        moveSubjectField();
        bindAddCommentLinks(this._pageContainer);
    }
}

client.init();
