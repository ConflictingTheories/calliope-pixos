#!/bin/bash
cat <<EOF > /etc/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {

    upstream admin {
		server pixos_portal:${ADMIN_PORT};
	}

	server {

        listen 80;

        server_name localhost, pixos.kderbyma.com;

        location / {
            proxy_pass http://admin/;
        }
    }

}
EOF