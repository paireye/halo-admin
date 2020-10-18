<template>
  <div>
    <a-row :gutter="12">
      <a-col
        :xl="10"
        :lg="10"
        :md="10"
        :sm="24"
        :xs="24"
        class="pb-3"
      >
        <a-card
          :title="title"
          :bodyStyle="{ padding: '16px' }"
        >
          <a-form-model
            ref="emailForm"
            :model="form.model"
            :rules="form.rules"
            layout="horizontal"
          >
            <a-form-model-item
              label="名称："
              help="* 页面上所显示的名称"
              prop="name"
            >
              <a-input v-model="form.model.name" />
            </a-form-model-item>

            <a-form-model-item
              label="邮箱："
              help="* 邮箱"
              prop="value"
            >
              <a-input v-model="form.model.value" />
            </a-form-model-item>

            <a-form-model-item
              label="描述："
              help="* 一般为单个邮箱页面的标识，最好为英文"
              prop="description"
            >
              <a-input v-model="form.model.description" />
            </a-form-model-item>
            <a-form-model-item>
              <ReactiveButton
                v-if="!isUpdateMode"
                type="primary"
                @click="handleCreateOrUpdateEmail"
                @callback="handleSavedCallback"
                :loading="form.saving"
                :errored="form.errored"
                text="保存"
                loadedText="保存成功"
                erroredText="保存失败"
              ></ReactiveButton>
              <a-button-group v-else>
                <ReactiveButton
                  type="primary"
                  @click="handleCreateOrUpdateEmail"
                  @callback="handleSavedCallback"
                  :loading="form.saving"
                  :errored="form.errored"
                  text="更新"
                  loadedText="更新成功"
                  erroredText="更新失败"
                ></ReactiveButton>
                <a-button
                  type="dashed"
                  @click="form.model = {}"
                >返回添加
                </a-button>
              </a-button-group>
              <a-popconfirm
                :title="'你确定要删除【' + form.model.name +'<'+form.model.value + '>】邮箱？'"
                @confirm="handleDeleteEmail(form.model.id)"
                okText="确定"
                cancelText="取消"
                v-if="isUpdateMode"
              >
                <a-button
                  type="danger"
                  class="float-right"
                >删除
                </a-button>
              </a-popconfirm>
            </a-form-model-item>
          </a-form-model>
        </a-card>
      </a-col>
      <a-col
        :xl="14"
        :lg="14"
        :md="14"
        :sm="24"
        :xs="24"
        class="pb-3"
      >
        <a-card
          title="所有邮箱"
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
                <span>{{ email.postCount }} 篇文章</span>
              </template>
              <a-tag
                color="blue"
                style="margin-bottom: 8px;cursor:pointer;"
                @click="form.model = email"
              >{{ email.name }}<{{ email.value }}></a-tag>
            </a-tooltip>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import emailApi from '@/api/email'

export default {
  data() {
    return {
      list: {
        data: [],
        loading: false
      },
      form: {
        model: {},
        saving: false,
        errored: false,
        rules: {
          name: [
            { required: true, message: '* 邮箱名称不能为空', trigger: ['change'] },
            { max: 255, message: '* 邮箱名称的字符长度不能超过 255', trigger: ['change'] }
          ],
          value: [
            { required: true, message: '* 邮箱账号不能为空', trigger: ['change'] },
            { type: 'email', message: '* 邮箱账号格式不正确', trigger: ['change'] }
          ]
        }
      }
    }
  },
  computed: {
    title() {
      if (this.isUpdateMode) {
        return '修改邮箱'
      }
      return '添加邮箱'
    },
    isUpdateMode() {
      return !!this.form.model.id
    }
  },
  created() {
    this.handleListEmails()
  },
  methods: {
    handleListEmails() {
      this.list.loading = true
      emailApi
        .listAll(true)
        .then(response => {
          this.list.data = response.data.data
        })
        .finally(() => {
          setTimeout(() => {
            this.list.loading = false
          }, 200)
        })
    },
    handleDeleteEmail(emailId) {
      emailApi.delete(emailId).finally(() => {
        this.form.model = {}
        this.handleListEmails()
      })
    },
    handleCreateOrUpdateEmail() {
      const _this = this
      _this.$refs.emailForm.validate(valid => {
        if (valid) {
          this.form.saving = true
          if (_this.isUpdateMode) {
            emailApi
              .update(_this.form.model.id, _this.form.model)
              .catch(() => {
                this.form.errored = true
              })
              .finally(() => {
                setTimeout(() => {
                  _this.form.saving = false
                }, 400)
              })
          } else {
            emailApi
              .create(_this.form.model)
              .catch(() => {
                this.form.errored = true
              })
              .finally(() => {
                setTimeout(() => {
                  _this.form.saving = false
                }, 400)
              })
          }
        }
      })
    },
    handleSavedCallback() {
      const _this = this
      if (_this.form.errored) {
        _this.form.errored = false
      } else {
        _this.form.model = {}
        _this.handleListEmails()
      }
    }
  }
}
</script>
