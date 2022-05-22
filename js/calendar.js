let signDays=["2022-04-01","2022-05-01","2022-05-07","2022-05-18","2022-05-19","2022-05-25"]
let date = getNowMonth();
if(!localStorage.getItem('user_id')){
	window.location.href="login.html";
}
getSignDays();
function getSignDays(){
	let params={
		user_id: localStorage.getItem('user_id'),
	}
	$.ajax({
		url: "http://127.0.0.1:8888/get_record",
		type: "POST",
		dataType: "json",
		contentType:"application/json;charset=utf-8",
		data:JSON.stringify(params),
		success: function (rest) {
			console.log(rest);
			if(rest.status==1000){
				let data = rest.data;
				filterDay(data)
			}else{
				alert(rest.msg)
				filterDay([])
			}
		}
	});
}
function filterDay(data){
	let arr=[];
	for (let i = 0; i < data.length; i++) {
		let item = data[i];
		if(Math.abs(item[1]) == 10){
			arr.push(happenTimeFun(item[2],1))
		}
	}
	signDays=arr;
	renderCalendar();
}
function renderCalendar(){
	let arr = getDays(date);
	// console.log(arr)
	$(".month").html(date)
	let html="";
	for (let i = 0; i < arr.length; i++) {
		let day = arr[i];
		html+=``;
		let showDate = date+"-"+(day>9?day:'0'+day);
		let isSign=signDays.indexOf(showDate)
		if(i%7==0){
			html+=`<div class="calendarDay"><p class="${isSign!=-1?'signed':''}">${day}<span></span></p>`
		}else if(i%7==6){
			html+=`<p class="${isSign!=-1?'signed':''}">${day}<span></span></p></div>`
		}else{
			html+=`<p class="${isSign!=-1?'signed':''}">${day}<span></span></p>`
		}
	}
	html+=`</div>`
	$(".calendarDayBox").html(html)
}
$(".pre").click(function(){
	date=getOtherMonth(date,-1);
	renderCalendar();
})
$(".next").click(function(){
	date=getOtherMonth(date,1);
	renderCalendar();
})
function getNowMonth(date,type) {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	// var day = now.getDate();
	month=month>9?month:'0'+month;
	return year+'-'+month;
}
function getOtherMonth(date,type){ //type  -1 preMonth，1 nextMonth
	let dateArr = date.split("-");
	let year,month;
	if(type==-1){
		year=(dateArr[1]-0+type)>0?dateArr[0]:(dateArr[0]-0+type);
		month=(dateArr[1]-0+type)>0?(dateArr[1]-0+type):12;
	}else{
		year=(dateArr[1]-0+type)<=12?dateArr[0]:(dateArr[0]-0+type);
		month=(dateArr[1]-0+type)<=12?(dateArr[1]-0+type):1;
	}
	month=month>9?month:'0'+month;
	return year+'-'+month;
}

function getDays(date){
	let arr=[];
	let dateArr = date.split("-");
	let days = new Date(dateArr[0],dateArr[1]+1,0).getDate();
	let week = new Date(date+'-01').getDay();
	// console.log(date,week,days)
	for (let i = 0; i < week; i++) {
		arr.push("")
	}
	for (let i = 0; i < days; i++) {
		arr.push(i+1);
	}
	return arr;
}

function happenTimeFun(num,type){
         let date = new Date(num*1000);
        let y = date.getFullYear();
        let MM = date.getMonth() + 1;
        MM = MM < 10 ? ('0' + MM) : MM;
        let d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        let h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        let m = date.getMinutes();
        m = m < 10 ? ('0' + m) : m;
        let s = date.getSeconds();
        s = s < 10 ? ('0' + s) : s;
		if(type==1){
			return y + '-' + MM + '-' + d
		}
        return y + '-' + MM + '-' + d + ' ' + h + ':' + m+ ':' + s;
}
