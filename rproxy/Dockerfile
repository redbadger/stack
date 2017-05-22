FROM nginx:alpine

ARG config
COPY ./${config}.conf /etc/nginx/conf.d/default.template

CMD ["/bin/sh", "-c", "envsubst '${PORT},${WEB_HOST},${API_HOST},${VISUALIZER_HOST}' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
