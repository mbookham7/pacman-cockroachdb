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
  "date" DATE NOT NULL
) LOCALITY GLOBAL;
```