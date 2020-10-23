// Navigation Scripts to Show Header on Scroll-Up
jQuery(document).ready(function($) {
  var MQL = 1170;

  // Primary navigation slide-in effect
  if ($(window).width() > MQL) {
    var headerHeight = $('.navbar-custom').height();

    $(window).on('scroll', { previousTop: 0 }, function() {
      var currentTop = $(window).scrollTop();

      // check if user is scrolling up
      if (currentTop < this.previousTop) {
          // if scrolling up...

          if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
              $('.navbar-custom').addClass('is-visible');
          } else {
              $('.navbar-custom').removeClass('is-visible is-fixed');
          }
      } else if (currentTop > this.previousTop) {
          // if scrolling down...

          $('.navbar-custom').removeClass('is-visible');
          if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) {
           $('.navbar-custom').addClass('is-fixed');
          }
      }

      this.previousTop = currentTop;
    });
  }
});

jQuery(document).ready(function($) {
    $('#math-popover-toggle').popover({
      html: true,
      content: function() {
        return $('#math-popover').html();
      }
    });

    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });

    anchors.options.visible = "always";
    anchors.options.placement = "left";
    anchors.add('h2, h3, h4, h5, h6');
});
