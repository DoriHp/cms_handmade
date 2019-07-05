const preview_div = document.getElementById('preview-div')

//hiển thị tin nhắn text
function display_text_message(ul, from ,text ){
    var li = document.createElement('li')
    li.innerHTML = text
    if(from == 'member'){
        li.classList.add('him')
    }else{
        li.classList.add('me') 
    }
    ul.appendChild(li)
}

//hiển thị tin nhắn đính kèm file (khác img)
function display_file_message(ul, from, url){

    var li = document.createElement('li')
    if(from == 'member'){

        li.classList.add('him')
    }else{

        li.classList.add('me')
    }
    li.innerHTML = url
    ul.appendChild(li)
}

// var template = {
// 	messages: [
// 	    {
// 	    attachment:{
// 	      	type:"template",
// 	      	payload:{
// 	        	template_type:"generic",
// 	        	elements:[
// 			        	{
// 					        title: "Hello",
// 					        subtitle: "Hello, too!",
// 					        image_url: "https://picsum.photos/191/100",
// 					        default_action: {
// 					        	type: "web_url",
// 					        	url: "https://google.com.vn",
// 					        	webview_height_ratio: "FULL"
// 					        },
// 					        buttons:[
// 					          {
// 					            type:"web_url",
// 					            url:"https://www.messenger.com",
// 					            title:"Visit Messenger"
// 					          }
// 					        ]
// 				    	},
// 				    	{
// 					        title: "Template2",
// 					        subtitle: "Hi template2!",
// 					        image_url: "https://picsum.photos/191/100",
// 					        default_action: {
// 					        	type: "web_url",
// 					        	url: "https://google.com.vn",
// 					        	webview_height_ratio: "FULL"
// 					        },
// 					        buttons:[
// 								{
// 									type:"web_url",
// 									url:"https://www.messenger.com",
// 									title:"Button 1"
// 								},
// 								{
// 									type:"web_url",
// 									url:"https://www.messenger.com",
// 									title:"Button 2"
// 								},
// 								{
// 									type:"web_url",
// 									url:"https://www.messenger.com",
// 									title:"Button 3"
// 								}
// 					        ]
// 				    	}
// 			    	]
// 				}
// 	    	}
// 	    }
// 	]
// }

var pre_tab = 0

function display_template_generic(ul, from, data){
	var container = document.createElement('div')
    container.classList.add('generic_template', from)
	ul.appendChild(container)
	for(let i in data){
		var div = document.createElement('div')
		div.id = `template${i}`
		div.classList.add('div_template')
		if(i == 0){
			div.style.display = 'block'
		}else{
			div.style.display = 'none'
		}
		add_content_tab(div, i, data)
		container.appendChild(div)
	}
	//tạo div chứa template
	if(data.length > 1){
    	//khu vực hiển thị điều hướng
    	var tpl_next = document.createElement('button')
    	tpl_next.id = 'nav_tpl_next'
    	tpl_next.classList.add('nav_template')
    	tpl_next.innerHTML = '<i class="fas fa-angle-right"></i>'
    	tpl_next.addEventListener('click', preview_next, false)
    	
    	var tpl_pre = document.createElement('button')
    	tpl_pre.id = 'nav_tpl_pre'
    	tpl_pre.classList.add('nav_template')
    	tpl_pre.innerHTML = '<i class="fas fa-angle-left"></i>'
    	tpl_pre.addEventListener('click', preview_pre, false)
    
    	container.appendChild(tpl_next)
    	container.appendChild(tpl_pre)
    }
}

function preview_next(){
	pre_tab++
	var templates = document.getElementsByClassName('div_template')
	for(let i in templates){
		if(i == pre_tab){
			templates[i].style.display = 'block'
		}else{
			templates[i].style.display = 'none'
		}
	}
}

function preview_pre(){
	pre_tab--
	var templates = document.getElementsByClassName('div_template')
	for(let i in templates){
		if(i == pre_tab){
			templates[i].style.display = 'block'
		}else{
			templates[i].style.display = 'none'
		}
	}
}

function add_content_tab(container, n, data){
	console.log(data[n])
    //khu vực hiển thị hình ảnh
    var image = document.createElement('div')
    image.classList.add('gen_template_img')
    image.style.backgroundImage = `url(${data[n].image_url})`
    image.style.backgroundSize = 'cover'
    image.style.backgroundRepeat = 'no-repeat'
    container.appendChild(image)

    //khu vực hiển thị tiêu đề
    var title = document.createElement('div')
    title.classList.add('gen_template_title')
    var p = document.createElement('p')
    p.innerHTML = data[n].title
    var span = document.createElement('span')
    span.innerHTML = data[n].subtitle
    title.appendChild(p)
    title.appendChild(span)
    container.appendChild(title)

    //hiển thị các nút nhấn
    var btn_group = document.createElement('div')
    btn_group.classList.add('btn_group')
    for(let i of data[n].buttons){
        let button = document.createElement('button')
        button.innerHTML = i.title
        btn_group.appendChild(button)
    }
    container.appendChild(btn_group)
}

async function display_preview(){
	var data = await create_submit_data()
	console.log(data)
	preview_div.style.display = 'block'
	var preview_ul = document.querySelector('#preview-div ul')
    while (preview_ul.firstChild) {
        preview_ul.removeChild(preview_ul.firstChild)
    }
    display_text_message(preview_ul, 'member', '<i class="fas fa-ellipsis-h"></i>')
        
    if(data.messages[0].dynamic_text){
        display_text_message(preview_ul, 'me', data.messages[0].dynamic_text.text)
    }else{
        display_template_generic(preview_ul, 'me', data.messages[0].attachment.payload.elements)
    }
}
document.getElementById('preview_button').addEventListener('click', display_preview)