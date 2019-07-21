window.localStorage.clear()
var currentTpl = 0; // Current tab is set to be the first tab (0)
showTab(currentTpl); // Display the current tab
function add_more_template(e){
  var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this)
  var num = elem.value || elem.options[elem.selectedIndex].value
  var tabs= document.getElementsByClassName('generic_tab')
  if(tabs.length < num){
    for(let i = tabs.length; i != num; i++ ){
      var newNode = tabs[0].cloneNode(true)
      document.getElementById("regGeneric").appendChild(newNode)
      var span = document.createElement('span')
      var text = document.createTextNode("")
      span.appendChild(text)
      span.classList.add('generic_step')
      document.getElementById("generic_count").appendChild(span)
    }
  }else if(tabs.length > num){
    while(document.querySelectorAll('.generic_tab').length != num){
      let re_defined = document.querySelectorAll('.generic_tab')
      let steps = document.querySelectorAll('.generic_step')
      document.getElementById("regGeneric").removeChild(re_defined[re_defined.length - 1])
      document.getElementById("generic_count").removeChild(steps[steps.length - 1])
    }
  }
  showTab(currentTpl)
}

//khởi tạo số mẫu chung bằng số lượng phần tử trong elements
function init_num_of_tab(){
  var num = info.script.attachment.payload.elements.length
  var tabs = document.getElementsByClassName('generic_tab')
  document.getElementById('select_num_of_template').value = num
  if(tabs.length < num){
    for(let i = tabs.length; i != num; i++ ){
      var newNode = tabs[0].cloneNode(true)
      document.getElementById("regGeneric").appendChild(newNode)
      var span = document.createElement('span')
      var text = document.createTextNode("")
      span.appendChild(text)
      span.classList.add('generic_step')
      document.getElementById("generic_count").appendChild(span)
    }
  }else if(tabs.length > num){
    while(document.querySelectorAll('.generic_tab').length != num){
      let re_defined = document.querySelectorAll('.generic_tab')
      let steps = document.querySelectorAll('.generic_step')
      document.getElementById("regGeneric").removeChild(re_defined[re_defined.length - 1])
      document.getElementById("generic_count").removeChild(steps[steps.length - 1])
    }
  }
  showTab(currentTpl)
}

//lưu dữ liệu ban đầu vào local storage
function save_to_local_storage(){
  for(let i = 0; i < info.script.attachment.payload.elements.length; i++){
    window.localStorage.setItem(`generic${i}`, JSON.stringify(info.script.attachment.payload.elements[i]))
  }
}

save_to_local_storage()
init_num_of_tab()

function showTab(n, pre=false) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("generic_tab");
  x[n].style.display = "block"
  // ... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevTpl").disabled = true;
  } else {
    document.getElementById("prevTpl").disabled = false;
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextTpl").disabled = true;
  } else {
    document.getElementById("nextTpl").disabled = false;
  }
  const generic_num_label = document.getElementById('generic_num_label')
  generic_num_label.innerHTML = `Mẫu chung ${n + 1}`
  // ... and run a function that displays the correct step indicator:
  if(pre == true){
    display_pre_generic(currentTpl)
  }
  fixStepIndicator(n)
}
//fix submit event
 function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("generic_tab");
  // Exit the function if any field in the current tab is invalid:
  saving_generic(currentTpl)
  // if (n == 1 && !validateForm()) {
  //   alert("Bạn phải nhập đầy đủ dữ liệu để tiếp tục!")
  //   return false;
  // }
  // Hide the current tab:
  x[currentTpl].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTpl = currentTpl + n;
  // if you have reached the end of the form... :
  // if (currentTpl >= x.length) {
  //   //...the form gets submitted:
  //   submit()
  // }
  init_generic()
  showTab(currentTpl, pre=true)
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = false;
  x = document.getElementsByClassName("generic_tab")
  if (valid) {
    document.getElementsByClassName("generic_step")[currentTpl].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("generic_step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "")
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active"
}

document.getElementById('select_num_of_template').addEventListener('click', add_more_template)

function init_generic(){
  (function(){
    var area = document.querySelector('div[data-type="generic"]')
    area.querySelectorAll('input[type="text"]').forEach(input => input.value = '')
    for(let i = 2; i <= 3; i++){
      if(document.getElementById(`generic_button_${i}`) != undefined){
        let remove_button = document.getElementById(`generic_button_${i}`)
        remove_button.parentNode.removeChild(remove_button)
      }
    }
    document.getElementById('inputImageURL_generic').value = ""
    document.getElementById('inputImageURL_generic').placeholder = 'Choose file from your computer'
  })()

  const fb_tpl_type_selected = 'generic'

  const num_of_button = document.querySelectorAll('.num_of_button')
  num_of_button.forEach(num => num.value = 1)
  num_of_button.forEach(num => num.addEventListener('change', add_tpl_button))
}

function saving_generic(n){
  var save = {}
  var formData = new FormData(document.getElementById('data_form'))

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

function add_full_button(fb_tpl_type_selected){
  var buttons = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
  if(buttons.length < 3){
    var nav_button = document.getElementById('nav_button')
    for(let i = buttons.length; i + 1 <= 3; i++){
      var newNode = buttons[0].cloneNode(true)
      newNode.id = `${fb_tpl_type_selected}_button_${i + 1}`
      document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`).insertBefore(newNode, nav_button)
      let label = document.querySelector(`#${fb_tpl_type_selected}_button_${i + 1} label`)
      label.innerHTML = `Nút nhấn ${i + 1}`
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