<script setup lang="ts">
import type { StoryNode } from '../types/story'

defineProps<{
  nodes: StoryNode[]
}>()
</script>

<template>
  <div v-if="nodes.length" class="story-tree">
    <article
      v-for="(node, index) in nodes"
      :key="node.id"
      class="tree-node"
      :class="{ 'tree-node--current': index === nodes.length - 1 }"
    >
      <div class="tree-node__rail">
        <span class="tree-node__dot" />
        <span v-if="index < nodes.length - 1" class="tree-node__line" />
      </div>
      <div class="tree-node__content">
        <span class="tree-node__label">
          {{ index === nodes.length - 1 ? '当前节点' : `第 ${index + 1} 段` }}
        </span>
        <strong>{{ node.title }}</strong>
        <p>{{ node.summary }}</p>
        <span v-if="node.selectedBranch" class="tree-node__choice">
          选择：{{ node.selectedBranch.title }}
        </span>
      </div>
    </article>
  </div>

  <div v-else class="tree-placeholder">
    <span class="tree-dot tree-dot--current" />
    <div>
      <strong>当前节点</strong>
      <p>你的故事路径将从这里开始</p>
    </div>
  </div>
</template>
