/**
 * 右键菜单指令
 * 替代原有的圆盘 hotbox，提供传统的多级右键菜单
 */
angular.module('kityminderEditor')
    .directive('contextMenu', ['$timeout', function($timeout) {
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
