import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/blade-orderProducts/orderProducts/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDetail = (id) => {
  return request({
    url: '/blade-orderProducts/orderProducts/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/blade-orderProducts/orderProducts/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/blade-orderProducts/orderProducts/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/blade-orderProducts/orderProducts/submit',
    method: 'post',
    data: row
  })
}


