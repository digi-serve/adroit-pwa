#!/bin/bash
ssh jduncan@cars.fcfthailand.org -p2222 'mkdir /data/www/nodejs/adroit/assets/pwa/new'
tar czv www | ssh jduncan@cars.fcfthailand.org -p2222 'cat | tar xz -C /data/www/nodejs/adroit/assets/pwa/new'
ssh jduncan@cars.fcfthailand.org -p2222 'rm -rf /data/www/nodejs/adroit/assets/pwa/www'
ssh jduncan@cars.fcfthailand.org -p2222 'mv /data/www/nodejs/adroit/assets/pwa/new/* /data/www/nodejs/adroit/assets/pwa/.'
scp -P 2222 version.txt jduncan@cars.fcfthailand.org:/data/www/nodejs/adroit/assets/pwa
ssh jduncan@cars.fcfthailand.org -p2222 'rm -rf /data/www/nodejs/adroit/assets/pwa/new'
