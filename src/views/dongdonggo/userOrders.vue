<template>
  <basic-container>
    <avue-crud :option="option"
               v-model:search="search"
               v-model:page="page"
               v-model="form"
               :table-loading="loading"
               :data="data"
               :permission="permissionList"
               :before-open="beforeOpen"
               ref="crud"
               @row-update="rowUpdate"
               @row-save="rowSave"
               @row-del="rowDel"
               @search-change="searchChange"
               @search-reset="searchReset"
               @selection-change="selectionChange"
               @current-change="currentChange"
               @size-change="sizeChange"
               @refresh-change="refreshChange"
               @on-load="onLoad">
      <template #menu-left>
<!--        <el-button type="danger"-->
<!--                   icon="el-icon-delete"-->
<!--                   plain-->
<!--                   v-if="permission.userOrders_delete"-->
<!--                   @click="handleDelete">删 除-->
<!--        </el-button>-->
        <el-button type="warning"
                   plain
                   icon="el-icon-download"
                   @click="handleExport">导 出
        </el-button>
      </template>
      <template #menu="row">
        <el-button type="text"
                   icon="el-icon-view"
                   @click.stop="handleView(row.row)">查看
        </el-button>
        <el-button type="text"
                   icon="el-icon-edit"
                    @click.stop="handleAdminSend(row.row)"
                   v-if="row.row.orderStatus === 2">发货
        </el-button>
        <el-button type="text"
                   icon="el-icon-edit"
                   @click.stop="handleAdminCancel(row.row)"
                   v-if="row.row.orderStatus !==5 && row.row.orderStatus !==6  && row.row.orderStatus !==7 && row.row.orderStatus !==8&& row.row.orderStatus !==9 ">取消订单
        </el-button>
      </template>
    </avue-crud>
    
    <el-dialog
      :title="`订单详情 - ${userOrdersName}`"
      v-model="viewDialogVisible"
      :modal="true"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      :z-index="9999"
      @closed="handleViewDialogClosed"
      width="80%">
      <div class="order-detail-container">
        <!-- 订单基本信息 -->
        <div class="detail-section">
          <div class="section-header">
            <h3>基本信息</h3>
            <div class="flex-divider"></div>
          </div>
          
          <div v-if="form" class="order-info-sections">
            <!-- 基本信息 -->
            <div class="info-section">
              <div class="section-title">
                <i class="el-icon-document"></i> 基本信息
              </div>
              <el-descriptions :column="4" border size="small">
                <!-- 用户信息 -->
                <el-descriptions-item label="用户">
                  {{ form.userName || '-' }}
                </el-descriptions-item>
                
                <!-- 商户信息 -->
                <el-descriptions-item label="商户">
                  {{ form.storeName || '-' }}
                </el-descriptions-item>
                
                <!-- 订单信息 -->
                <el-descriptions-item label="订单">
                  {{ form.orderName || '-' }}
                </el-descriptions-item>
                
                <!-- 订单总金额 -->
                <el-descriptions-item label="订单总金额">
                  {{ form.totalAmount || '-' }}
                </el-descriptions-item>
                
                <!-- 订单状态 -->
                <el-descriptions-item label="订单状态">
                  <el-tag :type="getOrderStatusType(form.orderStatus)">
                    {{ getOrderStatusText(form.orderStatus) }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 配送信息 -->
            <div class="info-section">
              <div class="section-title">
                <i class="el-icon-location"></i> 配送信息
              </div>
              <el-descriptions :column="3" border size="small">
                <!-- 联系方式 -->
                <el-descriptions-item label="联系方式">
                  {{ form.mobile || '-' }}
                </el-descriptions-item>
                
                <!-- 配送地址 -->
                <el-descriptions-item label="配送地址">
                  {{ getDeliveryAddress(form.deliveryAddressAnswer) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 订单时间信息 -->
            <div class="info-section">
              <div class="section-title">
                <i class="el-icon-time"></i> 时间信息
              </div>
              <el-descriptions :column="4" border size="small">
                <!-- 发货时间 -->
                <el-descriptions-item label="发货时间">
                  {{ form.deliveryTime || '-' }}
                </el-descriptions-item>
                
                <!-- 收货时间 -->
                <el-descriptions-item label="收货时间">
                  {{ form.receiveTime || '-' }}
                </el-descriptions-item>
                
                <!-- 订单完成时间 -->
                <el-descriptions-item label="订单完成时间">
                  {{ form.completeTime || '-' }}
                </el-descriptions-item>
                
                <!-- 订单取消时间 -->
                <el-descriptions-item label="订单取消时间">
                  {{ form.cancelTime || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
          <div v-else>
            <el-skeleton :rows="6" animated />
          </div>
        </div>
        
        <!-- 商品明细 -->
        <div class="detail-section">
          <div class="section-header product-header">
            <h3><i class="el-icon-shopping-cart-full"></i> 商品明细</h3>
            <div class="flex-divider"></div>
          </div>
          
          <div v-loading="loadingSub">
            <avue-crud :option="optionSub"
                      :data="dataSub"
                      v-model:page="pageSub"
                      size="small"
                      :cell-style="{padding: '2px 0'}"
                      :header-cell-style="{padding: '4px 0'}"
                      ref="crudSub">
            </avue-crud>
          </div>
        </div>
        
        <!-- 表单信息 -->
        <div class="detail-section">
          <div class="section-header form-header">
            <h3><i class="el-icon-document-checked"></i> 表单信息</h3>
            <div class="flex-divider"></div>
          </div>
          
          <!-- 表单答案展示 -->
          <div v-if="formAnswers && formAnswers.length > 0" class="form-answers-container">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item
                v-for="item in formAnswers"
                :key="item.id"
                :label="item.question"
                :class="{'required-form-item': item.required === '必填'}">

                <!-- 单选情况 -->
                <template v-if="item.type === 'radio' && item.value">
                  <el-tag size="mini" type="primary">{{ item.value }}</el-tag>
                </template>

                <!-- 多选情况 -->
                <template v-else-if="item.type === 'multiple' && item.value && item.value.length > 0">
                  <el-tag
                    v-for="(option, index) in item.value"
                    :key="index"
                    size="mini"
                    type="success"
                    style="margin-right: 3px; margin-bottom: 2px">{{ option }}</el-tag>
                </template>

                <!-- 文本类型 -->
                <template v-else-if="item.type === 'text'">
                  {{ item.value ? item.value : '未填写' }}
                </template>

                <!-- 其他情况 -->
                <template v-else>
                  {{ Array.isArray(item.value) && item.value.length === 0 ? '未填写' : (item.value ? item.value : '未填写') }}
                </template>

              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-else class="form-answers-empty">
            <el-empty description="没有表单数据" :image-size="60"></el-empty>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <el-drawer :title="`[${userOrdersName}] 详情`" v-model="subVisible" :direction="direction" append-to-body
               :before-close="handleSubClose" size="1000px">
      <basic-container>
        <avue-crud :option="optionSub"
                   :data="dataSub"
                   v-model:page="pageSub"
                   v-model="formSub"
                   :table-loading="loadingSub"
                   ref="crudSub"
                   @row-del="rowDelSub"
                   @row-update="rowUpdateSub"
                   @row-save="rowSaveSub"
                   :before-open="beforeOpenSub"
                   @search-change="searchChangeSub"
                   @search-reset="searchResetSub"
                   @selection-change="selectionChangeSub"
                   @current-change="currentChangeSub"
                   @size-change="sizeChangeSub"
                   @on-load="onLoadSub">
<!--          <template #menu-left>-->
<!--            <el-button type="danger"-->
<!--                       icon="el-icon-delete"-->
<!--                       plain-->
<!--                       @click="handleDeleteSub">删 除-->
<!--            </el-button>-->
<!--          </template>-->
        </avue-crud>

        <!-- 自定义表单答案展示 -->
        <div v-if="formAnswers && formAnswers.length > 0" class="form-answers-container">
          <h3>表单信息</h3>
          <el-divider></el-divider>

          <el-descriptions :column="1" border>
            <el-descriptions-item
              v-for="item in formAnswers"
              :key="item.id"
              :label="item.question"
              :class="{'required-form-item': item.required === '必填'}">

              <!-- 单选情况 -->
              <template v-if="item.type === 'radio' && item.value">
                <el-tag type="primary">{{ item.value }}</el-tag>
              </template>

              <!-- 多选情况 -->
              <template v-else-if="item.type === 'multiple' && item.value && item.value.length > 0">
                <el-tag
                  v-for="(option, index) in item.value"
                  :key="index"
                  type="success"
                  style="margin-right: 5px">{{ option }}</el-tag>
              </template>

              <!-- 文本类型 -->
              <template v-else-if="item.type === 'text'">
                {{ item.value || '未填写' }}
              </template>

              <!-- 其他情况 -->
              <template v-else>
                {{ item.value || '未填写' }}
              </template>

            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-else class="form-answers-empty">
          <el-empty description="没有表单数据"></el-empty>
        </div>
      </basic-container>
    </el-drawer>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, update, remove} from "@/api/dongdonggo/userOrders";
  import {getList as getListSub, getDetail as getDetailSub, add as addSub, update as updateSub, remove as removeSub} from "@/api/dongdonggo/userOrderDetails";
  import option from "@/option/dongdonggo/userOrders";
  import optionSub from "@/option/dongdonggo/userOrderDetails";
  import {mapGetters} from "vuex";
  import {exportBlob} from "@/api/common";
  import {getToken} from '@/utils/auth';
  import {downloadXls} from "@/utils/util";
  import {dateNow} from "@/utils/date";
  import NProgress from 'nprogress';
  import 'nprogress/nprogress.css';
  import { adminCancel, ship } from '@/api/dongdonggo/userOrders';
  // import {getFormAnswers} from "@/api/dongdonggo/customFormAnswers";

  export default {
    data() {
      return {
        form: {},
        query: {},
        search: {},
        loading: true,
        data: [],
        selectionList: [],
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        option: {
          ...option,
          viewSize: '80%', // 设置查看弹窗大小
          dialogWidth: 1000, // 设置对话框宽度
          dialogHeight: 650, // 设置对话框高度
          menuWidth: 200, // 操作按钮区域宽度
          menuAlign: 'center', // 菜单对齐方式
          viewBtn: false, // 禁用内置查看按钮
        },
        subVisible: false,
        direction: 'rtl',
        userOrderId: 0,
        userOrdersName: "用户订单表",
        formSub: {},
        querySub: {},
        loadingSub: true,
        dataSub: [],
        selectionListSub: [],
        pageSub: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        optionSub: optionSub,
        formAnswers: [],
        currentOrder: null,
        viewDialogVisible: false,
      };
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          // addBtn: this.validData(this.permission.userOrders_add, false),
          // viewBtn: this.validData(this.permission.userOrders_view, false),
          // delBtn: this.validData(this.permission.userOrders_delete, false),
          // editBtn: this.validData(this.permission.userOrders_edit, false)
          addBtn: false,
          viewBtn: false, // 禁用内置查看按钮
          delBtn: false,
          editBtn: this.validData(this.permission.userOrders_edit, false)
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      },
      subIds() {
        let ids = [];
        this.selectionListSub.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      }
    },
    methods: {
      // 主表模块
      rowSave(row, done, loading) {
        add(row).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
          window.console.log(error);
          loading();
        });
      },
      rowUpdate(row, index, done, loading) {
        update(row).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
          window.console.log(error);
          loading();
        });
      },
      rowDel(row) {
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            return remove(row.id);
          })
          .then(() => {
            this.onLoad(this.page);
            this.$message({
              type: "success",
              message: "操作成功!"
            });
          });
      },
      handleDelete() {
        if (this.selectionList.length === 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            return remove(this.ids);
          })
          .then(() => {
            this.onLoad(this.page);
            this.$message({
              type: "success",
              message: "操作成功!"
            });
            this.$refs.crud.toggleSelection();
          });
      },
      handleExport() {
        let downloadUrl = `/blade-userProducts/userOrders/export-userOrders?${this.website.tokenHeader}=${getToken()}`;
        const {
          userId,
          orderStatus,
          userName,
          storeName,
          orderName,
          orderId,
        } = this.query;

        let values = {
          userId: userId,
          orderStatus: orderStatus,
          userName: userName,
          storeName: storeName,
          orderName: orderName,
          orderId: orderId,
        };
        this.$confirm("是否导出数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          NProgress.start();
          exportBlob(downloadUrl, values).then(res => {
            downloadXls(res.data, `用户订单表${dateNow()}.xlsx`);
            NProgress.done();
          })
        });
      },
      beforeOpen(done, type) {
        if (type === "view") {
          // 获取订单基本信息
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
            
            // 设置当前订单ID，用于加载详情
            this.userOrderId = this.form.id;
            this.userOrdersName = this.form.orderName || "用户订单表";
            this.currentOrder = this.form;
            
            // 解析表单答案
            this.parseFormAnswers(this.form.formAnswerJson);
            
            // 加载订单详情数据
            this.loadingSub = true;
            const values = { userOrderId: this.userOrderId };
            
            getListSub(this.pageSub.currentPage, this.pageSub.pageSize, values).then(res => {
              const data = res.data.data;
              this.pageSub.total = data.total;
              this.dataSub = data.records;
              this.selectionListSub = [];
              this.loadingSub = false;
              
              // 数据加载完成后再调用done
              done();
            }).catch(error => {
              console.error('加载商品明细失败', error);
              this.loadingSub = false;
              done();
            });
          }).catch(error => {
            console.error('加载订单详情失败', error);
            done();
          });
          
          // 不要在这里调用done，而是在数据加载完成后调用
          return;
        } else if (["edit"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
            done();
          }).catch(() => {
            done();
          });
          return;
        }
        
        done();
      },
      searchReset() {
        this.query = {};
        this.onLoad(this.page);
      },
      searchChange(params, done) {
        this.query = params;
        this.page.currentPage = 1
        this.onLoad(this.page, params);
        done();
      },
      selectionChange(list) {
        this.selectionList = list;
      },
      selectionClear() {
        this.selectionList = [];
        this.$refs.crud.toggleSelection();
      },
      currentChange(currentPage){
        this.page.currentPage = currentPage;
      },
      sizeChange(pageSize){
        this.page.pageSize = pageSize;
      },
      onLoad(page, params = {}) {
        this.loading = true;
        const {
            userId,
            orderStatus,
            userName,
          storeName,
          orderName,
          orderId,
        } = this.query;

        let values = {
          userId: userId,
          orderStatus: orderStatus,
          userName: userName,
          storeName: storeName,
          orderName: orderName,
          orderId: orderId,
        };
        getList(page.currentPage, page.pageSize, values).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          this.loading = false;
          this.selectionClear();
        });
      },
      // 子表模块
      handleDataSub(row) {
        this.subVisible = true;
        this.userOrderId = row.row.id;
        this.userOrdersName = row.row.orderName || "用户订单表";
        this.currentOrder = row.row;

        // 加载订单详情
        this.onLoadSub(this.pageSub);
        
        // 解析表单答案
        this.parseFormAnswers(row.row.formAnswerJson);
      },
      handleSubClose(hide) {
        hide();
      },
      rowSaveSub(row, loading, done) {
        row = {
          ...row,
          userOrderId: this.userOrderId,
        };
        addSub(row).then(() => {
          loading();
          this.onLoadSub(this.pageSub);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        }, error => {
          done();
          window.console.log(error);
        });
      },
      rowUpdateSub(row, index, loading, done) {
        row = {
          ...row,
          userOrderId: this.userOrderId,
        };
        updateSub(row).then(() => {
          loading();
          this.onLoadSub(this.pageSub);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        }, error => {
          done();
          window.console.log(error);
        });
      },
      rowDelSub(row) {
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            return removeSub(row.id);
          })
          .then(() => {
            this.onLoadSub(this.pageSub);
            this.$message({
              type: "success",
              message: "操作成功!"
            });
          });
      },
      handleDeleteSub() {
        if (this.selectionListSub.length === 0) {
          this.$message.warning("请选择至少一条数据");
          return;
        }
        this.$confirm("确定将选择数据删除?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            return removeSub(this.subIds);
          })
          .then(() => {
            this.onLoadSub(this.pageSub);
            this.$message({
              type: "success",
              message: "操作成功!"
            });
            this.$refs.crudSub.toggleSelection();
          });
      },
      beforeOpenSub(done, type) {
        if (["edit", "view"].includes(type)) {
          getDetailSub(this.formSub.id).then(res => {
            this.formSub = res.data.data;
          });
        }
        done();
      },
      searchResetSub() {
        this.querySub = {};
        this.onLoadSub(this.pageSub);
      },
      searchChangeSub(params) {
        this.querySub = params;
        this.onLoadSub(this.pageSub, params);
      },
      selectionChangeSub(list) {
        this.selectionListSub = list;
      },
      currentChangeSub(currentPage) {
        this.pageSub.currentPage = currentPage;
      },
      sizeChangeSub(pageSize) {
        this.pageSub.pageSize = pageSize;
      },
      refreshChange() {
        this.onLoad(this.page, this.query);
      },
      onLoadSub(page, params = {}) {
        this.loadingSub = true;
        let values = {
          userOrderId: this.userOrderId,
        }

        const {
        } = this.querySub;

        values = {
        ...values,
        };
        getListSub(page.currentPage, page.pageSize, values).then(res => {
          const data = res.data.data;
          this.pageSub.total = data.total;
          this.dataSub = data.records;
          this.selectionListSub = [];
          this.loadingSub = false;
        });
      },
      // 取消订单
      handleAdminCancel(row) {
        this.$confirm("确定帮用户取消订单?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            row = {
              ...row,
              orderStatus: 6,
            };
            adminCancel(row.id).then(() => {
              this.onLoad(this.page);
              this.$message({
                type: "success",
                message: "操作成功!"
              });
            });
          });
      },
      //发货
      handleAdminSend(row) {
        this.$confirm("确定发货?", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            row = {
              ...row,
              orderStatus: 3,
            };
            ship(row.id).then(() => {
              this.onLoad(this.page);
              this.$message({
                type: "success",
                message: "操作成功!"
              });
            });
          });
      },
      // 解析表单答案数据
      parseFormAnswers(formAnswerJson) {
        try {
          if (formAnswerJson) {
            // 解析JSON数据
            let answers = JSON.parse(formAnswerJson);
            
            // 处理每个表单项
            answers.forEach(item => {
              // 处理空数组的情况，将其转为null以便在模板中正确显示为"未填写"
              if (Array.isArray(item.value) && item.value.length === 0) {
                item.value = null;
              }
            });
            
            this.formAnswers = answers;
          } else {
            this.formAnswers = [];
          }
        } catch (e) {
          console.error('解析表单答案失败', e);
          this.formAnswers = [];
        }
      },
      handleView(row) {
        console.log('查看按钮被点击', row);
        
        // 打印option结构检查
        console.log('option值:', JSON.stringify(this.option));
        console.log('option.column值:', this.option.column);
        
        // 设置当前订单ID和名称
        this.userOrderId = row.id;
        this.userOrdersName = row.orderName || "用户订单表";
        this.currentOrder = row;
        
        // 重置表单数据，避免显示上一次的数据
        this.form = {};
        
        // 先显示对话框，避免等待数据加载导致用户体验不佳
        this.viewDialogVisible = true;
        
        // 设置加载状态
        this.loadingSub = true;
        
        // 先直接显示行数据
        this.form = {...row};
        console.log('初始form数据：', this.form);
        
        // 获取订单详情
        getDetail(row.id).then(res => {
          console.log('订单详情数据加载成功', res.data.data);
          // 使用对象合并，保留原有数据
          this.form = {...this.form, ...res.data.data};
          console.log('更新后的form数据：', this.form);
          
          // 检查form与option.column的匹配情况
          if (this.option.column) {
            console.log('form与column匹配检查:');
            this.option.column.forEach(item => {
              if (item && item.prop) {
                console.log(`字段${item.prop}: ${this.form[item.prop] !== undefined ? '存在' : '不存在'}`);
              }
            });
          }
          
          // 解析表单答案
          this.parseFormAnswers(this.form.formAnswerJson);
          
          // 加载订单明细
          const values = { userOrderId: this.userOrderId };
          
          getListSub(this.pageSub.currentPage, this.pageSub.pageSize, values).then(res => {
            console.log('商品明细数据加载成功', res.data.data);
            const data = res.data.data;
            this.pageSub.total = data.total;
            this.dataSub = data.records;
            this.selectionListSub = [];
            this.loadingSub = false;
          }).catch(error => {
            console.error('加载商品明细失败', error);
            this.loadingSub = false;
            this.$message.error('加载商品明细失败');
          });
        }).catch(error => {
          console.error('加载订单详情失败', error);
          this.$message.error('加载订单详情失败');
          this.loadingSub = false;
        });
      },
      // 对话框关闭后的处理方法
      handleViewDialogClosed() {
        console.log('对话框已关闭');
        // 清空表单数据
        this.form = {};
        this.formAnswers = [];
        this.dataSub = [];
      },
      // 添加订单状态辅助方法
      getOrderStatusText(status) {
        const statusMap = {
          1: '待支付',
          2: '已支付',
          3: '已发货',
          4: '已收货',
          5: '已完成',
          6: '已取消',
          7: '已关闭',
          8: '退款中',
          9: '已退款'
        };
        return statusMap[status] || '未知状态';
      },
      getOrderStatusType(status) {
        const typeMap = {
          1: 'warning',
          2: 'success',
          3: 'primary',
          4: 'success',
          5: 'success',
          6: 'info',
          7: 'info',
          8: 'danger',
          9: 'danger'
        };
        return typeMap[status] || 'info';
      },
      getDeliveryAddress(deliveryAddressAnswer) {
        try {
          if (!deliveryAddressAnswer) return '未填写';
          
          const addressData = JSON.parse(deliveryAddressAnswer);
          // 直接返回value字段，其中包含了完整的地址信息
          return addressData.value || '未填写';
        } catch (error) {
          console.error('解析配送地址失败', error);
          return '地址格式错误';
        }
      },
    }
  };
</script>

<style>
.form-answers-container {
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-top: 10px;
}

.form-answers-empty {
  padding: 15px 0;
  text-align: center;
}

.required-form-item .el-descriptions-item__label {
  position: relative;
}

.required-form-item .el-descriptions-item__label::after {
  content: '*';
  color: #F56C6C;
  margin-left: 4px;
}

/* 标签页样式优化 */
.el-tabs--border-card {
  box-shadow: none;
  border: none;
}

.el-tabs--border-card > .el-tabs__content {
  padding: 10px;
  min-height: 250px;
}

/* 表单容器在选项卡中的样式 */
.el-tab-pane .form-answers-container {
  margin-top: 0;
  background-color: transparent;
}

/* 增加标签页之间内容的间距 */
.el-tab-pane {
  padding: 5px 0;
}

/* 商品明细表格样式优化 */
.el-tab-pane .avue-crud {
  margin-top: 5px;
}

/* 标签页内容底部间距 */
.el-tabs__content {
  margin-bottom: 10px;
}

/* 添加新的合并式详情页样式 */
.order-detail-container {
  padding: 0 5px;
}

.detail-section {
  margin-bottom: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
  padding: 8px;
  border: 1px solid #ebeef5;
}

.section-header {
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #409EFF;
}

.section-header h3 {
  font-size: 14px;
  color: #303133;
  margin: 0;
  padding: 2px 0;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.section-header h3:before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 14px;
  background-color: #409EFF;
  margin-right: 6px;
  border-radius: 2px;
}

/* 调整商品明细表格样式 */
.detail-section .avue-crud {
  margin-top: 2px;
}

/* 表单容器在合并式布局中的样式 */
.detail-section .form-answers-container {
  margin-top: 0;
  background-color: transparent;
  padding: 0;
}

/* 给描述列表添加圆角 */
.detail-section .el-descriptions {
  border-radius: 4px;
  overflow: hidden;
}

/* 添加flex-divider样式 */
.flex-divider {
  flex: 1;
  height: 1px;
  background-color: #ebeef5;
  margin-left: 10px;
}

/* 调整描述列表样式，使其更紧凑 */
.el-descriptions__label {
  padding: 4px 6px !important;
  font-size: 12px !important;
  line-height: 1.3 !important;
}

.el-descriptions__content {
  padding: 4px 6px !important;
  font-size: 12px !important;
  line-height: 1.3 !important;
}

/* 调整表单答案容器添加样式 */
.form-answers-container {
  background-color: #f8f9fa !important;
  border-radius: 4px;
  padding: 5px !important;
}

/* 为不同区域设置不同的边框颜色 */
.info-section:nth-child(1) {
  border-left-color: #409EFF;
}

.info-section:nth-child(2) {
  border-left-color: #67C23A;
}

.info-section:nth-child(3) {
  border-left-color: #E6A23C;
}

/* 为主区域标题添加不同的颜色 */
.section-header {
  border-bottom-color: #409EFF;
}

.section-header h3:before {
  background-color: #409EFF;
}

.product-header {
  border-bottom-color: #67C23A;
}

.product-header h3:before {
  background-color: #67C23A;
}

.form-header {
  border-bottom-color: #E6A23C;
}

.form-header h3:before {
  background-color: #E6A23C;
}

/* 增加表格和描述列表的间距 */
.el-descriptions {
  margin-bottom: 8px;
}

/* 增强表格边框可见度 */
.el-table--border, .el-table--group {
  border: 1px solid #DCDFE6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* 添加回其他必要的样式 */
/* 调整表头样式 */
.el-descriptions__header {
  margin-bottom: 0;
}

/* 调整表格内容区域内边距 */
.el-descriptions-item__container {
  padding: 0 !important;
}

/* 商品明细表格紧凑化 */
.detail-section .avue-crud .el-table th,
.detail-section .avue-crud .el-table td {
  padding: 3px 0;
  font-size: 12px;
}

/* 信息区域样式 */
.order-info-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-section {
  border-radius: 4px;
  overflow: hidden;
  padding: 6px 8px;
  background-color: #f8f9fa;
  border-left: 2px solid #409EFF;
  transition: all 0.2s;
  margin-bottom: 5px;
}

.info-section:hover {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}

.section-title i {
  margin-right: 4px;
  color: #409EFF;
  font-size: 12px;
}

/* 紧凑样式改进 */
.el-tag {
  margin-bottom: 2px;
  height: 22px !important;
  line-height: 20px !important;
  padding: 0 6px !important;
}

.el-tag--mini {
  height: 18px !important;
  line-height: 16px !important;
  padding: 0 4px !important;
  font-size: 11px !important;
}

/* 调整对话框内容区域的样式 */
.el-dialog__body {
  padding: 10px !important;
}

/* 优化表头样式 */
.el-table th {
  padding: 6px 0 !important;
  background-color: #f5f7fa !important;
}

/* 优化表格行和单元格样式 */
.el-table td {
  padding: 4px 0 !important;
}

/* 减小表单项之间的垂直间距 */
.el-form-item {
  margin-bottom: 10px !important;
}

/* 设置边框卡片的最小高度 */
.el-card {
  margin-bottom: 10px;
}

.el-descriptions.el-descriptions--small .el-descriptions__body {
  font-size: 12px;
}

.el-descriptions__body .el-descriptions__table {
  border-collapse: collapse;
}

.el-descriptions.is-bordered .el-descriptions__cell {
  padding: 4px 6px;
}

/* 减小描述列表的边距 */
.el-descriptions__body {
  padding: 0 !important;
}

/* 调整 el-descriptions 行高 */
.el-descriptions .el-descriptions-item__container {
  height: auto !important;
  min-height: 24px !important;
}

/* 对话框和抽屉的全局紧凑样式 */
.el-dialog {
  border-radius: 6px;
  overflow: hidden;
}

.el-dialog__header {
  padding: 12px 16px !important;
}

.el-dialog__footer {
  padding: 10px 16px !important;
}

/* 紧凑的抽屉样式 */
.el-drawer__header {
  margin-bottom: 10px;
  padding: 12px 16px !important;
  font-size: 16px;
}

.el-drawer__body {
  padding: 0;
}

/* 优化表单项间距 */
.el-form--inline .el-form-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

/* 图标的全局调整 */
.el-button [class*=" el-icon-"], 
.el-button [class^=el-icon-] {
  font-size: 14px;
}

/* 抽屉中的内容区域 */
.el-drawer__body .basic-container {
  padding: 10px;
}

/* 紧凑型弹性盒布局 */
.flex-compact {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 数值显示的统一样式 */
.number-value {
  font-family: "DIN Alternate", "Arial Narrow", sans-serif;
  font-weight: 500;
}

/* 为空状态添加特定样式 */
.empty-value {
  color: #909399;
  font-style: italic;
  font-size: 12px;
}
</style>
