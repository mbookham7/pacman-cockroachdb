build:
	docker build -t pacman . -f docker/Dockerfile

run:
	docker run \
		-e DATABASE_URL="postgres://root@host.docker.internal:26257/defaultdb?sslmode=disable" \
		-p 8081:8080 \
		pacman