'use strict';

angular.module('myApp.paso1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/paso1', {
    templateUrl: 'paso1/paso1.html',
    controller: 'Paso1Ctrl'
  });
}])

.controller('Paso1Ctrl', function($scope, $timeout, $document, retefuenteService, rentaService, combustiblesService , constantes) {

  $scope.paso2visible = false;

  $scope.paso2 = function () {

    $scope.paso2visible = true;
  }

  $scope.salarioMinimo = constantes.salarioMinimo;

  var anteriorSalario = 2500000;

  $scope.tiposContrato = [
      { id: 'l', nombre: 'Laboral' },
      { id: 'p', nombre: 'Prestación de Servicios' }
  ]

  $scope.entradas = {
    tipoContrato: $scope.tiposContrato[0].id,
    encuentasConsumo: {
        transporte: 'carro'
    },
    sexo: 'f',
    adicionalesMenstruacion: true,
    maquillaje: true
  }

  $scope.limpiarSalario = function () {

      $scope.entradas.salario = '';
  }

  $scope.resetSalario = function () {
    
    if (!$scope.entradas.salario)
        $scope.entradas.salario = anteriorSalario;
  }

  $scope.resetSalario();

  $scope.entradas.salarioIntegral = false;

  $scope.$watch('entradas', function (oldValue, newValue) {
    
    if (newValue.tipoContrato == 'l')
        calculoSalarioGeneral()
    else
        calculoPrestacionGeneral()
  }, true)

  var calculoSalarioGeneral = function () {

      $scope.actual = calculoSalario()
      $scope.reforma = calculoSalario(true)
  }

  var calculoPrestacionGeneral = function () {

      $scope.actual = calculoPrestacion()
      $scope.reforma = calculoPrestacion(true)
  }

  var calculoSalario = function (conReforma) {

    //1: Entradas
    
    var flujoEfectivoMensual = $scope.entradas.salario;
    
    //1.1: Pagos Laborales efectuados durante el mes
    var pagosLaboralesHorasExtra = 0;
    var pagosLaboralesAuxiliosYSubsidios = 0;
    if (pagosLaboralesAuxiliosYSubsidios > .4 * (pagosLaboralesAuxiliosYSubsidios + $scope.entradas.salario)) {
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

    if ((aporteAFC + aporteFVP) > $scope.entradas.salario * .3) {
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
    
    var IBC = ($scope.entradas.salarioIntegral) ? $scope.entradas.salario * .7 : $scope.entradas.salario;
    if (IBC < $scope.salarioMinimo)
        IBC = $scope.salarioMinimo;
    else if (IBC > 25 * $scope.salarioMinimo)
        IBC = 25 * $scope.salarioMinimo;
    
    //2.1: Pensiones
    var aporteObligatorioPension = IBC * .04;
    
    var aporteFSP = 0;

    if ($scope.entradas.salario > 20 * $scope.salarioMinimo)
        aporteFSP = IBC * .02;
    else if ($scope.entradas.salario >= 19 * $scope.salarioMinimo)
        aporteFSP = IBC * .018;
    else if ($scope.entradas.salario >= 18 * $scope.salarioMinimo)
        aporteFSP = IBC * .014;
    else if ($scope.entradas.salario >= 17 * $scope.salarioMinimo)
        aporteFSP = IBC * .013;
    else if ($scope.entradas.salario >= 16 * $scope.salarioMinimo)
        aporteFSP = IBC * .012;
    else if ($scope.entradas.salario > 4 * $scope.salarioMinimo)
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
    var salarioUVT = $scope.entradas.salario / constantes.UVT;

    if (salarioUVT < 310) {

      var pagosTercerosAlimentacionUVT = ingresoNoConstitutivoRentaPagosTercerosAlimentacion / constantes.UVT;

      if (pagosTercerosAlimentacionUVT > 41) {

        var ingresoNoConstitutivoRentaPagosTercerosAlimentacion_Original = ingresoNoConstitutivoRentaPagosTercerosAlimentacion;
        ingresoNoConstitutivoRentaPagosTercerosAlimentacion = 41 * constantes.UVT;
        pagosLaboralesPagosTercerosAlimentacion = ingresoNoConstitutivoRentaPagosTercerosAlimentacion - ingresoNoConstitutivoRentaPagosTercerosAlimentacion;
      }
    }
    
    //3.1.3: Cálculos deducciones
    
    //3.1.3.1: Pagos salud
    var pagosSaludUVT = pagosSalud / constantes.UVT;
    var deduccionPagosSalud = (pagosSaludUVT > 16) ? 16 * constantes.UVT : pagosSalud;
    
    //3.1.3.2: Dependientes
    var deduccionDependientes = 0;

    if (dependientes) {

      deduccionDependientes = $scope.entradas.salario * .1;
      deduccionDependientes = (deduccionDependientes / constantes.UVT > 32) ? 32 * constantes.UVT : deduccionDependientes;
    }
    
    //3.1.4: Cálculo subtotal
    //TODO: Cómo va ahí "Cesantía, intereses sobre cesantía, prima mínima legal de servicios (sector privado) o de navidad (sector público) y vacaciones."
    var pagosLaborales = $scope.entradas.salario + pagosLaboralesHorasExtra + pagosLaboralesAuxiliosYSubsidios + pagosLaboralesOtrosOrdinariosOExtraordinarios + pagosLaboralesPagosTercerosAlimentacion;
    
    //TODO: Cómo van ahí:
    // - Medios de transporte distintos del subsidio de transporte
    // - "Cesantía, intereses sobre cesantía y prima mínima legal de servicios (sector privado) o de navidad (sector público)"
    // - Demás pagos que no incrementan el patrimonio del trabajador
    var ingresosNoConstitutivosRenta = ingresoNoConstitutivoRentaPagosTercerosAlimentacion + viaticos;

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
        + (interesesOCorreccionMonetariaPrestamosVivienda / constantes.UVT > 100 ? 100 * constantes.UVT : interesesOCorreccionMonetariaPrestamosVivienda)
        + deduccionPagosSalud
        + deduccionDependientes;
    
    var subtotal = pagosLaborales - ingresosNoConstitutivosRenta - rentasExentas - deducciones;
    
    //3.1.5: Cálculo retención
    //25% del subtotal 4 Limitadas a 240 uvt (7.140.480 AÑO 2016), Art.206 Numeral 10. El cálculo de esta renta exenta se efectuará una vez se detraiga del valor total de los pagos laborales recibidos por el trabajador, los ingresos no constitutivos de renta, las deducciones y las demás rentas exentas diferentes a la establecida en el presente numeral
    var rentaExcentaTrabajo = subtotal * .25 / constantes.UVT > 240 ? 240 * constantes.UVT : subtotal * .25;
    $scope.baseGravableRetefuente = subtotal - rentaExcentaTrabajo;
    
    //Retefuente
    var retefuente = retefuenteService.CalcularRetencionActual($scope.baseGravableRetefuente);
    
    var retefuenteAnoAnterior = retefuente;
    
    if (conReforma)
        retefuente = retefuenteService.CalcularRetencionReforma($scope.baseGravableRetefuente);

    flujoEfectivoMensual -= retefuente;

    //Indirectos

    //Gasolina
    var gasolina = $scope.entradas.encuentasConsumo.transporte == 'carro' ? combustiblesService.CalcularImpuestosGasolinaCarro(conReforma)
        : $scope.entradas.encuentasConsumo.transporte == 'moto' ? combustiblesService.CalcularImpuestosGasolinaMoto(conReforma)
        : combustiblesService.CalcularImpuestosBus(conReforma);

    flujoEfectivoMensual -= gasolina.impuestos;

    //Femeninos
    var consumoProductosFemeninos = 0;

    if ($scope.entradas.sexo == 'f') {
        
        consumoProductosFemeninos = 15625;

        if ($scope.entradas.adicionalesMenstruacion)
            consumoProductosFemeninos += 20000;

        if ($scope.entradas.maquillaje)
            consumoProductosFemeninos += 21273;
    }
        
    var consumoToallasHigiénicas = consumoProductosFemeninos * (conReforma ? .19 : .16);

    var productosFemeninos = {
        total: consumoProductosFemeninos + consumoToallasHigiénicas,
        iva: consumoToallasHigiénicas
    }
    
    flujoEfectivoMensual -= productosFemeninos.iva;

    //Canasta básica
    var canastaBasica = { 
        iva: conReforma ? 22374 : 18842,
        total: conReforma ? 121293 : 117760
    }
    flujoEfectivoMensual -= canastaBasica.iva;
    
    //5. Flujo efectivo anual
    //=El flujo mensual, y si no es salario integral un salario de prima + 12% de intereses sobre cesantías (como son un salario, se suma 1.12 veces el salario)
    var flujoEfectivoAnual = flujoEfectivoMensual * 12 + (($scope.entradas.salarioIntegral) ? 0 : $scope.entradas.salario * 1.12);
    
    //6. Cesantía
    //=Un salario y 12% de intereses sobre la cesantía
    var cesantias = ($scope.entradas.salarioIntegral) ? 0 : $scope.entradas.salario;
    
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
        salario: $scope.entradas.salario * 13,//12 salarios más las 2 primas de medio salario
        ingresosNoConstitutivosRenta: ingresosNoConstitutivosRenta * 12,
        deducciones: deducciones * 12,
        rentasExentas: rentasExentas * 12,
        retefuente: retefuente * 12
    }

    var valoresCedula = {
        rentaTrabajo: {
            renta: $scope.entradas.salario * 13,
            ingresosNoConstitutivosRenta: (aporteAFC + ingresosNoConstitutivosRenta) * 12,
            rentasExentas: (rentaExcentaTrabajo + cesantias) * 12
        },
        rentaPension: {
            renta: 0,
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaCapital: {
            renta: 0,
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaNoLaboral: {
            renta: 0,
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaDividendos: 0
    }

    var renta = conReforma ? rentaService.CalcularRentaReforma(valoresCedula) : rentaService.CalcularRentaActual(valoresRenta);

    //Se resta los pagos de retefuente del año anterior
    var valorAPagarRenta = renta.impuesto - retefuenteAnoAnterior * 12;

    flujoEfectivoAnual -= valorAPagarRenta;

    return {
        pagosSeguridadSocial: aporteObligatorioSalud +aporteObligatorioPension + aporteFSP,
        retefuente: retefuente,
        indirectos: {
            gasolina: gasolina,
            productosFemeninos: productosFemeninos
        },
        renta: renta,
        flujoMensual: flujoEfectivoMensual,
        flujoAnual: flujoEfectivoAnual,
        canastaBasica: canastaBasica
    }
  }

  var calculoPrestacion = function (conReforma) {

    //TODO

    var aporteObligatorioSalud = 0;
    var aporteObligatorioPension = 0;
    var aporteFSP = 0;
    
    //1.3:Rentas excentas
    var aporteAFC = 0;
    var aporteFVP = 0;

    var rentaExcentaTrabajo = 0;
    var cesantias = 0;

    var ingresosNoConstitutivosRenta = 0;
    var deducciones = 0;
    var rentasExentas = 0;

    var retefuente = ($scope.entradas.salario - ingresosNoConstitutivosRenta - deducciones - rentasExentas) * .1;
    
    var retefuenteAnoAnterior = retefuente;

    if (conReforma)
        retefuente = $scope.entradas.salario * .15;

    var flujoEfectivoMensual = $scope.entradas.salario - retefuente;

    var flujoEfectivoAnual = flujoEfectivoMensual * 12;

    //8. Cálculo de impuesto de renta
    var valoresRenta = {
        salario: $scope.entradas.salario * 13,//12 salarios más las 2 primas de medio salario
        ingresosNoConstitutivosRenta: ingresosNoConstitutivosRenta * 12,
        deducciones: deducciones * 12,
        rentasExentas: rentasExentas * 12,
        retefuente: retefuente * 12
    }

    var valoresCedula = {
        rentaTrabajo: {
            renta: $scope.entradas.salario * 13,
            ingresosNoConstitutivosRenta: (aporteAFC + ingresosNoConstitutivosRenta) * 12,
            rentasExentas: (rentaExcentaTrabajo + cesantias) * 12
        },
        rentaPension: {
            renta: 0,
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaCapital: {
            renta: 0,
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaNoLaboral: {
            renta: 0,
            ingresosNoConstitutivosRenta: 0,
            rentasExentas: 0
        },
        rentaDividendos: 0
    }

    var renta = conReforma ? rentaService.CalcularRentaReforma(valoresCedula) : rentaService.CalcularRentaActual(valoresRenta);

    //Se resta los pagos de retefuente del año anterior
    var valorAPagarRenta = renta.impuesto - retefuenteAnoAnterior * 12;

    flujoEfectivoAnual -= valorAPagarRenta;

    return {
        pagosSeguridadSocial: aporteObligatorioSalud +aporteObligatorioPension + aporteFSP,
        retefuente: retefuente,
        renta: renta,
        flujoMensual: flujoEfectivoMensual,
        flujoAnual: flujoEfectivoAnual,
        CanastaBasica: conReforma ? 18842 : 22374
    }
  }

  function calcularIVAMercadoReforma()
  {
      return
  }
});