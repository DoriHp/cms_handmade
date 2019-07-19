function close_notifier(){
	var warning = document.getElementsByClassName('warning')
	var closer_warning = document.getElementsByClassName('close-warning')
	for(let i in closer_warning){
		closer_warning[i].addEventListener('click', function(){
			warning[i].style.display = 'none'
		})
	}
	var danger = document.getElementsByClassName('danger')
	var closer_danger = document.getElementsByClassName('closer-danger')
	for(let i in closer_danger){
		closer_danger[i].addEventListener('click', function(){
			danger[i].style.display = 'none'
		})
	}
}

// close_notifier()

function exec_text(data, output){

	output.type = 'text'
	output.question = data.text_content
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

function exec_question(data, output = {}){
  output.type = 'quick_reply'
  output.question = {}
  output.question.text = data.question
  output.question.quick_replies = []
  for(i = 0; typeof data[`quick_reply${i}`] !== 'undefined'; i++ ){
    output.question.quick_replies.push({content_type: 'text', title: data[`quick_reply${i}`], payload: data[`payload${i}`]})
  }
  return output
}

document.getElementById('chooseFile').addEventListener('change', function (e) {
  	var image = this.value.replace(/.*[\/\\]/, '')
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
	}).catch(function(error){
		swal("Lỗi!", error.response.data, "error", {confirmButtonColor: 'red'})
	})
})

document.getElementById('chooseFile2').addEventListener('change', function (e) {
  	var image = this.value.replace(/.*[\/\\]/, '')
	var display = document.getElementById('inputImageURL')
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
	}).catch(function(error){
		console.error(error)
		swal("Lỗi!", error.response.data, "error", {confirmButtonColor: 'red'})
	})
})

// dữ liệu trước khi gửi
function create_submit_data(){
	var formData = new FormData(document.querySelector('#data_form'))

 	var submit_data = {}
 	
	var data = {}
	for (var pair of formData.entries()) {
	  	data[pair[0]] = pair[1]
	}
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
	submit_data.type = 'question'
	submit_data.script = {}
	switch (data.script) {
		case 'text':
			submit_data.script = exec_text(data, submit_data.script)
			// statements_1
			break;
		case 'quick_reply':
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
			swal("Chú ý", "Hãy lựa chọn một định dạng cho mẫu tin nhắn!", "info")
			// statements_def
			return null
			break
	}

	submit_data.response_mapping = []
	for(i = 1; typeof data[`res_mapping${i}`] !== 'undefined'; i++){
		let res_mapping = {}
		res_mapping.res = data[`res_mapping${i}`].split(',')
	    res_mapping.next_script = data[`res_payload${i}`]
	    submit_data.response_mapping.push(res_mapping)
	}
	return submit_data
}

//gửi yêu cầu thêm mẫu mới
function submitData(){

	submit_data = create_submit_data()
	// submit dữ liệu
	axios.post('/script/add',{
		headers: {
			'Content-Type': 'application/json',
		},
		data: JSON.stringify(submit_data)
	}).then(function(response){
		if(response.status == 200){
			swal("Thành công", "Mẫu tin nhắn đã được lưu lại!", "success", {showConfirmButton: false})
			location.reload()
		}
	}).catch(function(error){
		console.error(error)
		swal("Lỗi!", error.response.data, "error", {confirmButtonColor: 'red'})
	})

	return false
}

function scrollTo(element, to, duration) {
    if (duration <= 0) return
    var difference = to - element.scrollTop
    var perTick = difference / duration * 10

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick
        if (element.scrollTop === to) return
        scrollTo(element, to, duration - 10)
    }, 10)
}