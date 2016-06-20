    // this function mimics the undefined keyword but works with older versions of IE too
    function isUndefined(v) {
        var undef;
        return v===undef;
    }

    var _DEFAULT_POPUP_FEATURES = 'location=0, statusbar=0, menubar=0, width=400, height=300';

    // this function should typically only be accessed from link_popup
    // if features is blank, it uses the default popup features
    function rawPopup(url, target, features) {
        if (isUndefined(features)) {
            features = _DEFAULT_POPUP_FEATURES;
        }
        if (isUndefined(target)) {
            target = '_blank';
        }
        var theWindow = window.open(url, target, features);
        theWindow.focus();
        return theWindow;
    }

    // src should be an HTML link tag (A) that has an href defined, and optionally a target
    function linkPopup(src, features) {
        return rawPopup(src.getAttribute('href'), src.getAttribute('target') || '_blank', features);
    }

    // uses the src parameter to determine target and href
    function helpPopup(src) {
        var features = 'resizable=1,status=1,scrollbars=1,width=806,height=500,left=100,top=100';
        return rawPopup(src.getAttribute('href'), src.getAttribute('target') || '_blank', features);
    }

    // uses the src parameter to determine target and href
    function settingsPopup(src) {
        var features = 'resizable=1,status=1,scrollbars=1,width=500,height=375,left=100,top=100';
        return rawPopup(src.getAttribute('href'), src.getAttribute('target') || '_blank', features);
    }

    // uses the src parameter to determine target and href
    function printPopup(url) {
        var features = 'resizable=1,status=1,scrollbars=1,width=960,height=719,left=30,top=30';

		url = managePageDynamicUrlParameters(url);

        return rawPopup(url, '_blank', features);
    }

    // uses the src parameter to determine target and href
    function quickViewPopup(src) {
        var features = 'resizable=1,status=1,scrollbars=1,location=1,width=960,height=719,left=10,top=10';
        // IE doesn't like dots in the target, so replace them with underscores

        var href;
        var target;
        if (typeof src == 'string') {
        	href = src;
        	target = '_blank';
        } else {
        	href = src.getAttribute('href');
        	target = src.getAttribute('target') || '_blank';
        }
        return rawPopup(href, target, features);
    }
