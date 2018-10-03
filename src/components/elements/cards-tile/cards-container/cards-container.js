(function(){
	const currentDocument = document.currentScript.ownerDocument;

	function deleteCard(self , card) {
		fetch('http://localhost:3000/cards/'+ card.id, {
			method : 'DELETE'
		})
		.then(res => res.json())
		.then(res => {
			let event = new CustomEvent("CardDeleted", {
				bubbles : true
			})
			self.dispatchEvent(event)
		})
		.catch(err => console.log(err));
		return false;
	}

	function updateCard(self, data) {
		fetch(`http://localhost:3000/cards/${data.id}` , {
			method : 'PUT',
			headers : {
				'Accept': 'application/json',
					'Content-Type' : 'application/json'
			},
			body : JSON.stringify(data)
		})
		.then(res => res.json())
		.then(res => self.refreshComponent())
		.catch(err => console.log(err));
		return false;
	}

	function autoResize(textarea) {
    	textarea.style.height = (textarea.scrollHeight)+"px"
	}

	function resizeTextarea(textarea, isActive) {
		if(isActive) {
			textarea.style.height = (25 + textarea.scrollHeight) + 'px';
			return;
		}
		textarea.removeAttribute('style');
	}

	//Create cards that will be appended to each column
	function createCards(self, card) {
		let div = currentDocument.createElement('div');
		let bubble = false;
		let tempField = '';
		div.className = 'cards';
		div.draggable = true; 
		div.id = 'card_' + card.id;


		//Create card title element
		let cardTitle = currentDocument.createElement('input');
		cardTitle.className= 'card-title';
		cardTitle.value = card.title;
		cardTitle.disabled = true;

		let deleteBtn = currentDocument.createElement('img');
		deleteBtn.className = 'delete-btn';

		let editBtn = currentDocument.createElement('img');
		editBtn.className = 'edit-btn';

		let cancelBtn = currentDocument.createElement('img');
		cancelBtn.className = 'cancel-btn';
		cancelBtn.hidden = true;

		let saveBtn = currentDocument.createElement('div');
		saveBtn.className = 'save-btn';
		saveBtn.hidden = true;
		saveBtn.innerText = 'Save';


		cancelBtn.onclick = (e) => {
			cardTitle.disabled = true;
			cardTitle.value = tempField;
			tempField = '';
			deleteBtn.hidden = false;
			editBtn.hidden = false;
			saveBtn.hidden = true;
			cancelBtn.hidden = true;
			setTimeout(function(){
				bubble = false;
			}, 100);
		}

		saveBtn.onclick = (e) => {
			let isDuplicate = false;
			let isNull = cardTitle.value.trim().length === 0;
			let title = cardTitle.value.trim();
			title = title.replace(/ +/g, " ");

			self.cardsList.forEach(c => {
				if(title.toLowerCase() === c.title.toString().toLowerCase()){
					isDuplicate = true;
				}
			});

			if(isNull) {
				alert('Card title must atleast contain 1 character');
			}

			if(isDuplicate) {
				alert('Card title already exist');
			}

			card.title = title;
			if(!isDuplicate && !isNull) {
				updateCard(self, card);
				deleteBtn.hidden = false;
				editBtn.hidden = false;
				saveBtn.hidden = true;
				cancelBtn.hidden = true;

				setTimeout(function(){
					bubble = false;
				}, 100);
			}
		
		}

		deleteBtn.onclick = (e) => {
			bubble = true;
			deleteCard(self, card);
			setTimeout(function(){
				bubble= false;
			}, 500);
		}


		editBtn.onclick = (e) => {
			e.preventDefault();
			bubble = true;
			cardTitle.disabled = false;
			deleteBtn.hidden = true;
			editBtn.hidden = true;
			saveBtn.hidden = false;
			cancelBtn.hidden = false;
			cardTitle.focus();
			tempField = cardTitle.value;
		}

		div.appendChild(cancelBtn);
		div.appendChild(saveBtn);
		div.appendChild(editBtn);
		div.appendChild(deleteBtn);

		div.appendChild(cardTitle);


		let isActive = false;
		let cardDescription = currentDocument.createElement('textarea');
		cardDescription.className ='card-description';
		cardDescription.innerText = card.description === undefined ? '' : card.description;
		cardDescription.placeholder = 'Place your description here... (optional)';
		cardDescription.setAttribute('cols', 20);


		cardDescription.onfocus = (e) => {
			bubble = true;
		}


		//Automatically saves description onblur of textarea
		cardDescription.onblur = (e) => {
			card.description = e.target.value;
			bubble = updateCard(self, card);
			div.click();
		}

		cardDescription.oninput = (e) => {
			autoResize(cardDescription);
		}

		div.appendChild(cardDescription);

		//onclick event for the card
		div.onclick = (e) => {
			if(bubble) {
				return;
			}
			div.classList.toggle('active');
			isActive = !isActive;
			resizeTextarea(cardDescription, isActive);
		}
		// Drag events for cards
		div.ondragstart = (e) => {
			e.dataTransfer.setData("text", e.target.id);
		}

		div.ondragover = (e) => {
			e.preventDefault();
		}

		div.ondrop = (e) => {
			e.preventDefault();
		}

		div.ondragend = (e) => {
			e.preventDefault();
		}
		//End of drag events


		return div;
	}

	class CardsContainer extends HTMLElement {
		constructor () {
			super();
			this.cardsList = [];
			this.columnId = '';
		}

		connectedCallback() {
			const shadowRoot = this.attachShadow({ mode : 'open'});
			const template = currentDocument.querySelector('#cards-container-template');
			const instance = template.content.cloneNode(true);

			shadowRoot.appendChild(instance);
		}

		populateCardData(){
			let self = this;
			let divElem = this.shadowRoot.querySelector('.cards-list');

			this.cardsList.forEach(card => {
				if(card.columnId == this.columnId) {
					let c = createCards(self ,card);
					divElem.appendChild(c);
				}
			});
		}


		//Refresh component once a transaction is complete
		refreshComponent() {
			let self = this;
			let divElem = self.shadowRoot.querySelector('.cards-list');
			
			while(divElem.firstChild) {
				divElem.removeChild(divElem.firstChild);
			}

			this.cardsList.forEach(card => {
				if(card.columnId == self.columnId) {
					let c = createCards(self, card);
					divElem.appendChild(c);
				}
			});
		}

		refresh(columnId) {
			fetch('http://localhost:3000/cards')
			.then((response) => response.json())
			.then((responseText) => {
				this.cardsList = responseText; //Set the cards list
				this.columnId = columnId;
				this.refreshComponent();
			}).
			catch((error) => {
				console.log(error);
			});
		}
	}

	customElements.define('cards-container', CardsContainer);

})()