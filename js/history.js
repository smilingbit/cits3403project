if(!localStorage.getItem('user_id')){
	window.location.href="login.html";
}
getHistory();
function getHistory() {
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
				renderData(data)
			}else{
				alert(rest.msg)
			}
		}
	});
}
function renderData(data){
	let html="";
	if(data.length==0){
		html+=`<h2 class='empty'>Empty</h2>`
	}else{
		for (let i = 0; i < data.length; i++) {
			let item = data[i];
			if(item[0]){
			html+=`<div class="historyItem">
						<div class="historyLeft">
							<h2>${item[0]}</h2>
							<p>time: ${happenTimeFun(item[2])}</p>
						</div>
						<h2>${item[1]>0?'Win':'Fail'}</h2>
					</div>`
			}
		}
	}
	$(".historyBox").html(html)
}
function happenTimeFun(num){
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
        return y + '-' + MM + '-' + d + ' ' + h + ':' + m+ ':' + s;

} 