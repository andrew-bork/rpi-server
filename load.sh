#!/bin/sh

rm -rf *

git clone https://github.com/andrew-bork/rpi-server/

mkdir client
mv rpi-server/client/* client
mv rpi-server/* .

rm -rf rpi-server
