<template>
  <el-form
    class="login-form"
    status-icon
    :rules="loginRules"
    ref="loginForm"
    :model="loginForm"
    label-width="0"
  >
    <el-form-item v-if="tenantMode" prop="tenantId">
      <el-input
        @keyup.enter="handleRegister"
        v-model="loginForm.tenantId"
        auto-complete="off"
        :placeholder="$t('login.tenantId')"
      >
        <template #prefix>
          <i class="icon-quanxian" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="name">
      <el-input
        @keyup.enter="handleRegister"
        v-model="loginForm.name"
        auto-complete="off"
        :placeholder="$t('login.name')"
      >
        <template #prefix>
          <i class="icon-yonghu" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="email">
      <el-input
        @keyup.enter="handleRegister"
        v-model="loginForm.email"
        auto-complete="off"
        :placeholder="$t('login.email')"
      >
        <template #prefix>
          <i class="icon-xiaoxitongzhi" />
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="emailCode">
      <el-input
        @keyup.enter="handleRegister"
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
    <el-form-item prop="phone">
      <el-input
        @keyup.enter="handleRegister"
        v-model="loginForm.phone"
        auto-complete="off"
        :placeholder="$t('login.phone')"
      >
        <template #prefix>
          <i class="icon-shouji" />
        </template>
      </el-input>
    </el-form-item>
<!--    <el-form-item prop="name">-->
<!--      <el-input-->
<!--        @keyup.enter="handleRegister"-->
<!--        v-model="loginForm.name"-->
<!--        auto-complete="off"-->
<!--        :placeholder="$t('login.name')"-->
<!--      >-->
<!--        <template #prefix>-->
<!--          <i class="icon-zhanghaoquanxianguanli" />-->
<!--        </template>-->
<!--      </el-input>-->
<!--    </el-form-item>-->




    <el-form-item prop="password">
      <el-input
        @keyup.enter="handleRegister"
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
        @keyup.enter="handleRegister"
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
      <el-button type="primary" @click.prevent="handleRegister" class="login-submit"
        >{{ $t('login.register') }}
      </el-button>
      <el-button @click.prevent="handleBack" class="register-submit"
        >{{ $t('login.back') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex';
import { info } from '@/api/system/tenant';
import { getTopUrl } from '@/utils/util';
import { sendEmailCode } from '@/api/user';

export default {
  name: 'userlogin',
  data() {
    return {
      tenantMode: this.website.tenantMode,
      captchaMode: this.website.captchaMode,
      registerMode: this.website.oauth2.registerMode,
      emailCodeText: '获取验证码',
      emailCodeTime: 60,
      emailCodeSending: false,
      loginForm: {
        //租户ID
        tenantId: '',
        //部门ID
        deptId: '',
        //角色ID
        roleId: '',
        //用户名
        account: '',
        //手机号
        phone: '',
        //邮箱
        email: '',
        //邮箱验证码
        code: '',
        //密码
        password: '',
        //确认密码
        password1: '',
        //账号类型
        type: 'account',
        //预加载白色背景
        image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',


      },
      loginRules: {
        tenantId: [{ required: true, message: '请输入租户ID', trigger: 'blur' }],
        name: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        account: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        code: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        password1: [{ required: true, message: '请输入确认密码', trigger: 'blur' }],
      },
      passwordType: 'password',
    };
  },
  created() {
    this.getTenant();
  },
  mounted() {
    this.$nextTick(() => {});
  },
  watch: {},
  computed: {
    ...mapGetters(['tagWel', 'userInfo']),
  },
  props: [],
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

    handleRegister() {
      if (this.loginForm.password !== this.loginForm.password1) {
        this.$message.error('两次密码输入不一致');
        return;
      }

      //email 设置为账号
      this.loginForm.account = this.loginForm.email;

      this.$refs.loginForm.validate(valid => {
        if (valid) {
          const loading = this.$loading({
            lock: true,
            text: '注册中,请稍后',
            background: 'rgba(0, 0, 0, 0.7)',
          });

          // 直接调用注册接口，不再先验证验证码
          this.$store
            .dispatch('RegisterUser', this.loginForm)
            .then(() => {
              this.$alert('注册成功！', '注册成功', {
                confirmButtonText: '确定',
                callback: () => {
                  this.$parent.activeName = 'user';
                },
              });
              loading.close();
            })
            .catch(err => {
              console.log(err);
              loading.close();
            });
        }
      });
    },

    handleBack() {
      this.$parent.activeName = 'user';
    },

    getTenant() {
      let domain = getTopUrl();
      // 临时指定域名，方便测试
      //domain = "https://bladex.cn";
      info(domain).then(res => {
        const data = res.data;
        if (data.success && data.data.tenantId) {
          this.tenantMode = false;
          this.loginForm.tenantId = data.data.tenantId;
          this.$parent.$refs.login.style.backgroundImage = `url(${data.data.backgroundUrl})`;
        }
      });
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
