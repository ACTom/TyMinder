# TyMinder 开发指南 (AI Context)

本文档旨在辅助 AI 理解项目结构，快速定位文件，避免错误修改。

## 1. 架构精简说明

项目采用 **Core (核心库) + Runtime (业务逻辑) + UI (界面)** 分层架构。

*   **UI 层 (`ui/`)**: 基于 **AngularJS**。负责界面展示，通过调用 Command 与逻辑层交互。
*   **Runtime 层 (`src/`)**: 基于 **CMD/Sea.js**。负责具体的业务逻辑、命令实现、事件处理。
*   **Native 层 (`src/native.js`)**: 负责与 Tauri 宿主环境交互（文件、窗口、系统 API）。
*   **Core 层**: `kityminder-core`（引入的库，**通常不直接修改**）。

## 2. 修改任务速查表 (Where to Edit)

根据你要修改的功能，直接定位到以下文件：

| 任务类型 | 关键目录/文件 | 操作指南 |
| :--- | :--- | :--- |
| **修改 UI 结构/HTML** | `ui/directive/{组件名}/{组件名}.html` | 界面由一个个 directive 组成，找到对应的文件夹。 |
| **修改 UI 样式** | `less/` | **禁止直接修改 CSS**。修改 LESS 文件，例如 `topTab` 对应顶部栏，`dialog` 对应弹窗。 |
| **修改/新增 业务逻辑** | `src/runtime/` | 所有核心逻辑都在这里。例如：复制粘贴看 `clipboard.js`，节点操作看 `node.js`。 |
| **新增 Command (命令)** | `src/runtime/` | 在相关业务模块中调用 `minder.registerCommand`。 |
| **绑定 UI 按钮到命令** | `ui/directive/{组件名}/*.js` | 在 directive link 函数中调用 `$scope.minder.execCommand`。 |
| **修改 快捷键** | `src/runtime/` | 搜索 `addCommandStateEvent` 或直接查看对应功能的 runtime 文件。 |
| **修改 右键菜单** | `src/runtime/hotbox.js` | 修改热盒菜单配置。 |
| **修改 弹窗 (Dialog)** | `ui/dialog/{弹窗名}/` | 包含 `tpl.html` (模板) 和 `ctrl.js` (逻辑)。 |
| **修改 Tauri/系统调用**| `src/native.js` | 所有 `window.__TAURI__` 相关的调用都封装在此。 |

## 3. 关键文件索引

*   **入口文件**:
    *   `src/editor.js`: 编辑器逻辑入口，组装所有 Runtime 模块。
    *   `ui/kityminder.app.js`: AngularJS 应用入口，定义模块依赖。
*   **桥接服务**:
    *   `ui/service/commandBinder.service.js`: **极其重要**。负责将 UI 按钮的状态（可用/禁用/高亮）自动绑定到 Core 的命令状态。
*   **系统能力**:
    *   `src/native.js`: 封装了 Tauri 的 invoke, fs, window 等操作。
    *   `ui/service/native.service.js`: AngularJS 层的 native 代理服务。

## 3.1 Service 层说明

UI 层的 Service (`ui/service/`) 用于管理跨 Directive 的共享状态和逻辑：

| Service | 职责 |
| :--- | :--- |
| `config.service.js` | **编辑器配置**（面板宽度、语言、缩放等静态配置） |
| `document.service.js` | **文档状态**（当前文件路径、文件名、修改状态） |
| `memory.service.js` | LocalStorage 读写封装 |
| `native.service.js` | Tauri 原生能力代理（从 `src/native.js` 获取） |
| `minder.service.js` | minder 初始化事件回调队列 |
| `resource.service.js` | 资源/标签管理 |
| `revokeDialog.service.js` | 关闭前确认弹窗服务 |

## 4. 开发守则 (AI Rules)

1.  **分层原则**:
    *   **UI 文件 (`ui/`)** 只负责展示和调用命令，**不要**在 Controller/Directive 中直接操作 DOM 节点或修改数据模型。
    *   **所有数据变更**必须通过 `minder.execCommand()` 触发。

2.  **Runtime 扩展**:
    *   如果需要添加新功能，优先在 `src/runtime/` 下新建模块或修改现有模块，然后在 `src/editor.js` 中 `assemble` 引入。

3.  **系统调用**:
    *   不要在 UI 或 Runtime 中直接使用 `window.__TAURI__`。请使用 `require('native')` (在 src 下) 或 `require('../native')` (在 runtime 下) 来访问 `src/native.js` 提供的接口。

4.  **样式规范**:
    *   始终修改 `less/` 目录下的文件。

5.  **状态管理原则**:
    *   跨组件共享的状态（如当前文件信息）应放在 **Service** 中，而不是某个 Directive 的局部变量。
    *   Service 通过 `$rootScope.$broadcast()` 通知状态变化，Directive 通过 `$scope.$on()` 监听。

6.  **常见对应关系**:
    *   "插入下级" -> `src/runtime/node.js` (逻辑) + `ui/directive/appendNode/` (UI)。
    *   "优先级" -> `src/runtime/priority.js` (逻辑) + `ui/directive/priorityEditor/` (UI)。
    *   "撤销重做" -> `src/runtime/history.js` (逻辑) + `ui/directive/undoRedo/` (UI)。
