angular.module('myApp.filters', [])
.filter('abs', function () {
    return function(val) {
        return Math.abs(val);
    }
})
.filter('plata', function ($filter) {
    return function (number) {

        if (number < 1000000) {
            return $filter('currency')(number, '$', 0);
        }

        if (number == 1000000)
            return '1 Millón';
        
        return $filter('number')((number / 1000000), 2) + ' Millones';
    }
})
.filter('UVT', function ($filter, constantes) {
    return function (number) {
        
        return $filter('number')((number / constantes.UVT), 0) + ' UVTs';
    }
});