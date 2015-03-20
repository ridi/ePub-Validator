all: clean build package finish

clean:
	rm -rf release

build:
	jx compile epub-validator.jxp

package:
	mkdir release
	mv epub-validator release
	cp -r config release
	cp -r db release
	cp -r lib/epubcheck release/lib

finish:
	find release -name '*.DS_Store' -type f -delete
	find release -name '*.Trashes' -type f -delete
	find release -name '*ehthumbs.db' -type f -delete
	find release -name '*Thumbs.db' -type f -delete

cleaninstall: clean install
	rm -rf node_modules
	rm -rf epub-validator-temp
	rm -rf temp
	rm -rf tmp

install:
	npm install
