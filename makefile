all: clean build package

clean:
	find . -name '*.DS_Store' -type f -delete
	find . -name '*.Trashes' -type f -delete
	find . -name '*ehthumbs.db' -type f -delete
	find . -name '*Thumbs.db' -type f -delete
	rm -rf release

build:
	jx compile epub-validator.jxp

package:
	mkdir release
	mv epub-validator release
	cp -r config release
	cp -r db release
	cp -r lib/epubcheck release/lib

cleaninstall: pre-cleaninstall install

pre-cleaninstall: clean
	rm -rf node_modules
	rm -rf epub-validator-temp
	rm -rf temp
	rm -rf tmp

install:
	npm install
