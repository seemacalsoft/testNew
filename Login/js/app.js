(function($){
	
 
    var App = window.App || {};
 
    App.LoginFormView = Backbone.View.extend({
        el : "#login",
        tmpl : $('#tmpl-login').html(),
        initialize : function(){
            // render the login form soon as the instance is created
            this.render();
        },
        events: {
      	"click button.btn-sign": "fnLogin"},
      	fnLogin:function(e)
      	{
      		alert("hello");
      	}
      	,
        render : function(){
 
            var form = _.template(this.tmpl,{ username : this.model.username });
 
            // $el is created by Backbone for us.. from the string selector given into el
            this.$el.append(form);
        }
    });
 
    var loginView = new App.LoginFormView({
        model : {
                    
                }
                
    });
  
})(jQuery);