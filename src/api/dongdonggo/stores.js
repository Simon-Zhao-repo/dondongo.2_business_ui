import request from '@/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/blade-stores/stores/list',
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
    url: '/blade-stores/stores/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export const remove = (ids) => {
  return request({
    url: '/blade-stores/stores/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/blade-stores/stores/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/blade-stores/stores/submit',
    method: 'post',
    data: row
  })
}


export const auditPass = storesIds => {
  return request({
    url: '/blade-stores/stores/audit-pass',
    method: 'post',
    params: {
      storesIds,
    },
  });
};

export const auditRefuse = storesIds => {
  return request({
    url: '/blade-stores/stores/audit-refuse',
    method: 'post',
    params: {
      storesIds,
    },
  });
};
