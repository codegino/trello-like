(function(){
	const currentDocument = document.currentScript.ownerDocument;

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

			let isNull = inputField.value.trim() === 0;

			let event = new CustomEvent("AddNewColumn",{
				detail : {
					title : inputField.value.trim()
				},
				bubbles: true
			});
			self.dispatchEvent(event);
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
			this.existingColumns = [];
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