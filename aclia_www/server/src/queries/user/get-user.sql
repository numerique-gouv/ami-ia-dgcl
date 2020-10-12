SELECT "user", "id", "userin"
FROM "app_users"
WHERE "user" = $1 AND "pass" = $2
LIMIT 1;
