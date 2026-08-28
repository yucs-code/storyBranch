<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const storyBackground = defineModel<string>('background', { required: true })
const fullStory = defineModel<string>('story', { required: true })

const props = defineProps<{
  disabled: boolean
  planning: boolean
  validationMessage: string
  hasBranches: boolean
  appendVersion: number
}>()

const fullStoryInput = ref<HTMLTextAreaElement>()
const storyCharacterCount = computed(() => fullStory.value.length)

watch(
  () => props.appendVersion,
  async (version, previousVersion) => {
    if (version <= previousVersion) return

    await nextTick()
    if (fullStoryInput.value) {
      fullStoryInput.value.scrollTop = fullStoryInput.value.scrollHeight
    }
  },
)

defineEmits<{
  generate: []
}>()
</script>

<template>
  <section class="panel editor-panel">
    <div class="panel-heading">
      <span class="step-number">01</span>
      <div>
        <h2>故事正文</h2>
        <p>保留故事前提，并持续累积每一轮真正写入故事的正文。</p>
      </div>
    </div>

    <label class="field-label" for="story-background">故事背景</label>
    <textarea
      id="story-background"
      v-model="storyBackground"
      :disabled="disabled"
      class="story-input story-input--background"
      placeholder="例如：现代都市背景下的时间悬疑故事……"
    />

    <div class="field-heading">
      <label class="field-label" for="full-story">完整故事正文</label>
      <span class="character-count">{{ storyCharacterCount }} 字</span>
    </div>
    <textarea
      id="full-story"
      ref="fullStoryInput"
      v-model="fullStory"
      :disabled="disabled"
      class="story-input story-input--full"
      placeholder="输入故事开场；后续生成的正文会持续追加在这里……"
    />

    <button
      class="primary-button"
      :class="{ 'primary-button--secondary': hasBranches }"
      type="button"
      :disabled="disabled"
      :aria-busy="planning"
      @click="$emit('generate')"
    >
      {{
        planning
          ? 'AI 正在规划下一步剧情…'
          : hasBranches
            ? '重新生成剧情方向'
            : '生成剧情分支'
      }}
    </button>

    <p v-if="validationMessage" class="validation-message" role="alert">
      {{ validationMessage }}
    </p>
  </section>
</template>
