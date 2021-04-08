#!/bin/sh

rm -rf $1/*

git clone https://github.com/andrew-bork/rpi-server/ $1/rpi-server

mkdir $1/client
mv $1/rpi-server/client/* $1/client
mv $1/rpi-server/* $1/.

rm -rf $1/rpi-server

chmod 777 $1/load.sh $1/run.sh
