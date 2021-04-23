#!/bin/bash
LAST_RES=""
ffprobe -v error -show_entries frame=width,height -select_streams v -of csv=p=0 $1 |
while read -r line
do
	if [ "$LAST_RES" != "" ]; then
		if [ "$line" != "$LAST_RES" ]; then
			exit 1
		fi
	fi
	LAST_RES="$line"
done
if [ "$?" -eq 0 ]; then
	echo "Video does not crash"
	exit 0
else
	echo "Video does crash"
	exit 1
fi