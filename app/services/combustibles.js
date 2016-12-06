angular.module('myApp.services')
.factory('combustiblesService', function($q, commonService, constantes) {

    var service = {};

    var promedioKmsDia = 20;
    var precioReferenciaGasolina = 8046;//Bogota, noviembre
    var precioReferenciaACPM = 7501;//Bogota, noviembre
    var impuestoNacional = 1116;
    var sobretasaGasolina = precioReferenciaGasolina * .25;
    var sobretasaACPM = precioReferenciaACPM * .06;
    var impuestoVerde = 135;

    service.CalcularImpuestosBus = function (conReforma) {

        var costoCombustible = 30;//los días del mes
        costoCombustible = costoCombustible * 4000;//Dos tiquetes de bus
        costoCombustible = costoCombustible * .4;//Se asume un costo de 40% por combustible

        var impuestos = costoCombustible * ((impuestoNacional + sobretasaACPM) / precioReferenciaACPM);        

        if (conReforma)
            impuestos += impuestoVerde * 30;

        return { impuestos: impuestos, total: 30 * (conReforma ? 4000 + impuestoVerde : 4000) };
    }

    service.CalcularImpuestosGasolinaCarro = function (conReforma) {

        return service.CalcularImpuestosGasolina(30, conReforma)
    }

    service.CalcularImpuestosGasolinaMoto = function (conReforma) {

        return service.CalcularImpuestosGasolina(80, conReforma)
    }

    service.CalcularImpuestosGasolina = function (rendimientoKmsGalon, conReforma) {

        var consumoMes = (promedioKmsDia / rendimientoKmsGalon) * 30;
        var totalImpuestos = (impuestoNacional + sobretasaGasolina + (conReforma ? 135 : 0)) * consumoMes;

        return { impuestos: totalImpuestos, total: precioReferenciaGasolina * consumoMes + totalImpuestos }
    }

    return service;
})