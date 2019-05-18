const comps = Array.from(document.querySelectorAll('.comp'))
comps.forEach(comp => comp.style.display = 'none')
function getCookie(name) {
    // Split cookie string and get all individual name=value pairs in an array
    var cookieArr = document.cookie.split(";");
    
    // Loop through the array elements
    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        
        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if(name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    
    // Return null if not found
    return null
}

function display(num){
	//dựa vào data-key để hiển thị div chứa định dạng tương ứng
	comps.forEach(comp => comp.style.display = 'none')
    const selected = document.querySelector(`div[data-key="${num}"]`)
    selected.style.display = 'block'
}

const cookie = getCookie('result')

function execInfo(cookie){
	const info = JSON.parse(cookie)
	console.log(info)
	// document.getElementsByTagName('input').forEach(input =>{
	// 	input.readOnly = "true"
	// })
	document.getElementById('inputID').value = (info.ID)?info.ID:'N/A'
	document.getElementById('inputDescription').value = (info.description)?info.description:'N/A'
	document.getElementById('select_intent').value = info.style
	//

	if(typeof(info.script) == 'array'){
		document.getElementById('select_num_of_script').value = info.script.length
		document.getElementById('select_num_of_script').style.display = 'none'
	}else{
		document.getElementById('select_num_of_script').value = 1
	}
	//hiển thị danh sách triggers
	var triggers_length = info.triggers.length
	if(triggers_length != 1){
		var trigger_area = document.getElementById('trigger_area')
		var original1 = document.getElementById('original1')
		for(let i = 1; i < triggers_length; i++){
			let newNode = original1.cloneNode(true)
			newNode.id = `original${i + 1}`
			trigger_area.appendChild(newNode)
			let labels = document.querySelectorAll(`#original${i + 1} label`)
  			labels.forEach(label => label.innerHTML = "")
		}
	}

	let variables = (info.variables.length != 0)?info.variables.join(', ').replace(/[{}]/g, ''):'N/A'
	document.getElementById('inputVariables').value = variables

	info.triggers.map((value, index)=>{
		let select = document.querySelector(`#original${index + 1} select`)
		select.name = `type${index + 1}`

		select.value = value.fromType

		let input = document.querySelector(`#original${index + 1} input`)
		input.value = value.pattern

	})


	//lựa chọn hiển thị định dạng script
	var select_type_script = document.getElementsByClassName('key')
	switch (info.script.type) {
		case 'text':
			select_type_script[0].checked = true
			display(1)
			// statements_1
			break;
		case 'question':
			select_type_script[1].checked = true
			display(2)
			// statements_1
			break;
		case 'template':
			select_type_script[2].checked = true
			display(3)
			// statements_1
			break;
		case 'image':
			select_type_script[3].checked = true
			display(4)
			// statements_1
			break;
		default:
			// statements_def
			break;
	}
}

//starting from info.script
function exec_text(data){
	document.getElementById('inputReply').value = data.question 
}
//starting from info.script.attachment.payload
function exec_fb_template(data){
	var fb_template_type = document.getElementById("fb_template_type").value
	switch () {
		case 'generic':
			// statements_1
			fb_template_type.value = 'generic'
			let contents document.querySelectorAll('#div[data-key]=3 div div div input')
			let element = data.elements[0]
			contents[0].value = (element.title !== "")?element.title:'N/A'
			contents[1].value = (element.subtitle !== "")?element.subtitle:'N/A'
			contents[2].value = (element.image_url !== "")?element.subtitle:'N/A'
			contents[3].value = (element.default_action.url !== "")?element.default_action.url
			
			break;
		default:
			// statements_def
			break;
	}
}

function add_tpl_button(){
	var buttons = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
	var arr_length = Array.from(buttons).length
	console.log(arr_length)
	if(buttons.length < num){
			for(let i = buttons.length; i != num; i++){
				var newNode = buttons[0].cloneNode(true)
				newNode.id = `${fb_tpl_type_selected}_button_${i + 1}`
				document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`).appendChild(newNode)
				let label = document.querySelector(`#${fb_tpl_type_selected}_button_${i + 1} label`)
				label.innerHTML = `Button ${i + 1}`
				let child_URL = document.querySelector(`#${fb_tpl_type_selected}_button_${i + 1} div div input`)
				child_URL.name = `URL_button_${i + 1}_${fb_tpl_type_selected}`
				let child_title = document.querySelector(`#${fb_tpl_type_selected}_button_${i + 1} div div input`)
				child_title.name = `title_button_${i + 1}_${fb_tpl_type_selected}`
			}
	}else if(buttons.length > num){
		var parent = document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`)
		while(document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`).length != num){
			let re_define = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
			parent.removeChild(re_define[re_define.length - 1])
		}
	}
}



execInfo(cookie)