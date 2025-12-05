-- 插入初始数据：防御塔类型
INSERT INTO tower_types (tower_name, tower_code, description, damage, attack_range, attack_speed, cost, max_level, element_type) VALUES
('冰之星辉', 'aixi', '减速敌人，控制型防御塔', 25, 3.5, 1.2, 150, 3, 'ice'),
('破阵枪骑', 'delaiwen', '多目标攻击，范围伤害', 40, 2.8, 0.8, 200, 3, 'physical'),
('炼狱之爪', 'ez', '快速连发，单体高伤害', 15, 2.0, 2.5, 100, 3, 'fire'),
('幽影射手', 'huonan', '远程高伤害，大攻击范围', 80, 5.0, 0.5, 300, 3, 'physical'),
('奥术弹幕', 'jin', '穿透攻击，可攻击多个敌人', 30, 3.0, 1.0, 250, 3, 'lightning'),
('烈焰熔炉', 'lanbo', '群体伤害，范围攻击', 50, 2.5, 0.7, 350, 3, 'fire'),
('寒冰射手', 'twitch', '减速与多重箭矢', 20, 3.2, 1.5, 180, 3, 'ice'),
('回旋战斧', 'ejiate', '旋转飞斧，可攻击多个目标', 35, 2.8, 1.1, 220, 3, 'physical'),
('烈焰法师', 'fashi', '持续火焰伤害', 10, 3.0, 0.9, 280, 3, 'fire'),
('暗影毒师', 'dushi', '中毒效果，持续伤害', 8, 2.7, 1.3, 190, 3, 'poison')
ON CONFLICT (tower_code) DO NOTHING;

-- 插入初始数据：敌人类型
INSERT INTO enemy_types (enemy_name, enemy_code, health, speed, armor, magic_resist, coin_reward, score_reward, size) VALUES
('普通僵尸', 'zombie_normal', 100, 1.0, 0, 0, 10, 5, 'small'),
('铁门僵尸', 'zombie_armored', 300, 0.6, 10, 0, 25, 15, 'medium'),
('橄榄球僵尸', 'zombie_fast', 80, 2.0, 5, 0, 15, 8, 'small'),
('报纸僵尸', 'zombie_weak', 50, 0.8, 0, 0, 20, 10, 'small'),
('舞蹈僵尸', 'zombie_dancer', 150, 1.2, 2, 5, 30, 20, 'medium'),
('巨人僵尸', 'zombie_giant', 1000, 0.4, 20, 10, 100, 50, 'large'),
('飞行僵尸', 'zombie_flying', 60, 1.5, 0, 15, 18, 12, 'small'),
('法师僵尸', 'zombie_mage', 120, 0.9, 0, 25, 35, 25, 'medium'),
('Boss僵尸', 'zombie_boss', 5000, 0.3, 30, 20, 500, 200, 'boss')
ON CONFLICT (enemy_code) DO NOTHING;

-- 插入初始数据：游戏关卡
INSERT INTO game_levels (level_name, level_number, difficulty, map_data, initial_coins, max_waves, required_stars, completion_bonus_coins, completion_bonus_gems) VALUES
('新手教学', 1, 'easy', '{"map": "beginner", "path": [[0,0],[10,0]]}', 800, 3, 0, 100, 5),
('初级挑战', 2, 'easy', '{"map": "basic", "path": [[0,0],[0,5],[10,5]]}', 600, 5, 1, 120, 6),
('中级考验', 3, 'medium', '{"map": "intermediate", "path": [[0,0],[5,0],[5,5],[10,5]]}', 500, 7, 2, 150, 8),
('高级对决', 4, 'medium', '{"map": "advanced", "path": [[0,0],[0,10],[10,10]]}', 400, 10, 4, 200, 10),
('专家模式', 5, 'hard', '{"map": "expert", "path": [[0,0],[3,3],[7,3],[10,0]]}', 300, 15, 6, 300, 15),
('终极挑战', 6, 'expert', '{"map": "ultimate", "path": [[0,0],[2,2],[4,0],[6,2],[8,0],[10,2]]}', 200, 20, 10, 500, 25)
ON CONFLICT (level_number) DO NOTHING;

-- 插入初始数据：成就
INSERT INTO achievements (achievement_name, description, achievement_type, category, condition_type, condition_value, reward_coins, reward_gems) VALUES
('初出茅庐', '完成第一关', 'progress', 'level', 'completion', 1, 100, 5),
('塔防大师', '建造100座防御塔', 'progress', 'tower', 'build_count', 100, 200, 10),
('僵尸杀手', '击杀1000个敌人', 'progress', 'enemy', 'kill_count', 1000, 300, 15),
('完美通关', '获得3星评价通关', 'skill', 'level', 'completion', 1, 150, 8),
('连击高手', '达成50连击', 'skill', 'combo', 'combo', 50, 100, 5),
('快速通关', '在3分钟内通关', 'skill', 'level', 'time', 180, 200, 10),
('财富积累', '累计获得10000金币', 'progress', 'general', 'score', 10000, 500, 20),
('等级达人', '达到玩家等级10级', 'progress', 'general', 'completion', 10, 300, 12),
('游戏专家', '累计游戏100局', 'progress', 'general', 'completion', 100, 400, 18),
('无伤通关', '不受到伤害完成关卡', 'skill', 'level', 'completion', 1, 250, 15)
ON CONFLICT DO NOTHING;

-- 插入初始数据：商店物品
INSERT INTO shop_items (item_name, description, item_type, price_coins, price_gems, effect_duration, effect_value) VALUES
('金币加倍', '下一局游戏金币收益翻倍', 'powerup', 50, 5, 1, '{"coin_multiplier": 2}'),
('经验加成', '下一局游戏经验值增加50%', 'powerup', 80, 8, 1, '{"exp_multiplier": 1.5}'),
('即时修复', '立即修复所有防御塔', 'powerup', 30, 3, 0, '{"repair_all": true}'),
('强化弹药', '所有防御塔伤害增加25%', 'powerup', 100, 10, 300, '{"damage_boost": 1.25}'),
('时间减缓', '敌人移动速度降低50%', 'powerup', 120, 12, 180, '{"enemy_slow": 0.5}'),
('护盾发生器', '基地获得额外护盾', 'powerup', 150, 15, 0, '{"base_shield": 100}'),
('神秘宝箱', '随机获得奖励', 'cosmetic', 200, 20, 0, '{"random_reward": true}'),
('玩家头像框', '炫酷的专属头像框', 'cosmetic', 0, 50, 0, '{"avatar_frame": "golden"}'),
('防御塔皮肤', '自定义防御塔外观', 'cosmetic', 0, 30, 0, '{"tower_skin": "crystal"}'),
('能量补充', '立即获得1000金币', 'boost', 0, 20, 0, '{"instant_coins": 1000}')
ON CONFLICT DO NOTHING;