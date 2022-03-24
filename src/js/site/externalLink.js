export function externalLink() {
    $('#main a')
      .not('.no-external-icon')
      .each(function () {
        if (!this.origin.includes(window.location.origin)) {
          $(this).attr('target', '_blank');
          $(this).attr('rel', 'noopener noreferrer');
          $(this).html(function () {
            var text = $(this).text().split(' ');
            // drop the last word and store it in a variable
            var last = text.pop();
            // join the text back and if it has more than 1 word add the span tag
            // to the last word
            const externalLinksvg = '<span class="external-link-icon"><svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg"><path d="M9.33318 10.6667H1.33318V2.66667H4.66651V1.33333H0.959845C0.699845 1.32667 0.453179 1.42 0.273179 1.6C0.086512 1.77333 -0.00682137 2.02 -0.000154701 2.27333V11.0667C-0.00682137 11.32 0.086512 11.56 0.273179 11.74C0.453179 11.92 0.706512 12.0133 0.959845 12.0067H9.70651C10.2398 12.0067 10.6665 11.5867 10.6665 11.0667V7.33333H9.33318V10.6667ZM9.72651 1.33333H7.33318C6.96651 1.33333 6.66651 1.03333 6.66651 0.666667C6.66651 0.3 6.96651 0 7.33318 0H11.3332C11.6998 0 11.9998 0.3 11.9998 0.666667V4.66667C11.9998 5.03333 11.6998 5.33333 11.3332 5.33333C10.9665 5.33333 10.6665 5.03333 10.6665 4.66667V2.27333L7.91985 5.02C7.65985 5.28 7.23985 5.28 6.97985 5.02C6.71985 4.76 6.71985 4.34 6.97985 4.08L9.72651 1.33333Z" fill="currentColor"></path></svg></span>';
            return (
              text.join(' ') +
              (text.length > 0
                ? "<div class='external-link-tag-wrapper margin-left'>" +
                  last + externalLinksvg +
                  '</div>'
                : "<div class='external-link-tag-wrapper'>" +
                  $(this).text() + externalLinksvg +
                  '</div>')
            );
          });
        }
      });
  }