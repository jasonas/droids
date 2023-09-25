
// Screen
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <MPU6050_light.h>

// Servos
#include <Servo.h>
Servo servo;

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire);

#define touch_pin 0

String mode = "One";

int buttonCoolDownLimit = 100;
int buttonCoolDownStatus = buttonCoolDownLimit;

bool servoMoving = false;
bool servoShouldMove = false;

void setup() {

  pinMode(touch_pin, INPUT);

  //servo.attach(5); // D1
  servo.attach(2); // D4

  servo.write(0);

  Serial.begin(9600); 

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))  // Address 0x3C for most of these displays, if doesn't work try 0x3D 
  { 
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);                                      // Don't proceed, loop forever
  } 
  Wire.begin();

  // Screen
  display.clearDisplay(); 
  display.setCursor(0,0);             
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(2); 
  display.println(F("Hello"));
  display.display();

  delay(3000);
}

// Main code here, to run repeatedly:
void loop() {

  // Handle button press
  if( buttonCoolDownStatus > 0 ){
    
    buttonCoolDownStatus -= 1;
    //Serial.println(String(buttonCoolDownStatus));

    if( buttonCoolDownStatus < 0 ){
      buttonCoolDownStatus = 0;
    }

  } else if ( buttonCoolDownStatus == 0 ){

    servoMoving = false;

    int currentstate = digitalRead(touch_pin);

    if( currentstate == 1 ){
      buttonCoolDownStatus = buttonCoolDownLimit;
      toggleButton();
    }
  }

  // Screen
  display.clearDisplay(); 
  display.setCursor(0,0);             
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(2); 
  display.println("Mode: ");
  display.println(mode);
  display.display();

  // Activate the servo-motor
  if(servoMoving==false && servoShouldMove == true){

    servoMoving = true;
    servoShouldMove = false;

    if(mode=="One"){
      //
    } else if(mode=="Two"){
      servo.write(0);
    } else if(mode=="Three"){
      servo.write(180);
    }
  }
}

// Set the servo-motor mode on touch
void toggleButton(){

  servoShouldMove = true;

  if(mode=="One"){
    mode="Two";
  }
  else if(mode=="Two"){
    mode="Three";
  }
  else if(mode=="Three"){
    mode="One";
  }
}
