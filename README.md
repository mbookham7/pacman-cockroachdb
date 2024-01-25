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

fly secrets set DATABASE_URL=""
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

### Cloud Setup

A Cluster needs to be configured to use Enterprise Features for this demo. To enable the features you need to set the following cluster setting with a valid Enterprise license.

```sql
SET CLUSTER SETTING cluster.organization = 'Cockroach Labs';
SET CLUSTER SETTING enterprise.license = 'crl-0-';
```

## Database

Create the `pacman` database.

``` sql
CREATE DATABASE pacman
  PRIMARY REGION 'uksouth'
  REGIONS 'eastus', 'westus';

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

## Kubernetes Setup

Create a separate namespace to run our `pacman` game in.

```sh
kubectl create ns pacman --context $(terraform output -raw kubernetes_cluster_name_region_1)
kubectl create ns pacman --context $(terraform output -raw kubernetes_cluster_name_region_2)
kubectl create ns pacman --context $(terraform output -raw kubernetes_cluster_name_region_3)
```
Copy the existing secret for the `root` user containing the `ca.crt` and the certificate and key for client connection into the pacmam namespace.

```sh
kubectl get secret cockroachdb.client.root -n $(terraform output -raw crdb_namespace_region_1) --context $(terraform output -raw kubernetes_cluster_name_region_1) -o yaml \
| sed s/"namespace: $(terraform output -raw crdb_namespace_region_1)"/"namespace: pacman"/\
| kubectl apply -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_1) -f -

kubectl get secret cockroachdb.client.root -n $(terraform output -raw crdb_namespace_region_2) --context $(terraform output -raw kubernetes_cluster_name_region_2) -o yaml \
| sed s/"namespace: $(terraform output -raw crdb_namespace_region_2)"/"namespace: pacman"/\
| kubectl apply -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_2) -f -

kubectl get secret cockroachdb.client.root -n $(terraform output -raw crdb_namespace_region_3) --context $(terraform output -raw kubernetes_cluster_name_region_3) -o yaml \
| sed s/"namespace: $(terraform output -raw crdb_namespace_region_3)"/"namespace: pacman"/\
| kubectl apply -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_3) -f -
```

Create a secret with the connection string in each region. Also create a secret with the region name.

```sh
kubectl create secret generic db-user-pass --from-literal=DATABASE_URL='postgres://root@cockroachdb-public.uksouth.svc.cluster.local:26257/pacman?sslmode=verify-full&sslrootcert=/cockroach/ca.crt&sslcert=/cockroach/client.root.crt&sslkey=/cockroach/client.root.key' -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_1)

kubectl create secret generic app-region --from-literal=REGION='uksouth' -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_1)

kubectl create secret generic db-user-pass --from-literal=DATABASE_URL='postgres://root@cockroachdb-public.eastus.svc.cluster.local:26257/pacman?sslmode=verify-full&sslrootcert=/cockroach/ca.crt&sslcert=/cockroach/client.root.crt&sslkey=/cockroach/client.root.key'  -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_2)

kubectl create secret generic app-region --from-literal=REGION='eastus' -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_2)

kubectl create secret generic db-user-pass --from-literal=DATABASE_URL='postgres://root@cockroachdb-public.westus.svc.cluster.local:26257/pacman?sslmode=verify-full&sslrootcert=/cockroach/ca.crt&sslcert=/cockroach/client.root.crt&sslkey=/cockroach/client.root.key'  -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_3)

kubectl create secret generic app-region --from-literal=REGION='westus' -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_3)
```

Deploy Pacman in to each region.

```sh
kubectl apply -f pacman.yaml -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_1)
kubectl apply -f pacman.yaml -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_2)
kubectl apply -f pacman.yaml -n pacman --context $(terraform output -raw kubernetes_cluster_name_region_3)
```