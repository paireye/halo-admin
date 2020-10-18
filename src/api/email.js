import service from '@/utils/service'

const baseUrl = '/api/admin/emails'

const emailApi = {}

emailApi.listAll = (more = false) => {
  return service({
    url: `${baseUrl}`,
    params: {
      more: more
    },
    method: 'get'
  })
}

emailApi.createWithName = name => {
  return service({
    url: baseUrl,
    data: {
      name: name
    },
    method: 'post'
  })
}

emailApi.create = email => {
  return service({
    url: baseUrl,
    data: email,
    method: 'post'
  })
}

emailApi.get = emailId => {
  return service({
    url: `${baseUrl}/${emailId}`,
    method: 'get'
  })
}

emailApi.update = (emailId, email) => {
  return service({
    url: `${baseUrl}/${emailId}`,
    data: email,
    method: 'put'
  })
}

emailApi.delete = emailId => {
  return service({
    url: `${baseUrl}/${emailId}`,
    method: 'delete'
  })
}

emailApi.listEmails = () => {
  return service({
    url: `${baseUrl}/emails`,
    method: 'get'
  })
}

export default emailApi
