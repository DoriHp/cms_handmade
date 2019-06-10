
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
      for(i = 1; typeof data[`style_of_button_${i}_button`] !== 'undefined'; i++ ){
        if(data[`style_of_button_${i}_button`] == 'web_url'){
          output.attachment.payload.buttons.push({type: 'web_url', url: data[`URL_button_${i}_button`], title: data[`title_button_${i}_button`]})
        }else{
          output.attachment.payload.buttons.push({type: 'postback', payload: data[`URL_button_${i}_button`], title: data[`title_button_${i}_button`]})
          }
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

function submit(){
  var submit_data = {}
  var formData = new FormData(document.querySelector('form'))

  var data = {}
  for (var pair of formData.entries()) {
      data[pair[0]] = pair[1]
  }
  // submit_data._id = info._id
  submit_data.id = data.id
  submit_data.type = 'response'
    //tao array cua trigger
  var array_triggers = []
  data.triggers.split(',').forEach(function(trigger){
    array_triggers.push(trigger.trim())
  })
  submit_data.triggers = array_triggers
  var vars = []
  if(data.variables !== ""){
    for(let i of data.variables.split(',')){
      i = '{{' + i.trim() + '}}'
      vars.push(i)
      submit_data.variables = vars
    }
  }else{
    submit_data.variables = []
  }
  submit_data.script = []
  for(let i = 0; window.localStorage.getItem(`script${i}`)!= undefined; i++){
    submit_data.script.push(JSON.parse(window.localStorage.getItem(`script${i}`)))
  }
  console.log(submit_data)
  
  if(!deepCompare(submit_data, info)){
    var save = confirm("Bạn chắc chắn muốn lưu thay đổi?")
    if(save == true){
      axios.put(`/script/update/${info._id}`,{
        headers: {
          'Content-Type': 'application/json',
        },
        data: submit_data
      }).then(function(response){
        if(response.status == 200){
          alert("Lưu thay đổi thành công!")
        }else{
          alert("Lưu thay đổi thất bại!")
        }
      }).catch(function(error){
        console.log(error)
      })

      location.reload()
    }else{
      currentTab = currentTab - 1
    }
  }else{
    alert("Dữ liệu không thay đổi!")
    currentTab = currentTab - 1
  }
}

function display_pre_tab(n){
  var script_info = document.getElementById("script_info")
  script_info.querySelectorAll(".comp input").forEach(input => input.value = "")
  script_info.querySelectorAll(".num_of_button").forEach(button => button.value = "1")
  var data = info.script[n]
  if(data != undefined){
    var keys = document.getElementsByClassName("key")
    if(data.type){
      switch (data.type) {
        case "text":
          document.querySelector(`div[data-key="1"]`).style.display = 'block'
          display_text(data)
          // statements_1
          break;
        case "template":
          document.querySelector(`div[data-key="2"]`).style.display = 'block'
          display_fb_template(data.attachment.payload)
          break;
        case "image":
          document.querySelector(`div[data-key="3"]`).style.display = 'block'
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
      document.getElementById("inputImageURL_media").value = data.url
      break
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
  }
}

function display_image(data){
  document.getElementById('inputImageURL').value = data.attachment.payload.url
}

function del_script(){
  var confirmation = confirm("Bạn chắc chắn muốn xóa dữ liệu?")
  if(confirmation == true){
    axios.delete(`/script/delete/${info._id}`)
    .then(function(response){
      if(response.status == 200){
        alert('Xóa script thành công')
        window.close()
      }else{
        alert('Đã có lỗi xảy ra!')
      }
    })
    .catch(function(error){
      console.log(error)
    })
  }
}

//compare before and after
function deepCompare () {
  var i, l, leftChain, rightChain;

  function compare2Objects (x, y) {
    var p;

    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
         return true;
    }

    if (x === y) {
        return true;
    }

    if ((typeof x === 'function' && typeof y === 'function') ||
       (x instanceof Date && y instanceof Date) ||
       (x instanceof RegExp && y instanceof RegExp) ||
       (x instanceof String && y instanceof String) ||
       (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    // At last checking prototypes as good as we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x.prototype !== y.prototype) {
        return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
         return false;
    }

    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        switch (typeof (x[p])) {
            case 'object':
            case 'function':

                leftChain.push(x);
                rightChain.push(y);

                if (!compare2Objects (x[p], y[p])) {
                    return false;
                }

                leftChain.pop();
                rightChain.pop();
                break;

            default:
                if (x[p] !== y[p]) {
                    return false;
                }
                break;
        }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {

      leftChain = []; //Todo: this can be cached
      rightChain = [];

      if (!compare2Objects(arguments[0], arguments[i])) {
          return false;
      }
  }

  return true;
}