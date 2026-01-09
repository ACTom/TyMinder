angular.module('kityminderEditor')
    .directive('topTab', ['document', 'native', '$uibModal', '$q', '$rootScope', function (document, native, $modal, $q, $rootScope) {
        return {
            restrict: 'A',
            templateUrl: 'ui/directive/topTab/topTab.html',
            scope: {
                minder: '=topTab',
                editor: '='
            },
            link: function (scope) {
                var minder = scope.minder;

                // File status - 从 document service 获取
                // 设置默认文件名（支持国际化）
                if (scope.editor && scope.editor.lang) {
                    var defaultName = scope.editor.lang.t('untitledfilename', 'ui');
                    if (defaultName && defaultName !== 'untitledfilename') {
                        document.setDefaultFileName(defaultName);
                    }
                }
                
                // 获取显示标题（包含修改标记）
                scope.getTitle = function() {
                    return document.getTitle();
                };

                // Update dirty state on content change
                minder.on('contentchange', function () {
                    document.setModified(true);
                    // 使用 $timeout 而不是 $apply，避免嵌套 $apply 错误
                    if (!scope.$$phase && !scope.$root.$$phase) {
                        scope.$evalAsync();
                    }
                });

                // 监听 document service 的事件，触发视图更新
                scope.$on('document:pathChanged', function () {
                    scope.$evalAsync();
                });

                scope.$on('document:modifiedChanged', function () {
                    scope.$evalAsync();
                });

                scope.$on('document:saved', function () {
                    scope.$evalAsync();
                });

                scope.$on('document:reset', function () {
                    scope.$evalAsync();
                });

                scope.tabStatus = {
                    file: false,
                    idea: true,
                    appearance: false,
                    view: false,
                    ai: false
                };

                scope.goBackToIdea = function () {
                    // We need to use timeout to ensure digest cycle processes the change if called from outside
                    setTimeout(function () {
                        scope.$apply(function () {
                            scope.tabStatus.idea = true;
                            // uib-tabset handles setting others to false
                        });
                    }, 0);
                };

                function getWindow() {
                    if (window.__TAURI__ && window.__TAURI__.window) {
                        return window.__TAURI__.window.getCurrentWindow();
                    }
                    return null;
                }

                scope.isMaximized = false;

                function updateMaximizedState() {
                    var appWindow = getWindow();
                    if (appWindow) {
                        appWindow.isMaximized().then(function (state) {
                            scope.isMaximized = state;
                            scope.$evalAsync();
                        });
                    }
                }

                // Initial check
                updateMaximizedState();

                // Listen to resize to update state
                window.addEventListener('resize', updateMaximizedState);

                scope.minimizeWindow = function () {
                    var appWindow = getWindow();
                    if (appWindow) {
                        appWindow.minimize();
                    }
                };

                scope.maximizeWindow = function () {
                    var appWindow = getWindow();
                    if (appWindow) {
                        appWindow.toggleMaximize().then(updateMaximizedState);
                    }
                };

                /**
                 * 检查是否有未保存的修改，如果有则弹出保存确认对话框
                 * @returns {Promise} resolve('save'|'dontsave'|'cancel') 或 reject('cancel')
                 */
                function checkUnsavedChanges() {
                    var deferred = $q.defer();
                    
                    if (!document.isModified()) {
                        deferred.resolve('dontsave');
                        return deferred.promise;
                    }

                    var unsavedModal = $modal.open({
                        animation: true,
                        templateUrl: 'ui/dialog/unsaved/unsaved.tpl.html',
                        controller: 'unsaved.ctrl',
                        size: 'md',
                        backdrop: 'static'
                    });

                    unsavedModal.result.then(function(result) {
                        deferred.resolve(result);
                    }, function() {
                        deferred.reject('cancel');
                    });

                    return deferred.promise;
                }

                /**
                 * 执行保存操作（返回 Promise）
                 */
                function doSave() {
                    var deferred = $q.defer();
                    var currentFilePath = document.getFilePath();
                    
                    if (currentFilePath) {
                        var data = JSON.stringify(minder.exportJson());
                        native.file.save(currentFilePath, data).then(function() {
                            document.markSaved();
                            deferred.resolve();
                        }).catch(function(e) {
                            deferred.reject(e);
                        });
                    } else {
                        native.file.saveDialog().then(function(filePath) {
                            if (filePath) {
                                document.setFilePath(filePath);
                                var data = JSON.stringify(minder.exportJson());
                                return native.file.save(filePath, data).then(function() {
                                    document.markSaved();
                                    deferred.resolve();
                                });
                            } else {
                                deferred.reject('cancel');
                            }
                        }).catch(function(e) {
                            deferred.reject(e);
                        });
                    }
                    
                    return deferred.promise;
                }

                scope.closeWindow = function () {
                    var appWindow = getWindow();
                    if (!appWindow) return;
                    // 直接调用 close，由 onCloseRequested 统一处理未保存检查
                    appWindow.close();
                };

                /**
                 * 监听窗口关闭请求事件（包括 Alt+F4、右键标题栏关闭、点击关闭按钮等）
                 */
                function setupWindowCloseHandler() {
                    if (!native.isTauri || !window.__TAURI__) return;
                    
                    var appWindow = getWindow();
                    if (!appWindow) return;
                    
                    // 监听窗口关闭请求事件
                    appWindow.onCloseRequested(function(event) {
                        // 检查是否有未保存的更改
                        if (!document.isModified()) {
                            // 没有修改，直接关闭（不调用 preventDefault，窗口会正常关闭）
                            return;
                        }
                        
                        // 有未保存的更改，阻止默认关闭行为
                        event.preventDefault();
                        
                        // 弹出保存确认对话框
                        checkUnsavedChanges().then(function(result) {
                            if (result === 'save') {
                                return doSave().then(function() {
                                    return 'saved';
                                });
                            }
                            return result;
                        }).then(function(result) {
                            if (result !== 'cancel') {
                                // 用户确认关闭，执行真正的关闭
                                appWindow.destroy();
                            }
                        }).catch(function() {
                            // 用户取消，不关闭窗口
                        });
                    });
                }
                
                // 设置窗口关闭处理器
                setupWindowCloseHandler();

                /*
                *
                * 用户选择一个新的选项卡会执行 setCurTab 和 foldTopTab 两个函数
                * 用户点击原来的选项卡会执行 foldTopTop 一个函数
                *
                * 也就是每次选择新的选项卡都会执行 setCurTab，初始化的时候也会执行 setCurTab 函数
                * 因此用 executedCurTab 记录是否已经执行了 setCurTab 函数
                * 用 isInit 记录是否是初始化的状态，在任意一个函数时候 isInit 设置为 false
                * 用 isOpen 记录是否打开了 topTab
                *
                * 因此用到了三个 mutex
                * */
                var executedCurTab = false;
                var isInit = true;
                var isOpen = true;

                scope.setCurTab = function (tabName) {
                    setTimeout(function () {
                        //console.log('set cur tab to : ' + tabName);
                        executedCurTab = true;
                        //isOpen = false;
                        if (tabName != 'idea') {
                            isInit = false;
                        }
                        // 当切换到文件标签时广播事件
                        if (tabName === 'file') {
                            scope.$broadcast('fileTab:activated');
                        }
                    });
                };

                scope.toggleTopTab = function () {
                    setTimeout(function () {
                        if (!executedCurTab || isInit) {
                            isInit = false;

                            isOpen ? closeTopTab() : openTopTab();
                            isOpen = !isOpen;
                        }

                        executedCurTab = false;
                    });
                };

                function closeTopTab() {
                    var $tabContent = $('.tab-content');
                    var $minderEditor = $('.minder-editor');

                    $tabContent.animate({
                        height: 0,
                        display: 'none'
                    });

                    $minderEditor.animate({
                        top: '32px'
                    });
                }

                function openTopTab() {
                    var $tabContent = $('.tab-content');
                    var $minderEditor = $('.minder-editor');

                    $tabContent.animate({
                        height: '60px',
                        display: 'block'
                    });

                    $minderEditor.animate({
                        top: '92px'
                    });
                }

                /**
                 * 打开文件菜单
                 */
                function openFileMenu() {
                    scope.$apply(function() {
                        scope.tabStatus.file = true;
                    });
                }

                /**
                 * 关闭文件菜单（返回 Idea 标签）
                 */
                function closeFileMenu() {
                    if (scope.tabStatus.file) {
                        scope.goBackToIdea();
                    }
                }

                /**
                 * 全局键盘事件处理
                 */
                function handleKeyDown(e) {
                    // Esc - 关闭文件菜单
                    if (e.key === 'Escape') {
                        if (scope.tabStatus.file) {
                            e.preventDefault();
                            closeFileMenu();
                            return;
                        }
                    }
                    
                    // Ctrl+S - 保存（广播事件，由 fileOperation 处理）
                    if (e.ctrlKey && e.key === 's') {
                        e.preventDefault();
                        $rootScope.$broadcast('file:save');
                        return;
                    }
                    
                    // Ctrl+O - 打开（广播事件，由 fileOperation 处理）
                    if (e.ctrlKey && e.key === 'o') {
                        e.preventDefault();
                        $rootScope.$broadcast('file:open');
                        return;
                    }
                    
                    // Alt+F - 打开文件菜单
                    if (e.altKey && e.key === 'f') {
                        e.preventDefault();
                        if (scope.tabStatus.file) {
                            closeFileMenu();
                        } else {
                            openFileMenu();
                        }
                        return;
                    }
                }

                // 添加全局键盘事件监听
                window.addEventListener('keydown', handleKeyDown);

                // 组件销毁时移除事件监听
                scope.$on('$destroy', function() {
                    window.removeEventListener('keydown', handleKeyDown);
                    window.removeEventListener('resize', updateMaximizedState);
                });
            }
        }
    }]);