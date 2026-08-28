<script setup lang="ts">
import { ref } from 'vue'
import BranchCard from './components/BranchCard.vue'
import StoryEditor from './components/StoryEditor.vue'
import StoryTree from './components/StoryTree.vue'
import { useStory } from './composables/useStory'

const {
  storyBackground,
  fullStory,
  storyNodes,
  currentBranches,
  selectedBranch,
  requestPhase,
  validationMessage,
  storyError,
  isBusy,
  branchesDisabled,
  statusMessage,
  retryLabel,
  storyAppendVersion,
  generateBranches,
  continueWithBranch,
  retryLastAction,
  resetStory,
} = useStory()

const showResetConfirmation = ref(false)

function confirmResetStory() {
  resetStory()
  showResetConfirmation.value = false
}
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <div>
        <p class="eyebrow">AI STORY DIRECTOR</p>
        <h1>StoryBranch</h1>
        <p class="subtitle">AI 提供可能性，你决定故事走向。</p>
      </div>
      <div class="header-actions">
        <button class="reset-button" type="button" @click="showResetConfirmation = true">
          重新开始
        </button>
        <div
          v-if="showResetConfirmation"
          class="reset-confirmation"
          role="dialog"
          aria-modal="true"
          aria-label="确认重新开始"
        >
          <p>确定重新开始吗？当前故事和创作路径将被清空。</p>
          <div class="reset-confirmation__actions">
            <button type="button" @click="showResetConfirmation = false">取消</button>
            <button type="button" class="reset-confirmation__confirm" @click="confirmResetStory">
              确定重新开始
            </button>
          </div>
        </div>
      </div>
    </header>

    <section class="workspace" aria-label="故事创作工作区">
      <StoryEditor
        v-model:background="storyBackground"
        v-model:story="fullStory"
        :disabled="isBusy || storyError?.source === 'writer'"
        :planning="requestPhase === 'planning'"
        :validation-message="validationMessage"
        :has-branches="currentBranches.length > 0"
        :append-version="storyAppendVersion"
        @generate="generateBranches"
      />

      <section class="panel branch-panel">
        <div class="panel-heading">
          <span class="step-number">02</span>
          <div>
            <h2>下一步怎么发展？</h2>
            <p>AI 将在这里提供三个明显不同的发展方向。</p>
          </div>
        </div>

        <p
          v-if="statusMessage"
          class="request-feedback request-feedback--loading"
          role="status"
          aria-live="polite"
        >
          {{ statusMessage }}
        </p>

        <div v-if="storyError" class="request-feedback request-feedback--error" role="alert">
          <p>{{ storyError.message }}</p>
          <button class="retry-button" type="button" :disabled="isBusy" @click="retryLastAction">
            {{ retryLabel }}
          </button>
        </div>

        <div v-if="currentBranches.length" class="branch-list">
          <BranchCard
            v-for="(branch, index) in currentBranches"
            :key="branch.id"
            :branch="branch"
            :index="index"
            :selected="selectedBranch?.id === branch.id"
            :disabled="branchesDisabled"
            @select="continueWithBranch"
          />
        </div>

        <div v-else-if="!statusMessage && !storyError" class="branch-placeholder">
          <span class="placeholder-icon">◇</span>
          <p>输入故事后生成剧情分支</p>
          <span>由你选择故事下一步如何发展</span>
        </div>
      </section>

      <aside class="panel tree-panel">
        <div class="panel-heading">
          <span class="step-number">03</span>
          <div>
            <h2>创作路径</h2>
            <p>记录你已经做出的剧情选择。</p>
          </div>
        </div>

        <StoryTree :nodes="storyNodes" />
      </aside>
    </section>
  </main>
</template>
