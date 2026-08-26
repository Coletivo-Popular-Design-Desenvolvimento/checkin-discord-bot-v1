#!/bin/sh

set -eu

validate_local_password() {
  value="$1"
  name="$2"

  case "$value" in
    *[!A-Za-z0-9_.-]*)
      echo "$name deve usar apenas letras, números, ponto, sublinhado ou hífen." >&2
      exit 1
      ;;
  esac
}

validate_local_password "$ANALYTICS_READER_PASSWORD" "ANALYTICS_READER_PASSWORD"
validate_local_password "$METABASE_APP_DB_PASSWORD" "METABASE_APP_DB_PASSWORD"

mariadb --host=db --user=root --password="$DB_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`checkindb_analytics_poc\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`metabase_poc\`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'metabase_app'@'%' IDENTIFIED BY '${METABASE_APP_DB_PASSWORD}';
ALTER USER 'metabase_app'@'%' IDENTIFIED BY '${METABASE_APP_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`metabase_poc\`.* TO 'metabase_app'@'%';

CREATE USER IF NOT EXISTS 'analytics_reader'@'%' IDENTIFIED BY '${ANALYTICS_READER_PASSWORD}';
ALTER USER 'analytics_reader'@'%' IDENTIFIED BY '${ANALYTICS_READER_PASSWORD}';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'analytics_reader'@'%';
FLUSH PRIVILEGES;
SQL

mariadb \
  --host=db \
  --user=root \
  --password="$DB_PASSWORD" \
  checkindb_analytics_poc \
  < /analytics/database/schema-and-seed.sql

mariadb --host=db --user=root --password="$DB_PASSWORD" <<SQL
GRANT SELECT ON \`checkindb_analytics_poc\`.\`analytics_overview\` TO 'analytics_reader'@'%';
GRANT SELECT ON \`checkindb_analytics_poc\`.\`analytics_activity_daily\` TO 'analytics_reader'@'%';
GRANT SELECT ON \`checkindb_analytics_poc\`.\`analytics_channel_activity\` TO 'analytics_reader'@'%';
GRANT SELECT ON \`checkindb_analytics_poc\`.\`analytics_audio_activity\` TO 'analytics_reader'@'%';
GRANT SELECT ON \`checkindb_analytics_poc\`.\`analytics_retention_cohort\` TO 'analytics_reader'@'%';
GRANT SELECT ON \`checkindb_analytics_poc\`.\`analytics_data_quality\` TO 'analytics_reader'@'%';
FLUSH PRIVILEGES;
SQL

if mariadb \
  --host=db \
  --user=analytics_reader \
  --password="$ANALYTICS_READER_PASSWORD" \
  --execute="UPDATE checkindb_analytics_poc.user SET status = status WHERE 1 = 0" \
  >/dev/null 2>&1; then
  echo "O usuário analytics_reader recebeu permissão de escrita indevida." >&2
  exit 1
fi

mariadb \
  --host=db \
  --user=analytics_reader \
  --password="$ANALYTICS_READER_PASSWORD" \
  --execute="SELECT total_members FROM checkindb_analytics_poc.analytics_overview" \
  >/dev/null

echo "Banco analítico simulado e views somente leitura preparados."
