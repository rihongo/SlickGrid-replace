/**
 * Created by rihongo on 2017-08-23.
 */

var ROWCOUNT = 500;

var columns = [
	{
		id: "selector",
		name: "",
		field: "num",
		width: 50
	},
	{
		id: "name",
		name: "이름",
		field: "name",
		width: 70,
		editor: Slick.Editors.Text
	},
	{
		id: "phone",
		name: "전화번호",
		field: "phone",
		width: 120,
		editor: Slick.Editors.Text
	},
	{
		id: "message",
		name: "메시지 입력",
		field: "message",
		width: 415,
		editor: Slick.Editors.Text
	}

];

//default excel options
var excelOptions = {
	'headers': [ "", "이름", "전화번호", "메시지 입력"],
	'filename' : 'target.xlsx',
	'columns' : [
		{ width: 10 }, //enable hidden if that column needs to be hidden in the excel file
		{ width: 20 },
		{ width: 20 },
		{ width: 30 }
	]
};

function dataInit(rowCount) {
	for (var i = 0; i < rowCount; i++) {
		data[i] = {
			id: "id_" + i,
			num: i + 1,
			name: '',
			phone: '',
			message: '',
		};
	}
}


