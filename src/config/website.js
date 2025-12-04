/**
 * 全局配置文件
 */
export default {
  title: 'DonDonGo',
  logo: 'X',
  key: 'DonDonGo', //配置主键,目前用于存储
  indexTitle: 'DonDonGo',
  clientId: 'DonDonGo', // 客户端id
  clientSecret: 'DonDonGo_secret', // 客户端密钥
  tenantMode: false, // 是否开启租户模式
  tenantId: '000000', // 管理组租户编号
  captchaMode: true, // 是否开启验证码模式
  switchMode: false, // 是否开启登录切换角色部门
  lockPage: '/lock',
  tokenTime: 3000,
  tokenHeader: 'Blade-Auth',
  //HTTP状态码白名单
  statusWhiteList: [],
  //配置首页不可关闭
  setting: {
    sidebar: 'vertical',
    tag: true,
    debug: true,
    collapse: true,
    search: true,
    color: true,
    lock: true,
    screenshot: true,
    fullscreen: true,
    theme: true,
    menu: true,
  },
  //首页配置
  fistPage: {
    name: '首页',
    path: '/wel/index',
  },
  //配置菜单的属性
  menu: {
    iconDefault: 'icon-caidan',
    label: 'name',
    path: 'path',
    icon: 'source',
    children: 'children',
    query: 'query',
    href: 'path',
    meta: 'meta',
  },
  //水印配置
  watermark: {
    mode: false,
    text: 'DonDonGo',
  },
  //oauth2配置
  oauth2: {
    // 是否开启注册功能
    registerMode: true,
    // 使用后端工程 @org.springblade.test.Sm2KeyGenerator 获取
    publicKey: '04576b6d6efe043a0f4e958f2f2ca044c0f4e56a48c6fa6bcfee68027c4cb25002fc16a37109eb0068082da84d67cbc911a6a88fa9fb5219934d8b3096c0d315a7',
    // 第三方系统授权地址
    authUrl: '/api/blade-auth/oauth/render',
    // 单点登录系统认证
    ssoMode: false, // 是否开启单点登录功能
    ssoBaseUrl: 'http://localhost:8100', // 单点登录系统地址(cloud端口为8100,boot端口为80)
    ssoAuthUrl: '/oauth/authorize?client_id=saber3&response_type=code&redirect_uri=', // 单点登录授权地址
    ssoLogoutUrl: '/oauth/authorize/logout?redirect_uri=', // 单点登录退出地址
    redirectUri: 'http://localhost:2888/login', // 单点登录回调地址(Saber服务的登录界面地址)
  },
  //设计器配置
  design: {
    // 流程设计器类型(true->nutflow,false->flowable)
    designMode: true,
    // 流程设计器地址(flowable模式)
    designUrl: 'http://localhost:9999',
    // 报表设计器地址(cloud端口为8108,boot端口为80)
    reportUrl: 'http://localhost:8108/ureport',
    // 规则设计引擎地址
    edgeUrl: 'http://localhost:1880',
  },
};
