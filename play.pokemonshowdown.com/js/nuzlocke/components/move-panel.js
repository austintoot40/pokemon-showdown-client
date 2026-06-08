"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}










































var TYPES=new Set([
'normal','fire','water','electric','grass','ice','fighting','poison',
'ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy']
);

var CATEGORIES=new Set(['physical','special','status']);

function formatTarget(target){
switch(target){
case'allAdjacentFoes':return'Spread';
case'normal':case'any':return'Single';
case'self':return'Self';
case'adjacentAlly':return'Ally';
case'adjacentAllyOrSelf':return'Ally/Self';
case'allAdjacent':return'All adj';
case'allySide':return'Ally side';
case'foeSide':return'Foe side';
case'all':return'All';
case'randomNormal':return'Random';
default:return'—';
}
}

var TARGET_DISPLAY_VALUES=new Set([
'spread','single','self','ally','ally/self','all adj','ally side','foe side','all','random']
);var

NzMovePanel=function(_preact$Component){function NzMovePanel(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={
activeSlot:null,
activeMove:null,
query:'',
sortCol:'acquired',
sortDir:'asc',
drag:null
};_this.

panelRef=preact.createRef();_this.

_drag=null;_this.
_dragJustEnded=false;_this.
_ghostEl=null;_this.











handleOutsideClick=function(e){
if(_this.panelRef.current&&!_this.panelRef.current.contains(e.target)){
_this.setState({activeSlot:null,activeMove:null});
}
};_this.













































cancelDrag=function(){
document.removeEventListener('pointermove',_this.onDragMove);
document.removeEventListener('pointerup',_this.onDragEnd);
document.removeEventListener('pointercancel',_this.cancelDrag);
_this._removeGhost();
_this._drag=null;
_this.setState({drag:null});
};_this.

startSlotDrag=function(slot,e){
if(!_this.props.moves[slot])return;
_this._startDrag({
kind:'slot',
fromSlot:slot,
overSlot:null,
overRow:null,
active:false,
clientX:e.clientX,
clientY:e.clientY,
startX:e.clientX,
startY:e.clientY
});
};_this.

startRowDrag=function(moveId,e){
if(e.pointerType!=='mouse')return;
if(_this.props.moves.includes(moveId))return;
_this._startDrag({
kind:'row',
moveId:moveId,
overSlot:null,
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
var overSlot=nowActive?_this.computeOverSlot(e.clientX,e.clientY):null;

if(drag.kind==='slot'){
var overRow=nowActive&&overSlot===null?_this.computeOverRow(e.clientX,e.clientY):null;
_this._drag=Object.assign({},drag,{overSlot:overSlot,overRow:overRow,active:nowActive,clientX:e.clientX,clientY:e.clientY});
}else{
_this._drag=Object.assign({},drag,{overSlot:overSlot,active:nowActive,clientX:e.clientX,clientY:e.clientY});
}
_this.setState({drag:_this._drag});

if(nowActive){
var moveId=drag.kind==='slot'?_this.props.moves[drag.fromSlot]:drag.moveId;
if(moveId)_this._updateGhost(e.clientX,e.clientY,moveId);
}
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

var _this$props=_this.props,moves=_this$props.moves,onChange=_this$props.onChange;

if(drag.kind==='slot'){
var fromSlot=drag.fromSlot,overSlot=drag.overSlot,overRow=drag.overRow;
if(overSlot!==null&&overSlot!==fromSlot){

var newMoves=[].concat(moves);
var temp=newMoves[fromSlot];
newMoves[fromSlot]=newMoves[overSlot];
newMoves[overSlot]=temp;
onChange(newMoves);
}else if(overRow!==null&&overRow!==moves[fromSlot]){


var _newMoves=[].concat(moves);
var targetSlot=_newMoves.findIndex(function(m){return m===overRow;});
if(targetSlot!==-1)_newMoves[targetSlot]=_newMoves[fromSlot];
_newMoves[fromSlot]=overRow;
onChange(_newMoves);
}
}else{
var moveId=drag.moveId,_overSlot=drag.overSlot;
if(_overSlot!==null){
var _newMoves2=[].concat(moves);
var existingSlot=_newMoves2.findIndex(function(m){return m===moveId;});
if(existingSlot!==-1&&existingSlot!==_overSlot)_newMoves2[existingSlot]='';
_newMoves2[_overSlot]=moveId;
onChange(_newMoves2);
_this.setState({activeMove:null,activeSlot:null});
}
}
};_this.

computeOverSlot=function(clientX,clientY){
if(!_this.panelRef.current)return null;
var buttons=_this.panelRef.current.querySelectorAll('.nz-move-slots .movebutton');
for(var i=0;i<buttons.length;i++){
var rect=buttons[i].getBoundingClientRect();
if(clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom)return i;
}
return null;
};_this.

computeOverRow=function(clientX,clientY){
var el=document.elementFromPoint(clientX,clientY);
if(!el)return null;
var row=el.closest('[data-moveid]');
return row?row.getAttribute('data-moveid'):null;
};_this.



clickSlot=function(slot){
if(_this._dragJustEnded)return;
var _this$state=_this.state,activeMove=_this$state.activeMove,activeSlot=_this$state.activeSlot;
var _this$props2=_this.props,moves=_this$props2.moves,onChange=_this$props2.onChange;

if(activeMove!==null){

var newMoves=[].concat(moves);
var existingSlot=newMoves.findIndex(function(m){return m===activeMove;});
if(existingSlot!==-1&&existingSlot!==slot)newMoves[existingSlot]='';
newMoves[slot]=activeMove;
onChange(newMoves);
_this.setState({activeMove:null,activeSlot:null});
}else{

_this.setState({activeSlot:activeSlot===slot?null:slot,activeMove:null});
}
};_this.

clickRow=function(moveId){
if(_this._dragJustEnded)return;
var _this$state2=_this.state,activeSlot=_this$state2.activeSlot,activeMove=_this$state2.activeMove;
var _this$props3=_this.props,moves=_this$props3.moves,onChange=_this$props3.onChange;


if(activeMove===moveId){
_this.setState({activeMove:null});
return;
}

if(activeSlot!==null){

var newMoves=[].concat(moves);
var existingSlot=newMoves.findIndex(function(m){return m===moveId;});
if(existingSlot!==-1&&existingSlot!==activeSlot)newMoves[existingSlot]='';
newMoves[activeSlot]=moveId;
onChange(newMoves);
_this.setState({activeSlot:null,activeMove:null});
}else{

if(moves.includes(moveId))return;
_this.setState({activeMove:moveId,activeSlot:null});
}
};_this.

setSort=function(col){
_this.setState(function(s){return{
sortCol:col,
sortDir:s.sortCol===col?s.sortDir==='asc'?'desc':'asc':'desc'
};});
};return _this;}_inheritsLoose(NzMovePanel,_preact$Component);var _proto=NzMovePanel.prototype;_proto.componentDidMount=function componentDidMount(){document.addEventListener('click',this.handleOutsideClick,true);};_proto.componentWillUnmount=function componentWillUnmount(){document.removeEventListener('click',this.handleOutsideClick,true);this.cancelDrag();this._removeGhost();};_proto.componentDidUpdate=function componentDidUpdate(prevProps){if(prevProps.legalMoves!==this.props.legalMoves){this.setState({activeSlot:null,activeMove:null,query:''});}};_proto._removeGhost=function _removeGhost(){if(this._ghostEl){this._ghostEl.remove();this._ghostEl=null;}};_proto._updateGhost=function _updateGhost(x,y,moveId){var _move$name,_move$type;if(!this._ghostEl){this._ghostEl=document.createElement('div');this._ghostEl.className='nz-drag-ghost';document.body.appendChild(this._ghostEl);}var move=Dex.forGen(this.props.generation).moves.get(moveId);var name=(_move$name=move==null?void 0:move.name)!=null?_move$name:moveId;var type=(_move$type=move==null?void 0:move.type)!=null?_move$type:'';var typeLower=type.toLowerCase();this._ghostEl.innerHTML=type?"<span class=\"nz-type nz-type-"+typeLower+"\" style=\"font-size:10px;padding:1px 5px\">"+type+"</span><span class=\"nz-drag-ghost-name\">"+name+"</span>":"<span class=\"nz-drag-ghost-name\">"+name+"</span>";this._ghostEl.style.left=x+14+"px";this._ghostEl.style.top=y-10+"px";this._ghostEl.style.display='flex';};_proto._startDrag=function _startDrag(state){this._drag=state;this.setState({drag:this._drag});document.addEventListener('pointermove',this.onDragMove);document.addEventListener('pointerup',this.onDragEnd);document.addEventListener('pointercancel',this.cancelDrag);};_proto.

getFilteredSorted=function getFilteredSorted(){
var _this$props4=this.props,legalMoves=_this$props4.legalMoves,generation=_this$props4.generation;
var _this$state3=this.state,query=_this$state3.query,sortCol=_this$state3.sortCol,sortDir=_this$state3.sortDir;
var q=query.trim().toLowerCase();
var dex=Dex.forGen(generation);

var rows=legalMoves.map(function(lm){return{lm:lm,move:dex.moves.get(toID(lm.name))};}).
filter(function(_ref){var move=_ref.move;return move.exists;});


var filtered=q===''?rows:function(){
if(TYPES.has(q)){
var displayType=function(r){var _r$lm$hpType;
var t=(_r$lm$hpType=r.lm.hpType)!=null?_r$lm$hpType:r.move.type;
return t.toLowerCase();
};
return rows.filter(function(r){return displayType(r)===q;});
}
if(CATEGORIES.has(q)){
return rows.filter(function(r){return r.move.category.toLowerCase()===q;});
}
var targetQ=q==='ally/self'?'ally/self':q;
if(TARGET_DISPLAY_VALUES.has(targetQ)){
return rows.filter(function(r){return formatTarget(r.move.target).toLowerCase()===targetQ;});
}
return rows.filter(function(r){return r.lm.name.toLowerCase().includes(q);});
}();


var dir=sortDir==='asc'?1:-1;
return[].concat(filtered).sort(function(a,b){var _a$lm$hpType,_b$lm$hpType,_a$move$basePower,_b$move$basePower,_a$move$pp,_b$move$pp;
var va;
var vb;
switch(sortCol){
case'acquired':{

if(a.lm.isNew!==b.lm.isNew)return a.lm.isNew?-1:1;
var aTM=a.lm.fromTM||a.lm.fromHM;
var bTM=b.lm.fromTM||b.lm.fromHM;
if(aTM!==bTM)return aTM?1:-1;
return(b.lm.acquisitionOrder-a.lm.acquisitionOrder)*dir;
}
case'name':
return a.lm.name.localeCompare(b.lm.name)*dir;
case'type':
va=((_a$lm$hpType=a.lm.hpType)!=null?_a$lm$hpType:a.move.type).toLowerCase();
vb=((_b$lm$hpType=b.lm.hpType)!=null?_b$lm$hpType:b.move.type).toLowerCase();
return(va<vb?-1:va>vb?1:0)*dir;
case'category':
return a.move.category.localeCompare(b.move.category)*dir;
case'power':
va=(_a$move$basePower=a.move.basePower)!=null?_a$move$basePower:0;
vb=(_b$move$basePower=b.move.basePower)!=null?_b$move$basePower:0;
return(va-vb)*dir;
case'accuracy':{var _a$move$accuracy,_b$move$accuracy;
var accA=a.move.accuracy===true?101:(_a$move$accuracy=a.move.accuracy)!=null?_a$move$accuracy:0;
var accB=b.move.accuracy===true?101:(_b$move$accuracy=b.move.accuracy)!=null?_b$move$accuracy:0;
return(accA-accB)*dir;
}
case'pp':
return(((_a$move$pp=a.move.pp)!=null?_a$move$pp:0)-((_b$move$pp=b.move.pp)!=null?_b$move$pp:0))*dir;
default:
return 0;
}
});
};_proto.

renderSlotButton=function renderSlotButton(slot){var _moves$slot,_lm$hpType,_this2=this;
var moves=this.props.moves;
var _this$state4=this.state,activeSlot=_this$state4.activeSlot,activeMove=_this$state4.activeMove,drag=_this$state4.drag;
var moveId=(_moves$slot=moves[slot])!=null?_moves$slot:'';
var move=moveId?Dex.forGen(this.props.generation).moves.get(moveId):null;
var lm=moveId?this.props.legalMoves.find(function(m){return toID(m.name)===moveId;}):null;
var displayType=(_lm$hpType=lm==null?void 0:lm.hpType)!=null?_lm$hpType:move==null?void 0:move.type;
var isActive=activeSlot===slot;
var isTarget=activeSlot!==null&&!isActive;

var isDraggingThis=(drag==null?void 0:drag.active)&&drag.kind==='slot'&&drag.fromSlot===slot;
var isDragOver=(drag==null?void 0:drag.active)&&(
drag.kind==='slot'&&drag.overSlot===slot&&drag.fromSlot!==slot||
drag.kind==='row'&&drag.overSlot===slot);


var classes=[
'movebutton',
'nz-move-btn',
displayType?"type-"+displayType:'nz-move-btn--empty',
isActive?'nz-move-btn--active':'',
isTarget?'nz-move-btn--active-target':'',
isDraggingThis?'nz-move-btn--dragging':'',
isDragOver?'nz-move-btn--drag-over':''].
filter(Boolean).join(' ');

return(
preact.h("button",{
key:slot,
"class":classes,
onClick:function(){return _this2.clickSlot(slot);},
onPointerDown:function(e){return _this2.startSlotDrag(slot,e);}},

move?move.name:preact.h("span",{"class":"nz-move-btn-empty-label"},"\u2014 Empty \u2014"),preact.h("br",null),
preact.h("small",{"class":"type"},displayType!=null?displayType:' ')
));

};_proto.

renderHeader=function renderHeader(col,label,className){var _this3=this;
var _this$state5=this.state,sortCol=_this$state5.sortCol,sortDir=_this$state5.sortDir;
var active=sortCol===col;
var cls=[className,active?'nz-th-active':''].filter(Boolean).join(' ')||undefined;
return(
preact.h("th",{"class":cls,onClick:function(){return _this3.setSort(col);}},
label,
active&&preact.h("span",{"class":"nz-sort-arrow"},sortDir==='asc'?'▲':'▼')
));

};_proto.

renderSortBar=function renderSortBar(){var _this4=this;
var _this$state6=this.state,sortCol=_this$state6.sortCol,sortDir=_this$state6.sortDir;
var options=[
['acquired','Acq'],
['name','Name'],
['type','Type'],
['category','Cat'],
['power','BP'],
['accuracy','Acc'],
['pp','PP']];

return(
preact.h("div",{"class":"nz-move-sort-bar"},
preact.h("span",{"class":"nz-move-sort-label"},"Sort:"),
options.map(function(_ref2){var col=_ref2[0],label=_ref2[1];
var active=sortCol===col;
return(
preact.h("button",{
key:col,
"class":"nz-move-sort-btn"+(active?' nz-move-sort-btn--active':''),
onClick:function(){return _this4.setSort(col);}},

label,active&&preact.h("span",{"class":"nz-sort-arrow"},sortDir==='asc'?'▲':'▼')
));

})
));

};_proto.

renderMobileCard=function renderMobileCard(_ref3){var _lm$hpType2,_this5=this;var lm=_ref3.lm,move=_ref3.move;
var moves=this.props.moves;
var _this$state7=this.state,activeMove=_this$state7.activeMove,dragState=_this$state7.drag;
var id=toID(lm.name);
var isActive=activeMove===id;
var isEquipped=moves.includes(id);
var isDragging=(dragState==null?void 0:dragState.active)&&dragState.kind==='row'&&dragState.moveId===id;
var isSlotDragOver=(dragState==null?void 0:dragState.active)&&dragState.kind==='slot'&&dragState.overRow===id;
var displayType=(_lm$hpType2=lm.hpType)!=null?_lm$hpType2:move.type;
var power=move.basePower>0?""+move.basePower:'—';
var acc=move.accuracy===true?'—':move.accuracy+"%";
var acquiredLabel;
var acquiredNew=false;
if(lm.fromTM||lm.fromHM){
acquiredLabel=lm.tmRoute||(lm.fromHM?'HM':'TM');
acquiredNew=lm.isNew;
}else{
acquiredLabel=lm.learnedLevel!==undefined?"Lv. "+lm.learnedLevel:'—';
acquiredNew=lm.isNew;
}
var itemClass=[
'nz-move-item',
lm.isNew?'nz-move-item--new':'',
isActive?'nz-move-item--active':'',
isEquipped&&!isActive?'nz-move-item--equipped':'',
isDragging?'nz-move-item--dragging':'',
isSlotDragOver?'nz-move-item--drag-over':''].
filter(Boolean).join(' ');
return(
preact.h("li",{key:id,"data-moveid":id,"class":itemClass,onClick:function(){return _this5.clickRow(id);},onPointerDown:function(e){return _this5.startRowDrag(id,e);}},
preact.h("div",{"class":"nz-move-item-header"},
preact.h("span",{"class":"nz-move-item-name"},lm.name),
preact.h("span",{"class":"nz-type nz-type-"+displayType.toLowerCase()},displayType),
preact.h("span",{"class":"nz-move-cat nz-move-cat-"+move.category.toLowerCase()},move.category)
),
preact.h("div",{"class":"nz-move-item-desc"},move.shortDesc||move.desc||''),
preact.h("div",{"class":"nz-move-item-stats"},
preact.h("span",{"class":"nz-move-item-stat"},preact.h("span",{"class":"nz-move-item-stat-label"},"BP"),power),
preact.h("span",{"class":"nz-move-item-stat"},preact.h("span",{"class":"nz-move-item-stat-label"},"Acc"),acc),
preact.h("span",{"class":"nz-move-item-stat"},preact.h("span",{"class":"nz-move-item-stat-label"},"PP"),move.pp),
preact.h("span",{"class":"nz-move-item-acq"+(acquiredNew?' nz-move-col-acquired--new':'')},acquiredLabel)
)
));

};_proto.

render=function render(){var _this6=this;
var moves=this.props.moves;
var _this$state8=this.state,activeSlot=_this$state8.activeSlot,activeMove=_this$state8.activeMove,query=_this$state8.query,drag=_this$state8.drag;
var rows=this.getFilteredSorted();

return(
preact.h("div",{"class":"nz-move-panel",ref:this.panelRef},
preact.h("div",{"class":"nz-move-slots-wrap"+(activeMove!==null||drag!=null&&drag.active&&drag.kind==='row'?' nz-move-selecting':'')},
preact.h("div",{"class":"movemenu nz-move-slots"},
[0,1,2,3].map(function(slot){return _this6.renderSlotButton(slot);})
)
),

preact.h("input",{
"class":"nz-move-search",
type:"text",
placeholder:"Search moves\u2026 (or type a type, category, or target)",
value:query,
onInput:function(e){return _this6.setState({query:e.target.value});}}
),

this.renderSortBar(),

preact.h("div",{"class":"nz-move-table-wrap nz-move-desktop"+(activeSlot!==null||drag!=null&&drag.active&&drag.kind==='slot'?' nz-move-selecting':'')+(drag!=null&&drag.active&&drag.kind==='row'?' nz-move-drag-active':'')},
preact.h("table",{"class":"nz-move-table"},
preact.h("thead",null,
preact.h("tr",null,
this.renderHeader('name','Move'),
this.renderHeader('type','Type'),
this.renderHeader('category','Cat'),
preact.h("th",{"class":"nz-move-col-desc"},"Effect"),
this.renderHeader('power','BP','nz-move-col-stat'),
this.renderHeader('accuracy','Acc','nz-move-col-stat'),
this.renderHeader('pp','PP','nz-move-col-stat'),
this.renderHeader('acquired','Acquired','nz-move-col-acquired-header')
)
),
preact.h("tbody",null,
rows.map(function(_ref4){var _lm$hpType3;var lm=_ref4.lm,move=_ref4.move;
var id=toID(lm.name);
var isActive=activeMove===id;
var isEquipped=moves.includes(id);
var isNew=lm.isNew;
var displayType=(_lm$hpType3=lm.hpType)!=null?_lm$hpType3:move.type;
var cat=move.category;
var power=move.basePower>0?""+move.basePower:'—';
var acc=move.accuracy===true?'—':move.accuracy+"%";
var isDragging=(drag==null?void 0:drag.active)&&drag.kind==='row'&&drag.moveId===id;

var acquiredLabel;
var acquiredNew=false;
if(lm.fromTM||lm.fromHM){
acquiredLabel=lm.tmRoute||(lm.fromHM?'HM':'TM');
acquiredNew=lm.isNew;
}else{
acquiredLabel=lm.learnedLevel!==undefined?"Lv. "+lm.learnedLevel:'—';
acquiredNew=lm.isNew;
}

var isSlotDragOver=(drag==null?void 0:drag.active)&&drag.kind==='slot'&&drag.overRow===id;
var rowClass=[
isNew?'nz-move-row--new':'',
isActive?'nz-move-row--active':'',
isEquipped&&!isActive?'nz-move-row--equipped':'',
isDragging?'nz-move-row--dragging':'',
isSlotDragOver?'nz-move-row--drag-over':''].
filter(Boolean).join(' ')||undefined;

return(
preact.h("tr",{key:id,"data-moveid":id,"class":rowClass,onClick:function(){return _this6.clickRow(id);},onPointerDown:function(e){return _this6.startRowDrag(id,e);}},
preact.h("td",{"class":"nz-move-col-name"},lm.name),
preact.h("td",null,preact.h("span",{"class":"nz-type nz-type-"+displayType.toLowerCase()},displayType)),
preact.h("td",null,preact.h("span",{"class":"nz-move-cat nz-move-cat-"+move.category.toLowerCase()},cat)),
preact.h("td",{"class":"nz-move-col-desc"},preact.h("div",{"class":"nz-move-col-desc-inner"},move.shortDesc||move.desc||'')),
preact.h("td",{"class":"nz-move-col-stat"},power),
preact.h("td",{"class":"nz-move-col-stat"},acc),
preact.h("td",{"class":"nz-move-col-stat"},move.pp),
preact.h("td",{"class":"nz-move-col-acquired"+(acquiredNew?' nz-move-col-acquired--new':'')},
acquiredLabel
)
));

}),
rows.length===0&&
preact.h("tr",null,
preact.h("td",{colSpan:8,style:"text-align:center;color:var(--nz-text-dim);padding:16px;"},"No moves match"

)
)

)
)
),

preact.h("div",{"class":"nz-move-list-wrap nz-move-mobile"+(activeSlot!==null||drag!=null&&drag.active&&drag.kind==='slot'?' nz-move-selecting':'')},
rows.length===0?
preact.h("div",{"class":"nz-move-no-results"},"No moves match"):
preact.h("ul",{"class":"nz-move-list"},
rows.map(function(row){return _this6.renderMobileCard(row);})
)

)

));

};return NzMovePanel;}(preact.Component);
//# sourceMappingURL=move-panel.js.map