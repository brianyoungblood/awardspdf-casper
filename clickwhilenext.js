var casper = require('casper').create({
    verbose: true,
    logLevel: "debug",
    clientScripts: ["lib/jquery-1.11.0.min.js","lib/jquery.autogrow-textarea.js"],
    viewportSize: {
        width: 2000,
        height: 768
    }
});

var _adminUser = '';
var _adminPass = '';
var _baseURL = 'http://localhost:8080'; //no slash
var _loginPath = '/user';

var _thenStartPath = casper.cli.get(0);
var _saveCapturePath = '.'; //no slash

var _loginURL = _baseURL + _loginPath;




casper.clickWhileSelector = function(selector) {
    return this.then(function() {
           var current_page = casper.evaluate(function() {
                $('#memcache-devel').hide();
                $('.question-admin').hide();
                $('#block-devel-switch-user').hide();
                $('.form-textarea').css('overflow', 'hidden').autogrow();
                return window.location.pathname.split("/").pop();
                

            });

            casper.capture(_saveCapturePath + _thenStartPath + '/' + current_page + '.pdf');
        if (this.exists(selector)) {

            this.click(selector);
            return this.clickWhileSelector(selector);
        }
        return this.echo('Done.').exit();
    });
}

//login page
casper.start(_loginURL, function() {
    this.fill('form#user-login', {
        name: _adminUser,
        pass: _adminPass
    }, true);
});

//Find the applications here
casper.thenOpen(_baseURL + _thenStartPath, function() {

    });


casper.clickWhileSelector('.next a').run();