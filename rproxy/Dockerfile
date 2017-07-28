FROM haproxy:1.7.8-alpine

# NOTE: Alpine doesn't have a syslog daemon so install one here if you want one
# RUN apk add --no-cache rsyslog
#
# COPY rsyslog.conf /etc/rsyslog.conf

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

# NOTE: In order to start the rsyslog daemon, we need a new ENTRYPOINT (and therefor a new CMD)
# COPY docker-entrypoint.sh /
# ENTRYPOINT ["/docker-entrypoint.sh"]
# CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg"]
