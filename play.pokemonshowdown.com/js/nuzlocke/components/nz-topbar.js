"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}







var _openFeedbackCb=function(){};

function openFeedbackModal(){
_openFeedbackCb();
}







var _mobileBackHandler=null;
var _onMobileBackChange=function(){};

function setMobileBackHandler(cb){
_mobileBackHandler=cb;
_onMobileBackChange();
}

function clearMobileBackHandler(){
_mobileBackHandler=null;
_onMobileBackChange();
}





var _RUNCOUNT_KEY='nuzlocke_run_count';
var _savedCount=localStorage.getItem(_RUNCOUNT_KEY);
var _runCount=_savedCount!==null?parseInt(_savedCount,10):null;

function setRunCount(count){
_runCount=count;
localStorage.setItem(_RUNCOUNT_KEY,String(count));
}





var _AVATAR_KEY='nuzlocke_avatar_pref';

function getTrainerList(){
var avatarNumbers=window.BattleAvatarNumbers;
if(!avatarNumbers)return['lucas'];
var seen=new Set();
var out=[];for(var _i2=0,_Object$values2=
Object.values(avatarNumbers);_i2<_Object$values2.length;_i2++){var val=_Object$values2[_i2];
if(!val||val.startsWith('#'))continue;
if(!seen.has(val)){seen.add(val);out.push(val);}
}
out.sort(function(a,b){return a.localeCompare(b);});
return out;
}var















NzSettingsPanel=function(_preact$Component){function NzSettingsPanel(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={
muted:PS.prefs.mute,
avatar:localStorage.getItem(_AVATAR_KEY)||PS.user.avatar||'lucas',
search:''
};_this.

toggleMute=function(){
PS.prefs.set('mute',!PS.prefs.mute);
_this.setState({muted:PS.prefs.mute});
PS.update();
};_this.

setAvatar=function(avatarId){
PS.user.avatar=avatarId;
localStorage.setItem(_AVATAR_KEY,avatarId);
PS.send('/avatar '+avatarId);
_this.setState({avatar:avatarId});
};_this.

handleOverlayClick=function(e){
if(e.target===e.currentTarget)_this.props.onClose();
};return _this;}_inheritsLoose(NzSettingsPanel,_preact$Component);var _proto=NzSettingsPanel.prototype;_proto.

render=function render(){var _this2=this;
var onClose=this.props.onClose;
var _this$state=this.state,muted=_this$state.muted,avatar=_this$state.avatar,search=_this$state.search;
var q=search.toLowerCase().trim();
var trainers=getTrainerList().filter(function(id){return!q||id.includes(q);});

return(
preact.h("div",{"class":"nz-settings-overlay",onClick:this.handleOverlayClick},
preact.h("div",{"class":"nz-settings-panel nz-elevated",onClick:function(e){return e.stopPropagation();}},
preact.h("div",{"class":"nz-settings-header"},
preact.h("span",{"class":"nz-settings-title"},"Settings"),
preact.h("button",{"class":"nz-settings-close",onClick:onClose,"aria-label":"Close"},
preact.h("i",{"class":"fa fa-times","aria-hidden":true})
)
),

preact.h("div",{"class":"nz-settings-body"},

preact.h("section",{"class":"nz-settings-section"},
preact.h("div",{"class":"nz-settings-row"},
preact.h("span",{"class":"nz-settings-label"},
preact.h("i",{"class":"fa "+(muted?'fa-volume-off':'fa-volume-up'),"aria-hidden":true}),
' ',"Sound"
),
preact.h("button",{
"class":"nz-settings-toggle "+(muted?'nz-settings-toggle--off':'nz-settings-toggle--on'),
onClick:this.toggleMute},

muted?'Off':'On'
)
)
),


preact.h("section",{"class":"nz-settings-section nz-settings-section--last"},
preact.h("div",{"class":"nz-settings-section-label"},"Trainer Avatar"),
preact.h("div",{"class":"nz-avatar-preview"},
preact.h("img",{
src:"//play.pokemonshowdown.com/sprites/trainers/"+avatar+".png",
alt:avatar,
width:"80",
height:"80"}
),
preact.h("span",{"class":"nz-avatar-preview-name"},avatar)
),
preact.h("input",{
"class":"nz-avatar-search",
type:"text",
placeholder:"Search\u2026",
value:search,
onInput:function(e){return _this2.setState({search:e.target.value});}}
),
preact.h("div",{"class":"nz-avatar-scroll"},
preact.h("div",{"class":"nz-avatar-grid"},
trainers.map(function(id){return(
preact.h("button",{
key:id,
"class":"nz-avatar-btn "+(avatar===id?'nz-avatar-btn--selected':''),
onClick:function(){return _this2.setAvatar(id);},
title:id},

preact.h("img",{
src:"//play.pokemonshowdown.com/sprites/trainers/"+id+".png",
alt:id,
width:"40",
height:"40"}
)
));}
)
)
)
)

)
)
));

};return NzSettingsPanel;}(preact.Component);var











NzTopBar=function(_preact$Component2){function NzTopBar(){var _this3;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this3=_preact$Component2.call.apply(_preact$Component2,[this].concat(args))||this;_this3.
state={
settingsOpen:false,
feedbackOpen:false
};_this3.

_avatarTimeout=void 0;_this3.









_sendAvatarWhenReady=function(){var _connection;
var savedAvatar=localStorage.getItem(_AVATAR_KEY);
if(!savedAvatar)return;
if(!((_connection=PS.connection)!=null&&_connection.connected)){
_this3._avatarTimeout=setTimeout(_this3._sendAvatarWhenReady,200);
return;
}
PS.send('/avatar '+savedAvatar);
};_this3.







openSettings=function(){return _this3.setState({settingsOpen:true});};_this3.
closeSettings=function(){return _this3.setState({settingsOpen:false});};_this3.
openFeedback=function(){return _this3.setState({settingsOpen:false,feedbackOpen:true});};_this3.
closeFeedback=function(){return _this3.setState({feedbackOpen:false});};_this3.

goToMenu=function(){
var ps=PS;
ps.join('');for(var _i4=0,_Object$keys2=
Object.keys(ps.rooms);_i4<_Object$keys2.length;_i4++){var roomId=_Object$keys2[_i4];
if(roomId!=='')ps.removeRoom(ps.rooms[roomId]);
}
};return _this3;}_inheritsLoose(NzTopBar,_preact$Component2);var _proto2=NzTopBar.prototype;_proto2.componentDidMount=function componentDidMount(){var _this4=this;_openFeedbackCb=function(){_this4.setState({settingsOpen:false,feedbackOpen:true});};_onMobileBackChange=function(){return _this4.forceUpdate();};this._sendAvatarWhenReady();};_proto2.componentWillUnmount=function componentWillUnmount(){_openFeedbackCb=function(){};_onMobileBackChange=function(){};clearTimeout(this._avatarTimeout);};_proto2.

render=function render(){var _ref,_ps$room$id,_ps$room,_ps$curRoom;
var _this$state2=this.state,settingsOpen=_this$state2.settingsOpen,feedbackOpen=_this$state2.feedbackOpen;
var ps=PS;
var currentRoomId=(_ref=(_ps$room$id=(_ps$room=ps.room)==null?void 0:_ps$room.id)!=null?_ps$room$id:(_ps$curRoom=ps.curRoom)==null?void 0:_ps$curRoom.id)!=null?_ref:'';
var inRun=currentRoomId!=='';
return(
preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-topbar"},
preact.h("div",{"class":"nz-topbar-left"},
inRun?
preact.h("button",{
"class":"nz-topbar-btn nz-topbar-back-btn",
onClick:this.goToMenu,
title:"Back to Main Menu",
"aria-label":"Back to Main Menu"},

preact.h("i",{"class":"fa fa-arrow-left","aria-hidden":true})
):
_mobileBackHandler&&
preact.h("button",{
"class":"nz-topbar-btn nz-topbar-back-btn nz-topbar-back-btn--mobile-only",
onClick:_mobileBackHandler,
title:"Back to Game Selection",
"aria-label":"Back to Game Selection"},

preact.h("i",{"class":"fa fa-arrow-left","aria-hidden":true})
)

),
preact.h("div",{"class":"nz-topbar-brand"},
preact.h("span",{"class":"nz-topbar-wordmark"},"NUZLOCKE"),
preact.h("span",{"class":"nz-topbar-sub"},"SIM",preact.h("span",{"class":"nz-topbar-sub-full"},"ULATOR")),
_runCount!==null&&
preact.h("span",{"class":"nz-topbar-runcount"},
_runCount.toLocaleString()," run",_runCount!==1?'s':''," worldwide"
)

),
preact.h("div",{"class":"nz-topbar-actions"},
preact.h("a",{"class":"nz-topbar-btn",href:"view-about",title:"About This Game","aria-label":"About This Game"},
preact.h("i",{"class":"fa fa-info-circle","aria-hidden":true})
),
preact.h("button",{"class":"nz-topbar-btn",onClick:this.openFeedback,title:"Report a Bug","aria-label":"Report a Bug"},
preact.h("i",{"class":"fa fa-bug","aria-hidden":true})
),
preact.h("button",{"class":"nz-topbar-btn",onClick:this.openSettings,"aria-label":"Settings",title:"Settings"},
preact.h("i",{"class":"fa fa-cog","aria-hidden":true})
)
)
),
settingsOpen&&
preact.h(NzSettingsPanel,{
onClose:this.closeSettings}
),

feedbackOpen&&
preact.h(FeedbackModal,{onClose:this.closeFeedback})

));

};return NzTopBar;}(preact.Component);
//# sourceMappingURL=nz-topbar.js.map