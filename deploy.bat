@echo off
echo ================================
echo    塔防联盟自动部署脚本
echo ================================
echo.
cd /d "d:/实训课/game1.0"

echo 正在检查Git状态...
git status

echo.
echo 正在添加所有文件...
git add .

echo.
echo 正在提交更改...
git commit -m "自动部署更新 - %date% %time%"

echo.
echo 正在推送到GitHub...
git push origin main

echo.
echo ================================
echo       部署完成！
echo ================================
echo.
echo 您的项目已成功部署到GitHub
echo 访问地址: https://github.com/yu-xiang-bot/game9.0
echo.
pause