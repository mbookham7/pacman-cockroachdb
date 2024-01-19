build:
	docker build -t codingconcepts/pacman:v1.0.0 . -f docker/Dockerfile

run:
	docker run --rm -it \
		-e DATABASE_URL="postgres://root@host.docker.internal:26257/pacman?sslmode=disable" \
		-e REGION="eu-west-2" \
		-p 9090:8080 \
		codingconcepts/pacman:v1.0.0

push:
	docker push codingconcepts/pacman:v1.0.0