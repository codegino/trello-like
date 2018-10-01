(function(){
	const currentDocument = document.currentScript.ownerDocument;

	//Fetch all cards 
	function fetchCards(self) {
		fetch('http://localhost:3000/cards')
		.then((response) => response.json())
		.then((responseText) => {
			self.cardsList = responseText; //Set the cards list
			self.render(); //Perform rendering of card tiles
		}).
		catch((error) => {
			console.log(error);
		});
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
			//Fetch all columns for cards
			fetch('http://localhost:3000/columns')
			.then((response) => response.json())
			.then((responseText) => {
				this.columns = responseText;
				fetchCards(this); //Initialize fetching of cards
			})
			.catch((error) =>{
				console.log(error);
			});
		}

		render(){
			let divElem = this.shadowRoot.querySelector('.card-list');
			divElem.innerHtml = '';
		}
	}
	customElements.define('cards-tile', Cards);
})()