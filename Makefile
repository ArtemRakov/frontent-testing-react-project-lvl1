install: install-deps

run:
	bin/page-loader.js 10

install-deps:
	npm ci

test:
	npm test

test_with_lgos:
	DEBUG=axios,page-loader,nock.request_overrider npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

publish:
	npm publish

.PHONY: test
