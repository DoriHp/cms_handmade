
function exec_text(data, output = {}){
  console.log(data.id_next_script)
  output.type = 'text'
  output.question = data.text_content
  output.next_script= data.id_next_script
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

function exec_image(data, output = {}){
  output.type = 'image'
  output.attachment = {}
  output.attachment.type = 'image'
  output.attachment.payload = {}
  output.attachment.payload.url = data.image_url
  output.attachment.payload.is_reusable = 'true'

  return output
}

function exec_fb_template(data, output = {}){
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

document.getElementById('chooseFile').addEventListener('change', function (e) {
    var image = this.value.replace(/.*[\/\\]/, '');
  var display = document.getElementById('inputImageURL_generic')
  var formData = new FormData()
  formData.append("image", e.target.files[0])
  axios.post('/broadcast/upload', formData,
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

function submit(){
  var submit_data = {}
  var formData = new FormData(document.querySelector('form'))

  var data = {}
  for (var pair of formData.entries()) {
      data[pair[0]] = pair[1]
  }
  submit_data._id = info._id
  submit_data.id = data.id
  submit_data.type = 'question'
    //tao array cua trigger
  var array_triggers = []
  data.triggers.split(',').forEach(function(trigger){
    array_triggers.push(trigger.trim())
  })
  switch (data.script) {
    case 'text':
      submit_data.script = exec_text(data)
      break;
    case 'quick_reply':
      submit_data.script = exec_question(data) 
      break
    case 'template':
      submit_data.script = exec_fb_template(data)
      break;
    case 'image':
      submit_data.script = exec_image(data)
      break;
    default:
      break
  }
  submit_data.triggers = array_triggers
  var vars = []
  for(let i of data.variables.split(',')){
    i = '{{' + i.trim() + '}}'
    vars.push(i)
  }
  submit_data.variables = vars
  submit_data.response_mapping = []
  for(i = 1; typeof data[`res_mapping${i}`] !== 'undefined'; i++ ){
    let res = []
    data[`res_mapping${i}`].split(',').forEach(ele => {
      res.push(ele.trim())
    })
    submit_data.response_mapping.push({responses: res, next_script: data[`res_payload${i}`]})
  }
  console.log(submit_data)
  // submit_data.intent = ""
  // submit_data.entities = []
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
        
    }
  }else{
    alert("Dữ liệu không thay đổi!")
  }
}


document.getElementById("saver").addEventListener('click', function(){
  submit()
})
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

function del_script(){
  axios.delete(`../delete/${info._id}`)
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