<script setup lang="ts">
import type { Branch } from '../types/story'

defineProps<{
  branch: Branch
  index: number
  selected: boolean
  disabled: boolean
}>()

defineEmits<{
  select: [branch: Branch]
}>()
</script>

<template>
  <article
    class="branch-card"
    :class="{
      'branch-card--selected': selected,
      'branch-card--disabled': disabled,
    }"
  >
    <div class="branch-card__topline">
      <span class="branch-index">方向 {{ index + 1 }}</span>
      <span class="tone-tag">{{ branch.tone }}</span>
    </div>
    <h3>{{ branch.title }}</h3>
    <p class="branch-description">{{ branch.description }}</p>
    <p v-if="branch.risk" class="branch-risk">
      <span>风险</span>
      {{ branch.risk }}
    </p>
    <button
      class="select-branch-button"
      type="button"
      :disabled="disabled"
      @click="$emit('select', branch)"
    >
      {{ selected ? '已选择此方向' : '选择这个方向' }}
    </button>
  </article>
</template>
