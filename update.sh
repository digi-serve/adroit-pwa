#!/bin/bash
ssh jduncan@apps.fcfthailand.org 'mkdir /data/www/nodejs/cars/pwa/new'
tar czv www | ssh jduncan@apps.fcfthailand.org 'cat | tar xz -C /data/www/nodejs/cars/pwa/new'
ssh jduncan@apps.fcfthailand.org 'rm -rf /data/www/nodejs/cars/pwa/www'
ssh jduncan@apps.fcfthailand.org 'mv /data/www/nodejs/cars/pwa/new/* /data/www/nodejs/cars/pwa/.'
scp version.txt jduncan@apps.fcfthailand.org:/data/www/nodejs/cars/pwa
ssh jduncan@apps.fcfthailand.org 'rm -rf /data/www/nodejs/cars/pwa/new'
