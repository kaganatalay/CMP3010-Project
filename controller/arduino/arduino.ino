#include <LiquidCrystal.h>
#include <dht.h>

// Pin configuration for the LCD: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

// LED pins
const int LED_RED = 10;
const int LED_YELLOW = 9;
const int LED_GREEN = 8;

// Buzzer pin
const int BUZZER = 7;

// DHT sensor instance
#define DHTPIN 6
#define DHTTYPE DHT11
dht DHT;

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print("Temperature:");

  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(BUZZER, OUTPUT);
}

void loop() {
  int chk = DHT.read11(DHTPIN);
  float temperature = DHT.temperature;

  Serial.println(temperature);

  lcd.setCursor(0, 1);
  if (isnan(temperature)) {
    lcd.print("Read Error   ");
  } else {
    lcd.print(temperature);
    lcd.print(" C   ");
  }

  // LED and buzzer logic
  if (!isnan(temperature)) {
    if (temperature < 22) {
      digitalWrite(LED_GREEN, HIGH);
      digitalWrite(LED_YELLOW, LOW);
      digitalWrite(LED_RED, LOW);
      noTone(BUZZER);
    } else if (temperature >= 22 && temperature <= 30) {
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_YELLOW, HIGH);
      digitalWrite(LED_RED, LOW);
      noTone(BUZZER);
    } else if (temperature > 30) {
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_YELLOW, LOW);
      digitalWrite(LED_RED, HIGH);
      tone(BUZZER, 1000); // 1 kHz alarm tone
    } else {
      // all off
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_YELLOW, LOW);
      digitalWrite(LED_RED, LOW);
      noTone(BUZZER);
    }
  }

  delay(2000);
}
