window.localStorage.clear()

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

var cookie = getCookie('info')
const info = JSON.parse(cookie)

var currentTab = 0; // Current tab is set to be the first tab (0)
// showTab(currentTab); // Display the current tab
function add_more_script(){
  var num = info.script.length
  var tabs= document.getElementsByClassName('tab')
  if(tabs.length < num){
    for(let i = tabs.length; i != num; i++ ){
      var newNode = tabs[0].cloneNode(true)
      document.getElementById("regForm").appendChild(newNode)
      var span = document.createElement('span')
      var text = document.createTextNode("")
      span.appendChild(text)
      span.classList.add('step')
      document.getElementById("step_count").appendChild(span)
    }
  }else if(tabs.length > num){
    while(document.querySelectorAll('.tab').length != num){
      let re_defined = document.querySelectorAll('.tab')
      let steps = document.querySelectorAll('.step')
      document.getElementById("regForm").removeChild(re_defined[re_defined.length - 1])
      document.getElementById("step_count").removeChild(steps[steps.length - 1])
    }
  }
}

add_more_script()
showTab(currentTab, pre=true)

function showTab(n, pre=false) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block"
  // ... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Lưu lại";
  } else {
    document.getElementById("nextBtn").innerHTML = "Kế tiếp";
  }
  const script_num_label = document.getElementById('script_num_label')
  script_num_label.innerHTML = `Script ${n + 1}`
  // ... and run a function that displays the correct step indicator:
  if(pre == true){
    display_pre_tab(currentTab)
  }
  fixStepIndicator(n)
}

//fix submit event
 function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  saving_script(currentTab)
  if (n == 1 && !validateForm()) {
    alert("Bạn phải nhập đầy đủ dữ liệu để tiếp tục!")
    return false;
  }
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    submit()
    return
  }
  initiation()
  showTab(currentTab, pre=true)
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab")
  keys = document.querySelectorAll(".key")
  // A loop that checks every input field in the current tab:
  for(let i = 0; i < keys.length; i++){
    if(keys[i].checked){
      valid = true
    }
  }
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "")
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active"
}

const num_script_selecter = document.getElementById("select_num_of_script")
num_script_selecter.addEventListener('change', add_more_script)

function initiation(){
  const comps = Array.from(document.querySelectorAll('.comp'))
  comps.forEach(comp => comp.style.display = 'none')
  const fb_tpl_type = Array.from(document.querySelectorAll('.fb_tpl_type'))
  fb_tpl_type.forEach(comp => comp.style.display = 'none')
  var fb_tpl_type_selected = 'generic'
  const num_of_script = document.querySelector('#select_num_of_script')
  const intent = document.querySelector('#select_intent')
  intent.addEventListener('change', change_num_of_script)

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

  function change_num_of_script(e){
    var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this)
    var type = elem.value || elem.options[elem.selectedIndex].value
    var div_of_intent = document.querySelector('#div_select_intent_of_script div')
    if(type == 'question'){
      window.open('/script/add/question', '_self')
    }
  }
}

function display_del_button(del_button, add_button, display = true){
  if(display == true){
    del_button.classList.add('col-4')
    del_button.style.display = 'block'
    add_button.classList.remove('col-12')
    add_button.classList.add('col-8')
  }else{
    del_button.classList.remove('col-4')
    del_button.style.display = 'none'
    add_button.classList.remove('col-8')
    add_button.classList.add('col-12')
  }
}

function display_info(){
  document.getElementById('inputID').value = info.id
  document.getElementById('inputTriggers').value = info.triggers.join(', ')

  var vars = []
  info.variables.forEach(function(variable){
      let reg = new RegExp(/\W/g)
      vars.push(variable.replace(reg, ""))
  })
  document.getElementById('inputVariables').value = vars.join(', ')

  document.getElementById("select_num_of_script").value = info.script.length
}

display_info(info)