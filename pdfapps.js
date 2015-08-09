var casper = require('casper').create({
    verbose: true,
    //logLevel: "debug",
    clientScripts: ["lib/jquery-1.11.0.min.js", "lib/jquery.autogrow-textarea.js", "lib/jquery.autosize.input.js"]
});
var fs = require('fs');
var date = new Date();
var dateString = ("0" + (date.getMonth() + 1).toString()).substr(-2) + "-" + ("0" + date.getDate().toString()).substr(-2)  + "-" + date.getFullYear();
var fname = dateString + '_attempted.log';
var error_file = dateString + '_failed.log';

casper.options.pageSettings = {
    userName: 'open',
    password: 'sesame'
};
casper.options.waitTimeout = 20000;

//pull args from commandline
var _adminUser = casper.cli.get('user');
var _adminPass = casper.cli.get('password');
var _baseURL = casper.cli.get('siteurl'); //no slash

var _appID = casper.cli.get('appid');
var _saveCapturePath = casper.cli.get('savepath');


var _loginPath = '/user';
var _loginURL = _baseURL + _loginPath;
var _thenStartPath = '/application/' + _appID;

casper.pghDebug = function(text, status) {

    console.log(text);
    try {
        fs.write(fname, text, 'a');
    } catch(e) {
        console.log(e);
    }
    if (status == 'failed') {
        try {
            fs.write(error_file, text, 'a');
        } catch (e) {
            console.log(e);
        }
    }

}

//Tweak the page for printing
casper.pghAlterPage = function() {
    this.evaluate(function () {
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
                //Todo: Hide client side console messages
                console.log(index + ": " + span.text() + " length " + text.length + " hide it");
                questioncomment.hide();
                questioncomment.css("display", "none !important;");
            } else {
                //Todo: Hide client side console messages
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


    });
};

//Get the location, so we use it to save the page
casper.pghGetPageTitle = function()  {
    return this.evaluate(function () {
        return $("#category-title-raw").text();
    });
};

//Grab a screenshot, and save as pdf (same as png, just add pdf extension
casper.pghCapturePage = function(page_name) {
    this.pghDebug(_appID + '\tCapturing page ' + page_name + '\t[successful]\n');
    this.capture(_saveCapturePath + '/' + _appID + '/generated_pdfs/' + page_name + '.pdf', undefined, {
        format: 'pdf',
        quality: 20
    });
};

//Look for next page button, click if found
casper.pghNextPage = function() {
    var nextLink = ".next a";
    if (this.visible(nextLink)) {
        this.pghDebug(_appID + '\tFound next page link.' + '\t[successful]\n');
        this.thenClick(nextLink);
        this.then(this.pghGetApplicationPages);
    } else {
        //must be done, no more selectors to click
        this.pghDebug(_appID + '\tNo more pages to process. End.\t[successful]\n');
        this.exit();
    }
};

//Process each application page
casper.pghGetApplicationPages = function() {
    var pagetitle = this.pghGetPageTitle();
    this.pghAlterPage();
    this.wait(2000);
    casper.waitForSelector('#question-load-done', function then() {
        this.pghCapturePage(pagetitle);
        this.wait(2000);
        this.pghNextPage();
    }, function timeout() {
        this.pghDebug(_appID + '\tmissing question-load-done' + '\t[failed]\n', 'failed');
    }, 60000);


};

//login page
casper.start(_loginURL, function () {

    this.waitForSelector('form#user-login', function () {
            this.fill('form#user-login', {
                name: _adminUser,
                pass: _adminPass
            }, false);
            this.click('button#edit-submit.form-submit');
            this.wait(2000);
            this.pghDebug(_appID + '\tlogin complete' + '\t[successful]\n');
        }, function timeout() { // step to execute if check has failed
            this.pghDebug(_appID + '\tTimed out trying to get to login' + '\t[failed]\n','failed');
            this.exit();
        }, 10000
    );
});

//Set the paper size for screenshots
casper.page.paperSize = {
    height: '11in', width: '8.5in', orientation: 'portrait', margin: '0.4in',
    footer: {
        height: "0.9in",
        contents: phantom.callback(function (pageNum, numPages) {
           // if (pageNum == numPages) {
           //     return "";
           // }
            return '<p style="font-size: .8em; text-align:center; padding-top: 50px;">PDF created on ' + dateString + '. Page ' + pageNum + ' of ' + numPages + '.</p>';
        })
    }

};


//Load the application before we begin looking for pages.
casper.thenOpen(_baseURL + _thenStartPath, function (response) {
    if (response['status'] === 200) {
        this.pghDebug(_appID + '\tApplication reached with response ' + response['status'] + '\t[successful]\n');

        //Then loop over all pages of the application to capture pdfs
        this.then(casper.pghGetApplicationPages);

    } else {
        this.pghDebug(_appID + '\tLoading page failed with response ' + response['status'] + '\t[failed]\n','failed');
        this.exit();
    }

});


casper.run();