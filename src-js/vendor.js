/*
 * Bootstrap: tab.js v3.3.6
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
// This is used for switching between tabs in the algolia searchbar!
+(function ($) {
  'use strict';
  var Tab = function (element) {
    this.element = $(element);
  };
  Tab.VERSION = '3.3.6';
  Tab.TRANSITION_DURATION = 150;
  Tab.prototype.show = function () {
    var $this = this.element;
    var $ul = $this.closest('ul:not(.dropdown-menu)');
    var selector = $this.data('target');
    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
    }
    if ($this.parent('li').hasClass('active')) return;
    var $previous = $ul.find('.active:last a');
    var hideEvent = $.Event('hide.bs.tab', { relatedTarget: $this[0] });
    var showEvent = $.Event('show.bs.tab', { relatedTarget: $previous[0] });
    $previous.trigger(hideEvent);
    $this.trigger(showEvent);
    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
      return;
    }
    var $target = $(selector);
    this.activate($this.closest('li'), $ul);
    this.activate($target, $target.parent(), function () {
      $previous.trigger({ type: 'hidden.bs.tab', relatedTarget: $this[0] });
      $this.trigger({ type: 'shown.bs.tab', relatedTarget: $previous[0] });
    });
  };
  Tab.prototype.activate = function (element, container, callback) {
    var $active = container.find('> .active');
    var transition =
      callback &&
      $.support.transition &&
      (($active.length && $active.hasClass('fade')) ||
        !!container.find('> .fade').length);
    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
        .attr('aria-expanded', false);
      element
        .addClass('active')
        .find('[data-toggle="tab"]')
        .attr('aria-expanded', true);
      if (transition) {
        element[0].offsetWidth;
        element.addClass('in');
      } else {
        element.removeClass('fade');
      }
      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
          .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
          .attr('aria-expanded', true);
      }
      callback && callback();
    }
    $active.length && transition
      ? $active
          .one('bsTransitionEnd', next)
          .emulateTransitionEnd(Tab.TRANSITION_DURATION)
      : next();
    $active.removeClass('in');
  };
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tab');
      if (!data) $this.data('bs.tab', (data = new Tab(this)));
      if (typeof option == 'string') data[option]();
    });
  }
  var old = $.fn.tab;
  $.fn.tab = Plugin;
  $.fn.tab.Constructor = Tab;
  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this;
  };
  var clickHandler = function (e) {
    e.preventDefault();
    Plugin.call($(this), 'show');
  };
  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
})(jQuery);

// TODO: some of this can definitely be removed soon.
(function () {
  function getAnchorPositions(e) {
    return e.map(function (e) {
      return e.getBoundingClientRect().top;
    });
  }

  function getActiveAnchor(e) {
    return (
      e.filter(function (e) {
        return 100 >= e;
      }).length - 1
    );
  }

  function getArrayFrom(e) {
    return Array.from(document.querySelectorAll(e));
  }

  function removeClasses(e, t) {
    e.forEach(function (e) {
      e.classList.remove(t);
    });
  }

  function setActiveAnchor(e, t) {
    removeClasses(t, 'active'),
      t[e] &&
        (t[e].parentElement.setAttribute(
          'data-active',
          t[e].getAttribute('data-value'),
        ),
        t[e].classList.add('active'));
  }

  function setLoggedIn() {
    $('.customers-only').show(),
      $('.noncustomers-only').hide(),
      $(document.body).addClass('loggedin');
  }

  function setLoggedOut() {
    $(document.body).removeClass('loggedin'),
      $('.customers-only').hide(),
      $('.noncustomers-only').show();
  }

  function getUrlVars(e) {
    var t = {},
      n = decodeURIComponent(e),
      i = n.substr(1).split('&');
    return (
      i.forEach(function (e) {
        var n = e.split('=');
        t[n[0]] = n[1];
      }),
      t
    );
  }

  function urlifyTrackingParams() {
    var e = '',
      t = [
        'gclid',
        'utm_source',
        'utm_medium',
        'utm_term',
        'utm_content',
        'utm_campaign',
        'initial_referrer',
        'current_referrer',
      ];
    return (
      t.forEach(function (t) {
        var n = Cookies.get(t);
        e.length < 1 ? (e += '?' + t + '=' + n) : n && (e += '&' + t + '=' + n);
      }),
      e
    );
  }

  function appendUTMs() {
    var e = document.querySelectorAll('[data-append-utms]'),
      t = urlifyTrackingParams();
    e.forEach(function (e) {
      e.href += t;
    });
  }
})();
