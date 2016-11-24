'use strict';

angular.module('myApp.paso1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/paso1', {
    templateUrl: 'paso1/paso1.html',
    controller: 'Paso1Ctrl'
  });
}])

.controller('Paso1Ctrl', function($scope) {

  var UVT = 29753;
  $scope.salarioMinimo = 689454;

  var anteriorSalario = 2500000;

  $scope.limpiarSalario = function () {

      $scope.salario = '';
  }

  $scope.resetSalario = function () {
    
    if (!$scope.salario)
        $scope.salario = anteriorSalario;
  }

  $scope.resetSalario();

  $scope.salarioIntegral = false;

  $scope.changeSalarioIntegral = function () {

      $scope.salarioIntegral = !$scope.salarioIntegral;
  }

  $scope.$watch('salario', function () {
    
    calculoSalarioGeneral()
  })

  $scope.$watch('salarioIntegral', function () {
    
    calculoSalarioGeneral()
  })

  var calcularRetencionActual = function (baseGravable) {

    var baseGravableUVT = baseGravable / UVT;
    var retencionUVT = 0;
    //3.1.5.1: Cálculo de la retención en UVT según ARTICULO 383 del ET
    /* Tomado el 19 de diciembre de 2013 de http://www.secretariasenado.gov.co/senado/basedoc/codigo/estatuto_tributario_pr016.html
            
            ARTICULO 383. TARIFA. <Artículo modificado por el artículo 23 de la Ley 1111 de 2006. El nuevo texto es el siguiente:>
            <Inciso modificado por el artículo 13 de la Ley 1607 de 2012. El nuevo texto es el siguiente:> La retención en la fuente aplicable a los pagos gravables, efectuados por las personas naturales o jurídicas, las sociedades de hecho, las comunidades organizadas y las sucesiones ilíquidas, originados en la relación laboral, o legal y reglamentaria; efectuados a las personas naturales pertenecientes a la categoría de empleados de conformidad con lo establecido en el artículo 329 de este Estatuto; o los pagos recibidos por concepto de pensiones de jubilación, invalidez, vejez, de sobrevivientes y sobre riesgos laborales de conformidad con lo establecido en el artículo 206 de este Estatuto, será la que resulte de aplicar a dichos pagos la siguiente tabla de retención en la fuente:
            
            TABLA DE RETENCIÓN EN LA FUENTE PARA INGRESOS LABORALES GRAVADOS
            
            RANGOS EN UVT			TARIFA MARGINAL		IMPUESTO
            DESDE	HASTA
                  
            >0		95				0%					0
            >95		150				19%					(Ingreso laboral gravado expresado en UVT menos 95 UVT)*19%
            >150	360				28%					(Ingreso laboral gravado expresado en UVT menos 150 UVT)*28% más 10 UVT
            >360	En adelante		33%					(Ingreso laboral gravado expresado en UVT menos 360 UVT)*33% más 69 UVT
            
            PARÁGRAFO. Para efectos de la aplicación del Procedimiento 2 a que se refiere el artículo 386 de este Estatuto, el valor del impuesto en UVT determinado de conformidad con la tabla incluida en este artículo, se divide por el ingreso laboral total gravado convertido a UVT, con lo cual se obtiene la tarifa de retención aplicable al ingreso mensual.
            */
    if (baseGravableUVT > 360)
        retencionUVT = (baseGravableUVT - 360) * .33 + 69;
    else if (baseGravableUVT > 150)
        retencionUVT = (baseGravableUVT - 150) * .28 + 10;
    else if (baseGravableUVT > 95)
        retencionUVT = (baseGravableUVT - 95) * .19;
    return retencionUVT * UVT;
  }

  var calcularRetencionReforma = function (baseGravable) {

    var baseGravableUVT = baseGravable / UVT;
    var retencionUVT = 0;
    //3.1.5.1: Cálculo de la retención en UVT según ARTICULO 383 del ET
    /*
    ARTÍCULO 16. Modifíquese el artículo 383 del Estatuto Tributario, el cual quedará así:
    ARTICULO 383. TARIFA. La retención en la fuente aplicable a los pagos gravables
    efectuados por las personas naturales o jurídicas, las sociedades de hecho, las
    comunidades organizadas y las sucesiones ilíquidas, originados en la relación
    laboral, o legal y reglamentaria, y los pagos recibidos por concepto de pensiones de
    jubilación, invalidez, vejez, de sobrevivientes y sobre riesgos laborales de
    conformidad con lo establecido en el artículo 206 de este Estatuto, será la que
    resulte de aplicar a dichos pagos la siguiente tabla de retención en la fuente:
    Rangos en UVT Tarifa
    Marginal Retención
    Desde Hasta
    >0 50 0% 0
    >50 83 10% (Base Gravable en UVT menos 50 UVT) x 10%
    >83 166 20% (Base Gravable en UVT menos 83 UVT) x 20% + 4 UVT
    >166 250 30% (Base Gravable en UVT menos 166 UVT) x 30% + 20
    UVT
    >250 333 33% (Base Gravable en UVT menos 250 UVT) x 33% + 45
    UVT
    >333 En
    adelante 35% (Base Gravable en UVT menos 333 UVT) x 35% + 73
    UVT

    */ 
    if (baseGravableUVT > 333)
        retencionUVT = (baseGravableUVT - 333) * .35 + 73;
    else if (baseGravableUVT > 250)
        retencionUVT = (baseGravableUVT - 250) * .33 + 45;
    else if (baseGravableUVT > 166)
        retencionUVT = (baseGravableUVT - 166) * .3 + 20;
    else if (baseGravableUVT > 83)
        retencionUVT = (baseGravableUVT - 83) * .2 + 4;
    else if (baseGravableUVT > 50)
        retencionUVT = (baseGravableUVT - 50) * .1;
        
    return retencionUVT * UVT;
  }

  var calculoSalarioGeneral = function () {

      $scope.actual = calculoSalario()
      $scope.reforma = calculoSalario(true)
  }

  var calculoSalario = function (conReforma) {

    //1: Entradas
    
    var flujoEfectivoMensual = $scope.salario;
    
    //1.1: Pagos Laborales efectuados durante el mes
    var pagosLaboralesHorasExtra = 0;
    var pagosLaboralesAuxiliosYSubsidios = 0;
    if (pagosLaboralesAuxiliosYSubsidios > .4 * (pagosLaboralesAuxiliosYSubsidios + $scope.salario)) {
        alert('Los Auxulios (60%-40%) no pueden superar el 40% del total del ingreso por salario + Auxulios y Subsidios');
        txtPagosLaboralesAuxiliosYSubsidios.val(formatValueToCurency(0));
    }
    var pagosLaboralesOtrosOrdinariosOExtraordinarios = 0
    
    flujoEfectivoMensual += pagosLaboralesHorasExtra + pagosLaboralesAuxiliosYSubsidios + pagosLaboralesOtrosOrdinariosOExtraordinarios;
    
    //1.2: no cosntitutivos de renta
    var ingresoNoConstitutivoRentaPagosTercerosAlimentacion = 0;
    var viaticos = 0;
    
    //1.3:Rentas excentas
    var aporteAFC = 0;
    var aporteFVP = 0;

    if ((aporteAFC + aporteFVP) > $scope.salario * .3) {
        aporteAFC = 0;
        aporteFVP = 0;
        alert('Los aportes al Fondo Voluntario de Pensiones (FVP) sumados a los aportes las Cuentas de Ahorro para el Fomento de la Construcción (AFC) no pueden superar el 30% del ingreso laboral (salario)');
    }
    
    flujoEfectivoMensual -= aporteFVP + aporteAFC;
    
    //1.4:Deducciones
    var interesesOCorreccionMonetariaPrestamosVivienda = 0;
    //medicina prepagada y pólizas de seguros
    var pagosSalud = 0;						
    var dependientes = false;
    
    //2: Seguridad social
    
    var IBC = ($scope.salarioIntegral) ? $scope.salario * .7 : $scope.salario;
    if (IBC < $scope.salarioMinimo)
        IBC = $scope.salarioMinimo;
    else if (IBC > 25 * $scope.salarioMinimo)
        IBC = 25 * $scope.salarioMinimo;
    
    //2.1: Pensiones
    var aporteObligatorioPension = IBC * .04;
    
    var aporteFSP = 0;
      if($scope.salario > 20 * $scope.salarioMinimo)
          aporteFSP = IBC * .02;
      else if ($scope.salario >= 19 * $scope.salarioMinimo)
          aporteFSP = IBC * .018;
      else if ($scope.salario >= 18 * $scope.salarioMinimo)
          aporteFSP = IBC * .014;
      else if ($scope.salario >= 17 * $scope.salarioMinimo)
          aporteFSP = IBC * .013;
      else if ($scope.salario >= 16 * $scope.salarioMinimo)
          aporteFSP = IBC * .012;
    else if($scope.salario > 4 * $scope.salarioMinimo)
        aporteFSP = IBC * .01;
    
    //Aporte del empleado (4%) más aporte del empleador (12%)
    var totalAportePension = IBC * .16 + aporteFVP;
    
    flujoEfectivoMensual -= aporteObligatorioPension + aporteFSP;
    
    //2.2: Salud
    var aporteObligatorioSalud = IBC * .04;
    
    flujoEfectivoMensual -= aporteObligatorioSalud;
    
    //3: Procedimientos tributarios
    //Tomado el 19 de diciembre de 2013 de http://www.gerencie.com/retencion-en-la-fuente-por-ingresos-laborales.html
    
    //3.1: Procedimiento 1
    
    //3.1.1: Pagos laborales
    var pagosLaboralesPagosTercerosAlimentacion = 0;
    
    //3.1.2: Cálculos ingresos no constitutivo de renta
    var salarioUVT = $scope.salario / UVT;

    if (salarioUVT < 310) {

      var pagosTercerosAlimentacionUVT = ingresoNoConstitutivoRentaPagosTercerosAlimentacion / UVT;

      if (pagosTercerosAlimentacionUVT > 41) {

        var ingresoNoConstitutivoRentaPagosTercerosAlimentacion_Original = ingresoNoConstitutivoRentaPagosTercerosAlimentacion;
        ingresoNoConstitutivoRentaPagosTercerosAlimentacion = 41 * UVT;
        pagosLaboralesPagosTercerosAlimentacion = ingresoNoConstitutivoRentaPagosTercerosAlimentacion - ingresoNoConstitutivoRentaPagosTercerosAlimentacion;
      }
    }
    
    //3.1.3: Cálculos deducciones
    
    //3.1.3.1: Pagos salud
    var pagosSaludUVT = pagosSalud / UVT;
    var deduccionPagosSalud = (pagosSaludUVT > 16) ? 16 * UVT : pagosSalud;
    
    //3.1.3.2: Dependientes
    var deduccionDependientes = 0;

    if (dependientes) {

      deduccionDependientes = $scope.salario * .1;
      deduccionDependientes = (deduccionDependientes / UVT > 32) ? 32 * UVT : deduccionDependientes;
    }
    
    //3.1.4: Cálculo subtotal
    //TODO: Cómo va ahí "Cesantía, intereses sobre cesantía, prima mínima legal de servicios (sector privado) o de navidad (sector público) y vacaciones."
    var pagosLaborales = $scope.salario + pagosLaboralesHorasExtra + pagosLaboralesAuxiliosYSubsidios + pagosLaboralesOtrosOrdinariosOExtraordinarios + pagosLaboralesPagosTercerosAlimentacion;
    
    //TODO: Cómo van ahí:
    // - Medios de transporte distintos del subsidio de transporte
    // - "Cesantía, intereses sobre cesantía y prima mínima legal de servicios (sector privado) o de navidad (sector público)"
    // - Demás pagos que no incrementan el patrimonio del trabajador
    var ingresosNoConstirutivosDeRenta = ingresoNoConstitutivoRentaPagosTercerosAlimentacion + viaticos;

    //TODO: Cómo va ahí "Rentas de trabajo exentas numerales del 1 al 9 artículo 206 ET"
    //TODO: según el procedimeinto debería incluir o no el aporte FSP (supuestamente sí)
    var rentasExentas = 
        aporteObligatorioPension + aporteFSP //a. Aportes Obligatorios a Pensiones y fondo solidaridad pensional (Ley 100 1993 Art. 135)		
        + aporteFVP //b. Aportes Voluntarios Empleador Fondo de Pensiones (Art 126 -1 E.T.)		
        + aporteAFC //c. Aportes a cuentas AFC (Art 126 - 4 E.T.)
        + 0 //d. Gastos de Entierro del Trabajador
        + 0 //e. Gastos de Representación de algunos funcionarios oficiales
        + 0 //f. Exenciones para miembros de las fuerzas armadas
        + 0 //g. Indemnizaciones por enfermedad, maternidad o accidente de trabajo		
        ;
      //TODO: según esto http://www.gerencie.com/disminucion-de-la-base-de-retencion-por-aportes-obligatorios-a-salud-y-pension.html y según el este artículo del estatuto tributario http://www.secretariasenado.gov.co/senado/basedoc/codigo/estatuto_tributario_pr006.html#126-1 debería sumarse a las rentas excentas el aporte a pension que hace el empleador
      //var rentasExentas = totalAportePension + $scope.aporteFSP + $scope.aporteAFC;
    
    //TODO: dice Aportes obligatorios a salud efectuados por el trabajador (año anterior), pero es así en el procedimeinto 1?
    var deducciones = 
        aporteObligatorioSalud
        + (interesesOCorreccionMonetariaPrestamosVivienda / UVT > 100 ? 100 * UVT : interesesOCorreccionMonetariaPrestamosVivienda)
        + deduccionPagosSalud
        + deduccionDependientes;
    
    var subtotal = pagosLaborales - ingresosNoConstirutivosDeRenta - rentasExentas - deducciones;
    
    //3.1.5: Cálculo retención
    //25% del subtotal 4 Limitadas a 240 uvt (7.140.480 AÑO 2016), Art.206 Numeral 10. El cálculo de esta renta exenta se efectuará una vez se detraiga del valor total de los pagos laborales recibidos por el trabajador, los ingresos no constitutivos de renta, las deducciones y las demás rentas exentas diferentes a la establecida en el presente numeral
    var rentaExcentaTrabajo = subtotal * .25 / UVT > 240 ? 240 * UVT : subtotal * .25;
    $scope.baseGravableRetefuente = subtotal - rentaExcentaTrabajo;
    var retefuente = conReforma ? calcularRetencionReforma($scope.baseGravableRetefuente) : calcularRetencionActual($scope.baseGravableRetefuente);
    
    flujoEfectivoMensual -= retefuente;    
    
    //5. Flujo efectivo anual
    //=El flujo mensual, y si no es salario integral un salario de prima + 12% de intereses sobre cesantías (como son un salario, se suma 1.12 veces el salario)
    var flujoEfectivoAnual = flujoEfectivoMensual * 12 + (($scope.salarioIntegral) ? 0 : $scope.salario * 1.12);
    
    //6. Cesantía
    //=Un salario y 12% de intereses sobre la cesantía
    var cesantias = ($scope.salarioIntegral) ? 0 : $scope.salario;
    
    //7. Mostrar salidas
    /*form.find('[name="IBC"]').val(formatValueToCurency(IBC));
    form.find('[name="aporteSalud"]').val(formatValueToCurency(aporteObligatorioSalud));
    form.find('[name="aportePension"]').val(formatValueToCurency(aporteObligatorioPension));
    form.find('[name="aporteFSP"]').val(formatValueToCurency(aporteFSP));
    form.find('[name="seguridadSocial"]').val(formatValueToCurency(aporteObligatorioSalud +aporteObligatorioPension + aporteFSP));
    form.find('[name="baseGravable"]').val(formatValueToCurency($scope.baseGravableRetefuente));
    form.find('[name="retencion"]').val(formatValueToCurency(retefuente));
    form.find('[name="aporteTotalPension"]').val(formatValueToCurency(totalAportePension));
    form.find('[name="ahorroAnual"]').val(formatValueToCurency(cesantias + aporteAFC * 12));
    form.find('[name="flujoMensual"]').val(formatValueToCurency(flujoEfectivoMensual));
    form.find('[name="flujoAnual"]').val(formatValueToCurency(flujoEfectivoAnual));*/

    //8. Cálculo de impuesto de renta
    var valoresRenta = {
        salario: $scope.salario * 13,//12 salarios más las 2 primas de medio salario
        ingresosNoConstirutivosDeRenta: ingresosNoConstirutivosDeRenta * 12,
        deducciones: deducciones * 12,
        rentasExentas: rentasExentas * 12,
        retefuente: retefuente * 12
    }

    var valoresCedula = {
        rentaTrabajo: {
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaPension: {
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaCapital: {
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaNoLaboral: {
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaDividendos: 0
    }

    var renta = conReforma ? calcularRentaReforma(valoresCedula) : calcularRentaActual(valoresRenta);
    flujoEfectivoAnual -= renta;

    return {
        pagosSeguridadSocial: aporteObligatorioSalud +aporteObligatorioPension + aporteFSP,
        retefuente: retefuente,
        renta: renta > 0 ? renta : 0,
        flujoMensual: flujoEfectivoMensual,
        flujoAnual: flujoEfectivoAnual,
        CanastaBasica: conReforma ? 121350 : 117750
    }
  }

  function calcularIVAMercadoReforma()
  {
      return
  }

    // IMPUESTO DE RENTA A PERSONAS NATURALES

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
    var calcularTarifaRentaActual = function (rentaGravable) {

        var rentaGravableUVT = rentaGravable / UVT;
        var rentaUVT = 0;

        console.log(rentaGravable);
        console.log(rentaGravableUVT);

        if (rentaGravableUVT > 4100)
            rentaUVT = (rentaGravableUVT - 4100) * .33 + 788;
        else if (rentaGravableUVT > 1700)
            rentaUVT = (rentaGravableUVT - 1700) * .28 + 116;
        else if (rentaGravableUVT > 1090)
            rentaUVT = (rentaGravableUVT - 1090) * .19;

        return rentaUVT * UVT;
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
    var calcularTarifaRentaReforma = function (rentaGravable) {
        
        var rentaGravableUVT = rentaGravable / UVT;
        var rentaUVT = 0;

        if (rentaGravableUVT > 4000)
            rentaUVT = (rentaGravableUVT - 4000) * .35 + 870;
        else if (rentaGravableUVT > 3000)
            rentaUVT = (rentaGravableUVT - 3000) * .33 + 540;
        else if (rentaGravableUVT > 2000)
            rentaUVT = (rentaGravableUVT - 2000) * .30 + 240;
        else if (rentaGravableUVT > 1000)
            rentaUVT = (rentaGravableUVT - 1000) * .20 + 40;
        else if (rentaGravableUVT > 600)
            rentaUVT = (rentaGravableUVT - 600) * .10;

        return rentaUVT * UVT;
    }

    /**
     * Calcular renta de ET vigente
     */
    var calcularRentaActual = function(valores) {

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
                    - valores.ingresosNoConstirutivosDeRenta
                    // - valores.devoluciones // Ingreso neto
                    // - valores.costos // Renta bruta
                    - valores.deducciones;
                var rentaPresuntiva = 0; // TODO Renta presuntiva = Patrimonio líquido año anterior - Valores patrimoniales (189 ET)

                var rentaLiquidaGravable = (rentaLiquida > rentaPresuntiva) ? rentaLiquida : rentaPresuntiva;
                    rentaLiquidaGravable -= valores.rentasExentas;

                var impuestoBasicoRenta = calcularTarifaRentaActual(rentaLiquidaGravable);
                var descuentosTributarios = 0; // TODO Descuentos tributarios
                impuestoNetoRenta = impuestoBasicoRenta - descuentosTributarios;

                // 4.2. IMAN (330 ET)
                var rentaGravableAlternativa =
                      valores.salario
                    - valores.ingresosNoConstirutivosDeRenta
                    - valores.rentasExentas;
                // TODO 4.2.1. Tabla tarifas IMAN (333 ET)

            }

            if (false) {
                // TODO: TCP y otros
            }

            // 5. Identificar formularios y calcular impuesto
        }

        return impuestoNetoRenta;
    }

    /**
     * TÍTULO V ET Reforma Tributaria 2016
     * TODO Descomponer ingresos no constitutivos de renta y rentas exentas por cada cédula
     */
    var calcularRentaReforma = function (valoresCedula) {

        var rentasExentasAplicadas = false;
        // Rentas cedulares: trabajo, pensión, no laboral, capital, dividendos

        // 1. Rentas de trabajo (103 ET): salarios, comisiones, prestaciones sociales, viáticos, gastos de representación
        // honorarios, emolumentos eclesiásticos, compensaciones cooperativas, servicios personales
        var rentaTrabajo = 0;
        rentaTrabajo -= valoresCedula.rentaTrabajo.ingresosNoConstitutivosRenta;

        if (valoresCedula.rentaTrabajo.rentasExentas < rentaTrabajo * .35 && rentaTrabajo / UVT < 3500) {
            rentaTrabajo -= valoresCedula.rentaTrabajo.rentasExentas;
            rentasExentasAplicadas = true;
        }

        // 2. Rentas de pensiones (206.5 ET): jubilación, invalidez, vejez, sobrevivientes > 1000 UVT
        var rentaPension = 0;

        if (rentaPension / 12 / UVT > 1000)
            rentaPension -= valoresCedula.rentaPension.ingresosNoConstitutivosRenta;
        if (!rentasExentasAplicadas)
            rentaPension -= valoresCedula.rentaPension.rentasExentas;

        // 3. Rentas de capital: intereses, rendimientos financieros, arrendamientos, regalías, propiedad intelectual
        var rentaCapital = 0;
        rentaCapital -= valoresCedula.rentaCapital.ingresosNoConstitutivosRenta;

        if (valoresCedula.rentaCapital.rentasExentas < rentaCapital * .10 && rentaCapital / UVT < 3500
            && !rentasExentasAplicadas) {
            rentaCapital -= valoresCedula.rentaCapital.rentasExentas;
            rentasExentasAplicadas = true;
        }

        // 4. Rentas no laborales: diferentes a las anteriores, además de honorarios
        var rentaNoLaboral = 0;
        rentaNoLaboral -= valoresCedula.rentaNoLaboral.ingresosNoConstitutivosRenta;

        if (valoresCedula.rentaNoLaboral.rentasExentas < rentaNoLaboral * .10 && rentaNoLaboral / UVT < 3500
            && !rentasExentasAplicadas) {
            rentaNoLaboral -= valoresCedula.rentaNoLaboral.rentasExentas;
            rentasExentasAplicadas = true;
        }

        // TODO Cédula dividentos
        var rentaDividendos = 0;

        var rentaLiquidaGravable = rentaTrabajo + rentaPension + rentaCapital + rentaNoLaboral;

        return calcularTarifaRentaReforma(rentaLiquidaGravable);
    }

});