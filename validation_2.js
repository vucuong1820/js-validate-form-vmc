function Validator(formSelector){
  function getParent(inputElement){
    return inputElement.closest('.form-group');
  }
  var formRules = {};
  var validatorRules = {
    required: function(value){
      return value ? undefined : "Vui lòng nhập trường này"
    },
    email:function(value){
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Vui lòng nhập email hợp lệ"
    },
    min: function(min){
      return function (value){
        return value.length >= min ? undefined: `Vui lòng nhập tối thiểu ${min} ký tự`
      }
    },
  }
  var formElement = document.querySelector(formSelector);
  var inputs = formElement.querySelectorAll('.form-control');
  // lặp qua từng input
  for(var input of inputs){
    var rules = input.getAttribute('rules').split('|'); //lấy ra rules và cắt bởi phẩn tử "|"
    //lặp qua từng rule
    for(var rule of rules){
        var ruleHasArg = rule.includes(':');//nếu rule cần truyền arg thì cắt bởi phần tử ":"
        if(ruleHasArg){
          var ruleInfo = rule.split(':');
          rule = ruleInfo[0]; //ruleInfo = [min,6] (ban đầu: "min:6" )
        }
        var ruleFunc = validatorRules[rule];
        if(ruleHasArg){
          ruleFunc = ruleFunc(ruleInfo[1]);//truyền arg là 6
        }
        if(Array.isArray(formRules[input.name])){
          formRules[input.name].push(ruleFunc);//nếu đã là mảng push thêm phần tử vào cuối mảng
        }else{
          formRules[input.name] = [ruleFunc]; //ban đầu gán cho 1 mảng 
        }
        // cấu trúc formRules: {
        //   email: f,
        //   required:f,
        //   ...
        // }
        
    }
    input.onblur = handleValidate;
    input.oninput = handleInput;
  }
  // xử lý sự kiện Blur => validate
  function handleValidate (e){
     var rulesInput = formRules[e.target.name];
     for ( var ruleInput of rulesInput){
       var errorMessage = ruleInput(e.target.value);
       if(errorMessage){
        getParent(e.target).querySelector('.form-message').innerText = errorMessage;
        getParent(e.target).classList.add('invalid')
         break;
       }else{
        getParent(e.target).querySelector('.form-message').innerText = '';
        getParent(e.target).classList.remove('invalid')
       }
     }
     return !errorMessage; // return true ~ không lỗi ,false ~  có lỗi
  }
  //xử lý sự kiện on input
  function handleInput (e){
    getParent(e.target).querySelector('.form-message').innerText = '';
    getParent(e.target).classList.remove('invalid')
  }
  // xử lý sự kiện khi submit form
  formElement.onsubmit = (e)=>{
    // trường hợp có lỗi
    e.preventDefault();
    var inputs = formElement.querySelectorAll('.form-control');
    var isValid = true
    for(var input of inputs){
      //ghi đè property target của e truyền vào là input
      if(!handleValidate({target: input})){
        isValid = false;
      }
    }


    //nếu không có lỗi submit => log ra object chứa info 
    if(isValid){
      var enableInputs = formElement.querySelectorAll('[name][rules]');
      var formValues = Array.from(enableInputs).reduce((values,input)=>{ 
        values[input.name] = input.value;
        return values;

      },{})
      console.log(formValues)
    }else{
      // formElement.submit();
      //nếu có lỗi submit theo mặc định của trình duyệt
    }
  }
}