var _CoreMap = function() {
	'use strict'
	// private functions & variables
	
	var TAG = '[WPCS MAP]';
	var vworldAddrUrl = 'http://apis.vworld.kr/coord2jibun.do?x=#X#&y=#Y#&apiKey=7A0635A7-67B9-39CD-96BC-65D901E709B3&domain=http://www.eburin.net&output=json&epsg=EPSG:4326&callback=?';
	var nhnAddrUrl = 'http://openapi.map.naver.com/api/reversegeocode?key=ed361f09f893f6489eed72ec266fa190&encoding=utf-8&coord=latlng&output=json&callback=?&query=#X#,#Y#';

	var DRAG_MODE_NONE = 'NONE';
	
	var TOOL_TYPE_DEFAULT = 0;
	var TOOL_TYPE_SATELLITE = 1;
	var TOOL_TYPE_DISTANCE = 2;
	var TOOL_TYPE_AREA = 3;
	var TOOL_TYPE_SAVE = 4;
	var TOOL_TYPE_PRINT = 5;
	var TOOL_TYPE_SEARCH = 6;
	var TOOL_TYPE_TEMP_INPUT = 7;
	var TOOL_TYPE_RESET = 8;
	var TOOL_TYPE_LAYER = 9;
	
	var coreMap;
	var mapLayers = [];

	var mapDiv;
	
	var format = 'image/png';
	
	var highlightFeature;

	var mapClickCallback;

	var mapHandleEndCallback

	var completeCallback;

	var featureInfoCallback;

	var featureDragTag = DRAG_MODE_NONE;
	
	var requestParams = false;

	var initParam = {
		worldProjection : 'EPSG:4326',
		targetProjection : 'EPSG:3857',
		layerBbox : [ 50119.84, 967246.47, 2176674.68, 12765761.31 ],
		resoutions : [ 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5 ],
		center : {
			centerPoint : [14228367.507436499, 4413084.05969204],
			lon : 127.81560,
			lat : 36.813077,
			zoom : 8
		}
	};

	// 측정관련
	var draw; 
	var sketch;
	var drawVectorLayer;
	var drawSource;
	var measureTextLayer;
	var helpTooltipElement;
	var helpTooltip;
	
	// 임의 지점 관련
	
	var tempBranchLayer;
	var tempBranchToolTip;
	var tempBranchTooltipElement;
	var TEMP_B_TEMP =  '<dl class="info_box" >'+
						    '<dt>&nbsp; ${TITLE}</dt>'+
						    '<dd>'+
						        '<dl class="summary">'+  
						        	'<dt>등록자</dt>'+
						           ' <dd class="L0">&nbsp; ${REG_ID}</dd>'+
						        '</dl>'+
						        '<dl class="summary">'+
						        	'<dt>등록일자</dt>'+
						            '<dd class="L0">&nbsp; ${REG_DATE}</dd>'+
						        '</dl>'+
						        '<dl class="summary">'+
						        	'<dt>상세정보</dt>'+
						            '<dd class="L0"><textarea rows="11" cols="25" readonly >${CONTENT}"  </textarea> </dd>'+
						        '</dl>'+
						    '</dd>'+ 
						'</dl>'; 
	
	var selectedTempBranchFeature;
	
	var isIE = false;
	
	var init = function(){
		var agent = navigator.userAgent.toLowerCase();

		if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
			isIE = true;
		}

		proj4.defs('EPSG:32652','+proj=utm +zone=52 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ');
		proj4.defs('EPSG:5179','+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs');
		
		ol.proj.proj4.register(proj4);
		
		if (ol.Map.prototype.getLayerForName === undefined) {
			ol.Map.prototype.getLayerForName = function(name) {
				var layer;
				this.getLayers().forEach(function(lyr) {
					if (name == lyr.get('name')) {
						layer = lyr;
					}
				});
				return layer;
			}
		};
		if(ol.Feature.prototype.getLayer === undefined) {
			ol.Feature.prototype.getLayer = function(map) {
			    var this_ = this, layer_, layersToLookFor = [];
			    /**
			     * Populates array layersToLookFor with only
			     * layers that have features
			     */
			    var check = function(layer){
			    	
			        var source = layer.getSource();
			        if(source instanceof ol.source.Vector){
			            var features = source.getFeatures();
			            if(features.length > 0){
			            	layersToLookFor.push({
			                	layer: layer,
			                    features: features
			                });
			            }
			        }
			    };
			    //loop through map layers
			    map.getLayers().forEach(function(layer){
			        if (layer instanceof ol.layer.Group) {
			            layer.getLayers().forEach(check);
			        } else {
						check(layer);
			        }
			    });
			    layersToLookFor.forEach(function(obj){
			    	var found = obj.features.some(function(feature){
			            return this_ === feature;
			        });
			        if(found){
			            //this is the layer we want
			            layer_ = obj.layer;
			        }
			    });
			    return layer_;
			};
		}
	}
	
	var createMap = function(mapDivId) {
		mapDiv = mapDivId;
		var layerInfos = [];
		mapLayers = [];
		//layerInfos.push({layerNm:'ri_shp',isVisible:false,isTiled:true,cql:null,opacity:0.7});
		
//		mapLayers[0] = new ol.layer.Tile({
//        	source: new ol.source.OSM({
//    			url:'http://tile.openstreetmap.org/{z}/{x}/{y}.png'}),        	
//        	projection: "EPSG:4626",
//            displayProjection: "EPSG:3857",
//            name:'osm'});
		 
		//기본지도 1
		mapLayers[0] = (_VWorldLayer.createVWorldBaseMapLayer({
			isVisible : true
		}));
		//위성맵 2 3
		mapLayers[1] = _VWorldLayer.createVWorldSatelliteMapLayer({
			isVisible : false
		});
		mapLayers[2] = _VWorldLayer.createVWorldHybridMapLayer({
			isVisible : false
		});
		//백지도
		mapLayers[3] = _VWorldLayer.createVWorldGrayMapLayer({
			isVisible : false
		}); 

		// 행정구역
//		layerInfos.push({layerNm:'GIS_SDO',isVisible:false,isTiled:true,cql:null,opacity:1});
//		layerInfos.push({layerNm:'GIS_SGG',isVisible:false,isTiled:true,cql:null,opacity:1});
//		layerInfos.push({layerNm:'GIS_BDONG',isVisible:false,isTiled:true,cql:null,opacity:0.2});
//		
		
//		mapLayers[4] = new ol.layer.Tile({
//			source: new ol.source.XYZ({
//				tileSize: 256,
//				url:'/Sample/tiles6/Mapnik/{z}/{x}/{y}.png',
//				projection:'EPSG:3857',
//				crossOrigin: 'Anonymous'
//			})
//		}); 
		
//		mapLayers[4] = new ol.layer.Tile({
//			source: new ol.source.XYZ({
//				tileSize: 256,
//				url:'/Sample/tiles10/Mapnik/{z}/{x}/{y}.png',
//				projection:'EPSG:3857',
//				crossOrigin: 'Anonymous'
//			}),
//			extent: [14188840,4348183, 14196279,4355325]
//		}); 
		
		var admnsDstrcLayers = createTileLayer(layerInfos);
		
		mapLayers = mapLayers.concat(admnsDstrcLayers);
		
		coreMap = new ol.Map({
			controls : ol.control.defaults({
				attribution : false,
				rotate : false,
				zoom : false,
				forEachLayerAtPixel:true
			}).extend([ new ol.interaction.DragRotate({
				condition : function(e) {
					return false;
				}
			}) ]),
			target : mapDiv,
			layers : mapLayers,
			view : new ol.View({
				enableRotation : false, // 모바일에서 투터치로 지도가 회전되는 것 막음
				rotation : 0,
				center : initParam.center.centerPoint,
				minZoom : 5,
				maxZoom : 19,
				zoom : initParam.center.zoom
			})
		});

		// map.getView().fit(bounds, map.getSize());

		//
		setMapEvent();
		
		setEventListener();
		
		// feature 클릭시 팝업을 띄우기 위한 초기화
	    setPopupOverlay();
		
	    $.getScript( './js/lib/zoomSlider.js', function( data, textStatus, jqxhr ) {
	    	_ZoomSlider.init({
				top : 90,
				right : 100,
				maxGrade: 19,
				minGrade : 5,
				preLevel : _CoreMap.getMap().getView().getZoom(),
				id : 'mapNavBar',
				mapDiv: 'map'
			});
    	});
		
	    var mapParent = $('#'+mapDiv).parent();
	    
	    $(window).on('resize', function(){
	    	
	    	var w = mapParent.width();
	    	var h = mapParent.height();
			
			$('#'+mapDiv).width(w);
			$('#'+mapDiv).height(h);
			
			var map = _CoreMap.getMap();
			if(map){
				map.setSize([w, h]);	
			}
	    });
	    
	    $(window).trigger('resize');
	    
		// VWORLD wms layer on/off check box 생성
		// setVworldWmsLayerCheckbox();
	    
	    //setTempBranchLayer();
	}
	
	var fillToValue = function(temp, val){
		
		if(temp == null){
			return '';
		}
		if(val == null){
			return temp;
		}
		
		for(var key in val){
			temp = temp.replaceAll('${'+key+'}', val[key]);
		}
		
		var j = 0;
		while(true){
			var i = temp.indexOf('${');
			if(i<0){
				break;
			}else{
				var nullField = temp.substring(i, temp.indexOf('}')+1);
				temp = temp.replaceAll(nullField, '');
			}
			j++;
			
			if(j > 20){
				console.log('[ERROD] Fill To Values');
				break;
			}
		}
		
		return temp;
	}

	var setTempBranchLayer = function(){
		
		drawTempBranchLayer();
		
		_MapEventBus.on(_MapEvents.map_mousemove, function(event, data){
			 var pixel = coreMap.getEventPixel(data.result.originalEvent);
			 
			 var feature = coreMap.forEachFeatureAtPixel(pixel, function(feature, layer) {
				 return feature;
			 });
			
			 if(feature && feature.getProperties().properties.featureType == 'TEMP'){
				 tempBranchTooltipElement.innerHTML =  fillToValue(TEMP_B_TEMP, feature.getProperties().properties);
				 tempBranchToolTip.setPosition( feature.getGeometry().getCoordinates() );
			 }else{
				 tempBranchToolTip.setPosition(undefined);
			 }
		}); 
		
		_MapEventBus.on(_MapEvents.map_singleclick, function(event, data){
			 var pixel = coreMap.getEventPixel(data.result.originalEvent);
			 
			 var feature = coreMap.forEachFeatureAtPixel(pixel, function(feature, layer) {
				 return feature;
			 });
			 
			 if(feature && feature.getProperties().properties.featureType == 'TEMP'){
				 selectedTempBranchFeature = feature.getProperties().properties;
				 window.open("/tempBRegPop.jsp?regId="+$('#userId').val()+"&type=1",'tempBRegPop','width=550,height=430,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,left=100,top=50');
			 }else{
				 
			 }
		});
		
		createTempBranchTooltip();
	}
	
	var drawTempBranchLayer = function(){
		$.ajax({
			url:'/psupport/jsps/getTempBranch.jsp',
			dataType:"text",
			success:function(result){
				var data = JSON.parse(result);
				var tempBranchFeatures = [];
				
				for(var i=0; i<data.length; i++){
					var tempCoord = ol.proj.transform([parseFloat(data[i].X), parseFloat(data[i].Y)], 'EPSG:4326', 'EPSG:3857');
					
					data[i].featureType = 'TEMP';
					
					var feature = new ol.Feature({geometry:new ol.geom.Point(tempCoord), properties: data[i]});
					tempBranchFeatures.push(feature);
				} 
				tempBranchLayer = new ol.layer.Vector({ 
						name : 'tempBranchLayer',
						source : new ol.source.Vector({
							features : tempBranchFeatures
						}),
						style : new ol.style.Style({
							image: new ol.style.Icon({
								opacity: 1,
								src: '/gis/new_images/message.png',
								anchor: [0.5, 1.0],
						        anchorXUnits: 'fraction',
						        anchorYUnits: 'fraction',
								crossOrigin: 'Anonymous'	
							})
						}) 
				});  

				coreMap.addLayer(tempBranchLayer);
			}, 
			error:function(result){  
			}
		});
	}
	var refreshTempBranchLayer = function(){
		if(tempBranchLayer){
			coreMap.removeLayer(tempBranchLayer);
		}
		drawTempBranchLayer();
	}
	
	var toolDefaults = { 
			satellite: true,
			measure:false,
			print:false,
			save:false,
			search:false,
			temp:false
	}
	
	var currentToolType = 0;
	
	var setTools = function(options){
		
		var settings = $.extend({}, toolDefaults, options);

		var toolNoneFlag = false;
		for(var key in settings){
			if(key == 'satellite'){
				continue;
			}
			
			if(settings[key]){
				toolNoneFlag = true;
				break;
			}
		}
		
		if(settings.satellite){
			var defaultMapHtml = '<ul class="mapst" style="top: 5px !important;">';
			
			if(toolNoneFlag){
				defaultMapHtml = '<ul class="mapst" style="top: 50px !important;">';
			}
			
			defaultMapHtml += '<li><a href="javascript:;" id="default" class="basic on">일반</a></li>';
			defaultMapHtml += '<li><a href="javascript:;" id="stellite" class="stellite">위성</a></li>';
			defaultMapHtml += '</ul>';
			
			$('#'+mapDiv).parent().append(defaultMapHtml); 
			
			$(".mapst> li> a").click(function () {
				var type = $(this).attr('id');
				if(type == 'default'){
					showDefautMap()
				}else{
					showAirMap()
				}
				$(".mapst> li> a").removeClass("on")
				$(this).addClass("on")
			});
		}
		
		if(toolNoneFlag){
			var tools = '<ul class="tooltip">';
			
			if(settings.measure){
				tools += '<li class="tools" type="2"><span class="tt01" ></span>거리측정</li>';
				tools += '<li class="tools" type="3"><span class="tt02" ></span>면적측정</li>';
			}
			
			if(settings.print){
				tools += '<li class="tools" type="5"><span class="tt03" ></span>인쇄</li>';
			}
			
			if(settings.save){
				tools += '<li class="tools" type="4"><span class="tt04" ></span>저장</li>';
			}
			if(settings.search){
				tools += '<li class="tools" type="6"><span class="tt05" ></span>장소검색</li>';
			}
			
			if(settings.temp){
				
				tools += '<li class="tools" type="7"><span class="tt06" ></span>지점등록</li>';
				
				setTempBranchLayer();
			}
			if(settings.measure){
				tools += '<li class="tools" type="8"><span class="tt07" ></span>초기화</li>';
			}
			
			if(settings.layers){
				tools += '<li class="tools" type="9"><span class="tt08"></span>기초시설물</li>';
			}
			
			
			tools += '</ul>'; 
			
			$('#'+mapDiv).parent().append(tools); 
		}
		
		$('.tools').hover(function(){
					$(this).addClass('on');
			  }, function(){
				  	var toolType = $(this).attr('type');
					if(currentToolType != toolType){
						$(this).removeClass('on');
					}
					
					if(currentToolType == TOOL_TYPE_SAVE || currentToolType == TOOL_TYPE_PRINT || currentToolType == TOOL_TYPE_SEARCH || currentToolType == TOOL_TYPE_LAYER){
						$(this).removeClass('on');
					}
			}); 
		
		$('.tools').on('click', function(event){
			var target = $(this);
			
			var toolType = target.attr('type');
			
			$('.tools').removeClass('on');
			
			if(toolType == TOOL_TYPE_DISTANCE){
				addInteraction(toolType);
				$(this).addClass('on');
			}else if(toolType == TOOL_TYPE_AREA){
				addInteraction(toolType);
				$(this).addClass('on');
			}else if(toolType == TOOL_TYPE_SAVE){
				if(draw){
					coreMap.removeInteraction(draw);
				}
				coreMap.once('postcompose', function(event) {
					var canvas = event.context.canvas;
					var mapImg = canvas.toDataURL('image/png'); 
					var url = mapImg.replace(/^data:image\/[^;]+/, '');
				
					var form = document.createElement("form");
					form.setAttribute("charset", "UTF-8");
					form.setAttribute("method", "Post");
					form.setAttribute("action", "./mapImageSave.jsp");
					
					var hiddenField = document.createElement("input");
					
					hiddenField.setAttribute("type", "hidden");
					hiddenField.setAttribute("name", "_imageData_");
					hiddenField.setAttribute("value", url);
					form.appendChild(hiddenField);
					
					hiddenField = document.createElement("input");
					hiddenField.setAttribute("type", "hidden");
					hiddenField.setAttribute("name", "_imageFileName_");
					hiddenField.setAttribute("value", 'mapImage');
					form.appendChild(hiddenField);
					document.body.appendChild(form);
					form.submit();

					document.body.removeChild(form);
					 
//					$('#__fileDownloadIframe__').remove(); 
//					$('body').append('<iframe src='+url+' id="__fileDownloadIframe__" name="__fileDownloadIframe__" width="0" height="0" style="display:none;"/>');
				}); 
				coreMap.renderSync();
			}else if(toolType == TOOL_TYPE_PRINT){
				if(draw){
					coreMap.removeInteraction(draw);
				}
				
				coreMap.once('postcompose', function(event) {
					var canvas = event.context.canvas;
					var mapImg = canvas.toDataURL('image/png'); 
					var popup = window.open('', 'newWindow', "width=1000,height=700");
					popup.focus(); //required for IE
					popup.document.write('<img src="'+mapImg+'" onload="window.print()">');
					if(isIE){
						popup.location.reload(true);	
					}
				}); 
				coreMap.renderSync();
			}else if(toolType == TOOL_TYPE_SEARCH){
				if(draw){
					coreMap.removeInteraction(draw);
				}
				window.open("/vworldSearchPop.jsp",'vworldSearchPop','width=750,height=410,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,left=100,top=50');
			}else if(toolType == TOOL_TYPE_TEMP_INPUT){
				
				if(draw){
					coreMap.removeInteraction(draw);
				}
				
				$(this).addClass('on');
				
				if(currentToolType == TOOL_TYPE_DISTANCE || currentToolType == TOOL_TYPE_AREA){
					clearMap();
				}
				alert('임시지점으로 등록할 곳을 지도에서 클릭하세요.');
				
				_MapEventBus.on(_MapEvents.map_singleclick, tempBranchInput);
				
			}else if(toolType == TOOL_TYPE_RESET){
				clearMap();
				currentToolType = -1;
			}else if(toolType == TOOL_TYPE_LAYER){
				showLayerDiv();
			}
			
			if(toolType != TOOL_TYPE_RESET){
				currentToolType = toolType;
			}
		});
	} 
	 
	var tempBranchInput = function(event, data){
		
		if(currentToolType == TOOL_TYPE_TEMP_INPUT){
			var tempCoord = ol.proj.transform([data.result.coordinate[0], data.result.coordinate[1]], 'EPSG:3857', 'EPSG:4326');
			window.open("/tempBRegPop.jsp?regId="+$('#userId').val()+"&type=0&X="+tempCoord[0]+"&Y="+tempCoord[1],'tempBRegPop','width=550,height=430,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,left=100,top=50');
		}
		
		$('.tools').removeClass('on'); 
		currentToolType = -1;
	}
	
	var clearMap = function(){
		if(draw){
			coreMap.removeInteraction(draw);
		}
		if(drawVectorLayer){
			coreMap.removeLayer(drawVectorLayer);	
		}
		if(measureTextLayer){
			coreMap.removeLayer(measureTextLayer);	
		}
		if(helpTooltip){
			helpTooltip.setPosition( undefined );
		}
		_MapEventBus.off(_MapEvents.map_pointermove, drawToolTip);
	} 
	
	// 거리 면적 관련
	var addInteraction = function (type) {
		
		if(draw){
			coreMap.removeInteraction(draw);
			coreMap.removeLayer(drawVectorLayer);
			coreMap.removeLayer(measureTextLayer);
		}
		
		drawSource = new ol.source.Vector();
		drawVectorLayer = new ol.layer.Vector({
			name:'drawVectorLayer',
			source: drawSource,
			zIndex: 9999,
			style: new ol.style.Style({ 
					fill: new ol.style.Fill({
						color: 'rgba(24, 51, 229, 0.2)'
					}),
					stroke: new ol.style.Stroke({
						color: 'rgb(24, 51, 229)',
						width: 2
					}),
					image: new ol.style.Circle({
						radius: 7,
						fill: new ol.style.Fill({
							color: 'rgb(24, 51, 229)'
						})
					})
				})
		});
//		 
		measureTextLayer   = new ol.layer.Vector({
			name:'measureTextLayer',
			opacity: 1.0, 
			visible: true,
			zIndex: 10000,
			source: new ol.source.Vector(),
			style: function (feature, resolution){
				return [new ol.style.Style({
					image : new ol.style.Circle({
						radius: 1,
						fill: new ol.style.Fill({
							color: '#ffcc33'
						})
					}),
					text : createTextStyle(feature, resolution)
				})]; 
			} 
		});
		 
		coreMap.addLayer(drawVectorLayer);
		coreMap.addLayer(measureTextLayer);
		
		var type = (type == 2 ? 'LineString' : 'Polygon');
		draw = new ol.interaction.Draw({
			source: drawSource,
			type: type
		});
		
		coreMap.addInteraction(draw);
		
		draw.on('drawstart', function(event) {
			sketch = event.feature;
			
		}, this);

		draw.on('drawend', function(event) {
			if (sketch) {
				var output;
				var geom = (sketch.getGeometry());
				var labelCoord ;
				
				if (geom instanceof ol.geom.Polygon) {
					var srcCoords = geom.getCoordinates()[0];
					var desCoords = [];
					
					for(var i=0; i<srcCoords.length; i++){
						desCoords.push(ol.proj.transform([srcCoords[i][0], srcCoords[i][1]], 'EPSG:3857', 'EPSG:5179'));
					}
					
					output = formatArea(new ol.geom.Polygon([desCoords]));
					
					labelCoord = srcCoords[srcCoords.length-2].slice(0);
					
				} else if (geom instanceof ol.geom.LineString) {
					var srcCoords = geom.getCoordinates();
					var desCoords = [];
					
					for(var i=0; i<srcCoords.length; i++){
						desCoords.push(ol.proj.transform([srcCoords[i][0], srcCoords[i][1]], 'EPSG:3857', 'EPSG:5179'));
					}
					output = formatLength(new ol.geom.LineString(desCoords));
					
					labelCoord = srcCoords[srcCoords.length-1].slice(0);
			    }
				
				var valueTextFeature = new ol.Feature({geometry:new ol.geom.Point(labelCoord), value:output});
				measureTextLayer.getSource().addFeature(valueTextFeature); 	
			}
			sketch = null;
		}, this); 
		_MapEventBus.on(_MapEvents.map_pointermove, drawToolTip);
		
		createHelpTooltip();
	}
	
	var drawToolTip = function(event, data){
		var interactions = coreMap.getInteractions();
		if(interactions){
			var helpMsg = '지도를 클릭하여 측정을 시작하세요.';
			
			if(sketch){
				helpMsg = '더블클릭하시면 종료됩니다.';
			}
			
	        helpTooltipElement.innerHTML = helpMsg;
	        helpTooltip.setPosition( data.result.coordinate );

	        helpTooltipElement.classList.remove('hidden');
		}
	}
	var createTextStyle = function(feature, resolution) {
		var align = 'center';
		var baseline = 'top';
		var size = '14px';
		var offsetX = 0;
		var offsetY = 10;
		var weight = 'bold';
		var placement = 'point';
		var maxAngle = undefined;
		var exceedLength = undefined;
		var rotation = 0.0;
		var font = weight + ' ' + size + ' Arial';
		var fillColor = '#000000';
		var outlineColor = '#ffffff';
		var outlineWidth = 3;

		return new ol.style.Text({
			textAlign : align == '' ? undefined : align,
			textBaseline : baseline,
			font : font,
			text : feature.get('value'),
			fill : new ol.style.Fill({
				color : fillColor
			}),
			stroke : new ol.style.Stroke({
				color : outlineColor,
				width : outlineWidth
			}),
			offsetX : offsetX,
			offsetY : offsetY,
			placement : placement,
			maxAngle : maxAngle,
			exceedLength : exceedLength,
			rotation : rotation
		});
	};
	
	function createTempBranchTooltip() {
		if (tempBranchTooltipElement) {
			tempBranchTooltipElement.parentNode.removeChild(tempBranchTooltipElement);
		}
		tempBranchTooltipElement = document.createElement('div');
		tempBranchTooltipElement.style.width = '294px';
		
		tempBranchToolTip = new ol.Overlay({
        	element: tempBranchTooltipElement,
        	offset: [0 , 0],
        	positioning: 'center-center'
        });
		tempBranchToolTip.setPosition(undefined);
		
		_MapEventBus.trigger(_MapEvents.map_addOverlay, tempBranchToolTip);
	}
	
	function createHelpTooltip() {
		if (helpTooltipElement) {
			helpTooltipElement.parentNode.removeChild(helpTooltipElement);
		}
		helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'tooltipOverlay hidden';
        helpTooltip = new ol.Overlay({
        	element: helpTooltipElement,
        	offset: [15, 0],
        	positioning: 'center-left'
        });
        coreMap.addOverlay(helpTooltip);
	}
	
	/**
	 * format length output
	 * @param {ol.geom.LineString} line
	 * @return {string}
	 */
	var formatLength = function(line) {
		var length = Math.round(line.getLength() * 100) / 100;
		var output;
		if (length > 100) {
			output = (Math.round(length / 1000 * 100) / 100) +' ' + 'km';
		} else {
			output = (Math.round(length * 100) / 100) +' ' + 'm';
		}
		return output;
	};


	/**
	 * format length output
	 * @param {ol.geom.Polygon} polygon
	 * @return {string}
	 */
	var formatArea = function(polygon) {
		var area = polygon.getArea();
		var output;
		if (area > 10000) {
			output = (Math.round(area / 1000000 * 100) / 100) +' ' + 'km2';
		} else {
			output = (Math.round(area * 100) / 100) +' ' + 'm2';
		}
		return output; 
	};
	var popupOverlay = "";
	
	var setPopupOverlay = function(){

		popupOverlay = new ol.Overlay({
		  element: document.getElementById('popupOverlay')
		});
		coreMap.addOverlay(popupOverlay);
	}

	var setEventListener = function(){
		_MapEventBus.on(_MapEvents.map_addLayer, addLayer);
		
		_MapEventBus.on(_MapEvents.map_removeLayer, removeLayer);
		
		_MapEventBus.on(_MapEvents.setZoom , setZoom);
		_MapEventBus.on(_MapEvents.map_move , mapMove);
		
		_MapEventBus.on(_MapEvents.map_removeLayerByName, removeLayerByName);
		
		_MapEventBus.on(_MapEvents.map_addOverlay, addOverlay);
		
		_MapEventBus.on(_MapEvents.map_removeOverlay, removeOverlay);
		
		
		
	};
	var setMapEvent = function() {

		//change:layerGroup (ol.ObjectEvent)
		coreMap.on('change:layerGroup', function(event) {
			event.preventDefault();

			_MapEventBus.trigger(_MapEvents.change_layerGroup, {
				result : event
			});
		});
		//change:size (ol.ObjectEvent)
		coreMap.on('change:size', function(event) {
			event.preventDefault();

			_MapEventBus.trigger(_MapEvents.change_size, {
				result : event
			});
		});
		//change:target (ol.ObjectEvent)
		coreMap.on('change:target', function(event) {
			event.preventDefault();

			_MapEventBus.trigger(_MapEvents.change_target, {
				result : event
			});
		});
		//change:view (ol.ObjectEvent)
		coreMap.on('change:view', function(event) {
			event.preventDefault();

			_MapEventBus.trigger(_MapEvents.change_view, {
				result : event
			});
		});
		//click (ol.MapBrowserEvent) - A click with no dragging. A double click will fire two of this.
		
		coreMap.on('click', function(event) {
			event.preventDefault();
			
			_MapEventBus.trigger(_MapEvents.map_clicked, {
				result : event
			});
		});
		
		//dblclick (ol.MapBrowserEvent) - A true double click, with no dragging.
		coreMap.on('dblclick', function(event) {
			event.preventDefault();

			_MapEventBus.trigger(_MapEvents.map_dblclick, {
				result : event
			});
		}); 
		//moveend (ol.MapEvent) - Triggered after the map is moved.
		coreMap.on('moveend', function(event) {
			event.preventDefault();

			_MapEventBus.trigger(_MapEvents.map_moveend, {
				result : event
			});
		});
		
		coreMap.on('loaded', function(event) {
			event.preventDefault();

			_MapEventBus.trigger(_MapEvents.map_loaded, {
				result : event
			});
		});
		// 벡터레이어로 올렸을때 feature select
		coreMap.on('singleclick', function(event) {
			event.preventDefault();
			
			_MapEventBus.trigger(_MapEvents.map_singleclick, {
				result : event
			});
		});
		
		//
		coreMap.on('pointermove', function(event) {
			event.preventDefault();

			_MapEventBus.trigger(_MapEvents.map_pointermove, {
				result : event
			});
		});
		
		$(coreMap.getViewport()).on('mousemove', function(event) {
			_MapEventBus.trigger(_MapEvents.map_mousemove, {
				result : event
			});
		});
	}
	var createTileLayer = function(layerInfos) {
		
		var layers = [];
		
		for(var i=0; i<layerInfos.length; i++){
			var layer = new ol.layer.Tile({
      			visible: layerInfos[i].isVisible,
      			opacity : layerInfos[i].opacity,
      			source: new ol.source.TileWMS({
      				url: _MapServiceInfo.serviceUrl+_MapServiceInfo.wmsBaseUrl,
      				params: {'FORMAT': format, 
	      				'VERSION': '1.3.0',
	      				tiled: layerInfos[i].isTiled,
	      				LAYERS: layerInfos[i].layerNm,
	      				STYLES: layerInfos[i].style,
	      				CQL_FILTER:layerInfos[i].cql,
	      				urlType: 'geoServer'
	      				},
      				serverType:'geoserver',
    				crossOrigin: 'Anonymous'
      			}), 
  				name: layerInfos[i].layerId,
  				zIndex: (layerInfos.zIndex ? layerInfos.zIndex: 1)
			});
			if(layer != null){
				layer.set('layerNm', layerInfos[i].layerNm);//,searchWfS:true
				layer.set('searchWfS', layerInfos[i].searchWfS);//,searchWfS:true
				layers.push(layer);
			}
		}
		return layers;
	};
	var mapMove = function(event, data){
		centerMap(data.x, data.y, data.zoom);
	}
	var centerMap = function(long, lat, zoomLavel) {
		var centerPoint;

		if (typeof (long) == 'string')
			long = parseFloat(long);

		if (typeof (lat) == 'string')
			lat = parseFloat(lat);

		if (long > 1000000 && lat > 400000)
			centerPoint = [ long, lat ];
		else {
			if (long < 110 && lat > 40) {
				var tmp = lat;
				lat = long;
				long = tmp;
			}
			centerPoint = ol.proj.transform([ long, lat ],
					initParam.worldProjection, initParam.targetProjection);
		}

		coreMap.getView().setCenter(centerPoint);
		if (zoomLavel != null){
			coreMap.getView().setZoom(zoomLavel);
		}
	}

	var addOverlay = function(event, overlay){
		if(overlay){
			coreMap.addOverlay(overlay);
		}
	}
	
	var removeOverlay = function(event, overlay){
		if(overlay){
			coreMap.removeOverlay(overlay);
		}
	}
	
	var addLayer = function(event, layer) {
		if (layer == null)
			return;
		if (coreMap == null)
			return;
		
		if(layer.name && coreMap.getLayerForName(layer.name) != null){
			return;
		}
		
		coreMap.addLayer(layer);
		mapLayers.push(layer);
	}
	var addVectorLayer = function(features) {

		if (features == null || features.length <= 0)
			return;
		if (coreMap == null)
			return;

		var vectorLayer = new ol.layer.Vector({
			source : new ol.source.Vector({
				features : features
			})
		});

		coreMap.addLayer(vectorLayer);
		mapLayers.push(vectorLayer);

		return vectorLayer;
	}
	var removeLayer = function(event, layer) {
		if (coreMap == null)
			return;
		coreMap.removeLayer(layer);
	}
	
	var removeLayerByName = function(event, layerNm) {
		if (coreMap == null)
			return;
		
		var layer = _CoreMap.getMap().getLayerForName(layerNm);

    	if(layer){
    		coreMap.removeLayer(layer);
    	}
	}
	// 배경맵 지우기
	var hideBaseMap = function() {
		for (var i = 1; i < 5; i++) {
			mapLayers[i].setVisible(false);
		}
	}
	
	// 기본지도
	var showDefautMap = function() {
		//if($('#defaultMap')[0].value == "1"){
		for (var i = 0 ; i < 4 ; i++) {
			mapLayers[i].setVisible((i == 0) ? true : false);
		}
	}
	// 항공지도
	var showAirMap = function() {
		for (var i = 0; i < 4; i++) {
			mapLayers[i].setVisible((i == 1 || i == 2) ? true : false);
		}
	}
	// 백지도
	var showGrayMap = function() {
		for (var i = 1; i < 4; i++) {
			mapLayers[i].setVisible(i == 3 ? true : false);
		}
	}
	
	// 행정경계 시도
	var showSidoLayer = function() {
		for (var i = 5; i < 8; i++) {
			mapLayers[i].setVisible(i == 5 ? true : false);
		}
	}
	
	// 행정경계 시군구
	var showSggLayer = function() {
		for (var i = 5; i < 8; i++) {
			mapLayers[i].setVisible(i == 6 ? true : false);
		}
	}
	
	// 행정경계 법정동
	var showDongLayer = function() {
		for (var i = 5; i < 8; i++) {
			mapLayers[i].setVisible(i == 7 ? true : false);
		}
	}
	
	
	var mapLayerVisible = function(visibleLayers){
		if(visibleLayers.length > 0){
			//mapLayers
			for(var i = 0 ; i < visibleLayers.length ; i++){
				mapLayers[visibleLayers[i]].setVisible(mapLayers[visibleLayers[i]].getVisible() == true ? false: true);
			}
		}else{
			mapLayers[visibleLayers].setVisible(mapLayers[visibleLayers].getVisible() == true ? false: true);
		}
		
	}
	
	// 좌표 -> 주소 변환
	var convertCoordToAddress = function(parameter) {
		// var url = vworldAddrUrl.replace('#X#', parameter.x).replace('#Y#',
		// parameter.y);

		var url = nhnAddrUrl.replace('#X#', parameter.x).replace('#Y#',
				parameter.y);
		//		
		$.getJSON(url, parameter.callback);
	}

	var getMapBounds = function(wkt) {
		var extent = coreMap.getView().calculateExtent(
				coreMap.getSize());
		return ol.proj.transformExtent(extent, 'EPSG:3857', wkt);
	}
	var convertLonLatCoord = function(coord, flag) {
		if (flag) {
			if (coord[0] > 1000000 && coord[1] > 400000)
				return coord;

			return ol.proj.transform(coord, initParam.worldProjection,
					initParam.targetProjection);
		} else
			return ol.proj.transform(coord, initParam.targetProjection,
					initParam.worldProjection);
	}
	
	var zoomToExtent = function(extent){
		
		coreMap.getView().fit(extent,coreMap.getSize());
		
	}
	
	var setZoom = function(event, level){
		coreMap.getView().setZoom(level);
	}
	
	var changeBaseMap = function(mapType){
		var mapTypeObj = {
				'Base':'defaultMaps',
				'Satellite':'airMaps',
				'Gray':'grayMaps'
		};

		for(var i = 0; i<mapLayers.length; i++){
			var baseMapType = mapTypeObj[mapLayers[i].getProperties().name]; 
			if(baseMapType){
				if(mapType == 'airMaps'){
					mapLayers[2].setVisible(true);
				}else{
					mapLayers[2].setVisible(false);
				}
				
				mapLayers[i].setVisible(baseMapType==mapType?true:false);
			}
		}
	}
	
	var getCoordinates = function(layer){
		return layer.getSource().getFeatures()[0].getGeometry().getCoordinates();
	};
	
	var requestParam = function(flag){
		//관리자 화면에서 x,y 좌표 넘겼을때
		requestParams = flag;
		
		if(flag){
			$('#checkPointEvent').css('display','none');
		}else{
			$('#checkPointEvent').css('display','');
		}
		
		
	};
	
	// public functions
	return {

		init : function(mapDivId, toolsOptions) {
			var me = this;
			init();
			createMap(mapDivId);
			setTools(toolsOptions);
			return me;
		},
		centerMap : function(long, lat, zoomLavel, type) {
			centerMap(long, lat, zoomLavel, type);
		},
		getMap : function() {
			return coreMap;
		},
		getZoom : function() {
			return coreMap.getView().getZoom(); 
		},
		addLayer : function(layer) {
			addLayer(null, layer);
		},
		addVectorLayer : function(features) {
			return addVectorLayer(features);
		},
		hideBaseMap : function() {
			hideBaseMap();
		},
		showDefautMap : function() {
			showDefautMap();
		},
		showAirMap : function() {
			showAirMap();
		},
		showGrayMap : function() {
			showGrayMap();
		},
		zoomToExtent : function(extent){
			zoomToExtent(extent);
		},
		showSidoLayer: function(){
			showSidoLayer();
		},
		showSggLayer: function(){
			showSggLayer();
		},
		showDongLayer: function(){
			showDongLayer();
		},
		createTileLayer: function(layerName){
			return createTileLayer(layerName);
		},
		
		mapLayerVisible: function(visibleLayers){
			mapLayerVisible(visibleLayers);
		},
		convertLonLatCoord: function(coord,flag){
			return convertLonLatCoord(coord,flag);
		},
		changeBaseMap:function(mapType){
			changeBaseMap(mapType);
		},
		getCoordinates : function(layer){
			return getCoordinates(layer);
		},
		requestParam:function(flag){
			requestParam(flag);
		},
		getSelectedTempBranchFeature:function(){
			return selectedTempBranchFeature;
		},
		refreshTempBranchLayer:function(){
			refreshTempBranchLayer();
		},
		getTempBranchToolTip: function(){
			return tempBranchToolTip;
		},
		getTempBranchTooltipElement: function(){
			return tempBranchTooltipElement;
		}
	};
}();
