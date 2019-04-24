var _VWorldLayer = function () {
    // private functions & variables
	var vworldVers = {
		Base : 'service',
		Hybrid : 'service',
		Satellite : 'service',
		Gray : 'service',
		Midnight : 'service'
	};
	var vworldApikey = '800B84A7-9EE6-36F3-AE0D-5CDA5D13391C';
	
	var vworldBaseUrl = 'http://xdworld.vworld.kr:8080/2d';
	var vwBaseMapUrl = vworldBaseUrl+'/Base/'+vworldVers.Base+'/{z}/{x}/{y}.png';
	var vwHybridMapUrl = vworldBaseUrl+'/Hybrid/'+vworldVers.Hybrid+'/{z}/{x}/{y}.png';
	var vwRasterMapUrl = vworldBaseUrl+'/Satellite/'+vworldVers.Satellite+'/{z}/{x}/{y}.jpeg';
	var vwGrayMapUrl = vworldBaseUrl+'/gray/'+vworldVers.Base+'/{z}/{x}/{y}.png';
	
	var wmsMapUrl = "http://api.vworld.kr/req/wms?" //?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=#LAYERS#&STYLES=#STYLES#&CRS=EPSG:3857&BBOX=14133818.022824,4520485.8511757,14134123.770937,4520791.5992888&WIDTH=256&HEIGHT=256&FORMAT=image/png&TRANSPARENT=false&BGCOLOR=0xFFFFFF&EXCEPTIONS=text/xml&KEY=F82302E4-354D-347C-BE58-27834522351F&DOMAIN=localhost"
	
	var _bbox = [50119.84,967246.47,2176674.68,12765761.31];
	var tileSizes = 256; 
	
	var initParam = {
		worldProjection:'EPSG:4326',
		targetProjection:'EPSG:3857',
		layerBbox:_bbox,
		resoutions:[2048,1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5],
		center :{
			lon:127.0396037,
			lat: 37.5010226,
			zoom:12
		}
	};
	
	var createVWorldBaseMapLayer = function(options){
		if(options == null){
			options = {isVisible:false,
					name:'Base',
					group:'BaseMap'};
		}
		return new ol.layer.Tile({
			preload: Infinity,
			source: new ol.source.XYZ({ 
				tileSize: tileSizes,
				url:vwBaseMapUrl,
				projection:initParam.targetProjection,
				crossOrigin: 'Anonymous'
			}),
			extend:_bbox,
			name: options.name != null ? options.name:'Base',
			group:options.group != null ? options.group:'BaseMap',
			visible:options.isVisible != null ? options.isVisible:false
		});
	};
	
	var createVWorldHybridMapLayer = function(options){
		if(options == null){
			options = {isVisible:false,
					name:'Hybrid',
					group:'Hybrid'};
		}
		return new ol.layer.Tile({
			source: new ol.source.XYZ({
				tileSize: tileSizes,
				url:vwHybridMapUrl,
				projection:initParam.targetProjection,
				crossOrigin: 'Anonymous'
			}),
			extend:_bbox,
			name: options.name != null ? options.name:'Hybrid',
			group:options.group != null ? options.group:'SatelliteMap',
			visible:options.isVisible != null ? options.isVisible:false
		});
	}
	var createVWorldSatelliteMapLayer = function(options){
		if(options == null){
			options = {isVisible:false,
					name:'Satellite',
					group:'Satellite'};
		}
		return new ol.layer.Tile({
			source: new ol.source.XYZ({
				tileSize: tileSizes,
				url:vwRasterMapUrl,
				projection:initParam.targetProjection,
				crossOrigin: 'Anonymous'
			}),
			extend:_bbox,
			name: options.name != null ? options.name:'Satellite',
			group:options.group != null ? options.group:'SatelliteMap',
			visible:options.isVisible != null ? options.isVisible:false
		});
	}
	var createVWorldGrayMapLayer = function(options){
		if(options == null){
			options = {isVisible:false,
					name:'Gray',
					group:'Gray'};
		}
		return new ol.layer.Tile({
			source: new ol.source.XYZ({
				tileSize: tileSizes,
				url:vwGrayMapUrl,
				projection:initParam.targetProjection,
				crossOrigin: 'Anonymous'
			}),
			extend:_bbox,
			name: options.name != null ? options.name:'Gray',
			group:options.group != null ? options.group:'GrayMap',
			visible:options.isVisible != null ? options.isVisible:false
		});
	} 
	var setVworldWMSLegendImg = function(options){
		var lengendUrl = 'http://api.vworld.kr/req/image?key='+vworldApikey+'&service=image&request=GetLegendGraphic&format=png&layer='+options.layerNm+'&style='+options.style+'&type=ALL';
		$('#'+options.imgId).prop('src', lengendUrl);
	}
	var createVWroldWMSTileMapLayer = function(options) {
//		var wmsUrl = wmsMapUrl.replace('#LAYERS#', options.layers);
//		wmsUrl = wmsUrl.replace('#STYLES#', options.layers);
//		
		var layer = new ol.layer.Tile({
  			visible: options.isVisible,
  			opacity : options.opacity,
  			source: new ol.source.TileWMS({
  				url: wmsMapUrl,
				params: {
					FORMAT: 'image/png', 
					SERVICE:'WMS',
      				VERSION: '1.3.0',
      				LAYERS: options.layers,
      				STYLES: options.layers,
      				KEY: vworldApikey,
      				TRANSPARENT:true,
      				DOMAIN:'http://10.101.153.139'
      				}
//  				crossOrigin: 'anonymous' // 크롬에서 request cancel 이 발생하여 주석처리
  			}),
			name: options.layerId
		});
		return layer;
	};
    // public functions
    return {
    	  
        init: function () {
        	var me = this;
        	return me;
        },
        createVWorldBaseMapLayer:function(options){
        	return createVWorldBaseMapLayer(options);
        },
        createVWorldHybridMapLayer:function(options){
        	return createVWorldHybridMapLayer(options);
        },
        createVWorldSatelliteMapLayer:function(options){
        	return createVWorldSatelliteMapLayer(options);
        },
        createVWorldGrayMapLayer:function(options){
        	return createVWorldGrayMapLayer(options);
        },
        createVWroldWMSTileMapLayer:function(options){
        	return createVWroldWMSTileMapLayer(options);
        },
        setVworldWMSLegendImg: function(options){
        	setVworldWMSLegendImg(options);
        }
    }; 
  
}();
