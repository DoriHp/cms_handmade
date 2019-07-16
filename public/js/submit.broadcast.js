var timer = ""
var br_label = ""
function display_pre_generic(n){
	var data = JSON.parse(window.localStorage.getItem(`generic${n}`))
	if(data == undefined) return
 	document.getElementById("inputTitle_generic").value = data.title
  	document.getElementById("inputSubtitle_generic").value = data.subtitle
  	document.getElementById("inputImageURL_generic").value = data.image_url
  	document.getElementById("inputDefault_URL_generic").value = data.default_action.url
  	var num_of_button = document.querySelector('div[data-type=generic] div div .num_of_button')
  	num_of_button.value = data.buttons.length
  	add_full_button('generic')
  	for(let i = 1; i <= 3; i++){
    	if(data.buttons[i - 1]){
      	var button = document.getElementById(`generic_button_${i}`)
      	var child = button.querySelectorAll(`div div input`)
      	var set_type = button.querySelector(`div select`)
      	if(data.buttons[i - 1].type == "web_url"){
        	set_type.value = "web_url"
        	child[0].value = data.buttons[i - 1].url
        	child[1].value = data.buttons[i - 1].title
      	}else{
        	set_type.value = "payload"
        	child[0].value = data.buttons[i - 1].payload
        	child[1].value = data.buttons[i - 1].title
      	} 
    	}else{
      	var button = document.getElementById(`generic_button_${i}`)
      	button.parentNode.removeChild(button)
    }
  }
}

document.getElementById('chooseFile').addEventListener('change', function (e) {
  	var image = this.value.replace(/.*[\/\\]/, '');
	var display = document.getElementById('inputImageURL_generic')
	var formData = new FormData()
	formData.append("image", e.target.files[0])
	axios.post('/message241/upload', formData,
		{
			headers:{
				'Content-Type': 'multipart/form-data'
			}
		}
	).then(function(response){
		if(response.status == 200){
			display.value = response.data
		}
		else{
			swal("Thất bại" ,'Tải ảnh lên thất bại!', "error", {dangerMode: true})
		}		
	}).catch(function(error){
		console.error(error)
		error_alert()
	})
})

function saving_generic(n){
	var save = {}
	var formData = new FormData(document.getElementById('broadcast_form'))

	var data = {}
	for (var pair of formData.entries()) {
	  data[pair[0]] = pair[1]
	}
	save.title = data.title_generic
	save.subtitle = data.subtitle_generic
	save.image_url = data.image_url_generic
	save.default_action = {}
	save.default_action.type = 'web_url'
	save.default_action.url = data.default_URL_generic
	save.default_action.messenger_extensions = 'false'
	save.default_action.webview_height_ratio = 'FULL'
	save.buttons = []
	for(i = 1; typeof data[`style_of_button_${i}_generic`] !== 'undefined'; i++ ){
	if(data[`style_of_button_${i}_generic`] == 'web_url'){
	  save.buttons.push({type: 'web_url', url: data[`URL_button_${i}_generic`], title: data[`title_button_${i}_generic`]})
	}else{
	  save.buttons.push({type: 'postback', payload: data[`URL_button_${i}_generic`], title: data[`title_button_${i}_generic`]})
		}
	}
	window.localStorage.setItem(`generic${n}`, JSON.stringify(save))
}

function add_full_button(fb_tpl_type_selected){
  var buttons = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
  if(buttons.length < 3){
  	var nav_button = document.getElementById('nav_button')
    for(let i = buttons.length; i + 1 <= 3; i++){
      var newNode = buttons[0].cloneNode(true)
      newNode.id = `${fb_tpl_type_selected}_button_${i + 1}`
      document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`).insertBefore(newNode, nav_button)
      let label = document.querySelector(`#${fb_tpl_type_selected}_button_${i + 1} label`)
      label.innerHTML = `Button ${i + 1}`
      let select = document.querySelector(`#${fb_tpl_type_selected}_button_${i + 1} div select`)
      select.name = `style_of_button_${i + 1}_${fb_tpl_type_selected}`
      let child = document.querySelectorAll(`#${fb_tpl_type_selected}_button_${i + 1} div div input`)
      child[0].placeholder = 'URL | Payload'
      child[0].value = ""
      child[0].name = `URL_button_${i + 1}_${fb_tpl_type_selected}`
      child[1].placeholder = 'Title to display'
      child[1].value = ""
      child[1].name = `title_button_${i + 1}_${fb_tpl_type_selected}`
    }
  }
}
//Lấy dữ liệu từ form
async function create_submit_data(){
	var submit_data = {}
	var formData = new FormData(document.getElementById('broadcast_form'))
	var data = {}
	for(var pair of formData.entries()) {
	  data[pair[0]] = pair[1]
	}

	if(data.type == 'text'){
		submit_data = {}
		submit_data.messages = []
		var dynamic_text = {}
		dynamic_text.text = data.text_content
		dynamic_text.fallback_text = data.fallback_text
		submit_data.messages.push({dynamic_text})
	}else{
		await saving_generic(currentTpl)
		submit_data = {}
		submit_data.messages = []
		var attachment = {}
		attachment.type = 'template'
		attachment.payload = {}
		attachment.payload.template_type = 'generic'
		attachment.payload.elements = []
		for(let i = 0; i < 9 && window.localStorage.getItem(`generic${i}`) != undefined; i++){
			let element = window.localStorage.getItem(`generic${i}`) 
			attachment.payload.elements.push(JSON.parse(element))
		}
		submit_data.messages.push({attachment})
	}
	return submit_data
}

async function submit(){
	var submit_data = await create_submit_data()
	if(!timer){
		swal({
            title: "Chú ý!",
            text: "Bạn chưa cài đặt thời gian/nhóm đối tượng xác định nhận tin nhắn hàng loạt. Đi đến mục này?",
            type: "info",
            showCancelButton: true,
            cancelButtonText: "Bỏ qua",
            confirmButtonText: "Chuyển tới cài đặt"
        })
        .then(function(result){
        	if(result.value){
				document.getElementById('timer').focus()
			}else{
				send_request(submit_data)
			}
        })
	}else{
		if(br_label){
			submit_data.label = br_label
		}
		submit_data.timer = timer
		send_request(submit_data)
	}
}

document.getElementById('label_list').addEventListener('focusout', function(){
	return br_label = this.value
})

function send_request(data){
	axios.post('/message241/broadcast', {
		headers: {
			'Content-Type': 'application/json',
		},
		data: data
	})
	.then(function(response){
		if(response.status == 200){
			swal("Thành công!", "Tin nhắn hàng loạt đã được gửi", "success", {buttons: false} )
			setTimeout(function(){
				location.reload()
			}, 500)
		}else{
			error_alert()
		}
	})
	.catch(function(err){
		console.error(err)
		error_alert()
	})
}

function message_config(e){
	var get_value = document.getElementById('timer').value
	var arr = get_value.split(' ')
	var new_str = `${arr[1]} ${arr[0]} ${arr[2]} ${arr[4]}`
	timer = Date.parse(new_str)
	swal("Thành công", "Đã lưu cài đặt cho tin nhắn quảng bá", "success")
}

function add_psid_to_label(){
	var label = document.getElementById('label_list').value
	var psid = document.getElementById('member_list').value
	axios.post('/message241/broadcast/add-psid-to-label', {
		headers:{
			'Content-Type': 'application/json'
		},
		data: {label: label, psid: psid}
	})
	.then(function(response){
		if(response.status == 200){
			swal( "Thành công!", "Đã thêm khách hàng được chỉ định vào nhóm này", "success")
		}else{
			error_alert()
		}
	})
	.catch(function(error){
		console.log(error)
		error_alert()
	})
}

document.getElementById('submit_button').addEventListener('click', submit)
