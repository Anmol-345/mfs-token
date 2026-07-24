import api from './api';

export const otpService = {
  send: (data: { recipient: string; purpose: string }) =>
    api.post('/user/otp/send', data).then((r) => r.data),

  verify: (data: { recipient: string; purpose: string; otp: string }) =>
    api.post('/user/otp/verify', data).then((r) => r.data),
};
