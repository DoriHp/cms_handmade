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

var pre_tab = 0
//display generic template, suport multi template
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

function preview_next(e){
	pre_tab++
	var templates = document.getElementsByClassName('div_template')
	for(let i = 0; i < templates.length; i++){
		if(i == pre_tab && i != 'length'){
			templates[i].style.display = 'block'
		}else{
			templates[i].style.display = 'none'
		}
	}
    if(pre_tab == templates.length - 1){
        document.getElementById('nav_tpl_next').disabled = true
    }else if(pre_tab > 0 && pre_tab < templates.length - 1){
        document.getElementById('nav_tpl_pre').disabled = false
        document.getElementById('nav_tpl_next').disabled = false
    }else{
        document.getElementById('nav_tpl_next').disabled = false
    }
}

function preview_pre(){
	pre_tab--
	var templates = document.getElementsByClassName('div_template')
	for(let i = 0; i < templates.length; i++){
		if(i == pre_tab){
			templates[i].style.display = 'block'
		}else{
			templates[i].style.display = 'none'
		}
	}
    if(pre_tab == 0){
        document.getElementById('nav_tpl_pre').disabled = true
    }else if(pre_tab > 0 && pre_tab < templates.length - 1){
        document.getElementById('nav_tpl_pre').disabled = false
        document.getElementById('nav_tpl_next').disabled = false
    }else{
        document.getElementById('nav_tpl_pre').disabled = false
    }
}

//tin nhắn định dạng text - question
function display_text_question(ul, data){
    var li = document.createElement('li')
    li.innerHTML = data.script.question
    li.classList.add('bot')
    ul.appendChild(li)
    if(data.response_mapping != 0){
        setTimeout(function (){
            var li1 = document.createElement('li')
            li1.innerHTML = data.response_mapping[0].res[0]
            li1.classList.add('him')
            ul.appendChild(li1)
        }, 500)
        setTimeout(function (){
            var li2 = document.createElement('li')
            li2.innerHTML = data.response_mapping[0].next_script
            li2.classList.add('bot')
            ul.appendChild(li2)
        }, 1000)
    }
}

//tin nhắn định dạng quick-reply - question
function display_quick_reply(ul, data){
    var li = document.createElement('li')
    li.innerHTML = data.script.question.text
    li.classList.add('bot')
    ul.appendChild(li)
    var sub_ul = document.createElement('ul')
    data.script.question.quick_replies.forEach(option => {
        var sub_li = document.createElement('li')
        sub_li.innerHTML = option.title
        sub_li.setAttribute('data-payload', option.payload)
        sub_li.addEventListener('click', function(){
            var option = this.textContent
            var payload = this.getAttribute('data-payload')
            setTimeout(function(){
                var li_1 = document.createElement('li')
                li_1.classList.add('him')
                li_1.innerHTML = option
                ul.appendChild(li_1)
                sub_ul.style.display = 'none'
            }, 500)
            setTimeout(function(){
                var li_2 = document.createElement('li')
                li_2.classList.add('bot')
                li_2.style.fontStyle = 'italic'
                li_2.innerHTML = `Xử lý tiếp phản hồi của user theo dữ liệu trong mẫu tin nhắn ${payload}`
                ul.appendChild(li_2)    
            }, 1000)
        })
        sub_ul.appendChild(sub_li)
    })
    ul.appendChild(sub_ul)
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

// Hiển thị tin nhắn intent response
function display_text_response(ul, script){
    var li = document.createElement('li')
    li.innerHTML = script.response
    li.classList.add('bot')
    ul.appendChild(li)
}

//hiển thị tin nhắn định dạng hình ảnh
function display_template_button(ul, from, data){
    var container = document.createElement('div')
    container.classList.add('button_template', from)
    var title = document.createElement('div')
    title.classList.add('btn_template_title')
    title.innerHTML = data.text
    container.appendChild(title)
    var btn_group = document.createElement('div')
    btn_group.classList.add('btn_group')
    for(let i of data.buttons){
        let button = document.createElement('button')
        button.innerHTML = i.title
        btn_group.appendChild(button)
    }
    container.appendChild(btn_group)
    ul.appendChild(container)
}

//hiển thị tin nhắn dạng hình ảnh
function display_image_message(ul, from, url){

    var img = document.createElement('img')
    img.src = url
    img.classList.add(from)
    img.alt = url
    img.addEventListener('click', zoom)
    ul.appendChild(img)
}

async function display_preview(){
	var data = await create_submit_data()
    console.log(data)
    if(!data) return
	preview_div.style.display = 'block'
	var preview_ul = document.querySelector('#preview-div ul')
    while (preview_ul.firstChild) {
        preview_ul.removeChild(preview_ul.firstChild)
    }
    scrollTo(document.body, preview_div, 1000)
    display_text_message(preview_ul, 'member', '<i class="fas fa-ellipsis-h"></i>')
    //chỉ thực hiện khi đang ở trang thêm tin nhắn dạng question
    if(data.type == 'question'){
        if(data.script.type == 'text') display_text_question(preview_ul, data)    
        if(data.script.type == 'quick_reply') display_quick_reply(preview_ul, data)
        if(data.script.type == 'template' && data.script.attachment.payload.template_type == 'generic') display_template_generic(preview_ul, 'bot', data.script.attachment.payload.elements)
        if(data.script.type == 'template' && data.script.attachment.payload.template_type == 'button')
            display_template_button(preview_ul, 'bot', data.script.attachment.payload.element[0])
        if(data.script.type == 'template' && data.script.attachment.payload.template_type == 'media'){
            swal("Chú ý", "Định dạng này không hỗ trợ xem trước!", "warning", {confirmButtonColor: 'orange'})
            return
        }
        if(data.script.type == 'image') display_image_message(preview_ul, 'bot', data.script.attachment.payload.url)
        return
    }
    if(data.type == 'response'){
        data.script.forEach(script => {
            if(script.type == 'text') display_text_response(preview_ul, script)
            if(script.type == 'template' && script.attachment.payload.template_type == 'generic') display_template_generic(preview_ul, 'bot', script.attachment.payload.elements)
            if(script.type == 'template' && script.attachment.payload.template_type == 'button')
            display_template_button(preview_ul, 'bot', script.attachment.payload.elements[0])
            if(script.type == 'template' && script.attachment.payload.template_type == 'media'){
                swal("Chú ý", "Định dạng này không hỗ trợ xem trước!", "warning", {confirmButtonColor: 'orange'})
                return
            }
            if(script.type == 'image') display_image_message(preview_ul, 'bot', script.attachment.payload.url)
        })
        return
    }
    if(data.messages[0].dynamic_text){
        display_text_message(preview_ul, 'bot', data.messages[0].dynamic_text.text)
    }else{
        display_template_generic(preview_ul, 'bot', data.messages[0].attachment.payload.elements)
    }
}
// display_preview()
document.getElementById('preview_button').addEventListener('click', display_preview)