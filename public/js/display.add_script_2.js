window.localStorage.clear()
var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab
function add_more_script(e){
  var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this)
  var num = elem.value || elem.options[elem.selectedIndex].value
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
  showTab(currentTab)
}

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
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  const script_num_label = document.getElementById('script_num_label')
  script_num_label.innerHTML = `Script ${n + 1}`
  // ... and run a function that displays the correct step indicator:
  // if(pre == true){
  //   display_pre_tab(currentTab)
  // }
  fixStepIndicator(n)
}
//fix submit event
function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  saving_script(currentTab)
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    submit()
  }
  if(n == -1){
    showTab(currentTab, pre=true)
  }else{
    showTab(currentTab)
  }
  initiation()
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = false;
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

function exec_text(data, output){

  output.type = 'text'
  output.response = data.text_content
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

function saving_script(n){
  var save = {}
  var formData = new FormData(document.querySelector('form'))

  var data = {}
  for (var pair of formData.entries()) {
      data[pair[0]] = pair[1]
  }

  switch (data.script) {
    case 'text':
      save = exec_text(data, save)
      break;
    case 'fb_template':
      save = exec_fb_template(data, save)
      break;
    case 'image':
      save = exec_image(data, save)
      break;
    default:
      break
    }
  var save = JSON.stringify(save)
  var checked = window.localStorage.getItem(`script${n}`)
  if(checked != undefined || checked != save){
    window.localStorage.setItem(`script${n}`, save)
  }
}

function submit(){
  alert('sending')
  var submit_data = {}
  var formData = new FormData(document.querySelector('form'))

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
  submit_data.type = data.type
  submit_data.script = []
  for(let i = 0; window.localStorage.getItem(`script${i}`)!= undefined; i++){
    submit_data.script.push(JSON.parse(window.localStorage.getItem(`script${i}`)))
  }

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

  location.reload()
}

// function display_pre_tab(n){
//   var data = window.localStorage.getItem(`script${n}`)
//   data = JSON.parse(data)
//   switch (data.script) {
//     case "text":
//       display_text(data)
//       // statements_1
//       break;
//     case "template":
//       display_fb_template(data.attachment.payload)
//       break;
//     case "image":
//       // statements_1
//       display_image(data)
//       break;
//     default:
//       // statements_def
//       break;
//   }
//   var selected = document.querySelector(`div[data-key="${data_key}"]`)
//   selected.style.display = 'block'
// }

// function display_text(data){
//   document.getElementById('inputReply').value = data.response
// }

//starting from script.attachment.payload
// function display_fb_template(data){
//   document.getElementById('fb_template_type').value = data.template_type
//   var selected = document.querySelector(`div[data-type="${data_type}"]`)
//   selected.style.display = 'block'
//   // switch (data.template_type) {
//   //   case "generic":
//   //     document.getElementById()
//   //     break;
//   //   default:
//   //     // statements_def
//   //     break;
//   // }
// }

// function display_image(data){
//   document.getElementById('inputImageURL').value = data.image_url
// }

const num_script_selecter = document.getElementById("select_num_of_script")
num_script_selecter.addEventListener('change', add_more_script)

