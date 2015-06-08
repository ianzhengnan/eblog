$(document).ready(function(){
	$(".blog-nav-item").on('click', function(){

	});

	$("#search").bind('keypress', function(e){
		if(e.keyCode == '13'){
			$("#search").submit();
		}
	});
});