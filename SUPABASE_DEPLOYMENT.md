# 塔防联盟 - Supabase 部署指南

本指南将帮助您将塔防联盟游戏自动部署到 Supabase 存储服务。

## 前置条件

- 一个 GitHub 仓库（当前项目）
- 一个 Supabase 账户（[https://app.supabase.com](https://app.supabase.com)）

## 步骤 1: 在 Supabase 中创建项目

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project" 创建新项目
3. 选择组织（如果没有组织，会自动创建一个）
4. 输入项目名称，例如：`tower-defense-game`
5. 设置数据库密码（请保存好这个密码）
6. 选择地区（建议选择离您最近的地区）
7. 点击 "Create new project"，等待项目创建完成

## 步骤 2: 创建存储桶

1. 在 Supabase 控制台中，选择您的项目
2. 点击左侧菜单中的 **Storage**
3. 点击 **New Bucket** 按钮
4. 填写以下信息：
   - **Name**: `game-assets`（或您喜欢的名称）
   - **File size limit**: 取消勾选或设置足够大的限制（例如 50MB）
   - **Public bucket**: 勾选此项，使存储桶公开可访问
5. 点击 **Save**

## 步骤 3: 获取 Supabase API 凭证

1. 在 Supabase 控制台，点击左下角的 **Settings** ⚙️ 图标
2. 选择 **API** 菜单
3. 复制以下两个值：
   - **Project URL**（格式：`https://xyzcompany.supabase.co`）
   - **service_role key**（以 `eyJ...` 开头的长字符串）

⚠️ **重要**: 请使用 `service_role key` 而不是 `anon key`，因为我们需要绕过 RLS 限制。

## 步骤 4: 在 GitHub 仓库设置 Secrets

1. 打开您的 GitHub 仓库
2. 点击顶部的 **Settings** 选项卡
3. 在左侧菜单中，选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret** 按钮，添加以下 Secrets：

### Secret 1: SUPABASE_URL
- **Name**: `SUPABASE_URL`
- **Value**: 粘贴您在步骤 3 中复制的 Project URL

### Secret 2: SUPABASE_KEY
- **Name**: `SUPABASE_KEY`
- **Value**: 粘贴您在步骤 3 中复制的 service_role key

### Secret 3: BUCKET_NAME (可选)
- **Name**: `BUCKET_NAME`
- **Value**: 您在步骤 2 中创建的存储桶名称（如果不设置，将使用默认值 `game-assets`）

## 步骤 5: 触发首次部署

部署工作流已经配置完成，现在可以通过以下任一方式触发部署：

### 方式 1: 推送代码到仓库

```bash
git add .
git commit -m "配置 Supabase 自动部署"
git push origin main
```

### 方式 2: 手动触发

1. 在 GitHub 仓库中，点击 **Actions** 选项卡
2. 在左侧选择 "Deploy Game to Supabase" 工作流
3. 点击 "Run workflow" 按钮
4. 选择分支（通常是 main）
5. 点击 "Run workflow" 绿色按钮

## 步骤 6: 查看部署状态

1. 在 GitHub 仓库中，点击 **Actions** 选项卡
2. 您应该能看到名为 "Deploy Game to Supabase" 的工作流正在运行
3. 点击工作流可以查看详细日志
4. 如果所有步骤都显示绿色 ✅，表示部署成功

## 步骤 7: 访问游戏

部署成功后，您可以通过以下 URL 访问游戏：

```
https://<您的项目引用>.supabase.co/storage/v1/object/public/game-assets/index.html
```

其中 `<您的项目引用>` 是您的 Supabase 项目的唯一标识符，您可以在 Supabase 项目设置的 **General** 选项卡中找到。

## 常见问题解决

### 问题 1: 上传失败

**解决方案:**
- 检查 GitHub Secrets 是否正确设置（特别是 `SUPABASE_KEY`）
- 确保存储桶名称与 Secrets 中的 `BUCKET_NAME` 匹配（区分大小写）
- 查看 Actions 日志中的具体错误信息

### 问题 2: 游戏加载但资源缺失

**解决方案:**
- 确保所有资源路径使用相对路径
- 检查浏览器控制台错误（F12 开发者工具）
- 确认所有文件都已成功上传到 Supabase Storage

### 问题 3: 访问时显示 404 错误

**解决方案:**
- 检查 `index.html` 是否已上传到存储桶的根目录
- 确认存储桶已设置为公开访问
- 验证访问 URL 格式是否正确

### 问题 4: 需要更新游戏

**解决方案:**
- 修改代码后，只需推送到 GitHub 仓库
- GitHub Actions 会自动重新部署
- 浏览器可能需要强制刷新（Ctrl+F5）才能看到最新版本

## 高级配置

### 添加缓存破坏

在 `index.html` 的 `<head>` 中添加：

```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### 多环境部署

您可以修改 `.github/workflows/deploy-supabase.yml` 文件，根据分支部署到不同的存储桶：

```yaml
env:
  BUCKET_NAME: ${{ github.ref == 'refs/heads/main' && 'prod-game' || 'dev-game' }}
```

### 部署通知

您可以在工作流中添加 Slack/Discord 通知步骤：

```yaml
- name: Notify Discord
  uses: Ilshidur/action-discord@master
  env:
    DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
  with:
    args: '🎮 游戏已部署! 访问: ${{ steps.deploy.outputs.game_url }}'
```

## 总结

完成以上步骤后，您的塔防联盟游戏将在每次代码推送时自动部署到 Supabase！您可以通过简单的 `git push` 命令来更新游戏，整个过程完全自动化。

如有任何问题，请查看 GitHub Actions 的日志以获取详细的错误信息。