angular.module('kityminderEditor')
    .controller('aiExport.ctrl', ['$scope', '$uibModalInstance', 'aiService', 'minder', 'initialFormat',
        function($scope, $uibModalInstance, aiService, minder, initialFormat) {
            
            // 导出格式选项
            $scope.formats = [
                { id: 'article', name: editor.lang.t('article', 'ui/dialog/aiexport'), icon: 'glyphicon-file' },
                { id: 'report', name: editor.lang.t('report', 'ui/dialog/aiexport'), icon: 'glyphicon-list-alt' },
                { id: 'outline', name: editor.lang.t('outline', 'ui/dialog/aiexport'), icon: 'glyphicon-th-list' }
            ];
            
            // 使用传入的初始格式
            $scope.selectedFormat = initialFormat || 'article';
            $scope.loading = false;
            $scope.result = '';
            $scope.showResult = false;
            
            /**
             * 选择格式
             */
            $scope.selectFormat = function(formatId) {
                $scope.selectedFormat = formatId;
            };
            
            /**
             * 将思维导图转换为文本内容
             */
            function mindMapToText(node, level) {
                level = level || 0;
                var indent = new Array(level + 1).join('  ');
                var text = indent + '- ' + (node.data.text || '') + '\n';
                
                if (node.children && node.children.length > 0) {
                    node.children.forEach(function(child) {
                        text += mindMapToText(child, level + 1);
                    });
                }
                
                return text;
            }
            
            /**
             * 获取思维导图内容
             */
            function getMapContent() {
                var json = minder.exportJson();
                if (json && json.root) {
                    return mindMapToText(json.root);
                }
                return '';
            }
            
            /**
             * 生成导出内容
             */
            $scope.generate = function() {
                var mapContent = getMapContent();
                if (!mapContent.trim()) {
                    alert(editor.lang.t('emptymaphint', 'ui/dialog/aiexport'));
                    return;
                }
                
                $scope.loading = true;
                $scope.result = '';
                
                aiService.exportAs(mapContent, $scope.selectedFormat).then(function(result) {
                    $scope.result = result;
                    $scope.showResult = true;
                    $scope.loading = false;
                    $scope.$evalAsync();
                }).catch(function(err) {
                    alert(editor.lang.t('exportfailed', 'ui/dialog/aiexport') + ': ' + err);
                    $scope.loading = false;
                    $scope.$evalAsync();
                });
            };
            
            /**
             * 复制到剪贴板
             */
            $scope.copyToClipboard = function() {
                if ($scope.result) {
                    navigator.clipboard.writeText($scope.result).then(function() {
                        alert(editor.lang.t('copied', 'ui/dialog/aiexport'));
                    }).catch(function() {
                        // 降级方案
                        var textarea = document.createElement('textarea');
                        textarea.value = $scope.result;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        alert(editor.lang.t('copied', 'ui/dialog/aiexport'));
                    });
                }
            };
            
            /**
             * 保存为文件
             */
            $scope.saveToFile = function() {
                if (!$scope.result) return;
                
                var tauri = window.__TAURI__ || {};
                var dialog = tauri.dialog;
                var fs = tauri.fs;
                
                if (dialog && fs) {
                    // 根据格式确定文件扩展名
                    var ext = $scope.selectedFormat === 'outline' ? 'txt' : 'md';
                    var root = minder.getRoot();
                    var defaultName = (root && root.data && root.data.text) || 'export';
                    defaultName = defaultName.replace(/[\\/:*?"<>|]/g, '_');
                    
                    dialog.save({
                        filters: [{ name: 'Text files', extensions: [ext] }],
                        defaultPath: defaultName + '.' + ext
                    }).then(function(filePath) {
                        if (filePath) {
                            return fs.writeTextFile(filePath, $scope.result);
                        }
                    }).then(function(result) {
                        if (result !== undefined) {
                            alert(editor.lang.t('saved', 'ui/dialog/aiexport'));
                        }
                    }).catch(function(err) {
                        if (err && err !== 'cancel' && err.toString().indexOf('cancel') === -1) {
                            alert(editor.lang.t('savefailed', 'ui/dialog/aiexport') + ': ' + err);
                        }
                    });
                } else {
                    // 降级方案：使用浏览器下载
                    var ext = $scope.selectedFormat === 'outline' ? 'txt' : 'md';
                    var blob = new Blob([$scope.result], { type: 'text/plain;charset=utf-8' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'export.' + ext;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            };
            
            /**
             * 返回重新选择
             */
            $scope.back = function() {
                $scope.showResult = false;
                $scope.result = '';
            };
            
            /**
             * 关闭对话框
             */
            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        }
    ]);
