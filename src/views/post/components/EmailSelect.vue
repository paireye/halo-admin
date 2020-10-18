<template>
  <div>
    <a-select
      v-model="selectedEmailNames"
      class="w-full"
      allowClear
      mode="tags"
      placeholder="选择或输入通知的邮箱,邮箱 name:your mail"
      @change="handleChange"
    >
      <a-select-option
        v-for="email in emails"
        :key="email.id"
        :value="email.name"
      >{{ email.name }}<{{ email.value }}></a-select-option>
    </a-select>
  </div>
</template>

<script>
import emailApi from '@/api/email'
import axios from 'axios'

export default {
  name: 'EmailSelect',
  model: {
    prop: 'emailIds',
    event: 'change'
  },
  props: {
    emailIds: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data() {
    return {
      emails: [],
      selectedEmailNames: []
    }
  },
  created() {
    this.handleListEmails()
  },
  watch: {
    emails(newValue, oldValue) {
      // 解决emails未赋上值就使用导致的取值报错问题
      if (newValue) {
        this.selectedEmailNames = this.emailIds.map(emailId => this.emailIdMap[emailId].name)
      }
    }
  },
  computed: {
    emailIdMap() {
      const emailIdMap = {}
      this.emails.forEach(email => {
        emailIdMap[email.id] = email
      })
      return emailIdMap
    },
    emailNameMap() {
      const emailNameMap = {}
      this.emails.forEach(email => {
        emailNameMap[email.name] = email
      })
      return emailNameMap
    }
  },
  methods: {
    handleListEmails(callback) {
      emailApi.listAll(true).then(response => {
        this.emails = response.data.data
        if (callback) {
          callback()
        }
      })
    },
    handleChange() {
      this.$log.debug('Changed')
      const emailNamesToCreate = this.selectedEmailNames.filter(emailName => !this.emailNameMap[emailName])

      this.$log.debug('Email names to create', emailNamesToCreate)

      if (emailNamesToCreate === []) {
        const emailIds = this.selectedEmailNames.map(emailName => this.emailNameMap[emailName].id)
        // If empty
        this.$emit('change', emailIds)
        return
      }

      const createPromises = emailNamesToCreate.map(emailName => {
        const email = emailName.split(':')
        this.$log.debug('Email names ', emailName, email, email.length)
        if (email.length === 2) {
          const emailObj = {}
          emailObj['name'] = email[0]
          emailObj['value'] = email[1]
          emailObj['description'] = email[0]
          this.$log.debug('Email request create ', emailObj)
          emailApi.create(emailObj)
        }
      })

      axios.all(createPromises).then(
        axios.spread(() => {
          this.handleListEmails(() => {
            this.$log.debug('Email name map', this.emailNameMap)
            // Get all email id
            const emailIds = this.selectedEmailNames.map(emailName => this.emailNameMap[emailName].id)
            this.$emit('change', emailIds)
          })
        })
      )
    }
  }
}
</script>
