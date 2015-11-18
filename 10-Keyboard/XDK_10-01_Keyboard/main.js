/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting

/**
 * SparkFun Inventor's Kit for Edison
 * Experiment 10 - Part 1: Keyboard
 * This sketch was written by SparkFun Electronics
 * November 18, 2015
 * https://github.com/sparkfun
 *
 * Capture keystrokes from a USB-connected keyboard and display them on a
 * character LCD.
 *
 * Released under the MIT License(http://opensource.org/licenses/MIT)
 */

// Import the filesystem module and our keymap table
var fs = require('fs');
var keymap = require('./libs/keymap.js');

// We'll also need johny-five and its Edison wrapper
var five = require('johnny-five');
var Edison = require('edison-io');
var board = new five.Board({
    io: new Edison()
});

// Global variables
var lcd;
var cursorPos;

// Johnny Five initialization
board.on('ready', function() {
    // Create our LCD object and define the pins
    // LCD pin name:    RS  EN DB4 DB5 DB6 DB7
    // Edison GP:       44  45  46  47  48  49
    lcd = new five.LCD({
        pins: ["GP44", "GP45", "GP46", "GP47", "GP48", "GP49"],
        backlight: 6,
        rows: 2,
        cols: 16
    });
    
    // Reset LCD
    lcd.off();
    lcd.on();
    
    // Show a cursor and set initial position
    lcd.clear();
    lcd.home();
    lcd.blink();
    cursorPos = 0;
});

// Create a stream that emits events on every key stroke
var readableStream = fs.createReadStream('/dev/input/event2');
console.log("Start typing!");

// Callback for a key event
readableStream.on('data', function(buf) {
    
    // Check for key down event and determine key pressed
    if ((buf[24] == 1) && (buf[28] == 1)) {
        var keyCode = ((buf[27] & 0xff) << 8) | (buf[26] & 0xff);
        var keyChar = keymap.keys[keyCode];
        
        // Make the character appear on the LCD
        if (lcd !== undefined) {
            
            // If it is a backspace, delete the previous character
            if (keyChar === 'bksp') {
                cursorPos--;
                if (cursorPos <= 0) {
                    cursorPos = 0;
                }
                lcd.print(" ");
                lcd.cursor(
                    Math.floor(cursorPos / lcd.cols), 
                    (cursorPos % lcd.cols)
                );
                lcd.print(" ");
                lcd.cursor(
                    Math.floor(cursorPos / lcd.cols), 
                    (cursorPos % lcd.cols)
                );
                
            // If it is a return character, clear the LCD
            } else if (keyChar == 'enter') {
                lcd.clear();
                cursorPos = 0;
                
            // Otherwise, print the character to the LCD
            } else if ((keyChar !== null) && (keyChar !== undefined)) {
                lcd.print(keyChar);
                cursorPos++;
            }
            
            // Stop the cursor at the end of the LCD
            if (cursorPos >= (lcd.rows * lcd.cols)) {
                cursorPos = (lcd.rows * lcd.cols) - 1;
            }
            
            // Update the cursor position (wrap to second line if needed)
            lcd.cursor(
                Math.floor(cursorPos / lcd.cols), 
                (cursorPos % lcd.cols)
            );
        }
    }
});