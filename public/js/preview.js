const feedback_content = document.getElementById('preview-div')

//hiển thị tin nhắn text
function display_text_message(ul, from ,text ){
    var li = document.createElement('li')
    li.innerHTML = text
    if(from == 'member'){
        li.classList.add('him')
    }else{
        li.classList.add('me') 
    }
    ul.appendChild(li)
}

//hiển thị tin nhắn đính kèm file (khác img)
function display_file_message(ul, from, url){

    var li = document.createElement('li')
    if(from == 'member'){

        li.classList.add('him')
    }else{

        li.classList.add('me')
    }
    li.innerHTML = url
    ul.appendChild(li)
}

function display_template_generic(ul, from, url){

}

var template = {
	messages: [
	    {
	    attachment:{
	      type:"template",
	      payload:{
	        template_type:"generic",
	        elements:[
	        	{
			        title: "Hello",
			        subtitle: "Hello, too!",
			        image_url: "https://drive.google.com/open?id=1nDf3ugfEjHYscy5lpooBjlcKIChzIPYk",
			        default_action: {
			        	type: "web_url",
			        	url: "https://google.com.vn",
			        	webview_height_ratio: "FULL"
			        },
			        buttons:[
			          {
			            type:"web_url",
			            url:"https://www.messenger.com",
			            title:"Visit Messenger"
			          }
			        ]
		    	}
	    	]
				}
	    	}
	    }
	]
}

async function display_preview(){
	var data = await create_submit_data()
	console.log(data)
    var preview_ul = document.querySelector('#preview-div ul')
    while (preview_ul.firstChild) {
        preview_ul.removeChild(preview_ul.firstChild)
    }
    display_text_message(preview_ul, 'member', '<i class="fas fa-ellipsis-h"></i>')
        
    // if(data.type == 'text'){
    //     display_text_message(preview_ul, 'me', data.text_content)
    // }else{
    //     display_template_generic(preview_ul, 'me', data.attachment.payload)
    // }
    display_text_message(preview_ul, 'me', data.messages[0].dynamic_text.text)
}

document.getElementById('preview_button').addEventListener('click', display_preview)