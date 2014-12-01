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
COMMIT_DIR=$BASE_DIR/etc/_rules
JSON=$BASE_DIR/script/JSON.sh

usage() {
echo
echo "Usage: $0 -a ruleObj.json"
echo "Usage: $0 -u ruleObj.json"
echo "Usage: $0 -t ruleId.json"
echo "Usage: $0 -d ruleId.json"
echo "Usage: $0 -f ruleId.json"
echo "Usage: $0 -l"
echo "Usage: $0 -c"
echo "Usage: $0 -r"
echo
echo "-a ruleObj.json - Add a new rule. ruleObj.json is encoded by base64-utf8."
echo "-u ruleObj.json - Update and refresh a existed rule. ruleObj.json is"
echo "                  encoded by base64-utf8."
echo "-t ruleId.json - Return the rule text. Text field is encoded by base64-utf8"
echo "-d ruleId.json - Delete the rule by given id"
echo "-f ruleId.json - Flip the enabled flag by given rule id"
echo "-l - List all rules"
echo "-c - Commit the changes"
echo "-r - Abort all changes and reset to the formal value."
echo "-h - This help text."
echo
}

parse_options() {

#Debug Begin
#echo "\nCalling: "$0 $@ >&2
#echo -n "Decoded: " >&2
#echo $2 |base64 -d >&2
#Debug End

set -- "$@"
while [ $# -ne 0 ]
do
	case $1 in
		-h)	usage
			exit 0
		;;
		-a) shift
			add_rule $@
			exit 0
		;;
		-u) shift
			add_rule $@
			exit 0
		;;
		-d)	shift
			delete_rule $@
			exit 0
		;;
		-t)	shift
			text_rule $@
			exit 0
		;;
		-f)	shift
			flip_rule $@
			exit 0
		;;
		-l)	list_rules
			exit 0
		;;
		-c)	commit_changes
			exit 0
		;;
		-r)	reset_changes
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

write_rule() {
	echo '{"id":'$1',"enabled":'$2',"name":'$3',"type":'$4',"online":'$5',"url":'$6',"count":'$7',"date":'$8',"priority":0}'
}

from_json() {
	cat - |$JSON -b |xargs -n 1 echo "local "
}

write_ad_rule() {
	echo '{"id":'$1',"enabled":'$2',"name":'$3',"type":'$4',"online":'$5',"url":'$6',"count":'$7',"date":'$8',"priority":0}'
}

write_proxy_rule1() {
	echo -n '{"id":'$1',"enabled":'$2',"name":'$3',"type":'$4',"server":'$5',"serverPort":'$6',"localPort":'$7',"userName":'$8',"password":'$9','
}

write_proxy_rule2() {
	echo '"method":'$1',"tunnelServer":'$2',"tunnelServerPort":53,"tunnelLocalPort":'$3',"priority":0}'
}

write_fwd_rule() {
# {id: '1', enabled: true, name: 'porn', type: 'fwd', proxyType: 'socks5', tunnelPort: 1080, dnsPort: 5353, count: 1000, date: 222222222222},
	echo '{"id":'$1',"enabled":'$2',"name":'$3',"type":'$4',"proxyType":"socks5","tunnelPort":'$5',"dnsPort":'$6',"count":'$7',"date":'$8',"priority":0}'
}

add_rule() {
	eval `echo $1 |base64 -d |from_json`
	#local id=${id:-`date +%s|md5sum|grep -o '^[^ ]*'`}
	local id=${id:-`date +%s`}
	local date=`date +%s`"000" # Need to improve later.

	find ${DATA_DIR} -name "$id.*" -exec rm {} \;

	local dataFile=`echo $2 |base64 -d`
	cat $dataFile |base64 -d > ${DATA_DIR}/$id.txt
	rm $dataFile

	case $type in
		adp|pvb|pvu)
			if $online; then
				curl -s -k -o- $url |grep -v '^$' > ${DATA_DIR}/$id.txt
			fi
			if [ `tail -1c ${DATA_DIR}/$id.txt |wc -l` -eq 0 ]; then
					echo >> ${DATA_DIR}/$id.txt
			fi
			local count=`cat ${DATA_DIR}/$id.txt|wc -l`

			write_ad_rule '"'$id'"' ${enabled:-"true"} '"'$name'"' '"'$type'"' ${online:-"true"} '"'$url'"' ${count} $date > ${DATA_DIR}/$id.$type
		;;
		sss|ssh)
			write_proxy_rule1 '"'$id'"' ${enabled:-"true"} '"'$name'"' '"'$type'"' '"'$server'"' ${serverPort:-"null"} ${localPort:-"null"} '"'$userName'"' '"'$password'"' > ${DATA_DIR}/$id.$type
			write_proxy_rule2 '"'$method'"' '"'$tunnelServer'"' ${tunnelLocalPort:-"null"} >> ${DATA_DIR}/$id.$type
		;;
		fwd)
			local count=`cat ${DATA_DIR}/$id.txt|wc -l`
			write_fwd_rule '"'$id'"' ${enabled:-"true"} '"'$name'"' '"'$type'"' ${tunnelPort:-"null"}  ${dnsPort:-"null"} $count $date >  ${DATA_DIR}/$id.$type
		;;
		*)
			echo "Unknow rule type: "$type >&2
			exit 1
		;;
	esac

	cat ${DATA_DIR}/$id.$type |base64
}

_list_rules() {
	echo -n '{"rules":['

	local notFirstLine=false

	find ${DATA_DIR} -type f |grep -v '\.txt$' |grep -v '\.swp$'|while read item; do
		if $notFirstLine; then
			echo -n ','
		fi
		cat $item
		notFirstLine=true;
	done
	echo ']}'
}

list_rules() {
	_list_rules |base64
}

#{"id":"1234",skip=n}
text_rule() {
	eval `echo $1 |base64 -d |from_json`
	local size=`wc -c ${DATA_DIR}/$id.txt |grep -o '^[0-9]\+'`
	local content=`dd if=${DATA_DIR}/$id.txt bs=2048 count=1 skip=${skip:-"0"} 2>/dev/null |base64 -w0`
	local offset=`expr ${skip:-"0"} + 2048`
	if [ $size -lt $offset ]; then
		offset=$size
	fi

	echo '{"offset":'$offset',"size":'$size',"bs":2048,"text":"'$content'"}' |base64
}

delete_rule() {
	eval `echo $1 |base64 -d |from_json`
	find ${DATA_DIR} -name "$id.*" -exec rm {} \;
	echo '{"id":"'$id'"}' |base64
}

flip_rule() {
	eval `echo $1 |base64 -d |from_json`
	local rulefile=`find ${DATA_DIR} -name "$id.*" |grep -v '\.txt$'`

	eval `cat $rulefile |from_json`

	if $enabled; then
		enabled=false
	else
		enabled=true
	fi

	case $type in
		adp|pvb|pvu)
			write_ad_rule '"'$id'"' ${enabled:-"true"} '"'$name'"' '"'$type'"' ${online:-"true"} '"'$url'"' ${count} $date > ${DATA_DIR}/$id.$type
		;;
		sss|ssh)
			write_proxy_rule1 '"'$id'"' ${enabled:-"true"} '"'$name'"' '"'$type'"' '"'$server'"' ${serverPort:-"65535"} ${localPort:-"65535"} '"'$userName'"' '"'$password'"' > ${DATA_DIR}/$id.$type
			write_proxy_rule2 '"'$method'"' '"'$tunnelServer'"' ${tunnelLocalPort:-"65535"} >> ${DATA_DIR}/$id.$type
		;;
		fwd)
			local count=`cat ${DATA_DIR}/$id.txt|wc -l`
			write_fwd_rule '"'$id'"' ${enabled:-"true"} '"'$name'"' '"'$type'"' ${tunnelPort:-"65535"}  ${dnsPort:-"53"} ${count} $date >  ${DATA_DIR}/$id.$type
		;;
		*)
			echo "Unknow rule type: "$type >&2
			exit 1
		;;
	esac
	cat ${DATA_DIR}/$id.$type |base64
}

parse_options "$@"
