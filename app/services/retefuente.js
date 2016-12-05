angular.module('myApp.services')
.factory('retefuenteService', function($q, commonService, constantes) {
  
    var service = {};

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
    service.CalcularRetencionActual = function (baseGravable) {

        return commonService.ObtenerTarifaDiferencial(baseGravable, [
            { bordeUVT: 95, tarifa: .19, constanteUVT: 0 },
            { bordeUVT: 150, tarifa: .28, constanteUVT: 10 },
            { bordeUVT: 360, tarifa: .33, constanteUVT: 69 }
        ]);
    }
        
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
    service.CalcularRetencionReforma = function (baseGravable) {

        return commonService.ObtenerTarifaDiferencial(baseGravable, [
            { bordeUVT: 50, tarifa: .1, constanteUVT: 0 },
            { bordeUVT: 83, tarifa: .2, constanteUVT: 4 },
            { bordeUVT: 166, tarifa: .3, constanteUVT: 20 },
            { bordeUVT: 250, tarifa: .33, constanteUVT: 45 },
            { bordeUVT: 333, tarifa: .35, constanteUVT: 73 }
        ]);
    }
	
	return service;
})