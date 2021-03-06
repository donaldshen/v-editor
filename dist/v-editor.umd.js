(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('wangeditor'), require('@femessage/upload-to-ali')) :
  typeof define === 'function' && define.amd ? define(['exports', 'wangeditor', '@femessage/upload-to-ali'], factory) :
  (factory((global.VEditor = {}),global.E,global.UploadToAli));
}(this, (function (exports,E,UploadToAli) { 'use strict';

  E = E && E.hasOwnProperty('default') ? E['default'] : E;
  UploadToAli = UploadToAli && UploadToAli.hasOwnProperty('default') ? UploadToAli['default'] : UploadToAli;

  var defaultEditorOptions = {
    debug: false,
    onchangeTimeout: 200,
    menus: ['head', 'bold', 'fontSize', 'fontName', 'italic', 'underline', 'strikeThrough', 'foreColor', 'backColor', 'link', 'list', 'justify', 'quote', 'image', 'table', 'code', 'undo', 'redo']
  };

  (function () {
    if (typeof document !== 'undefined') {
      var head = document.head || document.getElementsByTagName('head')[0],
          style = document.createElement('style'),
          css = ".v-editor { position: relative; } .v-editor .text-box { margin: 10px 0; line-height: 1.5; } .v-editor .disabled-mask { position: absolute; background-color: rgba(0,0,0,0); margin: 0; top: 0; right: 0; bottom: 0; left: 0; z-index: 2000; cursor: not-allowed; } .v-editor .loading-mask { position: absolute; background-color: rgba(0,0,0,0.3); margin: 0; top: 0; right: 0; bottom: 0; left: 0; z-index: 2000; } .v-editor .loading-mask .loading-content { position: absolute; text-align: center; width: 100%; top: 50%; margin-top: -21px; } ";style.type = 'text/css';if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }head.appendChild(style);
    }
  })();

  var HTML_PATTERN = /^<[a-z].*>$/i;

  // 对齐wangEditor的样式
  var editorValue = function editorValue(val) {
    return val && HTML_PATTERN.test(val) ? val : '<div class="text-box">' + val + '<br></div>';
  };

  var Component = { render: function render() {
      var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "v-editor" }, [_vm.showLoading ? _c('div', { staticClass: "loading-mask" }, [_c('div', { staticClass: "loading-content" }, [_vm._t("loading", [_c('p', [_vm._v("文件上传中...")])])], 2)]) : _vm._e(), _vm._v(" "), _c('div', { ref: "editor", staticStyle: { "text-align": "left" }, on: { "paste": _vm.paste } }), _vm._v(" "), _c('upload-to-ali', _vm._b({ directives: [{ name: "show", rawName: "v-show", value: false, expression: "false" }], ref: "uploadToAli", attrs: { "multiple": "multiple" }, on: { "loading": _vm.handleLoading, "loaded": _vm.handleUploadFileSuccess } }, 'upload-to-ali', _vm.uploadOptions, false))], 1);
    }, staticRenderFns: [],
    name: 'VEditor',
    components: {
      UploadToAli: UploadToAli
    },
    props: {
      /**
       * upload-to-ali的参数:
       * 文档参看upload-to-ali;
       */
      uploadOptions: {
        type: Object,
        default: function _default() {
          return {};
        }
      },
      /**
       * 编辑的内容，返回一段HTML，支持v-model
       */
      value: {
        type: String,
        default: function _default() {
          return '';
        }
      },
      /**
       * editor默认配置
       * 文档查看 https://github.com/wangfupeng1988/wangEditor;
       */
      editorOptions: {
        type: Object,
        default: function _default() {
          return defaultEditorOptions;
        }
      },
      /**
       * 编辑器的高度
       * 默认高度为400px
       */
      height: {
        type: Number,
        default: 400
      },
      /**
       * 编辑器是否可编辑:
       * false 可以编辑
       * true 不可以编辑
       */
      disabled: {
        type: Boolean,
        default: false
      }
    },
    data: function data() {
      return {
        enableUpdateValue: true,
        showLoading: false
      };
    },

    watch: {
      disabled: function disabled(val, oldVal) {
        document.querySelector('.w-e-toolbar').style['pointer-events'] = val ? 'none' : '';
        this.editor.$textElem.attr('contenteditable', !val);
      },
      value: function value(val, oldVal) {
        //更新编辑器内容会导致光标偏移, 故只在blur之后更新
        if (this.enableUpdateValue) {
          this.editor && this.editor.$textElem.html(editorValue(val));
        }
      }
    },
    mounted: function mounted() {
      var _this = this;

      //初始化editor
      var editor = new E(this.$refs.editor);
      // 允许自定义上传
      editor.customConfig.qiniu = true;
      // 自定义菜单配置
      editor.customConfig.menus = this.editorOptions.menus || defaultEditorOptions.menus;
      //debug模式下，有 JS 错误会以throw Error方式提示出来。默认值为false，即不会抛出异常。
      editor.customConfig.debug = this.editorOptions.debug;

      //配置编辑区域的 z-index
      editor.customConfig.zIndex = 100;

      // 自定义 onchange 触发的延迟时间，默认为 200 ms
      editor.customConfig.onchangeTimeout = this.editorOptions.onchangeTimeout || defaultEditorOptions.onchangeTimeout; // 单位 ms

      editor.customConfig.onchange = function (html) {
        // 输入内容为空时，返回空字符串，而不是<p><br></p>
        var value = editor && editor.$textElem[0].textContent.trim() ? html : '';
        // html 即变化之后的内容
        _this.$emit('input', value);
      };

      editor.customConfig.onfocus = function (html) {
        // 选中焦点时不处理watch value
        _this.enableUpdateValue = false;
      };
      editor.customConfig.onblur = function (html) {
        // 失去焦点时watch value
        _this.enableUpdateValue = true;
      };

      editor.create();

      //设置默认值
      editor.txt.html(editorValue(this.value));
      //是否禁用编辑器
      document.querySelector('.w-e-toolbar').style['pointer-events'] = this.disabled ? 'none' : '';
      editor.$textElem.attr('contenteditable', !this.disabled);

      //设置编辑器的高度
      document.querySelector('.w-e-text-container').style.height = this.height + 'px';

      //监听上传图标的点击事件
      document.getElementById(editor.imgMenuId).addEventListener('click', this.handleUpload);

      //保存实例，用于后续处理
      this.editor = editor;
    },

    methods: {
      getEditor: function getEditor() {
        //暴露当前编辑器，可以在外部调用编辑器的功能
        return this.editor;
      },
      handleUpload: function handleUpload() {
        //如果禁用则不进行上传操作
        if (this.disabled) return;

        this.$refs.uploadToAli.selectFiles();
      },
      handleLoading: function handleLoading() {
        //外部监听upload-loading，增加显示loading ui 逻辑
        this.showLoading = true;
        this.$emit('upload-loading', true);
      },
      handleUploadFileSuccess: function handleUploadFileSuccess(urls) {
        var _this2 = this;

        // 将文件上传后的URL地址插入到编辑器文本中
        if (!!urls) {
          // 插入图片到editor
          urls.forEach(function (item) {
            _this2.editor.cmd.do('insertHtml', '<img src="' + item + '" style="max-width:100%;"/>');
          });
        } else {
          //外部监听upload-error，增加错误上传的处理
          this.$emit('upload-error');
        }
        //外部监听upload-loading，增加显示loading ui 逻辑
        this.showLoading = false;
        this.$emit('upload-loading', false);
      },
      paste: function paste(e) {
        if (!e.clipboardData.files.length) return;
        this.$refs.uploadToAli.paste(e);
      }
    }
  };

  // Import vue component

  // install function executed by Vue.use()
  function install(Vue) {
    if (install.installed) return;
    install.installed = true;
    Vue.component('VEditor', Component);
  }

  // Create module definition for Vue.use()
  var plugin = {
    install: install

    // To auto-install when vue is found
  };var GlobalVue = null;
  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }
  if (GlobalVue) {
    GlobalVue.use(plugin);
  }

  // It's possible to expose named exports when writing components that can
  // also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
  // export const RollupDemoDirective = component;

  exports.install = install;
  exports.default = Component;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
