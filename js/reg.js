
function toReg() {
	let password1=$("#password1").val();
	let password2=$("#password2").val();
	if(password1=='' || password2==''){
		alert('password can not empty!');
		return;
	}
	if(password1 != password2){
		alert('please check confirm password!');
		return;
	}
	let params={
		user_id: $("#email").val(),
		password: $("#password1").val()
	}
	// console.log(JSON.stringify(params))
	$.ajax({
		url: "http://127.0.0.1:8888/user_reg",
		type: "POST",
		dataType: "json",
		contentType:"application/json;charset=utf-8",
		data:JSON.stringify(params),
		success: function (rest) {
			// let res = JSON.parse(rest)
			console.log(rest);
			if(rest){
				//localStorage.setItem('user_id',params.user_id);
				alert('Success!');
				window.location.href="login.html";
			}else{
				alert('Error,Please try')
			}
		}
	});
}
