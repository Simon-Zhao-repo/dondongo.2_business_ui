import request from '@/axios';

// 获取订单的自定义表单答案
export const getFormAnswers = (orderId) => {
  return request({
    url: '/blade-userProducts/userOrderFormAnswers/list',
    method: 'get',
    params: {
      orderId
    }
  });
};
