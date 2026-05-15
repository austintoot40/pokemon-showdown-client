"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var






















NzItemTable=function(_preact$Component){function NzItemTable(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={query:''};_this.
wrapRef=null;_this.
selectedRowRef=null;_this.























clickRow=function(id){
var _this$props=_this.props,value=_this$props.value,onChange=_this$props.onChange;
onChange(value===id?'':id);
};return _this;}_inheritsLoose(NzItemTable,_preact$Component);var _proto=NzItemTable.prototype;_proto.scrollToSelected=function scrollToSelected(){var _offsetHeight,_wrap$querySelector;var wrap=this.wrapRef;var row=this.selectedRowRef;if(!wrap||!row)return;var headerHeight=(_offsetHeight=(_wrap$querySelector=wrap.querySelector('thead'))==null?void 0:_wrap$querySelector.offsetHeight)!=null?_offsetHeight:0;var rowTop=row.offsetTop-headerHeight;var rowBottom=row.offsetTop+row.offsetHeight;if(rowTop<wrap.scrollTop){wrap.scrollTop=rowTop;}else if(rowBottom>wrap.scrollTop+wrap.clientHeight){wrap.scrollTop=rowBottom-wrap.clientHeight;}};_proto.componentDidMount=function componentDidMount(){this.scrollToSelected();};_proto.componentDidUpdate=function componentDidUpdate(prevProps){if(prevProps.value!==this.props.value)this.scrollToSelected();};_proto.

renderMobileCard=function renderMobileCard(item){var _this2=this;
var _this$props2=this.props,value=_this$props2.value,disabledIds=_this$props2.disabledIds;
if(!item){
var _isSelected=!value;
return(
preact.h("li",{
"class":"nz-item-card"+(_isSelected?' nz-item-card--selected':''),
onClick:function(){return _this2.props.onChange('');}},

preact.h("span",{"class":"nz-item-card-none"},"(none)")
));

}
var isSelected=value===item.id;
var isDisabled=disabledIds.includes(item.id);
var dexItem=Dex.items.get(item.name);
var effect=(dexItem==null?void 0:dexItem.shortDesc)||(dexItem==null?void 0:dexItem.desc)||'';
var cardClass=[
'nz-item-card',
isSelected?'nz-item-card--selected':'',
isDisabled?'nz-item-card--disabled':''].
filter(Boolean).join(' ');
return(
preact.h("li",{
key:item.id,
"class":cardClass,
onClick:isDisabled?undefined:function(){return _this2.clickRow(item.id);}},

preact.h("div",{"class":"nz-item-card-header"},
preact.h("span",{"class":"itemicon",style:Dex.getItemIcon(item.name)}),
preact.h("span",{"class":"nz-item-card-name"},item.name),
preact.h("span",{"class":"nz-item-card-location"},item.location||'—')
),
effect&&preact.h("div",{"class":"nz-item-card-desc"},effect)
));

};_proto.

render=function render(){var _this3=this;
var _this$props3=this.props,value=_this$props3.value,items=_this$props3.items,disabledIds=_this$props3.disabledIds;
var query=this.state.query;
var q=query.toLowerCase();
var filtered=q?items.filter(function(item){return item.name.toLowerCase().includes(q);}):items;

return(
preact.h("div",{"class":"nz-item-panel"},
preact.h("input",{
"class":"nz-item-search",
type:"text",
placeholder:"Search items\u2026",
value:query,
onInput:function(e){return _this3.setState({query:e.target.value});}}
),
preact.h("div",{"class":"nz-item-table-wrap nz-item-desktop",ref:function(el){_this3.wrapRef=el;}},
preact.h("table",{"class":"nz-item-table"},
preact.h("thead",null,
preact.h("tr",null,
preact.h("th",{"class":"nz-item-col-sprite"}),
preact.h("th",{"class":"nz-item-col-name"},"Item"),
preact.h("th",{"class":"nz-item-col-desc"},"Effect"),
preact.h("th",{"class":"nz-item-col-location"},"Route Acquired")
)
),
preact.h("tbody",null,
preact.h("tr",{
ref:!value?function(el){_this3.selectedRowRef=el;}:undefined,
"class":!value?'nz-item-row--selected':undefined,
onClick:function(){return _this3.props.onChange('');}},

preact.h("td",null),
preact.h("td",{"class":"nz-item-col-name nz-item-none-label"},"(none)"),
preact.h("td",null),
preact.h("td",null)
),
filtered.map(function(item){
var isSelected=value===item.id;
var isDisabled=disabledIds.includes(item.id);
var dexItem=Dex.items.get(item.name);
var effect=(dexItem==null?void 0:dexItem.shortDesc)||(dexItem==null?void 0:dexItem.desc)||'';
var rowClass=[
isSelected?'nz-item-row--selected':'',
isDisabled?'nz-item-row--disabled':''].
filter(Boolean).join(' ')||undefined;

return(
preact.h("tr",{
key:item.id,
ref:isSelected?function(el){_this3.selectedRowRef=el;}:undefined,
"class":rowClass,
onClick:isDisabled?undefined:function(){return _this3.clickRow(item.id);}},

preact.h("td",{"class":"nz-item-col-sprite"},
preact.h("span",{"class":"itemicon",style:Dex.getItemIcon(item.name)})
),
preact.h("td",{"class":"nz-item-col-name"},item.name),
preact.h("td",{"class":"nz-item-col-desc"},
preact.h("div",{"class":"nz-item-col-desc-inner"},effect)
),
preact.h("td",{"class":"nz-item-col-location"},item.location||'—')
));

})
)
)
),
preact.h("ul",{"class":"nz-item-list nz-item-mobile"},
this.renderMobileCard(null),
filtered.map(function(item){return _this3.renderMobileCard(item);})
)
));

};return NzItemTable;}(preact.Component);
//# sourceMappingURL=item-table.js.map