(function(){
	const currentDocument = document.currentScript.ownerDocument;


	class SearchBar extends HTMLElement {
		constructor() {
			super();
		}

		connectedCallback(){
			const shadowRoot = this.attachShadow({ mode : 'open'});
			const template = currentDocument.querySelector('#search-bar-template');
			const instance = template.content.cloneNode(true);

			shadowRoot.appendChild(instance);

			this.render();
		}

		render() {
			let divElement = this.shadowRoot.querySelector('.search-bar-container');
			divElement.innerHtml = '';

			//Create a seach field 
			let searchField = currentDocument.createElement('input');
			searchField.placeholder = 'Search';
			searchField.className = 'search-field';

			//Add an on change event for the search field
			searchField.oninput = () => {
				let event = new CustomEvent("SearchingCard", {
					searchQuery : this.value
				});
				this.dispatchEvent(event);
			}

			divElement.appendChild(searchField);
		}
	}

	customElements.define('search-bar', SearchBar);
})()