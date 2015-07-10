#!/bin/bash

scripthome=`pwd`

while [[ $# -gt 0 ]] && [[ ."$1" = .--* ]] ;
do
    opt="$1";
    shift;              #expose next argument
    case "$opt" in
        "--" ) break 2;;
        "--username" )
           username="$1"; shift;;
		"--username="* )     # alternate format: --username=sss
           username="${opt#*=}";;

        "--password" )
           password="$1"; shift;;
       	"--password="* )
           password="${opt#*=}";;

        "--savepath" )
           savepath="$1"; shift;;
		"--savepath="* )     # alternate format: --savepath=xxx
           savepath="${opt#*=}";;

        "--siteurl" )
           siteurl="$1"; shift;;
       	"--siteurl="* )
           siteurl="${opt#*=}";;

        "--nids" )
           nids="$1"; shift;;
       	"--nids="* )
           nids="${opt#*=}";;

        "--recreate" )
           sflag=true;;
        *) echo >&2 "Invalid option: $@"; exit 1;;
   esac
done
nids=($nids)
for app in "${nids[@]}"
do
echo "---- Starting application/$app -----"

zipfile="$savepath/$app/generated_pdfs/all_pages.zip"

if [[ "$sflag" = true ]] ; then
    echo "Removing $savepath/$app/generated_pdfs/all_pages.zip"
    rm -vf $savepath/$app/generated_pdfs/all_pages.zip
fi

if [[ -f $zipfile ]]; then
    echo "File $zipfile found - skip!"
        cd $savepath/$app/generated_pdfs
        ls -lah .
        cd $scripthome
        echo "skipping $app" >> attempted.log
else
echo "File $zipfile not found."

if [[ ! -e $savepath/$app/generated_pdfs ]]; then
    mkdir -p $savepath/$app/generated_pdfs
elif [[ ! -d $savepath/$app/generated_pdfs ]]; then
    echo "$savepath/$app/generated_pdfs already exists but is not a directory" 1>&2
fi

casperjs --ssl-protocol=any pdfapps.js --user=$username --password=$password --siteurl="$siteurl" --appid=$app --savepath="$savepath"
        cd $savepath/$app/generated_pdfs
        zip all_pages.zip *
        ls -lah .
        cd $scripthome
        echo "attempting $app" >> attempted.log
fi

done