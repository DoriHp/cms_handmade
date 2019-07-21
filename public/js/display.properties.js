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
//lấy dữ liệu từ cookie
const cookie = getCookie('info')

const info = JSON.parse(cookie)
console.log(info)

const comps = Array.from(document.querySelectorAll('.comp'))
comps.forEach(comp => comp.style.display = 'none')
const fb_tpl_type = Array.from(document.querySelectorAll('.fb_tpl_type'))
fb_tpl_type.forEach(comp => comp.style.display = 'none')
var fb_tpl_type_selected = 'generic'

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
	if(data_type == 'generic'){
	  remove_extra_button('generic')
	}
}

const keys = Array.from(document.querySelectorAll('.key'))
keys.forEach(key => key.checked = false)
keys.forEach(key => key.addEventListener('click', display))
const fb_type_selection = document.getElementById('fb_template_type')
const default_option = document.createElement("option")
default_option.text = "--select an option--"
default_option.selected = true
default_option.hidden = true
default_option.disable = true
fb_type_selection.add(default_option) 
fb_type_selection.addEventListener('change', display_fb_tpl)

const num_of_button = document.querySelectorAll('.num_of_button')
num_of_button.forEach(num => num.addEventListener('change', add_tpl_button))

// thêm button cho template
function add_tpl_button(e){
	var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this)
	var num = elem.value || elem.options[elem.selectedIndex].value
	var buttons = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
	if(buttons.length < num){
	    for(let i = buttons.length; i != num; i++){
	      var newNode = buttons[0].cloneNode(true)
	      newNode.id = `${fb_tpl_type_selected}_button_${i + 1}`
	      document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`).appendChild(newNode)
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
	}else if(buttons.length > num){
	  var parent = document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`)
	  while(document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`).length != num){
	    let re_define = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
	    parent.removeChild(re_define[re_define.length - 1])
    }
  }
}


function execInfo(info){
	
	document.getElementById('inputID').value = (info.id)?info.id:'N/A'
	document.getElementById('inputTriggers').value = info.triggers.join(', ')
	//

	var vars = []
	info.variables.forEach(function(variable){
    let reg = new RegExp(/\W/g)
    vars.push(variable.replace(reg, ""))
	})
	document.getElementById('inputVariables').value = vars.join(', ')
	if(info != undefined){
	    var keys = document.getElementsByClassName("key")
	    if(info.script.type){
	      switch (info.script.type) {
	        case "text":
	          document.querySelector(`div[data-key="1"]`).style.display = 'block'
	          display_text(info.script)
	          // statements_1
	          break;
	       	case "quick_reply":
	          document.querySelector(`div[data-key="2"]`).style.display = 'block'
	          display_question(info)
	          break;        
	        case "template":
	          document.querySelector(`div[data-key="3"]`).style.display = 'block'
	          display_fb_template(info.script.attachment.payload)
	          break;
	        case "image":
	          document.querySelector(`div[data-key="4"]`).style.display = 'block'
	          display_image(info)
	          break;
	        default:
	          // statements_def
	          break;
	      }
	      for(let i = 0; i < keys.length; i++){
	        if(keys[i].value == info.script.type)
	          keys[i].checked = true
	        else{
	          keys[i].checked = false
	        }
	      }
	    }
	  }
}

function display_text(data){
  document.getElementById('inputReply').value = data.question
  document.getElementById('inputID_next_script').value = data.next_script
}

//starting from script.question
function display_question(data){
  document.getElementById('inputQuestion').value = data.script.question.text
  while(document.getElementsByClassName('reply').length != data.script.question.quick_replies.length) add_quick_reply()
  for(let i = 0; i < data.script.question.quick_replies.length; i++){
    var child = document.querySelectorAll(`#reply${i + 1} div input`)
    child[0].value = data.script.question.quick_replies[i].title
    child[1].value = data.script.question.quick_replies[i].payload
  }
}

(function display_response_mapping(){
  while(document.getElementsByClassName('res_mapping').length != info.response_mapping.length) add_res_mapping()
  for(let i = 1; i <= info.response_mapping.length; i++){
    var child = document.querySelectorAll(`#res_mapping${i} div input`)
    child[0].value = info.response_mapping[i - 1].responses.join(', ')
    child[1].value = info.response_mapping[i - 1].next_script
  }
})()

function display_del_button(del_button, add_button, display = true){
  if(display == true){
    del_button.classList.add('col-md-3', 'col-md-offset-3')
    del_button.style.display = 'block'
    add_button.classList.remove('col-md-6', 'col-md-offset-3')
    add_button.classList.add('col-md-3')
  }else{
    del_button.classList.remove('col-md-3', 'col-md-offset-3')
    del_button.style.display = 'none'
    add_button.classList.remove('col-md-3')
    add_button.classList.add('col-md-6', 'col-md-offset-3')
  }
}

//thêm quick_reply cho question
function add_quick_reply(){
  var node_before = document.getElementById('adding_reply')
  var replies_area = document.getElementById('replies_area')
  var buttons = replies_area.querySelectorAll('div button')
  var reply1 = document.getElementById('reply1') 
  var newNode = reply1.cloneNode(true)
  var c = replies_area.children;
  var count = 0
  for(var i = 0; i < c.length; ++i){
    if(c[i].tagName == "DIV")
      count++;
  }
  newNode.id = `reply${count}`
  replies_area.insertBefore(newNode ,node_before)
  if(count > 1){
    display_del_button(buttons[0], buttons[1])
  }
  let child = document.querySelectorAll(`#reply${count} div input`)
  child[0].placeholder = 'Option'
  child[0].value = ""
  child[0].name = `quick_reply${count - 1}`
  child[1].name = `payload${count - 1}`
  child[1].placeholder = 'Payload for option'
  child[1].value = ""
  let label = document.querySelector(`#reply${count} label`)
  label.innerHTML = `Option (${count}).`
}

function del_quick_reply(){
  var replies_area = document.getElementById('replies_area')
  var buttons = replies_area.querySelectorAll('div button')
  var c = replies_area.children;
  var count = 0
  for(var i = 0; i < c.length; ++i){
    if(c[i].tagName == "DIV")
      count++;
  }
  let last = document.getElementById(`reply${count - 1}`)
  last.parentNode.removeChild(last)
  count--
  if(count == 2){
    display_del_button(buttons[0], buttons[1], false)
  }
}

function add_res_mapping(){
  var node_before = document.getElementById('adding_res_mapping')
  var response_area = document.getElementById('response_area')
  var buttons = response_area.querySelectorAll('div button')
  var res_mapping1 = document.getElementById('res_mapping1') 
  var newNode = res_mapping1.cloneNode(true)
  var count = document.getElementsByClassName('res_mapping').length
  if(count == 1){
    display_del_button(buttons[0], buttons[1])
  }
  newNode.id = `res_mapping${count + 1}`
  response_area.insertBefore(newNode ,node_before)
  let inputs = document.querySelectorAll(`#res_mapping${count + 1} div input`)
  inputs[0].name = `res_mapping${count + 1}`
  inputs[1].name = `res_payload${count + 1}`
}

function del_res_mapping(){
  var response_area = document.getElementById('response_area')
  var buttons = response_area.querySelectorAll('div button')
  var c = response_area.children;
  var count = document.getElementsByClassName('res_mapping').length
  let last = document.getElementById(`res_mapping${count}`)
  last.parentNode.removeChild(last)
  count--
  if(count == 1){
    display_del_button(buttons[0], buttons[1], false)
  }
}

//starting from script.attachment.payload
function display_fb_template(data){
  document.getElementById('fb_template_type').value = data.template_type
  switch (data.template_type) {
    case "generic":
      document.getElementById("inputTitle_generic").value = data.elements[0].title
      document.getElementById("inputSubtitle_generic").value = data.elements[0].subtitle
      document.getElementById("inputImageURL_generic").value = data.elements[0].image_url
      document.getElementById("inputDefault_URL_generic").value = data.elements[0].default_action.url
      var num_of_button = document.querySelector('div[data-type=generic] div div .num_of_button')
      num_of_button.value = data.elements[0].buttons.length
      add_full_button('generic')
      for(let i = 1; i <= 3; i++){
        if(data.elements[0].buttons[i - 1]){
          var button = document.getElementById(`generic_button_${i}`)
          var child = button.querySelectorAll(`div div input`)
          var set_type = button.querySelector(`div select`)
          if(data.elements[0].buttons[i - 1].type == "web_url"){
            set_type.value = "web_url"
            child[0].value = data.elements[0].buttons[i - 1].url
            child[1].value = data.elements[0].buttons[i - 1].title
          }else{
            set_type.value = "payload"
            child[0].value = data.elements[0].buttons[i - 1].payload
            child[1].value = data.elements[0].buttons[i - 1].title
          } 
        }else{
          var button = document.getElementById(`generic_button_${i}`)
          button.parentNode.removeChild(button)
        }
      }
      break;
    case "button":
      document.getElementById("inputText_button").value = data.text
      add_full_button('button')
      var num_of_button = document.querySelector('div[data-type=button] div div .num_of_button')
          num_of_button.value = data.buttons.length
      for(let i = 1; i <= 3; i++){
        if(data.buttons[i - 1]){
          var button = document.getElementById(`button_button_${i}`)
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
          console.log(i)
          var button = document.getElementById(`button_button_${i}`)
          button.parentNode.removeChild(button)
        }
      }
      break
    case "media":
      document.getElementById("inputMediaURL_media").value = data.elements[0].url
      add_full_button('media')
      var num_of_button = document.querySelector('div[data-type=button] div div .num_of_button')
          num_of_button.value = data.elements[0].buttons.length
      for(let i = 1; i <= 3; i++){
        if(data.elements[0].buttons[i - 1]){
          var button = document.getElementById(`media_button_${i}`)
          var child = button.querySelectorAll(`div div input`)
          var set_type = button.querySelector(`div select`)
          if(data.elements[0].buttons[i - 1].type == "web_url"){
            set_type.value = "web_url"
            child[0].value = data.elements[0].buttons[i - 1].url
            child[1].value = data.elements[0].buttons[i - 1].title
          }else{
            set_type.value = "payload"
            child[0].value = data.elements[0].buttons[i - 1].payload
            child[1].value = data.elements[0].buttons[i - 1].title
          } 
        }else{
          console.log(i)
          var button = document.getElementById(`media_button_${i}`)
          button.parentNode.removeChild(button)
        }
      }
      break
    default:

      // statements_def
    break;
  }
  var selected = document.querySelector(`div[data-type="${data.template_type}"]`)
  selected.style.display = 'block'
}

function display_image(data){
  document.getElementById('inputImageURL').value = data.attachment.payload.url
  document.getElementById('inputID_next_script').value = data.next_script
}

function add_full_button(fb_tpl_type_selected){
  var buttons = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
  if(buttons.length < 3){
    for(let i = buttons.length; i + 1 <= 3; i++){
      var newNode = buttons[0].cloneNode(true)
      newNode.id = `${fb_tpl_type_selected}_button_${i + 1}`
      document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`).appendChild(newNode)
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

execInfo(info)