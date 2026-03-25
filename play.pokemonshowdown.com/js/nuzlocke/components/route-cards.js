"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}










function NzRouteCard(_ref)











{var routeName=_ref.routeName,pool=_ref.pool,dupeSpecies=_ref.dupeSpecies,allDupes=_ref.allDupes,onExplore=_ref.onExplore;
var cols=Math.max(1,Math.ceil(pool.length/2));
return preact.h("div",{
"class":"nz-route-card"+(allDupes?' nz-route-card-dupe':' nz-route-card-clickable'),
onClick:allDupes?undefined:onExplore},

preact.h("div",{"class":"nz-route-name"},routeName),
preact.h("div",{"class":"nz-route-pool",style:"grid-template-columns: repeat("+cols+", 80px)"},
pool.map(function(s){
var src="https://play.pokemonshowdown.com/sprites/gen5/"+toID(s)+".png";
var dupe=dupeSpecies.has(toID(s));
return preact.h("img",{key:s,src:src,alt:s,style:dupe?'opacity:0.25':''});
})
),
allDupes?
preact.h("div",{"class":"nz-label"},"Duplicate clause"):
preact.h("div",{"class":"nz-route-caught","aria-hidden":true,style:"visibility:hidden"},"_")

);
}var

NzRouteCardCaught=function(_preact$Component){function NzRouteCardCaught(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.





state={editing:false};_this.
startEdit=function(){return _this.setState({editing:true});};_this.
stopEdit=function(){return _this.setState({editing:false});};return _this;}_inheritsLoose(NzRouteCardCaught,_preact$Component);var _proto=NzRouteCardCaught.prototype;_proto.
render=function render(){
var _this$props=this.props,pokemon=_this$props.pokemon,pool=_this$props.pool,nickname=_this$props.nickname,onNickChange=_this$props.onNickChange;
var editing=this.state.editing;
var displayName=nickname!=null?nickname:pokemon.nickname;
var cols=pool?Math.max(1,Math.ceil(pool.length/2)):1;
return preact.h("div",{"class":"nz-route-card nz-route-card-resolved"},
preact.h("div",{"class":"nz-route-name"},pokemon.caughtRoute),
preact.h("div",{"class":"nz-route-pool",style:"grid-template-columns: repeat("+cols+", 80px)"},
pool?
pool.map(function(s){return toID(s)===toID(pokemon.species)?
preact.h("div",{key:s,"class":"nz-route-caught-aura"},
preact.h(NzSprite,{species:pokemon.species,shiny:pokemon.shiny,size:80})
):
preact.h("img",{key:s,src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(s)+".png",alt:s,style:"opacity:0.25"});}
):
preact.h("div",{"class":"nz-route-caught-aura"},
preact.h(NzSprite,{species:pokemon.species,shiny:pokemon.shiny,size:80})
)

),
onNickChange&&editing?
preact.h("input",{
"class":"nz-route-caught nz-route-caught-input",
type:"text",
value:displayName,
maxlength:12,
autoFocus:true,
onInput:function(e){return onNickChange(pokemon.uid,e.target.value);},
onBlur:this.stopEdit}
):
preact.h("div",{
"class":"nz-route-caught"+(onNickChange?' nz-route-caught-editable':''),
onClick:onNickChange?this.startEdit:undefined},

displayName
)

);
};return NzRouteCardCaught;}(preact.Component);
//# sourceMappingURL=route-cards.js.map