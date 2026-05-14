"use strict";












var QUIPS=[
"Try catching better Pokémon.",
"You probably just rolled bad natures or something.",
"It is the true nature of nuzlockers to lose repeatedly.",
"Pokémon Go might be more your speed.",
"Your battle style is... intriguing.",
"Unfortunately, you can't save scum your way out of this one."];


function WipeScreen(_ref){var _game$segment,_battle$trainer,_battle$sprite,_ref2,_Dex;var game=_ref.game;
var battle=(_game$segment=game.segment)==null?void 0:_game$segment.battles[game.currentBattleIndex];
var trainerName=(_battle$trainer=battle==null?void 0:battle.trainer)!=null?_battle$trainer:'the trainer';
var spriteId=(_battle$sprite=battle==null?void 0:battle.sprite)!=null?_battle$sprite:'unknown';
var spriteUrl=(_ref2=(_Dex=window.Dex)==null?void 0:_Dex.resolveAvatar(spriteId))!=null?_ref2:"https://play.pokemonshowdown.com/sprites/trainers/"+
spriteId+".png";

var rawQuip=QUIPS[Math.floor(Math.random()*QUIPS.length)].replace(/\{trainer\}/g,trainerName);
var words=rawQuip.split(' ');

var trainerDelay=0.5;
var quipStart=1.2;
var wordSpacing=0.12;
var footerDelay=quipStart+words.length*wordSpacing+0.5;

function handleMainMenu(){
PS.send('/nuzlocke done');
}

return(
preact.h(NzRoot,null,
preact.h(NzScreen,null,
preact.h("div",{"class":"nz-shame-screen"},
preact.h("div",{"class":"nz-shame-header"},
preact.h("div",{"class":"nz-shame-title"},"\u2717 HALL OF SHAME \u2717"),
preact.h("div",{"class":"nz-shame-subtitle"},"Your run is over."

)
),

preact.h("div",{"class":"nz-shame-trainer-wrap",style:"animation-delay:"+trainerDelay+"s"},
preact.h("img",{
"class":"nz-shame-trainer-img",
src:spriteUrl,
alt:trainerName,
width:128,
height:128}
)
),

preact.h("div",{"class":"nz-shame-quip"},
words.map(function(word,i){return(
preact.h("span",{
key:i,
"class":"nz-shame-word",
style:"animation-delay:"+(quipStart+i*wordSpacing)+"s"},

word
));}
)
),

preact.h("div",{"class":"nz-shame-footer",style:"animation-delay:"+footerDelay+"s"},
preact.h("button",{"class":"nz-btn nz-shame-menu-btn",onClick:handleMainMenu},"Main Menu"

)
)
)
)
));

}
//# sourceMappingURL=wipe.js.map