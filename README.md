# Cards & Tankards card maker
A repository dedicated to hosting the JS and CSS data for taking data from a form to generate a Cards & Tankards card image.

## Approach
Using [this](buildcard.js) javascript to take input data from a HTML form, it combines separated image components and constructs a image representing a card from the VR card game [Cards & Tankards](https://www.divergent-realities.com/)

## Usage
Reference invoke [buildcard.js](buildcard.js) as a script src in the HTML document to handle form operations.

(Optional) Reference [layout.css](layout.css) as a stylesheet in the HTML to apply formatting.

Create a HTML form which elements that contain the following IDs;
| ID | Description |
| --- | --- |
| cardName | Expects a string, is printed at the top middle of the graphic |
| cardArt | Expects a image input and will store it in the user's cache (using handleFileSelect(event) ) |
| manaCost | Expects a string / integer, is printed ontop of a diamond graphic on the top-left of the image |
| rarity | Expects a string containing "common" / "uncommon" / "rare" / "legendary" |
| .factions input[type="checkbox"] | Fetches all checkboxes within a class with the value "factions" with values of "dm" / "wh" / "pg" / "ao" / "ne" and up to 2 checked results |
| cardType | Expects a string containing "Creature" / "Master" / "Spell" / "Bane" / "Boon" |
| subType | Expects a string containing "-Generic-" / "-Custom-" or another value.  |
| customSubField | Expects a string and is used if subType is "-Custom-"  |
| attack | Expects a string / integer, is printed ontop of a sword graphic on the left for certain card types |
| health | Expects a string / integer, is printed ontop of a heart graphic on the right for certain card types |
| .attributes input[type="checkbox"] | Fetches all checkboxes within a class with the value "attributes", up to 2 checked results combined with statuses |
| .statuses input[type="checkbox"] | Fetches all checkboxes within a class with the value "statuses" , up to 2 checked results combined with attributes |
| ability | Expects a string and will attempt to write and fit it into a rectangle area at the bottom middle of the card |
| submitButton | A submit button which has it's action prevented and has the form data parsed via the script |

## Goal
To provide a repository to host and maintain files needed to present a HTML form anyone can use to generate fan-created [Cards & Tankards](https://www.divergent-realities.com/) cards.
