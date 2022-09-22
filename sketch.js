/*

The Game Project 7

* 4 platforms implemented using Factory pattern.

* 3 Constructors are used: Enemy() to populate enemies[], Emitter() to create bubbly effect on
character and enemies, and Particle() to create the emitter's particles..  

* Wall Street -theme Stock market ticker: market_data object 
I used asynchronuous Fetch API, to AlphaVantage.com free API with historical prices. 
Error fixed: Web server allows request max 1 times/min . I catched that error,
checking the object returned if .hasOwnProperty("Global Quote") = what I need.
Definitively want to learn error catching techniques.
  
* Learn to use asynchronous functions and callbacks, it's so interesting and empowering, and 
  honnestly so hard, took me a week to get it working, I'm proud it works!
  But market_data feels poorly written, it's difficult to refactor that part, I need more 
  guidance for that level of coding. 
* My biggest error along the way: in market_data object I choose to use properties named 
  directly, like market_data.amzn => it became cvry hard-coded.
  Also so many data formats to handle, 4 decimals from the JSON file, number in thousands, 
  then %, preparing data seems interesting subject.
 
 * Can you find the magic bandana? 

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var sky_color;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var blinkingFrames;
var isBlinking;

var clouds;
var mountains;
var trees_x;
var canyons;
var collectables;

var flagpole;
var lives;
var text_1;
var text_2;
var game_score;
var isGameIdle;

var jumpSound;
var soundtrackSound;
var coinSound;
var fallingSound;
var winSound;
var isWinSoundPlayed;
var isFallingSoundPlayed;
var isEasterEggSoundPlayed;
var isBandanaFound;
var eastereggSound;

var platforms;
var enemies;
var isEnemyTouched;

var emiters;


// preloads all sounds
function preload()
{
    soundFormats('mp3','wav');
    
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.05);
    
    soundtrackSound = loadSound('assets/soundtrack.wav');
    soundtrackSound.setVolume(0.05);
    
    coinSound = loadSound('assets/coin.wav');
    coinSound.setVolume(0.1);
    
    fallingSound = loadSound('assets/falling.wav');
    fallingSound.setVolume(0.05);

    winSound = loadSound('assets/winning.mp3');
    winSound.setVolume(0.15);
    
    enemySound = loadSound('assets/enemy.mp3');
    enemySound.setVolume(0.3);

    eastereggSound = loadSound('assets/easteregg.wav');
    eastereggSound.setVolume(0.15);
}

// There is a real setup() executed only once, 
// and a startGame() executed many times after loosing life or winning. 
function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
    
    lives = 3;
    startGame();
    
    // use createPlatform Factory to create 4 platforms 
    platforms = [];
    platforms.push(createPlatforms(50, floorPos_y - 90, 200, color(150,111,51), false));
    platforms.push(createPlatforms(585, floorPos_y - 70, 345, color(250,250,240), false));

    // invisible platform for easter egg
    platforms.push(createPlatforms(-1200, floorPos_y - 50, 200, color(250,250,240,1), true ));
    
    // Gold platform, can reach only after easter egg
    platforms.push(createPlatforms(1100, floorPos_y - 180, 250, color(250,215,0), false ));
    
    
    // Use Enemy() Constructor to populate enemies with 7 enemies
    enemies = [];
    enemies.push(new Enemy(20, floorPos_y-10, 180));
    enemies.push(new Enemy(760, floorPos_y-10, 150));
    enemies.push(new Enemy(860, floorPos_y-10, 250));
    enemies.push(new Enemy(1500, floorPos_y-10, 200));
    enemies.push(new Enemy(1700, floorPos_y-10, 200));
    enemies.push(new Enemy(-500, floorPos_y-10, 250));
    enemies.push(new Enemy(-550, floorPos_y-10, 100));
    
    // I/m using particle emitters for the game chacacter (2 first), + all enemies (7).
    // here I'm just starting the emitters first.
    // Later I just need to change all emiters.x to match the subject/enemy positionX
    emiters = [];
    // yellow fire
    emiters.push( new Emitter(width/2, height-100 -50, 0, -3, 10, color(255,165,0, 200)));
    emiters[0].startEmitter(100, 150);
    // red fire
    emiters.push( new Emitter(width/2, height-100 -50, 0, -1, 10, color(255,0,0, 100)));
    emiters[1].startEmitter(100, 150);
    
    // blue fires for enemies => start enemies.length emiters 
    for (var i=0; i<enemies.length; i++)
    {
        emiters.push( new Emitter(100, 200, 0, -0.5, 5, color(0,0,255, 80)));
        emiters[i+2].startEmitter(30, 100);
        
    }
    
    
    // market_data is a large object defined literally, too long indeed...
    // asynchronous Fetch API, call back function, push the data individually to market_data.amzn
    // then update ticker_objects with fresh data, (ticker_objects is what will be drawn).
    // When I get data for a stock, the last callback function sets a flag to true in ticker_objects 
    // (last element). I use that flag to really update the data.
    // I want to learn: how to use "then.." better, and do I really need a flag to continnue handling my data?
    market_data = 
    {
        // 5 first properties will hold the real data, returned in JSON format by the Fetch API
        amzn: [],
        msft: [],
        spy: [],
        eurusd: [],
        btcusd: [],
        
        // I just really wanted the SP500, but not free. So I used the SPY ETF and just multiply. 
        spx_by_spy_ratio: 10.023146,
        
        ticker_pos_x: 580,
        ticker_pos_y: 225,
        ticker_box: 350,
        ticker_text_size1: 20,
        ticker_text_size2: 16,
        ticker_speed: 0.5,
        ticker_stock1_x: 350,
        ticker_stock2_x: 650,
        ticker_stock3_x: 950,
        ticker_stock4_x: 1250,
        ticker_stock5_x: 1550,
        ticker_date: "2021-07-30",
                
        // ticker_objects contains the data used to draw the stock ticker
        // it is hard-coded as default on 30-July stock prices. 
        // will refresh as soon as started.
        // in ticker_objects, last index element is a false flag.
        // the last "then" from my Fetch API sets it true, and I will then copy 
        // from market_data.amzn into ticker_objects[0] for example
        ticker_objects: [
            ["AMZN", "3,327.59", "-272.33", "-7.56%", 150, 210, false],
            ["MSFT", "284.91", "-1.59", "-0.56%", 126, 168, false],
            ["SPX", "4,395.25", "-21.45", "-0.49%", 130, 190, false],
            ["EURUSD", "1.1869", "+0.0001", "+0.01%", 165, 220, false],
            ["BTCUSD", "39,859", "-1,604", "-3.87%", 160, 220, false],
        ],

        // the draw function is very hard-coded, shame on me, but it works.        
        draw: function()
        {
            // draw black rect and 2 first stocks info
            this.ticker_stock1_x -= 1/this.ticker_speed;
            this.ticker_stock2_x -= 1/this.ticker_speed;
            this.ticker_stock3_x -= 1/this.ticker_speed;
            this.ticker_stock4_x -= 1/this.ticker_speed;
            this.ticker_stock5_x -= 1/this.ticker_speed;
            
            var s1_x = this.ticker_stock1_x
            var s2_x = this.ticker_stock2_x
            var s3_x = this.ticker_stock3_x
            var s4_x = this.ticker_stock4_x
            var s5_x = this.ticker_stock5_x
            
            var x = this.ticker_pos_x
            var y = this.ticker_pos_y
            var stock1 = this.ticker_objects[0]
            var stock2 = this.ticker_objects[1]
            var stock3 = this.ticker_objects[2]
            var stock4 = this.ticker_objects[3]
            var stock5 = this.ticker_objects[4]
            
            var px1 = this.ticker_objects[0][2]
            var px2 = this.ticker_objects[1][2]
            var px3 = this.ticker_objects[2][2]
            var px4 = this.ticker_objects[3][2]
            var px5 = this.ticker_objects[4][2]
            
            var offset1 = [stock1[4], stock1[5]];
            var offset2 = [stock2[4], stock2[5]];
            var offset3 = [stock3[4], stock3[5]];
            var offset4 = [stock4[4], stock4[5]];
            var offset5 = [stock5[4], stock5[5]];
            
            
            
            fill(0); //black rect
            rect(x, y - 20, this.ticker_box, 25);
            
            // date
            textSize(this.ticker_text_size1);
            fill("orange");
            text(this.ticker_date, x + s1_x -150, y);
            
            // 1st stock
            textSize(this.ticker_text_size1);
            fill(255);
            text(stock1[0] + " " + stock1[1] + " ", x + s1_x, y);
            textSize(this.ticker_text_size2);
            if (px1<0)
            {
                fill("red");
            }
            else 
            {
                fill("lime")    
            }
            text(stock1[2] + " ", x + s1_x + offset1[0], y);
            text(stock1[3], x + + s1_x + offset1[1], y);
            
            
            // 2nd stock
            textSize(this.ticker_text_size1);
            fill(255);
            text(stock2[0] + " " + stock2[1] + " ", x + s2_x, y);
            textSize(this.ticker_text_size2);
            if (px2<0)
            {
                fill("red");
            }
            else 
            {
                fill("lime")    
            }
            text(stock2[2] + " ", x + s2_x + offset2[0], y);
            text(stock2[3], x + s2_x + offset2[1], y);
            
            // 3rd stock
            textSize(this.ticker_text_size1);
            fill(255);
            text(stock3[0] + " " + stock3[1] + " ", x + s3_x, y);
            textSize(this.ticker_text_size2);
            if (px3<0)
            {
                fill("red");
            }
            else 
            {
                fill("lime")    
            }
            text(stock3[2] + " ", x + s3_x + offset3[0], y);
            text(stock3[3], x + + s3_x + offset3[1], y);
            
            // 4th stock
            textSize(this.ticker_text_size1);
            fill(255);
            text(stock4[0] + " " + stock4[1] + " ", x + s4_x, y);
            textSize(this.ticker_text_size2);
            if (px4<0)
            {
                fill("red");
            }
            else 
            {
                fill("lime")    
            }
            text(stock4[2] + " ", x + s4_x + offset4[0], y);
            text(stock4[3], x + + s4_x + offset4[1], y);
            
            // 5th stock
            textSize(this.ticker_text_size1);
            fill(255);
            text(stock5[0] + " " + stock5[1] + " ", x + s5_x, y);
            textSize(this.ticker_text_size2);
            if (px5<0)
            {
                fill("red");
            }
            else 
            {
                fill("lime")    
            }
            text(stock5[2] + " ", x + s5_x + offset5[0], y);
            text(stock5[3], x + + s5_x + offset5[1], y);


            if (s1_x == -1510)
            {
                this.ticker_stock1_x = 350;
                this.ticker_stock2_x = 650;
                this.ticker_stock3_x = 950;
                this.ticker_stock4_x = 1250;
                this.ticker_stock5_x = 1550;
            }
            
            fill(sky_color)
            noStroke();
            rect(-1500, this.ticker_pos_y - 20 , this.ticker_pos_x - (-1500), 25)
            rect(this.ticker_pos_x + this.ticker_box, this.ticker_pos_y - 20 , 1500, 25)
            
        },
        
        //this method will fetch 5 stocks historical prices
        //Alpha vantage offers free API KEY for basic use.
        //You only get 1 refresh per minute for example.
        fetch_stock_data: function()
        {
            var alpha_API_KEY = "OQC3V59J1YUUD0OK"
            var url = [
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AMZN&apikey=",
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=",
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=",
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=EURUSD&apikey=",
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=BTCUSD&apikey="
            ]
            
            for (var i=0; i<url.length; i++)
            {
                url[i] += alpha_API_KEY;
            }
            
            //I will push the JSON data returned from fetch  to market_data
            //and set a flat True for that stock, to force a stock ticker update
            fetch(url[0])
              .then(response => response.json())
              .then(response => this.amzn.push(response))
              .then(response => this.ticker_objects[0][6] = true)
            fetch(url[1])
              .then(response => response.json())
              .then(response => this.msft.push(response))
              .then(response => this.ticker_objects[1][6] = true)
            fetch(url[2])
              .then(response => response.json())
              .then(response => this.spy.push(response))
              .then(response => this.ticker_objects[2][6] = true)
            fetch(url[3])
              .then(response => response.json())
              .then(response => this.eurusd.push(response))
              .then(response => this.ticker_objects[3][6] = true)
            fetch(url[4])
              .then(response => response.json())
              .then(response => this.btcusd.push(response))
              .then(response => this.ticker_objects[4][6] = true)
            
        },
        
        
        //copy the find, format correctly and copy the stock data into ticker_objects.xxxx
        //This only happens when flag (last element) is true. ex below: if (this.ticker_objects[0][6])
        update_prices: function()
        {
            
            ///////////////// Stock 1
            if (this.ticker_objects[0][6])  //the stock prices needs updating, once only.
            {
                // this is = if (the fetch promise return contains valid data)
                if (this.amzn[0].hasOwnProperty("Global Quote")) 
                {
                    var a = this.amzn;
                    var b = parseFloat(a[0]["Global Quote"]["05. price"]).toFixed(2)
                    b = numberWithCommas(b);
                     
                    this.ticker_objects[0][1] = b;

                    var c = parseFloat(a[0]["Global Quote"]["09. change"]).toFixed(2)
                    this.ticker_objects[0][2] = c;

                    var d = parseFloat(a[0]["Global Quote"]["10. change percent"]).toFixed(2)
                    this.ticker_objects[0][3] = d;
                    this.ticker_objects[0][3] += "%";

                    var e = a[0]["Global Quote"]["07. latest trading day"]
                    this.ticker_date = e;

                }
                this.ticker_objects[0][6] = false;
            }
            
            ///////////////// Stock 2
            if (this.ticker_objects[1][6])
            {
                if (this.msft[0].hasOwnProperty("Global Quote"))
                {
                    var a2 = this.msft;

                    var b = parseFloat(a2[0]["Global Quote"]["05. price"]).toFixed(2)
                    b = numberWithCommas(b);
                    this.ticker_objects[1][1] = b;

                    var c = parseFloat(a2[0]["Global Quote"]["09. change"]).toFixed(2)
                    this.ticker_objects[1][2] = c;

                    var d = parseFloat(a2[0]["Global Quote"]["10. change percent"]).toFixed(2)
                    this.ticker_objects[1][3] = d;
                    this.ticker_objects[1][3] += "%";   
                    
                }
                this.ticker_objects[1][6] = false;
            }

            ///////////////// 3
            if (this.ticker_objects[2][6])
            {
                if (this.spy[0].hasOwnProperty("Global Quote"))
                {
                    var a3 = this.spy;

                    var b = (parseFloat(a3[0]["Global Quote"]["05. price"]) * this.spx_by_spy_ratio).toFixed(2)
                    b = numberWithCommas(b);
                    this.ticker_objects[2][1] = b;

                    var c = (parseFloat(a3[0]["Global Quote"]["09. change"]) * this.spx_by_spy_ratio).toFixed(2)
                    this.ticker_objects[2][2] = c;

                    var d = parseFloat(a3[0]["Global Quote"]["10. change percent"]).toFixed(2)
                    this.ticker_objects[2][3] = d;
                    this.ticker_objects[2][3] += "%";

                }
                this.ticker_objects[2][6] = false;
            }
            
            ///////////////// 4
            if (this.ticker_objects[3][6])
            {
                if (this.eurusd[0].hasOwnProperty("Global Quote"))
                {
                    var a4 = this.eurusd;

                    var b = parseFloat(a4[0]["Global Quote"]["05. price"]).toFixed(4)
                    this.ticker_objects[3][1] = b;

                    var c = parseFloat(a4[0]["Global Quote"]["09. change"]).toFixed(4)
                    this.ticker_objects[3][2] = c;

                    var d = parseFloat(a4[0]["Global Quote"]["10. change percent"]).toFixed(2)
                    this.ticker_objects[3][3] = d;
                    this.ticker_objects[3][3] += "%";

                }
                this.ticker_objects[3][6] = false;
            }

            ///////////////// 5
            if (this.ticker_objects[4][6])
            {
                if (this.btcusd[0].hasOwnProperty("Global Quote"))
                {
                    var a5 = this.btcusd;

                    var b = parseFloat(a5[0]["Global Quote"]["05. price"]).toFixed(0)
                    b = numberWithCommas(b);
                    this.ticker_objects[4][1] = b;

                    var c = parseFloat(a5[0]["Global Quote"]["09. change"]).toFixed(0)
                    this.ticker_objects[4][2] = c;

                    var d = parseFloat(a5[0]["Global Quote"]["10. change percent"]).toFixed(2)
                    this.ticker_objects[4][3] = d;
                    this.ticker_objects[4][3] += "%";

                }
                this.ticker_objects[4][6] = false;
            }
                
        }
        
    }
            
    // fetch the 5 stocks new market prices
    market_data.fetch_stock_data();
        
}


function draw()
{
     // Start the game with a happy coin sound
    if (frameCount == 2){
        coinSound.play();
    }
    //  Start soundtrack loop
    if (frameCount == 60)
    {
        soundtrackSound.loop();
    }
    
     // fill the sky blue 
	background(sky_color);
	noStroke();
	fill(0,155,0);
    // draw some green ground
	rect(0, floorPos_y, width, height/4); 
    
    // checking easter egg Bandana 
    // after the Bandana has been found, things change
    // graphically (the bandana), The second red fire particle emiter on the character
    // and the jump height is doubled, from -100 to -200 in y coordinate per jump.
    isBandanaFound = collectables[collectables.length-1].isFound;


	/////////// BEGIN OF PUSH ///////////////////////////
    /////////////////////////////////////////////////////
    push();
	translate(scrollPos, 0);
    
    
    // draw Stock Market ticker
    market_data.update_prices();
    market_data.draw();
    // draw wall street building
    drawWallStreet(580);
    
    
    // draw funny left sign
    drawSign(-980);
    
    
	// logic for eyes blinking, for 7 frames.
	blinkingFrames += 1;
	if (blinkingFrames >= 180 && blinkingFrames < 187)
	{
		isBlinking = true;
	} else if (blinkingFrames == 187)
	{
		blinkingFrames = 0;
		isBlinking = false;
	} else
	{
		isBlinking = false;
	}

    
	// Draw mountains.
	drawMountains();

    
	// Draw clouds
	// 1) make the clouds move
	for (var i=0; i<clouds.length; i++)
	{
		clouds[i].x = clouds[i].x - clouds[i].speed;
		if (clouds[i].x < - 800)
		{
			clouds[i].x = 2200 + random(-500,500);
		}
	}
	// 2) draw the clouds
	drawClouds();

    
	// Draw trees.
	drawTrees();

    
	// Draw canyons.
	noStroke();
	for (var i=0; i < canyons.length; i++)
	{
		checkCanyon(canyons[i]);
		drawCanyon(canyons[i]);
	}

    
    // draw platforms
    for (var i=0; i<platforms.length; i++)
    {
        platforms[i].draw();

    }
    
    
	// Draw only collectable items not found yet.
	for (var i=0; i < collectables.length; i++)
	{
		checkCollectable(collectables[i]);
		if (!collectables[i].isFound)
		{
			drawCollectable(collectables[i]);
		}
	}

    
    // Draw flagpole and draw it
    if (!flagpole.isReached)
    {
        checkFlagpole();
    }
    renderFlagpole();
    
    
    // draw the winning Easter Egg Text message
    if(isBandanaFound)
    {
        if(!isEasterEggSoundPlayed){
            eastereggSound.play();
            isEasterEggSoundPlayed = true;
        }
        fill(255,0,255);
        textSize(50)
        text("You found the magic Bandana!!!", -1650, 200);
    }

    
    // Draw enemies
    for (var i=0; i < enemies.length; i++)
    {
        enemies[i].draw();
        
        // check for contact enemy vs character, returns a Bolean
        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        
        if(isContact){  
            if(!isEnemyTouched){       // First time enemy touched
                lives = max(0, lives - 1);
                isEnemyTouched = true;
                keyCode = 16;
                enemySound.play();
            } 
            if(lives >= 1){
                startGame();
                break;
            }   
        }

    }
    
    
	pop();
	////////////////////// END OF PUSH BLOCK ////////////
    /////////////////////////////////////////////////////
    
    
    // score
    draw_score();
    
    
    // I move emiters above gamechar's head. Always the 2 first emiters.
    // First yellow emitter always on
    // Second red emitter only after finding magic bandana (otherwise out of screen -10000)
    // Then move all other enitters = enemies, with blue emitters
    // updateParticles will draw them on Canvas
    for (var i=0; i < emiters.length; i++)
    {
        // First yellow emiter on character
        if (i<1){
            emiters[i].x = gameChar_x;
            emiters[i].y = gameChar_y-50;
        // Second red emiter on character only if isBandanaFound
        } else if (i<2){
            if(isBandanaFound){
                emiters[i].x = gameChar_x;
                emiters[i].y = gameChar_y-50;
            } else {
                emiters[i].x = -10000;
                emiters[i].y = gameChar_y-50;
            }
        // then update all remaining blue emiters on enemies, paying attention 
        // to correct the real world position with scrollPos for Collision Detection.
        } else {
            emiters[i].x = enemies[i-2].currentX + scrollPos;
            emiters[i].y = enemies[i-2].y - 10;
            
        }
        // draw the emiters and animate the particles
        emiters[i].updateParticles();
    }
    
    
	// Draw game character.
	drawGameChar();
    
    
    // draw hearts remaining lives
    draw_lives();
    
    
    // Die
    checkPlayerDie(); 
        
    
    // Game Over  Messages and  Restart
    // a restart is proposed when lives reach 0.
    if (lives < 1)
    {
        stroke(255)
        fill(0);
        textSize(40)
        text(text_1, 50, 60);
        
        if (keyCode === 32)
        {
            lives = 3;
            startGame();
        }
        return
    }
    
    
    // a restart is proposed after the pole has been reached.
    if (flagpole.isReached)
    {
        if (!isWinSoundPlayed)
        {
            winSound.play();
            isWinSoundPlayed = true;
        }
        stroke(255)
        fill(0);
        textSize(40)
        text(text_2, 50, 60);
        if (keyCode === 32)
        {
            lives = 3;
            startGame();
        }
        return
    }
    
    // Game Logic
	/////////////////////////////////////////////////////////////////
    // Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
        
        //
        emiters[0].xSpeed = 1;
        emiters[1].xSpeed = 1;
        
	}

    
	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
        
        //
        emiters[0].xSpeed = -1;
        emiters[1].xSpeed = -1;

	}  

    
	// Logic to make the game character rise and fall.
	// add gravity
	if (gameChar_y <= floorPos_y - 5)
	{
        var isContact = false;
        
        // when falling only (=after jump), lets check char is on platform
        for (var i = 0; i < platforms.length; i++){
            if(platforms[i].checkContact(gameChar_world_x, gameChar_y)){
                isContact = true;
                break;
            }
            
        }
      
		if (!isContact) {
            gameChar_y += 5;
            isFalling = true;
        }
        
	} else
	{
		isFalling = false;
	}

    
	// Fall into the canyon
	for (var i = 0; i < canyons.length; i++)
	{
		checkCanyon(canyons[i]);
	}

    
	// Update real position of gameChar and enemies[] for collision detection
	gameChar_world_x = gameChar_x - scrollPos;
    
    for (var i=0; i<enemies.length; i++)
    {
            enemies[i].world_currentX = enemies[i].currentX;
    }
    
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{

	if(key == 'A' || keyCode == 37)
	{
		isLeft = true;
	}

	if(key == 'D' || keyCode == 39)
	{
		isRight = true;
	}

	// jumping   space bar is 32
	if (keyCode == 32 && gameChar_y == floorPos_y)
	{
        if(isBandanaFound)
        {
            gameChar_y -= 200;
        } else
        {
            gameChar_y -= 100;
        }
        jumpSound.play();
	}
}

function keyReleased()
{
	if(key == 'A' || keyCode == 37)
	{
		isLeft = false;
	}

	if(key == 'D' || keyCode == 39)
	{
		isRight = false;
	}


}


// ------------------------------
// Game character render function
// ------------------------------


// Function to draw the game character.
function drawGameChar()
{
	// draw game character, with or without the bandana
	noStroke();
    
	if(isLeft && isFalling)
	{
		// add your jumping-left code
		fill(0);
		ellipse(gameChar_x, gameChar_y-60, 20, 18);
		fill(255,20,147);
		if (isBlinking)
		{
			fill(0);
		}
		ellipse(gameChar_x-5, gameChar_y-60, 5, 3);
		fill(255,0,0);
		rect(gameChar_x-5, gameChar_y-50, 13, 25);
		fill(0);
		rect(gameChar_x-8, gameChar_y-30, 5, 15);
		rect(gameChar_x+3, gameChar_y-26, 5, 15);

        // check for easter egg Bandana
        fill(255)
        if(isBandanaFound)
        {
            rect(gameChar_x - 10, gameChar_y - 65 , 18, 2);
        }

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
		fill(0);
		ellipse(gameChar_x, gameChar_y-60, 20, 18);
		fill(255,20,147);
		if (isBlinking)
		{
			fill(0);
		}
		ellipse(gameChar_x+5, gameChar_y-60, 5, 3);
		fill(255,0,0);
		rect(gameChar_x-8, gameChar_y-50, 13, 25);
		fill(0);
		rect(gameChar_x-8, gameChar_y-26, 5, 15);
		rect(gameChar_x+3, gameChar_y-30, 5, 15);

        // check for easter egg
        fill(255)
        if(isBandanaFound)
        {
            rect(gameChar_x - 10, gameChar_y - 65 , 18, 2);
        }

        
	}
	else if(isLeft)
	{
		// add your walking left code
		fill(0);
		ellipse(gameChar_x, gameChar_y-55, 18, 20);
		fill(255);
		if (isBlinking)
		{
			fill(0);
		}
		ellipse(gameChar_x-5, gameChar_y-55, 5, 4);
		fill(255,0,0);
		rect(gameChar_x-5, gameChar_y-45, 13, 30);
		fill(0);
		rect(gameChar_x-8, gameChar_y-18, 5, 18);
		rect(gameChar_x+3, gameChar_y-20, 5, 20);

        // check for easter egg
        fill(255)
        if(isBandanaFound)
        {
            rect(gameChar_x - 10, gameChar_y - 60 , 20, 2);
        }

	}
	else if(isRight)
	{
		// add your walking right code
		fill(0);
		ellipse(gameChar_x, gameChar_y-55, 18, 20);
		fill(255);
		if (isBlinking)
		{
			fill(0);
		}
		ellipse(gameChar_x+5, gameChar_y-55, 5, 4);
		fill(255,0,0);
		rect(gameChar_x-8, gameChar_y-45, 13, 30);
		fill(0);
		rect(gameChar_x-8, gameChar_y-20, 5, 20);
		rect(gameChar_x+3, gameChar_y-18, 5, 18);
        
        // check for easter egg
        fill(255)
        if(isBandanaFound)
        {
            rect(gameChar_x - 10, gameChar_y - 60 , 20, 2);
        }

        

	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
		fill(0);
		ellipse(gameChar_x, gameChar_y-60, 20, 18);
		fill(255,20,147);
		if (isBlinking)
		{
			fill(0);
		}
		ellipse(gameChar_x-5, gameChar_y-60, 5, 3);
		ellipse(gameChar_x+5, gameChar_y-60, 5, 3);
		fill(255,0,0);
		rect(gameChar_x-10, gameChar_y-50, 20, 25);
		fill(0);
		rect(gameChar_x-8, gameChar_y-25, 5, 13);
		rect(gameChar_x+4, gameChar_y-28, 5, 11);
        
        // check for easter egg
        fill(255)
        if(isBandanaFound)
        {
            rect(gameChar_x - 10, gameChar_y - 65 , 18, 2);
        }

	}
	else
	{
		// add your standing front facing code


		// head
		noStroke();
		fill(0); 
		ellipse(gameChar_x, gameChar_y-55, 20, 20);
		// eyes
		fill(255);
		if (isBlinking)
		{
			fill(0);
		}
		ellipse(gameChar_x-5, gameChar_y-55, 5, 5);
		ellipse(gameChar_x+5, gameChar_y-55, 5, 5);
		// body
		fill(255,0,0);
		rect(gameChar_x-10, gameChar_y-45, 20, 30);
		// legs
		fill(0);
		rect(gameChar_x-8, gameChar_y-15, 5, 15); 
		rect(gameChar_x+4, gameChar_y-15, 5, 15);
        
        // check for easter egg
        fill(255)
        
        if(isBandanaFound)
        {
            rect(gameChar_x - 10, gameChar_y - 60 , 20, 2);
        }


	}
}


// ---------------------------
// Background render functions
// ---------------------------


// Function to draw trees objects.
function drawTrees()
{
	for (var i=0; i<trees_x.length; i++)
	{
		// trunk
		fill(165,42,42);
		rect(trees_x[i] + 40, floorPos_y - 150, 20, 150);
		// green branches
		fill(0,100,0);
		triangle(
			trees_x[i], floorPos_y - 150,
			trees_x[i] + 100, floorPos_y - 150,
			trees_x[i] + 50 , floorPos_y - 250
			);
		triangle(
			trees_x[i], floorPos_y - 100,
			trees_x[i] + 100, floorPos_y - 100,
			trees_x[i] + 50,
			floorPos_y - 200
			);
		triangle(
			trees_x[i],
			floorPos_y - 50,
			trees_x[i] + 100,
			floorPos_y - 50,
			trees_x[i] + 50,
			floorPos_y - 150
			);
	}
}


// Function to draw cloud objects.
function drawClouds()
{
	noStroke();
	fill(255,255,255,255);
	for (var i=0; i < clouds.length; i++)
		{
			ellipse(
				clouds[i].x,
				clouds[i].y,
				70 * clouds[i].scale
				);
			ellipse(
				clouds[i].x - 40 * clouds[i].scale,
				clouds[i].y,
				50 * clouds[i].scale
				);
			ellipse(
				clouds[i].x + 40 * clouds[i].scale,
				clouds[i].y,
				50 * clouds[i].scale
				);
		}

}


// Function to draw mountains objects.
function drawMountains()
{
	// Draw mountains.
	fill(244,164,96);
	stroke(120);
	for (var i=0; i < mountains.length; i++)
	{
		triangle(mountains[i].x,
			mountains[i].y  - 302,
			mountains[i].x - 60,
			mountains[i].y,
			mountains[i].x + 80,
			mountains[i].y)
		triangle(mountains[i].x - 50,
			mountains[i].y - 282,
			mountains[i].x - 110,
			mountains[i].y,
			mountains[i].x + 10,
			mountains[i].y)
	}
}


// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon)
{
	fill(160,82,45);
	rect(
		t_canyon.x,
		floorPos_y, 50,
		height - floorPos_y
		);
	fill(139,69,19);
	rect(
		t_canyon.x,
		floorPos_y,
		50,
		30
		);
	// add some dangerous spikes
	fill(210);
	triangle(
		t_canyon.x+23,
		height,
		t_canyon.x+3,
		height,
		t_canyon.x+13,
		height-30
		);
	triangle(
		t_canyon.x+47,
		height,
		t_canyon.x+27,
		height,
		t_canyon.x+37,
		height-30
		);
}


// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
	if ((gameChar_world_x >= t_canyon.x && gameChar_world_x <= t_canyon.x + 50) && gameChar_y >= floorPos_y)
	{
        if (!isFallingSoundPlayed)
        {
            isPlummeting = true;
            fallingSound.play();
            isFallingSoundPlayed = true;
        } else 
        {
            isPlummeting = true;
        }
	}
	if (isPlummeting)
	{
		gameChar_y += 3;
	}
}


// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
		stroke(1);
		fill(255,255,0);
		ellipse(
			t_collectable.x,
			t_collectable.y - t_collectable.size/4,
			t_collectable.size / 2,
			t_collectable.size / 2
			)
		;
		fill(200,0,0);
		ellipse(
			t_collectable.x,
			t_collectable.y - t_collectable.size/4,
			t_collectable.size / 2 - 5,
			t_collectable.size / 2 - 5
			);

}


// Function to check character has collected an item.
function checkCollectable(t_collectable)
{
	// test the collectable found or not
	if ( dist(t_collectable.x, t_collectable.y, gameChar_world_x, gameChar_y) <= t_collectable.size/2)
	{
        if (t_collectable.isFound == false)
        {
            game_score += 1;
            coinSound.play();
        }
		t_collectable.isFound = true;
	}

}


// draw score on screen
function draw_score()
{   
    stroke(200);
    textSize(40);
    fill(255,50,25,200);
    text("Score: "+game_score , 800, 60)
}


// draw the target pole. Greyed-out if not reachhed yet, colorful when reached.
function renderFlagpole()
{
    // x y to write faster in my function
    x = flagpole.x_pos;
    y = flagpole.y_pos;
    
    // i draw the pole first anyway
    noStroke();
    fill(255,0,0);
    rect(x , y -250, 20, 250);

    fill(255,255,0);
    triangle(x,     183,
             x-80,  183+30,
             x,     183+60);

    textSize(22);
    fill(0,0,255);
    text("UoL", x-45,y-210);

    fill(255);
    for (var i=0; i<4; i++)
        {
            beginShape();
            vertex(x, y-50 - i*50);
            vertex(x, y-80 - i*50);
            vertex(x+20, y-60 - i*50);
            vertex(x+20, y-30 - i*50);
            endShape();
        }

    // add a grey layer to partially obscure the pole when not reached = !isReached
    if (!flagpole.isReached)
    {
        my_grey = 80
        my_alpha = 220;
        
        noStroke();
        fill(my_grey,my_alpha);
        rect(x , y -250, 20, 250);
        triangle(x,     183,
                 x-80,  183+30,
                 x,     183+60);
    }
}


// check whether the game has been completed.
function checkFlagpole()
{
    if (abs(gameChar_world_x - flagpole.x_pos) < 20)
        {
            flagpole.isReached = true;
            keyCode = 16; // for end -of-game behavior.Any code but SPACE.
            /* 
            not-proud trick, when reaching pole.
            My bug = "SPACE" stays im memory if you keep holding right-arrow till the end without lifting fingers 
            => when you hit pole, it understand SPACE and restart.
            I force not to have a space WHEN reaching pole.
            = wait for my space to restart.
            */
                        
        }
}


// check if player died after falling into a canyon
function checkPlayerDie()
{
    if (gameChar_y >= height)
    {   
        lives = max(0, lives - 1);
        if (lives > 0)
        {
            startGame();
        }
    }
}


// The heart drawing itself is just recycled from week5_hack_robot
function draw_1heart()
{
    stroke(255);
    fill(255,20,147);
    beginShape();
    vertex(770, 220);
    vertex(760, 215);
    vertex(755, 215);
    vertex(748, 222);
    vertex(748, 232);
    vertex(770, 250);
    vertex(792, 232);
    vertex(792, 222);
    vertex(785, 215);
    vertex(780, 215);
    vertex(770, 220);
    endShape();
}


// draw the remaining lives as hearts on screen, with translate
function draw_lives()
{
    for (var i=0; i<lives; i++)
    {
        // Draw Hearts. Re-using code from previous hack-robot, + just translate it.
        push();
        translate(55 +i*50, -140);
        draw_1heart();
        pop();
    }
    
}


// Factory to create platforms objects
// will return a platform object
function createPlatforms(x, y, length, color, invisible)
{
    var p = {
        x: x,
        y: y,
        length: length,
        color: color,
        invisible: invisible,
        
        // Some platforms can be invisible, but present and walkable. for easter egg.
        draw: function(){
            if (!invisible){
                fill(this.color);
                rect(this.x, this.y, this.length, 30);
                fill(80,50);
                rect(this.x, this.y + 9, this.length, 1);
            }
            
        },
        
        // checks contact  between character and platform
        // => needs to check character x position within platform range
        // AND just above the platform (within 5 here below)  
        checkContact: function (gc_x, gc_y){
            if (gc_x > this.x && gc_x < (this.x + this.length)){
                
                var d = this.y + 20 - gc_y
                //above platform, but close/less than 5 away
                if (d >=0 && d < 5){
                    return true;    
                } 
            }
            
            return false
        }
    }
    return p;
}



// startGame is part of setup initialisation, is also called after loosing a life
// initialise many variables
function startGame()
{
    sky_color = color (100, 155, 255);
    
    gameChar_x = width/2;
	gameChar_y = floorPos_y;

    game_score = 0;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character and mechanics.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
    isWinSoundPlayed = false;
    isFallingSoundPlayed = false;
    isEasterEggSoundPlayed = false;
    isBandanaFound = false;

	// initialise blinking var
	blinkingFrames = 0;
	isBlinking = false;
	frameRate(30);

	// Initialise arrays of scenery objects.
	mountains = [ 
		{x: 150, y: floorPos_y},
		{x: -400, y: floorPos_y},
		{x: 1100, y: floorPos_y},
		{x: 1600, y: floorPos_y}
		];

	clouds = [
		{x: 100, y:90, scale: 1, speed: 1.5},
		{x: 250, y:50, scale: 0.7, speed: 1.6},
		{x: 310, y:40, scale: 0.5, speed: 1.8},
		{x: 650, y:110, scale: 1.4, speed: 1.1},
		{x: 1100, y:80, scale: 1.2, speed: 1.6},
		{x: 1300, y:110, scale: 1.3, speed: 1.5},
		{x: 1700, y:120, scale: 1.4, speed: 1.1},
		{x: 1900, y:80, scale: 0.8, speed: 0.9},
		{x: 2000, y:110, scale: 0.8, speed: 0.9},
		{x: 2200, y:100, scale: 1, speed: 0.9},
        {x: 2300, y:50, scale: 0.8, speed: 1.1},
		{x: 2700, y:60, scale: 0.8, speed: 1},
		{x: 2900, y:70, scale: 0.8, speed: 1.1},
        {x: 3200, y:50, scale: 1.1, speed: 1.3},
		{x: 3600, y:40, scale: 0.8, speed: 1.4},
		{x: 3750, y:20, scale: 0.8, speed: 1.3},
		];

	trees_x = [-750, -600, -550, -450, 50, 170, 230, -250, -200, 1100, 1250, 1600];

	canyons = [ 
		{x: -800},
		{x: -100},
		{x: 380},
		{x: 1400},
        {x: -1200},
        {x: -1150},
        {x: -1100},
        {x: -1050}
		];

	collectables = [
		{x: 200, y: floorPos_y, size: 35, isFound: false},
		{x: 300, y: floorPos_y, size: 50, isFound: false},
		{x: 100, y: floorPos_y-90, size: 50, isFound: false},
		{x: 120, y: floorPos_y-90, size: 50, isFound: false},
		{x: 595, y: floorPos_y-70, size: 50, isFound: false},
		{x: 605, y: floorPos_y-70, size: 50, isFound: false},
		{x: 615, y: floorPos_y-70, size: 50, isFound: false},
		{x: 625, y: floorPos_y-70, size: 50, isFound: false},
		{x: 645, y: floorPos_y-70, size: 50, isFound: false},
		{x: 665, y: floorPos_y-70, size: 50, isFound: false},
		{x: 685, y: floorPos_y-70, size: 50, isFound: false},
		{x: 705, y: floorPos_y-70, size: 50, isFound: false},
		{x: 765, y: floorPos_y-70, size: 50, isFound: false},
		{x: 785, y: floorPos_y-70, size: 50, isFound: false},
		{x: 805, y: floorPos_y-70, size: 50, isFound: false},
		{x: 825, y: floorPos_y-70, size: 50, isFound: false},
		{x: 845, y: floorPos_y-70, size: 50, isFound: false},
		{x: 865, y: floorPos_y-70, size: 50, isFound: false},
		{x: 885, y: floorPos_y-70, size: 50, isFound: false},
		{x: 905, y: floorPos_y-70, size: 50, isFound: false},
		{x: 915, y: floorPos_y-70, size: 50, isFound: false},
		{x: 925, y: floorPos_y-70, size: 50, isFound: false},
		{x: 600, y: floorPos_y, size: 40, isFound: false},
		{x: 808, y: floorPos_y, size: 25, isFound: false},
		{x: 820, y: floorPos_y, size: 25, isFound: false},
		{x: 1530, y: floorPos_y, size: 60, isFound: false},
		{x: 1560, y: floorPos_y, size: 60, isFound: false},
		{x: 1720, y: floorPos_y, size: 60, isFound: false},
		{x: 1750, y: floorPos_y, size: 60, isFound: false},
		{x: -200, y: floorPos_y, size: 60, isFound: false},
		{x: -950, y: floorPos_y, size: 60, isFound: false},
		{x: -1500, y: floorPos_y, size: 60, isFound: false},
		{x: -1520, y: floorPos_y, size: 60, isFound: false},
		{x: -1540, y: floorPos_y, size: 60, isFound: false},
		{x: -1560, y: floorPos_y, size: 60, isFound: false},
		{x: -1580, y: floorPos_y, size: 60, isFound: false},
		{x: -1600, y: floorPos_y, size: 60, isFound: false},
		{x: 1120, y: floorPos_y - 180, size: 60, isFound: false},
		{x: 1140, y: floorPos_y - 180, size: 60, isFound: false},
		{x: 1160, y: floorPos_y - 180, size: 60, isFound: false},
		{x: 1180, y: floorPos_y - 180, size: 60, isFound: false},
		{x: 1200, y: floorPos_y - 180, size: 60, isFound: false},
        {x: 1260, y: floorPos_y - 180, size: 60, isFound: false},
		{x: 1280, y: floorPos_y - 180, size: 60, isFound: false},
		{x: 1300, y: floorPos_y - 180, size: 60, isFound: false},
		{x: 1320, y: floorPos_y - 180, size: 60, isFound: false},
		{x: 1340, y: floorPos_y - 180, size: 60, isFound: false},
		{x: -1500, y: floorPos_y -20, size: 60, isFound: false},
		{x: -1520, y: floorPos_y -20, size: 60, isFound: false},
		{x: -1540, y: floorPos_y -20, size: 60, isFound: false},
		{x: -1560, y: floorPos_y -20, size: 60, isFound: false},
		{x: -1580, y: floorPos_y -20, size: 60, isFound: false},
		{x: -1600, y: floorPos_y -20, size: 60, isFound: false}
		];
    
    flagpole = {x_pos: 1900, y_pos: floorPos_y, isReached: false};
    
    text_1 = "Game over. Press space to continue.";
    text_2 = "Level complete. Press space to continue.";
    
    isGameIdle = false;
    isEnemyTouched = false;
        
}

// Enemy Constructor to populate enemies
function Enemy(x, y, range)
{   
    this.x = x;
    this.y = y;
    this.range = range;
    this.currentX = x;
    this.world_currentX = x;  // needed to check collisions
    this.inc = 1;
    
    this.update = function()
    {
        
        this.currentX += this.inc;
        
        // enemy stay in a zone between x and x+range, then returns back and forth
        if (this.currentX >= this.x + this.range){
            this.inc = -1;
        }
        else if (this.currentX <= this.x){
            this.inc = 1;
        }
        
        
    };
    
    this.draw = function()
    {
        // just s blue ellipse, but will have emiter on top
        this.update();
        fill(0,0,255);
        ellipse(this.currentX, this.y, 20, 20);    
    };
    
    this.checkContact = function(gc_x, gc_y)
    {
        var d = dist(gc_x, gc_y, this.currentX, this.y)
        if(d < 11){
            // the game character touched the ennemy
            return true;
        }
    }
}



// Particle Constructor
function Particle(x, y, xSpeed, ySpeed, size, colour)
{
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.colour = colour;
    this.age = 0; // number frames
    
    this.drawParticle = function(){
        fill(this.colour);
        noStroke;
        ellipse(this.x, this.y, this.size);  
    };
    
    this.updateParticle = function(){
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        this.age++;

    };
}


// Emiter Constructor, will create Emiter objects
// "particles" array will contain all its particles
function Emitter(x, y, xSpeed, ySpeed, size, colour)
{
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.colour = colour;
    
    this.startParticles = 0;
    this.lifetime = 0;  
    
    this.particles = [];
    
    this.addParticle = function()
    {
        
        var p = new Particle(random(this.x-10, this.x+10),
                             random(this.y-10, this.y+10),
                             random(this.xSpeed-1, this.xSpeed+1),
                             random(this.ySpeed-1, this.ySpeed+1),
                             random(this.size-4, this.size+4), 
                             this.colour);
        return p;
    }
    
    this.startEmitter = function(startParticles, lifetime)
    {
        this.startParticles = startParticles;
        this.lifetime = lifetime;
        
        //start Emitter with initial particles
        for (var i=0; i<this.startParticles; i++){
            this.particles.push(this.addParticle());
        }
    };
    
    this.updateParticles = function()
    {
        // iterate through particles and draw to screen
        // iterate in reverse back-to-front because we are removing elements.
        var deadParticles = 0;
        
        for(var i = this.particles.length-1; i >= 0; i--){
            
            this.particles[i].drawParticle();
            
            this.particles[i].updateParticle();
            
            
            if (this.particles[i].age > random(0, this.lifetime)){
                
                this.particles.splice(i, 1);
                deadParticles++;
            }            
        }
        
        if (deadParticles > 0){
            for(var i=0; i<deadParticles; i++){
                this.particles.push(this.addParticle());
            }
        }
        
    }
}


// modify string display to insert thousands comma separator
function numberWithCommas(x)
{
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


// draw WallStreet building
function drawWallStreet(x)
{
    // draw building
    fill(color(250,250,240));
    triangle(x, floorPos_y - 227,
            x + 350, floorPos_y - 227,
            x + 175, floorPos_y - 280);
    
    fill(180);
    rect(x, floorPos_y - 202, 350, 202);
    triangle(x + 20, floorPos_y - 230,
            x + 330, floorPos_y - 230,
            x + 175, floorPos_y - 275);
    
    fill(color(250,250,240));
    stroke(180);
    for (var i=0; i<6; i++){
        rect(x + i*64, floorPos_y - 202, 30, 202);   
    }
    
    // street sign
    fill(70);
    rect(x - 125, floorPos_y - 140, 10, 140);
    rect(x - 135, floorPos_y - 130, 45, 15);
    
    fill(255);
    textSize(12);
    text("Wall st", x - 130, floorPos_y - 118);
}


// draw funny sign on left before easter egg
function drawSign (x)
{
    // draw left sign
    fill(70);
    // pole
    rect(x , floorPos_y - 140, 10, 140);
    // live
    rect(x , floorPos_y - 130, 45, 15);
    triangle(x + 45, floorPos_y -130, x + 45, floorPos_y - 115, x + 55, floorPos_y - 122);
    // Die
    rect(x -45, floorPos_y - 110, 45, 15);
    triangle(x - 45, floorPos_y - 110, x - 45, floorPos_y - 95, x - 55, floorPos_y - 102);
    
    fill(255);
    textSize(12);
    text("Live", x + 10 , floorPos_y - 118);
    text("Die", x - 35 , floorPos_y - 98);
}
