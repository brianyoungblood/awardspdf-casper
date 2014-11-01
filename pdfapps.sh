#!/bin/bash

savepath=/var/www/awards.practicegreenhealth.org/htdocs/sites/default/files/private/application
scripthome=`pwd`
username=''
password=''
siteurl='https://awards.practicegreenhealth.org'

apps=($1)
for app in "${apps[@]}"
do
echo "---- Starting application/$app -----"

zipfile="$savepath/$app/generated_pdfs/all_pages.zip"

if [[ -f $zipfile ]]; then
    echo "File $zipfile found - skip!"
        cd $savepath/$app/generated_pdfs
        ls -lah .
        cd $scripthome
else
echo "File $zipfile not found."
casperjs pdfapps.js --user=$username --password=$password --siteurl="$siteurl" --appid=$app --savepath="$savepath"
        cd $savepath/$app/generated_pdfs
        zip all_pages.zip *
        ls -lah .
        cd $scripthome

fi

done
