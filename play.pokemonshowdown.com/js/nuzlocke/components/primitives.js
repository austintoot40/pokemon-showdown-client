"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}









function NzTypeBadges(_ref){var species=_ref.species,generation=_ref.generation;
var dex=generation?Dex.forGen(generation):Dex;
var sp=dex.species.get(species);
return preact.h(preact.Fragment,null,sp.types.map(function(t){return(
preact.h("span",{key:t,"class":"nz-type nz-type-"+t.toLowerCase()},t));}
));
}

function NzHpBar(_ref2){var current=_ref2.current,max=_ref2.max,label=_ref2.label;
var pct=max>0?Math.round(current/max*100):0;
var stateClass=pct>50?'nz-hp-high':pct>20?'nz-hp-mid':'nz-hp-low';
return preact.h("div",{"class":"nz-hp-bar "+stateClass},
label&&preact.h("div",{"class":"nz-hp-bar-meta"},preact.h("span",null,label),preact.h("span",null,current,"/",max)),
preact.h("div",{"class":"nz-hp-bar-track"},
preact.h("div",{"class":"nz-hp-bar-fill",style:"width:"+pct+"%"})
)
);
}

function NzBadge(_ref3)





{var children=_ref3.children,_ref3$variant=_ref3.variant,variant=_ref3$variant===void 0?'muted':_ref3$variant;
return preact.h("span",{"class":"nz-badge nz-badge-"+variant},children);
}

function NzBtn(_ref4)













{var children=_ref4.children,onClick=_ref4.onClick,disabled=_ref4.disabled,_ref4$variant=_ref4.variant,variant=_ref4$variant===void 0?'primary':_ref4$variant,size=_ref4.size,title=_ref4.title;
var cls=[
'nz-btn',"nz-btn-"+
variant,
size==='sm'?'nz-btn-sm':''].
filter(Boolean).join(' ');
return preact.h("button",{"class":cls,onClick:onClick,disabled:disabled,title:title},children);
}

function dropdownStyle(rect,minWidth){
var gap=4;
var maxAllowed=240;
var spaceBelow=window.innerHeight-rect.bottom-gap;
var spaceAbove=rect.top-gap;
var useBelow=spaceBelow>=100||spaceBelow>=spaceAbove;
return useBelow?{
top:rect.bottom+gap+"px",
left:rect.left+"px",
minWidth:minWidth+"px",
maxHeight:Math.min(maxAllowed,spaceBelow)+"px"
}:{
bottom:window.innerHeight-rect.top+gap+"px",
left:rect.left+"px",
minWidth:minWidth+"px",
maxHeight:Math.min(maxAllowed,spaceAbove)+"px"
};
}var














NzMoveSelect=function(_preact$Component){function NzMoveSelect(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={query:'',open:false};_this.
inputEl=null;_this.
portalEl=null;_this.


















handleFocus=function(){
_this.setState({open:true,query:''});
};_this.

handleClick=function(){
_this.setState({open:true});
};_this.

handleInput=function(e){
_this.setState({query:e.target.value});
};_this.

handleBlur=function(){
_this.setState({open:false,query:''});
};return _this;}_inheritsLoose(NzMoveSelect,_preact$Component);var _proto=NzMoveSelect.prototype;_proto.componentDidMount=function componentDidMount(){this.portalEl=document.createElement('div');document.body.appendChild(this.portalEl);};_proto.componentDidUpdate=function componentDidUpdate(){this.updatePortal();};_proto.componentWillUnmount=function componentWillUnmount(){if(this.portalEl){preact.render('',this.portalEl);document.body.removeChild(this.portalEl);this.portalEl=null;}};_proto.

select=function select(id){
this.props.onChange(id);
this.setState({open:false,query:''});
};_proto.

updatePortal=function updatePortal(){
if(!this.portalEl)return;
preact.render(this.renderDropdown(),this.portalEl);
};_proto.

renderDropdown=function renderDropdown(){var _this2=this;
var _this$props=this.props,value=_this$props.value,moves=_this$props.moves,disabledMoves=_this$props.disabledMoves,generation=_this$props.generation;
var _this$state=this.state,query=_this$state.query,open=_this$state.open;

if(!open||!this.inputEl)return preact.h(preact.Fragment,null);

var rect=this.inputEl.getBoundingClientRect();
var style=dropdownStyle(rect,Math.max(rect.width,340));

var genDex=Dex.forGen(generation);
var q=query.toLowerCase();
var filtered=!q?moves:moves.filter(function(m){
if(m.name.toLowerCase().includes(q))return true;
var md=genDex.moves.get(toID(m.name));
if(!md.exists)return false;
if(md.type.toLowerCase().includes(q))return true;
var cat=md.category.toLowerCase();
if(cat.includes(q))return true;
if(q==='phys'&&cat==='physical')return true;
if(q==='spec'&&cat==='special')return true;
return false;
});

return(
preact.h("div",{"class":"nz-move-select-dropdown",style:style},
preact.h("div",{
"class":"nz-move-select-option"+(!value?' is-selected':''),
onMouseDown:function(e){e.preventDefault();_this2.select('');}},

preact.h("span",{"class":"nz-move-select-name"},preact.h("span",null,"(empty)"))
),
filtered.map(function(m){
var id=toID(m.name);
var md=genDex.moves.get(id);
var isDisabled=disabledMoves.includes(id);
var isSelected=value===id;
var catKey=md.exists?md.category.toLowerCase():'';
var catLabel=md.exists?
md.category==='Physical'?'Phys':md.category==='Special'?'Spec':'Status':
'';
var suffix=m.fromHM?'HM':m.fromTM?'TM':null;
return(
preact.h("div",{
key:m.name,
"class":['nz-move-select-option',isDisabled?'is-disabled':'',isSelected?'is-selected':''].filter(Boolean).join(' '),
onMouseDown:function(e){e.preventDefault();if(!isDisabled)_this2.select(id);}},

preact.h("span",{"class":"nz-move-select-name"},
preact.h("span",null,m.name),
suffix&&preact.h("span",{"class":"nz-move-select-suffix"},suffix)
),
md.exists&&function(_m$hpType){
var displayType=(_m$hpType=m.hpType)!=null?_m$hpType:md.type;
return preact.h("span",{"class":"nz-type nz-type-"+displayType.toLowerCase()},displayType);
}(),
md.exists&&preact.h("span",{"class":"nz-move-cat nz-move-cat-"+catKey},catLabel)
));

}),
filtered.length===0&&
preact.h("div",{"class":"nz-move-select-empty"},"No moves match")

));

};_proto.

render=function render(){var _Dex$forGen$moves$get,_this3=this;
var _this$props2=this.props,value=_this$props2.value,generation=_this$props2.generation;
var _this$state2=this.state,query=_this$state2.query,open=_this$state2.open;
var displayValue=open?query:value?(_Dex$forGen$moves$get=Dex.forGen(generation).moves.get(value).name)!=null?_Dex$forGen$moves$get:'':'';
return(
preact.h("div",{"class":"nz-move-select"},
preact.h("input",{
ref:function(el){_this3.inputEl=el;},
"class":"nz-move-select-input",
type:"text",
value:displayValue,
placeholder:"(empty)",
onFocus:this.handleFocus,
onClick:this.handleClick,
onInput:this.handleInput,
onBlur:this.handleBlur}
)
));

};return NzMoveSelect;}(preact.Component);var









NzItemSelect=function(_preact$Component2){function NzItemSelect(){var _this4;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this4=_preact$Component2.call.apply(_preact$Component2,[this].concat(args))||this;_this4.
state={query:'',open:false};_this4.
inputEl=null;_this4.
portalEl=null;_this4.


















handleFocus=function(){_this4.setState({open:true,query:''});};_this4.
handleInput=function(e){_this4.setState({query:e.target.value});};_this4.
handleBlur=function(){_this4.setState({open:false,query:''});};return _this4;}_inheritsLoose(NzItemSelect,_preact$Component2);var _proto2=NzItemSelect.prototype;_proto2.componentDidMount=function componentDidMount(){this.portalEl=document.createElement('div');document.body.appendChild(this.portalEl);};_proto2.componentDidUpdate=function componentDidUpdate(){this.updatePortal();};_proto2.componentWillUnmount=function componentWillUnmount(){if(this.portalEl){preact.render('',this.portalEl);document.body.removeChild(this.portalEl);this.portalEl=null;}};_proto2.

select=function select(id){
this.props.onChange(id);
this.setState({open:false,query:''});
};_proto2.

updatePortal=function updatePortal(){
if(!this.portalEl)return;
preact.render(this.renderDropdown(),this.portalEl);
};_proto2.

renderDropdown=function renderDropdown(){var _this5=this;
var _this$props3=this.props,value=_this$props3.value,items=_this$props3.items,disabledIds=_this$props3.disabledIds;
var _this$state3=this.state,query=_this$state3.query,open=_this$state3.open;

if(!open||!this.inputEl)return preact.h(preact.Fragment,null);

var rect=this.inputEl.getBoundingClientRect();
var style=dropdownStyle(rect,Math.max(rect.width,200));

var q=query.toLowerCase();
var filtered=!q?items:items.filter(function(it){return it.name.toLowerCase().includes(q);});

return(
preact.h("div",{"class":"nz-move-select-dropdown",style:style},
preact.h("div",{
"class":"nz-move-select-option nz-item-option"+(!value?' is-selected':''),
onMouseDown:function(e){e.preventDefault();_this5.select('');}},

preact.h("span",{"class":"nz-move-select-name"},preact.h("span",null,"(none)"))
),
filtered.map(function(it){
var isDisabled=disabledIds.includes(it.id);
var isSelected=value===it.id;
return(
preact.h("div",{
key:it.id,
"class":['nz-move-select-option nz-item-option',isDisabled?'is-disabled':'',isSelected?'is-selected':''].filter(Boolean).join(' '),
onMouseDown:function(e){e.preventDefault();if(!isDisabled)_this5.select(it.id);}},

preact.h("span",{"class":"itemicon",style:Dex.getItemIcon(it.name)}),
preact.h("span",{"class":"nz-move-select-name"},preact.h("span",null,it.name))
));

}),
filtered.length===0&&
preact.h("div",{"class":"nz-move-select-empty"},"No items match")

));

};_proto2.

render=function render(){var _items$find$name,_items$find,_this6=this;
var _this$props4=this.props,value=_this$props4.value,items=_this$props4.items;
var _this$state4=this.state,query=_this$state4.query,open=_this$state4.open;
var displayValue=open?query:value?(_items$find$name=(_items$find=items.find(function(it){return it.id===value;}))==null?void 0:_items$find.name)!=null?_items$find$name:'':'';
return(
preact.h("div",{"class":"nz-move-select"},
preact.h("input",{
ref:function(el){_this6.inputEl=el;},
"class":"nz-move-select-input",
type:"text",
value:displayValue,
placeholder:"(none)",
onFocus:this.handleFocus,
onInput:this.handleInput,
onBlur:this.handleBlur}
)
));

};return NzItemSelect;}(preact.Component);


function NzSprite(_ref5){var species=_ref5.species,_ref5$size=_ref5.size,size=_ref5$size===void 0?60:_ref5$size;
var id=toID(species);
var src="https://play.pokemonshowdown.com/sprites/gen5/"+id+".png";
return preact.h("img",{
"class":"nz-card-sprite",
src:src,
alt:species,
style:"width:"+size+"px;height:"+size+"px;"}
);
}
//# sourceMappingURL=primitives.js.map