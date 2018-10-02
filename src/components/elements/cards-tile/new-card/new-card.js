(function() {
	const currentDocument = document.currentScript.ownerDocument;

	function createContainer(self) {
		let addContainer = currentDocument.createElement('div');
		addContainer.className = 'new-card-container';

		let inputField = currentDocument.createElement('input');
		inputField.className ='new-card-title';
		inputField.autofocus = true;
		inputField.hidden = true;
		inputField.placeholder = 'Enter your card title here...';

		let inactiveLabel = currentDocument.createElement('div');
		inactiveLabel.className = 'inactive-label';
		inactiveLabel.innerText = 'Add a new card';

		let addAndCloseContainer = currentDocument.createElement('div');
		addAndCloseContainer.className = 'add-close-container';


		let addBtn  = currentDocument.createElement('div');
		addBtn.innerText = 'Add Card';
		addBtn.className = 'add-button';

		let closeBtn = currentDocument.createElement('img');
		closeBtn.className = 'close-button';

		addBtn.onclick = (e) => {
			let data = {
				title : inputField.value.trim(),
				columnId : self.columnId
			}

			addNewCard(self, data);
			inputField.value = '';
			inputField.focus();
		}

		closeBtn.onclick = (e) => {
			addContainer.classList.remove('active');
			inactiveLabel.hidden = false;
			inputField.hidden = true;
			inputField.value = '';
		}

		inactiveLabel.onclick = (e) => {
			addContainer.classList.add('active');
			inactiveLabel.hidden = true;
			inputField.hidden = false;
			inputField.focus();
		}

		addAndCloseContainer.appendChild(addBtn);
		addAndCloseContainer.appendChild(closeBtn);

		addContainer.appendChild(inputField);
		addContainer.appendChild(addAndCloseContainer);
		addContainer.appendChild(inactiveLabel);

		return addContainer;
	}

	function addNewCard(self, data) {
		let title =  data.title.toString().toLowerCase().trim();
		title = title.replace(/ +/g, " ");
		data.title = title;
		let isNull = title.length === 0; //check if data has valid character
		let isDuplicate = false;
		self.cardsList.forEach(c => { 
			 if(title  === c.title.toString().toLowerCase()) {
			 	isDuplicate = true;
			 }
		});

		if(isNull) {
			alert('Card title must atleast contain 1 character');
		}

		if(isDuplicate) {
			alert('Card title already exist');
		}

		if(!isDuplicate && !isNull) {
			fetch('http://localhost:3000/cards', {
				method: 'POST',
				headers : {
					'Accept': 'application/json',
					'Content-Type' : 'application/json'
				},
				body: JSON.stringify(data)
			})
			.then(res => res.json()
			).then(res => {
				let event = new CustomEvent("AddNewCard", {
					detail : {
						columnId : self.columnId
					},
					bubbles : true
				})
			self.dispatchEvent(event)
			}).catch(
				err => console.log(err));

		}

	}

	class NewCard extends HTMLElement {
		constructor () {
			super();
			this.cardsList = [];
			this.columnId = '';
		}

		connectedCallback() {
			const shadowRoot = this.attachShadow({ mode : 'open'});
			const template = currentDocument.querySelector('#new-card-template');
			const instance = template.content.cloneNode(true);

			shadowRoot.appendChild(instance);
			this.render();
		}

		render() {
			let divElem = this.shadowRoot.querySelector('.new-card-wrapper');

			let container = createContainer(this);
			divElem.appendChild(container);
		}

	}

	customElements.define('new-card', NewCard);
})()