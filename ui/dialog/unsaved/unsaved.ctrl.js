angular.module('kityminderEditor')
    .controller('unsaved.ctrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        
        $scope.save = function () {
            $modalInstance.close('save');
        };

        $scope.dontSave = function () {
            $modalInstance.close('dontsave');
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
