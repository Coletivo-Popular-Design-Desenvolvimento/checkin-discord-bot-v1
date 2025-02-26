-- Allow root to connect from any host
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'Coletivo!1917';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;