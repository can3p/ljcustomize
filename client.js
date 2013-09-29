var bridge = {
  run: function(func) {
    var script = document.createElement('script');
    script.text = '(' + func.toString() + ')()';
    document.body.appendChild(script);
  }
}

var client = {
    init: function() {
        this._pageContainer = document.querySelector('.b-singlepost');

        chrome.extension.sendRequest({action: 'getOptions'}, function(response) {
            _settings.setData(response);

            var options = _settings.getOptions();

            var domains = options.workingDomains.split('\n'),
                activeDomain;

            domains.forEach(function(domain) {
                if (location.href.match(RegExp('^http:\/\/[a-z0-9]+\.' + domain.replace(/(\.|\+|\*)/g, '\\$1'), 'i'))) {
                    activeDomain = domain;
                }
            });

            if (!activeDomain) {
                return;
            }

            Object.keys(options).forEach(function(prop) {
                var method = 'init' + _utils.firstUpper(prop);
                (method in this) && this[method](options[prop], options); 
            }.bind(this));

            this.initUpdateBml(activeDomain, options);
            this.initIndex(activeDomain, options);
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
                    comment = form.querySelector('.b-updateform');

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
    },

    initUpdateBml: function(domain, options) {
        if (!location.href.match(RegExp('^http:\/\/[a-z0-9]+\.' + domain.replace(/(\.|\+|\*)/g, '\\$1') + '\/update\.bml', 'i'))) {
            return;
        }

        bridge.run(function() {
          var orig_call = LJ.Api.call.bind(LJ.Api),
            takeovers = {};

          LJ.Api.call = function(method, body, callback) {
            if (!takeovers.hasOwnProperty(method)) {
              orig_call.apply(null, arguments);
            } else {
              takeovers[method](body, callback, orig_call.bind(null, method));
            }
          };

          LJ.Api.takeover = function(method, func) {
            takeovers[method] = func;
          };
        });

        document.querySelector('.b-updatepage-draft').insertAdjacentHTML('beforeend', '<span class="b-updatepage-draft-title-autosave-error">Alarm! Error occured during draft saving at <span class="b-updatepage-draft-time"></span> <a href="#" class="b-updatepage-draft-retry">Try Again</a></span>');

        bridge.run(function() {
          var container = document.querySelector('.b-updatepage-draft'),
              time = container.querySelector('.b-updatepage-draft-title-autosave-error .b-updatepage-draft-time'),
              retry = container.querySelector('.b-updatepage-draft-retry'),
              last_state;

          retry.addEventListener('click', function(ev) {
            ev.preventDefault();
            container.classList.toggle('b-updatepage-draft-autosave-error', false);
            container.classList.toggle('b-updatepage-draft-autosave', false);

            jQuery(container).data('draft').save(last_state);
          }, false);

          LJ.Api.takeover('draft.set', function(request, callback, next) {
              last_state = request;

              var cb = function(request, result) {
                var had_error = result.hasOwnProperty('error');

                if (last_state !== request) { //another request has already been made, leave the work for him
                  return;
                }

                if (!had_error) {
                  last_state = null;
                }

                callback(result);

                container.classList.toggle('b-updatepage-draft-autosave-error', had_error);
                container.classList.toggle('b-updatepage-draft-autosave', !had_error);
                time.innerHTML = LJ.Util.Date.format(new Date(), ' %T');
              }.bind(null, request);

            next(request, cb);
          })

          var widget = jQuery('#post').data('postForm');

          widget.element.off('submit');
          widget.element.on('submit', function(e) {
            if (!last_state) {
              widget._submit();
              return;
            }

            e.preventDefault();
            LJ.Api.call('draft.set', last_state, function(result) {
              var had_error = result.hasOwnProperty('error');

              if (had_error) {
                alert("Unable to save draft of your post. It seems that server is unavailible now. Please check network connection to make the post");
              } else {
                // if everything is ok, bypass all handlers and submit form
                widget._submit();
                widget.element.get(0).submit();
              }
            });
          });
        });
    },

    initIndex: function(domain, options) {
        var node = document.querySelector('.selfpromo-bubble-entry p:nth-child(2) b');
        if (!node) { return; }

        var price = parseInt( node.innerHTML.replace(/\s+/g, ''), 10),
            mul = 0.01;

        node.innerHTML += ' (USD $' + (mul * price) + ')';
    }

}

client.init();
