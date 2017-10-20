/**
 * Created by rihongo on 2017-08-25.
 */
var ExcelParse = function(){
	this.validFileExtensions = [".xlsx", ".xls", ".csv"];
	this.rABS = false; // T : 바이너리, F : 어레이 버퍼
	this.init();
	var $this = this;
	$this.addEventListener();
}

ExcelParse.prototype = (function(){
	return{
		constructor: ExcelParse,
		init:function(){
		},
		destroy: function(){
			this.dispose();
		},
		addEventListener: function(){
			$this = this;
		},
		dispose: function(){
			var object = this;
			var objectPrototype = object.__proto__;
			for( var key in object ){
				if( object.hasOwnProperty(key) ){
					delete object[key];
				}
			}
			delete this.prototype;

			return;

			for( var key in objectPrototype ){
				if( objectPrototype.hasOwnProperty(key) ){
					delete objectPrototype[key];
				}
			}
		},
		// 어레이 버퍼를 처리한다 ( 오직 readAsArrayBuffer 데이터만 가능하다 )
		fixdata : function(data){
			var o = "", l = 0, w = 10240;
			for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint8Array(data.slice(l*w,l*w+w)));
			o+=String.fromCharCode.apply(null, new Uint8Array(data.slice(l*w)));
			return o;
		},
		// 데이터를 바이너리 스트링으로 얻는다.
		getConvertDataToBin : function(){
			var arraybuffer = $data;
			var data = new Uint8Array(arraybuffer);
			var arr = new Array();
			for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
			var bstr = arr.join("");

			return bstr;
		},
		handleFile : function(e){
			var files = e.target.files;
			var i,f;
			for (i = 0; i != files.length; ++i) {
				f = files[i];
				if ($this.validate(f) == false ) return false;
				var reader = new FileReader();
				var name = f.name;

				reader.onload = function(e) {
					var data = e.target.result;
					var workbook;
					if( $this.rABS) {
						/* if binary string, read with type 'binary' */
						workbook = XLSX.read(data, {type: 'binary'});
					} else {
						/* if array buffer, convert to base64 */
						var arr = $this.fixdata(data);
						workbook = XLSX.read(btoa(arr), {type: 'base64'});
					}

					var range = "A1:C" + ROWCOUNT.toString();
					workbook.SheetNames.forEach(function(item, index, array) {
						//var csv = XLSX.utils.sheet_to_csv(workbook.Sheets[item]);
						//var html = XLSX.utils.sheet_to_html(workbook.Sheets[item]);
						var json = XLSX.utils.sheet_to_json(workbook.Sheets[item], {header:1,range:range});
						//var formulae = XLSX.utils.sheet_to_formulae(workbook.Sheets[item]);
						//console.log(csv);
						//console.log(html);
						//console.log(json);
						if(json.length > ROWCOUNT) {
							alert( ROWCOUNT + '건이 넘는 파일은 불러올 수 없습니다.');
							return;
						} else {
							dataSet(json);
						}

					});
				};

				if($this.rABS) 	reader.readAsBinaryString(f);
				else reader.readAsArrayBuffer(f);

			}
		},
		validate: function(oInput){
			var _validFileExtensions = $this.validFileExtensions || [".xlsx", ".xls", ".xlt", ".", ".csv"];
			var sFileName = oInput.name;
			if (sFileName.length > 0) {
				var blnValid = false;
				for (var j = 0; j < _validFileExtensions.length; j++) {
					var sCurExtension = _validFileExtensions[j];
					if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
						blnValid = true;
						break;
					}
				}

				if (!blnValid) {
					alert(sFileName + " 는 유효하지않은 파일입니다.\n\n업로드는 다음형식을 지원합니다 : " + _validFileExtensions.join(", "));
					return false;
				}
			}
			return true;
		},

	};
})();
