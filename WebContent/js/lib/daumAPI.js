var _DaumAPI = function () {
	
//	var daumSDKURL = 'https://developers.kakao.com/sdk/js/kakao.min.js';
	
	var apiURI = 'https://dapi.kakao.com/v2/local/search/{type}.json';
	
	var apiKey = 'f6fdc6003e04682bdd12a69b9407c2b3';
	
	var method = 'GET';
	
	var categoryGroupCode = {
								MT1:{code:'MT1',name:'대형마트'},
								CS2:{code:'CS2',name:'편의점'},
								PS3:{code:'PS3',name:'어린이집, 유치원 '},
								SC4:{code:'SC4',name:'학교'},
								AC5:{code:'AC5',name:'학원'},
								PK6:{code:'PK6',name:'주차장'},
								OL7:{code:'OL7',name:'주유소, 충전소'},
								SW8:{code:'SW8',name:'지하철역'},
								BK9:{code:'BK9',name:'은행'},
								CT1:{code:'CT1',name:'문화시설'},
								AG2:{code:'AG2',name:'중개업소'},
								PO3:{code:'PO3',name:'공공기관'},
								AT4:{code:'AT4',name:'관광명소'},
								AD5:{code:'AD5',name:'숙박'},
								FD6:{code:'FD6',name:'음식점'},
								CE7:{code:'CE7',name:'카페'},
								HP8:{code:'HP8',name:'병원'},
								PM9:{code:'PM9',name:'약국'}
							};
							
	var searchPlace = function(parameter){
		return $.ajax({
				  	url : apiURI.replace('{type}', 'keyword'),
				  	data:parameter,
				  	headers : { 'Authorization' : 'KakaoAK '+apiKey},
				  	type : method,
				  	contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				});
	}
	var searchRoad = function(parameter){
		return $.ajax({
				  	url : apiURI.replace('{type}', 'address'),
				  	data: parameter,
				  	headers : { 'Authorization' : 'KakaoAK '+apiKey},
				  	type : method,
				  	contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				});
	}
	var searchAll = function(parameter){
		return $.when(searchPlace(parameter), searchRoad(parameter));
	}
	
    // public functions
    return {
    	  
        init: function () {
//        	$.getScript( daumSDKURL, function( data, textStatus, jqxhr ) {
//        		if(console){
//        			console.log('Kakao is READY');
//        		}
//        	});
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
        searchAll: function(param){
        	if(param){
        		return searchAll(param);
        	}
        }
    
    }; 
}();
