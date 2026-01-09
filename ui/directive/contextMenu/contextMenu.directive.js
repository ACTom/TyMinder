/**
 * 右键菜单指令
 * 替代原有的圆盘 hotbox，提供传统的多级右键菜单
 */
angular.module('kityminderEditor')
    .directive('contextMenu', ['$timeout', '$uibModal', 'aiService', 'valueTransfer', function($timeout, $modal, aiService, valueTransfer) {
        return {
            restrict: 'E',
            templateUrl: 'ui/directive/contextMenu/contextMenu.html',
            scope: {
                minder: '='
            },
            replace: true,
            link: function($scope, element) {
                var minder = $scope.minder;
                var lang = window.editor && window.editor.lang ? window.editor.lang.t : function(k) { return k; };

                // AI 加载状态
                $scope.aiLoading = false;
                $scope.aiConfigured = false;
                
                // 检查 AI 配置
                function checkAIConfig() {
                    aiService.isConfigured().then(function(configured) {
                        $scope.aiConfigured = configured;
                    });
                }
                
                // 初始化时检查
                checkAIConfig();
                
                // 监听设置保存事件
                $scope.$on('ai:configSaved', function() {
                    checkAIConfig();
                });

                // 菜单状态
                $scope.visible = false;
                $scope.menuX = 0;
                $scope.menuY = 0;
                $scope.activeSubmenu = null;
                $scope.activeSubmenu2 = null;
                $scope.submenuStyle = {};
                $scope.submenu2Style = {};

                // 优先级选项 (1-9)
                $scope.priorityOptions = [];
                for (var i = 1; i <= 9; i++) {
                    $scope.priorityOptions.push({ value: i, label: 'P' + i });
                }

                // 进度选项 (0-8 对应未开始到已完成)
                $scope.progressOptions = [
                    { value: 1, label: lang('p1', 'ui/progress') || '未开始', icon: 'progress-0' },
                    { value: 2, label: lang('p2', 'ui/progress') || '1/8', icon: 'progress-1' },
                    { value: 3, label: lang('p3', 'ui/progress') || '1/4', icon: 'progress-2' },
                    { value: 4, label: lang('p4', 'ui/progress') || '3/8', icon: 'progress-3' },
                    { value: 5, label: lang('p5', 'ui/progress') || '1/2', icon: 'progress-4' },
                    { value: 6, label: lang('p6', 'ui/progress') || '5/8', icon: 'progress-5' },
                    { value: 7, label: lang('p7', 'ui/progress') || '3/4', icon: 'progress-6' },
                    { value: 8, label: lang('p8', 'ui/progress') || '7/8', icon: 'progress-7' },
                    { value: 9, label: lang('p9', 'ui/progress') || '已完成', icon: 'progress-8' }
                ];

                // 菜单项定义
                function buildMenuItems() {
                    lang = window.editor && window.editor.lang ? window.editor.lang.t : function(k) { return k; };
                    
                    return [
                        {
                            id: 'insert',
                            label: lang('insert', 'ui/contextmenu') || lang('insert', 'panels') || '插入',
                            icon: 'glyphicon-plus',
                            submenu: [
                                {
                                    id: 'appendChildNode',
                                    label: lang('appendchildnode', 'runtime/node') || '下级节点',
                                    shortcut: 'Tab',
                                    action: function() { execCommand('AppendChildNode'); }
                                },
                                {
                                    id: 'appendSiblingNode',
                                    label: lang('appendsiblingnode', 'runtime/node') || '同级节点',
                                    shortcut: 'Enter',
                                    action: function() { execCommand('AppendSiblingNode'); }
                                },
                                {
                                    id: 'appendParentNode',
                                    label: lang('appendparentnode', 'runtime/node') || '上级节点',
                                    shortcut: 'Shift+Tab',
                                    action: function() { execCommand('AppendParentNode'); }
                                }
                            ]
                        },
                        { type: 'separator' },
                        {
                            id: 'edit',
                            label: lang('edit', 'runtime/input') || '编辑',
                            icon: 'glyphicon-pencil',
                            shortcut: 'F2',
                            action: function() {
                                if (window.editor && window.editor.editText) {
                                    window.editor.editText();
                                }
                            }
                        },
                        {
                            id: 'delete',
                            label: lang('removenode', 'runtime/node') || '删除',
                            icon: 'glyphicon-trash',
                            shortcut: 'Delete',
                            action: function() { execCommand('RemoveNode'); }
                        },
                        { type: 'separator' },
                        {
                            id: 'arrangeUp',
                            label: lang('arrangeup', 'runtime/node') || '上移',
                            icon: 'glyphicon-arrow-up',
                            shortcut: 'Alt+↑',
                            action: function() { execCommand('ArrangeUp'); },
                            enable: function() { return minder.queryCommandState('ArrangeUp') !== -1; }
                        },
                        {
                            id: 'arrangeDown',
                            label: lang('arrangedown', 'runtime/node') || '下移',
                            icon: 'glyphicon-arrow-down',
                            shortcut: 'Alt+↓',
                            action: function() { execCommand('ArrangeDown'); },
                            enable: function() { return minder.queryCommandState('ArrangeDown') !== -1; }
                        },
                        { type: 'separator' },
                        {
                            id: 'priority',
                            label: lang('main', 'runtime/priority') || '优先级',
                            icon: 'glyphicon-flag',
                            shortcut: 'P',
                            submenu: buildPrioritySubmenu()
                        },
                        {
                            id: 'progress',
                            label: lang('main', 'runtime/progress') || '进度',
                            icon: 'glyphicon-tasks',
                            shortcut: 'G',
                            submenu: buildProgressSubmenu()
                        },
                        { type: 'separator' },
                        {
                            id: 'copy',
                            label: lang('copy', 'ui/contextmenu') || '复制',
                            icon: 'glyphicon-copy',
                            shortcut: 'Ctrl+C',
                            action: function() { doCopy(); }
                        },
                        {
                            id: 'cut',
                            label: lang('cut', 'ui/contextmenu') || '剪切',
                            icon: 'glyphicon-scissors',
                            shortcut: 'Ctrl+X',
                            action: function() { doCut(); }
                        },
                        {
                            id: 'paste',
                            label: lang('paste', 'ui/contextmenu') || '粘贴',
                            icon: 'glyphicon-paste',
                            shortcut: 'Ctrl+V',
                            action: function() { doPaste(); }
                        },
                        { type: 'separator', id: 'separator_before_ai' },
                        {
                            id: 'ai',
                            label: lang('ai', 'ui/contextmenu') || 'AI',
                            icon: 'glyphicon-flash',
                            submenu: buildAISubmenu()
                        }
                    ];
                }
                
                // 构建 AI 子菜单
                function buildAISubmenu() {
                    return [
                        {
                            id: 'aiExpand',
                            label: lang('aiexpand', 'ui/contextmenu') || 'AI 扩展',
                            icon: 'glyphicon-plus-sign',
                            action: function() { doAIExpand(); },
                            enable: function() { return $scope.aiConfigured && !$scope.aiLoading; }
                        },
                        {
                            id: 'aiRewrite',
                            label: lang('airewrite', 'ui/contextmenu') || 'AI 改写',
                            icon: 'glyphicon-edit',
                            submenu: [
                                {
                                    id: 'aiRewriteExpand',
                                    label: lang('airewriteexpand', 'ui/contextmenu') || '扩展',
                                    action: function() { doAIRewrite('expand'); },
                                    enable: function() { return $scope.aiConfigured && !$scope.aiLoading; }
                                },
                                {
                                    id: 'aiRewriteSimplify',
                                    label: lang('airewritesimplify', 'ui/contextmenu') || '精简',
                                    action: function() { doAIRewrite('simplify'); },
                                    enable: function() { return $scope.aiConfigured && !$scope.aiLoading; }
                                },
                                {
                                    id: 'aiRewritePolish',
                                    label: lang('airewritepolish', 'ui/contextmenu') || '润色',
                                    action: function() { doAIRewrite('polish'); },
                                    enable: function() { return $scope.aiConfigured && !$scope.aiLoading; }
                                }
                            ]
                        },
                        {
                            id: 'aiSummarize',
                            label: lang('aisummarize', 'ui/contextmenu') || 'AI 总结',
                            icon: 'glyphicon-list-alt',
                            action: function() { doAISummarize(); },
                            enable: function() { 
                                if (!$scope.aiConfigured || $scope.aiLoading) return false;
                                var node = minder.getSelectedNode();
                                return node && node.children && node.children.length > 0;
                            }
                        }
                    ];
                }

                function buildPrioritySubmenu() {
                    var items = [];
                    for (var i = 1; i <= 9; i++) {
                        (function(priority) {
                            items.push({
                                id: 'priority_' + priority,
                                label: 'P' + priority,
                                shortcut: String(priority),
                                icon: 'priority-icon priority-' + priority,
                                action: function() { execCommand('Priority', priority); }
                            });
                        })(i);
                    }
                    items.push({ type: 'separator' });
                    items.push({
                        id: 'priority_clear',
                        label: lang('clearpriority', 'ui/contextmenu') || lang('remove', 'runtime/priority') || '清除优先级',
                        shortcut: 'Del',
                        action: function() { execCommand('Priority', 0); }
                    });
                    return items;
                }

                function buildProgressSubmenu() {
                    var labels = [
                        lang('p1', 'ui/progress') || '未开始',
                        lang('p2', 'ui/progress') || '完成 1/8',
                        lang('p3', 'ui/progress') || '完成 1/4',
                        lang('p4', 'ui/progress') || '完成 3/8',
                        lang('p5', 'ui/progress') || '完成一半',
                        lang('p6', 'ui/progress') || '完成 5/8',
                        lang('p7', 'ui/progress') || '完成 3/4',
                        lang('p8', 'ui/progress') || '完成 7/8',
                        lang('p9', 'ui/progress') || '已完成'
                    ];
                    var items = [];
                    for (var i = 0; i < 9; i++) {
                        (function(idx) {
                            items.push({
                                id: 'progress_' + idx,
                                label: labels[idx],
                                shortcut: String(idx),
                                icon: 'progress-icon progress-' + idx,
                                action: function() { execCommand('Progress', idx + 1); }
                            });
                        })(i);
                    }
                    items.push({ type: 'separator' });
                    items.push({
                        id: 'progress_clear',
                        label: lang('clearprogress', 'ui/contextmenu') || lang('p0', 'ui/progress') || '清除进度',
                        shortcut: 'Del',
                        action: function() { execCommand('Progress', 0); }
                    });
                    return items;
                }

                $scope.menuItems = buildMenuItems();

                // ==================== AI 功能实现 ====================
                
                // AI 扩展节点
                function doAIExpand() {
                    var node = minder.getSelectedNode();
                    if (!node) return;
                    
                    var nodeText = node.data.text;
                    hideMenu();
                    
                    // 获取节点路径
                    function getNodePath(n) {
                        var path = [];
                        var current = n;
                        while (current) {
                            if (current.data && current.data.text) {
                                path.unshift(current.data.text);
                            }
                            current = current.parent;
                        }
                        return path.join(' > ');
                    }
                    
                    // 获取思维导图的文本内容
                    function getMapTextContent() {
                        var root = minder.getRoot();
                        var lines = [];
                        function traverse(n, depth) {
                            if (n.data && n.data.text) {
                                lines.push('  '.repeat(depth) + '- ' + n.data.text);
                            }
                            if (n.children) {
                                n.children.forEach(function(child) {
                                    traverse(child, depth + 1);
                                });
                            }
                        }
                        traverse(root, 0);
                        return lines.join('\n');
                    }
                    
                    var nodePath = getNodePath(node);
                    var mapContent = getMapTextContent();
                    
                    // 弹出层级选择对话框
                    var expandModal = $modal.open({
                        animation: true,
                        backdrop: 'static',
                        template: '<div class="modal-header" style="background-color: var(--theme-color, #fc8383); color: white;">' +
                            '<h4 class="modal-title">' + (lang('aiexpand', 'ui/contextmenu') || 'AI 扩展') + '</h4></div>' +
                            '<div class="modal-body">' +
                            '<p>' + (lang('aiexpandfor', 'ui/contextmenu') || '根据节点') + '「' + nodeText + '」' + (lang('aiexpandgenerate', 'ui/contextmenu') || '自动生成子节点') + '</p>' +
                            '<div class="form-group"><label>' + (lang('expandlevels', 'ui/contextmenu') || '扩展层级数') + '：</label>' +
                            '<select class="form-control" ng-model="levels" style="width: 100px; display: inline-block; margin-left: 10px;" ng-disabled="loading">' +
                            '<option value="1">1 ' + (lang('layer', 'ui/contextmenu') || '层') + '</option>' +
                            '<option value="2">2 ' + (lang('layer', 'ui/contextmenu') || '层') + '</option>' +
                            '<option value="3">3 ' + (lang('layer', 'ui/contextmenu') || '层') + '</option>' +
                            '<option value="4">4 ' + (lang('layer', 'ui/contextmenu') || '层') + '</option>' +
                            '<option value="5">5 ' + (lang('layer', 'ui/contextmenu') || '层') + '</option>' +
                            '</select></div>' +
                            '<div class="form-group"><label>' + (lang('contentrichness', 'ui/contextmenu') || '内容丰富度') + '：</label>' +
                            '<select class="form-control" ng-model="richness" style="width: 120px; display: inline-block; margin-left: 10px;" ng-disabled="loading">' +
                            '<option value="concise">' + (lang('richnessconcise', 'ui/contextmenu') || '精简') + '</option>' +
                            '<option value="normal">' + (lang('richnessnormal', 'ui/contextmenu') || '正常') + '</option>' +
                            '<option value="detailed">' + (lang('richnessdetailed', 'ui/contextmenu') || '详细') + '</option>' +
                            '</select></div>' +
                            '<div class="checkbox" style="margin-top: 10px;"><label>' +
                            '<input type="checkbox" ng-model="includeContext" ng-disabled="loading"> ' +
                            (lang('includemapcontext', 'ui/contextmenu') || '提供完整思维导图作为上下文（推荐，避免生成无关内容）') +
                            '</label></div>' +
                            '<div class="alert alert-danger" ng-show="errorMsg" style="margin-top: 10px; margin-bottom: 0;">{{ errorMsg }}</div>' +
                            '</div>' +
                            '<div class="modal-footer">' +
                            '<button class="btn btn-primary" ng-click="ok()" ng-disabled="loading">' +
                            '<span ng-hide="loading">' + (lang('ok', 'ui/dialog/settings') || '确定') + '</span>' +
                            '<span ng-show="loading">' + (lang('generating', 'ui/dialog/aigenerate') || '生成中...') + '</span></button>' +
                            '<button class="btn btn-default" ng-click="cancel()">' + (lang('cancel', 'ui/dialog/settings') || '取消') + '</button></div>',
                        controller: ['$scope', '$uibModalInstance', function($modalScope, $uibModalInstance) {
                            $modalScope.levels = '2';
                            $modalScope.richness = 'normal';
                            $modalScope.includeContext = true;
                            $modalScope.loading = false;
                            $modalScope.errorMsg = '';
                            
                            $modalScope.ok = function() {
                                $modalScope.loading = true;
                                $modalScope.errorMsg = '';
                                
                                var context = $modalScope.includeContext ? mapContent : null;
                                var path = $modalScope.includeContext ? nodePath : null;
                                
                                aiService.expandNode(
                                    nodeText, 
                                    parseInt($modalScope.levels), 
                                    $modalScope.richness,
                                    context,
                                    path
                                ).then(function(result) {
                                    $uibModalInstance.close({ levels: $modalScope.levels, result: result });
                                }).catch(function(err) {
                                    $modalScope.errorMsg = (lang('aiexpandfailed', 'ui/contextmenu') || 'AI 扩展失败') + '：' + err;
                                    $modalScope.loading = false;
                                });
                            };
                            
                            $modalScope.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };
                        }],
                        size: 'md'
                    });
                    
                    expandModal.result.then(function(data) {
                        // 将 AI 返回的节点添加到当前节点
                        if (data.result && data.result.children) {
                            addChildrenToNode(node, data.result.children);
                            minder.refresh();
                            minder.fire('contentchange');
                        }
                    }).catch(function() {
                        // 用户取消
                    });
                }
                
                // 递归添加子节点
                function addChildrenToNode(parentNode, children) {
                    if (!children || !children.length) return;
                    
                    children.forEach(function(childData) {
                        var childNode = minder.createNode(childData.text, parentNode);
                        parentNode.appendChild(childNode);
                        
                        if (childData.children && childData.children.length) {
                            addChildrenToNode(childNode, childData.children);
                        }
                    });
                }
                
                // AI 改写节点
                function doAIRewrite(mode) {
                    var node = minder.getSelectedNode();
                    if (!node) return;
                    
                    var nodeText = node.data.text;
                    hideMenu();
                    
                    $scope.aiLoading = true;
                    
                    // 显示遮罩层
                    valueTransfer.aiRewriting = true;
                    valueTransfer.aiRewriteCancel = false;
                    
                    aiService.rewriteNode(nodeText, mode).then(function(newText) {
                        // 检查是否已取消
                        if (valueTransfer.aiRewriteCancel) {
                            return;
                        }
                        // 更新节点文本
                        node.setText(newText.trim());
                        minder.refresh();
                        minder.fire('contentchange');
                    }).catch(function(err) {
                        if (!valueTransfer.aiRewriteCancel) {
                            alert('AI 改写失败：' + err);
                        }
                    }).finally(function() {
                        $scope.aiLoading = false;
                        valueTransfer.aiRewriting = false;
                        if (!$scope.$$phase && !$scope.$root.$$phase) {
                            $scope.$apply();
                        }
                    });
                }
                
                // AI 总结节点
                function doAISummarize() {
                    var node = minder.getSelectedNode();
                    if (!node || !node.children || node.children.length === 0) return;
                    
                    hideMenu();
                    
                    // 收集所有子节点的文本
                    var childTexts = [];
                    function collectTexts(n) {
                        if (n.data && n.data.text) {
                            childTexts.push(n.data.text);
                        }
                        if (n.children) {
                            n.children.forEach(collectTexts);
                        }
                    }
                    node.children.forEach(collectTexts);
                    
                    $scope.aiLoading = true;
                    
                    aiService.summarizeNodes(childTexts).then(function(summary) {
                        // 更新当前节点的文本为总结内容
                        node.setText(summary.trim());
                        minder.refresh();
                        minder.fire('contentchange');
                    }).catch(function(err) {
                        alert('AI 总结失败：' + err);
                    }).finally(function() {
                        $scope.aiLoading = false;
                        if (!$scope.$$phase && !$scope.$root.$$phase) {
                            $scope.$apply();
                        }
                    });
                }

                // 复制操作 - 使用原生剪贴板事件
                function doCopy() {
                    hideMenuImmediate();
                    $timeout(function() {
                        // 确保 receiver 获得焦点
                        if (window.editor && window.editor.receiver) {
                            window.editor.receiver.element.focus();
                            // 触发 copy 事件
                            document.execCommand('copy');
                        }
                    }, 10);
                }

                // 剪切操作
                function doCut() {
                    hideMenuImmediate();
                    $timeout(function() {
                        if (window.editor && window.editor.receiver) {
                            window.editor.receiver.element.focus();
                            document.execCommand('cut');
                        }
                    }, 10);
                }

                // 粘贴操作 - 需要正确处理 kityminder 的节点格式
                function doPaste() {
                    hideMenuImmediate();
                    $timeout(function() {
                        if (window.editor && window.editor.receiver) {
                            window.editor.receiver.element.focus();
                        }
                        
                        // 使用 Clipboard API 读取剪贴板内容
                        if (navigator.clipboard && navigator.clipboard.readText) {
                            navigator.clipboard.readText().then(function(text) {
                                if (!text || !minder) return;
                                
                                var nodes = minder.getSelectedNodes();
                                if (nodes.length === 0) return;
                                
                                // 检查是否是 kityminder 节点格式
                                // kityminder 使用 \uFFFF\uFEFF 作为标记
                                var SPLITOR = '\uFEFF';
                                var KM_MIMETYPE = '\uFFFF';
                                
                                if (text.indexOf(KM_MIMETYPE + SPLITOR) === 0) {
                                    // 是 kityminder 节点格式，提取 JSON 并导入
                                    var jsonStr = text.substring(2); // 跳过前缀
                                    try {
                                        var nodesData = JSON.parse(jsonStr);
                                        var Data = window.kityminder.data;
                                        var decode = Data.getRegisterProtocol('json').decode;
                                        var _selectedNodes = [];
                                        
                                        nodes.forEach(function(node) {
                                            // 倒序复制以保持顺序
                                            for (var i = nodesData.length - 1; i >= 0; i--) {
                                                var _node = minder.createNode(null, node);
                                                minder.importNode(_node, nodesData[i]);
                                                _selectedNodes.push(_node);
                                                node.appendChild(_node);
                                            }
                                        });
                                        
                                        minder.select(_selectedNodes, true);
                                        minder.refresh();
                                    } catch (e) {
                                        console.warn('[ContextMenu] Failed to parse km data:', e);
                                        // 解析失败，当作普通文本处理
                                        nodes.forEach(function(node) {
                                            minder.Text2Children(node, text);
                                        });
                                    }
                                } else {
                                    // 普通文本，直接转换为子节点
                                    nodes.forEach(function(node) {
                                        minder.Text2Children(node, text);
                                    });
                                }
                            }).catch(function(err) {
                                console.warn('[ContextMenu] Clipboard read failed:', err);
                            });
                        }
                    }, 10);
                }

                // 立即隐藏菜单（不触发 $apply）
                function hideMenuImmediate() {
                    $scope.visible = false;
                    $scope.activeSubmenu = null;
                    $scope.activeSubmenu2 = null;
                }

                // 执行命令
                function execCommand(cmd, arg) {
                    if (!minder) return;
                    var topic = lang('topic', 'runtime/node') || '分支主题';
                    
                    // 先隐藏菜单
                    $scope.visible = false;
                    $scope.activeSubmenu = null;
                    $scope.activeSubmenu2 = null;
                    
                    // 使用 $timeout 确保在下一个 digest cycle 执行命令
                    $timeout(function() {
                        if (cmd.indexOf('Append') === 0) {
                            minder.execCommand(cmd, topic);
                            // 自动进入编辑模式
                            $timeout(function() {
                                if (window.editor && window.editor.editText) {
                                    window.editor.editText();
                                }
                            }, 100);
                        } else {
                            minder.execCommand(cmd, arg);
                        }
                    }, 0);
                }

                // 显示菜单
                function showMenu(e) {
                    $scope.menuItems = buildMenuItems();
                    $scope.visible = true;
                    $scope.menuX = e.x;
                    $scope.menuY = e.y;
                    $scope.activeSubmenu = null;
                    $scope.activeSubmenu2 = null;

                    $timeout(function() {
                        // 调整位置避免超出屏幕
                        var menu = element[0];
                        var rect = menu.getBoundingClientRect();
                        var winW = window.innerWidth;
                        var winH = window.innerHeight;

                        if (e.x + rect.width > winW) {
                            $scope.menuX = winW - rect.width - 10;
                        }
                        if (e.y + rect.height > winH) {
                            $scope.menuY = winH - rect.height - 10;
                        }
                    }, 0);
                }

                // 隐藏菜单
                function hideMenu() {
                    $scope.visible = false;
                    $scope.activeSubmenu = null;
                    $scope.activeSubmenu2 = null;
                    if (!$scope.$$phase && !$scope.$root.$$phase) {
                        $scope.$apply();
                    }
                }

                // 菜单项点击
                $scope.onItemClick = function(item, event) {
                    if (item.type === 'separator') return;
                    if (item.submenu) {
                        // 有子菜单，不执行
                        event.stopPropagation();
                        return;
                    }
                    if (item.enable && !item.enable()) return;
                    if (item.action) {
                        item.action();
                    }
                    hideMenu();
                };

                // 鼠标进入菜单项
                $scope.onItemEnter = function(item, event) {
                    if (item.submenu) {
                        $scope.activeSubmenu = item.id;
                        $scope.activeSubmenu2 = null;
                        // 延迟计算子菜单位置，等待 DOM 渲染
                        $timeout(function() {
                            $scope.submenuStyle = calculateSubmenuPosition(event.currentTarget, 1);
                        }, 0);
                    } else {
                        $scope.activeSubmenu = null;
                    }
                    $scope.activeSubmenu2 = null;
                };

                // 子菜单项鼠标进入
                $scope.onSubmenuItemEnter = function(subItem, event) {
                    if (subItem.submenu) {
                        $scope.activeSubmenu2 = subItem.id;
                        // 延迟计算子菜单位置
                        $timeout(function() {
                            $scope.submenu2Style = calculateSubmenuPosition(event.currentTarget, 2);
                        }, 0);
                    } else {
                        $scope.activeSubmenu2 = null;
                    }
                };

                // 计算子菜单位置，避免超出屏幕边界
                function calculateSubmenuPosition(parentLi, level) {
                    var style = {};
                    var winH = window.innerHeight;
                    var winW = window.innerWidth;
                    
                    // 查找子菜单元素
                    var submenu = parentLi.querySelector('.submenu');
                    if (!submenu) return style;
                    
                    var parentRect = parentLi.getBoundingClientRect();
                    var submenuRect = submenu.getBoundingClientRect();
                    
                    // 计算子菜单底部位置
                    var submenuBottom = parentRect.top + submenuRect.height;
                    
                    // 如果超出底部，向上偏移
                    if (submenuBottom > winH - 10) {
                        var offsetY = submenuBottom - winH + 10;
                        style.top = (-4 - offsetY) + 'px';
                    }
                    
                    // 如果超出右边，向左显示
                    var submenuRight = parentRect.right + submenuRect.width;
                    if (submenuRight > winW - 10) {
                        style.left = 'auto';
                        style.right = '100%';
                    }
                    
                    return style;
                }

                // 检查菜单项是否禁用
                $scope.isDisabled = function(item) {
                    if (item.enable) {
                        return !item.enable();
                    }
                    return false;
                };

                // 监听右键菜单事件（使用 CustomEvent）
                function handleContextMenu(e) {
                    var detail = e.detail;
                    $timeout(function() {
                        showMenu({ x: detail.x, y: detail.y });
                    }, 0);
                }

                document.addEventListener('minder-contextmenu', handleContextMenu);

                // 清理事件监听器
                $scope.$on('$destroy', function() {
                    document.removeEventListener('minder-contextmenu', handleContextMenu);
                });

                // 点击其他区域关闭菜单
                document.addEventListener('mousedown', function(e) {
                    if ($scope.visible) {
                        var menu = element[0];
                        if (!menu.contains(e.target)) {
                            hideMenu();
                        }
                    }
                });

                // ESC 关闭菜单
                document.addEventListener('keydown', function(e) {
                    if ($scope.visible && e.key === 'Escape') {
                        hideMenu();
                    }
                });
            }
        };
    }]);
