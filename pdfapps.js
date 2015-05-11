var casper = require('casper').create({
    verbose: true,
    logLevel: "debug",
    clientScripts: ["lib/jquery-1.11.0.min.js", "lib/jquery.autogrow-textarea.js", "lib/jquery.autosize.input.js"],
});

casper.options.pageSettings = {
    userName: 'open',
    password: 'sesame'
};

//pull args from commandline
var _adminUser = casper.cli.get('user');
var _adminPass = casper.cli.get('password');
var _baseURL = casper.cli.get('siteurl'); //no slash

var _appID = casper.cli.get('appid');
var _saveCapturePath = casper.cli.get('savepath');



var _loginPath = '/user';
var _loginURL = _baseURL + _loginPath;
var _thenStartPath = '/application/' + _appID;





casper.clickWhileSelector = function (selector) {
    return this.then(function () {

        //Tweak the page, and get the location, so we use it to save the page
        var current_page = casper.evaluate(function () {
            $('#memcache-devel').hide();
            $('.question-admin').hide();
            $('.comment-form').hide();
            //hide comment boxes if no text found.
            var questioncomment = $('div.question-comment');

            questioncomment.each(function (index) {
                var questioncomment = $(this);
                var span = questioncomment.find('span');
                text = span.text();
                if (text.length === 0) {
                    console.log(index + ": " + span.text() + " length " + text.length + " hide it");
                    questioncomment.hide();
                    questioncomment.css("display", "none !important;");
                } else {
                    console.log(index + ": " + span.text() + " length " + text.length + " keep it");
                }
            });
            $('.glossify-link').css('background-image', 'none').css('padding-right', '0px');
            $('#block-devel-switch-user').hide();
            $('.messages--warning.messages.warning').hide();
            $('.messages--error').hide();
            $('.question-debug-info').hide();
            $('.form-textarea').css('overflow', 'hidden').autogrow();
            $('.form-text').css('max-width', '960px').autosizeInput();
            return $("#category-title-raw").text();

        });
        this.waitUntilVisible('.print-page',
                function loaded() {
                    console.log('Looks like .print-page is there');
                    this.wait(2000);
                    //Grab a screenshot, and save as pdf (same as png, just add pdf extension
                    casper.capture(_saveCapturePath + '/' + _appID + '/generated_pdfs/' + current_page + '.pdf', undefined, {
                        format: 'pdf',
                        quality: 20
                    });

                    //if we see selector, click again
                    this.wait(5000);
                    if (this.exists(selector)) {
                        this.click(selector);
                        return this.clickWhileSelector(selector);
                    }
                    //must be done, no more selectors to click
                    return this.echo('Done.').exit();
                },
                function timeout() { // step to execute if check has failed
                    console.log('Could not load element .print-page').exit();
                }
        ), 5000;


    });
}

//login page
casper.start(_loginURL, function () {
    this.waitForSelector('form#user-login', function () {

        console.log('Found login');
        this.fill('form#user-login', {
            name: _adminUser,
            pass: _adminPass
        }, false);
        this.wait(2000);
        this.click('button#edit-submit.form-submit');

    }, function timeout() { // step to execute if check has failed
        this.echo("Timed out trying to get to " + _loginURL).exit();
    }, 10000
            );
});

//Set the paper size for screenshots
casper.page.paperSize = {
    height: '11in', width: '8.5in', orientation: 'portrait', border: '0.4in',
//  header: {
//    height: "1.2cm",
//    contents: phantom.callback(function(pageNum, numPages) {
//      return '<img src="" height="0.95cm"/>';
//    })
//  },
//  footer: {
//    height: "0.7cm",
//    contents: phantom.callback(function(pageNum, numPages) {
//      return '<p class="footer-wrap">Copyrighted by xxx. Page ' + pageNum + ' of ' + numPages + '</p>';
//    })
//  }
}



//Find the applications here
casper.thenOpen(_baseURL + _thenStartPath, function (response) {
    if (response['status'] === 200) {
        console.log('On first page of application. Response ' + response['status']);
        this.clickWhileSelector('.next a');
    } else {
        console.log('Error ' + response['status'] + ' url ' + _baseURL + _thenStartPath);
    }

});


casper.run();
