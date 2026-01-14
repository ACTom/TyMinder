angular.module('kityminderEditor')
    .directive('hyperConnection', [function() {
        return {
            restrict: 'E',
            templateUrl: 'ui/directive/hyperConnection/hyperConnection.html',
            scope: {
                minder: '='
            },
            replace: true,
            link: function($scope) {
                var minder = $scope.minder;

                // 检查按钮是否应该禁用：未选中节点或选中的是根节点
                $scope.isDisabled = function() {
                    var selectedNode = minder.getSelectedNode();
                    if (!selectedNode) return true;
                    if (selectedNode.isRoot()) return true;
                    return false;
                };

                $scope.addConnection = function() {
                    // 检查命令是否可执行
                    if (!$scope.isDisabled()) {
                        minder.execCommand('StartHyperConnection');
                    }
                };
            }
        };
    }]);
