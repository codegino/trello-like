(function(){
	const currentDocument = document.currentScript.ownerDocument;

	class Cards extends HTMLElement{
		constructor() {
			super();
		}

		connectedCallback() {
			const shadowRoot = this.attachShadow({ mode : 'open'});
			const template = currentDocument.querySelector('#cards-template');
			const instance = template.content.cloneNode(true);

			shadowRoot.appendChild(instance);
		}
	}
	customElements.define('cards-tile', Cards);
})()