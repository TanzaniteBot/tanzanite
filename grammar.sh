grammar() {
	yarn nearleyc lib/dice/dice-grammar.ne -o dist/lib/dice/dice-grammar.umd.js && yarn rollup -c rollup-nearley.js
}

output=$(grammar 2>&1 | tr -d '\000') || echo $output