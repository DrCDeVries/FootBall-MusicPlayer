#!/bin/bash     
echo Add Node.JS 16 repo
curl -sSL https://deb.nodesource.com/setup_16.x | sudo bash -
echo Install Node.JS
catsudo apt install -y nodejs

sudo mkdir /opt/de
sudo chown $(id -u):$(id -g) /opt/de
sudo useradd -m musicplayer
sudo groupadd musicplayer
sudo usermod -a -G audio musicplayer
sudo usermod -a -G musicplayer $(id -u -n)
newgrp musicplayer
mkdir /opt/de/musicplayer
mkdir /opt/de/appdata
mkdir /opt/de/appdata/musicplayer
sudo chown musicplayer:musicplayer /opt/de/appdata/musicplayer
sudo chmod g+rw /opt/de/appdata/musicplayer
sudo chown musicplayer:musicplayer /opt/de/musicplayer
sudo chmod g+rw /opt/de/musicplayer

mkdir /opt/de/appdata/musicplayer/config
mkdir /opt/de/appdata/musicplayer/data
mkdir /opt/de/appdata/musicplayer/logs

sudo chown musicplayer:musicplayer /opt/de/appdata/musicplayer/config
sudo chown musicplayer:musicplayer /opt/de/appdata/musicplayer/data
sudo chown musicplayer:musicplayer /opt/de/appdata/musicplayer/logs

cd /opt/de/musicplayer
echo downloading latest version of code
curl -s https://api.github.com/repos/drcdevries/football-musicplayer/releases/latest | sed -n 's/.*"tarball_url": "\(.*\)",.*/\1/p' | xargs -n1 wget -O - -q | tar -xz --strip-components=1
npm install
sudo cp /opt/de/musicplayer/install/raspberrypi/service/musicplayer.service /lib/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start musicplayer
sudo systemctl enable musicplayer
#Change musicplayer user Password
#sudo passwd musicplayer
#Set Musicplayer Bash Sell
#sudo chsh -s /bin/bash musicplayer
#Change to musicplayer User
#su musicplayer
#Set MusicPlayer Bash
#
#Test Config do this as MusicPlayer after su musicplayer
# DEBUG=app, CONFIGDIRECTORY=/opt/de/appdata/musicplayer/config DATADIRECTORY=/opt/de/appdata/musicplayer/data LOGDIRECTORY=/opt/de/appdata/musicplayer/logs npm start



sudo apt-get install hostapd
sudo apt-get install dnsmasq
sudo apt-get install bridge-utils

sudo systemctl stop hostapd
sudo systemctl stop dnsmasq

sudo nano /etc/dhcpcd.conf
sudo brctl addbr br0


sudo apt-get install iptables

sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

sudo sh -c "iptables-save > /etc/iptables.ipv4.nat"

sudo iptables-restore < /etc/iptables.ipv4.nat