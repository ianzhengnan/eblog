$(document).ready(function(){

	var active_id = $.cookie("active_id");
	var id = $.cookie("id");

	if(active_id == undefined && id == undefined){
		active_id = id = "home";
	}

	$("#" + active_id).removeClass("active");
	$("#" + id).addClass("active");


	$(".blog-nav-item").on('click', function(){
		$.cookie("active_id", $(".blog-nav-item.active")[0].id, {
			expires: 30
		});
		$.cookie("id", $(this)[0].id, {
			expires: 30
		});
	});

	$("#search").bind('keypress', function(e){
		if(e.keyCode == '13'){
			$("#search").submit();
		}
	});
});
