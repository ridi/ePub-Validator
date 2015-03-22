
PROJECT_NAME = epub-validator

NPM  = npm
NODE = node

JXP  = jx package
JXC  = jx compile

MK   = mkdir -p
RM   = rm -rf
CP   = cp -r
MV   = mv

help:
	@echo 'release: 배포 버전 생성'
	@echo 'install: 모듈 설치'
	@echo 'uninstall: 모듈과 임시 폴더 삭제'
	@echo 'release-clean: 배포 버전 결과물 삭제'
	@echo 'os-generated-file-clean: OS에서 생성한 무쓸모 파일 삭제'
	@echo 'clean: 배포 버전 결과물, OS에서 생성한 무쓸모 파일 삭제'
	@echo 'package: jxp 파일 생성'

release: pre-build build post-build

install:
	$(NPM) install

uninstall:
	$(RM) node_modules
	$(RM) epub-validator-temp
	$(RM) temp
	$(RM) tmp

clean: release-clean os-generated-file-clean

release-clean:
	$(RM) $(PROJECT_NAME).jxp
	$(RM) $(PROJECT_NAME)
	$(RM) $(PROJECT_NAME).exe
	$(RM) release

os-generated-file-clean:
	find . -name '*.DS_Store' -type f -delete
	find . -name '*.Trashes' -type f -delete
	find . -name '*ehthumbs.db' -type f -delete
	find . -name '*Thumbs.db' -type f -delete

package:
	$(JXP) $(PROJECT_NAME).js $(PROJECT_NAME) -native
	$(NODE) lib/jxp.js

pre-build: clean package

build:
	$(JXC) $(PROJECT_NAME).jxp

post-build:
	$(MK) release/lib/epubcheck
	$(MV) epub-validator release
	$(CP) config release
	$(CP) db release
	$(CP) lib/epubcheck release/lib
