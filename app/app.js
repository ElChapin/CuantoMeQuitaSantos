'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ui.utils.masks',
  'duScroll',
  'ngMaterial',
  'myApp.filters',
  'myApp.directives',
  'myApp.services',
  'myApp.paso1',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', '$mdThemingProvider', '$mdIconProvider', function($locationProvider, $routeProvider, $mdThemingProvider, $mdIconProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/paso1'});

  $mdThemingProvider.theme('default')
      .primaryPalette('yellow')
      .warnPalette('deep-purple', {'default': '500'})
      .accentPalette('brown');

  $mdThemingProvider.theme('docs-dark')
      .primaryPalette('yellow')
      .dark();

  var popup = function (url, params, newTab) {
    
    var k, popup, qs, v;
    
    if (params == null)
        params = {};
        
    popup = {
        width: 600,
        height: 350
    };
    
    popup.top = (screen.height / 2) - (popup.height / 2);
    popup.left = (screen.width / 2) - (popup.width / 2);
    
    qs = ((function() {
        
        var _results;
        _results = [];
        for (k in params) {
            
            v = params[k];
            _results.push("" + k + "=" + (encodeURIComponent(v)));
        }
        return _results;
    }).call(this)).join('&');
    
    if (qs)
        qs = "?" + qs;
    
    return window.open(url + qs, 'targetWindow', newTab ? '' : "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,left=" + popup.left + ",top=" + popup.top + ",width=" + popup.width + ",height=" + popup.height);
};

    $('.share-button a').click(function () {
        
        var url = location.href;
        
        var network = $(this).data('network');
        
        ga('send', 'event', 'social-share', 'click', network, {'nonInteraction': 1, 'page': '/CuantoMeQuitaSantos' });
        console.log('Event sent: social-share ' + network);
        
        if (network == 'twitter') {            
        
            popup('https://twitter.com/intent/tweet', {
                text: 'Juega el Monopoly de Santos y descubre cuánto te va a quitar @NoALaTributaria',
                url: url
            });
        }
        else if (network == 'facebook') {            
        
            popup('https://www.facebook.com/sharer/sharer.php', {
                u: url
            });
        }
        else if (network == 'google-plus') {            
        
            popup('https://plus.google.com/share', {
                url: url
            });
        }
        else if (network == 'email') {            
        
            popup('mailto:', {
                subject: 'Cuánto me quita Santos | El Chapín Prensa | No a la Reforma Tributaria',
                body: 'Juega el Monopoly de Santos y descubre cuánto te va a quitar en ' + url
            });
        }
    });
}])
.constant('constantes', {
  UVT: 29753,
  salarioMinimo: 689454
});
