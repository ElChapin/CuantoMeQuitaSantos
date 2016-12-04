'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ui.utils.masks',
  'duScroll',
  'ngMaterial',
  'myApp.paso1',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', '$mdThemingProvider', '$mdIconProvider', function($locationProvider, $routeProvider, $mdThemingProvider, $mdIconProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/paso1'});

  $mdThemingProvider.theme('default')
      .primaryPalette('yellow')
      .warnPalette('purple', {'default': '900'})
      .accentPalette('brown');

  $mdThemingProvider.theme('docs-dark')
      .primaryPalette('yellow')
      .dark();
}]);
