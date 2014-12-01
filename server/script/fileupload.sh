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
JSON=$BASE_DIR/script/JSON.sh

from_json() {
	cat - |$JSON -b |xargs -n 1 echo "local "
}


main() {
	eval `echo $1 |base64 -d |from_json`
	echo $key"Upload Start" >> /tmp/debug
	echo  $2 |base64 -d >> /tmp/$key.upload
	local size=`wc -c /tmp/$key.upload |grep -o '^[0-9]\+'`
	echo '{"path":"/tmp/'$key'.upload","size":'$size'}' |base64
	echo $key"Upload End" >> /tmp/debug
}

main $@
