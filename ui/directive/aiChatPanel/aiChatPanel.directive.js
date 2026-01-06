angular.module('kityminderEditor')
    .directive('aiChatPanel', ['valueTransfer', 'aiService', '$timeout', function(valueTransfer, aiService, $timeout) {
        return {
            restrict: 'A',
            templateUrl: 'ui/directive/aiChatPanel/aiChatPanel.html',
            scope: {
                minder: '='
            },
            replace: true,
            controller: function($scope) {
                var minder = $scope.minder;
                
                // 聊天消息列表
                $scope.messages = [];
                
                // 用户输入
                $scope.userInput = '';
                
                // 是否正在加载
                $scope.loading = false;
                
                // 面板是否打开
                $scope.panelOpen = false;
                
                // AI 是否已配置
                $scope.aiConfigured = false;
                
                /**
                 * 检查 AI 配置状态
                 */
                function checkAIConfig() {
                    aiService.isConfigured().then(function(configured) {
                        $scope.aiConfigured = configured;
                        $scope.$evalAsync();
                    });
                }
                
                // 初始化时检查
                checkAIConfig();
                
                // 监听配置保存事件
                $scope.$on('ai:configSaved', function() {
                    checkAIConfig();
                });
                
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
                 * 发送消息
                 */
                $scope.sendMessage = function() {
                    var question = $scope.userInput.trim();
                    if (!question || $scope.loading) return;
                    
                    if (!$scope.aiConfigured) {
                        alert(editor.lang.t('pleaseconfigureaifirst', 'ui/aichat'));
                        return;
                    }
                    
                    // 添加用户消息
                    $scope.messages.push({
                        role: 'user',
                        content: question,
                        time: new Date()
                    });
                    
                    $scope.userInput = '';
                    $scope.loading = true;
                    
                    // 滚动到底部
                    scrollToBottom();
                    
                    // 获取思维导图内容并发送请求
                    var mapContent = getMapContent();
                    
                    aiService.askQuestion(question, mapContent).then(function(answer) {
                        $scope.messages.push({
                            role: 'assistant',
                            content: answer,
                            time: new Date()
                        });
                        $scope.loading = false;
                        $scope.$evalAsync();
                        scrollToBottom();
                    }).catch(function(err) {
                        $scope.messages.push({
                            role: 'error',
                            content: editor.lang.t('aierror', 'ui/aichat') + ': ' + err,
                            time: new Date()
                        });
                        $scope.loading = false;
                        $scope.$evalAsync();
                        scrollToBottom();
                    });
                };
                
                /**
                 * 清空聊天记录
                 */
                $scope.clearMessages = function() {
                    $scope.messages = [];
                };
                
                /**
                 * 滚动到底部
                 */
                function scrollToBottom() {
                    $timeout(function() {
                        var container = document.querySelector('.ai-chat-messages');
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    }, 100);
                }
                
                /**
                 * 按 Enter 发送消息
                 */
                $scope.onKeypress = function(event) {
                    if (event.keyCode === 13 && !event.shiftKey) {
                        event.preventDefault();
                        $scope.sendMessage();
                    }
                };
                
                /**
                 * 监听面板状态
                 */
                var aiChatPanelOpen = function() {
                    return valueTransfer.aiChatPanelOpen;
                };
                
                $scope.$watch(aiChatPanelOpen, function(newVal) {
                    $scope.panelOpen = newVal;
                    if (newVal) {
                        // 面板打开时检查配置
                        checkAIConfig();
                        $timeout(function() {
                            var input = document.querySelector('.ai-chat-input textarea');
                            if (input) input.focus();
                        }, 100);
                    }
                }, true);
                
                /**
                 * 关闭面板
                 */
                $scope.closePanel = function() {
                    valueTransfer.aiChatPanelOpen = false;
                    editor.receiver.selectAll();
                };
            }
        };
    }]);
