<script setup lang="ts">
import { ref } from "vue";
import ToolsFolder, { ToolsFolderItem } from "./index.vue";
import RankList from "../rankList.vue";
import SelectTowerPop from "../selectTowerPop.vue";
import EnemyInfoPop from "../enemyInfoPop.vue";
import RankListIcon from "@/assets/img/rankList.svg";
import myGameIcon from "@/assets/img/myGame.png";
import otherImgData from "@/dataSource/otherImgData";
import { requireCDN } from "@/utils/handleImg";

const rankListVisible = ref(false);
const selectTowerVisible = ref(false);
const enemyInfoVisible = ref(false);

const onClickItem = (item: ToolsFolderItem) => {
  if (item.title === "排行榜") {
    rankListVisible.value = true;
  } else if (item.title === "塔防选择") {
    selectTowerVisible.value = true;
  } else if (item.title === "敌人信息") {
    enemyInfoVisible.value = true;
  }
};
</script>

<template>
  <ToolsFolder
    :list="[
      { icon: requireCDN('zombies-cover.png'), title: '敌人信息' },
      { icon: requireCDN('pea-cover.png'), title: '塔防选择' },
      { icon: RankListIcon, title: '排行榜' },
      { icon: myGameIcon, title: '塔防联盟', url: 'http://game.codeape.site/' },
      { icon: otherImgData.start, title: '起点logo' },
    ]"
    @on-click-item="onClickItem"
  />
  <RankList v-model:visible="rankListVisible" />
  <SelectTowerPop v-model:visible="selectTowerVisible" />
  <EnemyInfoPop v-model:visible="enemyInfoVisible" />
</template>

<style lang="less" scoped></style>
