awardspdf-casper
================

Description:

Logs into drupal, goes to the startpath and looks for '.next a' and continues to capture pages as pdf and click next until '.next a' is not found.

Install:

casperjs, phantomjs (note, bug in os x version of phantomjs that doesn't show checkboxes/radios on forms in captures)

Edit:
script has several areas that needs editing for environment you are on. tested on linux and os x

run:
```
casperjs clickwhilenext.js [startpath]
```

wrapper:
```
clickwhilenext.sh '1234 12345'
```
