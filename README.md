
# ePub validator for Ridibooks CP site
[![npm](https://img.shields.io/npm/v/epub-validator.svg)](https://www.npmjs.com/package/epub-validator)


## 개발환경 설정

### **Sublime Text 2, Package Control 활성화하기**
1. `View > Show Console`
2. 콘솔창에 아래 명령 복붙 후 실행.
`import urllib2,os; pf='Package Control.sublime-package'; ipp=sublime.installed_packages_path(); os.makedirs(ipp) if not os.path.exists(ipp) else None; urllib2.install_opener(urllib2.build_opener(urllib2.ProxyHandler())); open(os.path.join(ipp,pf),'wb').write(urllib2.urlopen('http://sublime.wbond.net/'+pf.replace(' ','%20')).read()); print('Please restart Sublime Text to finish installation')`  
3. Sublime Text 2 재시작.
4. `cmd + shift + P`
5. 입력창에 `install` 입력.
6. `Package Control: Install Package` 선택(실행).

### **Sublime Text 2, JS & NodeJS Snippets Package 설치하기**  
1. 입력창에 `install` 입력.
2. `Package Control: Install Package` 선택(실행).
3. 입력창에 `nodejs` 입력.
4. 'JavaScript & NodeJS Snippets' 선택(설치).

### **Sublime Text 2, Javascript Completions Package 설치하기**
1. 입력창에 `install` 입력.
2. `Package Control: Install Package` 선택(실행).
3. 입력창에 `javascript` 입력.
4. `Javascript Completions` 선택(설치).

### **Sublime Text 2에 NodeJS 빌드 시스템 추가하기**  
1. `Tools > Build System > New Build System` 선택.
2. 아래 내용 복붙.
```
{   
    "cmd": ["/usr/local/bin/node", "$file"],
    "selector": "source.js"
}
```
3. 아래 경로로 저장.
`'/Users/{사용자 이름}/Library/Application\ Support/Sublime\ Text\ 2/Packages/User/nodejs.sublime-build'`  
4. 빌드할 main.js를 Sublime Text 2로 열기 또는 선택.
5. `Sublime Text 2 > Tools > Build System > nodejs` 선택.
6. `cmd + B`


## 디버깅 모드

- 디버깅 모드는 프로그램의 흐름을 한눈에 파악하고 각 과정의 실행시간을 출력해주는 것을 의미한다.
- 디버깅 모드로 실행시키기 위해서는 아래 처럼 커맨드를 사용할 때.
`$ node epub-validator.js test.epub`
- 커맨드 앞에 'DEBUG=**keyword**'를 붙여주면 된다.
`$ DEBUG=* node epub-validator.js test.epub`
- **keyword**에는 **app**, **epub**, **file**, **html**, **css**, **image**가 있으며 전체를 쓰고 싶을 때는 \*를 사용한다.
- 예를 들어 **app**을 keyword로 사용하면 아래와 같이 출력된다.
```
app init +0ms  
app check args +2ms  
app check exists file +1ms  
app ePub validation +0ms  
app ePub uncompressed +614ms  
app files validation in ePub +0ms  
app finish (0) +13ms  
```


## 배포 버전 생성
- epub-validator 루트 디렉토리로 이동 후 다음 커맨드를 실행.
`$ make release`


## 업데이트 이력

### 0.0.2 (2015.03.24)
- 윈도우 환경에서 파일명에 공백이 포함된 ePub을 검사할 수 없었던 현상 수정.
- 윈도우 환경에서 일괄로 유효성 검사를 진행할 수 있도록 'epub-validator.bat' 추가.
- 결과 메시지를 좀 더 이해하기 쉽게 수정하고 의미 없는 메시지를 제거.
- ignore_code_list가 정상 동작하지 않는 현상 수정.
- html, body 태그는 자식 수 검사를하지 않도록 수정.
- OPF에서 identifier, isbn을 찾지 못할 때 검사가 중지되는 현상 수정.

### 0.0.1 (2015.03.23)
- 테스트 버전 배포.


## 검사 항목(Ridi)
| 분류 | 심각성 | 내용 | 개발현황 |
|---|---|---|---|
| EPUB-201~2 | 경고 | ISBN 유효성 검사 | 완료 |
| EPUB-??? | ??? | ISBN 실존 검사 | 대기 |
| EPUB-203 | 경고 | ID, 도서 제목, 저자, 출판 등 메타데이터 확인 | 완료 |
| EPUB-301 | 오류 | 목차의 경로가 './'로 시작하는지 | 완료 |
| EPUB-302 | 오류 | NCX 파일이 존재하는지 | 완료 |
| EPUB-401 | 심각 | NCX 파일 인코딩이 UTF-8인지 | 완료 |
| FILE-301 | 오류 | 파일명에 UTF-8, UTF-16 인코딩에서 지원하지 않는 문자를 포함하고 있는지 | 완료 |
| IMG-301 | 오류 | 표지 이미지가 가이드라인 최대 크기보다 큰지 | 완료 |
| IMG-302 | 오류 | 본문 이미지가 가이드라인 최대 크기보다 큰지 | 완료 |
| IMG-303 | 오류 | 파일 크기가 가이드라인 최대 크기보다 큰지 | 완료 |
| IMG-304 | 오류 | 이미지 Color model이 CMYK model인지 | 개발 중 |
| HTML-201 | 경고 | OS 또는 App에서 지원하는 않는 태그를 사용하는지 | 완료 |
| HTML-301 | 오류 | 파일 크기가 가이드라인 최대 크기보다 큰지 | 완료 |
| HTML-302 | 오류 | 특정 태그가 너무 많은 자식 태그를 가지고 있는지 | 완료 |
| HTML-303 | 오류 | body 태그에 'background-color' 스타일 속성이 들어가 있는지 | 완료 |
| HTML-304 | 오류 | body 태그가 존재하는지 | 완료 |
| HTML-??? | 경고 | App에서 부여한 스타일이 CP 스타일과 충돌하는게 있는지 | 개발 중 |
| HTML-??? | 경고 | 풋노트 기능을 사용할 수 없는 링크 알려주기 | 대기 |
| CSS-201 | 경고 | word-break 스타일 속성값을 break-all로 했을때 각줄의 끝이 균등 정렬되지 못 한다는것 알려주기 | 완료 |
| CSS-202 | 경고 | OS 또는 App에서 지원하는 않는 속성을 사용하는지 | 완료 |
| CSS-301 | 오류 | html 또는 body 태그의 너비 또는 높이를 조절하는 속성이 있는지 | 완료 |
| CSS-302 | 오류 | 다단(Column) 스타일 속성을 사용하면 알려주기 | 완료 |
| CSS-303 | 오류 | 이미지 태그 속성으로 'position:relative'를 주고 있는지 | 완료 |
| CSS-??? | ??? | span 태그의 서체 크기가 일정 크기(약 26pt)를 넘지 않는지 | 개발 중 |
| CSS-??? | ??? | url 속성으로 존재하지 않는 로컬 파일이나 외부 파일을 불러오려고 하는지 | 개발 중 |

## 검사 항목(epubcheck)
| 분류 | 심각성 | 내용 |
|---|---|---|---|
| ACC-004 | 경고 | 텍스트가 없어 터치할 수 없는 링크가 있는지 |
| ACC-010 | 경고 | 제목(h1~6)에 blockquote, figure 태그가 포함되어 있는지  |
| ACC-012 | 경고 | 표에 caption 태그가 누락되어 있는지 |
| ACC-013 | 경고 | 인라인 스타일을 포함하고 있는지 |
| ACC-014, 016 | 경고 | font-size 값이 상대값인지 |
| ACC-015, 017 | 경고 | line-height 값이 상대값인지 |
| CSS-001 | 경고 | ePub에서 사용할 수 없는 속성을 사용하는지 |
| CSS-002 | 경고 | 속성값이 비어있는지 |
| CSS-003~4 | 심각 | UTF-8, UTF-16 인코딩에서 지원하지 않는 문자를 포함하고 있는지 |
| CSS-005 | 경고 | 충돌되서 덮어쓰기 되는 속성이 있는지 |
| CSS-006 | 오류 | 'position:fixed' 속성을 사용하는지 |
| CSS-007 | 경고 | 비표준 폰트를 사용하고 있는지 |
| CSS-008 | 오류 | CSS 문법 오류 |
| CSS-009 | 오류 | 페이징에 영향을 주는 속성을 사용하고 있는지 |
| CSS-010 | 경고 | 비표준 스타일 시트를 사용하고 있는지  |
| CSS-013 | 경고 | '!Important' 키워드를 사용하는 속성이 있는지 |
| CSS-016 | 경고 | 대체 스타일시트가 기본 스타일 시트보다 우선시 되고 있는지 |
| CSS-019 | 경고 | 속성이 없는 font-face가 있는지 |
| CSS-020 | 경고 | 유효하지 않는 폰트 크기를 사용하고 있는지 |
| CSS-022 | 경고 | html, body에 여백 속성을 추가 했는지 |
