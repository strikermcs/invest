const Modal = (function () {
	// debugger;
	const model = {
		MyBox: '<div id="my_box" style="display:none;"></div>',
		Modal: '<div id="overlay"><div id="overlay__modal"></div></div>',
		ModalHiden: 1,
		Output: 0,
		OutputShow: 0,
		CloseButton: '<div id="buttonCloseModal">✖</div>',
	}

	const view = {

		MyBoxCreate: function () {
			const my_box = model.MyBox;
			const body = document.getElementsByTagName('body')[0];
			body.insertAdjacentHTML("beforeEnd", my_box);
		},
		ModalCreate: function () {
			const body = document.getElementsByTagName('body')[0];
			const modal = model.Modal;
			body.insertAdjacentHTML("beforeEnd", modal);
			const modalElem = document.getElementById('overlay');
			controller.addEvent(modalElem, 'click', view.modalHide);
		},
		modalShow: function () {
			if (model.ModalHiden == 1) {
				const modalElem = document.getElementById('overlay');
				modalElem.style.setProperty('display', 'flex');
				model.ModalHiden = 0;
				view.animateCss(modalElem, 'fadeIn');
				const body = document.getElementsByTagName('body')[0];
				Main.view.bodyScrollParam('scroll-delete');
			}
		},
		modalHide: function (e) {
			if (Forms.model.Send == 0) {
				const modalOverlay = document.getElementById('overlay');
				const buttonCloseModal = document.getElementById('buttonCloseModal');
				const modalElem = document.getElementById('overlay__modal');
				if (e.target === modalOverlay || e.target === buttonCloseModal || e === 'close') {
					view.animateCss(modalElem, 'zoomOut');
					view.animateCss(modalOverlay, 'fadeOut');
					window.setTimeout(function () {
						modalOverlay.style.setProperty('display', 'none');
						model.ModalHiden = 1;
						view.removeElemChilds(modalElem);
					}, 1000);
					model.Output = 0;
					model.OutputShow = 0;
					const body = document.getElementsByTagName('body')[0];
					Main.view.bodyScrollParam('scroll-add');
				}
			}
		},
		outputCreate: function () {
			if (model.Output != 1) {
				const modalElem = document.getElementById('overlay__modal');
				const output = document.createElement('DIV');
				output.setAttribute('id', 'modal__output');
				modalElem.append(output);
				model.Output = 1;
				view.addModalButtonClose();
			}
		},
		addModalButtonClose: function () {
			if (model.Output = 1) {
				const elementOutput = document.getElementById('modal__output');
				const buttonClose = model.CloseButton;
				elementOutput.insertAdjacentHTML("afterBegin", buttonClose);
				const buttonCloseElem = document.getElementById('buttonCloseModal');
				controller.addEvent(buttonCloseElem, 'click', view.modalHide);
			}
		},
		outputStyleOk: function () {
			const elementOutput = document.getElementById('modal__output');
			elementOutput.classList.add('output-ok');
		},
		outputStyleError: function () {
			const elementOutput = document.getElementById('modal__output');
			elementOutput.classList.add('output-error');
		},
		messageOutput: function (msg) {
			const elementOutput = document.getElementById('modal__output');
			if (model.OutputShow == 1) {
				view.animateCss(elementOutput, 'zoomOut');
				setTimeout(function () {
					setTimeout(function () {
						elementOutput.innerHTML = msg;
						view.animateCss(elementOutput, 'zoomIn');
						view.addModalButtonClose();

						const myform = elementOutput.getElementsByTagName('form');
						if (myform.length > 0) { // Если ответ содержит новую форму, инициализируем ее
							controller.addEvent(myform[0], 'submit', Forms.controller.sendAjaxRequest);
						}

					}, 100);
					elementOutput.innerHTML = '';
				}, 500);
			} else {
				elementOutput.innerHTML = msg;

				const myform = elementOutput.getElementsByTagName('form');
				if (myform.length > 0) { // Если ответ содержит новую форму, инициализируем ее
					controller.addEvent(myform[0], 'submit', Forms.controller.sendAjaxRequest);
				}

				view.animateCss(elementOutput, 'zoomIn');
				view.addModalButtonClose();
				model.OutputShow = 1;
			}

		},
		elementInOutput: function (elem) {
			view.outputCreate();
			view.outputStyleOk();
			const elementOutput = document.getElementById('modal__output');
			if (elementOutput) {
				elementOutput.append(elem);
				const myform = elementOutput.getElementsByTagName('form');
				if (myform.length > 0) {
					controller.addEvent(myform[0], 'submit', Forms.controller.sendAjaxRequest);
				}
				view.animateCss(elementOutput, 'zoomIn');
				model.OutputShow = 1;
				view.modalShow();
			}
		},
		removeElemChilds: function (node) {
			let last;
			while (last = node.lastChild) {
				node.removeChild(last);
			}
		},
		animateCss: function (el, animationName) {
			el.classList.add("animated", animationName);
			window.setTimeout(function () {
				el.classList.remove(animationName)
			}, 1000);

		},
		animateAddRemove: function (el, animationName) {
			el.classList.add("animated", animationName);
			window.setTimeout(function () {
				el.classList.remove("animated", animationName)
			}, 5000);

		},
		modalShowBlockElem: function (e) {

			const blockTargetId = e.target.getAttribute('data-blockTargetId');
			const block = document.querySelector('[data-block_id="' + blockTargetId + '"]');

			const blockClone = block.cloneNode(true);
			blockClone.style.setProperty('display', 'flex');
			controller.addEvent(blockClone, 'submit', Forms.controller.sendAjaxRequest); 

			const arrButtonClose = blockClone.getElementsByClassName('error-valid-close'); 
			if (arrButtonClose.length) {
				for (let i = 0; i < arrButtonClose.length; i++) {
					controller.addEvent(arrButtonClose[i], 'click', Forms.view.hideErrorMessage); 
				}
			}

			const my_box = document.getElementById('my_box');
			blockClone.setAttribute('data-show', '1');
			my_box.append(blockClone);


		},
		messageReplaceBlock: function (message) {

			let tmpl = new DOMParser().parseFromString(message, 'text/html');
			let newElement = tmpl.querySelectorAll("[data-replace]")[0];

			let replace_id = newElement.getAttribute('data-replace');
			let oldElement = document.querySelector('[data-replace="' + replace_id + '"]');

			view.animateAddRemove(oldElement, 'fadeOutLeft');
			view.animateAddRemove(newElement, 'fadeInRight');

			window.setTimeout(function () {
				oldElement.replaceWith(newElement);

				let myform = document.querySelector('[data-replace="' + replace_id + '"]');

				if (myform) {
					controller.addEvent(myform, 'submit', Forms.controller.sendAjaxRequest);
				}
				view.modalHide('close');
			}, 1000);
		},

	}



	const controller = {

		init: function () {

			view.MyBoxCreate();
			view.ModalCreate();
			controller.observation();

			const buttonModalShowBlockElems = document.querySelectorAll('[data-modal]'); 
			for (let i = 0, c = buttonModalShowBlockElems.length; i < c; i++) {
				let buttonModalShowBlockElem = buttonModalShowBlockElems[i];
				controller.addEvent(buttonModalShowBlockElem, 'click', view.modalShowBlockElem);
			}


			return false;
		},
		addEvent: function (elem, type, handler) {
			if (elem.addEventListener) {
				elem.addEventListener(type, handler, false);
			} else {
				elem.attachEvent('on' + type, handler);
			}

			return false;
		},
		observation: function () {

			const observed = document.getElementById('my_box'); // выбираем нужный элемент

			// создаем конфигурации
			const config = {
				childList: true,
				attributes: true,
				characterData: false,
				subtree: true,
				attributeOldValue: false,
				characterDataOldValue: false
			};

			// создаем новый экземпляр
			const observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					if (mutation.addedNodes.length) {
						for (let i = 0; i < mutation.addedNodes.length; i++) {
							let target = mutation.addedNodes[i];
							if (target.getAttribute('data-show') === '1') {
								view.elementInOutput(target);
							}
							else if (target.getAttribute('data-show') === '0') {
								view.modalHide('close');
								view.removeElemChilds(observed);
							}
						}
					}
				});
			});

			observer.observe(observed, config); // запускаем
		}
	}



	controller.addEvent(window, 'load', controller.init);

	return {
		view: view
	}


}());