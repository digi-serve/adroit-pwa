#!/bin/bash
ssh jduncan@apps.fcfthailand.org 'mkdir /data/www/nodejs/cars/pwa/beta/new'
tar czv www | ssh jduncan@apps.fcfthailand.org 'cat | tar xz -C /data/www/nodejs/cars/pwa/beta/new'
ssh jduncan@apps.fcfthailand.org 'rm -rf /data/www/nodejs/cars/pwa/beta/www'
ssh jduncan@apps.fcfthailand.org 'mv /data/www/nodejs/cars/pwa/beta/new/* /data/www/nodejs/cars/pwa/beta/.'
scp version.txt jduncan@apps.fcfthailand.org:/data/www/nodejs/cars/pwa/beta
ssh jduncan@apps.fcfthailand.org 'rm -rf /data/www/nodejs/cars/pwa/beta/new'
