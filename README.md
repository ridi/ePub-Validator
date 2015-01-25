
# ePub validator for Ridibooks CP site

---

## 요약

- 개발 진행: 앱팀(안다빈, 유대열)  
- 개발 언어와 환경: js, node.js  
- 개발 목적:   
- 개발 기간: 2015.01.20 ~ 2015.02.28  

---

## 개발환경 설정

* __Sublime Text 2, Package Control 활성화하기__  
	- View > Show Console  
	- 콘솔창에 아래 명령 복붙 후 실행  
	`mport urllib2,os; pf='Package Control.sublime-package'; ipp=sublime.installed_packages_path(); os.makedirs(ipp) if not os.path.exists(ipp) else None; urllib2.install_opener(urllib2.build_opener(urllib2.ProxyHandler())); open(os.path.join(ipp,pf),'wb').write(urllib2.urlopen('http://sublime.wbond.net/'+pf.replace(' ','%20')).read()); print('Please restart Sublime Text to finish installation')`  
	- Sublime Text 2 재시작  
	- cmd + shift + P  
	- 입력창에 'install' 입력  
	- 'Package Control: Install Package' 선택(실행)  

* __Sublime Text 2, JS & NodeJS Snippets Package 설치하기__  
	- 입력창에 'install' 입력  
	- 'Package Control: Install Package' 선택(실행)  
	- 입력창에 'nodejs' 입력  
	- 'Java​Script & Node​JS Snippets' 선택(설치)  

* __Sublime Text 2, Javascript Completions Package 설치하기__  
	- 입력창에 'install' 입력  
	- 'Package Control: Install Package' 선택(실행)  
	- 입력창에 'javascript' 입력  
	- 'Javascript Completions' 선택(설치)  

* __Sublime Text 2에 NodeJS 빌드 시스템 추가하기__  
	- Tools > Build System > New Build System 선택  
	- 아래 내용 복붙  
	`{   
	   "cmd": ["/usr/local/bin/node", "$file"],
	   "selector": "source.js"
	}`  
	- 아래 경로로 저장  
	`'/Users/{사용자 이름}/Library/Application\ Support/Sublime\ Text\ 2/Packages/User/nodejs.sublime-build'`  
	- 빌드할 main.js를 Sublime Text 2로 열기 또는 선택  
	- Sublime Text 2 > Tools > Build System > nodejs 선택  
	- cmd + B  

---

## 디버깅 모드

- 디버깅 모드는 프로그램의 흐름을 한눈에 파악하고 각 과정의 실행시간을 출력해주는 것을 의미한다  
- 디버깅 모드로 실행시키기 위해서는 아래 처럼 커맨드를 사용할 때  
`davin$ node epub-validator.js test.epub`
- 커맨드 앞에 'DEBUG=__keyword__'를 붙여주면 된다  
`DEBUG=* davin$ node epub-validator.js test.epub`
- __keyword__에는 __app__, __epub__, __file__, __html__, __css__, __image__가 있으며 전체를 쓰고 싶을 때는 __*__를 사용한다  
- 예를 들어 __app__을 keyword로 사용하면 아래와 같이 출력된다  
```
app init +0ms  
app check args +2ms  
app check exists file +1ms  
app ePub validation +0ms  
app ePub uncompressed +614ms  
app files validation in ePub +0ms  
app finish (0) +13ms  
```
