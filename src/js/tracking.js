(function () {


    $(window).load(function () {

        $('.track-hash-click').click(function () {
            var element = $(this);
            if (element && element.length > 0 && element[0].href && element[0].href.indexOf('#') > -1) {
                ga('send', 'event', 'hashlink', 'click', element[0].href);
            }
        });

        $('.track-external-click').click(function () {
            var element = $(this);
            if (element && element.length > 0 && element[0].href) {
                ga('send', 'event', 'externallink', 'click', element[0].href);
            }
        });

    });


})();