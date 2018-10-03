(function(){
	const currentDocument = document.currentScript.ownerDocument;

	function saveNewColumn(self, newColumnTitle) {
		fetch('http://localhost:3000/columns', {
			method: 'POST',
			headers : {
				'Accept': 'application/json',
				'Content-Type' : 'application/json'
			},
			body: JSON.stringify({
				title : newColumnTitle
			})
		})
		.then(res => res.json()
		).then(res => {
			let event = new CustomEvent("AddNewColumn",{
				bubbles: true
			})
			self.dispatchEvent(event)
		}).catch(
		err => console.log(err));
	}

	function createContainer(self){
		let addContainer = currentDocument.createElement('div');
		addContainer.className = 'new-column-container';

		let spanContainer = currentDocument.createElement('span');
		spanContainer.innerText = 'Add a new column';

		spanContainer.onclick = (e) => {
			addContainer.classList.add('active');
			inputField.hidden = false;
			inputField.focus();
			buttonContainer.hidden = false;
		}


		let inputField = currentDocument.createElement('input');
		inputField.className = 'new-column-title';
		inputField.hidden = true;
		inputField.placeholder = 'Enter column title...';

		let buttonContainer = currentDocument.createElement('div');
		buttonContainer.className = 'button-container';
		buttonContainer.hidden = true;

		let addButton = currentDocument.createElement('div');
		addButton.className = 'add-button';
		addButton.innerText = 'Save';

		let cancelButton = currentDocument.createElement('img');
		cancelButton.className = 'cancel-button';

		cancelButton.onclick = () => {
			addContainer.classList.remove('active');
			inputField.hidden = true;
			inputField.focus();
			buttonContainer.hidden = true;
		}

		addButton.onclick = () => {

			let columnTitle =  inputField.value.trim();
			columnTitle = columnTitle.replace(/ +/g, " ");

			let isNull = columnTitle.trim().length === 0;
			let isDuplicate = false;

			self.columns.forEach(c => {
				if(columnTitle.toLowerCase() === c.title.toString().toLowerCase()) {
					isDuplicate = true;
				}
			});

			if(isNull) {
				alert('Column title should at least contain 1 character');
			}

			if(isDuplicate) {
				alert('Column title already exist');
			}

			if(!isDuplicate && !isNull){
				saveNewColumn(self, columnTitle);
			}
		}

		buttonContainer.appendChild(addButton);
		buttonContainer.appendChild(cancelButton);

		addContainer.appendChild(inputField);
		addContainer.appendChild(buttonContainer);
		addContainer.appendChild(spanContainer);

		return addContainer;
	}

	class NewColumn extends HTMLElement {
		constructor(){
			super();
			this.columns = [];
	}

	connectedCallback() {
		const shadowRoot = this.attachShadow({ mode : 'open'});
		const template = currentDocument.querySelector('#new-column-template');
		const instance = template.content.cloneNode(true);

		shadowRoot.appendChild(instance);
		this.render();
	}

	render(){
		let divElem = this.shadowRoot.querySelector('.new-column-wrapper');
		divElem.innerHtml = '';

		let container = createContainer(this);
		divElem.appendChild(container);

	}
}
customElements.define('new-column', NewColumn);
})()