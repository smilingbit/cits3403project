function logout() {
	var flag=confirm("confirm log out?"); 
	if(flag){
		window.localStorage.removeItem("user_id")
		window.location.href="login.html";
	}
}