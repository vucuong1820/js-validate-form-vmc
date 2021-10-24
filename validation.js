function Validation(options) {
   //hàm lấy ra thẻ cha ~ thẻ form
   function getParent(input , parentSelector){
       return input.closest(parentSelector)
   }
  //hàm kiểm tra
  var selectorRules = {};
  function validate(inputElement, rule) {
    const errorElement = getParent(inputElement,options.formSelector).querySelector(options.error); //lấy ra thẻ span chứ thông báo error
    var errorMessage; //dòng chữ chứa error
    const rules = selectorRules[rule.selector];
    console.log(rules);
    for (var i = 0 ; i < rules.length ; ++i){
        switch (inputElement.type) {
            case 'radio':
            case 'checkbox':
                errorMessage= rules[i](formElement.querySelector(rule.selector +':checked'))//truyền trực tiếp element type radio , checkbox vào hàm , nếu không tồn tại checked => null
              break;
            default:
              errorMessage = rules[i](inputElement.value);
          }
          if (errorMessage) break;
    }
    //nếu có tồn tại errorMessage => hiện thông báo , không thì ẩn
    if (errorMessage) {
        getParent(inputElement,options.formSelector).classList.add("invalid");
      errorElement.innerText = errorMessage;
    } else {
        getParent(inputElement,options.formSelector).classList.remove("invalid");
      errorElement.innerText = "";
    }
    return !!errorMessage; //convert errorMessage sang boolean ( có lỗi = true , không lỗi = false)
  }

  const formElement = document.querySelector(options.form); //lấy ra form cần làm việc
  //xử lý sự kiện khi onsubmit form
  formElement.onsubmit = (e) => {
    var formValid = true;
    e.preventDefault();
    options.rules.forEach((rule) => {
      const inputElement = formElement.querySelector(rule.selector);
      var isValid = !validate(inputElement, rule); //true ~ không lỗi , false ~ có lỗi
      if (!isValid) {
        formValid = false;
      }
    });
    if (formValid) {
      console.log("không lỗi");
      if (typeof options.onSubmit === "function") {
        var enableInputs = formElement.querySelectorAll("[name]");

        var formValues = Array.from(enableInputs).reduce((values, input) => {//conver từ nodelist sang array
          switch(input.type){
              case 'radio':
                // values[input.name] = formElement.querySelector('input[name="'+input.name + '"]:checked').value;
                if(input.matches(':checked')){//nếu có checked thì lấy value của thẻ 
                    values[input.name] = input.value;
                }
                break;
              case 'checkbox':
                  if(input.matches(':checked')){ //nếu có checked 
                    if(!Array.isArray(values[input.name])){//ban đầu cho chuỗi gán với 1 array sau đó push các value checked vào
                        values[input.name] = [];
                    }
                    values[input.name].push(input.value);
                  }
                  
                  break;                  
              default:
                values[input.name] = input.value;
          }
          return values;
        }, {});
        options.onSubmit(formValues);
      } else {
        formElement.submit(); //nếu ko có method onsubmit thì submit mặc định của trình duyệt
      }
    } else {
      console.log("có lỗi");
    }
  };
  //lặp qua các phần tử của mảng rules
  options.rules.forEach((rule) => {
    

    //xử lý push các rules vào 1 object khi lặp
    if (Array.isArray(selectorRules[rule.selector])) {
      selectorRules[rule.selector].push(rule.test);
    } else {
      selectorRules[rule.selector] = [rule.test];
    }
    const inputElements = formElement.querySelectorAll(rule.selector); //lấy ra thẻ input
    Array.from(inputElements).forEach((inputElement)=>{
        //xử lý khi blur ra ngoài
    inputElement.onblur = () => {
        validate(inputElement, rule);
      };
  
      //xử lý khi đang nhập
      inputElement.oninput = () => {
        const errorElement = getParent(inputElement,options.formSelector).querySelector(
          options.error
        );
        getParent(inputElement,options.formSelector).classList.remove("invalid");
        errorElement.innerText = "";
      };

    })
    
  });
}

//các hàm method
Validation.isRequired = (selector, message) => {
  return {
    selector: selector,
    test: function (value) {
      if(typeof value === 'string'){
        return value.trim() ? undefined: message || "Vui lòng nhập trường này"
      }
      return value ? undefined : message || "Vui lòng nhập trường này"; //method trim() loại bỏ các dấu cách space
    },
  };
};
Validation.isEmail = (selector, message) => {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Trường này phải là email"; // hàm kiểm tra có phải email không?
    },
  };
};
Validation.minLength = (selector, min, message) => {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= 6
        ? undefined
        : message || `Vui lòng nhập tối thiểu ${min} ký tự`; // hàm kiểm tra độ dài tối thiểu của password
    },
  };
};
Validation.isConfirmed = (selector, getConfirmValue, message) => {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không phù hợp"; // hàm xác nhận mật khẩu nhập lại
    },
  };
};
