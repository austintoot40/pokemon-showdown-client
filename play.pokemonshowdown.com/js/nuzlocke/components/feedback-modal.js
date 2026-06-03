"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var








FeedbackModal=function(_preact$Component){function FeedbackModal(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
message='';_this.
submitted=false;_this.

handleInput=function(e){
_this.message=e.target.value;
_this.forceUpdate();
};_this.

handleSubmit=function(){
if(_this.message.trim().length<5)return;

var payload={
message:_this.message.trim(),
context:{
curScreen:_this.props.curScreen,
recentCommands:_this.props.recentCommands,
userAgent:navigator.userAgent
}
};
PS.send("/nuzlocke feedback "+btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
_this.submitted=true;
_this.forceUpdate();
setTimeout(function(){return _this.props.onClose();},1800);
};return _this;}_inheritsLoose(FeedbackModal,_preact$Component);var _proto=FeedbackModal.prototype;_proto.

render=function render(){
var onClose=this.props.onClose;

if(this.submitted){
return(
preact.h("div",{"class":"nz-modal-overlay",onClick:onClose},
preact.h("div",{"class":"nz-modal nz-feedback-modal",onClick:function(e){return e.stopPropagation();}},
preact.h("div",{"class":"nz-modal-title"},"Sent!"),
preact.h("p",{"class":"nz-feedback-sent-msg"},"Thanks for the report.")
)
));

}

return(
preact.h("div",{"class":"nz-modal-overlay",onClick:onClose},
preact.h("div",{"class":"nz-modal nz-feedback-modal",onClick:function(e){return e.stopPropagation();}},
preact.h("div",{"class":"nz-modal-title"},"Report a Bug"),
preact.h("div",{"class":"nz-feedback-subtitle"},"The software kind, not your favorite Caterpie."),

preact.h("fieldset",{"class":"nz-modal-fieldset"},
preact.h("legend",{"class":"nz-modal-legend"},"What happened?"),
preact.h("textarea",{
"class":"nz-feedback-textarea",
placeholder:"Describe what you did, what happened, and what you expected.",
onInput:this.handleInput}
)
),

preact.h("div",{"class":"nz-modal-actions"},
preact.h("button",{"class":"nz-btn nz-btn-secondary",onClick:onClose},"Cancel"),
preact.h("button",{
"class":"nz-btn nz-btn-primary",
onClick:this.handleSubmit,
disabled:this.message.trim().length<5},
"Send Report"

)
)
)
));

};return FeedbackModal;}(preact.Component);


function FeedbackFab(_ref){var onClick=_ref.onClick;
return(
preact.h("button",{"class":"nz-feedback-fab",title:"Report a bug",onClick:onClick},"Report Bug"

));

}
//# sourceMappingURL=feedback-modal.js.map