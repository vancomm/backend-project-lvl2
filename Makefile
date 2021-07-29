install:
	npm ci

run:
	bin/gendiff.js

test:
	npm test

test-watch:
	npm run test-watch

publish:
	npm publish --dry-run

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix