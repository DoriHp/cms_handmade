function exec_text(data, output){

	output.type = 'text'
	output.question = data.text_content
	return output
}

function exec_question(data, output){	

	if(data.question_type == 'quick_reply'){
		output.type = 'quick_reply'
		output.question = {}
		output.question.text = data.question
		output.question.quick_replies = []
		for(i = 0; typeof data[`quick_reply${i}`] !== 'undefined'; i++ ){
			output.question.quick_replies.push({content_type: 'text', title : data[`quick_reply${i}`], payload: data[`payload${i}`]})
		}
	}else{
		output.type = 'text'
		output.question = data.question
	}

	return output
}

function exec_image(data, output){
	output.type = 'image'
	output.attachment = {}
	output.attachment.type = 'image'
	output.attachment.payload = {}
	output.attachment.payload.url = data.image_url
	output.attachment.payload.is_reusable = 'true'

	return output
}

function exec_fb_template(data, output){
	output.type = 'template'
	output.attachment = {}
	output.attachment.type = 'template'
	output.attachment.payload = {}
	output.attachment.payload.template_type = data.fb_template_type

	var element = {}
	switch (output.attachment.payload.template_type) {

		case 'generic':
			element.title = data.title_generic
			element.subtitle = data.subtitle_generic
			element.image_url = data.image_url_generic
			element.default_action = {}
			element.default_action.type = 'web_url'
			element.default_action.url = data.default_URL_generic
			element.default_action.messenger_extensions = 'false'
			element.default_action.webview_height_ratio = 'FULL'
			element.buttons = []
			for(i = 0; typeof data[`URL_button_${i}_generic`] !== 'undefined'; i++ ){
				if(data[`style_of_button_${i}_generic`] == 'web_url'){
					element.buttons.push({type: 'web_url', url: data[`URL_button_${i}_generic`], title: data[`title_button_${i}_generic`]})
				}else{
					element.buttons.push({type: 'postback', payload: data[`URL_button_${i}_generic`], title: data[`title_button_${i}_generic`]})
				}
			}
			output.attachment.payload.elements = []
			output.attachment.payload.elements[0] = element
			break;

		case 'button':
			output.attachment.payload.text = data.title_button
			output.attachment.payload.buttons = []
			for(i = 0; typeof data[`URL_button_${i}_button`] !== 'undefined'; i++ ){
			output.attachment.payload.buttons.push({type: 'web_url', url: data[`URL_button_${i}_button`], title: data[`title_button_${i}_generic`]})
			}
			break

		case 'media':
				element.media_type = data.fb_tpl_media_type
				element.url = data.media_url_media
				output.attachment.payload.elements = []
				output.attachment.payload.elements[0] = element
			break
		default:
			
			break;

	}
		return output
}

function submitData(){

 	var formData = new FormData(document.querySelector('form'))

 	var submit_data = {}
 	
	var data = {}
	for (var pair of formData.entries()) {
	  	data[pair[0]] = pair[1]
	}

	console.log(data)

	submit_data.id = data.id
		//tao array cua trigger
	var array_triggers = [];
	for(i = 0; typeof data[`type${i}`] !== 'undefined'; i++){
	    array_triggers.push({type: data[`type${i}`], pattern: data[`trigger${i}`] })
	}
	submit_data.triggers = array_triggers
	var vars = data.variables.split('')
	vars.forEach(variable => '{{' + variable + '}}')
	submit_data.variables = vars
	submit_data.type = data.intent
	submit_data.script = {}
	switch (data.script) {
		case 'text':
			submit_data.script = exec_text(data, submit_data.script)
			// statements_1
			break;
		case 'question':
			submit_data.script = exec_question(data, submit_data.script)
			// statements_1
			break;
		case 'fb_template':
			submit_data.script = exec_fb_template(data, submit_data.script)
			// statements_1
			break;
		case 'image':
			submit_data.script = exec_image(data, submit_data.script)
			// statements_1
			break;
		default:
			alert('Hãy lựa chọn một định dạng script!')
			// statements_def
			return
			break
	}

	submit_data.response_mapping = []
	for(i = 0; typeof data[`res_mapping${i}`] !== 'undefined'; i++){
		let res_mapping = {}
		res_mapping.res = data[`res_mapping${i}`].split(',')
	    res_mapping.next_script = data[`res_payload${i}`]
	    submit_data.response_mapping.push(res_mapping)
	}

	console.log(submit_data)
	// submit dữ liệu
	axios.post('/script/add',{
		headers: {
			'Content-Type': 'application/json',
		},
		data: JSON.stringify(submit_data)
	}).then(function(response){
		if(response.status == 200){
			alert("Lưu script thành công!")
		}else{
			alert("Lưu script thất bại!")
		}
	}).catch(function(error){
		console.log(error)
	})

	return false
}