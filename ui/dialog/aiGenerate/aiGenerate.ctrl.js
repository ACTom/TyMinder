angular.module('kityminderEditor')
    .controller('aiGenerate.ctrl', ['$scope', '$uibModalInstance', 'aiService', 'minder', function($scope, $uibModalInstance, aiService, minder) {
        
        $scope.topic = '';
        $scope.loading = false;
        
        $scope.generate = function() {
            if (!$scope.topic.trim()) return;
            
            $scope.loading = true;
            
            aiService.generateMindMap($scope.topic).then(function(result) {
                $uibModalInstance.close(result);
            }).catch(function(err) {
                alert('AI 生成失败：' + err);
                $scope.loading = false;
            });
        };
        
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        
    }]);
