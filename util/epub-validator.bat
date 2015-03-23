@ECHO off

ECHO Start validation batches.

IF NOT EXIST epub-validator.exe (
	ECHO Not found epub-validator.exe.
	@ECHO on
) ELSE (
	SETLOCAL enabledelayedexpansion
	SET total=0
	SET count=0
	SET success=0
	SET fail=0
	FOR /r %%i in (*.epub) do (
		SET /A total+=1 
	)
	FOR /r %%i in (*.epub) do (
		IF EXIST "%%i.txt" (
			DEL /Q /F "%%i.txt"
		)
		epub-validator.exe "%%i" >> "%%i.txt"
		SET /A count+=1
		IF %ERRORLEVEL% EQU 0 (
			SET /A success+=1
			ECHO !count!/!total!: %%i validation did succeed.
		) ELSE (
			SET /A fail+=1
			ECHO !count!/!total!: %%i validation did not succeed.
		)
	)
	ECHO Validation batches completed. [success: !success!, fail: !fail!]
)

PAUSE press any key to finish...
