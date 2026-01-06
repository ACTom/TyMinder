angular.module('kityminderEditor')
    .controller('unsaved.ctrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
        
        $scope.save = function () {
            $uibModalInstance.close('save');
        };

        $scope.dontSave = function () {
            $uibModalInstance.close('dontsave');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }]);
