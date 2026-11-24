#!/usr/bin/env bash
# Arranque de la tienda en el pipeline de Jenkins: instala OpenCart contra MySQL y levanta Apache.
set -e
cd /var/www/html
wait-for-it mysql:3306 -t 90
cp config-dist.php config.php
cp admin/config-dist.php admin/config.php
php install/cli_install.php install \
  --username admin --password admin --email email@example.com \
  --http_server http://opencart/ \
  --db_driver mysqli --db_hostname mysql --db_username root --db_password opencart \
  --db_database opencart --db_port 3306 --db_prefix oc_
chown -R www-data:www-data /var/www/html
exec apache2-foreground
