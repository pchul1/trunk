var _MapServiceInfo = {
	params    : "/geoserver/wpcs/ows?&service=WFS&version=1.0.0&request=GetFeature&outputFormat=application%2Fjson",
	type : "&typeName=wpcs",
	property : "&PROPERTYNAME=",
	sort : "&SORTBY=",
	serviceUrl: '/psupport/jsps/proxy.jsp?',
	wmsBaseUrl: '/geoserver/wpcs/wms?'
}

var _MapService = function () {
	
	var getWfs = function(typeName, propertyName, cqlFilter, sortby){
		
		var url = _MapServiceInfo.serviceUrl + _MapServiceInfo.params + _MapServiceInfo.type + typeName + _MapServiceInfo.property + propertyName;
		
		if(cqlFilter != undefined){
			url += "&CQL_FILTER="+cqlFilter;
		}
		if(sortby){
			url += _MapServiceInfo.sort+sortby;
		}
		/*$.ajaxPrefilter('json', function(options, orig, jqXHR) {
		    return 'jsonp'
		});*/
		
		return $.ajax({
			            url : url,
			            type : 'GET',
			            async: true,
			            contentType : 'application/json',
			            fauls: function(e){
			            	console.info(e)
			            }
			    	});
	};
	
	var getRealPointWfs = function(typeName, propertyName, cneterPoint){
		//var url = proxyUrl + _MapServiceInfo.serviceUrl + _MapServiceInfo.params + _MapServiceInfo.type + typeName
		var url = _MapServiceInfo.serviceUrl + _MapServiceInfo.params + _MapServiceInfo.type + typeName 
			+ "&bbox="+cneterPoint[0]+","+cneterPoint[1]+","+cneterPoint[0]+","+cneterPoint[1] + "&urlType=geoServer";
		
		
		return $.ajax({
			            url : url,
			            type : 'GET',
			            async: true,
			            contentType : 'application/json',
			            fauls: function(e){
			            	console.info(e)
			            }
			    	});
	};
	
	var getRealExtentWfs = function(typeName, propertyName,extentPoint){
		//var url = proxyUrl + _MapServiceInfo.serviceUrl + _MapServiceInfo.params + _MapServiceInfo.type + typeName
		var url = _MapServiceInfo.serviceUrl + _MapServiceInfo.params + _MapServiceInfo.type + typeName 
			+ "&bbox="+extentPoint[0]+","+extentPoint[1]+","+extentPoint[2]+","+extentPoint[3] + "&urlType=geoServer";
		
		
		return $.ajax({
			            url : url,
			            type : 'GET',
			            async: true,
			            contentType : 'application/json',
			            fauls: function(e){
			            	console.info(e)
			            }
			    	});
	};
	
//	
//	var ep1 = new proj4.Proj('EPSG:5179');
//	var ep2 = new proj4.Proj('EPSG:4326');
//	var p = new proj4.Point(obj.longitude,obj.latitude);
//	
//	// 미터좌표계변환
//	var trans = proj4.transform(ep2,ep1,p);
//	
//	//미터좌표계로 변환하여 feature를 만든다
//	var feature = new ol.Feature({geometry:new ol.geom.Point([trans.x,trans.y])});
//	// convert the OpenLayers geometry to a JSTS geometry
//	var jstsGeom = parser.read(feature.getGeometry());
//	// create a buffer of 40 meters around each line
//	var buffered = jstsGeom.buffer(distances*1000); // 미터단위  10km 10*1000
//	// convert back from JSTS and replace the geometry on the feature
//	feature.setGeometry(parser.write(buffered));
//	
//	//미터좌표계로 변환한 (5179)를 다시 3857로 변경해서 buffer 그리기
//	feature.getGeometry().transform('EPSG:5179', 'EPSG:3857');
//	
//	//버퍼 레이어 그리기
//	page.view.bufferLayer.getSource().addFeature(feature);
//	
//	// EQUALS, DISJOINT, INTERSECTS, TOUCHES, CROSSES,  WITHIN, CONTAINS, OVERLAPS, RELATE, DWITHIN, BEYOND.
//	var cqlFilter = "WITHIN(the_geom, POLYGON((";
//	for(var a = 0 ; a < feature.getGeometry().getCoordinates()[0].length ; a++){
//		if(a == feature.getGeometry().getCoordinates()[0].length-1 ){
//			cqlFilter += feature.getGeometry().getCoordinates()[0][a][0] +' '+feature.getGeometry().getCoordinates()[0][a][1] + ')))';
//		}else{
//			cqlFilter += feature.getGeometry().getCoordinates()[0][a][0] +' '+feature.getGeometry().getCoordinates()[0][a][1] + ',';	
//		}
//	}
//	
//	// 방제업체 extent로 공간검색
//	_MapService.getWfs(":PST_CMPNY" , "*" , cqlFilter).then(function(response) {
//		//그리드에 넣을 데이터
//		var results = [];
//		if(response.features.length > 0 ){
//		}
//	})
	
	
    // public functions
    return {
    	  
        init: function () {
        	var me = this;
        	return me;
        },
		
		getWfs: function(typeName, propertyName,cqlFilter, sortBy){
			var respose = getWfs(typeName, propertyName,cqlFilter,sortBy);
			return respose;
		},
		
		getRealPointWfs: function(typeName, propertyName,cneterPoint){
			var respose = getRealPointWfs(typeName, propertyName,cneterPoint);
			return respose;
		},
		
		getRealExtentWfs: function(typeName, propertyName, extentPoint){
			var respose = getRealExtentWfs(typeName, propertyName, extentPoint);
			return respose;
		}
    }; 
  
}();
