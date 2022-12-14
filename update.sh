#!/bin/bash
scp -P 2222 version.txt jduncan@cars.fcfthailand.org:/data/www/nodejs/adroit/assets/pwa
scp -P 2222 -r www jduncan@cars.fcfthailand.org:/data/www/nodejs/adroit/assets/pwa/www-new
ssh jduncan@cars.fcfthailand.org -p2222 "rm -rf /data/www/nodejs/adroit/assets/pwa/www"
ssh jduncan@cars.fcfthailand.org -p2222 "mv /data/www/nodejs/adroit/assets/pwa/www-new /data/www/nodejs/adroit/assets/pwa/www"