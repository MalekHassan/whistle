DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS matches;

CREATE TABLE
IF NOT EXISTS users
(
  u_id SERIAL PRIMARY KEY,
  username VARCHAR
(255),
  password VARCHAR
(255)
);

CREATE TABLE
IF NOT EXISTS matches
(
  id SERIAL PRIMARY KEY,
  match_id VARCHAR
(255),
  u_id integer REFERENCES users
(u_id)
);

INSERT INTO users
  (username,password)
VALUES
  ('aya.ak@hotmail.com', '0000');
INSERT INTO users
  (username,password)
VALUES
  ('hamzh78@gmail.com', '0000');

  