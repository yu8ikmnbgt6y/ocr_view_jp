FROM nginx:1.23.3


COPY ./assets /usr/share/nginx/html/assets
COPY index.html /usr/share/nginx/html/
COPY ./conf/default.conf /etc/nginx/conf.d/default.conf 

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
