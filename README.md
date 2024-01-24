# pacman-cockroachdb

### Self-hosted setup

Kubernetes secrets

``` sh
kubectl create secret generic db-user-pass \
  --from-literal=DATABASE_URL=[UPDATE] \
  --from-literal=REGION=[UPDATE]
```

### Serverless / fly.io setup

1. Create a Serverless database with the following regions:

* aws-eu-central-1
* aws-azure-uk
* aws-azure-ukwest

2. Create the database as per the steps below

3. Deploy application to fly.io with the following steps

``` sh
fly launch --no-deploy

fly secrets set DATABASE_URL="postgresql://pacman_service:qHObg8Muv7-9gwUDQEX97w@pacman-853.j77.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"
fly secrets set REGION="aws-eu-central-1"

fly deploy #-i registry.fly.io/crdb-latency-testing:latest --remote-only
```

### Local setup

``` sh
cockroach demo \
  --insecure \
  --nodes 9 \
  --no-example-database \
  --demo-locality=region=azure-uksouth,az=1:region=azure-uksouth,az=2:region=azure-uksouth,az=3:region=azure-ukwest,az=1:region=azure-ukwest,az=2:region=azure-ukwest,az=3:region=azure-northeurope,az=1:region=azure-northeurope,az=2:region=azure-northeurope,az=3
```

### Database

Create

``` sql
CREATE DATABASE pacman
  PRIMARY REGION 'azure-uksouth'
  REGIONS 'azure-ukwest', 'azure-northeurope';

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
  ('Kai', 480, 1, 'azure-northeurope'),
  ('Mike', 200, 1, 'azure-ukwest'),
  ('Rob', 100, 1, 'azure-uksouth');
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