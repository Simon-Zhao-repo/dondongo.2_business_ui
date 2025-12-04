<template>
  <el-form
    class="login-form"
    status-icon
    :rules="loginRules"
    ref="loginForm"
    :model="loginForm"
    label-width="0"
  >
    <!-- 第一步：邮箱验证 -->
    <div v-if="step === 1">
      <el-form-item prop="email">
        <el-input
          v-model="loginForm.email"
          auto-complete="off"
          :placeholder="$t('login.email')"
        >
          <template #prefix>
            <i class="icon-xiaoxitongzhi" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="code">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          :placeholder="$t('login.emailCode')"
        >
          <template #prefix>
            <i class="icon-yanzhengma" />
          </template>
          <template #append>
            <span @click="handleSendEmailCode" class="msg-text" :class="[{ display: emailCodeSending }]">
              {{ emailCodeText }}
            </span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.prevent="verifyEmail" class="login-submit">
          {{ $t('login.verify') }}
        </el-button>
        <el-button @click.prevent="handleBack" class="register-submit">
          {{ $t('login.back') }}
        </el-button>
      </el-form-item>
    </div>

    <!-- 第二步：重设密码 -->
    <div v-if="step === 2">
      <el-form-item prop="password">
        <el-input
          type="password"
          show-password
          v-model="loginForm.password"
          auto-complete="off"
          :placeholder="$t('login.password')"
        >
          <template #prefix>
            <i class="icon-mima" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password1">
        <el-input
          type="password"
          show-password
          v-model="loginForm.password1"
          auto-complete="off"
          :placeholder="$t('login.password1')"
        >
          <template #prefix>
            <i class="icon-mima" />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click.prevent="resetPassword" class="login-submit">
          {{ $t('login.resetPassword') }}
        </el-button>
        <el-button @click.prevent="handleBack" class="register-submit">
          {{ $t('login.back') }}
        </el-button>
      </el-form-item>
    </div>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex';
import { sendEmailCode, validateEmailCode, resetPasswordByEmail } from '@/api/user';

export default {
  name: 'resetPassword',
  data() {
    return {
      step: 1, // 1: 邮箱验证, 2: 重设密码
      emailCodeText: '获取验证码',
      emailCodeTime: 60,
      emailCodeSending: false,
      loginForm: {
        //邮箱
        email: '',
        //邮箱验证码
        code: '',
        //密码
        password: '',
        //确认密码
        password1: '',
      },
      loginRules: {
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        code: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        password1: [{ required: true, message: '请输入确认密码', trigger: 'blur' }],
      },
    };
  },
  methods: {
    handleSendEmailCode() {
      if (this.loginForm.email === '') {
        this.$message.warning('请输入邮箱');
        return;
      }
      
      if (this.emailCodeSending) return;
      
      // 发送验证码
      sendEmailCode(this.loginForm.email).then(res => {
        const data = res.data;
        if (data.success) {
          this.emailCodeSending = true;
          this.emailCodeText = this.emailCodeTime + 's后重新获取';
          
          const timer = setInterval(() => {
            this.emailCodeTime--;
            this.emailCodeText = this.emailCodeTime + 's后重新获取';
            
            if (this.emailCodeTime <= 0) {
              clearInterval(timer);
              this.emailCodeTime = 60;
              this.emailCodeText = '获取验证码';
              this.emailCodeSending = false;
            }
          }, 1000);
          
          this.$message.success('验证码已发送到您的邮箱');
        } else {
          this.$message.error(data.msg || '验证码发送失败');
        }
      }).catch(() => {
        this.$message.error('验证码发送失败');
      });
    },
    
    verifyEmail() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return;
        
        // 验证邮箱验证码
        validateEmailCode(this.loginForm.email, this.loginForm.code).then(res => {
          const data = res.data;
          if (data.success) {
            // 验证成功，进入第二步
            this.step = 2;
            this.$message.success('邮箱验证成功，请重设密码');
          } else {
            this.$message.error(data.msg || '验证码验证失败');
          }
        }).catch(() => {
          this.$message.error('验证码验证失败');
        });
      });
    },
    
    resetPassword() {
      if (this.loginForm.password !== this.loginForm.password1) {
        this.$message.error('两次密码输入不一致');
        return;
      }
      
      this.$refs.loginForm.validate(valid => {
        if (!valid) return;
        
        const loading = this.$loading({
          lock: true,
          text: '重设密码中,请稍后',
          background: 'rgba(0, 0, 0, 0.7)',
        });
        
        // 调用密码重置接口
        resetPasswordByEmail(this.loginForm.email, this.loginForm.code, this.loginForm.password).then(res => {
          loading.close();
          if (res.data.success) {
            this.$alert('密码重置成功，请使用新密码登录', '成功', {
              confirmButtonText: '确定',
              callback: () => {
                this.$parent.activeName = 'user';
              },
            });
          } else {
            this.$message.error(res.data.msg || '密码重置失败');
          }
        }).catch(error => {
          loading.close();
          this.$message.error('密码重置失败: ' + (error.message || '未知错误'));
        });
      });
    },
    
    handleBack() {
      this.$parent.activeName = 'user';
    },
  },
};
</script>

<style>
.msg-text {
  display: block;
  width: 120px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}
.msg-text.display {
  color: #ccc;
  cursor: not-allowed;
}
</style> 