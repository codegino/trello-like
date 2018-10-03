(function(){
	const currentDocument = document.currentScript.ownerDocument;
 	let searchTimeout;

	function delayedSearchCards(self, searchQuery) {
		if(searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(function() {
			searchCard(self, searchQuery);
		}, 1000);
	}

	function searchCard(self, searchQuery) {
		let event = new CustomEvent("SearchQuery", {
			detail : {
				searchQuery : searchQuery
			},
			bubbles : true
		});
		self.dispatchEvent(event);
		searchQuery = '';
	}

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

			//Add a on change event for the search field
			searchField.oninput = (e) => {
				if(e.target.value.trim().length === 0 && e.data === " ") {
					e.preventDefault();
					return;
				}
				delayedSearchCards(this, e.target.value.trim());
			}

			divElement.appendChild(searchField);
		}
	}

	customElements.define('search-bar', SearchBar);
})()