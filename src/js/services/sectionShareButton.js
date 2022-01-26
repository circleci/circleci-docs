import { createPopper } from '@popperjs/core';

export const init = () => {
  const showEvents = ['mouseover', 'hover', 'mouseenter', 'focus'];
  const hideEvents = ['mouseout', 'mouseleave', 'blur'];
  const clickEvents = ['click'];
  const tooltip = document.querySelector('.tooltip-popover');
  const headerTags =
    'article h1, article h2, article h3, article h4, article h5, article h6';

  // Give article headings direct links to anchors
  $(headerTags)
    .filter('[id]')
    .each(function () {
      var isMainTitle = $(this).prop('nodeName') === 'H1';
      $(this).append(
        (isMainTitle ? ' <a href="#' : '<a href="#' + $(this).attr('id')) +
          '"><i class="fa fa-link"></i></a>',
      );
      if (isMainTitle) {
        $(this).find('i').toggle();
      }
    });

  const makePopper = (icon) =>
    Object.assign(icon, {
      show() {
        tooltip.setAttribute('data-show', '');
        // change tooltip text based on current button popover.
        tooltip.innerHTML = "Copy link<div id='arrow' data-popper-arrow></div>";
        icon.instance = createPopper(icon, tooltip, {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ],
        });
      },
      copy(event) {
        let url = event.target.href;
        // to account for if section copied and shared is the page title
        let section =
          url.charAt(url.length - 1) === '#'
            ? 'Page Title'
            : url.substring(url.indexOf('#'));
        event.preventDefault();
        navigator?.clipboard
          .writeText(event.target.href)
          .then(() => {
            icon.hide();
            tooltip.setAttribute('data-show', '');
            // change tooltip text based on current button popover.
            tooltip.innerHTML =
              "Copied!<div id='arrow' data-popper-arrow></div>";
            icon.instance = createPopper(icon, tooltip, {
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8],
                  },
                },
              ],
            });
            window.history.pushState({}, document.title, event.target.href);
            window.AnalyticsClient.trackAction('docs-share-button-click', {
              page: location.pathname,
              success: true,
              section,
            });
          })
          .catch((error) =>
            window.AnalyticsClient.trackAction('docs-share-button-click', {
              page: location.pathname,
              success: false,
              error,
            }),
          );
      },
      hide() {
        tooltip.removeAttribute('data-show');
        if (icon.instance) {
          icon.instance.destroy();
          icon.instance = null;
        }
      },
    });

  document.querySelectorAll('.fa-link').forEach((icon) => {
    makePopper(icon);

    showEvents.forEach((event) => {
      icon.parentElement.addEventListener(event, icon.show);
    });

    hideEvents.forEach((event) => {
      icon.parentElement.addEventListener(event, icon.hide);
    });

    clickEvents.forEach((event) => {
      icon.parentElement.addEventListener(event, icon.copy);
    });
  });
};
