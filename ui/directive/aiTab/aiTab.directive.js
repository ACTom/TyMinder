angular.module('kityminderEditor')
    .directive('aiTab', ['$uibModal', 'aiService', 'valueTransfer', function($modal, aiService, valueTransfer) {
        return {
            restrict: 'E',
            templateUrl: 'ui/directive/aiTab/aiTab.html',
            scope: {
                minder: '='
            },
            replace: true,
            link: function($scope) {
                var minder = $scope.minder;

                // AI 是否已配置
                $scope.aiConfigured = false;

                // 检查 AI 配置状态
                function checkAIConfig() {
                    aiService.isConfigured().then(function(configured) {
                        $scope.aiConfigured = configured;
                        $scope.$evalAsync();
                    });
                }

                // 初始化时检查
                checkAIConfig();

                // 监听设置保存事件
                $scope.$on('ai:configSaved', function() {
                    checkAIConfig();
                });

                /**
                 * AI 生成导图
                 */
                $scope.showAIGenerate = function() {
                    if (!$scope.aiConfigured) {
                        alert(editor.lang.t('pleaseconfigureaifirst', 'ui/aitab'));
                        return;
                    }

                    var modal = $modal.open({
                        animation: true,
                        templateUrl: 'ui/dialog/aiGenerate/aiGenerate.tpl.html',
                        controller: 'aiGenerate.ctrl',
                        size: 'md',
                        resolve: {
                            aiService: function() { return aiService; },
                            minder: function() { return minder; }
                        }
                    });

                    modal.result.then(function(result) {
                        if (result && result.root) {
                            // 将生成的内容保存为临时文件，然后在新窗口中打开
                            var jsonContent = JSON.stringify(result);
                            var filename = (result.root.data && result.root.data.text) || 'AI生成导图';
                            
                            var tauri = window.__TAURI__ || {};
                            var core = tauri.core || tauri.tauri;
                            
                            if (core) {
                                core.invoke('save_temp_file', { 
                                    contents: jsonContent, 
                                    filename: filename 
                                }).then(function(tempPath) {
                                    if (!tempPath) {
                                        throw new Error('Temp file path is empty');
                                    }
                                    return core.invoke('new_window', { filePath: tempPath, isTemp: true });
                                }).catch(function(err) {
                                    console.error('Failed to open in new window:', err);
                                    minder.importJson(result);
                                    minder.execCommand('camera', minder.getRoot(), 600);
                                });
                            } else {
                                // 非 Tauri 环境，直接在当前窗口打开
                                minder.importJson(result);
                                minder.execCommand('camera', minder.getRoot(), 600);
                            }
                        }
                    });
                };

                /**
                 * AI 问答面板
                 */
                $scope.showAIChat = function() {
                    if (!$scope.aiConfigured) {
                        alert(editor.lang.t('pleaseconfigureaifirst', 'ui/aitab'));
                        return;
                    }
                    // 关闭备注面板（如果打开的话）
                    valueTransfer.noteEditorOpen = false;
                    // 打开AI问答面板
                    valueTransfer.aiChatPanelOpen = true;
                };

                /**
                 * AI 导出 - 文章
                 */
                $scope.showAIExportArticle = function() {
                    showAIExportDialog('article');
                };

                /**
                 * AI 导出 - 报告
                 */
                $scope.showAIExportReport = function() {
                    showAIExportDialog('report');
                };

                /**
                 * AI 导出 - PPT大纲
                 */
                $scope.showAIExportPPT = function() {
                    showAIExportDialog('outline');
                };

                /**
                 * 打开 AI 导出对话框
                 */
                function showAIExportDialog(format) {
                    if (!$scope.aiConfigured) {
                        alert(editor.lang.t('pleaseconfigureaifirst', 'ui/aitab'));
                        return;
                    }

                    $modal.open({
                        animation: true,
                        templateUrl: 'ui/dialog/aiExport/aiExport.tpl.html',
                        controller: 'aiExport.ctrl',
                        size: 'lg',
                        resolve: {
                            aiService: function() { return aiService; },
                            minder: function() { return minder; },
                            initialFormat: function() { return format || 'article'; }
                        }
                    });
                }
            }
        };
    }]);
