const Forms = (function () {
	// debugger;
	const model = {

		Send: 0,
		FormType: '', // default, step
		FormOutputType: '', // default, popup,
		HeaderToken: '',
		Form_num: 0 
	}

	const view = {
		tokenSearch: function () {
			let token = document.querySelector('meta[name="csrftoken"]');
			if (token) {
			model.HeaderToken = token.getAttribute('content');
			console.log(model.HeaderToken);
			}
		},
		addHidden: function (theForm, key, value) {
			var input = document.createElement('input');
			input.type = 'hidden';
			input.name = key;
			input.value = value;
			theForm.appendChild(input);
		},
		addHiddenFormName: function (theForm, key) {
			// Проверяем, есть ли уже элемент с именем 'form_name' в форме
			const existingInput = theForm.querySelector('input[name="form_name"]');
			
			if (!existingInput) {
				var input = document.createElement('input');
				input.type = 'hidden';
				input.name = key; 
				model.Form_num = model.Form_num + 1; 
				input.value = 'form_'+ model.Form_num;
				theForm.appendChild(input);
			}
		},	
		addHiddenGet: function (theForm, key, value) {
			var input = document.createElement('input');
			input.type = 'hidden';
			input.name = key; 
			input.value = value;
			theForm.appendChild(input);
		},
		cleanForm: function () {

			let forms = document.getElementsByTagName('form');
			for (let i = 0, c = forms.length; i < c; i++) {
				forms[i].reset();
			}

		},
		cleanErrorMessage: function () {

			let el = document.getElementsByClassName('error-valid');

			if (el.length) {

				for (let i = 0; i < el.length; i++) {
					el[i].innerHTML = '';
					el[i].style.setProperty('display', 'none');
				}
			}

		},
		createButtonErrorMessageClose: function (element) {

			const buttonErrorMessageClose = '<span class="error-valid-close"></span>';
			element.insertAdjacentHTML("afterBegin", buttonErrorMessageClose);
			const arrButtonClose = element.getElementsByClassName('error-valid-close');
	
			for (let i = 0; i < arrButtonClose.length; i++) {
				controller.addEvent(arrButtonClose[i], 'click', view.hideErrorMessage);		
			}
		},
		hideErrorMessage: function (e) {

			const parentBlock = e.target.parentElement;
			const blockId = parentBlock.getAttribute('data-error_id');
			let arrElems = document.querySelectorAll('[data-error_id="' + blockId + '"]'); 

			if (arrElems.length) {
				for (let i = 0; i < arrElems.length; i++) {
					setTimeout(function () {
						arrElems[i].style.setProperty('display', 'none');
					}, 100);
					Modal.view.animateCss(arrElems[i], 'zoomOutLeft');
				}
			}
		},
		createErrorMessage: function (id, message) {

			let el = document.querySelectorAll('[data-error_id="' + id + '"]');

			if (el.length) {

				for (let i = 0; i < el.length; i++) {
					el[i].innerHTML = message;

					el[i].style.setProperty('display', 'flex');
					view.createButtonErrorMessageClose(el[i]);

				}

			}
		},
		testCreateErrorMessage: function (objErrors) {

			let arrErrors = objErrors.id;

			for (var key in arrErrors) {

				let idElement = key;
				let arrMessages = arrErrors[key];
				let message = '';
				if (arrMessages.length > 1) {

					for (let x = 0; x < arrMessages.length; x++) {
						message += x > 0 ? '<br><br>' + arrMessages[x] : arrMessages[x];
					}

				} else {
					message = arrMessages[0];
				}
				message = '<p>' + message + '</p>';
				view.createErrorMessage(idElement, message);
			}

		},
		responseOutput: function (response) {

			if (response) {

					if (response.status == 'OK') {

						if (model.FormType == 'default' && model.FormOutputType == 'popup') {

							Modal.view.outputCreate();
							Modal.view.outputStyleOk();
							Modal.view.messageOutput('<div id="block_info">' + response.message + '</div>'); // 

						} else if (model.FormType == 'step' && model.FormOutputType == 'popup') {

							Modal.view.outputCreate();
							Modal.view.outputStyleOk();
							Modal.view.messageOutput(response.message); // новая форма

						} else if (model.FormType == 'step' && model.FormOutputType == 'default') {

							Modal.view.messageReplaceBlock(response.message);

						} else if (model.FormType == 'default' && model.FormOutputType == 'withoutpopup') {

							model.Send = 0;
							Modal.view.modalHide('close');

						} else {

							Modal.view.outputCreate();
							Modal.view.outputStyleOk();
							Modal.view.messageOutput('<div id="block_info">' + response.message + '</div>');

						}




						if (response.subject == 'basket') {
							Basket.model.clean();
						} else {
							view.cleanForm();
							view.cleanErrorMessage();
						}

						if (response.redirect) {
							Main.controller.redirect(response.redirect);
						}

					} else {

						Modal.view.outputCreate();
						if (response.objError) {

							view.testCreateErrorMessage(response.objError);

							if (response.message) {
								Modal.view.outputStyleError();
								Modal.view.messageOutput('<div id="block_info">' + response.message + '</div>');
							}
						}
						else {
							Modal.view.outputStyleError();
							Modal.view.messageOutput('<div id="block_info">' + response.message + '</div>');
						}

					if (response.redirect) {
						Main.controller.redirect(response.redirect);
					}
				}

			} else {
				Modal.view.outputCreate();
				Modal.view.outputStyleError();
				Modal.view.messageOutput('<div class="error"><p>Ошибка</p><p>Попробуйте позже</p></div>');
			}
		},

	}



	const controller = {

		init: function () {


			view.tokenSearch();

			const myform = document.getElementsByTagName('form');
			// const myget = url ? url.split('?')[1] : window.location.search.slice(1);
			const myget = window.location.search.substring(1);
		
			for (let i = 0, c = myform.length; i < c; i++) {
				controller.addEvent(myform[i], 'submit', controller.sendAjaxRequest);
				view.addHidden(myform[i], 'key', '17');
				view.addHiddenFormName(myform[i], 'form_name');
				if (myget) {
					view.addHiddenGet(myform[i], 'myget', myget);
				}
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
		getXhrObject: function () {
			if (typeof XMLHttpRequest === 'undefined') {
				XMLHttpRequest = function () {
					try {
						return new window.ActiveXObject("Microsoft.XMLHTTP");
					} catch (e) { }
				};
			}
			return new XMLHttpRequest();
		},
		sendAjaxRequest: function (e) {

			model.FormType = e.target.getAttribute('data-FormType');
			model.FormOutputType = e.target.getAttribute('data-FormOutputType');


			if (model.Send == 1) { // не отправляем
				let evt = e || window.event;

				if (evt.preventDefault) {
					evt.preventDefault(); 
				} else {
					evt.returnValue = false; 
				}
			}
			else { // отправляем	
				Modal.view.modalShow();
				model.Send = 1;

				let evt = e || window.event;

				if (evt.preventDefault) {
					evt.preventDefault(); 
				} else {
					evt.returnValue = false; 
				}

				let xhr = controller.getXhrObject();
				if (xhr) {
					// формируем данные формы
					let elems = e.target.elements, // все элементы формы		
						url = e.target.action, // путь к обработчику
						params = [],
						elName,
						elType;

					let formData = new FormData();

					// проходимся в цикле по всем элементам формы
					for (let i = 0; i < elems.length; i++) {
						elType = elems[i].type; // тип текущего элемента (атрибут type)
						elName = elems[i].name; // имя текущего элемента (атрибут name)
						if (elName) { // если атрибут name присутствует
							// если это переключатель или чекбокс, но он не отмечен, то пропускаем
							if ((elType == 'checkbox' || elType == 'radio') && !elems[i].checked) continue;
							// в остальных случаях - добавляем параметр "ключ(name)=значение(value)"
							// params.push(elems[i].name + '=' + elems[i].value);

							if (elType == 'file') {
								var ins = elems[i].files.length;
								for (var x = 0; x < ins; x++) {
									formData.append(elems[i].name, elems[i].files[x]);
								}
							} else {
								formData.append(elems[i].name, elems[i].value);
							}

						}
					}


					xhr.open('POST', url, true); // открываем соединение
					xhr.setRequestHeader('X-Requested-With', 'ajax');
					if(model.HeaderToken.length > 10) {
						xhr.setRequestHeader('X-CSRF-Token', model.HeaderToken);
					}

					xhr.onreadystatechange = function () {

						if (xhr.readyState == 4) { // запрос завершён 

							if (xhr.status == 200) {

								const response = JSON.parse(xhr.responseText);

								view.responseOutput(response);
								model.Send = 0;

							} else if (xhr.status == 403) {

								const response = JSON.parse(xhr.responseText);
								view.responseOutput(response);
								model.Send = 0;

							} else { // Если код ответа сервера не 200, то это ошибка
								view.responseOutput(false);
								model.Send = 0;
							}
						}
					}
					xhr.send(formData);
				}
				return false;
			}
		},

	}


	controller.addEvent(window, 'load', controller.init);

	return {
		model: model,
		view: view,
		controller: controller
	}

}());