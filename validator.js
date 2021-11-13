function validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement
        }
    }

    var selectorRules = {};

    function validate(inputElement, rule) {
        var errorMessage = rule.test(inputElement.value)
        var errorElement = getParent(inputElement, options.formGroupSeletor).querySelector(options.errorSelector)
        var rules = selectorRules[rule.selector]

        for (i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break;
        }

                    if (errorMessage) {
                        errorElement.innerText = errorMessage
                        getParent(inputElement, options.formGroupSeletor).classList.add('invalid')
                    } else {
                        errorElement.innerText = ''
                        getParent(inputElement, options.formGroupSeletor).classList.remove('invalid')
                    }
        return !errorMessage;
    }


    var formElement = document.querySelector(options.form)
    
    if (formElement) {

        formElement.onsubmit = function (e) {   
            e.preventDefault();

            var isFormValid = true

            options.rules.forEach ((rule) => {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)

                if(!isValid) {
                    isFormValid = false
                }
            })

            if (isFormValid) {
                if( typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                    values[input.name] = input.value
                    return values
                }, {})
                options.onSubmit(formValues)
                }
            } 
        }


        options.rules.forEach ((rule) => {
            
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }
          
            

            var inputElement = formElement.querySelector(rule.selector)
            
            if (inputElement) {
                // xử lí khi người dùng blur ra ngoài
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                } 

                // Xử lí khi người dùng đang nhập thì không có lỗi
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSeletor).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElement, options.formGroupSeletor).classList.remove('invalid')
                }
            }
        })
    }
}

validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Vui lòng nhập email'
        }
    }
}

validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}

validator.isConfirmed = function (selector, getConfimValue, message) {
    return {
        selector: selector,
        test(value) {
            return value === getConfimValue() ? undefined : message || 'Xác nhận mật khẩu của bạn không chính xác'
        }
    }
}