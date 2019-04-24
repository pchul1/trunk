var _ZoomSlider = function () {
	
	var zoomOptions = {
			zoomPointerSize:11,
			plusMinusButtonSize:20,
			top : 70,
			right : 100,
			maxGrade: 19,
			minGrade : 5, 
			id : 'mapNavBar',
			mapDiv: 'map'
	};
	
	var init = function(options){
		zoomOptions.top = options.top;
		zoomOptions.right = options.right;
		zoomOptions.maxGrade = options.maxGrade;
		zoomOptions.minGrade = options.minGrade;
		zoomOptions.id = options.id;
		zoomOptions.preLevel = options.preLevel;
		
		var zoomDiv = '<div id="'+options.id+'"></div>';
		
		$('#'+options.mapDiv).parent().append(zoomDiv);
		
		var html = "<div class='zoomText'>" +
						"<div style='top:39px; background: url(./images/zoom.png) -216px 0px;'></div>" +
						"<div style='top:83px; background: url(./images/zoom.png) -245px 0px;'></div>" +
						"<div style='top:127px; background: url(./images/zoom.png) -274px 0px;'></div>" +
						"<div style='top:159px; background: url(./images/zoom.png) -303px 0px;'></div>" +
				   "</div>" +
				   "<div class='plus' style='cursor:pointer; position:absolute; top:0px; left:30px; width: 20px; height: 20px; background: url(./images/zoom.png) -80px 0px no-repeat;'></div>" +
	  			   "<div class='zoomBar' style='top:20px; left:31px; border: solid 1px; position: absolute; width: 16px; background: url(./images/zoom.png) -140px 0px repeat-y; transition: height 0.1s;'>" +
	  					"<div class='zoomPointer' style='cursor: pointer; z-index:100; left: -1px; overflow: hidden; position: absolute; width: 18px; height: 11px; background: url(./images/zoom.png) -157px 0px;'></div>" +
	  					"<div class='zoomBar2' style=' position: absolute; width: 16px; height: 11px; background: url(./images/zoom.png) -122px 0px repeat-y;'></div>" +
	  					"<div class='zoomPart'></div>" +
	  			   "</div>" +
				   "<div class='minus' style='cursor:pointer; top:141px; left:30px; position: absolute; width: 20px; height: 20px; background: url(./images/zoom.png) -100px 0px no-repeat;'></div>";
		
		$('#'+options.id).css('position','absolute');
		$('#'+options.id).css('z-index','100');
		$('#'+options.id).css('top',options.top + 'px');
		$('#'+options.id).css('right',options.right + 'px');
		$('#'+options.id).html(html);
		
		var zoomHeight = setHeightZoom();
		var zoomPointerTop = setZoomPointerTop(zoomHeight);
		var minusButtonHeight = $('.minus').height();
		
		$('#'+options.id).find('.zoomBar').css('height',zoomHeight);
		$('#'+options.id).find('.minus').css('top',zoomHeight + minusButtonHeight);
		$('#'+options.id).find('.zoomPointer').css('top',zoomPointerTop);
		$('#'+options.id).find('.zoomBar2').css('top',zoomPointerTop);
		$('#'+options.id).find('.zoomBar2').css('height',zoomHeight - zoomPointerTop);
		
		var zoomPartTop = zoomOptions.zoomPointerSize / 2;
		for(var i = 0; i < zoomHeight/zoomOptions.zoomPointerSize; i++){
			
			var top = zoomPartTop;
			
			if(i!=0){
				top = zoomPartTop + (zoomOptions.zoomPointerSize * i);
			}
			
			var divTag = '<div style="position:absolute; top:' + top + 'px; left:5px;"></div>'; 
			$('.zoomPart').append(divTag);
		}
		
		
		$('.plus, .minus').click(function(){
			var className = this.className;
			setZoomToGaze(className);
		});
		
		var zoomPointerLevel;
		var zoomPointerTop2;
		
		$( '.zoomPointer').draggable({ axis: "y",
			drag: function(event, location) {
		        if(location.position.top < 0){
		        	location.position.top = 0;
		        	return;
		        }
		        if(location.position.top > zoomHeight){
		        	location.position.top = zoomHeight - zoomOptions.zoomPointerSize;
		        	return;
		        }
		        var zoomPointerTop = location.position.top;
		    	  var zoomLevel = parseInt(location.position.top/zoomOptions.zoomPointerSize);
		    	  var zoomL = location.position.top%zoomOptions.zoomPointerSize;
		    	  if(zoomL>6){
		    		  zoomLevel++;
		    	  }
		    	  zoomPointerLevel = zoomLevel;
		    	  
		    	  zoomPointerTop2 = zoomLevel * zoomOptions.zoomPointerSize;
		    	  location.position.top =  zoomPointerTop2;
		    	  $('.zoomBar2').css('top',zoomPointerTop2);
		  		  $('.zoomBar2').css('height',zoomHeight - zoomPointerTop2);
		      },
		      stop: function(event, location) {
		    	  var level = zoomOptions.maxGrade - (zoomPointerTop2 / zoomOptions.zoomPointerSize);
		    	  _CoreMap.getMap().getView().setZoom(level);
		      }
		});
		
		$('.zoomPart').find('div').on('click', function(event){
			var top = parseFloat(this.style.top.split('px')[0]);
			var	zoomTop = top + (zoomOptions.zoomPointerSize / 2) - zoomOptions.zoomPointerSize;
			var level = zoomOptions.maxGrade - (zoomTop / zoomOptions.zoomPointerSize)
			_CoreMap.getMap().getView().setZoom(level);
		});
		
		
		_MapEventBus.on(_MapEvents.map_moveend, function(mapChangeType){
			_ZoomSlider.setLevelToGaze(_CoreMap.getMap().getView().getZoom());
		});
	};
	
	var setLevelToGaze = function(level){
		var calcValue = (zoomOptions.maxGrade - level) * zoomOptions.zoomPointerSize;
		var zoomHeight = setHeightZoom();
		
		$('.zoomPointer').css('top',calcValue);
		$('.zoomBar2').css('top',calcValue);
		$('.zoomBar2').css('height',zoomHeight - calcValue);
	};
	
	var setZoomToGaze = function(flag){
		var preTop = $('#mapNavBar').find('.zoomPointer')[0].offsetTop;
		var zoomPointerSize = zoomOptions.zoomPointerSize;
		var zoomHeight = setHeightZoom();
		var plusMinusButtonSize = zoomOptions.plusMinusButtonSize;
		
		var calcValue = 0;
		var gazeHeight = 0;
		
		if(flag=='minus' && preTop < zoomHeight - plusMinusButtonSize){
			calcValue = preTop + zoomPointerSize;
		}else if(flag=='plus' && preTop >= zoomPointerSize){
			calcValue = preTop - zoomPointerSize;
		}else{
			return;
		}
				
		var level = zoomOptions.maxGrade - (calcValue / zoomPointerSize);
		
		_CoreMap.getMap().getView().setZoom(level);
	};
	
	var setZoomPointerTop = function(zoomHeight){
		var maxValue = zoomOptions.maxGrade;
		var preLevel = zoomOptions.preLevel;
		var calcValue = (maxValue - preLevel) * zoomOptions.zoomPointerSize;
		 
		return calcValue;
	};
	
	var setHeightZoom = function(){
		var maxValue = zoomOptions.maxGrade;
		var minValue = zoomOptions.minGrade;
		
		var zoomHeight = (zoomOptions.maxGrade - zoomOptions.minGrade + 1) * zoomOptions.zoomPointerSize; 
		
		return zoomHeight;
	};
	
    return {
        init: function (options) {
        	init(options);
        },
        setLevelToGaze: function(level){
        	setLevelToGaze(level);
        }
    }; 
  
}();
