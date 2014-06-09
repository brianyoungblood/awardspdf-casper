#!/bin/bash

savepath=/screencaptures/application
scripthome=/awardspdf-casper

apps=($1)
for app in "${apps[@]}"
do
echo "---- Starting application/$app -----"

zipfile="$savepath/$app/$app.zip"
if [[ -f $zipfile ]]; then
    echo "File $zipfile found - skip!"
else
echo "File $zipfile not found!"
	casperjs clickwhilenext.js "/application/$app"
	cd $savepath/$app
	zip $app.zip *
	ls -lah $savepath/$app
	cd $scripthome

fi

done
