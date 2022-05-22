if(localStorage.getItem('user_id')){
	window.location.href="game.html";
}
function toLogin() {
	let params={
		user_id: $("#email").val(),
		password: $("#password").val()
	}
	// console.log(JSON.stringify(params))
	$.ajax({
		url: "http://127.0.0.1:8888/user_login",
		type: "POST",
		dataType: "json",
		contentType:"application/json;charset=utf-8",
		data:JSON.stringify(params),
		success: function (rest) {
			// let res = JSON.parse(rest)
			console.log(rest);
			if(rest){
				localStorage.setItem('user_id',params.user_id);
				window.location.href="game.html";
			}else{
				alert('Error,Please try')
			}
		}
	});
}
