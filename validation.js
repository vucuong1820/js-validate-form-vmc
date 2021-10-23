

function Validation (options){
    var selectorRules = {};
    //hàm kiểm tra
    function validate(inputElement , rule){
        const errorElement = inputElement.parentElement.querySelector(options.error); //lấy ra thẻ span chứ thông báo error
        var errorMessage;//dòng chữ chứa error

        const rules = selectorRules[rule.selector];
        console.log(rules)
        for ( const rule of rules){
            errorMessage = rule(inputElement.value);
            
           if(errorMessage) break;
        }
        //nếu có tồn tại errorMessage => hiện thông báo , không thì ẩn
        if(errorMessage){
            inputElement.parentElement.classList.add('invalid')
            errorElement.innerText = errorMessage;
        }else{
             inputElement.parentElement.classList.remove('invalid')
             errorElement.innerText = '';
         }
         return !!errorMessage; //convert errorMessage sang boolean ( có lỗi = true , không lỗi = false)
    }
    
    
    const formElement = document.querySelector(options.form);//lấy ra form cần làm việc
    formElement.onsubmit =(e)=>{
        var formValid = true;
        e.preventDefault();
        options.rules.forEach((rule)=>{
            const inputElement =  formElement.querySelector(rule.selector);
            var isValid = !validate(inputElement,rule); //true ~ không lỗi , false ~ có lỗi
            if(!isValid){
                formValid = false;
            }
        })
        if(formValid){
            console.log('không lỗi')
            if(typeof options.onSubmit === 'function'){
                var enableInputs = formElement.querySelectorAll('[name]');
                
                var formValues = Array.from(enableInputs).reduce((values,input)=>{
                    values[input.name] = input.value;
                    return values;
                },{})
                options.onSubmit(formValues);
            }else{
                formElement.submit();
            }
        }else{
            console.log('có lỗi')
        }
    }
    //lặp qua các phần tử của mảng rules
    options.rules.forEach((rule)=>{
         const inputElement =  formElement.querySelector(rule.selector);//lấy ra thẻ input
         
         //xử lý push các rules vào 1 object khi lặp
         if(Array.isArray(selectorRules[rule.selector])){
            selectorRules[rule.selector].push(rule.test)
         }else{
            selectorRules[rule.selector] = [rule.test]
         }


         //xử lý khi blur ra ngoài
         inputElement.onblur =()=>{
             
            validate(inputElement,rule)
         }

         //xử lý khi đang nhập
         inputElement.oninput=()=>{
            const errorElement = inputElement.parentElement.querySelector(options.error);
            inputElement.parentElement.classList.remove('invalid')
            errorElement.innerText = '';
         }
    })
    
 }


Validation.isRequired = (selector, message)=>{
   return {
       selector:selector,
       test: function(value){
             return value.trim() ? undefined : message || "Vui lòng nhập trường này"; //method trim() loại bỏ các dấu cách space
       }

   }
}
Validation.isEmail = (selector, message) => {
    return {
        selector:selector,
        test: function(value){
              var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
              return regex.test(value) ? undefined : message || "Trường này phải là email"; // hàm kiểm tra có phải email không?
        }
 
    }

}
Validation.minLength = (selector,min, message) => {
    return {
        selector: selector,
        test: function(value){
               return value.length >= 6 ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`; // hàm kiểm tra độ dài tối thiểu của password
        }
    }
}
Validation.isConfirmed = (selector,getConfirmValue , message) => {
    return {
        selector: selector,
        test: function(value){
               return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không phù hợp'; // hàm xác nhận mật khẩu nhập lại
        }
    }
}