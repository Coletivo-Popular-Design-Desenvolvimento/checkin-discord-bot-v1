SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS analytics_data_quality;
DROP VIEW IF EXISTS analytics_retention_cohort;
DROP VIEW IF EXISTS analytics_audio_activity;
DROP VIEW IF EXISTS analytics_channel_activity;
DROP VIEW IF EXISTS analytics_activity_daily;
DROP VIEW IF EXISTS analytics_overview;

DROP TABLE IF EXISTS UserRole;
DROP TABLE IF EXISTS UserChannel;
DROP TABLE IF EXISTS message_reaction;
DROP TABLE IF EXISTS user_event;
DROP TABLE IF EXISTS audio_event;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS event_status;
DROP TABLE IF EXISTS channel;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(191) NOT NULL,
  global_name VARCHAR(191) NULL,
  joined_at DATETIME(3) NULL,
  update_at DATETIME(3) NULL,
  last_active DATETIME(3) NULL,
  create_at DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
  bot BOOLEAN NOT NULL,
  email VARCHAR(191) NULL,
  status INT NOT NULL,
  platform_created_at DATETIME(3) NULL,
  platform_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY user_platform_id_key (platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE channel (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  url VARCHAR(191) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  platform_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY channel_platform_id_key (platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  platform_created_at DATETIME(3) NOT NULL,
  platform_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY role_platform_id_key (platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE event_status (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  platform_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY event_status_platform_id_key (platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE message (
  id INT NOT NULL AUTO_INCREMENT,
  channel_id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  platform_created_at DATETIME(3) NOT NULL,
  platform_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY message_platform_id_key (platform_id),
  KEY message_channel_id_fkey (channel_id),
  KEY message_user_id_fkey (user_id),
  CONSTRAINT message_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES channel(platform_id),
  CONSTRAINT message_user_id_fkey FOREIGN KEY (user_id) REFERENCES user(platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE audio_event (
  id INT NOT NULL AUTO_INCREMENT,
  channel_id VARCHAR(191) NOT NULL,
  creator_id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  description VARCHAR(191) NULL,
  status_id VARCHAR(191) NOT NULL,
  start_at DATETIME(3) NOT NULL,
  end_at DATETIME(3) NULL,
  user_count INT NOT NULL,
  image VARCHAR(191) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  platform_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY audio_event_platform_id_key (platform_id),
  KEY audio_event_channel_id_fkey (channel_id),
  KEY audio_event_creator_id_fkey (creator_id),
  KEY audio_event_status_id_fkey (status_id),
  CONSTRAINT audio_event_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES channel(platform_id),
  CONSTRAINT audio_event_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES user(platform_id),
  CONSTRAINT audio_event_status_id_fkey FOREIGN KEY (status_id) REFERENCES event_status(platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE user_event (
  id INT NOT NULL AUTO_INCREMENT,
  event_id VARCHAR(191) NOT NULL,
  user_id VARCHAR(191) NOT NULL,
  event_type ENUM('JOINED', 'LEFT') NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY user_event_event_id_fkey (event_id),
  KEY user_event_user_id_fkey (user_id),
  CONSTRAINT user_event_event_id_fkey FOREIGN KEY (event_id) REFERENCES audio_event(platform_id),
  CONSTRAINT user_event_user_id_fkey FOREIGN KEY (user_id) REFERENCES user(platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE message_reaction (
  user_id VARCHAR(191) NOT NULL,
  message_id VARCHAR(191) NOT NULL,
  channel_id VARCHAR(191) NOT NULL,
  id INT NOT NULL AUTO_INCREMENT,
  reaction_emoji VARCHAR(191) NULL DEFAULT '',
  reacted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY message_reaction_user_message_emoji_key (user_id, message_id, reaction_emoji),
  KEY message_reaction_channel_id_fkey (channel_id),
  KEY message_reaction_message_id_fkey (message_id),
  CONSTRAINT message_reaction_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES channel(platform_id),
  CONSTRAINT message_reaction_message_id_fkey FOREIGN KEY (message_id) REFERENCES message(platform_id),
  CONSTRAINT message_reaction_user_id_fkey FOREIGN KEY (user_id) REFERENCES user(platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE UserChannel (
  user_platform_id VARCHAR(191) NOT NULL,
  channel_platform_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (user_platform_id, channel_platform_id),
  CONSTRAINT UserChannel_user_platform_id_fkey FOREIGN KEY (user_platform_id) REFERENCES user(platform_id),
  CONSTRAINT UserChannel_channel_platform_id_fkey FOREIGN KEY (channel_platform_id) REFERENCES channel(platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE UserRole (
  user_platform_id VARCHAR(191) NOT NULL,
  role_platform_id VARCHAR(191) NOT NULL,
  PRIMARY KEY (user_platform_id, role_platform_id),
  CONSTRAINT UserRole_user_platform_id_fkey FOREIGN KEY (user_platform_id) REFERENCES user(platform_id),
  CONSTRAINT UserRole_role_platform_id_fkey FOREIGN KEY (role_platform_id) REFERENCES role(platform_id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

DELIMITER //

CREATE PROCEDURE seed_checkin_analytics_poc()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE selected_user INT;
  DECLARE selected_channel INT;
  DECLARE selected_message INT;
  DECLARE activity_time DATETIME;

  INSERT INTO channel (name, url, platform_id) VALUES
    ('acolhimento', 'https://discord.local/channels/acolhimento', 'poc-channel-01'),
    ('formacao', 'https://discord.local/channels/formacao', 'poc-channel-02'),
    ('projetos', 'https://discord.local/channels/projetos', 'poc-channel-03'),
    ('convivencia', 'https://discord.local/channels/convivencia', 'poc-channel-04');

  INSERT INTO event_status (name, platform_id) VALUES
    ('Concluído', 'poc-status-completed');

  INSERT INTO role (name, platform_created_at, platform_id) VALUES
    ('Pessoa participante', DATE_SUB(CURRENT_DATE, INTERVAL 2 YEAR), 'poc-role-01'),
    ('Pessoa facilitadora', DATE_SUB(CURRENT_DATE, INTERVAL 2 YEAR), 'poc-role-02'),
    ('Pessoa contribuidora', DATE_SUB(CURRENT_DATE, INTERVAL 2 YEAR), 'poc-role-03');

  WHILE i <= 30 DO
    INSERT INTO user (
      username,
      global_name,
      joined_at,
      last_active,
      bot,
      email,
      status,
      platform_created_at,
      platform_id
    ) VALUES (
      CONCAT('pessoa-simulada-', LPAD(i, 2, '0')),
      CONCAT('Pessoa simulada ', LPAD(i, 2, '0')),
      DATE_SUB(CURRENT_DATE, INTERVAL (125 - (i * 4)) DAY),
      DATE_SUB(CURRENT_DATE, INTERVAL MOD(i * 3, 40) DAY),
      i = 30,
      NULL,
      IF(i MOD 10 = 0, 0, 1),
      DATE_SUB(CURRENT_DATE, INTERVAL (500 + i) DAY),
      CONCAT('poc-user-', LPAD(i, 2, '0'))
    );

    IF i <= 29 THEN
      INSERT INTO UserRole (user_platform_id, role_platform_id)
      VALUES (
        CONCAT('poc-user-', LPAD(i, 2, '0')),
        CONCAT('poc-role-0', 1 + MOD(i, 3))
      );

      INSERT INTO UserChannel (user_platform_id, channel_platform_id)
      VALUES (
        CONCAT('poc-user-', LPAD(i, 2, '0')),
        CONCAT('poc-channel-0', 1 + MOD(i, 4))
      );
    END IF;

    SET i = i + 1;
  END WHILE;

  SET i = 1;
  WHILE i <= 180 DO
    SET selected_user = 1 + MOD(i * 7, 29);
    SET selected_channel = 1 + MOD(i * 5, 4);
    SET activity_time = DATE_ADD(
      DATE_SUB(CURRENT_DATE, INTERVAL MOD(i * 11, 90) DAY),
      INTERVAL MOD(i * 3, 24) HOUR
    );

    INSERT INTO message (
      channel_id,
      user_id,
      created_at,
      is_deleted,
      platform_created_at,
      platform_id
    ) VALUES (
      CONCAT('poc-channel-0', selected_channel),
      CONCAT('poc-user-', LPAD(selected_user, 2, '0')),
      activity_time,
      i MOD 37 = 0,
      activity_time,
      CONCAT('poc-message-', LPAD(i, 3, '0'))
    );

    SET i = i + 1;
  END WHILE;

  SET i = 1;
  WHILE i <= 90 DO
    SET selected_user = 1 + MOD(i * 11, 29);
    SET selected_message = 1 + MOD(i * 13, 180);
    SET selected_channel = 1 + MOD(selected_message * 5, 4);
    SET activity_time = DATE_ADD(
      DATE_SUB(CURRENT_DATE, INTERVAL MOD(selected_message * 11, 90) DAY),
      INTERVAL MOD(selected_message * 3 + 1, 24) HOUR
    );

    INSERT INTO message_reaction (
      user_id,
      message_id,
      channel_id,
      reaction_emoji,
      reacted_at
    ) VALUES (
      CONCAT('poc-user-', LPAD(selected_user, 2, '0')),
      CONCAT('poc-message-', LPAD(selected_message, 3, '0')),
      CONCAT('poc-channel-0', selected_channel),
      CASE MOD(i, 3) WHEN 0 THEN '❤️' WHEN 1 THEN '👍' ELSE '🌱' END,
      activity_time
    );

    SET i = i + 1;
  END WHILE;

  SET i = 1;
  WHILE i <= 6 DO
    SET selected_user = 1 + MOD(i * 3, 29);
    SET selected_channel = 1 + MOD(i, 4);
    SET activity_time = DATE_ADD(
      DATE_SUB(CURRENT_DATE, INTERVAL (i * 12) DAY),
      INTERVAL 19 HOUR
    );

    INSERT INTO audio_event (
      channel_id,
      creator_id,
      name,
      description,
      status_id,
      start_at,
      end_at,
      user_count,
      image,
      created_at,
      platform_id
    ) VALUES (
      CONCAT('poc-channel-0', selected_channel),
      CONCAT('poc-user-', LPAD(selected_user, 2, '0')),
      CONCAT('Encontro simulado ', LPAD(i, 2, '0')),
      'Evento criado apenas para a prova de conceito',
      'poc-status-completed',
      activity_time,
      DATE_ADD(activity_time, INTERVAL (45 + i * 5) MINUTE),
      5,
      NULL,
      activity_time,
      CONCAT('poc-audio-', LPAD(i, 2, '0'))
    );

    SET selected_message = 1;
    WHILE selected_message <= 5 DO
      SET selected_user = 1 + MOD(i * 5 + selected_message * 3, 29);

      INSERT INTO user_event (event_id, user_id, event_type, created_at) VALUES
        (
          CONCAT('poc-audio-', LPAD(i, 2, '0')),
          CONCAT('poc-user-', LPAD(selected_user, 2, '0')),
          'JOINED',
          DATE_ADD(activity_time, INTERVAL selected_message MINUTE)
        ),
        (
          CONCAT('poc-audio-', LPAD(i, 2, '0')),
          CONCAT('poc-user-', LPAD(selected_user, 2, '0')),
          'LEFT',
          DATE_ADD(activity_time, INTERVAL (35 + selected_message * 3) MINUTE)
        );

      SET selected_message = selected_message + 1;
    END WHILE;

    SET i = i + 1;
  END WHILE;
END//

DELIMITER ;

CALL seed_checkin_analytics_poc();
DROP PROCEDURE seed_checkin_analytics_poc;

CREATE VIEW analytics_overview AS
SELECT
  (SELECT COUNT(*) FROM user WHERE bot = false) AS total_members,
  (SELECT COUNT(*) FROM channel) AS total_channels,
  (SELECT COUNT(*) FROM message WHERE is_deleted = false) AS total_messages,
  (SELECT COUNT(*) FROM message_reaction) AS total_reactions,
  (SELECT COUNT(*) FROM audio_event) AS total_audio_events,
  (SELECT COUNT(*) FROM user_event) AS total_voice_movements;

CREATE VIEW analytics_activity_daily AS
SELECT
  activity.activity_date,
  SUM(activity.messages) AS messages,
  SUM(activity.reactions) AS reactions,
  SUM(activity.voice_joins) AS voice_joins,
  COUNT(DISTINCT activity.user_id) AS active_members
FROM (
  SELECT
    DATE(m.platform_created_at) AS activity_date,
    m.user_id,
    COUNT(*) AS messages,
    0 AS reactions,
    0 AS voice_joins
  FROM message m
  INNER JOIN user u ON u.platform_id = m.user_id AND u.bot = false
  WHERE m.is_deleted = false
  GROUP BY DATE(m.platform_created_at), m.user_id

  UNION ALL

  SELECT
    DATE(mr.reacted_at) AS activity_date,
    mr.user_id,
    0 AS messages,
    COUNT(*) AS reactions,
    0 AS voice_joins
  FROM message_reaction mr
  INNER JOIN user u ON u.platform_id = mr.user_id AND u.bot = false
  GROUP BY DATE(mr.reacted_at), mr.user_id

  UNION ALL

  SELECT
    DATE(ue.created_at) AS activity_date,
    ue.user_id,
    0 AS messages,
    0 AS reactions,
    COUNT(*) AS voice_joins
  FROM user_event ue
  INNER JOIN user u ON u.platform_id = ue.user_id AND u.bot = false
  WHERE ue.event_type = 'JOINED'
  GROUP BY DATE(ue.created_at), ue.user_id
) activity
GROUP BY activity.activity_date;

CREATE VIEW analytics_channel_activity AS
SELECT
  c.name AS channel_name,
  COALESCE(messages.message_count, 0) AS messages,
  COALESCE(messages.active_members, 0) AS active_members,
  COALESCE(reactions.reaction_count, 0) AS reactions,
  COALESCE(audio.audio_event_count, 0) AS audio_events
FROM channel c
LEFT JOIN (
  SELECT
    channel_id,
    COUNT(*) AS message_count,
    COUNT(DISTINCT user_id) AS active_members
  FROM message
  WHERE is_deleted = false
  GROUP BY channel_id
) messages ON messages.channel_id = c.platform_id
LEFT JOIN (
  SELECT channel_id, COUNT(*) AS reaction_count
  FROM message_reaction
  GROUP BY channel_id
) reactions ON reactions.channel_id = c.platform_id
LEFT JOIN (
  SELECT channel_id, COUNT(*) AS audio_event_count
  FROM audio_event
  GROUP BY channel_id
) audio ON audio.channel_id = c.platform_id;

CREATE VIEW analytics_audio_activity AS
SELECT
  DATE(ae.start_at) AS event_date,
  c.name AS channel_name,
  COUNT(*) AS audio_events,
  SUM(ae.user_count) AS declared_participants,
  SUM(TIMESTAMPDIFF(MINUTE, ae.start_at, ae.end_at)) AS total_minutes
FROM audio_event ae
INNER JOIN channel c ON c.platform_id = ae.channel_id
GROUP BY DATE(ae.start_at), c.name;

CREATE VIEW analytics_retention_cohort AS
SELECT
  DATE_FORMAT(u.joined_at, '%Y-%m-01') AS cohort_month,
  DATE_FORMAT(activity.activity_date, '%Y-%m-01') AS activity_month,
  COUNT(DISTINCT u.platform_id) AS retained_members,
  cohort.cohort_size,
  ROUND(COUNT(DISTINCT u.platform_id) * 100.0 / cohort.cohort_size, 1) AS retention_rate
FROM user u
INNER JOIN (
  SELECT DATE(platform_created_at) AS activity_date, user_id
  FROM message
  WHERE is_deleted = false
  UNION
  SELECT DATE(reacted_at) AS activity_date, user_id
  FROM message_reaction
  UNION
  SELECT DATE(created_at) AS activity_date, user_id
  FROM user_event
  WHERE event_type = 'JOINED'
) activity ON activity.user_id = u.platform_id
INNER JOIN (
  SELECT DATE_FORMAT(joined_at, '%Y-%m-01') AS cohort_month, COUNT(*) AS cohort_size
  FROM user
  WHERE bot = false
  GROUP BY DATE_FORMAT(joined_at, '%Y-%m-01')
) cohort ON cohort.cohort_month = DATE_FORMAT(u.joined_at, '%Y-%m-01')
WHERE u.bot = false AND activity.activity_date >= DATE(u.joined_at)
GROUP BY
  DATE_FORMAT(u.joined_at, '%Y-%m-01'),
  DATE_FORMAT(activity.activity_date, '%Y-%m-01'),
  cohort.cohort_size;

CREATE VIEW analytics_data_quality AS
SELECT
  'messages' AS source_name,
  COUNT(*) AS row_count,
  MIN(DATE(platform_created_at)) AS coverage_start,
  MAX(DATE(platform_created_at)) AS coverage_end,
  'Data original da plataforma; mensagens excluídas não entram nas métricas.' AS caveat
FROM message
UNION ALL
SELECT
  'reactions',
  COUNT(*),
  MIN(DATE(reacted_at)),
  MAX(DATE(reacted_at)),
  'Em backfills reais, o horário da reação pode ser aproximado.'
FROM message_reaction
UNION ALL
SELECT
  'audio_events',
  COUNT(*),
  MIN(DATE(start_at)),
  MAX(DATE(start_at)),
  'Eventos históricos podem ter cobertura incompleta.'
FROM audio_event
UNION ALL
SELECT
  'voice_movements',
  COUNT(*),
  MIN(DATE(created_at)),
  MAX(DATE(created_at)),
  'Entradas e saídas históricas podem não ser recuperáveis.'
FROM user_event;
