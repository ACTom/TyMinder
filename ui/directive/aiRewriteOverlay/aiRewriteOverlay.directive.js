/**
 * AI 改写遮罩层指令
 * 在 AI 改写过程中显示遮罩，防止用户操作
 */
angular.module('kityminderEditor')
    .directive('aiRewriteOverlay', ['valueTransfer', function(valueTransfer) {
        return {
            restrict: 'A',
            template: 
                '<div class="ai-rewrite-overlay-content" ng-show="visible">' +
                    '<div class="ai-rewrite-overlay-backdrop"></div>' +
                    '<div class="ai-rewrite-overlay-dialog">' +
                        '<div class="ai-rewrite-spinner"></div>' +
                        '<div class="ai-rewrite-text">{{ message }}</div>' +
                        '<button class="btn btn-default ai-rewrite-cancel" ng-click="cancel()">{{ cancelText }}</button>' +
                    '</div>' +
                '</div>',
            replace: true,
            link: function($scope) {
                // 监听翻译函数的可用性，延迟获取
                function getLang(key, group) {
                    var lang = window.editor && window.editor.lang ? window.editor.lang.t : null;
                    if (lang) {
                        return lang(key, group);
                    }
                    return null;
                }
                
                $scope.visible = false;
                $scope.message = getLang('aigenerating', 'ui/contextmenu') || 'AI 生成中...';
                $scope.cancelText = getLang('cancel', 'ui/dialog/settings') || '取消';
                
                // 取消操作
                $scope.cancel = function() {
                    valueTransfer.aiRewriteCancel = true;
                    valueTransfer.aiRewriting = false;
                    $scope.visible = false;
                };
                
                // 监听状态变化
                $scope.$watch(function() {
                    return valueTransfer.aiRewriting;
                }, function(newVal) {
                    $scope.visible = newVal;
                    if (newVal) {
                        // 重置取消标志，并重新获取翻译（确保翻译函数已初始化）
                        valueTransfer.aiRewriteCancel = false;
                        $scope.message = getLang('aigenerating', 'ui/contextmenu') || 'AI 生成中...';
                        $scope.cancelText = getLang('cancel', 'ui/dialog/settings') || '取消';
                    }
                }, true);
            }
        };
    }]);
