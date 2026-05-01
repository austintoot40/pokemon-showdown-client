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
sortDir:'asc'
};_this.

panelRef=preact.createRef();_this.









handleOutsideClick=function(e){
if(_this.panelRef.current&&!_this.panelRef.current.contains(e.target)){
_this.setState({activeSlot:null,activeMove:null});
}
};_this.








clickSlot=function(slot){
var _this$state=_this.state,activeMove=_this$state.activeMove,activeSlot=_this$state.activeSlot;
var _this$props=_this.props,moves=_this$props.moves,onChange=_this$props.onChange;

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
var _this$state2=_this.state,activeSlot=_this$state2.activeSlot,activeMove=_this$state2.activeMove;
var _this$props2=_this.props,moves=_this$props2.moves,onChange=_this$props2.onChange;


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
};return _this;}_inheritsLoose(NzMovePanel,_preact$Component);var _proto=NzMovePanel.prototype;_proto.componentDidMount=function componentDidMount(){document.addEventListener('click',this.handleOutsideClick,true);};_proto.componentWillUnmount=function componentWillUnmount(){document.removeEventListener('click',this.handleOutsideClick,true);};_proto.componentDidUpdate=function componentDidUpdate(prevProps){if(prevProps.legalMoves!==this.props.legalMoves){this.setState({activeSlot:null,activeMove:null,query:''});}};_proto.

getFilteredSorted=function getFilteredSorted(){
var _this$props3=this.props,legalMoves=_this$props3.legalMoves,generation=_this$props3.generation;
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
var _this$state4=this.state,activeSlot=_this$state4.activeSlot,activeMove=_this$state4.activeMove;
var moveId=(_moves$slot=moves[slot])!=null?_moves$slot:'';
var move=moveId?Dex.forGen(this.props.generation).moves.get(moveId):null;
var lm=moveId?this.props.legalMoves.find(function(m){return toID(m.name)===moveId;}):null;
var displayType=(_lm$hpType=lm==null?void 0:lm.hpType)!=null?_lm$hpType:move==null?void 0:move.type;
var isActive=activeSlot===slot;
var isTarget=activeSlot!==null&&!isActive;

var classes=[
'movebutton',
'nz-move-btn',
displayType?"type-"+displayType:'nz-move-btn--empty',
isActive?'nz-move-btn--active':'',
isTarget?'nz-move-btn--active-target':''].
filter(Boolean).join(' ');

return(
preact.h("button",{key:slot,"class":classes,onClick:function(){return _this2.clickSlot(slot);}},
move?move.name:preact.h("span",{"class":"nz-move-btn-empty-label"},"\u2014 Empty \u2014"),preact.h("br",null),
preact.h("small",{"class":"type"},displayType!=null?displayType:"\xA0")
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

render=function render(){var _this4=this;
var moves=this.props.moves;
var _this$state6=this.state,activeSlot=_this$state6.activeSlot,activeMove=_this$state6.activeMove,query=_this$state6.query;
var rows=this.getFilteredSorted();

return(
preact.h("div",{"class":"nz-move-panel",ref:this.panelRef},
preact.h("div",{"class":"nz-move-slots-wrap"+(activeMove!==null?' nz-move-selecting':'')},
preact.h("div",{"class":"movemenu nz-move-slots"},
[0,1,2,3].map(function(slot){return _this4.renderSlotButton(slot);})
)
),

preact.h("input",{
"class":"nz-move-search",
type:"text",
placeholder:"Search moves\u2026 (or type a type, category, or target)",
value:query,
onInput:function(e){return _this4.setState({query:e.target.value});}}
),

preact.h("div",{"class":"nz-move-table-wrap"+(activeSlot!==null?' nz-move-selecting':'')},
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
rows.map(function(_ref2){var _lm$hpType2;var lm=_ref2.lm,move=_ref2.move;
var id=toID(lm.name);
var isActive=activeMove===id;
var isEquipped=moves.includes(id);
var isNew=lm.isNew;
var displayType=(_lm$hpType2=lm.hpType)!=null?_lm$hpType2:move.type;
var cat=move.category;
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

var rowClass=[
isNew?'nz-move-row--new':'',
isActive?'nz-move-row--active':'',
isEquipped&&!isActive?'nz-move-row--equipped':''].
filter(Boolean).join(' ')||undefined;

return(
preact.h("tr",{key:id,"class":rowClass,onClick:function(){return _this4.clickRow(id);}},
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
)

));

};return NzMovePanel;}(preact.Component);
//# sourceMappingURL=move-panel.js.map