#!/bin/sh
#
# This file is part of webaid.  webaid is free software: you can
# redistribute it and/or modify it under the terms of the GNU General Public
# License as published by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright (C) Jason Han han_min(at)hotmail.com
#

set -f

export PATH=`dirname $0`/../bin:`dirname $0`/../script:$PATH

BASE_DIR=/home/jason/WebstormProjects/adblock/server

DATA_DIR=$BASE_DIR/etc/rules
CONF_FILE=$BASE_DIR/etc/config
HOSTS_FILE=$BASE_DIR/etc/hosts.txt
MWS_FILE=$BASE_DIR/etc/mws.txt
GFW_FILE=$BASE_DIR/etc/gfw.txt
JSON=$BASE_DIR/script/JSON.sh
COMMIT_DIR=$BASE_DIR/etc/_rules
ADP_BLOCK=$BASE_DIR/etc/block.action
ADP_UNBLOCK=$BASE_DIR/etc/unblock.action
BLACK_LIST=$BASE_DIR/etc/blacklist.action
WHITE_LIST=$BASE_DIR/etc/whitelist.action

usage() {
echo
echo "Usage: $0 start"
echo "Usage: $0 stop"
echo "Usage: $0 gfw"
echo "Usage: $0 mws"
echo "Usage: $0 commit"
echo "Usage: $0 reset"
echo "Usage: $0 save config.json"
echo "Usage: $0 read"
echo "Usage: $0 help"
echo
echo "start	- Start adblock service."
echo "stop  - Stop adblock service."
echo "gfw   - Refresh Great FireWall list."
echo "mws   - Refresh Malicious Web Sites list."
echo "save  - Save the JSON format configuration file."
echo "read  - Read the JSON format configuration file."
echo "help  - This help text."
echo
}

parse_options() {
set -- "$@"
while [ $# -ne 0 ]
do
	case $1 in
		help)	usage
				exit 0
		;;
		read)	read_conf
				exit 0
		;;
		save)	shift
				save_conf $@
				exit 0
		;;
		start)	start_service
				exit 0
		;;
		stop)	stop_service
				exit 0
		;;
		commit)	commit_changes
				exit 0
		;;
		reset)	reset_changes
				exit 0
		;;
		apply)	apply
				exit 0
		;;
		gfw)	gfw_refresh
				exit 0
		;;
		mws)	mws_refresh
				exit 0
		;;
		?*)	echo "ERROR: Unknown option."
			usage
			exit 1
		;;
	esac
	shift
done
}

save_conf() {
	echo $1 |base64 -d |$JSON -b > $CONF_FILE
	echo $2 |base64 -d > $HOSTS_FILE
	_commit_changes
	echo '{}' |base64
}

from_conf() {
	cat $CONF_FILE |xargs -n 1 echo "local "
}

read_conf() {
	eval `from_conf`
	(echo -n '{"config":'
	echo -n '{"enable":'${enable:-"1"}',"port":'${port:-"8118"}',"urlad":'${urlad:-"1"}',"videoad":'${videoad:-"1"}',"iqiyi":'${iqiyi:-"1"}',"ku6":'${ku6:-"1"}',"letv":'${letv:-"1"}',"sohu":'${sohu:-"1"}',"youku":'${youku:-"1"}',"dnsov":'${dnsov:-'0'}',"mws":'${mws:-"0"}',"proxy":'${proxy:-"0"}',"fwd":'${fwd:-"0"}',"gfw":'${gfw:-"0"}',"gfwtunnel":'${gfwtunnel:-"1080"}',"gfwdns":'${gfwdns:-"5353"}',"gfwupdate":'${gfwupdate:-"`date +%s`000"}',"trans":'${trans:-"1"}'}'
	echo -n ',"hosts":['
	cat $HOSTS_FILE |grep -v '^#' |grep -v '^$'|awk '
	BEGIN {
		notfirstline=0;
	}
	{
		if (notfirstline) {
			printf ",";
		}

		printf "{\"ip\":\"%s\",\"host\":\"%s\"}", $1, $2;
		notfirstline=1;
	}'
	echo -n ']}') |base64
}

mws_refresh() {
	curl -s -o- http://dn-mwsl-hosts.qbox.me/hosts.txt |grep '^[0-9]' > $MWS_FILE
	echo '{}' |base64
}

build_block() {
cat - |sed -n -e '
	/^!/d;
	/!-/d;
	/#@\?#/d;
	/\$s[^c]/d;
	/^@@/d;
	/domain=[^~]/d;
	/^[^0-9a-zA-Z]*$/d;
	s@[^\w]$@@g;
	s@^\([^|/]\)@/*\1@;
	s@^|http:/\+@@;
	s@^||@@;
	s@\$..*@@;
	s@^\([^/\^]*\)[\^]@\1/@;
	s@^\*\+@@;
	s@|$@$@;
	s@\*$@@;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\*@(.*)@g;
	s@?@\\?@g;
	p;
	'
}

build_unblock() {
cat - |sed -n -e '
	/^!/d;
	/!-/d;
	/#@\?#/d;
	/\$s[^c]/d;
	/^[^@][^@]/d;
	/domain=/d;
	/\$~third-party/d;
	/^[^0-9a-zA-Z]*$/d;
	s@[^\w]$@@g;
	s/^@@//g;
	s@^\([^|/]\)@/*\1@;
	s@^|http:/\+@@;
	s@^||@@;
	s@\$..*@@;
	s@^\([^/\^]*\)[\^]@\1/@;
	s@^\*\+@@;
	s@|$@$@;
	s@\*$@@;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\(/[^\\]*\)\.@\1\\.@g;
	s@\*@(.*)@g;
	s@?@\\?@g;
	p;
	'
}

_commit_changes() {
	echo "Calling commit changes "$@ >&2
	find ${COMMIT_DIR} -type f -exec rm {} \; > /dev/null 2>&1
	tar -C ${DATA_DIR} -cf - . |tar -C ${COMMIT_DIR} -xf - > /dev/null 2>&1
}

reset_changes() {
	echo "Calling reset changes "$@ >&2
	find ${DATA_DIR} -type f -exec rm {} \; > /dev/null 2>&1
	tar -C ${COMMIT_DIR} -cf - . |tar -C ${DATA_DIR} -xf - > /dev/null 2>&1
	echo '{}' |base64
}

from_json() {
	cat - |$JSON -b |xargs -n 1 echo "local "
}

apply() {
	echo "{ +block{ADP_BLOCK} }" > ${ADP_BLOCK}
	echo "{ -block{ADP_UNBLOCK} }" > ${ADP_UNBLOCK}

	echo "{ +block{BLACK_LIST} }" > ${BLACK_LIST}
	echo "{ -block{WHITE_LIST} }" > ${WHITE_LIST}

	find ${COMMIT_DIR} -type f -name "*.adp" |while read item; do
		cat ${item%.*}.txt |build_block >> ${ADP_BLOCK}
		cat ${item%.*}.txt |build_unblock >> ${ADP_UNBLOCK}
	done

	find ${COMMIT_DIR} -type f -name "*.pvb" |while read item; do
		cat ${item%.*}.txt >> ${BLACK_LIST}
	done

	find ${COMMIT_DIR} -type f -name "*.pvu" |while read item; do
		cat ${item%.*}.txt >> ${WHITE_LIST}
	done

	webaid restart & > /dev/null 2>&1
	echo "{}" |base64
}
parse_options $@
