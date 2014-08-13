#!/bin/bash

savepath=application
scripthome=`pwd`
username=''
password=''
siteurl='http://localhost'

apps=($1)
for app in "${apps[@]}"
do
echo "---- Starting application/$app -----"

zipfile="$savepath/$app/$app.zip"

if [[ -f $zipfile ]]; then
    echo "File $zipfile found - skip!"
        cd $savepath/$app
        ls -lah .
        cd $scripthome
else
echo "File $zipfile not found."
casperjs clickwhilenext.js --user=$username --password=$password --siteurl="$siteurl" --appid=$app --savepath="$savepath"
        cd $savepath/$app
        zip $app.zip *
        ls -lah .
        cd $scripthome

fi

done