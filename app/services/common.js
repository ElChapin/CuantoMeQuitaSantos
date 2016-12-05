angular.module('myApp.services', [])
.factory('commonService', function($q, constantes) {   
  
    var service = {};

    /**
     * Data una tabla de tarifa con la esctrutura:
     * [
     *  {bordeUVT: 10, tarifa: .1, constanteUVT: 1},
     *  {bordeUVT: 20, tarifa: .2, constanteUVT: 2}
     * ]
     * Retorna el valor correspondiente en UVT según la base gravable dada
     */
    service.ObtenerTarifaDiferencial = function (baseGravable, tablaTarifa) {

        var baseGravableUVT = baseGravable / constantes.UVT;

        var retencionUVT = 0;

        for (var i = tablaTarifa.length - 1; i >= 0 && retencionUVT == 0; i--) {

            if (baseGravableUVT > tablaTarifa[i].bordeUVT) {

                 retencionUVT = (baseGravableUVT - tablaTarifa[i].bordeUVT) * tablaTarifa[i].tarifa + tablaTarifa[i].constanteUVT;
            }
        }

        return retencionUVT * constantes.UVT;
    }

    return service
})