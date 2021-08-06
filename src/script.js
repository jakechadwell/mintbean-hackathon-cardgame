"use strict";

//BACKGROUND ANIMATION WAVE

const wave1 = "M0 108.306L50 114.323C100 120.34 200 132.374 300 168.476C400 204.578 500 264.749 600 246.698C700 228.647 800 132.374 900 108.306C1000 84.2382 1100 132.374 1150 156.442L1200 180.51V0H1150C1100 0 1000 0 900 0C800 0 700 0 600 0C500 0 400 0 300 0C200 0 100 0 50 0H0V108.306Z",
      wave2 = "M0 250L50 244.048C100 238.095 200 226.19 300 226.19C400 226.19 500 238.095 600 232.143C700 226.19 800 202.381 900 196.429C1000 190.476 1100 202.381 1150 208.333L1200 214.286V0H1150C1100 0 1000 0 900 0C800 0 700 0 600 0C500 0 400 0 300 0C200 0 100 0 50 0H0V250Z",
      wave3 = "M0 250L50 238.095C100 226.19 200 202.381 300 166.667C400 130.952 500 83.3333 600 101.19C700 119.048 800 202.381 900 214.286C1000 226.19 1100 166.667 1150 136.905L1200 107.143V0H1150C1100 0 1000 0 900 0C800 0 700 0 600 0C500 0 400 0 300 0C200 0 100 0 50 0H0V250Z",
      wave4 = "M0 125L50 111.111C100 97.2222 200 69.4444 300 97.2222C400 125 500 208.333 600 236.111C700 263.889 800 236.111 900 229.167C1000 222.222 1100 236.111 1150 243.056L1200 250V0H1150C1100 0 1000 0 900 0C800 0 700 0 600 0C500 0 400 0 300 0C200 0 100 0 50 0H0V125Z";

anime({
  targets: '.wave-top > path',
  easing: 'linear',
  duration: 7500,
  loop: true,
  d: [
    { value: [wave1, wave2] },
    { value: wave3 },
    { value: wave4 },
    { value: wave1 },
  ],
});

var gameActive = false;
var dealer;
var searchValue = "x";
var searchPlayer = "x";

$(document).ready(function () {
  $("#startButton").click(buttonPress);
  $("#continue").click(moveOn);
  $("#cardContainer").on("click", ".card", function () {
    cardPress(this);
  });
  $("#opponentContainer").on("click", ".opponent", function() {
    opponentPress(this);
  });
});

function buttonPress() {
  if(!gameActive) {
    dealer = new Dealer(requestPlayers());
    gameActive = true;
    alert("Hands dealt, ready to play.\n Click to begin.");
  }
}

function moveOn() {
  if(gameActive) {
    playGame(searchValue, searchPlayer);
  }
}

function cardPress(press) {
  var value = $(press).attr('value');
  searchValue = value;

  switch (value) {
    case "11":
      value = "Jack";
      break;
    case "12":
      value = "Queen";
      break;
    case "13":
      value = "King";
      break;
    case "1":
      value = "Ace";
      break;
    default:
  }

  $("#searchValue").html(value);
}

function opponentPress(press) {
  var value = $(press).attr('number');
  searchPlayer = value;
  $("#searchPlayer").html("Opponent: " + searchPlayer);
}

function resetSearchValues() {
  $("#searchValue").html("");
  $("#searchPlayer").html("");
  searchValue = "x";
  searchPlayer = "x";
}

function playGame(playerInputValue, playerInputOpponent) {
  if(playerInputValue === "x" || playerInputOpponent === "x") {
    $("playerInfo").html("Select opponent and card value to fish!");
    return;
  }

  for (var i = 0; i < dealer.players.length; i++) {
    var playerTakingTurn = dealer.players[i];

    var canTakeTurn = playerTakingTurn.takeTurn();

    if (canTakeTurn === 2) {
      if(playerTakingTurn.getHand() > 1) {
        if(!dealer.dealCard(playerTakingTurn)) {
          $("#playerInfo").html("Deck is empty. Please continue to end.")
          $("#continue").html("Continue");
          continue;
        }
      }

      var valueToSearch = parseInt(playerInputValue);
      var opponentToSearch = dealer.players[playerInputOpponent];
      instigateCall(valueToSearch, opponentToSearch, playerTakingTurn);
      resetSearchValues();

      if(playerTakingTurn.getHand() > 1) {
        $("#continue").html("Draw Card");
      }
      continue;
    }

    if(canTakeTurn === 0) {
      if(!dealer.dealCard(playerTakingTurn)) {
        continue;
      }
    } else {
      var cardAndPlayerInt = playerTakingTurn.callCardAndPlayer(dealer.players.length);
      var cardToFind = cardAndPlayerInt[0].value;
      var playerToFish = dealer.players[cardAndPlayerInt[1]];

      instigateCall(cardToFind, playerToFish, playerTakingTurn);
    }
  }

  if(!dealer.checkWinCondition()) {
    var winnersArray = [];
    var winValue = 0;
    for (var i = 0; i < dealer.players.length; i++) {
      if(dealer.players[i].getNumSets() > winValue) {
        winValue = dealer.players[i].getNumSets();
        winnersArray = [];
        winnersArray.push(i);
      }
      else if (dealer.players[i].getNumSets() === winValue) {
        winnersArray.push(i);
      }
    }

    $("#cardContainer").empty();
    for (var i = 0; i < winnersArray.length; i++) {
      if(dealer.players[winnersArray[i]].id > 1) {
        $("#cardContainer").append("<h3>OPPONENT " + (dealer.players[winnersArray[i]].id - 1) + " WINS!</h3>");
      } else {
        $("#cardContainer").append("<h3>YOU WIN!</h3>");
      }
    }
    gameActive = false;
  }
}

function instigateCall(cardToFind, playerToFish, playerTakingTurn) {
  var matchingValueIndicies = dealer.findCardInPlayer(cardToFind, playerToFish);
  if(matchingValueIndicies.length < 1) {
    if(!dealer.dealCard(playerTakingTurn)) {
    }
  }

  var cardsToPass = playerToFish.removeCards(matchingValueIndicies);
  for (var j = 0; j < cardsToPass.length; j++) {
    playerTakingTurn.addCard(cardsToPass[j]);
  }

  switch (cardToFind) {
    case 11:
      cardToFind = "Jack";
      break;
    case 12:
      cardToFind = "Queen";
      break;
    case 13:
      cardToFind = "King";
      break;
    case 1:
      cardToFind = "Ace";
      break;
    default:
  }

  var num = playerToFish.id;
  if(!playerTakingTurn.human) {
    if(num === 1) {
      num = "YOU"
    } else {
      num = "Opponent " + (playerToFish.id - 1);
    }

    if(matchingValueIndicies < 1) {
      $(".actionExplain").eq((playerTakingTurn.id - 2)).html("Hunted " + cardToFind + " from " + num + ".<br>GO FISH!");
    } else {
      $(".actionExplain").eq(playerTakingTurn.id - 2).html("Hunted " + cardToFind + " from " + num + ".<br>Gained " + matchingValueIndicies.length + " cards!");
    }

  } else {
    num = "Opponent " + (playerToFish.id - 1);
    if(matchingValueIndicies < 1) {
      $("#playerInfo").html("Hunted " + cardToFind + " from " + num + ". GO FISH!");
    } else {
      $("#playerInfo").html("Hunted " + cardToFind + " from " + num + ". Gained " + matchingValueIndicies.length + " cards!");
    }
  }
}

function requestPlayers() {
  do {
    var players = prompt("Choose a number of players, between 2 and 7!");
    players = parseInt(players);
  } while (players === NaN || players < 2 || players > 7);
  return players;
}

class Deck {
  constructor() {
    this.deck = [];
    this.initialise();
    this.printDeck();
  }

  initialise() {
    const SUITS_QUANTITY = 4;
    const SUIT_SIZE = 13;
    var suits = [4,3,2,1];
    for(var i = 0; i < SUITS_QUANTITY; i++) {
      for(var j = 0; j < SUIT_SIZE; j++) {
        var card = {suit: 0, value: 0, image: ""};
        card.suit = suits[i];
        card.value = (j+1);
        var imageRef = "";
        switch (card.value) {
          case 11:
            imageRef += "J";
            break;
          case 12:
            imageRef += "Q";
            break;
          case 13:
            imageRef += "K";
            break;
          case 1:
            imageRef += "A";
            break;
          default:
            imageRef += String(card.value);
        }

        switch (card.suit) {
          case 4:
            imageRef += "S";
            break;
          case 3:
            imageRef += "H";
            break;
          case 2:
            imageRef += "C";
            break;
          case 1:
            imageRef += "D";
            break;
          default:
            imageRef += "HELP I DON'T HAVE A SUIT!"
        }
        card.image = "../static/img/" + imageRef + ".jpg";
        this.deck.push(card);
      }
    }
    this.shuffleDeck();
  }

  shuffleDeck() {

    var m = this.deck.length, t, i;

    while (m) {
      i = Math.floor(Math.random() * m--);
      t = this.deck[m];
      this.deck[m] = this.deck[i];
      this.deck[i] = t;
    }
  }

  printDeck() {
    $("#deckSize").html(this.deck.length);
  }

  getCard() {
    var drawnCard = this.deck.pop();
    this.printDeck()
    return drawnCard;
  }
}

class Dealer {
  constructor(players) {
    this.playerCount = players;
    this.players = [];
    this.MIN_PLAYERS = 2;
    this.DEAL_THRESHOLD = 4
    this.MAX_PLAYERS = 7;
    this.playDeck = new Deck();
    this.createPlayers();
    this.dealHands();
  }

  createPlayers () {
    $("#opponentContainer").empty();
    for (var i = 0; i < this.playerCount; i++) {
      var newPlayer = new Player();
      newPlayer.id = i+1;
      if (i === 0) {
        newPlayer.setHuman();
      } else {
        var opponentNumber = i;
        $("#opponentContainer").append("<div class=\"opponent\" number=\"" + opponentNumber + "\">\n<button class=\"btn\" type=\"button\">Opponent " + opponentNumber + "</button>\n<h5>Sets:</h5>\n<h3 class=\"opponentSets\">0</h3>\n</div>");
      }
      this.players.push(newPlayer);
    }
    this.playerNum = this.players.length;
  }

  dealHands () {
    var toDeal = 0;
    if (this.playerCount >= this.MIN_PLAYERS && this.playerCount < this.DEAL_THRESHOLD) {
      toDeal = 7;
    }
    else if (this.playerCount >= this.DEAL_THRESHOLD && this.playerCount <= this.MAX_PLAYERS) {
      toDeal = 5;
    }
    else {
      throw "invalidPlayerNumberException";
    }

    for (var i = 0; i < toDeal; i++) {
      for (var j = 0; j < this.players.length; j++) {
        this.dealCard(this.players[j]);
      }
    }
  }

  dealCard (player) {
    if(this.playDeck.deck.length < 1) {
      return false
    } else {
      player.addCard(this.getCardFromDeck());
    }
    return true;
  }

    findCardInPlayer(card, opponent) {
    var cardsOfMatchingValue = [];
    for (var i = 0; i < opponent.hand.length; i++) {
      if(opponent.hand[i].value === card) {
        cardsOfMatchingValue.push(i);
      }
    }
    return cardsOfMatchingValue;
  }

  getCardFromDeck() {
    return this.playDeck.getCard();
  }

  checkWinCondition () {
    var totalSets = 0;
    for (var i = 0; i < this.players.length; i++) {
      totalSets += this.players[i].getNumSets();
    }

    if(totalSets === 13) {
      return false;
    }
    return true;
  }
  getPlayersLength() {
    return this.players.length;
  }
}

class Player {
  constructor () {
    this.id = 0;
    this.hand = [];
    this.human = false;
    this.sets = [];
    this.humanController;
  }

  addCard (card) {
    this.hand.push(card);
    this.sortHand();
    this.checkHand();
  }

  getHand () {
    return this.hand;
  }

  setHuman () {
    this.human = true;
    this.humanController = new Human(this);
  }

  removeCards (indexArray) {
    var removedCards = [];
    for (var i = (indexArray.length - 1); i >= 0; i--) {
      var singleCard = this.hand[indexArray[i]];
      this.hand.splice(indexArray[i], 1);
      removedCards.push(singleCard);
    }

    if(this.human) {
      this.humanController.populateCardContainer(this.getHand());
    }

    this.checkHand();
    return removedCards;
  }

  takeTurn () {
    if(this.human) {
      if(this.hand.length < 1) {
        return 0;
      } else {
        return 2;
      }

    } else {
      if(this.hand.length < 1) {
        return 0;
      } else {
        return 1;
      }
    }
  }

  callCardAndPlayer (playerTot) {
    do {
      var rand1 = Math.floor(Math.random() * this.hand.length);
      var rand2 = Math.floor(Math.random() * playerTot);
    } while (rand2 === this.id-1);

    return [this.hand[rand1], rand2];
  }

  sortHand () {
    this.hand.sort(function (a,b) {return a.value - b.value});

    if(this.human) {
      this.humanController.populateCardContainer(this.getHand());
    }
  }

  checkHand() {
    var currentValue = 0;
    var valueCount = 1;
    if(this.hand.length < 1 && this.human) {
      this.humanController.emptyHand();
      return;
    } else if(this.human) {
      this.humanController.fullHand();
    }

    for (var i = 0; i < this.hand.length; i++) {
      if (this.hand[i].value !== currentValue) {
        currentValue = this.hand[i].value;
        valueCount = 1;
      } else {
        valueCount++;
      }

      if(valueCount === 4) {
        var set = this.hand[i].value;
        this.playSet(set);

        this.removeCards([i-3, i-2, i-1, i]);
      }
    }
  }

  playSet(set) {
    this.sets.push(set);
    this.updateSetsUI();
  }

  updateSetsUI() {
    var setsString = "";
    if(this.human) {
      for (var i = 0; i < this.sets.length; i++) {
        var toAdd = " |" + this.sets[i] + "s| ";

        switch (this.sets[i]) {
          case 11:
            toAdd = " |Jacks| ";
            break;
          case 12:
            toAdd = " |Queens| ";
            break;
          case 13:
            toAdd = " |Kings| ";
            break;
          case 1:
            toAdd = " |Aces| ";
            break;
          default:
        }
        setsString += toAdd;
      }
      $('#humanSets').html(setsString);
    } else {
      for (var i = 0; i < this.sets.length; i++) {
        var toAdd = " |" + this.sets[i] + "s| ";

        switch (this.sets[i]) {
          case 11:
            toAdd = " |Jacks| ";
            break;
          case 12:
            toAdd = " |Queens| ";
            break;
          case 13:
            toAdd = " |Kings| ";
            break;
          case 1:
            toAdd = " |Aces| ";
            break;
          default:
        }
        setsString += toAdd;
      }
      $('#opponentContainer').children("[number=" + (this.id-1) + "]").eq(0).children(".opponentSets").eq(0).html(setsString);
    }
  }

  getNumSets() {
    return this.sets.length;
  }

  getSets() {
    return this.sets;
  }
}

class Human {
  constructor() {
    this.cardContainer;
  }

  setCardContainer() {
    this.cardContainer = $("#cardContainer");
  }

  populateCardContainer(hand) {
    this.clearBoard();
    var cardCount = 0;
    for (var i = 0; i < hand.length; i++) {
      cardCount++;
      this.addCardToContainer(hand[i]);
    }
  }

  clearBoard() {
    var cardContainer = $("#cardContainer").empty();
  }

  addCardToContainer(card) {
    $("#cardContainer").append("<img class=\"card\" src=\"" + card.image + "\" value=\"" + card.value + "\" alt=\"A card\">");
  }

  emptyHand() {
    $("#continue").html("Draw Card");
    searchValue = "drawCard";
    searchPlayer = "drawCard";
  }

  fullHand() {
    $("#continue").html("Take Turn");
    searchValue = "x";
    searchPlayer = "x";
  }
}
