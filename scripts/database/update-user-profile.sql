-- 更新现有用户表结构，添加新的个人信息字段
-- 如果表已存在且有数据，则添加新字段

-- 添加邮箱字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100);

-- 添加性别字段，默认值为 'other'
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'other';

-- 添加性别约束
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS check_gender 
  CHECK (gender IN ('male', 'female', 'other'));

-- 添加个人简介字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- 更新现有记录的默认值
UPDATE users SET gender = 'other' WHERE gender IS NULL;
UPDATE users SET bio = '' WHERE bio IS NULL;

-- 为新字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);

-- 注释说明：
-- 1. email: 用户邮箱地址，用于找回密码或通知
-- 2. gender: 用户性别，可选值为 male, female, other
-- 3. bio: 用户个人简介，支持长文本描述