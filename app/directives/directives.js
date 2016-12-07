angular.module('myApp.directives', [])
.directive('variacion', function() {
	
    return {
        restrict: 'E',
        scope: {
          valorActual: '=',
          valorReforma: '=',
          ingreso: '='
        },
        templateUrl: 'directives/variacion.html',
        replace: false
    }
})