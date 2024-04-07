const statusList = ['Doomed', 'Marked', 'Stunned', 'Suppressed'];
const attributeList = ['Amped', 'Armored', 'Backlash', 'Flight', 'Loophole', 'Multiblocker', 'Pacifist', 'Ranged', 'Restless', 'Taunt'];
const keywords = ['Activate','Aftermath','Condition','Deathblow','Devotion','Discarded','Duel','Enhance','Enrage','Entrance','Fetch','Innate','Last Word','Mastery','Mobilize','Outnumbered','Plunder','Prepare','Shift']
    .concat(statusList)
    .concat(attributeList);
const subTypes =
{
    "Creature": ["-Generic-", "Crusader", "Elemental", "Mercenary", "Noble", "Ooze", "Undead", "Underling", "-Custom-"],
    "Spell": ["-Generic-", "Contract", "Enchantment", "Ritual", "-Custom-"],
    "Master": [],
    "Bane": [],
    "Boon": [],
    "Token": ["-Generic-", "Crusader", "Elemental", "Mercenary", "Noble", "Ooze", "Undead", "Underling", "-Custom-"]
};
const imgPath = {base: 'images/'};
imgPath.border = imgPath.base + 'borders/';
imgPath.identity = imgPath.base + 'identities/';
imgPath.attribute = imgPath.base + 'attributes/';
imgPath.status = imgPath.base + 'statuses/';
imgPath.element = imgPath.base + 'elements/';
imgPath.rarity = imgPath.base + 'rarities/';
var webURL;
const daysFont = 'Days Sans Black';

document.addEventListener("DOMContentLoaded", function()
{
    saveFileToIndexedDB(null); // Blank out cached data.
    webURL = window.location.href;
    webURL = webURL.substring(0, webURL.lastIndexOf('/')+1);
    var factionBoxes = document.querySelectorAll('.factions input[type="checkbox"]');
    var abilityBoxes = document.querySelectorAll('.statuses input[type="checkbox"], .attributes input[type="checkbox"]');
    var cardTypeSelect = document.getElementById("cardType");
    var subTypeContainer = document.getElementById("subTypeContainer");
    var subTypeSelect = document.getElementById("subType");
    var atkhpContainer = document.getElementById("atkhealth");
    var customSubField = document.getElementById("customSubField");
    var abilityTextArea = document.getElementById("ability");
    var abilityTextLabel = document.getElementById("abilityCount");
    var submitButton = document.getElementById("submitButton");
    var abilities = [undefined, undefined];
    var factions = [undefined, undefined];
    abilityTextArea.addEventListener("input", function()
    { //Ability Text (X / Y) , update the X as the user types.
        abilityTextLabel.textContent = UpdateTextCount(abilityTextArea.value, abilityTextLabel.textContent);
    });
    cardTypeSelect.addEventListener("change", function()
    { // Update subtypes when card type changes
        var selectedCardType = cardTypeSelect.value;
        UpdateSubTypeOptions(subTypes[selectedCardType]);
        if (HasCombatStats(selectedCardType))
        {
            atkhpContainer.classList.remove("hide");
        }
        else
        {
            atkhpContainer.classList.add("hide");
        }
        if (CanHaveSubtype(selectedCardType))
        { // Show the dropdown if it can have a subtype.
            subTypeContainer.classList.remove("hide");
        }
        else
        { // Otherwise hide it and blank out the value.
            subTypeContainer.classList.add("hide");
            subTypeSelect.value = "";
        }
        // Show/hide custom text field based on selected subtype
        customSubField.style.display = subTypeSelect.value === '-Custom-' ?
            customSubField.style.display = "block" :
            customSubField.style.display = "none";
    });
    subTypeSelect.addEventListener("change", function()
    { // Show/hide custom text field based on selected subtype
        customSubField.style.display = subTypeSelect.value === '-Custom-' ?
            customSubField.style.display = "block" :
            customSubField.style.display = "none";
    });
    // Function to update sub type options
    function UpdateSubTypeOptions(choice)
    { // Clear existing option.
        subTypeSelect.innerHTML = '';
        choice.forEach(function(option)
        { // Update the option values
            var opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            subTypeSelect.appendChild(opt);
        });
    }
    // Default it to "Creature" and send an event.
    cardTypeSelect.value = "Creature";
    cardTypeSelect.dispatchEvent(new Event('change'));
    var sortedAbilities = Array.from(abilityBoxes);
    sortedAbilities.sort((a, b) =>
    { // Sort abilities Status > Attribute, ABC.
        const isAStatus = a.closest('.statuses') !== null;
        const isBStatus = b.closest('.statuses') !== null;
        if (isAStatus !== isBStatus)
        { // Sort abilities by status
            return isAStatus ? -1 : 1;
        }
        else
        { // Sort by abc
            return a.id.localeCompare(b.id);
        }
    });
    abilityBoxes.forEach(function(checkbox)
    { // Add event to ability & status checkboxes
        checkbox.addEventListener('click', function (event)
        { 
            abilities = abilityBoxClick(event, sortedAbilities, abilities)
        });
    });
    var sortedFactions = Array.from(factionBoxes);
    factionBoxes.forEach(function(checkbox)
    { // Add event to faction checkboxes
        checkbox.addEventListener('click', function (event)
        { 
            factions = factionBoxClick(event, sortedFactions, factions)
        });
    });
    submitButton.addEventListener("click", function(event)
    {
        // Cancel submit event, we do our own thing.
        event.preventDefault();
        SubmitClicked(cardTypeSelect.value,abilities,factions);
    });
    // Generate the default card
    ComposeCard();
});
function UpdateTextCount(count, textField)
{ // Modify the string to '(count / textField's Max)'
    return count.replace(/\^/g, '').length.toString().concat(" / ", textField.split("/ ")[1]);
}
function CanHaveSubtype(input)
{ // Return true if it's a creature/spell/token.
    const cardTypes = ['creature', 'spell', 'token'];
    return cardTypes.includes(input.toLowerCase());
}
function abilityBoxClick(event, checkBoxes, abilities)
{
    var clickedCheckbox = event.target;
    clickedCheckbox.dataset.checkedTime = Date.now();
    var checkedBoxes = checkBoxes.filter(checkbox => checkbox.checked);
    var checkedCount = checkedBoxes.length;
    abilities[0] = undefined;
    abilities[1] = undefined;
    if (checkedCount === 0)
    { // No abilities? cease processing.
        return abilities;
    }
    checkedBoxes.sort((a, b) => a.dataset.checkedTime - b.dataset.checkedTime);
    if (checkedCount > 2)
    { // More then two? assign both appropriately and uncheck the oldest.
        abilities[0] = checkedBoxes[1].value.toLowerCase();
        abilities[1] = checkedBoxes[2].value.toLowerCase();
        checkedBoxes[0].checked = false;
    }
    else
    { // Otherwise, assign the first.
        abilities[0] = checkedBoxes[0].value.toLowerCase();
        if (checkedCount > 1)
        { //And if there's a second, assign that.
            abilities[1] = checkedBoxes[1].value.toLowerCase();
        }
    }
    // And hand the updated stuff back.
    return abilities;
}
function factionBoxClick(event, checkBoxes, factions)
{
    var clickedCheckbox = event.target;
    clickedCheckbox.dataset.checkedTime = Date.now();
    var checkedBoxes = checkBoxes.filter(checkbox => checkbox.checked);
    var checkedCount = checkedBoxes.length;
    factions[0] = undefined;
    factions[1] = undefined;
    if (checkedCount === 0)
    { // No factions? cancel processing.
        return factions;
    }
    checkedBoxes.sort((a, b) => a.dataset.checkedTime - b.dataset.checkedTime);
    if (checkedCount > 2)
    { // More than two? assign appropriately and uncheck the oldest.
        factions[0] = checkedBoxes[1].value.toLowerCase();
        factions[1] = checkedBoxes[2].value.toLowerCase();
        checkedBoxes[0].checked = false;
    }
    else
    { // Otherwise, assign the first.
        factions[0] = checkedBoxes[0].value.toLowerCase();
        if (checkedCount > 1)
        { // And the second, if we have one.
            factions[1] = checkedBoxes[1].value.toLowerCase();
        }
    }
    // And hand the modified data back.
    return factions;
}
function SubmitClicked(cardType, abilities, factions)
{
    var cardName = document.getElementById("cardName").value;
    var subType = ValidateSubType(cardType, document.getElementById("subType").value,document.getElementById("customSubType").value);
    var manaCost = ValidateManaCost(cardType, document.getElementById("manaCost").value);
    var rarity = document.getElementById("rarity").value;
    var atkValue = CardNumberToString(document.getElementById("attack").value);
    var hpValue = CardNumberToString(document.getElementById("health").value);
    var abilityText = document.getElementById("ability").value;
    var cardArt
    abilities.sort((a, b) =>
    { // Sort abilities Status > Attribute, ABC.

        if (IsStatus(a) && IsAttribute(b))
        { // A is, B isn't.
            return -1;
        }
        else if (IsAttribute(a) && IsStatus(b))
        { // A isn't, B is.
            return 1;
        }
        else
        { // Sort it alphabetically.
            return a.localeCompare(b);
        }
    });
    // Get image from browser cache.
    getImageFromIndexedDB().then(function(imageData)
    {
        if (imageData)
        { // If it's valid imge data, assign it to our variable.
            cardArt = imageData;
        }
        else
        { // Otherwise, mark is as undefined.
            cardArt = undefined;
        }
        ComposeCard(
        {
            cardArt:cardArt,
            cardName:cardName,
            manaCost:manaCost,
            rarity:rarity,
            factions:factions,
            abilities:abilities,
            cardType:cardType,
            cardSubType:subType,
            atkNum:atkValue,
            hpNum:hpValue,
            abilityText:abilityText
        });
    })
    .catch(function(error)
    { // Verbose any errors
        console.error('Error retrieving image from IndexedDB:', error);
    });
}
function ValidateSubType(mainType, subType, customType)
{
    if ((!IsInnateCard({ input: mainType }) && mainType!='Token') ||
        subType === '-Generic-')
    { // If it can't have a subtype -or- it's Generic, no data.
        return '';
    }
    if (subType === '-Custom-')
    { // If we have a custom, return the custom.
        return customType;
    }
    // Otherwise, return selected subType.
    return subType;
}
function ValidateManaCost(mainType, input)
{
    if (!IsInnateCard({ input: mainType }))
    { // If it's not a Creature/Spell, hard set to 0.
        return '0';
    }
    else if (input === '-1')
    { // If it's -1, make it a *.
        return '*';
    }
    else
    { // Otherwise, return the number as text.
        return input.toString();
    }
}
function CardNumberToString(input)
{
    if (input === '-1')
    { // If the number is -1, return *.
        return '*';
    }
    else
    { // Otherwise, number as text.
        return input.toString();
    }
}
function IsStatus(input)
{ // Self-explanatory assist function.
    return statusList.some(entry => entry.toLowerCase() === input.toLowerCase());
}

function IsAttribute(input)
{ // Self-explanatory assist function.
    return attributeList.some(entry => entry.toLowerCase() === input.toLowerCase());
}
function getImageFromIndexedDB()
{
    return new Promise((resolve, reject) =>
    { //Open our database from user cache.
        var dbRequest = indexedDB.open('imageDatabase', 1);
        dbRequest.onerror = function (event)
        { // If we error, verbose it and cease.
            console.error("IndexedDB error:", event.target.errorCode);
            reject(event.target.errorCode);
        };
        dbRequest.onsuccess = function (event)
        { // If we find the database and open it...
            var db = event.target.result;
            var transaction = db.transaction(['images'], 'readonly');
            var objectStore = transaction.objectStore('images');
            var getRequest = objectStore.get('imageData');
            getRequest.onsuccess = function (event)
            { // Try grab 'imageData' and if we succeed...
                var imageData = event.target.result;
                if (imageData)
                { // If the data exists at all, complete and hand it back.
                    resolve(imageData.data);
                }
                else
                { // Otherwise return null and report why.
                    console.log("No image found in IndexedDB.");
                    resolve(null);
                }
            };
        };
    });
}
async function ComposeCard(settings = {})
{
    const
    {
        cardArt = undefined,
        cardName = 'Ashen One',
        manaCost = '69',
        rarity = 'common',
        cardType = 'Creature',
        cardSubType = 'Chosen Undead',
        factions = ['ne', undefined],
        abilities = [undefined, undefined],
        atkNum = '4',
        hpNum = '20',
        abilityText = '^Awaken^: Become the one true lord of the dark soul.'
    } = settings;
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 1024;
    if (factions[0] !== null)
    { // If we have a faction's data, process it.
        factions[0] = ValidateFaction({ input: factions[0] });
    }
    if (factions[1] !== null)
    { // If we have second faction data, process it.
        factions[1] = ValidateFaction({ input: factions[1], defaultNE: false });
    }
    if (cardArt === undefined)
    { // If we actually have some cardArt, load it.
        await AddImage(ctx, { filePath: webURL + imgPath['base'] + 'default', x: 129, y: 40 });
    }
    else
    { // Otherwise, load in the filler ? graphic.
        var importImg = new Image(766, 600);
        importImg.src = cardArt;
        importImg.onload = function ()
        { //Draw it on once we load the image.
            ctx.drawImage(importImg, 129, 40, 766, 600);
        }
    }
    await importImg // Make sure it finishes.
    // Card frame (with banner)
    await AddImage(ctx, { filePath: webURL + imgPath['border'] + factions[0], x: 0, y: 0 });
    if (factions[1] === undefined ||
        cardType!=="Token")
    { // If we only have one Identity (or are a token), use that one.
        await AddImage(ctx, { filePath: webURL + imgPath['identity'] + (cardType==="Token"? 'to' : factions[0]), x: 0, y: 0 });
    }
    else
    { // If we have two, use both and mask the second so it fades.
        await AddImage(ctx, { filePath: webURL + imgPath['identity'] + factions[0], x: 0, y: 0 });
        await AddImage(ctx, { filePath: webURL + imgPath['identity'] + factions[1], x: 0, y: 0, useMask: true });
    }
    // Write the Card's name onto the image.
    WriteText(ctx, { text: cardName, x: canvas.width / 2, y: 36, fontSize: 39, outlineSize: 5, centered: true });
    if (cardType!=='Token')
    { // Rarity icon, if we're not a token.
        await AddImage(ctx, { filePath: webURL + imgPath['rarity'] + rarity, x: 770, y: 40 });
    }
    // Mana Cost icon and text
    await AddImage(ctx, { filePath: webURL + imgPath['element'] + 'mana', x: 126, y: 22 });
    WriteText(ctx, { text: manaCost, x: 228, y: 152, font: daysFont, fontSize: 75, outlineSize: 8, centered: true });
    // Card Type + Sub Type text
    WriteText(ctx, { text: (cardSubType === '' ? '' : cardSubType + ' ') + cardType, x: 511, y: 670, fontSize: 32, color: 'black', centered: true, bold: true });
    if (abilities[0] !== undefined)
    { // If we have an ability, put a plate and icon onto the card.
        await AddImage(ctx, { filePath: IsStatus(abilities[0]) ? webURL + imgPath['status'] + 'plate' : webURL + imgPath['attribute'] + factions[0], x: 158, y: 186 });
        await AddImage(ctx, { filePath: (IsStatus(abilities[0]) ? webURL + imgPath['status'] : webURL + imgPath['attribute']) + abilities[0], x: 165, y: 193 });
    }
    if (abilities[1] !== undefined)
    { // If we have a second ability, put another on below the first.
        await AddImage(ctx, { filePath: IsStatus(abilities[1]) ? webURL + imgPath['status'] + 'plate' : webURL + imgPath['attribute'] + factions[0], x: 158, y: 300 });
        await AddImage(ctx, { filePath: (IsStatus(abilities[1]) ? webURL + imgPath['status'] : webURL + imgPath['attribute']) + abilities[1], x: 165, y: 310 });
    }
    if (HasCombatStats(cardType))
    { // Should we draw atk/health on it?
        //Attack icon + Number
        await AddImage(ctx, { filePath: webURL + imgPath['element'] + 'attack', x: 110, y: 500 });
        WriteText(ctx, { text: atkNum, x: 215, y: 640, font: daysFont, fontSize: 93, outlineSize: 11, centered: true });
        //Health icon + number
        await AddImage(ctx, { filePath: webURL + imgPath['element'] + 'health', x: 700, y: 500 });
        WriteText(ctx, { text: hpNum, x: 805, y: 640, font: daysFont, fontSize: 93, outlineSize: 11, centered: true });
    }
    //User generated label
    WriteText(ctx, { text: 'USER', x: 510, y: 820, fontSize: 120, bold: true, centered: true, color: 'rgba(0, 0, 0, 0.05)' });
    WriteText(ctx, { text: 'GENERATED', x: 510, y: 950, fontSize: 120, bold: true, centered: true, color: 'rgba(0, 0, 0, 0.05)' });
    //Ability Text
    WriteMultiLineText(ctx, abilityText, 170, 690, 680, 280,54,46);
}
function ValidateFaction(args)
{
    const
    {
        input = undefined,
        defaultNE = true
    } = args;
    const factions = ['dm', 'wh', 'pg', 'ao', 'ne']
    if (factions.includes(input))
    { // If 'input' matches an entry in 'factions'
        return input;
    } // Otherwise, return ne or undefined.
    return !defaultNE ? undefined : 'ne';
}
async function AddImage(ctx, settings = {})
{
    const
    {
        filePath = 'NULL',
        x = 0,
        y = 0,
        useMask = false,
    } = settings;
    return new Promise((resolve, reject) =>
    { // Request the image
        var img = new Image();
        img.src = filePath + '.png';
        img.onload = function ()
        { // Wait for it to load
            if (useMask)
            { // If we ask for a mask, request it.
                var mask = new Image();
                mask.src = 'images/mask.png';
                mask.onload = function ()
                { // Once it loads, apply it to the image.
                    var tempCanvas = document.createElement('canvas');
                    var tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    tempCtx.drawImage(img, 0, 0);
                    tempCtx.globalCompositeOperation = 'destination-in';
                    tempCtx.drawImage(mask, 0, 0, img.width, img.height);
                    ctx.drawImage(tempCanvas, x, y);
                    resolve();
                };
                mask.onerror = function ()
                { // Verbose and cancel on failure.
                    reject(new Error("Failed to load mask"));
                };
            }
            else
            { // If we didn't ask for a mask, just draw the image directly.
                ctx.drawImage(img, x, y);
                resolve();
            }
        };
        img.onerror = function ()
        { // Verbose and cancel on failure.
            reject(new Error("Failed to load image"));
        };
    });
}
function HasCombatStats(input)
{ // Self-explanatory assist function.
    const cardTypes = ['creature', 'master', 'token'];
    return cardTypes.includes(input.toLowerCase());
}
function WriteText(ctx, settings = {})
{
    const
    {
        text = "Undefined",
        x = 0,
        y = 0,
        font = 'Asap',
        fontSize = '16',
        outlineSize = 0,
        color = 'white',
        outlineColor = 'black',
        centered = false,
        bold = false
    } = settings;
    // Set font style
    ctx.font = fontSize + 'px ' + font + (bold ? ' Bold' : '');
    ctx.textAlign = (centered ? 'center' : '') // put center in if we need to
    if (Number.isInteger(outlineSize) &&
        outlineSize > 0)
    { // If we say we need a outline
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = outlineSize; // Adjust the width of the outline as needed
        ctx.strokeText(text, x, y);
    }
    // Draw filled text
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}
function IsInnateCard(args)
{
    const
    {
        input = undefined,
        includeMaster = false
    } = args;
    const cardTypes = ['Creature','Spell'];
    if (includeMaster)
    { // If we also want to check for masters...
        cardTypes.push('Master');
    } // Return a true/false if 'input' exists in 'cardTypes' (regardless of casing)
    return cardTypes.some(entry => entry.toLowerCase() === input.toLowerCase());
}
function WriteMultiLineText(ctx, text, xPosition, yPosition, boxWidth, boxHeight, fontSize, minFontSize) 
{
    text = text.replace(/[\n]/g, " \n ");
    text = text.replace(/\r/g, "");
    ctx.font = 'Bold ' + fontSize + 'px Asap';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    var words = text.split(/[ ]+/);
    for (var i = 0; i < words.length - 1; i++)
    {
        var combinedWord = words[i] + ' ' + words[i + 1];
        if (keywords.includes(combinedWord.replace(/:$/, '')))
        {
            words.splice(i, 2, combinedWord);
        }
        if (combinedWord.startsWith('^') &&
            (combinedWord.endsWith('^') || combinedWord.endsWith('^:')))
        {
            words.splice(i, 2, combinedWord);
        }
    }
    var spaceWidth = ctx.measureText(' ').width;
    var lines = [];
    var currentLine = 0;
    var currentSize = 0;
    var wordObject;
    lines[currentLine] = {};
    lines[currentLine].Words = [];
    var iteration = 0;
    while (iteration < words.length) 
    {
        var word = words[iteration];
        if (word == "\n") 
        {
            lines[currentLine].EndParagraph = true;
            currentLine++;
            currentSize = 0;
            lines[currentLine] = {};
            lines[currentLine].Words = [];
            iteration++;
        }
        else 
        {
            wordObject = {};
            wordObject.l = ctx.measureText(word).width;
            if (currentSize === 0) 
            {
                while (wordObject.l > boxWidth) 
                {
                    word = word.slice(0, word.length - 1);
                    wordObject.l = ctx.measureText(word).width;
                }
                if (word === "") return; // Can't fill a single character
                wordObject.word = word;
                lines[currentLine].Words.push(wordObject);
                currentSize = wordObject.l;
                if (word != words[iteration]) 
                {
                    words[iteration] = words[iteration].slice(word.length, words[iteration].length);
                }
                else 
                {
                    iteration++;
                }
            }
            else 
            {
                if (currentSize + spaceWidth + wordObject.l > boxWidth) 
                {
                    lines[currentLine].EndParagraph = false;
                    currentLine++;
                    currentSize = 0;
                    lines[currentLine] = {};
                    lines[currentLine].Words = [];
                }
                else 
                {
                    wordObject.word = word;
                    lines[currentLine].Words.push(wordObject);
                    currentSize += spaceWidth + wordObject.l;
                    iteration++;
                }
            }
        }
        var totalHeight = fontSize * lines.length;
        if (totalHeight > boxHeight &&
            fontSize > minFontSize)
        { // If we can't fit, and we aren't min-font, re-calculate.
            fontSize--;
            currentLine = 0;
            currentSize = 0;
            lines = [];
            lines[currentLine] = {};
            lines[currentLine].Words = [];
            iteration = 0;
            ctx.font = 'Bold ' + fontSize + 'px Asap';
        }
    }
    if (currentSize === 0) lines.pop();
    lines[currentLine].EndParagraph = true;
    var totalHeight = fontSize * lines.length;
    while (totalHeight > boxHeight) 
    {
        lines.pop();
        totalHeight = fontSize * lines.length;
    }
    var yCoordinate = yPosition;
    yCoordinate = yPosition + boxHeight / 2 - totalHeight / 2 + fontSize;
    for (var lineIndex in lines) 
    {
        var xCoordinate = xPosition;
        var spaceIncrement = spaceWidth;
        let totalLineLength = 0;
        for (var wordIndex in lines[lineIndex].Words) totalLineLength += ctx.measureText(lines[lineIndex].Words[wordIndex].word.replace(/\^/g, '')).width;
        xCoordinate += (boxWidth - totalLineLength - spaceWidth * (lines[lineIndex].Words.length - 1)) / 2;
        for (var wordIndex in lines[lineIndex].Words) 
        {
            const word = lines[lineIndex].Words[wordIndex].word;
            var returnColon = false;
            if (word.endsWith('^:')) 
            {
                returnColon = true;
            }
            let strippedWord = word.replace(/^\^|\^:?$|\^$/g, ''); // Adjusted regex to allow optional colon at end within ^...^
            let wordWidth = ctx.measureText(strippedWord).width;

            ctx.fillText(returnColon ? strippedWord += ':' : strippedWord, xCoordinate, yCoordinate);
            // Check for word enclosed within "^...^", allowing optional colon at end
            if (/^\^.*\^:?$/.test(word)) 
            {
                ctx.fillRect(xCoordinate, yCoordinate + 2, wordWidth, 4); // Underline
            }
            else 
            {
                // Check if the word matches any of the specified words
                if ((new RegExp(`^(${keywords.join('|')})(?=(?:\\W|$))`, 'i')).test(strippedWord.replace(/:$/, ''))) 
                {
                    // Underline the matched word
                    ctx.fillStyle = "black";
                    if (word.endsWith(':')) 
                    {
                        wordWidth -= ctx.measureText(':').width;
                    }
                    ctx.fillRect(xCoordinate, yCoordinate + 2, wordWidth, 4);
                }
            }
            xCoordinate += ctx.measureText(strippedWord).width + spaceIncrement;
        }
        yCoordinate += fontSize;
    }
}
function handleFileSelect(event)
{
    var file = event.target.files[0];
    if (file)
    {
        readFileAsDataURL(file)
            .then(imageData =>
            {
                return saveFileToIndexedDB(imageData);
            })
            .catch(error =>
            {
                console.error('Error saving file:', error);
            });
    }
}
function readFileAsDataURL(file)
{
    return new Promise((resolve, reject) =>
    {
        var fileReader = new FileReader();
        fileReader.onload = function (event)
        {
            resolve(event.target.result);
        };
        fileReader.onerror = function (event)
        {
            reject(event.target.error);
        };
        fileReader.readAsDataURL(file);
    });
}
function saveFileToIndexedDB(file)
{
    return new Promise((resolve, reject) =>
    {
        var dbRequest = indexedDB.open('imageDatabase', 1);
        dbRequest.onerror = function (event)
        {
            console.error("IndexedDB error:", event.target.errorCode);
            reject(event.target.errorCode);
        };
        dbRequest.onupgradeneeded = function (event)
        {
            var db = event.target.result;
            db.createObjectStore('images', { keyPath: 'key' });
        };
        dbRequest.onsuccess = function (event)
        {
            var db = event.target.result;
            var transaction = db.transaction(['images'], 'readwrite');
            var objectStore = transaction.objectStore('images');
            var getRequest = objectStore.get('imageData');
            getRequest.onsuccess = function (event)
            {
                var imageData = event.target.result;
                if (imageData)
                {
                    // Update the existing image data
                    imageData.data = file;
                    var updateRequest = objectStore.put(imageData);
                    updateRequest.onsuccess = function (event)
                    {
                        db.close();
                        resolve();
                    };
                    updateRequest.onerror = function (event)
                    {
                        console.error("Error updating existing image in IndexedDB:", event.target.errorCode);
                        reject(event.target.errorCode);
                    };
                }
                else
                {
                    // Add the new image data
                    var newImageData = { key: 'imageData', data: file };
                    var addRequest = objectStore.add(newImageData);
                    addRequest.onsuccess = function (event)
                    {
                        console.log('New image saved to IndexedDB.');
                        db.close();
                        resolve();
                    };
                    addRequest.onerror = function (event)
                    {
                        console.error("Error saving new image to IndexedDB:", event.target.errorCode);
                        reject(event.target.errorCode);
                    };
                }
            };
        };
    });
}