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
    return null;
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
	document.getElementById('inputCommand').value = (info.command)?info.command:'N/A'
	document.getElementById('inputDescription').value = (info.description)?info.description:'N/A'
	document.getElementById('inputID').value = info.id

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

	document.getElementById('inputName').value = (info.name)?info.name:'N/A'
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
	if(type_of_script(info.scripts) == true){
		select_type_script[1].checked = true
		display(2)
	}else{
		select_type_script[0].checked = true
		display(1)
	}
}

function type_of_script(input){
	if(typeof(input) == 'array'){
		input.forEach(ele, type_of_script(ele))
	}else if(typeof(input) == 'object'){
		if('question' in input) return true
	}

	return false
}

execInfo(cookie)