/**
 * 공통적으로 사용 될 수 있는 기능들을 정의 한다.
 * 
 * @author
 * 
 * <pre>
 * 작성자: C.PARK
 * </pre>
 * 
 */

var Req = {};
Req.url = '';
Req.callback = '';
Req.param = {};
var Param = {};
var Intent = {};

/**
 */
var SCTXT = '/';

var Common = _Common = new function() {
	this.debugUUID = '50479dae5c629e65';
	this.serverurl = 'http://localhost/';

	this.isDummy = false;
	this.isDebug = false;

	this.layout_callback = undefined;

	this.refresh_callback = undefined;

	this.longtouch_delay = '800';

	this.agent = navigator.userAgent.toLowerCase();

	this.COMMON_PARAM = {};
	this.sysinfoFlag = false;
	this.logintype = '';
	
	this.getData = function (options) {
        return $.ajax({
            url: options.url,
            data:  JSON.stringify(options.params),
            type: 'POST',
            contentType: options.contentType
        })
    };
    
	this.post = function(url, accept_type, param, successCallback, failCallback) {
		if (param == null)
			param = {};
		return $.ajax({
			url : serverUrl + url,
			type : 'POST',
			data : param,
			dataType : accept_type,
			cache : false,
			headers : {
				'cache-control' : "no-cache"
			},
			success : successCallback,
			error : failCallback
		});
	};

	this.get = function(url, accept_type, param, successCallback, failCallback) {
		if (param == null)
			param = {};
		return $.ajax({
			url : serverUrl + url,
			data : param,
			dataType : accept_type,
			cache : false,
			headers : {
				'cache-control' : "no-cache"
			},
			success : successCallback,
			error : failCallback
		});
	};

	this.getParam = function() {
		var params = {};
		if (location.search) {
			var parts = location.search.substring(1).split('&');
			for (var i = 0; i < parts.length; i++) {
				var nv = parts[i].split('=');
				if (!nv[0])
					continue;
				params[nv[0]] = decodeURIComponent(nv[1]) || true;
			}
		} else {
			params = $.mobile.intent;
		}

		return params;
	};

	this.loding = function(type, ele) {
		Common.log('loding', 'show#################');

	};
	this.loadingLock = function(event) {
		var win = $(window);
		var h = win.height();
		var t = win.scrollTop();
		var loDiv = $('#LOADING');
		loDiv.find('img').css('top', h / 2 + t);
		loDiv.find('p').css('top', h / 2 + t);
	};
	this.lodingEnded = function(type) {
		Common.log('loding', 'hide#################');
	};

	this.getCode = function(data) {
		return data.code;
	};

	this.getResultData = function(data) {
		return data.result;
	};
	
	this.round = function(val, precision) {
		val = val * Math.pow(10, precision);
		val = Math.round(val);
		var result = val / Math.pow(10, precision);
		return result.format();
	};

	// 네이티브나 웹에 로그를 보여준다.
	this.log = function(msg, tag) {
		console.log(tag, msg);

		return;
		if (msg != undefined && tag != undefined) {
			Common.log(tag, msg);
			return;
		}
		try {
			if (typeof (msg) == 'string') {
				// $MSGPIPE.wn_log(msg);
			} else {

			}
			// $MSGPIPE.wn_log(JSON.stringify(msg));
		} catch (e) {
			console.log(msg);
		}
	};

	this.scrollTop = function() {
		window.scrollTo(0, 0);
	}

	// 함수에 배열값을 인자로 넘기면 배열에 값이 한개면 타입이 Object 로 변경 되는 경우가 있음
	this.checkObj = function(data) {
		var list = [];
		if (typeof (data) === "object" && data.length === undefined) {
			list.push(data);
		} else {
			list = data;
		}
		return list;
	};
	// 좀더 쉽게 select 하기 위한 함수
	this.selByIdx = function(id, idx) {
		$("#" + id + " option:eq(" + idx + ")").attr("selected", "selected");
	};
	// 좀더 쉽게 select 하기 위한 함수
	this.selByVal = function(id, value) {
		$("#" + id).val(value);
	};
	this.valByIdx = function(id) {
		return $("#" + id + " option:selected").val();
	};

	this.idxById = function(id) {
		return $("#" + id + " option").index($("#" + id + " option:selected"));
	};

	this.sleep = function(msecs) {
		var start = new Date().getTime();
		var cur = start;
		while (cur - start < msecs) {
			cur = new Date().getTime();
		}
	};

	this.checkDefaul = function(value) {
		if (value == undefined || value == null || value == "null"
				|| value == "0")
			return "";
		else
			return value;
	};
	// 날짜 구하는 함수 to = -1 = 하루전
	this.getDayTo = function(to, delimitter) {
		var date = new Date();
		if (to != undefined)
			date
					.setFullYear(date.getFullYear(), date.getMonth()
							- parseInt(to));

		var y = date.getFullYear();
		var m = (date.getMonth() + 1);
		var d = date.getDate();
		if (m < 10)
			m = "0" + m;

		if (d < 10)
			d = "0" + d;
		if (delimitter != null) {
			return y + delimitter + m + delimitter + d;
		} else {
			return y + "" + m + "" + d;
		}

	};
	// 날짜 구하는 함수 to = -1 = 한달전
	this.getMonthTo = function(to, delimitter) {
		var date = new Date();

		if (to != undefined) {
			date.setMonth(date.getMonth() + parseInt(to));
		}

		var y = date.getFullYear();
		var m = (date.getMonth() + 1);
		var d = date.getDate();
		if (m < 10)
			m = "0" + m;

		if (d < 10)
			d = "0" + d;
		if (delimitter != null) {
			return y + delimitter + m + delimitter + d;
		} else {
			return y + "" + m + "" + d;
		}

	};

	this.setData = function(cname, cvalue) {
		var storage = window.localStorage;
		storage.setItem(cname, cvalue);
	};

	this.getLocalStorageData = function(cname) {
		var data = undefined;
		var storage = window.localStorage;
		if (storage.getItem(cname) != null) {
			data = JSON.parse(storage.getItem(cname));
		} else {
			data = {};
		}
		return data;
	};

	this.removeData = function(cname) {
		var storage = window.localStorage;
		storage.removeItem(cname);
	};

	this.tempScroll = undefined;
	this.scrollX = 0;
	this.scrollY = 0;

	// 스트링 자르기
	this.titleSubString = function(str, size) {
		str = str == null ? "" : str;
		if (str.length > size) {
			str = str.substring(0, size) + "...";
		} else {
			str = str.substring(0, size);
		}
		return str;
	};

	// 현재 년월일시분초 리턴
	this.getToday = function() {
		var today = new Date().getFullYear()
				+ ''
				+ ((new Date().getMonth() + 1) < 10 ? ('0' + (new Date()
						.getMonth() + 1)) : (new Date().getMonth() + 1))
				+ ''
				+ ((new Date().getDate()) < 10 ? ('0' + (new Date().getDate()))
						: (new Date().getDate()))
				+ ''
				+ ((new Date().getHours()) < 10 ? ('0' + (new Date().getHours()))
						: (new Date().getHours()))
				+ ''
				+ ((new Date().getMinutes()) < 10 ? ('0' + (new Date()
						.getMinutes())) : (new Date().getMinutes()))
				+ ''
				+ ((new Date().getSeconds()) < 10 ? ('0' + (new Date()
						.getSeconds())) : (new Date().getSeconds()));
		return today;
	};
	this.remark = function(val) {
		var remark = val.split('@');
		var result = remark[0].substring(0, remark[0].length - 3) + '***@'
				+ remark[1];
		return result;
	}
	this.chkEmail = function(val) {
		var myRe = /^([/\w/g\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
		return myRe.test(val);
	};
};

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, '');
};

String.prototype.comma = function() {
	var reg = /(^[+-]?\d+)(\d{3})/;
	var re = this.toString();

	re = re.replace(',', '');

	if (re == "")
		re = '0';
	while (reg.test(re)) {
		re = re.replace(reg, '$1' + ',' + '$2');
	}
	return re;
};

/**
 * 문자열의 바이트수 리턴
 * @returns {Number}
 */
String.prototype.byteLength = function() {
    var l= 0;
     
    for(var idx=0; idx < this.length; idx++) {
        var c = escape(this.charAt(idx));
         
        if( c.length==1 ) l ++;
        else if( c.indexOf("%u")!=-1 ) l += 2;
        else if( c.indexOf("%")!=-1 ) l += c.length/3;
    }
     
    return l;
};

// 숫자 타입에서 쓸 수 있도록 format() 함수 추가
Number.prototype.format = function() {
	if (this == 0)
		return 0;
	var reg = /(^[+-]?\d+)(\d{3})/;
	var n = (this + '');
	while (reg.test(n))
		n = n.replace(reg, '$1' + ',' + '$2');
	return n;
};

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.format = function() {
	var re = this.toString();
	re = re.replace(',', '');
	var num = parseFloat(re);
	if (isNaN(num))
		return '0';
	return num.format();
};

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.dateForamt = function(format) {
	var date = this.toString();
	if (date.length < 8)
		return date;

	if (format == undefined)
		format = "yyyy.MM.dd";

	var d = date.replace(/\.|\-|\ |\:|/gi, "");

	return format.replace(/(yyyy|yy|MM|dd|hh|mm|ss|\/p)/gi, function($1) {

		switch ($1) {
		case "yyyy":
			return d.substring(0, 4);
		case "yy":
			return d.substring(2, 4);
		case "MM":
			return d.substring(4, 6);
		case "dd":
			return d.substring(6, 8);
		case "hh":
			return d.substring(8, 10);
		case "mm":
			return d.substring(10, 12);
		case "ss":
			return d.substring(12, 14);
		default:
			return $1;
		}
	});
};

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.dateForamt2 = function(format) {
	var date = this.toString();
	if (date.length < 8)
		return date;

	if (format == undefined)
		format = "yyyy.MM.dd hh";

	var d = date.replace(/\.|\-|\ |\:|/gi, "");

	return format.replace(/(yyyy|yy|MM|dd|hh|mm|ss|\/p)/gi, function($1) {

		switch ($1) {
		case "yyyy":
			return d.substring(0, 4);
		case "yy":
			return d.substring(2, 4);
		case "MM":
			return d.substring(4, 6);
		case "dd":
			return d.substring(6, 8);
		case "hh":
			return d.substring(8, 10);
		case "mm":
			return d.substring(10, 12);
		case "ss":
			return d.substring(12, 14);
		default:
			return $1;
		}
	});
};
