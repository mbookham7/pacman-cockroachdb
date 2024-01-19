# pacman-cockroachdb

### Local setup

``` sh
cockroach demo \
  --insecure \
  --nodes 9 \
  --no-example-database \
  --demo-locality=region=us-east-1,az=1:region=us-east-1,az=2:region=us-east-1,az=3:region=us-west-2,az=1:region=us-west-2,az=2:region=us-west-2,az=3:region=eu-west-2,az=1:region=eu-west-2,az=2:region=eu-west-2,az=3
```

### Database

Create

``` sql
CREATE DATABASE pacman
  PRIMARY REGION 'us-east-1'
  REGIONS 'us-west-2', 'eu-west-2';

USE pacman;

CREATE TABLE highscores (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" STRING NOT NULL,
  "score" INT NOT NULL,
  "level" INT NOT NULL,
  "region" crdb_internal_region NOT NULL,
  "date" DATE NOT NULL DEFAULT now()::DATE
) LOCALITY GLOBAL;
```

Insert test data

``` sql
INSERT INTO highscores (name, score, level, region) VALUES
  ('a', 100, 1, 'eu-west-2'),
  ('b', 200, 1, 'eu-west-2'),
  ('c', 300, 1, 'us-east-1'),
  ('d', 400, 1, 'us-east-1'),
  ('e', 500, 1, 'us-west-2');
```

Debugging queries

``` sql
-- Get region highscores.
WITH
  scores AS (
    SELECT
      region,
      SUM(score) AS score
    FROM highscores
    GROUP BY region
  ) 
SELECT
  RANK() OVER(ORDER BY score DESC) "rank",
  *
FROM scores
ORDER BY score DESC;
```

RANK () OVER ( 
		ORDER BY c 
	) rank_number 