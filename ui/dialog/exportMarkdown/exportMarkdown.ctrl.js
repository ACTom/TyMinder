angular.module('kityminderEditor')
    .controller('exportMarkdown.ctrl', ['$scope', '$uibModalInstance', 'minder', 'exportCallback', function ($scope, $uibModalInstance, minder, exportCallback) {
        
        // 默认选项
        $scope.options = {
            headingLevels: '3',  // 标题层级数
            rootAsTitle: true,   // 中心主题作为文档标题
            includeNote: true,   // 包含备注
            includeLink: true    // 包含链接
        };

        // 取消
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        // 导出
        $scope.doExport = function() {
            var options = {
                headingLevels: parseInt($scope.options.headingLevels, 10),
                rootAsTitle: $scope.options.rootAsTitle,
                includeNote: $scope.options.includeNote,
                includeLink: $scope.options.includeLink
            };
            
            $uibModalInstance.close(options);
            
            // 执行导出回调
            if (exportCallback) {
                exportCallback(options);
            }
        };
    }]);
