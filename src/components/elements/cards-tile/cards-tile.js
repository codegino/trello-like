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

		cardDiv.appendChild(columnTitle);

		let cardTemplate = currentDocument.createElement('cards-container');
		cardTemplate.id = `cards-container-${column.id}`;
		cardDiv.appendChild(cardTemplate);

		let newCardTemplate = currentDocument.createElement('new-card'); //Add template for a new card container
		newCardTemplate.id = `new-card-comp-${column.id}`;
		cardDiv.appendChild(newCardTemplate);

		return cardDiv;
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

			let addNewColumnTemplate = currentDocument.createElement('new-column');
			divElem.appendChild(addNewColumnTemplate);

			this.shadowRoot.addEventListener("AddNewColumn", (e) => {
				console.log(e.detail.title);
			});

			this.shadowRoot.addEventListener("AddNewCard", (e) => {
				this.refreshData(e.detail.columnId);
			});
		}


		//Populate data of card container
		populateData(columnId) {
			let cardsContainer = this.shadowRoot.querySelector(`#cards-container-${columnId}`);
			cardsContainer.columnId = columnId;
			cardsContainer.cardsList = this.cardsList;
			cardsContainer.populateCardData();

			let newCardComponent = this.shadowRoot.querySelector(`#new-card-comp-${columnId}`);
			newCardComponent.columnId = columnId;
			newCardComponent.cardsList = this.cardsList;
		}

		//call this method to refresh data of card container component
		refreshData(columnId) {
			let cardsContainer = this.shadowRoot.querySelector('#cards-container-'+ columnId);
			cardsContainer.refresh(columnId);
		}
	}
	customElements.define('cards-tile', Cards);
})()