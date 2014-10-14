pdfapps
================

Description:

Login to drupal, go to the startpath and look for '.next a' and continue to capture pages as pdf, click next, until '.next a' is not found.

Install:

casperjs, phantomjs (note, bug in os x version of phantomjs that doesn't show checkboxes/radios on forms in captures)

Edit:
script has several areas that needs editing for environment you are on. tested on linux and os x

run:
```
casperjs pdfapps.js --user=[username] --password=[password] --siteurl="[siteurl]" --appid=[appid] --savepath="[startpath]"
```

wrapper:
```
pdfapps.sh '1234 12345'
```
