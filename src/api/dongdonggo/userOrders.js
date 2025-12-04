import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/blade-userProducts/userOrders/list',
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
    url: '/blade-userProducts/userOrders/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/blade-userProducts/userOrders/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/blade-userProducts/userOrders/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/blade-userProducts/userOrders/submit',
    method: 'post',
    data: row
  })
}

//管理员取消订单
export const adminCancel = (orderId) => {
  return request({
    url: '/blade-userProducts/userOrders/adminCancel',
    method: 'post',
    params: {
      orderId,
    }
  })
}
//发货
export const ship = (orderId) => {
  return request({
    url: '/blade-userProducts/userOrders/ship',
    method: 'post',
    params: {
      orderId,
    }
  })
}
