COMPOSE = USER_ID=$(shell id -u) GROUP_ID=$(shell id -g) docker compose

.PHONY: help start stop restart build rebuild logs shell install check

help:
	@echo "make start    - start the development container"
	@echo "make stop     - stop and remove the container"
	@echo "make restart  - restart the development container"
	@echo "make build    - build the Docker image"
	@echo "make rebuild  - rebuild the image without cache"
	@echo "make logs     - follow application logs"
	@echo "make shell    - open a shell in the container"
	@echo "make install  - install dependencies from package-lock.json"
	@echo "make check    - run the TypeScript check"

start:
	@$(COMPOSE) up -d

stop:
	@$(COMPOSE) down

restart:
	@$(COMPOSE) restart app

build:
	@$(COMPOSE) build

rebuild:
	@$(COMPOSE) build --no-cache

logs:
	@$(COMPOSE) logs -f app

shell:
	@$(COMPOSE) exec app sh

install:
	@$(COMPOSE) run --rm app npm ci

check:
	@$(COMPOSE) exec app npm exec tsc -- --noEmit
