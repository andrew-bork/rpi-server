#!/bin/sh

while [ 1 -eq 1 ]
do
  sudo ./$1/load.sh $1
  sudo ./$1/run.sh $1
done
