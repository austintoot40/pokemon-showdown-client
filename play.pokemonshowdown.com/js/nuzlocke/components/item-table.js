"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var





































NzItemTable=function(_preact$Component){function NzItemTable(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={query:'',drag:null};_this.
wrapRef=null;_this.
equippedRef=null;_this.

_drag=null;_this.
_dragJustEnded=false;_this.
_ghostEl=null;_this.
















































cancelDrag=function(){
document.removeEventListener('pointermove',_this.onDragMove);
document.removeEventListener('pointerup',_this.onDragEnd);
document.removeEventListener('pointercancel',_this.cancelDrag);
_this._removeGhost();
_this._drag=null;
_this.setState({drag:null});
};_this.

startRowDrag=function(itemId,e){
if(e.pointerType!=='mouse')return;
_this._startDrag({
itemId:itemId,
overSlot:false,
active:false,
clientX:e.clientX,
clientY:e.clientY,
startX:e.clientX,
startY:e.clientY
});
};_this.

onDragMove=function(e){
var drag=_this._drag;
if(!drag)return;
e.preventDefault();
var dx=e.clientX-drag.startX;
var dy=e.clientY-drag.startY;
var nowActive=drag.active||Math.hypot(dx,dy)>5;
var overSlot=nowActive?_this.computeOverEquippedSlot(e.clientX,e.clientY):false;
_this._drag=Object.assign({},drag,{overSlot:overSlot,active:nowActive,clientX:e.clientX,clientY:e.clientY});
_this.setState({drag:_this._drag});

if(nowActive)_this._updateGhost(e.clientX,e.clientY,drag.itemId);
};_this.

onDragEnd=function(_e){
document.removeEventListener('pointermove',_this.onDragMove);
document.removeEventListener('pointerup',_this.onDragEnd);
document.removeEventListener('pointercancel',_this.cancelDrag);
_this._removeGhost();
var drag=_this._drag;
_this._drag=null;
_this.setState({drag:null});
if(!(drag!=null&&drag.active))return;

_this._dragJustEnded=true;
setTimeout(function(){_this._dragJustEnded=false;},50);

if(drag.overSlot){
_this.props.onChange(drag.itemId);
}
};_this.

computeOverEquippedSlot=function(clientX,clientY){
if(!_this.equippedRef)return false;
var rect=_this.equippedRef.getBoundingClientRect();
return clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom;
};return _this;}_inheritsLoose(NzItemTable,_preact$Component);var _proto=NzItemTable.prototype;_proto.componentDidUpdate=function componentDidUpdate(prevProps){if(prevProps.items!==this.props.items){this.setState({query:''});}};_proto.componentWillUnmount=function componentWillUnmount(){this.cancelDrag();this._removeGhost();};_proto._removeGhost=function _removeGhost(){if(this._ghostEl){this._ghostEl.remove();this._ghostEl=null;}};_proto._updateGhost=function _updateGhost(x,y,itemId){var _item$name;if(!this._ghostEl){this._ghostEl=document.createElement('div');this._ghostEl.className='nz-drag-ghost';document.body.appendChild(this._ghostEl);}var item=this.props.items.find(function(i){return i.id===itemId;});var name=(_item$name=item==null?void 0:item.name)!=null?_item$name:itemId;var iconStyle=item?Dex.getItemIcon(item.name):'';this._ghostEl.innerHTML=iconStyle?"<span class=\"itemicon\" style=\""+iconStyle+"\"></span><span class=\"nz-drag-ghost-name\">"+name+"</span>":"<span class=\"nz-drag-ghost-name\">"+name+"</span>";this._ghostEl.style.left=x+14+"px";this._ghostEl.style.top=y-10+"px";this._ghostEl.style.display='flex';};_proto._startDrag=function _startDrag(state){this._drag=state;this.setState({drag:this._drag});document.addEventListener('pointermove',this.onDragMove);document.addEventListener('pointerup',this.onDragEnd);document.addEventListener('pointercancel',this.cancelDrag);};_proto.

renderMobileCard=function renderMobileCard(item){var _this2=this;
var dexItem=Dex.items.get(item.name);
var effect=(dexItem==null?void 0:dexItem.shortDesc)||(dexItem==null?void 0:dexItem.desc)||'';
return(
preact.h("li",{
key:item.id,
"class":"nz-item-card",
onClick:function(){
if(_this2._dragJustEnded)return;
_this2.props.onChange(item.id);
},
onPointerDown:function(e){return _this2.startRowDrag(item.id,e);}},

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
var _this$state=this.state,query=_this$state.query,drag=_this$state.drag;

var equippedItem=value?(_items$find=items.find(function(i){return i.id===value;}))!=null?_items$find:null:null;
var equippedName=(_equippedItem$name=equippedItem==null?void 0:equippedItem.name)!=null?_equippedItem$name:value||null;

var q=query.toLowerCase();
var available=items.filter(function(i){return i.id!==value&&!(excludeIds!=null&&excludeIds.has(i.id));});
var filtered=q?available.filter(function(item){return item.name.toLowerCase().includes(q);}):available;

var equippedDragOver=(drag==null?void 0:drag.active)&&drag.overSlot;

return(
preact.h("div",{"class":"nz-item-panel"},
preact.h("div",{
"class":"nz-item-equipped",
ref:function(el){_this3.equippedRef=el;}},

equippedName?
preact.h("div",{"class":"nz-item-equipped-filled"+(equippedDragOver?' nz-item-equipped--drag-over':'')},
preact.h("span",{"class":"itemicon",style:Dex.getItemIcon(equippedName)}),
preact.h("span",{"class":"nz-item-equipped-name"},equippedName),
equippedItem&&function(_Dex$items$get){
var desc=(_Dex$items$get=Dex.items.get(equippedName))==null?void 0:_Dex$items$get.shortDesc;
return desc?preact.h("span",{"class":"nz-item-equipped-desc"},desc):null;
}(),
preact.h("button",{"class":"nz-item-equipped-remove",onClick:function(){return onChange('');},title:"Remove item"},"\xD7")
):

preact.h("div",{"class":"nz-item-equipped-empty"+(equippedDragOver?' nz-item-equipped--drag-over':'')},
equippedDragOver?'Drop to equip':'No item held — select one below'
)

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
var isDragging=(drag==null?void 0:drag.active)&&drag.itemId===item.id;
return(
preact.h("tr",{
key:item.id,
"class":isDragging?'nz-item-row--dragging':undefined,
onClick:function(){
if(_this3._dragJustEnded)return;
onChange(item.id);
},
onPointerDown:function(e){return _this3.startRowDrag(item.id,e);}},

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