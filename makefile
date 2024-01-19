build:
	docker build -t pacman . -f docker/Dockerfile

run:
	docker run --rm -it \
		-e DATABASE_URL="postgres://root@host.docker.internal:26257/pacman?sslmode=disable" \
		-e REGION="eu-west-2" \
		-p 9090:8080 \
		pacman