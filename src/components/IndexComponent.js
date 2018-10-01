(function (){
	const currentDocument = document.currentScript.ownerDocument;

	//Component for the index page
	class IndexComponent extends HTMLElement {
		constructor () {
			super();
		}

		connectedCallback() {
			const shadowRoot = this.attachShadow({ mode : 'open'});
			const template = currentDocument.querySelector('#index-component-template');
			const instance = template.content.cloneNode(true);

			shadowRoot.appendChild(instance);
		}
	}
	customElements.define('index-component', IndexComponent);
})()