var _VWorldAPI = function () {
	var apiURI = 'https://api.vworld.kr/req/search';
	
	var apiKey = '767B7ADF-10BA-3D86-AB7E-02816B5B92E9';
	
	var dataType = 'jsonp';
	
	var method = 'GET';
	
	var defaultParam = {
			service:'search',
			request:'search',
			version:2.0,
			size:100,
			page:1,
			format:'json',
			errorformat:'json',
			key : apiKey
		};
	var searchPlace = function(parameter){
		parameter.type = 'place';
		var params =  $.extend({}, defaultParam, parameter);
		
		return $.ajax({
					type : method,
					url : apiURI,
					data : params,
					dataType : dataType
				});
	}
	var searchRoad = function(parameter){
		parameter.type = 'address';
		parameter.category = 'road';
		var params =  $.extend({}, defaultParam, parameter);
		
		return $.ajax({
					type : method,
					url : apiURI,
					data : params,
					dataType : dataType
				});
	}
	var searchParcel = function(parameter){
		parameter.type = 'address';
		parameter.category = 'parcel';
		var params =  $.extend({}, defaultParam, parameter);
		
		return $.ajax({
					type : method,
					url : apiURI,
					data : params,
					dataType : dataType
				});
	}
	var searchAll = function(parameter){
		return $.when(searchPlace(parameter), searchRoad(parameter), searchParcel(parameter));
	}
	
    // public functions
    return {
    	  
        init: function () {
        	var me = this;
        	return me;
        },
        searchPlace: function(param){
        	if(param){
        		return searchPlace(param);
        	}
        },
        searchRoad: function(param){
        	if(param){
        		return searchRoad(param);
        	}
        },
        searchParcel: function(param){
        	if(param){
        		return searchParcel(param);
        	}
        },
        searchAll: function(param){
        	if(param){
        		return searchAll(param);
        	}
        }
    
    }; 
}();
