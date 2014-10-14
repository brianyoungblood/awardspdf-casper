var casper = require('casper').create({
    verbose: true,
    logLevel: "info",
    clientScripts: ["lib/jquery-1.11.0.min.js","lib/jquery.autogrow-textarea.js","lib/jquery.autosize.input.js"],


});



//pull args from commandline
var _adminUser = casper.cli.get('user');
var _adminPass = casper.cli.get('password');
var _baseURL = casper.cli.get('siteurl'); //no slash

var _appID = casper.cli.get('appid');
var _saveCapturePath = casper.cli.get('savepath');



var _loginPath = '/user';
var _loginURL = _baseURL + _loginPath;
var _thenStartPath = '/review/' + _appID + '/readonly';





casper.clickWhileSelector = function(selector) {
    return this.then(function() {

        //Tweak the page, and get the location, so we use it to save the page
        var current_page = casper.evaluate(function() {
                $('#memcache-devel').hide();
                $('.question-admin').hide();
                $('.comment-form').hide();
                $('.glossify-link').css('background-image', 'none').css('padding-right', '0px');
                $('#block-devel-switch-user').hide();
                $('.form-textarea').css('overflow', 'hidden').autogrow();
                $('.form-text').css('max-width', '960px').autosizeInput();
                return window.location.pathname.split("/").splice(-2,1);

            });
  //  if(response['status'] === 200) {

        //Grab a screenshot, and save as pdf (same as png, just add pdf extension
        casper.capture(_saveCapturePath + '/' + _appID + '/generated_pdfs/' + current_page + '.pdf');

        //if we see selector, click again
        if (this.exists(selector)) {
            this.click(selector);
            return this.clickWhileSelector(selector);
        }
  //  } else {

  //  }
        //must be done, no more selectors to click
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
casper.thenOpen(_baseURL + _thenStartPath, function(response) {
    if(response['status'] === 200) {
      console.log('On first page of application. Response ' + response['status']);
       casper.clickWhileSelector('.next a');
    } else {
        console.log('Error ' + response['status']);
    }

    });


casper.run();
