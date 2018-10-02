(function(){
	const currentDocument = document.currentScript.ownerDocument;

	//Update column title
	function updateColumnTitle(self, column) {
		fetch(`http://localhost:3000/columns/${column.id}`, {
			method :  'PUT',
			headers : {
				'Accept': 'application/json',
				'Content-Type' : 'application/json'
			},
			body : JSON.stringify(column)
		})
		.then(res => res.json())
		.then(res => fetchColumns(self))
		.catch(err => console.log(errr));
	}

	function fetchColumns(self) {
		//Fetch all columns for cards
		fetch('http://localhost:3000/columns')
		.then((response) => response.json())
		.then((responseText) => {
			self.columns = responseText;
			fetchCards(self); //fetch card objects
		})
		.catch((error) =>{
			console.log(error);
		});
	}

	//Fetch all cards 
	function fetchCards(self) {
		fetch('http://localhost:3000/cards')
		.then((response) => response.json())
		.then((responseText) => {
			self.cardsList = responseText; //Set the cards list
			self.render(); //Render html elements
		}).
		catch((error) => {
			console.log(error);
		});
	}

	//Create column elements
	function createCardTile(self, column) {
		let cardDiv = currentDocument.createElement('div');
		cardDiv.className = 'card-list-tile';
		cardDiv.id = 'tile_' + column.id;

		let columnTitle = currentDocument.createElement('input');
		columnTitle.className = 'column-title';
		columnTitle.value = column.title;
		columnTitle.disabled = true;

		let editBtn = currentDocument.createElement('img'); //create edit button for column title
		editBtn.className = 'edit-btn';

		let deleteBtn = currentDocument.createElement('img'); //create delete button for column title
		deleteBtn.className = 'delete-btn';

		let saveBtn = currentDocument.createElement('div');
		saveBtn.className = 'save-btn';
		saveBtn.innerText = 'Save';
		saveBtn.hidden = true;

		let cancelBtn = currentDocument.createElement('img');
		cancelBtn.className = 'cancel-btn';
		cancelBtn.hidden = true;


		let tempValue =''; 
		editBtn.onclick = (e) => { //Create event for edit button for column tile
			columnTitle.disabled = false;
			tempValue = columnTitle.value;
			columnTitle.focus();
			deleteBtn.hidden = true;
			cancelBtn.hidden = false;
			saveBtn.hidden = false;
			e.target.hidden = true;
		}

		cancelBtn.onclick = (e) => {
			columnTitle.disabled = true;
			columnTitle.blur();
			editBtn.hidden = false;
			deleteBtn.hidden = false;
			saveBtn.hidden = true;
			e.target.hidden = true;
			columnTitle.value = tempValue;
			tempValue = '';
		}//event for cancel button

		saveBtn.onclick = (e) => {
			let isNull = columnTitle.value.trim().length === 0; //check if inputted column is null or no alphanumeric characters
			let isDuplicate = false;
			self.columns.forEach(c => {
				if(columnTitle.value.trim().toLowerCase() === c.title.toString().trim().toLowerCase()){
					isDuplicate = true;
				}
			});

			if(isNull) {
				alert('Column title must at least contain 1 character');
			}

			if(isDuplicate) {
				alert('Column title already exist');
			}

			if(!isNull && !isDuplicate) {
				column.title = columnTitle.value.trim();
				updateColumnTitle(self, column);
			}

		}//event for updating columns

		cardDiv.appendChild(cancelBtn);
		cardDiv.appendChild(saveBtn);
		cardDiv.appendChild(deleteBtn);
		cardDiv.appendChild(editBtn);

		let cardTemplate = currentDocument.createElement('cards-container'); //mount the card template component
		cardTemplate.id = 'cards-container-' + column.id;

		cardDiv.appendChild(columnTitle);
		cardDiv.appendChild(cardTemplate);

		let addContainer = currentDocument.createElement('div'); //Element for add button
		addContainer.className ='new-card-container';

		let addButton = currentDocument.createElement('div');
		addButton.className = 'btn-label';
		addButton.innerText = 'Add a new card';

		//Add event listener for the add button 
		addButton.onclick = (e) => {
			addContainer.classList.add('hidden');
			cardDiv.classList.add('_active');

			//initialize method in creating a new add form
			let form = createHTMLAddForm(self,addContainer ,cardDiv, column.id);

			cardDiv.appendChild(form);

		}

		addContainer.appendChild(addButton);

		cardDiv.appendChild(addContainer);

		return cardDiv;
	}

	//create a new div for adding card
	function createHTMLAddForm(self, addElement, divElement, columnId) {
			let addForm = currentDocument.createElement('div');
			addForm.className = 'add-form-container';

			let inputField = currentDocument.createElement('input');
			inputField.className = 'input-title-field';
			inputField.autofocus = true;

			let addAndCloseContainer = currentDocument.createElement('div');
			addAndCloseContainer.className = 'add-close-container';

			let addBtn  = currentDocument.createElement('div');
			addBtn.innerText = 'Add Card';
			addBtn.className = 'add-button';

			inputField.focus();
			addBtn.onclick = (e) => {
				addNewCard(self, inputField,columnId);
			}

			let closeBtn = currentDocument.createElement('img');
			closeBtn.className = 'close-button';

			//Add event listener for close btn
			closeBtn.onclick = (e) => {
				addElement.classList.remove('hidden');
				divElement.classList.remove('_active');
				divElement.removeChild(addForm);
			}

			addAndCloseContainer.appendChild(addBtn);
			addAndCloseContainer.appendChild(closeBtn);


			addForm.appendChild(inputField);
			addForm.appendChild(addAndCloseContainer);


			return addForm;
	}

	//Method to add new cards 
	function addNewCard(self, inputField, id) {
		let isDuplicate = false;
		let isNull = inputField.value.trim().length === 0; //Check if user inputted a space value
		let cardsContainer = self.shadowRoot.querySelector('#cards-container-'+ id);
		cardsContainer.cardsList.forEach(card => {

			let title = card.title;
			if (inputField.value.trim().toLowerCase() === title.toString().toLowerCase())   { //Check if there are any duplicates with the current cards 
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
				body: JSON.stringify(
				{
					title : inputField.value.trim(),
					columnId: id
				})
				})
				.then(
					res => res.json()
				).then(
					res => self.refreshData(id) //refresh card container data
				).catch(
					err => console.log(err));
		}

		inputField.value = '';
		inputField.focus();
	}

	class Cards extends HTMLElement{

		constructor() {
			super();
			this.cardsList = [];
			this.columns = [];
		}

		connectedCallback() {
			const shadowRoot = this.attachShadow({ mode : 'open'});
			const template = currentDocument.querySelector('#cards-template');
			const instance = template.content.cloneNode(true);

			shadowRoot.appendChild(instance);

			fetchColumns(this); //Fetch all columns

		}

		render(){
			let divElem = this.shadowRoot.querySelector('.card-list');
			while(divElem.firstChild) {
				divElem.removeChild(divElem.firstChild);
			}

			this.columns.forEach(column => {
				let card = createCardTile(this, column); // Initialize the method that will create a DOM
				divElem.appendChild(card);
			});

			this.columns.forEach(column => {
				this.populateData(column.id);
			});

			let addNewColumnTemplate = currentDocument.createElement('new-column-template');
			divElem.appendChild(addNewColumnTemplate);
		}


		//Populate data of card container
		populateData(columnId) {
			let cardsContainer = this.shadowRoot.querySelector('#cards-container-'+ columnId);
			cardsContainer.columnId = columnId;
			cardsContainer.cardsList = this.cardsList;
			cardsContainer.populateCardData();
		}

		//call this method to refresh data of card container component
		refreshData(columnId) {
			let cardsContainer = this.shadowRoot.querySelector('#cards-container-'+ columnId);
			cardsContainer.refresh(columnId);
		}
	}
	customElements.define('cards-tile', Cards);
})()