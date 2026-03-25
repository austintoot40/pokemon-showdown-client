"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var










StarterScreen=function(_preact$Component){function StarterScreen(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={selected:null};_this.
select=function(i){return _this.setState({selected:i});};_this.
confirm=function(){
if(_this.state.selected!==null)PS.send("/nuzlocke starter "+_this.state.selected);
};return _this;}_inheritsLoose(StarterScreen,_preact$Component);var _proto=StarterScreen.prototype;_proto.
render=function render(){var _game$starters,_this2=this;
var game=this.props.game;
var selected=this.state.selected;
var starters=(_game$starters=game.starters)!=null?_game$starters:[];
return preact.h(NzScreen,null,
preact.h(NzScreenHeader,{title:"Choose Your Starter"}),
preact.h("div",{style:"display:flex;gap:16px;flex-wrap:wrap;"},
starters.map(function(s,i){return(
preact.h(NzStarterCard,{
key:i,
species:s.species,
selected:selected===i,
onSelect:function(){return _this2.select(i);}}
));}
)
),
preact.h("div",{style:"margin-top:16px;"},
preact.h(NzBtn,{onClick:this.confirm,disabled:selected===null},"Confirm"

)
)
);
};return StarterScreen;}(preact.Component);
//# sourceMappingURL=starter.js.map