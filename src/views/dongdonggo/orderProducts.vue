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
        <el-button type="danger"
                   icon="el-icon-delete"
                   plain
                   v-if="permission.orderProducts_delete"
                   @click="handleDelete">删 除
        </el-button>
        <el-button type="warning"
                   plain
                   icon="el-icon-download"
                   @click="handleExport">导 出
        </el-button>
      </template>

    </avue-crud>
  </basic-container>
</template>

<script>
  import {getList, getDetail, add, update, remove} from "@/api/dongdonggo/orderProducts";
  import {mapGetters} from "vuex";
  import {exportBlob} from "@/api/common";
  import {getToken} from '@/utils/auth';
  import {downloadXls} from "@/utils/util";
  import {dateNow} from "@/utils/date";
  import NProgress from 'nprogress';
  import 'nprogress/nprogress.css';

  export default {
    data() {
      return {
        form: {},
        query: {},
        search: {},
        loading: true,
        page: {
          pageSize: 10,
          currentPage: 1,
          total: 0
        },
        selectionList: [],
        option: {
          height:'auto',
          calcHeight: 30,
          tip: false,
          searchShow: true,
          searchMenuSpan: 6,
          border: true,
          index: true,
          viewBtn: true,
          selection: true,
          dialogClickModal: false,
          column: [
            {
              label: "订单产品ID",
              prop: "id",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: "订单ID",
              prop: "orderId",
              type: "input",
              hide: true,
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
            },
            {
              label: "订单名称",
              prop: "orderName",
              type: "input",
              disabled: true,
              search: true,
            },
            {
              label: "产品ID",
              prop: "productId",
              type: "input",
              hide: true,
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
            },
            {
              label: "产品名称",
              prop: "productName",
              type: "input",
              disabled: true,
              search: true,
            },
            {
              label: "库存数量",
              prop: "stock",
              type: "input",
            },
            {
              label: '已售',
              prop: 'sold',
              type: 'number',
              addDisplay: false,
              editDisplay: false,
              viewDisplay: true,
            },
            // {
            //   label: '实时库存',
            //   prop: 'remainingStock',
            //   type: 'input',
            //   //不能为负数
            //   min: 0,
            //   span: 6,
            //   addDisplay: false,
            //   editDisplay: false,
            //   viewDisplay: false,
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
            //      stock - sold
            //     );
            //   },
            //
            // },
            {
              label: "订单限购数量",
              prop: "limitPerUser",
              type: "input",
            },
            {
              label: "单笔限购数量",
              prop: "limitOneUser",
              type: "input",
            },
            {
              label: "产品价格",
              prop: "price",
              type: "input",
            },
            //产品状态
            //上下架
            // {
            //   label: '状态',
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
            //描述
            {
              label: '描述',
              prop: 'productDesc',
              type: 'textarea',
              span: 24,
              hide: true
            },

            {
              label: "创建人",
              prop: "createUser",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: "创建部门",
              prop: "createDept",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: "创建时间",
              prop: "createTime",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: "修改人",
              prop: "updateUser",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: "修改时间",
              prop: "updateTime",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: "状态",
              prop: "status",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: "是否已删除",
              prop: "isDeleted",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: "租户ID",
              prop: "tenantId",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },

          ]
        },
        data: []
      };
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          addBtn: this.validData(this.permission.orderProducts_add, false),
          viewBtn: this.validData(this.permission.orderProducts_view, false),
          delBtn: this.validData(this.permission.orderProducts_delete, false),
          editBtn: this.validData(this.permission.orderProducts_edit, false)
        };
      },
      ids() {
        let ids = [];
        this.selectionList.forEach(ele => {
          ids.push(ele.id);
        });
        return ids.join(",");
      }
    },
    methods: {
      rowSave(row, done, loading) {
        add(row).then(() => {
          this.onLoad(this.page);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          done();
        }, error => {
          loading();
          window.console.log(error);
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
          loading();
          console.log(error);
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
        let downloadUrl = `/blade-orderProducts/orderProducts/export-orderProducts?${this.website.tokenHeader}=${getToken()}`;
        const { orderName, productName } = this.query;
        let values = {
          orderName_like: orderName,
          productName_like: productName
        };
        this.$confirm("是否导出数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          NProgress.start();
          exportBlob(downloadUrl, values).then(res => {
            downloadXls(res.data, `订单产品表${dateNow()}.xlsx`);
            NProgress.done();
          })
        });
      },
      beforeOpen(done, type) {
        if (["edit", "view"].includes(type)) {
          getDetail(this.form.id).then(res => {
            this.form = res.data.data;
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
      currentChange(currentPage){
        this.page.currentPage = currentPage;
      },
      sizeChange(pageSize){
        this.page.pageSize = pageSize;
      },
      refreshChange() {
        this.onLoad(this.page, this.query);
      },
      onLoad(page, params = {}) {
        this.loading = true;

        const { orderName, productName } = this.query;
        let values = {
          orderName_like: orderName,
          productName_like: productName
        };

        getList(page.currentPage, page.pageSize, values).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          this.loading = false;
          this.selectionClear();
        });
      }
    }
  };
</script>

<style>
</style>
