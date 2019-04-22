(function(){
	console.log('Hello')
	axios.get('/script',{
		headers:{
			'Content-Type': 'application/json',
			}
		}).then(function(response){
			var a = JSON.stringify(response.data)
			showOut(a)
		}).catch(function(error){
			console.log(error)
		})
})()
function showOut(items){
	var table_body = document.getElementById('table_body')
	var a = JSON.stringify(items)

	for(let i of a){
		let row = table_body.insertRow(index + 1)
		
		var cell0 = row.insertCell(0)
		var cell1 = row.insertCell(1)
		var cell2 = row.insertCell(2)
		var cell3 = row.insertCell(3)
		
		cell0.innerHTML = i.command
		cell1.innerHTML = i.description
		cell2.innerHTML = i.id
		cell3.innerHTML = i.name
		
	}
}