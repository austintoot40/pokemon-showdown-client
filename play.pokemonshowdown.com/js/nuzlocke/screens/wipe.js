"use strict";












var QUIPS=[
"And so your journey came to an end. {trainer} barely broke a sweat.",
"{trainer} would like you to know this happens to everyone. It doesn't.",
"Blacked out. Whited out. Wiped out. Courtesy of {trainer}.",
"{trainer} has added your team to their highlight reel.",
"A moment of silence for everyone who trusted you.",
"You gave it your all. {trainer} gave slightly more.",
"The credits would roll, but this isn't that kind of ending.",
"{trainer} has seen better challengers. Many, many better challengers.",
"Your party died for this. Let that sink in.",
"Next time, maybe try having a strategy.",
"{trainer} says hi. Your Pokemon say nothing, because they fainted.",
"Defeated. Humiliated. Sent back to the menu. By {trainer}."];


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