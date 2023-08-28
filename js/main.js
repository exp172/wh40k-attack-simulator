const modifiersEl = document.querySelector('#modifiers');

const inputAttackerCount = document.querySelector('#attackerCount')
const inputAttacks = document.querySelector('#attacks')
const inputWbs = document.querySelector('#wbs')
const inputStrength = document.querySelector('#strength')
const inputAp = document.querySelector('#ap')
const inputDamage = document.querySelector('#damage')

const inputDefenderCount = document.querySelector('#defenderCount')
const inputToughness = document.querySelector('#toughness')
const inputSave = document.querySelector('#save')
const inputInvul = document.querySelector('#invul')
const inputWounds = document.querySelector('#wounds')
const inputFnp = document.querySelector('#fnp')

const attackerFactionSelectEl = document.querySelector('#attackers_faction_select')
const defenderFactionSelectEl = document.querySelector('#defenders_faction_select')
const attackerUnitSelectEl = document.querySelector('#attackers_select')
const defenderUnitSelectEl = document.querySelector('#defenders_select')
const attackerWeaponSelectEl = document.querySelector('#attackers_weapon_select')

const defenderTags = document.querySelector('#defenderTags')

const informationContainer = document.querySelector('#informationContainer');

//modifier elements
let halfRangeContainer = document.getElementById("halfRange");
let halfRangeInput = document.getElementById("halfRangeInput");
let chargedContainer = document.getElementById("charged");
let chargeInput = document.getElementById("chargedInput");
let losContainer = document.getElementById("los");
let losInput = document.getElementById("losInput");
let movedContainer = document.getElementById("moved");
let movedInput = document.getElementById("movedInput");

let mechanicusAttackerProtectorEl = document.getElementById("mechanicusArmyRuleAttackerProtector");
let chaosKnightsAttackerDoomEl = document.getElementById("chaosKnightsArmyRuleAttackerDoom");
let chaosKnightsDefenderDoomEl = document.getElementById("chaosKnightsArmyRuleDefenderDoom");

let rapidFireEl = document.getElementById("rapidFire");
let meltaEl = document.getElementById("melta");
let lanceEl = document.getElementById("lance");
let indirectFireEl = document.getElementById("indirectFire");
let heavyEl = document.getElementById("heavy");

let selectedAttackerFaction = '';
let selectedDefenderFaction = '';

let selectedAttackerUnit = '';
let selectedDefenderUnit = '';

let selectedAttackerWeapon = '';

let selectedAttackerWeaponDetails = {};

let weaponMeleeRanged = 'ranged';

let informationHTML = '';

//some dudes dice code so we can roll dice!
function rollDice(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  const rollDice6 = () => rollDice(1, 6);
  const rollDice3 = () => rollDice(1, 3);

function rollDiceArray(arr) {
    arr.forEach((dice, index) => { 
        arr[index] = rollDice6(); 
    });
}

//function to calculate roll needed for S vs T
function woundRollVal(strength, toughness){
    // console.log('strength: ',strength);
    // console.log('toughness: ',toughness);
    if(strength >= (toughness*2)){
        // console.log(`Wound roll needed: 2`);
        return 2;
    }else if(strength > toughness){
        // console.log(`Wound roll needed: 3`);
        return 3;
    }else if(strength == toughness){
        // console.log(`Wound roll needed: 4`);
        return 4;
    }else if(strength <= (toughness/2)){
        // console.log(`Wound roll needed: 6`);
        return 6;
    }else{
        // console.log(`Wound roll needed: 5`);
        return 5;
    }
}

//function that reads a string '2d6+4' and actually maths it all out and gives us a nice number
function calcDiceRollsInString(string) {
        let tempArr = [];

        let str = string.toLowerCase();
        let strSplitPlus = str.split('+');
        let additionalDamage = parseInt(strSplitPlus[1]);
        let strSplitD = strSplitPlus[0].split('d');
        let noOfDice = strSplitD[0];
        if(noOfDice === ''){
            noOfDice = 1
        }else{
            noOfDice = parseInt(noOfDice);
        }
        let diceType = parseInt(strSplitD[1]);

        // console.log(`noOfDice: ${noOfDice}`);
        // console.log(`diceType: ${diceType}`);
        // console.log(`additionalDamage: ${additionalDamage}`);

        // console.log(`rolling ${noOfDice} d${diceType} and adding ${additionalDamage}`);

        let tempTotal = 0;

        for(let a=0,b=noOfDice;a<b;a++){
            tempTotal += rollDice(1, diceType);
        }
        
        if(string.includes('+')){
            tempTotal += additionalDamage;
        }

        return tempTotal;
}

//function that actually does all the bits
function simulateAttackSequence() {
    let simulations = parseInt(document.querySelector('#simulations').value);


    //do any faction stuff that needs to happen before the simulations start!
    // if(selectedAttackerFaction){

    // }
    // let sustainedHits = document.getElementById("sustainedHits").checked;
    // let sustainedHitsCount = parseInt(document.querySelector('#sustainedHitsCount').value)


    //number of attackers
    let attackerCount = parseInt(document.querySelector('#attackerCount').value);

    //number of defenders
    let defenderCount = parseInt(document.querySelector('#defenderCount').value);

    //attacks
    let attackString = document.querySelector('#attacks').value;
    let rollAttacks = false;
    if(attackString.includes("d") || attackString.includes("D")){
        rollAttacks = true;
    }else{
        attackString = parseInt(attackString);
        rollAttacks = false;    
    }

    //weapon/balistic skill
    let hit = parseInt(document.querySelector('#wbs').value);

    //strength
    let strength = parseInt(document.querySelector('#strength').value);

    //armour piercing
    let ap = parseInt(document.querySelector('#ap').value);
    if(ap < 0){
        ap = ap*-1;
    }
    // console.log(`ap: ${ap}`) 

    //damage
    let damageString =  document.querySelector('#damage').value;
    let rollDamage = false;
    if(damageString.includes("d") || damageString.includes("D")){
        rollDamage = true;
    }else{
        damageString = parseInt(damageString);
        rollDamage = false;    
    }

    //toughness
    let toughness = parseInt(document.querySelector('#toughness').value);

    //save
    let save = parseInt(document.querySelector('#save').value)
    
    //invulnerable save
    let invul = parseInt(document.querySelector('#invul').value);
    
    //wounds
    let wounds = parseInt(document.querySelector('#wounds').value);
    let remainingDefenderWounds = wounds;
    let deadDefenders = 0;
    
    //feel no pain
    let fnp = parseInt(document.querySelector('#fnp').value);

    //attacker modifiers
    let criticalHit = parseInt(document.querySelector('#criticalHit').value);
    if(isNaN(criticalHit)){
        criticalHit = 6;
    }
    let criticalWound = parseInt(document.querySelector('#criticalWound').value);
    if(isNaN(criticalWound)){
        criticalWound = 6;
    }
    let assault = document.getElementById("assault").checked; /* doesnt actually modify the results */
    let rapidFire = rapidFireEl.checked;
    let rapidFireCount = document.getElementById("rapidFireCount").value;
    let ignoresCover = document.getElementById("ignoresCover").checked;
    let twinLinked = document.getElementById("twinLinked").checked;
    // let pistol = document.getElementById("pistol").checked; /* doesnt actually modify the results */
    let torrent = document.getElementById("torrent").checked;
    let lethalHits = document.getElementById("lethalHits").checked;
    let lance = lanceEl.checked;
    let indirectFire = indirectFireEl.checked;
    // let precision = document.getElementById("precision").checked; /* doesnt actually modify the results UNTIL I ADD CHARACTERS IN UNITS */
    let psychic = document.getElementById("psychic").checked;
    let blast = document.getElementById("blast").checked;
    let melta = meltaEl.checked;
    let meltaCount = parseInt(document.getElementById("meltaCount").value);
    let heavy = heavyEl.checked;
    let hazardous = document.getElementById("hazardous").checked; /* doesnt actually modify the results unless i add something to see how much damage the attacker does to itself? */
    let devastatingWounds = document.getElementById("devastatingWounds").checked;
    let sustainedHits = document.getElementById("sustainedHits").checked;
    let sustainedHitsCount = parseInt(document.querySelector('#sustainedHitsCount').value)
    let extraAttacks = document.getElementById("extraAttacks").checked;
    let anti = document.getElementById("anti").checked;
    let antiType = document.getElementById("antiType").value;
    let antiValue = parseInt(document.querySelector('#antiValue').value);
    let rerollSingleHit = document.getElementById("reroll1HitRoll").checked;
    let reroll1Hits = document.getElementById("reroll1Hits").checked;
    let rerollAllHits = document.getElementById("rerollAllHits").checked;
    let rerollSingleWound = document.getElementById("reroll1WoundRoll").checked;
    let reroll1Wounds = document.getElementById("reroll1Wounds").checked;
    let rerollAllWounds = document.getElementById("rerollAllWounds").checked;
    let rerollSaves = document.getElementById("rerollAllSaves").checked;

    //defender modifiers
    let defenderKeywords = defenderTags.value;
    let cover = document.getElementById("cover").checked;
    let stealth = document.getElementById("stealth").checked;

    //can never be more than 1 or less than -1
    let hitModifier = 0;
    let woundModifier = 0;
    let saveModifier = 0;

    let defenderKeywordsArray = defenderKeywords.split(', ');

    //faction modifiers

    //Adepta Sororitas
    
    let sororitasBoM = document.getElementById("adeptaSororitasDetachmentBoM").checked;
    let sororitasBoMHalf = document.getElementById("adeptaSororitasDetachmentBoMHalf").checked;

    if(sororitasBoMHalf){
        hitModifier += 1;
        woundModifier += 1;
    }else if(sororitasBoM){
        hitModifier += 1;
    }

    //Adeptus Mechanicus
    let mechanicusAttackerProtector = mechanicusAttackerProtectorEl.checked;
    let mechanicusConqueror = document.getElementById("mechanicusArmyRuleConqueror").checked;
    let mechanicusDefenderProtector = document.getElementById("mechanicusArmyRuleDefenderProtector").checked;
    
    if(mechanicusAttackerProtector){
        heavy = true;
    }

    if(mechanicusConqueror){
        assault = true;
        ap += 1;
    }

    if(mechanicusDefenderProtector){
        if(ap > 0){
            ap = ap - 1;
        }
    }

    //Aeldari
    let aeldariUnparalleledForesight = document.getElementById("aeldariDetachmentUF").checked;
    
    if(aeldariUnparalleledForesight){
        rerollSingleHit = true;
        rerollSingleWound = true;
    }

    //Astra Militarum
    let militarumBayonets = document.getElementById("astraMilitarumArmyRuleAttackerBayonets").checked;
    let militarumAim = document.getElementById("astraMilitarumArmyRuleAttackerAim").checked;
    let militarumFire = document.getElementById("astraMilitarumArmyRuleAttackerFire").checked;
    let militarumBornSoldiers = document.getElementById("astraMilitarumDetachmentBornSoldiers").checked;
    let militarumCover = document.getElementById("astraMilitarumArmyRuleAttackerCover").checked;

    if(militarumBayonets && weaponMeleeRanged == 'melee' && hit > 2){
        hit = hit - 1;
    }

    if(militarumAim && weaponMeleeRanged == 'ranged' && hit > 2){
        hit = hit - 1;
    }

    if(militarumFire && rapidFire){
        if(!extraAttacks){
            if(rollAttacks){
                let splitAttackString = attackString.split('+');
                if(splitAttackString.length == 2){
                    splitAttackString[1] = parseInt(splitAttackString[1])+1;
                    attackString = splitAttackString.join('+');
                }else{
                    attackString = splitAttackString[0] + '+1';
                }
            }else{
                attackString += 1;
            }
        }
    }

    if(militarumBornSoldiers && !lethalHits && weaponMeleeRanged == 'ranged'){
        lethalHits = true;
    }

    if(militarumCover && save > 3){
        saveModifier += 1;
    }

    //black templars
    let templarsUnclean = document.getElementById("blackTemplarsDetachmentTemplarVowsUnclean").checked;
    let templarsHonour = document.getElementById("blackTemplarsDetachmentTemplarVowsHonour").checked;
    let templarsWitchAttacker = document.getElementById("blackTemplarsDetachmentTemplarVowsWitchAttacker").checked;
    let templarsWitchDefender = document.getElementById("blackTemplarsDetachmentTemplarVowsWitchDefender").checked;
    let templarsChallenge = document.getElementById("blackTemplarsDetachmentTemplarVowsUncleanChallenge").checked;

    if(templarsUnclean && weaponMeleeRanged == 'melee'){
        lethalHits = true;
    }

    if(templarsHonour && psychic && (fnp > 5 || fnp == 0 || isNaN(fnp))){
        fnp = 5;
    }

    if(templarsWitchAttacker && defenderKeywordsArray.includes('Psyker') && weaponMeleeRanged == 'melee'){
        if(document.getElementById("antiType").value.includes('Psyker') && antiValue > 4){
            antiValue = 4;
        }else{
            anti = true;
            antiType = 'Psyker';
            antiValue = 4;
        }
    }

    if(templarsWitchDefender && psychic && (invul == 0 || invul > 4)){
        invul = 4;
    }

    if(templarsChallenge && weaponMeleeRanged == 'melee' && !sustainedHits){
        sustainedHits = true;
        sustainedHitsCount = 1;
    }

    //Blood Angels
    let bloodAngelsThirst = document.getElementById("bloodAngelsDetachmentThirst").checked;

    if(bloodAngelsThirst){
        if(!extraAttacks){
            if(rollAttacks){
                let splitAttackString = attackString.split('+');
                if(splitAttackString.length == 2){
                    splitAttackString[1] = parseInt(splitAttackString[1])+1;
                    attackString = splitAttackString.join('+');
                }else{
                    attackString = splitAttackString[0] + '+1';
                }
            }else{
                attackString += 1;
            }
        }
        strength += 1;
    }
    
    //Custodes

    let custodesDacatari = document.getElementById("custodesArmyRuleDacatari").checked;
    let custodesRendax = document.getElementById("custodesArmyRuleRendax").checked;
    let custodesKaptaris = document.getElementById("custodesArmyRuleKaptaris").checked;
    let custodesAegis = document.getElementById("custodesDetachmentRuleAegis").checked;

    if(custodesDacatari && weaponMeleeRanged == 'melee' && !sustainedHits){
        sustainedHits = true;
        sustainedHitsCount = 1;
    }

    if(custodesRendax && weaponMeleeRanged == 'melee'){
        lethalHits = true;
    }

    if(custodesKaptaris && weaponMeleeRanged == 'melee'){
        hitModifier = hitModifier - 1;
    }

    //chaos knights
    let chaosKnightsAttackerDoom = chaosKnightsAttackerDoomEl.checked;
    let chaosKnightsDefenderDoom = chaosKnightsDefenderDoomEl.checked;

    if(chaosKnightsAttackerDoom){
        woundModifier += 1;
    }

    if(chaosKnightsDefenderDoom){
        hitModifier = hitModifier - 1;
    }

    //Chaos Space Marines
    let CSMDarkPactLethal = document.getElementById("CSMArmyRuleDarkPactLethal").checked;
    let CSMDarkPactSustained = document.getElementById("CSMArmyRuleDarkPactSustained").checked;
    let CSMMarkKhorne = document.getElementById("CSMDetachmentMarkKhorne").checked;
    let CSMMarkTzeentch = document.getElementById("CSMDetachmentMarkTzeentch").checked;
    let CSMMarkNurgle = document.getElementById("CSMDetachmentMarkNurgle").checked;
    let CSMMarkSlaanesh = document.getElementById("CSMDetachmentMarkSlaanesh").checked;
    let CSMMarkUndivided = document.getElementById("CSMDetachmentMarkUndivided").checked;

    if(CSMDarkPactLethal){
        lethalHits = true;
    }

    if(CSMDarkPactSustained && !sustainedHits){
        sustainedHits = true;
        sustainedHitsCount = 1;
    }

    if(CSMDarkPactLethal && CSMMarkKhorne && weaponMeleeRanged == 'melee' && criticalHit > 5){
        criticalHit = 5;
    }

    if(CSMDarkPactLethal && CSMMarkTzeentch && weaponMeleeRanged == 'ranged' && criticalHit > 5){
        criticalHit = 5;
    }

    if(CSMDarkPactSustained && CSMMarkNurgle && weaponMeleeRanged == 'ranged' && criticalHit > 5){
        criticalHit = 5;
    }

    if(CSMDarkPactSustained && CSMMarkSlaanesh && weaponMeleeRanged == 'melee' && criticalHit > 5){
        criticalHit = 5;
    }

    if(CSMMarkUndivided){
        reroll1Hits = true;
    }

    //Death Guard
    let deathGuardGift = document.getElementById("deathGuardArmyRuleGift").checked;

    if(deathGuardGift){
        toughness = toughness - 1;
    }

    //Death Watch
    let deathwatchFuror = document.getElementById("deathwatchDetachmentFuror").checked;
    let deathwatchMalleus = document.getElementById("deathwatchDetachmentMalleus").checked;

    if(deathwatchFuror && !sustainedHits){
        sustainedHits = true;
        sustainedHitsCount = 1;
    }
    if(deathwatchMalleus){
        lethalHits = true;
    }

    //Drukhari
    let drukhariPower = document.getElementById("drukhariArmyRulePower").checked;

    if(drukhariPower){
        rerollAllHits = true;
    }

    //Genestealer Cults
    let gscBelow = document.getElementById("GSCDetachmentBelow").checked;

    if(gscBelow){
        if(!sustainedHits){
            sustainedHits = true;
            sustainedHitsCount = 1;
        }
        ignoresCover = true;
    }

    //Imperial Knights
    // let impKnightsAttackerHonored = document.getElementById("imperialKnightsArmyRuleAttackerHonored").checked;
    let impKnightsLayLow = document.getElementById("imperialKnightsArmyRuleLayLow").checked;
    let impKnightsDefenderHonored = document.getElementById("imperialKnightsArmyRuleDefenderHonored").checked;
    let impKnightsIndomitable = document.getElementById("imperialKnightsDetachmentIndomitable").checked;

    if(impKnightsLayLow){
        rerollSingleHit = true;
        rerollSingleWound = true;
    }

    if(impKnightsDefenderHonored && impKnightsIndomitable && (fnp > 5 || fnp == 0 || isNaN(fnp))){
        fnp = 5;
    }else if(impKnightsIndomitable && (fnp == 0 || isNaN(fnp))){
        fnp = 6;
    }

    //League of Votan
    let leagueAncestorsOne = document.getElementById("leagueArmyRuleAncestorsOne").checked;
    let leagueAncestorsTwo = document.getElementById("leagueArmyRuleAncestorsTwo").checked;

    if(leagueAncestorsTwo){
        hitModifier += 1;
        woundModifier += 1;
    }else if(leagueAncestorsOne){
        hitModifier += 1;
    }

    //necrons
    let necronsCommand = document.getElementById("necronsDetachmentCommand").checked;
    let necronsReanimation = document.getElementById("necronsArmyRuleReanimation").checked;
    let reanimationRoll = 0;
    let reanimationResults = [];

    if(necronsCommand){
        hitModifier += 1;
    }
    
    //orks

    let orksWaaaghAttacker = document.getElementById("orksArmyRuleAttacker").checked;
    let orksWaaaghDefender = document.getElementById("orksArmyRuleDefender").checked;
    let orksGetStuckIn = document.getElementById("orksDetachmentGetStuckIn").checked;

    if(orksWaaaghAttacker && !extraAttacks && weaponMeleeRanged == 'melee'){
        if(!extraAttacks){
            if(rollAttacks){
                let splitAttackString = attackString.split('+');
                if(splitAttackString.length == 2){
                    splitAttackString[1] = parseInt(splitAttackString[1])+1;
                    attackString = splitAttackString.join('+');
                }else{
                    attackString = splitAttackString[0] + '+1';
                }
            }else{
                attackString += 1;
            }
        }
        strength += 1;
    }

    if(orksWaaaghDefender && (invul == 0 || invul > 5)){
        invul = 5;
    }

    if(orksGetStuckIn && !sustainedHits && weaponMeleeRanged == 'melee'){
        sustainedHits = true;
        sustainedHitsCount = 1;
    }

    //adeptus astartes

    let adeptusAstartesOath = document.getElementById("adeptusAstartesArmyRuleAttacker").checked;

    if(adeptusAstartesOath){
        rerollAllWounds = true;
        rerollAllHits = true;
    }

    //Space Wolves

    let spaceWolvesSagaWarrior = document.getElementById("spaceWolvesDetachmentSagaWarrior").checked;
    let spaceWolvesSagaSlayer = document.getElementById("spaceWolvesDetachmentSagaBeastslayer").checked;
    let spaceWolvesSagaBear = document.getElementById("spaceWolvesDetachmentSagaBear").checked;

    if(spaceWolvesSagaWarrior && !sustainedHits && weaponMeleeRanged == 'melee'){
        sustainedHits = true;
        sustainedHitsCount = 1;
    }

    if(spaceWolvesSagaSlayer && weaponMeleeRanged == 'melee'){
        lethalHits = true;
    }

    if(spaceWolvesSagaBear && (fnp == 0 || isNaN(fnp)) ){
        fnp = 6;
    }

    //tau

    let tauGuided = document.getElementById("tauArmyRuleAttacker").checked;
    let tauObserverMarkerlight = document.getElementById("tauArmyRuleAttackerMarkerlight").checked;
    let tauKauyon = document.getElementById("tauDetachmentKauyon").checked;

    if(tauGuided && hit > 2){
        hit = hit -1 ;
        if(tauObserverMarkerlight){
            ignoresCover = true;
        }
    }

    if(tauKauyon && (!sustainedHits || sustainedHitsCount < 2)){
        sustainedHits = true;
        if(tauGuided){
            sustainedHitsCount = 2;
        }else{
            sustainedHitsCount = 1;
        }
    }

    //Thousand Sons
    let thousandSonsWeaver = document.getElementById("thousandSonsArmyRuleCabalWeaver").checked;
    let thousandSonsTwist = document.getElementById("thousandSonsArmyRuleCabalTwist").checked;
    let thousandSonsMalevolent = document.getElementById("thousandSonsDetachmentMalevolent").checked;
    let thousandSonsMaelstrom = document.getElementById("thousandSonsDetachmentMaelstrom").checked;
    let thousandSonsImmaterium = document.getElementById("thousandSonsDetachmentImmaterium").checked;

    if(thousandSonsWeaver){
        rerollSaves = true;
    }

    if(thousandSonsTwist){
        save = 10;
    }

    if(thousandSonsMalevolent && psychic){
        lethalHits = true;
    }

    if(thousandSonsMaelstrom && psychic && !sustainedHits){
        sustainedHits = true;
        sustainedHitsCount = 1;
    }

    if(thousandSonsImmaterium && psychic){
        devastatingWounds = true;
    }

    //Tyranids

    let tyranidSwarming = document.getElementById("tyranidDetachmentSwarming").checked;
    let tyranidAggression = document.getElementById("tyranidDetachmentAggression").checked;

    if( tyranidSwarming && (defenderKeywordsArray.includes('Infantry') || defenderKeywordsArray.includes('Swarm')) && !sustainedHits){
        // console.log('swarming activate')
        sustainedHits = true;
        sustainedHitsCount = 1;
    }

    if( tyranidAggression && (defenderKeywordsArray.includes('Monster') || defenderKeywordsArray.includes('Vehicle'))){
        // console.log('aggression activate')
        lethalHits = true;
    }

    //World Eaters
    let worldEatersMartial = document.getElementById("worldEatersArmyRuleMartial").checked;
    let worldEatersBlades = document.getElementById("worldEatersArmyRuleBlades").checked;
    let worldEatersDevotion = document.getElementById("worldEatersArmyRuleDevotion").checked;
    let worldEatersRelentless = document.getElementById("worldEatersDetachmentRelentless").checked;

    if(worldEatersMartial && !sustainedHits){
        sustainedHits = true;
        sustainedHitsCount = 1;
    }

    if(worldEatersBlades){
        lethalHits = true;
    }

    if(worldEatersDevotion){
        if(fnp == 0 || isNaN(fnp)){
            fnp = 6;
        }else{
            fnp = fnp - 1;
        }
    }

    if(worldEatersRelentless && weaponMeleeRanged == 'melee'){
        if(!extraAttacks){
            if(rollAttacks){
                let splitAttackString = attackString.split('+');
                if(splitAttackString.length == 2){
                    splitAttackString[1] = parseInt(splitAttackString[1])+1;
                    attackString = splitAttackString.join('+');
                }else{
                    attackString = splitAttackString[0] + '+1';
                }
            }else{
                attackString += 1;
            }
        }
        strength += 1;
    }
    
    //modifiers
    if(stealth && weaponMeleeRanged == 'ranged'){
        hitModifier = hitModifier - 1;
    }

    //rapid fire
    let halfRange = halfRangeInput.checked;
    let rollRapidFire = false;
    if(rapidFireCount.toUpperCase().includes('D')){
        rollRapidFire = true;
    }

    //melta
    if(melta && halfRange){
        if(rollDamage){
            let splitDamageString = damageString.split('+');
            if(splitDamageString.length == 2){
                splitDamageString[1] = parseInt(splitDamageString[1]) + meltaCount;
                damageString = splitDamageString.join('+');
            }else{
                damageString = splitDamageString[0] + '+' + meltaCount;
            }
        }else{
            damageString += meltaCount;
        }
    }

    //lance
    let charged = chargeInput.checked;
    if(lance && charged){
        woundModifier += 1;
    }

    //indirect fire
    let los = losInput.checked;
    if(indirectFire && !los){
        hitModifier = hitModifier - 1;
        cover = true;
    }

    //heavy
    let moved = movedInput.checked;
    if(heavy && !moved){
        hitModifier += 1;
    }

    //capping hit roll modifiers
    if(hitModifier > 1){
        hitModifier = 1;
    }else if(hitModifier < -1){
        hitModifier = -1;
    }

    // console.log(`hit modifier: ${hitModifier}`)

    //capping wound roll modifiers
    if(woundModifier > 1){
        woundModifier = 1;
    }else if(woundModifier < -1){
        woundModifier = -1;
    }

    //can never be more than 1;
    if(saveModifier > 1){
        saveModifier = 1;
    }else if(saveModifier < -1){
        saveModifier = -1;
    }

    // calculating needed wound roll
    let wound = woundRollVal(strength,toughness);

    //checking if anti applies and if so adjusting critical wound value
    if(anti){
        // console.log(`critical wound: ${criticalWound}`);
        let antiArray = antiType.split(', ');
        // console.log(`anti type: ${antiType}`)
        // console.log(`anti type array: `,antiArray)
        // console.log(`defender tags: ${defenderKeywords}`)
        // console.log(`defender tags array: `, defenderKeywordsArray)
        // console.log(`anti applies: ${antiArray.some(item => defenderKeywordsArray.includes(item))}`)

        //check if anti actually applies and if so modify criticalwound
        if(antiArray.some(item => defenderKeywordsArray.includes(item))){
            criticalWound = antiValue;
            // console.log(`critical wound after anti check: ${criticalWound}`);
        }
    }
    
    // calculating the save roll
    // console.log(`save: ${save}`);
    // console.log(`invul: ${invul}`);

    //check if defender save is better than 3+ and attacker ap = 0
    if(cover && (save > 3 || ap > 0) && !ignoresCover){
        // console.log('defender has benefits of cover')
        saveModifier += 1;
    }

    // console.log(`defenders calced save: ${save}`)

    save = save + ap + saveModifier;
    if(invul != 0 && !isNaN(invul)){
        if(save + ap > invul){
            save = invul;
        }else{
            save = save + ap;
        }
    }

    let resultsArr = [];
    let deadDefenderResultsArr = [];
    let defenderWipedArr = [];

    let i = 0;
    while (i < simulations) {

        // console.log('NEW SIMULATION');

        let diceResults = [];
        let attacks = 0;
        let mortalWounds = 0;
        let lethalHitStorage = [];

        // console.log(`attacks (should be 0): ${attacks}`)

        if(rollAttacks){
            // console.log('rolling')
            // console.log(`attackerCount: ${attackerCount}`)
            for(let i=0,j=attackerCount;i<j;i++){
                attacks += calcDiceRollsInString(attackString);
                // console.log(`attacks: ${attacks}`)
            }
        }else{
            // console.log('not rolling');
            attacks =  parseInt(attackString) * attackerCount;
            // console.log(`attacks: ${attacks}`)
        }

        // console.log(`attacks without additions: ${attacks}`)

        //add the rapid fire attacks
        if(halfRange && rapidFire){
            if(rollRapidFire){
                for(let i=0,j=attackerCount;i<j;i++){
                    attacks += calcDiceRollsInString(rapidFireCount);
                }
            }else{
                attacks =  parseInt(rapidFireCount) * attackerCount;
            }
        }

        // console.log(`attacks after rapid fire: ${attacks}`)

        //add 1 additional attack for every 5 defender models
        if(blast){
            attacks += attackerCount*(Math.floor(defenderCount/5))
        }

        // console.log(`final number of attacks: ${attacks}`);

        //roll to hit
        for(let a=0,b=attacks;a<b;a++){
            diceResults.push(rollDice6());
        }

        if(!torrent){

            // console.log(`hit rolls: ${diceResults}`);
            // console.log(`hit rolls array length: ${diceResults.length}`);

            if(rerollAllHits){
                //reroll all fails

                //get any fails's
                let failedHitRolls = diceResults.filter((result) => (result == 1 || (result + hitModifier) < hit));
                // console.log(`failed hit rolls: ${failedHitRolls}`);
                // console.log(`failed hit rolls array length: ${failedHitRolls.length}`);

                //remove fails from the normal pool
                diceResults = diceResults.filter((result) => (result != 1 && (result + hitModifier) >= hit));
                // console.log(`old roll, fails's removed: ${diceResults}`);
                // console.log(`old roll, fails's removed array length: ${diceResults.length}`);

                //reroll the failed hits
                rollDiceArray(failedHitRolls);
                // console.log(`rerolled failed hit rolls: ${failedHitRolls}`);
                // console.log(`rerolled failed hit rolls array length: ${failedHitRolls.length}`);

                // combine the new success dice into the old array
                diceResults = diceResults.concat(failedHitRolls);
                // console.log(`combined old hits and rerolls: ${diceResults}`);
                // console.log(`combined old hits and rerolls array length: ${diceResults.length}`);

            }else if(reroll1Hits){ 
                //reroll any 1's

                //get any 1's
                let hitRoll1s = diceResults.filter((result) => result == 1);
                // console.log(`hit rolls 1: ${hitRoll1s}`);
                // console.log(`hit rolls 1 array length: ${hitRoll1s.length}`);

                //remove fails from the normal pool
                diceResults = diceResults.filter((result) => result > 1);
                // console.log(`old roll, 1's removed: ${diceResults}`);
                // console.log(`old roll, 1's removed array length: ${diceResults.length}`);

                //reroll the failed wounds
                rollDiceArray(hitRoll1s);
                // console.log(`rerolled 1's hit rolls: ${hitRoll1s}`);
                // console.log(`rerolled 1's hit rolls array length: ${hitRoll1s.length}`);

                // combine the new success dice into the old array
                diceResults = diceResults.concat(hitRoll1s);
                // console.log(`combined old hit and rerolls: ${diceResults}`);
                // console.log(`combined old hit and rerolls array length: ${diceResults.length}`);

            }else if(rerollSingleHit){
                //reroll a single fails

                //get any fails's
                let failedHitRolls = diceResults.filter((result) => (result + hitModifier) < hit);
                // console.log(`failed hit rolls: ${failedHitRolls}`);
                // console.log(`failed hit rolls array length: ${failedHitRolls.length}`);

                if(failedHitRolls.length > 0){
                    //remove fails from the normal pool
                    diceResults = diceResults.filter((result) => (result + hitModifier) >= hit);
                    // console.log(`old roll, fails's removed: ${diceResults}`);
                    // console.log(`old roll, fails's removed array length: ${diceResults.length}`);

                    let newHitRoll = [];
                    //if there is at least one fail roll a dice and add it back
                    newHitRoll.push(rollDice6());
                    // console.log(`new hit roll: ${newHitRoll}`);
                    // console.log(`new hit roll array length: ${newHitRoll.length}`);

                    // combine the new success dice into the old array
                    diceResults = diceResults.concat(newHitRoll);
                    // console.log(`combined old hits and reroll: ${diceResults}`);
                    // console.log(`combined old hits and reroll array length: ${diceResults.length}`);
                }

            }

            //remove critical fails
            diceResults = diceResults.filter((result) => result > 1);
            // console.log(`after removing critical fails: ${diceResults}`);

            //create an array of the critical hits and seperate them from the normal dice
            let criticalHitDice = diceResults.filter((result) => result >= criticalHit);
            diceResults = diceResults.filter((result) => result < criticalHit);

            //add the crit dice back in
            diceResults = diceResults.concat(criticalHitDice);

            //do any hit roll modifiers
            // diceResults.forEach((result,index) => {
            //     if(diceResults[index] != 1){
            //         diceResults[index] += hitModifier;
            //     }
            // });

            //remove any that failed to hit
            diceResults = diceResults.filter((result) => result != 1 && result + hitModifier >= hit);
            // console.log(`removed failed hits: ${diceResults}`);
            // console.log(`removed failed hits array length: ${diceResults.length}`);

            //check if we are sustained
            if(sustainedHits){
                //add extra dice to the pool for sustained amount
                for(let a=0,b=criticalHitDice.length;a<b;a++){
                    for(let c=0,d=sustainedHitsCount;c<d;c++){
                        //adding them in as 1's so they dont effect lethal hits
                        diceResults.push(1);
                    }
                }

                // console.log(`added ${criticalHitDice.length * sustainedHitsCount} dice to the pool`);
                // console.log(`dice results with added dice: ${diceResults}`)
            }

            //check for lethal hits
            lethalHitStorage = [];
            if(lethalHits){
                lethalHitStorage = diceResults.filter((result) => result >= criticalHit);
                diceResults = diceResults.filter((result) => result < criticalHit);
                // console.log(`lethal hit dice: ${lethalHitStorage}`);
                // console.log(`dice with lethals removed: ${diceResults}`);
            }

            // console.log(`succesfull hits: ${diceResults}`);
            // console.log(`succesfull hits array length: ${diceResults.length}`);
            
        }
        
        //roll to wound
        rollDiceArray(diceResults)
        
        // console.log(`wound rolls: ${diceResults}`);

        diceResults.forEach((result,index) => { 
            diceResults[index] += woundModifier;
        });

        //If we are twinlinked
        if(rerollAllWounds || twinLinked){
            //reroll all fails

            //get any fails's
            let failedWoundRolls = diceResults.filter((result) => (result == 1 || (result + woundModifier) < wound));
            // console.log(`failed wound rolls: ${failedWoundRolls}`);
            // console.log(`failed wound rolls array length: ${failedWoundRolls.length}`);

            //remove fails from the normal pool
            diceResults = diceResults.filter((result) => (result != 1 && (result + woundModifier) >= wound));
            // console.log(`old roll, fails's removed: ${diceResults}`);
            // console.log(`old roll, fails's removed array length: ${diceResults.length}`);

            //reroll the failed wounds
            rollDiceArray(failedWoundRolls);
            // console.log(`rerolled failed wound rolls: ${failedWoundRolls}`);
            // console.log(`rerolled failed wound rolls array length: ${failedWoundRolls.length}`);

            // combine the new success dice into the old array
            diceResults = diceResults.concat(failedWoundRolls);
            // console.log(`combined old wounds and rerolls: ${diceResults}`);
            // console.log(`combined old wounds and rerolls array length: ${diceResults.length}`);

        }else if(reroll1Wounds){
            //get any 1's
            let woundRoll1s = diceResults.filter((result) => result == 1);
            // console.log(`wound rolls 1: ${woundRoll1s}`);
            // console.log(`wound rolls 1 array length: ${woundRoll1s.length}`);

            //remove fails from the normal pool
            diceResults = diceResults.filter((result) => result > 1);
            // console.log(`old roll, 1's removed: ${diceResults}`);
            // console.log(`old roll, 1's removed array length: ${diceResults.length}`);

            //reroll the failed wounds
            rollDiceArray(woundRoll1s);
            // console.log(`rerolled 1's wound rolls: ${woundRoll1s}`);
            // console.log(`rerolled 1's wound rolls array length: ${woundRoll1s.length}`);

            // combine the new success dice into the old array
            diceResults = diceResults.concat(woundRoll1s);
            // console.log(`combined old wounds and rerolls: ${diceResults}`);
            // console.log(`combined old wounds and rerolls array length: ${diceResults.length}`);

        }else if(rerollSingleWound){
            //reroll a single fails

            //get any fails's
            let failedWoundRolls = diceResults.filter((result) => (result + woundModifier) < wound);
            // console.log(`failed wound rolls: ${failedWoundRolls}`);
            // console.log(`failed wound rolls array length: ${failedWoundRolls.length}`);

            if(failedWoundRolls.length > 0){
                //remove fails from the normal pool
                diceResults = diceResults.filter((result) => (result + woundModifier) >= wound);
                // console.log(`old roll, fails's removed: ${diceResults}`);
                // console.log(`old roll, fails's removed array length: ${diceResults.length}`);

                let newWoundRoll = [];
                //if there is at least one fail roll a dice and add it back
                newWoundRoll.push(rollDice6());
                // console.log(`new wound roll: ${newWoundRoll}`);
                // console.log(`new wound roll array length: ${newWoundRoll.length}`);

                // combine the new success dice into the old array
                diceResults = diceResults.concat(newWoundRoll);
                // console.log(`combined old wounds and reroll: ${diceResults}`);
                // console.log(`combined old wounds and reroll array length: ${diceResults.length}`);
            }

        }

        //If we have devastating wounds

        let criticalWoundDice = diceResults.filter((result) => result >= criticalWound);

        if(devastatingWounds){
            // console.log(`critical wound rolls: ${criticalWoundDice}`);

            //turn the critical wounds into mortal wounds
            if(rollDamage){
                for(let a=0,b=criticalWoundDice.length;a<b;a++){
                    mortalWounds += calcDiceRollsInString(damageString);
                };
            }else{
                mortalWounds = criticalWoundDice.length * damageString;
            }
        }

        //remove criticals from the normal pool
        diceResults = diceResults.filter((result) => result < criticalWound);
        
        //remove any that failed to wound
        diceResults = diceResults.filter((result) => result >= wound);

        //add the critical back in unless devastating wounds
        if(!devastatingWounds){
            diceResults = diceResults.concat(criticalWoundDice);
        }

        //if we have lethal hit dice to add back in do so
        // console.log(`before lethal hit dice added back: ${diceResults}`);
        if(lethalHits){
            diceResults = diceResults.concat(lethalHitStorage);
            // console.log(`lethal hit dice added back: ${diceResults}`);
        }

        // console.log(`succesfull wounds: ${diceResults}`);

        //roll to save
        rollDiceArray(diceResults)

        // console.log(`save rolls: ${diceResults}`);
        // console.log(`target save: ${save}`);

        if(rerollSaves){
            //reroll all fails

            //get any fails's
            let failedSaveRolls = diceResults.filter((result) => (result == 1 || result < save));
            // console.log(`failed hit rolls: ${failedHitRolls}`);
            // console.log(`failed hit rolls array length: ${failedHitRolls.length}`);

            //remove fails from the normal pool
            diceResults = diceResults.filter((result) => (result != 1 && result >= save));
            // console.log(`old roll, fails's removed: ${diceResults}`);
            // console.log(`old roll, fails's removed array length: ${diceResults.length}`);

            //reroll the failed hits
            rollDiceArray(failedSaveRolls);
            // console.log(`rerolled failed hit rolls: ${failedHitRolls}`);
            // console.log(`rerolled failed hit rolls array length: ${failedHitRolls.length}`);

            // combine the new success dice into the old array
            diceResults = diceResults.concat(failedSaveRolls);
            // console.log(`combined old hits and rerolls: ${diceResults}`);
            // console.log(`combined old hits and rerolls array length: ${diceResults.length}`);

        }

        // console.log(`after reroll saves: ${diceResults}`);

        //remove any that were saved
        diceResults = diceResults.filter((result) => result < save);

        // console.log(`failed saves: ${diceResults}`);

        //calculate number of wounds
        let numberOfWounds = 0;
        deadDefenders = 0;
        remainingDefenderWounds = wounds;
        
        for(let a=0,b=diceResults.length;a<b;a++){
            let calcedDamage = 0;
            if(rollDamage){
                calcedDamage = calcDiceRollsInString(damageString);
            }else{
                calcedDamage = damageString;
            }

            //do fnp stuff here for non mortal wounds
            if( (fnp != 0 && !isNaN(fnp))){
                for(let a=0,b=calcedDamage;a<b;a++){
                    if(rollDice6() >= fnp){
                        calcedDamage = calcedDamage - 1;
                    }
                }
            }

            //add to the total number of wounds for maths
            numberOfWounds += calcedDamage;
            // console.log(`damage roll ${a} current total: ${numberOfWounds}`)

            //deal damage to a defender and see if it dies
            remainingDefenderWounds = remainingDefenderWounds - calcedDamage;
            if(remainingDefenderWounds <= 0){
                deadDefenders += 1;
                remainingDefenderWounds = wounds;
            }
        }

        // console.log(`deadDefenders (before MW): ${deadDefenders}`);

        let finalWoundsDealt = numberOfWounds;

        // console.log(`regular wounds: ${numberOfWounds}`)
        // console.log(`mortal wounds: ${mortalWounds}`)

        //mortal wound stuff
        
        for(let a=0,b=mortalWounds;a<b;a++){
            if((fnp != 0 && !isNaN(fnp)) || custodesAegis){
                if(custodesAegis && (fnp == 0 || fnp > 4)){
                    if(rollDice6() < 4){
                        finalWoundsDealt += 1;

                        remainingDefenderWounds = remainingDefenderWounds - 1;
                        if(remainingDefenderWounds <= 0){
                            deadDefenders += 1;
                            remainingDefenderWounds = wounds;
                        }
                    }
                }else{
                    if(rollDice6() < fnp){
                        finalWoundsDealt += 1;

                        remainingDefenderWounds = remainingDefenderWounds - 1;
                        if(remainingDefenderWounds <= 0){
                            deadDefenders += 1;
                            remainingDefenderWounds = wounds;
                        }
                    }
                }
            }else{
                finalWoundsDealt += 1;

                remainingDefenderWounds = remainingDefenderWounds - 1;
                if(remainingDefenderWounds <= 0){
                    deadDefenders += 1;
                    remainingDefenderWounds = wounds;
                }
            }
        }

        // console.log(`deadDefenders: ${deadDefenders}`);
        // console.log(`remainingDefenderWounds: ${remainingDefenderWounds}`);

        if(necronsReanimation){
            // console.log(`Models that are dead before reanimation: ${deadDefenders}`);
        }

        if(necronsReanimation && deadDefenders < defenderCount){
            reanimationRoll = rollDice3();
            // console.log(`Reanimation Roll: ${reanimationRoll}`);
            if(wounds == 1){
                // console.log(`Reanimating unit has single wound models`);
                deadDefenders = deadDefenders - reanimationRoll;
                // console.log(`models that are dead after reanimation: ${deadDefenders}`);
                if(deadDefenders < 0){
                    // console.log(`The unit was back at full strength after reanimation`);
                    reanimationResults.push(reanimationRoll + deadDefenders)
                    deadDefenders = 0;
                }else{
                    // console.log(`Total reanimated models for this sim: ${reanimationRoll}`);
                    reanimationResults.push(reanimationRoll)
                }
            }else{
                // console.log(`Unit had models with ${wounds} wounds`);
                // console.log(`one model had: ${remainingDefenderWounds} left`);

                if(remainingDefenderWounds < wounds){
                    //one model is injured but not dead so we heal it first
                    if(wounds - remainingDefenderWounds > reanimationRoll){
                        // there will be enough reanimation to heal this model and bring another back
                        // console.log(`reanimation was high enough to heal and bring back a model: ${reanimationRoll}`);
                        reanimationRoll = remainingDefenderWounds - wounds;
                        deadDefenders - 1;
                        reanimationResults.push(1)
                    }else{
                        //one got healed but none came back to life
                        // console.log('1 healed but none came back')
                        reanimationResults.push(0)
                    }
                }else{
                    //none are injured so if any are dead it can all go into resurrection
                    if(reanimationRoll > wounds){
                        //its high enough to bring 2 back (if they have 2 wounds each and we roll a 3 and none are injured is the only time i think (except when we get to unit abilities))
                        // console.log('2 came back')
                        reanimationResults.push(2)
                    }else{
                        //the roll only brought 1 back
                        // console.log('1 came back')
                        reanimationResults.push(1)
                    }
                }
            }
        }else if(necronsReanimation && deadDefenders >= defenderCount){
            // console.log(`reanimation didnt happen because the squad was wiped`);
            reanimationResults.push(0)
        };
        

        // console.log(`finalWoundsDealt: ${finalWoundsDealt}`);
        // console.log(`deadDefenders (after MW): ${deadDefenders}`);

        resultsArr.push(finalWoundsDealt);

        //if we killed more than the units members just cap it
        if(deadDefenders >= defenderCount){
            deadDefenders = defenderCount;
            defenderWipedArr.push('wiped');
        }
        deadDefenderResultsArr.push(deadDefenders);

        // console.log(' ')

        i++;
    }

    // console.log(`results array: ${resultsArr}`);

    // console.log(`${inputAttackerCount.value} ${selectedAttackerUnit} using ${selectedAttackerWeapon} against ${selectedDefenderUnit} did:`);

    //calculate average
    let totalSimulationDamage = 0;
    resultsArr.forEach((result) => { 
        totalSimulationDamage += result;
    });
    let average = totalSimulationDamage/simulations;
    // console.log(`true average damage over ${simulations} simulations: ${average}`);
    // console.log(`rounded average damage over ${simulations} simulations: ${Math.round(average)}`);

    let totalSimulationKills = 0;
    deadDefenderResultsArr.forEach((result) => { 
        totalSimulationKills += result;
    });
    let averageKills = totalSimulationKills/simulations;
    if(necronsReanimation){
        let totalSimulationReanimations = 0;
        reanimationResults.forEach((result) => { 
            totalSimulationReanimations += result;
        });
        let averageReanimations = totalSimulationReanimations/simulations;
        // console.log(`on average ${averageReanimations} models reanimated`);
    }
    // console.log(`true average kills over ${simulations} simulations: ${averageKills}`);
    // console.log(`rounded average kills over ${simulations} simulations: ${Math.round(averageKills)}`);

    // console.log(`percentage chance to fully wipe the target unit: ${(100/simulations)*defenderWipedArr.length}%`);

    // if(hazardous){
        // console.log('And has a 16.6% of killing itself or causing itself harm');
    // }

    // console.log('');

    let necronReanimationString = '';
    if(necronsReanimation){
        necronReanimationString = `<div>on average <span class="value">${averageReanimations}</span> models reanimated</div>`;
    }

    let hazardousString = '';
    if(hazardous){
        hazardousString = `<div>And has a 16.6% of killing itself or causing itself harm</div>`;
    }

    informationHTML = `<div>true average damage over ${simulations} simulations: <span class="value">${average}</span></div><div>rounded average damage over ${simulations} simulations: <span class="value">${Math.round(average)}</span></div>${necronReanimationString}<div>true average kills over ${simulations} simulations: <span class="value">${averageKills}</span></div><div>rounded average kills over ${simulations} simulations: <span class="value">${Math.round(averageKills)}</span></div><div>percentage chance to fully wipe the target unit: <span class="value">${((100/simulations)*defenderWipedArr.length).toFixed(2)*1}%</span></div>${hazardousString}`;

    informationContainer.innerHTML = informationHTML;

    //make the chart
    counter = {};
    resultsArr.forEach(ele => {
        if (counter[ele]) {
            counter[ele] += 1;
        } else {
            counter[ele] = 1;
        }
    });
    // console.log(`counter:`, counter);

    let barHTML = '';
    let maxMinArr = Object.values(counter);
    // let min = Math.min(...maxMinArr);
    let max = Math.max(...maxMinArr);
    for (const count in counter) {
        // console.log(`${count}: ${counter[count]}`);
        barHTML += `<div class='bar' id='bar_${count}' style='height:${100/(max/counter[count])}%; width:calc(${100/maxMinArr.length}% - 10px); margin: 0px 5px;'><div class='label'>${count}<span class='sublabel'>${counter[count]}</span></div></div>`; 
    }

    document.querySelector('#chart').innerHTML = barHTML;

    let closestBarNum = 0;
    if(rollDamage){
        closestBarNum = Math.round(average);
    }else{
        if( (damageString - (average % damageString)) < (damageString/2) ){
            closestBarNum = Math.round((average + damageString) - (average % damageString));
        }else{
            closestBarNum =  average - average % damageString;
        }
    }

    document.querySelector(`#bar_${closestBarNum}`).classList.add('average');

}

function generateFactionSelectHtml(){
    let defenderHTMLOut = '<option value="null">-</option>';
    let attackerHTMLOut = '<option value="null">-</option>';

    Object.keys(data)
        .sort()
        .forEach(function(faction, i) {
            let factionData = data[faction];
            defenderHTMLOut += `<option value="${faction}">${factionData.name}</option>`;
            attackerHTMLOut += `<option value="${faction}">${factionData.name}</option>`;
        });

    return {
        defender: defenderHTMLOut,
        attacker: attackerHTMLOut
    }
}

function generateUnitSelectHtml(selectedFaction){
    let HTMLOut = '<option value="null">-</option>';
    let factionData = data[selectedFaction]

    Object.keys(factionData.units)
        .sort()
        .forEach(function(unit, i) {
            let unitData = factionData.units[unit];
            HTMLOut += `<option value="${unit}">${unitData.name}</option>`;
        });

    return HTMLOut;
}

function generateWeaponSelectHtml(selectedFaction, selectedUnit){
    let HTMLOut = '<option value="null">-</option>';
    let unitData = data[selectedFaction].units[selectedUnit];

    if(Object.keys(unitData.weapons.ranged).length != 0){
        HTMLOut += `<option value="ranged" disabled>-RANGED-</option>`;

        for (const weapon in unitData.weapons.ranged){
            let weaponData = unitData.weapons.ranged[weapon];

            // console.log(weapon)
            // console.log(weaponData)

            if(weaponData.hasOwnProperty('name')){
                HTMLOut += `<option value="${weapon}_ranged">${weaponData.name}</option>`;
            }else{
                HTMLOut += `<option value="${weapon}_ranged">${weaponData.data.name}</option>`;
            }

        }
    }

    if(Object.keys(unitData.weapons.melee).length != 0){
        HTMLOut += `<option value="melee" disabled>-MELEE-</option>`;

        for (const weapon in unitData.weapons.melee){
            let weaponData = unitData.weapons.melee[weapon];

            // console.log(weapon)
            // console.log(weaponData)

            if(weaponData.hasOwnProperty('name')){
                HTMLOut += `<option value="${weapon}_melee">${weaponData.name}</option>`;
            }else{
                HTMLOut += `<option value="${weapon}_melee">${weaponData.data.name}</option>`;
            }

        }
    }

    return HTMLOut;
}

function attackerFactionChange(){

    resetModifiers('attacker');

    selectedAttackerFaction = attackerFactionSelectEl.value;
    attackerUnitSelectEl.innerHTML = generateUnitSelectHtml(selectedAttackerFaction);
    document.querySelector('.factionAttacker').querySelectorAll('.faction_modifier_container').forEach((element) => {
        element.style.display = 'none';
        element.querySelectorAll('input[type=checkbox]').forEach((el) => {
            el.checked = false;
        });
    });

    // console.log(selectedAttackerFaction);

    // console.log(document.querySelector(`#attacker_faction-${selectedAttackerFaction}`));

    if(selectedAttackerFaction == 'adeptusAstartes' || selectedAttackerFaction == 'blackTemplars' || selectedAttackerFaction == 'bloodAngels' || selectedAttackerFaction == 'darkAngels' || selectedAttackerFaction == 'deathwatch' || selectedAttackerFaction == 'spaceWolves'){
        if (selectedAttackerFaction == 'adeptusAstartes') {

            let adeptusAstartesArray = [
                'blackTemplars',
                'bloodAngels',
                'darkAngels',
                'deathwatch',
                'spaceWolves'
            ]
            adeptusAstartesArray.forEach((factionName) => {
                document.querySelector(`#attacker_faction-${factionName}`).style.display = 'block';
            });
                
        }else{
            document.querySelector(`#attacker_faction-adeptusAstartes`).style.display = 'block';
        }
    }

    document.querySelector(`#attacker_faction-${selectedAttackerFaction}`).style.display = 'block';

    //faction abilities should turn on
    switch (selectedAttackerFaction) {
        case 'adeptusCustodes':
            break;
        case 'orks':
            document.querySelector(`#orksDetachmentGetStuckIn`).checked = true;
        break;
        case 'tauEmpire':
            break;
    }
}

function defenderFactionChange(){

    resetModifiers('defender');

    selectedDefenderFaction = defenderFactionSelectEl.value;
    defenderUnitSelectEl.innerHTML = generateUnitSelectHtml(selectedDefenderFaction)
    document.querySelector('.factionDefender').querySelectorAll('.faction_modifier_container').forEach((element) => {
        element.style.display = 'none';
        element.querySelectorAll('input[type=checkbox]').forEach((el) => {
            el.checked = false;
        });
    });
    document.querySelector(`#defender_faction-${selectedDefenderFaction}`).style.display = 'block';

    //faction abilities should turn on
    switch (selectedDefenderFaction) {
        case 'adeptusCustodes':
            document.querySelector(`#custodesDetachmentRuleAegis`).checked = true;
            break;
        case 'orks':
          break;
        case 'tauEmpire':
            break;
      }
}

function attackerUnitChange(){

    resetModifiers('attacker');

    selectedAttackerUnit = attackerUnitSelectEl.value;
    attackerWeaponSelectEl.innerHTML = generateWeaponSelectHtml(selectedAttackerFaction, selectedAttackerUnit);
}

function defenderUnitChange(){

    resetModifiers('defender');

    selectedDefenderUnit = defenderUnitSelectEl.value;
    populateDefender(selectedDefenderFaction, selectedDefenderUnit);
}

function attackerWeaponChange(){

    resetModifiers('attacker');

    selectedAttackerWeapon = attackerWeaponSelectEl.value.split('_');
    weaponMeleeRanged = selectedAttackerWeapon[1];
    populateAttacker(selectedAttackerFaction, selectedAttackerUnit, selectedAttackerWeapon[0], selectedAttackerWeapon[1]);
}

function populateAttacker(selectedFaction, selectedUnit, selectedWeapon, selectedWeaponType){

    let selectedData = data[selectedFaction].units[selectedUnit].weapons[selectedWeaponType][selectedWeapon];
    let maxPerUnit = data[selectedFaction].units[selectedUnit].weapons[selectedWeaponType][selectedWeapon].maxPerUnit;

    if(!selectedData.hasOwnProperty('name')){
        selectedData = selectedData.data;
    }

    // console.log(selectedData)

    inputAttackerCount.value = maxPerUnit;
    inputAttacks.value = selectedData.a;
    inputWbs.value = selectedData.wbs;
    inputStrength.value = selectedData.s;
    inputAp.value = selectedData.ap;
    inputDamage.value = selectedData.d;

    let antiTypesString = '';
    // console.log(selectedData.tags)
    selectedData.tags.forEach((tag, index) => {
        let splitTag = tag.split('-'); 
        // console.log(splitTag);

        document.querySelector(`#${splitTag[0]}`).checked = true;

        switch(splitTag.length){
            case 2:
                document.querySelector(`#${splitTag[0]}Count`).value = splitTag[1];
                break;
            case 3:
                antiTypesString += `${ (index > 0) ? ', ' : '' }${splitTag[1]}`;
                document.querySelector(`#antiValue`).value = splitTag[2];
                break;
        }

        switch(splitTag[0]){
            case 'rapidFire':
                halfRangeContainer.style.display = 'block';
                break;
            case 'melta':
                halfRangeContainer.style.display = 'block';
                break;
            case 'lance':
                chargedContainer.style.display = 'block';
                break;
            case 'indirectFire':
                losContainer.style.display = 'block';
                break;
            case 'heavy':
                movedContainer.style.display = 'block';
                break;
        }

        if(mechanicusAttackerProtectorEl.checked){
            movedContainer.style.display = 'block';
        }

    });

    document.querySelector(`#antiType`).value = antiTypesString;
}

function populateDefender(selectedFaction, selectedUnit){

    let selectedData = data[selectedFaction].units[selectedUnit];

    inputDefenderCount.value = selectedData.size;
    inputToughness.value = selectedData.t;
    inputSave.value = selectedData.sv;
    inputInvul.value = selectedData.invSv;
    inputWounds.value = selectedData.w;
    inputFnp.value = selectedData.fnp;

    let defenderKeywordString = '';
    selectedData.tags.forEach((tag, index) => {
        defenderKeywordString += `${ (index > 0) ? ', ' : '' }${tag}`;
    });
    defenderTags.value = defenderKeywordString;

}

function resetModifiers(target){

    let targetEl = modifiersEl.querySelector(`.${target}`);

    //reset checkbox inputs
    targetEl.querySelectorAll('input[type=checkbox]').forEach((el) => {
        el.checked = false;
    });

    //reset text inputs
    targetEl.querySelectorAll('input[type=text]').forEach((el) => {
        el.value = '';
    });

    //set critical inputs to 6
    document.querySelector('#criticalHit').value = '6'
    document.querySelector('#criticalWound').value = '6'

    if(target == 'attacker'){
        //also reset the scenario modifiers
        halfRangeContainer.style.display = 'none';
        halfRangeInput.checked = false;
        chargedContainer.style.display = 'none';
        chargedInput.checked = false;
        losContainer.style.display = 'none';
        losInput.checked = false;
        movedContainer.style.display = 'none';
        movedInput.checked = false;
    }

}

function toggleModifiersVisible(){
    if(document.getElementById('modifiers').style.height == '0px'){
        document.getElementById('modifiers').style.height = modifierAttackerHeight+'px';
        document.getElementById('modifiers').style.padding = '10px 10px';
    }else{
        document.getElementById('modifiers').style.height = '0px';
        document.getElementById('modifiers').style.padding = '0px 10px';
    }
}

function showHideHalfRange(){
    if(rapidFireEl.checked || meltaEl.checked){
        halfRangeContainer.style.display = 'block';
    }else{
        halfRangeContainer.style.display = 'none';
    }
}

function showHideCharge(){
    if(lanceEl.checked){
        chargedContainer.style.display = 'block';
    }else{
        chargedContainer.style.display = 'none';
    }
}

function showHideLos(){
    if(indirectFireEl.checked){
        losContainer.style.display = 'block';
    }else{
        losContainer.style.display = 'none';
    }
}

function showHideMoved(){
    if(heavyEl.checked || mechanicusAttackerProtectorEl.checked){
        movedContainer.style.display = 'block';
    }else{
        movedContainer.style.display = 'none';
    }
}

//hide all faction modifier containers
document.querySelectorAll('.faction_modifier_container').forEach((element, index) => {
    element.style.display = 'none';
})

//button to toggle modifier visibility
document.querySelector('#modifierToggle').onclick = toggleModifiersVisible;

//set up the button to run the simulation
document.querySelector('#calculate').onclick = simulateAttackSequence;

//populate the selects with any data i have preprogrammed

let factionSelectHTML = generateFactionSelectHtml();

attackerFactionSelectEl.innerHTML = factionSelectHTML.attacker;
defenderFactionSelectEl.innerHTML = factionSelectHTML.attacker;

attackerFactionSelectEl.addEventListener("change", attackerFactionChange);
defenderFactionSelectEl.addEventListener("change", defenderFactionChange);

attackerUnitSelectEl.addEventListener("change", attackerUnitChange);
defenderUnitSelectEl.addEventListener("change", defenderUnitChange);

attackerWeaponSelectEl.addEventListener("change", attackerWeaponChange);

//setting up the checkboxes that trigger other modifiers to appear
rapidFireEl.addEventListener("change", showHideHalfRange);
meltaEl.addEventListener("change", showHideHalfRange);
lanceEl.addEventListener("change", showHideCharge);
indirectFireEl.addEventListener("change", showHideLos);
heavyEl.addEventListener("change", showHideMoved);
mechanicusAttackerProtectorEl.addEventListener("change", showHideMoved);

let modifierAttackerHeight = document.querySelector('#modifiers').querySelector('.attacker').scrollHeight;

/* CHECK TO CATCH ANY DATA WHERE UNIT SIZE = 0 */
// for(const faction in data){
//     for(const unit in data[faction].units){
//         if(data[faction].units[unit].size == 0){
//             console.log(data[faction].units[unit].name);
//             console.log(data[faction].units[unit].size);
//         }
//     }
// }

console.log(data);