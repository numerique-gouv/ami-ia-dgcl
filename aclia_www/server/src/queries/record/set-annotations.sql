INSERT INTO app_annotation
    (username, date, qcm, iddocument, filename)
VALUES
    ($1, current_timestamp, $2, $3, $4)
ON CONFLICT (filename) DO UPDATE
  SET username = excluded.username,
  date = excluded.date,
  iddocument = excluded.iddocument,
  qcm = excluded.qcm
