$(function(){

    // 点击跳转到修改密码
    $("span.avatar").on("click",function(){
        let url = `/page/sysperson/edit/${$(this).data('userid')}?parm=d1691828-1621-4dee-ab7f-a5676d6e9d28_9afb9954-4b09-4e6c-80f9-f6243d04dce9_e4953161-1cd1-49c7-bfe5-90fd8ed54f4c`
        $('#workspace').attr("src",url); 
    });


	//logo点击跳转到首页 
	$(".admin-logo a").on("click",function(){
		var url = $(this).data('url');
		var param = $(this).data('param');
		// $(".admin-main").addClass("start_home");
		$(".admincj_nav").find(".item").eq(0).show();
		$(".admincj_nav").find(".sub-menu").hide();
		$(".module-menu").find("li").removeClass("active");
		openItem(param);
	});

	//顶部导航栏菜单切换
	$(".module-menu").delegate("li","click",function(){
		$(this).addClass("active").siblings().removeClass("active");

		var leftMemuClass = $(this).data("param");
		var curNavTab = $(".navLeftTab." + leftMemuClass);
		curNavTab.siblings().hide();
		curNavTab.show();
		curNavTab.find('.sub-menu').hide().first().show();

		var items = curNavTab.find(".item");
		items.removeClass("current").first().addClass('current');
		
		//to do first sub
		var first_item = items.first();
		var first_a = first_item.find('.sub-menu').find('li > a:first');
		var url = first_a.data("url");
		loadUrl(url);
		
	});

	$(".navLeftTab .item .tit a").on("click",function(){
		var param = $(this).data("param");
		
		$(this).parents(".item").siblings().removeClass("current").find(".sub-menu").hide();
		$(this).parents(".item").addClass("current").find(".sub-menu").show();
		
	});

	//右侧二级导航选择切换
	$(".sub-menu li a").on("click",function(){
		var param = $(this).data("param");
		var url = $(this).data("url");
		$('.sub-menu li').removeClass('curr');
		$(this).parents('li').addClass('curr');
		loadUrl(url);
	});



	
	//顶部管理员信息展开
	// function adminSetup(){
	// 	var hoverTimer, outTimer;
	// 	$('#admin-manager-btn,.manager-menu,.admincp-map').mouseenter(function(){
	// 		clearTimeout(outTimer);
	// 		hoverTimer = setTimeout(function(){
	// 			$('.manager-menu').show();
	// 			$('#admin-manager-btn i').removeClass().addClass("arrow-close");
	// 		},200);
	// 	});
		
	// 	$('#admin-manager-btn,.manager-menu,.admincp-map').mouseleave(function(){
	// 		clearTimeout(hoverTimer);
	// 		outTimer = setTimeout(function(){
	// 			$('.manager-menu').hide();
	// 			$('#admin-manager-btn i').removeClass().addClass("arrow");
	// 		},100);	
	// 	});
	// }
	// adminSetup();
	
	


	
	
	
	//后台提示
	$(document).on("click","#msg_Container .msg_content a",function(){
		var param = $(this).data("param");
		var url = $(this).data("url");
		loadUrl(url);
		openItem(param);
	});
	
	$(".foldsider").click(function(){
		var leftdiv = $(".admin-main");
		if(leftdiv.hasClass("fold")){
			leftdiv.removeClass("fold");
			$(this).find("i.icon").removeClass("icon-indent-right").addClass("icon-indent-left");
			leftdiv.find(".current").children(".sub-menu").show();
			
			loadEach();
		}else{
			leftdiv.addClass("fold");
			$(this).find("i.icon").removeClass("icon-indent-left").addClass("icon-indent-right");
			leftdiv.find(".sub-menu").hide();
			leftdiv.find(".sub-menu").css("top","0px");
		}
	});
	
	var foldHoverTimer, foldOutTimer,foldHoverTimer2;
	$(document).on("mouseenter",".fold .tit",function(){
		var $this = $(this);
		var items = $this.parents(".item");
		
		var length = items.find(".sub-menu").find("li").length;
		items.parent().find(".item:gt(5)").find(".sub-menu").css("top",-((40*length)-68));
		$this.next().show();
		items.addClass("current");
		items.siblings(".item").removeClass("current");
	});
	
	$(document).on("mouseleave",".fold .tit",function(){
		var $this = $(this);
		clearTimeout(foldHoverTimer);
		foldOutTimer = setTimeout(function(){
			$this.next().hide();
		});
	});
	
	$(document).on("mouseenter",".fold .sub-menu",function(){
		clearTimeout(foldOutTimer);
		var $this = $(this);
		foldHoverTimer2 = setTimeout(function(){
			$this.show();
		});
	});
	
	$(document).on("mouseleave",".fold .sub-menu",function(){
		var $this = $(this);
		$this.hide();
	});
	
	//没有cookie默认选择起始页
	// debugger;
	// if ($.cookie('dscActionParam') == null) {
    //     $('.admin-logo').find('a').click();
    // } else {
    //     openItem($.cookie('dscActionParam'));
    // }

	//顶部布局换色设置
	var bgColorSelectorColors = [{ c: '#981767', cName: '' }, { c: '#AD116B', cName: '' }, { c: '#B61944', cName: '' }, { c: '#AA1815', cName: '' }, { c: '#C4182D', cName: '' }, { c: '#D74641', cName: '' }, { c: '#ED6E4D', cName: '' }, { c: '#D78A67', cName: '' }, { c: '#F5A675', cName: '' }, { c: '#F8C888', cName: '' }, { c: '#F9D39B', cName: '' }, { c: '#F8DB87', cName: '' }, { c: '#FFD839', cName: '' }, { c: '#F9D12C', cName: '' }, { c: '#FABB3D', cName: '' }, { c: '#F8CB3C', cName: '' }, { c: '#F4E47E', cName: '' }, { c: '#F4ED87', cName: '' }, { c: '#DFE05E', cName: '' }, { c: '#CDCA5B', cName: '' }, { c: '#A8C03D', cName: '' }, { c: '#73A833', cName: '' }, { c: '#468E33', cName: '' }, { c: '#5CB147', cName: '' }, { c: '#6BB979', cName: '' }, { c: '#8EC89C', cName: '' }, { c: '#9AD0B9', cName: '' }, { c: '#97D3E3', cName: '' }, { c: '#7CCCEE', cName: '' }, { c: '#5AC3EC', cName: '' }, { c: '#16B8D8', cName: '' }, { c: '#49B4D6', cName: '' }, { c: '#6DB4E4', cName: '' }, { c: '#8DC2EA', cName: '' }, { c: '#BDB8DC', cName: '' }, { c: '#8381BD', cName: '' }, { c: '#7B6FB0', cName: '' }, { c: '#AA86BC', cName: '' }, { c: '#AA7AB3', cName: '' }, { c: '#935EA2', cName: '' }, { c: '#9D559C', cName: '' }, { c: '#C95C9D', cName: '' }, { c: '#DC75AB', cName: '' }, { c: '#EE7DAE', cName: '' }, { c: '#E6A5CA', cName: '' }, { c: '#EA94BE', cName: '' }, { c: '#D63F7D', cName: '' }, { c: '#C1374A', cName: '' }, { c: '#AB3255', cName: '' }, { c: '#A51263', cName: '' }, { c: '#7F285D', cName: ''}];
	$("#trace_show").click(function(){
		$("div.bgSelector").toggle(300, function() {
			if ($(this).html() == '') {
				$(this).sColor({
					colors: bgColorSelectorColors,  // 必填，所有颜色 c:色号（必填） cName:颜色名称（可空）
					colorsWidth: '50px',  // 必填，颜色的高度
					colorsHeight: '31px',  // 必填，颜色的高度
					curTop: '0', // 可选，颜色选择对象高偏移，默认0
					curImg: 'images/cur.png',  //必填，颜色选择对象图片路径
					form: 'drag', // 可选，切换方式，drag或click，默认drag
					keyEvent: true,  // 可选，开启键盘控制，默认true
					prevColor: true, // 可选，开启切换页面后背景色是上一页面所选背景色，如不填则换页后背景色是defaultItem，默认false
					defaultItem: ($.cookie('bgColorSelectorPosition') != null) ? $.cookie('bgColorSelectorPosition') : 22  // 可选，第几个颜色的索引作为初始颜色，默认第1个颜色
				});
			}
		});//切换显示
	});

	$(document).delegate(".ui-droppable", "click", function() {

		let index = $(this).index();
		$.cookie('bgColorSelectorPosition',index );
		$('body').css('background-color', bgColorSelectorColors[$.cookie('bgColorSelectorPosition')].c);

	});

	if ($.cookie('bgColorSelectorPosition') != null) {
		$('body').css('background-color', bgColorSelectorColors[$.cookie('bgColorSelectorPosition')].c);
	} else {
		$('body').css('background-color', bgColorSelectorColors[30].c);
	}

	//上传管理员头像
	// $("#_pic").change(function(){
	// 	var actionUrl = "index.php?act=upload_store_img";
	// 	$("#fileForm").ajaxSubmit({
	// 		type: "POST",
	// 		dataType: "json",
	// 		url: actionUrl,
	// 		data: { "action": "TemporaryImage" },
	// 		success: function (data) {
	// 			if (data.error == "0") {
	// 				alert(data.massege);
	// 			} else if (data.error == "1") {
	// 				$(".avatar img").attr("src", data.content);
	// 			}
	// 		},
	// 		async: true
	// 	});
	// });

	/*  @author-bylu 添加快捷菜单 start  */
	$('.admincp-map-nav li').click(function(){
		var i = $(this).index();
		$(this).addClass('selected');
		$(this).siblings().removeClass('selected');
		$('.admincp-map-div').eq(i).show();
		$('.admincp-map-div').eq(i).siblings('.admincp-map-div').hide();
	});

	$('.admincp-map-div dd i').click(function(){
		var auth_name = $(this).prev('a').text();
		var auth_href = $(this).prev('a').attr('href');
		if(!$(this).parent('dd').hasClass('selected')){

			if($('.admincp-map-div dd.selected').length >=10){
				alert('最多只允许添加10个快捷菜单!');return false;
			}

			$(this).parent('dd').addClass('selected');
			$('.quick_link ul').append('<li class="tl"><a href="'+auth_href+'" data-url="'+auth_href+'" data-param="" target="workspace">'+auth_name+'</a></li>')

			$.post('index.php?act=auth_menu',{'type':'add','auth_name':auth_name,'auth_href':auth_href});

		}else{
			$(this).parent('dd').removeClass('selected');
			$('.quick_link ul li').each(function(k,v){
				if(auth_name == $(v).text()){
					$(v).remove();
				}
			});
			$.post('index.php?act=auth_menu',{'type':'del','auth_name':auth_name,'auth_href':auth_href});
		}
	});

	$('.add_nav,.sitemap').click(function(){
		$('#allMenu').show();
	});
        
	//消息通知
	function message(){
		var hoverTimer, outTimer;
		$('.msg,#msg_Container').mouseenter(function(){
			clearTimeout(outTimer);
			hoverTimer = setTimeout(function(){
				$('#msg_Container').show();
			},200);
		});
		
		$('.msg,#msg_Container').mouseleave(function(){
			clearTimeout(hoverTimer);
			outTimer = setTimeout(function(){
				$('#msg_Container').hide();
			},100);	
		});
	}
	message();
	

	function setActive() {
		var param = $("#workspace").data('param');
		var cls = param.split('_');
		// topnav
		$(".module-menu li").removeClass("active");
		$(".module-menu ." + cls[0]).addClass("active");

		// left 1
		var navTab = $(".navLeftTab");
		navTab.hide();
		var curNavTab = $(".navLeftTab." + cls[0]);
		curNavTab.show();

		// left 1-2
		navTab.find('.item').removeClass("current");
		var curItem = navTab.find('.item.' + cls[0]+ "_" + cls[1]);
		curItem.addClass('current')

		curItem.find("li").removeClass("curr");
		curItem.find("li." + param).addClass("curr");
		
	}
	setActive();
	
});

function openItem(param,home){

	//若cookie值不存在，则跳出iframe框架
	if(!$.cookie('dscActionParam')){
		top.location.href = location.href;
		//top.location = self.location
		//window.location.reload();
	}
	
	if(param == "index|main"){
		// $(".admin-main").addClass("start_home");
	}else{
		// $(".admin-main").removeClass("start_home");
	}
	
	var $this = $('div[id^="adminNavTabs_"]').find('a[data-param="' + param + '"]');
	var url = $this.data('url');
	data_str = param.split('|');
	
	if(home == 0){
		// $this.parents('.admin-main').removeClass('start_home');
	}
	
	if($this.parents(".admin-main").hasClass("fold")){
		$this.parents('.sub-menu').hide();
	}else{
		$this.parents('.sub-menu').show();
	}
	$this.parents('.item').addClass('current').siblings().removeClass('current');
	$this.parents('li').addClass('curr').siblings().removeClass('curr');
	$this.parents('div[id^="adminNavTabs_"]').show().siblings().hide();
	
	
	$('li[data-param="' + data_str[0] + '"]').addClass('active');
	
	$.cookie('dscActionParam', data_str[0] + '|' + data_str[1] , { expires: 1 ,path:'/'});
	
	
	if(param == 'index|main')
	{
		url = '/home';
		loadUrl(url);
	}
}

function loadUrl(url){
	$.cookie('dscUrl', url , { expires: 1 ,path:'/'});
	// $('.admin-main-right iframe[name="workspace"]').attr('src','dialog.php?act=getload_url');
	setTimeout(function(){
		$('.admin-main-right iframe[name="workspace"]').attr('src', url);
	},0);
}




// function autoLoadPage()
// {
// 	if($.cookie('dscUrl'))
// 	{
// 		$("iframe[name='workspace']").attr('src', $.cookie('dscUrl'));
// 	}
// }
// autoLoadPage();

