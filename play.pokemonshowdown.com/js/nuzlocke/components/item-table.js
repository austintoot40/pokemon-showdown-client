"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var























NzItemTable=function(_preact$Component){function NzItemTable(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={query:''};_this.
wrapRef=null;return _this;}_inheritsLoose(NzItemTable,_preact$Component);var _proto=NzItemTable.prototype;_proto.

componentDidUpdate=function componentDidUpdate(prevProps){
if(prevProps.items!==this.props.items){
this.setState({query:''});
}
};_proto.

renderMobileCard=function renderMobileCard(item){var _this2=this;
var dexItem=Dex.items.get(item.name);
var effect=(dexItem==null?void 0:dexItem.shortDesc)||(dexItem==null?void 0:dexItem.desc)||'';
return(
preact.h("li",{
key:item.id,
"class":"nz-item-card",
onClick:function(){return _this2.props.onChange(item.id);}},

preact.h("div",{"class":"nz-item-card-header"},
preact.h("span",{"class":"itemicon",style:Dex.getItemIcon(item.name)}),
preact.h("span",{"class":"nz-item-card-name"},item.name),
preact.h("span",{"class":"nz-item-card-location"},item.location||'—')
),
effect&&preact.h("div",{"class":"nz-item-card-desc"},effect)
));

};_proto.

render=function render(){var _items$find,_equippedItem$name,_this3=this;
var _this$props=this.props,value=_this$props.value,items=_this$props.items,excludeIds=_this$props.excludeIds,onChange=_this$props.onChange;
var query=this.state.query;

var equippedItem=value?(_items$find=items.find(function(i){return i.id===value;}))!=null?_items$find:null:null;
var equippedName=(_equippedItem$name=equippedItem==null?void 0:equippedItem.name)!=null?_equippedItem$name:value||null;

var q=query.toLowerCase();
var available=items.filter(function(i){return i.id!==value&&!(excludeIds!=null&&excludeIds.has(i.id));});
var filtered=q?available.filter(function(item){return item.name.toLowerCase().includes(q);}):available;

return(
preact.h("div",{"class":"nz-item-panel"},
preact.h("div",{"class":"nz-item-equipped"},
equippedName?
preact.h("div",{"class":"nz-item-equipped-filled"},
preact.h("span",{"class":"itemicon",style:Dex.getItemIcon(equippedName)}),
preact.h("span",{"class":"nz-item-equipped-name"},equippedName),
equippedItem&&function(_Dex$items$get){
var desc=(_Dex$items$get=Dex.items.get(equippedName))==null?void 0:_Dex$items$get.shortDesc;
return desc?preact.h("span",{"class":"nz-item-equipped-desc"},desc):null;
}(),
preact.h("button",{"class":"nz-item-equipped-remove",onClick:function(){return onChange('');},title:"Remove item"},"\xD7")
):

preact.h("div",{"class":"nz-item-equipped-empty"},"No item held \u2014 select one below")

),
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
filtered.map(function(item){
var dexItem=Dex.items.get(item.name);
var effect=(dexItem==null?void 0:dexItem.shortDesc)||(dexItem==null?void 0:dexItem.desc)||'';
return(
preact.h("tr",{
key:item.id,
onClick:function(){return onChange(item.id);}},

preact.h("td",{"class":"nz-item-col-sprite"},
preact.h("span",{"class":"itemicon",style:Dex.getItemIcon(item.name)})
),
preact.h("td",{"class":"nz-item-col-name"},item.name),
preact.h("td",{"class":"nz-item-col-desc"},
preact.h("div",{"class":"nz-item-col-desc-inner"},effect)
),
preact.h("td",{"class":"nz-item-col-location"},item.location||'—')
));

}),
filtered.length===0&&
preact.h("tr",null,
preact.h("td",{colSpan:4,"class":"nz-item-no-results"},"No items match")
)

)
)
),
preact.h("ul",{"class":"nz-item-list nz-item-mobile"},
filtered.map(function(item){return _this3.renderMobileCard(item);}),
filtered.length===0&&preact.h("li",{"class":"nz-item-no-results"},"No items match")
)
));

};return NzItemTable;}(preact.Component);
//# sourceMappingURL=item-table.js.map