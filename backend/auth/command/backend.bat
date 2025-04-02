@echo off
wt --title "Backend" -d .. cmd /k "npm run dev" `; split-pane -V --title "Backend" -d .. cmd /k 

@REM timeout /t 2

@REM wt --title "Frontend" -d .. cmd /k "npm run dev" `; split-pane -V --title "Frontend" -d .. cmd /k 

