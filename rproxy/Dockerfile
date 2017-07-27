FROM haproxy:1.7.8-alpine

# RUN apk add --no-cache rsyslog
#
# COPY rsyslog.conf /etc/rsyslog.conf

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

# COPY docker-entrypoint.sh /
# ENTRYPOINT ["/docker-entrypoint.sh"]
# CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg"]
