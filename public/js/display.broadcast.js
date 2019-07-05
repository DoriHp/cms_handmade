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

const comps = Array.from(document.querySelectorAll('.comp'))
comps.forEach(comp => comp.style.display = 'none')

function display(e){
  comps.forEach(comp => comp.style.display = 'none')
  var data_key = e.target.getAttribute('data-key')
  var selected = document.querySelector(`div[data-key="${data_key}"]`)
  selected.style.display = 'block'
  document.getElementById('submit_button').style.display = 'inline-block'
  document.getElementById('preview_button').style.display = 'inline-block'
}

const keys = Array.from(document.querySelectorAll('.key'))
keys.forEach(key => key.addEventListener('click', display))

function init_generic(){
  (function(){
    document.querySelectorAll('input[type="text"]').forEach(input => input.value = '')
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

  function add_tpl_button(e){
    var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this)
    var num = elem.value || elem.options[elem.selectedIndex].value
    var buttons = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
    var arr_length = Array.from(buttons).length
    if(buttons.length < num){
        for(let i = buttons.length; i != num; i++){
          var nav_button = document.getElementById('nav_button')
          var newNode = buttons[0].cloneNode(true)
          newNode.id = `${fb_tpl_type_selected}_button_${i + 1}`
          document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`).insertBefore(newNode, nav_button)
          let label = document.querySelector(`#${fb_tpl_type_selected}_button_${i + 1} label`)
          label.innerHTML = `Button ${i + 1}`
          let child = document.querySelectorAll(`#${fb_tpl_type_selected}_button_${i + 1} div div input`)
          child[0].placeholder = 'URL | Payload'
          child[0].value = ""
          child[0].name = `URL_button_${i + 1}_${fb_tpl_type_selected}`
          child[1].placeholder = 'Title to display'
          child[1].value = ""
          child[1].name = `title_button_${i + 1}_${fb_tpl_type_selected}`
          let select = document.querySelector(`#${fb_tpl_type_selected}_button_${i + 1} div select`)
          select.name = `style_of_button_${i + 1}_generic`
        }
    }else if(buttons.length > num){
      var parent = document.querySelector(`div[data-type="${fb_tpl_type_selected}"]`)
      while(document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`).length != num){
        let re_define = document.querySelectorAll(`.${fb_tpl_type_selected}_tpl_button`)
        parent.removeChild(re_define[re_define.length - 1])
      }
    }
}

  const num_of_button = document.querySelectorAll('.num_of_button')
  num_of_button.forEach(num => num.value = 1)
  num_of_button.forEach(num => num.addEventListener('change', add_tpl_button))
}

init_generic()