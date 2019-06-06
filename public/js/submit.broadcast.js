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

async function submit(){
	var submit_data = {}
	var formData = new FormData(document.querySelector('#broadcast_form'))

	var data = {}
	for (var pair of formData.entries()) {
	  data[pair[0]] = pair[1]
	}

	if(data.broadcast == 'text'){
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
			attachment.payload.elements.push(element)
		}
		submit_data.messages.push({attachment})
	}

	console.log(submit_data)
	axios.post('/broadcast', {
		headers: {
			'Content-Type': 'application/json',
		},
		data: submit_data
	})
	.then(function(response){
		if(response.status == 200){
			alert('Gửi tin nhắn hàng loạt thành công!')
		}else{
			alert('Đã có lỗi xảy ra!')
		}
	})
	.catch(function(err){
		alert(err)
	})
}

document.getElementById('submit_button').addEventListener('click', submit)