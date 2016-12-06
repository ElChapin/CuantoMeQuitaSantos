angular.module('myApp.services')
.factory('rentaService', function($q, $http, commonService, constantes) {
  
    var service = {};

    /**
     * Art. 241. Tarifa para las personas naturales y extranjeras residentes y asignaciones y donaciones modales.
     * * -Modificado- El impuesto sobre la renta de las personas naturales residentes en el país, de las sucesiones de causantes residentes en el país, y de los bienes destinados a fines especiales, en virtud de donaciones o asignaciones modales, se determinará de acuerdo con la tabla que contiene el presente artículo:
     * TABLA DEL IMPUESTO SOBRE LA RENTA Y COMPLEMENTARIOS
     *
     * RANGOS EN UVT    	    TARIFA MARGINAL 	IMPUESTO
     * DESDE 	    HASTA
     * > 0   	    1.090 	    0% 	                0
     * > 1.090 	1.700 	    19% 	            (Renta gravable o ganancia ocasional gravable expresada en UVT menos 1.090 UVT)*19%
     * > 1.700 	4.100 	    28% 	            (Renta gravable o ganancia ocasional gravable expresada en UVT menos 1.700 UVT)*28% más 116 UVT
     * > 4.100 	En adelante 33% 	            (Renta gravable o ganancia ocasional gravable expresada en UVT menos 4.100 UVT)*33% más 788 UVT
     */
    service.CalcularTarifaRentaActual = function (baseGravable) {

        return commonService.ObtenerTarifaDiferencial(baseGravable, [
            { bordeUVT: 1090, tarifa: .19, constanteUVT: 0 },
            { bordeUVT: 1700, tarifa: .28, constanteUVT: 116 },
            { bordeUVT: 4100, tarifa: .33, constanteUVT: 788 }
        ]);
    }

    /**
     * Fuente: http://static.iris.net.co/dinero/upload/documents/reformatributaria2016.pdf
     * Art. 241. Tarifa para las personas naturales y extranjeras residentes y asignaciones y donaciones modales.
     * * -Modificado- El impuesto sobre la renta de las personas naturales residentes en el país, de las sucesiones de causantes residentes en el país, y de los bienes destinados a fines especiales, en virtud de donaciones o asignaciones modales, se determinará de acuerdo con la tabla que contiene el presente artículo:
     * TABLA DEL IMPUESTO SOBRE LA RENTA Y COMPLEMENTARIOS
     *
     * RANGOS EN UVT    	    TARIFA MARGINAL IMPUESTO
     * DESDE 	    HASTA
     * > 0   	    600    	    0% 	            0
     * > 600      	1000   	    10% 	        (Renta gravable o ganancia ocasional gravable expresada en UVT menos 600 UVT)*10%
     * > 1000      2000   	    20% 	        (Renta gravable o ganancia ocasional gravable expresada en UVT menos 1000 UVT)*20% más 40 UVT
     * > 2000      3000   	    30% 	        (Renta gravable o ganancia ocasional gravable expresada en UVT menos 2000 UVT)*30% más 240 UVT
     * > 3000      4000   	    33% 	        (Renta gravable o ganancia ocasional gravable expresada en UVT menos 3000 UVT)*33% más 540 UVT
     * > 4000     	En adelante 35% 	        (Renta gravable o ganancia ocasional gravable expresada en UVT menos 4000 UVT)*35% más 870 UVT
     */
    var calcularTarifaRentaReforma = function (baseGravable) {

        return commonService.ObtenerTarifaDiferencial(baseGravable, [
            { bordeUVT: 600, tarifa: .1, constanteUVT: 0 },
            { bordeUVT: 1000, tarifa: .2, constanteUVT: 40 },
            { bordeUVT: 2000, tarifa: .30, constanteUVT: 240 },
            { bordeUVT: 3000, tarifa: .33, constanteUVT: 540 },
            { bordeUVT: 4000, tarifa: .35, constanteUVT: 870 }
        ]);
    }

    var calcularTarifaRentaIman = function (rentaGravableAlternativa, tablaTarifa) {
        var rentaGravableAlternativaUVT = rentaGravableAlternativa / constantes.UVT;
        var imanUVT = 0;

        for (var i = tablaTarifa.length - 1; i >= 0 && imanUVT == 0; i--) {
            if (rentaGravableAlternativaUVT > tablaTarifa[i].bordeUVT) {
                 imanUVT = tablaTarifa[i].constanteUVT;
            }
        }

        console.log(rentaGravableAlternativa);
        console.log(rentaGravableAlternativaUVT);
        console.log(imanUVT * constantes.UVT);

        return imanUVT * constantes.UVT;
    }

    /**
     * Calcular renta de ET vigente
     */
    service.CalcularRentaActual = function (valores) {

        var impuestoNetoRenta = 0;

        // TODO 1. Determinar si es residente o no residente
        var residente = true;
        // TODO 2. Determinar si debe declarar
        // 2.1. Sin residencia: si aplicó retefuente ingresos totales año AND conceptos 407-411 ET
        // 2.2. Con residencia: IB > 1400 UVT || PB > 4500 UVT || consumos tarjeta credito > 2800 UVT || compras > 2800 UVT ||
        //                      consignaciones > 4500 UVT || !(IVA régimen común)
        var declaraRentaResidente = true;
        var declaraRenta = residente ? declaraRentaResidente : false;

        if (declaraRenta) {
            // TODO 3. Clasificar: empleado, TCP, otros (329 ET)
            // 3.1. Conjunto 1: IB > 80 % por vinculación laboral
            var conjunto1 = true;
            // 3.2. Conjunto 2: IB > 80 % por servicios personales AND no actividad por propia cuenta y riesgo
            var conjunto2 = true;
            // 3.3. Conjunto 3: IB > 80 % por servicios personales AND actividad por propia cuenta y riesgo
            // AND no servicios técnicos AND IB < 20 % por actividades 340 ET AND IB < 20 % por mercancias (...)
            var conjunto3 = true;
            var empleado = conjunto1 || conjunto2 || conjunto3;

            if (empleado) {
                // 4. Identificar sistemas de determinación: ordinario, IMAN, IMAS
                // 4.1. Ordinario (26 ET)
                var rentaLiquida =
                      valores.salario
                    - valores.ingresosNoConstitutivosRenta
                    // - valores.devoluciones // Ingreso neto
                    // - valores.costos // Renta bruta
                    - valores.deducciones;
                var rentaPresuntiva = 0; // TODO Renta presuntiva = Patrimonio líquido año anterior - Valores patrimoniales (189 ET)

                var rentaLiquidaGravable = (rentaLiquida > rentaPresuntiva) ? rentaLiquida : rentaPresuntiva;
                    rentaLiquidaGravable -= valores.rentasExentas;

                var impuestoBasicoRenta = service.CalcularTarifaRentaActual(rentaLiquidaGravable);
                var descuentosTributarios = 0; // TODO Descuentos tributarios
                impuestoNetoRenta = impuestoBasicoRenta - descuentosTributarios;

                // 4.2. IMAN (330 ET)
                var rentaGravableAlternativa =
                      valores.salario
                    - valores.ingresosNoConstitutivosRenta
                    - valores.rentasExentas;
                // TODO 4.2.1. Tabla tarifas IMAN (333 ET)
                var impuestoBasicoRentaIman = 0;

                if (rentaGravableAlternativa / constantes.UVT >= 13643) {
                    impuestoBasicoRentaIman = (rentaGravableAlternativa / constantes.UVT * .27 - 1622) * constantes.UVT;
                } else if (rentaGravableAlternativa / constantes.UVT < 13643 && rentaGravableAlternativa >= 1548) {
                    $http.get('../paso1/iman.json').then(function (response) {
                        var imanTarifas = response.data.tablaIman;
                        impuestoBasicoRentaIman = calcularTarifaRentaIman(rentaGravableAlternativa, imanTarifas);
                    });
                }

                impuestoNetoRenta = (impuestoNetoRenta > impuestoBasicoRentaIman) ?
                    impuestoNetoRenta : impuestoBasicoRentaIman;
            }

            if (false) {
                // TODO: TCP y otros
            }

            // 5. Identificar formularios y calcular impuesto
        }

        return { baseGravable: rentaLiquidaGravable, impuesto: impuestoNetoRenta };
    }
    
    /**
     * TÍTULO V ET Reforma Tributaria 2016
     * TODO Descomponer ingresos no constitutivos de renta y rentas exentas por cada cédula
     */
    service.CalcularRentaReforma = function (valoresCedula) {

        var rentasExentasAplicadas = false;
        // Rentas cedulares: trabajo, pensión, no laboral, capital, dividendos

        // 1. Rentas de trabajo (103 ET): salarios, comisiones, prestaciones sociales, viáticos, gastos de representación
        // honorarios, emolumentos eclesiásticos, compensaciones cooperativas, servicios personales
        var rentaTrabajo = valoresCedula.rentaTrabajo.renta;
        rentaTrabajo -= valoresCedula.rentaTrabajo.ingresosNoConstitutivosRenta;

        if (valoresCedula.rentaTrabajo.rentasExentas < rentaTrabajo * .35 && rentaTrabajo / constantes.UVT < 3500) {
            rentaTrabajo -= valoresCedula.rentaTrabajo.rentasExentas;
            rentasExentasAplicadas = true;
        }

        // 2. Rentas de pensiones (206.5 ET): jubilación, invalidez, vejez, sobrevivientes > 1000 UVT
        var rentaPension = valoresCedula.rentaPension.renta;

        if (rentaPension / 12 / constantes.UVT > 1000)
            rentaPension -= valoresCedula.rentaPension.ingresosNoConstitutivosRenta;
        if (!rentasExentasAplicadas)
            rentaPension -= valoresCedula.rentaPension.rentasExentas;

        // 3. Rentas de capital: intereses, rendimientos financieros, arrendamientos, regalías, propiedad intelectual
        var rentaCapital = valoresCedula.rentaCapital.renta;
        rentaCapital -= valoresCedula.rentaCapital.ingresosNoConstitutivosRenta;

        if (valoresCedula.rentaCapital.rentasExentas < rentaCapital * .10 && rentaCapital / constantes.UVT < 3500
            && !rentasExentasAplicadas) {
            rentaCapital -= valoresCedula.rentaCapital.rentasExentas;
            rentasExentasAplicadas = true;
        }

        // 4. Rentas no laborales: diferentes a las anteriores, además de honorarios
        var rentaNoLaboral = valoresCedula.rentaNoLaboral.renta;
        rentaNoLaboral -= valoresCedula.rentaNoLaboral.ingresosNoConstitutivosRenta;

        if (valoresCedula.rentaNoLaboral.rentasExentas < rentaNoLaboral * .10 && rentaNoLaboral / constantes.UVT < 3500
            && !rentasExentasAplicadas) {
            rentaNoLaboral -= valoresCedula.rentaNoLaboral.rentasExentas;
            rentasExentasAplicadas = true;
        }

        // TODO Cédula dividendos
        var rentaDividendos = 0;

        var rentaLiquidaGravable = rentaTrabajo + rentaPension + rentaCapital + rentaNoLaboral;

        return { baseGravable: rentaLiquidaGravable, impuesto: calcularTarifaRentaReforma(rentaLiquidaGravable) };
    }
	
	return service;
})