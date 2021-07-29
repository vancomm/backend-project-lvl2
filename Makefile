install:
	npm ci

run:
	bin/gendiff.js

test:
	npm test

publish:
	npm publish --dry-run

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix