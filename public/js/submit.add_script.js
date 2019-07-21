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

async function exec_fb_template(data, output){
	output.type = 'template'
	output.attachment = {}
	output.attachment.type = 'template'
	output.attachment.payload = {}
	output.attachment.payload.template_type = data.fb_template_type

	var element = {}
	switch (output.attachment.payload.template_type) {

		case 'generic':
			await saving_generic(currentTpl)
			output.attachment.payload.elements = []
			for(let i = 0; i < 9 && window.localStorage.getItem(`generic${i}`) != undefined; i++){
				let element = window.localStorage.getItem(`generic${i}`) 
				output.attachment.payload.elements.push(JSON.parse(element))
			}
			break;

		case 'button':
			output.attachment.payload.text = data.title_button
			output.attachment.payload.buttons = []
			for(i = 0; typeof data[`URL_button_${i}_button`] !== 'undefined'; i++ ){
			output.attachment.payload.buttons.push({type: 'web_url', url: data[`URL_button_${i}_button`], title: data[`title_button_${i}_button`]})
			}
			break

		case 'media':
			element.media_type = data.fb_tpl_media_type
			element.url = data.media_url_media
			output.attachment.payload.elements = []
			output.attachment.payload.elements[0] = element
			output.attachment.payload.elements[0].buttons = []
			for(i = 0; typeof data[`URL_button_${i + 1}_media`] !== 'undefined'; i++ ){
			output.attachment.payload.elements[0].buttons.push({type: 'web_url', url: data[`URL_button_${i + 1}_button`], title: data[`title_button_${i + 1}_media`]})
			}
			break
		default:
			swal("Chú ý!", "Không có định dạng nào được chọn, vui lòng kiểm tra lại", "warning")
			break
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
		cons.error(error)
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

function validate(){
	var form = document.querySelector('#data_form')
	var valid = true
	form.querySelectorAll("input").forEach(input => {
		if(input.style.display !== 'none'){
	      if(!input.value || input.value == ""){
	        valid = false
	      }
	    }
	})
	return valid
}

// dữ liệu trước khi gửi
async function create_submit_data(){
	var valid = validate()
	// if(!valid){
	// 	swal("Chú ý!", "Bạn phải nhập đầy đủ dữ liệu để tiếp tục!", "warning", {customClass: {
	//         confirmButton: 'btn btn-warning'
	//       }})
	// 	return
	// }
	var formData = new FormData(document.querySelector('#data_form'))

 	var submit_data = {}
 	
	var data = {}
	for (var pair of formData.entries()) {
	  	data[pair[0]] = pair[1]
	}
	submit_data.id = data.id
	//tao array cua trigger
	var array_triggers = [];
	data.triggers.split(',').forEach(function(trigger){
	    array_triggers.push(trigger.trim())
	})
	submit_data.triggers = array_triggers
	var vars = []
	for(let i of data.variables.split(',')){
		i = '{{' + i.trim() + '}}'
		vars.push(i)
	}
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
		case 'template':
			submit_data.script = await exec_fb_template(data, submit_data.script)
			// statements_1
			break;
		case 'image':
			submit_data.script = exec_image(data, submit_data.script)
			// statements_1
			break;
		default:
			swal("Chú ý", "Hãy lựa chọn một định dạng cho mẫu tin nhắn!", "info")
			// statements_def
			break
	}

	submit_data.response_mapping = []
	for(i = 1; typeof data[`res_mapping${i}`] !== 'undefined'; i++){
		let res_mapping = {}
		res_mapping.res = data[`res_mapping${i}`].split(',')
	    res_mapping.next_script = data[`res_payload${i}`]
	    submit_data.response_mapping.push(res_mapping)
	}
	console.log(submit_data)
	return submit_data
}

//gửi yêu cầu thêm mẫu mới
async function submitData(){
	submit_data = await create_submit_data()
	if(!submit_data || Object.entries(submit_data).length === 0){
		return
	}else{
		// submit dữ liệu
		axios.post('/script/add',{
			headers: {
				'Content-Type': 'application/json',
			},
			data: JSON.stringify(submit_data)
		}).then(function(response){
			if(response.status == 200){
				swal("Thành công", "Mẫu tin nhắn đã được lưu lại!", "success", {showConfirmButton: false})
				setTimeout(function(){
					location.reload()
				}, 500)
			}
		}).catch(function(error){
			console.error(error)
			swal("Lỗi!", error.response.data, "error", {confirmButtonColor: 'red'})
		})
	}
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