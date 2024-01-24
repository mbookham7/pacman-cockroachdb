build:
	docker build \
		-f docker/Dockerfile \
		--platform linux/amd64 \
		-t codingconcepts/pacman:v1.1.0 .

run:
	docker run --rm -it \
		-e DATABASE_URL="postgres://root@host.docker.internal:26257/pacman?sslmode=disable" \
		-e REGION="azure-uksouth" \
		-p 9090:8080 \
		codingconcepts/pacman:v1.1.0

push:
	docker push codingconcepts/pacman:v1.1.0