generate:
	@echo "Generating wasm..."
	rm -rf ./build
	mkdir ./build
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" ./build
	GOOS=js GOARCH=wasm go build -o ./build/main.wasm ./wasm/main.go

js:
	./scripts/inlinewasm.js ./build/main.wasm
	yarn && yarn build
	yarn test


lint:
	golangci-lint run --new-from-rev=origin/master --config .golangci.yml

test:
	go test  ./...

test-race:
	go test -race  ./...