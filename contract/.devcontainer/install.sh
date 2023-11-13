#!/usr/bin/bash

apt update
apt install -y nodejs npm curl build-essential python3
npm -g install n
n stable
apt -y purge nodejs npm
apt -y autoremove
npm i -g thirdweb 
