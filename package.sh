#!/usr/bin/bash

rm dist -r
mkdir dist
rm jst/templates.js
tmpl jst jst
mv jst/templates.js .

for i in *.js
do
	uglifyjs $i 1>dist/$i;
done;

cp index.html dist/
cp *.png dist/
cp *.gif dist/
cp *.txt dist/
cp *.css dist/
cp manifest.json dist/

