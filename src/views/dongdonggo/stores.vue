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
                   v-if="permission.stores_delete"
                   @click="handleDelete">删 除
        </el-button>
        <el-button type="warning"
                   plain
                   icon="el-icon-download"
                   @click="handleExport">导 出
        </el-button>
      </template>
      <template #menu="scope">
        <el-button
          type="primary"
          text
          icon="el-icon-check"
          v-if="permission.storesAudit && scope.row.approved!==2"
          @click="handlePkAuditPassBottom(scope.row.id)"
        >通过
        </el-button>
<!--        <el-button-->
<!--          type="primary"-->
<!--          text-->
<!--          icon="el-icon-close"-->
<!--          v-if="permission.storesAudit && scope.row.approved!==2&& scope.row.approved!==3"-->
<!--          @click="handlePkAuditPassBottom(scope.row.id)"-->
<!--        >不通过-->
<!--        </el-button>-->
      </template>
      <template #approved="{ row }">
        <el-tag v-if="row.approved === 1" type="info">未审核</el-tag>
        <el-tag v-if="row.approved === 2" type="success">通过</el-tag>
        <el-tag v-if="row.approved === 3" type="danger">不通过</el-tag>
      </template>
    </avue-crud>
  </basic-container>
</template>

<script>
import { getList, getDetail, add, update, remove, auditPass } from '@/api/dongdonggo/stores';
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
          menuWidth:300,
          column: [
            {
              label: "商户",
              prop: "id",
              type: "input",
              addDisplay: false,
              editDisplay: false,
              viewDisplay: false,
              hide: true,
            },
            {
              label: this.$t('stores.user'),
              prop: "userId",
              type: "select",
              dicUrl: "/blade-system/user/user-list",
              props: {
                label: "realName",
                value: "id"
              },
              filterable: true,
              search: true,
            },
            {
              label: "商户名称",
              prop: "storeName",
              type: "input",
              search: true,
            },
            {
              label: '类别',
              type: 'select',
              dicUrl: '/blade-system/dict-biz/dictionary?code=storeType',
              props: {
                label: 'dictValue',
                value: 'dictKey',
              },
              dataType: 'number',
              slot: true,
              prop: 'storeType',
              search: true,
              rules: [
                {
                  required: true,
                  message: '请输入类别',
                  trigger: 'blur',
                },
              ],
            },
            // {
            //   label: '营业状态',
            //   type: 'select',
            //   dicUrl: '/blade-system/dict-biz/dictionary?code=operatingStatus',
            //   props: {
            //     label: 'dictValue',
            //     value: 'dictKey',
            //   },
            //   dataType: 'number',
            //   slot: true,
            //   prop: 'category',
            //   search: true,
            //   rules: [
            //     {
            //       required: true,
            //       message: '请输入营业状态',
            //       trigger: 'blur',
            //     },
            //   ],
            // },
            {
              label: "状态",
              prop: "approved",
              type: "select",
              dicData: [
                { label: "未审核", value: 1 },
                { label: "通过", value: 2 },
                { label: "不通过", value: 3 }
              ],
              dataType: "number",
              props: {
                label: "label",
                value: "value"
              },
              search: true,
              slot: true,
              addDisplay: false,
              editDisplay: false,
              viewDisplay: true,
            },
            {
              label: "商户背景",
              prop: "backgroundUrl",
              type: 'upload',
              dataType:"string",
              listType: 'picture-card',
              loadText: '附件上传中，请稍等',
              limit: 1,
              fileSize: 100000,
              accept: 'image/png, image/jpeg, video/mp4, video/avi',
              tip: '只能上传1份jpg/png/mp4/avi，且不超过100M',
              multiple: true,
              span: 12,
              propsHttp: {
                url: 'link',
                name: 'originalName',
                res: 'data'
              },
              action: '/blade-resource/oss/endpoint/put-file-attach',
            },
            {
              label: "商户Logo",
              prop: "logoUrl",
              type: 'upload',
              dataType:"string",
              listType: 'picture-card',
              loadText: '附件上传中，请稍等',
              limit: 1,
              fileSize: 100000,
              accept: 'image/png, image/jpeg, video/mp4, video/avi',
              tip: '只能上传1份jpg/png/mp4/avi，且不超过100M',
              multiple: true,
              span: 12,
              propsHttp: {
                url: 'link',
                name: 'originalName',
                res: 'data'
              },
              action: '/blade-resource/oss/endpoint/put-file-attach',
            },
            {
              label: "商户介绍",
              prop: "storeIntroduce",
              type: 'upload',
              dataType:"string",
              listType: 'picture-card',
              loadText: '附件上传中，请稍等',
              limit:  5,
              fileSize: 100000,
              accept: 'image/png, image/jpeg, video/mp4, video/avi',
              tip: '只能上传jpg/png/mp4/avi，且不超过100M',
              multiple: true,
              span: 12,
              propsHttp: {
                url: 'link',
                name: 'originalName',
                res: 'data'
              },
              action: '/blade-resource/oss/endpoint/put-file-attach',
            },
            {
              label: "商户描述",
              prop: "description",
              type: "textarea",
              span: 24,
              overHidden: true,
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
        }
        ,
        data: [],
      };
    },
    computed: {
      ...mapGetters(["permission"]),
      permissionList() {
        return {
          addBtn: this.validData(this.permission.stores_add, false),
          viewBtn: this.validData(this.permission.stores_view, false),
          delBtn: this.validData(this.permission.stores_delete, false),
          editBtn: this.validData(this.permission.stores_edit, false)
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
        let downloadUrl = `/blade-stores/stores/export-stores?${this.website.tokenHeader}=${getToken()}`;
        const {
            userId,
            storeName,
          approved,
        } = this.query;
        let values = {
            userId_equal: userId,
            storeName_like: storeName,
          approved_equal: approved,
        };
        this.$confirm("是否导出数据?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          NProgress.start();
          exportBlob(downloadUrl, values).then(res => {
            downloadXls(res.data, `商户表${dateNow()}.xlsx`);
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

        const {
          userId,
          storeName,
          approved,
        } = this.query;

        let values = {
          userId_equal: userId,
          storeName_like: storeName,
          approved_equal: approved,
        };

        getList(page.currentPage, page.pageSize, values).then(res => {
          const data = res.data.data;
          this.page.total = data.total;
          this.data = data.records;
          this.loading = false;
          this.selectionClear();
        });
      },
      handlePkAuditPassBottom(id) {
        this.$confirm('确定将商户审核通过?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            return auditPass(id);
          })
          .then(() => {
            this.onLoad(this.page);
            this.$message({
              type: 'success',
              message: '操作成功!'
            });
            this.$refs.crud.toggleSelection();
          });
      },

    }
  };
</script>

<style>
</style>
