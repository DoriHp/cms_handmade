const comps = Array.from(document.querySelectorAll('.comp'))
comps.forEach(comp => comp.style.display = 'none')
comps[2].style.display = 'block'
const fb_tpl_type = Array.from(document.querySelectorAll('.fb_tpl_type'))
fb_tpl_type.forEach(comp => comp.style.display = 'none')
fb_tpl_type[1].style.display = 'block'
var fb_tpl_type_selected = 'generic'
const num_of_script = document.querySelector('#select_num_of_script')
num_of_script.disabled = true
const intent = document.querySelector('#select_intent')
intent.addEventListener('change', change_num_of_script)
const response_mapping_area = document.querySelectorAll('#response_mapping_area div div div div input')

function display(e){
	comps.forEach(comp => comp.style.display = 'none')
	fb_tpl_type.forEach(comp => comp.style.display = 'none')
	var data_key = e.target.getAttribute('data-key')
	var selected = document.querySelector(`div[data-key="${data_key}"]`)
	selected.style.display = 'block'
}

function display_fb_tpl(e){
	fb_tpl_type.forEach(comp => comp.style.display = 'none')
	var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this);
	var data_type = elem.value || elem.options[elem.selectedIndex].value;
	fb_tpl_type_selected = data_type
	var selected = document.querySelector(`div[data-type="${data_type}"]`)
	selected.style.display = 'block'
}

const keys = Array.from(document.querySelectorAll('.key'))
keys.forEach(key => key.addEventListener('click', display))
const fb_type_selection = document.getElementById('fb_template_type')
fb_type_selection.addEventListener('change', display_fb_tpl)

const num_of_button = document.querySelectorAll('.num_of_button')
num_of_button.forEach(num => num.addEventListener('change', add_tpl_button))

// thêm button cho template
function add_tpl_button(e){
	var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this)
	var num = elem.value || elem.options[elem.selectedIndex].value
	console.log(num)
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

function add_trigger(){
	console.log('Test button')
	var trigger_area = document.getElementById('trigger_area')
	var c = trigger_area.children
	var count = 0
	for(var i = 0; i < c.length; ++i){
		if(c[i].tagName == "DIV")
	    count++
	}
	var node_before = document.getElementById('adding_trigger')
	var original1 = document.getElementById('original1')
	var newNode = original1.cloneNode(true)
	newNode.id = `original${count+1}`
	trigger_area.insertBefore(newNode, node_before)
	let labels = document.querySelectorAll(`#original${count+1} label`)
	labels.forEach(label => label.innerHTML = "")
	let select = document.querySelector(`#original${count+1} select`)
	select.name = `type${count - 1}`
	let input = document.querySelector(`#original${count+1} input`)
	input.name = `trigger${count - 1}`
}

//thêm quick_reply cho question
function add_quick_reply(){
	var node_before = document.getElementById('adding_reply')
	var replies_area = document.getElementById('replies_area')
	var reply1 = document.getElementById('reply1') 
	var newNode = reply1.cloneNode(true)
	var c = replies_area.children;
	var count = 0
	var count_reply = 0
	for(var i = 0; i < c.length; ++i){
		if(c[i].tagName == "INPUT")
	    count++;
		count_reply = (count_reply + 2) / 2
	}

	newNode.id = `reply${count+1}`
	replies_area.insertBefore(newNode ,node_before)
	let reply = document.querySelectorAll(`#reply${count+1} .col-6 .reply`)
	reply.name = `quick_reply${count - 1}`
	let payload = document.querySelectorAll(`#reply${count+1} .col-6 .payload`)
	payload.name = `payload${count - 1}`
}

function add_res_mapping(){
	var node_before = document.getElementById('adding_res_mapping')
	var response_area = document.getElementById('response_area')
	var res_mapping1 = document.getElementById('res_mapping1') 
	var newNode = res_mapping1.cloneNode(true)
	var c = response_area.children;
	var count = 0
	for(var i = 0; i < c.length; ++i){
		if(c[i].tagName == "INPUT")
	    count++;
	}

	newNode.id = `res_mapping${count+1}`
	response_area.insertBefore(newNode ,node_before)
	let res_mapping = document.querySelectorAll(`#reply${count+1} .col-6 .res_mapping`)
	res_mapping.name = `res_mapping${count - 1}`
	res.mapping.placeholder = `${count - 1}`
	let res_payload = document.querySelectorAll(`#reply${count+1} .col-6 .res_payload`)
	payload.name = `res_payload${count - 1}`
}

function change_num_of_script(e){
	var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this)
	var type = elem.value || elem.options[elem.selectedIndex].value
	var div_of_intent = document.querySelector('#div_select_intent_of_script div')
	if(type == 'question'){
		num_of_script.disabled = true
		response_mapping_area.forEach(ele => ele.disabled = false)
	}else{
		num_of_script.disabled = false
		response_mapping_area.forEach(ele => ele.disabled = true)
	}
}
