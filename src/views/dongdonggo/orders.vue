<template>
  <basic-container>
    <avue-crud
      :option="option"
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
      @on-load="onLoad"
    >
      <template #menu-left>
        <el-button
          type="danger"
          icon="el-icon-delete"
          plain
          v-if="permission.orders_delete"
          @click="handleDelete"
          >删 除
        </el-button>
        <el-button type="warning" plain icon="el-icon-download" @click="handleExport"
          >导 出
        </el-button>
      </template>

      <!-- 自定义表单设计按钮 -->
      <template #menu="{ row }">
        <el-button
          type="primary"
          size="small"
          @click="openFormDesigner(row)"
        >
          表单
        </el-button>
      </template>

      <!-- 自定义表单JSON显示 -->
      <template #customFormJson="scope">
        <div>
          <el-input type="textarea" v-model="scope.row.customFormJson" :rows="4"></el-input>
        </div>
      </template>

      <!-- 编辑表单时的设计按钮 -->
      <template #form>
        <el-form-item label="表单设计">
          <el-button type="primary" @click="openFormDesigner(form)">设计自定义表单</el-button>
        </el-form-item>
      </template>
    </avue-crud>

    <!-- 选项配置对话框 -->
    <el-dialog v-model="optionDialogVisible" title="选项配置" width="700px">
      <div v-if="currentFormRow">
        <el-table :data="currentFormRow.options" border>
          <el-table-column type="index" label="序号" width="50"></el-table-column>
          <el-table-column prop="optionLabel" label="选项标签"></el-table-column>
          <el-table-column prop="optionValue" label="选项值"></el-table-column>
          <el-table-column prop="sort" label="排序" width="80"></el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="danger" size="small" @click="removeOption(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div style="margin-top: 20px; border-top: 1px solid #EBEEF5; padding-top: 20px;">
          <el-form :model="newOption" label-width="80px" :inline="true">
            <el-form-item label="选项标签" required>
              <el-input v-model="newOption.optionLabel" placeholder="请输入选项标签"></el-input>
            </el-form-item>
            <el-form-item label="选项值" required>
              <el-input v-model="newOption.optionValue" placeholder="请输入选项值"></el-input>
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="newOption.sort" :min="1" :max="9999"></el-input-number>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="addOption">添加选项</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>

    <!-- 自定义表单编辑对话框 -->
    <el-dialog v-model="formDesignerVisible" title="自定义表单设计" width="900px">
      <div class="form-designer-container">
        <div class="form-designer-toolbar">
          <el-button type="primary" @click="addFormItem('text')">添加文本框</el-button>
          <el-button type="primary" @click="addFormItem('radio')">添加单选框</el-button>
          <el-button type="primary" @click="addFormItem('multiple')">添加多选框</el-button>
        </div>

        <div class="form-designer-content">
          <el-empty v-if="customFormItems.length === 0" description="暂无表单项，请使用上方按钮添加"></el-empty>

          <el-card v-for="(item, index) in customFormItems" :key="item.id" class="form-item-card" shadow="hover">
            <template #header>
              <div class="form-item-header">
                <span>{{formTypeLabels[item.type] || '未知类型'}}</span>
                <div>
                  <el-button type="text" @click="moveFormItem(index, 'up')" :disabled="index === 0">
                    <el-icon><arrow-up /></el-icon>
                  </el-button>
                  <el-button type="text" @click="moveFormItem(index, 'down')" :disabled="index === customFormItems.length - 1">
                    <el-icon><arrow-down /></el-icon>
                  </el-button>
                  <el-button type="text" @click="editFormItemOptions(item)" v-if="['radio', 'multiple'].includes(item.type)">
                    <el-icon><setting /></el-icon>
                  </el-button>
                  <el-button type="text" @click="removeFormItem(index)" class="delete-btn">
                    <el-icon><delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>

            <el-form label-width="100px">
              <el-form-item label="问题标题">
                <el-input v-model="item.question" placeholder="请输入问题标题"></el-input>
              </el-form-item>

              <el-form-item label="是否必填">
                <el-switch v-model="item.required" :active-value="'必填'" :inactive-value="false"></el-switch>
              </el-form-item>

              <el-form-item label="选项列表" v-if="['radio', 'multiple'].includes(item.type)">
                <div v-for="(option, optIndex) in item.options" :key="option.id" class="option-item">
                  <el-input v-model="option.label" placeholder="选项文本"></el-input>
                  <el-button type="text" @click="removeOption(item, optIndex)" class="delete-option-btn">
                    <el-icon><close /></el-icon>
                  </el-button>
                </div>
                <el-button type="primary" plain size="small" @click="addOption(item)">添加选项</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formDesignerVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveCustomForm">保存表单</el-button>
        </div>
      </template>
    </el-dialog>
  </basic-container>
</template>

<script>
import { getList, getDetail, add, update, remove } from '@/api/dongdonggo/orders';
import { mapGetters } from 'vuex';
import {exportBlob} from "@/api/common";
import {getToken} from '@/utils/auth';
import {downloadXls} from "@/utils/util";
import NProgress from 'nprogress';
import { ElMessage, ElLoading } from 'element-plus';
import { ArrowUp, ArrowDown, Setting, Delete, Close } from '@element-plus/icons-vue';

export default {
  name: 'Orders',
  components: {
    ArrowUp,
    ArrowDown,
    Setting,
    Delete,
    Close
  },
  data() {
    return {
      form: {},
      query: {},
      search: {},
      loading: true,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0,
      },
      selectionList: [],
      option: {
        height: 'auto',
        calcHeight: 30,
        tip: false,
        searchShow: true,
        searchMenuSpan: 6,
        border: true,
        index: true,
        viewBtn: true,
        selection: true,
        dialogClickModal: false,
        menuWidth: 300,  // 设置操作列宽度
        menu: true,      // 启用操作列
        column: [
          {
            label: '订单ID',
            prop: 'id',
            type: 'input',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide: true,
          },
          {
            label: '商户',
            prop: 'storeId',
            type: 'select',
            dicUrl: '/blade-stores/stores/store_list?approved=2',
            filterable: true,
            dataType: 'string',
            props: {
              label: 'storeName',
              value: 'id',
            },
            search: true,
            rules: [
              {
                required: true,
                message: '请选择商户',
                trigger: 'blur',
              },
            ],
          },
          {
            label: '订单名称',
            prop: 'orderName',
            type: 'input',
            search: true,
            rules: [
              {
                required: true,
                message: '请输入订单名称',
                trigger: 'blur',
              },
            ],
          },
          //是否置顶订单
          {
            label: '置顶',
            prop: 'isTop',
            type: 'select',
            dicData: [
              { label: '是', value: 1 },
              { label: '否', value: 0 },
            ],
            dataType: 'number',
            search: true,
            width: 60,
          },
          {
            label: '产品',
            prop: 'orderProducts',
            type: 'dynamic',
            span: 24,
            children: {
              index: false,
              align: 'center',
              type: 'form',
              headerAlign: 'center',
              rowAdd: done => {
                // ElMessage.success('新增回调'); // 使用 ElMessage
                done({
                  productName: '',
                  stock: '',
                  price: '',
                  limitPerUser: 0,
                  limitOneUser: 0,
                  sort: 9999,
                  backgroundImageUrl: '',
                  productType: 1,
                });
              },
              rowDel: (row, done) => {
                // ElMessage.success('删除回调' + JSON.stringify(row)); // 使用 ElMessage
                //删除的时候将is_delete变为 0
                row.isDeleted = 0;
                done();
              },
              column: [
                {
                  label: '订单产品ID',
                  prop: 'id',
                  type: 'input',
                  addDisplay: false,
                  editDisplay: false,
                  viewDisplay: false,
                  hide: true,
                },
                {
                  label: '订单ID',
                  prop: 'orderId',
                  type: 'input',
                  addDisplay: false,
                  editDisplay: false,
                  viewDisplay: false,
                  hide: true,
                },
                {
                  label: '产品ID',
                  prop: 'productId',
                  type: 'input',
                  addDisplay: false,
                  editDisplay: false,
                  viewDisplay: false,
                  hide: true,
                },
                {
                  label: '产品名',
                  prop: 'productName',
                  type: 'input',
                  span: 6,
                  rules: [
                    {
                      required: true,
                      message: '请输入产品名',
                      trigger: 'blur',
                    },
                  ],
                },
                //规格
                {
                  label: '规格',
                  prop: 'specification',
                  type: 'input',
                  span: 6,
                  rules: [
                    {
                      required: true,
                      message: '请输入规格',
                      trigger: 'blur',
                    },
                  ],
                },

                {
                  label: '价格',
                  prop: 'price',
                  type: 'number',
                  //不能为负数
                  min: 0,
                  span: 6,
                  rules: [
                    {
                      required: true,
                      message: '请输入价格',
                      trigger: 'blur',
                    },
                  ],
                },
                {
                  label: '单笔限购',
                  prop: 'limitOneUser',
                  type: 'number',
                  //不能为负数
                  min: 0,
                  value: 0,
                  tip: '0为不限购',
                  span: 6,
                },
                {
                  label: '订单限购',
                  prop: 'limitPerUser',
                  type: 'number',
                  //不能为负数
                  min: 0,
                  value: 0,
                  tip: '0为不限购',
                  span: 6,
                },

                {
                  label: '总库存',
                  prop: 'stock',
                  type: 'number',
                  //不能为负数
                  min: 0,
                  span: 6,
                  rules: [
                    {
                      required: true,
                      message: '请输入库存',
                      trigger: 'blur',
                    },
                  ],
                },
                // {
                //   label: '实时库存',
                //   prop: 'remainingStock',
                //   type: 'input',
                //   //不能为负数
                //   min: 0,
                //   span: 6,
                //   addDisplay: false,
                //   editDisplay: true,
                //   viewDisplay: true,
                //   disabled: true,
                //   render: params => {
                //     const sold = params.row.sold || 0;
                //     const stock = params.row.stock || 0;
                //     return h(
                //       'div',
                //       {
                //         style: {
                //           color: stock - sold < 10 ? 'red' : 'black',
                //           // textAlign: 'left',
                //         },
                //       },
                //       stock - sold
                //     );
                //   },
                // },
                //已售
                {
                  label: '已售',
                  prop: 'sold',
                  type: 'number',
                  span: 6,
                  addDisplay: false,
                  editDisplay: false,
                  viewDisplay: true,
                },
                {
                  //排序
                  label: '排序',
                  prop: 'sort',
                  type: 'number',
                  span: 6,
                  value: 0,
                },
                //上下架
                // {
                //   label: '上下架',
                //   prop: 'productType',
                //   type: 'select',
                //   dicData: [
                //     { label: '上架', value: 1 },
                //     { label: '下架', value: 2 },
                //   ],
                //   dataType: 'number',
                //   span: 6,
                //   rules: [
                //     {
                //       required: true,
                //       message: '请选择上下架',
                //       trigger: 'blur',
                //     },
                //   ],
                // },
                {
                  label: '图片',
                  prop: 'productPicture',
                  type: 'upload',
                  dataType: 'string',
                  listType: 'picture-card',
                  loadText: '附件上传中，请稍等',
                  limit: 3,
                  fileSize: 100000,
                  accept: 'image/png, image/jpeg, video/mp4, video/avi',
                  tip: '只能上传3份jpg/png/mp4/avi，且不超过100M',
                  multiple: true,
                  span: 24,
                  propsHttp: {
                    url: 'link',
                    name: 'originalName',
                    res: 'data',
                  },
                  action: '/blade-resource/oss/endpoint/put-file-attach',
                },
                //描述
                {
                  label: '描述',
                  prop: 'productDesc',
                  type: 'textarea',
                  span: 24,
                  hide: true
                },
              ],
            },
            hide: true,
          },
          {
            label: '订单描述',
            prop: 'description',
            type: 'textarea',
            span: 24,
    overHidden: true,
          },
          {
            label: '订单表单',
            prop: 'customFormJson',
            type: 'textarea',
            span: 24,
            overHidden: true,
            formslot: true,
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide:true
          },
          {
            label: '订单图片',
            prop: 'backgroundImageUrl',
            type: 'upload',
            dataType: 'string',
            listType: 'picture-card',
            loadText: '附件上传中，请稍等',
            limit: 3,
            fileSize: 100000,
            accept: 'image/png, image/jpeg, video/mp4, video/avi',
            tip: '只能上传3份jpg/png/mp4/avi，且不超过100M',
            multiple: true,
            span: 24,
            propsHttp: {
              url: 'link',
              name: 'originalName',
              res: 'data',
            },
            action: '/blade-resource/oss/endpoint/put-file-attach',
          },
          {
            label: '开始日期',
            prop: 'startDate',
            type: 'datetime',
            format: 'YYYY-MM-DD HH:mm:ss',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            rules: [
              {
                required: true,
                message: '请输入开始日期',
                trigger: 'blur',
              },
            ],
            width: 200,
            search: true,
          },
          {
            label: '截止日期',
            prop: 'endDate',
            type: 'datetime',
            format: 'YYYY-MM-DD HH:mm:ss',
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            rules: [
              {
                required: true,
                message: '请输入截止日期',
                trigger: 'blur',
              },
            ],
            width: 200,
            search: true,
          },
          {
            label: '订单状态',
            prop: 'orderStatus',
            type: 'select',
            dicData: [
              { label: '已开单', value: 1 },
              { label: '已截单', value: 2 },
              { label: '未开单', value: 3 },
            ],
            value: 3,
            dataType: 'number',
            search: true,
            addDisplay: false,
            editDisplay: false,
          },

          {
            label: '访问量',
            prop: 'visit',
            type: 'number',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: true,
            width: 80,
          },
          {
            label: '创建人',
            prop: 'createUser',
            type: 'input',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide: true,
          },
          {
            label: '创建部门',
            prop: 'createDept',
            type: 'input',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide: true,
          },
          {
            label: '创建时间',
            prop: 'createTime',
            type: 'input',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide: true,
          },
          {
            label: '修改人',
            prop: 'updateUser',
            type: 'input',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide: true,
          },
          {
            label: '修改时间',
            prop: 'updateTime',
            type: 'input',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide: true,
          },
          {
            label: '是否已删除',
            prop: 'isDeleted',
            type: 'input',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide: true,
          },
          {
            label: '租户ID',
            prop: 'tenantId',
            type: 'input',
            addDisplay: false,
            editDisplay: false,
            viewDisplay: false,
            hide: true,
          },


          // 自定义表单配置
          // {
          //   label: '自定义表单',
          //   prop: 'customForms',
          //   type: 'dynamic',
          //   span: 24,
          //   children: {
          //     index: true,
          //     align: 'center',
          //     type: 'form',
          //     headerAlign: 'center',
          //     rowAdd: done => {
          //       done({
          //         formName: '',
          //         formType: 1,
          //         required: false,
          //         options: [],
          //         sort: 9999,
          //       });
          //     },
          //     rowDel: (row, done) => {
          //       done();
          //     },
          //     column: [
          //       {
          //         label: '表单名称',
          //         prop: 'formName',
          //         type: 'input',
          //         span: 6,
          //         rules: [
          //           {
          //             required: true,
          //             message: '请输入表单名称',
          //             trigger: 'blur',
          //           },
          //         ],
          //       },
          //       {
          //         label: '表单类型',
          //         prop: 'formType',
          //         type: 'select',
          //         dicData: [
          //           { label: '单行文本', value: 1 },
          //           { label: '多行文本', value: 2 },
          //           { label: '单选框', value: 3 },
          //           { label: '多选框', value: 4 },
          //           { label: '下拉选择', value: 5 },
          //           { label: '日期选择', value: 6 },
          //           { label: '时间选择', value: 7 },
          //           { label: '数字输入', value: 8 },
          //         ],
          //         dataType: 'number',
          //         span: 6,
          //         rules: [
          //           {
          //             required: true,
          //             message: '请选择表单类型',
          //             trigger: 'blur',
          //           },
          //         ],
          //         change: (obj) => {
          //           if (obj && obj.row) {
          //             // 确保选项数组初始化
          //             if (!obj.row.options) {
          //               obj.row.options = [];
          //             }
          //           }
          //         }
          //       },
          //       {
          //         label: '是否必填',
          //         prop: 'required',
          //         type: 'switch',
          //         span: 6,
          //         value: false,
          //       },
          //       {
          //         label: '排序',
          //         prop: 'sort',
          //         type: 'number',
          //         span: 6,
          //         value: 9999,
          //       },
          //       // 选项配置直接作为子表格显示
          //       {
          //         label: '选项配置',
          //         prop: 'options',
          //         type: 'dynamic',
          //         span: 24,
          //         children: {
          //           index: true,
          //           align: 'center',
          //           type: 'form',
          //           headerAlign: 'center',
          //           rowAdd: (done) => {
          //             done({
          //               optionLabel: '',
          //               optionValue: '',
          //               sort: 9999
          //             });
          //           },
          //           column: [
          //             {
          //               label: '选项标签',
          //               prop: 'optionLabel',
          //               type: 'input',
          //               span: 8,
          //               rules: [{ required: true, message: '请输入选项标签', trigger: 'blur' }]
          //             },
          //             {
          //               label: '选项值',
          //               prop: 'optionValue',
          //               type: 'input',
          //               span: 8,
          //               rules: [{ required: true, message: '请输入选项值', trigger: 'blur' }]
          //             },
          //             {
          //               label: '排序',
          //               prop: 'sort',
          //               type: 'number',
          //               span: 8,
          //               value: 9999
          //             }
          //           ]
          //         }
          //       }
          //     ]
          //   }
          // },
        ],
      },
      data: [],
      optionDialogVisible: false,
      currentFormRow: null,
      newOption: {
        optionLabel: '',
        optionValue: '',
        sort: 9999
      },
      // 自定义表单设计器相关数据
      formDesignerVisible: false,
      customFormItems: [],
      formTypeLabels: {
        text: '文本框',
        radio: '单选框',
        multiple: '多选框'
      },
      currentEditingItem: null
    };
  },
  computed: {
    ...mapGetters(['permission']),
    permissionList() {
      return {
        addBtn: this.validData(this.permission.orders_add, false),
        viewBtn: this.validData(this.permission.orders_view, false),
        delBtn: this.validData(this.permission.orders_delete, false),
        editBtn: this.validData(this.permission.orders_edit, false),
      };
    },
    ids() {
      let ids = [];
      this.selectionList.forEach(ele => {
        ids.push(ele.id);
      });
      return ids.join(',');
    },
  },
  methods: {
    rowSave(row, done, loading) {
      add(row).then(
        () => {
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          done();
        },
        error => {
          loading();
          window.console.log(error);
        }
      );
    },
    rowUpdate(row, index, done, loading) {
      update(row).then(
        () => {
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          done();
        },
        error => {
          loading();
          console.log(error);
        }
      );
    },
    rowDel(row) {
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return remove(row.id);
        })
        .then(() => {
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
        });
    },
    handleDelete() {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择至少一条数据');
        return;
      }
      this.$confirm('确定将选择数据删除?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return remove(this.ids);
        })
        .then(() => {
          this.onLoad(this.page);
          this.$message({
            type: 'success',
            message: '操作成功!',
          });
          this.$refs.crud.toggleSelection();
        });
    },
    handleExport() {
      let downloadUrl = `/blade-orders/orders/export-orders?${
        this.website.tokenHeader
      }=${getToken()}`;
      const { storeId, orderName, status, endDate, startDate } = this.query;
      let values = {
        storeId_equal: storeId,
        orderName_like: orderName,
        status_equal: status,
        endDate_ge: endDate,
        startDate_le: startDate,
      };
      this.$confirm('是否导出数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        NProgress.start();
        exportBlob(downloadUrl, values).then(res => {
          downloadXls(res.data, `订单表${dateNow()}.xlsx`);
          NProgress.done();
        });
      });
    },
    beforeOpen(done, type) {
      if (['edit', 'view'].includes(type)) {
        getDetail(this.form.id).then(res => {
          this.form = res.data.data;
          // 尝试解析customFormJson
          try {
            if (this.form.customFormJson) {
              this.customFormItems = JSON.parse(this.form.customFormJson);
            }
          } catch (e) {
            console.error('解析表单JSON失败', e);
          }
        });
      }
      done();
    },
    searchReset() {
      this.query = {};
      this.onLoad(this.page);
    },
    searchChange(params, done) {
      this.query = params;
      this.page.currentPage = 1;
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
    currentChange(currentPage) {
      this.page.currentPage = currentPage;
    },
    sizeChange(pageSize) {
      this.page.pageSize = pageSize;
    },
    refreshChange() {
      this.onLoad(this.page, this.query);
    },
    onLoad(page, params = {}) {
      this.loading = true;

      const { storeId, orderName, status, endDate, startDate,isTop,orderStatus } = this.query;

      let values = {
        storeId_equal: storeId,
        orderName_like: orderName,
        status_equal: status,
        endDate_ge: endDate,
        startDate_le: startDate,
        isTop_equal: isTop,
        orderStatus_equal: orderStatus
      };

      getList(page.currentPage, page.pageSize, values).then(res => {
        const data = res.data.data;
        this.page.total = data.total;
        this.data = data.records;
        this.loading = false;
        this.selectionClear();
      });
    },
    // 自定义表单设计器相关方法
    openFormDesigner(row) {
      // 将当前行的表单数据存储起来，以便后续保存
      this.form = row || this.form;

      // 尝试解析customFormJson
      try {
        if (this.form.customFormJson) {
          this.customFormItems = JSON.parse(this.form.customFormJson);
        } else {
          this.customFormItems = [];
        }
      } catch (e) {
        console.error('解析表单JSON失败', e);
        this.customFormItems = [];
      }
      this.formDesignerVisible = true;
    },

    generateUniqueId() {
      return 'u' + Math.random().toString(36).substring(2, 30);
    },

    addFormItem(type) {
      const newItem = {
        id: this.generateUniqueId(),
        type: type,
        question: '',
        value: type === 'multiple' ? [] : '',
        required: false
      };

      if (['radio', 'multiple'].includes(type)) {
        newItem.options = [];
      }

      this.customFormItems.push(newItem);
    },

    removeFormItem(index) {
      this.$confirm('确定要删除这个表单项吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.customFormItems.splice(index, 1);
      }).catch(() => {});
    },

    moveFormItem(index, direction) {
      if (direction === 'up' && index > 0) {
        const temp = this.customFormItems[index];
        this.customFormItems.splice(index, 1);
        this.customFormItems.splice(index - 1, 0, temp);
      } else if (direction === 'down' && index < this.customFormItems.length - 1) {
        const temp = this.customFormItems[index];
        this.customFormItems.splice(index, 1);
        this.customFormItems.splice(index + 1, 0, temp);
      }
    },

    addOption(item) {
      if (!item.options) {
        item.options = [];
      }

      item.options.push({
        id: this.generateUniqueId(),
        label: ''
      });
    },

    removeOption(item, optionIndex) {
      item.options.splice(optionIndex, 1);
    },

    editFormItemOptions(item) {
      this.currentEditingItem = item;
      // 如果需要额外的选项编辑对话框，可以在这里打开
    },

    saveCustomForm() {
      try {
        // 验证表单项
        for (const item of this.customFormItems) {
          if (!item.question.trim()) {
            this.$message.error('问题标题不能为空');
            return;
          }

          if (['radio', 'multiple'].includes(item.type)) {
            if (!item.options || item.options.length === 0) {
              this.$message.error(`"${item.question}"的选项不能为空`);
              return;
            }

            for (const option of item.options) {
              if (!option.label.trim()) {
                this.$message.error(`"${item.question}"中存在空选项`);
                return;
              }
            }
          }
        }

        // 保存表单到当前行对象
        this.form.customFormJson = JSON.stringify(this.customFormItems);

        // 提交到服务器
        const loading = ElLoading.service({
          lock: true,
          text: '正在保存表单...',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        update(this.form).then(() => {
          this.formDesignerVisible = false;
          this.$message.success('自定义表单已保存并提交');
          // 刷新数据
          this.onLoad(this.page);
          loading.close();
        }).catch(error => {
          console.error('保存表单失败', error);
          this.$message.error('提交表单失败，请重试');
          loading.close();
        });
      } catch (e) {
        console.error('保存表单失败', e);
        this.$message.error('保存表单失败');
      }
    },
  },
};
</script>

<style>
.options-table {
  margin-top: 10px;
}

.form-designer-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.form-designer-toolbar {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.form-designer-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 10px;
}

.form-item-card {
  margin-bottom: 15px;
}

.form-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.delete-option-btn {
  margin-left: 8px;
}

.delete-btn {
  color: #f56c6c;
}
</style>
