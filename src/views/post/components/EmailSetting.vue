<template>
  <a-drawer
    title="邮件分享"
    :width="isMobile() ? '100%' : '480'"
    closable
    :visible="visible"
    destroyOnClose
    @close="onClose"
  >
    <a-row
      type="flex"
      align="middle"
    >
      <a-col :span="24">
        <a-list itemLayout="horizontal">
          <a-list-item>
            <a-list-item-meta>
              <template slot="description">
                <p
                  v-html="description"
                  class="comment-drawer-content"
                ></p>
              </template>
              <h3 slot="title">{{ title }}</h3>
            </a-list-item-meta>
          </a-list-item>
        </a-list>
      </a-col>
      <a-divider />

      <a-col :span="24">
        <h3 class="post-setting-drawer-title">通知邮箱</h3>
        <div class="post-setting-drawer-item">
          <a-form layout="vertical">
            <a-form-item>
              <EmailSelect v-model="selectedEmailIds" />
            </a-form-item>
          </a-form>
        </div>
      </a-col>
      <a-divider />

      <a-col
        :span="24"
        class="pb-3">
        <a-card
          title="已发送邮箱"
          :bodyStyle="{ padding: '16px' }"
        >
          <a-spin :spinning="list.loading">
            <a-empty v-if="list.data.length==0" />
            <a-tooltip
              placement="topLeft"
              v-for="email in list.data"
              :key="email.id"
              v-else
            >
              <template slot="title">
                <span>{{ email.name }}</span>
              </template>
              <a-tag
                color="blue"
                style="margin-bottom: 8px;cursor:pointer;"
              >{{ email.name }}<{{ email.value }}>
              </a-tag>
            </a-tooltip>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
    <a-divider class="divider-transparent" />

    <div class="bottom-control">
      <a-space>
        <ReactiveButton
          type="primary"
          icon="share-alt"
          text="发送邮件"
          loadedText="发送成功"
          @click="handleSendEmailClick"
          @callback="handleSavedCallback"
          erroredText="发送失败"
          :loading="sendEmailLoading"
        ></ReactiveButton>
      </a-space>
    </div>

  </a-drawer>
</template>
<script>
// components
import EmailSelect from '@views/post/components/EmailSelect'

// libs
import { mixin, mixinDevice } from '@/utils/mixin.js'

// apis
import postApi from '@api/post'

export default {
  name: 'EmailSetting',
  mixins: [mixin, mixinDevice],
  props: {
    visible: {
      type: Boolean,
      required: false,
      default: false
    },
    title: {
      type: String,
      required: false,
      default: ''
    },
    description: {
      type: String,
      required: false,
      default: ''
    },
    target: {
      type: String,
      required: false,
      default: ''
    },
    id: {
      type: Number,
      required: true,
      default: 0
    }
  },
  components: {
    EmailSelect
  },
  data() {
    return {
      list: {
        data: [],
        loading: false
      },
      selectedEmailIds: [],
      sendEmailLoading: false,
      confirmVisible: false,
      draftSaving: false,
      savedErrored: false,
      draftSavedErrored: false,
    }
  },
  watch: {
    visible(val) {
      this.$log.info('watch visible', val)
      if (val) {
        this.handleListEmails()
      } else {
        this.selectedEmailIds = []
      }
    },
    onRefreshVisibleSetting(val) {
      this.$emit('onRefreshVisibleSetting', val)
    }
  },
  computed: {},
  created() {
    this.$log.info('created', this.id)
  },
  methods: {
    handleListEmails() {
      this.list.loading = true
      postApi
        .getPostEmail(this.id)
        .then(response => {
          this.$log.info('handleListEmails ', response.data.data)
          this.list.data = response.data.data.emails
        })
        .finally(() => {
          setTimeout(() => {
            this.list.loading = false
          }, 200)
        })
    },
    handleEmailClick(postId) {
      this.sendEmailLoading = true
      this.$message.success('操作成功！' + postId)
      setTimeout(() => {
        this.sendEmailLoading = false
      }, 2000)
    },
    handleSendEmailClick() {
      this.sendEmailLoading = true
      if (this.selectedEmailIds.length === 0) {
        this.$notification['error']({
          message: '提示',
          description: '邮箱不能为空！'
        })
        this.sendEmailLoading = false
        return
      }
      this.$log.debug('put request selected email ids ', this.selectedEmailIds)
      // Update the post
      postApi
        .updateByEmail(this.id, { 'emailIds': this.selectedEmailIds }, false)
        .then((response) => {
          this.$message.success('操作成功！')
          if (this.selectedPost.status === 'DRAFT') {
            this.draftSavedErrored = true
          } else {
            this.savedErrored = true
          }
        })
        .finally(() => {
          setTimeout(() => {
            this.sendEmailLoading = false
          }, 1000)
        })
    },
    handleSavedCallback() {
      if (this.draftSavedErrored || this.savedErrored) {
        this.draftSavedErrored = false
        this.savedErrored = false
      } else {
        this.$emit('onSaved', true)
        this.$router.push({ name: 'PostList' })
      }
    },
    onClose() {
      this.selectedEmailIds = []
      this.$emit('close', false)
    }
  }
}
</script>
