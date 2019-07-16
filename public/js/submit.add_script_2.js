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
  output.attachment.type = data.script
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
      for(i = 1; typeof data[`style_of_button_${i}_generic`] !== 'undefined'; i++ ){
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
  var formData = new FormData(document.querySelector('#form_info'))

  var data = {}
  for (var pair of formData.entries()) {
      data[pair[0]] = pair[1]
  }

  switch (data.script) {
    case 'text':
      save = exec_text(data, save)
      break;
    case 'template':
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

document.getElementById('chooseFile').addEventListener('change', function (e) {
  var image = this.value.replace(/.*[\/\\]/, '');
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
    else{
      alert('Tải ảnh lên thất bại!')
    }   
  }).catch(function(error){
    alert('An error occured!')
  })
})

document.getElementById('chooseFile2').addEventListener('change', function (e) {
  var image = this.value.replace(/.*[\/\\]/, '');
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
    else{
      alert('Tải ảnh lên thất bại!')
    }   
  }).catch(function(error){
    alert('An error occured!')
  })
})

function create_submit_data(){
  saving_script(currentTab)
  var submit_data = {}
  var formData = new FormData(document.querySelector('#form_info'))

  var data = {}
  for (var pair of formData.entries()) {
      data[pair[0]] = pair[1]
  }
  submit_data.id = data.id
  submit_data.type = 'response'
    //tao array cua trigger
  var array_triggers = [];
  for(i = 0; typeof data[`trigger${i}`] !== 'undefined'; i++){
      array_triggers.push(data[`trigger${i}`])
  }
  submit_data.triggers = array_triggers
  var vars = data.variables.split('')
  vars.forEach(variable => '{{' + variable + '}}')
  submit_data.variables = vars
  submit_data.script = []
  for(let i = 0; window.localStorage.getItem(`script${i}`)!= undefined; i++){
    submit_data.script.push(JSON.parse(window.localStorage.getItem(`script${i}`)))
  }

  return submit_data
}

function submit(){
  var submit_data = create_submit_data()

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

function display_pre_tab(n){
  var script_info = document.getElementById("script_info")
  script_info.querySelectorAll(".comp input").forEach(input => input.value = "")
  script_info.querySelectorAll(".num_of_button").forEach(button => button.value = "1")
  var data = window.localStorage.getItem(`script${currentTab}`)
  data = JSON.parse(data)
  if(data != undefined){
    var keys = document.getElementsByClassName("key")
    if(data.type){
      var data_key = 0
      switch (data.type) {
        case "text":
          display_text(data)
          data_key = 1
          // statements_1
          break;
        case "template":
          display_fb_template(data.attachment.payload)
          data_key = 2
          break;
        case "image":
          // statements_1
          display_image(data)
          data_key = 3
          break;
        default:
          // statements_def
          break;
      }
      for(let i = 0; i < keys.length; i++){
        if(keys[i].value == data.type)
          keys[i].checked = true
        else{
          keys[i].checked = false
        }
      }
      var selected = document.querySelector(`div[data-key="${data_key}"]`)
      selected.style.display = 'block'
    }
  }
}

function display_text(data){
  document.getElementById('inputReply').value = data.response
}

//starting from script.attachment.payload
function display_fb_template(data){
  document.getElementById('fb_template_type').value = data.template_type
  switch (data.template_type) {
    case "generic":
      document.getElementById("inputTitle_generic").innerHTML = data.elements[0].title
      document.getElementById("inputSubtitle_generic").innerHTML = data.elements[0].subtitle
      document.getElementById("inputImageURL_generic").innerHTML = data.elements[0].image_url
      document.getElementById("inputDefault_URL_generic").innerHTML = data.elements[0].default_action.url
      var num_of_button = document.querySelector('div[data-type=generic] div div .num_of_button')
      num_of_button.value = data.elements[0].buttons.length
      add_full_button('generic')
      var len_button = document.getElementsByClassName('generic_tpl_button').length
      for(let i = 1; i <= len_button; i++){
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
      break
    case "media":
    default:
      // statements_def
    break;
  }
  var selected = document.querySelector(`div[data-type="${data.template_type}"]`)
  selected.style.display = 'block'
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

function remove_extra_button(fb_tpl_type_selected){
  while(document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`).length != 1){
    let nodes = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
    let last = nodes[nodes.length - 1]
    console.log(nodes.length)
    last.parentNode.removeChild(last)
    i--
  }
}

function display_image(data){
  document.getElementById('inputImageURL').value = data.attachment.payload.url
}