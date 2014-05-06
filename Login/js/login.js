var loginSuccessIntID, enteredEmailID="",otpSuccessIntID,enteredOtp;
//==========================M O D E L==============================
//Authenticate
var LoginModel = Backbone.Model.extend({
	defaults :{
		email:"",
		password:""		
	},
	urlRoot : platformUrl+"user/authenticate"		
});
	
//Validate
var ValidateModel = Backbone.Model.extend({	
	urlRoot : platformUrl+"user/validate/csh"	
});
//Forgot Password	
var ForgotPasswordModel = Backbone.Model.extend({
	urlRoot : platformUrl+"user/forgot/password"		
});
//Var OTP
var OtpModel = Backbone.Model.extend({		
});
//==========================F O R M  V I E W==============================
//Common View for Login, Forgot, and OTP
var LoginView = Backbone.View.extend({
	tagName: "div",
	className: "",
	template: $("#tmpl-login").html(),
	loginTemplate: $("#tmpl-login").html(),
	frgtpwdTemplate: $("#tmpl-forgotpwd").html(),
	otpTemplate: $("#tmpl-otp").html(),
	formHaserror: false,
	otpUserId:"",
        
    events: {
      	"click a.signin": "fnLogin",
      	"click a.pswdCancel": "fnCancelPwd",
      	"click button.forgotPswdSubmit": "fnForgotPwdSubmit",
      	"click a.forgotpwd": "fnForgotPwd", 
      	"click a.otpSubmit": "fnOtpSubmit",         
      	"keypress":"fnEnter",
      	"click a.closeStatus": "fnCloseMessage",
      	"blur input" : "fnCheckBlur",
		"focus input" : "fnCheckFocus",
		"click a.close": "fnClosebox",
		"click a.requestOtp":"fnRequestOtp"
    },
		
	render: function () {			
		var tmpl = _.template(this.template);       
        $(this.el).html(tmpl(this.model.toJSON()));      
        if(enteredEmailID!=""){
			this.$('#email').val(enteredEmailID);	
		}	
        return this;
	},	
		
	fnClosebox: function(e){
		this.fnForgotPwd(e);
		
	},
	
	fnEnter: function(e){
		if(e.keyCode==13){
			this.fnLogin(e);	
		}
	},
			
	fnLogin: function(e)
	{
       	e.preventDefault();       	
       	this.formHaserror = this.fnCheckForm();	
		if (!this.formHaserror)
		{
       		loggedinuser=this.$('#email').val();
       		userpassword=this.$('#password').val();
       		if(localData==true){
        		fnCheckUser();
        		location.href="#view-accounts";        		
				return;
        	}	       		
        	fnClearMessages("#login-msg-row");
        	fnLanguageToggle(currentLang);
       		$(".wait-block .status-body").html($(".status-msg").html());
			fnShowStatusRow("#login-msg-row","wait",$(".wait-block").html());
    	   	var that = this;
        	var data = Backbone.Syphon.serialize(this);	        	
			this.model.set(data);
			var mod = new ValidateModel(this.model);
			mod.save(null,{
				success:function(model,response){
					userFirstName=response.firstName;
					userLastName=response.lastName;
					lastlogin=fnGetDate(response.lastLoggedIn);
					that.fnShowOtpScreen(response);
				},
				error:function(model, xhr, options){
					var str = "Credentials do not match";
					$(".error-block .status-body").html(str);
					fnShowStatusRow("#login-msg-row","error",$(".error-block").html());
					
				}
			});				
			this.model.save(null, 
			{
				success:function(model,response)
				{
					fnRemoveStatusBox(prevQtipRef);
					$(".success-block .status-body").html($(".status-success-msg").html());
					fnShowStatusRow("#login-msg-row","success",$(".success-block").html());	
					that.fnPostLogin(response);						
					//fnCheckTokenValidity();
				},
				error:function(m,xhr,o)
				{
					var str = "Credentials do not match";
					$(".error-block .status-body").html(str);
					fnShowStatusRow("#login-msg-row","error",$(".error-block").html());
				}
        	});
        }
	},
		
	fnPostLogin : function(response){
		clearInterval(loginSuccessIntID);
		var that = this;			
		loginUserRole = response.role;
		loginToken = response.token;
		globalToken = response.token;
		//location.href="#view-accounts";	
	},
		
	fnCloseMessage : function(e){
		e.preventDefault();
		fnCommonMsg($('.login-form'),"","hideStatus");
	},
	
	fnShowOtpScreen :function(response){
		this.otpUserId=response.id;					
		this.model = new OtpModel();				
		this.template=this.otpTemplate;
		this.render();
		fnLanguageToggle(currentLang);			
	},
	
	fnOtpSubmit : function(e){
		e.preventDefault();
		this.formHaserror = this.fnCheckForm();
		if (!this.formHaserror && !($(e.target).hasClass('btn-grey'))){
			var that = this;
			enteredOtp=this.$("#otp").val();
        	$(".wait-block .status-body").html($(".status-msg").html());
			fnShowStatusRow("#otp-msg-row","wait",$(".wait-block").html());        	
			that.$(".otpSubmit").removeClass('btn-action').addClass('btn-grey');
			this.model = new OtpModel();						
			this.model.url=platformUrl+"user/"+this.otpUserId+"/validate/"+enteredOtp;
			this.model.save(null, 
			{
				success:function(model,response)
				{						
					$(".success-block .status-body").html($(".status-success-msg").html());
					fnShowStatusRow("#otp-msg-row","success",$(".success-block").html());
					otpSuccessIntID = setInterval(function(){that.fnOtpValidate();},500);
				},
				error:function(m,xhr,o)
				{
					if(xhr.status==200){
						$(".success-block .status-body").html($(".status-success-msg").html());
						fnShowStatusRow("#otp-msg-row","success",$(".success-block").html());
						otpSuccessIntID = setInterval(function(){that.fnOtpValidate();},500);
					}else{
						$(".error-block .status-body").html($(".status-error-msg").html());
						fnShowStatusRow("#otp-msg-row","error",$(".error-block").html());	
					}	
				}
        	});
		}
	},
	
	fnOtpValidate : function(){
		clearInterval(otpSuccessIntID);		
		location.href="#view-accounts";
	},
	
	fnRequestOtp : function(e){
		this.$(".otpSubmit").addClass('btn-action').removeClass('btn-grey');
		this.model = new ValidateModel();
		this.model.set('email',loggedinuser);
		this.model.set('password',userpassword);		
		this.model.save(null,{
			success:function(model,response){
				$(".success-block .status-body").html($(".status-success-msg").html());
				fnShowStatusRow("#otp-msg-row","success",$(".success-block").html());
			},
			error:function(model, xhr, options){
				if(xhr.status==200){
					$(".success-block .status-body").html($(".status-success-msg").html());
					fnShowStatusRow("#otp-msg-row","success",$(".success-block").html());					
				}else{
					$(".error-block .status-body").html($(".status-error-msg").html());
					fnShowStatusRow("#otp-msg-row","error",$(".error-block").html());	
				}	
			}
		});
	},
		
	fnForgotPwd :function(e){
		e.preventDefault();
		if(this.$('#email').val()!=""){
			enteredEmailID=this.$('#email').val();	
		}			
		var model=new ForgotPasswordModel();
		this.model = model;
		this.model.urlRoot=platformUrl+"user/forgot/password";
		this.template=this.frgtpwdTemplate;
		this.render();
		fnLanguageToggle(currentLang);			
	},
		
	fnForgotPwdSubmit :function(e){
		e.preventDefault();
		this.formHaserror = this.fnCheckForm();
		if (!this.formHaserror && !($(e.target).hasClass('btn-grey'))){
			var that = this;
        	var data = Backbone.Syphon.serialize($("#formForgot")[0]);
        	this.model.set(data);
        	that.$(".pswdCancel").removeClass('btn-action').addClass('btn-grey');
			that.$(".forgotPswdSubmit").removeClass('btn-action').addClass('btn-grey');
			$(".bottom-line-only").removeClass("hide");
			this.model.save(null, 
			{
				success:function(model,response)
				{						
					
					fnRemoveStatusBox(prevQtipRef);
					$(".forgot-block .status-body").html($(".status-success-msg").html());
					fnShowStatusRow("#forgotPwd-msg-row","success",$(".forgot-block").html());
				},
				error:function(m,xhr,o)
				{
					fnRemoveStatusBox(prevQtipRef);
					$(".forgot-block .status-body").html($(".status-success-msg").html());
					fnShowStatusRow("#forgotPwd-msg-row","success",$(".forgot-block").html());
				}
        	});
		}
	},	
	
	fnCheckForm : function(e){
		var hasError = false;
		var that = this;
		this.$("input[type]").each(function(index, val) 
		{
			if ($(this).hasClass("mandatory") && $(this).val() == "") 
			{
				$(this).next().find('span').html("This cannot be left blank.");
				$(this).next().removeClass('hide');				
				hasError = true;
			}else
			{			
				if ($(this).hasClass("emailcheck"))
				{
					if(fnEmailCheck($(this).val()))
					{
						$(this).next().addClass('hide');
					}else{
						$(this).next().find('span').html("Enter a valid email.");
						$(this).next().removeClass('hide');				
						hasError = true;
					}
				}else{
					$(this).next().addClass('hide');
				}
			}		
		});			
		return hasError;			
	},
		
	fnCheckFocus : function(e){
		if(this.formHaserror){
			$(e.target).next().next().addClass('hide');
		}		
	},
	
	fnCheckBlur : function(e){
		if(this.formHaserror){
			this.fnCheckForm();			
		}
	},
		
	fnCancelPwd : function(e){
		e.preventDefault();
		location.href="";
	}
});

$(document).ready(function() {	
	var model = new LoginModel();
    var login = new LoginView({model : model});    
    $("#login").append(login.render().el);
    fnLanguageToggle(currentLang);  	
    $("#login #email").focus();
});	
