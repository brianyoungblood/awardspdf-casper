var casper = require('casper').create({
    verbose: true,
    //logLevel: "debug",
    clientScripts: ["lib/jquery-1.11.0.min.js", "lib/jquery.autogrow-textarea.js", "lib/jquery.autosize.input.js"]
});

var colorizer = require('colorizer').create('Colorizer');


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
    console.log('Capturing page ' + page_name);
    this.capture(_saveCapturePath + '/' + _appID + '/generated_pdfs/' + page_name + '.pdf', undefined, {
        format: 'pdf',
        quality: 20
    });
};

//Look for next page button, click if found
casper.pghNextPage = function() {
    var nextLink = ".next a";
    if (this.visible(nextLink)) {
        console.log('Found the next page');
        this.thenClick(nextLink);
        this.then(this.pghGetApplicationPages);
    } else {
        //must be done, no more selectors to click
        console.log("No more pages to process. End.");
        this.exit();
    }
};

//Process each pplication page
casper.pghGetApplicationPages = function() {
    var pagetitle = this.pghGetPageTitle();
    this.pghAlterPage();
    this.wait(5000);
    console.log(colorizer.colorize("Hello World", "INFO"));
    casper.waitUntilVisible('.print-page', function then() {
        console.log('Looks like .print-page is on ' + pagetitle);
        this.pghCapturePage(pagetitle);
        this.wait(5000);
        console.log('Looking for the next page');
        this.pghNextPage();
    }, function timeout() {
        console.log('Waited on .print-page for too long. Wait again');
        this.then(getApplicationPages);
    }, 15000);


};



//login page
casper.start(_loginURL, function () {

    this.waitForSelector('form#user-login', function () {

            console.log('Landed on login page');
            this.fill('form#user-login', {
                name: _adminUser,
                pass: _adminPass
            }, false);
            this.click('button#edit-submit.form-submit');

        }, function timeout() { // step to execute if check has failed
            this.echo("Timed out trying to get to " + _loginURL).exit();
        }, 10000
    );
});

//Set the paper size for screenshots
casper.page.paperSize = {
    height: '11in', width: '8.5in', orientation: 'portrait', border: '0.4in'
};


/*casper.then(function() {

    //create array of applications to visit
    var appids = ['1637333','1637333'];
    var i;
    //Loop each id to visit, and process each page of the application
    this.each(appids, function() {
        i++; // change the link being opened (has to be here specifically)
        this.thenOpen((_baseURL + '/application/' + appids[i]), function(response) {
            if (response['status'] === 200) {
                console.log('On first page of application. Response ' + response['status']);
                console.log(_baseURL + '/application/' + appids[i]);
                casper.pghGetApplicationPages;

            } else {
                console.log('Error ' + response['status'] + ' url ' + _baseURL + '/application/' + appids[i]);
                return FALSE;
            }
        });
    });
});*/


//Load the application before we begin looking for pages.
casper.thenOpen(_baseURL + _thenStartPath, function (response) {
    if (response['status'] === 200) {
        console.log('On first page of application. Response ' + response['status']);
        casper.pghGetApplicationPages();

    } else {
        console.log('Error ' + response['status'] + ' url ' + _baseURL + _thenStartPath);
        return FALSE;
    }

});

//Then loop over all pages of the application to capture pdfs
//casper.then(casper.pghGetApplicationPages);

casper.run();


/*casper.then(function () {

 this.waitUntilVisible('.print-page',
 function () {
 console.log('Looks like .print-page is there');



 },
 function timeout() { // step to execute if check has failed
 console.log('Could not load element .print-page').exit();
 }
 );
 }*/
