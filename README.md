awardspdf-casper
================

Description:

Logins into drupal, goes to the startpath and looks for '.next a' and continues to capture pages and click next until '.next a' is not find.

Install:

casperjs, phantomjs (note, bug in os x version of phantomjs that doesn't show checkboxes/radios on forms in captures)

Edit:
script has several areas that needs editing for environment

run:
```
casperjs clickwhilenext.js [startpath]
```
