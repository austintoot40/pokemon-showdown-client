"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var








BattleScreen=function(_preact$Component){function BattleScreen(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.









goToBattle=function(){
var battleRoomId=_this.props.game.battleRoomId;
if(!battleRoomId)return;
if(PS.rooms[battleRoomId]){
PS.focusRoom(battleRoomId);
}else{
PS.join(battleRoomId);
}
};return _this;}_inheritsLoose(BattleScreen,_preact$Component);var _proto=BattleScreen.prototype;_proto.componentDidMount=function componentDidMount(){this.goToBattle();};_proto.componentDidUpdate=function componentDidUpdate(){var _room;if(((_room=PS.room)==null?void 0:_room.id)!=='view-nuzlocke')return;this.goToBattle();};_proto.

render=function render(){
var game=this.props.game;
var battleRoomId=game.battleRoomId;

return preact.h(NzScreen,null,
preact.h(NzTimeline,{game:game}),
preact.h(NzPanelFlat,null,
preact.h("p",{style:"color:var(--nz-text-muted);font-size:13px;"},"Battle in progress. Return here when it ends."

),
battleRoomId&&
preact.h("button",{"class":"nz-btn nz-btn-accent",onClick:this.goToBattle,style:"margin-top:12px;"},"Go to Battle"

)

)
);
};return BattleScreen;}(preact.Component);
//# sourceMappingURL=battle.js.map